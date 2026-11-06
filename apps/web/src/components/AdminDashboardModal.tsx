import React from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileCheck, 
  Layers, 
  Activity,
  Server,
  ArrowUpRight
} from 'lucide-react';

export interface AdminTelemetryData {
  totalOccurrences: number;
  totalHazards: number;
  totalAirports: number;
  recentAlerts: number;
  historicalMemories: number;
  activeHazards: number;
  mitigatedHazards: number;
  syncJobs: Array<{
    sourceSlug: string;
    startedAt: string;
    finishedAt?: string;
    status: 'COMPLETED' | 'FAILED' | 'RUNNING';
    recordsProcessed: number;
    recordsInserted: number;
    recordsUpdated: number;
    errors: string[];
  }>;
}

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: AdminTelemetryData;
  onTriggerSync: (source: string) => void;
  isSyncing: boolean;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onTriggerSync,
  isSyncing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
                <span>Painel de Inteligência & Operações MGA</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  SISTEMA ÍNTEGRO
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auditoria de fontes oficiais, volumetria de dados e integridade de ingestão.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 text-xs font-semibold transition"
          >
            Fechar Esc
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Métricas Principais de Volumetria */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total de Ocorrências</span>
                <Database className="w-4 h-4 text-sky-400" />
              </div>
              <span className="text-2xl font-black text-white font-mono">{telemetry.totalOccurrences}</span>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2 font-mono">
                <span className="text-red-400 font-bold">{telemetry.recentAlerts} Recentes</span>
                <span>•</span>
                <span className="text-slate-300">{telemetry.historicalMemories} Históricas</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Obstáculos Cadastrados</span>
                <ShieldAlert className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-2xl font-black text-white font-mono">{telemetry.totalHazards}</span>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-2 font-mono">
                <span className="text-orange-400 font-bold">{telemetry.activeHazards} Ativos</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{telemetry.mitigatedHazards} Mitigados</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Aeródromos Mundiais</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-2xl font-black text-white font-mono">{telemetry.totalAirports}</span>
              <p className="text-[10px] text-slate-400 mt-2">OurAirports / AIS Oficiais</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Motor Espacial</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-bold text-emerald-400 font-mono">Turf.js + PostGIS</span>
              <p className="text-[10px] text-slate-400 mt-2">WGS84 Great Circle ativo</p>
            </div>
          </div>

          {/* Seção de Sincronização de Fontes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Fontes Monitoradas & Conexão Direta
              </h3>
              <span className="text-xs text-slate-400 font-mono">Última checagem: hoje às 11:45</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'ANAC Brasil (Catálogo Diário)', slug: 'anac', records: 'Diário CSV/JSON' },
                { name: 'CENIPA / SIPAER (Relatórios Finais)', slug: 'cenipa', records: 'Periódico + Histórico' },
                { name: 'NTSB CAROL (Estados Unidos)', slug: 'ntsb', records: 'Base 1962 - Presente' },
                { name: 'FAA DOF (Obstáculos Aeronáuticos)', slug: 'faa_obstacles', records: 'Digital Obstacle File' }
              ].map((src) => (
                <div
                  key={src.slug}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-sm text-white block">{src.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{src.records}</span>
                  </div>
                  <button
                    onClick={() => onTriggerSync(src.slug)}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 border border-slate-700 flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sincronizar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico e Auditoria de Jobs de Sincronização */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Histórico de Ingestão & Auditoria de Deduplicação
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3">Fonte</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Processados</th>
                    <th className="p-3">Novos</th>
                    <th className="p-3">Atualizados</th>
                    <th className="p-3">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {telemetry.syncJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 font-sans text-xs">
                        Nenhum job de importação executado na sessão atual.
                      </td>
                    </tr>
                  ) : (
                    telemetry.syncJobs.map((job, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-sky-400 uppercase">{job.sourceSlug}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {job.status}
                          </span>
                        </td>
                        <td className="p-3">{job.recordsProcessed}</td>
                        <td className="p-3 text-emerald-400">+{job.recordsInserted}</td>
                        <td className="p-3 text-amber-400">{job.recordsUpdated}</td>
                        <td className="p-3 text-slate-400 text-[11px]">{new Date(job.startedAt).toLocaleTimeString('pt-BR')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

