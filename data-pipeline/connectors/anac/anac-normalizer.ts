import { Occurrence, OfficialSource, VisualClassification, VerificationStatus } from '@mega/types';

export interface AnacRawRow {
  Numero_da_Ocorrencia?: string;
  Data_da_Ocorrencia?: string;
  Hora_da_Ocorrencia?: string;
  Classificacao_da_Ocorrencia?: string;
  Tipo_de_Ocorrencia?: string;
  Municipio?: string;
  UF?: string;
  Pais?: string;
  Latitude?: string;
  Longitude?: string;
  Matricula?: string;
  Modelo?: string;
  Fabricante?: string;
  Operador?: string;
  Fatalidades?: string;
  Descricao_Historico?: string;
}

export class AnacNormalizer {
  private static parseCoordinate(coordStr?: string): number | null {
    if (!coordStr) return null;
    const clean = coordStr.replace(',', '.').trim();
    const val = parseFloat(clean);
    return isNaN(val) ? null : val;
  }

  private static mapVisualTag(dateStr: string): VisualClassification {
    const occDate = new Date(dateStr);
    const now = new Date();
    const diffMonths = (now.getTime() - occDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    // Ocorrências com menos de 3 meses recebem destaque vermelho de recente
    if (diffMonths <= 3) {
      return 'RECENT_ALERT';
    }
    return 'HISTORICAL_MEMORY';
  }

  public static normalize(raw: AnacRawRow): Occurrence | null {
    const lat = this.parseCoordinate(raw.Latitude);
    const lon = this.parseCoordinate(raw.Longitude);

    if (lat === null || lon === null || !raw.Numero_da_Ocorrencia || !raw.Data_da_Ocorrencia) {
      return null;
    }

    const officialSource: OfficialSource = {
      slug: 'anac',
      name: 'Agência Nacional de Aviação Civil',
      officialAgency: 'Governo Federal do Brasil',
      recordIdentifier: raw.Numero_da_Ocorrencia
    };

    return {
      id: `anac-${raw.Numero_da_Ocorrencia}`,
      type: raw.Classificacao_da_Ocorrencia === 'ACIDENTE' ? 'ACCIDENT' : 'INCIDENT',
      visualTag: this.mapVisualTag(raw.Data_da_Ocorrencia),
      verificationStatus: 'INVESTIGATION_ONGOING',
      date: raw.Data_da_Ocorrencia,
      time: raw.Hora_da_Ocorrencia,
      location: {
        description: `${raw.Municipio || 'Local não informado'}, ${raw.UF || ''}`,
        city: raw.Municipio,
        state: raw.UF,
        countryIso: 'BRA',
        coordinates: {
          latitude: lat,
          longitude: lon
        }
      },
      aircraft: {
        registration: raw.Matricula || 'N/I',
        model: raw.Modelo || 'Desconhecido',
        manufacturer: raw.Fabricante
      },
      operatorName: raw.Operador,
      fatalities: raw.Fatalidades ? parseInt(raw.Fatalidades, 10) || 0 : 0,
      injuries: 0,
      summary: raw.Descricao_Historico || 'Histórico preliminar documentado no painel da ANAC.',
      source: officialSource
    };
  }
}

