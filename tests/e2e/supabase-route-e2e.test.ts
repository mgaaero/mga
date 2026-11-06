import { describe, it, expect } from 'vitest';
import { SupabaseRouteService } from '../../apps/web/src/services/supabase-route-service';

describe('E2E Live Supabase Integration Tests', () => {
  it('1. Deve resolver aeródromos reais do Supabase (SBGR e SBRJ)', async () => {
    const sbgr = await SupabaseRouteService.fetchAirport('SBGR');
    const sbrj = await SupabaseRouteService.fetchAirport('SBRJ');

    expect(sbgr).not.toBeNull();
    expect(sbgr?.ident).toBe('SBGR');
    expect(sbgr?.latitude).toBeCloseTo(-23.435556, 2);
    expect(sbgr?.longitude).toBeCloseTo(-46.473056, 2);

    expect(sbrj).not.toBeNull();
    expect(sbrj?.ident).toBe('SBRJ');
    expect(sbrj?.latitude).toBeCloseTo(-22.910556, 2);
    expect(sbrj?.longitude).toBeCloseTo(-43.163056, 2);
  }, 15000);

  it('2. Deve retornar vazio para ICAO inexistente', async () => {
    const nonExistent = await SupabaseRouteService.fetchAirport('XXXX');
    expect(nonExistent).toBeNull();
  });

  it('3. Deve executar search_route_memory no Supabase e respeitar corredor', async () => {
    // Rota Caratinga (coordenadas do acidente verídico PT-ONJ)
    const resultsCaratinga = await SupabaseRouteService.searchRouteMemory(
      -23.435556, -46.473056, // SBGR
      -19.8247, -42.1444,     // Caratinga
      60.0
    );

    expect(Array.isArray(resultsCaratinga)).toBe(true);
    expect(resultsCaratinga.length).toBeGreaterThan(0);
    expect(resultsCaratinga[0].aircraft?.registration).toBe('PT-ONJ');
    expect(resultsCaratinga[0].source.recordIdentifier).toBe('A-145/CENIPA/2021');

    // Rota sem acidentes na base remota
    const resultsEmpty = await SupabaseRouteService.searchRouteMemory(
      -23.435556, -46.473056, // SBGR
      -22.910556, -43.163056, // SBRJ
      60.0
    );
    expect(Array.isArray(resultsEmpty)).toBe(true);
    expect(resultsEmpty.length).toBe(0);
  });
});
