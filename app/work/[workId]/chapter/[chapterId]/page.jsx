'use client';
import '@/app/fonts.css'; 
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { supabaseChapters } from '@/lib/supabase-chapters';
import { supabaseUGC } from '@/lib/supabase-ugc';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Menu, X, Music, Image as ImageIcon } from 'lucide-react';

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params.workId;
  const chapterId = params.chapterId;

  const [chapter, setChapter] = useState(null);
  const [work, setWork] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [readProgress, setReadProgress] = useState(0);
const [showAgeVerification, setShowAgeVerification] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [showBookmarkButton, setShowBookmarkButton] = useState(true);
const [bookmarkPosition, setBookmarkPosition] = useState({ x: 0, y: 0 });
const [selectedTextForBookmark, setSelectedTextForBookmark] = useState('');
const [showBookmarksModal, setShowBookmarksModal] = useState(false);
const [savedImages, setSavedImages] = useState([]);
const [userBookmarks, setUserBookmarks] = useState([]);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [isDarkTheme, setIsDarkTheme] = useState(true);
const [selectedImage, setSelectedImage] = useState(null);
const [confirmAction, setConfirmAction] = useState(null);
const [confirmMessage, setConfirmMessage] = useState('');
const [showRatingModal, setShowRatingModal] = useState(false);
const [averageRating, setAverageRating] = useState(0);
const [totalRatings, setTotalRatings] = useState(0);
const [userRating, setUserRating] = useState(null);
const [downloadingTracks, setDownloadingTracks] = useState([]);

const carouselRef = useRef(null);

const showConfirm = (message, action) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
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

  const t = {
    backToWork: 'К описанию работы',
    backToMain: 'На главную',
    loading: 'Загрузка...',
    notFound: 'Глава не найдена',
    chapterText: 'Текст главы',
    authorNote: 'Примечание автора',
    images: 'Изображения',
    audio: 'Аудио',
    previousChapter: 'Предыдущая',
    nextChapter: 'Следующая',
    chapters: 'Главы'
  };

useEffect(() => {
  if (currentUser) {
    loadSavedImages();
  }
}, [currentUser]);

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

useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setCurrentUser(session.user);
      setShowAgeVerification(false);
    } else {
      setShowAgeVerification(true);
    }
  };
  
  checkAuth();
  
if (chapterId && workId) {
    loadAllData();

  
    
// ⬇️ Подсветка текста закладки
    const bookmarkText = sessionStorage.getItem('highlightBookmark');
    if (bookmarkText) {
      setTimeout(() => {
        const textContent = document.querySelector('.chapter-text-content');
        if (textContent && textContent.textContent.includes(bookmarkText)) {
          // Находим текст и подсвечиваем
          const walker = document.createTreeWalker(textContent, NodeFilter.SHOW_TEXT);
          let node;
          while (node = walker.nextNode()) {
            const index = node.textContent.indexOf(bookmarkText);
            if (index !== -1) {
              const range = document.createRange();
              range.setStart(node, index);
              range.setEnd(node, index + bookmarkText.length);
              
              // Подсвечиваем текст (работает и на ПК, и на мобильном)
const span = document.createElement('span');
span.style.cssText = 'background: #3fcaaf; color: #000000; padding: 2px 4px; border-radius: 3px; transition: all 1s ease;';
              span.textContent = bookmarkText;
              
              const parent = node.parentNode;
              parent.replaceChild(span, node);
              
              // Скролл к элементу (работает и на ПК, и на мобильном)
              setTimeout(() => {
                span.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
              }, 100);
              
              // Убираем подсветку через 3 секунды
setTimeout(() => {
  span.style.background = 'transparent';
  span.style.color = 'inherit';
}, 3000);
              
              break;
            }
          } 
        }
        sessionStorage.removeItem('highlightBookmark');
      }, 1000);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}, [chapterId, workId]);

useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    setIsDarkTheme(false);
  }
}, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

 useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 0 && text.length <= 500) {
        setSelectedTextForBookmark(text);
      } else {
        setSelectedTextForBookmark('');
      }
    };

    if (isMobile) {
      // На мобильном используем selectionchange (работает при двойном клике)
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => document.removeEventListener('selectionchange', handleSelectionChange);
    } else {
      // На ПК используем mouseup для обычного выделения
      const handleMouseUp = () => {
        setTimeout(() => {
          const selection = window.getSelection();
          const text = selection.toString().trim();
          
          if (text.length > 0 && text.length <= 500) {
            setSelectedTextForBookmark(text);
          } else {
            setSelectedTextForBookmark('');
          }
        }, 10);
      };
      
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, []);

  useEffect(() => {
    if (!chapter) return;

    const handleExplanationClick = (e) => {
      const target = e.target;
      
      const hasTooltipClass = target.classList.contains('tooltip-word');
      const titleText = target.getAttribute('title') || target.getAttribute('data-tooltip-text');
      
      if (!titleText && !hasTooltipClass) return;
      if (!titleText) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      let tooltip = target.querySelector('.explanation-tooltip-click');
      
      if (tooltip) {
        tooltip.remove();
        if (!target.getAttribute('title')) {
          target.setAttribute('title', titleText);
        }
        return;
      }
      
      document.querySelectorAll('.explanation-tooltip-click').forEach(t => {
        t.remove();
      });
      
      target.removeAttribute('title');
      target.setAttribute('data-tooltip-text', titleText);
      
      tooltip = document.createElement('div');
      tooltip.className = 'explanation-tooltip-click';
      tooltip.textContent = titleText;
      
      target.style.position = 'relative';
      target.style.display = 'inline-block';
      target.appendChild(tooltip);
    };
    
    const handleDocumentClick = (e) => {
      if (!e.target.classList.contains('tooltip-word')) {
        document.querySelectorAll('.explanation-tooltip-click').forEach(t => {
          const parent = t.parentElement;
          if (parent) {
            const savedTitle = parent.getAttribute('data-tooltip-text');
            if (savedTitle) parent.setAttribute('title', savedTitle);
          }
          t.remove();
        });
      }
    };

    document.addEventListener('click', handleExplanationClick);
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleExplanationClick);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [chapter]);

  const loadAllData = async () => {
    setLoading(true);

    try {
      const [chapterRes, workRes, chaptersRes] = await Promise.all([
        supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .eq('is_published', true)
          .single(),
        supabase
          .from('works')
          .select('title, id, total_pages')
          .eq('id', workId)
          .single(),
        supabase
          .from('chapters')
          .select('id, chapter_number, title, pages')
          .eq('work_id', workId)
          .eq('is_published', true)
          .order('chapter_number', { ascending: true })
      ]);

      if (workRes.data) setWork(workRes.data);
      if (chaptersRes.data) setAllChapters(chaptersRes.data);

      if (chapterRes.data) {
        const chapterData = chapterRes.data;
        
        setChapter({
          ...chapterData,
          content: '<p class="text-gray-500 text-center py-8">Загрузка текста...</p>'
        });
        setLoading(false);
// Загружаем рейтинг из работы
if (workRes.data) {
  if (workRes.data.manual_rating_count > 0) {
    const avg = workRes.data.manual_rating_sum / workRes.data.manual_rating_count;
    setAverageRating(avg);
    setTotalRatings(workRes.data.manual_rating_count);
  }
}
        // ЗАГРУЖАЕМ ТЕКСТ ИЗ SUPABASE #2
        try {
          const { data: textData, error: textError } = await supabaseChapters
            .from('chapter_texts')
            .select('text_content')
            .eq('chapter_id', chapterId)
            .single();
          
          if (textError) throw textError;
          
          setChapter({
            ...chapterData,
            content: textData.text_content || '<p class="text-gray-500">Текст главы пуст</p>'
          });
        } catch (error) {
          console.error('Ошибка загрузки текста:', error);
          setChapter({
            ...chapterData,
            content: '<p class="text-red-500">Ошибка загрузки текста главы</p>'
          });
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setLoading(false);
    }
  };

  
  const getPreviousChapter = () => {
    if (!allChapters || allChapters.length === 0) return null;
    const currentIndex = allChapters.findIndex(ch => String(ch.id) === String(chapterId));
    return currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  };

  const getNextChapter = () => {
    if (!allChapters || allChapters.length === 0) return null;
    const currentIndex = allChapters.findIndex(ch => String(ch.id) === String(chapterId));
    return currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  };

  const handlePrevClick = () => {
    const prev = getPreviousChapter();
    if (prev) {
      router.push(`/work/${workId}/chapter/${prev.id}`);
    }
  };

  const handleNextClick = () => {
    const next = getNextChapter();
    if (next) {
      router.push(`/work/${workId}/chapter/${next.id}`);
    }
  };

 const handleChapterSelect = (chId) => {
  router.push(`/work/${workId}/chapter/${chId}`);
  setShowChapterList(false);
};

const saveBookmark = async () => {
  if (!currentUser) {
    showConfirm('❌ Войдите в аккаунт для сохранения закладок!', null);
    return;
  }
  
  if (!selectedTextForBookmark) {
    showConfirm('❌ Выделите текст для сохранения закладки!', null);
    return;
  }
  
  try {
    const response = await fetch('/api/ugc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_bookmark',
        userId: currentUser.id,
        workId: workId,
        chapterId: chapter?.id,
        selectedText: selectedTextForBookmark,
        workTitle: work?.title,
        chapterNumber: chapter?.chapter_number
      })
    });
    
    const data = await response.json();
    
if (data.success) {
  showConfirm('Закладка сохранена!', null);
  setSelectedTextForBookmark('');
  window.getSelection().removeAllRanges();
} else {
  showConfirm('Ошибка: ' + (data.error || 'Неизвестная ошибка'), null);
}
} catch (error) {
  console.error('Ошибка:', error);
  showConfirm('Ошибка сохранения!', null);
}
};
const closeBookmarkButton = () => {
  setShowBookmarkButton(false);
  setSelectedTextForBookmark('');
  // ✅ Убираем выделение только при закрытии кнопки
  window.getSelection().removeAllRanges();
};

const loadChapterBookmarks = async () => {
  if (!currentUser) return;
  
  try {
    const res = await fetch(`/api/ugc?action=get_bookmarks&userId=${currentUser.id}`);
    const { bookmarks } = await res.json();
    
    // Фильтруем только закладки текущей главы
    const chapterBookmarks = bookmarks.filter(b => b.chapter_id === chapter?.id);
    setUserBookmarks(chapterBookmarks);
  } catch (err) {
    console.error('Ошибка загрузки закладок:', err);
  }
};

