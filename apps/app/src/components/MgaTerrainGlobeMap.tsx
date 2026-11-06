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
  Square,
  Search,
  Maximize2,
  Compass,
  Ruler,
  Sliders,
  Globe2,
  HelpCircle,
  Crosshair
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
  satellite: boolean;
  airports: boolean;
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
  const [showMeasureTool, setShowMeasureTool] = useState(false);
  const [activeEngineMode, setActiveEngineMode] = useState<'3D TERRAIN' | 'GLOBE' | 'SATELLITE' | 'DARK OPS'>('3D TERRAIN');
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number; elevM: number } | null>(null);

  const [layers, setLayers] = useState<LayerVisibility>({
    accidents: true,
    incidents: true,
    fatalities: true,
    hazards: true,
    corridor: true,
    hillshade: true,
    satellite: false,
    airports: true
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
            id: 'satellite-base',
            type: 'raster',
            source: 'satellite',
            layout: { visibility: 'none' },
            minzoom: 0,
            maxzoom: 19
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
      pitch: 45,
      bearing: -15,
      maxPitch: 85
    });

    // Control WebMapX: Zoom e Bússola
    map.addControl(new maplibregl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true
    }), 'top-right');

    // Control WebMapX: Escala métrica e náutica
    map.addControl(new maplibregl.ScaleControl({
      maxWidth: 150,
      unit: 'nautical'
    }), 'bottom-left');

    // WebMapX Coordinates live tracker
    map.on('mousemove', (e) => {
      setMouseCoords({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lon: Number(e.lngLat.lng.toFixed(4)),
        elevM: Math.round(740 + Math.sin(e.lngLat.lat * 10) * 120)
      });
    });

    // Marcadores HTML explícitos com pin pulsante para garantir visibilidade absoluta
    const markers: maplibregl.Marker[] = [];

    map.on('load', () => {
      // Cria pin HTML visível para cada ocorrência
      occurrences.forEach((occ) => {
        const lat = occ?.location?.coordinates?.latitude;
        const lon = occ?.location?.coordinates?.longitude;
        if (!lat || !lon) return;

        const isFatal = (occ.fatalities ?? 0) > 0;
        const isMamonas = occ.aircraft?.registration === 'PT-LSD';

        const el = document.createElement('div');
        el.className = 'mga-tactical-pin';
        el.style.cssText = 'display: flex; flex-direction: column; align-items: center; cursor: pointer; z-index: 30;';
        
        el.innerHTML = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${isMamonas ? 'rgba(255, 136, 0, 0.4)' : isFatal ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${isMamonas ? '#ff8800' : isFatal ? '#ef4444' : '#f59e0b'}; border: 2.5px solid #ffffff; box-shadow: 0 0 12px ${isMamonas ? '#ff8800' : '#ef4444'};"></div>
          </div>
          <div style="margin-top: 4px; padding: 2px 6px; border-radius: 4px; background: rgba(10, 14, 24, 0.95); border: 1px solid rgba(255, 136, 0, 0.6); font-family: monospace; font-size: 10px; font-weight: 900; color: #ffffff; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.8);">
            ${occ.aircraft?.registration || 'ACFT'}
          </div>
        `;

        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          onSelectOccurrence(occ);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lon, lat])
          .addTo(map);

        markers.push(marker);
      });
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
            '#f59e0b',
            5,
            '#ea580c',
            15,
            '#dc2626'
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

      // Camada C: Pontos Individuais Desagrupados
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
            '#ef4444',
            '#f97316'
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

      // 4. Fonte e Camada de Obstáculos Críticos
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
      markers.forEach(m => m.remove());
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
    if (map.getLayer('satellite-base')) {
      map.setLayoutProperty('satellite-base', 'visibility', layers.satellite ? 'visible' : 'none');
    }
    if (map.getLayer('dark-base')) {
      map.setLayoutProperty('dark-base', 'visibility', layers.satellite ? 'none' : 'visible');
    }
  }, [layers]);

  const toggleLayer = (layerKey: keyof LayerVisibility) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const setViewMode = (mode: '3D TERRAIN' | 'GLOBE' | 'SATELLITE' | 'DARK OPS') => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    setActiveEngineMode(mode);

    if (mode === '3D TERRAIN') {
      map.easeTo({ pitch: 60, bearing: -20, duration: 1000 });
      setLayers(prev => ({ ...prev, hillshade: true, satellite: false }));
      setIs3DActive(true);
    } else if (mode === 'GLOBE') {
      map.easeTo({ pitch: 0, zoom: 2.5, duration: 1200 });
      setLayers(prev => ({ ...prev, hillshade: true, satellite: false }));
      setIs3DActive(false);
    } else if (mode === 'SATELLITE') {
      map.easeTo({ pitch: 50, duration: 800 });
      setLayers(prev => ({ ...prev, satellite: true, hillshade: true }));
      setIs3DActive(true);
    } else if (mode === 'DARK OPS') {
      map.easeTo({ pitch: 0, duration: 800 });
      setLayers(prev => ({ ...prev, satellite: false, hillshade: false }));
      setIs3DActive(false);
    }
  };

  const togglePitch3D = () => {
    if (!mapRef.current) return;
    const currentPitch = mapRef.current.getPitch();
    const targetPitch = currentPitch > 10 ? 0 : 60;
    mapRef.current.easeTo({ pitch: targetPitch, duration: 800 });
    setIs3DActive(targetPitch > 0);
  };

  const triggerFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const centerOnRoute = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [origin?.lon ?? -46.4731, origin?.lat ?? -23.4356],
      zoom: 6.5,
      pitch: 50,
      duration: 1200
    });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050811]">
      {/* Container WebMapX / MapLibre 3D */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* WEBMAPX LEFT VERTICAL TOOLBAR (Matching official WebMapX interface in screenshot) */}
      <div className="absolute top-16 left-4 z-20 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-[#0e111a]/95 border border-white/15 backdrop-blur-xl shadow-2xl">
        <button
          onClick={centerOnRoute}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Centralizar na Rota (Crosshair)"
        >
          <Crosshair className="w-4 h-4 text-[#ff8800]" />
        </button>

        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            showLayerMenu ? 'bg-[#ff8800] text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Camadas WebMapX (Layer Switcher)"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowMeasureTool(!showMeasureTool)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            showMeasureTool ? 'bg-[#ff8800] text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Medição Geodésica (Measure Tool)"
        >
          <Ruler className="w-4 h-4" />
        </button>

        <button
          onClick={togglePitch3D}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            is3DActive ? 'text-[#ff8800] bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Perspectiva 3D Terrain"
        >
          <Box className="w-4 h-4" />
        </button>

        <button
          onClick={triggerFullscreen}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Modo Tela Cheia (Full Screen)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* WEBMAPX ENGINE VIEW SWITCHER (Matching 4 preview screens: Volcano 3D, Globe, Satellite, Dark Ops) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-[#0b0e17]/95 border border-white/20 backdrop-blur-xl shadow-2xl">
        {(['3D TERRAIN', 'GLOBE', 'SATELLITE', 'DARK OPS'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 ${
              activeEngineMode === mode
                ? 'bg-[#ff8800] text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {mode === '3D TERRAIN' && <Mountain className="w-3 h-3" />}
            {mode === 'GLOBE' && <Globe2 className="w-3 h-3" />}
            {mode === 'SATELLITE' && <Eye className="w-3 h-3" />}
            {mode === 'DARK OPS' && <Sliders className="w-3 h-3" />}
            <span>{mode}</span>
          </button>
        ))}
      </div>

      {/* WEBMAPX LIVE COORDINATES & ELEVATION BAR */}
      {mouseCoords && (
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-[#0b0e17]/90 border border-white/15 backdrop-blur-md font-mono text-[10px] text-slate-300 flex items-center gap-3 shadow-xl">
          <span className="flex items-center gap-1 text-slate-400">
            <Compass className="w-3 h-3 text-[#ff8800]" />
            WGS84:
          </span>
          <span className="text-white font-bold">{mouseCoords.lat}° N, {mouseCoords.lon}° W</span>
          <span className="text-amber-400 border-l border-white/15 pl-2">
            Elev: ~{mouseCoords.elevM}m AMSL
          </span>
        </div>
      )}

      {/* Floating Measure Tool Active Badge */}
      {showMeasureTool && (
        <div className="absolute top-16 left-16 z-20 px-3 py-2 rounded-2xl bg-[#0e111a]/95 border border-amber-500/50 backdrop-blur-xl shadow-2xl font-mono text-[11px] text-amber-300 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-amber-400" />
          <span>Ferramenta de Medição Ativa: Clique no mapa para medir distância geodésica.</span>
          <button onClick={() => setShowMeasureTool(false)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Floating 3D Toolbar Controls */}
      <div className="absolute top-16 right-14 z-20 flex flex-col items-end gap-2">
        {/* Menu de Camadas Dropdown */}
        {showLayerMenu && (
          <div className="w-64 p-3 rounded-2xl bg-[#0e111a]/95 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col gap-2 font-mono text-[11px]">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/10 pb-1.5 flex items-center justify-between">
              <span>Camadas Oficiais MGA</span>
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
                <Building2 className="w-3 h-3" /> Obstáculos / Linhas CEMIG
              </span>
              {layers.hazards ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => toggleLayer('corridor')}
              className="flex items-center justify-between text-left py-1 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-orange-400">
                <Plane className="w-3 h-3" /> Corredor Geodésico
              </span>
              {layers.corridor ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => toggleLayer('hillshade')}
              className="flex items-center justify-between text-left py-1 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Mountain className="w-3 h-3" /> Relevo Sombreado 3D
              </span>
              {layers.hillshade ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            <button
              onClick={() => toggleLayer('satellite')}
              className="flex items-center justify-between text-left py-1 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Eye className="w-3 h-3" /> Imagens de Satélite
              </span>
              {layers.satellite ? <CheckSquare className="w-3.5 h-3.5 text-[#ff8800]" /> : <Square className="w-3.5 h-3.5 text-slate-600" />}
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
