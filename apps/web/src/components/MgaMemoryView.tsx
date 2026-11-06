import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  Plane, 
  ShieldCheck, 
  Users, 
  Building, 
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Occurrence } from '@mega/types';

interface MgaMemoryViewProps {
  occurrences: Occurrence[];
  selectedOccurrence: Occurrence | null;
  onSelectOccurrence: (occ: Occurrence) => void;
}

export const MgaMemoryView: React.FC<MgaMemoryViewProps> = ({
  occurrences,
  selectedOccurrence,
  onSelectOccurrence
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredOccurrences = occurrences.filter(occ => {
    const matchesSearch = 
      (occ.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.aircraft?.registration || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.aircraft?.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.source?.recordIdentifier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (occ.location?.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || occ.type === selectedType;
    return matchesSearch && matchesType;
  });

  const activeOcc = selectedOccurrence || filteredOccurrences[0] || null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#070b12] text-slate-200">
      
      {/* Coluna Esquerda: Listagem e Filtros da Memória Histórica */}
      <div className="w-full lg:w-96 border-r border-slate-800 bg-[#0a0f1a] flex flex-col h-full shrink-0">
        
        {/* Header do Módulo */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>04. MGA MEMORY & 05. OCCURRENCES</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Acervo Documental Histórico
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Preservação permanente de relatórios oficiais (CENIPA / NTSB)
          </p>

          {/* Barra de Busca */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por matrícula, relatório, modelo..."
              className="w-full bg-[#111726] border border-slate-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center space-x-1.5 mt-2.5">
            {['ALL', 'ACCIDENT', 'SERIOUS_INCIDENT'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  selectedType === type
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-slate-700/50'
                }`}
              >
                {type === 'ALL' ? 'Todos' : type === 'ACCIDENT' ? 'Acidentes' : 'Incidentes Graves'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Registros Documentados */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {filteredOccurrences.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhum registro documental encontrado para os critérios.
            </div>
          ) : (
            filteredOccurrences.map(occ => {
              const isSelected = activeOcc?.id === occ.id;
              return (
                <div
                  key={occ.id}
                  onClick={() => onSelectOccurrence(occ)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-cyan-950/40 border-l-2 border-cyan-400' 
                      : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      {occ.aircraft?.registration || 'N/A'}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {occ.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium line-clamp-1 mb-1">
                    {occ.aircraft?.model || 'Aeronave não informada'}
                  </p>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {occ.summary}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-cyan-400/90">{occ.source?.recordIdentifier || 'Oficial'}</span>
                    <span>{occ.fatalities > 0 ? `${occ.fatalities} fatalidades` : 'Sem fatalidades'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Coluna Direita: Ficha Técnica Completa da Ocorrência */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#070b12]">
        {activeOcc ? (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header da Ficha */}
            <div className="border-b border-slate-800 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {activeOcc.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    RELATÓRIO FINAL CONCLUÍDO
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-400">
                  Processo: <strong className="text-white">{activeOcc.source?.recordIdentifier}</strong>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeOcc.aircraft?.model} — {activeOcc.aircraft?.registration}
              </h1>

              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center space-x-3">
                <span>Data do Evento: <strong className="text-slate-300">{activeOcc.date}</strong></span>
                <span>•</span>
                <span>Local: <strong className="text-slate-300">{activeOcc.location.description}</strong></span>
              </p>
            </div>

            {/* Grid de Metadados Críticos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">AERONAVE</span>
                <span className="text-white font-bold">{activeOcc.aircraft?.registration || 'N/A'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{activeOcc.aircraft?.model}</span>
              </div>

              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">VÍTIMAS (TOTAL)</span>
                <span className={`font-bold ${activeOcc.fatalities > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {activeOcc.fatalities} Fatalidades
                </span>
                <span className="text-[10px] text-slate-400 block">Registros Oficiais</span>
              </div>

              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">COORDENADAS WGS84</span>
                <span className="text-slate-200 font-bold block">
                  {activeOcc.location.coordinates.latitude.toFixed(4)}°
                </span>
                <span className="text-slate-200 font-bold block">
                  {activeOcc.location.coordinates.longitude.toFixed(4)}°
                </span>
              </div>

              <div className="bg-[#0e1422] p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">AUTORIDADE</span>
                <span className="text-cyan-400 font-bold block">{activeOcc.source?.slug.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 block truncate">{activeOcc.source?.name}</span>
              </div>
            </div>

            {/* Narrativa e Circunstâncias Documentadas */}
            <div className="bg-[#0e1422] p-5 rounded-xl border border-slate-800 space-y-4">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Circunstâncias e Consequências Documentadas</span>
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {activeOcc.summary}
                </p>
              </div>

              {activeOcc.investigationFindings && (
                <div className="pt-3 border-t border-slate-800">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Conclusão Oficial da Investigação Técnica</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    {activeOcc.investigationFindings}
                  </p>
                </div>
              )}
            </div>

            {/* Documento Original & Rastreabilidade */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Fonte Oficial da Informação</span>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Órgão: {activeOcc.source?.officialAgency || activeOcc.source?.name}
                </p>
              </div>

              {activeOcc.source?.reportUrl && (
                <a
                  href={activeOcc.source.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold flex items-center space-x-1.5 transition"
                >
                  <span>Acessar Relatório Oficial (PDF)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs font-mono">
            Selecione uma ocorrência para inspecionar a ficha documental.
          </div>
        )}
      </div>

    </div>
  );
};

