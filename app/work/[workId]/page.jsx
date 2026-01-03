'use client';
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
const [showCollectionModal, setShowCollectionModal] = useState(false);
const [collectionTab, setCollectionTab] = useState('favorites');
const [userFavorites, setUserFavorites] = useState([]);
const [userGallery, setUserGallery] = useState([]);
const [showReaderMessagesModal, setShowReaderMessagesModal] = useState(false);
const [readerMessages, setReaderMessages] = useState([]);
const [selectedReaderMessage, setSelectedReaderMessage] = useState(null);
const [newMessageText, setNewMessageText] = useState('');
const [replyMessageText, setReplyMessageText] = useState('');

const colors = ['#a91e30', '#8b1ea9', '#41d8ad', '#dbc78a', '#ec83c7', '#83eca5'];

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

const loadUserCollection = async () => {
  if (!currentUser) return;

  try {
    // Избранное
    const { data: favs } = await supabaseUGC
      .from('user_favorites')
      .select('work_id')
      .eq('user_id', currentUser.id);
    
    if (favs && favs.length > 0) {
      const workIds = favs.map(f => f.work_id);
      const { data: works } = await supabase
        .from('works')
        .select('id, title, cover_url, description')
        .in('id', workIds);
      setUserFavorites(works || []);
    }

    // Галерея
    const { data: images } = await supabaseUGC
      .from('saved_images')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    setUserGallery(images || []);
  } catch (err) {
    console.error('Ошибка загрузки коллекции:', err);
  }
};

const loadReaderMessages = async () => {
  if (!currentUser) return;

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('from_user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } else {
      setReaderMessages(data || []);
    }
  } catch (err) {
    console.error('Ошибка загрузки сообщений:', err);
  }
};

const sendNewMessage = async () => {
  if (!newMessageText.trim() || !userProfile) {
    showConfirm('Напишите сообщение!');
    return;
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      from_user_id: currentUser.id,
      from_nickname: userProfile.nickname,
      from_email: userProfile.email,
      message: newMessageText.trim(),
      is_read: false,
      admin_reply: null
    });

  if (error) {
    showConfirm('Ошибка отправки: ' + error.message);
  } else {
    showConfirm('Сообщение отправлено!');
    setNewMessageText('');
    loadReaderMessages();
  }
};

