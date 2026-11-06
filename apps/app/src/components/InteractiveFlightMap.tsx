import React, { useEffect, useMemo, useState } from 'react';
import { Occurrence, HazardObstacle } from '@mega/types';
import { interpolateRoutePoints, createFlightCorridorPolygon } from '@mega/geospatial';

interface InteractiveFlightMapProps {
  origin: { icao: string; name: string; lat: number; lon: number };
  destination: { icao: string; name: string; lat: number; lon: number };
  corridorBufferKm: number;
  occurrences: Array<Occurrence & { distanceToRouteKm?: number }>;
  hazards: Array<HazardObstacle & { distanceToRouteKm?: number }>;
  selectedOccurrence: Occurrence | null;
  onSelectOccurrence: (occ: Occurrence) => void;
  showCorridor?: boolean;
}

export const InteractiveFlightMap: React.FC<InteractiveFlightMapProps> = ({
  origin,
  destination,
  corridorBufferKm = 40,
  occurrences = [],
  hazards = [],
  selectedOccurrence,
  onSelectOccurrence,
  showCorridor = true
}) => {
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Carregamento dinâmico assíncrono seguro de leaflet e react-leaflet
    Promise.all([
      import('leaflet'),
      import('react-leaflet')
    ]).then(([leafletMod, reactLeafletMod]) => {
      setL(leafletMod.default || leafletMod);
      setLeafletComponents(reactLeafletMod);
    }).catch(err => {
      console.warn('Falha ao inicializar Leaflet dinâmico:', err);
    });
  }, []);

  const safeOriginLat = origin?.lat ?? -23.4356;
  const safeOriginLon = origin?.lon ?? -46.4731;
  const safeDestLat = destination?.lat ?? -22.9105;
  const safeDestLon = destination?.lon ?? -43.1631;

  const originLatLng: [number, number] = [safeOriginLat, safeOriginLon];
  const destLatLng: [number, number] = [safeDestLat, safeDestLon];

  // Geodésica interpolada no WGS84 Karney
  const routeLinePoints = useMemo(() => {
    try {
      const pts = interpolateRoutePoints(
        { latitude: safeOriginLat, longitude: safeOriginLon },
        { latitude: safeDestLat, longitude: safeDestLon },
        30
      );
      return pts.map(p => [p.latitude, p.longitude] as [number, number]);
    } catch {
      return [originLatLng, destLatLng];
    }
  }, [safeOriginLat, safeOriginLon, safeDestLat, safeDestLon]);

  // Polígono do Corredor Geodésico
  const corridorPolygonCoords = useMemo(() => {
    try {
      const poly = createFlightCorridorPolygon(
        { latitude: safeOriginLat, longitude: safeOriginLon },
        { latitude: safeDestLat, longitude: safeDestLon },
        corridorBufferKm || 40
      );
      if (poly?.geometry?.type === 'Polygon' && Array.isArray(poly.geometry.coordinates[0])) {
        return poly.geometry.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);
      }
    } catch {}
    return [];
  }, [safeOriginLat, safeOriginLon, safeDestLat, safeDestLon, corridorBufferKm]);

  // Enquanto o leaflet carrega em background, renderiza o cockpit view escuro com radar de pulso
  if (!LeafletComponents || !L) {
    return (
      <div className="w-full h-full bg-[#050811] flex flex-col items-center justify-center text-slate-400 font-mono text-xs select-none">
        <div className="relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#0c101a]/80 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="w-16 h-16 rounded-full border border-[#ff8800]/40 flex items-center justify-center relative">
            <div className="w-12 h-12 rounded-full border border-[#ff8800]/60 animate-ping opacity-40 absolute" />
            <div className="w-3 h-3 rounded-full bg-[#ff8800]" />
          </div>
          <div className="text-center">
            <div className="font-bold text-white text-sm tracking-wider">CARREGANDO MAPA GEODÉSICO WGS84</div>
            <div className="text-[10px] text-slate-500 mt-1">Sintonizando camadas de terreno e obstáculos...</div>
          </div>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, CircleMarker } = LeafletComponents;

  const createPin = (colorHex: string, label: string) => {
    return L.divIcon({
      className: 'custom-efb-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${colorHex}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${colorHex};"></div>
          ${label ? `<span style="margin-top: 2px; font-size: 9px; font-weight: 800; font-family: monospace; color: #f1f5f9; background: rgba(15, 23, 42, 0.85); padding: 1px 4px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">${label}</span>` : ''}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 7],
      popupAnchor: [0, -10]
    });
  };

  return (
    <div className="w-full h-full relative bg-[#070b14]">
      <MapContainer
        center={originLatLng}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ width: '100%', height: '100%', background: '#070b14' }}
      >
        <TileLayer
          attribution='&copy; CARTO &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {showCorridor && corridorPolygonCoords.length > 0 && (
          <Polygon
            positions={corridorPolygonCoords}
            pathOptions={{
              color: '#ff8800',
              fillColor: '#ff8800',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 6'
            }}
          />
        )}

        <Polyline
          positions={routeLinePoints}
          pathOptions={{
            color: '#ff8800',
            weight: 3,
            opacity: 0.95
          }}
        />

        <Marker position={originLatLng} icon={createPin('#ff8800', origin?.icao || 'ORIGEM')}>
          <Popup>
            <div className="p-1 font-sans text-xs">
              <span className="font-bold text-orange-400 block">{origin?.icao} — Origem</span>
              <p className="text-slate-800 font-medium">{origin?.name}</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={destLatLng} icon={createPin('#ff8800', destination?.icao || 'DESTINO')}>
          <Popup>
            <div className="p-1 font-sans text-xs">
              <span className="font-bold text-orange-400 block">{destination?.icao} — Destino</span>
              <p className="text-slate-800 font-medium">{destination?.name}</p>
            </div>
          </Popup>
        </Marker>

        {Array.isArray(occurrences) && occurrences.map((occ) => {
          const lat = occ?.location?.coordinates?.latitude;
          const lon = occ?.location?.coordinates?.longitude;
          if (!lat || !lon) return null;
          return (
            <Marker
              key={occ.id}
              position={[lat, lon]}
              icon={createPin('#ef4444', occ?.aircraft?.registration || 'ACFT')}
              eventHandlers={{ click: () => onSelectOccurrence(occ) }}
            >
              <Popup>
                <div className="font-sans text-xs p-1 max-w-xs text-slate-900">
                  <div className="font-bold border-b pb-1 mb-1">{occ?.aircraft?.model || 'Aeronave'}</div>
                  <p className="text-[11px] text-slate-700">{occ?.summary}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {Array.isArray(hazards) && hazards.map((haz) => {
          const lat = haz?.coordinates?.latitude;
          const lon = haz?.coordinates?.longitude;
          if (!lat || !lon) return null;
          return (
            <Marker key={haz.id} position={[lat, lon]} icon={createPin('#f59e0b', 'OBS')}>
              <Popup>
                <div className="font-sans text-xs p-1 max-w-xs text-slate-900">
                  <span className="font-bold text-amber-700 block">⚠️ {haz.type}</span>
                  <p className="text-[11px] text-slate-700">{haz.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
