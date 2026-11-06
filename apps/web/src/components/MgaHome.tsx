import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Compass, 
  Plane, 
  Layers, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface MgaHomeProps {
  onSearchRoute: (originIcao: string, destinationIcao: string, corridorKm: number) => void;
  onExploreModule: (moduleId?: string) => void;
}

interface DestinationCard {
  id: string;
  name: string;
  country: string;
  icao: string;
  description: string;
  rating: string;
  reviews: string;
  image: string;
  tag: string;
  riskScore: string;
  corridorStatus: string;
}

const DESTINATIONS: DestinationCard[] = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'França',
    icao: 'LFPG',
    description: 'Rotas transatlânticas, bacias montanhosas e monitoramento geodésico na aproximação.',
    rating: '4.9',
    reviews: '1,420 análises',
    image: '/images/paris.jpg',
    tag: 'Rotas IFR',
    riskScore: '99.4%',
    corridorStatus: 'Corredor Seguro'
  },
  {
    id: 'berlin',
    name: 'Berlim',
    country: 'Alemanha',
    icao: 'EDDB',
    description: 'Espaço aéreo central europeu com histórico consolidado e densidade de corredores.',
    rating: '4.8',
    reviews: '980 análises',
    image: '/images/berlin.jpg',
    tag: 'Rotas IFR',
    riskScore: '99.8%',
    corridorStatus: 'Alta Precisão'
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Austrália',
    icao: 'YSSY',
    description: 'Operações oceânicas, bacias costeiras e mitigação de risco orográfico.',
    rating: '5.0',
    reviews: '850 análises',
    image: '/images/sydney.jpg',
    tag: 'Oceânica',
    riskScore: '99.9%',
    corridorStatus: 'Certificado'
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canadá',
    icao: 'CYYZ',
    description: 'Corredores árticos, monitoramento de gelo severo e relevo dos Grandes Lagos.',
    rating: '4.9',
    reviews: '1,120 análises',
    image: '/images/toronto.jpg',
    tag: 'Rotas IFR',
    riskScore: '99.6%',
    corridorStatus: 'Corredor Seguro'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'Índia',
    icao: 'VABB',
    description: 'Alta densidade de tráfego aéreo e análise de microclima litorâneo e monções.',
    rating: '4.7',
    reviews: '740 análises',
    image: '/images/mumbai.jpg',
    tag: 'Rotas IFR',
    riskScore: '98.9%',
    corridorStatus: 'Vigilância Ativa'
  },
  {
    id: 'london',
    name: 'Londres',
    country: 'Reino Unido',
    icao: 'EGLL',
    description: 'Um dos espaços aéreos mais regulados do mundo com auditoria contínua AAIB.',
    rating: '4.9',
    reviews: '2,310 análises',
    image: '/images/london.jpg',
    tag: 'Hub Global',
    riskScore: '99.9%',
    corridorStatus: 'Padrão OACI'
  },
  {
    id: 'newyork',
    name: 'Nova York',
    country: 'Estados Unidos',
    icao: 'KJFK',
    description: 'Complexo terminal metropolitano com base histórica NTSB integrada ao MGA.',
    rating: '4.9',
    reviews: '3,100 análises',
    image: '/images/newyork.jpg',
    tag: 'Hub Global',
    riskScore: '99.7%',
    corridorStatus: 'NTSB Conectado'
  },
  {
    id: 'sanfrancisco',
    name: 'San Francisco',
    country: 'Estados Unidos',
    icao: 'KSFO',
    description: 'Topografia litorânea complexa, nevoeiro persistente e elevações costeiras.',
    rating: '4.8',
    reviews: '1,640 análises',
    image: '/images/sanfrancisco.jpg',
    tag: 'Relevo 3D',
    riskScore: '99.5%',
    corridorStatus: 'Terreno Mapeado'
  }
];

