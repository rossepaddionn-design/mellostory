import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olzlqrrypmuqewthiyvl.supabase.co';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_BLOG_SERVICE_KEY;

export const supabaseBlog = createClient(supabaseUrl, supabaseServiceKey);