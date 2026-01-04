import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// UGC база для пользовательского контента
const supabaseUGC = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_UGC_URL,
  process.env.SUPABASE_UGC_SERVICE_ROLE_KEY
);

// Основная база для профилей
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.json();
  const { 
    action,
    userId, 
    workId, 
    message, 
    nickname, 
    commentId, 
    parentCommentId, 
    chapterId, 
    selectedText, 
    workTitle, 
    chapterNumber, 
    bookmarkId, 
    imageUrl, 
    imageSource,
    imageId 
  } = body;

  try {
if (action === 'save_image') {
  const { data, error } = await supabaseUGC
    .from('saved_images')
    .insert({
      user_id: userId,
      image_url: imageUrl,
      image_source: imageSource
      // work_id убираем
    })
    .select();
  
  if (error) throw error;
  return NextResponse.json({ success: true, data });
}

if (action === 'add_favorite') {
  const { data, error } = await supabaseUGC
    .from('user_favorites')
    .insert({
      user_id: userId,
      work_id: workId
    })
    .select();
  
  if (error) throw error;
  return NextResponse.json({ success: true, data });
}

    if (action === 'remove_favorite') {
      const { error } = await supabaseUGC
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('work_id', workId);
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

 if (action === 'add_comment') {
  // Сохраняем комментарий в UGC базу (никнейм уже передан из фронтенда)
  const { data, error } = await supabaseUGC
    .from('work_discussions')
    .insert({
      work_id: workId,
      user_id: userId,
      nickname: nickname, // ← Используем переданный никнейм
      message: message,
      parent_comment_id: parentCommentId || null
    })
    .select();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'delete_comment') {
      const { error } = await supabaseUGC
        .from('work_discussions')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

if (action === 'edit_comment') {
  const { data, error } = await supabaseUGC
    .from('work_discussions')
    .update({ message: message })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select();
  
  if (error) throw error;
  return NextResponse.json({ success: true, data });
}

    // ========== ЗАКЛАДКИ ==========
    if (action === 'add_bookmark') {
      const { data, error } = await supabaseUGC
        .from('user_bookmarks')
        .insert({
          user_id: userId,
          work_id: workId,
          chapter_id: chapterId,
          selected_text: selectedText,
          work_title: workTitle,
          chapter_number: chapterNumber
        })
        .select();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'delete_bookmark') {
      const { error } = await supabaseUGC
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ========== СОХРАНЕНИЕ КАРТИНОК ==========
    if (action === 'save_image') {
      const { data, error } = await supabaseUGC
        .from('saved_images')
        .insert({
          user_id: userId,
          work_id: workId,
          image_url: imageUrl,
          image_source: imageSource
        })
        .select();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

if (action === 'delete_image') {
  const { error } = await supabaseUGC
    .from('saved_images')
    .delete()
    .eq('user_id', userId)
    .eq('image_url', imageUrl); // ← ИЗМЕНЕНО (было imageId)
  
  if (error) throw error;
  return NextResponse.json({ success: true });
}

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');
  const workId = searchParams.get('workId');

  try {
    if (action === 'check_favorite') {
      const { data, error } = await supabaseUGC
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('work_id', workId)
        .maybeSingle();
      
      if (error) throw error;
      return NextResponse.json({ isFavorited: !!data });
    }

    if (action === 'get_discussions') {
      const { data, error } = await supabaseUGC
        .from('work_discussions')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ discussions: data });
    }

    // ========== ЗАКЛАДКИ ==========
    if (action === 'get_bookmarks') {
      const { data, error } = await supabaseUGC
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ bookmarks: data });
    }

    // ========== СОХРАНЕННЫЕ КАРТИНКИ ==========
    if (action === 'get_saved_images') {
      const { data, error } = await supabaseUGC
        .from('saved_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ images: data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}