import { Occurrence, HazardObstacle, VisualClassification, VerificationStatus } from '@mega/types';
import { 
  calculateEllipsoidalWgs84DistanceKm, 
  calculateCrossTrackDistanceKm,
  interpolateRoutePoints,
  createFlightCorridorPolygon 
} from '@mega/geospatial';

export interface RouteIntelligenceRequest {
  originCode: string; // ICAO ou IATA (ex: SBGR ou GRU)
  destCode: string;   // ICAO ou IATA (ex: KJFK ou JFK)
  corridorWidthKm?: number; // Largura lateral de busca (default 40 km)
  operationType?: string;
  filters?: {
    visualTags?: VisualClassification[];
    verificationStatus?: VerificationStatus[];
    hasFatalitiesOnly?: boolean;
    startYear?: number;
  };
}

export interface RouteIntelligenceAnalysis {
  origin: {
    code: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    code: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  totalDistanceKm: number;
  initialAzimuthDeg: number;
  corridorWidthKm: number;
  
  // Ocorrências e Perigos no Corredor
  occurrences: Array<Occurrence & { distanceToRouteKm: number }>;
  hazards: Array<HazardObstacle & { distanceToRouteKm: number }>;

  // Segmentação MGA
  summaryMetrics: {
    recentAlertsCount: number;
    historicalMemoriesCount: number;
    activeHazardsCount: number;
    mitigatedHazardsCount: number;
    totalFatalities: number;
    closestEventKm: number | null;
  };

  generatedAt: string;
}

export class RouteIntelligenceService {
  /**
   * Executa a análise geográfica completa de rota pré-voo
   */
  public static analyzeRoute(
    request: RouteIntelligenceRequest,
    airportsDb: Array<{ icao: string; iata?: string; name: string; lat: number; lon: number }>,
    occurrencesDb: Occurrence[],
    hazardsDb: HazardObstacle[]
  ): RouteIntelligenceAnalysis {
    const origCode = request.originCode.toUpperCase().trim();
    const destCode = request.destCode.toUpperCase().trim();
    const corridorKm = request.corridorWidthKm || 40;

    // 1. Resolução dos aeródromos
    const origin = airportsDb.find(a => a.icao === origCode || a.iata === origCode);
    const dest = airportsDb.find(a => a.icao === destCode || a.iata === destCode);

    if (!origin || !dest) {
      throw new Error(`Aeródromo não localizado: ${!origin ? origCode : destCode}`);
    }

    const origCoords = { latitude: origin.lat, longitude: origin.lon };
    const destCoords = { latitude: dest.lat, longitude: dest.lon };

    // 2. Cálculo geodésico elipsoidal exato WGS84
    const geo = calculateEllipsoidalWgs84DistanceKm(origCoords, destCoords);

    // 3. Filtragem de ocorrências pelo corredor de voo (Cross-Track Distance)
    const matchingOccurrences = occurrencesDb
      .map(occ => {
        const dist = calculateCrossTrackDistanceKm(occ.location.coordinates, origCoords, destCoords);
        return {
          ...occ,
          distanceToRouteKm: Math.round(dist * 10) / 10
        };
      })
      .filter(occ => occ.distanceToRouteKm <= corridorKm)
      .filter(occ => {
        if (!request.filters) return true;
        if (request.filters.visualTags && !request.filters.visualTags.includes(occ.visualTag)) {
          return false;
        }
        if (request.filters.hasFatalitiesOnly && occ.fatalities === 0) {
          return false;
        }
        if (request.filters.startYear) {
          const occYear = parseInt(occ.date.split('-')[0], 10);
          if (occYear < request.filters.startYear) return false;
        }
        return true;
      })
      .sort((a, b) => a.distanceToRouteKm - b.distanceToRouteKm);

    // 4. Filtragem de obstáculos/perigos pelo corredor
    const matchingHazards = hazardsDb
      .map(haz => {
        const dist = calculateCrossTrackDistanceKm(haz.coordinates, origCoords, destCoords);
        return {
          ...haz,
          distanceToRouteKm: Math.round(dist * 10) / 10
        };
      })
      .filter(haz => haz.distanceToRouteKm <= corridorKm)
      .sort((a, b) => a.distanceToRouteKm - b.distanceToRouteKm);

    // 5. Cálculo das métricas consolidadas
    const recentAlerts = matchingOccurrences.filter(o => o.visualTag === 'RECENT_ALERT').length;
    const historicalMemories = matchingOccurrences.filter(o => o.visualTag === 'HISTORICAL_MEMORY').length;
    const activeHazards = matchingHazards.filter(h => h.status === 'ACTIVE_EXISTING').length;
    const mitigatedHazards = matchingHazards.filter(h => h.status === 'REMOVED_DEMOLISHED').length;
    const totalFatalities = matchingOccurrences.reduce((acc, o) => acc + o.fatalities, 0);

    const closestEventKm = matchingOccurrences.length > 0 ? matchingOccurrences[0].distanceToRouteKm : null;

    return {
      origin: {
        code: origin.icao,
        name: origin.name,
        latitude: origin.lat,
        longitude: origin.lon
      },
      destination: {
        code: dest.icao,
        name: dest.name,
        latitude: dest.lat,
        longitude: dest.lon
      },
      totalDistanceKm: Math.round(geo.distanceKm),
      initialAzimuthDeg: Math.round(geo.initialAzimuthDeg),
      corridorWidthKm: corridorKm,
      occurrences: matchingOccurrences,
      hazards: matchingHazards,
      summaryMetrics: {
        recentAlertsCount: recentAlerts,
        historicalMemoriesCount: historicalMemories,
        activeHazardsCount: activeHazards,
        mitigatedHazardsCount: mitigatedHazards,
        totalFatalities,
        closestEventKm
      },
      generatedAt: new Date().toISOString()
    };
  }
}

