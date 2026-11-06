import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, getServiceClient, authorizeAdminOrCron } from '../_shared/supabase-client.ts';

// Repositório oficial OurAirports com atualização diária de aeródromos globais
const OURAIRPORTS_CSV_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!authorizeAdminOrCron(req)) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = getServiceClient();
  const startTime = new Date().toISOString();

  const { data: jobData } = await supabase
    .from('source_import_jobs')
    .insert({
      source_slug: 'ourairports',
      status: 'RUNNING',
      started_at: startTime
    })
    .select('id')
    .single();

  const jobId = jobData?.id;

  try {
    const res = await fetch(OURAIRPORTS_CSV_URL, {
      headers: { 'User-Agent': 'MEGA-Aviation-Intel/1.0 (+https://mega.aero)' }
    });

    if (!res.ok) {
      throw new Error(`Falha ao baixar OurAirports: HTTP ${res.status}`);
    }

    const csvText = await res.text();
    const lines = csvText.split('\n');

    let processed = 0;
    let inserted = 0;
    const batchSize = 250;
    let currentBatch: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');
      if (cols.length < 13) continue;

      const ident = cols[1]?.replace(/"/g, '').trim();
      const type = cols[2]?.replace(/"/g, '').trim();
      const name = cols[3]?.replace(/"/g, '').trim();
      const lat = parseFloat(cols[4]?.replace(/"/g, ''));
      const lon = parseFloat(cols[5]?.replace(/"/g, ''));
      const country = cols[8]?.replace(/"/g, '').trim();
      const icao = cols[12]?.replace(/"/g, '').trim() || (ident.length === 4 ? ident : null);
      const iata = cols[13]?.replace(/"/g, '').trim() || null;

      if (!ident || isNaN(lat) || isNaN(lon)) continue;
      processed++;

      currentBatch.push({
        ident,
        icao,
        iata,
        name: name || ident,
        airport_type: type,
        coordinates: `SRID=4326;POINT(${lon} ${lat})`,
        country_iso: country || 'UNK'
      });

      if (currentBatch.length >= batchSize) {
        const { error: batchErr } = await supabase
          .from('airports')
          .upsert(currentBatch, { onConflict: 'ident' });

        if (!batchErr) inserted += currentBatch.length;
        currentBatch = [];
      }

      // Limita a 5000 aeródromos por execução para respeitar o limite de tempo da Edge Function
      if (processed >= 5000) break;
    }

    if (currentBatch.length > 0) {
      const { error: batchErr } = await supabase
        .from('airports')
        .upsert(currentBatch, { onConflict: 'ident' });

      if (!batchErr) inserted += currentBatch.length;
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

