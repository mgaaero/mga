import { describe, it, expect } from 'vitest';
import { OurAirportsParser } from '../ourairports-parser.js';

describe('OurAirports Parser Validation', () => {
  it('deve extrair dados com precisão de uma linha CSV de OurAirports', () => {
    const csvLine = '6523,"SBGR","large_airport","Guarulhos - Governador André Franco Montoro International Airport",-23.435556,-46.473056,2459,"SA","BR","BR-SP","São Paulo","yes","SBGR","GRU","SBGR","SP0001",,,';
    
    const airport = OurAirportsParser.parseCsvRow(csvLine);
    expect(airport).not.toBeNull();
    expect(airport?.ident).toBe('SBGR');
    expect(airport?.icao).toBe('SBGR');
    expect(airport?.iata).toBe('GRU');
    expect(airport?.countryIso).toBe('BR');
    expect(airport?.latitude).toBeCloseTo(-23.435556, 4);
    expect(airport?.longitude).toBeCloseTo(-46.473056, 4);
    expect(airport?.elevationFt).toBe(2459);
  });

  it('deve descartar linhas inválidas ou sem coordenadas', () => {
    const badLine = '9999,"INV","small_airport","Invalid Airport",NaN,NaN,,,,,,,,';
    const parsed = OurAirportsParser.parseCsvRow(badLine);
    expect(parsed).toBeNull();
  });
});
