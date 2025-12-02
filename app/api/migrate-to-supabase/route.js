import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Старая база (метаданные)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Новая база (тексты)
    const supabaseChapters = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_CHAPTERS_URL,
      process.env.NEXT_PUBLIC_SUPABASE_CHAPTERS_ANON_KEY
    );

    // 1. Получаем все главы с текстами в Vercel Blob
    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('id, work_id, chapter_number, text_blob_url')
      .not('text_blob_url', 'is', null);

    if (error) throw error;
    
    if (!chapters || chapters.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Нет глав для миграции',
        migrated: 0 
      });
    }

    let migrated = 0;
    const errors = [];

    for (const chapter of chapters) {
      try {
        // 2. Скачиваем текст из Vercel Blob
        const response = await fetch(chapter.text_blob_url);
        const textContent = await response.text();

        if (!textContent || textContent.trim() === '') {
          console.log(`⚠️ Пустой текст в главе ${chapter.id}`);
          continue;
        }

        // 3. Сохраняем в Supabase #2
        const { error: insertError } = await supabaseChapters
          .from('chapter_texts')
          .upsert({
            chapter_id: chapter.id,
            work_id: chapter.work_id,
            text_content: textContent,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'chapter_id' 
          });

        if (insertError) throw insertError;
        
        migrated++;
        console.log(`✅ Мигрирована глава ${chapter.id}`);
      } catch (err) {
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

  } catch (error) {
    console.error('Ошибка миграции:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}