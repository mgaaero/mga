import { HazardObstacle } from '@mega/types';

export interface FaaDofRawRecord {
  oas_number?: string;
  obstacle_type?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  agl_height?: number; // Above Ground Level (ft)
  amsl_height?: number; // Above Mean Sea Level (ft)
  lighting?: string;
  marking?: string;
  action?: 'A' | 'C' | 'D'; // Add, Change, Dismantled/Removed
}

export class FaaObstacleNormalizer {
  public static normalize(raw: FaaDofRawRecord): HazardObstacle | null {
    if (!raw.latitude || !raw.longitude) {
      return null;
    }

    // Se a ação da FAA for 'D' (Dismantled), marcamos como removido documentado
    const status = raw.action === 'D' ? 'REMOVED_DEMOLISHED' : 'ACTIVE_EXISTING';

    return {
      id: `faa-dof-${raw.oas_number || Math.random().toString(36).substring(7)}`,
      type: this.mapType(raw.obstacle_type),
      status,
      description: `${raw.obstacle_type || 'Obstáculo Aeronáutico'} em ${raw.city || 'localidade'}, ${raw.state || 'EUA'}`,
      coordinates: {
        latitude: raw.latitude,
        longitude: raw.longitude
      },
      heightAglFt: raw.agl_height,
      heightAmslFt: raw.amsl_height,
      lightingType: raw.lighting || 'Padrão FAA',
      sourceAgency: 'FAA - Federal Aviation Administration (DOF)',
      verifiedAt: new Date().toISOString().split('T')[0]
    };
  }

  private static mapType(type?: string): HazardObstacle['type'] {
    if (!type) return 'OTHER';
    const upper = type.toUpperCase();
    if (upper.includes('TOWER')) return 'COMMUNICATION_TOWER';
    if (upper.includes('LINE') || upper.includes('WIRE')) return 'TRANSMISSION_LINE';
    if (upper.includes('ANTENNA')) return 'ANTENNA';
    if (upper.includes('WINDMILL') || upper.includes('TURBINE')) return 'WIND_TURBINE';
    return 'OTHER';
  }
}