const jumpToBookmark = (bookmarkText) => {
  setShowBookmarksModal(false);
  
  setTimeout(() => {
    const textContent = document.querySelector('.chapter-text-content');
    if (textContent && textContent.textContent.includes(bookmarkText)) {
      const walker = document.createTreeWalker(textContent, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        const index = node.textContent.indexOf(bookmarkText);
        if (index !== -1) {
const span = document.createElement('span');
span.style.cssText = 'background: #3fcaaf; color: #000000; padding: 2px 4px; border-radius: 3px; transition: all 1s ease;';
          span.textContent = bookmarkText;
          
          const parent = node.parentNode;
          parent.replaceChild(span, node);
          
          setTimeout(() => {
            span.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          
          setTimeout(() => {
            span.style.background = 'transparent';
            span.style.color = 'inherit';
            span.style.fontWeight = 'normal';
          }, 3000);
          
          break;
        }
      }
    }
  }, 300);
};

const toggleTheme = () => {
  const newTheme = !isDarkTheme;
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  setIsDarkTheme(newTheme);
};

const downloadTrack = async (audioUrl, audioName, index) => {
  if (downloadingTracks.includes(index)) return;
  
  setDownloadingTracks([...downloadingTracks, index]);
  
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = audioName || `track-${index + 1}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка скачивания:', error);
    showConfirm('Ошибка скачивания трека');
  } finally {
    setDownloadingTracks(downloadingTracks.filter(i => i !== index));
  }
};

const deleteBookmark = async (bookmarkId) => {
  showConfirm('Удалить закладку?', async () => {
    try {
      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_bookmark',
          userId: currentUser.id,
          bookmarkId: bookmarkId
        })
      });
      
      const result = await res.json();
      if (result.success) {
        showConfirm('Закладка удалена', null);
        loadChapterBookmarks();
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showConfirm('Ошибка удаления', null);
    }
  });
};

const submitRating = async (rating) => {
  if (!currentUser) {
    showConfirm('Войдите, чтобы оставить оценку');
    return;
  }
  
  showConfirm('Спасибо за оценку!');
  setUserRating(rating);
  setShowRatingModal(false);
};

const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const matrixData = useMemo(() => {
    if (!mounted) return [];
    return [...Array(20)].map((_, i) => ({
      i,
      color: i % 3 === 0 ? '#59adb9' : i % 3 === 1 ? '#9333ea' : '#ef01cb',
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 3,
      chars: Array.from({ length: 15 }, () => String.fromCharCode(0x30A0 + Math.random() * 96))
    }));
  }, [mounted]);

  const sparksData = useMemo(() => {
    if (!mounted) return [];
    return [...Array(20)].map((_, i) => ({
      i,
      duration: 1 + Math.random(),
      delay: Math.random() * 2,
      y: 60 + Math.random() * 40
    }));
  }, [mounted]);

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative" style={{ 
      background: isDarkTheme 
        ? 'linear-gradient(225deg, #000000 0%, #4d3370 20%, #987caf 40%, #523166 60%, #0d0020 80%, #000000 100%)'
        : 'radial-gradient(circle at center, #1a0000 0%, #330514 35%, #50061b 65%, #000000 100%)'
    }}>
      {isDarkTheme ? (
<>
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes wormholeZoom {
      0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
      20% { opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
    }
    @keyframes portalSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes portalPulse {
      0%, 100% { box-shadow: 0 0 40px #9333ea, 0 0 80px #6b21a8, 0 0 120px #4c1d95; }
      50% { box-shadow: 0 0 60px #a855f7, 0 0 100px #7c3aed, 0 0 160px #5b21b6; }
    }
    @keyframes msShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes msGlow {
      0%, 100% { text-shadow: 0 0 10px #a855f7, 0 0 30px #7c3aed, 0 0 50px #4c1d95; }
      50% { text-shadow: 0 0 20px #c084fc, 0 0 50px #a855f7, 0 0 80px #6b21a8; }
    }
  `}} />

  {/* Звёзды летящие к центру */}
  {mounted && [...Array(120)].map((_, i) => {
    const angle = (i / 120) * Math.PI * 2;
    const dist = 40 + (i % 5) * 15;
    const x = 50 + Math.cos(angle) * dist;
    const y = 50 + Math.sin(angle) * dist;
    const duration = 1.5 + (i % 4) * 0.6;
    const delay = (i % 20) * 0.1;
    const size = 1 + (i % 3);
    const bright = i % 3 === 0 ? '#a78bfa' : i % 3 === 1 ? '#f0abfc' : '#67e8f9';
    return (
      <div key={i} className="absolute" style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: bright,
        borderRadius: '50%',
        boxShadow: `0 0 ${size * 3}px ${bright}`,
        animation: `wormholeZoom ${duration}s linear infinite`,
        animationDelay: `${delay}s`
      }} />
    );
  })}

  {/* Портал в центре */}
  <div className="absolute" style={{
    left: '50%',
    top: '50%',
    width: '140px',
    height: '140px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #0a0015 0%, #0d0020 55%, #1a0033 70%, transparent 100%)',
    animation: 'portalPulse 3s ease-in-out infinite',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    {/* Вращающееся кольцо внешний */}
    <div className="absolute inset-0" style={{
      borderRadius: '50%',
      border: '3px solid transparent',
      borderTopColor: '#a855f7',
      borderRightColor: '#f0abfc',
      animation: 'portalSpin 2s linear infinite',
      filter: 'drop-shadow(0 0 8px #a855f7)'
    }} />
    {/* Вращающееся кольцо внутренний */}
    <div className="absolute inset-2" style={{
      borderRadius: '50%',
      border: '2px solid transparent',
      borderBottomColor: '#67e8f9',
      borderLeftColor: '#7c3aed',
      animation: 'portalSpin 3s linear infinite reverse',
      filter: 'drop-shadow(0 0 6px #67e8f9)'
    }} />

    {/* MS текст внутри сферы */}
    <div className="relative z-10" style={{
      fontSize: '42px',
      fontWeight: '800',
      fontFamily: "'Arial Black', Arial, sans-serif",
      letterSpacing: '-2px',
      background: 'linear-gradient(90deg, #c084fc 0%, #fff 30%, #a855f7 50%, #fff 70%, #c084fc 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'msShimmer 2.5s linear infinite, msGlow 2s ease-in-out infinite'
    }}>MS</div>
  </div>
</>
      ) : (
        <>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes runeGlow {
              0%, 100% { opacity: 0.4; filter: brightness(0.8); }
              50% { opacity: 1; filter: brightness(1.5); }
            }
            @keyframes circleRotate {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes pentagramPulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
            }
          `}} />
          <div className="relative w-80 h-80">
            <svg className="absolute inset-0 w-full h-full" style={{ animation: 'circleRotate 10s linear infinite' }}>
              <circle cx="160" cy="160" r="150" fill="none" stroke="#000000" strokeWidth="2" 
                style={{ filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.6))' }}
              />
              <circle cx="160" cy="160" r="140" fill="none" stroke="#000000" strokeWidth="1"
                style={{ filter: 'drop-shadow(0 0 15px rgba(8, 8, 8, 0.4))' }}
              />
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <text 
                  key={i}
                  x="160" 
                  y="20" 
                  textAnchor="middle" 
                  fontSize="24"
                  fill="#000000"
                  transform={`rotate(${i * 45} 160 160)`}
                  style={{ 
                    animation: `runeGlow ${2 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                    filter: 'drop-shadow(0 0 10px currentColor)'
                  }}
                >
                  {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'][i]}
                </text>
              ))}
            </svg>
            
            <svg className="absolute inset-8 w-64 h-64" style={{ animation: 'circleRotate 8s linear infinite reverse' }}>
              <circle cx="128" cy="128" r="110" fill="none" stroke="#000000" strokeWidth="1"
                strokeDasharray="10,5"
                style={{ filter: 'drop-shadow(0 0 15px rgba(3, 3, 3, 0.6))' }}
              />
            </svg>
            
            <svg className="absolute inset-0 w-full h-full" style={{ animation: 'pentagramPulse 3s ease-in-out infinite' }} viewBox="0 0 320 320">
              <path 
                d="M 160,60 L 185,130 L 260,130 L 200,175 L 225,245 L 160,200 L 95,245 L 120,175 L 60,130 L 135,130 Z" 
                fill="none" 
                stroke="#000000" 
                strokeWidth="4"
                style={{ 
                  filter: 'drop-shadow(0 0 30px rgb(0, 0, 0))'
                }}
              />
              
              <circle cx="160" cy="160" r="45" fill="none" stroke="#000000" strokeWidth="3"
                style={{ 
                  filter: 'drop-shadow(0 0 20px rgba(3, 3, 3, 0.8))',
                  animation: 'runeGlow 2s ease-in-out infinite'
                }}
              />
            </svg>
            
            {sparksData.map((spark) => (
              <div key={spark.i} className="absolute w-2 h-2" style={{
                left: '50%',
                top: '50%',
                background: '#000000',
                borderRadius: '50%',
                boxShadow: '0 0 10px rgb(0, 0, 0)',
                animation: `runeGlow ${spark.duration}s ease-in-out infinite`,
                animationDelay: `${spark.delay}s`,
                transform: `translate(-50%, -50%) rotate(${spark.i * 18}deg) translateY(-${spark.y}px)`
              }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl sm:text-2xl text-gray-400 mb-4">{t.notFound}</p>
          <Link href={`/work/${workId}`} className="text-purple-600 hover:text-purple-500 transition text-sm sm:text-base">
            {t.backToWork}
          </Link>
        </div>
      </div>
    );
  }

  const prevChapter = getPreviousChapter();
  const nextChapter = getNextChapter();

// Модальное окно проверки возраста
if (showAgeVerification) {
  return (
<div className="fixed inset-0 z-[100] flex items-center justify-center" style={{
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div className="relative z-10 w-full max-w-md mx-4">
        <div 
          className="rounded-2xl p-8 border-2 relative"
          style={{
            background: 'rgba(147, 51, 234, 0.15)',
            borderColor: '#9333ea',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shimmerAge {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .age-shimmer-text {
              background: linear-gradient(90deg, #a72cc9 0%, #e6009b 33%, #9f68f3 66%, #a855f7 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmerAge 3s linear infinite;
            }
          `}} />
          
          <h1 className="text-5xl font-bold text-center mb-6 age-shimmer-text" style={{
            fontFamily: "'plommir', Georgia, serif"
          }}>
            MelloStory
          </h1>
          
          <div className="text-center mb-6">
            <p className="text-white text-lg font-semibold mb-2">
              Сайт содержит материалы 18+
            </p>
            <p className="text-gray-400 text-sm">
              Для продолжения необходимо войти в аккаунт или зарегистрироваться
            </p>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes neonPurplePulse {
              0%, 100% { 
                box-shadow: 0 0 10px rgba(147, 112, 219, 0.6), 
                            0 0 20px rgba(147, 112, 219, 0.4);
              }
              50% { 
                box-shadow: 0 0 15px rgba(147, 112, 219, 0.8), 
                            0 0 30px rgba(147, 112, 219, 0.6);
              }
            }
            
            .neon-button {
              background: linear-gradient(135deg, #9370db 0%, #67327b 100%) !important;
              box-shadow: 0 0 15px rgba(147, 112, 219, 0.6) !important;
              animation: neonPurplePulse 3s ease-in-out infinite !important;
              transition: all 0.3s ease !important;
            }
            
            .neon-button:hover {
              box-shadow: 0 0 20px rgba(147, 112, 219, 0.8), 
                          0 0 40px rgba(147, 112, 219, 0.6) !important;
              transform: translateY(-2px) !important;
            }
          `}} />

          <div className="space-y-3">
            <button
              onClick={() => {
                window.location.href = '/welcome?login=true';
              }}
              className="neon-button w-full py-3 rounded-lg font-bold text-base"
            >
              Войти
            </button>
            
            <button
              onClick={() => {
                window.location.href = '/welcome?register=true';
              }}
              className="neon-button w-full py-3 rounded-lg font-bold text-base"
            >
              Регистрация
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


return (
<div className="min-h-screen text-white" style={{ 
  background: isDarkTheme 
    ? 'linear-gradient(225deg, #000000 0%, #4d3370 20%, #987caf 40%, #523166 60%, #0d0020 80%, #000000 100%)'
    : 'radial-gradient(circle at center, #1a0000 0%, #330514 35%, #50061b 65%, #000000 100%)'
}}>
 {/* PROGRESS BAR */}
<div className="fixed top-0 left-0 right-0 z-50 h-1 sm:h-1.5" style={{ backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(145, 129, 80, 0.3)' }}>
  <div 
    className="h-full transition-all duration-150 ease-out"
style={{ 
  width: `${readProgress}%`,
  background: isDarkTheme ? 'linear-gradient(90deg, #9370db 0%, #c084fc 50%, #9370db 100%)' : 'linear-gradient(90deg, #5d5846 0%, #c9c6bb 50%, #65635d 100%)',
  boxShadow: isDarkTheme ? '0 0 8px rgba(147, 112, 219, 0.6), 0 0 15px rgba(192, 132, 252, 0.4)' : '0 0 8px rgba(145, 129, 80, 0.4)',
    }}
  />
</div>
    
{isDarkTheme ? (
  <header className="fixed top-0 left-0 right-0 z-40 border-b" style={{
    padding: '22px 24px',
    background: 'radial-gradient(ellipse at center, #1a0033 0%, #000000 100%)',
    borderColor: '#9333ea'
  }}>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes particleFloat {
        0%, 100% {
          transform: translate(0, 0) scale(1);
          opacity: 0.4;
        }
        25% {
          transform: translate(20px, -15px) scale(1.5);
          opacity: 1;
        }
        50% {
          transform: translate(-15px, 20px) scale(0.8);
          opacity: 0.6;
        }
        75% {
          transform: translate(10px, -25px) scale(1.2);
          opacity: 0.8;
        }
      }
    `}} />
    
    {[
      { left: '5%', top: '20%', delay: '0s' },
      { left: '15%', top: '60%', delay: '1s' },
      { left: '25%', top: '40%', delay: '2s' },
      { left: '35%', top: '70%', delay: '3s' },
      { left: '45%', top: '30%', delay: '1.5s' },
      { left: '55%', top: '50%', delay: '2.5s' },
      { left: '65%', top: '25%', delay: '0.5s' },
      { left: '75%', top: '65%', delay: '3.5s' },
      { left: '85%', top: '35%', delay: '1.2s' },
      { left: '95%', top: '55%', delay: '2.8s' }
    ].map((particle, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: '3px',
        height: '3px',
        background: '#9333ea',
        borderRadius: '50%',
        boxShadow: '0 0 10px #9333ea',
        left: particle.left,
        top: particle.top,
        animation: 'particleFloat 8s ease-in-out infinite',
        animationDelay: particle.delay,
        pointerEvents: 'none'
      }} />
    ))}
    
    <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <div className="flex justify-between items-center mb-2 sm:mb-4">
<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <Link href={`/work/${workId}`} className="inline-flex items-center gap-2 transition text-sm sm:text-base relative" style={{
    color: '#c4b5fd',
    padding: '8px 0'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = '#fff';
    e.currentTarget.style.textShadow = '0 0 10px rgba(147, 51, 234, 0.8)';
    const line = e.currentTarget.querySelector('.hover-line');
    if (line) line.style.width = '120%';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = '#c4b5fd';
    e.currentTarget.style.textShadow = 'none';
    const line = e.currentTarget.querySelector('.hover-line');
    if (line) line.style.width = '0';
  }}>
    <div 
      className="hover-line"
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        width: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #9333ea, #ec4899, #9333ea, transparent)',
        transform: 'translateX(-50%)',
        transition: 'width 0.3s ease'
      }}
    />
    <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
    Назад
  </Link>
</div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setShowSidePanel(true)}
            className="px-2 sm:px-3 py-1 rounded flex items-center gap-1 text-xs sm:text-sm transition"
            style={{
              backgroundColor: '#7626b5',
              boxShadow: '0 0 10px rgba(118, 38, 181, 0.6)',
              border: '1px solid #7626b5'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8b3fd1';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(118, 38, 181, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#7626b5';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(118, 38, 181, 0.6)';
            }}
          >
            <Menu size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Меню</span>
          </button>

          <button
            onClick={saveBookmark}
            className="p-2 rounded-full flex items-center justify-center transition"
            style={{
              backgroundColor: selectedTextForBookmark ? '#3fcaaf' : 'rgba(118, 38, 181, 0.3)',
              boxShadow: selectedTextForBookmark ? '0 0 15px rgba(63, 202, 175, 0.8)' : 'none',
              border: selectedTextForBookmark ? '2px solid #3fcaaf' : '2px solid rgba(118, 38, 181, 0.5)',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              opacity: selectedTextForBookmark ? 1 : 0.5
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {chapter?.pages > 0 && (
        <div className="flex justify-center pb-1">
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '0 0 6px rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }}
          >
            {Math.max(1, Math.round((readProgress / 100) * chapter.pages))} / {chapter.pages} стр.
          </span>
        </div>
      )}
    </div>
  </header>
) : (
  <header className="fixed top-0 left-0 right-0 z-40" style={{
    padding: '22px 24px',
    background: '#000000',
    borderBottom: '3px solid rgba(105, 10, 50, 0.43)'
  }}>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes flameFlicker {
        0%, 100% {
          transform: translateY(0) scaleY(1);
          opacity: 0.8;
        }
        25% {
          transform: translateY(-5px) scaleY(1.15);
          opacity: 1;
        }
        50% {
          transform: translateY(-2px) scaleY(0.95);
          opacity: 0.9;
        }
        75% {
          transform: translateY(-7px) scaleY(1.1);
          opacity: 0.95;
        }
      }
      .flame-light {
        position: absolute;
        bottom: -4px;
        width: 20px;
        height: 30px;
        background: linear-gradient(180deg,
          rgba(109, 5, 31, 0.8) 0%,
          rgba(150, 15, 30, 0.6) 30%,
          rgba(150, 15, 30, 0.3) 60%,
          transparent 100%);
        border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        animation: flameFlicker 1.5s ease-in-out infinite;
        box-shadow: 0 0 20px rgba(150, 15, 30, 0.6);
        pointer-events: none;
      }
    `}} />
    
    <div className="flame-light" style={{ left: '20%', animationDelay: '0s' }} />
    <div className="flame-light" style={{ left: '40%', animationDelay: '0.3s', animationDuration: '1.8s' }} />
    <div className="flame-light" style={{ left: '60%', animationDelay: '0.6s', animationDuration: '1.6s' }} />
    <div className="flame-light" style={{ left: '80%', animationDelay: '0.9s', animationDuration: '1.7s' }} />
    
    <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <Link href={`/work/${workId}`} className="inline-flex items-center gap-2 transition text-sm sm:text-base relative" style={{
    color: 'rgba(90, 8, 17, 0.9)',
    padding: '8px 0'
  }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgb(119, 39, 63)';
            e.currentTarget.style.textShadow = '0 0 8px rgba(126, 9, 44, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(114, 17, 49, 0.9)';
            e.currentTarget.style.textShadow = 'none';
          }}>
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            Назад
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setShowSidePanel(true)}
            className="px-2 sm:px-3 py-1 rounded flex items-center gap-1 text-xs sm:text-sm transition"
            style={{
              backgroundColor: '#2d010a',
              boxShadow: '0 0 10px rgba(95, 27, 30, 0.6)',
              border: '1px solid #2d010a'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(95, 27, 30, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 10px rgba(95, 27, 30, 0.6)';
            }}
          >
            <Menu size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Меню</span>
          </button>

          <button
            onClick={saveBookmark}
            className="p-2 rounded-full flex items-center justify-center transition"
   style={{
  backgroundColor: selectedTextForBookmark ? '#4a0010' : 'rgba(201,168,76,0.15)',
  boxShadow: selectedTextForBookmark ? '0 0 15px rgba(133, 0, 45, 0.8)' : 'none',
  border: selectedTextForBookmark ? '2px solid #7a001a' : '2px solid rgba(201,168,76,0.4)',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              opacity: selectedTextForBookmark ? 1 : 0.5
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {chapter?.pages > 0 && (
        <div className="flex justify-center pb-1">
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              color: '#d8d8d8',
              backgroundColor: 'rgb(0, 0, 0)'
            }}
          >
            {Math.max(1, Math.round((readProgress / 100) * chapter.pages))} / {chapter.pages} стр.
          </span>
        </div>
      )}
    </div>
  </header>
)}

 {showChapterList && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor:'rgba(0,0,0,0.92)',
    backdropFilter:'blur(20px)'
  }}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes chapterModalGlow {
        0%,100% { box-shadow: 0 0 60px rgba(147,50,255,0.15), inset 0 0 60px rgba(0,0,0,0.5); }
        50% { box-shadow: 0 0 100px rgba(147,50,255,0.25), inset 0 0 80px rgba(0,0,0,0.6); }
      }
      @keyframes chapterStarTwinkle { 0%,100%{opacity:0.1;} 50%{opacity:0.5;} }
      @keyframes chapterLineFlow {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
    `}}/>

    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background:'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 85%)',
      border:'1px solid rgba(180,100,255,0.2)',
      borderRadius:'20px',
      animation:'chapterModalGlow 4s ease-in-out infinite',
      position:'relative'
    }}>
      {/* Верхняя градиентная линия */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'20px 20px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,#3fcaaf,transparent)'}}/>

      {/* Звёзды фон */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',borderRadius:'20px',
        backgroundImage:`
          radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 85% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.2) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 60%, rgba(255,255,255,0.25) 0%, transparent 100%),
          radial-gradient(1px 1px at 15% 88%, rgba(255,255,255,0.2) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 35%, rgba(255,255,255,0.15) 0%, transparent 100%)`,
        animation:'chapterStarTwinkle 6s ease-in-out infinite'}}/>

      {/* Шапка */}
      <div style={{
        padding:'24px 28px 20px',
        borderBottom:'1px solid rgba(147,112,219,0.15)',
        position:'relative',zIndex:2,
        background:'rgba(147,50,255,0.06)'
      }}>
        <button onClick={()=>setShowChapterList(false)} style={{
          position:'absolute',top:'14px',right:'14px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'16px'
        }}>✕</button>

        <div style={{textAlign:'center',paddingRight:'20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(179,231,239,0.3)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
          <h2 style={{
            fontFamily:'Cinzel,serif',
            fontSize:'clamp(0.8rem,2vw,1rem)',
            letterSpacing:'8px',
            textTransform:'uppercase',
            backgroundImage:'linear-gradient(90deg,#b3e7ef,#c084fc,#ef01cb,#c084fc,#b3e7ef)',
            backgroundSize:'200% auto',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            color:'transparent',
            animation:'chapterLineFlow 4s linear infinite',
            margin:0
          }}>Содержание</h2>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginTop:'10px'}}>
            <div style={{height:'1px',width:'40px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.3))'}}/>
            <span style={{color:'rgba(147,112,219,0.25)',fontSize:'0.45rem',letterSpacing:'6px'}}>· · · · · · ·</span>
            <div style={{height:'1px',width:'40px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.3))'}}/>
          </div>
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto p-5" style={{position:'relative',zIndex:1}}>
<style dangerouslySetInnerHTML={{__html:`
  .ch-scroll::-webkit-scrollbar { width: 6px; }
  .ch-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.4); border-radius:10px; }
  .ch-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #9370db, #ef01cb, #3fcaaf);
    border-radius: 10px;
    box-shadow: 0 0 8px rgba(147,112,219,0.6);
  }
  .ch-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #c084fc, #f472b6, #3fcaaf);
    box-shadow: 0 0 12px rgba(192,132,252,0.8);
  }
  @keyframes neonBorderFlow { 0%{background-position:0% center;} 100%{background-position:200% center;} }
`}}/>
        <div className="ch-scroll space-y-2">
          {allChapters.map((ch) => {
            const isActive = String(ch.id) === String(chapterId);
            return (
              <button key={ch.id} onClick={()=>handleChapterSelect(ch.id)}
                className="w-full text-left"
                style={{
                  background: isActive ? 'rgba(147,112,219,0.15)' : 'rgba(255,255,255,0.02)',
                  border: isActive ? '1px solid rgba(180,100,255,0.5)' : '1px solid rgba(147,112,219,0.1)',
                  borderRadius:'10px',
                  padding:'12px 16px',
                  cursor:'pointer',
                  transition:'all 0.2s',
                  boxShadow: isActive ? '0 0 20px rgba(147,112,219,0.2)' : 'none'
                }}
                onMouseEnter={e=>{
                  if(!isActive){
                    e.currentTarget.style.background='rgba(147,112,219,0.08)';
                    e.currentTarget.style.borderColor='rgba(180,100,255,0.3)';
                    e.currentTarget.style.boxShadow='0 0 15px rgba(147,112,219,0.15)';
                  }
                }}
                onMouseLeave={e=>{
                  if(!isActive){
                    e.currentTarget.style.background='rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor='rgba(147,112,219,0.1)';
                    e.currentTarget.style.boxShadow='none';
                  }
                }}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{
                    fontFamily:'Cinzel,serif',fontSize:'0.7rem',letterSpacing:'2px',
                    color: isActive ? '#c084fc' : 'rgba(147,112,219,0.5)',
                    minWidth:'28px',flexShrink:0
                  }}>{ch.chapter_number}.</span>
                  <span style={{
                    fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.9rem',
                    color: isActive ? '#e8d5ff' : 'rgba(200,185,230,0.6)',
                    fontWeight: isActive ? '400' : '300'
                  }}>{ch.title}</span>
                  {isActive && <span style={{marginLeft:'auto',color:'rgba(180,100,255,0.6)',fontSize:'0.6rem',letterSpacing:'3px'}}>✦</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Нижняя линия */}
      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.2),transparent)'}}/>
    </div>
  </div>
)}

{showChapterList && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor:'rgba(0,0,0,0.92)',
    backdropFilter:'blur(20px)'
  }}>
    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background:'#080808',
      borderRadius:'4px',
      position:'relative',
      border:'1px solid #1a1510',
      boxShadow:'0 0 80px rgba(0,0,0,0.8)'
    }}>
      {/* Левая золотая полоса */}
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)'}}/>
      {/* Правая тонкая */}
      <div style={{position:'absolute',right:0,top:0,bottom:0,width:'1px',
        background:'linear-gradient(180deg,transparent,rgba(201,168,76,0.2),transparent)'}}/>
      {/* Большой фоновый символ */}
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
        fontFamily:'serif',fontSize:'20rem',color:'rgba(201,168,76,0.02)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      {/* Шапка */}
      <div style={{
        padding:'24px 28px 20px',
        borderBottom:'1px solid rgba(201,168,76,0.1)',
        position:'relative',zIndex:2
      }}>
        <button onClick={()=>setShowChapterList(false)} style={{
          position:'absolute',top:'14px',right:'14px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'16px'
        }}>✕</button>

        <div style={{textAlign:'center',paddingRight:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
            <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,rgba(201,168,76,0.4),transparent)'}}/>
          </div>
          <h2 style={{
            fontFamily:'Cinzel,serif',
            fontSize:'clamp(0.8rem,2vw,1rem)',
            letterSpacing:'8px',
            textTransform:'uppercase',
            color:'rgba(201,168,76,0.7)',
            margin:0
          }}>Содержание</h2>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'10px'}}>
            <div style={{height:'1px',width:'50px',background:'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'5px',fontFamily:'serif'}}>· · ⚜ · ·</span>
            <div style={{height:'1px',width:'50px',background:'linear-gradient(270deg,rgba(201,168,76,0.3),transparent)'}}/>
          </div>
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto p-5" style={{position:'relative',zIndex:1}}>
        <style dangerouslySetInnerHTML={{__html:`
          .ch-scroll-light::-webkit-scrollbar { width: 4px; }
          .ch-scroll-light::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius:10px; }
          .ch-scroll-light::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#c9a84c,#65635d); border-radius:10px; }
        `}}/>
        <div className="ch-scroll-light space-y-2">
          {allChapters.map((ch) => {
            const isActive = String(ch.id) === String(chapterId);
            return (
              <button key={ch.id} onClick={()=>handleChapterSelect(ch.id)}
                className="w-full text-left"
                style={{
                  background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(201,168,76,0.08)',
                  borderRadius:'2px',
                  padding:'12px 16px',
                  cursor:'pointer',
                  transition:'all 0.2s'
                }}
                onMouseEnter={e=>{
                  if(!isActive){
                    e.currentTarget.style.background='rgba(201,168,76,0.05)';
                    e.currentTarget.style.borderColor='rgba(201,168,76,0.25)';
                  }
                }}
                onMouseLeave={e=>{
                  if(!isActive){
                    e.currentTarget.style.background='transparent';
                    e.currentTarget.style.borderColor='rgba(201,168,76,0.08)';
                  }
                }}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{
                    fontFamily:'Cinzel,serif',fontSize:'0.65rem',letterSpacing:'2px',
                    color: isActive ? '#c9a84c' : 'rgba(201,168,76,0.35)',
                    minWidth:'28px',flexShrink:0
                  }}>{ch.chapter_number}.</span>
                  <span style={{
                    fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.9rem',
                    color: isActive ? '#d0c8b8' : 'rgba(201,168,76,0.45)',
                    fontWeight:'300'
                  }}>{ch.title}</span>
                  {isActive && <span style={{marginLeft:'auto',color:'rgba(201,168,76,0.5)',fontFamily:'serif'}}>⚜</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)'}}/>
    </div>
  </div>
)}

      {chapter?.audio_url && (
        <div style={{ display: 'none' }}>
          {JSON.parse(chapter.audio_url).map((audio, i) => (
            <audio 
              key={i}
              id={`audio-track-${i}`}
              src={audio.url || audio.data}
              onPlay={() => setCurrentTrack(i)}
              onPause={() => setCurrentTrack(null)}
              onEnded={() => setCurrentTrack(null)}
            />
          ))}
        </div>
      )}

      {showPlaylist && chapter?.audio_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
            background: 'rgba(147, 51, 234, 0.15)',
            border: '2px solid #9333ea',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(147, 51, 234, 0.3)'
          }}>
<div className="flex justify-center items-center p-5 sm:p-6 relative" style={{
              borderBottom: '2px solid rgba(147, 51, 234, 0.4)'
            }}>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes playlistTitleShimmer {
                  0% { background-position: -200% center; }
                  100% { background-position: 200% center; }
                }
                .playlist-title-shimmer {
                  background: linear-gradient(90deg, #9370db 0%, #3fcaaf 50%, #9370db 100%);
                  background-size: 200% auto;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  animation: playlistTitleShimmer 3s linear infinite;
                }
              `}} />
              <h2 className="text-xl sm:text-2xl font-bold playlist-title-shimmer">
                Плейлист
              </h2>
              <button 
                onClick={() => setShowPlaylist(false)} 
                className="transition rounded-full p-2 absolute right-4"
                style={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(147, 51, 234, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                <X size={24} />
              </button>
            </div>
<div className="flex-1 overflow-y-auto p-4 sm:p-6">
  <style dangerouslySetInnerHTML={{__html: `
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
`}} />
<style dangerouslySetInnerHTML={{__html: `
  @keyframes bar1 {
    0%, 100% { height: 30%; }
    50% { height: 60%; }
  }
  @keyframes bar2 {
    0%, 100% { height: 50%; }
    50% { height: 80%; }
  }
  @keyframes bar3 {
    0%, 100% { height: 40%; }
    50% { height: 70%; }
  }
    @keyframes cosmicSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes cosmicPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 20px rgba(63, 202, 175, 0.8); }
  50% { opacity: 0.6; box-shadow: 0 0 40px rgba(63, 202, 175, 1), 0 0 60px rgba(239, 1, 203, 0.8); }
}
  @keyframes neonBorderFlow {
  0% { border-image-source: linear-gradient(90deg, #ef01cb 0%, #9370db 50%, #3fcaaf 100%); }
  25% { border-image-source: linear-gradient(90deg, #9370db 0%, #3fcaaf 50%, #ef01cb 100%); }
  50% { border-image-source: linear-gradient(90deg, #3fcaaf 0%, #ef01cb 50%, #9370db 100%); }
  75% { border-image-source: linear-gradient(90deg, #ef01cb 0%, #9370db 50%, #3fcaaf 100%); }
  100% { border-image-source: linear-gradient(90deg, #9370db 0%, #3fcaaf 50%, #ef01cb 100%); }
}
@keyframes gothicBorderFlow {
  0%, 100% { border-color: #000000; }
  50% { border-color: #c9c6bb; }
}
  @keyframes neonBorderFlow {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
`}} />
              <div className="space-y-3">
                {JSON.parse(chapter.audio_url).map((audio, i) => {
                  const isPlaying = currentTrack === i;
                  const audioElement = typeof document !== 'undefined' ? document.getElementById(`audio-track-${i}`) : null;
                  
                  return (
                   <div 
  key={i} 
  className="rounded-lg p-4 transition-all cursor-pointer"
  style={{
    background: '#000000',
    position: 'relative',
    paddingLeft: '50px',
    borderRadius: '12px',
    overflow: 'visible'
  }}
  onClick={() => {
    if (audioElement) {
      if (audioElement.paused) {
        document.querySelectorAll('[id^="audio-track-"]').forEach(a => a.pause());
        audioElement.play();
      } else {
        audioElement.pause();
      }
    }
  }}
>
  <div style={{
    position: 'absolute',
    inset: '-2px',
    borderRadius: '12px',
    padding: '2px',
    background: 'linear-gradient(90deg, #ef01cb 0%, #9370db 33%, #3fcaaf 66%, #ef01cb 100%)',
    backgroundSize: '200% 100%',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    zIndex: -1,
    animation: 'neonBorderFlow 3s linear infinite'
  }} />
{isPlaying && (
  <>
    <span style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '12px', background: '#3fcaaf', borderRadius: '2px', animation: 'bar1 0.6s ease-in-out infinite'}}></span>
    <span style={{position: 'absolute', left: '23px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '18px', background: '#ef01cb', borderRadius: '2px', animation: 'bar2 0.6s ease-in-out infinite 0.15s'}}></span>
    <span style={{position: 'absolute', left: '31px', top: '50%', transform: 'translateY(-50%)', width: '4px', height: '15px', background: '#9370db', borderRadius: '2px', animation: 'bar3 0.6s ease-in-out infinite 0.3s'}}></span>
  </>
)}

  <div className="flex items-center justify-between">
  <p className="text-sm font-semibold" style={{ color: '#c084fc', flex: 1 }}>
    <span className="break-words">{audio.name}</span>
  </p>
  <div className="flex items-center gap-2 ml-3">
    <button
      onClick={(e) => {
        e.stopPropagation();
        downloadTrack(audio.url || audio.data, audio.name, i);
      }}
      disabled={downloadingTracks.includes(i)}
      className="p-2 rounded-full transition-all"
      style={{
        background: downloadingTracks.includes(i) 
          ? 'rgba(63, 202, 175, 0.3)' 
          : 'rgba(147, 51, 234, 0.3)',
        border: '1px solid ' + (downloadingTracks.includes(i) ? '#3fcaaf' : '#9333ea')
      }}
    >
      {downloadingTracks.includes(i) ? (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTopColor: '#3fcaaf',
          borderRightColor: '#ef01cb',
          borderRadius: '50%',
          animation: 'cosmicSpin 0.8s linear infinite, cosmicPulse 2s ease-in-out infinite'
        }} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )}
    </button>
    <span className="text-xs whitespace-nowrap" style={{ color: '#e9d5ff' }}>
      {isPlaying ? 'Играет' : 'Воспроизвести'}
    </span>
  </div>
</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

{showPlaylist && isDarkTheme && chapter?.audio_url && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor:'rgba(0,0,0,0.92)',
    backdropFilter:'blur(20px)'
  }}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes plStarTwinkle { 0%,100%{opacity:0.1;} 50%{opacity:0.5;} }
      @keyframes plLineFlow { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
      @keyframes bar1 { 0%,100%{height:30%;} 50%{height:65%;} }
      @keyframes bar2 { 0%,100%{height:50%;} 50%{height:85%;} }
      @keyframes bar3 { 0%,100%{height:40%;} 50%{height:75%;} }
      @keyframes cosmicSpin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
      @keyframes cosmicPulse { 0%,100%{opacity:1;} 50%{opacity:0.6;} }
      @keyframes plBorderFlow { 0%{background-position:0% center;} 100%{background-position:200% center;} }
      .pl-scroll::-webkit-scrollbar { width: 6px; }
      .pl-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.4); border-radius:10px; }
      .pl-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #9370db, #ef01cb, #3fcaaf);
        border-radius: 10px;
        box-shadow: 0 0 8px rgba(147,112,219,0.6);
      }
      .pl-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #c084fc, #f472b6, #3fcaaf);
        box-shadow: 0 0 12px rgba(192,132,252,0.8);
      }
    `}}/>

    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background:'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 85%)',
      border:'1px solid rgba(180,100,255,0.2)',
      borderRadius:'20px',
      boxShadow:'0 0 80px rgba(147,50,255,0.2), inset 0 0 60px rgba(0,0,0,0.5)',
      position:'relative'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'20px 20px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,#3fcaaf,transparent)'}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',borderRadius:'20px',
        backgroundImage:`
          radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 85% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.2) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 60%, rgba(255,255,255,0.25) 0%, transparent 100%)`,
        animation:'plStarTwinkle 6s ease-in-out infinite'}}/>

      {/* Шапка */}
      <div style={{
        padding:'24px 28px 20px',
        borderBottom:'1px solid rgba(147,112,219,0.15)',
        position:'relative',zIndex:2,
        background:'rgba(147,50,255,0.06)'
      }}>
        <button onClick={()=>setShowPlaylist(false)} style={{
          position:'absolute',top:'14px',right:'14px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'16px'
        }}>✕</button>
        <div style={{textAlign:'center',paddingRight:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(179,231,239,0.3)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
          <h2 style={{
            fontFamily:'Cinzel,serif',
            fontSize:'clamp(0.8rem,2vw,1rem)',
            letterSpacing:'8px',
            textTransform:'uppercase',
            backgroundImage:'linear-gradient(90deg,#b3e7ef,#c084fc,#ef01cb,#c084fc,#b3e7ef)',
            backgroundSize:'200% auto',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            color:'transparent',
            animation:'plLineFlow 4s linear infinite',
            margin:0
          }}>Плейлист</h2>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'10px'}}>
            <div style={{height:'1px',width:'40px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.3))'}}/>
            <span style={{color:'rgba(147,112,219,0.25)',fontSize:'0.45rem',letterSpacing:'6px'}}>· · · · · · ·</span>
            <div style={{height:'1px',width:'40px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.3))'}}/>
          </div>
        </div>
      </div>

      {/* Треки */}
      <div className="pl-scroll flex-1 overflow-y-auto p-5" style={{position:'relative',zIndex:1}}>
        <div className="space-y-3">
          {JSON.parse(chapter.audio_url).map((audio, i) => {
            const isPlaying = currentTrack === i;
            const audioElement = typeof document !== 'undefined' ? document.getElementById(`audio-track-${i}`) : null;
            return (
              <div key={i}
                style={{
                  background: isPlaying ? 'rgba(147,112,219,0.12)' : 'rgba(255,255,255,0.02)',
                  border: isPlaying ? '1px solid rgba(180,100,255,0.4)' : '1px solid rgba(147,112,219,0.1)',
                  borderRadius:'10px',
                  padding:'14px 16px 14px 52px',
                  cursor:'pointer',
                  position:'relative',
                  transition:'all 0.2s',
                  boxShadow: isPlaying ? '0 0 20px rgba(147,112,219,0.2)' : 'none'
                }}
                onClick={()=>{
                  if(audioElement){
                    if(audioElement.paused){
                      document.querySelectorAll('[id^="audio-track-"]').forEach(a=>a.pause());
                      audioElement.play();
                    } else { audioElement.pause(); }
                  }
                }}
                onMouseEnter={e=>{
                  if(!isPlaying){
                    e.currentTarget.style.background='rgba(147,112,219,0.07)';
                    e.currentTarget.style.borderColor='rgba(180,100,255,0.25)';
                  }
                }}
                onMouseLeave={e=>{
                  if(!isPlaying){
                    e.currentTarget.style.background='rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor='rgba(147,112,219,0.1)';
                  }
                }}>

                {/* Эквалайзер или номер */}
                <div style={{position:'absolute',left:'16px',top:'50%',transform:'translateY(-50%)',
                  display:'flex',alignItems:'flex-end',gap:'3px',height:'20px'}}>
                  {isPlaying ? (
                    <>
                      <span style={{width:'4px',background:'#3fcaaf',borderRadius:'2px',animation:'bar1 0.6s ease-in-out infinite'}}/>
                      <span style={{width:'4px',background:'#ef01cb',borderRadius:'2px',animation:'bar2 0.6s ease-in-out infinite 0.15s'}}/>
                      <span style={{width:'4px',background:'#9370db',borderRadius:'2px',animation:'bar3 0.6s ease-in-out infinite 0.3s'}}/>
                    </>
                  ) : (
                    <span style={{fontFamily:'Cinzel,serif',fontSize:'0.65rem',color:'rgba(147,112,219,0.4)',letterSpacing:'1px'}}>{i+1}</span>
                  )}
                </div>

                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
                  <p style={{
                    fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.9rem',
                    color: isPlaying ? '#e8d5ff' : 'rgba(200,185,230,0.6)',
                    fontWeight:'300',flex:1,margin:0,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'
                  }}>{audio.name}</p>

                  <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
                    <button onClick={e=>{e.stopPropagation();downloadTrack(audio.url||audio.data,audio.name,i);}}
                      disabled={downloadingTracks.includes(i)}
                      style={{
                        padding:'6px',borderRadius:'50%',cursor:'pointer',
                        background: downloadingTracks.includes(i) ? 'rgba(63,202,175,0.2)' : 'rgba(147,112,219,0.1)',
                        border: '1px solid ' + (downloadingTracks.includes(i) ? 'rgba(63,202,175,0.5)' : 'rgba(147,112,219,0.25)')
                      }}>
                      {downloadingTracks.includes(i) ? (
                        <div style={{width:'14px',height:'14px',border:'2px solid transparent',
                          borderTopColor:'#3fcaaf',borderRightColor:'#ef01cb',borderRadius:'50%',
                          animation:'cosmicSpin 0.8s linear infinite'}}/>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,0.7)" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.2),transparent)'}}/>
    </div>
  </div>
)}

{showPlaylist && !isDarkTheme && chapter?.audio_url && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor:'rgba(0,0,0,0.92)',
    backdropFilter:'blur(20px)'
  }}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes cosmicSpin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
      .pl-scroll-light::-webkit-scrollbar { width: 6px; }
      .pl-scroll-light::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius:10px; }
      .pl-scroll-light::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #c9a84c, #8a6a2a, #c9a84c);
        border-radius: 10px;
        box-shadow: 0 0 6px rgba(201,168,76,0.4);
      }
      .pl-scroll-light::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #f0d080, #c9a84c);
        box-shadow: 0 0 10px rgba(240,208,128,0.6);
      }
    `}}/>

    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background:'#080808',
      borderRadius:'4px',
      position:'relative',
      border:'1px solid #1a1510',
      boxShadow:'0 0 80px rgba(0,0,0,0.8)'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)'}}/>
