import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// База с главами (novels-text)
const supabaseChapters = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_CHAPTERS_URL,
  process.env.SUPABASE_CHAPTERS_SERVICE_ROLE_KEY
);

// Основная база для проверки админа
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ваш admin user ID
const ADMIN_USER_ID = '04c2f90c-cf0e-4dde-9186-8d19b98cad5a';

export async function POST(request) {
  const body = await request.json();
  const { action, userId, chapterData } = body;

  try {
// ========== СОХРАНЕНИЕ ГЛАВЫ (только для админа) ==========
if (action === 'save_chapter') {
  if (userId !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // ИСПРАВЛЕНИЕ: указываем onConflict для правильного upsert
  const { data, error } = await supabaseChapters
    .from('chapter_texts')
    .upsert(chapterData, {
      onConflict: 'chapter_id'  // ← ВОТ ЭТО ВАЖНО!
    })
    .select();
  
  if (error) throw error;
  return NextResponse.json({ success: true, data });
}

    // ========== ПУБЛИКАЦИЯ ГЛАВЫ (только для админа) ==========
    if (action === 'publish_chapter') {
      if (userId !== ADMIN_USER_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { data, error } = await supabaseChapters
        .from('chapter_texts')
        .update({ is_published: true })
        .eq('id', body.chapterId)
        .select();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // ========== УДАЛЕНИЕ ГЛАВЫ (только для админа) ==========
    if (action === 'delete_chapter') {
      if (userId !== ADMIN_USER_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { error } = await supabaseChapters
        .from('chapter_texts')
        .delete()
        .eq('id', body.chapterId);
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Chapters API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const chapterId = searchParams.get('chapterId');
  const workId = searchParams.get('workId');
  const userId = searchParams.get('userId');

  try {
    // ========== ПОЛУЧЕНИЕ ОДНОЙ ГЛАВЫ ДЛЯ ЧТЕНИЯ ==========
    if (action === 'get_chapter') {
      const { data, error } = await supabaseChapters
        .from('chapter_texts')
        .select('id, work_id, chapter_number, title, content, created_at')
        .eq('id', chapterId)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return NextResponse.json({ chapter: data });
    }

    // ========== ПОЛУЧЕНИЕ ГЛАВЫ ДЛЯ РЕДАКТИРОВАНИЯ (только админ) ==========
    if (action === 'get_chapter_for_edit') {
      if (userId !== ADMIN_USER_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { data, error } = await supabaseChapters
        .from('chapter_texts')
        .select('*')
        .eq('id', chapterId)
        .single();
      
      if (error) throw error;
      return NextResponse.json({ chapter: data });
    }

    // ========== ПОЛУЧЕНИЕ ТЕКСТА ГЛАВЫ (только админ) ==========
    if (action === 'get_chapter_text') {
      if (userId !== ADMIN_USER_ID) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { data, error } = await supabaseChapters
        .from('chapter_texts')
        .select('text_content')
        .eq('chapter_id', chapterId)
        .single();
      
      if (error) {
        // Если записи нет, вернём пустую строку
        if (error.code === 'PGRST116') {
          return NextResponse.json({ success: true, text_content: '' });
        }
        throw error;
      }
      
      return NextResponse.json({ success: true, text_content: data?.text_content || '' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Chapters API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}