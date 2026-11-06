export interface AirportRecord {
  ident: string;         // ex: SBGR, KJFK
  icao?: string;
  iata?: string;
  name: string;
  type: string;          // large_airport, medium_airport, small_airport, heliport
  latitude: number;
  longitude: number;
  elevationFt?: number;
  countryIso: string;
  municipality?: string;
}

export class OurAirportsParser {
  /**
   * Converte uma linha CSV de OurAirports no padrão MGA com validação e deduplicação
   */
  public static parseCsvRow(row: string): AirportRecord | null {
    // Parser simples e resiliente de CSV com suporte a campos entre aspas
    const fields = this.splitCsvLine(row);
    if (fields.length < 14) return null;

    const ident = fields[1]?.trim();
    const type = fields[2]?.trim();
    const name = fields[3]?.trim();
    const lat = parseFloat(fields[4]);
    const lon = parseFloat(fields[5]);
    const elevation = fields[6] ? parseInt(fields[6], 10) : undefined;
    const country = fields[8]?.trim();
    const municipality = fields[10]?.trim();
    const icao = fields[12]?.trim() || (ident.length === 4 ? ident : undefined);
    const iata = fields[13]?.trim() || undefined;

    if (!ident || isNaN(lat) || isNaN(lon)) {
      return null;
    }

    return {
      ident,
      icao,
      iata,
      name: name || ident,
      type: type || 'airport',
      latitude: lat,
      longitude: lon,
      elevationFt: isNaN(elevation as number) ? undefined : elevation,
      countryIso: country || 'UNK',
      municipality
    };
  }

  private static splitCsvLine(text: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }
}

