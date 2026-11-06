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
  Server,
  ArrowLeft
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
import { MgaNavbar, MgaModuleId } from './components/MgaNavbar';
import { MgaHome } from './components/MgaHome';
import { MgaMemoryView } from './components/MgaMemoryView';
import { MgaHazardsView } from './components/MgaHazardsView';
import { MgaMapControls, MapLayerConfig } from './components/MgaMapControls';
import { SupabaseRouteService } from './services/supabase-route-service';
import { Airport } from '@mega/types';

export default function App() {
  const [activeModule, setActiveModule] = useState<MgaModuleId>('home');
  const [origin, setOrigin] = useState('SBGR');
  const [destination, setDestination] = useState('SBRJ');
  const [operationType, setOperationType] = useState('COMMERCIAL_SCHEDULED');
  const [corridorBuffer, setCorridorBuffer] = useState(60); // km
  const [activeTab, setActiveTab] = useState<'map' | 'occurrences' | 'hazards' | 'profile' | 'ai' | 'report'>('map');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(HISTORICAL_OCCURRENCES_SEED[0]);
  const [selectedHazard, setSelectedHazard] = useState<HazardObstacle | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Configuração das camadas táticas do MGA Map
  const [mapConfig, setMapConfig] = useState<MapLayerConfig>({
    showTerrain: false,
    showAirports: true,
    showOccurrences: true,
    showHazards: true,
    showCorridor: true,
    filterRecentOnly: false
  });

  // Estados de consulta real remota ao Supabase
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [liveOccurrences, setLiveOccurrences] = useState<Occurrence[]>([]);
  const [liveHazards, setLiveHazards] = useState<HazardObstacle[]>([]);
  const [liveOriginAirport, setLiveOriginAirport] = useState<Airport | null>(null);
  const [liveDestAirport, setLiveDestAirport] = useState<Airport | null>(null);

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

  // Aeroportos resolvidos (Prioridade Remota do Supabase, Fallback identificado)
  const originAirport: Airport = useMemo(() => {
    if (liveOriginAirport) return liveOriginAirport;
    return AIRPORTS_DATABASE.find(a => a.icao === origin || a.iata === origin) || AIRPORTS_DATABASE[0];
  }, [liveOriginAirport, origin]);

  const destAirport: Airport = useMemo(() => {
    if (liveDestAirport) return liveDestAirport;
    return AIRPORTS_DATABASE.find(a => a.icao === destination || a.iata === destination) || AIRPORTS_DATABASE[5];
  }, [liveDestAirport, destination]);

  // Executa busca remota assíncrona ao mudar origem/destino ou corridor
  const executeRemoteRouteSearch = async (origCode: string, destCode: string, corridor: number) => {
    setIsSearchingRemote(true);
    setRemoteError(null);

    try {
      // 1. Resolução dos aeródromos no Supabase remoto
      const [remoteOrig, remoteDest] = await Promise.all([
        SupabaseRouteService.fetchAirport(origCode),
        SupabaseRouteService.fetchAirport(destCode)
      ]);

      if (!remoteOrig || !remoteDest) {
        setRemoteError(`Aeródromo não localizado no Supabase: ${!remoteOrig ? origCode : destCode}. Verifique o código ICAO.`);
        setIsLiveSupabase(false);
        setIsSearchingRemote(false);
        return;
      }

      setLiveOriginAirport(remoteOrig);
      setLiveDestAirport(remoteDest);

      // 2. Executa a RPC PostGIS no Supabase e busca obstáculos reais
      const [results, remoteHazards] = await Promise.all([
        SupabaseRouteService.searchRouteMemory(
          remoteOrig.latitude,
          remoteOrig.longitude,
          remoteDest.latitude,
          remoteDest.longitude,
          corridor
        ),
        SupabaseRouteService.fetchHazards()
      ]);

      setLiveOccurrences(results);
      if (remoteHazards.length > 0) {
        setLiveHazards(remoteHazards);
      }
      setIsLiveSupabase(true);
    } catch (err: any) {
      console.warn('Falha na consulta remota do Supabase:', err);
      setRemoteError('Conexão ao Supabase indisponível ou erro na RPC PostGIS. Dados reais não carregados.');
      setIsLiveSupabase(false);
    } finally {
      setIsSearchingRemote(false);
    }
  };

  // Análise via RouteIntelligenceService com motor elipsoidal WGS84 Karney
  const routeAnalysis: RouteIntelligenceAnalysis = useMemo(() => {
    const baseAirports = [originAirport, destAirport];
    const occurrencesToUse = isLiveSupabase ? liveOccurrences : HISTORICAL_OCCURRENCES_SEED;
    const hazardsToUse = isLiveSupabase && liveHazards.length > 0 ? liveHazards : HAZARDS_SEED;

    try {
      return RouteIntelligenceService.analyzeRoute(
        {
          originCode: originAirport.icao || originAirport.ident,
          destCode: destAirport.icao || destAirport.ident,
          corridorWidthKm: corridorBuffer,
          operationType
        },
        baseAirports,
        occurrencesToUse,
        hazardsToUse
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
  }, [originAirport, destAirport, corridorBuffer, operationType, isLiveSupabase, liveOccurrences]);

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

  const handleSearchFromHome = (orig: string, dest: string, corridor: number) => {
    setOrigin(orig);
    setDestination(dest);
    setCorridorBuffer(corridor);
    setActiveModule('routes');
    setActiveTab('map');
    // Dispara a consulta assíncrona real ao Supabase
    executeRemoteRouteSearch(orig, dest, corridor);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100">
      {/* Barra de Navegação Oficial com os 10 Módulos */}
      <MgaNavbar 
        activeModule={activeModule}
        onSelectModule={(id) => {
          setActiveModule(id);
          if (id === 'map') setActiveTab('map');
          if (id === 'routes') setActiveTab('map');
          if (id === 'occurrences') setActiveTab('occurrences');
          if (id === 'hazards') setActiveTab('hazards');
          if (id === 'intelligence') setActiveTab('ai');
          if (id === 'reports') setActiveTab('report');
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Renderização Condicional: MGA Home vs Console Tático */}
      {activeModule === 'home' ? (
        <MgaHome 
          onSearchRoute={handleSearchFromHome}
          onExploreModule={(modId) => setActiveModule(modId as MgaModuleId)}
        />
      ) : (
        /* Main Container Tático */
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Painel Lateral de Consulta (Formulário + Ficha de Ocorrência) */}
          <aside className="w-full lg:w-[480px] shrink-0 border-r border-slate-800 bg-[#080d1a] flex flex-col h-auto lg:h-[calc(100vh-56px)] overflow-y-auto">
            {/* Caixa de Pesquisa Pré-Voo */}
            <div className="p-5 border-b border-slate-800/80 bg-slate-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setActiveModule('home')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Voltar para a Home"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>02. MGA Routes</span>
                  </h2>
                </div>
                <span className="text-xs text-amber-400 font-mono font-semibold">{totalRouteDistKm} km</span>
              </div>

            {/* Status da Fonte em Tempo Real: Supabase vs Fallback */}
            <div className="mb-3 px-3 py-1.5 rounded text-xs font-mono flex items-center justify-between border transition-all">
              {isSearchingRemote ? (
                <div className="flex items-center space-x-2 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>CONSULTANDO SUPABASE REMOTO...</span>
                </div>
              ) : isLiveSupabase ? (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>FONTE: SUPABASE POSTGIS (DADOS REAIS)</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>MODO LOCAL (DEMONSTRAÇÃO OFFLINE)</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => executeRemoteRouteSearch(origin, destination, corridorBuffer)}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold ml-2"
              >
                Recarregar Supabase
              </button>
            </div>

            {/* Aviso de Erro Remoto */}
            {remoteError && (
              <div className="mb-3 px-3 py-2 rounded bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{remoteError}</span>
              </div>
            )}

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
                {/* Controles Táticos de Camadas do MGA Map */}
                <MgaMapControls
                  config={mapConfig}
                  onChangeConfig={setMapConfig}
                  occurrencesCount={routeOccurrences.length}
                  hazardsCount={liveHazards.length}
                />

                <InteractiveFlightMap
                  origin={originAirport}
                  destination={destAirport}
                  corridorBufferKm={corridorBuffer}
                  occurrences={mapConfig.showOccurrences ? routeOccurrences : []}
                  hazards={mapConfig.showHazards ? (liveHazards.length > 0 ? liveHazards : HAZARDS_SEED) : []}
                  selectedOccurrence={selectedOccurrence}
                  onSelectOccurrence={setSelectedOccurrence}
                  showCorridor={mapConfig.showCorridor}
                />
              </div>
            )}

            {/* Visualização de MGA Memory & Occurrences */}
            {activeTab === 'occurrences' && (
              <MgaMemoryView
                occurrences={routeOccurrences.length > 0 ? routeOccurrences : HISTORICAL_OCCURRENCES_SEED}
                selectedOccurrence={selectedOccurrence}
                onSelectOccurrence={setSelectedOccurrence}
              />
            )}

            {/* Módulo 06: MGA Hazards — Obstáculos e Perigos Físicos */}
            {activeTab === 'hazards' && (
              <MgaHazardsView
                hazards={liveHazards.length > 0 ? liveHazards : HAZARDS_SEED}
                selectedHazard={selectedHazard}
                onSelectHazard={setSelectedHazard}
              />
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
      )}

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

