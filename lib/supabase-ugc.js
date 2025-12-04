import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_UGC_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_UGC_ANON_KEY;

export const supabaseUGC = createClient(supabaseUrl, supabaseKey);