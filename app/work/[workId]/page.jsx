'use client';
import '@/app/fonts.css'; 
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { supabaseUGC } from '@/lib/supabase-ugc';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronDown, ChevronUp, BookOpen, Clock, AlertTriangle, Image as ImageIcon, ChevronRight, Star, X, Menu, LogOut, User, MessageSquare, Settings, Heart, Mail, Send, Reply } from 'lucide-react';
import GenreTag from '@/lib/components/work/GenrePopup';

export default function WorkPage() {
  const params = useParams();
  const workId = params.workId;

  const [work, setWork] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const hasIncrementedView = useRef(false);
  const carouselRef = useRef(null);
const [isFavorited, setIsFavorited] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [savedImages, setSavedImages] = useState([]);
const [confirmMessage, setConfirmMessage] = useState('');
const [confirmAction, setConfirmAction] = useState(null);
const [showReaderPanel, setShowReaderPanel] = useState(false);
const [isDarkTheme, setIsDarkTheme] = useState(true);
const [showSnow, setShowSnow] = useState(true);
const [userProfile, setUserProfile] = useState(null);
const [showManagementModal, setShowManagementModal] = useState(false);
const [showUpdatesModal, setShowUpdatesModal] = useState(false);
const [siteUpdates, setSiteUpdates] = useState([]);

const toggleSaveImage = async (imageUrl) => {
  if (!currentUser) {
    showConfirm('Войдите, чтобы сохранить изображение');
    return;
  }

  const isSaved = savedImages.includes(imageUrl);

  try {
    if (isSaved) {
      // Удаление через API
const res = await fetch('/api/ugc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'save_image',
    userId: currentUser.id,
    // workId убираем
    imageUrl: imageUrl,
    imageSource: 'chapter'
  })
});

      const result = await res.json();
      
      if (result.success) {
        setSavedImages(savedImages.filter(img => img !== imageUrl));
        showConfirm('Удалено из галереи');
      } else {
        showConfirm('Ошибка: ' + result.error);
      }
    } else {
      // Сохранение через API
      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_image',
          userId: currentUser.id,
          workId: workId,
          imageUrl: imageUrl,
          imageSource: 'work' // ← УБРАЛИ проверку chapterId, так как на странице work его нет
        })
      });

      const result = await res.json();
      
      if (result.success) {
        setSavedImages([...savedImages, imageUrl]);
        showConfirm('Сохранено в галерею!');
      } else {
        showConfirm('Ошибка: ' + result.error);
      }
    }
  } catch (err) {
    console.error('Ошибка:', err);
    showConfirm('Ошибка сохранения: ' + err.message);
  }
};

const colors = ['#35030e', '#6d1fe0', '#2932d1', '#727439', '#8f8f8f', '#64a081'];

const applyFormatting = (format, isReply = false) => {
  const textarea = isReply ? replyTextareaRef.current : textareaRef.current;
  const text = isReply ? replyText : newDiscussion;
  const setText = isReply ? setReplyText : setNewDiscussion;
  
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = text.substring(start, end);
  
  if (!selectedText) {
    showConfirm('Выделите текст для форматирования');
    return;
  }
  
  let formattedText = '';
  
  switch(format) {
    case 'bold':
      formattedText = `<b>${selectedText}</b>`;
      break;
    case 'italic':
      formattedText = `<i>${selectedText}</i>`;
      break;
    case 'underline':
      formattedText = `<u>${selectedText}</u>`;
      break;
    case 'spoiler':
      formattedText = `<spoiler>${selectedText}</spoiler>`;
      break;
    default:
      if (format.startsWith('#')) {
        formattedText = `<color=${format}>${selectedText}</color>`;
      }
  }
  
  const newText = text.substring(0, start) + formattedText + text.substring(end);
  setText(newText);
  
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
  }, 0);
  
  setShowColorPicker(false);
  setShowReplyColorPicker(false);
};

const renderFormattedText = (text) => {
  if (!text) return text;
  
  let result = text;
  
  // Обработка жирного текста
  result = result.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
  
  // Обработка курсива
  result = result.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
  
  // Обработка подчеркнутого
  result = result.replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline;">$1</span>');
  
  // Обработка цветного текста
  result = result.replace(/<color=(#[0-9a-fA-F]{6})>(.*?)<\/color>/g, '<span style="color: $1;">$2</span>');
  
  // Обработка спойлеров
  result = result.replace(/<spoiler>(.*?)<\/spoiler>/g, '<span class="spoiler-text" onclick="this.classList.toggle(\'revealed\')">$1</span>');
  
  return result;
};

const showConfirm = (message, action = null) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
};

const toggleTheme = () => {
  const newTheme = !isDarkTheme;
  setIsDarkTheme(newTheme);
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
};

const loadSiteUpdates = async () => {
  try {
    const { data, error } = await supabase
      .from('site_updates')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    setSiteUpdates(data || []);
  } catch (err) {
    console.error('Ошибка загрузки обновлений:', err);
  }
};


const handleLogout = async () => {
  await supabase.auth.signOut();
  setCurrentUser(null);
  setUserProfile(null);
  setShowReaderPanel(false);
  window.location.href = '/';
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
      
      // Загружаем профиль пользователя
      const { data: profile } = await supabase
        .from('reader_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserProfile(profile);
      }
    } else {
      setShowAgeVerification(true);
    }
  };
  
  checkUser();
}, []);

// Синхронизация настроек с главной страницей
useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    setIsDarkTheme(false);
  }
  
  const savedSnow = localStorage.getItem('showSnow');
  if (savedSnow !== null) {
    setShowSnow(savedSnow === 'true');
  }
}, []);

