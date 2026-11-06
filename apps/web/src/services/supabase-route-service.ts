import { supabase } from '../lib/supabase';
import { Occurrence, Airport } from '@mega/types';

export interface RemoteRouteResult {
  originAirport: Airport | null;
  destAirport: Airport | null;
  occurrences: Occurrence[];
  totalDistanceKm: number;
  isLiveSupabase: boolean;
  emptyStateReason?: string;
}

export class SupabaseRouteService {
  /**
   * Busca um aeródromo no banco remoto Supabase por código ICAO ou Ident
   */
  static async fetchAirport(code: string): Promise<Airport | null> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return null;

    try {
      const { data, error } = await supabase
        .from('airports')
        .select('*')
        .or(`icao.eq.${cleanCode},ident.eq.${cleanCode}`)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      // Converte coordenadas GeoJSON { type: 'Point', coordinates: [lon, lat] }
      let lat = 0;
      let lon = 0;
      if (data.coordinates && data.coordinates.coordinates) {
        lon = data.coordinates.coordinates[0];
        lat = data.coordinates.coordinates[1];
      }

      return {
        ident: data.ident,
        name: data.name,
        type: data.airport_type || 'medium_airport',
        latitude: lat,
        longitude: lon,
        lat: lat,
        lon: lon,
        elevationFt: data.elevation_ft || 0,
        countryIso: data.country_iso || 'UNK',
        country: data.country_iso || 'UNK',
        city: data.municipality || '',
        municipality: data.municipality || '',
        icao: data.icao || data.ident,
        iata: data.iata || undefined
      };
    } catch (err) {
      console.error('Erro ao buscar aeródromo remoto:', err);
      return null;
    }
  }

  /**
   * Executa a RPC PostGIS search_route_memory no Supabase remoto
   */
  static async searchRouteMemory(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number,
    corridorKm: number
  ): Promise<Occurrence[]> {
    try {
      const { data, error } = await supabase.rpc('search_route_memory', {
        origin_lat: originLat,
        origin_lon: originLon,
        dest_lat: destLat,
        dest_lon: destLon,
        corridor_km: corridorKm
      });

      if (error) {
        console.error('Erro na RPC search_route_memory:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((item: any) => ({
        id: item.occurrence_id,
        type: item.occurrence_type,
        visualTag: item.visual_tag,
        verificationStatus: 'FINAL_REPORT_CONFIRMED',
        date: item.occurrence_date,
        location: {
          description: item.location_desc || 'Local documentado',
          city: '',
          state: '',
          countryIso: 'BRA',
          coordinates: {
            latitude: item.lat,
            longitude: item.lon,
            elevationFt: 0
          }
        },
        aircraft: {
          registration: item.aircraft_reg || 'N/I',
          model: item.aircraft_model || 'Não informado',
          manufacturer: '',
          aircraftCategory: 'Avião'
        },
        operatorName: 'Operador Documentado',
        flightPhase: 'Em voo',
        fatalities: item.fatalities || 0,
        injuries: 0,
        summary: item.summary || '',
        investigationFindings: `Ocorrência oficial registrada. Distância lateral da rota: ${Math.round(item.dist_to_route_km)} km.`,
        source: {
          slug: 'cenipa',
          name: 'Registro Oficial Investigado',
          officialAgency: 'Autoridade de Aviação Civil',
          recordIdentifier: item.source_record
        }
      }));
    } catch (err) {
      console.error('Falha ao consultar search_route_memory no Supabase:', err);
      throw err;
    }
  }
}
