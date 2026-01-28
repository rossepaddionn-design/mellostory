'use client';
import '@/app/fonts.css'; 
import { useState, useEffect, useRef } from 'react';
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
  setIsDarkTheme(newTheme);
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
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

if (loading) {
  return (
    <div className="min-h-screen text-white flex items-center justify-center" style={{ 
      backgroundColor: isDarkTheme ? '#000000' : '#000000'
    }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 mb-4" style={{ 
          borderColor: isDarkTheme ? '#c084fc' : '#d8c5a2'
        }}></div>
        <p className="text-lg sm:text-xl" style={{ 
          color: isDarkTheme ? '#9ca3af' : '#9ca3af'
        }}>{t.loading}</p>
      </div>
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
    
<header className="border-b py-3 sm:py-4 px-4 sm:px-8 sticky top-0 z-40" style={{
        backgroundColor: isDarkTheme ? '#000000' : '#eae2d7',
        borderColor: isDarkTheme ? '#7626b5' : '#2d010a'
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <Link href="/" className="hover:text-purple-500 transition text-xs sm:text-sm whitespace-nowrap" style={{ color: isDarkTheme ? '#9ca3af' : '#000000' }}>
    {t.backToMain}
  </Link>
  <Link href={`/work/${workId}`} className="hover:text-purple-500 transition text-xs sm:text-sm whitespace-nowrap" style={{ color: isDarkTheme ? '#7626b5' : '#5f1b1e' }}>
    ← {t.backToWork}
  </Link>
</div>
            
<div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
<button
    onClick={() => setShowSidePanel(true)}
    className="px-2 sm:px-3 py-1 rounded flex items-center gap-1 text-xs sm:text-sm transition"
    style={{
      backgroundColor: isDarkTheme ? '#7626b5' : '#2d010a',
      boxShadow: isDarkTheme ? '0 0 10px rgba(118, 38, 181, 0.6)' : '0 0 10px rgba(95, 27, 30, 0.6)',
      border: isDarkTheme ? '1px solid #7626b5' : '1px solid #2d010a'
    }}
onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = isDarkTheme ? '#8b3fd1' : '#2d010a';
  e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 15px rgba(118, 38, 181, 0.8)' : '0 0 15px rgba(95, 27, 30, 0.8)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.backgroundColor = isDarkTheme ? '#7626b5' : '#2d010a';
  e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 10px rgba(118, 38, 181, 0.6)' : '0 0 10px rgba(95, 27, 30, 0.6)';
}}
  >
    <Menu size={16} className="sm:w-4 sm:h-4" />
    <span className="hidden sm:inline">Меню</span>
  </button>

<button
    onClick={saveBookmark}
    className="p-2 rounded-full flex items-center justify-center transition"
    style={{
      backgroundColor: selectedTextForBookmark 
        ? (isDarkTheme ? '#3fcaaf' : '#5d5846')
        : 'rgba(118, 38, 181, 0.3)',
      boxShadow: selectedTextForBookmark 
        ? (isDarkTheme ? '0 0 15px rgba(63, 202, 175, 0.8)' : '0 0 15px rgba(133, 0, 45, 0.8)')
        : 'none',
      border: selectedTextForBookmark 
        ? (isDarkTheme ? '2px solid #3fcaaf' : '2px solid #5d5846')
        : '2px solid rgba(118, 38, 181, 0.5)',
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

          {/* СЧЕТЧИК СТРАНИЦ - ВНИЗУ HEADER */}
          {chapter?.pages > 0 && (
            <div className="flex justify-center pb-1">
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
style={{
  color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : '#000000',
  textShadow: isDarkTheme ? '0 0 6px rgba(255, 255, 255, 0.4)' : 'none',
  backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(145, 129, 80, 0.2)'
}}
              >
                {Math.max(1, Math.round((readProgress / 100) * chapter.pages))} / {chapter.pages} стр.
              </span>
            </div>
          )}
        </div>
      </header>

      {showChapterList && (
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
  <h2 className="text-xl sm:text-2xl font-bold text-center" style={{
    background: 'linear-gradient(90deg, #9370db 0%, #3fcaaf 50%, #9370db 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'chapterTitleShimmer 3s linear infinite',
    fontFamily: "'ppelganger', Georgia, serif"
  }}>
    Содержание
  </h2>
              <button 
                onClick={() => setShowChapterList(false)} 
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
              <div className="space-y-2">
                {allChapters.map((ch) => {
                  const isActive = String(ch.id) === String(chapterId);
                  return (
 <button
  key={ch.id}
  onClick={() => handleChapterSelect(ch.id)}
  className="w-full text-left p-3 sm:p-4 rounded-lg transition-all duration-300"
  style={{
    background: '#000000',
    position: 'relative',
    borderRadius: '12px'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 0 15px rgba(63, 202, 175, 0.6)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = 'none';
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
  <div className="flex items-center gap-3">
    <span className="font-bold text-base sm:text-lg flex-shrink-0" style={{
      color: '#c084fc',
      minWidth: '30px'
    }}>
      {ch.chapter_number}.
    </span>
    <span className="text-sm sm:text-base break-words flex-1" style={{
      color: '#c084fc',
      fontWeight: isActive ? '600' : '400'
    }}>
      {ch.title}
    </span>
  </div>
</button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

{showChapterList && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: '3px solid transparent',
      borderRadius: '16px',
      backgroundClip: 'padding-box',
      position: 'relative',
      boxShadow: '0 0 0 3px #65635d, 0 0 0 6px transparent, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
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
      <div className="flex justify-center items-center p-5 sm:p-6 relative" style={{
        borderBottom: '1px solid rgba(180, 154, 95, 0.2)'
      }}>
        <h2 className="text-xl sm:text-2xl font-bold text-center" style={{
          color: '#c9c6bb',
          fontFamily: "'miamanueva', Georgia, serif",
          fontStyle: 'italic',
          textShadow: '0 0 8px rgba(194, 171, 117, 0.3)'
        }}>
          Содержание
        </h2>
        <button 
          onClick={() => setShowChapterList(false)} 
          className="transition rounded-full p-2 absolute right-4"
          style={{
            color: '#65635d',
            backgroundColor: 'rgba(180, 154, 95, 0.15)',
            border: '1px solid rgba(180, 154, 95, 0.3)'
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
            background: linear-gradient(135deg, #c9c6bb 0%, #65635d 100%);
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(194, 171, 117, 0.6);
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5d5846 0%, #c9c6bb 100%);
            box-shadow: 0 0 15px rgba(216, 197, 162, 0.8);
          }
        `}} />
        <div className="space-y-2">
          {allChapters.map((ch) => {
            const isActive = String(ch.id) === String(chapterId);
            return (
              <button
                key={ch.id}
                onClick={() => handleChapterSelect(ch.id)}
                className="w-full text-left p-3 sm:p-4 rounded-lg transition-all duration-300"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  borderRadius: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'radial-gradient(circle at center, rgba(180, 154, 95, 0.25), rgba(0, 0, 0, 0.3))';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 154, 95, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '12px',
                  padding: '2px',
                  background: 'linear-gradient(90deg, #c9c6bb 0%, #000000 50%, #c9c6bb 100%)',
                  backgroundSize: '200% 100%',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none',
                  zIndex: -1,
                  animation: 'gothicBorderFlow 3s linear infinite'
                }} />
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base sm:text-lg flex-shrink-0" style={{
                    color: '#c9c6bb',
                    minWidth: '30px'
                  }}>
                    {ch.chapter_number}.
                  </span>
                  <span className="text-sm sm:text-base break-words flex-1" style={{
                    color: '#c9c6bb',
                    fontWeight: isActive ? '600' : '400'
                  }}>
                    {ch.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
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
                className="rounded-lg p-4 transition-all"
                style={{
                  background: '#000000',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'visible'
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

                <div className="flex items-center justify-between gap-3">
                  {/* НАЗВАНИЕ ТРЕКА */}
                  <p className="text-xs font-semibold line-clamp-1 flex-1" style={{ color: '#c084fc' }}>
                    {audio.name}
                  </p>

                  {/* КНОПКИ */}
                  <div className="flex items-center gap-2">
                    {/* ВОСПРОИЗВЕДЕНИЕ/ПАУЗА */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (audioElement) {
                          if (audioElement.paused) {
                            document.querySelectorAll('[id^="audio-track-"]').forEach(a => a.pause());
                            audioElement.play();
                          } else {
                            audioElement.pause();
                          }
                        }
                      }}
                      className="p-2 rounded-full transition-all flex-shrink-0"
                      style={{
                        background: isPlaying ? 'rgba(239, 1, 203, 0.3)' : 'rgba(147, 51, 234, 0.3)',
                        border: '1px solid ' + (isPlaying ? '#ef01cb' : '#9333ea')
                      }}
                    >
                      {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef01cb" stroke="#ef01cb" strokeWidth="2">
                          <rect x="6" y="4" width="4" height="16"/>
                          <rect x="14" y="4" width="4" height="16"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      )}
                    </button>

                    {/* СКАЧИВАНИЕ */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTrack(audio.url || audio.data, audio.name, i);
                      }}
                      disabled={downloadingTracks.includes(i)}
                      className="p-2 rounded-full transition-all flex-shrink-0"
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

{showPlaylist && !isDarkTheme && chapter?.audio_url && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
      background: 'rgba(0, 0, 0, 0.3)',
      border: '3px solid transparent',
      borderRadius: '16px',
      backgroundClip: 'padding-box',
      position: 'relative',
      boxShadow: '0 0 0 3px #65635d, 0 0 0 6px transparent, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
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
      
      <div className="flex justify-center items-center p-5 sm:p-6 relative" style={{
        borderBottom: '1px solid rgba(180, 154, 95, 0.2)'
      }}>
        <h2 className="text-xl sm:text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'miamanueva', Georgia, serif",
          fontStyle: 'italic'
        }}>
          Плейлист
        </h2>
        <button 
          onClick={() => setShowPlaylist(false)} 
          className="transition rounded-full p-2 absolute right-4"
          style={{
            color: '#65635d',
            backgroundColor: 'rgba(180, 154, 95, 0.15)',
            border: '1px solid rgba(180, 154, 95, 0.3)'
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
            background: linear-gradient(135deg, #c9c6bb 0%, #65635d 100%);
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(188, 187, 174, 0.25);
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5d5846 0%, #c9c6bb 100%);
            box-shadow: 0 0 15px rgba(188, 187, 174, 0.05);
          }
          @keyframes gothicBorderFlow {
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
                className="rounded-lg p-4 transition-all"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'visible'
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '12px',
                  padding: '2px',
                  background: 'linear-gradient(90deg, #c9c6bb 0%, #000000 50%, #c9c6bb 100%)',
                  backgroundSize: '200% 100%',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none',
                  zIndex: -1,
                  animation: 'gothicBorderFlow 3s linear infinite'
                }} />

                <div className="flex items-center justify-between gap-3">
                  {/* НАЗВАНИЕ ТРЕКА */}
                  <p className="text-xs font-semibold line-clamp-1 flex-1" style={{ color: '#c9c6bb' }}>
                    {audio.name}
                  </p>

                  {/* КНОПКИ */}
                  <div className="flex items-center gap-2">
                    {/* ВОСПРОИЗВЕДЕНИЕ/ПАУЗА */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (audioElement) {
                          if (audioElement.paused) {
                            document.querySelectorAll('[id^="audio-track-"]').forEach(a => a.pause());
                            audioElement.play();
                          } else {
                            audioElement.pause();
                          }
                        }
                      }}
                      className="p-2 rounded-full transition-all flex-shrink-0"
                      style={{
                        background: isPlaying ? 'rgba(180, 154, 95, 0.5)' : 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid ' + (isPlaying ? '#b49a5f' : 'rgba(180, 154, 95, 0.4)')
                      }}
                    >
                      {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9c6bb" stroke="#c9c6bb" strokeWidth="2">
                          <rect x="6" y="4" width="4" height="16"/>
                          <rect x="14" y="4" width="4" height="16"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9c6bb" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      )}
                    </button>

                    {/* СКАЧИВАНИЕ */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTrack(audio.url || audio.data, audio.name, i);
                      }}
                      disabled={downloadingTracks.includes(i)}
                      className="p-2 rounded-full transition-all flex-shrink-0"
                      style={{
                        background: downloadingTracks.includes(i) 
                          ? 'rgba(180, 154, 95, 0.3)' 
                          : 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid ' + (downloadingTracks.includes(i) ? '#b49a5f' : 'rgba(180, 154, 95, 0.4)')
                      }}
                    >
                      {downloadingTracks.includes(i) ? (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTopColor: '#c9c6bb',
                          borderRightColor: '#65635d',
                          borderRadius: '50%',
                          animation: 'cosmicSpin 0.8s linear infinite'
                        }} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9c6bb" strokeWidth="2">
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
    </div>
  </div>
)}

      {/* МОДАЛЬНОЕ ОКНО ЗАКЛАДОК */}
      {showBookmarksModal && (
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
  <h2 className="text-xl sm:text-2xl font-bold text-center" style={{
    background: 'linear-gradient(90deg, #9370db 0%, #3fcaaf 50%, #9370db 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'bookmarksTitleShimmer 3s linear infinite',
    fontFamily: "'ppelganger', Georgia, serif"
  }}>
    Закладки главы
  </h2>
              <button 
                onClick={() => setShowBookmarksModal(false)} 
                className="transition rounded-full p-2 absolute right-4"
                style={{
                  color: '#ffffff',
                  backgroundColor: 'rgba(147, 51, 234, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.5)'
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
              {userBookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(147, 51, 234, 0.5)" strokeWidth="2" className="mx-auto mb-4">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p className="text-gray-500">В этой главе нет закладок</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userBookmarks.map((bookmark) => (
<div 
  key={bookmark.id}
  className="rounded-lg p-4 transition-all cursor-pointer"
  style={{
    background: '#000000',
    position: 'relative',
    borderRadius: '12px'
  }}
  onClick={() => jumpToBookmark(bookmark.selected_text)}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 0 15px rgba(63, 202, 175, 0.6)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = 'none';
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
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#3fcaaf' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3fcaaf" stroke="#3fcaaf" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                          Закладка
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBookmark(bookmark.id);
                          }}
                          className="text-red-500 hover:text-red-400 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="bg-gray-900 rounded p-3 mb-2">
                        <p className="text-gray-300 text-sm line-clamp-3">
                          &quot;{bookmark.selected_text}&quot;
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(bookmark.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBookmarksModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
<div className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
  background: 'rgba(0, 0, 0, 0.3)',
  border: '3px solid transparent',
  borderRadius: '16px',
  backgroundClip: 'padding-box',
  position: 'relative',
  boxShadow: '0 0 0 3px #65635d, 0 0 0 6px transparent, inset 0 0 40px rgba(0, 0, 0, 0.5)'
}}>
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
      <div className="flex justify-center items-center p-5 sm:p-6 relative" style={{
        borderBottom: '1px solid rgba(180, 154, 95, 0.2)'
      }}>
<h2 className="text-xl sm:text-2xl font-bold text-center" style={{
  color: '#c9c6bb',
  fontFamily: "'miamanueva', Georgia, serif",
  fontStyle: 'italic',
  textShadow: '0 0 8px rgba(194, 171, 117, 0.3)'
}}>
  Закладки главы
</h2>
        <button 
          onClick={() => setShowBookmarksModal(false)} 
          className="transition rounded-full p-2 absolute right-4"
          style={{
            color: '#c9c6bb',
            backgroundColor: 'rgba(180, 154, 95, 0.15)',
            border: '1px solid rgba(180, 154, 70, 0.0)'
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
    background: linear-gradient(135deg, #5d5846 0%, #c9c6bb 100%);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(194, 171, 117, 0.6);
  }
  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #c9c6bb 0%, #5d5846 100%);
    box-shadow: 0 0 15px rgba(216, 197, 162, 0.8);
  }
`}} />
        {userBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(194, 171, 117, 0.5)" strokeWidth="2" className="mx-auto mb-4">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <p style={{ color: '#c9c6bb' }}>В этой главе нет закладок</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userBookmarks.map((bookmark) => (
      <div 
  key={bookmark.id}
  className="rounded-lg p-4 transition-all cursor-pointer"
  style={{
    background: 'rgba(0, 0, 0, 0.3)',
    position: 'relative',
    borderRadius: '12px'
  }}
  onClick={() => jumpToBookmark(bookmark.selected_text)}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'radial-gradient(circle at center, rgba(180, 154, 95, 0.25), rgba(0, 0, 0, 0.3))';
    e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 154, 95, 0.4)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  <div style={{
    position: 'absolute',
    inset: '-2px',
    borderRadius: '12px',
    padding: '2px',
    background: 'linear-gradient(90deg, #c9c6bb 0%, #000000 50%, #c9c6bb 100%)',
    backgroundSize: '200% 100%',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
    zIndex: -1,
    animation: 'gothicBorderFlow 3s linear infinite'
  }} />
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold flex items-center gap-2" style={{ color: '#c9c6bb' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9c6bb" stroke="#c9c6bb" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Закладка
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBookmark(bookmark.id);
                    }}
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="rounded p-3 mb-2" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
                  <p className="text-sm line-clamp-3" style={{ color: '#c9c6bb' }}>
                    &quot;{bookmark.selected_text}&quot;
                  </p>
                </div>
                <p className="text-xs" style={{ color: '#c9c6bb', opacity: 0.7 }}>
                  {new Date(bookmark.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
{work && (
  <>
<style dangerouslySetInnerHTML={{__html: `
  @keyframes workTitleShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
.work-title-shimmer {
  background: ${isDarkTheme 
    ? 'linear-gradient(90deg, #9370db 0%, #ffffff 50%, #9370db 100%)' 
    : 'linear-gradient(90deg, #65635d 0%, #d6c79e 50%, #65635d 100%)'};
  background-size: ${isDarkTheme ? '200% auto' : '200% auto'};
    background-size: ${isDarkTheme ? '200% auto' : '100% auto'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    ${isDarkTheme ? 'animation: workTitleShimmer 3s linear infinite;' : ''}
    font-family: 'Playfair Display', Georgia, serif;
  }
`}} />
<p className="mb-3 break-words font-bold text-center work-title-shimmer" style={{ 
  fontSize: isDarkTheme ? 'clamp(2rem, 5vw, 3.5rem)' : 'clamp(1.25rem, 3vw, 2rem)',
  fontFamily: isDarkTheme ? "'plommir', Georgia, serif" : "'kikamori', Georgia, serif", 
  fontStyle: isDarkTheme ? 'normal' : 'italic' 
}}>
  {work.title}
</p>
  </>
)}
<h1 className="font-bold mb-2 break-words" style={{
  fontSize: isDarkTheme ? 'clamp(1.25rem, 3vw, 2rem)' : 'clamp(1rem, 2.5vw, 1.25rem)',
  color: isDarkTheme ? '#c6abda' : '#807f7c',
  textShadow: isDarkTheme ? '0 0 10px rgba(118, 38, 181, 0.8)' : 'none',
  fontFamily: isDarkTheme ? "'ppelganger', Georgia, serif" : "'miamanueva', Georgia, serif",
  fontStyle: isDarkTheme ? 'normal' : 'italic'
}}>
  {chapter.chapter_number}. {chapter.title}
</h1>
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
<div className="space-y-4 mb-6 sm:mb-8">
  {/* Оценка и обсуждение */}
  <div className="flex gap-3 justify-center">
    <button
      onClick={() => setShowRatingModal(true)}
      className="px-4 sm:px-6 py-2 sm:py-3 transition text-sm sm:text-base flex items-center gap-2"
      style={{
        background: 'transparent',
        color: isDarkTheme ? '#c084fc' : '#c9c6bb'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={userRating ? 'currentColor' : 'none'} stroke={isDarkTheme ? '#c084fc' : '#c9c6bb'} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span>{averageRating > 0 ? averageRating.toFixed(1) : 'Оценить'}</span>
    </button>

    <Link
      href={`/work/${workId}/discussion`}
      className="px-4 sm:px-6 py-2 sm:py-3 transition text-sm sm:text-base flex items-center gap-2"
      style={{
        background: 'transparent',
        color: isDarkTheme ? '#c084fc' : '#c9c6bb'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDarkTheme ? '#c084fc' : '#c9c6bb'} strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span>Обсуждение</span>
    </Link>
  </div>

  {/* Навигация между главами */}
  <div className="flex flex-row justify-between items-center gap-3 sm:gap-4">
    {prevChapter ? (
      <button 
        onClick={handlePrevClick}
        className="w-full sm:w-auto flex items-center justify-center gap-2 transition text-sm sm:text-base"
        style={{
          background: 'transparent',
          color: isDarkTheme ? '#c084fc' : '#c9c6bb'
        }}
      >
        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">{t.previousChapter}</span>
        <span className="sm:hidden">Пред.</span>
      </button>
    ) : (
      <div className="hidden sm:block"></div>
    )}
    
<span className="text-xs sm:text-sm font-semibold" style={{
  color: isDarkTheme ? '#ffffff' : '#c9c6bb'
}}>
  Глава {chapter.chapter_number} из {allChapters.length}
</span>

    {nextChapter ? (
      <button 
        onClick={handleNextClick}
        className="w-full sm:w-auto flex items-center justify-center gap-2 transition text-sm sm:text-base"
        style={{
          background: 'transparent',
          color: isDarkTheme ? '#c084fc' : '#c9c6bb'
        }}
      >
        <span className="hidden sm:inline">{t.nextChapter}</span>
        <span className="sm:hidden">След.</span>
        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
      </button>
    ) : (
      <div className="hidden sm:block"></div>
    )}
  </div>
  {/* Благодарность за прочтение */}
  <p className="text-center text-xs sm:text-sm mt-4" style={{
    color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
    fontStyle: 'italic'
  }}>
    Спасибо за прочтение!
  </p>
</div>

{/* БОКОВАЯ ПАНЕЛЬ МЕНЮ */}
{showSidePanel && (
  <>
    {/* ТЕМНАЯ ПАНЕЛЬ */}
  {isDarkTheme && (
    <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-50 overflow-y-auto shadow-2xl border-2" style={{
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
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shineHeader {
              0% { left: -100%; }
              100% { left: 200%; }
            }
            .shimmer-panel-text {
              background: linear-gradient(90deg, #b3e7ef 0%, #ef01cb 50%, #b3e7ef 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmer-btn 3s linear infinite;
            }
          `}} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shineHeader 3s infinite'
          }}></div>
<style dangerouslySetInnerHTML={{__html: `
  @keyframes neonPulse {
    0%, 100% { 
      text-shadow: 0 0 10px #e8d3e9, 0 0 20px #e8d3e9, 0 0 30px #e8d3e9;
    }
    50% { 
      text-shadow: 0 0 20px #e8d3e9, 0 0 40px #e8d3e9, 0 0 60px #e8d3e9;
    }
  }
`}} />
          <button 
            onClick={() => setShowSidePanel(false)} 
            className="text-gray-400 hover:text-white absolute right-3 sm:right-4" 
            style={{ zIndex: 2 }}
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 flex flex-col h-[calc(100vh-120px)]">
          <button
            onClick={() => {
              setShowChapterList(true);
              setShowSidePanel(false);
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" className="sm:w-5 sm:h-5" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span style={{ 
  color: '#ffffff', 
  textShadow: '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.9), 0 0 60px rgba(179, 231, 239, 0.8)',
  fontWeight: 'bold',
  animation: 'textNeonPulse 2s ease-in-out infinite'
}}>Главы</span>
          </button>

          <button
            onClick={() => {
              setShowBookmarksModal(true);
              loadChapterBookmarks();
              setShowSidePanel(false);
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
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" className="sm:w-5 sm:h-5" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ 
  color: '#ffffff', 
  textShadow: '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.9), 0 0 60px rgba(179, 231, 239, 0.8)',
  fontWeight: 'bold',
  animation: 'textNeonPulse 2s ease-in-out infinite'
}}>Закладки</span>
          </button>

          {chapter?.audio_url && (
            <button
              onClick={() => {
                setShowPlaylist(true);
                setShowSidePanel(false);
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" className="sm:w-5 sm:h-5" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' }}>
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              <span style={{ 
  color: '#ffffff', 
  textShadow: '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.9), 0 0 60px rgba(179, 231, 239, 0.8)',
  fontWeight: 'bold',
  animation: 'textNeonPulse 2s ease-in-out infinite'
}}>Плейлист</span>
            </button>
          )}

          <div className="mt-auto pt-8">
            <button
              onClick={toggleTheme}
              className="w-full relative rounded-full p-1 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                boxShadow: '0 0 20px rgba(147, 112, 219, 0.6), 0 0 40px rgba(147, 112, 219, 0.3)',
                animation: 'pulse-theme 2s ease-in-out infinite',
                height: '40px'
              }}
            >
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulse-theme {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
              `}} />
              
              <div 
                className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                  boxShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
                  transform: 'translateX(0)',
                }}
              >
                <span style={{ fontSize: '16px', filter: 'grayscale(100%) brightness(2)', opacity: 0.6 }}>
                  🌙
                </span>
              </div>
              
              <div className="flex items-center justify-between px-4 h-full">
                <span 
                  className="text-xs font-bold transition-opacity duration-300"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                  }}
                >
                </span>
                <span 
                  className="text-xs font-bold transition-opacity duration-300"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.3)',
                    textShadow: 'none'
                  }}
                >
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* СВЕТЛАЯ ТЕМА - ЗОЛОТАЯ (НОВАЯ) */}
    {!isDarkTheme && (
  <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-50 overflow-y-auto shadow-3xl" style={{
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
              background: linear-gradient(90deg, #c9c6bb 0%, #3a3a3a 50%, #bcbbae 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmerGold 3s linear infinite;
              font-family: 'Playfair Display', Georgia, serif;
            }
          `}} />
      
          
      <style dangerouslySetInnerHTML={{__html: `
  @keyframes menuShimmer {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
`}} />
          
          <button 
            onClick={() => setShowSidePanel(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-20"
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmerGoldBtn {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}} />
      
      <button
        onClick={() => {
          setShowChapterList(true);
          setShowSidePanel(false);
        }}
        className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
 border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
          background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
        }} />
        
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8d7d7" strokeWidth="2" className="relative z-10">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span className="relative z-10 text-center" style={{ 
          background: 'linear-gradient(90deg, #857f6a 0%, #dfdede 50%, #857f6a 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmerGoldBtn 3s linear infinite',
          fontStyle: 'normal',
          fontWeight: '600'
        }}>
          Главы
        </span>
      </button>

      <button
        onClick={() => {
          setShowBookmarksModal(true);
          loadChapterBookmarks();
          setShowSidePanel(false);
        }}
        className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
 border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
          background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
        }} />
        
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8d7d7" strokeWidth="2" className="relative z-10">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <span className="relative z-10 text-center" style={{ 
          background: 'linear-gradient(90deg, #857f6a 0%, #dfdede 50%, #857f6a 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmerGoldBtn 3s linear infinite',
          fontStyle: 'normal',
          fontWeight: '600'
        }}>
          Закладки
        </span>
      </button>

      {chapter?.audio_url && (
        <button
          onClick={() => {
            setShowPlaylist(true);
            setShowSidePanel(false);
          }}
          className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
          style={{
          background: 'linear-gradient(135deg, rgba(7, 7, 7, 0.35), rgba(188, 187, 174, 0.15))',
 border: '1px solid rgba(27, 27, 27, 0.15)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.57)'
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
           background: 'radial-gradient(circle at center, rgba(73, 1, 13, 0.3), transparent)'
          }} />
          
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d8d7d7" strokeWidth="2" className="relative z-10">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <span className="relative z-10 text-center" style={{  
            background: 'linear-gradient(90deg, #857f6a 0%, #dfdede 50%, #857f6a 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerGoldBtn 3s linear infinite',
            fontStyle: 'normal',
            fontWeight: '600'
          }}>
            Плейлист
          </span>
        </button>
      )}

          <div className="mt-auto pt-8">
            <button
              onClick={toggleTheme}
              className="w-full relative rounded-full p-1 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
                animation: 'pulse-theme 2s ease-in-out infinite',
                height: '40px'
              }}
            >
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulse-theme {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
              `}} />
              
              <div 
                className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  transform: 'translateX(240px)',
                }}
              >
                <span style={{ fontSize: '16px', filter: 'grayscale(100%) brightness(2)', opacity: 0.6 }}>
                  ☀️
                </span>
              </div>
              
              <div className="flex items-center justify-between px-4 h-full">
                <span 
                  className="text-xs font-bold transition-opacity duration-300"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.3)',
                    textShadow: 'none'
                  }}
                >
                </span>
                <span 
                  className="text-xs font-bold transition-opacity duration-300"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                  }}
                >
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )}
  </>
)}

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
      
      {/* Кнопка закрытия */}
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
      
      {/* Стрелка влево */}
      {chapter.images.indexOf(selectedImage) > 0 && (
        <button
          onClick={() => setSelectedImage(chapter.images[chapter.images.indexOf(selectedImage) - 1])}
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
      
      {/* Стрелка вправо */}
      {chapter.images.indexOf(selectedImage) < chapter.images.length - 1 && (
        <button
          onClick={() => setSelectedImage(chapter.images[chapter.images.indexOf(selectedImage) + 1])}
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

{/* ФУТЕР С КОПИРАЙТОМ */}
<footer className="mt-12 py-6 border-t" style={{
  borderColor: isDarkTheme ? 'rgba(147, 112, 219, 0.3)' : 'rgba(180, 154, 95, 0.3)'
}}>
  <div className="text-center">
    <p className="text-xs sm:text-sm mb-2" style={{
      color: isDarkTheme ? '#9ca3af' : '#c9c6bb'
    }}>
      © {new Date().getFullYear()} MelloStory. Все права защищены.
    </p>
    <p className="text-xs" style={{
      color: isDarkTheme ? '#6b7280' : '#a89f8f'
    }}>
      Копирование, распространение и любое иное использование материалов без разрешения автора запрещены.
    </p>
  </div>
</footer>
      </main>
    </div>
  );
}