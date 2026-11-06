import React from 'react';
import { RouteIntelligenceAnalysis } from '@mega/shared';
import { AviationIntelligenceAiEngine, GroundedAiBriefing } from '@mega/shared';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertOctagon, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Info
} from 'lucide-react';

interface IntelligenceAiBriefingProps {
  analysis: RouteIntelligenceAnalysis;
}

export const IntelligenceAiBriefing: React.FC<IntelligenceAiBriefingProps> = ({ analysis }) => {
  // Gera a síntese estritamente ancorada em fatos
  const briefing: GroundedAiBriefing = React.useMemo(() => {
    return AviationIntelligenceAiEngine.generateGroundedBriefing(analysis);
  }, [analysis]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100 font-sans">
      {/* Top Banner de Inteligência Ancorada */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 flex items-start justify-between shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white tracking-wide">
                MGA Intelligence Briefing
              </h2>
              <span className="text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-700/60 px-2 py-0.5 rounded-full">
                STRICT FACTUAL GROUNDING
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Interpretação analítica de fatores causais históricos, padrões recorrentes e gestão de ameaças operacionais (TEM), 
              ancorada exclusivamente nos documentos oficiais catalogados para a rota {analysis.origin.code} ➔ {analysis.destination.code}.
            </p>
          </div>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-5 space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
          1. Síntese Executiva de Segurança da Rota
        </span>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          {briefing.executiveSummary}
        </p>
      </div>

      {/* Padrões Históricos Recorrentes */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-5 space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
          2. Padrões Causais Históricos Identificados no Corredor (±{analysis.corridorWidthKm} km)
        </span>
        <div className="space-y-2">
          {briefing.historicalPatterns.map((pat, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start space-x-2"
            >
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{pat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gestão de Ameaças Operacionais (TEM) */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-5 space-y-4">
        <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
          3. Gestão de Ameaças & Recomendações Documentadas (Threat & Error Management)
        </span>

        {briefing.operationalThreatFactors.length === 0 ? (
          <p className="text-xs text-slate-500">
            Nenhum fator de risco histórico ativo detectado para os parâmetros selecionados.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {briefing.operationalThreatFactors.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{item.threat}</span>
                  <span className="text-[10px] font-mono text-slate-500">{item.historicalReference}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded border border-slate-800/60">
                  {item.mitigationRecommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rastreabilidade e Auditoria de Fatos */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-5 space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
          4. Trilha de Auditoria & Provas Documentais
        </span>
        <div className="space-y-1.5 font-mono text-xs">
          {briefing.criticalAuditTrail.map((trail, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded bg-slate-950 border border-slate-800/70 flex items-center justify-between text-slate-300"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sky-400 font-bold">[{trail.agency}]</span>
                <span className="text-slate-200">{trail.officialRecordId}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 truncate max-w-lg">{trail.factDocumented}</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer de Limitação */}
      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        {briefing.disclaimer}
      </div>
    </div>
  );
};