const sendReaderReply = async (messageId) => {
  if (!replyMessageText.trim()) {
    showConfirm('Напишите ответ!');
    return;
  }

  const { error } = await supabase
    .from('messages')
    .insert({
      from_user_id: currentUser.id,
      from_nickname: userProfile.nickname,
      from_email: userProfile.email,
      message: replyMessageText.trim(),
      is_read: false,
      admin_reply: null,
      reply_to_message_id: messageId
    });

  if (error) {
    showConfirm('Ошибка отправки ответа: ' + error.message);
  } else {
    showConfirm('Ответ отправлен!');
    setReplyMessageText('');
    setSelectedReaderMessage(null);
    loadReaderMessages();
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

useEffect(() => {
  if (currentUser) {
    loadSavedImages();
  }
}, [currentUser]);

useEffect(() => {
  if (showReaderMessagesModal && currentUser) {
    loadReaderMessages();
  }
}, [showReaderMessagesModal, currentUser]);

useEffect(() => {
  if (showCollectionModal && currentUser) {
    loadUserCollection();
  }
}, [showCollectionModal, currentUser]);

const loadSavedImages = async () => {
  if (!currentUser) return;
  
  try {
    const res = await fetch(`/api/ugc?action=get_saved_images&userId=${currentUser.id}`);
    const { images } = await res.json();
    
    if (images) {
      setSavedImages(images.map(img => img.image_url));
    }
  } catch (err) {
    console.error('Ошибка загрузки сохранённых изображений:', err);
  }
};

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
          action: 'delete_image',
          userId: currentUser.id,
          imageUrl: imageUrl
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
    // workId убираем
    imageUrl: imageUrl,
    imageSource: 'work'
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
      window.location.href = '/?login=true';
    }}
    className="pink-neon-button w-full py-3 rounded-lg font-bold text-base"
  >
    Войти
  </button>
  
  <button
    onClick={() => {
      window.location.href = '/?register=true';
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
  <div className="min-h-screen text-white" style={{ backgroundColor: isDarkTheme ? '#000000' : '#4e040f' }}>
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
    background: linear-gradient(135deg, #c2ab75 0%, #918150 100%);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(194, 171, 117, 0.6);
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #d8c5a2 0%, #c2ab75 100%);
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
  color: isDarkTheme ? '#9ca3af' : '#d4cece'
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
                  ? 'rgba(147, 112, 219, 0.3)'
                  : 'rgba(184, 171, 127, 0.3)',
                backdropFilter: 'blur(10px)',
                border: isDarkTheme 
                  ? '1px solid rgba(147, 112, 219, 0.5)'
                  : '1px solid rgba(184, 171, 127, 0.5)'
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
<div className="rounded-xl sm:rounded-2xl overflow-hidden md:sticky md:top-8 max-w-sm mx-auto md:max-w-none relative" style={{
  padding: '3px',
  background: isDarkTheme 
    ? '#9333ea' 
    : 'linear-gradient(135deg, #b6a96d 0%, #000000 100%)',
  borderRadius: '24px'
}}>
  {/* Анимация ТОЛЬКО для темной темы */}
  {isDarkTheme && (
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
  )}
  
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
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 break-words" style={{ 
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: !isDarkTheme ? 'italic' : 'normal',
  color: 'transparent',
  backgroundImage: isDarkTheme 
    ? 'linear-gradient(90deg, #9370db 0%, #ffffff 50%, #9370db 100%)'
    : 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)',
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
    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(158, 158, 158, 0.2)',
    borderColor: isDarkTheme ? '#ffffff' : '#9e9e9e',
    color: '#ffffff',
    boxShadow: isDarkTheme ? '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2)' : 'none',
    animation: isDarkTheme ? 'shimmer-white 2s ease-in-out infinite' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(158, 158, 158, 0.3)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(255, 255, 255, 0.3)' : '0 0 10px rgba(158, 158, 158, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(158, 158, 158, 0.2)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2)' : 'none';
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
    backgroundColor: '#6b6b6b',
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
    background: isDarkTheme ? 'rgba(147, 51, 234, 0.2)' : 'rgba(201, 198, 176, 0.2)',
    borderColor: isDarkTheme ? '#9333ea' : '#c9c6b0',
    color: '#FFFFFF',
    boxShadow: isDarkTheme ? '0 0 10px rgba(147, 51, 234, 0.6), 0 0 20px rgba(147, 51, 234, 0.4)' : 'none',
    backdropFilter: 'blur(10px)',
    animation: isDarkTheme ? 'shimmer-purple 2s ease-in-out infinite' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(147, 51, 234, 0.4)' : 'rgba(201, 198, 176, 0.4)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 15px rgba(147, 51, 234, 0.9), 0 0 30px rgba(147, 51, 234, 0.6)' : '0 0 10px rgba(201, 198, 176, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(147, 51, 234, 0.2)' : 'rgba(201, 198, 176, 0.2)';
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
    background: isDarkTheme ? 'rgba(239, 1, 203, 0.2)' : 'rgba(201, 198, 176, 0.2)',
    borderColor: isDarkTheme ? '#ef01cb' : '#c9c6b0',
    color: '#FFFFFF',
    boxShadow: isDarkTheme ? '0 0 10px rgba(239, 1, 203, 0.6), 0 0 20px rgba(239, 1, 203, 0.4)' : 'none',
    backdropFilter: 'blur(10px)',
    animation: isDarkTheme ? 'shimmer-pink 2s ease-in-out infinite' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(239, 1, 203, 0.4)' : 'rgba(201, 198, 176, 0.4)';
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 15px rgba(239, 1, 203, 0.9), 0 0 30px rgba(239, 1, 203, 0.6)' : '0 0 10px rgba(201, 198, 176, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = isDarkTheme ? 'rgba(239, 1, 203, 0.2)' : 'rgba(201, 198, 176, 0.2)';
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
    background: isDarkTheme ? '#000000' : 'rgba(201, 198, 176, 0.2)',
    borderColor: isDarkTheme ? '#b3e7ef' : '#c9c6b0',
    color: '#FFFFFF',
    boxShadow: isDarkTheme ? '0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4)' : 'none',
    animation: isDarkTheme ? 'shimmer-cyan 2s ease-in-out infinite' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 15px rgba(179, 231, 239, 0.9), 0 0 30px rgba(179, 231, 239, 0.6)' : '0 0 10px rgba(201, 198, 176, 0.3)';
    if (!isDarkTheme) {
      e.currentTarget.style.background = 'rgba(201, 198, 176, 0.4)';
    }
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 10px rgba(179, 231, 239, 0.6), 0 0 20px rgba(179, 231, 239, 0.4)' : 'none';
    if (!isDarkTheme) {
      e.currentTarget.style.background = 'rgba(201, 198, 176, 0.2)';
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
<div className="rounded-lg p-4 sm:p-6 border-2 mb-4 sm:mb-6" style={{
  background: isDarkTheme ? '#000000' : 'radial-gradient(ellipse at center, rgba(113, 20, 31, 0.8) 0%, rgba(74, 13, 21, 0.95) 100%)',
  borderColor: isDarkTheme ? '#9333ea' : '#b6a96d',
  boxShadow: !isDarkTheme ? 'inset 0 0 50px rgba(0, 0, 0, 0.6)' : 'none'
}}>
  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{
    fontStyle: !isDarkTheme ? 'italic' : 'normal',
    color: isDarkTheme ? '#9333ea' : 'transparent',
    background: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)' : 'none',
    WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
    WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
    backgroundClip: !isDarkTheme ? 'text' : 'unset'
  }}>{t.description}</h2>
  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words" style={{ fontSize: '14px' }}>{work.description}</p>
</div>

            {/* ПРИМЕЧАНИЕ АВТОРА */}
{work.author_note && (
  <div className="rounded-lg p-4 sm:p-6 mb-4 sm:mb-6" style={{
    background: isDarkTheme ? '#000000' : 'radial-gradient(ellipse at center, rgba(113, 20, 31, 0.8) 0%, rgba(74, 13, 21, 0.95) 100%)',
    borderLeft: isDarkTheme ? '4px solid #9333ea' : 'none',
    border: !isDarkTheme ? '2px solid #b6a96d' : 'none',
    boxShadow: !isDarkTheme ? 'inset 0 0 50px rgba(0, 0, 0, 0.6)' : 'none'
  }}>
    <h2 className="text-base sm:text-lg font-bold mb-2" style={{
      fontStyle: !isDarkTheme ? 'italic' : 'normal',
      color: isDarkTheme ? '#9333ea' : 'transparent',
      background: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)' : 'none',
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
    className="flex-shrink-0 w-36 h-48 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 transition shadow-lg snap-start relative cursor-pointer"
    style={{
      borderColor: isDarkTheme ? '#7626b5' : '#c0a76d',
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
      : '#85002d',
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
    fill={savedImages.includes(img) ? (isDarkTheme ? '#ef01cb' : '#d8c5a2') : 'none'}
    stroke={isDarkTheme 
      ? (savedImages.includes(img) ? '#ffffff' : '#ef01cb')
      : '#d8c5a2'}
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
    backgroundColor: isDarkTheme ? '#7626b5' : '#c0a76d',
    boxShadow: isDarkTheme 
      ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
      : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#d4c49a';
    e.currentTarget.style.boxShadow = isDarkTheme 
      ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
      : 'none';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#c0a76d';
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
    backgroundColor: isDarkTheme ? '#7626b5' : '#c0a76d',
    boxShadow: isDarkTheme 
      ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
      : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#d4c49a';
    e.currentTarget.style.boxShadow = isDarkTheme 
      ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
      : 'none';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#c0a76d';
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
  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3" style={{ 
    fontFamily: "'Playfair Display', Georgia, serif",
    color: isDarkTheme ? '#D3D3D3' : 'transparent',
    background: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)' : 'none',
    WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
    WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
    backgroundClip: !isDarkTheme ? 'text' : 'unset',
    fontStyle: !isDarkTheme ? 'italic' : 'normal'
  }}>
    <BookOpen size={24} className="sm:w-8 sm:h-8" style={{ color: isDarkTheme ? '#D3D3D3' : '#82713a' }} />
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
<div className="rounded-lg p-4 sm:p-6 lg:p-8 border-2" style={{
  background: isDarkTheme 
    ? '#000000' 
    : 'radial-gradient(ellipse at center, rgba(113, 20, 31, 0.8) 0%, rgba(74, 13, 21, 0.95) 100%)',
  borderColor: isDarkTheme ? '#9333ea' : '#b6a96d',
  boxShadow: isDarkTheme 
    ? '0 0 25px rgba(147, 51, 234, 0.8), 0 0 50px rgba(147, 51, 234, 0.5)' 
    : 'inset 0 0 50px rgba(0, 0, 0, 0.6)'
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
            borderColor: isDarkTheme ? '#333' : 'rgba(182, 169, 109, 0.3)',
            boxShadow: !isDarkTheme ? 'inset 0 0 30px rgba(0, 0, 0, 0.4)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (isDarkTheme) {
              e.currentTarget.style.backgroundColor = '#2a2a2a';
              e.currentTarget.style.borderColor = '#7626b5';
              e.currentTarget.style.animation = 'shimmer-chapter 2s ease-in-out infinite';
            } else {
              e.currentTarget.style.background = 'rgba(182, 169, 109, 0.2)';
              e.currentTarget.style.borderColor = '#b6a96d';
              e.currentTarget.style.boxShadow = 'inset 0 0 30px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (isDarkTheme) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.animation = 'none';
              e.currentTarget.style.boxShadow = 'none';
            } else {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(182, 169, 109, 0.3)';
              e.currentTarget.style.boxShadow = 'inset 0 0 30px rgba(0, 0, 0, 0.4)';
            }
          }}
        >
          <div className="flex justify-between items-start gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold transition mb-1 sm:mb-2 break-words" style={{
                color: '#ffffff'
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
              color: isDarkTheme ? '#9333ea' : '#b6a96d'
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

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
{showConfirmModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-md p-6 relative" style={{
      background: isDarkTheme 
        ? 'rgba(147, 51, 234, 0.15)' 
        : 'radial-gradient(ellipse at center, #71141f 0%, #4a0d15 100%)',
      border: isDarkTheme 
        ? '2px solid #9333ea' 
        : '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: isDarkTheme ? 'border-box' : 'padding-box',
      backdropFilter: 'blur(20px)',
      boxShadow: isDarkTheme 
        ? '0 0 30px rgba(147, 51, 234, 0.6)' 
        : '0 0 0 3px #71141f, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      {!isDarkTheme && (
        <div style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: '24px',
          padding: '3px',
          background: 'linear-gradient(135deg, #b49a5f 0%, #000000 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: -1
        }} />
      )}
      
      <p className="text-center text-base sm:text-lg mb-6 whitespace-pre-wrap" style={{
        color: isDarkTheme ? '#ffffff' : '#d8c5a2'
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
                  : '#d8c5a2',
                color: isDarkTheme ? '#ffffff' : '#000000',
                boxShadow: isDarkTheme 
                  ? '0 0 15px rgba(147, 112, 219, 0.6)' 
                  : 'none'
              }}
            >
              Да
            </button>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 py-3 rounded-lg font-bold transition border-2"
              style={{
                background: isDarkTheme ? 'transparent' : 'rgba(216, 197, 162, 0.15)',
                borderColor: isDarkTheme ? '#9370db' : '#d8c5a2',
                color: isDarkTheme ? '#9370db' : '#d8c5a2'
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
                : '#d8c5a2',
              color: isDarkTheme ? '#ffffff' : '#000000',
              boxShadow: isDarkTheme 
                ? '0 0 15px rgba(147, 112, 219, 0.6)' 
                : 'none'
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
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 border-l-2 z-[60] overflow-y-auto shadow-2xl" style={{ 
        borderColor: '#b3e7ef',
        backgroundImage: 'url(/textures/dark-erys.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="sticky top-0 p-4 sm:p-5 flex justify-center items-center relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
          borderBottom: '3px solid rgba(147, 112, 219, 0.6)'
        }}>
          <h2 className="text-lg sm:text-xl font-bold" style={{ 
            color: '#fff',
            textShadow: '0 0 30px rgba(179, 231, 239, 1)'
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

<button
onClick={() => {
  setShowCollectionModal(true);
  loadUserCollection();
  setShowReaderPanel(false);
}}
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base overflow-hidden"
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
</button>

<button
onClick={() => {
  setShowReaderMessagesModal(true);
  loadReaderMessages();
  setShowReaderPanel(false);
}}
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base overflow-hidden"
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
  {readerMessages.some(m => m.admin_reply && !m.is_read) && (
    <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
      {readerMessages.filter(m => m.admin_reply && !m.is_read).length}
    </span>
  )}
</button>

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
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 z-[60] overflow-y-auto shadow-2xl" style={{ 
        borderLeft: '12px solid',
        borderImage: 'linear-gradient(to bottom, #b49a5f 0%, #8b7345 20%, #6b5530 40%, #4a3a1f 60%, #2a1f0f 80%, #000000 100%) 1',
        boxShadow: 'inset 8px 0 15px hsla(0, 0%, 0%, 0.50), -3px 0 10px rgba(0, 0, 0, 0.3)',
        backgroundImage: 'url(/textures/red-musse.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="sticky top-0 p-6 backdrop-blur-xl relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(158, 144, 76, 0.15) 0%, rgba(144, 120, 60, 0.1) 100%)',
          borderBottom: '1px solid rgba(158, 144, 76, 0.2)',
          boxShadow: '0 8px 32px rgba(158, 144, 76, 0.1)'
        }}>
          <h2 className="text-lg sm:text-xl font-bold text-center mb-4" style={{ 
            color: '#e4e1c8',
            fontFamily: "'RuinedC', Georgia, serif"
          }}>{userProfile.nickname}</h2>
          
          <button 
            onClick={() => setShowReaderPanel(false)}
            className="absolute right-4 top-4 p-2 rounded-full transition-all z-20"
            style={{
              background: 'rgba(158, 144, 76, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(158, 144, 76, 0.3)'
            }}
          >
            <X size={20} color="#9e904c" />
          </button>
        </div>

        <div className="p-6 space-y-4">
<button
onClick={() => {
  setShowUpdatesModal(true);
  loadSiteUpdates();
  setShowReaderPanel(false);
}}
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
  style={{
    background: siteUpdates.length > 0 ? '#62091e' : 'linear-gradient(135deg, rgba(158, 144, 76, 0.2), rgba(144, 120, 60, 0.2))',
    border: '1px solid rgba(158, 144, 76, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(158, 144, 76, 0.1)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
  }} />
  
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={siteUpdates.length > 0 ? "#e9e6d8" : "#62091e"} strokeWidth="2" className="relative z-10">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
<span className="relative z-10" style={{ 
  background: siteUpdates.length > 0 
    ? 'none' 
    : 'linear-gradient(90deg, #62091e 0%, #e9e6d8 50%, #62091e 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: siteUpdates.length > 0 ? 'unset' : 'text',
  WebkitTextFillColor: siteUpdates.length > 0 ? '#e9e6d8' : 'transparent',
  backgroundClip: siteUpdates.length > 0 ? 'unset' : 'text',
  animation: siteUpdates.length > 0 ? 'none' : 'shimmerGoldBtn 3s linear infinite',
  color: siteUpdates.length > 0 ? '#e9e6d8' : 'transparent',
  fontStyle: 'italic'
}}>
  Обновления
</span>
</button>

<button
onClick={() => {
  setShowCollectionModal(true);
  loadUserCollection();
  setShowReaderPanel(false);
}}
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
  style={{
    background: 'linear-gradient(135deg, rgba(149, 138, 86, 0.4), rgba(144, 120, 60, 0.4))',
    border: '1px solid rgba(158, 144, 76, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(158, 144, 76, 0.1)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
  }} />
  
  <Heart size={20} color="#62091e" className="relative z-10" />
  <span className="relative z-10" style={{ 
    background: 'linear-gradient(90deg, #62091e 0%, #e9e6d8 50%, #62091e 100%)',
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
</button>

<button
onClick={() => {
  setShowReaderMessagesModal(true);
  loadReaderMessages();
  setShowReaderPanel(false);
}}
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
  style={{
    background: 'linear-gradient(135deg, rgba(158, 144, 76, 0.2), rgba(144, 120, 60, 0.2))',
    border: '1px solid rgba(158, 144, 76, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(158, 144, 76, 0.1)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
  }} />
  
  <MessageSquare size={20} color="#62091e" className="relative z-10" />
  <span className="relative z-10" style={{ 
    background: 'linear-gradient(90deg, #62091e 0%, #e9e6d8 50%, #62091e 100%)',
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
  {readerMessages.some(m => m.admin_reply && !m.is_read) && (
    <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse z-20">
      {readerMessages.filter(m => m.admin_reply && !m.is_read).length}
    </span>
  )}
</button>

          <button
            onClick={() => {
  setShowManagementModal(true);
  setShowReaderPanel(false);
}}
            className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(158, 144, 76, 0.2), rgba(144, 120, 60, 0.2))',
              border: '1px solid rgba(158, 144, 76, 0.3)',
              color: '#62091e'
            }}
          >
            <Settings size={20} color="#62091e" />
            Настройки
          </button>

          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(158, 144, 76, 0.2), rgba(144, 120, 60, 0.2))',
                border: '1px solid rgba(158, 144, 76, 0.3)',
                color: '#62091e'
              }}
            >
              <LogOut size={20} color="#62091e" />
              Выход
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
      background: 'radial-gradient(ellipse at center, #71141f 0%, #4a0d15 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #71141f, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #b49a5f 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c2ab75',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Настройки</h2>
        <button onClick={() => setShowManagementModal(false)} className="absolute right-0" style={{ color: '#c2ab75' }}>
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm" style={{ color: '#d8c5a2' }}>Интерфейс сайта:</p>
<button
  onClick={toggleTheme}
  className="w-full relative rounded-full p-1 transition-all duration-300"
  style={{
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
      : 'linear-gradient(135deg, #d8c5a2 0%, #c2ab75 100%)',
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
      background: 'radial-gradient(ellipse at center, #71141f 0%, #4a0d15 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #71141f, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #b49a5f 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c2ab75',
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
            <p style={{ color: '#c2ab75' }}>Пока нет обновлений</p>
          </div>
        ) : (
          <div className="space-y-3">
            {siteUpdates.map((update) => (
              <div 
                key={update.id}
                className="rounded-lg p-4 transition cursor-pointer"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: update.type === 'new_work' ? '2px solid #c2ab75' : '1px solid rgba(180, 154, 95, 0.3)'
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#c2ab75" style={{ 
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
                          background: '#d8c5a2',
                          color: '#000000'
                        }}>
                          НОВАЯ РАБОТА
                        </span>
                        <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: '#d8c5a2' }}>
                          {update.work_title}
                        </h3>
                        <p className="text-sm" style={{ color: '#c2ab75', opacity: 0.8 }}>
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: '#d8c5a2' }}>
                          {update.work_title}
                        </h3>
                        <p className="text-sm mb-1" style={{ color: '#c2ab75' }}>
                          {update.chapter_number} глава {update.chapter_title && `- ${update.chapter_title}`}
                        </p>
                        <p className="text-xs" style={{ color: '#c2ab75', opacity: 0.7 }}>
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

