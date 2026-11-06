import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Layers, 
  MapPin, 
  Radio, 
  Zap, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Building2
} from 'lucide-react';
import { HazardObstacle } from '@mega/types';

interface MgaHazardsViewProps {
  hazards: HazardObstacle[];
  selectedHazard: HazardObstacle | null;
  onSelectHazard: (hazard: HazardObstacle) => void;
}

export const MgaHazardsView: React.FC<MgaHazardsViewProps> = ({
  hazards,
  selectedHazard,
  onSelectHazard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredHazards = hazards.filter(haz => {
    const matchesSearch = 
      (haz.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (haz.sourceAgency || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (haz.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || haz.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || haz.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeHazard = selectedHazard || filteredHazards[0] || null;

  const getHazardTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSMISSION_LINE':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'COMMUNICATION_TOWER':
      case 'ANTENNA':
        return <Radio className="w-4 h-4 text-cyan-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#070b12] text-slate-200">
      
      {/* Coluna Esquerda: Lista de Obstáculos e Filtros */}
      <div className="w-full lg:w-96 border-r border-slate-800 bg-[#0a0f1a] flex flex-col h-full shrink-0">
        
        {/* Header do Módulo */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>06. MGA HAZARDS</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Obstáculos & Perigos Físicos
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mapeamento de linhas de transmissão, torres, antenas e elevação AGL/AMSL
          </p>

          {/* Barra de Busca */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição, órgão, tipo..."
              className="w-full bg-[#111726] border border-slate-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filtros de Tipo */}
          <div className="flex items-center space-x-1.5 mt-2.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'TRANSMISSION_LINE', label: 'Linhas 69kV+' },
              { id: 'COMMUNICATION_TOWER', label: 'Torres' },
              { id: 'ANTENNA', label: 'Antenas' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors ${
                  typeFilter === f.id
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-700/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {filteredHazards.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhum obstáculo cadastrado atende aos filtros atuais.
            </div>
          ) : (
            filteredHazards.map(haz => {
              const isSelected = activeHazard?.id === haz.id;
              return (
                <div
                  key={haz.id}
                  onClick={() => onSelectHazard(haz)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-amber-950/30 border-l-2 border-amber-500' 
                      : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center space-x-1.5 text-xs font-mono font-bold text-white">
                      {getHazardTypeIcon(haz.type)}
                      <span>{haz.type}</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      {haz.status === 'ACTIVE_EXISTING' ? 'ATIVO' : 'DEMOLIDO'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-1.5">
                    {haz.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{haz.heightAmslFt ? `${haz.heightAmslFt} ft AMSL` : 'AMSL N/I'}</span>
                    <span>{haz.heightAglFt ? `${haz.heightAglFt} ft AGL` : ''}</span>
                    <span className="text-slate-400">{haz.sourceAgency}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Coluna Direita: Detalhamento Técnico do Obstáculo */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#070b12]">
        {activeHazard ? (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header da Ficha */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {activeHazard.type}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  CADASTRO DE DEFESA DO ESPAÇO AÉREO
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeHazard.description}
              </h1>

              <p className="text-xs text-slate-400 font-mono mt-1">
                Órgão Emissor / Proveniência: <strong className="text-slate-200">{activeHazard.sourceAgency}</strong>
              </p>
            </div>

            {/* Metadados Verticais e Altitudes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ALTURA AGL (SOLO)</span>
                <span className="text-white text-base font-bold">
                  {activeHazard.heightAglFt ? `${activeHazard.heightAglFt} ft` : 'N/I'}
                </span>
                <span className="text-[10px] text-slate-400 block">Acima do Nível do Solo</span>
              </div>

              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ALTITUDE AMSL (MAR)</span>
                <span className="text-amber-400 text-base font-bold">
                  {activeHazard.heightAmslFt ? `${activeHazard.heightAmslFt} ft` : 'N/I'}
                </span>
                <span className="text-[10px] text-slate-400 block">Nível Médio do Mar</span>
              </div>

              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">LATITUDE (WGS84)</span>
                <span className="text-slate-200 font-bold block">
                  {activeHazard.coordinates.latitude.toFixed(4)}°
                </span>
                <span className="text-[10px] text-slate-400 block">PostGIS Point</span>
              </div>

              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">LONGITUDE (WGS84)</span>
                <span className="text-slate-200 font-bold block">
                  {activeHazard.coordinates.longitude.toFixed(4)}°
                </span>
                <span className="text-[10px] text-slate-400 block">PostGIS Point</span>
              </div>
            </div>

            {/* Análise de Risco de Encosta e Conflito Vertical */}
            <div className="bg-[#0e1422] p-5 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Impacto Operacional & Restrição de Voo</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Estruturas verticais cadastradas representam fatores críticos durante aproximações visuais fora de aeródromos controlados ou voos a baixa altitude. O relevo e o contraste visual desfavorável podem reduzir significativamente a visibilidade da tripulação em condições de aproximação VFR.
              </p>
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs font-mono">
            Selecione um obstáculo para inspecionar os detalhes verticais.
          </div>
        )}
      </div>

    </div>
  );
};

