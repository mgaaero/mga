import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Share2, 
  Compass, 
  Clock, 
  Navigation, 
  MoreHorizontal, 
  X, 
  ChevronRight, 
  Search,
  Sliders,
  AlertTriangle,
  FileText,
  Mountain,
  Radio,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { InteractiveFlightMap } from './InteractiveFlightMap';
import { Occurrence, HazardObstacle } from '@mega/types';

export interface RouteRiskAssessment {
  id: string;
  code: string;
  reportNumber: string;
  aircraftModel: string;
  registration: string;
  originIcao: string;
  originCity: string;
  destIcao: string;
  destCity: string;
  date: string;
  severity: 'CATASTROPHIC' | 'CRITICAL' | 'MAJOR';
  fatalitiesOnboard: number;
  fatalitiesGround: number;
  causalFactor: string;
  distanceToCorridorKm: number;
  terrainObstacleWarning: string;
  officialSource: string;
  officialReportUrl?: string;
  investigationStatus: string;
  aircraftImage: string;
  elevationAmsl: number;
  hazardsNearbyCount: number;
  originLat: number;
  originLon: number;
  destLat: number;
  destLon: number;
  accidentLat: number;
  accidentLon: number;
}

export const DOCUMENTED_ROUTE_CASES: RouteRiskAssessment[] = [
  {
    id: 'voepass-ps-vpb',
    code: 'A-102/CENIPA/2024',
    reportNumber: 'A-102/CENIPA/2024',
    aircraftModel: 'ATR 72-500',
    registration: 'PS-VPB',
    originIcao: 'CAC',
    originCity: 'Cascavel',
    destIcao: 'GRU',
    destCity: 'Guarulhos',
    date: '09/08/2024 (Relatório: 15/07/2026)',
    severity: 'CATASTROPHIC',
    fatalitiesOnboard: 62,
    fatalitiesGround: 0,
    causalFactor: 'Gelo severo em voo (Icing conditions), perda de sustentação e parafuso chato em Vinhedo/SP.',
    distanceToCorridorKm: 4.8,
    terrainObstacleWarning: 'Zona de formação de gelo severo em camada terminal e relevo ondulado no planalto paulista.',
    officialSource: 'CENIPA / Força Aérea Brasileira',
    investigationStatus: 'FINAL_REPORT_CONFIRMED',
    aircraftImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    elevationAmsl: 740,
    hazardsNearbyCount: 3,
    originLat: -25.0003,
    originLon: -53.5008,
    destLat: -23.4356,
    destLon: -46.4731,
    accidentLat: -23.0294,
    accidentLon: -46.9836
  },
  {
    id: 'caratinga-pt-onj',
    code: 'A-145/CENIPA/2021',
    reportNumber: 'A-145/CENIPA/2021',
    aircraftModel: 'Beechcraft King Air C90A',
    registration: 'PT-ONJ',
    originIcao: 'GOI',
    originCity: 'Goiânia',
    destIcao: 'SNCT',
    destCity: 'Caratinga',
    date: '05/11/2021',
    severity: 'CATASTROPHIC',
    fatalitiesOnboard: 5,
    fatalitiesGround: 0,
    causalFactor: 'Colisão com cabo para-raios de linha de transmissão (CEMIG 69kV) na aproximação final.',
    distanceToCorridorKm: 1.2,
    terrainObstacleWarning: 'ALERTA CRÍTICO: Linha de transmissão não sinalizada fora da zona de proteção oficial do aeródromo.',
    officialSource: 'CENIPA / Relatório Final 2023',
    investigationStatus: 'FINAL_REPORT_CONFIRMED',
    aircraftImage: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f0?auto=format&fit=crop&w=800&q=80',
    elevationAmsl: 610,
    hazardsNearbyCount: 6,
    originLat: -16.6322,
    originLon: -49.2211,
    destLat: -19.7917,
    destLon: -42.1281,
    accidentLat: -19.7917,
    accidentLon: -42.1281
  },
  {
    id: 'gol-1907',
    code: 'A-022/CENIPA/2008',
    reportNumber: 'A-022/CENIPA/2008',
    aircraftModel: 'Boeing 737-800 SFP',
    registration: 'PR-GTD',
    originIcao: 'MAO',
    originCity: 'Manaus',
    destIcao: 'BSB',
    destCity: 'Brasília',
    date: '29/09/2006 (Relatório: 08/12/2008)',
    severity: 'CATASTROPHIC',
    fatalitiesOnboard: 154,
    fatalitiesGround: 0,
    causalFactor: 'Colisão em voo no FL370 com Embraer Legacy N600XL (Transponder inoperante / Falha ATC).',
    distanceToCorridorKm: 0.0,
    terrainObstacleWarning: 'Rota de aerovia UZ4 sobre floresta amazônica densa (Serra do Cachimbo/MT). Resgate remoto.',
    officialSource: 'CENIPA / NTSB',
    investigationStatus: 'FINAL_REPORT_CONFIRMED',
    aircraftImage: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=800&q=80',
    elevationAmsl: 450,
    hazardsNearbyCount: 1,
    originLat: -3.0386,
    originLon: -60.0497,
    destLat: -15.8692,
    destLon: -47.9208,
    accidentLat: -10.4800,
    accidentLon: -53.2100
  },
  {
    id: 'tam-3054',
    code: 'A-054/CENIPA/2007',
    reportNumber: 'A-054/CENIPA/2007',
    aircraftModel: 'Airbus A320-233',
    registration: 'PR-MBK',
    originIcao: 'POA',
    originCity: 'Porto Alegre',
    destIcao: 'CGH',
    destCity: 'Congonhas',
    date: '17/07/2007 (Relatório: 20/11/2009)',
    severity: 'CATASTROPHIC',
    fatalitiesOnboard: 187,
    fatalitiesGround: 12,
    causalFactor: 'Excursão de pista molhada sem grooving e manete em CLIMB desativando spoilers automáticos.',
    distanceToCorridorKm: 0.2,
    terrainObstacleWarning: 'Platô elevado no centro urbano denso de SP. Zona de escape nula na cabeceira 35L.',
    officialSource: 'CENIPA',
    investigationStatus: 'FINAL_REPORT_CONFIRMED',
    aircraftImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
    elevationAmsl: 802,
    hazardsNearbyCount: 8,
    originLat: -29.9944,
    originLon: -51.1714,
    destLat: -23.6261,
    destLon: -46.6564,
    accidentLat: -23.6261,
    accidentLon: -46.6564
  },
  {
    id: 'hudson-river',
    code: 'AAR-10/03',
    reportNumber: 'DCA09MA026',
    aircraftModel: 'Airbus A320-214',
    registration: 'N106US',
    originIcao: 'LGA',
    originCity: 'LaGuardia (NY)',
    destIcao: 'CLT',
    destCity: 'Charlotte',
    date: '15/01/2009 (Relatório: 04/05/2010)',
    severity: 'MAJOR',
    fatalitiesOnboard: 0,
    fatalitiesGround: 0,
    causalFactor: 'Ingestão múltipla de aves migratórias (Bird Strike / Gansos Canadenses) e perda total de motores.',
    distanceToCorridorKm: 1.8,
    terrainObstacleWarning: 'Corredor de fauna aquática do Rio Hudson e área metropolitana ultra densa.',
    officialSource: 'NTSB',
    investigationStatus: 'FINAL_REPORT_CONFIRMED',
    aircraftImage: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    elevationAmsl: 0,
    hazardsNearbyCount: 5,
    originLat: 40.7772,
    originLon: -73.8726,
    destLat: 35.2140,
    destLon: -80.9431,
    accidentLat: 40.7694,
    accidentLon: -74.0044
  }
];

