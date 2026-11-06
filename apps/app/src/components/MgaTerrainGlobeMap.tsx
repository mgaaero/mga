import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Occurrence, HazardObstacle } from '@mega/types';
import { 
  Layers, 
  Mountain, 
  Box, 
  AlertTriangle, 
  Building2, 
  Plane, 
  Eye, 
  ShieldCheck, 
  Radio, 
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';

interface TerrainGlobeMapProps {
  origin: { icao: string; name: string; lat: number; lon: number };
  destination: { icao: string; name: string; lat: number; lon: number };
  corridorBufferKm: number;
  occurrences: Occurrence[];
  hazards: HazardObstacle[];
  selectedOccurrence: Occurrence | null;
  onSelectOccurrence: (occ: Occurrence) => void;
}

interface LayerVisibility {
  accidents: boolean;
  incidents: boolean;
  fatalities: boolean;
  hazards: boolean;
  corridor: boolean;
  hillshade: boolean;
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
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const [layers, setLayers] = useState<LayerVisibility>({
    accidents: true,
    incidents: true,
    fatalities: true,
    hazards: true,
    corridor: true,
    hillshade: true
  });

  // Converte a lista de ocorrências com precisão WGS84 para GeoJSON padrão
  const occurrencesGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: occurrences
      .filter(occ => occ?.location?.coordinates?.latitude && occ?.location?.coordinates?.longitude)
      .map(occ => {
        const fatalitiesCount = occ.fatalities ?? 0;
        const isFatal = fatalitiesCount > 0;
        const isAccident = occ.type?.toUpperCase() === 'ACIDENTE';
        return {
          type: 'Feature',
          properties: {
            id: occ.id,
            registration: occ.aircraft?.registration || 'DESCONHECIDO',
            type: occ.type || 'ACIDENTE',
            model: occ.aircraft?.model || 'AERONAVE',
            date: occ.date,
            fatalities: fatalitiesCount,
            hasFatalities: isFatal,
            isAccident: isAccident,
            source: occ.source?.officialAgency || 'CENIPA / SIPAER',
            reportId: occ.source?.recordIdentifier || occ.id,
            status: 'CONCLUÍDO',
            coordinatePrecision: occ.location?.description?.includes('Aproximad') ? 'ESTIMADA' : 'EXATA WGS84',
            summary: occ.summary || ''
          },
          geometry: {
            type: 'Point',
            coordinates: [occ.location.coordinates.longitude, occ.location.coordinates.latitude]
          }
        };
      })
  };

  // GeoJSON dos obstáculos e linhas de transmissão
  const hazardsGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: (hazards || [])
      .filter(h => h.coordinates?.latitude && h.coordinates?.longitude)
      .map(h => ({
        type: 'Feature',
        properties: {
          id: h.id,
          name: h.description,
          type: h.type,
          elevationAmsl: h.heightAmslFt,
          heightAgl: h.heightAglFt,
          source: h.sourceAgency || 'CEMIG / DECEA',
          coordinatePrecision: 'EXATA WGS84'
        },
        geometry: {
          type: 'Point',
          coordinates: [h.coordinates.longitude, h.coordinates.latitude]
        }
      }))
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

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
            attribution: 'Esri, Maxar'
          },
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
            layout: { visibility: layers.hillshade ? 'visible' : 'none' },
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
      pitch: 45,
      bearing: -15,
      maxPitch: 85
    });

    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true
    }), 'top-right');

    map.on('load', () => {
      // 1. Ativa elevação 3D de terreno
      try {
        map.setTerrain({
          source: 'terrain-dem',
          exaggeration: 1.5
        });
      } catch (e) {
        console.warn('Terrain note:', e);
      }

      // 2. Corredor Geodésico
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
        layout: { visibility: layers.corridor ? 'visible' : 'none' },
        paint: {
          'line-color': '#ff8800',
          'line-width': 3,
          'line-opacity': 0.95
        }
      });

      // 3. PostGIS / GeoJSON Cluster de Ocorrências Aeronáuticas
      map.addSource('mga-occurrences', {
        type: 'geojson',
        data: occurrencesGeoJSON,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50
      });

      // Camada A: Clusters (Círculos com contagem)
      map.addLayer({
        id: 'clusters-circle',
        type: 'circle',
        source: 'mga-occurrences',
        filter: ['has', 'point_count'],
        layout: { visibility: layers.accidents ? 'visible' : 'none' },
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#f59e0b', // Amarelo até 5 ocorrências
            5,
            '#ea580c', // Laranja de 5 a 15
            15,
            '#dc2626'  // Vermelho para áreas com mais de 15 acidentes
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            5,
            24,
            15,
            30
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.85
        }
      });

      // Camada B: Contagem numérica dentro do cluster
      map.addLayer({
        id: 'cluster-count-text',
        type: 'symbol',
        source: 'mga-occurrences',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          visibility: layers.accidents ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Camada C: Pontos Individuais Desagrupados (Zoom Alto ou Ocorrências Isoladas)
      map.addLayer({
        id: 'unclustered-points',
        type: 'circle',
        source: 'mga-occurrences',
        filter: ['!', ['has', 'point_count']],
        layout: { visibility: layers.accidents ? 'visible' : 'none' },
        paint: {
          'circle-color': [
            'case',
            ['get', 'hasFatalities'],
            '#ef4444', // Vermelho vivo para acidentes fatais
            '#f97316'  // Laranja para incidentes/acidentes sem vítimas
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Camada D: Rótulo da Matrícula no Ponto
      map.addLayer({
        id: 'unclustered-label',
        type: 'symbol',
        source: 'mga-occurrences',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'registration'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Regular'],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-size': 10,
          visibility: layers.accidents ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#ff9900',
          'text-halo-color': '#050811',
          'text-halo-width': 2
        }
      });

      // 4. Fonte e Camada de Obstáculos Críticos (Torres, Linhas CEMIG, Antenas)
      map.addSource('mga-hazards', {
        type: 'geojson',
        data: hazardsGeoJSON
      });

      map.addLayer({
        id: 'hazards-layer',
        type: 'circle',
        source: 'mga-hazards',
        layout: { visibility: layers.hazards ? 'visible' : 'none' },
        paint: {
          'circle-color': '#eab308',
          'circle-radius': 5,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#000000'
        }
      });

      // Interações de clique em Cluster (Zoom in suave)
      map.on('click', 'clusters-circle', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters-circle'] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (!clusterId) return;

        const source = map.getSource('mga-occurrences') as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
        map.easeTo({
          center: [coordinates[0], coordinates[1]],
          zoom: zoom + 0.5,
          duration: 600
        });
      });

      // Interação de clique em Ponto Individual (Abre Dossiê no painel lateral)
      map.on('click', 'unclustered-points', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const occId = feature.properties?.id;
        const targetOcc = occurrences.find(o => o.id === occId);
        if (targetOcc) {
          onSelectOccurrence(targetOcc);
        }
      });

      // Cursor pointer para elementos interativos
      map.on('mouseenter', 'clusters-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters-circle', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'unclustered-points', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'unclustered-points', () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [origin, destination, occurrences, hazards]);

  // Atualização dinâmica de visibilidade de camadas sem remontar o mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('clusters-circle')) {
      map.setLayoutProperty('clusters-circle', 'visibility', layers.accidents ? 'visible' : 'none');
    }
    if (map.getLayer('cluster-count-text')) {
      map.setLayoutProperty('cluster-count-text', 'visibility', layers.accidents ? 'visible' : 'none');
    }
    if (map.getLayer('unclustered-points')) {
      map.setLayoutProperty('unclustered-points', 'visibility', layers.accidents ? 'visible' : 'none');
    }
    if (map.getLayer('unclustered-label')) {
      map.setLayoutProperty('unclustered-label', 'visibility', layers.accidents ? 'visible' : 'none');
    }
    if (map.getLayer('hazards-layer')) {
      map.setLayoutProperty('hazards-layer', 'visibility', layers.hazards ? 'visible' : 'none');
    }
    if (map.getLayer('route-line')) {
      map.setLayoutProperty('route-line', 'visibility', layers.corridor ? 'visible' : 'none');
    }
    if (map.getLayer('hillshade-layer')) {
      map.setLayoutProperty('hillshade-layer', 'visibility', layers.hillshade ? 'visible' : 'none');
    }
  }, [layers]);

  const toggleLayer = (layerKey: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

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
      <div className="absolute top-16 right-14 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          {/* Seletor de Camadas (WebMapX Controls) */}
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold shadow-2xl backdrop-blur-md transition-all ${
              showLayerMenu
                ? 'bg-amber-500/20 text-[#ff8800] border-[#ff8800]'
                : 'bg-[#13151b]/90 text-slate-300 border-white/10 hover:border-white/30'
            }`}
            title="Controle de Camadas MGA"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CAMADAS</span>
          </button>

          {/* Botão de Perspectiva 3D */}
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
            <span>{is3DActive ? 'TERRENO 3D' : '2D PLANO'}</span>
          </button>
        </div>

        {/* Menu de Camadas Dropdown */}
        {showLayerMenu && (
          <div className="w-56 p-3 rounded-2xl bg-[#0e111a]/95 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col gap-2 font-mono text-[11px]">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/10 pb-1.5 flex items-center justify-between">
              <span>Camadas Ativas</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <button
              onClick={() => toggleLayer('accidents')}
              className="flex items-center justify-between text-left py-1 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-3 h-3" /> Acidentes & Clusters
              </span>
              {layers.accidents ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => toggleLayer('hazards')}
              className="flex items-center justify-between text-left py-1 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-amber-400">
                <Building2 className="w-3 h-3" /> Obstáculos / Linhas
              </span>
              {layers.hazards ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => toggleLayer('corridor')}
              className="flex items-center justify-between text-left py-1 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-orange-400">
                <Plane className="w-3 h-3" /> Corredor da Rota
              </span>
              {layers.corridor ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => toggleLayer('hillshade')}
              className="flex items-center justify-between text-left py-1 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Mountain className="w-3 h-3" /> Relevo Sombreado
              </span>
              {layers.hillshade ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <div className="mt-1 pt-2 border-t border-white/10 text-[9px] text-slate-400 leading-tight">
              Precisão: <span className="text-emerald-400 font-bold">WGS84 Oficial</span> (CENIPA / NTSB)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