{/* READER MESSAGES MODAL */}
{showReaderMessagesModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-4xl my-4 sm:my-8 flex flex-col max-h-[95vh] border-2 p-6" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Мои сообщения</h2>
        <button onClick={() => {
          setShowReaderMessagesModal(false);
          setSelectedReaderMessage(null);
          setNewMessageText('');
          setReplyMessageText('');
        }} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
</div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
<div className="rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 border-2" style={{ 
  background: '#000000',
  borderColor: '#ef01cb',
  boxShadow: '0 0 15px rgba(239, 1, 203, 0.6)'
}}>
  <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3 shimmer-btn-text">
    Написать новое сообщение автору
  </h3>
  <textarea
    value={newMessageText}
    onChange={(e) => setNewMessageText(e.target.value)}
    rows={3}
    placeholder="Введите ваше сообщение..."
    className="w-full border rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none text-white"
    style={{ 
      background: '#000000',
      borderColor: '#ef01cb'
    }}
    onFocus={(e) => e.currentTarget.style.borderColor = '#ef01cb'}
    onBlur={(e) => e.currentTarget.style.borderColor = '#ef01cb'}
  />
  <button
    onClick={sendNewMessage}
    className="w-full py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
    style={{ 
      background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
      boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)',
      color: '#ffffff'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 0 25px rgba(147, 112, 219, 0.9)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 0 15px rgba(147, 112, 219, 0.6)';
    }}
