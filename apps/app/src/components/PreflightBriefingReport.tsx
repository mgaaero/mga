import React from 'react';
import { RouteIntelligenceAnalysis } from '@mega/shared';
import { Occurrence } from '@mega/types';
import { Plane, AlertTriangle, Shield, Calendar, MapPin, ExternalLink, Printer } from 'lucide-react';

interface PreflightBriefingReportProps {
  analysis: RouteIntelligenceAnalysis;
  onPrint: () => void;
}

export const PreflightBriefingReport: React.FC<PreflightBriefingReportProps> = ({
  analysis,
  onPrint
}) => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 text-slate-100 font-sans print:bg-white print:text-black">
      {/* Botão de Impressão / Exportação */}
      <div className="flex justify-between items-center print:hidden border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
            DOCUMENTO OFICIAL DE INTELIGÊNCIA HISTÓRICA & PREVENÇÃO
          </span>
          <h2 className="text-xl font-black text-white mt-0.5">
            MGA Preflight Briefing Report
          </h2>
        </div>
        <button
          onClick={onPrint}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-sky-600/20 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Exportar PDF / Imprimir</span>
        </button>
      </div>

      {/* Cabeçalho do Relatório */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-6 space-y-4 print:border-black print:bg-transparent">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 print:border-black">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black text-xl">
              M
            </div>
            <div>
              <span className="text-lg font-black tracking-wide text-white print:text-black">MGA</span>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Memória Geográfica da Aviação — Aviation Intelligence
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-400 print:text-black">
            <span className="font-bold text-sky-400">REF: MGA-{Date.now().toString().slice(-8)}</span>
            <p className="text-[11px] text-slate-500">{new Date(analysis.generatedAt).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Resumo da Rota Geodésica Karney WGS84 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 print:border-black print:bg-transparent">
            <span className="text-slate-500 block text-[10px] uppercase">ORIGEM</span>
            <span className="text-white font-bold text-sm print:text-black">{analysis.origin.code}</span>
            <span className="text-slate-400 text-[11px] truncate block">{analysis.origin.name}</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 print:border-black print:bg-transparent">
            <span className="text-slate-500 block text-[10px] uppercase">DESTINO</span>
            <span className="text-white font-bold text-sm print:text-black">{analysis.destination.code}</span>
            <span className="text-slate-400 text-[11px] truncate block">{analysis.destination.name}</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 print:border-black print:bg-transparent">
            <span className="text-slate-500 block text-[10px] uppercase">DISTÂNCIA / AZIMUTE</span>
            <span className="text-sky-400 font-bold text-sm print:text-black">{analysis.totalDistanceKm} km</span>
            <span className="text-slate-400 text-[11px] block">Rumo Inicial: {analysis.initialAzimuthDeg}°</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 print:border-black print:bg-transparent">
            <span className="text-slate-500 block text-[10px] uppercase">CORREDOR PESQUISADO</span>
            <span className="text-amber-400 font-bold text-sm print:text-black">± {analysis.corridorWidthKm} km</span>
            <span className="text-slate-400 text-[11px] block">{analysis.occurrences.length} Ocorrências</span>
          </div>
        </div>

        {/* Disclaimer Operacional Obrigatório */}
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 print:border-black print:text-black space-y-1">
          <div className="flex items-center space-x-2 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Aviso de Limitação Aeronáutica:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300 print:text-slate-700">
            Este relatório consolida histórico de investigações oficiais (ANAC, CENIPA, NTSB e bases governamentais)
            para conscientização situacional e inteligência geográfica pré-voo. A ausência de registros não garante ausência de perigos,
            assim como acidentes pretéritos não constituem perigo ativo permanente. Este documento NÃO substitui NOTAMs em vigor,
            cartas aeronáuticas oficiais, plano de voo ATS ou despacho operacional homologado.
          </p>
        </div>
      </div>

      {/* Tabela de Ocorrências Catalogadas no Corredor */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-6 space-y-4 print:border-black print:bg-transparent">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black flex items-center justify-between">
          <span>Ocorrências & Investigações no Corredor Lateral</span>
          <span className="text-xs font-mono text-sky-400 font-normal">
            Ordenado por menor afastamento lateral
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] print:border-black print:text-black">
                <th className="py-2 px-3">Data</th>
                <th className="py-2 px-3">Aeronave / Matrícula</th>
                <th className="py-2 px-3">Classificação</th>
                <th className="py-2 px-3">Afastamento Lateral</th>
                <th className="py-2 px-3">Status Investigação</th>
                <th className="py-2 px-3">Fonte Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 print:divide-slate-300 print:text-black">
              {analysis.occurrences.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500 font-sans">
                    Nenhuma ocorrência catalogada no corredor selecionado de ±{analysis.corridorWidthKm} km.
                  </td>
                </tr>
              ) : (
                analysis.occurrences.map((occ: Occurrence & { distanceToRouteKm?: number }) => (
                  <tr key={occ.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 whitespace-nowrap">{occ.date}</td>
                    <td className="py-2 px-3 font-bold text-white print:text-black">
                      {occ.aircraft?.model} ({occ.aircraft?.registration})
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        occ.visualTag === 'RECENT_ALERT' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {occ.visualTag === 'RECENT_ALERT' ? '🔴 RECENTE' : '⚪ HISTÓRICA'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sky-400 font-bold whitespace-nowrap">
                      ~{occ.distanceToRouteKm} km
                    </td>
                    <td className="py-2 px-3 text-[11px]">{occ.verificationStatus}</td>
                    <td className="py-2 px-3 text-[11px] text-slate-400 print:text-black">
                      {occ.source.officialAgency} ({occ.source.recordIdentifier})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
