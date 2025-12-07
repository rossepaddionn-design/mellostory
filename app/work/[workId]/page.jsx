'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { supabaseChapters } from '@/lib/supabase-chapters'; // ← ДОБАВЬ!
import { supabaseUGC } from '@/lib/supabase-ugc';
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
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const carouselRef = useRef(null);
  const hasIncrementedView = useRef(false);
const [showDiscussionModal, setShowDiscussionModal] = useState(false);
const [discussions, setDiscussions] = useState([]);
const [newDiscussion, setNewDiscussion] = useState('');
const [isFavorited, setIsFavorited] = useState(false);
const [replyingTo, setReplyingTo] = useState(null); // ID комментария, на который отвечаем
const [replyText, setReplyText] = useState(''); // Текст ответа
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmMessage, setConfirmMessage] = useState('');
const [confirmAction, setConfirmAction] = useState(null);

const showConfirm = (message, action = null) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
};


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
    
    if (user) {
      setCurrentUser(user);
      setShowAgeVerification(false);
    } else {
      setShowAgeVerification(true);
    }
  };
  
  checkUser();
}, []);

useEffect(() => {
  if (workId) {
    loadAllData();
    incrementViewCount();
    loadDiscussions();
    if (currentUser) {
      checkFavorite();
    }
  }
}, [workId, currentUser]);

const loadDiscussions = async () => {
  try {
    const res = await fetch(`/api/ugc?action=get_discussions&workId=${workId}`);
    const { discussions } = await res.json();
    setDiscussions(discussions || []);
  } catch (err) {
    console.error('Ошибка загрузки комментариев:', err);
  }
};

const checkFavorite = async () => {
  if (!currentUser) return;
  
  try {
    const res = await fetch(`/api/ugc?action=check_favorite&userId=${currentUser.id}&workId=${workId}`);
    const { isFavorited } = await res.json();
    setIsFavorited(isFavorited);
  } catch (err) {
    console.error('Ошибка проверки избранного:', err);
  }
};

const toggleFavorite = async () => {
  if (!currentUser) {
    showConfirm('Войдите, чтобы добавить в избранное!');
    return;
  }

  try {
    const res = await fetch('/api/ugc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: isFavorited ? 'remove_favorite' : 'add_favorite',
        userId: currentUser.id,
        workId: workId
      })
    });

    const result = await res.json();
    
if (result.success) {
  setIsFavorited(!isFavorited);
  showConfirm(isFavorited ? 'Удалено из избранного' : 'Добавлено в избранное');
} else {
  showConfirm('Ошибка: ' + result.error);
}
} catch (err) {
  console.error('Ошибка:', err);
  showConfirm('Ошибка: ' + err.message);
}
};

const sendDiscussion = async (parentId = null) => {
  if (!currentUser) {
    showConfirm('Войдите, чтобы оставить комментарий');
    return;
  }
  
  const messageToSend = parentId ? replyText : newDiscussion;
  
  if (!messageToSend.trim()) {
    showConfirm('Напишите комментарий');
    return;
  }

  try {
    // 🔥 ПОЛУЧАЕМ НИКНЕЙМ ИЗ ПРОФИЛЯ
    const { data: profile } = await supabase
      .from('reader_profiles')
      .select('nickname')
      .eq('user_id', currentUser.id)
      .single();

    const nickname = profile?.nickname || currentUser.email?.split('@')[0] || 'Аноним';

    const res = await fetch('/api/ugc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_comment',
        userId: currentUser.id,
        workId: workId,
        nickname: nickname, // ← Используем реальный никнейм
        message: messageToSend.trim(),
        parentCommentId: parentId
      })
    });

    const result = await res.json();
    
if (result.success) {
  showConfirm(parentId ? 'Ответ отправлен' : 'Комментарий отправлен');
  if (parentId) {
    setReplyText('');
    setReplyingTo(null);
  } else {
    setNewDiscussion('');
  }
  loadDiscussions();
} else {
  showConfirm('Ошибка: ' + result.error);
}
} catch (err) {
  console.error('Ошибка:', err);
  showConfirm('Ошибка: ' + err.message);
}
};

