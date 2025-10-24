import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ngljhjsuifcldorbzmdj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nbGpoanN1aWZjbGRvcmJ6bWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MDg0MTEsImV4cCI6MjA3NTk4NDQxMX0.k9ynDjQvU6ipYI1wM6fUdQiA1DhHQkGTM0EFPi0CU64';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ТЕСТ
console.log('Supabase initialized:', { url: supabaseUrl, hasKey: !!supabaseAnonKey });