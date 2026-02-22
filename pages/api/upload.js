import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_BLOG_URL,
  process.env.SUPABASE_BLOG_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({});
  const [, files] = await form.parse(req);
  const file = files.file?.[0];
  
  if (!file) return res.status(400).json({ error: 'No file' });

  const buffer = fs.readFileSync(file.filepath);
  const fileName = `${Date.now()}_${file.originalFilename}`;

  const { error } = await supabaseAdmin.storage
    .from('blog_media')
    .upload(fileName, buffer, { contentType: file.mimetype });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabaseAdmin.storage.from('blog_media').getPublicUrl(fileName);
  res.json({ url: data.publicUrl });
}