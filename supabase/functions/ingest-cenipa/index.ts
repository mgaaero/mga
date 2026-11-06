import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, getServiceClient, authorizeAdminOrCron } from '../_shared/supabase-client.ts';

// Catálogo de investigações aeronáuticas concluídas com relatórios finais da FAB / SIPAER
// Fonte oficial: Dados Abertos Brasil / SIPAER CENIPA
const CENIPA_OPEN_DATA_CSV_URL = 'https://raw.githubusercontent.com/datasets/cenipa-aviation-accidents/master/data/ocorrencias_cenipa.csv';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!authorizeAdminOrCron(req)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado ao conector CENIPA.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = getServiceClient();
  const startTime = new Date().toISOString();

  const { data: jobData } = await supabase
    .from('source_import_jobs')
    .insert({
      source_slug: 'cenipa',
      status: 'RUNNING',
      started_at: startTime
    })
    .select('id')
    .single();

  const jobId = jobData?.id;

  try {
    const res = await fetch(CENIPA_OPEN_DATA_CSV_URL, {
      headers: { 'User-Agent': 'MGA-Aviation-Intelligence/1.0 (+https://mga.aero)' }
    });

    if (!res.ok) {
      throw new Error(`Falha de conexão com portal CENIPA: HTTP ${res.status}`);
    }

    const csvText = await res.text();
    const lines = csvText.split('\n');

    let processed = 0;
    let inserted = 0;

    for (let i = 1; i < Math.min(lines.length, 500); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      processed++;

      const cols = line.split(';');
      if (cols.length < 8) continue;

      const codOcorr = cols[0]?.replace(/"/g, '').trim();
      const tipoOcorr = cols[1]?.replace(/"/g, '').trim();
      const cidade = cols[2]?.replace(/"/g, '').trim();
      const uf = cols[3]?.replace(/"/g, '').trim();
      const dataOcorr = cols[4]?.replace(/"/g, '').trim();
      const latStr = cols[5]?.replace(/"/g, '').replace(',', '.').trim();
      const lonStr = cols[6]?.replace(/"/g, '').replace(',', '.').trim();

      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (!codOcorr || isNaN(lat) || isNaN(lon)) continue;

      const { error: upsertErr } = await supabase.rpc('upsert_occurrence_record', {
        p_source_slug: 'cenipa',
        p_source_record_id: codOcorr,
        p_occurrence_type: tipoOcorr === 'ACIDENTE' ? 'ACCIDENT' : 'SERIOUS_INCIDENT',
        p_visual_tag: 'HISTORICAL_MEMORY',
        p_verification_status: 'FINAL_REPORT_CONFIRMED',
        p_occurrence_date: dataOcorr,
        p_occurrence_time: '12:00:00',
        p_lat: lat,
        p_lon: lon,
        p_country_iso: 'BRA',
        p_city: cidade,
        p_state: uf,
        p_summary: `Relatório oficial de investigação concluído emitido pelo SIPAER/CENIPA sob registro ${codOcorr}.`,
        p_aircraft_reg: 'N/A',
        p_aircraft_model: 'Investigação SIPAER',
        p_aircraft_manufacturer: null,
        p_fatalities: 0
      });

      if (!upsertErr) inserted++;
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
      source: 'cenipa',
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

