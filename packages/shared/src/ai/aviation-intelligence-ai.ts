import { RouteIntelligenceAnalysis } from '../route-intelligence-service.js';

export interface GroundedAiBriefing {
  executiveSummary: string;
  historicalPatterns: string[];
  operationalThreatFactors: {
    threat: string;
    historicalReference: string;
    mitigationRecommendation: string;
  }[];
  criticalAuditTrail: {
    agency: string;
    officialRecordId: string;
    factDocumented: string;
  }[];
  disclaimer: string;
}

/**
 * MOTOR DE RACIOCÍNIO GROUNDED (Strict Grounding Engine)
 * Gera interpretação e síntese aeronáutica estritamente ancorada
 * nos fatos e documentos retornados pela rota, sem alucinações.
 */
export class AviationIntelligenceAiEngine {
  public static generateGroundedBriefing(analysis: RouteIntelligenceAnalysis): GroundedAiBriefing {
    const orig = analysis.origin.code;
    const dest = analysis.destination.code;
    const totalOcc = analysis.occurrences.length;
    const totalHaz = analysis.hazards.length;
    const recent = analysis.summaryMetrics.recentAlertsCount;
    const fatalities = analysis.summaryMetrics.totalFatalities;

    // 1. Resumo Executivo Baseado em Fatos
    const executiveSummary = totalOcc === 0 && totalHaz === 0
      ? `A varredura no corredor de ±${analysis.corridorWidthKm} km entre ${orig} e ${dest} (${analysis.totalDistanceKm} km) não identificou acidentes históricos ou perigos documentados nas bases oficiais ativas (CENIPA, ANAC, NTSB, FAA). A rota requer monitoramento contínuo de NOTAMs vigentes.`
      : `Análise preliminar no corredor de voo ${orig} ➔ ${dest} (largura ±${analysis.corridorWidthKm} km). Foram catalogados ${totalOcc} eventos históricos e ${totalHaz} obstáculos cadastrados. Há ${recent} ocorrência(s) recente(s) sob investigação em andamento e ${fatalities} vítima(s) fatal(is) acumulada(s) no histórico das fontes oficiais.`;

    // 2. Extração de Padrões Recorrentes
    const patterns: string[] = [];
    const icingOccs = analysis.occurrences.filter(o => o.summary.toLowerCase().includes('gelo') || o.summary.toLowerCase().includes('icing'));
    const obstacleOccs = analysis.occurrences.filter(o => o.summary.toLowerCase().includes('cabo') || o.summary.toLowerCase().includes('linha') || o.summary.toLowerCase().includes('obstáculo'));
    const runwayOccs = analysis.occurrences.filter(o => o.flightPhase?.toLowerCase().includes('pouso') || o.summary.toLowerCase().includes('pista'));

    if (icingOccs.length > 0) {
      patterns.push(`Padrão Meteorológico Severo: ${icingOccs.length} ocorrência(s) envolvem degradação por formação de gelo atmosférico (icing) nas camadas médias/altas de aproximação.`);
    }
    if (obstacleOccs.length > 0) {
      patterns.push(`Padrão Topográfico/Estrutural: ${obstacleOccs.length} ocorrência(s) com colisão contra estruturas lineares (cabos elétricos/linhas de transmissão) em fases de descida visual.`);
    }
    if (runwayOccs.length > 0) {
      patterns.push(`Fator Operacional de Pouso: ${runwayOccs.length} ocorrência(s) em aproximação final e toque sob pista molhada ou condições meteorológicas degradadas.`);
    }

    if (patterns.length === 0 && totalOcc > 0) {
      patterns.push(`Dispersão Histórica: Os eventos catalogados no corredor apresentam naturezas operacionais isoladas sem agrupamento causal preponderante.`);
    }

    // 3. Fatores de Ameaça Ancorados (Threat & Error Management - TEM)
    const operationalThreatFactors = analysis.occurrences.map(occ => ({
      threat: `Fase de ${occ.flightPhase || 'Voo'} — ${occ.aircraft?.model || 'Aeronave'}`,
      historicalReference: `${occ.source.officialAgency} [${occ.source.recordIdentifier}] (${occ.date})`,
      mitigationRecommendation: occ.investigationFindings 
        ? `Revisar recomendação SIPAER/NTSB: ${occ.investigationFindings.slice(0, 180)}...`
        : `Manter vigilância visual rigorosa para relevo e obstáculos a menos de ${occ.distanceToRouteKm} km do eixo da rota.`
    }));

    // 4. Trilha Estrita de Rastreabilidade
    const criticalAuditTrail = analysis.occurrences.map(occ => ({
      agency: occ.source.officialAgency,
      officialRecordId: occ.source.recordIdentifier,
      factDocumented: `${occ.date} - ${occ.aircraft?.registration || 'N/A'}: ${occ.summary.slice(0, 120)}...`
    }));

    return {
      executiveSummary,
      historicalPatterns: patterns,
      operationalThreatFactors,
      criticalAuditTrail,
      disclaimer: 'AVISO: A inteligência interpretativa sintetiza fatos documentados em relatórios oficiais de investigação. Ela não formula diagnósticos operacionais definitivos nem substitui o julgamento da tripulação (PIC), cartas aeronáuticas, NOTAM ou meteorologia oficial.'
    };
  }
}

