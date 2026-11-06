import React, { useState } from 'react';
import { MgaHome } from './components/MgaHome';
import { MgaNavbar, MgaModuleId } from './components/MgaNavbar';

export default function App() {
  const [activeModule, setActiveModule] = useState<MgaModuleId>('home');

  const handleEnterApp = (originIcao?: string, destIcao?: string, corridorKm?: number) => {
    // Redireciona para o aplicativo do cliente na porta 3001 (app.mga.aero)
    const params = new URLSearchParams();
    if (originIcao) params.set('origin', originIcao);
    if (destIcao) params.set('dest', destIcao);
    if (corridorKm) params.set('corridor', corridorKm.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    window.location.href = `http://localhost:3001${query}`;
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar Institucional com Acesso à Plataforma */}
      <MgaNavbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenAdmin={() => window.open('http://localhost:5174', '_blank')}
        onEnterApp={() => handleEnterApp()}
      />

      {/* Site Institucional Oficial */}
      <main className="flex-1">
        <MgaHome
          onSearchRoute={(orig, dest, corr) => handleEnterApp(orig, dest, corr)}
          onExploreModule={() => handleEnterApp()}
        />
      </main>
    </div>
  );
}
