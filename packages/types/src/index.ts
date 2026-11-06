/**
 * MEGA - Memória Geográfica da Aviação
 * Definições canônicas de domínio
 */

export type VisualClassification = 
  | 'RECENT_ALERT'      // 🔴 Vermelho: Ocorrência recente / perigo confirmado ativo
  | 'IDENTIFIED_HAZARD'  // 🟠 Laranja: Obstáculos ou riscos que exigem atenção
  | 'HISTORICAL_MEMORY'  // ⚪ Cinza: Memória histórica preservada para consulta
  | 'MITIGATED_REMOVED'; // 🟢 Verde: Perigo eliminado ou mitigado documentadamente

export type OccurrenceType = 
  | 'ACCIDENT' 
  | 'SERIOUS_INCIDENT' 
  | 'INCIDENT' 
  | 'AIR_PROXIMITY' 
  | 'HAZARD_ALERT';

export type VerificationStatus = 
  | 'PRELIMINARY' 
  | 'INVESTIGATION_ONGOING' 
  | 'FINAL_REPORT_CONFIRMED' 
  | 'UNVERIFIED';

export type OperationType = 
  | 'COMMERCIAL_SCHEDULED' 
  | 'GENERAL_AVIATION' 
  | 'AIR_TAXI' 
  | 'CARGO' 
  | 'HELICOPTER' 
  | 'MILITARY' 
  | 'OTHER';

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevationFt?: number;
}

export interface AircraftInfo {
  registration: string; // ex: PT-XXX, PR-SOM, N12345
  model: string;        // ex: Beechcraft King Air C90A, Boeing 737-800
  manufacturer?: string;
  serialNumber?: string;
  aircraftCategory?: string;
}

export interface PersonInvolved {
  fullName: string;
  role: 'PILOT' | 'COPILOT' | 'PASSENGER' | 'CREW' | 'PUBLIC_FIGURE';
  publicSignificance?: string;
  sourceReference: string;
}

export interface OfficialSource {
  slug: 'cenipa' | 'anac' | 'ntsb' | 'faa_obstacles' | 'icao';
  name: string;
  officialAgency: string;
  recordIdentifier: string;
  reportUrl?: string;
  publicationDate?: string;
}

export interface Occurrence {
  id: string;
  type: OccurrenceType;
  visualTag: VisualClassification;
  verificationStatus: VerificationStatus;
  date: string; // YYYY-MM-DD
  time?: string;
  location: {
    description: string;
    city?: string;
    state?: string;
    countryIso: string;
    coordinates: Coordinates;
  };
  aircraft?: AircraftInfo;
  operatorName?: string;
  flightPhase?: string;
  fatalities: number;
  injuries: number;
  summary: string;
  investigationFindings?: string;
  source: OfficialSource;
  peopleInvolved?: PersonInvolved[];
  distanceToRouteKm?: number;
}

export interface HazardObstacle {
  id: string;
  type: 'TRANSMISSION_LINE' | 'COMMUNICATION_TOWER' | 'ANTENNA' | 'WIND_TURBINE' | 'TERRAIN_OBSTACLE' | 'OTHER';
  status: 'ACTIVE_EXISTING' | 'REMOVED_DEMOLISHED' | 'UNCONFIRMED';
  description: string;
  coordinates: Coordinates;
  heightAglFt?: number;
  heightAmslFt?: number;
  lightingType?: string;
  sourceAgency: string;
  verifiedAt?: string;
  distanceToRouteKm?: number;
}

export interface PreFlightRouteQuery {
  origin: {
    query: string;
    name: string;
    icao?: string;
    coordinates: Coordinates;
  };
  destination: {
    query: string;
    name: string;
    icao?: string;
    coordinates: Coordinates;
  };
  operationType: OperationType;
  corridorBufferKm: number;
  occurrences: Occurrence[];
  hazards: HazardObstacle[];
  timestamp: string;
}

