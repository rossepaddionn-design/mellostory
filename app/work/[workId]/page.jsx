'use client';
import '@/app/fonts.css'; 
import { useState, useEffect, useRef, useMemo } from 'react';
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

const showConfirm = (message, action = null) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
};

const toggleTheme = () => {
  const newTheme = !isDarkTheme;
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  setIsDarkTheme(newTheme);
  setShowManagementModal(false);
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
<text
  x="160"
  y="175"
  textAnchor="middle"
  fontSize="42"
  fontWeight="800"
  fontFamily="'Arial Black', Arial, sans-serif"
  letterSpacing="-2"
  fill="#000000"
  style={{
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
  }}
>MS</text>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" style={{
      background: 'radial-gradient(ellipse at 30% 20%, #1a0035 0%, #07000f 50%, #000000 100%)',
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ageStarTwinkle { 0%,100%{opacity:0.15;} 50%{opacity:0.7;} }
        @keyframes ageLineFlow { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes ageOrb1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(40px,-30px) scale(1.2);} 66%{transform:translate(-25px,20px) scale(0.85);} }
        @keyframes ageOrb2 { 0%,100%{transform:translate(0,0) scale(1.1);} 33%{transform:translate(-50px,25px) scale(0.8);} 66%{transform:translate(30px,-20px) scale(1.3);} }
        @keyframes ageOrb3 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(20px,35px);} }
        @keyframes ageFadeIn { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes agePulse { 0%,100%{box-shadow:0 0 40px rgba(147,51,234,0.3),0 0 80px rgba(147,51,234,0.1);} 50%{box-shadow:0 0 60px rgba(147,51,234,0.5),0 0 120px rgba(239,1,203,0.2);} }
        @keyframes ageBtnGlow { 0%,100%{box-shadow:0 0 15px rgba(147,112,219,0.3);} 50%{box-shadow:0 0 25px rgba(147,112,219,0.6),0 0 50px rgba(239,1,203,0.2);} }
      `}} />

      {/* Плазменные орбы фон */}
      <div style={{position:'absolute',width:'500px',height:'500px',
        background:'radial-gradient(circle,rgba(147,51,234,0.12) 0%,rgba(109,5,200,0.06) 40%,transparent 70%)',
        borderRadius:'40% 60% 70% 30%',filter:'blur(40px)',
        animation:'ageOrb1 12s ease-in-out infinite',
        top:'-10%',left:'-5%',pointerEvents:'none'}}/>
      <div style={{position:'absolute',width:'400px',height:'400px',
        background:'radial-gradient(circle,rgba(239,1,203,0.1) 0%,rgba(147,51,234,0.05) 50%,transparent 80%)',
        borderRadius:'60% 40% 30% 70%',filter:'blur(35px)',
        animation:'ageOrb2 15s ease-in-out infinite',
        bottom:'5%',right:'-5%',pointerEvents:'none'}}/>
      <div style={{position:'absolute',width:'300px',height:'300px',
        background:'radial-gradient(circle,rgba(63,202,175,0.07) 0%,transparent 70%)',
        borderRadius:'50%',filter:'blur(30px)',
        animation:'ageOrb3 10s ease-in-out infinite',
        top:'40%',left:'60%',pointerEvents:'none'}}/>

      {/* Звёзды */}
      {[...Array(40)].map((_,i)=>(
        <div key={i} style={{
          position:'absolute',
          width: i%5===0 ? '2px' : '1px',
          height: i%5===0 ? '2px' : '1px',
          background:'#ffffff',
          borderRadius:'50%',
          left:`${(i*7+13)%100}%`,
          top:`${(i*11+7)%100}%`,
          animation:`ageStarTwinkle ${2+i%4}s ease-in-out infinite`,
          animationDelay:`${(i*0.15)%3}s`,
          opacity: 0.3,
          pointerEvents:'none'
        }}/>
      ))}

      {/* Горизонтальные декоративные линии */}
      <div style={{position:'absolute',top:'18%',left:0,right:0,height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.15),rgba(239,1,203,0.1),rgba(147,112,219,0.15),transparent)',
        pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'18%',left:0,right:0,height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.1),rgba(63,202,175,0.08),rgba(147,112,219,0.1),transparent)',
        pointerEvents:'none'}}/>

      {/* Основной блок */}
      <div style={{
        position:'relative',zIndex:10,
        width:'100%',maxWidth:'420px',
        margin:'0 16px',
        animation:'ageFadeIn 0.6s ease-out'
      }}>
        {/* Верхняя линия */}
        <div style={{height:'2px',background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,#3fcaaf,transparent)',marginBottom:'0',borderRadius:'2px 2px 0 0'}}/>

        {/* Карточка */}
        <div style={{
          background:'radial-gradient(ellipse at top,#0d0020 0%,#050010 60%,#000000 100%)',
          border:'1px solid rgba(147,112,219,0.25)',
          borderTop:'none',
          borderRadius:'0 0 16px 16px',
          padding:'36px 32px 40px',
          animation:'agePulse 4s ease-in-out infinite',
          position:'relative',overflow:'hidden'
        }}>

          {/* Внутренние звёзды карточки */}
          <div style={{position:'absolute',inset:0,pointerEvents:'none',
            backgroundImage:`
              radial-gradient(1px 1px at 8% 15%,rgba(255,255,255,0.5) 0%,transparent 100%),
              radial-gradient(1px 1px at 92% 10%,rgba(255,255,255,0.4) 0%,transparent 100%),
              radial-gradient(1px 1px at 75% 85%,rgba(255,255,255,0.3) 0%,transparent 100%),
              radial-gradient(1px 1px at 15% 80%,rgba(255,255,255,0.35) 0%,transparent 100%),
              radial-gradient(1px 1px at 50% 92%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
            animation:'ageStarTwinkle 5s ease-in-out infinite'}}/>

          {/* Декор угловой — левый верх */}
          <div style={{position:'absolute',top:'16px',left:'16px',
            width:'20px',height:'20px',
            borderTop:'1px solid rgba(147,112,219,0.4)',
            borderLeft:'1px solid rgba(147,112,219,0.4)'}}/>
          {/* Декор угловой — правый верх */}
          <div style={{position:'absolute',top:'16px',right:'16px',
            width:'20px',height:'20px',
            borderTop:'1px solid rgba(147,112,219,0.4)',
            borderRight:'1px solid rgba(147,112,219,0.4)'}}/>
          {/* Декор угловой — левый низ */}
          <div style={{position:'absolute',bottom:'16px',left:'16px',
            width:'20px',height:'20px',
            borderBottom:'1px solid rgba(147,112,219,0.4)',
            borderLeft:'1px solid rgba(147,112,219,0.4)'}}/>
          {/* Декор угловой — правый низ */}
          <div style={{position:'absolute',bottom:'16px',right:'16px',
            width:'20px',height:'20px',
            borderBottom:'1px solid rgba(147,112,219,0.4)',
            borderRight:'1px solid rgba(147,112,219,0.4)'}}/>

          {/* Заголовок */}
          <div style={{textAlign:'center',marginBottom:'28px',position:'relative',zIndex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.5))'}}/>
              <span style={{color:'rgba(179,231,239,0.3)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
              <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.5))'}}/>
            </div>

            <h1 style={{
              fontFamily:"'plommir', Georgia, serif",
              fontWeight:'300',
              fontSize:'clamp(2.2rem,8vw,3.2rem)',
              backgroundImage:'linear-gradient(90deg,#a72cc9 0%,#e6009b 33%,#68d3f3 66%,#a855f7 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
              animation:'ageLineFlow 4s linear infinite',
              lineHeight:1.1,
              margin:'0 0 16px 0'
            }}>MelloStory</h1>

            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
              <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.25))'}}/>
              <span style={{color:'rgba(147,112,219,0.25)',fontSize:'0.45rem',letterSpacing:'6px'}}>· · · · · · ·</span>
              <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.25))'}}/>
            </div>

            <p style={{
              fontFamily:'Cinzel,serif',
              fontSize:'0.6rem',
              letterSpacing:'4px',
              textTransform:'uppercase',
              color:'rgba(180,100,255,0.6)',
              marginBottom:'8px'
            }}>Контент 18+</p>
            <p style={{
              fontFamily:'Georgia,serif',
              fontStyle:'italic',
              fontSize:'0.8rem',
              color:'rgba(200,185,230,0.45)',
              lineHeight:'1.6',
              maxWidth:'280px',
              margin:'0 auto'
            }}>Для продолжения необходимо войти в аккаунт</p>
          </div>

          {/* Кнопки */}
          <div style={{display:'flex',flexDirection:'column',gap:'10px',position:'relative',zIndex:1}}>
            <button
              onClick={() => { window.location.href = '/welcome?login=true'; }}
              style={{
                width:'100%',padding:'13px',
                background:'rgba(147,112,219,0.12)',
                border:'1px solid rgba(147,112,219,0.5)',
                borderRadius:'6px',cursor:'pointer',
                fontFamily:'Cinzel,serif',fontSize:'0.68rem',letterSpacing:'4px',textTransform:'uppercase',
                color:'#d8b4fe',
                animation:'ageBtnGlow 3s ease-in-out infinite',
                transition:'all 0.2s',
                position:'relative',overflow:'hidden'
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.background='rgba(147,112,219,0.25)';
                e.currentTarget.style.borderColor='rgba(192,132,252,0.8)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.background='rgba(147,112,219,0.12)';
                e.currentTarget.style.borderColor='rgba(147,112,219,0.5)';
              }}
            >✦ Войти ✦</button>

            <button
              onClick={() => { window.location.href = '/welcome?register=true'; }}
              style={{
                width:'100%',padding:'13px',
                background:'transparent',
                border:'1px solid rgba(147,112,219,0.2)',
                borderRadius:'6px',cursor:'pointer',
                fontFamily:'Cinzel,serif',fontSize:'0.68rem',letterSpacing:'4px',textTransform:'uppercase',
                color:'rgba(180,100,255,0.5)',
                transition:'all 0.2s'
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.background='rgba(147,112,219,0.08)';
                e.currentTarget.style.borderColor='rgba(147,112,219,0.4)';
                e.currentTarget.style.color='rgba(200,180,255,0.8)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.background='transparent';
                e.currentTarget.style.borderColor='rgba(147,112,219,0.2)';
                e.currentTarget.style.color='rgba(180,100,255,0.5)';
              }}
            >Регистрация</button>
          </div>

        </div>
        {/* Нижняя линия */}
        <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.2),rgba(63,202,175,0.15),rgba(147,112,219,0.2),transparent)'}}/>
      </div>
    </div>
  );
}

