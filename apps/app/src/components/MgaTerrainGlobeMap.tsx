import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Occurrence, HazardObstacle } from '@mega/types';
import { Layers, Mountain, Eye, Compass, Box, Maximize2 } from 'lucide-react';

interface TerrainGlobeMapProps {
  origin: { icao: string; name: string; lat: number; lon: number };
  destination: { icao: string; name: string; lat: number; lon: number };
  corridorBufferKm: number;
  occurrences: Occurrence[];
  hazards: HazardObstacle[];
  selectedOccurrence: Occurrence | null;
  onSelectOccurrence: (occ: Occurrence) => void;
}

export const MgaTerrainGlobeMap: React.FC<TerrainGlobeMapProps> = ({
  origin,
  destination,
  corridorBufferKm,
  occurrences,
  hazards,
  selectedOccurrence,
  onSelectOccurrence
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [is3DActive, setIs3DActive] = useState(true);
  const [mapStyle, setMapStyle] = useState<'TERRAIN' | 'SATELLITE' | 'DARK'>('DARK');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicialização do MapLibre com estilo dark ops aeronáutico e suporte a elevação/3D
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-dark': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          },
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          },
          // Fonte DEM de terreno global aberta (Terrarium AWS / Mapzen) para Hillshade e 3D Mesh
          'terrain-dem': {
            type: 'raster-dem',
            tiles: [
              'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
            ],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15
          }
        },
        layers: [
          {
            id: 'dark-base',
            type: 'raster',
            source: 'osm-dark',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-brightness-max': 0.35,
              'raster-contrast': 0.25,
              'raster-saturation': -0.85
            }
          },
          {
            id: 'hillshade-layer',
            type: 'hillshade',
            source: 'terrain-dem',
            layout: { visibility: 'visible' },
            paint: {
              'hillshade-shadow-color': '#03050a',
              'hillshade-highlight-color': '#ff9900',
              'hillshade-accent-color': '#00e5ff',
              'hillshade-exaggeration': 0.75
            }
          }
        ]
      },
      center: [origin?.lon ?? -46.4731, origin?.lat ?? -23.4356],
      zoom: 6,
      pitch: 45, // Inclinação 3D tática
      bearing: -15, // Orientação de rota
      maxPitch: 85
    });

    // Controles de navegação 3D e bússola
    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true
    }), 'top-right');

    map.on('load', () => {
      // Ativa elevação 3D de terreno
      try {
        map.setTerrain({
          source: 'terrain-dem',
          exaggeration: 1.5
        });
      } catch (e) {
        console.warn('Terrain 3D mesh note:', e);
      }

      // Adiciona linha geodésica da rota
      map.addSource('route-corridor', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [origin?.lon ?? -46.4731, origin?.lat ?? -23.4356],
                  [destination?.lon ?? -43.1631, destination?.lat ?? -22.9105]
                ]
              }
            }
          ]
        }
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-corridor',
        paint: {
          'line-color': '#ff8800',
          'line-width': 3,
          'line-opacity': 0.9
        }
      });

      // Marcadores dos pontos de acidentes históricos
      occurrences.forEach(occ => {
        const lat = occ?.location?.coordinates?.latitude;
        const lon = occ?.location?.coordinates?.longitude;
        if (!lat || !lon) return;

        const el = document.createElement('div');
        el.className = 'custom-webmapx-pin';
        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 10px #ef4444;"></div>
            <span style="margin-top: 2px; font-size: 8px; font-weight: 800; font-family: monospace; color: #ffffff; background: rgba(10,14,24,0.9); padding: 1px 4px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">${occ?.aircraft?.registration || 'ACFT'}</span>
          </div>
        `;

        el.addEventListener('click', () => onSelectOccurrence(occ));

        new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat])
          .addTo(map);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [origin, destination, occurrences]);

  const togglePitch3D = () => {
    if (!mapRef.current) return;
    const currentPitch = mapRef.current.getPitch();
    const targetPitch = currentPitch > 10 ? 0 : 60;
    mapRef.current.easeTo({ pitch: targetPitch, duration: 800 });
    setIs3DActive(targetPitch > 0);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050811]">
      {/* Container WebMapX / MapLibre 3D */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating 3D Toolbar Controls */}
      <div className="absolute top-16 right-14 z-20 flex flex-col gap-2">
        <button
          onClick={togglePitch3D}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold shadow-2xl backdrop-blur-md transition-all ${
            is3DActive
              ? 'bg-[#ff8800] text-slate-950 border-[#ff9900]'
              : 'bg-[#13151b]/90 text-slate-300 border-white/10 hover:border-white/30'
          }`}
          title="Alternar Perspectiva 3D de Montanhas"
        >
          <Box className="w-3.5 h-3.5" />
          <span>{is3DActive ? 'TERRENO 3D ATIVO' : 'VISÃO 2D PLANA'}</span>
        </button>

        <div className="bg-[#13151b]/90 border border-white/10 backdrop-blur-md rounded-xl p-1.5 flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <Mountain className="w-3 h-3 text-[#ff8800]" />
          <span>Hillshade Ativo</span>
        </div>
      </div>
    </div>
  );
};
