'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen, Clock, AlertTriangle, Image as ImageIcon, ChevronRight, Star, X } from 'lucide-react';
import GenreTag from '@/lib/components/work/GenrePopup';

export default function WorkPage() {
  const params = useParams();
  const workId = params.workId;

  const [work, setWork] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const carouselRef = useRef(null);
  const hasIncrementedView = useRef(false);

  const t = {
    backToMain: 'На главную',
    loading: 'Загрузка...',
    notFound: 'Работа не найдена',
    description: 'Описание',
    genres: 'Жанры',
    tags: 'Теги',
    spoilerTags: 'Спойлерные метки',
    characterImages: 'Изображения персонажей',
    authorNote: 'Примечание автора',
    contents: 'Содержание',
    chapters: 'Главы',
    noChapters: 'Главы ещё не добавлены',
    views: 'Просмотров'
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();

    if (workId) {
      loadAllData();
      incrementViewCount();
    }
  }, [workId]);

const loadAllData = async () => {
  const cacheKey = `work_${workId}`;
  const cached = sessionStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const data = JSON.parse(cached);
      setWork(data.work);
      setChapters(data.chapters);
      setViewCount(data.viewCount);
      setAverageRating(data.averageRating);
      setTotalRatings(data.totalRatings);
      setLoading(false);
      return;
    } catch (e) {
      console.error('Ошибка чтения кэша:', e);
    }
  }

  setLoading(true);
  
  try {
    const [workRes, chaptersRes, viewsRes, statsRes, userRatingRes] = await Promise.all([
supabase
  .from('works')
  .select('id, title, description, cover_url, direction, rating, status, category, fandom, pairing, genres, tags, spoiler_tags, character_images, author_note, total_pages')
  .eq('id', workId)
  .eq('is_draft', false)
  .single(),
      supabase
        .from('chapters')
        .select('id, chapter_number, title, created_at')
        .eq('work_id', workId)
        .eq('is_published', true)
        .order('chapter_number', { ascending: true }),
      supabase
        .from('work_views')
        .select('view_count')
        .eq('work_id', workId)
        .single(),
      supabase
        .from('work_statistics')
        .select('average_rating, total_rating_count')
        .eq('id', workId)
        .single(),
      currentUser ? supabase
        .from('work_ratings')
        .select('rating')
        .eq('work_id', workId)
        .eq('user_id', currentUser.id)
        .single() : Promise.resolve({ data: null, error: null })
    ]);

    if (workRes.error) {
      console.error('Ошибка загрузки работы:', workRes.error);
    } else {
      setWork(workRes.data);
    }

    if (chaptersRes.error) {
      console.error('Ошибка загрузки глав:', chaptersRes.error);
    } else {
      setChapters(chaptersRes.data || []);
    }

    if (viewsRes.data) {
      setViewCount(viewsRes.data.view_count);
    }

    if (statsRes.data) {
      setAverageRating(statsRes.data.average_rating || 0);
      setTotalRatings(statsRes.data.total_rating_count || 0);
    } else {
      setAverageRating(0);
      setTotalRatings(0);
    }

    if (userRatingRes.data) {
      setUserRating(userRatingRes.data.rating);
    } else {
      setUserRating(null);
    }

    sessionStorage.setItem(cacheKey, JSON.stringify({
      work: workRes.data,
      chapters: chaptersRes.data,
      viewCount: viewsRes.data?.view_count || 0,
      averageRating: statsRes.data?.average_rating || 0,
      totalRatings: statsRes.data?.total_rating_count || 0
    }));

  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
  }
  
  setLoading(false);
};

 const incrementViewCount = async () => {
    return;
  };

const submitRating = async (rating) => {
    if (!currentUser) {
      alert('Войдите, чтобы оставить оценку');
      return;
    }

    alert('Спасибо за оценку! ❤️');
    setUserRating(rating);
    setShowRatingModal(false);
  };

  const scrollCharacterCarousel = (direction) => {
    if (!carouselRef.current) return;
    
    const scrollAmount = 200;
    if (direction === 'left') {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white" style={{ backgroundColor: '#000000' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-400 mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center px-4" style={{ backgroundColor: '#000000' }}>
        <div className="text-center">
          <p className="text-xl sm:text-2xl text-gray-400 mb-4">{t.notFound}</p>
          <Link href="/" className="text-red-600 hover:text-red-500 transition text-sm sm:text-base">
            {t.backToMain}
          </Link>
        </div>
      </div>
    );
  }

  const spoilerTagsArray = Array.isArray(work.spoiler_tags) ? work.spoiler_tags : 
    (typeof work.spoiler_tags === 'string' && work.spoiler_tags ? work.spoiler_tags.split(',').map(s => s.trim()) : []);
  
  const characterImagesArray = Array.isArray(work.character_images) ? work.character_images : 
    (typeof work.character_images === 'string' && work.character_images ? work.character_images.split(',').map(s => s.trim()) : []);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#000000' }}>
      {/* HEADER */}
      <header className="border-b py-3 sm:py-4 px-4 sm:px-8" style={{
        backgroundColor: '#000000',
        borderColor: '#9333ea'
      }}>
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-500 transition text-sm sm:text-base">
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            {t.backToMain}
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* ОБЛОЖКА + ОПИСАНИЕ */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr] gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* ОБЛОЖКА */}
          <div>
