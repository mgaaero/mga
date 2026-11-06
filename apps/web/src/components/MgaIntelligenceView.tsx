import React, { useState } from 'react';
import { 
  BrainCircuit, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Layers, 
  Compass, 
  ExternalLink,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertOctagon,
  Activity
} from 'lucide-react';
import { Occurrence, HazardObstacle } from '@mega/types';
import { RouteIntelligenceAnalysis } from '@mega/shared';

interface MgaIntelligenceViewProps {
  analysis: RouteIntelligenceAnalysis;
  occurrences: Occurrence[];
  hazards: HazardObstacle[];
}

export const MgaIntelligenceView: React.FC<MgaIntelligenceViewProps> = ({
  analysis,
  occurrences,
  hazards
}) => {
  const [activeTab, setActiveTab] = useState<'causes' | 'tem' | 'indicators' | 'patterns'>('causes');

  // Métricas de Inteligência Operacional
  const totalFatalities = occurrences.reduce((acc, curr) => acc + (curr.fatalities || 0), 0);
  const totalAccidents = occurrences.filter(o => o.type === 'ACCIDENT').length;
  const totalActiveHazards = hazards.filter(h => h.status === 'ACTIVE_EXISTING').length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#070b12] text-slate-200 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header do Módulo 07 */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                07. MGA INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                THREAT & ERROR MANAGEMENT (TEM)
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Corredor Analisado: <strong className="text-white">{analysis.origin.code} ➔ {analysis.destination.code} (±{analysis.corridorWidthKm} km)</strong>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inteligência Analítica & Gestão de Ameaças
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
            Interpretação sistemática de fatores contribuintes, cruzamento de relatórios conclusivos e 
            matriz de mitigação operacional de risco conforme os manuais ICAO DOC 9859 e SMS.
          </p>

          {/* Banner de Rigor Metodológico */}
          <div className="mt-3 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>RIGOR METODOLÓGICO:</strong> Distinção estrita entre fatos documentados em relatórios oficiais e sínteses analíticas. Correlações estatísticas nunca são presumidas como causas sem evidência formal.
            </span>
          </div>
        </div>

        {/* 4 Cards de Indicadores Rápidos (Safety Indicators) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 block text-[10px]">OCORRÊNCIAS NO CORREDOR</span>
            <span className="text-xl font-bold text-white mt-1 block">{occurrences.length}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{totalAccidents} acidentes catalogados</span>
          </div>

          <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 block text-[10px]">VÍTIMAS FATAIS DOCUMENTADAS</span>
            <span className={`text-xl font-bold mt-1 block ${totalFatalities > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {totalFatalities}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Histórico do corredor</span>
          </div>

          <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 block text-[10px]">OBSTÁCULOS ATIVOS NO EIXO</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{totalActiveHazards}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Linhas 69kV+, torres e antenas</span>
          </div>

          <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 block text-[10px]">CLASSIFICAÇÃO DE RISCO TEM</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">MODERADO</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Requer briefing específico</span>
          </div>
        </div>

        {/* Abas das Frentes de Inteligência */}
        <div className="flex border-b border-slate-800 space-x-2">
          {[
            { id: 'causes', label: '1. Fatores Contribuintes', icon: FileText },
            { id: 'tem', label: '2. Matriz TEM (Ameaças & Erros)', icon: ShieldCheck },
            { id: 'patterns', label: '3. Padrões Recorrentes', icon: BrainCircuit },
            { id: 'indicators', label: '4. Indicadores & Confiabilidade', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition-all ${
                  isActive
                    ? 'border-cyan-400 text-white font-bold bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Aba 1: Fatores Contribuintes Documentados */}
        {activeTab === 'causes' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Fatores Contribuintes Oficiais Catalogados</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0c121e] border border-slate-800 rounded-xl p-5 space-y-3">
                <span className="text-xs font-mono font-bold text-amber-400 block uppercase">
                  Fatores Físicos & Condições Meteorológicas
                </span>
                <ul className="space-y-2 text-xs text-slate-300 font-sans">
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Gelo Severo (Icing):</strong> Degradação aerodinâmica em descida com acionamento de alertas de estol documentada em relatórios oficiais.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Contaminação de Pista / Hidroplanagem:</strong> Pista molhada sem ranhuras (grooving) combinada a reversor inoperante.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#0c121e] border border-slate-800 rounded-xl p-5 space-y-3">
                <span className="text-xs font-mono font-bold text-cyan-400 block uppercase">
                  Fatores Humanos & Consciência Situacional
                </span>
                <ul className="space-y-2 text-xs text-slate-300 font-sans">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Aproximação Visual sem Referência:</strong> Contraste visual desfavorável de cabos suspensos em aproximações fora de aeródromos controlados.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Coordenação de Cockpit (CRM):</strong> Posicionamento assimétrico de manetes de potência em pousos sob estresse e condições meteorológicas adversas.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Matriz TEM (Threat and Error Management) */}
        {activeTab === 'tem' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Matriz Operacional Threat and Error Management (TEM)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-[#0c121e]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ameaça Externa (Threat)</th>
                    <th className="p-3">Erro Potencial (Error)</th>
                    <th className="p-3">Estado Indesejado da Aeronave</th>
                    <th className="p-3">Barreira de Mitigação Proposta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-amber-300">Linha de transmissão 69kV em vale de aproximação</td>
                    <td className="p-3">Manter perfil abaixo da rampa visual ideal</td>
                    <td className="p-3 text-red-400">Proximidade com terreno / colisão com cabo</td>
                    <td className="p-3 text-emerald-400">Briefing de relevo e checagem de cartas VFR de obstáculos</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-amber-300">Condições de formação severa de gelo atmosférico</td>
                    <td className="p-3">Permanência prolongada em zona de icing</td>
                    <td className="p-3 text-red-400">Degradação aerodinâmica e estol</td>
                    <td className="p-3 text-emerald-400">Mudança de nível imediata e ativação antecipada de degelo</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-amber-300">Pista curta molhada com reversor inoperante</td>
                    <td className="p-3">Desatenção à posição de manetes em pouso manual</td>
                    <td className="p-3 text-red-400">Excursão de pista (overrun)</td>
                    <td className="p-3 text-emerald-400">Aplicação rigorosa do SOP e cálculo de distância de parada</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 3: Padrões Recorrentes */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Identificação de Padrões Operacionais no Território</span>
            </h3>

            <div className="space-y-3">
              <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-mono font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono">
                    Concentração de Obstáculos em Rotas Terminais
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                    As bacias terminais de São Paulo e Rio de Janeiro concentram o maior número de antenas e torres em elevações de terreno superiores a 2.000 ft AMSL. Em situações de aproximação não estabilizada, essas estruturas elevam o risco de CFIT (Controlled Flight Into Terrain).
                  </p>
                </div>
              </div>

              <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl flex items-start space-x-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-mono font-bold text-xs">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono">
                    Voo Visual (VFR) fora de Áreas com Controle de Espaço Aéreo
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                    Em aeródromos não controlados no interior, a existência de linhas de alta tensão não catalogadas nos planos de zoneamento urbano municipal representa o principal fator de risco para aviação geral e táxi aéreo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 4: Indicadores & Confiabilidade das Fontes */}
        {activeTab === 'indicators' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Grau de Confiabilidade e Rastreabilidade Documental</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-500 block text-[10px]">CENIPA / SIPAER</span>
                <span className="text-emerald-400 font-bold block mt-1">NÍVEL ALTO (A-1)</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Relatórios finais com metadados periciais, coordenadas oficiais e investigação concluída.
                </p>
              </div>

              <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-500 block text-[10px]">NTSB / CAROL</span>
                <span className="text-emerald-400 font-bold block mt-1">NÍVEL ALTO (A-1)</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Investigações formais com dados técnicos de telemetria e conclusões publicadas.
                </p>
              </div>

              <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
                <span className="text-slate-500 block text-[10px]">DECEA / FAA DOF</span>
                <span className="text-cyan-400 font-bold block mt-1">NÍVEL TÉCNICO (B-1)</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                  Registros cartográficos de obstáculos verticais com altitudes certificadas AMSL/AGL.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

