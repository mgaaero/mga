import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  Layers, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { AIRPORTS_DATABASE } from '@mega/shared';

interface MgaHomeProps {
  onSearchRoute: (originIcao: string, destinationIcao: string, corridorKm: number) => void;
  onExploreModule: (moduleId: string) => void;
}

export const MgaHome: React.FC<MgaHomeProps> = ({
  onSearchRoute,
  onExploreModule
}) => {
  const [origin, setOrigin] = useState('SBGR');
  const [destination, setDestination] = useState('SBRJ');
  const [corridorKm, setCorridorKm] = useState(60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    onSearchRoute(origin.toUpperCase().trim(), destination.toUpperCase().trim(), corridorKm);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#070b11] text-slate-200">
      
      {/* Aviso Obrigatório de Segurança Operacional & Limitações */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center space-x-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>
          <strong>AVISO DE CONSCIÊNCIA SITUACIONAL:</strong> A MGA é uma plataforma de inteligência histórica e geográfica. 
          Não substitui o planejamento operacional de voo, NOTAMs vigentes ou publicações certificadas (DECEA/FAA/ICAO).
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MGA AVIATION INTELLIGENCE — COBERTURA GLOBAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Antes do próximo voo,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400">
              conheça o território.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Inteligência geográfica, histórico de ocorrências e mapeamento de obstáculos verticais 
            conectados diretamente ao corredor geodésico da sua rota.
          </p>
        </div>

        {/* Card Principal de Pesquisa de Rota (Flight Planning Style) */}
        <div className="bg-[#0e1420] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Origem */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Origem (Aeródromo / ICAO)</span>
                  <span className="text-amber-400 text-[10px]">Ex: SBGR, SBSP, KJFK</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                    placeholder="SBGR"
                    maxLength={4}
                    className="w-full bg-[#141b29] border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 uppercase transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Guarulhos, São Paulo — Brasil</p>
              </div>

              {/* Destino */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                  <span>Destino (Aeródromo / ICAO)</span>
                  <span className="text-amber-400 text-[10px]">Ex: SBRJ, SBKP, EGLL</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Compass className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    placeholder="SBRJ"
                    maxLength={4}
                    className="w-full bg-[#141b29] border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono font-bold tracking-widest focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 uppercase transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Santos Dumont, Rio de Janeiro — Brasil</p>
              </div>

            </div>

            {/* Largura do Corredor Geográfico */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Corredor de Análise Lateral (WGS84 Cross-Track)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[40, 60, 100].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setCorridorKm(km)}
                    className={`py-2.5 px-4 rounded-lg font-mono text-xs font-semibold border transition-all ${
                      corridorKm === km
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                        : 'bg-[#141b29] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {km} km {km === 60 && <span className="text-[10px] text-slate-500">(Padrão)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão de Submissão Principal */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold tracking-wider rounded-lg shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-2 transition-all font-mono text-sm"
              >
                <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>PESQUISAR ROTA (MGA INTELLIGENCE)</span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </button>
            </div>

          </form>

          {/* Atalhos Rápidos */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <span className="font-mono text-[11px] text-slate-500">Rotas frequentes para homologação:</span>
            <div className="flex flex-wrap gap-2">
              <button 
                type="button"
                onClick={() => { setOrigin('SBGR'); setDestination('SBRJ'); }}
                className="px-2.5 py-1 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700/60 transition-colors"
              >
                Ponte Aérea (SBGR → SBRJ)
              </button>
              <button 
                type="button"
                onClick={() => { setOrigin('SBSP'); setDestination('SBKP'); }}
                className="px-2.5 py-1 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700/60 transition-colors"
              >
                Terminal SP (SBSP → SBKP)
              </button>
              <button 
                type="button"
                onClick={() => { setOrigin('SBGR'); setDestination('KJFK'); }}
                className="px-2.5 py-1 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700/60 transition-colors"
              >
                Transpolar / Long-haul (SBGR → KJFK)
              </button>
            </div>
          </div>

        </div>

        {/* Três Frentes de Atuação (Pilotos, Inteligência e Empresas) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card Pilotos */}
          <div className="bg-[#0c1018] border border-slate-800/90 rounded-xl p-6 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Para Pilotos & Tripulantes</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Consulte a história geográfica da sua rota antes da decolagem. Identifique ocorrências históricas e obstáculos verticais em qualquer trecho.
            </p>
            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cálculo geodésico WGS84 Karney</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Memória de acidentes e incidentes</span>
              </div>
            </div>
          </div>

          {/* Card Inteligência */}
          <div className="bg-[#0c1018] border border-slate-800/90 rounded-xl p-6 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Inteligência & Segurança (TEM)</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Fatores contribuintes documentados, relatórios oficiais de investigação do CENIPA e NTSB unificados sem duplicação de dados.
            </p>
            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deduplicação canônica ANAC × CENIPA</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Classificação visual (⚪ Memória vs 🔴 Alerta)</span>
              </div>
            </div>
          </div>

          {/* Card B2B */}
          <div className="bg-[#0c1018] border border-slate-800/90 rounded-xl p-6 hover:border-slate-700 transition-all relative overflow-hidden">
            <span className="absolute top-3 right-3 text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Solução B2B
            </span>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Aeroportos & Concessionárias</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Monitoramento do entorno do aeródromo, superfícies limitadoras de obstáculos (OLS) e relatórios executivos para gestão de risco aeroportuário.
            </p>
            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auditoria e histórico de obstáculos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dossiês e relatórios executivos</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