useEffect(() => {
  if (workId) {
    loadAllData();
    incrementViewCount();
    if (currentUser) {
      checkFavorite();
    }
  }
}, [workId, currentUser]);


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
  <div className="min-h-screen text-white" style={{ backgroundColor: isDarkTheme ? '#000000' : '#000000' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 mb-4" style={{ 
            borderColor: isDarkTheme ? '#c084fc' : '#cdc2a2' 
          }}></div>
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
<style dangerouslySetInnerHTML={{__html: `
  @keyframes neonPurplePulse {
    0%, 100% { 
      box-shadow: 0 0 10px rgba(183, 91, 205, 0.4), 
                  0 0 20px rgba(183, 91, 205, 0.3),
                  0 0 30px rgba(183, 91, 205, 0.2);
    }
    50% { 
      box-shadow: 0 0 15px rgba(183, 91, 205, 0.6), 
                  0 0 30px rgba(183, 91, 205, 0.5),
                  0 0 45px rgba(183, 91, 205, 0.3);
    }
  }
  
  .pink-neon-button {
    background: rgba(0, 0, 0, 0.7) !important;
    border: 2px solid rgba(183, 91, 205, 0.5) !important;
    box-shadow: 0 0 10px rgba(183, 91, 205, 0.4), 
                0 0 20px rgba(183, 91, 205, 0.3),
                0 0 30px rgba(183, 91, 205, 0.2) !important;
    animation: neonPurplePulse 3s ease-in-out infinite !important;
    transition: all 0.3s ease !important;
    color: #ffffff !important;
  }
  
  .pink-neon-button:hover {
    border-color: rgba(183, 91, 205, 0.9) !important;
    box-shadow: 0 0 20px rgba(183, 91, 205, 0.8), 
                0 0 40px rgba(183, 91, 205, 0.6),
                0 0 60px rgba(183, 91, 205, 0.4) !important;
    transform: translateY(-2px) !important;
  }
  
  .pink-neon-button:active {
    transform: translateY(0) !important;
    box-shadow: 0 0 30px rgba(183, 91, 205, 1), 
                0 0 50px rgba(183, 91, 205, 0.8),
                0 0 70px rgba(183, 91, 205, 0.5) !important;
  }
`}} />

<div className="space-y-3 mb-6">
  <button
    onClick={() => {
     window.location.href = '/welcome?login=true';
    }}
    className="pink-neon-button w-full py-3 rounded-lg font-bold text-base"
  >
    Войти
  </button>
  
  <button
    onClick={() => {
      window.location.href = '/welcome?register=true';
    }}
    className="pink-neon-button w-full py-3 rounded-lg font-bold text-base"
  >
    Регистрация
  </button>
</div>
          
{/* Логотип внизу */}
<div className="flex justify-center">
  <div style={{
    width: '128px',
    height: '128px',
    borderRadius: '50%',
    background: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  }}>
    <img 
      src="/logo.png"
      alt="MelloStory" 
      style={{ 
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  </div>
</div>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen text-white" style={{ backgroundColor: isDarkTheme ? '#000000' : '#000000' }}>
    <style dangerouslySetInnerHTML={{__html: `
      .spoiler-text {
        background: linear-gradient(90deg, #9333ea 0%, #ec4899 25%, #06b6d4 50%, #ec4899 75%, #9333ea 100%);
        background-size: 200% 100%;
        animation: spoiler-shimmer 2s linear infinite;
        color: transparent;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        user-select: none;
        position: relative;
        display: inline-block;
      }
      
      @keyframes spoiler-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .spoiler-text.revealed {
        background: transparent;
        color: inherit;
        animation: none;
        user-select: text;
      }
      
      .spoiler-text:hover:not(.revealed) {
        background-size: 300% 100%;
        animation-duration: 1.5s;
      }
    `}} />

<style dangerouslySetInnerHTML={{__html: `
  @keyframes shimmer-btn {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .shimmer-btn-text {
    background: linear-gradient(90deg, #b3e7ef 0%, #ef01cb 50%, #b3e7ef 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-btn 3s linear infinite;
  }
`}} />

<style dangerouslySetInnerHTML={{__html: `
  @keyframes shimmerGoldBtn {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`}} />

<style dangerouslySetInnerHTML={{__html: `
  /* Скроллбар для модальных окон - ТЕМНАЯ ТЕМА */
  ${isDarkTheme ? `
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #9370db 0%, #67327b 100%);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(147, 112, 219, 0.8);
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #b48dc4 0%, #9370db 100%);
    box-shadow: 0 0 15px rgba(180, 141, 196, 1);
  }
  ` : `
  /* Скроллбар для модальных окон - СВЕТЛАЯ ТЕМА */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }
  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #c9c6bb 0%, #65635d 100%);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(194, 171, 117, 0.6);
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #65635d 0%, #c9c6bb 100%);
    box-shadow: 0 0 15px rgba(216, 197, 162, 0.8);
  }
  `}
`}} />