return (
 <div className="min-h-screen text-white" style={{ 
  background: isDarkTheme
    ? 'radial-gradient(ellipse at 20% 0%, #1a0035 0%, #07000f 45%, #000000 100%)'
    : 'radial-gradient(ellipse at 50% 0%, #0d0008 0%, #000000 60%)'
}}>
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
{isDarkTheme ? (
  // ТЕМНАЯ ТЕМА - КВАНТОВАЯ ЧАСТИЦА
  <header className="border-b relative overflow-hidden" style={{
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
      @keyframes waveShift {
        0% { transform: translate(0, 0); }
        100% { transform: translate(80px, 80px); }
      }
      @keyframes quantumRipple {
        0% {
          width: 0;
          height: 0;
          opacity: 0.6;
        }
        100% {
          width: 300px;
          height: 300px;
          opacity: 0;
        }
      }
    `}} />
    
    {/* Частицы */}
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
    
    <div className="max-w-6xl mx-auto flex justify-between items-center" style={{ position: 'relative', zIndex: 1 }}>
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 transition text-sm sm:text-base relative"
        style={{
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
        }}
      >
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
      
{currentUser && userProfile && (
<button
  onClick={() => setShowReaderPanel(true)}
  className="flex items-center gap-2 relative overflow-hidden transition-all"
  style={{
    padding: '10px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '50px',
    color: '#c4b5fd',
    cursor: 'pointer',
    paddingBottom: '8px'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = '#fff';
    e.currentTarget.style.textShadow = '0 0 10px rgba(147, 51, 234, 0.8)';
    const line = e.currentTarget.querySelector('.hover-line-menu');
    if (line) line.style.width = '120%';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = '#c4b5fd';
    e.currentTarget.style.textShadow = 'none';
    const line = e.currentTarget.querySelector('.hover-line-menu');
    if (line) line.style.width = '0';
  }}
>
  <Menu size={18} className="sm:w-5 sm:h-5" style={{ position: 'relative', zIndex: 1 }} />
  <span style={{ position: 'relative', zIndex: 1 }} className="max-w-[80px] sm:max-w-none truncate">
    {userProfile?.nickname}
    <div 
  className="hover-line-menu"
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
  </span>
</button>
      )}
    </div>
  </header>
) : (
  // СВЕТЛАЯ ТЕМА - ЖЕРТВЕННЫЙ ОГОНЬ
  <header className="relative overflow-hidden" style={{
    padding: '22px 24px',
    background: '#000000',
    borderBottom: '3px solid rgba(105, 10, 50, 0.43)',
    position: 'relative'
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
    
    {/* Пламя */}
    <div className="flame-light" style={{ left: '20%', animationDelay: '0s' }} />
    <div className="flame-light" style={{ left: '40%', animationDelay: '0.3s', animationDuration: '1.8s' }} />
    <div className="flame-light" style={{ left: '60%', animationDelay: '0.6s', animationDuration: '1.6s' }} />
    <div className="flame-light" style={{ left: '80%', animationDelay: '0.9s', animationDuration: '1.7s' }} />
    
    <div className="max-w-6xl mx-auto flex justify-between items-center" style={{ position: 'relative', zIndex: 1 }}>
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 transition text-sm sm:text-base relative"
        style={{
          color: 'rgba(90, 8, 17, 0.9)',
          textDecoration: 'none',
          paddingBottom: '4px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgb(119, 39, 63)';
          e.currentTarget.style.textShadow = '0 0 8px rgba(126, 9, 44, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(114, 17, 49, 0.9)';
          e.currentTarget.style.textShadow = 'none';
        }}
      >
        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
        Назад
      </Link>
      
      {currentUser && userProfile && (
<button
  onClick={() => setShowReaderPanel(true)}
  className="flex items-center gap-2 transition-all"
  style={{
    padding: '10px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(150, 15, 30, 0.95)',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.textShadow = '0 0 8px rgba(150, 15, 30, 0.6)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.textShadow = 'none';
  }}
>
  <Menu size={18} className="sm:w-5 sm:h-5" />
  <span className="max-w-[80px] sm:max-w-none truncate">
    {userProfile?.nickname}
  </span>
</button>
      )}
    </div>
  </header>
)}

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
{/* ДЕКОРАТИВНЫЙ БЛОК НАЗВАНИЯ */}
{isDarkTheme ? (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'20px',marginTop:'8px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'10px'}}>
      <div style={{width:'70px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.5))'}}/>
      <span style={{color:'rgba(179,231,239,0.3)',fontSize:'0.55rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
      <div style={{width:'70px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.5))'}}/>
    </div>
    <h1 className="break-words" style={{
      fontFamily:"'plommir', Georgia, serif",
      fontWeight:'300',
      fontSize:'clamp(2.4rem,6vw,5rem)',
      backgroundImage:'linear-gradient(90deg, #a72cc9 0%, #e6009b 33%, #68d3f3 66%, #a855f7 100%)',
      backgroundSize:'200% auto',
      WebkitBackgroundClip:'text',
      WebkitTextFillColor:'transparent',
      backgroundClip:'text',
      color:'transparent',
      lineHeight:1.15,
      textAlign:'center',
      animation:'workPageShimmer 6s linear infinite',
      marginBottom:'10px'
    }}>
      {work.title}
    </h1>
    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
      <div style={{width:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.25))'}}/>
      <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.5rem',letterSpacing:'10px'}}>· · · · · · ·</span>
      <div style={{width:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.25))'}}/>
    </div>
  </div>
) : (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'20px',marginTop:'8px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'10px'}}>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.6))'}}/>
      <span style={{color:'rgba(201,168,76,0.45)',fontSize:'0.7rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.6))'}}/>
    </div>
    <h1 className="break-words" style={{
      fontFamily:"'victiriya', Georgia, serif",
      fontWeight:'400',
      fontSize:'clamp(2rem,5vw,4rem)',
      backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
      backgroundSize:'200% auto',
      WebkitBackgroundClip:'text',
      WebkitTextFillColor:'transparent',
      backgroundClip:'text',
      color:'transparent',
      lineHeight:1.2,
      textAlign:'center',
      animation:'ratingGoldShimmer 5s linear infinite',
      marginBottom:'10px'
    }}>
      {work.title}
    </h1>
    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.35))'}}/>
      <span style={{color:'rgba(201,168,76,0.3)',fontSize:'0.65rem',letterSpacing:'5px',fontFamily:'serif'}}>⚜ · · ⚜</span>
      <div style={{width:'60px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.35))'}}/>
    </div>
  </div>
)}

{/* ХАРАКТЕРИСТИКИ */}
<div style={{
  marginBottom: '20px',
  marginTop: '8px'
}}>
  {isDarkTheme ? (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        .meta-row {
          display: flex;
          gap: 8px;
          padding: 7px 0;
          border-bottom: 1px solid rgba(147,112,219,0.08);
          align-items: baseline;
        }
        .meta-row:last-child { border-bottom: none; }
        .meta-label {
          font-size: 0.6rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(180,100,255,0.45);
          font-family: 'Cinzel', Georgia, serif;
          white-space: nowrap;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .meta-value {
          font-size: 0.875rem;
          color: rgba(220,210,240,0.75);
          font-family: Georgia, serif;
          font-style: italic;
          line-height: 1.5;
          word-break: break-word;
        }
      `}}/>

      {work.fandom && (
        <div className="meta-row">
          <span className="meta-label">Фандом</span>
          <span className="meta-value">{work.fandom}</span>
        </div>
      )}
      {work.pairing && (
        <div className="meta-row">
          <span className="meta-label">Пейринг</span>
          <span className="meta-value">{work.pairing}</span>
        </div>
      )}
      {work.slogan && (
        <div className="meta-row">
          <span className="meta-label">Слоган</span>
          <span className="meta-value">{work.slogan}</span>
        </div>
      )}
      <div className="meta-row">
        <span className="meta-label">Направление</span>
        <span className="meta-value">{work.direction}</span>
      </div>
      <div className="meta-row">
        <span className="meta-label">Рейтинг</span>
        <span className="meta-value">{work.rating}</span>
      </div>
      {work.category && (
        <div className="meta-row">
          <span className="meta-label">Категория</span>
          <span className="meta-value">{{novel:'Роман',longfic:'Лонгфик',minific:'Минифик'}[work.category]||work.category}</span>
        </div>
      )}
      {work.status && (
        <div className="meta-row">
          <span className="meta-label">Статус</span>
          <span className="meta-value">{{completed:'Завершён',ongoing:'В процессе'}[work.status]||work.status}</span>
        </div>
      )}
      {work.total_pages > 0 && (
        <div className="meta-row">
          <span className="meta-label">Страниц</span>
          <span className="meta-value">{work.total_pages.toLocaleString()}</span>
        </div>
      )}
{work.genres && (Array.isArray(work.genres)?work.genres.length>0:work.genres.trim().length>0) && (
  <div>
    <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Жанры: </span>
    <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
     {(Array.isArray(work.genres)?work.genres:work.genres.split(',')).filter(g=>g.trim()).join(', ')}
    </span>
  </div>
)}
{work.tags && (Array.isArray(work.tags)?work.tags.length>0:work.tags.trim().length>0) && (
  <div>
    <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Теги: </span>
    <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
      {(Array.isArray(work.tags)?work.tags:work.tags.split(',')).filter(t=>t.trim()).join(', ')}
    </span>
  </div>
)}
{spoilerTagsArray.length>0 && (
  <div>
    <button onClick={()=>setShowSpoilers(!showSpoilers)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'inline'}}>
      <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Спойлеры </span>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)'} strokeWidth="2" style={{transform:showSpoilers?'rotate(180deg)':'rotate(0deg)',transition:'0.3s',display:'inline',verticalAlign:'middle'}}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    {showSpoilers && (
      <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
        {spoilerTagsArray.filter(s=>s.trim()).join(', ')}
      </span>
    )}
  </div>
)}
{work.disclaimer&&work.disclaimer.trim()&&(
  <div>
    <button onClick={()=>setShowDisclaimer(!showDisclaimer)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'inline'}}>
      <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Дисклеймер </span>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)'} strokeWidth="2" style={{transform:showDisclaimer?'rotate(180deg)':'rotate(0deg)',transition:'0.3s',display:'inline',verticalAlign:'middle'}}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    {showDisclaimer&&(
      <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif',whiteSpace:'pre-wrap'}}>{work.disclaimer}</span>
    )}
  </div>
)}
    </>
  ) : (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        .meta-row-light {
          display: flex;
          gap: 8px;
          padding: 7px 0;
          border-bottom: 1px solid rgba(201,168,76,0.1);
          align-items: baseline;
        }
        .meta-row-light:last-child { border-bottom: none; }
        .meta-label-light {
          font-size: 0.6rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(201,168,76,0.45);
          font-family: 'Cinzel', Georgia, serif;
          white-space: nowrap;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .meta-value-light {
          font-size: 0.875rem;
          color: rgba(201,168,76,0.65);
          font-family: Georgia, serif;
          font-style: italic;
          line-height: 1.5;
          word-break: break-word;
        }
      `}}/>

      {work.fandom && (
        <div className="meta-row-light">
          <span className="meta-label-light">Фандом</span>
          <span className="meta-value-light">{work.fandom}</span>
        </div>
      )}
      {work.pairing && (
        <div className="meta-row-light">
          <span className="meta-label-light">Пейринг</span>
          <span className="meta-value-light">{work.pairing}</span>
        </div>
      )}
      {work.slogan && (
        <div className="meta-row-light">
          <span className="meta-label-light">Слоган</span>
          <span className="meta-value-light">{work.slogan}</span>
        </div>
      )}
      <div className="meta-row-light">
        <span className="meta-label-light">Направление</span>
        <span className="meta-value-light">{work.direction}</span>
      </div>
      <div className="meta-row-light">
        <span className="meta-label-light">Рейтинг</span>
        <span className="meta-value-light">{work.rating}</span>
      </div>
      {work.category && (
        <div className="meta-row-light">
          <span className="meta-label-light">Категория</span>
          <span className="meta-value-light">{{novel:'Роман',longfic:'Лонгфик',minific:'Минифик'}[work.category]||work.category}</span>
        </div>
      )}
      {work.status && (
        <div className="meta-row-light">
          <span className="meta-label-light">Статус</span>
          <span className="meta-value-light">{{completed:'Завершён',ongoing:'В процессе'}[work.status]||work.status}</span>
        </div>
      )}
      {work.total_pages > 0 && (
        <div className="meta-row-light">
          <span className="meta-label-light">Страниц</span>
          <span className="meta-value-light">{work.total_pages.toLocaleString()}</span>
        </div>
      )}
{work.genres && (Array.isArray(work.genres)?work.genres.length>0:work.genres.trim().length>0) && (
  <div>
    <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Жанры: </span>
    <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
     {(Array.isArray(work.genres)?work.genres:work.genres.split(',')).filter(g=>g.trim()).join(', ')}
    </span>
  </div>
)}
{work.tags && (Array.isArray(work.tags)?work.tags.length>0:work.tags.trim().length>0) && (
  <div>
    <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Теги: </span>
    <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
    {(Array.isArray(work.tags)?work.tags:work.tags.split(',')).filter(t=>t.trim()).join(', ')}
    </span>
  </div>
)}
{spoilerTagsArray.length>0 && (
  <div>
    <button onClick={()=>setShowSpoilers(!showSpoilers)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'inline'}}>
      <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Спойлеры </span>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)'} strokeWidth="2" style={{transform:showSpoilers?'rotate(180deg)':'rotate(0deg)',transition:'0.3s',display:'inline',verticalAlign:'middle'}}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    {showSpoilers && (
      <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif'}}>
        {spoilerTagsArray.map((s,i,arr)=>{const t=s.trim();if(!t)return null;return(<span key={i}><GenreTag name={t}/>{i<arr.length-1&&', '}</span>);})}
      </span>
    )}
  </div>
)}
{work.disclaimer&&work.disclaimer.trim()&&(
  <div>
    <button onClick={()=>setShowDisclaimer(!showDisclaimer)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'inline'}}>
      <span style={{fontSize:'0.6rem',letterSpacing:'3px',textTransform:'uppercase',fontFamily:'Cinzel,serif',color:isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)',fontWeight:'normal'}}>Дисклеймер </span>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isDarkTheme?'rgba(180,100,255,0.45)':'rgba(201,168,76,0.45)'} strokeWidth="2" style={{transform:showDisclaimer?'rotate(180deg)':'rotate(0deg)',transition:'0.3s',display:'inline',verticalAlign:'middle'}}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    {showDisclaimer&&(
      <span className="break-words" style={{fontSize:'0.875rem',color:isDarkTheme?'rgba(210,200,230,0.75)':'rgba(201,168,76,0.65)',fontStyle:'italic',fontFamily:'Georgia,serif',whiteSpace:'pre-wrap'}}>{work.disclaimer}</span>
    )}
  </div>
)}
    </>
  )}
</div>

<div className="flex gap-2 sm:gap-3 flex-wrap mb-4 sm:mb-6 items-center mt-4 justify-center">
  {/* Кнопка Прочтений */}
  <div 
    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 relative"
    style={{
      background: isDarkTheme
        ? 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)'
        : 'rgba(255, 255, 255, 0.1)',
      border: isDarkTheme ? '2px solid #7f85db' : 'none',
      borderRadius: isDarkTheme ? '50px' : '0',
      color: isDarkTheme ? 'rgba(200,185,225,0.8)' : 'rgba(201,168,76,0.8)',
      boxShadow: isDarkTheme ? '0 0 20px rgba(91, 109, 209, 0.5), inset 0 0 20px rgba(51, 124, 234, 0.3)' : '0 4px 15px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      overflow: 'visible',
      clipPath: isDarkTheme ? 'none' : 'polygon(5% 0%, 15% 2%, 30% 0%, 45% 3%, 60% 0%, 75% 2%, 90% 0%, 100% 5%, 98% 20%, 100% 35%, 97% 50%, 100% 65%, 98% 80%, 100% 95%, 95% 100%, 85% 98%, 70% 100%, 55% 97%, 40% 100%, 25% 98%, 10% 100%, 0% 95%, 2% 80%, 0% 65%, 3% 50%, 0% 35%, 2% 20%, 0% 5%)'
    }}
  >
    {isDarkTheme && (
      <>
        <div className="orbit-particle-green"></div>
        <div className="orbit-particle-green"></div>
      </>
    )}
    {!isDarkTheme && (
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(90deg, transparent, rgba(114, 108, 110, 0.23), transparent)',
        animation: 'glass-shine 10s infinite',
        pointerEvents: 'none'
      }} />
    )}
   <BookOpen size={14} className="sm:w-4 sm:h-4" style={{ color: isDarkTheme ? 'rgba(180,165,215,0.85)' : 'rgba(201,168,76,0.85)', position: 'relative', zIndex: 1 }} />
    <span className="hidden sm:inline" style={{ position: 'relative', zIndex: 1 }}>Прочтений: </span>
    <span style={{ position: 'relative', zIndex: 1 }}>{viewCount.toLocaleString()}</span>
  </div>
  
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes orbit1 {
      0% { transform: rotate(0deg) translateX(35px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
    }
    @keyframes orbit2 {
      0% { transform: rotate(0deg) translateX(28px) rotate(0deg); }
      100% { transform: rotate(-360deg) translateX(28px) rotate(360deg); }
    }
    @keyframes glass-shine {
      0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }
.orbit-particle-green {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #7f85db;
      border-radius: 50%;
      box-shadow: 0 0 10px #7f85db;
      pointer-events: none;
    }
    .orbit-particle-green:nth-child(1) {
      animation: orbit1 3s linear infinite;
    }
    .orbit-particle-green:nth-child(2) {
      animation: orbit2 2.5s linear infinite;
    }
    .orbit-particle-purple {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #9333ea;
      border-radius: 50%;
      box-shadow: 0 0 10px #9333ea;
      pointer-events: none;
    }
    .orbit-particle-purple:nth-child(1) {
      animation: orbit1 3s linear infinite;
    }
    .orbit-particle-purple:nth-child(2) {
      animation: orbit2 2.5s linear infinite;
    }
    .orbit-particle-pink {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #ef01cb;
      border-radius: 50%;
      box-shadow: 0 0 10px #ef01cb;
      pointer-events: none;
    }
    .orbit-particle-pink:nth-child(1) {
      animation: orbit1 3s linear infinite;
    }
    .orbit-particle-pink:nth-child(2) {
      animation: orbit2 2.5s linear infinite;
    }
    .orbit-particle-cyan {
      position: absolute;
      width: 6px;
      height: 6px;
      background: #b3e7ef;
      border-radius: 50%;
      box-shadow: 0 0 10px #b3e7ef;
      pointer-events: none;
    }
    .orbit-particle-cyan:nth-child(1) {
      animation: orbit1 3s linear infinite;
    }
    .orbit-particle-cyan:nth-child(2) {
      animation: orbit2 2.5s linear infinite;
    }
  `}} />

  {/* Кнопка Оценка */}
  <button
    onClick={() => setShowRatingModal(true)}
    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition cursor-pointer relative"
    style={{
      background: isDarkTheme
        ? 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)'
        : 'rgba(255, 255, 255, 0.1)',
      border: isDarkTheme ? '2px solid #7526be' : 'none',
      borderRadius: isDarkTheme ? '50px' : '0',
      color: isDarkTheme ? 'rgba(200,185,225,0.8)' : 'rgba(201,168,76,0.8)',
      boxShadow: isDarkTheme ? '0 0 20px rgba(147, 51, 234, 0.5), inset 0 0 20px rgba(147, 51, 234, 0.3)' : '0 4px 15px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      overflow: 'visible',
      clipPath: isDarkTheme ? 'none' : 'polygon(5% 0%, 15% 2%, 30% 0%, 45% 3%, 60% 0%, 75% 2%, 90% 0%, 100% 5%, 98% 20%, 100% 35%, 97% 50%, 100% 65%, 98% 80%, 100% 95%, 95% 100%, 85% 98%, 70% 100%, 55% 97%, 40% 100%, 25% 98%, 10% 100%, 0% 95%, 2% 80%, 0% 65%, 3% 50%, 0% 35%, 2% 20%, 0% 5%)'
    }}
    onMouseEnter={(e) => {
      if (isDarkTheme) {
        e.currentTarget.style.boxShadow = '0 0 30px rgba(147, 51, 234, 0.8), inset 0 0 30px rgba(147, 51, 234, 0.5)';
      } else {
        e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)';
      }
    }}
    onMouseLeave={(e) => {
      if (isDarkTheme) {
        e.currentTarget.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.5), inset 0 0 20px rgba(147, 51, 234, 0.3)';
      } else {
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
      }
    }}
  >
    {isDarkTheme && (
      <>
        <div className="orbit-particle-purple"></div>
        <div className="orbit-particle-purple"></div>
      </>
    )}
    {!isDarkTheme && (
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(90deg, transparent, rgba(114, 108, 110, 0.23), transparent)',
        animation: 'glass-shine 10s infinite',
        pointerEvents: 'none'
      }} />
    )}
    <Star 
      size={14} 
      className="sm:w-4 sm:h-4" 
      fill={userRating ? '#FFFFFF' : 'none'} 
      stroke={isDarkTheme ? 'rgba(180,165,215,0.85)' : 'rgba(201,168,76,0.85)'}
      style={{ position: 'relative', zIndex: 1 }} 
    />
    <span className="hidden sm:inline" style={{ position: 'relative', zIndex: 1 }}>Оценка: {averageRating > 0 ? averageRating.toFixed(1) : '—'}</span>
  </button>

  {/* Кнопка В избранное */}
  <button
    onClick={toggleFavorite}
    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition cursor-pointer relative"
    style={{
      background: isDarkTheme
        ? 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)'
        : 'rgba(255, 255, 255, 0.1)',
      border: isDarkTheme ? '2px solid #ef01cb' : 'none',
      borderRadius: isDarkTheme ? '50px' : '0',
      color: isDarkTheme ? 'rgba(200,185,225,0.8)' : 'rgba(201,168,76,0.8)',
      boxShadow: isDarkTheme ? '0 0 20px rgba(239, 1, 203, 0.5), inset 0 0 20px rgba(239, 1, 203, 0.3)' : '0 4px 15px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      overflow: 'visible',
      clipPath: isDarkTheme ? 'none' : 'polygon(5% 0%, 15% 2%, 30% 0%, 45% 3%, 60% 0%, 75% 2%, 90% 0%, 100% 5%, 98% 20%, 100% 35%, 97% 50%, 100% 65%, 98% 80%, 100% 95%, 95% 100%, 85% 98%, 70% 100%, 55% 97%, 40% 100%, 25% 98%, 10% 100%, 0% 95%, 2% 80%, 0% 65%, 3% 50%, 0% 35%, 2% 20%, 0% 5%)'
    }}
    onMouseEnter={(e) => {
      if (isDarkTheme) {
        e.currentTarget.style.boxShadow = '0 0 30px rgba(239, 1, 203, 0.8), inset 0 0 30px rgba(239, 1, 203, 0.5)';
      } else {
        e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)';
      }
    }}
    onMouseLeave={(e) => {
      if (isDarkTheme) {
        e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 1, 203, 0.5), inset 0 0 20px rgba(239, 1, 203, 0.3)';
      } else {
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
      }
    }}
  >
    {isDarkTheme && (
      <>
        <div className="orbit-particle-pink"></div>
        <div className="orbit-particle-pink"></div>
      </>
    )}
    {!isDarkTheme && (
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(90deg, transparent, rgba(114, 108, 110, 0.23), transparent)',
        animation: 'glass-shine 10s infinite',
        pointerEvents: 'none'
      }} />
    )}
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      className="sm:w-4 sm:h-4" 
      fill={isFavorited ? '#FFFFFF' : 'none'} 
      stroke={isDarkTheme ? 'rgba(180,165,215,0.85)' : 'rgba(201,168,76,0.85)'}
      strokeWidth="2" 
      style={{ position: 'relative', zIndex: 1 }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    <span className="hidden sm:inline" style={{ position: 'relative', zIndex: 1 }}>{isFavorited ? 'В избранном' : 'В избранное'}</span>
  </button>

  {/* Кнопка Обсуждение */}
  <Link
    href={`/work/${workId}/discussion`}
    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition cursor-pointer relative"
    style={{
      background: isDarkTheme
        ? 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)'
        : 'rgba(255, 255, 255, 0.1)',
      border: isDarkTheme ? '2px solid #b3e7ef' : 'none',
      borderRadius: isDarkTheme ? '50px' : '0',
      color: isDarkTheme ? 'rgba(200,185,225,0.8)' : 'rgba(201,168,76,0.8)',
      boxShadow: isDarkTheme ? '0 0 20px rgba(179, 231, 239, 0.5), inset 0 0 20px rgba(179, 231, 239, 0.3)' : '0 4px 15px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      overflow: 'visible',
      clipPath: isDarkTheme ? 'none' : 'polygon(5% 0%, 15% 2%, 30% 0%, 45% 3%, 60% 0%, 75% 2%, 90% 0%, 100% 5%, 98% 20%, 100% 35%, 97% 50%, 100% 65%, 98% 80%, 100% 95%, 95% 100%, 85% 98%, 70% 100%, 55% 97%, 40% 100%, 25% 98%, 10% 100%, 0% 95%, 2% 80%, 0% 65%, 3% 50%, 0% 35%, 2% 20%, 0% 5%)'
    }}
    onMouseEnter={(e) => {
      if (isDarkTheme) {
        e.currentTarget.style.boxShadow = '0 0 30px rgba(179, 231, 239, 0.8), inset 0 0 30px rgba(179, 231, 239, 0.5)';
      } else {
        e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.3)';
      }
    }}
    onMouseLeave={(e) => {
      if (isDarkTheme) {
        e.currentTarget.style.boxShadow = '0 0 20px rgba(179, 231, 239, 0.5), inset 0 0 20px rgba(179, 231, 239, 0.3)';
      } else {
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
      }
    }}
  >
    {isDarkTheme && (
      <>
        <div className="orbit-particle-cyan"></div>
        <div className="orbit-particle-cyan"></div>
      </>
    )}
    {!isDarkTheme && (
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(90deg, transparent, rgba(114, 108, 110, 0.23), transparent)',
        animation: 'glass-shine 10s infinite',
        pointerEvents: 'none'
      }} />
    )}
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      className="sm:w-4 sm:h-4" 
      fill="none" 
      stroke={isDarkTheme ? 'rgba(180,165,215,0.85)' : 'rgba(201,168,76,0.85)'}
      strokeWidth="2" 
      style={{ position: 'relative', zIndex: 1 }}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span className="hidden sm:inline" style={{ position: 'relative', zIndex: 1 }}>Обсуждение</span>
  </Link>
