import { Coordinates } from '@mega/types';
import * as turf from '@turf/turf';
import { Geodesic } from 'geographiclib-geodesic';

// Inicializa elipsoide WGS84 oficial Karney / GeographicLib
const geod = Geodesic.WGS84;

/**
 * Raio médio esférico da Terra em km (IUGG)
 */
export const WGS84_EARTH_RADIUS_KM = 6371.0088;

/**
 * CÁLCULO ELIPSOIDAL WGS84 EXATO (GeographicLib)
 * Resolve o problema inverso da geodésia no elipsoide de referência WGS84.
 * Precisão milimétrica sem simplificações esféricas.
 */
export function calculateEllipsoidalWgs84DistanceKm(p1: Coordinates, p2: Coordinates): {
  distanceKm: number;
  initialAzimuthDeg: number;
  finalAzimuthDeg: number;
} {
  const r = geod.Inverse(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
  return {
    distanceKm: (r.s12 ?? 0) / 1000.0,
    initialAzimuthDeg: (r.azi1 ?? 0 + 360) % 360,
    finalAzimuthDeg: (r.azi2 ?? 0 + 360) % 360
  };
}

/**
 * Distância geodésica em km calculada no elipsoide WGS84
 */
export function calculateGeodesicDistanceKm(p1: Coordinates, p2: Coordinates): number {
  return calculateEllipsoidalWgs84DistanceKm(p1, p2).distanceKm;
}

/**
 * Azimute inicial geodésico (rumo verdadeiro 0-360°) no elipsoide WGS84
 */
export function calculateGeodesicBearing(p1: Coordinates, p2: Coordinates): number {
  return calculateEllipsoidalWgs84DistanceKm(p1, p2).initialAzimuthDeg;
}

/**
 * Calcula a distância perpendicular (Cross-Track Distance) em quilômetros
 * de um ponto até a linha geodésica da rota utilizando pointToLineDistance do Turf.
 */
export function calculateCrossTrackDistanceKm(
  point: Coordinates,
  routeStart: Coordinates,
  routeEnd: Coordinates
): number {
  const pt = turf.point([point.longitude, point.latitude]);
  const line = turf.lineString([
    [routeStart.longitude, routeStart.latitude],
    [routeEnd.longitude, routeEnd.latitude]
  ]);
  return turf.pointToLineDistance(pt, line, { units: 'kilometers' });
}

/**
 * Gera os pontos geodésicos interpolados ao longo do Grande Círculo / Geodésica
 */
export function interpolateRoutePoints(
  start: Coordinates,
  end: Coordinates,
  numPoints: number = 40
): Coordinates[] {
  // Gera linha geodésica pelo GeographicLib
  const line = geod.InverseLine(start.latitude, start.longitude, end.latitude, end.longitude);
  const totalDist = line.s13 ?? 0;
  const points: Coordinates[] = [];

  if (totalDist === 0) return [start];

  for (let i = 0; i <= numPoints; i++) {
    const s = (totalDist * i) / numPoints;
    const pos = line.Position(s);
    points.push({
      latitude: pos.lat2 ?? start.latitude,
      longitude: pos.lon2 ?? start.longitude
    });
  }

  return points;
}

/**
 * Gera um polígono de Corredor de Voo (Buffer em km) ao redor da rota
 */
export function createFlightCorridorPolygon(
  start: Coordinates,
  end: Coordinates,
  corridorBufferKm: number
): GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> {
  // Cria rota com os pontos geodésicos exatos para evitar distorções
  const waypoints = interpolateRoutePoints(start, end, 30);
  const coords = waypoints.map(w => [w.longitude, w.latitude]);
  const line = turf.lineString(coords);
  return turf.buffer(line, corridorBufferKm, { units: 'kilometers' }) as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
}

// Retrocompatibilidade
export const calculateGreatCircleDistanceKm = calculateGeodesicDistanceKm;
export const calculateInitialBearing = calculateGeodesicBearing;
