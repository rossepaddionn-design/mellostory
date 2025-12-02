import { createClient } from '@supabase/supabase-js';

// НОВЫЙ Supabase #2 ТОЛЬКО для текстов глав
const supabaseChaptersUrl = process.env.NEXT_PUBLIC_SUPABASE_CHAPTERS_URL;
const supabaseChaptersKey = process.env.NEXT_PUBLIC_SUPABASE_CHAPTERS_ANON_KEY;

if (!supabaseChaptersUrl || !supabaseChaptersKey) {
  throw new Error('Missing Supabase Chapters credentials!');
}

export const supabaseChapters = createClient(
  supabaseChaptersUrl, 
  supabaseChaptersKey
);

console.log('Supabase Chapters initialized:', { 
  url: supabaseChaptersUrl, 
  hasKey: !!supabaseChaptersKey 
});