interface TacticalWorkspaceProps {
  occurrences: Occurrence[];
  hazards: HazardObstacle[];
}

export const MgaTacticalWorkspace: React.FC<TacticalWorkspaceProps> = ({
  occurrences,
  hazards
}) => {
  const [cases, setCases] = useState<RouteRiskAssessment[]>(DOCUMENTED_ROUTE_CASES);
  const [selectedCase, setSelectedCase] = useState<RouteRiskAssessment>(DOCUMENTED_ROUTE_CASES[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [showRightCard, setShowRightCard] = useState(true);

  const filteredCases = cases.filter(c => 
    c.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.registration.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.originIcao.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.destIcao.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.originCity.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.destCity.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-[#040415] text-[#e5e7eb] font-['JetBrains_Mono',monospace] overflow-hidden select-none">
      
      {/* MAPA DE FUNDO INTERATIVO COM SATELLITE TILES DARK E PONTOS DE PERIGO DOCUMENTADOS */}
      <div className="absolute inset-0 z-0">
        <InteractiveFlightMap
          origin={{
            icao: selectedCase.originIcao,
            name: selectedCase.originCity,
            lat: selectedCase.originLat,
            lon: selectedCase.originLon
          }}
          destination={{
            icao: selectedCase.destIcao,
            name: selectedCase.destCity,
            lat: selectedCase.destLat,
            lon: selectedCase.destLon
          }}
          corridorBufferKm={40}
          occurrences={occurrences}
          hazards={hazards}
          selectedOccurrence={null}
          onSelectOccurrence={() => {}}
          showCorridor={true}
        />
      </div>

      {/* BANNER SUPERIOR DE AVISO: "ANTES DO PRÓXIMO VOO, CONHEÇA O TERRITÓRIO" */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-[#0b0e17]/95 border border-[#ff8800]/40 backdrop-blur-xl px-5 py-2 rounded-full shadow-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff8800] animate-ping" />
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            ANTES DO PRÓXIMO VOO, CONHEÇA O TERRITÓRIO
          </span>
          <span className="text-[11px] text-[#ff9900] font-mono border-l border-white/10 pl-3">
            Inteligência Geográfica Preventiva & Memória Oficial (CENIPA / NTSB)
          </span>
        </div>
      </div>

      {/* OVERLAY TÁTICO: CARDS DE ROTAS E ACIDENTES DOCUMENTADOS NA LATERAL ESQUERDA */}
      <div className="absolute top-16 left-5 bottom-4 z-20 w-[320px] flex flex-col pointer-events-none">
        
        {/* Barra de Filtro Rápida */}
        <div className="pointer-events-auto mb-3 bg-[#13151b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 flex items-center gap-2 shadow-2xl">
          <Search className="w-4 h-4 text-slate-400 pl-0.5" />
          <input
            type="text"
            placeholder="Filtrar por trecho, matrícula ou código..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-white placeholder-slate-400 focus:outline-none font-mono"
          />
        </div>

        {/* Lista de Rotas com Ocorrências Oficiais */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pointer-events-auto no-scrollbar">
          {filteredCases.map((item) => {
            const isSelected = item.id === selectedCase.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedCase(item);
                  setShowRightCard(true);
                }}
                className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-2xl backdrop-blur-md ${
                  isSelected
                    ? 'bg-[#181a20]/95 border-2 border-[#ff8800] ring-4 ring-[#ff8800]/20'
                    : 'bg-[#13151b]/90 border border-white/5 hover:bg-[#1a1d26]/90 hover:border-white/15'
                }`}
              >
                {/* Header: Código Investigativo + Matrícula */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-mono font-bold rounded border border-red-500/30">
                      {item.registration}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">
                      {item.aircraftModel}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.code.split('/')[0]}
                  </span>
                </div>

                {/* Trajeto Geodésico: Origem e Destino com Linha Laranja */}
                <div className="relative pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                    <span>{item.originCity}</span>
                    <span>{item.destCity}</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black tracking-tight text-white font-mono">
                      {item.originIcao}
                    </span>
                    
                    {/* Linha com Avião centralizado */}
                    <div className="flex-1 mx-3 flex items-center justify-center relative">
                      <div className="w-full h-[1.5px] bg-[#ff8800]/80"></div>
                      <div className="absolute bg-[#181a20] px-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ff8800]" />
                      </div>
                    </div>

                    <span className="text-xl font-black tracking-tight text-white font-mono">
                      {item.destIcao}
                    </span>
                  </div>

                  {/* Alerta de Proximidade do Perigo */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {item.fatalitiesOnboard > 0 ? `${item.fatalitiesOnboard} Vítimas` : 'Zero Fatalidades'}
                    </span>
                    <span className="text-amber-400">
                      ±{item.distanceToCorridorKm} km do corredor
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OVERLAY TÁTICO: DOSSIÊ DE RISCO E AVALIAÇÃO DO TERRITÓRIO NA LATERAL DIREITA */}
      {showRightCard && selectedCase && (
        <div className="absolute top-16 right-5 z-20 w-[380px] pointer-events-auto">
          <div className="bg-[#14161d]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-6rem)]">
            
            {/* Header com Identificação do Caso */}
            <div className="p-4 bg-gradient-to-b from-[#1c1f2b] to-[#14161d] flex items-center justify-between border-b border-white/5">
              <div>
                <div className="text-sm font-black text-[#ff9900] tracking-wide font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#ff8800]" />
                  <span>DOSSIÊ: {selectedCase.code}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Matrícula: {selectedCase.registration} • {selectedCase.aircraftModel}
                </div>
              </div>

              <button
                onClick={() => setShowRightCard(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 no-scrollbar">
              
              {/* Card de Fator Crítico / O que aconteceu no local */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-1.5 flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Por que não passar por aqui sem atenção:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                  {selectedCase.causalFactor}
                </p>
              </div>

              {/* Trajeto da Rota Avaliada */}
              <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-2xl font-black text-white font-mono">{selectedCase.originIcao}</span>
                    <span className="text-[10px] text-slate-400 block">{selectedCase.originCity}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono text-[#ff8800] bg-[#ff8800]/10 px-2 py-0.5 rounded border border-[#ff8800]/20">
                      CORREDOR WGS84
                    </span>
                    <div className="w-16 h-[1px] bg-[#ff8800]/60 my-1"></div>
                    <span className="text-[9px] font-mono text-slate-400">±{selectedCase.distanceToCorridorKm} km desvio</span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-white font-mono">{selectedCase.destIcao}</span>
                    <span className="text-[10px] text-slate-400 block">{selectedCase.destCity}</span>
                  </div>
                </div>
              </div>

              {/* Características do Território & Obstáculos (Hazards) */}
              <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-3.5 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#ff9900] flex items-center gap-1.5 border-b border-white/5 pb-1 font-bold">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Contexto Geográfico & Obstáculos</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {selectedCase.terrainObstacleWarning}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block">Elevação Relevo</span>
                    <span className="text-white font-bold">{selectedCase.elevationAmsl} m AMSL</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[9px] text-slate-400 block">Obstáculos no Raio</span>
                    <span className="text-amber-400 font-bold">{selectedCase.hazardsNearbyCount} mapeados</span>
                  </div>
                </div>
              </div>

              {/* Registro Documental Oficial */}
              <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-3.5 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-white/5 pb-1">
                  <span>Fonte Primária de Investigação</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {selectedCase.investigationStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400">Órgão Investigador:</span>
                  <span className="text-white font-bold font-mono">{selectedCase.officialSource}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Data Documentada:</span>
                  <span className="text-slate-200 font-mono">{selectedCase.date}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Vítimas Bordo / Solo:</span>
                  <span className="font-mono text-red-400 font-bold">
                    {selectedCase.fatalitiesOnboard} a bordo / {selectedCase.fatalitiesGround} em solo
                  </span>
                </div>
              </div>

              {/* Botão de Ação: Abrir Relatório Oficial */}
              <div className="pt-1">
                <button 
                  onClick={() => window.open(`https://www2.fab.mil.br/cenipa/`, '_blank')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff8800] hover:bg-[#ff9900] text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>CONSULTAR RELATÓRIO OFICIAL COMPLETO</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