const deleteDiscussion = async (commentId) => {
  if (!currentUser) return;
  
  showConfirm('Удалить комментарий?', async () => {
    try {
      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_comment',
          userId: currentUser.id,
          commentId: commentId
        })
      });

      const result = await res.json();
      
      if (result.success) {
        showConfirm('Комментарий удалён');
        loadDiscussions();
      } else {
        showConfirm('Ошибка: ' + result.error);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showConfirm('Ошибка: ' + err.message);
    }
  });
};

const loadAllData = async () => {
  setLoading(true);

  try {
    // 1. Загружаем данные работы
    const { data: workData, error: workError } = await supabase
      .from('works')
      .select('*')
      .eq('id', workId)
      .eq('is_draft', false)
      .single();

    if (workError) throw workError;

if (workData) {
      setWork(workData);
      
      // ЧИТАЕМ РЕЙТИНГ ИЗ РАБОТЫ
      if (workData.manual_rating_count > 0) {
        const avg = workData.manual_rating_sum / workData.manual_rating_count;
        setAverageRating(avg);
        setTotalRatings(workData.manual_rating_count);
      }
    }

    // 2. Загружаем главы
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, chapter_number, title, created_at, pages')
      .eq('work_id', workId)
      .eq('is_published', true)
      .order('chapter_number', { ascending: true });

    if (chaptersError) throw chaptersError;

    if (chaptersData) {
      setChapters(chaptersData);
    }

    // ЗАГРУЖАЕМ ПРОСМОТРЫ
    const { data: viewsData } = await supabase
      .from('work_views')
      .select('view_count')
      .eq('work_id', workId)
      .single(); 

    if (viewsData) {
      setViewCount(viewsData.view_count || 0);
    }

    setLoading(false);
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
    setLoading(false);
  }
};

 const incrementViewCount = async () => {
    return;
  };

