import { describe, it, expect } from 'vitest';
import { RouteIntelligenceService } from '../route-intelligence-service.js';
import { AIRPORTS_DATABASE, HISTORICAL_OCCURRENCES_SEED, HAZARDS_SEED } from '../index.js';

describe('RouteIntelligenceService Integration Test', () => {
  it('deve processar rota SBSP -> SBRJ e retornar eventos dentro do corredor lateral de 40 km', () => {
    const analysis = RouteIntelligenceService.analyzeRoute(
      {
        originCode: 'SBSP',
        destCode: 'SBRJ',
        corridorWidthKm: 40
      },
      AIRPORTS_DATABASE,
      HISTORICAL_OCCURRENCES_SEED,
      HAZARDS_SEED
    );

    expect(analysis.origin.code).toBe('SBSP');
    expect(analysis.destination.code).toBe('SBRJ');
    expect(analysis.totalDistanceKm).toBeGreaterThan(360);
    expect(analysis.totalDistanceKm).toBeLessThan(370);
    expect(analysis.initialAzimuthDeg).toBe(78);
    expect(analysis.corridorWidthKm).toBe(40);

    // Deve identificar a ocorrência de Congonhas (SBSP) pois dist = 0 km da cabeceira
    const congonhasOcc = analysis.occurrences.find(o => o.location.city === 'São Paulo');
    expect(congonhasOcc).toBeDefined();
    expect(congonhasOcc?.distanceToRouteKm).toBeLessThanOrEqual(5);

    // Ocorrência de Nova York (Rio Hudson) deve estar FORA do corredor
    const hudsonOcc = analysis.occurrences.find(o => o.location.city === 'New York');
    expect(hudsonOcc).toBeUndefined();
  });

  it('deve aplicar filtros por categoria visual e status de verificação', () => {
    const analysis = RouteIntelligenceService.analyzeRoute(
      {
        originCode: 'SBGR',
        destCode: 'KJFK',
        corridorWidthKm: 200,
        filters: {
          hasFatalitiesOnly: true
        }
      },
      AIRPORTS_DATABASE,
      HISTORICAL_OCCURRENCES_SEED,
      HAZARDS_SEED
    );

    // Todas as ocorrências retornadas devem ter fatalidades > 0
    analysis.occurrences.forEach(occ => {
      expect(occ.fatalities).toBeGreaterThan(0);
    });
  });
});
