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

    const prefix = `works/${workId}/chapter-${chapterNumber}`;
    
    // 1. УДАЛЯЕМ ВСЕ СТАРЫЕ ФАЙЛЫ ЭТОЙ ГЛАВЫ
    try {
      const { blobs } = await list({ prefix });
      for (const blob of blobs) {
        await del(blob.url);
      }
    } catch (e) {
      console.log('Старых файлов нет, ок');
    }
    
    // 2. ЗАГРУЖАЕМ НОВЫЙ ФАЙЛ
    const filename = `${prefix}.txt`;
    const blob = await put(filename, text, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Ошибка загрузки в Blob:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}