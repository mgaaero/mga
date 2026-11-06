import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Mountain, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Maximize2,
  Compass,
  Filter
} from 'lucide-react';

export interface MapLayerConfig {
  showTerrain: boolean;
  showAirports: boolean;
  showOccurrences: boolean;
  showHazards: boolean;
  showCorridor: boolean;
  filterRecentOnly: boolean;
}

interface MgaMapControlsProps {
  config: MapLayerConfig;
  onChangeConfig: (newConfig: MapLayerConfig) => void;
  occurrencesCount: number;
  hazardsCount: number;
}

export const MgaMapControls: React.FC<MgaMapControlsProps> = ({
  config,
  onChangeConfig,
  occurrencesCount,
  hazardsCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (key: keyof MapLayerConfig) => {
    onChangeConfig({
      ...config,
      [key]: !config[key]
    });
  };

  return (
    <div className="absolute top-4 right-4 z-[400] flex flex-col items-end">
      {/* Botão de Toggle do Painel de Camadas */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#0c1322]/90 hover:bg-[#131d33] border border-slate-700/80 text-slate-200 text-xs font-mono font-semibold shadow-xl backdrop-blur transition-all"
      >
        <Layers className="w-4 h-4 text-amber-400" />
        <span>CAMADAS TÁTICAS</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
      </button>

      {/* Painel Expansível de Controle de Camadas */}
      {isOpen && (
        <div className="mt-2 w-72 bg-[#0c1322]/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur text-xs select-none">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-mono font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Controle Geoespacial</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">WGS84</span>
          </div>

          <div className="space-y-2.5">
            {/* Camada: Corredor de Voo */}
            <div 
              onClick={() => toggle('showCorridor')}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer border border-slate-800/80 transition"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded border border-cyan-400 bg-cyan-500/20" />
                <span className="text-slate-200 font-medium">Corredor Geodésico</span>
              </div>
              {config.showCorridor ? (
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>

            {/* Camada: Ocorrências e Acidentes */}
            <div 
              onClick={() => toggle('showOccurrences')}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer border border-slate-800/80 transition"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-slate-200 font-medium">Memória Histórica</span>
                <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                  {occurrencesCount}
                </span>
              </div>
              {config.showOccurrences ? (
                <Eye className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>

            {/* Camada: Obstáculos e Torres */}
            <div 
              onClick={() => toggle('showHazards')}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer border border-slate-800/80 transition"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-200 font-medium">Obstáculos Verticais</span>
                <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                  {hazardsCount}
                </span>
              </div>
              {config.showHazards ? (
                <Eye className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>

            {/* Camada: Aeródromos WGS84 */}
            <div 
              onClick={() => toggle('showAirports')}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer border border-slate-800/80 transition"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 font-medium">Aeródromos (5.004)</span>
              </div>
              {config.showAirports ? (
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>
          </div>

          {/* Legenda Oficial MGA */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] space-y-1.5 font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Alerta Recente (Sob Investigação)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Memória Histórica (CENIPA / NTSB)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Obstáculo Ativo (Torre / Linha)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

