import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  Globe2, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Filter, 
  ExternalLink,
  Sliders,
  Mail,
  Smartphone
} from 'lucide-react';
import { 
  MonitoredAviationAlert, 
  UserAlertPreference, 
  buildMgaAlertEmail 
} from '@mega/shared';

const MOCK_ACTIVE_ALERTS: MonitoredAviationAlert[] = [
  {
    id: 'alert-heli-campinas-2026',
    alertType: 'PRELIMINARY_ALERT',
    title: 'Ocorrência envolvendo helicóptero em área rural',
    aircraftDescription: 'Helicóptero Robinson R44',
    registration: 'PR-EXM (Sob Verificação)',
    aircraftType: 'HELICOPTER',
    locationDescription: 'Região de Campinas / Itatiba, SP',
    coordinates: { latitude: -23.005, longitude: -46.850 },
    eventDate: '06/11/2026 16:45 BRT',
    detectedAt: '06/11/2026 17:10 BRT',
    sourceAgency: 'SERIPA IV / Corpo de Bombeiros SP',
    officialSourceUrl: 'https://dedalo.aer.mil.br',
    status: 'AGUARDANDO_CONFIRMACAO',
    summary: 'Pouso forçado de emergência seguido de tombamento em terreno irregular durante aproximação. Tripulantes assistidos sem vítimas fatais. Equipe do SERIPA IV notificada para ação inicial.',
    actionUrl: 'http://localhost:3001/?origin=SBKP&dest=SDCO&alert=alert-heli-campinas-2026'
  },
  {
    id: 'alert-cantareira-historical',
    alertType: 'CONFIRMED_ALERT',
    title: 'CFIT na Serra da Cantareira - Learjet 25D',
    aircraftDescription: 'Gates Learjet 25D',
    registration: 'PT-LSD',
    aircraftType: 'AIRPLANE',
    locationDescription: 'Serra da Cantareira, Bairro Água Fria, SP',
    coordinates: { latitude: -23.4167, longitude: -46.5417 },
    eventDate: '02/03/1996 23:16 BRT',
    detectedAt: 'Arquivo Histórico MGA',
    sourceAgency: 'CENIPA / SIPAER',
    officialSourceUrl: 'https://sistema.cenipa.fab.mil.br',
    status: 'CONFIRMADO_SIPAER',
    summary: 'Colisão com terreno em voo controlado durante arremetida noturna em Guarulhos. 9 fatalidades. Relatório Final A-012/CENIPA/1996 arquivado e confirmado.',
    actionUrl: 'http://localhost:3001/?origin=CWB&dest=GRU&case=mamonas-pt-lsd'
  }
];

