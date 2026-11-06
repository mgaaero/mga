import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Compass, 
  MapPin, 
  Plane, 
  AlertTriangle, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  Info,
  Calendar,
  Layers,
  Radio,
  Search,
  Server
} from 'lucide-react';
import { Occurrence, HazardObstacle, VisualClassification } from '@mega/types';
import { HISTORICAL_OCCURRENCES_SEED, HAZARDS_SEED, AIRPORTS_DATABASE } from '@mega/shared';
import { calculateGreatCircleDistanceKm, calculateCrossTrackDistanceKm } from '@mega/geospatial';
import { RouteIntelligenceService, RouteIntelligenceAnalysis } from '@mega/shared';
import { InteractiveFlightMap } from './components/InteractiveFlightMap';
import { AdminDashboardModal, AdminTelemetryData } from './components/AdminDashboardModal';
import { PreflightBriefingReport } from './components/PreflightBriefingReport';
import { FlightProfileView } from './components/FlightProfileView';
import { IntelligenceAiBriefing } from './components/IntelligenceAiBriefing';

export default function App() {
  const [origin, setOrigin] = useState('SBGR');
  const [destination, setDestination] = useState('KJFK');
  const [operationType, setOperationType] = useState('COMMERCIAL_SCHEDULED');
  const [corridorBuffer, setCorridorBuffer] = useState(60); // km
  const [activeTab, setActiveTab] = useState<'map' | 'occurrences' | 'hazards' | 'profile' | 'ai' | 'report'>('map');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(HISTORICAL_OCCURRENCES_SEED[0]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Telemetria administrativa inicial
  const [telemetry, setTelemetry] = useState<AdminTelemetryData>({
    totalOccurrences: HISTORICAL_OCCURRENCES_SEED.length,
    totalHazards: HAZARDS_SEED.length,
    totalAirports: AIRPORTS_DATABASE.length,
    recentAlerts: HISTORICAL_OCCURRENCES_SEED.filter(o => o.visualTag === 'RECENT_ALERT').length,
    historicalMemories: HISTORICAL_OCCURRENCES_SEED.filter(o => o.visualTag === 'HISTORICAL_MEMORY').length,
    activeHazards: HAZARDS_SEED.filter(h => h.status === 'ACTIVE_EXISTING').length,
    mitigatedHazards: HAZARDS_SEED.filter(h => h.status === 'REMOVED_DEMOLISHED').length,
    syncJobs: [
      {
        sourceSlug: 'anac',
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        finishedAt: new Date(Date.now() - 3590000).toISOString(),
        status: 'COMPLETED',
        recordsProcessed: 1420,
        recordsInserted: 1412,
        recordsUpdated: 8,
        errors: []
      },
      {
        sourceSlug: 'cenipa',
        startedAt: new Date(Date.now() - 7200000).toISOString(),
        finishedAt: new Date(Date.now() - 7180000).toISOString(),
        status: 'COMPLETED',
        recordsProcessed: 3105,
        recordsInserted: 3105,
        recordsUpdated: 0,
        errors: []
      }
    ]
  });

  const handleTriggerSync = (source: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setTelemetry(prev => ({
        ...prev,
        syncJobs: [
          {
            sourceSlug: source,
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
            status: 'COMPLETED',
            recordsProcessed: 42,
            recordsInserted: 2,
            recordsUpdated: 40,
            errors: []
          },
          ...prev.syncJobs
        ]
      }));
    }, 1200);
  };

  // Encontra dados de aeroportos selecionados
  const originAirport = useMemo(() => 
    AIRPORTS_DATABASE.find(a => a.icao === origin || a.iata === origin) || AIRPORTS_DATABASE[0],
    [origin]
  );

  const destAirport = useMemo(() => 
    AIRPORTS_DATABASE.find(a => a.icao === destination || a.iata === destination) || AIRPORTS_DATABASE[5],
    [destination]
  );

  // Análise via RouteIntelligenceService com motor elipsoidal WGS84 Karney
  const routeAnalysis: RouteIntelligenceAnalysis = useMemo(() => {
    try {
      return RouteIntelligenceService.analyzeRoute(
        {
          originCode: origin,
          destCode: destination,
          corridorWidthKm: corridorBuffer,
          operationType
        },
        AIRPORTS_DATABASE,
        HISTORICAL_OCCURRENCES_SEED,
        HAZARDS_SEED
      );
    } catch {
      return RouteIntelligenceService.analyzeRoute(
        {
          originCode: 'SBGR',
          destCode: 'KJFK',
          corridorWidthKm: corridorBuffer
        },
        AIRPORTS_DATABASE,
        HISTORICAL_OCCURRENCES_SEED,
        HAZARDS_SEED
      );
    }
  }, [origin, destination, corridorBuffer, operationType]);

  const routeOccurrences = routeAnalysis.occurrences;
  const totalRouteDistKm = routeAnalysis.totalDistanceKm;

  // Tags visuais e cores
  const getVisualBadge = (tag: VisualClassification) => {
    switch (tag) {
      case 'RECENT_ALERT':
        return {
          label: 'Alerta Recente',
          bg: 'bg-red-500/20 text-red-400 border-red-500/40',
          dot: 'bg-red-500',
          desc: 'Ocorrência recente / perigo em validação ativa'
        };
      case 'IDENTIFIED_HAZARD':
        return {
          label: 'Perigo Identificado',
          bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          dot: 'bg-orange-500',
          desc: 'Obstáculo ou risco que requer atenção operacional'
        };
      case 'HISTORICAL_MEMORY':
        return {
          label: 'Memória Histórica',
          bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          dot: 'bg-slate-400',
          desc: 'Memória preservada com dados e relatórios oficiais'
        };
      case 'MITIGATED_REMOVED':
        return {
          label: 'Mitigado / Removido',
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          dot: 'bg-emerald-500',
          desc: 'Perigo documentalmente removido ou controlado'
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-[#070b14]/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black text-xl tracking-wider">
            M
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-wide text-white">MGA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                AVIATION INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Memória Geográfica da Aviação — História · Geografia · Prevenção
            </p>
          </div>
        </div>

        {/* Disclaimer Operacional */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Não substitui NOTAM, cartas oficiais nem planejamento de despacho aeronáutico.</span>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Painel Administrativo & Fontes</span>
          </button>
          <button className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 transition">
            Acesso Piloto
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Painel Lateral de Consulta (Formulário + Ficha de Ocorrência) */}
        <aside className="w-full lg:w-[480px] shrink-0 border-r border-slate-800 bg-[#080d1a] flex flex-col h-auto lg:h-[calc(100vh-73px)] overflow-y-auto">
          {/* Caixa de Pesquisa Pré-Voo */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Consulta Pré-Voo de Rota</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">{totalRouteDistKm} km</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Origem (ICAO/IATA)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
                    placeholder="SBGR"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">GRU</span>
                </div>
                <span className="text-[11px] text-slate-400 truncate block mt-0.5">{originAirport.name}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Destino (ICAO/IATA)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
                    placeholder="KJFK"
                  />
                  <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono">JFK</span>
                </div>
                <span className="text-[11px] text-slate-400 truncate block mt-0.5">{destAirport.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Tipo de Operação</label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="COMMERCIAL_SCHEDULED">Aviação Comercial Regular</option>
                  <option value="GENERAL_AVIATION">Aviação Geral Privada</option>
                  <option value="AIR_TAXI">Táxi Aéreo</option>
                  <option value="HELICOPTER">Helicóptero</option>
                  <option value="CARGO">Transporte de Carga</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Corredor de Análise</label>
                <select
                  value={corridorBuffer}
                  onChange={(e) => setCorridorBuffer(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={20}>± 20 km (Aproximação)</option>
                  <option value={40}>± 40 km (Padrão Rota)</option>
                  <option value={60}>± 60 km (Amplo)</option>
                  <option value={100}>± 100 km (Regional)</option>
                </select>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-md text-xs shadow-md shadow-sky-900/30 flex items-center justify-center space-x-2 transition">
              <Search className="w-4 h-4" />
              <span>Consultar Memória da Rota</span>
            </button>
          </div>

          {/* Legenda Visual MGA */}
          <div className="px-5 py-3 border-b border-slate-800 bg-[#090f1f] text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Classificação Visual de Estado
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center space-x-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>🔴 Recente / Alerta</span>
              </div>
              <div className="flex items-center space-x-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>🟠 Perigo Ativo</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>⚪ Memória Histórica</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>🟢 Mitigado / Removido</span>
              </div>
            </div>
          </div>

          {/* Detalhe da Ocorrência Selecionada (Ficha Completa) */}
          {selectedOccurrence ? (
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getVisualBadge(selectedOccurrence.visualTag).bg}`}>
                      {getVisualBadge(selectedOccurrence.visualTag).label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedOccurrence.source.recordIdentifier}</span>
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {selectedOccurrence.aircraft?.model || 'Aeronave não especificada'}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-sky-400 font-mono mt-0.5">
                    <span>Matrícula: {selectedOccurrence.aircraft?.registration || 'N/A'}</span>
                    {selectedOccurrence.aircraft?.manufacturer && (
                      <span className="text-slate-500">• {selectedOccurrence.aircraft.manufacturer}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Data & Hora</span>
                  <span className="font-mono text-slate-200">{selectedOccurrence.date} {selectedOccurrence.time || ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Localidade</span>
                  <span className="text-slate-200 truncate block">{selectedOccurrence.location.city}, {selectedOccurrence.location.state || selectedOccurrence.location.countryIso}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Operador</span>
                  <span className="text-slate-200 truncate block">{selectedOccurrence.operatorName || 'Não registrado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fatalidades</span>
                  <span className="font-mono text-red-400 font-bold">{selectedOccurrence.fatalities}</span>
                </div>
              </div>

              {/* Pessoas Públicas Envolvidas */}
              {selectedOccurrence.peopleInvolved && selectedOccurrence.peopleInvolved.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                    Pessoas Documentadas em Registro Oficial
                  </span>
                  {selectedOccurrence.peopleInvolved.map((p, idx) => (
                    <div key={idx} className="mt-1">
                      <span className="font-semibold text-slate-100">{p.fullName}</span>
                      {p.publicSignificance && <span className="text-slate-400"> ({p.publicSignificance})</span>}
                      <span className="text-[10px] block text-slate-500">Função: {p.role} • Fonte: {p.sourceReference}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Resumo e Circunstâncias */}
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Circunstâncias Documentadas</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                  {selectedOccurrence.summary}
                </p>
              </div>

              {/* Apontamentos da Investigação */}
              {selectedOccurrence.investigationFindings && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Conclusão da Investigação</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    {selectedOccurrence.investigationFindings}
                  </p>
                </div>
              )}

              {/* Fonte Oficial & Auditoria */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fonte de Dados</span>
                  <span className="font-semibold text-slate-200">{selectedOccurrence.source.officialAgency}</span>
                  <span className="block text-[11px] text-slate-400">{selectedOccurrence.source.name}</span>
                </div>
                {selectedOccurrence.source.reportUrl && (
                  <a
                    href={selectedOccurrence.source.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 flex items-center space-x-1 transition"
                  >
                    <span className="text-[11px]">Relatório</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Selecione uma ocorrência na lista ou no mapa para inspecionar a ficha documental completa.
            </div>
          )}
        </aside>

        {/* Área Central: Mapa Mundial & Relatório Pré-Voo */}
        <section className="flex-1 flex flex-col h-[calc(100vh-73px)] overflow-hidden bg-[#070b14]">
          {/* Navegação de Abas do Resultado */}
          <div className="border-b border-slate-800 bg-[#090f1e] px-6 py-2.5 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'map' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Mapa da Memória
              </button>
              <button
                onClick={() => setActiveTab('occurrences')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'occurrences' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Histórico de Ocorrências ({routeOccurrences.length})
              </button>
              <button
                onClick={() => setActiveTab('hazards')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'hazards' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Perigos & Obstáculos ({HAZARDS_SEED.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'profile' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                4. Perfil Vertical (FL Profile)
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                5. MGA Intelligence (TEM)
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'report' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                6. Relatório Pré-Voo
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
              <span>Corredor: ±{corridorBuffer} km</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>PostGIS Engine Ativo</span>
            </div>
          </div>

          {/* Conteúdo da Aba */}
          <div className="flex-1 relative overflow-y-auto">
            {activeTab === 'map' && (
              <div className="w-full h-full relative">
                <InteractiveFlightMap
                  origin={originAirport}
                  destination={destAirport}
                  corridorBufferKm={corridorBuffer}
                  occurrences={routeOccurrences}
                  hazards={HAZARDS_SEED}
                  selectedOccurrence={selectedOccurrence}
                  onSelectOccurrence={setSelectedOccurrence}
                  showCorridor={true}
                />
              </div>
            )}

            {activeTab === 'occurrences' && (
              <div className="p-6 max-w-5xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">Ocorrências Históricas no Corredor</h3>
                    <p className="text-xs text-slate-400">
                      Registros oficiais georreferenciados próximos à rota planejada.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-sky-400 bg-sky-950 px-3 py-1 rounded-md border border-sky-800">
                    {routeOccurrences.length} ocorrências catalogadas
                  </span>
                </div>

                <div className="space-y-3">
                  {routeOccurrences.map((occ: Occurrence & { distanceToRouteKm?: number }) => {
                    const badge = getVisualBadge(occ.visualTag);
                    return (
                      <div
                        key={occ.id}
                        onClick={() => setSelectedOccurrence(occ)}
                        className="cursor-pointer p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                                {badge.label}
                              </span>
                              <span className="text-xs font-mono text-slate-400">{occ.date}</span>
                              <span className="text-xs font-mono text-slate-500">• {occ.source.officialAgency}</span>
                            </div>
                            <h4 className="font-bold text-base text-white">
                              {occ.aircraft?.model} — Matrícula: {occ.aircraft?.registration}
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                              {occ.summary}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-sky-400 font-semibold block">
                              ~{occ.distanceToRouteKm} km da rota
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {occ.location.city}, {occ.location.countryIso}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'hazards' && (
              <div className="p-6 max-w-5xl space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">Obstáculos e Perigos Ativos</h3>
                    <p className="text-xs text-slate-400">
                      Linhas de transmissão, torres, antenas e obstáculos do território.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-orange-400 bg-orange-950 px-3 py-1 rounded-md border border-orange-800">
                    {HAZARDS_SEED.length} perigos mapeados
                  </span>
                </div>

                <div className="space-y-3">
                  {HAZARDS_SEED.map(haz => (
                    <div key={haz.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-orange-500/20 text-orange-400 border-orange-500/40">
                              {haz.type}
                            </span>
                            <span className="text-xs font-mono text-slate-400">Verificado em: {haz.verifiedAt}</span>
                          </div>
                          <h4 className="font-bold text-sm text-white">{haz.description}</h4>
                          <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2 font-mono">
                            {haz.heightAglFt && <span>Altura Solo: {haz.heightAglFt} ft AGL</span>}
                            {haz.heightAmslFt && <span>Altitude: {haz.heightAmslFt} ft AMSL</span>}
                            <span>Fonte: {haz.sourceAgency}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Lat: {haz.coordinates.latitude.toFixed(4)}, Lon: {haz.coordinates.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'report' && (
              <PreflightBriefingReport
                analysis={routeAnalysis}
                onPrint={() => window.print()}
              />
            )}
          </div>
        </section>
      </main>
      {/* Modal Administrativo de Inteligência de Dados */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        telemetry={telemetry}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}

