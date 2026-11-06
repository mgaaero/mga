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
  LogOut,
  User
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
  onLogout?: () => void;
  userEmail?: string;
  onOpenAlerts?: () => void;
}

export const MGA_MODULES = [
  // 1. Experiência de voo
  { id: 'home', number: '01', name: 'MGA Map', category: 'flight', icon: Map, ready: true },
  { id: 'routes', number: '02', name: 'Rotas', category: 'flight', icon: Compass, ready: true },
  // 2. Inteligência aeronáutica
  { id: 'memory', number: '04', name: 'Memória', category: 'intelligence', icon: Clock, ready: true },
  { id: 'occurrences', number: '05', name: 'Ocorrências', category: 'intelligence', icon: AlertTriangle, ready: true },
  { id: 'hazards', number: '06', name: 'Obstáculos', category: 'intelligence', icon: ShieldAlert, ready: true },
  { id: 'intelligence', number: '07', name: 'Inteligência TEM', category: 'intelligence', icon: BrainCircuit, ready: true },
  // 3. Soluções empresariais
  { id: 'airports', number: '08', name: 'Aeródromos', category: 'enterprise', icon: Building2, ready: true },
  { id: 'reports', number: '09', name: 'Dossiês', category: 'enterprise', icon: FileText, ready: true },
  { id: 'enterprise', number: '10', name: 'B2B', category: 'enterprise', icon: ShieldCheck, ready: false },
] as const;

export const MgaNavbar: React.FC<MgaNavbarProps> = ({
  activeModule,
  onSelectModule,
  onOpenAdmin,
  onLogout,
  userEmail,
  onOpenAlerts
}) => {
  return (
    <header className="bg-[#0b0f17] border-b border-slate-800 text-slate-200 sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Identidade Oficial MGA */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectModule('home')}>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/40 flex items-center justify-center">
              <span className="font-mono font-bold text-orange-400 text-sm tracking-wider">MGA</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-wider text-sm">MGA</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold">
                  CLIENT APP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Memória Geográfica da Aviação</p>
            </div>
          </div>

          {/* Navegação Principal dos Módulos */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-1">
            {/* Experiência de Voo & Mapa */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-md border border-slate-800/80">
              {MGA_MODULES.slice(0, 2).map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id as MgaModuleId)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-[#ff8800] text-slate-950 font-bold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mod.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Inteligência */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-md border border-slate-800/80">
              {MGA_MODULES.slice(2, 6).map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id as MgaModuleId)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mod.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* B2B / Empresarial / Dossiês */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-md border border-slate-800/80">
              {MGA_MODULES.slice(6, 9).map(mod => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => onSelectModule(mod.id as MgaModuleId)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-500 text-white font-bold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mod.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Usuário Autenticado & Sair */}
          <div className="flex items-center space-x-2">
            {onOpenAlerts && (
              <button
                onClick={onOpenAlerts}
                className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-mono font-bold transition-all"
                title="Central de Monitoramento e Alertas Automáticos"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="hidden sm:inline">ALERTAS ATIVOS</span>
              </button>
            )}

            {userEmail && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-mono text-[11px] truncate max-w-[150px]">{userEmail}</span>
              </div>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Encerrar sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
