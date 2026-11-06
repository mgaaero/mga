import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) 
  || 'https://wsitwedzygefkyablkwk.supabase.co';

// @ts-ignore
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) 
  || 'sb_publishable_LVPG9j-r4LOKwY6WrD0J1A_i1G4Qh8C';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

