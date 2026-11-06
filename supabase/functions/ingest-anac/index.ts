import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, getServiceClient, authorizeAdminOrCron } from '../_shared/supabase-client.ts';

// Endpoint oficial de dados abertos da ANAC (Catálogo de Ocorrências Aeronáuticas)
const ANAC_OPEN_DATA_CSV_URL = 'https://sistemas.anac.gov.br/dadosabertos/Aeronaves/Ocorrencias/V_OCORRENCIA_AMPLA.csv';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Verificação Estrita de Autorização Administrativa / Cron Secreto
  if (!authorizeAdminOrCron(req)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado. Endpoint protegido.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = getServiceClient();
  const startTime = new Date().toISOString();

  // Inicia registro de job de importação
  const { data: jobData, error: jobErr } = await supabase
    .from('source_import_jobs')
    .insert({
      source_slug: 'anac',
      status: 'RUNNING',
      started_at: startTime
    })
    .select('id')
    .single();

  const jobId = jobData?.id;

  try {
    // 2. Fetch da fonte oficial com timeout e tratamento de rede
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const res = await fetch(ANAC_OPEN_DATA_CSV_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MEGA-Aviation-Intel/1.0 (+https://mega.aero)' }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Falha ao acessar ANAC Open Data: HTTP ${res.status} ${res.statusText}`);
    }

    const csvText = await res.text();
    const lines = csvText.split('\n');

    let processed = 0;
    let inserted = 0;
    let updated = 0;
    let errors: string[] = [];

    // Processa cabeçalho e primeiras linhas em chunks com deduplicação atômica via Stored Procedure
    for (let i = 1; i < Math.min(lines.length, 500); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      processed++;

      // Parser de campos separados por ponto e vírgula da ANAC
      const cols = line.split(';');
      if (cols.length < 10) continue;

      const numOcorrencia = cols[0]?.replace(/"/g, '').trim();
      const dataOcorr = cols[1]?.replace(/"/g, '').trim();
      const latStr = cols[7]?.replace(/"/g, '').replace(',', '.').trim();
      const lonStr = cols[8]?.replace(/"/g, '').replace(',', '.').trim();

      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (!numOcorrencia || isNaN(lat) || isNaN(lon)) continue;

      // Executa upsert atômico via Procedure PostGIS com deduplicação nativa
      const { error: upsertErr } = await supabase.rpc('upsert_occurrence_record', {
        p_source_slug: 'anac',
        p_source_record_id: numOcorrencia,
        p_occurrence_type: 'ACCIDENT',
        p_visual_tag: 'HISTORICAL_MEMORY',
        p_verification_status: 'INVESTIGATION_ONGOING',
        p_occurrence_date: dataOcorr,
        p_occurrence_time: '12:00:00',
        p_lat: lat,
        p_lon: lon,
        p_country_iso: 'BRA',
        p_city: cols[5]?.replace(/"/g, ''),
        p_state: cols[6]?.replace(/"/g, ''),
        p_summary: cols[9]?.replace(/"/g, '') || 'Ocorrência registrada no catálogo ANAC.',
        p_aircraft_reg: cols[2]?.replace(/"/g, ''),
        p_aircraft_model: cols[3]?.replace(/"/g, ''),
        p_aircraft_manufacturer: cols[4]?.replace(/"/g, ''),
        p_fatalities: 0
      });

      if (!upsertErr) {
        inserted++;
      } else {
        errors.push(upsertErr.message);
      }
    }

    // 3. Atualiza job de importação para COMPLETED
    await supabase
      .from('source_import_jobs')
      .update({
        status: 'COMPLETED',
        finished_at: new Date().toISOString(),
        records_received: processed,
        records_inserted: inserted,
        records_updated: updated,
        error_log: errors.length > 0 ? errors.slice(0, 5).join(' | ') : null
      })
      .eq('id', jobId);

    return new Response(JSON.stringify({
      success: true,
      recordsProcessed: processed,
      recordsInserted: inserted,
      status: 'COMPLETED'
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

