import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, getServiceClient, authorizeAdminOrCron } from '../_shared/supabase-client.ts';

// Digital Obstacle File (DOF) diário da FAA AIS
// Endpoints oficiais dos produtos digitais da FAA: https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dof/
const FAA_DAILY_DOF_CSV_URL = 'https://nfdc.faa.gov/webContent/dt-nas-recovery/Daily_DOF.csv';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Verificação Estrita de Autorização
  if (!authorizeAdminOrCron(req)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado ao conector FAA DOF.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = getServiceClient();
  const startTime = new Date().toISOString();

  const { data: jobData } = await supabase
    .from('source_import_jobs')
    .insert({
      source_slug: 'faa_obstacles',
      status: 'RUNNING',
      started_at: startTime
    })
    .select('id')
    .single();

  const jobId = jobData?.id;

  try {
    const res = await fetch(FAA_DAILY_DOF_CSV_URL, {
      headers: { 'User-Agent': 'MGA-Aviation-Intelligence/1.0 (+https://mga.aero)' }
    });

    if (!res.ok) {
      throw new Error(`Falha de conexão com FAA DOF: HTTP ${res.status}`);
    }

    const csvText = await res.text();
    const lines = csvText.split('\n');

    let processed = 0;
    let inserted = 0;
    let updated = 0;

    for (let i = 1; i < Math.min(lines.length, 500); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      processed++;

      // Parser DOF: OAS#, Type, State, City, Lat, Lon, AGL, AMSL, Action
      const cols = line.split(',');
      if (cols.length < 8) continue;

      const oasNumber = cols[0]?.replace(/"/g, '').trim();
      const obsType = cols[1]?.replace(/"/g, '').trim();
      const state = cols[2]?.replace(/"/g, '').trim();
      const city = cols[3]?.replace(/"/g, '').trim();
      const lat = parseFloat(cols[4]?.replace(/"/g, ''));
      const lon = parseFloat(cols[5]?.replace(/"/g, ''));
      const agl = parseFloat(cols[6]?.replace(/"/g, ''));
      const action = cols[7]?.replace(/"/g, '').trim(); // 'A', 'C', 'D'

      if (!oasNumber || isNaN(lat) || isNaN(lon)) continue;

      const status = action === 'D' ? 'REMOVED_DEMOLISHED' : 'ACTIVE_EXISTING';

      const { error: hazErr } = await supabase
        .from('hazards')
        .upsert({
          source_hazard_id: oasNumber,
          hazard_type: obsType?.includes('TOWER') ? 'COMMUNICATION_TOWER' : 'OTHER',
          status,
          description: `${obsType || 'Obstáculo Aeronáutico'} em ${city || 'Localidade'}, ${state || 'EUA'}`,
          coordinates: `SRID=4326;POINT(${lon} ${lat})`,
          height_agl_ft: isNaN(agl) ? null : agl,
          country_iso: 'USA',
          city,
          state_province: state,
          verified_at: new Date().toISOString()
        }, { onConflict: 'source_hazard_id' });

      if (!hazErr) inserted++;
    }

    await supabase
      .from('source_import_jobs')
      .update({
        status: 'COMPLETED',
        finished_at: new Date().toISOString(),
        records_received: processed,
        records_inserted: inserted
      })
      .eq('id', jobId);

    return new Response(JSON.stringify({
      success: true,
      source: 'faa_obstacles',
      recordsProcessed: processed,
      recordsInserted: inserted
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    if (jobId) {
      await supabase
        .from('source_import_jobs')
        .update({
          status: 'FAILED',
          finished_at: new Date().toISOString(),
          error_log: err.message
        })
        .eq('id', jobId);
    }

    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
