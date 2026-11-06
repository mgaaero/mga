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

    // Filtra e ingere aeroportos de grande e médio porte prioritários
    for (let i = 1; i < Math.min(lines.length, 1000); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parser CSV
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

      const { error: airportErr } = await supabase
        .from('airports')
        .upsert({
          ident,
          icao,
          iata,
          name: name || ident,
          airport_type: type,
          coordinates: `SRID=4326;POINT(${lon} ${lat})`,
          country_iso: country || 'UNK'
        }, { onConflict: 'ident' });

      if (!airportErr) inserted++;
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

