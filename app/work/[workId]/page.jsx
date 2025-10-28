'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen, Clock, AlertTriangle, Image as ImageIcon, ChevronRight, Star, X } from 'lucide-react';

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
    // Проверка авторизации
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
    setLoading(true);
    
    try {
const [workRes, chaptersRes, viewsRes, ratingsRes] = await Promise.all([
        supabase
          .from('works')
          .select('id, title, description, cover_url, direction, rating, status, category, fandom, pairing, genres, tags, spoiler_tags, character_images, author_note')
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
          .from('work_ratings')
          .select('rating, user_id')
          .eq('work_id', workId)
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
      if (ratingsRes.data && ratingsRes.data.length > 0) {
        const ratings = ratingsRes.data;
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / ratings.length;
        setAverageRating(avg);
        setTotalRatings(ratings.length);
        
        // Проверяем оценку текущего пользователя
        if (currentUser) {
          const userRate = ratings.find(r => r.user_id === currentUser.id);
          if (userRate) {
            setUserRating(userRate.rating);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }

setLoading(false);
  };

  const incrementViewCount = async () => {
    if (hasIncrementedView.current) return;
    hasIncrementedView.current = true;

    try {
      const { error } = await supabase.rpc('increment_work_view', {
        p_work_id: workId
      });

      if (error) {
        console.error('Ошибка увеличения счётчика:', error);
      } else {
        const { data } = await supabase
          .from('work_views')
          .select('view_count')
          .eq('work_id', workId)
          .single();
        
        if (data) {
          setViewCount(data.view_count);
        }
      }
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const submitRating = async (rating) => {
    if (!currentUser) {
      alert('Войдите, чтобы оставить оценку');
      return;
    }

    try {
      const { error } = await supabase
        .from('work_ratings')
        .upsert({
          work_id: workId,
          user_id: currentUser.id,
          rating: rating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'work_id,user_id'
        });

      if (error) {
        console.error('Ошибка сохранения оценки:', error);
        alert('Ошибка сохранения оценки');
      } else {
        setUserRating(rating);
        setShowRatingModal(false);
        // Перезагружаем оценки
        loadAllData();
      }
    } catch (err) {
      console.error('Ошибка:', err);
    }
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
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      {/* HEADER - АДАПТИВНЫЙ */}
      <header className="bg-gray-950 border-b border-red-900 py-3 sm:py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 transition text-sm sm:text-base">
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            {t.backToMain}
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* ОБЛОЖКА + ОПИСАНИЕ - АДАПТИВНАЯ СЕТКА */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr] gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* ОБЛОЖКА */}
          <div>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-red-900 shadow-2xl md:sticky md:top-8 max-w-sm mx-auto md:max-w-none">
              {work.cover_url ? (
                <img src={work.cover_url} alt={work.title} className="w-full aspect-[2/3] object-cover" loading="lazy" />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-500 text-sm sm:text-base">Нет обложки</p>
                </div>
              )}
            </div>
          </div>

{/* ОПИСАНИЕ И ИНФО */}
          <div>
            {/* НАЗВАНИЕ */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-red-600 mb-3 sm:mb-4 break-words" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
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

            {/* БЕЙДЖИ + СЧЁТЧИК */}
            <div className="flex gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6 items-center">
              <span className="bg-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">{work.direction}</span>
              <span className="bg-red-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">{work.rating}</span>
              <span className="bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm">{work.status}</span>
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
              
              {/* СЧЁТЧИК ПРОЧТЕНИЙ */}
              <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-gray-700">
                <BookOpen size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                <span className="text-gray-300">Прочтений: {viewCount.toLocaleString()}</span>
              </div>
              
              {/* ОЦЕНКА */}
              <button
                onClick={() => setShowRatingModal(true)}
                className="bg-yellow-900 bg-opacity-40 hover:bg-opacity-60 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border border-yellow-700 hover:border-yellow-500 transition"
              >
                <Star size={14} className="sm:w-4 sm:h-4 text-yellow-400" fill={userRating ? 'currentColor' : 'none'} />
                <span className="text-yellow-300">
                  Оценка: {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </span>
              </button>
            </div>

            {/* ЖАНРЫ */}
            {work.genres && work.genres.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <span className="text-gray-400 text-xs sm:text-sm">{t.genres}: </span>
                <span className="text-gray-200 text-xs sm:text-sm break-words">{Array.isArray(work.genres) ? work.genres.join(', ') : work.genres}</span>
              </div>
            )}

            {/* ТЕГИ */}
            {work.tags && work.tags.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <span className="text-gray-400 text-xs sm:text-sm">{t.tags}: </span>
                <span className="text-gray-200 text-xs sm:text-sm break-words">{Array.isArray(work.tags) ? work.tags.join(', ') : work.tags}</span>
              </div>
            )}

            {/* СПОЙЛЕРНЫЕ МЕТКИ */}
            {spoilerTagsArray.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => setShowSpoilers(!showSpoilers)}
                  className="w-full bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded px-3 py-2 flex items-center justify-between hover:bg-opacity-30 transition text-left"
                >
                  <span className="text-yellow-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
                    {t.spoilerTags}
                  </span>
                  {showSpoilers ? <ChevronUp size={16} className="sm:w-5 sm:h-5 text-yellow-400" /> : <ChevronDown size={16} className="sm:w-5 sm:h-5 text-yellow-400" />}
                </button>
                
                {showSpoilers && (
                  <div className="mt-2 px-3 py-2 text-gray-300 text-xs sm:text-sm bg-gray-900 bg-opacity-50 rounded break-words">
                    {spoilerTagsArray.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* ОПИСАНИЕ */}
            <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 border-2 border-red-900 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-2 sm:mb-3">{t.description}</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words" style={{ fontSize: '12px' }}>{work.description}</p>
            </div>

            {/* ПРИМЕЧАНИЕ АВТОРА */}
            {work.author_note && (
              <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 border-l-4 border-red-600 mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-bold text-red-500 mb-2">{t.authorNote}</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words" style={{ fontSize: '12px' }}>{chapter.author_note}</p>
              </div>
            )}

            {/* ИЗОБРАЖЕНИЯ ПЕРСОНАЖЕЙ - АДАПТИВНАЯ КАРУСЕЛЬ */}
            {characterImagesArray.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
                  <ImageIcon size={18} className="sm:w-5 sm:h-5" />
                  {t.characterImages}
                </h3>
                
                <div className="relative">
                  <div 
                    ref={carouselRef}
                    className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-800"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {characterImagesArray.map((img, index) => (
                      <div 
                        key={index} 
                        className="flex-shrink-0 w-36 h-48 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-red-600 transition shadow-lg snap-start"
                      >
                        <img src={img} alt={`Character ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>

                  {/* КНОПКИ КАРУСЕЛИ - ТОЛЬКО НА ДЕСКТОПЕ */}
                  {characterImagesArray.length > 1 && (
                    <>
                      <button
                        onClick={() => scrollCharacterCarousel('left')}
                        className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-2 rounded-full transition z-10 shadow-lg"
                      >
                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => scrollCharacterCarousel('right')}
                        className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 p-2 rounded-full transition z-10 shadow-lg"
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
          <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <BookOpen size={24} className="sm:w-8 sm:h-8" />
            {t.contents}
          </h2>
        </div>

        {/* ГЛАВЫ */}
        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 lg:p-8 border-2 border-red-900">
          <h3 className="text-xl sm:text-2xl font-bold text-red-500 mb-4 sm:mb-6">
            {t.chapters} ({chapters.length})
          </h3>

          {chapters.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">{t.noChapters}</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/work/${workId}/chapter/${chapter.id}`}
                  className="block bg-gray-750 hover:bg-gray-700 rounded-lg p-3 sm:p-5 border-2 border-gray-600 hover:border-red-600 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white group-hover:text-red-500 transition mb-1 sm:mb-2 break-words">
                        {chapter.chapter_number}. {chapter.title}
                      </h3>
                      <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="sm:w-4 sm:h-4" />
                          {new Date(chapter.created_at).toLocaleDateString('ru-RU', { 
                            day: '2-digit', 
                            month: '2-digit',
                            year: window.innerWidth < 640 ? '2-digit' : 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-red-600 group-hover:text-red-500 transition flex-shrink-0">
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
            <div className="bg-gray-900 rounded-xl p-6 sm:p-8 max-w-md w-full border-2 border-red-900 relative">
              <button
                onClick={() => setShowRatingModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">
                Оцените работу
              </h3>
              
              {!currentUser ? (
                <p className="text-gray-400 text-center py-4">
                  Войдите, чтобы оставить оценку
                </p>
              ) : (
                <>
                  <p className="text-gray-300 mb-6 text-sm sm:text-base">
                    {userRating ? `Ваша оценка: ${userRating}` : 'Выберите оценку от 1 до 10'}
                  </p>
                  
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => submitRating(num)}
                        className={`py-3 sm:py-4 rounded-lg font-bold text-lg sm:text-xl transition ${
                          userRating === num
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  
                  {totalRatings > 0 && (
                    <p className="text-gray-500 text-center mt-4 text-xs sm:text-sm">
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