<div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
  fontFamily:'serif',fontSize:'18rem',color:'rgba(201,168,76,0.025)',
  pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      {/* Шапка */}
      <div style={{
        padding:'24px 28px 20px',
        borderBottom:'1px solid rgba(201,168,76,0.1)',
        position:'relative',zIndex:2
      }}>
        <button onClick={()=>setShowPlaylist(false)} style={{
          position:'absolute',top:'14px',right:'14px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'16px'
        }}>✕</button>
        <div style={{textAlign:'center',paddingRight:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
            <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,rgba(201,168,76,0.4),transparent)'}}/>
          </div>
          <h2 style={{
            fontFamily:'Cinzel,serif',fontSize:'clamp(0.8rem,2vw,1rem)',
            letterSpacing:'8px',textTransform:'uppercase',
            color:'rgba(201,168,76,0.7)',margin:0
          }}>Плейлист</h2>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'10px'}}>
            <div style={{height:'1px',width:'50px',background:'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'5px',fontFamily:'serif'}}>· · ⚜ · ·</span>
            <div style={{height:'1px',width:'50px',background:'linear-gradient(270deg,rgba(201,168,76,0.3),transparent)'}}/>
          </div>
        </div>
      </div>

      {/* Треки */}
      <div className="pl-scroll-light flex-1 overflow-y-auto p-5" style={{position:'relative',zIndex:1}}>
        <div className="space-y-3">
          {JSON.parse(chapter.audio_url).map((audio, i) => {
            const isPlaying = currentTrack === i;
            const audioElement = typeof document !== 'undefined' ? document.getElementById(`audio-track-${i}`) : null;
            return (
              <div key={i}
                style={{
                  background: isPlaying ? 'rgba(201,168,76,0.07)' : 'transparent',
                  border: isPlaying ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(201,168,76,0.1)',
                  borderRadius:'2px',
                  padding:'14px 16px',
                  cursor:'pointer',
                  position:'relative',
                  transition:'all 0.2s'
                }}
                onClick={()=>{
                  if(audioElement){
                    if(audioElement.paused){
                      document.querySelectorAll('[id^="audio-track-"]').forEach(a=>a.pause());
                      audioElement.play();
                    } else { audioElement.pause(); }
                  }
                }}
                onMouseEnter={e=>{
                  if(!isPlaying){
                    e.currentTarget.style.background='rgba(201,168,76,0.04)';
                    e.currentTarget.style.borderColor='rgba(201,168,76,0.25)';
                  }
                }}
                onMouseLeave={e=>{
                  if(!isPlaying){
                    e.currentTarget.style.background='transparent';
                    e.currentTarget.style.borderColor='rgba(201,168,76,0.1)';
                  }
                }}>
                {/* Левая полоска активного */}
                {isPlaying && <div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',
                  background:'linear-gradient(180deg,transparent,#c9a84c,transparent)'}}/>}

                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  {/* Символ перед треком */}
                  <span style={{
                    fontFamily:'serif',fontSize:'1rem',flexShrink:0,
                    color: isPlaying ? 'rgba(201,168,76,0.8)' : 'rgba(201,168,76,0.3)'
                  }}>{isPlaying ? '⚜' : '♪'}</span>

                  <p style={{
                    fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.9rem',
                    color: isPlaying ? '#d0c8b8' : 'rgba(201,168,76,0.45)',
                    fontWeight:'300',flex:1,margin:0,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'
                  }}>{audio.name}</p>

                  <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
                    <button onClick={e=>{e.stopPropagation();downloadTrack(audio.url||audio.data,audio.name,i);}}
                      disabled={downloadingTracks.includes(i)}
                      style={{
                        padding:'6px',borderRadius:'2px',cursor:'pointer',
                        background:'transparent',
                        border:'1px solid ' + (downloadingTracks.includes(i) ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)')
                      }}>
                      {downloadingTracks.includes(i) ? (
                        <div style={{width:'14px',height:'14px',border:'2px solid transparent',
                          borderTopColor:'#c9a84c',borderRadius:'50%',
                          animation:'cosmicSpin 0.8s linear infinite'}}/>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.1),transparent)'}}/>
    </div>
  </div>
)}

      {/* МОДАЛЬНОЕ ОКНО ЗАКЛАДОК */}
 {showBookmarksModal && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor:'rgba(0,0,0,0.92)',
    backdropFilter:'blur(20px)'
  }}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes bmStarTwinkle { 0%,100%{opacity:0.1;} 50%{opacity:0.5;} }
      @keyframes bmLineFlow { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
      .bm-scroll::-webkit-scrollbar { width: 6px; }
      .bm-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.4); border-radius:10px; }
      .bm-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #9370db, #ef01cb, #3fcaaf);
        border-radius: 10px;
        box-shadow: 0 0 8px rgba(147,112,219,0.6);
      }
      .bm-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #c084fc, #f472b6, #9370db);
        box-shadow: 0 0 12px rgba(192,132,252,0.8);
      }
    `}}/>

    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background:'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 85%)',
      border:'1px solid rgba(180,100,255,0.2)',
      borderRadius:'20px',
      boxShadow:'0 0 80px rgba(147,50,255,0.2), inset 0 0 60px rgba(0,0,0,0.5)',
      position:'relative'
    }}>
      {/* Верхняя линия */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'20px 20px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,#3fcaaf,transparent)'}}/>
      {/* Звёзды */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',borderRadius:'20px',
        backgroundImage:`
          radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 85% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.2) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 60%, rgba(255,255,255,0.25) 0%, transparent 100%),
          radial-gradient(1px 1px at 15% 88%, rgba(255,255,255,0.2) 0%, transparent 100%)`,
        animation:'bmStarTwinkle 6s ease-in-out infinite'}}/>

      {/* Шапка */}
      <div style={{
        padding:'24px 28px 20px',
        borderBottom:'1px solid rgba(147,112,219,0.15)',
        position:'relative',zIndex:2,
        background:'rgba(147,50,255,0.06)'
      }}>
        <button onClick={()=>setShowBookmarksModal(false)} style={{
          position:'absolute',top:'14px',right:'14px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'16px'
        }}>✕</button>
        <div style={{textAlign:'center',paddingRight:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(179,231,239,0.3)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
          <h2 style={{
            fontFamily:'Cinzel,serif',
            fontSize:'clamp(0.8rem,2vw,1rem)',
            letterSpacing:'8px',
            textTransform:'uppercase',
            backgroundImage:'linear-gradient(90deg,#b3e7ef,#c084fc,#ef01cb,#c084fc,#b3e7ef)',
            backgroundSize:'200% auto',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            backgroundClip:'text',
            color:'transparent',
            animation:'bmLineFlow 4s linear infinite',
            margin:0
          }}>Закладки главы</h2>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'10px'}}>
            <div style={{height:'1px',width:'40px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.3))'}}/>
            <span style={{color:'rgba(147,112,219,0.25)',fontSize:'0.45rem',letterSpacing:'6px'}}>· · · · · · ·</span>
            <div style={{height:'1px',width:'40px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.3))'}}/>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="bm-scroll flex-1 overflow-y-auto p-5" style={{position:'relative',zIndex:1}}>
        {userBookmarks.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{fontSize:'2rem',marginBottom:'12px',color:'rgba(147,112,219,0.3)'}}>✦</div>
            <p style={{color:'rgba(200,185,230,0.3)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.9rem',letterSpacing:'1px'}}>
              В этой главе нет закладок
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userBookmarks.map((bookmark) => (
              <div key={bookmark.id}
                style={{
                  background:'rgba(147,112,219,0.05)',
                  border:'1px solid rgba(147,112,219,0.12)',
                  borderRadius:'10px',
                  padding:'16px',
                  cursor:'pointer',
                  transition:'all 0.2s'
                }}
                onClick={()=>jumpToBookmark(bookmark.selected_text)}
                onMouseEnter={e=>{
                  e.currentTarget.style.background='rgba(147,112,219,0.1)';
                  e.currentTarget.style.borderColor='rgba(180,100,255,0.3)';
                  e.currentTarget.style.boxShadow='0 0 20px rgba(147,112,219,0.15)';
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background='rgba(147,112,219,0.05)';
                  e.currentTarget.style.borderColor='rgba(147,112,219,0.12)';
                  e.currentTarget.style.boxShadow='none';
                }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                  <span style={{fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'3px',
                    color:'rgba(192,132,252,0.5)',textTransform:'uppercase'}}>
                    ✦ Закладка
                  </span>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.65rem',
                      color:'rgba(147,112,219,0.35)'}}>
                      {new Date(bookmark.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    <button onClick={e=>{e.stopPropagation();deleteBookmark(bookmark.id);}} style={{
                      background:'transparent',border:'none',cursor:'pointer',
                      color:'rgba(239,1,203,0.4)',fontSize:'16px',padding:'0',lineHeight:1
                    }}>✕</button>
                  </div>
                </div>
                <div style={{borderLeft:'2px solid rgba(147,112,219,0.3)',paddingLeft:'12px'}}>
                  <p style={{
                    fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.85rem',
                    color:'rgba(200,185,230,0.55)',lineHeight:'1.6',margin:0,
                    display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'
                  }}>«{bookmark.selected_text}»</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.2),transparent)'}}/>
    </div>
  </div>
)}

 {showBookmarksModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor:'rgba(0,0,0,0.92)',
    backdropFilter:'blur(20px)'
  }}>
    <style dangerouslySetInnerHTML={{__html:`
      .bm-scroll-light::-webkit-scrollbar { width: 6px; }
      .bm-scroll-light::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); border-radius:10px; }
      .bm-scroll-light::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #c9a84c, #8a6a2a, #c9a84c);
        border-radius: 10px;
        box-shadow: 0 0 6px rgba(201,168,76,0.4);
      }
      .bm-scroll-light::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #f0d080, #c9a84c);
        box-shadow: 0 0 10px rgba(240,208,128,0.6);
      }
    `}}/>

    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background:'#080808',
      borderRadius:'4px',
      position:'relative',
      border:'1px solid #1a1510',
      boxShadow:'0 0 80px rgba(0,0,0,0.8)'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)'}}/>
      {/* Фоновый символ */}
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
        fontFamily:'serif',fontSize:'18rem',color:'rgba(201,168,76,0.025)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      {/* Шапка */}
      <div style={{
        padding:'24px 28px 20px',
        borderBottom:'1px solid rgba(201,168,76,0.1)',
        position:'relative',zIndex:2
      }}>
        <button onClick={()=>setShowBookmarksModal(false)} style={{
          position:'absolute',top:'14px',right:'14px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'16px'
        }}>✕</button>
        <div style={{textAlign:'center',paddingRight:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
            <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
            <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,rgba(201,168,76,0.4),transparent)'}}/>
          </div>
          <h2 style={{
            fontFamily:'Cinzel,serif',fontSize:'clamp(0.8rem,2vw,1rem)',
            letterSpacing:'8px',textTransform:'uppercase',
            color:'rgba(201,168,76,0.7)',margin:0
          }}>Закладки главы</h2>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'10px'}}>
            <div style={{height:'1px',width:'50px',background:'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'5px',fontFamily:'serif'}}>· · ⚜ · ·</span>
            <div style={{height:'1px',width:'50px',background:'linear-gradient(270deg,rgba(201,168,76,0.3),transparent)'}}/>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="bm-scroll-light flex-1 overflow-y-auto p-5" style={{position:'relative',zIndex:1}}>
        {userBookmarks.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{fontSize:'2rem',marginBottom:'12px',color:'rgba(201,168,76,0.3)',fontFamily:'serif'}}>⚜</div>
            <p style={{color:'rgba(201,168,76,0.3)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.9rem'}}>
              В этой главе нет закладок
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userBookmarks.map((bookmark) => (
              <div key={bookmark.id}
                style={{
                  background:'transparent',
                  border:'1px solid rgba(201,168,76,0.1)',
                  borderRadius:'2px',
                  padding:'16px',
                  cursor:'pointer',
                  transition:'all 0.2s',
                  position:'relative'
                }}
                onClick={()=>jumpToBookmark(bookmark.selected_text)}
                onMouseEnter={e=>{
                  e.currentTarget.style.background='rgba(201,168,76,0.04)';
                  e.currentTarget.style.borderColor='rgba(201,168,76,0.3)';
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.background='transparent';
                  e.currentTarget.style.borderColor='rgba(201,168,76,0.1)';
                }}>
                <div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',
                  background:'linear-gradient(180deg,transparent,rgba(201,168,76,0.4),transparent)'}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                  marginBottom:'10px',paddingLeft:'8px'}}>
                  <span style={{fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'3px',
                    color:'rgba(201,168,76,0.4)',textTransform:'uppercase'}}>
                    ⚜ Закладка
                  </span>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.65rem',
                      color:'rgba(201,168,76,0.3)'}}>
                      {new Date(bookmark.created_at).toLocaleDateString('ru-RU')}
                    </span>
                    <button onClick={e=>{e.stopPropagation();deleteBookmark(bookmark.id);}} style={{
                      background:'transparent',border:'none',cursor:'pointer',
                      color:'rgba(150,20,40,0.5)',fontSize:'16px',padding:'0',lineHeight:1
                    }}>✕</button>
                  </div>
                </div>
                <div style={{borderLeft:'2px solid rgba(201,168,76,0.25)',paddingLeft:'12px'}}>
                  <p style={{
                    fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.85rem',
                    color:'rgba(201,168,76,0.45)',lineHeight:'1.6',margin:0,
                    display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'
                  }}>«{bookmark.selected_text}»</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.1),transparent)'}}/>
    </div>
  </div>
)}

     <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12" style={{ paddingTop: '120px' }}>
        <div className="mb-6 sm:mb-8">
{work && (
  <>
<style dangerouslySetInnerHTML={{__html: `
  @keyframes workTitleShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`}} />
{isDarkTheme ? (
 <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'12px',marginTop:'16px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'10px'}}>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.4))'}}/>
      <span style={{color:'rgba(179,231,239,0.3)',fontSize:'0.6rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.4))'}}/>
    </div>
<p className="break-words text-center" style={{
  fontFamily:"'plommir', Georgia, serif",
  fontWeight:'300',
  fontSize:'clamp(1.8rem,5vw,3.5rem)',
  backgroundImage:'linear-gradient(90deg, #a72cc9 0%, #e6009b 33%, #68d3f3 66%, #a855f7 100%)',
  WebkitBackgroundClip:'text',
  WebkitTextFillColor:'transparent',
  backgroundClip:'text',
  color:'transparent',
  lineHeight:1.2
}}>
      {work.title}
    </p>
    <div style={{display:'flex',alignItems:'center',gap:'16px',marginTop:'8px'}}>
      <div style={{width:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.25))'}}/>
      <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.5rem',letterSpacing:'10px'}}>· · · · · · ·</span>
      <div style={{width:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.25))'}}/>
    </div>
  </div>
) : (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'12px',marginTop:'16px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'10px'}}>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.5))'}}/>
      <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.75rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.5))'}}/>
    </div>
<p className="break-words text-center" style={{
  fontFamily:"'victiriya', Georgia, serif",
  fontWeight:'400',
  fontSize:'clamp(1.8rem,5vw,3.5rem)',
  backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
  WebkitBackgroundClip:'text',
  WebkitTextFillColor:'transparent',
  backgroundClip:'text',
  color:'transparent',
  lineHeight:1.2
}}>
      {work.title}
    </p>
    <div style={{display:'flex',alignItems:'center',gap:'16px',marginTop:'8px'}}>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.3))'}}/>
      <span style={{color:'rgba(201,168,76,0.3)',fontSize:'0.7rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.3))'}}/>
    </div>
  </div>
)}
  </>
)}
<div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
  <div style={{flex:1,height:'1px',backgroundImage:isDarkTheme?'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))':'linear-gradient(90deg,transparent,rgba(201,168,76,0.3))'}}/>
<h1 className="break-words" style={{
  fontSize: 'clamp(0.9rem,2vw,1.2rem)',
  color: isDarkTheme ? '#c6abda' : '#807f7c',
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
  fontWeight: '200',
  textAlign: 'center',
  letterSpacing: '1px',
  margin: 0
}}>
  {chapter.chapter_number}. {chapter.title}
</h1>
  <div style={{flex:1,height:'1px',backgroundImage:isDarkTheme?'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))':'linear-gradient(270deg,transparent,rgba(201,168,76,0.3))'}}/>
</div>
        </div>

<div className="rounded-lg p-4 sm:p-6 md:p-8 border-2 mb-6 sm:mb-8" style={{
  backgroundColor: isDarkTheme ? '#000000' : '#eae2d7',
  borderColor: isDarkTheme ? '#9333ea' : '#65635d',
  boxShadow: isDarkTheme ? '0 0 20px rgba(147, 51, 234, 0.6), 0 0 40px rgba(147, 51, 234, 0.4)' : '0 0 15px rgba(145, 129, 80, 0.3)'
}}>
<style dangerouslySetInnerHTML={{
  __html: `
    .chapter-text-content {
      font-size: 16px !important;
      line-height: 1.8 !important;
      font-family: Georgia, 'Times New Roman', serif !important;
      color: ${isDarkTheme ? '#d1d5db' : '#000000'} !important;
      text-align: justify !important;
      width: 100% !important;
      max-width: 100% !important;
      white-space: pre-wrap !important;
      word-break: break-word !important;
    }
    
    .chapter-text-content *:not(.tooltip-word):not(.explanation-tooltip-click) {
      font-size: inherit !important;
      font-family: inherit !important;
      color: inherit !important;
      background: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    
    .chapter-text-content strong,
    .chapter-text-content b {
      font-weight: bold !important;
    }
    
    .chapter-text-content em,
    .chapter-text-content i {
      font-style: italic !important;
    }
    
    .chapter-text-content br {
      display: block !important;
    }
    
    @media (max-width: 640px) {
      .chapter-text-content {
        font-size: 14px !important;
        text-align: left !important;
        white-space: pre-wrap !important;
      }
      
      .chapter-text-content br {
        display: block !important;
      }
    }

    .tooltip-word {
      color: #65635d !important;
      cursor: help !important;
      position: static !important;
      display: inline !important;
      font-size: inherit !important;
      font-family: inherit !important;
      background: none !important;
    }

    .explanation-tooltip-click {
      position: fixed !important;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) !important;
      background: rgba(15, 15, 15, 0.98) !important;
      color: #fff !important;
      padding: 12px 16px !important;
      border-radius: 12px !important;
      font-size: 13px !important;
      white-space: pre-wrap !important;
      max-width: 90vw !important;
      max-height: 60vh !important;
      overflow-y: auto !important;
      z-index: 99999 !important;
      border: 2px solid #65635d !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7) !important;
      line-height: 1.6 !important;
      text-align: left !important;
      animation: tooltipFadeIn 0.3s ease !important;
      word-wrap: break-word !important;
    }
    
    @keyframes tooltipFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
    
    @media (max-width: 640px) {
      .explanation-tooltip-click {
        max-width: 85vw !important;
        font-size: 12px !important;
        padding: 10px 14px !important;
      }
    }
      
    ::selection {
      background-color: ${isDarkTheme ? '#3fcaaf' : '#65635d'} !important;
      color: #000000 !important;
    }

    ::-moz-selection {
      background-color: ${isDarkTheme ? '#3fcaaf' : '#65635d'} !important;
      color: #000000 !important;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%);
      }
    }

    @keyframes bookmarkPulse {
      0%, 100% {
        box-shadow: 0 0 20px ${isDarkTheme ? 'rgba(63, 202, 175, 0.6)' : 'rgba(133, 0, 45, 0.6)'};
        transform: translate(-50%, 0) scale(1);
      }
      50% {
        box-shadow: 0 0 30px ${isDarkTheme ? 'rgba(63, 202, 175, 0.9)' : 'rgba(133, 0, 45, 0.9)'};
        transform: translate(-50%, 0) scale(1.05);
      }
    }
    
    /* Блокируем браузерное контекстное меню на выделении */
    .chapter-text-content {
      -webkit-touch-callout: none !important;
    }

    .chapter-text-content::selection {
      background-color: ${isDarkTheme ? '#3fcaaf' : '#65635d'} !important;
      color: #000000 !important;
    }

    .chapter-text-content::-moz-selection {
      background-color: ${isDarkTheme ? '#3fcaaf' : '#65635d'} !important;
      color: #000000 !important;
    }
  `
}} />
          
<div style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
  <div 
    className="chapter-text-content text-gray-300"
    dangerouslySetInnerHTML={{ __html: chapter.content }}
  />
</div>
        </div>

{chapter.images && chapter.images.length > 0 && (
  <div className="mb-4 sm:mb-6">
    <style dangerouslySetInnerHTML={{__html: `
  .overflow-x-auto::-webkit-scrollbar {
    height: 8px;
  }
  .overflow-x-auto::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }
  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: ${isDarkTheme 
      ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
      : 'linear-gradient(135deg, #c9c6bb 0%, #65635d 100%)'};
    border-radius: 10px;
    box-shadow: ${isDarkTheme 
      ? '0 0 10px rgba(147, 112, 219, 0.8)' 
      : '0 0 10px rgba(194, 171, 117, 0.6)'};
  }
  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: ${isDarkTheme 
      ? 'linear-gradient(135deg, #b48dc4 0%, #9370db 100%)' 
      : 'linear-gradient(135deg, #c9c6bb 0%, #65635d 100%)'};
    box-shadow: ${isDarkTheme 
      ? '0 0 15px rgba(180, 141, 196, 1)' 
      : '0 0 15px rgba(216, 197, 162, 0.8)'};
  }
