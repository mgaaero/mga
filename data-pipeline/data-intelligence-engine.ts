import { Occurrence, HazardObstacle } from '@mega/types';
import { AnacNormalizer, AnacRawRow } from './connectors/anac/anac-normalizer.js';
import { CenipaNormalizer, CenipaRawReport } from './connectors/cenipa/cenipa-normalizer.js';
import { NtsbNormalizer, NtsbRawRecord } from './connectors/ntsb/ntsb-normalizer.js';
import { FaaObstacleNormalizer, FaaDofRawRecord } from './connectors/obstacles/faa-dof-normalizer.js';
import { OurAirportsParser, AirportRecord } from './connectors/international/ourairports-parser.js';

export interface IngestionSyncStats {
  sourceSlug: string;
  startedAt: string;
  finishedAt?: string;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING';
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
}

export class DataIntelligenceEngine {
  private memoryStore: Map<string, Occurrence> = new Map();
  private hazardStore: Map<string, HazardObstacle> = new Map();
  private airportStore: Map<string, AirportRecord> = new Map();
  private syncLogs: IngestionSyncStats[] = [];

  /**
   * Ingestão oficial ANAC (com deduplicação em memória/banco)
   */
  public ingestAnacBatch(rows: AnacRawRow[]): IngestionSyncStats {
    const stats: IngestionSyncStats = {
      sourceSlug: 'anac',
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    };

    for (const row of rows) {
      try {
        stats.recordsProcessed++;
        const normalized = AnacNormalizer.normalize(row);
        if (!normalized) continue;

        const dedupeKey = `anac:${normalized.source.recordIdentifier}`;
        if (this.memoryStore.has(dedupeKey)) {
          this.memoryStore.set(dedupeKey, normalized);
          stats.recordsUpdated++;
        } else {
          this.memoryStore.set(dedupeKey, normalized);
          stats.recordsInserted++;
        }
      } catch (err: any) {
        stats.errors.push(`Erro no registro ${row.Numero_da_Ocorrencia}: ${err.message}`);
      }
    }

    stats.finishedAt = new Date().toISOString();
    stats.status = stats.errors.length > 0 ? 'FAILED' : 'COMPLETED';
    this.syncLogs.push(stats);
    return stats;
  }

  /**
   * Ingestão oficial CENIPA/SIPAER
   */
  public ingestCenipaBatch(reports: CenipaRawReport[]): IngestionSyncStats {
    const stats: IngestionSyncStats = {
      sourceSlug: 'cenipa',
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    };

    for (const report of reports) {
      try {
        stats.recordsProcessed++;
        const normalized = CenipaNormalizer.normalize(report);
        const dedupeKey = `cenipa:${normalized.source.recordIdentifier}`;

        if (this.memoryStore.has(dedupeKey)) {
          this.memoryStore.set(dedupeKey, normalized);
          stats.recordsUpdated++;
        } else {
          this.memoryStore.set(dedupeKey, normalized);
          stats.recordsInserted++;
        }
      } catch (err: any) {
        stats.errors.push(`Erro no CENIPA ${report.codigo_ocorrencia}: ${err.message}`);
      }
    }

    stats.finishedAt = new Date().toISOString();
    stats.status = 'COMPLETED';
    this.syncLogs.push(stats);
    return stats;
  }

  /**
   * Ingestão oficial NTSB (EUA)
   */
  public ingestNtsbBatch(records: NtsbRawRecord[]): IngestionSyncStats {
    const stats: IngestionSyncStats = {
      sourceSlug: 'ntsb',
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    };

    for (const record of records) {
      try {
        stats.recordsProcessed++;
        const normalized = NtsbNormalizer.normalize(record);
        if (!normalized) continue;

        const dedupeKey = `ntsb:${normalized.source.recordIdentifier}`;
        if (this.memoryStore.has(dedupeKey)) {
          this.memoryStore.set(dedupeKey, normalized);
          stats.recordsUpdated++;
        } else {
          this.memoryStore.set(dedupeKey, normalized);
          stats.recordsInserted++;
        }
      } catch (err: any) {
        stats.errors.push(`Erro no NTSB ${record.ev_id}: ${err.message}`);
      }
    }

    stats.finishedAt = new Date().toISOString();
    stats.status = 'COMPLETED';
    this.syncLogs.push(stats);
    return stats;
  }

  /**
   * Ingestão de Obstáculos FAA DOF
   */
  public ingestFaaObstaclesBatch(records: FaaDofRawRecord[]): IngestionSyncStats {
    const stats: IngestionSyncStats = {
      sourceSlug: 'faa_obstacles',
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errors: []
    };

    for (const record of records) {
      try {
        stats.recordsProcessed++;
        const normalized = FaaObstacleNormalizer.normalize(record);
        if (!normalized) continue;

        const key = normalized.id;
        if (this.hazardStore.has(key)) {
          this.hazardStore.set(key, normalized);
          stats.recordsUpdated++;
        } else {
          this.hazardStore.set(key, normalized);
          stats.recordsInserted++;
        }
      } catch (err: any) {
        stats.errors.push(`Erro FAA DOF ${record.oas_number}: ${err.message}`);
      }
    }

    stats.finishedAt = new Date().toISOString();
    stats.status = 'COMPLETED';
    this.syncLogs.push(stats);
    return stats;
  }

  /**
   * Retorna sumário analítico para o Painel Administrativo
   */
  public getAdminTelemetry() {
    return {
      totalOccurrences: this.memoryStore.size,
      totalHazards: this.hazardStore.size,
      totalAirports: this.airportStore.size,
      recentAlerts: Array.from(this.memoryStore.values()).filter(o => o.visualTag === 'RECENT_ALERT').length,
      historicalMemories: Array.from(this.memoryStore.values()).filter(o => o.visualTag === 'HISTORICAL_MEMORY').length,
      activeHazards: Array.from(this.hazardStore.values()).filter(h => h.status === 'ACTIVE_EXISTING').length,
      mitigatedHazards: Array.from(this.hazardStore.values()).filter(h => h.status === 'REMOVED_DEMOLISHED').length,
      syncJobs: this.syncLogs
    };
  }
}

