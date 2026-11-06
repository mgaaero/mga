import React from 'react';
import { RouteIntelligenceAnalysis } from '@mega/shared';
import { Occurrence, HazardObstacle } from '@mega/types';
import { Mountain, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface FlightProfileViewProps {
  analysis: RouteIntelligenceAnalysis;
  cruiseAltitudeFt?: number;
  onSelectEvent?: (event: Occurrence | HazardObstacle) => void;
}

export const FlightProfileView: React.FC<FlightProfileViewProps> = ({
  analysis,
  cruiseAltitudeFt = 36000, // FL360 padrão comercial
  onSelectEvent
}) => {
  const totalDist = analysis.totalDistanceKm || 1;

  // Normalização percentual ao longo da rota (0% na Origem, 100% no Destino)
  // Simulação de elevação topográfica de terreno de referência ao longo do trajeto
  const terrainPoints = [
    { pct: 0, altFt: 2450 },
    { pct: 15, altFt: 2800 },
    { pct: 30, altFt: 3600 }, // Crista montanhosa (Serra da Mantiqueira/Cantareira)
    { pct: 45, altFt: 2100 },
    { pct: 60, altFt: 1800 },
    { pct: 75, altFt: 1200 },
    { pct: 90, altFt: 400 },
    { pct: 100, altFt: 10 }
  ];

  // Constrói SVG path do relevo
  const svgWidth = 800;
  const svgHeight = 220;
  const maxAltScale = 45000; // FL450 topo

  const getX = (pct: number) => (pct / 100) * svgWidth;
  const getY = (altFt: number) => svgHeight - (altFt / maxAltScale) * (svgHeight - 30);

  // Perfil de voo em degraus (Subida inicial -> Cruzeiro -> Descida para aproximação)
  const flightProfilePoints = [
    { pct: 0, alt: 2450 },
    { pct: 5, alt: 10000 },
    { pct: 15, alt: 24000 },
    { pct: 25, alt: cruiseAltitudeFt },
    { pct: 75, alt: cruiseAltitudeFt },
    { pct: 88, alt: 15000 },
    { pct: 95, alt: 4000 },
    { pct: 100, alt: 10 }
  ];

  const profilePathStr = flightProfilePoints.reduce((acc, pt, idx) => {
    const x = getX(pt.pct);
    const y = getY(pt.alt);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const terrainPathStr = `
    M 0 ${svgHeight}
    ${terrainPoints.map(p => `L ${getX(p.pct)} ${getY(p.altFt)}`).join(' ')}
    L ${svgWidth} ${svgHeight} Z
  `;

  return (
    <div className="bg-[#070d19] border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Mountain className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Perfil Vertical de Rota & Altitudes de Segurança (Vertical Profile View)
          </h3>
        </div>
        <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
          <span>FL Cruzeiro: <strong className="text-sky-400">FL{cruiseAltitudeFt / 100}</strong></span>
          <span>Distância Total: <strong className="text-white">{analysis.totalDistanceKm} km</strong></span>
        </div>
      </div>

      {/* SVG Canvas do Perfil de Voo */}
      <div className="relative w-full h-[220px] bg-[#050812] rounded-lg border border-slate-800/60 overflow-hidden">
        {/* Linhas de Grade de Nível de Voo */}
        <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none text-[9px] font-mono text-slate-600">
          <div className="border-b border-slate-800/40 w-full flex justify-between">
            <span>FL400 (40.000 ft)</span>
          </div>
          <div className="border-b border-slate-800/40 w-full flex justify-between">
            <span>FL300 (30.000 ft)</span>
          </div>
          <div className="border-b border-slate-800/40 w-full flex justify-between">
            <span>FL200 (20.000 ft)</span>
          </div>
          <div className="border-b border-slate-800/40 w-full flex justify-between">
            <span>FL100 (10.000 ft)</span>
          </div>
          <div className="border-b border-slate-800/40 w-full flex justify-between">
            <span>SFC (Nível do Solo)</span>
          </div>
        </div>

        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full preserve-3d"
        >
          {/* Sombra de Terreno */}
          <path
            d={terrainPathStr}
            fill="url(#terrainGradient)"
            opacity="0.6"
          />

          {/* Gradiente do Terreno */}
          <defs>
            <linearGradient id="terrainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="flightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linha de Cruzeiro / Perfil da Aeronave */}
          <path
            d={profilePathStr}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Marcadores de Ocorrências no Trajeto Projetado */}
          {analysis.occurrences.map((occ, idx) => {
            // Distribuição horizontal estimada ao longo do voo
            const posPct = 10 + (idx * 28) % 80;
            const x = getX(posPct);
            const isAlert = occ.visualTag === 'RECENT_ALERT';
            const markerY = getY(isAlert ? 2200 : 2600);

            return (
              <g 
                key={occ.id} 
                className="cursor-pointer group"
                onClick={() => onSelectEvent && onSelectEvent(occ)}
              >
                {/* Linha de Projeção até o solo */}
                <line
                  x1={x}
                  y1={markerY}
                  x2={x}
                  y2={svgHeight}
                  stroke={isAlert ? '#ef4444' : '#94a3b8'}
                  strokeDasharray="2, 3"
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* Ponto de Incidente */}
                <circle
                  cx={x}
                  cy={markerY}
                  r="6"
                  fill={isAlert ? '#ef4444' : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Tooltip texto */}
                <text
                  x={x}
                  y={markerY - 10}
                  fill="#f1f5f9"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="font-bold"
                >
                  {occ.aircraft?.registration || 'ACFT'} (~{occ.distanceToRouteKm}km)
                </text>
              </g>
            );
          })}

          {/* Obstáculos / Perigos Verticais (Torres, Linhas de Transmissão) */}
          {analysis.hazards.map((haz, idx) => {
            const posPct = 20 + (idx * 35) % 70;
            const x = getX(posPct);
            const hazHeight = haz.heightAmslFt || 3200;
            const y = getY(hazHeight);

            return (
              <g key={haz.id}>
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={svgHeight}
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <polygon
                  points={`${x},${y - 8} ${x - 5},${y} ${x + 5},${y}`}
                  fill="#f59e0b"
                />
                <text
                  x={x}
                  y={y - 12}
                  fill="#fbbf24"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  OBS (~{haz.distanceToRouteKm}km)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Marcadores de Cabeceira */}
        <div className="absolute bottom-2 left-4 text-xs font-mono font-bold text-sky-400">
          ▲ {analysis.origin.code} (DEP)
        </div>
        <div className="absolute bottom-2 right-4 text-xs font-mono font-bold text-sky-400 text-right">
          ▼ {analysis.destination.code} (ARR)
        </div>
      </div>

      {/* Legenda de Alertas Verticais */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>Perfil de Voo</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-slate-500 rounded-sm"></span>
            <span>Elevação do Terreno</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Ocorrência Próxima</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-amber-500"></span>
            <span>Obstáculo Vertical</span>
          </span>
        </div>
        <span>Geometria Geodésica Karney WGS84</span>
      </div>
    </div>
  );
};

