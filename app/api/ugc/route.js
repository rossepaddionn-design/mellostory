import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUGC = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_UGC_URL,
  process.env.SUPABASE_UGC_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const { action, userId, workId, message, nickname, commentId, parentCommentId } = await request.json();

  try {
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

    if (action === 'add_comment') {
      const { data, error } = await supabaseUGC
        .from('work_discussions')
        .insert({
          work_id: workId,
          user_id: userId,
          nickname: nickname,
          message: message,
          parent_comment_id: parentCommentId || null
        })
        .select();
      
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // 🆕 УДАЛЕНИЕ КОММЕНТАРИЯ
    if (action === 'delete_comment') {
      // Проверяем, что комментарий принадлежит пользователю
      const { data: comment, error: fetchError } = await supabaseUGC
        .from('work_discussions')
        .select('user_id')
        .eq('id', commentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (comment.user_id !== userId) {
        return NextResponse.json({ 
          error: 'Вы можете удалять только свои комментарии' 
        }, { status: 403 });
      }
      
      // Удаляем комментарий
      const { error } = await supabaseUGC
        .from('work_discussions')
        .delete()
        .eq('id', commentId);
      
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
      // Загружаем все комментарии (включая ответы)
      const { data, error } = await supabaseUGC
        .from('work_discussions')
        .select('*')
        .eq('work_id', workId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ discussions: data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}