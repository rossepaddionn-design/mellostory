import { put, del, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('id, work_id, chapter_number, content')
      .not('content', 'is', null)
      .neq('content', '');

    if (error) throw error;
    
    if (!chapters || chapters.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Нет глав для миграции',
        migrated: 0 
      });
    }

    let migrated = 0;
    const errors: any[] = [];

    for (const chapter of chapters) {
      try {
        if (!chapter.content || chapter.content.trim() === '') {
          continue;
        }

        const filename = `works/${chapter.work_id}/chapter-${chapter.chapter_number}.txt`;
        
        try {
          const { blobs } = await list({ 
            prefix: `works/${chapter.work_id}/chapter-${chapter.chapter_number}` 
          });
          for (const blob of blobs) {
            await del(blob.url);
          }
        } catch (e) {
          // Игнорируем
        }
        
        const blob = await put(filename, chapter.content, {
          access: 'public',
        });

        const { error: updateError } = await supabase
          .from('chapters')
          .update({
            text_blob_url: blob.url,
            content: null
          })
          .eq('id', chapter.id);

        if (updateError) throw updateError;
        
        migrated++;
        console.log(`✅ Мигрирована глава ${chapter.id}`);
      } catch (err: any) {
        console.error(`❌ Ошибка главы ${chapter.id}:`, err);
        errors.push({ chapterId: chapter.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Мигрировано ${migrated} из ${chapters.length} глав`,
      migrated,
      total: chapters.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Ошибка миграции:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}