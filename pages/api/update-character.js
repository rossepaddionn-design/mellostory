import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_BLOG_URL,
  process.env.SUPABASE_BLOG_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();
  
  const { id, ...data } = req.body;
  
  const { error } = await supabaseAdmin
    .from('character_profiles')
    .update(data)
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}