`}} />
    
    <div className="relative">
<div 
  ref={carouselRef}
  className="flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory px-8 sm:px-10"
>
{chapter.images.map((img, index) => (
  <div 
    key={index} 
    className="flex-shrink-0 w-36 h-48 sm:w-48 sm:h-64 rounded-lg overflow-hidden border-2 transition shadow-lg snap-start relative"
style={{
  borderColor: isDarkTheme ? '#7626b5' : '#c9c6bb',
  boxShadow: isDarkTheme ? '0 0 10px rgba(118, 38, 181, 0.5)' : '0 0 10px rgba(192, 167, 109, 0.5)'
}}
          >
<img 
  src={img} 
  alt={`Image ${index + 1}`} 
  className="w-full h-full object-cover cursor-pointer" 
  loading="lazy"
  crossOrigin="anonymous"
  onError={(e) => {
    console.error('Failed to load image:', img);
    e.target.style.backgroundColor = '#1a1a1a';
    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-sm">Изображение недоступно</div>';
  }}
  onClick={() => setSelectedImage(img)}
/>
<button
  onClick={() => toggleSaveImage(img)}
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

      {chapter.images.length > 1 && (
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

{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
{showConfirmModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(10px)'
  }}>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes confirmTwinkle { 0%,100% { opacity:0.15; } 50% { opacity:0.6; } }
      @keyframes confirmGoldShimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    `}} />
    {isDarkTheme ? (
      <div style={{
        background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 80%)',
        border: '1px solid rgba(180,100,255,0.25)',
        boxShadow: '0 0 60px rgba(147,50,255,0.2)',
        borderRadius: '12px',
        width: '100%', maxWidth: '420px',
        padding: '32px 28px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(90deg, transparent, #9370db, #ef01cb, transparent)' }}/>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 20%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 75%, rgba(255,255,255,0.15) 0%, transparent 100%)`,
          animation:'confirmTwinkle 4s ease-in-out infinite' }}/>

        <div style={{ fontSize:'1.5rem', marginBottom:'8px', color:'rgba(180,100,255,0.5)' }}>✦</div>
        <p style={{ color:'#e8d5ff', fontSize:'1rem', lineHeight:'1.7', marginBottom:'8px',
          fontFamily:'Georgia, serif', fontStyle:'italic', position:'relative', zIndex:1 }}>
          {confirmMessage}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'24px' }}>
          <div style={{ height:'1px', width:'30px', background:'rgba(147,112,219,0.3)' }}/>
          <span style={{ color:'rgba(180,100,255,0.3)', fontSize:'0.6rem', letterSpacing:'4px' }}>· · ·</span>
          <div style={{ height:'1px', width:'30px', background:'rgba(147,112,219,0.3)' }}/>
        </div>

        <div className="flex gap-3" style={{ position:'relative', zIndex:1 }}>
          {confirmAction ? (
            <>
              <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
                flex:1, padding:'10px',
                background:'rgba(147,112,219,0.2)',
                border:'1px solid rgba(147,112,219,0.6)',
                color:'#d8b4fe',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'4px',
                boxShadow:'0 0 15px rgba(147,112,219,0.2)'
              }}>✦ Да</button>
              <button onClick={() => setShowConfirmModal(false)} style={{
                flex:1, padding:'10px',
                background:'transparent',
                border:'1px solid rgba(147,112,219,0.25)',
                color:'rgba(180,100,255,0.5)',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'4px'
              }}>Отмена</button>
            </>
          ) : (
            <button onClick={() => setShowConfirmModal(false)} style={{
              width:'100%', padding:'10px',
              background:'rgba(147,112,219,0.15)',
              border:'1px solid rgba(147,112,219,0.5)',
              color:'#d8b4fe',
              fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'4px', textTransform:'uppercase',
              cursor:'pointer', borderRadius:'4px',
              boxShadow:'0 0 15px rgba(147,112,219,0.2)'
            }}>✦ ОК ✦</button>
          )}
        </div>
      </div>
    ) : (
      <div style={{
        background: '#080808',
        border: '1px solid #2a2218',
        borderRadius: '2px',
        width: '100%', maxWidth: '420px',
        padding: '32px 28px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px',
          background:'linear-gradient(180deg, transparent, #c9a84c, transparent)' }}/>
        <div style={{ position:'absolute', top:'50%', right:'20px', transform:'translateY(-50%)',
          fontFamily:'serif', fontSize:'8rem', color:'rgba(201,168,76,0.04)',
          pointerEvents:'none', userSelect:'none', lineHeight:1 }}>⚜</div>

        <div style={{ fontSize:'1.2rem', marginBottom:'8px', color:'rgba(201,168,76,0.5)', fontFamily:'serif' }}>⚜</div>
        <p style={{ color:'#d0c8b8', fontSize:'1rem', lineHeight:'1.7', marginBottom:'8px',
          fontFamily:'Georgia, serif', fontStyle:'italic', position:'relative', zIndex:1 }}>
          {confirmMessage}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'24px' }}>
          <div style={{ height:'1px', width:'40px', background:'rgba(201,168,76,0.3)' }}/>
          <span style={{ color:'rgba(201,168,76,0.4)', fontSize:'0.7rem', letterSpacing:'4px', fontFamily:'serif' }}>· ⚜ ·</span>
          <div style={{ height:'1px', width:'40px', background:'rgba(201,168,76,0.3)' }}/>
        </div>

        <div className="flex gap-3" style={{ position:'relative', zIndex:1 }}>
          {confirmAction ? (
            <>
              <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
                flex:1, padding:'10px',
                background:'transparent',
                border:'1px solid rgba(201,168,76,0.6)',
                color:'#c9a84c',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'1px'
              }}>⚜ Да</button>
              <button onClick={() => setShowConfirmModal(false)} style={{
                flex:1, padding:'10px',
                background:'transparent',
                border:'1px solid rgba(201,168,76,0.2)',
                color:'rgba(201,168,76,0.4)',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'1px'
              }}>Отмена</button>
            </>
          ) : (
            <button onClick={() => setShowConfirmModal(false)} style={{
              width:'100%', padding:'10px',
              background:'transparent',
              border:'1px solid rgba(201,168,76,0.5)',
              color:'#c9a84c',
              fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'4px', textTransform:'uppercase',
              cursor:'pointer', borderRadius:'1px'
            }}>⚜ ОК ⚜</button>
          )}
        </div>
      </div>
    )}
  </div>
)}

        {chapter.author_note && (
          <div className="bg-black rounded-lg p-4 sm:p-6 mb-6 sm:mb-8" style={{
            borderLeft: '4px solid #7626b5',
            boxShadow: '-5px 0 15px rgba(118, 38, 181, 0.4)'
          }}>
            <h3 className="text-base sm:text-lg font-bold mb-2" style={{
              color: '#7626b5'
            }}>{t.authorNote}</h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{chapter.author_note}</p>
          </div>
        )}

{/* КНОПКИ НАВИГАЦИИ И ДЕЙСТВИЯ */}
<div className="mb-6 sm:mb-8" style={{
  borderTop: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.2)' : 'rgba(201,168,76,0.2)'}`,
  paddingTop: '24px'
}}>

  {/* Навигация между главами */}
  <div className="flex justify-between items-center mb-6">
    {prevChapter ? (
      <button onClick={handlePrevClick} style={{
        display:'flex', alignItems:'center', gap:'6px',
        background:'transparent', border:`1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.3)'}`,
        borderRadius: isDarkTheme ? '50px' : '2px',
        padding:'8px 16px', cursor:'pointer',
        color: isDarkTheme ? '#c084fc' : '#c9a84c',
        fontFamily: isDarkTheme ? 'Cinzel, serif' : 'Cinzel, serif',
        fontSize:'0.7rem', letterSpacing:'2px', textTransform:'uppercase',
        transition:'all 0.2s'
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=isDarkTheme?'rgba(192,132,252,0.7)':'rgba(201,168,76,0.7)';e.currentTarget.style.boxShadow=isDarkTheme?'0 0 15px rgba(147,112,219,0.3)':'none';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=isDarkTheme?'rgba(147,112,219,0.3)':'rgba(201,168,76,0.3)';e.currentTarget.style.boxShadow='none';}}>
        <ChevronLeft size={14}/> Пред.
      </button>
    ) : <div/>}

    {/* Счётчик глав по центру */}
    <span style={{
      color: isDarkTheme ? 'rgba(200,185,230,0.5)' : 'rgba(201,168,76,0.5)',
      fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px'
    }}>
      {chapter.chapter_number} / {allChapters.length}
    </span>

    {nextChapter ? (
      <button onClick={handleNextClick} style={{
        display:'flex', alignItems:'center', gap:'6px',
        background:'transparent', border:`1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.3)'}`,
        borderRadius: isDarkTheme ? '50px' : '2px',
        padding:'8px 16px', cursor:'pointer',
        color: isDarkTheme ? '#c084fc' : '#c9a84c',
        fontFamily:'Cinzel, serif',
        fontSize:'0.7rem', letterSpacing:'2px', textTransform:'uppercase',
        transition:'all 0.2s'
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=isDarkTheme?'rgba(192,132,252,0.7)':'rgba(201,168,76,0.7)';e.currentTarget.style.boxShadow=isDarkTheme?'0 0 15px rgba(147,112,219,0.3)':'none';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=isDarkTheme?'rgba(147,112,219,0.3)':'rgba(201,168,76,0.3)';e.currentTarget.style.boxShadow='none';}}>
        След. <ChevronRight size={14}/>
      </button>
    ) : <div/>}
  </div>

  {/* Разделитель */}
  <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
    <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(90deg,transparent,rgba(147,112,219,0.3))':'linear-gradient(90deg,transparent,rgba(201,168,76,0.3))'}}/>
    <span style={{color:isDarkTheme?'rgba(180,100,255,0.3)':'rgba(201,168,76,0.3)',fontSize:'0.6rem',letterSpacing:'5px',fontFamily:'serif'}}>
      {isDarkTheme ? '✦ · · · ✦' : '⚜ · · ⚜'}
    </span>
    <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(270deg,transparent,rgba(147,112,219,0.3))':'linear-gradient(270deg,transparent,rgba(201,168,76,0.3))'}}/>
  </div>

  {/* Оценка и обсуждение */}
  <div style={{display:'flex',justifyContent:'center',gap:'16px',marginBottom:'24px'}}>
    <button onClick={() => setShowRatingModal(true)} style={{
      display:'flex',alignItems:'center',gap:'8px',
      background:'transparent',
      border:`1px solid ${isDarkTheme?'rgba(147,112,219,0.3)':'rgba(201,168,76,0.3)'}`,
      borderRadius: isDarkTheme?'50px':'2px',
      padding:'8px 20px',cursor:'pointer',
      color:isDarkTheme?'#c084fc':'#c9a84c',
      fontFamily:'Cinzel,serif',fontSize:'0.65rem',letterSpacing:'2px',textTransform:'uppercase'
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill={userRating?'currentColor':'none'} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      Оценить
    </button>

    <Link href={`/work/${workId}/discussion`} style={{
      display:'flex',alignItems:'center',gap:'8px',
      background:'transparent',
      border:`1px solid ${isDarkTheme?'rgba(147,112,219,0.3)':'rgba(201,168,76,0.3)'}`,
      borderRadius: isDarkTheme?'50px':'2px',
      padding:'8px 20px',cursor:'pointer',
      color:isDarkTheme?'#c084fc':'#c9a84c',
      fontFamily:'Cinzel,serif',fontSize:'0.65rem',letterSpacing:'2px',textTransform:'uppercase',
      textDecoration:'none'
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      Обсуждение
    </Link>
  </div>

  {/* Благодарность */}
  {isDarkTheme ? (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{width:'40px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.3))'}}/>
        <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.55rem',letterSpacing:'6px'}}>✦ · · ✦</span>
        <div style={{width:'40px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.3))'}}/>
      </div>
      <p style={{fontFamily:"'plommir', Georgia, serif",fontWeight:'300',fontSize:'clamp(0.9rem,2vw,1.1rem)',color:'rgba(179,231,239,0.5)',fontStyle:'italic',letterSpacing:'2px'}}>
        Спасибо за прочтение ✦
      </p>
    </div>
  ) : (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{width:'40px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.4))'}}/>
        <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'5px',fontFamily:'serif'}}>⚜ · ⚜</span>
        <div style={{width:'40px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.4))'}}/>
      </div>
      <p style={{fontFamily:"'victiriya', Georgia, serif",fontWeight:'400',fontSize:'clamp(0.9rem,2vw,1.1rem)',color:'rgba(201,168,76,0.5)',fontStyle:'italic',letterSpacing:'2px'}}>
        Спасибо за прочтение ⚜
      </p>
    </div>
  )}
