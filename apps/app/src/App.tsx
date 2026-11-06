import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { MgaTacticalWorkspace } from './components/MgaTacticalWorkspace';
import { MgaNavbar, MgaModuleId } from './components/MgaNavbar';
import { MgaMemoryView } from './components/MgaMemoryView';
import { MgaHazardsView } from './components/MgaHazardsView';
import { MgaIntelligenceView } from './components/MgaIntelligenceView';
import { MgaAirportsView } from './components/MgaAirportsView';
import { MgaEnterpriseView } from './components/MgaEnterpriseView';
import { PreflightBriefingReport } from './components/PreflightBriefingReport';
import { HISTORICAL_OCCURRENCES_SEED, HAZARDS_SEED, AIRPORTS_DATABASE } from '@mega/shared';
import { Occurrence, HazardObstacle } from '@mega/types';

export default function App() {
  const [session, setSession] = useState<any>(() => {
    // Verifica flag persistida de sessão rápida de homologação
    try {
      const demoStored = localStorage.getItem('mga_demo_session');
      if (demoStored === 'true') return { user: { email: 'cmte.homologacao@mga.aero' } };
    } catch {}
    return null;
  });
  const [isDemo, setIsDemo] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeModule, setActiveModule] = useState<MgaModuleId>('home');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(HISTORICAL_OCCURRENCES_SEED[0]);
  const [selectedHazard, setSelectedHazard] = useState<HazardObstacle | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Timeout de escape rápido
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setLoadingAuth(false);
    }, 400);

    try {
      supabase.auth.getSession().then(({ data }) => {
        if (isMounted) {
          if (data?.session) setSession(data.session);
          setLoadingAuth(false);
        }
      }).catch(() => {
        if (isMounted) setLoadingAuth(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (isMounted) {
          setSession(newSession);
          if (!newSession) {
            localStorage.removeItem('mga_demo_session');
          }
        }
      });

      return () => {
        isMounted = false;
        clearTimeout(fallbackTimer);
        subscription?.unsubscribe();
      };
    } catch {
      if (isMounted) setLoadingAuth(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('mga_demo_session');
    setSession(null);
    setIsDemo(false);
  };

  const handleDemoAccess = () => {
    localStorage.setItem('mga_demo_session', 'true');
    setSession({ user: { email: 'cmte.homologacao@mga.aero' } });
    setIsDemo(true);
  };

  if (loadingAuth && !session) {
    return (
      <div className="h-screen w-screen bg-[#070b12] flex flex-col items-center justify-center text-slate-300 font-mono text-xs">
        <div className="flex items-center gap-3 bg-[#0f1422] border border-white/10 px-5 py-3 rounded-2xl shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-[#ff8800] animate-ping" />
          <span className="font-bold tracking-wider text-white">MGA AVIATION INTELLIGENCE</span>
          <span className="text-[10px] text-slate-400 border-l border-white/10 pl-3">Carregando workspace...</span>
        </div>
      </div>
    );
  }

  // Se não autenticado e não em modo demo, apresenta tela de autenticação
  if (!session && !isDemo) {
    return (
      <AuthScreen
        onAuthenticated={(user) => setSession({ user })}
        onDemoAccess={handleDemoAccess}
      />
    );
  }

  const currentUserEmail = session?.user?.email || (isDemo ? 'cmte.homologacao@mga.aero' : undefined);

  // Usuário autenticado: Acesso imediato ao MGA Map / Workspace Tático
  return (
    <div className="flex flex-col h-screen w-screen bg-[#070b12] text-slate-100 overflow-hidden font-mono">
      {/* Top Navigation Bar MGA */}
      <MgaNavbar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenAdmin={() => window.open('http://localhost:5174', '_blank')}
        onLogout={handleLogout}
        userEmail={currentUserEmail}
      />

      {/* Conteúdo Dinâmico por Módulo */}
      <main className="flex-1 overflow-hidden relative">
        {activeModule === 'home' || activeModule === 'routes' || activeModule === 'map' ? (
          <MgaTacticalWorkspace
            occurrences={HISTORICAL_OCCURRENCES_SEED}
            hazards={HAZARDS_SEED}
          />
        ) : activeModule === 'memory' || activeModule === 'occurrences' ? (
          <MgaMemoryView
            occurrences={HISTORICAL_OCCURRENCES_SEED}
            selectedOccurrence={selectedOccurrence}
            onSelectOccurrence={setSelectedOccurrence}
          />
        ) : activeModule === 'hazards' ? (
          <MgaHazardsView
            hazards={HAZARDS_SEED}
            selectedHazard={selectedHazard}
            onSelectHazard={setSelectedHazard}
          />
        ) : activeModule === 'intelligence' ? (
          <MgaIntelligenceView
            analysis={null as any}
            occurrences={HISTORICAL_OCCURRENCES_SEED}
            hazards={HAZARDS_SEED}
          />
        ) : activeModule === 'airports' ? (
          <MgaAirportsView
            currentAirport={AIRPORTS_DATABASE[0] as any}
            allAirports={AIRPORTS_DATABASE}
            onSelectAirport={() => {}}
            hazards={HAZARDS_SEED}
            occurrences={HISTORICAL_OCCURRENCES_SEED}
          />
        ) : activeModule === 'reports' ? (
          <PreflightBriefingReport
            analysis={null as any}
            onPrint={() => window.print()}
          />
        ) : (
          <MgaEnterpriseView />
        )}
      </main>
    </div>
  );
}
