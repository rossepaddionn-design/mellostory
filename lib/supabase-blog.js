import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olzlqrrypmuqewthiyvl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_BLOG_ANON_KEY; // ← ИСПРАВЛЕНО

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase Blog credentials!');
}

export const supabaseBlog = createClient(supabaseUrl, supabaseKey);

console.log('Supabase Blog initialized:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseKey 
});