</div>

{showSidePanel && (
  <>
    {/* ТЁМНАЯ ПАНЕЛЬ */}
    {isDarkTheme && (
      <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-50 overflow-y-auto shadow-2xl" style={{
        background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
        borderLeft:'1px solid rgba(180,100,255,0.25)',
        boxShadow:'-5px 0 60px rgba(147,50,255,0.15)'
      }}>
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes rpTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.55;}}
          @keyframes rpShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
          @keyframes starFloat{0%,100%{opacity:0.1;}50%{opacity:0.5;}}
          .rp-btn-dark{transition:all 0.2s;}
          .rp-btn-dark:hover{border-color:rgba(179,231,239,0.8)!important;box-shadow:0 0 20px rgba(179,231,239,0.4)!important;transform:translateY(-2px);}
        `}}/>

        {/* Верхняя линия */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
          background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>

        {/* Звёзды */}
        <div style={{position:'fixed',top:0,right:0,width:'inherit',height:'100%',pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.35) 0%,transparent 100%),
            radial-gradient(1px 1px at 80% 8%,rgba(255,255,255,0.25) 0%,transparent 100%),
            radial-gradient(1px 1px at 55% 70%,rgba(255,255,255,0.2) 0%,transparent 100%),
            radial-gradient(1px 1px at 90% 55%,rgba(255,255,255,0.15) 0%,transparent 100%),
            radial-gradient(1px 1px at 20% 90%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
          animation:'rpTwinkle 6s ease-in-out infinite',zIndex:0}}/>

        {/* Шапка */}
        <div style={{
          padding:'clamp(16px,3vw,24px) clamp(14px,3vw,22px)',
          paddingBottom:'clamp(12px,2vw,18px)',
          borderBottom:'1px solid rgba(147,112,219,0.15)',
          position:'relative',zIndex:2,
          background:'rgba(147,50,255,0.08)'
        }}>
          <button onClick={()=>setShowSidePanel(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
            borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
            color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'14px',zIndex:10
          }}>✕</button>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',paddingRight:'28px'}}>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
        </div>

        {/* Кнопки */}
        <div style={{padding:'clamp(12px,3vw,20px)',display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)',position:'relative',zIndex:1}}>

          {/* Главы */}
          <button onClick={()=>{setShowChapterList(true);setShowSidePanel(false);}} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9370db" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(200,185,230,0.7)'}}>Главы</span>
          </button>

          {/* Закладки */}
          <button onClick={()=>{setShowBookmarksModal(true);loadChapterBookmarks();setShowSidePanel(false);}} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9370db" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(200,185,230,0.7)'}}>Закладки</span>
          </button>

          {/* Плейлист */}
          {chapter?.audio_url && (
            <button onClick={()=>{setShowPlaylist(true);setShowSidePanel(false);}} className="rp-btn-dark" style={{
              width:'100%',padding:'clamp(10px,2vw,13px) 16px',
              background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
              borderRadius:'6px',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9370db" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(200,185,230,0.7)'}}>Плейлист</span>
            </button>
          )}

          {/* Разделитель */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'2px 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
            <span style={{color:'rgba(180,100,255,0.25)',fontSize:'0.5rem',letterSpacing:'3px'}}>✦ · · · ✦</span>
            <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
          </div>

          {/* Капсула смены темы — фиолетовая овальная */}
          <button onClick={toggleTheme} style={{
            width:'100%',position:'relative',
            background:'radial-gradient(ellipse at center,#1a0033 0%,#000000 100%)',
            border:'1px solid rgba(147,51,234,0.5)',
            borderRadius:'50px',
            boxShadow:'0 0 20px rgba(147,51,234,0.15)',
            padding:'clamp(8px,2vw,14px) 16px',
            overflow:'hidden',cursor:'pointer'
          }}>
            {[...Array(10)].map((_,i)=>(
              <div key={i} style={{
                position:'absolute',width:'2px',height:'2px',
                background:i%2===0?'#9333ea':'#a855f7',borderRadius:'50%',
                boxShadow:`0 0 5px ${i%2===0?'#9333ea':'#a855f7'}`,
                left:`${10+i*8}%`,top:`${20+(i%3)*25}%`,
                animation:'starFloat 3s ease-in-out infinite',
                animationDelay:`${i*0.2}s`,pointerEvents:'none'
              }}/>
            ))}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span style={{color:'#c084fc',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.7rem)',letterSpacing:'2px'}}>HD 189733</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,0.2)" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              </svg>
            </div>
          </button>

        </div>
      </div>
    )}

    {/* СВЕТЛАЯ ПАНЕЛЬ */}
    {!isDarkTheme && (
      <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-50 overflow-y-auto shadow-2xl" style={{
        background:'#080808',
        borderLeft:'1px solid #2a2218',
        boxShadow:'-5px 0 40px rgba(0,0,0,0.8)'
      }}>
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes rpGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
          @keyframes plasmaMove1{0%,100%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(30px,-20px) rotate(120deg);}66%{transform:translate(-25px,15px) rotate(240deg);}}
          @keyframes plasmaMove2{0%,100%{transform:translate(0,0) rotate(0deg);}33%{transform:translate(-35px,25px) rotate(-90deg);}66%{transform:translate(20px,-15px) rotate(-180deg);}}
          @keyframes plasmaMove3{0%,100%{transform:translate(0,0);}33%{transform:translate(15px,30px);}66%{transform:translate(-30px,-20px);}}
          .rp-btn-light{transition:all 0.2s;}
          .rp-btn-light:hover{border-color:rgba(201,168,76,0.5)!important;background:rgba(201,168,76,0.06)!important;}
        `}}/>

        {/* Левая золотая линия */}
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
          background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>

        {/* Фоновый символ */}
        <div style={{position:'fixed',top:'50%',right:'5px',transform:'translateY(-50%)',
          fontFamily:'serif',fontSize:'clamp(8rem,20vw,14rem)',color:'rgba(201,168,76,0.025)',
          pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

        {/* Шапка */}
        <div style={{
          padding:'clamp(16px,3vw,26px) clamp(18px,4vw,28px)',
          paddingBottom:'clamp(12px,2vw,18px)',
          borderBottom:'1px solid rgba(201,168,76,0.1)',
          position:'relative',zIndex:2
        }}>
          <button onClick={()=>setShowSidePanel(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
            borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
            color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'14px',zIndex:10
          }}>✕</button>
          <div style={{display:'flex',alignItems:'center',gap:'10px',paddingRight:'28px'}}>
            <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>

        {/* Кнопки */}
        <div style={{padding:'clamp(12px,3vw,20px)',display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)',position:'relative',zIndex:1}}>

          {/* Главы */}
          <button onClick={()=>{setShowChapterList(true);setShowSidePanel(false);}} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(201,168,76,0.5)'}}>Главы</span>
          </button>

          {/* Закладки */}
          <button onClick={()=>{setShowBookmarksModal(true);loadChapterBookmarks();setShowSidePanel(false);}} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(201,168,76,0.5)'}}>Закладки</span>
          </button>

          {/* Плейлист */}
          {chapter?.audio_url && (
            <button onClick={()=>{setShowPlaylist(true);setShowSidePanel(false);}} className="rp-btn-light" style={{
              width:'100%',padding:'clamp(10px,2vw,12px) 16px',
              background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
              borderRadius:'2px',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(201,168,76,0.5)'}}>Плейлист</span>
            </button>
          )}

          {/* Разделитель */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'2px 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
            <span style={{color:'rgba(201,168,76,0.25)',fontSize:'0.55rem',letterSpacing:'3px',fontFamily:'serif'}}>· ⚜ ·</span>
            <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
          </div>

          {/* Капсула смены темы — острые углы, плазма, без неона */}
          <button onClick={toggleTheme} style={{
            width:'100%',position:'relative',
            background:'#000000',
            border:'1px solid rgba(201,168,76,0.3)',
            borderRadius:'2px',
            boxShadow:'none',
            padding:'clamp(8px,2vw,14px) 16px',
            overflow:'hidden',cursor:'pointer'
          }}>
            <div style={{position:'absolute',width:'120px',height:'120px',
              background:'radial-gradient(circle,rgba(114,17,49,0.9) 0%,rgba(109,5,31,0.5) 40%,transparent 70%)',
              borderRadius:'40% 60% 70% 30%',filter:'blur(12px)',
              animation:'plasmaMove1 7s ease-in-out infinite',
              pointerEvents:'none',top:'10%',left:'20%'}}/>
            <div style={{position:'absolute',width:'100px',height:'100px',
              background:'radial-gradient(circle,rgba(114,17,49,0.9) 0%,rgba(126,9,44,0.6) 50%,transparent 80%)',
              borderRadius:'60% 40% 30% 70%',filter:'blur(10px)',
              animation:'plasmaMove2 9s ease-in-out infinite',
              pointerEvents:'none',top:'40%',right:'15%'}}/>
            <div style={{position:'absolute',width:'90px',height:'90px',
              background:'radial-gradient(circle,rgba(130,15,30,0.65) 0%,rgba(90,8,20,0.45) 45%,transparent 75%)',
              borderRadius:'30% 70% 70% 30%',filter:'blur(14px)',
              animation:'plasmaMove3 8s ease-in-out infinite',
              pointerEvents:'none',bottom:'15%',left:'30%'}}/>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:1}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{color:'rgba(201,168,76,0.7)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px'}}>Лилия и Роза</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
              </div>
            </div>
          </button>

        </div>
      </div>
    )}
  </>
)}

