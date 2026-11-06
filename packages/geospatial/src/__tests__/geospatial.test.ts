import { describe, it, expect } from 'vitest';
import { 
  calculateGeodesicDistanceKm,
  calculateEllipsoidalWgs84DistanceKm,
  calculateCrossTrackDistanceKm, 
  calculateInitialBearing,
  interpolateRoutePoints,
  createFlightCorridorPolygon
} from '../index.js';

describe('MGA Geospatial Engine (GeographicLib WGS84 & Turf)', () => {
  // Congonhas (SBSP) para Santos Dumont (SBRJ) - Ponte Aérea clássica
  const sbsp = { latitude: -23.6261, longitude: -46.6564 };
  const sbrj = { latitude: -22.9105, longitude: -43.1631 };

  it('deve calcular a distância elipsoidal WGS84 exata com precisão geodésica', () => {
    const res = calculateEllipsoidalWgs84DistanceKm(sbsp, sbrj);
    // Distância elipsoidal precisa entre SBSP e SBRJ ~366.19 km
    expect(res.distanceKm).toBeGreaterThan(365);
    expect(res.distanceKm).toBeLessThan(368);
    // Azimute verdadeiro SBSP -> SBRJ é ~78.19°
    expect(res.initialAzimuthDeg).toBeGreaterThan(70);
    expect(res.initialAzimuthDeg).toBeLessThan(85);
  });

  it('deve lidar corretamente com altas latitudes (Rota Transpolar / Alasca -> Noruega)', () => {
    const anchorage = { latitude: 61.1744, longitude: -149.9964 };
    const oslo = { latitude: 60.1976, longitude: 11.1004 };

    const res = calculateEllipsoidalWgs84DistanceKm(anchorage, oslo);
    // Rota polar de ~6500 km
    expect(res.distanceKm).toBeGreaterThan(6000);
    expect(res.distanceKm).toBeLessThan(7000);

    const waypoints = interpolateRoutePoints(anchorage, oslo, 20);
    expect(waypoints.length).toBe(21);
    // Verifica se a rota sobe para latitudes próximas ao polo (> 80 graus N)
    const maxLat = Math.max(...waypoints.map(w => w.latitude));
    expect(maxLat).toBeGreaterThan(78);
  });

  it('deve calcular distância Cross-Track (distância lateral da rota ao ponto)', () => {
    const midpoint = { latitude: -23.26, longitude: -44.90 };
    const lateralDist = calculateCrossTrackDistanceKm(midpoint, sbsp, sbrj);
    expect(lateralDist).toBeLessThan(15);
  });

  it('deve criar polígono de corredor de voo (Buffer geoespacial)', () => {
    const corridor = createFlightCorridorPolygon(sbsp, sbrj, 40);
    expect(corridor.type).toBe('Feature');
    expect(corridor.geometry.type).toBe('Polygon');
  });
});
