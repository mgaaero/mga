import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Occurrence, HazardObstacle } from '@mega/types';
import { interpolateRoutePoints, createFlightCorridorPolygon } from '@mega/geospatial';

// DivIcon customizado aeronáutico estilo cockpit EFB
function createEfbPin(colorHex: string, label: string, pulse: boolean = false) {
  return L.divIcon({
    className: 'custom-efb-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        ${pulse ? `<div style="position: absolute; top: 0; width: 22px; height: 22px; border-radius: 50%; background-color: ${colorHex}; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${colorHex}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${colorHex};"></div>
        ${label ? `<span style="margin-top: 2px; font-size: 9px; font-weight: 800; font-family: monospace; color: #f1f5f9; background: rgba(15, 23, 42, 0.85); padding: 1px 4px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">${label}</span>` : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 7],
    popupAnchor: [0, -10]
  });
}

function MapBoundsController({
  originCoords,
  destCoords,
  occurrences
}: {
  originCoords: [number, number];
  destCoords: [number, number];
  occurrences: Occurrence[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [originCoords, destCoords];
    occurrences.forEach(occ => {
      points.push([occ.location.coordinates.latitude, occ.location.coordinates.longitude]);
    });

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
    }
  }, [map, originCoords, destCoords, occurrences]);

  return null;
}

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
  corridorBufferKm,
  occurrences,
  hazards,
  selectedOccurrence,
  onSelectOccurrence,
  showCorridor = true
}) => {
  const originLatLng: [number, number] = [origin.lat, origin.lon];
  const destLatLng: [number, number] = [destination.lat, destination.lon];

  // Geodésica interpolada no WGS84 Karney para a rota Great Circle
  const routeLinePoints = useMemo(() => {
    const pts = interpolateRoutePoints(
      { latitude: origin.lat, longitude: origin.lon },
      { latitude: destination.lat, longitude: destination.lon },
      40
    );
    return pts.map(p => [p.latitude, p.longitude] as [number, number]);
  }, [origin, destination]);

  // Polígono do Corredor de Voo (Buffer lateral configurado)
  const corridorPolygonCoords = useMemo(() => {
    const poly = createFlightCorridorPolygon(
      { latitude: origin.lat, longitude: origin.lon },
      { latitude: destination.lat, longitude: destination.lon },
      corridorBufferKm
    );
    if (poly.geometry.type === 'Polygon') {
      return poly.geometry.coordinates[0].map(coord => [coord[1], coord[0]] as [number, number]);
    }
    return [];
  }, [origin, destination, corridorBufferKm]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[origin.lat, origin.lon]}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        {/* CartoDB Dark Matter Tiles (Estilo Cockpit Aviador Noturno) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsController
          originCoords={originLatLng}
          destCoords={destLatLng}
          occurrences={occurrences}
        />

        {/* Polígono do Corredor Geográfico EFB (Buffer lateral de proteção e pesquisa) */}
        {showCorridor && corridorPolygonCoords.length > 0 && (
          <Polygon
            positions={corridorPolygonCoords}
            pathOptions={{
              color: '#38bdf8',
              fillColor: '#0284c7',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 6'
            }}
          />
        )}

        {/* Linha Geodésica Great Circle da Rota */}
        <Polyline
          positions={routeLinePoints}
          pathOptions={{
            color: '#ffffff',
            weight: 3.5,
            opacity: 0.95
          }}
        />

        {/* Marcador Origem */}
        <Marker 
          position={originLatLng} 
          icon={createEfbPin('#38bdf8', origin.icao)}
        >
          <Popup className="aviation-popup">
            <div className="p-1 font-sans text-xs">
              <span className="font-bold text-sky-400 block">{origin.icao} — Origem</span>
              <p className="text-slate-800 font-medium">{origin.name}</p>
            </div>
          </Popup>
        </Marker>

        {/* Marcador Destino */}
        <Marker 
          position={destLatLng} 
          icon={createEfbPin('#38bdf8', destination.icao)}
        >
          <Popup className="aviation-popup">
            <div className="p-1 font-sans text-xs">
              <span className="font-bold text-sky-400 block">{destination.icao} — Destino</span>
              <p className="text-slate-800 font-medium">{destination.name}</p>
            </div>
          </Popup>
        </Marker>

        {/* Marcadores de Ocorrências MGA */}
        {occurrences.map((occ) => {
          const lat = occ.location.coordinates.latitude;
          const lon = occ.location.coordinates.longitude;
          const isSelected = selectedOccurrence?.id === occ.id;

          let color = '#94a3b8'; // ⚪
          let isPulse = false;
          if (occ.visualTag === 'RECENT_ALERT') {
            color = '#ef4444'; // 🔴
            isPulse = true;
          } else if (occ.visualTag === 'IDENTIFIED_HAZARD') {
            color = '#f97316'; // 🟠
          } else if (occ.visualTag === 'MITIGATED_REMOVED') {
            color = '#10b981'; // 🟢
          }

          const icon = createEfbPin(color, occ.aircraft?.registration || '', isPulse);

          return (
            <React.Fragment key={occ.id}>
              {isSelected && (
                <CircleMarker
                  center={[lat, lon]}
                  radius={20}
                  pathOptions={{
                    color: '#38bdf8',
                    fillColor: '#38bdf8',
                    fillOpacity: 0.25,
                    weight: 2
                  }}
                />
              )}
              <Marker
                position={[lat, lon]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectOccurrence(occ)
                }}
              >
                <Popup>
                  <div className="font-sans text-xs p-1 max-w-xs text-slate-900">
                    <div className="font-bold border-b pb-1 mb-1 text-slate-900">
                      {occ.aircraft?.model || 'Aeronave'} — {occ.aircraft?.registration || 'N/A'}
                    </div>
                    <p className="text-[11px] text-slate-700 leading-tight mb-1">{occ.summary}</p>
                    <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                      <span>Data: {occ.date}</span>
                      <span>Lateral: ~{occ.distanceToRouteKm} km</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Marcadores de Perigos e Obstáculos (Torres, Linhas) */}
        {hazards.map((haz) => (
          <Marker
            key={haz.id}
            position={[haz.coordinates.latitude, haz.coordinates.longitude]}
            icon={createEfbPin('#f59e0b', 'OBS')}
          >
            <Popup>
              <div className="font-sans text-xs p-1 max-w-xs text-slate-900">
                <span className="font-bold text-amber-700 block">⚠️ {haz.type}</span>
                <p className="text-[11px] text-slate-700">{haz.description}</p>
                {haz.heightAglFt && (
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Altura: {haz.heightAglFt} ft AGL • Lateral: ~{haz.distanceToRouteKm} km
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
