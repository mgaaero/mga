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
  ArrowRight,
  ExternalLink
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
  onEnterApp?: () => void;
}

export const MgaNavbar: React.FC<MgaNavbarProps> = ({
  activeModule,
  onSelectModule,
  onOpenAdmin,
  onEnterApp
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

          {/* Botões de Ação Institucional & Acesso */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>5.004 AERÓDROMOS WGS84</span>
            </div>

            <button
              onClick={onOpenAdmin}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Auditoria & ADM
            </button>

            {onEnterApp && (
              <button
                onClick={onEnterApp}
                className="text-xs font-bold font-mono text-slate-950 bg-[#ff8800] hover:bg-[#ff9900] px-3.5 py-1.5 rounded-lg shadow-lg transition-all flex items-center gap-1.5"
              >
                <span>ACESSAR PLATAFORMA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