{/* МОДАЛЬНОЕ ОКНО ОЦЕНКИ */}
{showRatingModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(10px)'
  }}>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes ratingTwinkle { 0%,100% { opacity:0.15; } 50% { opacity:0.6; } }
      @keyframes ratingGoldShimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    `}} />
    {isDarkTheme ? (
      /* ТЁМНАЯ — МИСТИКА */
      <div style={{
        background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 80%)',
        border: '1px solid rgba(180,100,255,0.25)',
        boxShadow: '0 0 80px rgba(147,50,255,0.15), inset 0 0 80px rgba(0,0,0,0.5)',
        borderRadius: '16px',
        width: '100%', maxWidth: '480px',
        padding: '32px 28px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Верхняя линия */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(90deg, transparent, #9370db, #ef01cb, transparent)' }}/>
        {/* Звёзды */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.25) 0%, transparent 100%)`,
          animation:'ratingTwinkle 4s ease-in-out infinite' }}/>

        {/* Кнопка закрыть */}
        <button onClick={() => setShowRatingModal(false)} style={{
          position:'absolute', top:'14px', right:'14px',
          background:'rgba(180,100,255,0.1)', border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer',
          color:'rgba(180,100,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center'
        }}>✕</button>

        {/* Заголовок */}
        <div style={{ textAlign:'center', marginBottom:'20px', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'1.5rem', color:'rgba(180,100,255,0.5)', marginBottom:'8px' }}>✦</div>
          <div style={{ fontFamily:'Cinzel, serif', fontSize:'1.2rem',
            background:'linear-gradient(90deg, #b3e7ef, #ef01cb, #9370db)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'5px', marginBottom:'12px' }}>Оценить работу</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
            <div style={{ height:'1px', width:'50px', background:'linear-gradient(90deg, transparent, rgba(147,112,219,0.5))' }}/>
            <span style={{ color:'rgba(180,100,255,0.4)', fontSize:'0.6rem', letterSpacing:'5px' }}>✦ · · · ✦</span>
            <div style={{ height:'1px', width:'50px', background:'linear-gradient(270deg, transparent, rgba(147,112,219,0.5))' }}/>
          </div>
        </div>

        {!currentUser ? (
          <p style={{ textAlign:'center', color:'rgba(200,185,230,0.7)', fontFamily:'Georgia, serif',
            fontStyle:'italic', padding:'16px 0', position:'relative', zIndex:1 }}>
            Войдите, чтобы оставить оценку
          </p>
        ) : (
          <div style={{ position:'relative', zIndex:1 }}>
            <p style={{ textAlign:'center', color:'rgba(200,185,230,0.6)', fontSize:'0.8rem',
              fontFamily:'Georgia, serif', fontStyle:'italic', marginBottom:'20px', letterSpacing:'1px' }}>
              {userRating ? `Ваша оценка: ${userRating}` : 'Выберите оценку от 1 до 10'}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'8px', marginBottom:'20px' }}>
              {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                <button key={num} onClick={() => submitRating(num)} style={{
                  padding:'12px 4px',
                  background: userRating === num ? 'rgba(147,112,219,0.5)' : 'rgba(147,112,219,0.08)',
                  border: userRating === num ? '1px solid rgba(180,100,255,0.8)' : '1px solid rgba(147,112,219,0.2)',
                  color: userRating === num ? '#e8d5ff' : 'rgba(200,185,230,0.5)',
                  borderRadius:'4px', cursor:'pointer',
                  fontFamily:'Cinzel, serif', fontSize:'0.85rem',
                  boxShadow: userRating === num ? '0 0 15px rgba(147,112,219,0.4)' : 'none',
                  transition:'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (userRating !== num) {
                    e.currentTarget.style.background = 'rgba(147,112,219,0.2)';
                    e.currentTarget.style.color = '#d8b4fe';
                    e.currentTarget.style.borderColor = 'rgba(180,100,255,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (userRating !== num) {
                    e.currentTarget.style.background = 'rgba(147,112,219,0.08)';
                    e.currentTarget.style.color = 'rgba(200,185,230,0.5)';
                    e.currentTarget.style.borderColor = 'rgba(147,112,219,0.2)';
                  }
                }}>
                  {num}
                </button>
              ))}
            </div>

            {totalRatings > 0 && (
              <div style={{ textAlign:'center', borderTop:'1px solid rgba(147,112,219,0.15)', paddingTop:'14px' }}>
                <span style={{ color:'rgba(180,100,255,0.4)', fontSize:'0.7rem',
                  fontFamily:'Georgia, serif', fontStyle:'italic', letterSpacing:'1px' }}>
                  Средняя оценка: {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'оценка' : 'оценок'})
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    ) : (
      /* СВЕТЛАЯ — ЗОЛОТО */
      <div style={{
        background: '#080808',
        border: '1px solid #2a2218',
        borderRadius: '4px',
        width: '100%', maxWidth: '480px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Левая золотая полоса */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px',
          background:'linear-gradient(180deg, transparent, #c9a84c, transparent)' }}/>
        {/* ⚜ фоном */}
        <div style={{ position:'absolute', top:'50%', right:'20px',
          transform:'translateY(-50%)', fontFamily:'serif', fontSize:'12rem',
          color:'rgba(201,168,76,0.04)', pointerEvents:'none', userSelect:'none', lineHeight:1 }}>⚜</div>

        <div style={{ padding:'32px 36px', position:'relative', zIndex:1 }}>
          {/* Кнопка закрыть */}
          <button onClick={() => setShowRatingModal(false)} style={{
            position:'absolute', top:'16px', right:'16px',
            background:'transparent', border:'1px solid rgba(201,168,76,0.3)',
            borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer',
            color:'rgba(201,168,76,0.7)', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'14px'
          }}>✕</button>

          {/* Заголовок */}
          <div style={{ marginBottom:'20px' }}>
            <div style={{ fontFamily:"'victiriya', Georgia, serif", fontSize:'2rem',
              backgroundImage:'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              animation:'ratingGoldShimmer 4s linear infinite',
              letterSpacing:'4px', fontWeight:400, marginBottom:'10px' }}>Оценить работу</div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ height:'1px', width:'80px', background:'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }}/>
              <span style={{ color:'rgba(201,168,76,0.5)', fontSize:'0.8rem', letterSpacing:'5px', fontFamily:'serif' }}>⚜ · · ⚜</span>
            </div>
          </div>

          {!currentUser ? (
            <p style={{ color:'#d0c8b8', fontFamily:'Georgia, serif', fontStyle:'italic', padding:'16px 0' }}>
              Войдите, чтобы оставить оценку
            </p>
          ) : (
            <div>
              <p style={{ color:'rgba(201,168,76,0.5)', fontSize:'0.8rem',
                fontFamily:'Georgia, serif', fontStyle:'italic', marginBottom:'20px', letterSpacing:'1px' }}>
                {userRating ? `Ваша оценка: ${userRating}` : 'Выберите оценку от 1 до 10'}
              </p>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'8px', marginBottom:'20px' }}>
                {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                  <button key={num} onClick={() => submitRating(num)} style={{
                    padding:'12px 4px',
                    background: userRating === num ? 'rgba(201,168,76,0.2)' : 'transparent',
                    border: userRating === num ? '1px solid rgba(201,168,76,0.8)' : '1px solid rgba(201,168,76,0.2)',
                    color: userRating === num ? '#c9a84c' : 'rgba(201,168,76,0.4)',
                    borderRadius:'1px', cursor:'pointer',
                    fontFamily:'Cinzel, serif', fontSize:'0.85rem',
                    transition:'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (userRating !== num) {
                      e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
                      e.currentTarget.style.color = '#c9a84c';
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (userRating !== num) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(201,168,76,0.4)';
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                    }
                  }}>
                    {num}
                  </button>
                ))}
              </div>

              {totalRatings > 0 && (
                <div style={{ borderTop:'1px solid rgba(201,168,76,0.15)', paddingTop:'14px', textAlign:'center' }}>
                  <span style={{ color:'rgba(201,168,76,0.4)', fontSize:'0.7rem',
                    fontFamily:'Georgia, serif', fontStyle:'italic' }}>
                    Средняя оценка: {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'оценка' : 'оценок'})
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)}


