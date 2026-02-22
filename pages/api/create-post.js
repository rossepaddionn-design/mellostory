import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_BLOG_URL,
  process.env.SUPABASE_BLOG_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { error } = await supabaseAdmin.from('blog_posts').insert(req.body);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}