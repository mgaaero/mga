import { describe, it, expect } from 'vitest';
import { AnacNormalizer, AnacRawRow } from '../anac/anac-normalizer.js';
import { CenipaNormalizer, CenipaRawReport } from '../cenipa/cenipa-normalizer.js';
import { NtsbNormalizer, NtsbRawRecord } from '../ntsb/ntsb-normalizer.js';
import { FaaObstacleNormalizer, FaaDofRawRecord } from '../obstacles/faa-dof-normalizer.js';

describe('Data Connectors & Normalizers Validation', () => {
  it('ANAC: normaliza ocorrência oficial preservando rastreabilidade e coordenadas', () => {
    const raw: AnacRawRow = {
      Numero_da_Ocorrencia: '20230510123',
      Data_da_Ocorrencia: '2023-05-10',
      Hora_da_Ocorrencia: '14:20:00',
      Classificacao_da_Ocorrencia: 'ACIDENTE',
      Municipio: 'Campinas',
      UF: 'SP',
      Latitude: '-23,0074',
      Longitude: '-47,1345',
      Matricula: 'PR-ABC',
      Modelo: 'C172',
      Fabricante: 'Cessna',
      Operador: 'Escola de Aviação Alpha',
      Fatalidades: '0',
      Descricao_Historico: 'Pouso duro durante instrução.'
    };

    const normalized = AnacNormalizer.normalize(raw);
    expect(normalized).not.toBeNull();
    expect(normalized?.source.slug).toBe('anac');
    expect(normalized?.source.recordIdentifier).toBe('20230510123');
    expect(normalized?.location.coordinates.latitude).toBeCloseTo(-23.0074);
    expect(normalized?.location.coordinates.longitude).toBeCloseTo(-47.1345);
    expect(normalized?.visualTag).toBe('HISTORICAL_MEMORY');
  });

  it('CENIPA: preserva pessoas documentadas e relatório final SIPAER', () => {
    const raw: CenipaRawReport = {
      codigo_ocorrencia: '80999',
      classificacao: 'ACIDENTE',
      tipo: 'COLISÃO COM OBSTÁCULO',
      data: '2021-11-05',
      hora: '15:30:00',
      cidade: 'Caratinga',
      uf: 'MG',
      latitude: -19.8247,
      longitude: -42.1444,
      aeronave_matricula: 'PT-ONJ',
      aeronave_modelo: 'Beechcraft King Air C90A',
      aeronave_fabricante: 'Beech Aircraft',
      relatorio_final_publicado: true,
      relatorio_numero: 'A-145/CENIPA/2021',
      fatalidades: 5,
      historico: 'Colisão com linha de transmissão.',
      pessoas_notaveis: [
        {
          nome: 'Marília Dias Mendonça',
          papel: 'PUBLIC_FIGURE',
          notoriedade: 'Cantora'
        }
      ]
    };

    const normalized = CenipaNormalizer.normalize(raw);
    expect(normalized.source.slug).toBe('cenipa');
    expect(normalized.source.recordIdentifier).toBe('A-145/CENIPA/2021');
    expect(normalized.verificationStatus).toBe('FINAL_REPORT_CONFIRMED');
    expect(normalized.peopleInvolved?.length).toBe(1);
    expect(normalized.peopleInvolved?.[0].fullName).toBe('Marília Dias Mendonça');
  });

  it('NTSB: normaliza registros históricos de 1962 até presente com CAROL query', () => {
    const raw: NtsbRawRecord = {
      ev_id: '20090115X12345',
      ntsb_no: 'DCA09MA026',
      ev_type: 'ACC',
      ev_date: '01/15/2009',
      ev_city: 'New York',
      ev_state: 'NY',
      latitude: 40.7695,
      longitude: -74.0076,
      acft_model: 'A320-214',
      acft_make: 'Airbus',
      regis_no: 'N106US',
      inj_tot_f: 0,
      inj_tot_s: 5,
      narr_cause: 'Bird strike causing dual engine failure.'
    };

    const normalized = NtsbNormalizer.normalize(raw);
    expect(normalized).not.toBeNull();
    expect(normalized?.date).toBe('2009-01-15');
    expect(normalized?.source.slug).toBe('ntsb');
    expect(normalized?.location.countryIso).toBe('USA');
    expect(normalized?.verificationStatus).toBe('FINAL_REPORT_CONFIRMED');
  });

  it('FAA Obstacles: diferencia obstáculo existente de obstáculo demolido/removido', () => {
    const rawActive: FaaDofRawRecord = {
      oas_number: '36-000123',
      obstacle_type: 'TOWER',
      city: 'Miami',
      state: 'FL',
      latitude: 25.7617,
      longitude: -80.1918,
      agl_height: 450,
      action: 'A'
    };

    const rawDismantled: FaaDofRawRecord = {
      oas_number: '36-000124',
      obstacle_type: 'CRANE',
      city: 'Orlando',
      state: 'FL',
      latitude: 28.5383,
      longitude: -81.3792,
      action: 'D'
    };

    const active = FaaObstacleNormalizer.normalize(rawActive);
    const dismantled = FaaObstacleNormalizer.normalize(rawDismantled);

    expect(active?.status).toBe('ACTIVE_EXISTING');
    expect(dismantled?.status).toBe('REMOVED_DEMOLISHED');
  });
});
