import * as React from 'react';

declare module 'react-leaflet' {
  export const MapContainer: any;
  export const TileLayer: any;
  export const Marker: any;
  export const Popup: any;
  export const Polyline: any;
  export const CircleMarker: any;
  export const Polygon: any;
  export const useMap: () => any;
}
