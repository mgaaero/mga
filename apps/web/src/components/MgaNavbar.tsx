import React from 'react';
import { 
  Plane, 
  ArrowRight,
  Compass,
  Layers,
  ShieldCheck,
  Menu
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
    <header className="bg-[#dce0e6]/90 backdrop-blur-md border-b border-white/60 sticky top-0 z-50 select-none transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Minimalista Luxuoso com Ícone de Asa */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => onSelectModule('home')}
          >
            <div className="w-8 h-8 rounded-full bg-[#111625] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Plane className="w-4 h-4 text-white -rotate-45" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-[#0f172a] text-lg tracking-tight">MGA</span>
              <span className="text-[10px] font-bold text-[#ff8800] uppercase tracking-wider">Aero</span>
            </div>
          </div>

          {/* Navegação Central Estilo Editorial */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#475569]">
            <button 
              onClick={() => onSelectModule('home')}
              className={`transition-colors hover:text-[#0f172a] cursor-pointer ${activeModule === 'home' ? 'text-[#0f172a] font-bold' : ''}`}
            >
              Início
            </button>
            <button 
              onClick={() => onEnterApp?.()}
              className="transition-colors hover:text-[#0f172a] cursor-pointer"
            >
              Rotas & Corredores
            </button>
            <button 
              onClick={() => onEnterApp?.()}
              className="transition-colors hover:text-[#0f172a] cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff8800]" />
              <span>Mapa 3D WebMapX</span>
            </button>
            <button 
              onClick={() => onEnterApp?.()}
              className="transition-colors hover:text-[#0f172a] cursor-pointer"
            >
              Investigações CENIPA
            </button>
            <button 
              onClick={onOpenAdmin}
              className="transition-colors hover:text-[#0f172a] cursor-pointer text-slate-500"
            >
              Admin ADM
            </button>
          </nav>

          {/* Botões do Topo Direito (Menu & Get Ticket/Access) */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onEnterApp?.()}
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-[#334155] px-3 py-1.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>

            <button
              onClick={() => onEnterApp?.()}
              className="px-5 py-2 rounded-full bg-white hover:bg-slate-50 text-[#0f172a] text-xs font-bold tracking-wide shadow-sm border border-slate-200/80 transition-all hover:shadow hover:scale-[1.02] flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Entrar no Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ff8800]" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
