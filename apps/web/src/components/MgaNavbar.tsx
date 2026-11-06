import React from 'react';
import { 
  Compass, 
  Map, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  BrainCircuit, 
  Building2, 
  FileText, 
  ShieldCheck,
  PlaneTakeoff,
  Layers,
  ChevronDown
} from 'lucide-react';

export type MgaModuleId = 
  | 'home'
  | 'routes'
  | 'map'
  | 'memory'
  | 'occurrences'
  | 'hazards'
  | 'intelligence'
  | 'airports'
  | 'reports'
  | 'enterprise';

interface MgaNavbarProps {
  activeModule: MgaModuleId;
  onSelectModule: (id: MgaModuleId) => void;
  onOpenAdmin: () => void;
}

export const MGA_MODULES = [
  // 1. Experiência de voo
  { id: 'home', number: '01', name: 'MGA Home', category: 'flight', icon: PlaneTakeoff, ready: true },
  { id: 'routes', number: '02', name: 'MGA Routes', category: 'flight', icon: Compass, ready: true },
  { id: 'map', number: '03', name: 'MGA Map', category: 'flight', icon: Map, ready: true },
  // 2. Inteligência aeronáutica
  { id: 'memory', number: '04', name: 'MGA Memory', category: 'intelligence', icon: Clock, ready: true },
  { id: 'occurrences', number: '05', name: 'MGA Occurrences', category: 'intelligence', icon: AlertTriangle, ready: true },
  { id: 'hazards', number: '06', name: 'MGA Hazards', category: 'intelligence', icon: ShieldAlert, ready: true },
  { id: 'intelligence', number: '07', name: 'MGA Intelligence', category: 'intelligence', icon: BrainCircuit, ready: true },
  // 3. Soluções empresariais
  { id: 'airports', number: '08', name: 'MGA Airports', category: 'enterprise', icon: Building2, ready: false },
  { id: 'reports', number: '09', name: 'MGA Reports', category: 'enterprise', icon: FileText, ready: true },
  { id: 'enterprise', number: '10', name: 'MGA Enterprise', category: 'enterprise', icon: ShieldCheck, ready: false },
] as const;

export const MgaNavbar: React.FC<MgaNavbarProps> = ({
  activeModule,
  onSelectModule,
  onOpenAdmin
}) => {
  return (
    <header className="bg-[#0b0f17] border-b border-slate-800 text-slate-200 sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Identidade Oficial MGA */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectModule('home')}>
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
              <span className="font-mono font-bold text-amber-500 text-sm tracking-wider">MGA</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-wider text-sm">MGA</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Aviation Intelligence
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Memória Geográfica da Aviação</p>
            </div>
          </div>

          {/* Navegação Principal dos Módulos */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Experiência de Voo */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-md border border-slate-800/80">
              {MGA_MODULES.slice(0, 3).map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id as MgaModuleId)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mod.name.replace('MGA ', '')}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Inteligência */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-md border border-slate-800/80">
              {MGA_MODULES.slice(3, 7).map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id as MgaModuleId)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mod.name.replace('MGA ', '')}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* B2B / Empresarial */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-md border border-slate-800/80">
              {MGA_MODULES.slice(7, 10).map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id as MgaModuleId)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-500 text-white font-semibold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mod.name.replace('MGA ', '')}</span>
                    {!mod.ready && (
                      <span className="text-[9px] bg-slate-800 text-amber-400 px-1 rounded border border-amber-500/30">B2B</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Telemetria e Admin */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>5.004 AERÓDROMOS WGS84</span>
            </div>

            <button
              onClick={onOpenAdmin}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded border border-slate-700 transition-colors"
            >
              Auditoria & ADM
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

