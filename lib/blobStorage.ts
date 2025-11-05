// Загрузка текста главы через API route
export async function uploadChapterText(
  workId: string, 
  chapterNumber: number, 
  text: string
): Promise<string> {
  try {
    const response = await fetch('/api/upload-chapter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workId, chapterNumber, text })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Ошибка загрузки в Blob:', error);
    throw error;
  }
}

// Удаление текста (пока не реализовано, но можно добавить)
export async function deleteChapterText(blobUrl: string): Promise<void> {
  // TODO: создать API route для удаления
  console.log('Удаление из Blob:', blobUrl);
}

// Получение текста главы
export async function getChapterText(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) throw new Error('Не удалось загрузить текст');
    return await response.text();
  } catch (error) {
    console.error('Ошибка чтения из Blob:', error);
    throw error;
  }
}