const submitRating = async (rating) => {
    if (!currentUser) {
      showConfirm('Войдите, чтобы оставить оценку');
      return;
    }

    showConfirm('Спасибо за оценку');
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

// Модальное окно проверки возраста
if (showAgeVerification) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }}>
      {/* Модальное окно */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div 
          className="rounded-2xl p-8 border-2 relative"
          style={{
            background: 'rgba(0, 0, 0, 0.95)',
            borderColor: '#9333ea',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.4)'
          }}
        >
          {/* Заголовок MelloStory */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shimmerAge {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .age-shimmer-mello {
              background: linear-gradient(90deg, #a855f7 0%, #ec4899 33%, #06b6d4 66%, #a855f7 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmerAge 3s linear infinite;
            }
            .age-shimmer-story {
              color: #8c32d2;
              text-shadow: 0 0 20px rgba(140, 50, 210, 0.9), 0 0 40px rgba(140, 50, 210, 0.6);
            }
          `}} />
          
          <h1 className="text-4xl font-bold text-center mb-6" style={{
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            <span className="age-shimmer-mello">MELLO</span>
            <span className="age-shimmer-story">STORY</span>
          </h1>
          
          {/* Текст предупреждения */}
          <div className="text-center mb-6">
            <p className="text-white text-lg font-semibold mb-2">
              Сайт содержит материалы 18+
            </p>
            <p className="text-gray-400 text-sm">
              Для продолжения необходимо войти в аккаунт или зарегистрироваться
            </p>
          </div>
          
          {/* Кнопки */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => {
                window.location.href = '/?login=true';
              }}
              className="w-full py-3 rounded-lg font-bold transition text-base"
              style={{
                background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)'
              }}
            >
              Войти
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/?register=true';
              }}
              className="w-full py-3 rounded-lg font-bold transition text-base border-2"
              style={{
                background: 'transparent',
                borderColor: '#9370db',
                color: '#9370db'
              }}
            >
              Регистрация
            </button>
          </div>
          
          {/* Логотип внизу */}
          <div className="flex justify-center opacity-30">
            <img 
              src="/logo.png"
              alt="MelloStory" 
              className="w-32 h-32"
              style={{ 
                filter: 'grayscale(100%) brightness(0.5)',
                mixBlendMode: 'lighten'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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

<div className="flex gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6 items-center">
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
              
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmer-purple {
                  0% { box-shadow: 0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4); }
                  50% { box-shadow: 0 0 15px rgba(147, 51, 234, 0.9), 0 0 30px rgba(147, 51, 234, 0.6); }
                  100% { box-shadow: 0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4); }
                }
                @keyframes shimmer-cyan {
                  0% { box-shadow: 0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4); }
                  50% { box-shadow: 0 0 15px rgba(179, 231, 239, 0.9), 0 0 30px rgba(179, 231, 239, 0.6); }
                  100% { box-shadow: 0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4); }
                }
                @keyframes shimmer-pink {
                  0% { box-shadow: 0 0 10px rgba(239, 1, 203, 0.6), 0 0 20px rgba(239, 1, 203, 0.4); }
                  50% { box-shadow: 0 0 15px rgba(239, 1, 203, 0.9), 0 0 30px rgba(239, 1, 203, 0.6); }
                  100% { box-shadow: 0 0 10px rgba(239, 1, 203, 0.6), 0 0 20px rgba(239, 1, 203, 0.4); }
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
                <span>Оценка: {averageRating > 0 ? averageRating.toFixed(1) : '—'}</span>
              </button>

              <button
                onClick={toggleFavorite}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-2 transition cursor-pointer"
                style={{
                  background: 'rgba(239, 1, 203, 0.2)',
                  borderColor: '#ef01cb',
                  color: '#FFFFFF',
                  boxShadow: '0 0 10px rgba(239, 1, 203, 0.6), 0 0 20px rgba(239, 1, 203, 0.4)',
                  backdropFilter: 'blur(10px)',
                  animation: 'shimmer-pink 2s ease-in-out infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 1, 203, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 1, 203, 0.9), 0 0 30px rgba(239, 1, 203, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 1, 203, 0.2)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 1, 203, 0.6), 0 0 20px rgba(239, 1, 203, 0.4)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" className="sm:w-4 sm:h-4" fill={isFavorited ? '#ef01cb' : 'none'} stroke="#ef01cb" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{isFavorited ? 'В избранном' : 'В избранное'}</span>
              </button>

              <button
                onClick={() => {
                  setShowDiscussionModal(true);
                  loadDiscussions();
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-2 transition cursor-pointer"
                style={{
                  background: '#000000',
                  borderColor: '#b3e7ef',
                  color: '#FFFFFF',
                  boxShadow: '0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4)',
                  animation: 'shimmer-cyan 2s ease-in-out infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(179, 231, 239, 0.9), 0 0 30px rgba(179, 231, 239, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" className="sm:w-4 sm:h-4" fill="none" stroke="#b3e7ef" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Обсуждение ({discussions.length})</span>
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

      {/* МОДАЛЬНОЕ ОКНО ОБСУЖДЕНИЯ */}
      {showDiscussionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="bg-black rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col border-2" style={{ borderColor: '#8b3cc8' }}>
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmerDiscussion {
                  0% { background-position: -200% center; }
                  100% { background-position: 200% center; }
                }
                .discussion-title {
                  background: linear-gradient(90deg, #b3e7ef 0%, #8b3cc8 50%, #b3e7ef 100%);
                  background-size: 200% auto;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  animation: shimmerDiscussion 3s linear infinite;
                }
`}} />
              <h2 className="text-xl sm:text-2xl font-bold discussion-title flex items-center gap-2">
                💬 Обсуждение работы
              </h2>
              <button 
                onClick={() => setShowDiscussionModal(false)} 
                className="text-gray-400 hover:text-white transition flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {discussions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Пока нет комментариев. Будьте первым!</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {discussions
                    .filter(d => !d.parent_comment_id)
                    .map((disc) => (
                    <div key={disc.id} className="space-y-2">
                      <div 
                        className="rounded-lg p-3 sm:p-4 border transition"
                        style={{
                          background: 'linear-gradient(135deg, rgba(139, 60, 200, 0.2) 0%, rgba(74, 29, 110, 0.2) 100%)',
                          borderColor: 'rgba(139, 60, 200, 0.4)'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base" style={{ color: '#b3e7ef' }}>
                              {disc.nickname}
                            </span>
                            <span 
                              className="text-xs px-2 py-1 rounded" 
                              style={{ 
                                background: disc.nickname === 'Мелло' ? '#9333ea' : '#700a21',
                                color: 'white'
                              }}
                            >
                              {disc.nickname === 'Мелло' ? 'Автор' : 'Читатель'}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setReplyingTo(disc.id);
                                setReplyText('');
                              }}
                              className="text-cyan-400 hover:text-cyan-300 transition text-xs"
                            >
                              Ответить
                            </button>
                            
                            {currentUser && disc.user_id === currentUser.id && (
                              <button
                                onClick={() => deleteDiscussion(disc.id)}
                                className="text-red-400 hover:text-red-300 transition text-xs"
                              >
                                Удалить
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm sm:text-base whitespace-pre-wrap break-words mb-2">
                          {disc.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(disc.created_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {replyingTo === disc.id && (
                          <div className="mt-3 pl-4 border-l-2" style={{ borderColor: '#8b3cc8' }}>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={2}
                              placeholder="Напишите ответ..."
                              className="w-full px-3 py-2 rounded-lg border bg-gray-900 text-white resize-none text-sm mb-2"
                              style={{ borderColor: '#8b3cc8' }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => sendDiscussion(disc.id)}
                                className="px-4 py-2 rounded-lg font-bold text-sm transition"
                                style={{
                                  background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
                                  color: '#fff'
                                }}
                              >
                                Отправить
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText('');
                                }}
                                className="px-4 py-2 rounded-lg font-bold text-sm transition"
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #8b3cc8',
                                  color: '#8b3cc8'
                                }}
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {discussions
                        .filter(reply => reply.parent_comment_id === disc.id)
                        .map(reply => (
                          <div 
                            key={reply.id}
                            className="ml-6 sm:ml-12 rounded-lg p-3 border transition"
                            style={{
                              background: 'linear-gradient(135deg, rgba(179, 231, 239, 0.15) 0%, rgba(139, 60, 200, 0.15) 100%)',
                              borderColor: 'rgba(179, 231, 239, 0.3)'
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm" style={{ color: '#b3e7ef' }}>
                                  {reply.nickname}
                                </span>
                                <span 
                                  className="text-xs px-2 py-0.5 rounded" 
                                  style={{ 
                                    background: reply.nickname === 'Мелло' ? '#9333ea' : '#ef4444',
                                    color: 'white',
                                    fontSize: '10px'
                                  }}
                                >
                                  {reply.nickname === 'Мелло' ? 'Автор' : 'Читатель'}
                                </span>
                              </div>
                              
                              {currentUser && reply.user_id === currentUser.id && (
                                <button
                                  onClick={() => deleteDiscussion(reply.id)}
                                  className="text-red-400 hover:text-red-300 transition text-xs"
                                >
                                  Удалить
                                </button>
                              )}
                            </div>
                            
                            <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap break-words mb-2">
                              {reply.message}
                            </p>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 p-4 sm:p-6 flex-shrink-0">
              <textarea
                value={newDiscussion}
                onChange={(e) => setNewDiscussion(e.target.value)}
                rows={3}
                placeholder={currentUser ? "Напишите ваш комментарий..." : "Войдите, чтобы оставить комментарий"}
                disabled={!currentUser}
                className="w-full px-3 py-2 rounded-lg border-2 bg-gray-900 text-white resize-none text-sm sm:text-base mb-3"
                style={{
                  borderColor: '#8b3cc8'
                }}
              />
              <button
                onClick={() => sendDiscussion()}
                disabled={!currentUser || !newDiscussion.trim()}
                className="w-full py-3 rounded-lg font-bold transition"
                style={{
                  background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
                  color: '#fff',
                  opacity: !currentUser || !newDiscussion.trim() ? 0.5 : 1
                }}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
            background: 'rgba(147, 51, 234, 0.15)',
            borderColor: '#9333ea',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
          }}>
            <p className="text-white text-center text-base sm:text-lg mb-6 whitespace-pre-wrap">
              {confirmMessage}
            </p>
            
            <div className="flex gap-3">
              {confirmAction ? (
                <>
                  <button
                    onClick={() => {
                      confirmAction();
                      setShowConfirmModal(false);
                    }}
                    className="flex-1 py-3 rounded-lg font-bold transition"
                    style={{
                      background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                      boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)'
                    }}
                  >
                    Да
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold transition border-2"
                    style={{
                      background: 'transparent',
                      borderColor: '#9370db',
                      color: '#9370db'
                    }}
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-3 rounded-lg font-bold transition"
                  style={{
                    background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                    boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)'
                  }}
                >
                  ОК
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}