export * from './seed-data.js';
export * from './route-intelligence-service.js';
export * from './ai/aviation-intelligence-ai.js';

export const AIRPORTS_DATABASE = [
  { icao: 'SBGR', iata: 'GRU', name: 'São Paulo/Guarulhos Int.', city: 'Guarulhos', country: 'BRA', lat: -23.4356, lon: -46.4731 },
  { icao: 'SBSP', iata: 'CGH', name: 'São Paulo/Congonhas', city: 'São Paulo', country: 'BRA', lat: -23.6261, lon: -46.6564 },
  { icao: 'SBBR', iata: 'BSB', name: 'Brasília Int. Presidente Juscelino Kubitschek', city: 'Brasília', country: 'BRA', lat: -15.8692, lon: -47.9172 },
  { icao: 'SBRJ', iata: 'SDU', name: 'Rio de Janeiro/Santos Dumont', city: 'Rio de Janeiro', country: 'BRA', lat: -22.9105, lon: -43.1631 },
  { icao: 'SBGL', iata: 'GIG', name: 'Rio de Janeiro/Galeão Int.', city: 'Rio de Janeiro', country: 'BRA', lat: -22.8089, lon: -43.2436 },
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy Int.', city: 'New York', country: 'USA', lat: 40.6413, lon: -73.7781 },
  { icao: 'KLGA', iata: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA', lat: 40.7769, lon: -73.8740 },
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', lat: 25.7959, lon: -80.2870 },
  { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'GBR', lat: 51.4700, lon: -0.4543 },
  { icao: 'LFPG', iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'FRA', lat: 49.0097, lon: 2.5479 }
];
