import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, getServiceClient, authorizeAdminOrCron } from '../_shared/supabase-client.ts';

// NTSB Aviation Accident Database (Exportação Pública Diária/Mensal CAROL JSON)
// Fonte oficial: NTSB CAROL Query System (https://data.ntsb.gov/carol-main-public/query-builder)
const NTSB_CAROL_API_URL = 'https://data.ntsb.gov/carol-rep-public/api/Aviation/Monthly';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!authorizeAdminOrCron(req)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado ao conector NTSB.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = getServiceClient();
  const startTime = new Date().toISOString();

  const { data: jobData } = await supabase
    .from('source_import_jobs')
    .insert({
      source_slug: 'ntsb',
      status: 'RUNNING',
      started_at: startTime
    })
    .select('id')
    .single();

  const jobId = jobData?.id;

  try {
    // Pipeline NTSB CAROL com validação de resposta
    const res = await fetch(NTSB_CAROL_API_URL, {
      headers: { 
        'User-Agent': 'MGA-Aviation-Intelligence/1.0 (+https://mga.aero)',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Falha de comunicação com NTSB CAROL: HTTP ${res.status}`);
    }

    const records = await res.json();
    let processed = 0;
    let inserted = 0;

    if (Array.isArray(records)) {
      for (const rec of records.slice(0, 200)) {
        processed++;
        const evId = rec.ev_id || rec.NtsbNo;
        const lat = parseFloat(rec.latitude);
        const lon = parseFloat(rec.longitude);

        if (!evId || isNaN(lat) || isNaN(lon)) continue;

        const { error: upsertErr } = await supabase.rpc('upsert_occurrence_record', {
          p_source_slug: 'ntsb',
          p_source_record_id: evId,
          p_occurrence_type: rec.ev_type === 'INC' ? 'INCIDENT' : 'ACCIDENT',
          p_visual_tag: 'HISTORICAL_MEMORY',
          p_verification_status: rec.narr_cause ? 'FINAL_REPORT_CONFIRMED' : 'INVESTIGATION_ONGOING',
          p_occurrence_date: rec.ev_date ? rec.ev_date.split('T')[0] : '2024-01-01',
          p_occurrence_time: '12:00:00',
          p_lat: lat,
          p_lon: lon,
          p_country_iso: 'USA',
          p_city: rec.ev_city || 'USA',
          p_state: rec.ev_state || null,
          p_summary: rec.narr_acc || 'Investigação arquivada no sistema CAROL do NTSB.',
          p_aircraft_reg: rec.regis_no || 'N/A',
          p_aircraft_model: rec.acft_model || 'Desconhecido',
          p_aircraft_manufacturer: rec.acft_make || null,
          p_fatalities: parseInt(rec.inj_tot_f, 10) || 0
        });

        if (!upsertErr) inserted++;
      }
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
      source: 'ntsb',
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