<div className="rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 md:sticky md:top-8 max-w-sm mx-auto md:max-w-none" style={{
  borderColor: '#9333ea'
}}>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulse {
                  0%, 100% { 
                    transform: scale(1);
                    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(147, 51, 234, 0.3);
                  }
                  50% { 
                    transform: scale(1.03);
                    box-shadow: 0 0 40px rgba(147, 51, 234, 0.8), 0 0 80px rgba(147, 51, 234, 0.5);
                  }
                }
                
                .pulse-cover-container {
                  animation: pulse 3s ease-in-out infinite;
                }
              `}} />
              
              <div className="pulse-cover-container shadow-2xl">
                {work.cover_url ? (
                  <img 
                    src={work.cover_url} 
                    alt={work.title} 
                    className="w-full aspect-[2/3] object-cover" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                    <p className="text-gray-500 text-sm sm:text-base">Нет обложки</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ОПИСАНИЕ И ИНФО */}
          <div>
            {/* НАЗВАНИЕ */}
<style dangerouslySetInnerHTML={{__html: `
  @keyframes workPageShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .work-page-shimmer {
    background: linear-gradient(90deg, #9370db 0%, #ffffff 50%, #9370db 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: workPageShimmer 3s linear infinite;
  }
`}} />
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 break-words work-page-shimmer" style={{ 
  fontFamily: "'Playfair Display', Georgia, serif"
}}>
  {work.title}
</h1>

            {/* ФАНДОМ И ПЕЙРИНГ */}
            {(work.fandom || work.pairing) && (
              <div className="mb-4 sm:mb-5 space-y-2">
                {work.fandom && (
                  <div>
                    <span className="text-gray-400 text-xs sm:text-sm">Фандом: </span>
                    <span className="text-gray-200 text-sm sm:text-base break-words">{work.fandom}</span>
                  </div>
                )}
                {work.pairing && (
                  <div>
                    <span className="text-gray-400 text-xs sm:text-sm">Пейринг: </span>
                    <span className="text-gray-200 text-sm sm:text-base break-words">{work.pairing}</span>
                  </div>
                )}
              </div>
            )}

            {/* БЕЙДЖИ */}
            <div className="flex gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6 items-center">
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm" style={{ backgroundColor: '#D3D3D3', color: '#000000' }}>{work.direction}</span>
              <span className="bg-red-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">{work.rating}</span>
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm" style={{ backgroundColor: '#D3D3D3', color: '#000000' }}>{work.status}</span>
              {work.total_pages > 0 && (
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm" style={{ backgroundColor: '#D3D3D3', color: '#000000' }}>
                  Страниц: {work.total_pages.toLocaleString()}
                </span>
              )}
              {work.category && (
                <span className="bg-purple-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">
                  {{
                    novel: 'Роман',
                    longfic: 'Лонгфик',
                    minific: 'Минифик',
                    ongoing: 'Онгоинг',
                    completed: 'Завершён'
                  }[work.category] || work.category}
                </span>
              )}
            </div>

            {/* ЖАНРЫ */}
{work.genres && (Array.isArray(work.genres) ? work.genres.length > 0 : work.genres.trim().length > 0) && (
  <div className="mb-3 sm:mb-4">
    <span className="text-gray-400 text-xs sm:text-sm">{t.genres}: </span>
    <span className="text-xs sm:text-sm">
      {(Array.isArray(work.genres) ? work.genres : work.genres.split(',')).map((genre, i, arr) => {
        const trimmedGenre = genre.trim();
        if (!trimmedGenre) return null;
        return (
          <span key={i}>
            <GenreTag name={trimmedGenre} />
            {i < arr.length - 1 && ', '}
          </span>
        );
      })}
    </span>
  </div>
)}

            {/* ТЕГИ */}
{work.tags && (Array.isArray(work.tags) ? work.tags.length > 0 : work.tags.trim().length > 0) && (
  <div className="mb-3 sm:mb-4">
    <span className="text-gray-400 text-xs sm:text-sm">{t.tags}: </span>
    <span className="text-xs sm:text-sm">
      {(Array.isArray(work.tags) ? work.tags : work.tags.split(',')).map((tag, i, arr) => {
        const trimmedTag = tag.trim();
        if (!trimmedTag) return null;
        return (
          <span key={i}>
            <GenreTag name={trimmedTag} />
            {i < arr.length - 1 && ', '}
          </span>
        );
      })}
    </span>
  </div>
)}

{/* СПОЙЛЕРНЫЕ МЕТКИ */}
{spoilerTagsArray.length > 0 && (
  <div className="mb-4 sm:mb-6">
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes shimmer-white {
        0% { box-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2); }
        50% { box-shadow: 0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3); }
        100% { box-shadow: 0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2); }
      }
    `}} />
    <button
      onClick={() => setShowSpoilers(!showSpoilers)}
      className="w-full rounded px-3 py-2 flex items-center justify-between transition text-left border-2" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#ffffff',
        color: '#ffffff',
        boxShadow: '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2)',
        animation: 'shimmer-white 2s ease-in-out infinite'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2)';
      }}
    >
      <span className="text-xs sm:text-sm font-medium flex items-center gap-2">
        <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
        {t.spoilerTags}
      </span>
      {showSpoilers ? <ChevronUp size={16} className="sm:w-5 sm:h-5" /> : <ChevronDown size={16} className="sm:w-5 sm:h-5" />}
    </button>
    
 {showSpoilers && (
  <div className="mt-2 px-3 py-2 text-xs sm:text-sm rounded" style={{
    backgroundColor: '#000000',
    border: '1px solid #333'
  }}>
    {spoilerTagsArray.map((spoiler, i, arr) => {
      const trimmedSpoiler = spoiler.trim();
      if (!trimmedSpoiler) return null;
      return (
        <span key={i}>
          <GenreTag name={trimmedSpoiler} />
          {i < arr.length - 1 && ', '}
        </span>
      );
    })}
  </div>
)}
  </div>
)}

            {/* ПРОЧТЕНИЯ И ОЦЕНКА */}
            <div className="flex gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6 items-center">
              {/* СЧЁТЧИК ПРОЧТЕНИЙ */}
              <div 
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: '#FFFFFF'
                }}
              >
                <BookOpen size={14} className="sm:w-4 sm:h-4" />
                <span>Прочтений: {viewCount.toLocaleString()}</span>
              </div>
              
              {/* ОЦЕНКА */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmer-purple {
                  0% { box-shadow: 0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4); }
                  50% { box-shadow: 0 0 15px rgba(147, 51, 234, 0.9), 0 0 30px rgba(147, 51, 234, 0.6); }
                  100% { box-shadow: 0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4); }
                }
              `}} />
              <button
                onClick={() => setShowRatingModal(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-2 transition cursor-pointer"
                style={{
                  background: 'rgba(147, 51, 234, 0.2)',
                  borderColor: '#9333ea',
                  color: '#FFFFFF',
                  boxShadow: '0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4)',
                  backdropFilter: 'blur(10px)',
                  animation: 'shimmer-purple 2s ease-in-out infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(147, 51, 234, 0.9), 0 0 30px rgba(147, 51, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4)';
                }}
              >
                <Star size={14} className="sm:w-4 sm:h-4" fill={userRating ? 'currentColor' : 'none'} />
                <span>
                  Оценка: {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </span>
              </button>
            </div>

            {/* ОПИСАНИЕ */}
            <div className="bg-black rounded-lg p-4 sm:p-6 border-2 mb-4 sm:mb-6" style={{
              borderColor: '#9333ea'
            }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{
                color: '#9333ea'
              }}>{t.description}</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words" style={{ fontSize: '14px' }}>{work.description}</p>
            </div>

            {/* ПРИМЕЧАНИЕ АВТОРА */}
            {work.author_note && (
              <div className="bg-black rounded-lg p-4 sm:p-6 mb-4 sm:mb-6" style={{
                borderLeft: '4px solid #9333ea'
              }}>
                <h2 className="text-base sm:text-lg font-bold mb-2" style={{
                  color: '#9333ea'
                }}>{t.authorNote}</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words" style={{ fontSize: '14px' }}>{work.author_note}</p>
              </div>
            )}

            {/* ИЗОБРАЖЕНИЯ ПЕРСОНАЖЕЙ */}
            {characterImagesArray.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
                  <ImageIcon size={18} className="sm:w-5 sm:h-5" />
                  {t.characterImages}
                </h3>
                
                <div className="relative">
                  <div 
                    ref={carouselRef}
                    className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800 px-8 sm:px-10"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {characterImagesArray.map((img, index) => (
                      <div 
                        key={index} 
                        className="flex-shrink-0 w-36 h-48 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 transition shadow-lg snap-start"
                        style={{
                          borderColor: '#7626b5',
                          boxShadow: '0 0 10px rgba(118, 38, 181, 0.5)'
                        }}
                      >
                        <img src={img} alt={`Character ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>

                  {characterImagesArray.length > 1 && (
                    <>
                      <button
                        onClick={() => scrollCharacterCarousel('left')}
                        className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition z-10"
                        style={{
                          backgroundColor: '#7626b5',
                          boxShadow: '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#8b34d9';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#7626b5';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)';
                        }}
                      >
                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => scrollCharacterCarousel('right')}
                        className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition z-10"
                        style={{
                          backgroundColor: '#7626b5',
                          boxShadow: '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#8b34d9';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#7626b5';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)';
                        }}
                      >
                        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* СОДЕРЖАНИЕ */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3" style={{ 
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#D3D3D3'
          }}>
            <BookOpen size={24} className="sm:w-8 sm:h-8" />
            {t.contents}
          </h2>
        </div>

        {/* ГЛАВЫ */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmer-chapter {
            0% { box-shadow: 0 0 15px rgba(118, 38, 181, 0.5); }
            50% { box-shadow: 0 0 25px rgba(118, 38, 181, 0.8); }
            100% { box-shadow: 0 0 15px rgba(118, 38, 181, 0.5); }
          }
        `}} />
        <div className="bg-black rounded-lg p-4 sm:p-6 lg:p-8 border-2" style={{
          borderColor: '#9333ea',
          boxShadow: '0 0 25px rgba(147, 51, 234, 0.8), 0 0 50px rgba(147, 51, 234, 0.5)'
        }}>
          {chapters.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">{t.noChapters}</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {chapters.map((chapter) => (
<Link
  key={chapter.id}
  href={`/work/${workId}/chapter/${chapter.id}`}
  className="block rounded-lg p-3 sm:p-5 border-2 transition-all duration-300 group"
  style={{
    backgroundColor: 'transparent',
    borderColor: '#333'
  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#7626b5';
                    e.currentTarget.style.animation = 'shimmer-chapter 2s ease-in-out infinite';
                  }}
                  onMouseLeave={(e) => {
  e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.animation = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex justify-between items-start gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white group-hover:text-purple-400 transition mb-1 sm:mb-2 break-words">
                        {chapter.chapter_number}. {chapter.title}
                      </h3>
                      <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="sm:w-4 sm:h-4" />
                          {new Date(chapter.created_at).toLocaleDateString('ru-RU', { 
                            day: '2-digit', 
                            month: '2-digit',
                            year: typeof window !== 'undefined' && window.innerWidth < 640 ? '2-digit' : 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-purple-600 group-hover:text-purple-400 transition flex-shrink-0">
                      <ChevronLeft size={20} className="sm:w-6 sm:h-6 rotate-180" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* МОДАЛЬНОЕ ОКНО ОЦЕНКИ */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <div className="rounded-xl p-6 sm:p-8 max-w-md w-full border-2 relative" style={{
            background: 'rgba(147, 51, 234, 0.15)',
            borderColor: '#9333ea',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.3)'
          }}>
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-purple-300 hover:text-purple-100 transition"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{
              color: '#c084fc',
              textShadow: '0 0 15px rgba(192, 132, 252, 0.8)'
            }}>
              Оцените работу
            </h3>
            
            {!currentUser ? (
              <p className="text-center py-4" style={{ color: '#e9d5ff' }}>
                Войдите, чтобы оставить оценку
              </p>
            ) : (
              <>
                <p className="mb-6 text-sm sm:text-base" style={{ color: '#e9d5ff' }}>
                  {userRating ? `Ваша оценка: ${userRating}` : 'Выберите оценку от 1 до 10'}
                </p>
                
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => submitRating(num)}
                      className={`py-3 sm:py-4 rounded-lg font-bold text-lg sm:text-xl transition ${
                        userRating === num
                          ? 'bg-purple-600 text-white'
                          : 'text-purple-200 hover:text-white'
                      }`}
                      style={userRating === num ? {
                        background: 'rgba(147, 51, 234, 0.8)',
                        boxShadow: '0 0 15px rgba(147, 51, 234, 0.9)'
                      } : {
                        background: 'rgba(147, 51, 234, 0.2)',
                        border: '1px solid rgba(147, 51, 234, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        if (userRating !== num) {
                          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.4)';
                          e.currentTarget.style.boxShadow = '0 0 10px rgba(147, 51, 234, 0.6)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (userRating !== num) {
                          e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                {totalRatings > 0 && (
                  <p className="text-center mt-4 text-xs sm:text-sm" style={{ color: '#d8b4fe' }}>
                    Средняя оценка: {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'оценка' : 'оценок'})
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}