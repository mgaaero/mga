import { describe, it, expect } from 'vitest';
import { DataIntelligenceEngine } from '../data-intelligence-engine.js';
import { AnacRawRow } from '../connectors/anac/anac-normalizer.js';

describe('DataIntelligenceEngine Integration & Deduplication', () => {
  it('deve realizar ingestão em lote com deduplicação atômica e logs de auditoria', () => {
    const engine = new DataIntelligenceEngine();

    const anacBatch: AnacRawRow[] = [
      {
        Numero_da_Ocorrencia: '20240101-01',
        Data_da_Ocorrencia: '2024-01-01',
        Hora_da_Ocorrencia: '10:00:00',
        Classificacao_da_Ocorrencia: 'ACIDENTE',
        Municipio: 'São Paulo',
        UF: 'SP',
        Latitude: '-23.55',
        Longitude: '-46.63',
        Matricula: 'PR-TEST',
        Descricao_Historico: 'Primeira versão do histórico'
      },
      // Mesmo número de ocorrência mas com histórico atualizado (atualização)
      {
        Numero_da_Ocorrencia: '20240101-01',
        Data_da_Ocorrencia: '2024-01-01',
        Hora_da_Ocorrencia: '10:00:00',
        Classificacao_da_Ocorrencia: 'ACIDENTE',
        Municipio: 'São Paulo',
        UF: 'SP',
        Latitude: '-23.55',
        Longitude: '-46.63',
        Matricula: 'PR-TEST',
        Descricao_Historico: 'Segunda versão do histórico retificada'
      }
    ];

    const stats = engine.ingestAnacBatch(anacBatch);
    expect(stats.recordsProcessed).toBe(2);
    expect(stats.recordsInserted).toBe(1);
    expect(stats.recordsUpdated).toBe(1);
    expect(stats.status).toBe('COMPLETED');

    const telemetry = engine.getAdminTelemetry();
    expect(telemetry.totalOccurrences).toBe(1);
    expect(telemetry.syncJobs.length).toBe(1);
  });
});