export const MgaAlertMonitoringModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PREFERENCES' | 'SIMULATOR'>('ALERTS');
  const [scope, setScope] = useState<'GLOBAL' | 'REGIONAL'>('REGIONAL');
  const [regionalRadius, setRegionalRadius] = useState<number>(150);
  const [notifyPreliminary, setNotifyPreliminary] = useState(true);
  const [notifyConfirmed, setNotifyConfirmed] = useState(true);
  const [onlyHelicopters, setOnlyHelicopters] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);

  const selectedAlert = MOCK_ACTIVE_ALERTS[0];
  const emailPreview = buildMgaAlertEmail(selectedAlert);

  const triggerDispatchSimulation = () => {
    setSimulatedSent(true);
    setTimeout(() => setSimulatedSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0f18] border border-white/15 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header da Central de Monitoramento */}
        <div className="p-5 bg-gradient-to-r from-[#141824] to-[#0c0f18] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#ff8800]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono">
                  MGA Central de Monitoramento Automático
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  SCAN CONTÍNUO ATIVO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Fontes monitoradas: CENIPA, ANAC, NTSB, BEA, AAIB, ATSB, TSB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm font-mono transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center px-6 pt-3 border-b border-white/5 gap-2 bg-[#090b12]">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ALERTS'
                ? 'border-[#ff8800] text-[#ff8800]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Ocorrências Detectadas ({MOCK_ACTIVE_ALERTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PREFERENCES')}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'PREFERENCES'
                ? 'border-[#ff8800] text-[#ff8800]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Preferências de Notificação</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'SIMULATOR'
                ? 'border-[#ff8800] text-[#ff8800]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Simulador de Disparo EFB</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-6 font-mono">
          {activeTab === 'ALERTS' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between border-b border-white/10 pb-2">
                <span>FEED EM TEMPO REAL DE FONTES CONECTADAS</span>
                <span className="text-emerald-400">Última checagem: há 2 minutos</span>
              </div>

              {MOCK_ACTIVE_ALERTS.map(alert => (
                <div
                  key={alert.id}
                  className="p-4 rounded-2xl bg-[#121622] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        alert.alertType === 'PRELIMINARY_ALERT'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {alert.alertType === 'PRELIMINARY_ALERT' ? '⚠️ ALERTA PRELIMINAR' : '🚨 CONFIRMADO SIPAER'}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {alert.aircraftDescription}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {alert.eventDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] bg-[#090b12] p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-slate-500 block">Localização:</span>
                      <span className="text-slate-200">{alert.locationDescription}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Fonte Primária:</span>
                      <span className="text-[#ff8800]">{alert.sourceAgency}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Situação:</span>
                      <span className="text-cyan-400">{alert.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tipo Aeronave:</span>
                      <span className="text-slate-200">{alert.aircraftType}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500">
                      ID MGA: {alert.id}
                    </span>
                    <a
                      href={alert.actionUrl}
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-xl bg-[#ff8800] text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>Ver Ocorrência no Mapa</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'PREFERENCES' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Escopo de Monitoramento para Alertas
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Escolha se deseja receber avisos de acidentes de todo o planeta ou apenas no seu raio de voo.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setScope('GLOBAL')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      scope === 'GLOBAL'
                        ? 'bg-amber-500/10 border-[#ff8800] text-white'
                        : 'bg-[#121622] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Globe2 className="w-5 h-5 text-[#ff8800] mb-2" />
                    <div className="text-xs font-bold">Cobertura Global</div>
                    <div className="text-[10px] text-slate-400">
                      Notificar acidentes em qualquer autoridade monitorada no mundo.
                    </div>
                  </button>

                  <button
                    onClick={() => setScope('REGIONAL')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      scope === 'REGIONAL'
                        ? 'bg-amber-500/10 border-[#ff8800] text-white'
                        : 'bg-[#121622] border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Compass className="w-5 h-5 text-[#ff8800] mb-2" />
                    <div className="text-xs font-bold">Raio Geográfico / Regional</div>
                    <div className="text-[10px] text-slate-400">
                      Apenas ocorrências em até {regionalRadius}km da minha base de operação.
                    </div>
                  </button>
                </div>
              </div>

              {scope === 'REGIONAL' && (
                <div className="p-4 rounded-2xl bg-[#121622] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">Raio de Alerta Geodésico:</span>
                    <span className="text-[#ff8800] font-bold">±{regionalRadius} km</span>
                  </div>
                  <div className="flex gap-2">
                    {[50, 100, 150, 300].map(r => (
                      <button
                        key={r}
                        onClick={() => setRegionalRadius(r)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                          regionalRadius === r
                            ? 'bg-[#ff8800] text-slate-950 border-[#ff8800]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tipos de Alerta */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Níveis de Verificação Desejados
                </h4>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#121622] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyPreliminary}
                    onChange={(e) => setNotifyPreliminary(e.target.checked)}
                    className="w-4 h-4 accent-[#ff8800]"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-400 block">
                      Alertas Preliminares (Aviso Imediato)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Disparar quando uma autoridade ou veículo oficial publicar relato recente ainda sob averiguação inicial.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#121622] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyConfirmed}
                    onChange={(e) => setNotifyConfirmed(e.target.checked)}
                    className="w-4 h-4 accent-[#ff8800]"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">
                      Alertas Oficiais Confirmados (SIPAER / NTSB)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Disparar quando houver registro oficial confirmado no banco com relatório e código SIPAER.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
                >
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}

          {activeTab === 'SIMULATOR' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Visualização do Disparo Automático EFB</h4>
                  <p className="text-[11px] text-slate-400">Template padronizado gerado para envio aos usuários cadastrados.</p>
                </div>

                <button
                  onClick={triggerDispatchSimulation}
                  disabled={simulatedSent}
                  className="px-4 py-2 rounded-xl bg-[#ff8800] text-slate-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{simulatedSent ? 'Disparo Enviado!' : 'Simular Disparo Imediato'}</span>
                </button>
              </div>

              {simulatedSent && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Notificação simulada com sucesso para <strong>cmte.homologacao@mga.aero</strong> via Webhook e E-mail.</span>
                </div>
              )}

              {/* Renderização do Template */}
              <div className="p-4 rounded-2xl bg-[#070910] border border-white/10 overflow-x-auto text-xs text-slate-300">
                <div className="text-[11px] text-[#ff8800] mb-2 font-mono">
                  ASSUNTO: {emailPreview.subject}
                </div>
                <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {emailPreview.textContent}
                </pre>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

