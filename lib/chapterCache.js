const chapterTextCache = new Map();
const CACHE_LIMIT = 10;

export async function getCachedChapterText(blobUrl) {
  if (chapterTextCache.has(blobUrl)) {
    console.log('📦 Текст загружен из кэша');
    return chapterTextCache.get(blobUrl);
  }

  console.log('🌐 Загрузка текста из Blob Storage...');
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error('Ошибка загрузки текста');
  }
  
  const text = await response.text();
  
  if (chapterTextCache.size >= CACHE_LIMIT) {
    const firstKey = chapterTextCache.keys().next().value;
    chapterTextCache.delete(firstKey);
  }
  
  chapterTextCache.set(blobUrl, text);
  return text;
}

export async function prefetchNextChapter(blobUrl) {
  if (!blobUrl || chapterTextCache.has(blobUrl)) return;
  
  try {
    console.log('⚡ Prefetch следующей главы...');
    await getCachedChapterText(blobUrl);
  } catch (error) {
    console.error('Ошибка prefetch:', error);
  }
}