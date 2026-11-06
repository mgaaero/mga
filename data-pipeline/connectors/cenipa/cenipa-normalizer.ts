import { Occurrence, OfficialSource, VisualClassification } from '@mega/types';

export interface CenipaRawReport {
  codigo_ocorrencia: string;
  classificacao: 'ACIDENTE' | 'INCIDENTE GRAVE' | 'INCIDENTE';
  tipo: string;
  data: string; // YYYY-MM-DD
  hora: string;
  cidade: string;
  uf: string;
  latitude: number;
  longitude: number;
  aeronave_matricula: string;
  aeronave_modelo: string;
  aeronave_fabricante: string;
  relatorio_final_publicado: boolean;
  relatorio_numero: string;
  relatorio_url?: string;
  fatalidades: number;
  historico: string;
  conclusoes?: string;
  pessoas_notaveis?: Array<{
    nome: string;
    papel: 'PILOT' | 'COPILOT' | 'PASSENGER' | 'CREW' | 'PUBLIC_FIGURE';
    notoriedade?: string;
  }>;
}

export class CenipaNormalizer {
  public static normalize(raw: CenipaRawReport): Occurrence {
    const isRecent = this.checkIfRecent(raw.data);

    const source: OfficialSource = {
      slug: 'cenipa',
      name: 'Centro de Investigação e Prevenção de Acidentes Aeronáuticos',
      officialAgency: 'Força Aérea Brasileira / SIPAER',
      recordIdentifier: raw.relatorio_numero || raw.codigo_ocorrencia,
      reportUrl: raw.relatorio_url,
      publicationDate: raw.data
    };

    return {
      id: `cenipa-${raw.codigo_ocorrencia}`,
      type: raw.classificacao === 'ACIDENTE' ? 'ACCIDENT' : 'SERIOUS_INCIDENT',
      visualTag: isRecent ? 'RECENT_ALERT' : 'HISTORICAL_MEMORY',
      verificationStatus: raw.relatorio_final_publicado ? 'FINAL_REPORT_CONFIRMED' : 'INVESTIGATION_ONGOING',
      date: raw.data,
      time: raw.hora,
      location: {
        description: `${raw.cidade}, ${raw.uf}`,
        city: raw.cidade,
        state: raw.uf,
        countryIso: 'BRA',
        coordinates: {
          latitude: raw.latitude,
          longitude: raw.longitude
        }
      },
      aircraft: {
        registration: raw.aeronave_matricula,
        model: raw.aeronave_modelo,
        manufacturer: raw.aeronave_fabricante
      },
      fatalities: raw.fatalidades || 0,
      injuries: 0,
      summary: raw.historico,
      investigationFindings: raw.conclusoes,
      source,
      peopleInvolved: raw.pessoas_notaveis?.map(p => ({
        fullName: p.nome,
        role: p.papel,
        publicSignificance: p.notoriedade,
        sourceReference: `Relatório SIPAER ${raw.relatorio_numero}`
      }))
    };
  }

  private static checkIfRecent(dateStr: string): boolean {
    const occ = new Date(dateStr);
    const diffDays = (Date.now() - occ.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 90;
  }
}