{/* HEADER */}
<header className="border-b py-3 sm:py-4 px-4 sm:px-8" style={{
  backgroundColor: isDarkTheme ? '#000000' : '#000000',
  borderColor: isDarkTheme ? '#9333ea' : '#c9c6b0'
}}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 transition text-sm sm:text-base" style={{
  color: isDarkTheme ? '#9ca3af' : '#c0c0c0'
}}>
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            {t.backToMain}
          </Link>
          
          {currentUser && userProfile && (
            <button
              onClick={() => setShowReaderPanel(true)}
              className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
              style={{
                background: isDarkTheme 
                  ? 'rgba(7, 7, 7, 0.3)'
                  : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                border: isDarkTheme 
                  ? '1px solid rgba(2, 2, 2, 0.5)'
                  : '1px solid rgba(0, 0, 0, 0.5)'
              }}
            >
              <Menu size={14} className="sm:w-5 sm:h-5" />
              <span className="max-w-[80px] sm:max-w-none truncate text-xs sm:text-base">
                {userProfile?.nickname}
              </span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* ОБЛОЖКА + ОПИСАНИЕ */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[400px_1fr] gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* ОБЛОЖКА */}
          <div>
<div className="rounded-xl sm:rounded-2xl overflow-hidden md:sticky md:top-8 max-w-sm mx-auto md:max-w-none relative">

  
<div className={isDarkTheme ? "pulse-cover-container shadow-2xl rounded-xl" : "shadow-2xl rounded-xl"} style={{
  background: '#000000',
  borderRadius: '20px'  // Добавить явное значение
}}>
  {work.cover_url ? (
    <img 
      src={work.cover_url} 
      alt={work.title} 
      className="w-full aspect-[2/3] object-cover"
      style={{ borderRadius: '20px' }}  // Добавить в style
      loading="lazy"
    />
    ) : (
      <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center rounded-xl">
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
<h1 className="font-bold mb-3 sm:mb-4 break-words" style={{
  fontSize: isDarkTheme ? 'clamp(2rem, 5vw, 4rem)' : 'clamp(1.5rem, 4vw, 3rem)',
  fontFamily: isDarkTheme ? "'plommir', Georgia, serif" : "'kikamori', Georgia, serif",
  fontStyle: !isDarkTheme ? 'italic' : 'normal',
  color: 'transparent',
  backgroundImage: isDarkTheme 
    ? 'linear-gradient(90deg, #cf7dff 0%, #af71ff 50%, #953ff7 100%)'
    : 'radial-gradient(ellipse at top left, #c8c0c2 0%, #797874 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: isDarkTheme ? 'workPageShimmer 3s linear infinite' : 'none'
}}>
  {work.title}
</h1>

{/* ФАНДОМ И ПЕЙРИНГ */}
{(work.fandom || work.pairing) && (
  <div className="mb-1 space-y-0.5">
    {work.fandom && (
      <div>
        <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Фандом: </span>
        <span className="text-gray-200 text-xs sm:text-sm break-words">{work.fandom}</span>
      </div>
    )}
    {work.pairing && (
      <div>
        <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Пейринг: </span>
        <span className="text-gray-200 text-xs sm:text-sm break-words">{work.pairing}</span>
      </div>
    )}
  </div>
)}

{/* ИНФОРМАЦИЯ О РАБОТЕ */}
<div className="mb-1 space-y-0.5">
  <div>
    <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Направление: </span>
    <span className="text-xs sm:text-sm">
      <GenreTag name={work.direction} />
    </span>
  </div>
  <div>
    <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Рейтинг: </span>
    <span className="text-xs sm:text-sm">
      <GenreTag name={work.rating} />
    </span>
  </div>
{work.category && (
  <div>
    <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Категория: </span>
    <span className="text-xs sm:text-sm">
      <GenreTag name={{
        novel: 'Роман',
        longfic: 'Лонгфик',
        minific: 'Минифик'
      }[work.category] || work.category} />
    </span>
  </div>
)}
{work.status && (
  <div>
    <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Статус: </span>
    <span className="text-xs sm:text-sm">
      <GenreTag name={{
        completed: 'Завершён',
        ongoing: 'В процессе'
      }[work.status] || work.status} />
    </span>
  </div>
)}
  {work.total_pages > 0 && (
    <div>
      <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Всего страниц: </span>
      <span className="text-gray-200 text-xs sm:text-sm">{work.total_pages.toLocaleString()}</span>
    </div>
  )}

{/* ЖАНРЫ */}
{work.genres && (Array.isArray(work.genres) ? work.genres.length > 0 : work.genres.trim().length > 0) && (
  <div>
    <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>{t.genres}: </span>
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
  <div>
    <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>{t.tags}: </span>
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
</div>

{/* СПОЙЛЕРНЫЕ МЕТКИ */}
{spoilerTagsArray.length > 0 && (
  <div className="mb-1">
    <style dangerouslySetInnerHTML={{__html: `
  @keyframes arrowBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(5px); }
  }
  .arrow-animated {
    animation: arrowBounce 1.5s ease-in-out infinite;
  }
    `}} />
<button
  onClick={() => setShowSpoilers(!showSpoilers)}
  className="flex items-center gap-2 transition text-left mb-1"
  style={{
    backgroundColor: 'transparent',
    padding: 0
  }}
>
  <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>
    {t.spoilerTags}:
  </span>
  <div className={!showSpoilers ? 'arrow-animated' : ''} style={{
    transform: showSpoilers ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s ease',
    color: isDarkTheme ? '#9333ea' : '#47051e'
  }}>
    <ChevronDown size={18} className="sm:w-5 sm:h-5" />
  </div>
</button>
    
{showSpoilers && (
  <div className="text-xs sm:text-sm whitespace-pre-wrap" style={{
        backgroundColor: 'transparent',
        color: '#ffffff'
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

{/* ДИСКЛЕЙМЕР */}
{work.disclaimer && work.disclaimer.trim() && (
  <div className="mb-1">
<button
  onClick={() => setShowDisclaimer(!showDisclaimer)}
  className="flex items-center gap-2 transition text-left mb-1"
  style={{
    backgroundColor: 'transparent',
    padding: 0
  }}
>
  <span className="text-sm sm:text-base" style={{ color: isDarkTheme ? '#9333ea' : '#47051e' }}>Дисклеймер:</span>
  <div className={!showDisclaimer ? 'arrow-animated' : ''} style={{
    transform: showDisclaimer ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.3s ease',
    color: isDarkTheme ? '#9333ea' : '#47051e'
  }}>
    <ChevronDown size={18} className="sm:w-5 sm:h-5" />
  </div>
</button>
    
{showDisclaimer && (
  <div className="whitespace-pre-wrap text-xs sm:text-sm"
        style={{
          backgroundColor: 'transparent',
          color: '#ffffff'
        }}
      >
        {work.disclaimer}
      </div>
    )}
  </div>
)}

<div className="flex gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6 items-center">
              <div 
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
                style={{
                  backgroundColor: '#0e0e0e',
                  border: '1px solid #2e2e2e',
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
    background: isDarkTheme ? 'rgba(147, 51, 234, 0.2)' : 'rgba(3, 3, 3, 0.2)',
    borderColor: isDarkTheme ? '#9333ea' : '#333333',
    color: '#FFFFFF',
    boxShadow: isDarkTheme ? '0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4)' : 'none',
    backdropFilter: 'blur(10px)',
    animation: isDarkTheme ? 'shimmer-purple 2s ease-in-out infinite' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(147, 51, 234, 0.4)' : 'rgba(8, 8, 8, 0.4)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 15px rgba(147, 51, 234, 0.9), 0 0 30px rgba(147, 51, 234, 0.6)' : '0 0 10px rgba(5, 5, 5, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(147, 51, 234, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4)' : 'none';
  }}
              >
                <Star size={14} className="sm:w-4 sm:h-4" fill={userRating ? 'currentColor' : 'none'} />
                <span>Оценка: {averageRating > 0 ? averageRating.toFixed(1) : '—'}</span>
              </button>

<button
  onClick={toggleFavorite}
  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-2 transition cursor-pointer"
  style={{
    background: isDarkTheme ? 'rgba(239, 1, 203, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    borderColor: isDarkTheme ? '#ef01cb' : '#333333',
    color: '#FFFFFF',
    boxShadow: isDarkTheme ? '0 0 10px rgba(239, 1, 203, 0.6), 0 0 20px rgba(239, 1, 203, 0.4)' : 'none',
    backdropFilter: 'blur(10px)',
    animation: isDarkTheme ? 'shimmer-pink 2s ease-in-out infinite' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(239, 1, 203, 0.4)' : 'rgba(0, 0, 0, 0.4)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 15px rgba(239, 1, 203, 0.9), 0 0 30px rgba(239, 1, 203, 0.6)' : '0 0 10px rgba(201, 198, 176, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(239, 1, 203, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 10px rgba(239, 1, 203, 0.6), 0 0 20px rgba(239, 1, 203, 0.4)' : 'none';
  }}
>
  <svg width="14" height="14" viewBox="0 0 24 24" className="sm:w-4 sm:h-4" fill={isFavorited ? '#ef01cb' : 'none'} stroke="#ef01cb" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
  <span>{isFavorited ? 'В избранном' : 'В избранное'}</span>
</button>

<Link
  href={`/work/${workId}/discussion`}
  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border-2 transition cursor-pointer"
  style={{
    background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.2)',
    borderColor: isDarkTheme ? '#b3e7ef' : '#333333',
    color: '#FFFFFF',
    boxShadow: isDarkTheme ? '0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4)' : 'none',
    animation: isDarkTheme ? 'shimmer-cyan 2s ease-in-out infinite' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 15px rgba(179, 231, 239, 0.9), 0 0 30px rgba(179, 231, 239, 0.6)' : '0 0 10px rgba(0, 0, 0, 0.3)';
    if (!isDarkTheme) {
      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
    }
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4)' : 'none';
    if (!isDarkTheme) {
      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
    }
  }}
>
  <svg width="14" height="14" viewBox="0 0 24 24" className="sm:w-4 sm:h-4" fill="none" stroke="#b3e7ef" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  <span>Обсуждение</span>
</Link>
            </div>
{/* ОПИСАНИЕ */}
<div className="rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2" style={{
  background: 'transparent',
  borderColor: isDarkTheme ? '#9333ea' : '#47051e'
}}>
  <h2 className="font-bold mb-2 sm:mb-3" style={{
  fontSize: isDarkTheme ? 'clamp(1.5rem, 3.5vw, 2.5rem)' : 'clamp(1.25rem, 3vw, 1.5rem)',
    fontFamily: isDarkTheme ? "'ppelganger', Georgia, serif" : "'miamanueva', Georgia, serif",
    color: isDarkTheme ? '#9333ea' : 'transparent',
    background: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #615c4e  100%)' : 'none',
    WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
    WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
    backgroundClip: !isDarkTheme ? 'text' : 'unset'
  }}>{t.description}</h2>
  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words" style={{ fontSize: '14px' }}>{work.description}</p>
</div>

            {/* ПРИМЕЧАНИЕ АВТОРА */}
{work.author_note && (
<div className="rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border-2"  style={{
  background: 'transparent',
  borderColor: isDarkTheme ? '#9333ea' : '#47051e'
  }}>
<h2 className="font-bold mb-2" style={{
  fontSize: isDarkTheme ? 'clamp(1.5rem, 3.5vw, 2.5rem)' : 'clamp(1.25rem, 3vw, 1.5rem)',
      fontFamily: isDarkTheme ? "'ppelganger', Georgia, serif" : "'miamanueva', Georgia, serif",
      color: isDarkTheme ? '#9333ea' : 'transparent',
      background: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #615c4e 100%)' : 'none',
      WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
      WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
      backgroundClip: !isDarkTheme ? 'text' : 'unset'
    }}>{t.authorNote}</h2>
    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words" style={{ fontSize: '14px' }}>{work.author_note}</p>
  </div>
)}

            {/* ИЗОБРАЖЕНИЯ ПЕРСОНАЖЕЙ */}
            {characterImagesArray.length > 0 && (
              <div className="mb-4 sm:mb-6">
<h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-3 sm:mb-4">
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
    className="flex-shrink-0 w-36 h-48 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 transition shadow-lg snap-start relative cursor-pointer"
    style={{
      borderColor: isDarkTheme ? '#7626b5' : '#c9c6bb',
      boxShadow: isDarkTheme ? '0 0 10px rgba(118, 38, 181, 0.5)' : '0 0 10px rgba(192, 167, 109, 0.5)'
    }}
    onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt={`Character ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
  <button
  onClick={(e) => {
    e.stopPropagation();
    toggleSaveImage(img);
  }}
  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 p-2 rounded-full transition-all duration-300"
  style={{
    background: isDarkTheme 
      ? (savedImages.includes(img) ? 'rgba(239, 1, 203, 0.9)' : 'rgba(0, 0, 0, 0.7)')
      : '#40030f',
    backdropFilter: 'blur(10px)',
    boxShadow: savedImages.includes(img)
      ? (isDarkTheme 
          ? '0 0 15px rgba(239, 1, 203, 0.8), 0 0 30px rgba(239, 1, 203, 0.5)'
          : '0 0 15px rgba(133, 0, 45, 0.8), 0 0 30px rgba(133, 0, 45, 0.5)')
      : (isDarkTheme ? '0 0 10px rgba(0, 0, 0, 0.5)' : 'none')
  }}
>
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill={savedImages.includes(img) ? (isDarkTheme ? '#ef01cb' : '#65635d') : 'none'}
    stroke={isDarkTheme 
      ? (savedImages.includes(img) ? '#ffffff' : '#ef01cb')
      : '#c9c6bb'}
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
</button>
                      </div>
                    ))}
                  </div>

                  {characterImagesArray.length > 1 && (
                    <>
 <button
  onClick={() => scrollCharacterCarousel('left')}
  className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition z-10"
  style={{
    backgroundColor: isDarkTheme ? '#7626b5' : '#65635d',
    boxShadow: isDarkTheme 
      ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
      : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#65635d';
    e.currentTarget.style.boxShadow = isDarkTheme 
      ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
      : 'none';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#65635d';
    e.currentTarget.style.boxShadow = isDarkTheme 
      ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
      : 'none';
  }}
>
  <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
</button>
<button
  onClick={() => scrollCharacterCarousel('right')}
  className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition z-10"
  style={{
    backgroundColor: isDarkTheme ? '#7626b5' : '#65635d',
    boxShadow: isDarkTheme 
      ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
      : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#65635d';
    e.currentTarget.style.boxShadow = isDarkTheme 
      ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
      : 'none';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#65635d';
    e.currentTarget.style.boxShadow = isDarkTheme 
      ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
      : 'none';
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
<h2 className="font-bold mb-3 sm:mb-4 text-center" style={{
  fontSize: isDarkTheme ? 'clamp(1.75rem, 4vw, 3rem)' : 'clamp(1.5rem, 3vw, 1.875rem)',
    fontFamily: isDarkTheme ? "'plommir', Georgia, serif" : "'kikamori', Georgia, serif",
    color: isDarkTheme ? '#591e9c' : '#797874',
    background: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #646155 100%)' : 'none',
    WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
    WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
    backgroundClip: !isDarkTheme ? 'text' : 'unset',
    fontStyle: !isDarkTheme ? 'italic' : 'normal'
  }}>
    {t.contents}
  </h2>
</div>

{/* ГЛАВЫ */}
<style dangerouslySetInnerHTML={{__html: `
  @keyframes shimmer-chapter {
    0% { box-shadow: 0 0 15px rgba(118, 38, 181, 0.5); }
    50% { box-shadow: 0 0 25px rgba(172, 64, 255, 0.8); }
    100% { box-shadow: 0 0 15px rgba(118, 38, 181, 0.5); }
  }
`}} />
<div style={{
  background: 'transparent'
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
    background: isDarkTheme ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
    borderColor: isDarkTheme ? '#9333ea' : '#47051e',
    boxShadow: !isDarkTheme ? 'inset 0 0 30px rgba(0, 0, 0, 0.4)' : 'none'
  }}
  onMouseEnter={(e) => {
    if (isDarkTheme) {
      e.currentTarget.style.backgroundColor = '#2700276e';
      e.currentTarget.style.borderColor = '#9333ea';
      e.currentTarget.style.animation = 'shimmer-chapter 2s ease-in-out infinite';
    } else {
      e.currentTarget.style.background = '#47051e38';
      e.currentTarget.style.borderColor = '#47051e';
      e.currentTarget.style.boxShadow = 'inset 0 0 30px rgb(0, 0, 0)';
    }
  }}
  onMouseLeave={(e) => {
    if (isDarkTheme) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.borderColor = '#9333ea';
      e.currentTarget.style.animation = 'none';
      e.currentTarget.style.boxShadow = 'none';
    } else {
      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
      e.currentTarget.style.borderColor = 'rgba(83, 3, 36, 0.65)';
      e.currentTarget.style.boxShadow = 'inset 0 0 30px rgba(0, 0, 0, 0.4)';
    }
  }}
>
  <div className="flex justify-between items-start gap-2 sm:gap-4">
    <div className="flex-1 min-w-0">
<h3 className="font-semibold transition mb-1 sm:mb-2 break-words" style={{
  color: '#bdb8b8',
  fontFamily: isDarkTheme ? "'ppelganger', Georgia, serif" : "'miamanueva', Georgia, serif",
  fontSize: isDarkTheme ? 'clamp(1.125rem, 2.5vw, 1.5rem)' : 'clamp(1rem, 2vw, 1.25rem)'
}}>
        {chapter.chapter_number}. {chapter.title}
      </h3>
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
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
            <div className="flex-shrink-0 transition" style={{
              color: isDarkTheme ? '#9333ea' : '#49001c'
            }}>
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
    <div className="rounded-xl p-6 sm:p-8 max-w-md w-full relative" style={{
      background: isDarkTheme 
        ? 'rgba(147, 51, 234, 0.15)'
        : 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: isDarkTheme 
        ? '2px solid #9333ea'
        : '3px solid transparent',
      borderRadius: isDarkTheme ? '12px' : '16px',
      backgroundClip: isDarkTheme ? 'border-box' : 'padding-box',
      backdropFilter: 'blur(20px)',
      boxShadow: isDarkTheme 
        ? '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.3)'
        : 'inset 0 0 50px rgba(0, 0, 0, 0.6)'
    }}>
      {!isDarkTheme && (
        <div style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: '16px',
          padding: '3px',
          background: 'linear-gradient(135deg, #65635d 0%, #000000 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: -1
        }} />
      )}

      <button
        onClick={() => setShowRatingModal(false)}
        className="absolute top-4 right-4 transition"
        style={{
          color: isDarkTheme ? '#c084fc' : '#65635d'
        }}
      >
        <X size={24} />
      </button>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmerRating {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}} />
      
      <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center" style={{
        color: isDarkTheme ? '#c084fc' : 'transparent',
        textShadow: isDarkTheme ? '0 0 15px rgba(192, 132, 252, 0.8)' : 'none',
        background: !isDarkTheme ? 'linear-gradient(90deg, #65635d 0%, #ffffff 50%, #65635d 100%)' : 'none',
        backgroundSize: !isDarkTheme ? '200% auto' : 'auto',
        WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
        WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
        backgroundClip: !isDarkTheme ? 'text' : 'unset',
        animation: !isDarkTheme ? 'shimmerRating 3s linear infinite' : 'none'
      }}>
        Оцените работу
      </h3>
      
      {!currentUser ? (
        <p className="text-center py-4" style={{ 
          color: isDarkTheme ? '#e9d5ff' : '#c9c6bb'
        }}>
          Войдите, чтобы оставить оценку
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm sm:text-base" style={{ 
            color: isDarkTheme ? '#e9d5ff' : '#c9c6bb'
          }}>
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
                style={userRating === num ? (
                  isDarkTheme ? {
                    background: 'rgba(147, 51, 234, 0.8)',
                    boxShadow: '0 0 15px rgba(147, 51, 234, 0.9)'
                  } : {
                    background: '#65635d',
                    color: '#ffffff'
                  }
                ) : (
                  isDarkTheme ? {
                    background: 'rgba(147, 51, 234, 0.2)',
                    border: '1px solid rgba(147, 51, 234, 0.4)'
                  } : {
                    background: 'rgba(101, 99, 93, 0.2)',
                    border: '1px solid rgba(101, 99, 93, 0.4)',
                    color: '#c9c6bb'
                  }
                )}
                onMouseEnter={(e) => {
                  if (userRating !== num) {
                    if (isDarkTheme) {
                      e.currentTarget.style.background = 'rgba(147, 51, 234, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(147, 51, 234, 0.6)';
                    } else {
                      e.currentTarget.style.background = 'rgba(101, 99, 93, 0.4)';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (userRating !== num) {
                    if (isDarkTheme) {
                      e.currentTarget.style.background = 'rgba(147, 51, 234, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    } else {
                      e.currentTarget.style.background = 'rgba(101, 99, 93, 0.2)';
                    }
                  }
                }}
              >
                {num}
              </button>
            ))}
          </div>
          
          {totalRatings > 0 && (
            <p className="text-center mt-4 text-xs sm:text-sm" style={{ 
              color: isDarkTheme ? '#d8b4fe' : '#c9c6bb'
            }}>
              Средняя оценка: {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'оценка' : 'оценок'})
            </p>
          )}
        </>
      )}
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
{showConfirmModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-md p-6" style={{
      background: isDarkTheme 
        ? 'rgba(147, 51, 234, 0.15)' 
        : 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: isDarkTheme 
        ? '2px solid #9333ea' 
        : '3px solid transparent',
      borderRadius: '16px',
      backgroundClip: isDarkTheme ? 'border-box' : 'padding-box',
      position: 'relative',
      backdropFilter: 'blur(20px)',
      boxShadow: isDarkTheme 
        ? '0 0 30px rgba(147, 51, 234, 0.6)' 
        : 'inset 0 0 50px rgba(0, 0, 0, 0.6)'
    }}>
      {!isDarkTheme && (
        <div style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: '16px',
          padding: '3px',
          background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: -1
        }} />
      )}
      <p className="text-center text-base sm:text-lg mb-6 whitespace-pre-wrap" style={{
        color: isDarkTheme ? '#ffffff' : '#c9c6bb'
      }}>
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
                background: isDarkTheme 
                  ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
                  : '#c9c6bb',
                color: isDarkTheme ? '#ffffff' : '#000000',
                boxShadow: isDarkTheme 
                  ? '0 0 15px rgba(147, 112, 219, 0.6)' 
                  : '0 0 15px rgba(216, 197, 162, 0.4)',
                border: 'none'
              }}
            >
              Да
            </button>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 py-3 rounded-lg font-bold transition"
              style={{
                background: isDarkTheme ? 'transparent' : 'rgba(216, 197, 162, 0.15)',
                borderColor: isDarkTheme ? '#9370db' : '#65635d',
                border: isDarkTheme ? '2px solid #9370db' : '2px solid #c9c6bb',
                color: isDarkTheme ? '#9370db' : '#c9c6bb'
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
              background: isDarkTheme 
                ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
                : '#c9c6bb',
              color: isDarkTheme ? '#ffffff' : '#000000',
              boxShadow: isDarkTheme 
                ? '0 0 15px rgba(147, 112, 219, 0.6)' 
                : '0 0 15px rgba(216, 197, 162, 0.4)',
              border: 'none'
            }}
          >
            ОК
          </button>
        )}
      </div>
    </div>
  </div>
)}

      {/* ЧИТАТЕЛЬСКАЯ ПАНЕЛЬ */}
{showReaderPanel && userProfile && (
  <>
    {/* ТЕМНАЯ ПАНЕЛЬ */}
{isDarkTheme && (
 <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-30 overflow-y-auto shadow-2xl border-2" style={{
    background: 'rgba(147, 51, 234, 0.15)',
    borderColor: '#9333ea',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
  }}>
<div className="sticky top-0 p-4 sm:p-5 flex justify-center items-center relative overflow-hidden" style={{
  background: 'rgba(139, 60, 200, 0.3)',
  backdropFilter: 'blur(10px)',
  borderBottom: '2px solid rgba(147, 112, 219, 0.6)'
}}>
      <h2 className="text-2xl sm:text-4xl font-bold" style={{
  color: '#fff',
  textShadow: '0 0 30px rgba(179, 231, 239, 1)',
  position: 'relative',
  zIndex: 1,
  fontFamily: "'ppelganger', Georgia, serif"
}}>{userProfile.nickname}</h2>
          <button onClick={() => setShowReaderPanel(false)} className="text-gray-400 hover:text-white absolute right-3 sm:right-4">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
 <button
onClick={() => {
  setShowUpdatesModal(true);
  loadSiteUpdates();
  setShowReaderPanel(false);
}}
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base overflow-hidden"
  style={{
    background: 'rgba(160, 99, 207, 0.4)',
    border: '2px solid',
    borderColor: siteUpdates.length > 0 ? '#ef01cb' : '#a063cf',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    boxShadow: siteUpdates.length > 0 ? '0 0 25px rgba(239, 1, 203, 0.8)' : 'none'
  }}
  onMouseEnter={(e) => {
    if (siteUpdates.length === 0) {
      e.currentTarget.style.borderColor = '#fff';
      e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    }
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = siteUpdates.length > 0 ? '#ef01cb' : '#a063cf';
    e.currentTarget.style.boxShadow = siteUpdates.length > 0 ? '0 0 25px rgba(239, 1, 203, 0.8)' : 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" className="sm:w-5 sm:h-5">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
  <span style={{ 
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}>Обновления</span>
</button>

<Link
  href="/collection"
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base overflow-hidden block"
  style={{
    background: 'rgba(160, 99, 207, 0.4)',
    border: '2px solid #a063cf',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#fff';
    e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#a063cf';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  <Heart size={18} className="sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
  <span style={{ 
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}>Моя коллекция</span>
</Link>

<Link
  href="/my-messages"
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base overflow-hidden block"
  style={{
    background: 'rgba(160, 99, 207, 0.4)',
    border: '2px solid #a063cf',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#fff';
    e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#a063cf';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  <MessageSquare size={18} className="sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
  <span style={{ 
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}>Мои сообщения</span>
</Link>

          <button
            onClick={() => {
  setShowManagementModal(true);
  setShowReaderPanel(false);
}}
            className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
            style={{
              background: 'rgba(160, 99, 207, 0.4)',
              border: '2px solid #a063cf',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#ffffff'
            }}
          >
            <Settings size={18} className="sm:w-5 sm:h-5" />
            Настройки
          </button>

          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{
                background: 'rgba(160, 99, 207, 0.4)',
                border: '2px solid #a063cf',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                color: '#ffffff'
              }}
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              Выход
            </button>
          </div>
        </div>
      </div>
    )}

   {/* СВЕТЛАЯ ПАНЕЛЬ */}
    {!isDarkTheme && (
     <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-30 overflow-y-auto shadow-3xl" style={{
        borderLeft: '12px solid',
        borderImage: 'linear-gradient(to bottom, #000000 0%, #000000 20%, #000000 40%, #000000 60%, #000000 80%, #000000 100%) 1',
        boxShadow: 'inset 8px 0 15px hsla(0, 0%, 0%, 0.50), -3px 0 10px rgba(0, 0, 0, 0.3)',
         background: 'linear-gradient(135deg, #1f0213 0%, #27030e 25%, #3b0724 50%, #000000 75%, #290e1d 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="sticky top-0 p-6 backdrop-blur-xl relative overflow-hidden" style={{
background: 'linear-gradient(135deg, rgba(2, 2, 2, 0.25) 0%, rgba(63, 2, 20, 0.5) 100%)',
borderBottom: '1px solid rgba(29, 29, 29, 0.35)',
boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'

        }}>

<h2 className="text-4xl sm:text-5xl font-bold text-center mb-4" style={{
  color: '#757162',
  fontFamily: "'sooonsi', Georgia, serif"
}}>{userProfile.nickname}</h2>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes champagneBubbles {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
              50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
            }
            @keyframes shimmerGold {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .champagne-text {
              background: linear-gradient(90deg, #c9c6bb 0%, #3a3a3a 50%, #bcbbae 100%;
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmerGold 3s linear infinite;
              font-family: 'Playfair Display', Georgia, serif;
            }
          `}} />
          
<button 
  onClick={() => setShowReaderPanel(false)}
  className="absolute right-4 top-4 p-2 rounded-full transition-all z-20"
            style={{
              background: 'rgba(26, 26, 26, 0.35)',
              backdropFilter: 'blur(1px)',
              border: '1px solid rgba(10, 10, 10, 0.15)'
            }}
          >
            <X size={20} color="#c9c6bb" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex flex-col h-[calc(100vh-120px)]">
<button
  onClick={() => {
    setShowUpdatesModal(true);
    loadSiteUpdates();
  }}
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
  style={{
    background: siteUpdates.length > 0 ? '#d8d7d7' : 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
  }} />
  
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={siteUpdates.length > 0 ? "#e9e6d8" : "#61031b"} strokeWidth="2" className="relative z-10">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
  <span className="relative z-10" style={{ 
    color: siteUpdates.length > 0 ? '#e9e6d8' : '#68021c',
    fontStyle: 'italic'
  }}>
    Обновления
  </span>
</button>

<Link
  href="/collection"
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group block"
  style={{
    background: siteUpdates.length > 0 ? '#d8d7d7' : 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
  }} />
  
 <Heart size={20} color="#d8d7d7" className="relative z-10" />
  <span className="relative z-10" style={{ 
    background: 'linear-gradient(90deg, #857f6a 0%, #dfdede 50%, #857f6a 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmerGoldBtn 3s linear infinite',
    fontStyle: 'normal',
    fontWeight: '600'
  }}>
    Моя коллекция
  </span>
</Link>

<Link
  href="/my-messages"
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group block"
  style={{
    background: siteUpdates.length > 0 ? '#d8d7d7' : 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
  }} />
  
  <MessageSquare size={20} color="#d8d7d7" className="relative z-10" />
  <span className="relative z-10" style={{ 
    background: 'linear-gradient(90deg, #857f6a 0%, #dfdede 50%, #857f6a 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmerGoldBtn 3s linear infinite',
    fontStyle: 'normal',
    fontWeight: '600'
  }}>
    Мои сообщения
  </span>
</Link>

 <button
  onClick={() => setShowManagementModal(true)}
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
  style={{
    background: siteUpdates.length > 0 ? '#d8d7d7' : 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
  }} />
  
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes shimmerGoldBtn {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `}} />
  
  <Settings size={20} color="#d8d7d7" className="relative z-10" />
  <span className="relative z-10" style={{ 
   background: 'linear-gradient(90deg, #857f6a 0%, #dfdede 50%, #857f6a 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmerGoldBtn 3s linear infinite',
    fontStyle: 'normal',
    fontWeight: '600'
  }}>
    Настройки
  </span>
</button>

<div className="mt-4">
  <button
    onClick={handleLogout}
    className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
    style={{
   background: siteUpdates.length > 0 ? '#d8d7d7' : 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
  }} />
    
    <LogOut size={20} color="#d8d7d7" className="relative z-10" />
<span className="relative z-10" style={{ 
      background: 'linear-gradient(90deg, #857f6a 0%, #dfdede 50%, #857f6a 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'shimmerGoldBtn 3s linear infinite',
      fontStyle: 'normal',
      fontWeight: '600'
    }}>
      Выход
    </span>
  </button>
</div>
        </div>
      </div>
    )}
  </>
)}

{/* МОДАЛЬНОЕ ОКНО НАСТРОЕК - ТЕМНАЯ ТЕМА */}
{showManagementModal && isDarkTheme && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          background: 'linear-gradient(90deg, #b3e7ef 0%, #ef01cb 50%, #b3e7ef 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Настройки</h2>
        <button onClick={() => setShowManagementModal(false)} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-white mb-2 text-sm">Интерфейс сайта:</p>
<button
  onClick={toggleTheme}
  className="w-full relative rounded-full p-1 transition-all duration-300"
  style={{
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
      : 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
    boxShadow: '0 0 20px rgba(147, 112, 219, 0.6)',
    height: '40px'
  }}
>
  <div 
    className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
    style={{
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
      boxShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
      transform: isDarkTheme ? 'translateX(0)' : 'translateX(240px)',
    }}
  >
    <span style={{ fontSize: '16px', filter: 'grayscale(100%)' }}>
      {isDarkTheme ? '🌙' : '☀️'}
    </span>
  </div>
</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО НАСТРОЕК - СВЕТЛАЯ ТЕМА */}
{showManagementModal && !isDarkTheme && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-md p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Настройки</h2>
        <button onClick={() => setShowManagementModal(false)} className="absolute right-0" style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm" style={{ color: '#65635d' }}>Интерфейс сайта:</p>
<button
  onClick={toggleTheme}
  className="w-full relative rounded-full p-1 transition-all duration-300"
  style={{
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
       : 'linear-gradient(135deg, #c9c6bb%, #65635d 100%)',
    boxShadow: isDarkTheme 
      ? '0 0 20px rgba(147, 112, 219, 0.6)' 
      : '0 0 15px rgba(216, 197, 162, 0.4)',
    height: '40px'
  }}
>
  <div 
    className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
    style={{
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #ffffff 0%, #939085 100%)',
      boxShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
      transform: isDarkTheme ? 'translateX(0)' : 'translateX(240px)',
    }}
  >
    <span style={{ fontSize: '16px', filter: 'grayscale(100%)' }}>
      {isDarkTheme ? '🌙' : '☀️'}
    </span>
  </div>
</button>
        </div>
      </div>
    </div>
  </div>
)}

{/* UPDATES MODAL */}
{showUpdatesModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Обновления</h2>
        <button onClick={() => setShowUpdatesModal(false)} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {siteUpdates.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border-2 border-gray-700">
            <p className="text-gray-500">Пока нет обновлений</p>
          </div>
        ) : (
          <div className="space-y-3">
            {siteUpdates.map((update) => (
<div 
  key={update.id}
  className="rounded-lg p-4 border-2 transition cursor-pointer bg-black"
  style={{
    borderColor: update.type === 'new_work' ? '#ef01cb' : '#9370db',
    boxShadow: update.type === 'new_work' ? '0 0 15px rgba(239, 1, 203, 0.4)' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#ef01cb';
    e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 1, 203, 0.6)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = update.type === 'new_work' ? '#ef01cb' : '#9370db';
    e.currentTarget.style.boxShadow = update.type === 'new_work' ? '0 0 15px rgba(239, 1, 203, 0.4)' : 'none';
  }}
                onClick={async () => {

                  loadSiteUpdates();
                  if (update.work_id === workId) {
  setShowUpdatesModal(false);
} else {
  window.location.href = `/work/${update.work_id}`;
}
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ 
  color: '#ef01cb',
  filter: 'drop-shadow(0 0 5px rgba(239, 1, 203, 0.6))'
}}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    {update.type === 'new_work' ? (
                      <>
           <span className="inline-block text-xs font-bold px-2 py-1 rounded mb-2" style={{
  background: 'linear-gradient(135deg, #ef01cb 0%, #bc0897 100%)',
  boxShadow: '0 0 15px rgba(239, 1, 203, 0.8)',
  color: '#ffffff'
}}>
  НОВАЯ РАБОТА
</span>
                        <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                          {update.work_title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                          {update.work_title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-1">
                          {update.chapter_number} глава {update.chapter_title && `- ${update.chapter_title}`}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* UPDATES MODAL - СВЕТЛАЯ ТЕМА */}
{showUpdatesModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Обновления</h2>
        <button onClick={() => setShowUpdatesModal(false)} className="absolute right-0" style={{ color: '#c2ab75' }}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {siteUpdates.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(180, 154, 95, 0.3)'
          }}>
            <p style={{ color: '#c9c6bb' }}>Пока нет обновлений</p>
          </div>
        ) : (
          <div className="space-y-3">
            {siteUpdates.map((update) => (
              <div 
                key={update.id}
                className="rounded-lg p-4 transition cursor-pointer"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: update.type === 'new_work' ? '2px solid #c9c6bb' : '1px solid rgba(180, 154, 95, 0.3)'
                }}
                onClick={async () => {
                  loadSiteUpdates();
                  window.location.href = `/work/${update.work_id}`;
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9c6bb" style={{ 
                      filter: 'drop-shadow(0 0 5px rgba(194, 171, 117, 0.4))'
                    }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    {update.type === 'new_work' ? (
                      <>
                        <span className="inline-block text-xs font-bold px-2 py-1 rounded mb-2" style={{
                          background: '#c9c6bb',
                          color: '#000000'
                        }}>
                          НОВАЯ РАБОТА
                        </span>
                        <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: '#c9c6bb' }}>
                          {update.work_title}
                        </h3>
                        <p className="text-sm" style={{ color: '#c9c6bb', opacity: 0.8 }}>
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: '#c9c6bb' }}>
                          {update.work_title}
                        </h3>
                        <p className="text-sm mb-1" style={{ color: '#c9c6bb' }}>
                          {update.chapter_number} глава {update.chapter_title && `- ${update.chapter_title}`}
                        </p>
                        <p className="text-xs" style={{ color: '#c9c6bb', opacity: 0.7 }}>
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}


{/* МОДАЛЬНОЕ ОКНО КАРТИНКИ */}
{selectedImage && (
  <div 
    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(8px)'
    }}
    onClick={() => setSelectedImage(null)}
  >
    <div className="relative w-auto h-auto max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
      <div style={{
        borderRadius: '12px',
        padding: isDarkTheme ? '0' : '3px',
        background: isDarkTheme 
          ? 'transparent' 
          : 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)'
      }}>
        <img 
          src={selectedImage} 
          alt="Enlarged" 
          className="rounded-lg"
          style={{
            border: isDarkTheme ? '2px solid #c9c6bb' : 'none',
            boxShadow: isDarkTheme 
              ? '0 0 30px rgba(118, 38, 181, 0.8)' 
              : 'inset 0 0 50px rgba(0, 0, 0, 0.6)',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </div>
      
      <button
        onClick={() => setSelectedImage(null)}
        className="absolute top-2 right-2 p-2 rounded-full transition-all"
        style={{
          backgroundColor: isDarkTheme ? '#7626b5' : '#c9c6bb',
          boxShadow: isDarkTheme 
            ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
            : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#65635d';
          e.currentTarget.style.boxShadow = isDarkTheme 
            ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
            : 'none';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#c9c6bb';
          e.currentTarget.style.boxShadow = isDarkTheme 
            ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
            : 'none';
        }}
      >
        <X size={24} color="#000" />
      </button>
      
      {characterImagesArray.indexOf(selectedImage) > 0 && (
        <button
          onClick={() => setSelectedImage(characterImagesArray[characterImagesArray.indexOf(selectedImage) - 1])}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all"
          style={{
            backgroundColor: isDarkTheme ? '#916eb4' : '#c9c6bb',
            boxShadow: isDarkTheme 
              ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#916eb4' : '#65635d';
            e.currentTarget.style.boxShadow = isDarkTheme 
              ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
              : 'none';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#916eb4' : '#c9c6bb';
            e.currentTarget.style.boxShadow = isDarkTheme 
              ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
              : 'none';
          }}
        >
          <ChevronLeft size={24} color="#000" />
        </button>
      )}
      
      {characterImagesArray.indexOf(selectedImage) < characterImagesArray.length - 1 && (
        <button
          onClick={() => setSelectedImage(characterImagesArray[characterImagesArray.indexOf(selectedImage) + 1])}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all"
          style={{
            backgroundColor: isDarkTheme ? '#916eb4' : '#c9c6bb',
            boxShadow: isDarkTheme 
              ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#916eb4' : '#65635d';
            e.currentTarget.style.boxShadow = isDarkTheme 
              ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
              : 'none';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#916eb4' : '#c9c6bb';
            e.currentTarget.style.boxShadow = isDarkTheme 
              ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
              : 'none';
          }}
        >
          <ChevronRight size={24} color="#000" />
        </button>
      )}
    </div>
  </div>
)}
    </div>
  );
}