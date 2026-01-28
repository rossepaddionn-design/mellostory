import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUGC = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_UGC_URL,
  process.env.SUPABASE_UGC_SERVICE_ROLE_KEY
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.json();
  const { 
    action, userId, workId, message, nickname, commentId, 
    parentCommentId, chapterId, selectedText, workTitle, 
    chapterNumber, chapterTitle, bookmarkId, imageUrl, imageSource
  } = body;

  try {
    // ========== ИЗБРАННОЕ ==========
    if (action === 'add_favorite') {
      const { data, error } = await supabaseUGC
        .from('user_favorites')
        .insert({ user_id: userId, work_id: workId })
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

    // ========== КОММЕНТАРИИ + УВЕДОМЛЕНИЯ ==========
    if (action === 'add_comment') {
      const { data: newComment, error } = await supabaseUGC
        .from('work_discussions')
        .insert({
          work_id: workId,
          user_id: userId,
          nickname: nickname,
          message: message,
          parent_comment_id: parentCommentId || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // УВЕДОМЛЕНИЕ ПРИ ОТВЕТЕ
      if (parentCommentId) {
        const { data: parent } = await supabaseUGC
          .from('work_discussions')
          .select('user_id')
          .eq('id', parentCommentId)
          .single();
        
        if (parent && parent.user_id !== userId) {
          await supabaseUGC.from('notifications').insert({
            user_id: parent.user_id,
            type: 'comment_reply',
            work_id: workId,
            message: `${nickname} ответил на ваш комментарий`,
            is_read: false
          });
        }
      }
      
      return NextResponse.json({ success: true, data: newComment });
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

    // ========== КАРТИНКИ ==========
    if (action === 'save_image') {
      const { data, error } = await supabaseUGC
        .from('saved_images')
        .insert({
          user_id: userId,
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
        .eq('image_url', imageUrl);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // ========== УВЕДОМЛЕНИЯ ==========
    if (action === 'mark_as_read') {
      if (body.notificationId) {
        const { error } = await supabaseUGC
          .from('notifications')
          .update({ is_read: true })
          .eq('id', body.notificationId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabaseUGC
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId);
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'notify_new_work') {
      const { data: users } = await supabase
        .from('reader_profiles')
        .select('user_id');
      
      const notifications = users.map(user => ({
        user_id: user.user_id,
        type: 'new_work',
        work_id: workId,
        work_title: workTitle,
        message: `Новая работа: ${workTitle}`,
        is_read: false
      }));
      
      const { error } = await supabaseUGC
        .from('notifications')
        .insert(notifications);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'notify_new_chapter') {
      const { data: users } = await supabase
        .from('reader_profiles')
        .select('user_id');
      
      const notifications = users.map(user => ({
        user_id: user.user_id,
        type: 'new_chapter',
        work_id: workId,
        work_title: workTitle,
        chapter_number: chapterNumber,
        chapter_title: chapterTitle,
        message: `Новая глава ${chapterNumber}: ${chapterTitle} в работе "${workTitle}"`,
        is_read: false
      }));
      
      const { error } = await supabaseUGC
        .from('notifications')
        .insert(notifications);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'create_admin_message_notification') {
  const { userId, messageId } = body;
  
  const { error } = await supabaseUGC
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'admin_message',
      message: 'Админ ответил на ваше сообщение',
      is_read: false
    });
  
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

    if (action === 'get_bookmarks') {
      const { data, error } = await supabaseUGC
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ bookmarks: data });
    }

    if (action === 'get_saved_images') {
      const { data, error } = await supabaseUGC
        .from('saved_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ images: data });
    }

    if (action === 'get_notifications') {
      const { data, error } = await supabaseUGC
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return NextResponse.json({ notifications: data || [] });
    }

    if (action === 'get_unread_count') {
      const { count, error } = await supabaseUGC
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
      return NextResponse.json({ count: count || 0 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}