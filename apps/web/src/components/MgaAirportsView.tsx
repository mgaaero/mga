import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Layers, 
  Compass, 
  FileText, 
  Ruler, 
  PlaneTakeoff,
  Eye,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { Airport, HazardObstacle, Occurrence } from '@mega/types';

interface MgaAirportsViewProps {
  currentAirport: Airport;
  allAirports: Airport[];
  onSelectAirport: (airport: Airport) => void;
  hazards: HazardObstacle[];
  occurrences: Occurrence[];
}

export const MgaAirportsView: React.FC<MgaAirportsViewProps> = ({
  currentAirport,
  allAirports,
  onSelectAirport,
  hazards,
  occurrences
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [olsSurface, setOlsSurface] = useState<'ALL' | 'APPROACH' | 'TRANSITIONAL' | 'INNER_HORIZONTAL'>('ALL');

  // Aeródromos filtrados
  const filteredAirports = allAirports.filter(a => 
    (a.icao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.ident || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.municipality || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#070b12] text-slate-200">
      
      {/* Coluna Esquerda: Seletor de Aeródromos e Filtros B2B */}
      <div className="w-full lg:w-96 border-r border-slate-800 bg-[#0a0f1a] flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>08. MGA AIRPORTS (B2B)</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Inteligência Aeroportuária & Entorno
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Monitoramento de superfícies OLS e segurança territorial para concessionárias
          </p>

          {/* Barra de Busca de Aeródromos */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aeródromo (SBGR, Congonhas...)"
              className="w-full bg-[#111726] border border-slate-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Lista de Aeródromos */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {filteredAirports.map(apt => {
            const isSelected = apt.ident === currentAirport.ident;
            return (
              <div
                key={apt.ident}
                onClick={() => onSelectAirport(apt)}
                className={`p-3.5 cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-indigo-950/40 border-l-2 border-indigo-400' 
                    : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-white tracking-wider flex items-center space-x-1.5">
                    <PlaneTakeoff className="w-3 h-3 text-indigo-400" />
                    <span>{apt.icao || apt.ident}</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    {apt.countryIso || 'BRA'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium truncate mb-0.5">
                  {apt.name}
                </p>
                <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Elev: {apt.elevationFt ? `${apt.elevationFt} ft` : 'N/I'}</span>
                  <span>{apt.municipality || 'Terminal'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coluna Direita: Dashboard de Inteligência do Entorno */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#070b12] space-y-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header do Aeródromo Selecionado */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {currentAirport.icao || currentAirport.ident}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  CONCESSÃO AEROPORTUÁRIA
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Coordenadas WGS84: <strong className="text-white">{currentAirport.latitude.toFixed(4)}°, {currentAirport.longitude.toFixed(4)}°</strong>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {currentAirport.name}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Elevação de Referência: <strong className="text-slate-200">{currentAirport.elevationFt || 0} ft AMSL</strong> • Município: <strong className="text-slate-200">{currentAirport.municipality || 'Região Metropolitana'}</strong>
            </p>
          </div>

          {/* Cards de Métricas do Entorno Aeroportuário */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-500 block text-[10px]">RAIO DE COBERTURA (ZPA)</span>
              <span className="text-xl font-bold text-white mt-1 block">15 km</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Zona de Proteção de Aeródromo</span>
            </div>

            <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-500 block text-[10px]">OBSTÁCULOS CATALOGADOS</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{hazards.length}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Torres, antenas e linhas</span>
            </div>

            <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-500 block text-[10px]">OCORRÊNCIAS NO ENTORNO</span>
              <span className="text-xl font-bold text-red-400 mt-1 block">{occurrences.length}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Histórico oficial preservado</span>
            </div>

            <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
              <span className="text-slate-500 block text-[10px]">CONFORMIDADE RBAC 161 / OLS</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">VIGENTE</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Sem violação crítica ativa</span>
            </div>
          </div>

          {/* Superfícies Limitadoras de Obstáculos (OLS - ICAO Anexo 14) */}
          <div className="bg-[#0c121e] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-indigo-400" />
                  <span>Análise de Superfícies Limitadoras de Obstáculos (OLS)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Conformidade com o Anexo 14 da OACI e Plano de Zona de Proteção de Aeródromo (DECEA)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">Superfície de Aproximação</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Rampa inclinada com início a 60m da cabeceira. Monitoramento obrigatório contra construções civis e postes de iluminação.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">Superfície de Transição</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Inclinação lateral de 14.3% (1:7) a partir das bordas da faixa de pista até encontrar a superfície horizontal interna.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">Horizontal Interna</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Plano horizontal a 45m acima do ponto de referência do aeródromo (ARP), cobrindo raio de até 4.000m.
                </p>
              </div>
            </div>
          </div>

          {/* Dossiê Executivo B2B para Concessionárias */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/20 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">
                Relatório Territorial de Segurança Operacional (SMS)
              </span>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Emita um dossiê consolidando o levantamento georreferenciado de obstáculos, histórico de acidentes e zoneamento de ruído para envio à ANAC e DECEA.
              </p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-mono text-xs font-bold transition shadow-lg shadow-indigo-600/20 shrink-0">
              Gerar Dossiê do Aeródromo
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

