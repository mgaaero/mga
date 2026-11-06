import { Occurrence, OfficialSource } from '@mega/types';

export interface NtsbRawRecord {
  ev_id: string;
  ntsb_no: string;
  ev_type: string; // ACC or INC
  ev_date: string; // MM/DD/YYYY or YYYY-MM-DD
  ev_time?: string;
  ev_city?: string;
  ev_state?: string;
  ev_country?: string;
  latitude?: number;
  longitude?: number;
  acft_make?: string;
  acft_model?: string;
  regis_no?: string;
  damage?: string;
  inj_tot_f?: number; // Fatal
  inj_tot_s?: number; // Serious
  inj_tot_m?: number; // Minor
  narr_acc?: string;
  narr_cause?: string;
}

export class NtsbNormalizer {
  public static normalize(raw: NtsbRawRecord): Occurrence | null {
    if (!raw.latitude || !raw.longitude || !raw.ev_date) {
      return null;
    }

    const isoDate = this.parseDate(raw.ev_date);

    const source: OfficialSource = {
      slug: 'ntsb',
      name: 'National Transportation Safety Board',
      officialAgency: 'United States Federal Government',
      recordIdentifier: raw.ntsb_no || raw.ev_id,
      reportUrl: `https://data.ntsb.gov/carol-main-public/query-builder?search=${raw.ntsb_no || raw.ev_id}`,
      publicationDate: isoDate
    };

    return {
      id: `ntsb-${raw.ev_id}`,
      type: raw.ev_type === 'ACC' ? 'ACCIDENT' : 'INCIDENT',
      visualTag: 'HISTORICAL_MEMORY',
      verificationStatus: raw.narr_cause ? 'FINAL_REPORT_CONFIRMED' : 'INVESTIGATION_ONGOING',
      date: isoDate,
      time: raw.ev_time,
      location: {
        description: `${raw.ev_city || 'Unknown'}, ${raw.ev_state || ''}, ${raw.ev_country || 'USA'}`,
        city: raw.ev_city,
        state: raw.ev_state,
        countryIso: raw.ev_country === 'USA' || !raw.ev_country ? 'USA' : raw.ev_country.slice(0, 3).toUpperCase(),
        coordinates: {
          latitude: raw.latitude,
          longitude: raw.longitude
        }
      },
      aircraft: {
        registration: raw.regis_no || 'N/A',
        model: raw.acft_model || 'Unknown',
        manufacturer: raw.acft_make
      },
      fatalities: raw.inj_tot_f || 0,
      injuries: (raw.inj_tot_s || 0) + (raw.inj_tot_m || 0),
      summary: raw.narr_acc || 'Investigation record cataloged by NTSB CAROL database.',
      investigationFindings: raw.narr_cause,
      source
    };
  }

  private static parseDate(dateStr: string): string {
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    }
    return dateStr;
  }
}