>
    Отправить сообщение
  </button>
</div>

<div className="space-y-3 sm:space-y-4">
<h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 shimmer-btn-text">
  История переписки
</h3>

{readerMessages.length === 0 ? (
  <div className="text-center py-8 sm:py-12 rounded-lg border" style={{
    background: '#000000',
    borderColor: 'rgba(239, 1, 203, 0.2)'
  }}>
    <Mail size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
      color: 'rgba(239, 1, 203, 0.3)'
    }} />
    <p className="text-sm sm:text-base text-white">У вас пока нет сообщений</p>
  </div>
          ) : (
            readerMessages.map((msg) => (
<div 
  key={msg.id} 
  className="rounded-lg p-3 sm:p-5 border-2 transition"
  style={{
    background: '#000000',
    borderColor: msg.admin_reply && !msg.is_read ? '#ef01cb' : '#ef01cb',
    boxShadow: msg.admin_reply && !msg.is_read ? '0 0 20px rgba(239, 1, 203, 0.6)' : '0 0 10px rgba(239, 1, 203, 0.3)'
  }}
>
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-white text-sm sm:text-base">Вы</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(msg.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.admin_reply && !msg.is_read && (
                      <span className="bg-red-600 text-xs px-2 py-1 rounded font-bold animate-pulse">
                        НОВЫЙ ОТВЕТ
                      </span>
                    )}
                  </div>
<div className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setSelectedReaderMessage(selectedReaderMessage?.id === msg.id ? null : msg);
    }}
    className="text-xs sm:text-sm transition p-1 rounded"
    style={{ color: '#ef01cb' }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = '#ff6bcb';
      e.currentTarget.style.background = 'rgba(239, 1, 203, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = '#ef01cb';
      e.currentTarget.style.background = 'transparent';
    }}
  >
    •••
  </button>
  
  {selectedReaderMessage?.id === msg.id && (
    <div className="absolute right-0 top-8 rounded-lg border-2 p-2 z-10 min-w-[150px]" style={{
      background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
      borderColor: '#ef01cb',
      boxShadow: '0 0 20px rgba(239, 1, 203, 0.6)'
    }}>
      <button
        onClick={() => setSelectedReaderMessage(null)}
        className="w-full text-left px-3 py-2 rounded text-xs sm:text-sm transition"
        style={{ color: '#ffffff' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 1, 203, 0.3)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Свернуть
      </button>
      <button
        onClick={() => {
          /* функция редактирования */
        }}
        className="w-full text-left px-3 py-2 rounded text-xs sm:text-sm transition"
        style={{ color: '#ffffff' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 1, 203, 0.3)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Редактировать
      </button>
      <button
        onClick={() => {
          showConfirm('Удалить сообщение?', async () => {
            await supabase.from('messages').delete().eq('id', msg.id);
            loadReaderMessages();
          });
        }}
        className="w-full text-left px-3 py-2 rounded text-xs sm:text-sm transition"
        style={{ color: '#ffffff' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 1, 203, 0.3)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        Удалить
      </button>
    </div>
  )}
</div>
                </div>

<div className="rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 border" style={{
  background: '#000000',
  borderColor: '#ef01cb'
}}>
  <p className="text-xs mb-2 shimmer-btn-text">Ваше сообщение:</p>
  <p className="text-xs sm:text-sm text-white whitespace-pre-wrap break-words">
                    {selectedReaderMessage?.id === msg.id 
                      ? msg.message 
                      : msg.message.length > 100 
                        ? msg.message.slice(0, 100) + '...' 
                        : msg.message
                    }
                  </p>
                </div>

{msg.admin_reply && (
  <div className="border-2 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3" style={{
    background: '#000000',
    borderColor: '#ef01cb',
    boxShadow: '0 0 15px rgba(239, 1, 203, 0.4)'
  }}>
    <p className="text-xs mb-2 font-semibold shimmer-btn-text">
      Ответ автора:
    </p>
                    <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap break-words">
                      {selectedReaderMessage?.id === msg.id 
                        ? msg.admin_reply 
                        : msg.admin_reply.length > 100 
                          ? msg.admin_reply.slice(0, 100) + '...' 
                          : msg.admin_reply
                      }
                    </p>
                  </div>
                )}

                {selectedReaderMessage?.id === msg.id && msg.admin_reply && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">
                      Ответить автору:
                    </h4>
                    <textarea
                      value={replyMessageText}
                      onChange={(e) => setReplyMessageText(e.target.value)}
                      rows={3}
                      placeholder="Напишите ваш ответ..."
                      className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none focus:border-red-600 text-white"
                    />
                    <button
                      onClick={() => sendReaderReply(msg.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm flex items-center gap-2"
                    >
                      <Send size={12} className="sm:w-4 sm:h-4" />
                      Отправить ответ
                    </button>
                  </div>
                )}
              </div>
            ))
)}
        </div>
      </div>
    </div>
  </div>
)}

