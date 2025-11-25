import { put, del, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { workId, chapterNumber, text } = await request.json();
    
    if (!workId || !chapterNumber || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ВАЖНО: добавляем слэш в конце для правильного поиска
    const prefix = `works/${workId}/chapter-${chapterNumber}/`;
    
    // 1. УДАЛЯЕМ ВСЕ СТАРЫЕ ФАЙЛЫ ЭТОЙ ГЛАВЫ
    try {
      console.log('🔍 Ищем старые файлы с префиксом:', prefix);
      const { blobs } = await list({ prefix });
      console.log('📋 Найдено старых файлов:', blobs.length);
      
      for (const blob of blobs) {
        console.log('🗑️ Удаляем:', blob.url);
        await del(blob.url);
      }
    } catch (e) {
      console.log('⚠️ Ошибка при удалении старых файлов:', e);
    }
    
    // 2. ЗАГРУЖАЕМ НОВЫЙ ФАЙЛ (с уникальным timestamp чтобы обойти кэш)
    const timestamp = Date.now();
    const filename = `${prefix}text-${timestamp}.txt`;
    
    console.log('💾 Сохраняем новый файл:', filename);
    const blob = await put(filename, text, {
      access: 'public',
      addRandomSuffix: false // Отключаем случайный суффикс
    });

    console.log('✅ Файл сохранён:', blob.url);
    return NextResponse.json({ url: blob.url });
    
  } catch (error: any) {
    console.error('❌ Ошибка загрузки в Blob:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}