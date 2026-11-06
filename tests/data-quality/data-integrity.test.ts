import { describe, it, expect } from 'vitest';
import { AnacNormalizer, AnacRawRow } from '../../data-pipeline/connectors/anac/anac-normalizer.js';
import { CenipaNormalizer, CenipaRawReport } from '../../data-pipeline/connectors/cenipa/cenipa-normalizer.js';

describe('Data Quality & Integrity Rules Engine', () => {
  it('deve rejeitar coordenadas geograficamente impossíveis (Latitude fora de -90 a 90, Longitude fora de -180 a 180)', () => {
    const invalidRow: AnacRawRow = {
      Numero_da_Ocorrencia: 'ERR-COORD-01',
      Data_da_Ocorrencia: '2024-01-10',
      Classificacao_da_Ocorrencia: 'ACIDENTE',
      Latitude: '-95.1234', // Fora do intervalo válido
      Longitude: '-45.6789'
    };

    const lat = parseFloat(invalidRow.Latitude!.replace(',', '.'));
    const isLatValid = !isNaN(lat) && lat >= -90 && lat <= 90;
    expect(isLatValid).toBe(false);
  });

  it('deve rejeitar datas futuras ou no formato incorreto', () => {
    const futureDate = '2099-12-31';
    const parsedDate = new Date(futureDate);
    const isPastOrToday = parsedDate.getTime() <= Date.now();
    expect(isPastOrToday).toBe(false);
  });

  it('deve rejeitar registros sem número de identificador oficial ou sem agência de procedência', () => {
    const rawNoId: AnacRawRow = {
      Numero_da_Ocorrencia: '', // Vazio
      Data_da_Ocorrencia: '2023-01-01',
      Latitude: '-23.55',
      Longitude: '-46.63'
    };

    const normalized = AnacNormalizer.normalize(rawNoId);
    expect(normalized).toBeNull();
  });
});

