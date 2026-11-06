export * from './seed-data.js';
export * from './route-intelligence-service.js';
export * from './ai/aviation-intelligence-ai.js';

export const AIRPORTS_DATABASE = [
  { ident: 'SBGR', icao: 'SBGR', iata: 'GRU', name: 'São Paulo/Guarulhos Int.', city: 'Guarulhos', country: 'BRA', countryIso: 'BRA', lat: -23.4356, lon: -46.4731, latitude: -23.4356, longitude: -46.4731 },
  { ident: 'SBSP', icao: 'SBSP', iata: 'CGH', name: 'São Paulo/Congonhas', city: 'São Paulo', country: 'BRA', countryIso: 'BRA', lat: -23.6261, lon: -46.6564, latitude: -23.6261, longitude: -46.6564 },
  { ident: 'SBBR', icao: 'SBBR', iata: 'BSB', name: 'Brasília Int. Presidente Juscelino Kubitschek', city: 'Brasília', country: 'BRA', countryIso: 'BRA', lat: -15.8692, lon: -47.9172, latitude: -15.8692, longitude: -47.9172 },
  { ident: 'SBRJ', icao: 'SBRJ', iata: 'SDU', name: 'Rio de Janeiro/Santos Dumont', city: 'Rio de Janeiro', country: 'BRA', countryIso: 'BRA', lat: -22.9105, lon: -43.1631, latitude: -22.9105, longitude: -43.1631 },
  { ident: 'SBGL', icao: 'SBGL', iata: 'GIG', name: 'Rio de Janeiro/Galeão Int.', city: 'Rio de Janeiro', country: 'BRA', countryIso: 'BRA', lat: -22.8089, lon: -43.2436, latitude: -22.8089, longitude: -43.2436 },
  { ident: 'KJFK', icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy Int.', city: 'New York', country: 'USA', countryIso: 'USA', lat: 40.6413, lon: -73.7781, latitude: 40.6413, longitude: -73.7781 },
  { ident: 'KLGA', icao: 'KLGA', iata: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA', countryIso: 'USA', lat: 40.7769, lon: -73.8740, latitude: 40.7769, longitude: -73.8740 },
  { ident: 'KMIA', icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', countryIso: 'USA', lat: 25.7959, lon: -80.2870, latitude: 25.7959, longitude: -80.2870 },
  { ident: 'EGLL', icao: 'EGLL', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'GBR', countryIso: 'GBR', lat: 51.4700, lon: -0.4543, latitude: 51.4700, longitude: -0.4543 },
  { ident: 'LFPG', icao: 'LFPG', iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'FRA', countryIso: 'FRA', lat: 49.0097, lon: 2.5479, latitude: 49.0097, longitude: 2.5479 }
];