{/* МОДАЛЬНОЕ ОКНО КАРТИНКИ - 3D ВАРИАНТ */}
{selectedImage && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(6px)' }}
    onClick={() => setSelectedImage(null)}
    onTouchStart={(e) => { window._tX = e.touches[0].clientX; }}
    onTouchEnd={(e) => {
      const diff = window._tX - e.changedTouches[0].clientX;
      const idx = chapter.images.indexOf(selectedImage);
      if (Math.abs(diff) > 50) {
        if (diff > 0 && idx < chapter.images.length - 1) setSelectedImage(chapter.images[idx + 1]);
        if (diff < 0 && idx > 0) setSelectedImage(chapter.images[idx - 1]);
      }
    }}>
  <div className="flex flex-col items-center w-full max-w-2xl px-12"
      onClick={e => e.stopPropagation()}>

      <div className="relative flex items-center justify-center w-full">
        {!isMobile && chapter.images.indexOf(selectedImage) > 0 && (
          <button
            onClick={() => setSelectedImage(chapter.images[chapter.images.indexOf(selectedImage) - 1])}
            style={{ position:'absolute', left:0, background:'none', border:'none', cursor:'pointer', zIndex:10,
              color: isDarkTheme ? 'rgba(180,100,255,0.7)' : 'rgba(201,168,76,0.7)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <div style={{
          position:'relative',
          width: isMobile ? '85vw' : '360px',
          height: isMobile ? '127vw' : '520px',
          borderRadius:'8px', overflow:'hidden',
          border: isDarkTheme ? '2px solid rgba(180,100,255,0.4)' : '2px solid rgba(201,168,76,0.4)',
          boxShadow: isDarkTheme ? '0 0 60px rgba(147,50,255,0.3)' : '0 0 60px rgba(201,168,76,0.2)'
        }}>
          <img src={selectedImage} alt=""
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
          />

          <button onClick={() => setSelectedImage(null)}
            style={{ position:'absolute', top:'8px', right:'8px', zIndex:20,
              background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%',
              padding:'4px', cursor:'pointer',
              color: isDarkTheme ? '#dccbe2' : '#c9c3b2' }}>
            <X size={22}/>
          </button>
        </div>

        {!isMobile && chapter.images.indexOf(selectedImage) < chapter.images.length - 1 && (
          <button
            onClick={() => setSelectedImage(chapter.images[chapter.images.indexOf(selectedImage) + 1])}
            style={{ position:'absolute', right:0, background:'none', border:'none', cursor:'pointer', zIndex:10,
              color: isDarkTheme ? 'rgba(180,100,255,0.7)' : 'rgba(201,168,76,0.7)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>

      {chapter.images.length > 1 && (
        <div style={{ display:'flex', gap:'6px', marginTop:'12px' }}>
          {chapter.images.map((img, i) => (
            <div key={i} onClick={() => setSelectedImage(chapter.images[i])}
              style={{
                width: chapter.images.indexOf(selectedImage) === i ? '18px' : '7px',
                height:'7px', borderRadius:'4px', cursor:'pointer',
                background: chapter.images.indexOf(selectedImage) === i
                  ? (isDarkTheme ? 'rgba(180,100,255,0.9)' : 'rgba(201,168,76,0.9)')
                  : (isDarkTheme ? 'rgba(180,100,255,0.3)' : 'rgba(201,168,76,0.25)'),
                transition:'all 0.3s'
              }}
            />
          ))}
        </div>
      )}

      <button onClick={(e) => { e.stopPropagation(); toggleSaveImage(selectedImage); }}
        style={{
          marginTop:'14px', padding:'8px 24px', borderRadius:'50px', cursor:'pointer',
          display:'flex', alignItems:'center', gap:'8px', fontWeight:'600',
          background: savedImages.includes(selectedImage)
            ? (isDarkTheme ? 'rgba(236,72,153,0.9)' : 'rgba(201,168,76,0.9)')
            : 'rgba(0,0,0,0.5)',
          border: isDarkTheme
            ? `2px solid ${savedImages.includes(selectedImage) ? '#ec4899' : 'rgba(180,100,255,0.5)'}`
            : `2px solid ${savedImages.includes(selectedImage) ? '#c9a84c' : 'rgba(201,168,76,0.4)'}`,
          boxShadow: savedImages.includes(selectedImage)
            ? (isDarkTheme ? '0 0 25px rgba(236,72,153,0.8)' : '0 0 25px rgba(201,168,76,0.6)')
            : 'none',
          color: '#ffffff'
        }}>
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill={savedImages.includes(selectedImage) ? '#ffffff' : 'none'}
          stroke="#ffffff" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {savedImages.includes(selectedImage) ? 'В галерее' : 'Сохранить'}
      </button>
    </div>
  </div>
)}
      </main>
      {/* ФУТЕР */}
<footer className="py-8 sm:py-12 text-center relative z-[5]" style={{
  background: isDarkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)',
  backdropFilter: 'blur(10px)',
  borderTop: 'none',
  position: 'relative'
}}>
  {/* Градиентная линия сверху */}
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
    background: isDarkTheme
      ? 'linear-gradient(90deg, transparent, #9370db, #ef01cb, transparent)'
      : 'linear-gradient(90deg, transparent, #c9a84c, #f0d080, transparent)'
  }}/>
  {isDarkTheme ? (
    <div>
      {/* Верхний декор */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginBottom:'16px'}}>
        <div style={{flex:1,maxWidth:'120px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.3))'}}/>
        <span style={{color:'rgba(179,231,239,0.25)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
        <div style={{flex:1,maxWidth:'120px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.3))'}}/>
      </div>

      <p style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.7rem,1.5vw,0.85rem)',letterSpacing:'4px',
        color:'rgba(179,231,239,0.35)',marginBottom:'8px'}}>MelloStory © 2026</p>

      <p style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.6rem,1.2vw,0.7rem)',
        color:'rgba(147,112,219,0.3)',marginBottom:'20px',maxWidth:'500px',margin:'0 auto 20px',lineHeight:'1.8',padding:'0 16px'}}>
        Все права защищены. Копирование, распространение и любое иное использование материалов без разрешения автора запрещены.
      </p>

      {/* Разделитель */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',margin:'16px 0'}}>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.25))'}}/>
        <span style={{color:'rgba(147,112,219,0.2)',fontSize:'0.5rem',letterSpacing:'6px'}}>· · · · ·</span>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.25))'}}/>
      </div>

      {/* Ссылки */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',flexWrap:'wrap',padding:'0 16px'}}>
        <Link href="/privacy" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
          letterSpacing:'2px',textTransform:'uppercase',color:'rgba(147,112,219,0.45)',
          textDecoration:'none',transition:'color 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(179,231,239,0.7)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(147,112,219,0.45)'}>
          Политика конфиденциальности
        </Link>
        <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.7rem',letterSpacing:'4px'}}>✦</span>
        <Link href="/mission" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
          letterSpacing:'2px',textTransform:'uppercase',color:'rgba(147,112,219,0.45)',
          textDecoration:'none',transition:'color 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(179,231,239,0.7)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(147,112,219,0.45)'}>
          Миссия сайта
        </Link>
        <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.7rem',letterSpacing:'4px'}}>✦</span>
        <Link href="/terms" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
          letterSpacing:'2px',textTransform:'uppercase',color:'rgba(147,112,219,0.45)',
          textDecoration:'none',transition:'color 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(179,231,239,0.7)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(147,112,219,0.45)'}>
          Пользовательское соглашение
        </Link>
      </div>

      {/* Нижний декор */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginTop:'16px'}}>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.15))'}}/>
        <span style={{color:'rgba(147,112,219,0.15)',fontSize:'0.5rem',letterSpacing:'8px'}}>· · · · · · ·</span>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.15))'}}/>
      </div>
    </div>
  ) : (
    <div>
      {/* Верхний декор */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginBottom:'16px'}}>
        <div style={{flex:1,maxWidth:'120px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.4))'}}/>
        <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.7rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
        <div style={{flex:1,maxWidth:'120px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.4))'}}/>
      </div>

      <p style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.7rem,1.5vw,0.85rem)',letterSpacing:'4px',
        color:'rgba(201,168,76,0.45)',marginBottom:'8px'}}>MelloStory © 2026</p>

      <p style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.6rem,1.2vw,0.7rem)',
        color:'rgba(201,168,76,0.3)',marginBottom:'20px',maxWidth:'500px',margin:'0 auto 20px',lineHeight:'1.8',padding:'0 16px'}}>
        Все права защищены. Копирование, распространение и любое иное использование материалов без разрешения автора запрещены.
      </p>

      {/* Разделитель */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',margin:'16px 0'}}>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.2))'}}/>
        <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.6rem',letterSpacing:'5px',fontFamily:'serif'}}>· ⚜ ·</span>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.2))'}}/>
      </div>

      {/* Ссылки */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',flexWrap:'wrap',padding:'0 16px'}}>
        <Link href="/privacy" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
          letterSpacing:'2px',textTransform:'uppercase',color:'rgba(201,168,76,0.4)',
          textDecoration:'none',transition:'color 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(201,168,76,0.8)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(201,168,76,0.4)'}>
          Политика конфиденциальности
        </Link>
        <span style={{color:'rgba(201,168,76,0.3)',fontSize:'0.75rem',letterSpacing:'3px',fontFamily:'serif'}}>⚜</span>
        <Link href="/mission" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
          letterSpacing:'2px',textTransform:'uppercase',color:'rgba(201,168,76,0.4)',
          textDecoration:'none',transition:'color 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(201,168,76,0.8)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(201,168,76,0.4)'}>
          Миссия сайта
        </Link>
        <span style={{color:'rgba(201,168,76,0.3)',fontSize:'0.75rem',letterSpacing:'3px',fontFamily:'serif'}}>⚜</span>
        <Link href="/terms" style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',
          letterSpacing:'2px',textTransform:'uppercase',color:'rgba(201,168,76,0.4)',
          textDecoration:'none',transition:'color 0.2s'}}
          onMouseEnter={e=>e.currentTarget.style.color='rgba(201,168,76,0.8)'}
          onMouseLeave={e=>e.currentTarget.style.color='rgba(201,168,76,0.4)'}>
          Пользовательское соглашение
        </Link>
      </div>

      {/* Нижний декор */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginTop:'16px'}}>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.15))'}}/>
        <span style={{color:'rgba(201,168,76,0.15)',fontSize:'0.6rem',letterSpacing:'6px',fontFamily:'serif'}}>· · ⚜ · ·</span>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.15))'}}/>
      </div>
    </div>
  )}
</footer>
    </div>
  );
}