import React, { useState } from 'react';
import { 
  Plane, 
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
  Maximize2
} from 'lucide-react';
import { InteractiveFlightMap } from './InteractiveFlightMap';
import { Occurrence, HazardObstacle } from '@mega/types';

export interface TacticalFlightItem {
  id: string;
  flightNumber: string;
  airline: string;
  airlineLogoColor: string;
  airlineCode: string;
  aircraftModel: string;
  registration: string;
  originIcao: string;
  originCity: string;
  originUtc: string;
  destIcao: string;
  destCity: string;
  destUtc: string;
  scheduledDep: string;
  actualDep: string;
  scheduledArr: string;
  estimatedArr: string;
  distanceKm: number;
  flightTimeStr: string;
  remainingDistanceKm: number;
  remainingTimeStr: string;
  speedKmh: number;
  altitudeMeters: number;
  country: string;
  flagEmoji: string;
  aircraftImage: string;
  progressPercent: number;
  originLat: number;
  originLon: number;
  destLat: number;
  destLon: number;
  currentLat: number;
  currentLon: number;
}

export const SAMPLE_TACTICAL_FLIGHTS: TacticalFlightItem[] = [
  {
    id: 'rn1782',
    flightNumber: 'RN1782',
    airline: 'Ryanair',
    airlineLogoColor: '#003580',
    airlineCode: 'RYR',
    aircraftModel: 'Boeing 737-800',
    registration: 'D-AISP',
    originIcao: 'DUB',
    originCity: 'Dublin',
    originUtc: 'UTC+0',
    destIcao: 'LCA',
    destCity: 'Larnaca',
    destUtc: 'UTC+3',
    scheduledDep: '08:15',
    actualDep: '08:24',
    scheduledArr: '13:25',
    estimatedArr: '13:23',
    distanceKm: 2715,
    flightTimeStr: '3h 1m',
    remainingDistanceKm: 882,
    remainingTimeStr: '59m',
    speedKmh: 870,
    altitudeMeters: 11300,
    country: 'Ireland',
    flagEmoji: '🇮🇪',
    aircraftImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    progressPercent: 72,
    originLat: 53.4264,
    originLon: -6.2499,
    destLat: 34.8751,
    destLon: 33.6249,
    currentLat: 41.9028,
    currentLon: 12.4964
  },
  {
    id: 'tk143',
    flightNumber: 'TK143',
    airline: 'Turkish Airlines',
    airlineLogoColor: '#c8102e',
    airlineCode: 'THY',
    aircraftModel: 'Airbus A350-900',
    registration: 'TC-JFP',
    originIcao: 'SOF',
    originCity: 'Sofia',
    originUtc: 'UTC+2',
    destIcao: 'PEK',
    destCity: 'Beijing',
    destUtc: 'UTC+8',
    scheduledDep: '09:00',
    actualDep: '09:12',
    scheduledArr: '22:40',
    estimatedArr: '22:35',
    distanceKm: 7420,
    flightTimeStr: '8h 45m',
    remainingDistanceKm: 3200,
    remainingTimeStr: '3h 40m',
    speedKmh: 910,
    altitudeMeters: 11900,
    country: 'Turkey',
    flagEmoji: '🇹🇷',
    aircraftImage: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f0?auto=format&fit=crop&w=800&q=80',
    progressPercent: 58,
    originLat: 42.6977,
    originLon: 23.3219,
    destLat: 40.0799,
    destLon: 116.6031,
    currentLat: 48.0000,
    currentLon: 60.0000
  },
  {
    id: 's7124',
    flightNumber: 'S7124',
    airline: 'S7 Airlines',
    airlineLogoColor: '#b5d333',
    airlineCode: 'SBI',
    aircraftModel: 'Airbus A320neo',
    registration: 'RA-73415',
    originIcao: 'NCE',
    originCity: 'Nice',
    originUtc: 'UTC+1',
    destIcao: 'TBS',
    destCity: 'Tbilisi',
    destUtc: 'UTC+4',
    scheduledDep: '11:20',
    actualDep: '11:35',
    scheduledArr: '17:50',
    estimatedArr: '17:48',
    distanceKm: 3100,
    flightTimeStr: '4h 15m',
    remainingDistanceKm: 1450,
    remainingTimeStr: '1h 55m',
    speedKmh: 840,
    altitudeMeters: 10600,
    country: 'Georgia',
    flagEmoji: '🇬🇪',
    aircraftImage: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=800&q=80',
    progressPercent: 52,
    originLat: 43.6653,
    originLon: 7.215,
    destLat: 41.6692,
    destLon: 44.9547,
    currentLat: 43.0,
    currentLon: 22.0
  },
  {
    id: 'lx318',
    flightNumber: 'LX318',
    airline: 'SWISS',
    airlineLogoColor: '#e30613',
    airlineCode: 'SWR',
    aircraftModel: 'Boeing 777-300ER',
    registration: 'HB-JHK',
    originIcao: 'OPO',
    originCity: 'Porto',
    originUtc: 'UTC+0',
    destIcao: 'GYD',
    destCity: 'Baku',
    destUtc: 'UTC+4',
    scheduledDep: '13:00',
    actualDep: '13:05',
    scheduledArr: '21:15',
    estimatedArr: '21:10',
    distanceKm: 4890,
    flightTimeStr: '6h 10m',
    remainingDistanceKm: 2900,
    remainingTimeStr: '3h 30m',
    speedKmh: 895,
    altitudeMeters: 11600,
    country: 'Switzerland',
    flagEmoji: '🇨🇭',
    aircraftImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
    progressPercent: 41,
    originLat: 41.2481,
    originLon: -8.6814,
    destLat: 40.4675,
    destLon: 50.0467,
    currentLat: 44.0,
    currentLon: 15.0
  },
  {
    id: 'lh401',
    flightNumber: 'LH401',
    airline: 'Lufthansa',
    airlineLogoColor: '#05164d',
    airlineCode: 'DLH',
    aircraftModel: 'Airbus A330-300',
    registration: 'D-AIXD',
    originIcao: 'BOJ',
    originCity: 'Burgas',
    originUtc: 'UTC+2',
    destIcao: 'MCT',
    destCity: 'Muscat',
    destUtc: 'UTC+4',
    scheduledDep: '14:30',
    actualDep: '14:42',
    scheduledArr: '20:45',
    estimatedArr: '20:40',
    distanceKm: 3820,
    flightTimeStr: '5h 05m',
    remainingDistanceKm: 2100,
    remainingTimeStr: '2h 45m',
    speedKmh: 865,
    altitudeMeters: 11000,
    country: 'Germany',
    flagEmoji: '🇩🇪',
    aircraftImage: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
    progressPercent: 44,
    originLat: 42.5696,
    originLon: 27.5152,
    destLat: 23.5933,
    destLon: 58.2844,
    currentLat: 33.0,
    currentLon: 42.0
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
  const [flights, setFlights] = useState<TacticalFlightItem[]>(SAMPLE_TACTICAL_FLIGHTS);
  const [selectedFlight, setSelectedFlight] = useState<TacticalFlightItem>(SAMPLE_TACTICAL_FLIGHTS[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [showRightCard, setShowRightCard] = useState(true);

  const filteredFlights = flights.filter(f => 
    f.flightNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.originIcao.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.destIcao.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.registration.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-[#040415] text-[#e5e7eb] font-['JetBrains_Mono',monospace] overflow-hidden select-none">
      
      {/* MAPA DE FUNDO INTERATIVO COM SATELLITE TILES DARK */}
      <div className="absolute inset-0 z-0">
        <InteractiveFlightMap
          origin={{
            icao: selectedFlight.originIcao,
            name: selectedFlight.originCity,
            lat: selectedFlight.originLat,
            lon: selectedFlight.originLon
          }}
          destination={{
            icao: selectedFlight.destIcao,
            name: selectedFlight.destCity,
            lat: selectedFlight.destLat,
            lon: selectedFlight.destLon
          }}
          corridorBufferKm={60}
          occurrences={occurrences}
          hazards={hazards}
          selectedOccurrence={null}
          onSelectOccurrence={() => {}}
          showCorridor={true}
        />
      </div>

      {/* OVERLAY TÁTICO: FLIGHT CARDS NA LATERAL ESQUERDA (EXATAMENTE COMO NO DESIGN) */}
      <div className="absolute top-4 left-5 bottom-4 z-20 w-[305px] flex flex-col pointer-events-none">
        
        {/* Barra de Filtro Rápida */}
        <div className="pointer-events-auto mb-3 bg-[#16181f]/90 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 flex items-center gap-2 shadow-2xl">
          <Search className="w-4 h-4 text-slate-400 pl-0.5" />
          <input
            type="text"
            placeholder="Pesquisar voo, ICAO, cauda..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-white placeholder-slate-400 focus:outline-none font-mono"
          />
        </div>

        {/* Lista de Voo Flutuante com Scroll Suave */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pointer-events-auto no-scrollbar">
          {filteredFlights.map((flight) => {
            const isSelected = flight.id === selectedFlight.id;
            return (
              <div
                key={flight.id}
                onClick={() => {
                  setSelectedFlight(flight);
                  setShowRightCard(true);
                }}
                className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-2xl backdrop-blur-md ${
                  isSelected
                    ? 'bg-[#181a20]/95 border-2 border-[#ff8800] ring-4 ring-[#ff8800]/15'
                    : 'bg-[#13151b]/85 border border-white/5 hover:bg-[#1a1d26]/90 hover:border-white/15'
                }`}
              >
                {/* Header do Card: Logo Companhia + Número Voo + Código Cauda */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                      style={{ backgroundColor: flight.airlineLogoColor }}
                    >
                      {flight.flightNumber.slice(0, 2)}
                    </div>
                    <span className="text-xs font-bold tracking-wider text-slate-100">
                      {flight.flightNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>93247</span>
                    <span className="text-slate-300 font-semibold">{flight.registration}</span>
                  </div>
                </div>

                {/* Trajeto: Origem e Destino com Linha Laranja e Ícone de Aeronave */}
                <div className="relative pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                    <span>{flight.originCity}</span>
                    <span>{flight.destCity}</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black tracking-tight text-white font-mono">
                      {flight.originIcao}
                    </span>
                    
                    {/* Linha com Avião centralizado */}
                    <div className="flex-1 mx-3 flex items-center justify-center relative">
                      <div className="w-full h-[1.5px] bg-[#ff8800]/80"></div>
                      <div className="absolute bg-[#181a20] px-1">
                        <Plane className="w-3.5 h-3.5 text-white transform rotate-90" />
                      </div>
                    </div>

                    <span className="text-xl font-black tracking-tight text-white font-mono">
                      {flight.destIcao}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OVERLAY TÁTICO: CARD DE DETALHES DO VOO NA LATERAL DIREITA (EXATAMENTE COMO NO DESIGN) */}
      {showRightCard && selectedFlight && (
        <div className="absolute top-4 right-5 z-20 w-[360px] pointer-events-auto">
          <div className="bg-[#14161d]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Header com Nome do Voo e Botão Fechar */}
            <div className="p-4 bg-gradient-to-b from-[#181c26] to-[#14161d] flex items-center justify-between border-b border-white/5">
              <div>
                <div className="text-sm font-black text-[#ff9900] tracking-wide font-mono">
                  {selectedFlight.flightNumber}
                </div>
                <div className="text-xs text-slate-400">
                  {selectedFlight.airline}
                </div>
              </div>

              <button
                onClick={() => setShowRightCard(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Imagem Real da Aeronave (Ryanair / Boeing 737) */}
            <div className="relative h-44 bg-[#0a0c10] overflow-hidden flex items-center justify-center">
              <img 
                src={selectedFlight.aircraftImage} 
                alt={selectedFlight.aircraftModel}
                className="w-full h-full object-cover brightness-95"
              />
              <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-white flex items-center gap-1.5">
                <span>{selectedFlight.aircraftModel}</span>
              </div>
            </div>

            {/* Trajeto Geodésico Principal */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-white font-mono">{selectedFlight.originIcao}</div>
                  <div className="text-xs text-slate-300 font-medium">{selectedFlight.originCity}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedFlight.originUtc}</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#ff8800]/20 border border-[#ff8800]/40 flex items-center justify-center text-[#ff8800] mb-1">
                    <Plane className="w-4 h-4 transform rotate-45" />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono">{selectedFlight.destIcao}</div>
                  <div className="text-xs text-slate-300 font-medium">{selectedFlight.destCity}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedFlight.destUtc}</div>
                </div>
              </div>

              {/* Barra de Progresso com Indicador de Avião */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#ff8800] to-[#ffa533]" 
                      style={{ width: `${selectedFlight.progressPercent}%` }}
                    />
                  </div>
                  <div 
                    className="absolute -top-1.5 -translate-x-1/2 text-[#ff8800]"
                    style={{ left: `${selectedFlight.progressPercent}%` }}
                  >
                    <Plane className="w-4 h-4 transform rotate-90 fill-current" />
                  </div>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>{selectedFlight.distanceKm} km • {selectedFlight.flightTimeStr}</span>
                  <span>{selectedFlight.remainingDistanceKm} km • {selectedFlight.remainingTimeStr}</span>
                </div>
              </div>

              {/* Tabela de Horários: Scheduled vs Actual */}
              <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">Scheduled</span>
                  <span className="font-mono text-slate-200">{selectedFlight.scheduledDep}</span>
                  <span className="text-slate-400 text-[11px]">Actual</span>
                  <span className="font-mono text-white font-bold">{selectedFlight.actualDep}</span>
                </div>
                <div className="w-full h-[1px] bg-white/5"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">Scheduled</span>
                  <span className="font-mono text-slate-200">{selectedFlight.scheduledArr}</span>
                  <span className="text-slate-400 text-[11px]">Estimated</span>
                  <span className="font-mono text-white font-bold">{selectedFlight.estimatedArr}</span>
                </div>
              </div>

              {/* Flight Information */}
              <div className="bg-[#0e1017] border border-white/5 rounded-2xl p-3.5 space-y-2.5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 border-b border-white/5 pb-1">
                  Flight information
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{selectedFlight.aircraftModel}</span>
                  <span className="flex items-center gap-1 text-slate-200 font-medium">
                    <span>{selectedFlight.flagEmoji}</span>
                    <span>{selectedFlight.country}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono">
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Speed</span>
                    <span className="text-white font-bold text-sm">{selectedFlight.speedKmh} km/h</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Altitude</span>
                    <span className="text-white font-bold text-sm">{selectedFlight.altitudeMeters.toLocaleString()} m</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Actions (Route, Follow, Share, More) */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                  <Navigation className="w-4 h-4 text-[#ff8800] mb-1" />
                  <span className="text-[9px] font-mono">Route</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                  <Compass className="w-4 h-4 text-[#ff8800] mb-1" />
                  <span className="text-[9px] font-mono">Follow</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4 text-[#ff8800] mb-1" />
                  <span className="text-[9px] font-mono">Share</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-[#ff8800] mb-1" />
                  <span className="text-[9px] font-mono">More</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
