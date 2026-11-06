import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Key, 
  ShieldCheck, 
  Database, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Lock,
  Layers
} from 'lucide-react';

export const MgaEnterpriseView: React.FC = () => {
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText('mga_live_sec_99a8b7c6d5e4f3a2b1c0');
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#070b12] text-slate-200 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header Enterprise */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>10. MGA ENTERPRISE (B2B SUITE)</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gestão Corporativa, API & Licenças B2B
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Painel corporativo para operadoras aéreas, concessionárias de aeroportos, seguradoras aeronáuticas e órgãos de regulação.
          </p>
        </div>

        {/* Status do Contrato Corporativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 block text-[10px]">ORGANIZAÇÃO ATIVA</span>
            <span className="text-white font-bold text-base block mt-1">CCR Aeroportos / Terminal SP</span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Contrato Enterprise Anual Ativo</span>
            </span>
          </div>

          <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 block text-[10px]">USUÁRIOS COM ACESSO (RBAC)</span>
            <span className="text-white font-bold text-base block mt-1">12 Operadores Ativos</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Limite contratado: 50 assentos</span>
          </div>

          <div className="bg-[#0c121e] border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 block text-[10px]">CONSUMO DE API (MÊS ATUAL)</span>
            <span className="text-white font-bold text-base block mt-1">42.810 Consultas</span>
            <span className="text-[10px] text-indigo-400 mt-0.5 block">SLA 99.9% Garantido</span>
          </div>
        </div>

        {/* Gestão de Chaves de API para Integração com EFBs e Despacho */}
        <div className="bg-[#0c121e] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Credenciais da API MGA (REST / PostGIS GeoJSON)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Integre a memória de rotas e o cálculo de corredor diretamente no seu software de despacho ou EFB
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
              PRODUÇÃO VIGENTE
            </span>
          </div>

          <div className="bg-[#121927] p-3 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>mga_live_sec_••••••••••••••••••••••••</span>
            </div>
            <button
              onClick={handleCopyKey}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition border border-slate-700"
            >
              {apiKeyCopied ? 'Copiada!' : 'Copiar Chave'}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-4">
            <span>Endpoint: <code className="text-cyan-400">POST /v1/routes/corridor-intelligence</code></span>
            <span>Documentação OpenAPI: <code className="text-slate-300">/docs/api</code></span>
          </div>
        </div>

        {/* Perfis de Acesso & Auditoria de Consultas (RBAC) */}
        <div className="bg-[#0c121e] border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Controle de Perfis & Auditoria de Consultas</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">Gerente de Segurança Operacional (SMS)</span>
                <span className="text-[10px] text-slate-400">Acesso total a relatórios, histórico de auditoria e exportação PDF</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Nível Admin</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-white font-bold block">Despachante Operacional de Voo (DOV)</span>
                <span className="text-[10px] text-slate-400">Consulta de corredores, visualização de mapa e briefing de rota</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Nível Operacional</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