</div>

{/* ОПИСАНИЕ */}
<div style={{marginBottom:'28px',position:'relative'}}>
  {isDarkTheme ? (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes descLineFlow {
          0%{background-position:-200% center;}
          100%{background-position:200% center;}
        }
      `}}/>
      {/* Тонкая верхняя линия с точкой */}
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.3))'}}/>
        <span style={{color:'rgba(179,231,239,0.25)',fontSize:'0.5rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
        <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.3))'}}/>
      </div>

      <h2 style={{
        fontFamily:'Cinzel, Georgia, serif',
fontSize:'1rem',
letterSpacing:'5px',
        textTransform:'uppercase',
        color:'rgba(180,100,255,0.4)',
        marginBottom:'16px',
        textAlign:'center'
      }}>Описание</h2>

      <p style={{
        fontSize:'0.9rem',
        color:'rgba(210,200,230,0.8)',
        fontFamily:'Georgia, serif',
        fontStyle:'italic',
        lineHeight:'1.9',
        whiteSpace:'pre-wrap',
        wordBreak:'break-word',
        textAlign:'justify'
      }}>{work.description}</p>

      <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'20px'}}>
        <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.15))'}}/>
        <span style={{color:'rgba(147,112,219,0.15)',fontSize:'0.45rem',letterSpacing:'8px'}}>· · · · · · ·</span>
        <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.15))'}}/>
      </div>
    </>
  ) : (
    <>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.35))'}}/>
        <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'5px',fontFamily:'serif'}}>⚜ · · ⚜</span>
        <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.35))'}}/>
      </div>

      <h2 style={{
        fontFamily:'Cinzel, Georgia, serif',
fontSize:'0.95rem',
letterSpacing:'5px',
        textTransform:'uppercase',
        color:'rgba(201,168,76,0.4)',
        marginBottom:'16px',
        textAlign:'center'
      }}>Описание</h2>

      <p style={{
        fontSize:'0.9rem',
        color:'rgba(201,168,76,0.65)',
        fontFamily:'Georgia, serif',
        fontStyle:'italic',
        lineHeight:'1.9',
        whiteSpace:'pre-wrap',
        wordBreak:'break-word',
        textAlign:'justify'
      }}>{work.description}</p>

      <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'20px'}}>
        <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.15))'}}/>
        <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'5px',fontFamily:'serif'}}>· · ⚜ · ·</span>
        <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.15))'}}/>
      </div>
    </>
  )}
</div>

{/* ПРИМЕЧАНИЕ АВТОРА */}
{work.author_note && work.author_note.trim() && (
  <div style={{marginBottom:'28px',position:'relative'}}>
    {isDarkTheme ? (
      <>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
          <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.3))'}}/>
          <span style={{color:'rgba(179,231,239,0.25)',fontSize:'0.5rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
          <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.3))'}}/>
        </div>

        <h2 style={{
          fontFamily:'Cinzel, Georgia, serif',
          fontSize:'0.65rem',
          letterSpacing:'6px',
          textTransform:'uppercase',
          color:'rgba(180,100,255,0.4)',
          marginBottom:'16px',
          textAlign:'center'
        }}>Примечание автора</h2>

        <p style={{
          fontSize:'0.9rem',
          color:'rgba(210,200,230,0.8)',
          fontFamily:'Georgia, serif',
          fontStyle:'italic',
          lineHeight:'1.9',
          whiteSpace:'pre-wrap',
          wordBreak:'break-word',
          textAlign:'justify'
        }}>{work.author_note}</p>

        <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'20px'}}>
          <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.15))'}}/>
          <span style={{color:'rgba(147,112,219,0.15)',fontSize:'0.45rem',letterSpacing:'8px'}}>· · · · · · ·</span>
          <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.15))'}}/>
        </div>
      </>
    ) : (
      <>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
          <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.35))'}}/>
          <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'5px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.35))'}}/>
        </div>

        <h2 style={{
          fontFamily:'Cinzel, Georgia, serif',
          fontSize:'0.6rem',
          letterSpacing:'6px',
          textTransform:'uppercase',
          color:'rgba(201,168,76,0.4)',
          marginBottom:'16px',
          textAlign:'center'
        }}>Примечание автора</h2>

        <p style={{
          fontSize:'0.9rem',
          color:'rgba(201,168,76,0.65)',
          fontFamily:'Georgia, serif',
          fontStyle:'italic',
          lineHeight:'1.9',
          whiteSpace:'pre-wrap',
          wordBreak:'break-word',
          textAlign:'justify'
        }}>{work.author_note}</p>

        <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'20px'}}>
          <div style={{flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.15))'}}/>
          <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'5px',fontFamily:'serif'}}>· · ⚜ · ·</span>
          <div style={{flex:1,height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.15))'}}/>
        </div>
      </>
    )}
  </div>
)}

{work.character_profile_links && work.character_profile_links.length > 0 && (
  <div style={{marginBottom:'28px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'16px'}}>
      <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))':'linear-gradient(90deg,transparent,rgba(201,168,76,0.4))'}}/>
      <span style={{color:isDarkTheme?'rgba(179,231,239,0.3)':'rgba(201,168,76,0.4)',fontSize:'0.65rem',letterSpacing:'6px',fontFamily:'serif'}}>
        {isDarkTheme?'✦ · · · ✦':'⚜ · · ⚜'}
      </span>
      <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))':'linear-gradient(270deg,transparent,rgba(201,168,76,0.4))'}}/>
    </div>
    <h2 style={{
      fontFamily:'Cinzel, Georgia, serif',
      fontSize:'clamp(0.7rem,1.5vw,0.85rem)',
      letterSpacing:'6px',
      textTransform:'uppercase',
      color:isDarkTheme?'rgba(180,100,255,0.5)':'rgba(201,168,76,0.5)',
      textAlign:'center',
      marginBottom:'20px'
    }}>Анкеты персонажей</h2>

    <div style={{display:'flex',gap:'10px',flexWrap:'wrap',justifyContent:'center'}}>
      {work.character_profile_links.map((link, index) => (
        <a key={index} href={link} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
          <div
            style={{
              display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',
              padding:'14px 18px',
              background:isDarkTheme?'rgba(147,112,219,0.06)':'rgba(201,168,76,0.06)',
              border:isDarkTheme?'1px solid rgba(147,112,219,0.2)':'1px solid rgba(201,168,76,0.2)',
              borderRadius:isDarkTheme?'4px':'2px',
              transition:'all 0.25s',
              minWidth:'80px',
              cursor:'pointer'
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.14)':'rgba(201,168,76,0.1)';
              e.currentTarget.style.borderColor=isDarkTheme?'rgba(180,100,255,0.5)':'rgba(201,168,76,0.5)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.06)':'rgba(201,168,76,0.06)';
              e.currentTarget.style.borderColor=isDarkTheme?'rgba(147,112,219,0.2)':'rgba(201,168,76,0.2)';
            }}
          >
            <span style={{fontFamily:'serif',fontSize:'1.1rem',color:isDarkTheme?'rgba(180,100,255,0.5)':'rgba(201,168,76,0.5)'}}>
              {isDarkTheme?'✦':'⚜'}
            </span>
            {work.character_profile_labels && work.character_profile_labels[index] && (
              <span style={{
                fontFamily:'Cinzel, Georgia, serif',
                fontSize:'0.55rem',
                letterSpacing:'2px',
                textTransform:'uppercase',
                color:isDarkTheme?'rgba(200,185,230,0.6)':'rgba(201,168,76,0.6)',
                textAlign:'center',
                maxWidth:'80px',
                lineHeight:'1.4'
              }}>{work.character_profile_labels[index]}</span>
            )}
          </div>
        </a>
      ))}
    </div>

    <div style={{display:'flex',alignItems:'center',gap:'14px',marginTop:'20px'}}>
      <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(90deg,transparent,rgba(147,112,219,0.2))':'linear-gradient(90deg,transparent,rgba(201,168,76,0.2))'}}/>
      <span style={{color:isDarkTheme?'rgba(147,112,219,0.2)':'rgba(201,168,76,0.2)',fontSize:'0.5rem',letterSpacing:'6px',fontFamily:'serif'}}>
        {isDarkTheme?'· · · · · · ·':'· · ⚜ · ·'}
      </span>
      <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(270deg,transparent,rgba(147,112,219,0.2))':'linear-gradient(270deg,transparent,rgba(201,168,76,0.2))'}}/>
    </div>
  </div>
)}

            {/* ИЗОБРАЖЕНИЯ ПЕРСОНАЖЕЙ */}
            {characterImagesArray.length > 0 && (
              <div className="mb-4 sm:mb-6">
<div style={{marginBottom:'16px'}}>
  <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'12px'}}>
    <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))':'linear-gradient(90deg,transparent,rgba(201,168,76,0.4))'}}/>
    <span style={{color:isDarkTheme?'rgba(179,231,239,0.3)':'rgba(201,168,76,0.4)',fontSize:'0.65rem',letterSpacing:'6px',fontFamily:'serif'}}>
      {isDarkTheme?'✦ · · · ✦':'⚜ · · ⚜'}
    </span>
    <div style={{flex:1,height:'1px',background:isDarkTheme?'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))':'linear-gradient(270deg,transparent,rgba(201,168,76,0.4))'}}/>
  </div>
  <h2 style={{
    fontFamily:'Cinzel, Georgia, serif',
    fontSize:'clamp(0.7rem,1.5vw,0.85rem)',
    letterSpacing:'6px',
    textTransform:'uppercase',
    color:isDarkTheme?'rgba(180,100,255,0.5)':'rgba(201,168,76,0.5)',
    textAlign:'center',
    margin:0
  }}>Галерея</h2>
</div>
                
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
    borderColor: isDarkTheme ? 'rgba(180,100,255,0.5)' : 'rgba(201,168,76,0.45)',
    }}
    onClick={() => setSelectedImage(img)}
                      >
                        <img 
  src={img} 
  alt={`Character ${index + 1}`} 
  className="w-full h-full object-cover" 
  loading="lazy"
  crossOrigin="anonymous"
  onError={(e) => {
    console.error('Failed to load image:', img);
    e.target.style.backgroundColor = '#1a1a1a';
    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500 text-sm">Изображение недоступно</div>';
  }}
/>
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
    fill={savedImages.includes(img) ? (isDarkTheme ? '#ef01cb' : '#474746') : 'none'}
    stroke={isDarkTheme 
      ? (savedImages.includes(img) ? '#7a7967' : '#ef01cb')
      : '#c5c5c5'}
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
      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 hidden sm:flex items-center justify-center"
      style={{
        background: isDarkTheme ? 'rgba(20,0,40,0.7)' : 'rgba(0,0,0,0.6)',
        border: isDarkTheme ? '1px solid rgba(180,100,255,0.4)' : '1px solid rgba(201,168,76,0.4)',
        borderRadius: '50%', width:'36px', height:'36px',
        cursor:'pointer', boxShadow: isDarkTheme ? '0 0 12px rgba(147,50,255,0.4)' : '0 0 12px rgba(201,168,76,0.3)',
        color: isDarkTheme ? 'rgba(180,100,255,0.8)' : 'rgba(201,168,76,0.8)',
        transition:'all 0.2s'
      }}
      onMouseEnter={e=>{
        e.currentTarget.style.color = isDarkTheme ? '#d8b4fe' : '#f0d080';
        e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 20px rgba(147,50,255,0.7)' : '0 0 20px rgba(201,168,76,0.6)';
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.color = isDarkTheme ? 'rgba(180,100,255,0.8)' : 'rgba(201,168,76,0.8)';
        e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 12px rgba(147,50,255,0.4)' : '0 0 12px rgba(201,168,76,0.3)';
      }}
    >
      <ChevronLeft size={20}/>
    </button>

    <button
      onClick={() => scrollCharacterCarousel('right')}
      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 hidden sm:flex items-center justify-center"
      style={{
        background: isDarkTheme ? 'rgba(20,0,40,0.7)' : 'rgba(0,0,0,0.6)',
        border: isDarkTheme ? '1px solid rgba(180,100,255,0.4)' : '1px solid rgba(201,168,76,0.4)',
        borderRadius: '50%', width:'36px', height:'36px',
        cursor:'pointer', boxShadow: isDarkTheme ? '0 0 12px rgba(147,50,255,0.4)' : '0 0 12px rgba(201,168,76,0.3)',
        color: isDarkTheme ? 'rgba(180,100,255,0.8)' : 'rgba(201,168,76,0.8)',
        transition:'all 0.2s'
      }}
      onMouseEnter={e=>{
        e.currentTarget.style.color = isDarkTheme ? '#d8b4fe' : '#f0d080';
        e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 20px rgba(147,50,255,0.7)' : '0 0 20px rgba(201,168,76,0.6)';
      }}
      onMouseLeave={e=>{
        e.currentTarget.style.color = isDarkTheme ? 'rgba(180,100,255,0.8)' : 'rgba(201,168,76,0.8)';
        e.currentTarget.style.boxShadow = isDarkTheme ? '0 0 12px rgba(147,50,255,0.4)' : '0 0 12px rgba(201,168,76,0.3)';
      }}
    >
      <ChevronRight size={20}/>
    </button>
  </>
)}
                </div>
              </div>
            )}
          </div>
        </div>

{/* СОДЕРЖАНИЕ */}
<div style={{marginBottom:'32px'}}>

  {/* ЗАГОЛОВОК */}
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'32px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'14px',width:'100%'}}>
      <div style={{flex:1,height:'1px',background: isDarkTheme ? 'linear-gradient(90deg,transparent,rgba(147,112,219,0.5))' : 'linear-gradient(90deg,transparent,rgba(201,168,76,0.5))'}}/>
      <span style={{color: isDarkTheme ? 'rgba(179,231,239,0.3)' : 'rgba(201,168,76,0.4)', fontSize:'0.7rem', letterSpacing:'8px', fontFamily:'serif'}}>
        {isDarkTheme ? '✦ · · · ✦' : '⚜ · · ⚜'}
      </span>
      <div style={{flex:1,height:'1px',background: isDarkTheme ? 'linear-gradient(270deg,transparent,rgba(147,112,219,0.5))' : 'linear-gradient(270deg,transparent,rgba(201,168,76,0.5))'}}/>
    </div>
    <h2 style={{
      fontFamily:'Cinzel, Georgia, serif',
      fontSize:'clamp(1rem,2.5vw,1.4rem)',
      letterSpacing:'8px',
      textTransform:'uppercase',
      color: isDarkTheme ? 'rgba(180,100,255,0.6)' : 'rgba(201,168,76,0.6)',
      margin:0,
      textAlign:'center'
    }}>Содержание</h2>
    <div style={{display:'flex',alignItems:'center',gap:'16px',marginTop:'14px',width:'100%'}}>
      <div style={{flex:1,height:'1px',background: isDarkTheme ? 'linear-gradient(90deg,transparent,rgba(147,112,219,0.25))' : 'linear-gradient(90deg,transparent,rgba(201,168,76,0.25))'}}/>
      <span style={{color: isDarkTheme ? 'rgba(147,112,219,0.25)' : 'rgba(201,168,76,0.25)', fontSize:'0.5rem', letterSpacing:'6px', fontFamily:'serif'}}>
        {isDarkTheme ? '· · · · · · ·' : '· · ⚜ · ·'}
      </span>
      <div style={{flex:1,height:'1px',background: isDarkTheme ? 'linear-gradient(270deg,transparent,rgba(147,112,219,0.25))' : 'linear-gradient(270deg,transparent,rgba(201,168,76,0.25))'}}/>
    </div>
  </div>

  {/* ГЛАВЫ */}
  {chapters.length === 0 ? (
    <p style={{
      textAlign:'center', padding:'32px 0',
      color: isDarkTheme ? 'rgba(180,100,255,0.4)' : 'rgba(201,168,76,0.4)',
      fontFamily:'Georgia, serif', fontStyle:'italic', fontSize:'1rem'
    }}>Главы ещё не добавлены</p>
  ) : (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        .chapter-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid ${isDarkTheme ? 'rgba(147,112,219,0.1)' : 'rgba(201,168,76,0.12)'};
          text-decoration: none;
          transition: all 0.25s;
          position: relative;
        }
        .chapter-link:last-child { border-bottom: none; }
        .chapter-link:hover .ch-num { color: ${isDarkTheme ? 'rgba(180,100,255,0.8)' : 'rgba(201,168,76,0.8)'}; }
        .chapter-link:hover .ch-title { color: ${isDarkTheme ? 'rgba(235,220,255,1)' : 'rgba(201,168,76,1)'}; }
        .chapter-link:hover .ch-arrow { opacity: 1; transform: translateX(5px); }
        .ch-left { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        .ch-num {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 0.65rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: ${isDarkTheme ? 'rgba(180,100,255,0.5)' : 'rgba(201,168,76,0.5)'};
          transition: color 0.25s;
        }
        .ch-title {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          color: ${isDarkTheme ? 'rgba(220,205,245,0.88)' : 'rgba(201,168,76,0.85)'};
          transition: color 0.25s;
          line-height: 1.4;
        }
        .ch-date {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 0.55rem;
          letter-spacing: 2px;
          color: ${isDarkTheme ? 'rgba(147,112,219,0.35)' : 'rgba(201,168,76,0.3)'};
          margin-top: 2px;
        }
        .ch-arrow {
          color: ${isDarkTheme ? 'rgba(180,100,255,0.4)' : 'rgba(201,168,76,0.4)'};
          opacity: 0.5;
          transition: all 0.25s;
          flex-shrink: 0;
          margin-left: 16px;
        }
      `}}/>

      <div>
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/work/${workId}/chapter/${chapter.id}`}
            className="chapter-link"
          >
            <div className="ch-left">
              <span className="ch-num">Глава {chapter.chapter_number}</span>
              <span className="ch-title">{chapter.title}</span>
              <span className="ch-date">
                {new Date(chapter.created_at).toLocaleDateString('ru-RU', {
                  day:'2-digit', month:'long', year:'numeric'
                })}
              </span>
            </div>
            <svg className="ch-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>
    </>
  )}
</div>

      </main>
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

      {/* ЧИТАТЕЛЬСКАЯ ПАНЕЛЬ */}
{showReaderPanel && userProfile && (
  <>
    {isDarkTheme && (
      <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-30 overflow-y-auto shadow-2xl" style={{
        background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
        borderLeft:'1px solid rgba(180,100,255,0.25)',
        boxShadow:'-5px 0 60px rgba(147,50,255,0.15)'
      }}>
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes rpTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.55;}}
          @keyframes rpShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
          .rp-dark-scroll::-webkit-scrollbar{width:4px;}
          .rp-dark-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
          .rp-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
          .rp-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
          .rp-btn-dark{transition:all 0.2s;}
          .rp-btn-dark:hover{border-color:rgba(179,231,239,0.8)!important;box-shadow:0 0 20px rgba(179,231,239,0.4)!important;transform:translateY(-2px);}
        `}}/>

        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
          background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>

        <div style={{position:'fixed',top:0,right:0,width:'inherit',height:'100%',pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.35) 0%,transparent 100%),
            radial-gradient(1px 1px at 80% 8%,rgba(255,255,255,0.25) 0%,transparent 100%),
            radial-gradient(1px 1px at 55% 70%,rgba(255,255,255,0.2) 0%,transparent 100%),
            radial-gradient(1px 1px at 90% 55%,rgba(255,255,255,0.15) 0%,transparent 100%),
            radial-gradient(1px 1px at 20% 90%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
          animation:'rpTwinkle 6s ease-in-out infinite',zIndex:0}}/>

        <div style={{
          padding:'clamp(16px,3vw,24px) clamp(14px,3vw,22px)',
          paddingBottom:'clamp(12px,2vw,18px)',
          borderBottom:'1px solid rgba(147,112,219,0.15)',
          position:'relative',zIndex:2,
          background:'rgba(147,50,255,0.08)'
        }}>
          <button onClick={()=>setShowReaderPanel(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
            borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
            color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'14px',zIndex:10
          }}>✕</button>

          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'clamp(0.8rem,2vw,1rem)',color:'rgba(180,100,255,0.4)',marginBottom:'8px'}}>✦</div>
            <div style={{
              fontFamily:'ppelganger, Georgia, serif',
              fontSize:'clamp(1.6rem,5vw,2.8rem)',
              background:'linear-gradient(90deg,#b3e7ef 0%,#ef01cb 50%,#9370db 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              animation:'rpShimmer 3s linear infinite',
              marginBottom:'10px',lineHeight:'1.2'
            }}>{userProfile.nickname}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
              <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
              <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
            </div>
          </div>
        </div>

        <div className="rp-dark-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)',position:'relative',zIndex:1}}>

          <button onClick={()=>{setShowUpdatesModal(true);loadSiteUpdates();}} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:siteUpdates.length>0?'rgba(239,1,203,0.12)':'rgba(147,112,219,0.08)',
            border:siteUpdates.length>0?'1px solid rgba(239,1,203,0.5)':'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
            boxShadow:siteUpdates.length>0?'0 0 15px rgba(239,1,203,0.2)':'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={siteUpdates.length>0?'#ef01cb':'#9370db'} strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:siteUpdates.length>0?'#ef01cb':'rgba(200,185,230,0.7)'}}>Обновления</span>
          </button>

          <Link href="/collection" className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9370db" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(200,185,230,0.7)'}}>Моя коллекция</span>
          </Link>

          <Link href="/my-messages" className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9370db" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(200,185,230,0.7)'}}>Мои сообщения</span>
          </Link>

          <button onClick={()=>setShowManagementModal(true)} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9370db" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(200,185,230,0.7)'}}>Настройки</span>
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'2px 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
            <span style={{color:'rgba(180,100,255,0.25)',fontSize:'0.5rem',letterSpacing:'3px'}}>✦ · · · ✦</span>
            <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
          </div>

          <button onClick={handleLogout} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.05)',border:'1px solid rgba(147,112,219,0.15)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(147,112,219,0.5)" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(180,100,255,0.4)'}}>Выход</span>
          </button>

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

    {!isDarkTheme && (
      <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-30 overflow-y-auto shadow-2xl" style={{
        background:'#080808',
        borderLeft:'1px solid #2a2218',
        boxShadow:'-5px 0 40px rgba(0,0,0,0.8)'
      }}>
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes rpGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
          .rp-light-scroll::-webkit-scrollbar{width:4px;}
          .rp-light-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
          .rp-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
          .rp-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
          .rp-btn-light{transition:all 0.2s;}
          .rp-btn-light:hover{border-color:rgba(201,168,76,0.5)!important;background:rgba(201,168,76,0.06)!important;}
        `}}/>

        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
          background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>

        <div style={{position:'fixed',top:'50%',right:'5px',transform:'translateY(-50%)',
          fontFamily:'serif',fontSize:'clamp(8rem,20vw,14rem)',color:'rgba(201,168,76,0.025)',
          pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

        <div style={{
          padding:'clamp(16px,3vw,26px) clamp(18px,4vw,28px)',
          paddingBottom:'clamp(12px,2vw,18px)',
          borderBottom:'1px solid rgba(201,168,76,0.1)',
          position:'relative',zIndex:2
        }}>
          <button onClick={()=>setShowReaderPanel(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
            borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
            color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'14px',zIndex:10
          }}>✕</button>

          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.6rem,5vw,2.8rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'rpGold 4s linear infinite',letterSpacing:'3px',marginBottom:'10px',lineHeight:'1.2'}}>
            {userProfile.nickname}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>

        <div className="rp-light-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)',position:'relative',zIndex:1}}>

          <button onClick={()=>{setShowUpdatesModal(true);loadSiteUpdates();}} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:siteUpdates.length>0?'rgba(201,168,76,0.1)':'transparent',
            border:siteUpdates.length>0?'1px solid rgba(201,168,76,0.55)':'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={siteUpdates.length>0?'#c9a84c':'rgba(201,168,76,0.45)'} strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:siteUpdates.length>0?'#c9a84c':'rgba(201,168,76,0.5)'}}>Обновления</span>
          </button>

          <Link href="/collection" className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.5)'}}>Моя коллекция</span>
          </Link>

          <Link href="/my-messages" className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.5)'}}>Мои сообщения</span>
          </Link>

          <button onClick={()=>setShowManagementModal(true)} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.5)'}}>Настройки</span>
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'2px 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
            <span style={{color:'rgba(201,168,76,0.25)',fontSize:'0.55rem',letterSpacing:'3px',fontFamily:'serif'}}>· ⚜ ·</span>
            <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
          </div>

          <button onClick={handleLogout} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.1)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.3)'}}>Выход</span>
          </button>

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


{/* UPDATES MODAL */}
{showUpdatesModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes updTwinkle{0%,100%{opacity:0.1;}50%{opacity:0.5;}}
      @keyframes updGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .upd-dark-scroll::-webkit-scrollbar{width:4px;}
      .upd-dark-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .upd-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .upd-light-scroll::-webkit-scrollbar{width:4px;}
      .upd-light-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .upd-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .upd-card-dark:hover{border-color:#ef01cb !important;box-shadow:0 0 20px rgba(239,1,203,0.4) !important;}
      .upd-card-light:hover{border-color:rgba(201,168,76,0.5) !important;background:rgba(201,168,76,0.06) !important;}
    `}}/>

    {isDarkTheme ? (
      <div style={{
        background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
        border:'1px solid rgba(180,100,255,0.25)',
        boxShadow:'0 0 60px rgba(147,50,255,0.15)',
        borderRadius:'14px',
        width:'92vw',maxWidth:'560px',
        maxHeight:'min(88vh,640px)',
        display:'flex',flexDirection:'column',
        position:'relative',overflow:'hidden'
      }}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
          background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 5% 10%,rgba(255,255,255,0.3) 0%,transparent 100%),
            radial-gradient(1px 1px at 90% 8%,rgba(255,255,255,0.25) 0%,transparent 100%),
            radial-gradient(1px 1px at 70% 90%,rgba(255,255,255,0.2) 0%,transparent 100%),
            radial-gradient(1px 1px at 15% 85%,rgba(255,255,255,0.15) 0%,transparent 100%)`,
          animation:'updTwinkle 6s ease-in-out infinite',zIndex:0}}/>
        <div style={{padding:'20px 22px 14px',borderBottom:'1px solid rgba(147,112,219,0.15)',position:'relative',zIndex:2,flexShrink:0}}>
          <button onClick={()=>setShowUpdatesModal(false)} style={{position:'absolute',top:'12px',right:'12px',background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',zIndex:10}}>✕</button>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'1.1rem',color:'rgba(180,100,255,0.4)',marginBottom:'4px'}}>✦</div>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'1rem',letterSpacing:'5px',background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Обновления</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'6px'}}>
              <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
              <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
              <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
            </div>
          </div>
        </div>
        <div className="upd-dark-scroll" style={{overflowY:'auto',padding:'16px 18px',position:'relative',zIndex:1,flex:1}}>
          {siteUpdates.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 20px',background:'rgba(147,112,219,0.05)',border:'1px solid rgba(147,112,219,0.15)',borderRadius:'8px'}}>
              <div style={{fontSize:'1.8rem',marginBottom:'8px',opacity:0.3}}>✦</div>
              <p style={{color:'rgba(180,100,255,0.4)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.85rem'}}>Пока нет обновлений</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {siteUpdates.map((update)=>(
                <div key={update.id} className="upd-card-dark"
                  onClick={()=>{loadSiteUpdates();if(update.work_id===workId){setShowUpdatesModal(false);}else{window.location.href=`/work/${update.work_id}`;}}}
                  style={{background:'rgba(0,0,0,0.4)',border:update.type==='new_work'?'1px solid rgba(239,1,203,0.4)':'1px solid rgba(147,112,219,0.2)',borderRadius:'8px',padding:'12px 14px',cursor:'pointer',boxShadow:update.type==='new_work'?'0 0 12px rgba(239,1,203,0.15)':'none',transition:'all 0.2s'}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={update.type==='new_work'?'#ef01cb':'#9370db'} style={{flexShrink:0,marginTop:'2px',filter:`drop-shadow(0 0 4px ${update.type==='new_work'?'rgba(239,1,203,0.6)':'rgba(147,112,219,0.5)'})`}}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                    <div style={{flex:1,minWidth:0}}>
                      {update.type==='new_work'?(
                        <>
                          <span style={{display:'inline-block',background:'linear-gradient(135deg,#ef01cb,#bc0897)',color:'#fff',fontSize:'0.55rem',fontFamily:'Cinzel,serif',letterSpacing:'2px',padding:'2px 8px',borderRadius:'2px',marginBottom:'6px',boxShadow:'0 0 10px rgba(239,1,203,0.6)'}}>НОВАЯ РАБОТА</span>
                          <p style={{color:'#e8d5ff',fontFamily:'Georgia,serif',fontSize:'0.9rem',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                          <p style={{color:'rgba(180,100,255,0.4)',fontSize:'0.65rem',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</p>
                        </>
                      ):(
                        <>
                          <p style={{color:'rgba(200,185,230,0.8)',fontFamily:'Georgia,serif',fontSize:'0.88rem',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                          <p style={{color:'rgba(180,100,255,0.5)',fontSize:'0.7rem',marginBottom:'3px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{update.chapter_number} глава{update.chapter_title&&` · ${update.chapter_title}`}</p>
                          <p style={{color:'rgba(147,112,219,0.35)',fontSize:'0.62rem',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</p>
                        </>
                      )}
                    </div>
                    <span style={{flexShrink:0,color:'rgba(180,100,255,0.3)',fontSize:'0.7rem',alignSelf:'center'}}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ) : (
      <div style={{background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',width:'92vw',maxWidth:'560px',maxHeight:'min(88vh,640px)',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>
        <div style={{position:'absolute',bottom:'10px',right:'10px',fontFamily:'serif',fontSize:'10rem',color:'rgba(201,168,76,0.025)',pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>
        <div style={{padding:'20px 26px 14px',borderBottom:'1px solid rgba(201,168,76,0.1)',position:'relative',zIndex:2,flexShrink:0}}>
          <button onClick={()=>setShowUpdatesModal(false)} style={{position:'absolute',top:'12px',right:'12px',background:'transparent',border:'1px solid rgba(201,168,76,0.25)',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',zIndex:10}}>✕</button>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'1.8rem',backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'updGold 4s linear infinite',letterSpacing:'3px',marginBottom:'8px'}}>Обновления</div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>
        <div className="upd-light-scroll" style={{overflowY:'auto',padding:'16px 22px',position:'relative',zIndex:1,flex:1}}>
          {siteUpdates.length===0 ? (
            <div style={{textAlign:'center',padding:'40px 20px',background:'rgba(201,168,76,0.03)',border:'1px solid rgba(201,168,76,0.12)',borderRadius:'2px'}}>
              <div style={{fontSize:'1.8rem',marginBottom:'8px',color:'rgba(201,168,76,0.2)',fontFamily:'serif'}}>⚜</div>
              <p style={{color:'rgba(201,168,76,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.85rem'}}>Пока нет обновлений</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {siteUpdates.map((update)=>(
                <div key={update.id} className="upd-card-light"
                  onClick={()=>{loadSiteUpdates();if(update.work_id===workId){setShowUpdatesModal(false);}else{window.location.href=`/work/${update.work_id}`;}}}
                  style={{background:'rgba(201,168,76,0.03)',border:update.type==='new_work'?'1px solid rgba(201,168,76,0.35)':'1px solid rgba(201,168,76,0.12)',borderRadius:'2px',padding:'12px 14px',cursor:'pointer',transition:'all 0.2s',position:'relative'}}>
                  {update.type==='new_work'&&(<div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',background:'linear-gradient(180deg,transparent,#c9a84c,transparent)'}}/>)}
                  <div style={{display:'flex',alignItems:'flex-start',gap:'12px',paddingLeft:update.type==='new_work'?'8px':'0'}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(201,168,76,0.6)" style={{flexShrink:0,marginTop:'2px',filter:'drop-shadow(0 0 3px rgba(201,168,76,0.3))'}}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                    <div style={{flex:1,minWidth:0}}>
                      {update.type==='new_work'?(
                        <>
                          <span style={{display:'inline-block',background:'rgba(201,168,76,0.15)',border:'1px solid rgba(201,168,76,0.4)',color:'#c9a84c',fontSize:'0.55rem',fontFamily:'Cinzel,serif',letterSpacing:'2px',padding:'2px 8px',borderRadius:'1px',marginBottom:'6px'}}>НОВАЯ РАБОТА</span>
                          <p style={{color:'rgba(201,168,76,0.85)',fontFamily:'Georgia,serif',fontSize:'0.9rem',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                          <p style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</p>
                        </>
                      ):(
                        <>
                          <p style={{color:'rgba(201,168,76,0.7)',fontFamily:'Georgia,serif',fontSize:'0.88rem',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                          <p style={{color:'rgba(201,168,76,0.4)',fontSize:'0.68rem',marginBottom:'3px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{update.chapter_number} глава{update.chapter_title&&` · ${update.chapter_title}`}</p>
                          <p style={{color:'rgba(201,168,76,0.25)',fontSize:'0.6rem',fontFamily:'Georgia,serif',fontStyle:'italic'}}>{new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</p>
                        </>
                      )}
                    </div>
                    <span style={{flexShrink:0,color:'rgba(201,168,76,0.25)',fontSize:'0.7rem',alignSelf:'center'}}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)}


{selectedImage && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(6px)' }}
    onClick={() => setSelectedImage(null)}
    onTouchStart={(e) => { window._tX = e.touches[0].clientX; }}
    onTouchEnd={(e) => {
      const diff = window._tX - e.changedTouches[0].clientX;
      const idx = characterImagesArray.indexOf(selectedImage);
      if (Math.abs(diff) > 50) {
        if (diff > 0 && idx < characterImagesArray.length - 1) setSelectedImage(characterImagesArray[idx + 1]);
        if (diff < 0 && idx > 0) setSelectedImage(characterImagesArray[idx - 1]);
      }
    }}>
  <div className="flex flex-col items-center w-full max-w-2xl px-12"
      onClick={e => e.stopPropagation()}>

      {/* СТРЕЛКИ + ФОТО */}
      <div className="relative flex items-center justify-center w-full">
        {!isMobile && characterImagesArray.indexOf(selectedImage) > 0 && (
          <button
            onClick={() => setSelectedImage(characterImagesArray[characterImagesArray.indexOf(selectedImage) - 1])}
            style={{ position:'absolute', left:0, background:'none', border:'none', cursor:'pointer', zIndex:10,
              color: isDarkTheme ? 'rgba(180,100,255,0.7)' : 'rgba(201,168,76,0.7)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        {/* ОБЁРТКА КАРТИНКИ */}
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

          {/* КРЕСТИК НА КАРТИНКЕ */}
          <button onClick={() => setSelectedImage(null)}
            style={{ position:'absolute', top:'8px', right:'8px', zIndex:20,
              background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%',
              padding:'4px', cursor:'pointer',
              color: isDarkTheme ? '#dccbe2' : '#c9c3b2' }}>
            <X size={22}/>
          </button>

          {/* ОПИСАНИЕ ВНИЗУ КАРТИНКИ */}
          {work.character_image_descriptions && work.character_image_descriptions[characterImagesArray.indexOf(selectedImage)] && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0,
              background:'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
              padding:'32px 12px 12px' }}>
              <p style={{ textAlign:'center',
                color: isDarkTheme ? 'rgba(220,180,255,0.95)' : 'rgba(230,210,160,0.95)',
                fontStyle:'italic', fontSize:'0.9rem',
                textShadow: isDarkTheme ? '0 0 10px rgba(180,100,255,0.5)' : 'none'
              }}>
                {work.character_image_descriptions[characterImagesArray.indexOf(selectedImage)]}
              </p>
            </div>
          )}
        </div>

        {!isMobile && characterImagesArray.indexOf(selectedImage) < characterImagesArray.length - 1 && (
          <button
            onClick={() => setSelectedImage(characterImagesArray[characterImagesArray.indexOf(selectedImage) + 1])}
            style={{ position:'absolute', right:0, background:'none', border:'none', cursor:'pointer', zIndex:10,
              color: isDarkTheme ? 'rgba(180,100,255,0.7)' : 'rgba(201,168,76,0.7)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* ТОЧКИ */}
      {characterImagesArray.length > 1 && (
        <div style={{ display:'flex', gap:'6px', marginTop:'12px' }}>
          {characterImagesArray.map((img, i) => (
            <div key={i} onClick={() => setSelectedImage(characterImagesArray[i])}
              style={{
                width: characterImagesArray.indexOf(selectedImage) === i ? '18px' : '7px',
                height:'7px', borderRadius:'4px', cursor:'pointer',
                background: characterImagesArray.indexOf(selectedImage) === i
                  ? (isDarkTheme ? 'rgba(180,100,255,0.9)' : 'rgba(201,168,76,0.9)')
                  : (isDarkTheme ? 'rgba(180,100,255,0.3)' : 'rgba(201,168,76,0.25)'),
                transition:'all 0.3s'
              }}
            />
          ))}
        </div>
      )}

      {/* КНОПКА СОХРАНЕНИЯ */}
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