export const MgaHome: React.FC<MgaHomeProps> = ({
  onSearchRoute,
  onExploreModule
}) => {
  const [activeTab, setActiveTab] = useState<'flights' | 'routes' | 'intelligence'>('flights');
  const [origin, setOrigin] = useState('SBGR');
  const [destination, setDestination] = useState('SBRJ');
  const [departureDate, setDepartureDate] = useState('2026-11-07');
  const [corridorBuffer, setCorridorBuffer] = useState('40');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    onSearchRoute(origin.toUpperCase().trim(), destination.toUpperCase().trim(), parseInt(corridorBuffer) || 40);
  };

  const handleCardClick = (dest: DestinationCard) => {
    onSearchRoute(origin || 'SBGR', dest.icao, 40);
  };

  return (
    <div className="min-h-screen bg-[#dce0e6] text-[#0f141f] selection:bg-[#0f141f] selection:text-white pb-24">
      
      {/* 1. HERO SECTION COM AVIÃO EXECUTIVO EM NUVENS FOTORREALISTAS */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Fundo com nuvens suaves e iluminação etérea */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1400px] h-[750px] bg-gradient-to-b from-[#edf1f7] via-[#e2e7ee]/80 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-[30%] left-[10%] w-[500px] h-[300px] bg-white/60 rounded-full blur-3xl" />
          <div className="absolute top-[25%] right-[10%] w-[600px] h-[350px] bg-white/70 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Badge superior da aviação */}
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#697489] uppercase">
              • FLIGHT INTELLIGENCE •
            </span>
          </div>

          {/* Headline monumental estilo Genesis / LuxFly */}
          <div className="text-center max-w-4xl mx-auto mb-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#0f172a] leading-[1.08]">
              Fly Smarter,<br />
              <span className="text-[#1e293b]">Explore Further.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#57647a] max-w-xl mx-auto leading-relaxed font-normal">
              Eleve sua consciência situacional com inteligência geográfica, terreno 3D e memória histórica oficial antes de cada decolagem.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => onSearchRoute('SBGR', 'SBRJ', 40)}
                className="px-6 py-2.5 rounded-full bg-[#111625] hover:bg-[#1e2538] text-white text-xs font-semibold tracking-wide shadow-lg shadow-black/10 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
              >
                <span>Acessar Plataforma</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Imagem Hero do Jato Executivo Voando Sobre as Nuvens */}
          <div className="relative max-w-4xl mx-auto my-4 flex items-center justify-center">
            
            {/* Sombras e vapor atmosférico suave */}
            <div className="absolute bottom-6 w-3/4 h-16 bg-[#111625]/15 blur-2xl rounded-full" />
            
            {/* Foto Realista do Jato Executivo */}
            <div className="relative group w-full flex justify-center">
              <img 
                src="/images/hero_jet.png" 
                alt="Aeronave Executiva em Voo nas Nuvens"
                className="w-full max-h-[420px] object-contain drop-shadow-2xl select-none transition-transform duration-700 hover:scale-[1.01]"
              />

              {/* Tag Flutuante de Segurança Operacional */}
              <div className="absolute left-4 bottom-8 sm:bottom-12 bg-white/80 backdrop-blur-md border border-white/60 shadow-xl rounded-2xl p-3 flex items-center gap-3 max-w-xs transition-all hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#0f172a] leading-none mb-1">
                    CENIPA & NTSB
                  </div>
                  <div className="text-[10px] text-[#64748b] leading-tight">
                    Mais de 40 anos de investigações e dados geoespaciais integrados.
                  </div>
                </div>
              </div>

              {/* Tag Flutuante de Estatística Operacional */}
              <div className="absolute right-4 bottom-8 sm:bottom-12 bg-white/80 backdrop-blur-md border border-white/60 shadow-xl rounded-2xl p-3 flex items-center gap-3 transition-all hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff8800] to-[#e65100] text-white flex items-center justify-center shadow-md font-bold text-xs">
                  3D
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#0f172a] leading-none mb-1">
                    WebMapX & Terreno
                  </div>
                  <div className="text-[10px] text-[#64748b]">
                    Curvas de elevação e montanhas em tempo real
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Botão de Rolagem Suave Central estilo referência */}
          <div className="flex justify-center -mt-2 mb-10">
            <button 
              onClick={() => {
                const el = document.getElementById('search-booking-bar');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-10 h-10 rounded-full bg-[#111625] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
            >
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>

        </div>

      </section>

      {/* 2. SEÇÃO DE AGENDAMENTO / BUSCA DE ROTA ESTILO BOOKING LUXUOSO */}
      <section id="search-booking-bar" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#697489] uppercase">
              • FLIGHT BRIEFING •
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mt-1">
              Explore New Horizons,<br />
              <span className="text-[#334155]">One Destination at a Time.</span>
            </h2>
          </div>

          {/* Filtros em Pílula (Flights, Routes, Intelligence) */}
          <div className="inline-flex p-1 bg-white/70 backdrop-blur-md rounded-full border border-white/80 shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('flights')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'flights' 
                  ? 'bg-[#111625] text-white shadow-sm' 
                  : 'text-[#475569] hover:text-[#0f172a]'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Rotas & Voos</span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'routes' 
                  ? 'bg-[#111625] text-white shadow-sm' 
                  : 'text-[#475569] hover:text-[#0f172a]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Corredores Geodésicos</span>
            </button>

            <button
              onClick={() => setActiveTab('intelligence')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'intelligence' 
                  ? 'bg-[#111625] text-white shadow-sm' 
                  : 'text-[#475569] hover:text-[#0f172a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Relevo & Terreno 3D</span>
            </button>
          </div>
        </div>

        {/* BARRA DE PESQUISA ELEGANTE EM PÍLULA (IGUAL À REFERÊNCIA) */}
        <form 
          onSubmit={handleSearch}
          className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl sm:rounded-full p-2.5 sm:p-3 shadow-xl shadow-slate-400/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-center"
        >
          {/* Origem */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-slate-100/70 transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#475569] flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#ff8800]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-[#64748b] tracking-wider">Origem</span>
              <input 
                type="text" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                placeholder="Ex: SBGR"
                className="w-full bg-transparent font-bold text-[#0f172a] text-sm focus:outline-none placeholder:text-slate-400 uppercase"
              />
            </div>
          </div>

          {/* Destino */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-slate-100/70 transition-colors border-t sm:border-t-0 sm:border-l border-slate-200/60">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#475569] flex-shrink-0">
              <Plane className="w-4 h-4 text-[#0ea5e9]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-[#64748b] tracking-wider">Destino</span>
              <input 
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                placeholder="Ex: SBRJ"
                className="w-full bg-transparent font-bold text-[#0f172a] text-sm focus:outline-none placeholder:text-slate-400 uppercase"
              />
            </div>
          </div>

          {/* Data do Voo */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-slate-100/70 transition-colors border-t lg:border-t-0 lg:border-l border-slate-200/60">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#475569] flex-shrink-0">
              <Calendar className="w-4 h-4 text-[#64748b]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-[#64748b] tracking-wider">Data do Voo</span>
              <input 
                type="date" 
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-transparent font-medium text-[#0f172a] text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Buffer do Corredor Geodésico */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-slate-100/70 transition-colors border-t sm:border-t-0 sm:border-l border-slate-200/60">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#475569] flex-shrink-0">
              <Users className="w-4 h-4 text-[#64748b]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] uppercase font-bold text-[#64748b] tracking-wider">Largura do Corredor</span>
              <select 
                value={corridorBuffer}
                onChange={(e) => setCorridorBuffer(e.target.value)}
                className="w-full bg-transparent font-bold text-[#0f172a] text-xs focus:outline-none cursor-pointer"
              >
                <option value="20">± 20 km (Tático Estrito)</option>
                <option value="40">± 40 km (Padrão IFR)</option>
                <option value="60">± 60 km (Área Ampla)</option>
              </select>
            </div>
          </div>

          {/* Botão de Ação Preto Arredondado */}
          <div className="p-1">
            <button
              type="submit"
              className="w-full h-12 rounded-full bg-[#111625] hover:bg-[#1f2842] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-black/15 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>GERAR MAPA & BRIEFING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </section>

      {/* 3. GRID DE DESTINOS / CARDS FOTORREALISTAS (EXATAMENTE COMO A REFERÊNCIA) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0f172a]">
              Destinos & Corredores Monitorados
            </h3>
            <p className="text-xs text-[#64748b] mt-1">
              Rotas pré-mapeadas com curvas de relevo, aeródromos de alternativa e base histórica.
            </p>
          </div>

          <button 
            onClick={() => onExploreModule('memory')}
            className="text-xs font-bold text-[#0f172a] hover:text-[#ff8800] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Ver todos os 25.000 aeródromos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid de 8 Cards estilo Pinterest / Editorial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleCardClick(dest)}
              className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between p-5"
            >
              {/* Imagem de Fundo em Alta Definição */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradiente escuro para legibilidade perfeita do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:via-black/40 transition-colors" />
              </div>

              {/* Tag Superior Esquerda (Flights / IFR) */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold tracking-wide border border-white/20">
                  <Plane className="w-3 h-3" />
                  <span>{dest.tag}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-amber-400 font-mono text-[10px] font-bold border border-white/10">
                  {dest.icao}
                </span>
              </div>

              {/* Informações Inferiores do Card */}
              <div className="relative z-10 text-white">
                
                {/* Avaliação em estrelas */}
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-white/80 ml-1 font-medium">{dest.rating}</span>
                </div>

                {/* Título: Cidade, País */}
                <h4 className="text-lg font-bold tracking-tight text-white leading-snug group-hover:text-amber-300 transition-colors">
                  {dest.name}, {dest.country}
                </h4>

                {/* Descrição resumida */}
                <p className="text-[11px] text-white/75 mt-1 line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>

                {/* Status do Corredor no Rodapé do Card */}
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {dest.corridorStatus}
                  </span>
                  <span className="text-white/60 font-mono">
                    Precisão {dest.riskScore}
                  </span>
                </div>

              </div>

            </div>
          ))}
        </div>

      </section>

      {/* 4. SEÇÃO DE ESTATÍSTICAS OFICIAIS (BARRA INFERIOR IGUAL À REFERÊNCIA) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 p-8 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              50,000+
            </div>
            <div className="text-xs text-[#64748b] mt-1 font-medium">
              Horas de Voo Monitoradas
            </div>
          </div>

          <div className="border-l border-slate-200">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight flex items-center justify-center gap-1">
              <span>4.9</span>
              <span className="text-base text-[#64748b] font-normal">/5</span>
            </div>
            <div className="text-xs text-[#64748b] mt-1 font-medium">
              Índice de Consciência Situacional
            </div>
          </div>

          <div className="border-l border-slate-200">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              1,200+
            </div>
            <div className="text-xs text-[#64748b] mt-1 font-medium">
              Corredores e Rotas Pré-Mapeadas
            </div>
          </div>

          <div className="border-l border-slate-200">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              40+ Anos
            </div>
            <div className="text-xs text-[#64748b] mt-1 font-medium">
              Memória Histórica (CENIPA / NTSB)
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
