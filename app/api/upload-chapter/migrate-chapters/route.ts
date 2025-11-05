import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Инициализируем Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Загружаем ВСЕ главы где есть текст в content
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

    // 2. Мигрируем каждую главу
    for (const chapter of chapters) {
      try {
        // Загружаем текст в Blob
        const filename = `works/${chapter.work_id}/chapter-${chapter.chapter_number}.txt`;
        const blob = await put(filename, chapter.content, {
          access: 'public',
        });

        // Обновляем запись: ссылка + очищаем content
        const { error: updateError } = await supabase
          .from('chapters')
          .update({
            text_blob_url: blob.url,
            content: null  // Очищаем!
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
      { error: error.message },
      { status: 500 }
    );
  }
}