{/* READER MESSAGES MODAL - СВЕТЛАЯ ТЕМА */}
{showReaderMessagesModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-4xl my-4 sm:my-8 flex flex-col max-h-[95vh] p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #71141f 0%, #4a0d15 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #71141f, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #b49a5f 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c2ab75',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Мои сообщения</h2>
        <button onClick={() => {
          setShowReaderMessagesModal(false);
          setSelectedReaderMessage(null);
          setNewMessageText('');
          setReplyMessageText('');
        }} className="absolute right-0" style={{ color: '#c2ab75' }}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="rounded-lg p-3 sm:p-6 mb-4 sm:mb-6" style={{ 
          background: 'rgba(0, 0, 0, 0.3)',
          border: '2px solid #c2ab75'
        }}>
          <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: '#c2ab75' }}>
            Написать новое сообщение автору
          </h3>
          <textarea
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            rows={3}
            placeholder="Введите ваше сообщение..."
            className="w-full rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #c2ab75',
              color: '#d8c5a2'
            }}
          />
          <button
            onClick={sendNewMessage}
            className="w-full py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
            style={{ 
              background: '#d8c5a2',
              color: '#000000'
            }}
          >
            Отправить сообщение
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#c2ab75' }}>
            История переписки
          </h3>

          {readerMessages.length === 0 ? (
            <div className="text-center py-8 sm:py-12 rounded-lg" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(180, 154, 95, 0.3)'
            }}>
              <Mail size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
                color: 'rgba(194, 171, 117, 0.5)'
              }} />
              <p className="text-sm sm:text-base" style={{ color: '#d8c5a2' }}>У вас пока нет сообщений</p>
            </div>
          ) : (
            readerMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="rounded-lg p-3 sm:p-5 transition"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: msg.admin_reply && !msg.is_read ? '2px solid #c2ab75' : '1px solid rgba(180, 154, 95, 0.3)'
                }}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-sm sm:text-base" style={{ color: '#d8c5a2' }}>Вы</span>
                    <span className="text-xs" style={{ color: '#c2ab75', opacity: 0.7 }}>
                      {new Date(msg.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.admin_reply && !msg.is_read && (
                      <span className="text-xs px-2 py-1 rounded font-bold animate-pulse" style={{
                        background: '#d8c5a2',
                        color: '#000000'
                      }}>
                        НОВЫЙ ОТВЕТ
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReaderMessage(selectedReaderMessage?.id === msg.id ? null : msg);
                      }}
                      className="text-xs sm:text-sm transition p-1 rounded"
                      style={{ color: '#c2ab75' }}
                    >
                      •••
                    </button>
                    
                    {selectedReaderMessage?.id === msg.id && (
                      <div className="absolute right-0 top-8 rounded-lg p-2 z-10 min-w-[150px]" style={{
                        background: 'rgba(194, 171, 117, 0.9)',
                        border: '1px solid #c2ab75'
                      }}>
                        <button
                          onClick={() => setSelectedReaderMessage(null)}
                          className="w-full text-left px-3 py-2 rounded text-xs sm:text-sm transition"
                          style={{ color: '#000000' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Свернуть
                        </button>
                        <button
                          onClick={() => {
                            showConfirm('Удалить сообщение?', async () => {
                              await supabase.from('messages').delete().eq('id', msg.id);
                              loadReaderMessages();
                            });
                          }}
                          className="w-full text-left px-3 py-2 rounded text-xs sm:text-sm transition"
                          style={{ color: '#000000' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg p-3 sm:p-4 mb-2 sm:mb-3" style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #c2ab75'
                }}>
                  <p className="text-xs mb-2" style={{ color: '#c2ab75' }}>Ваше сообщение:</p>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words" style={{ color: '#d8c5a2' }}>
                    {selectedReaderMessage?.id === msg.id 
                      ? msg.message 
                      : msg.message.length > 100 
                        ? msg.message.slice(0, 100) + '...' 
                        : msg.message
                    }
                  </p>
                </div>

                {msg.admin_reply && (
                  <div className="rounded-lg p-3 sm:p-4 mb-2 sm:mb-3" style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '2px solid #c2ab75'
                  }}>
                    <p className="text-xs mb-2 font-semibold" style={{ color: '#c2ab75' }}>
                      Ответ автора:
                    </p>
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words" style={{ color: '#d8c5a2' }}>
                      {selectedReaderMessage?.id === msg.id 
                        ? msg.admin_reply 
                        : msg.admin_reply.length > 100 
                          ? msg.admin_reply.slice(0, 100) + '...' 
                          : msg.admin_reply
                      }
                    </p>
                  </div>
                )}

                {selectedReaderMessage?.id === msg.id && msg.admin_reply && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4" style={{ borderTop: '1px solid rgba(180, 154, 95, 0.3)' }}>
                    <h4 className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#c2ab75' }}>
                      Ответить автору:
                    </h4>
                    <textarea
                      value={replyMessageText}
                      onChange={(e) => setReplyMessageText(e.target.value)}
                      rows={3}
                      placeholder="Напишите ваш ответ..."
                      className="w-full rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none"
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(180, 154, 95, 0.4)',
                        color: '#d8c5a2'
                      }}
                    />
                    <button
                      onClick={() => sendReaderReply(msg.id)}
                      className="px-3 sm:px-4 py-2 rounded text-xs sm:text-sm flex items-center gap-2"
                      style={{
                        background: '#d8c5a2',
                        color: '#000000'
                      }}
                    >
                      <Send size={12} className="sm:w-4 sm:h-4" />
                      Отправить ответ
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* MODAL: COLLECTION */}
{showCollectionModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full sm:max-w-5xl my-4 sm:my-8 flex flex-col max-h-[95vh] border-2 p-6" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
<div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Моя коллекция</h2>
        <button onClick={() => setShowCollectionModal(false)} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      {/* ТАБЫ */}
      <div className="flex border-b border-gray-700 overflow-x-auto flex-shrink-0">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmerTab {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .tab-shimmer {
            background: linear-gradient(90deg, #b3e7ef 0%, #ef01cb 50%, #b3e7ef 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmerTab 3s linear infinite;
          }
        `}} />
        
        {[
          { key: 'favorites', label: 'Избранное', icon: Heart },
          { key: 'gallery', label: 'Галерея', icon: ImageIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCollectionTab(key)}
            className={`flex-1 min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 font-semibold transition text-center whitespace-nowrap ${
              collectionTab === key ? '' : 'bg-gray-800'
            }`}
            style={{
              background: collectionTab === key 
                ? 'linear-gradient(135deg, #a063cf 0%, #7c3aad 100%)' 
                : 'transparent'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon size={16} className="sm:w-5 sm:h-5" style={{ color: collectionTab === key ? '#b3e7ef' : '#666' }} />
              <span className={`text-xs sm:text-base ${collectionTab === key ? 'tab-shimmer' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* КОНТЕНТ */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {collectionTab === 'favorites' && (
          <div>
            <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-300">
              Избранные работы ({userFavorites.length})
            </h3>
{userFavorites.length === 0 ? (
  <div className="text-center py-8 sm:py-12 rounded-lg border" style={{
    background: '#000000',
    borderColor: 'rgba(239, 1, 203, 0.2)'
  }}>
    <Heart size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
      color: 'rgba(239, 1, 203, 0.3)'
    }} />
    <p className="text-sm sm:text-base text-white">У вас пока нет избранных работ</p>
  </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {userFavorites.map((work) => (
<Link
  key={work.id}
  href={`/work/${work.id}`}
  className="rounded-lg overflow-hidden border-2 transition hover:scale-105"
  style={{ 
    borderColor: '#ef01cb',
    boxShadow: '0 0 15px rgba(239, 1, 203, 0.4)'
  }}
  onClick={() => setShowCollectionModal(false)}
>
  <div className="aspect-[2/3] bg-black relative">
                      {work.cover_url && (
                        <img src={work.cover_url} alt={work.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2 sm:p-4 bg-gray-900">
                      <h4 className="text-white font-semibold text-xs sm:text-base mb-1 sm:mb-2 line-clamp-2">{work.title}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2">{work.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {collectionTab === 'gallery' && (
          <div>
            <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-300">
              Галерея ({userGallery.length})
            </h3>
{userGallery.length === 0 ? (
  <div className="text-center py-8 sm:py-12 rounded-lg border" style={{
    background: '#000000',
    borderColor: 'rgba(239, 1, 203, 0.2)'
  }}>
    <ImageIcon size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
      color: 'rgba(239, 1, 203, 0.3)'
    }} />
    <p className="text-sm sm:text-base text-white">У вас пока нет сохранённых изображений</p>
  </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {userGallery.map((img) => (
                  <div key={img.id} className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-purple-600 relative group">
                    <img src={img.image_url} alt="Saved" className="w-full h-full object-cover" />
<button
  onClick={() => {
    showConfirm('Удалить изображение?', async () => {
      await supabaseUGC.from('saved_images').delete().eq('id', img.id);
      loadUserCollection();
    });
  }}
  className="absolute top-1 right-1 sm:top-2 sm:right-2 rounded-full p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition"
  style={{
    background: 'linear-gradient(135deg, #ef01cb 0%, #bc0897 100%)',
    boxShadow: '0 0 15px rgba(239, 1, 203, 0.8)'
  }}
>
  <X size={12} className="sm:w-4 sm:h-4" />
</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* COLLECTION MODAL - СВЕТЛАЯ ТЕМА */}
{showCollectionModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full sm:max-w-5xl my-4 sm:my-8 flex flex-col max-h-[95vh] p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #71141f 0%, #4a0d15 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #71141f, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #b49a5f 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c2ab75',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Моя коллекция</h2>
        <button onClick={() => setShowCollectionModal(false)} className="absolute right-0" style={{ color: '#c2ab75' }}>
          <X size={24} />
        </button>
      </div>

      {/* ТАБЫ */}
      <div className="flex overflow-x-auto flex-shrink-0" style={{ borderBottom: '1px solid rgba(180, 154, 95, 0.3)' }}>
        {[
          { key: 'favorites', label: 'Избранное', icon: Heart },
          { key: 'gallery', label: 'Галерея', icon: ImageIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCollectionTab(key)}
            className="flex-1 min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 font-semibold transition text-center whitespace-nowrap"
            style={{
              background: collectionTab === key ? 'rgba(194, 171, 117, 0.2)' : 'transparent',
              borderBottom: collectionTab === key ? '2px solid #c2ab75' : 'none'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon size={16} className="sm:w-5 sm:h-5" style={{ color: collectionTab === key ? '#c2ab75' : '#958150' }} />
              <span className="text-xs sm:text-base" style={{ color: collectionTab === key ? '#c2ab75' : '#958150' }}>
                {label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* КОНТЕНТ */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {collectionTab === 'favorites' && (
          <div>
            <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#d8c5a2' }}>
              Избранные работы ({userFavorites.length})
            </h3>
            {userFavorites.length === 0 ? (
              <div className="text-center py-8 sm:py-12 rounded-lg" style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(180, 154, 95, 0.3)'
              }}>
                <Heart size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
                  color: 'rgba(194, 171, 117, 0.5)'
                }} />
                <p className="text-sm sm:text-base" style={{ color: '#d8c5a2' }}>У вас пока нет избранных работ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {userFavorites.map((work) => (
                  <Link
                    key={work.id}
                    href={`/work/${work.id}`}
                    className="rounded-lg overflow-hidden transition hover:scale-105"
                    style={{ 
                      border: '2px solid #c2ab75'
                    }}
                    onClick={() => setShowCollectionModal(false)}
                  >
                    <div className="aspect-[2/3] relative" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
                      {work.cover_url && (
                        <img src={work.cover_url} alt={work.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2 sm:p-4" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                      <h4 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2 line-clamp-2" style={{ color: '#d8c5a2' }}>{work.title}</h4>
                      <p className="text-xs line-clamp-2" style={{ color: '#c2ab75' }}>{work.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {collectionTab === 'gallery' && (
          <div>
            <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4" style={{ color: '#d8c5a2' }}>
              Галерея ({userGallery.length})
            </h3>
            {userGallery.length === 0 ? (
              <div className="text-center py-8 sm:py-12 rounded-lg" style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(180, 154, 95, 0.3)'
              }}>
                <ImageIcon size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
                  color: 'rgba(194, 171, 117, 0.5)'
                }} />
                <p className="text-sm sm:text-base" style={{ color: '#d8c5a2' }}>У вас пока нет сохранённых изображений</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {userGallery.map((img) => (
                  <div key={img.id} className="aspect-[3/4] rounded-lg overflow-hidden relative group" style={{ border: '2px solid #c2ab75' }}>
                    <img src={img.image_url} alt="Saved" className="w-full h-full object-cover" />
              <button
  onClick={() => {
    showConfirm('Удалить изображение?', async () => {
      await supabaseUGC.from('saved_images').delete().eq('id', img.id);
      loadUserCollection();
    });
  }}
  className="absolute top-1 right-1 sm:top-2 sm:right-2 rounded-full p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition"
  style={{
    background: 'linear-gradient(135deg, #c2ab75 0%, #918150 100%)',
    boxShadow: '0 0 15px rgba(194, 171, 117, 0.8)'
  }}
>
<X size={12} className="sm:w-4 sm:h-4" color="#000000" />
</button>
                  </div>
                ))}
              </div>
            )}
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
      backdropFilter: 'blur(15px)'
    }}
    onClick={() => setSelectedImage(null)}
  >
    <div className="relative w-auto h-auto max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
      <div style={{
        borderRadius: '12px',
        padding: isDarkTheme ? '0' : '3px',
        background: isDarkTheme 
          ? 'transparent' 
          : 'linear-gradient(135deg, #b49a5f 0%, #000000 100%)'
      }}>
        <img 
          src={selectedImage} 
          alt="Enlarged" 
          className="rounded-lg"
          style={{
            border: isDarkTheme ? '2px solid #7626b5' : 'none',
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
          backgroundColor: isDarkTheme ? '#7626b5' : '#c0a76d',
          boxShadow: isDarkTheme 
            ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
            : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#d4c49a';
          e.currentTarget.style.boxShadow = isDarkTheme 
            ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
            : 'none';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#c0a76d';
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
            backgroundColor: isDarkTheme ? '#7626b5' : '#c0a76d',
            boxShadow: isDarkTheme 
              ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#d4c49a';
            e.currentTarget.style.boxShadow = isDarkTheme 
              ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
              : 'none';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#c0a76d';
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
            backgroundColor: isDarkTheme ? '#7626b5' : '#c0a76d',
            boxShadow: isDarkTheme 
              ? '0 0 15px rgba(118, 38, 181, 0.8), 0 0 30px rgba(118, 38, 181, 0.4)'
              : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b34d9' : '#d4c49a';
            e.currentTarget.style.boxShadow = isDarkTheme 
              ? '0 0 20px rgba(118, 38, 181, 1), 0 0 40px rgba(118, 38, 181, 0.6)'
              : 'none';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#c0a76d';
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