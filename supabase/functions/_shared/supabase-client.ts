import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function getServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function authorizeAdminOrCron(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = req.headers.get('x-cron-secret');
  const expectedSecret = Deno.env.get('CRON_SECRET');

  if (expectedSecret && cronSecret === expectedSecret) {
    return true;
  }

  if (!authHeader) return false;

  // Em produção, o token JWT do usuário precisa conter role 'admin' ou ser a service_role key
  const token = authHeader.replace('Bearer ', '');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return token === serviceKey;
}

