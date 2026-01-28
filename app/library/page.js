'use client';
import '@/app/fonts.css'; 
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X, Plus, Trash2 } from 'lucide-react';

export default function Library() {
  const [works, setWorks] = useState([]);
  const [category, setCategory] = useState('longfic');
  const [series, setSeries] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [expandedWork, setExpandedWork] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [seriesDescription, setSeriesDescription] = useState('');
const [seriesNote, setSeriesNote] = useState('');
const [seriesCoverUrl, setSeriesCoverUrl] = useState('');
const [editingSeries, setEditingSeries] = useState(null);
const [showSeriesColorPicker, setShowSeriesColorPicker] = useState(false);
const [showSeriesNoteColorPicker, setShowSeriesNoteColorPicker] = useState(false);
const [expandedSeries, setExpandedSeries] = useState(null);
const seriesDescriptionRef = useRef(null);
const seriesNoteRef = useRef(null);
const [expandedWorkId, setExpandedWorkId] = useState(null);
const [expandedSeriesCardId, setExpandedSeriesCardId] = useState(null);
const router = useRouter();

  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
    checkUser();
    loadWorks();
    loadSeries();
  }, []);

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

  useEffect(() => {
    if (expandedWork) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expandedWork]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setUser(session.user);
    }
  };

  const loadWorks = async () => {
    const { data } = await supabase
      .from('works')
      .select('*')
      .eq('is_draft', false)
      .order('created_at', { ascending: false });
    setWorks(data || []);
  };

  const loadSeries = async () => {
    const { data } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false });
    setSeries(data || []);
  };

const handleSeriesCoverUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Файл слишком большой! Максимум 5MB');
    return;
  }
  
  try {
    const fileName = `series-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const { data, error } = await supabase.storage
      .from('covers')
      .upload(`series/${fileName}`, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('covers')
      .getPublicUrl(`series/${fileName}`);
    
    setSeriesCoverUrl(urlData.publicUrl);
    alert('✅ Обложка загружена!');
  } catch (err) {
    alert('Ошибка загрузки: ' + err.message);
  }
};

const createSeries = async () => {
  if (!seriesName.trim() || selectedWorks.length === 0 || !seriesDescription.trim()) {
    alert('Заполните название, описание и выберите работы!');
    return;
  }

  const { error } = await supabase
    .from('series')
    .insert({ 
      name: seriesName, 
      work_ids: selectedWorks,
      description: seriesDescription,
      note: seriesNote,
      cover_url: seriesCoverUrl
    });

  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('Серия создана!');
    setShowSeriesModal(false);
    setSeriesName('');
    setSeriesDescription('');
    setSeriesNote('');
    setSeriesCoverUrl('');
    setSelectedWorks([]);
    loadSeries();
  }
};

const updateSeries = async () => {
  if (!seriesName.trim() || selectedWorks.length === 0 || !seriesDescription.trim()) {
    alert('Заполните название, описание и выберите работы!');
    return;
  }

  const { error } = await supabase
    .from('series')
    .update({ 
      name: seriesName, 
      work_ids: selectedWorks,
      description: seriesDescription,
      note: seriesNote,
      cover_url: seriesCoverUrl
    })
    .eq('id', editingSeries);

  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('Серия обновлена!');
    setShowSeriesModal(false);
    setEditingSeries(null);
    setSeriesName('');
    setSeriesDescription('');
    setSeriesNote('');
    setSeriesCoverUrl('');
    setSelectedWorks([]);
    loadSeries();
  }
};

const applySeriesFormatting = (type, field) => {
  const textarea = field === 'description' ? seriesDescriptionRef.current : seriesNoteRef.current;
  const value = field === 'description' ? seriesDescription : seriesNote;
  const setValue = field === 'description' ? setSeriesDescription : setSeriesNote;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);

  if (!selectedText) return;

  let wrapped = '';
  if (type === 'bold') wrapped = `<strong>${selectedText}</strong>`;
  else if (type === 'italic') wrapped = `<em>${selectedText}</em>`;
  else if (type === 'underline') wrapped = `<u>${selectedText}</u>`;
  else if (type.startsWith('#')) wrapped = `<span style="color:${type}">${selectedText}</span>`;

  const newValue = value.substring(0, start) + wrapped + value.substring(end);
  setValue(newValue);

  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + wrapped.length, start + wrapped.length);
  }, 0);
};

  const deleteSeries = async (seriesId) => {
    if (!confirm('Удалить серию?')) return;
    
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', seriesId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      loadSeries();
    }
  };

  const filteredWorks = category === 'series' 
    ? [] 
    : works.filter(w => w.category === category);

  const getSeriesWorks = (seriesId) => {
    const s = series.find(x => x.id === seriesId);
    if (!s || !s.work_ids) return [];
    return works.filter(w => s.work_ids.includes(w.id));
  };

  const toggleWorkSelection = (workId) => {
    setSelectedWorks(prev => 
      prev.includes(workId) 
        ? prev.filter(id => id !== workId) 
        : [...prev, workId]
    );
  };

return (
  <>
<style dangerouslySetInnerHTML={{__html: `
  @keyframes bounce {
  0%, 100% { 
    transform: translateX(0); 
  }
  50% { 
    transform: translateX(5px); 
  }
}
  /* Анимация для градиента текста "Библиотека" в темной теме */
  @keyframes shimmer-btn {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* Анимация волн для букв "Библиотека" в светлой теме */
  @keyframes letterWave {
    0%, 100% {
      color: #b6b5b3;
      text-shadow: 0 0 10px rgba(100, 96, 86, 0.5);
    }
    25% {
      color: #a19d98;
      text-shadow: 0 0 5px rgba(85, 75, 63, 0.3);
    }
    50% {
      color: #1b1616;
      text-shadow: none;
    }
    75% {
      color: #4e4c49;
      text-shadow: 0 0 5px rgba(139, 115, 85, 0.3);
    }
  }

  /* Неоновая лава-лампа для карточек в темной теме */
  @keyframes neonLava1 {
    0%, 100% { 
      transform: translate(-30%, -30%) scale(1);
      opacity: 0.6;
    }
    50% { 
      transform: translate(30%, 30%) scale(1.2);
      opacity: 0.8;
    }
  }

  @keyframes neonLava2 {
    0%, 100% { 
      transform: translate(25%, -25%) scale(1.1);
      opacity: 0.7;
    }
    50% { 
      transform: translate(-25%, 25%) scale(1);
      opacity: 0.5;
    }
  }

  @keyframes neonLava3 {
    0%, 100% { 
      transform: translate(-20%, 20%) scale(1.05);
      opacity: 0.65;
    }
    50% { 
      transform: translate(20%, -20%) scale(1.15);
      opacity: 0.75;
    }
  }

  /* Класс для неоновой лава-лампы */
  .neon-pulse {
    position: relative;
    overflow: hidden;
  }

  .neon-pulse::before,
  .neon-pulse::after {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    pointer-events: none;
    z-index: 1;
  }

  .neon-pulse::before {
    background: 
      radial-gradient(circle at 20% 30%, rgba(112, 219, 169, 0.8) 0%, transparent 25%),
      radial-gradient(circle at 70% 60%, rgba(239, 1, 203, 0.7) 0%, transparent 30%),
      radial-gradient(circle at 50% 80%, rgba(146, 56, 230, 0.6) 0%, transparent 35%);
    filter: blur(40px);
    animation: neonLava1 8s ease-in-out infinite;
  }

  .neon-pulse::after {
    background: 
      radial-gradient(circle at 80% 20%, rgba(239, 1, 203, 0.7) 0%, transparent 28%),
      radial-gradient(circle at 30% 70%, rgba(147, 112, 219, 0.65) 0%, transparent 32%),
      radial-gradient(circle at 60% 40%, rgba(62, 222, 247, 0.5) 0%, transparent 25%);
    filter: blur(35px);
    animation: neonLava2 10s ease-in-out infinite reverse;
  }

  .neon-pulse > * {
    position: relative;
    z-index: 2;
  }
  
  /* Стили скроллбара и тумана в зависимости от темы */
  ${isDarkTheme ? `
    /* ТЕМНАЯ ТЕМА - Скроллбар */
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
    /* СВЕТЛАЯ ТЕМА - Скроллбар */
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
      box-shadow: 0 0 10px rgba(80, 79, 78, 0.6);
    }
    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #c9c6bb 0%, #65635d 100%);
      box-shadow: 0 0 15px rgba(78, 77, 76, 0.8);
    }

/* Анимации для карточек работ */
@keyframes neonPulse {
  0%, 100% { 
    text-shadow: 0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8); 
  }
  50% { 
    text-shadow: 0 0 30px rgba(179, 231, 239, 1), 0 0 40px rgba(179, 231, 239, 0.6), 2px 2px 8px rgba(0,0,0,0.8); 
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
  `}
`}} />

<div className="min-h-screen relative">
<div 
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -10,
    backgroundImage: isDarkTheme 
      ? isMobile 
        ? 'url(/images/darnesthemepc.webp)' 
        : 'url(/images/darknesas1.webp)'
      : isMobile
        ? 'url(/images/111.webp)'
        : 'url(/images/alllisender.webp)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
/>
        <div className="max-w-6xl mx-auto px-4 py-8">
<div className="flex flex-row justify-between items-center gap-1 sm:gap-2 mb-3">
<Link 
  href="/"
  className="inline-flex items-center gap-1 px-2 py-1 sm:gap-2 sm:px-4 flex-shrink-0 text-sm transition-all duration-300"
style={{
  background: isDarkTheme 
    ? 'rgba(160, 99, 207, 0.4)'
    : 'rgba(0, 0, 0, 0.6)',
  border: isDarkTheme ? '2px solid #a063cf94' : 'none',
  backdropFilter: isDarkTheme ? 'blur(10px)' : 'none',
  borderRadius: isDarkTheme ? '12px' : '0',
  clipPath: !isDarkTheme ? 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' : 'none',
  color: '#ffffff',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  padding: isMobile ? '0.25rem 0.5rem' : undefined,
  fontSize: isMobile ? '0.7rem' : undefined
}}
  onMouseEnter={(e) => {
    if (isDarkTheme) {
      e.currentTarget.style.borderColor = '#fff';
      e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    }
  }}
  onMouseLeave={(e) => {
    if (isDarkTheme) {
      e.currentTarget.style.borderColor = '#a063cf94';
      e.currentTarget.style.boxShadow = 'none';
    }
  }}
>
  <ChevronLeft size={20} />
  Назад
</Link>

<input
  type="text"
  placeholder="Поиск по названию..."
  className="px-4 py-1 flex-1 sm:flex-initial sm:w-80 text-sm transition-all duration-300"
  style={{
    background: isDarkTheme 
      ? 'rgba(147, 112, 219, 0.2)'
      : 'rgba(0, 0, 0, 0.6)',
    border: isDarkTheme ? '1px solid #9370db' : 'none',
    borderRadius: isDarkTheme ? '12px' : '0',
    clipPath: !isDarkTheme ? 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' : 'none',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}
    onChange={(e) => {
      const value = e.target.value.toLowerCase();
      if (!value) {
        loadWorks();
      } else {
        setWorks(prev => prev.filter(w => w.title.toLowerCase().includes(value)));
      }
    }}
  />
</div>

<h1 className="font-bold mb-3 text-center" style={{
  fontSize: isDarkTheme ? 'clamp(2.5rem, 6vw, 4rem)' : 'clamp(2rem, 6vw, 5rem)',
  fontFamily: isDarkTheme ? "'plommir', Georgia, serif" : "'sooonsi', Georgia, serif",
  fontStyle: !isDarkTheme ? 'italic' : 'normal',
  textAlign: 'center',
  width: '100%'
}}>
  {isDarkTheme ? (
    <span style={{
      backgroundImage: 'linear-gradient(90deg, #b3e7ef 0%, #ef01cb 50%, #a67cce 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'shimmer-btn 3s linear infinite'
    }}>
      Библиотека
    </span>
  ) : (
    'Библиотека'.split('').map((char, index) => (
      <span
        key={index}
        style={{
          display: 'inline-block',
          animation: `letterWave 8s ease-in-out infinite`,
          animationDelay: `${index * 0.3}s`
        }}
      >
        {char}
      </span>
    ))
  )}
</h1>

<div className="flex gap-2 sm:gap-4 mb-8 justify-center flex-wrap">
  {[
    { key: 'novel', label: 'Романы' },
    { key: 'longfic', label: 'Лонгфики' },
    { key: 'minific', label: 'Минифики' },
    { key: 'series', label: 'Серии' }
  ].map(cat => (
    <button
      key={cat.key}
      onClick={() => setCategory(cat.key)}
      className="relative text-xs sm:text-base transition-all duration-300"
      style={{
        background: isDarkTheme 
          ? 'rgba(111, 53, 156, 0.4)'
          : (category === cat.key ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)'),
        border: isDarkTheme ? '2px solid' : 'none',
        borderColor: isDarkTheme ? (category === cat.key ? '#ef01cb85' : '#a063cf94') : 'transparent',
        backdropFilter: isDarkTheme ? 'blur(10px)' : 'none',
        boxShadow: isDarkTheme && category === cat.key ? '0 0 25px rgba(239, 1, 203, 0.44)' : 'none',
        borderRadius: isDarkTheme ? '12px' : '0',
padding: isDarkTheme 
  ? (isMobile ? '0.4rem 0.8rem' : 'clamp(0.5rem, 2vw, 0.8rem) clamp(1rem, 4vw, 2.5rem)')
  : (isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem'),
fontSize: isDarkTheme 
  ? (isMobile ? '0.5rem' : 'clamp(0.5rem, 1.5vw, 0.6875rem)')
  : (isMobile ? '0.5rem' : '0.6rem'),
        fontWeight: '700',
        letterSpacing: isDarkTheme ? 'clamp(0.1rem, 0.5vw, 0.3rem)' : '0.2rem',
        textTransform: 'uppercase',
        cursor: 'pointer',
        clipPath: !isDarkTheme ? 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' : 'none',
        color: '#ffffff',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
      }}
      onMouseEnter={(e) => {
        if (isDarkTheme && category !== cat.key) {
          e.currentTarget.style.borderColor = '#fff';
          e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (isDarkTheme && category !== cat.key) {
          e.currentTarget.style.borderColor = '#a063cf94';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {cat.label}
      {cat.key === 'series' && isAdmin && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowSeriesModal(true);
          }}
          className="absolute -top-2 -right-2 rounded-full p-1 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
            boxShadow: '0 0 10px rgba(147, 112, 219, 0.8)'
          }}
        >
          <Plus size={16} />
        </div>
      )}
    </button>
  ))}
</div>

{category === 'series' ? (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {series.map(s => {
      const isSeriesExpanded = expandedSeriesCardId === s.id;
      
      return (
        <div key={s.id} className="relative">
          <div 
            onMouseEnter={() => !isMobile && setExpandedSeriesCardId(s.id)}
            onMouseLeave={() => !isMobile && setExpandedSeriesCardId(null)}
            onClick={() => {
              if (isMobile) {
                setExpandedSeriesCardId(isSeriesExpanded ? null : s.id);
              } else {
                setExpandedSeries(s.id);
              }
            }}
            className="cursor-pointer relative group"
            style={{
              height: isSeriesExpanded ? '450px' : '400px',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              border: isDarkTheme ? '2px solid #9370db' : '1px solid #580823',
              transform: isSeriesExpanded ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isSeriesExpanded 
                ? isDarkTheme 
                  ? '0 20px 60px rgba(147, 112, 219, 0.6)' 
                  : '0 20px 60px rgba(124, 6, 45, 0.6)'
                : 'none',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {s.cover_url && (
              <img 
                src={s.cover_url} 
                alt={s.name}
                className="w-full h-full object-cover"
                style={{
                  filter: isSeriesExpanded ? 'brightness(0.7)' : 'brightness(1)',
                  transition: 'filter 0.5s ease'
                }}
              />
            )}
            
            {/* КОНТЕНТ ПОВЕРХ */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
              {!isSeriesExpanded ? (
                <p 
                  className="font-bold text-white absolute left-4 bottom-4"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    fontSize: '1.5rem',
                    letterSpacing: '2px',
                    textShadow: isDarkTheme 
                      ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                      : '2px 2px 8px rgba(0,0,0,0.8)',
                    animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                    background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                    backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                    WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                    WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                    transition: 'all 0.5s ease',
                    opacity: 1,
                    fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
                  }}
                >
                  {s.name}
                </p>
              ) : (
                <div className="space-y-3" style={{
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <h3 
                    className="font-bold line-clamp-2"
                    style={{
                      fontSize: isMobile ? '1.25rem' : '1.5rem',
                      textShadow: isDarkTheme 
                        ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                        : '2px 2px 8px rgba(0,0,0,0.8)',
                      animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                      background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                      backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                      WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                      WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                      color: isDarkTheme ? 'white' : 'transparent',
                      fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
                    }}
                  >
                    {s.name}
                  </h3>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedSeries(s.id);
                    }}
                    className="flex items-center gap-2 font-bold pointer-events-auto mt-2"
                    style={{
                      fontSize: isMobile ? '0.75rem' : '1rem',
                      textShadow: isDarkTheme 
                        ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                        : '2px 2px 8px rgba(0,0,0,0.8)',
                      animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                      background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                      backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                      WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                      WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                      color: isDarkTheme ? 'white' : 'transparent'
                    }}
                  >
                    <span>Подробнее</span>
                    <span style={{
                      fontSize: isMobile ? '1rem' : '1.25rem',
                      animation: 'bounce 1s infinite',
                      color: !isDarkTheme ? '#c9c6bb' : 'white',
                      WebkitTextFillColor: !isDarkTheme ? '#c9c6bb' : 'white'
                    }}>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="absolute top-2 right-2 flex gap-2 z-10 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSeries(s.id);
                  setSeriesName(s.name);
                  setSeriesDescription(s.description || '');
                  setSeriesNote(s.note || '');
                  setSeriesCoverUrl(s.cover_url || '');
                  setSelectedWorks(s.work_ids || []);
                  setShowSeriesModal(true);
                }}
                className="bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-full"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSeries(s.id);
                }}
                className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-full"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      );
    })}
  </div>
) : (
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
{filteredWorks.map(work => {
    const isWorkExpanded = expandedWorkId === work.id;
    
    return (
      <div 
        key={work.id}
        onMouseEnter={() => !isMobile && setExpandedWorkId(work.id)}
        onMouseLeave={() => !isMobile && setExpandedWorkId(null)}
        onClick={() => isMobile && setExpandedWorkId(isWorkExpanded ? null : work.id)}
        className="cursor-pointer relative group"
        style={{
          height: isWorkExpanded ? '450px' : '400px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: isDarkTheme ? '2px solid #9370db' : '1px solid #580823',
          transform: isWorkExpanded ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isWorkExpanded 
            ? isDarkTheme 
              ? '0 20px 60px rgba(147, 112, 219, 0.6)' 
              : '0 20px 60px rgba(124, 6, 45, 0.6)'
            : 'none',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
<img
  src={work.cover_url} 
  alt={work.title}
  className="w-full h-full object-cover"
  style={{
    filter: isWorkExpanded ? 'brightness(0.7)' : 'brightness(1)',
    transition: 'filter 0.5s ease'
  }}
/>

        <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
          {!isWorkExpanded ? (
            <p 
              className="font-bold text-white absolute left-4 bottom-4"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontSize: '1.5rem',
                letterSpacing: '2px',
                textShadow: isDarkTheme 
                  ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                  : '2px 2px 8px rgba(0,0,0,0.8)',
                animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                transition: 'all 0.5s ease',
                opacity: 1,
                fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
              }}
            >
              {work.title}
            </p>
          ) : (
            <div className="space-y-3" style={{
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <h3 
                className="font-bold line-clamp-2"
                style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  textShadow: isDarkTheme 
                    ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                    : '2px 2px 8px rgba(0,0,0,0.8)',
                  animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                  background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                  backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                  WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                  WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                  color: isDarkTheme ? 'white' : 'transparent',
                  fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
                }}
              >
                {work.title}
              </h3>
              
              {work.fandom && (
                <p className="text-gray-300" style={{
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}>
                  Фандом: <span className="font-bold">{work.fandom}</span>
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full" style={{
                  fontSize: isMobile ? '0.625rem' : '0.75rem',
                  padding: isMobile ? '0.125rem 0.375rem' : '0.25rem 0.5rem',
                  background: 'rgba(147, 112, 219, 0.3)',
                  color: '#ffffff'
                }}>
                  {work.status}
                </span>
                <span className="rounded-full" style={{
                  fontSize: isMobile ? '0.625rem' : '0.75rem',
                  padding: isMobile ? '0.125rem 0.375rem' : '0.25rem 0.5rem',
                  background: 'rgba(220, 38, 38, 0.3)',
                  color: '#ffffff'
                }}>
                  {work.rating}
                </span>
              </div>
              
              <Link
                href={`/work/${work.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 font-bold pointer-events-auto mt-2"
                style={{
                  fontSize: isMobile ? '0.75rem' : '1rem',
                  textShadow: isDarkTheme 
                    ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                    : '2px 2px 8px rgba(0,0,0,0.8)',
                  animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                  background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                  backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                  WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                  WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                  color: isDarkTheme ? 'white' : 'transparent'
                }}
              >
                <span>Начать читать</span>
                <span style={{
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  animation: 'bounce 1s infinite',
                  color: !isDarkTheme ? '#c9c6bb' : 'white',
                  WebkitTextFillColor: !isDarkTheme ? '#c9c6bb' : 'white'
                }}>→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>
)}
</div>

{/* EXPANDED SERIES */}
{expandedSeries && (() => {
  const currentSeries = series.find(x => x.id === expandedSeries);
  if (!currentSeries) return null;
  
let workIds = [];
  if (Array.isArray(currentSeries.work_ids)) {
    workIds = currentSeries.work_ids;
  } else if (typeof currentSeries.work_ids === 'string') {
    try {
      workIds = JSON.parse(currentSeries.work_ids);
    } catch {
      workIds = [];
    }
  }
  const workIdsNum = workIds.map(id => parseInt(id));
  const seriesWorks = works.filter(w => workIdsNum.includes(w.id));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
      <div 
        className="w-full max-w-6xl rounded-lg overflow-hidden transition-all duration-300 relative"
        style={{
          background: isDarkTheme ? 'rgba(147, 112, 219, 0.1)' : 'rgba(194, 194, 168, 0.1)',
          border: isDarkTheme ? '1px solid rgba(147, 112, 219, 0.3)' : '1px solid rgba(194, 194, 168, 0.3)'
        }}
      >
        <button 
          onClick={() => setExpandedSeries(null)}
          className="absolute top-4 right-4 p-2 transition z-10 hover:opacity-70"
          style={{
            background: 'none',
            border: 'none',
            color: isDarkTheme ? '#ffffff' : '#c2c2a8',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <div className="p-8 max-h-[85vh] overflow-y-auto" style={{
          background: isDarkTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.7)'
        }}>
          <h2 className="text-3xl font-bold mb-4 text-center" style={{ 
            color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            {currentSeries.name}
          </h2>

          {currentSeries.description && (
            <div 
              className="text-lg text-center mb-4 leading-relaxed"
              style={{ color: isDarkTheme ? '#ffffff' : '#ffffff' }}
              dangerouslySetInnerHTML={{ __html: currentSeries.description }}
            />
          )}

          {currentSeries.note && (
            <div 
              className="text-sm text-center mb-8"
              style={{ color: isDarkTheme ? '#9ca3af' : '#9ca3af' }}
              dangerouslySetInnerHTML={{ __html: currentSeries.note }}
            />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
{seriesWorks.map(work => {
  const isWorkExpanded = expandedWorkId === work.id;
  
  return (
    <div 
      key={work.id}
      onMouseEnter={() => !isMobile && setExpandedWorkId(work.id)}
      onMouseLeave={() => !isMobile && setExpandedWorkId(null)}
      onClick={() => {
        if (isMobile) {
          setExpandedWorkId(isWorkExpanded ? null : work.id);
        } else {
          setExpandedSeries(null);
          router.push(`/work/${work.id}`);
        }
      }}
      className="cursor-pointer relative group"
      style={{
        height: isWorkExpanded ? '450px' : '400px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: isDarkTheme ? '2px solid #9370db' : '1px solid #580823',
        transform: isWorkExpanded ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isWorkExpanded 
          ? isDarkTheme 
            ? '0 20px 60px rgba(147, 112, 219, 0.6)' 
            : '0 20px 60px rgba(124, 6, 45, 0.6)'
          : 'none',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="aspect-[2/3] bg-gray-800 relative w-full h-full">
{work.cover_url && (
  <img
    src={work.cover_url} 
    alt={work.title} 
    className="w-full h-full object-cover"
    style={{
      filter: isWorkExpanded ? 'brightness(0.7)' : 'brightness(1)',
      transition: 'filter 0.5s ease'
    }}
  />
)}
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
        {!isWorkExpanded ? (
          <p 
            className="font-bold text-white absolute left-4 bottom-4"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: '1.5rem',
              letterSpacing: '2px',
              textShadow: isDarkTheme 
                ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                : '2px 2px 8px rgba(0,0,0,0.8)',
              animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
              background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
              backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
              WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
              WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
              transition: 'all 0.5s ease',
              opacity: 1,
              fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
            }}
          >
            {work.title}
          </p>
        ) : (
          <div className="space-y-3" style={{
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h3 
              className="font-bold line-clamp-2"
              style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                textShadow: isDarkTheme 
                  ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                  : '2px 2px 8px rgba(0,0,0,0.8)',
                animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                color: isDarkTheme ? 'white' : 'transparent',
                fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
              }}
            >
              {work.title}
            </h3>
            
            {work.fandom && (
              <p className="text-gray-300" style={{
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}>
                Фандом: <span className="font-bold">{work.fandom}</span>
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              <span className="rounded-full" style={{
                fontSize: isMobile ? '0.625rem' : '0.75rem',
                padding: isMobile ? '0.125rem 0.375rem' : '0.25rem 0.5rem',
                background: 'rgba(147, 112, 219, 0.3)',
                color: '#ffffff'
              }}>
                {work.status}
              </span>
              <span className="rounded-full" style={{
                fontSize: isMobile ? '0.625rem' : '0.75rem',
                padding: isMobile ? '0.125rem 0.375rem' : '0.25rem 0.5rem',
                background: 'rgba(220, 38, 38, 0.3)',
                color: '#ffffff'
              }}>
                {work.rating}
              </span>
            </div>
            
            <Link
              href={`/work/${work.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedSeries(null);
              }}
              className="flex items-center gap-2 font-bold pointer-events-auto mt-2"
              style={{
                fontSize: isMobile ? '0.75rem' : '1rem',
                textShadow: isDarkTheme 
                  ? '0 0 20px rgba(179, 231, 239, 0.8), 2px 2px 8px rgba(0,0,0,0.8)' 
                  : '2px 2px 8px rgba(0,0,0,0.8)',
                animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                color: isDarkTheme ? 'white' : 'transparent'
              }}
            >
              <span>Начать читать</span>
              <span style={{
                fontSize: isMobile ? '1rem' : '1.25rem',
                animation: 'bounce 1s infinite',
                color: !isDarkTheme ? '#c9c6bb' : 'white',
                WebkitTextFillColor: !isDarkTheme ? '#c9c6bb' : 'white'
                }}>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      );
    })}
          </div>
        </div>
      </div>
    </div>
  );
})()}


 {/* CREATE/EDIT SERIES MODAL */}
{showSeriesModal && isAdmin && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="rounded-2xl w-full max-w-4xl p-6 border-2 max-h-[90vh] overflow-y-auto" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#b3e7ef' }}>
          {editingSeries ? 'Редактировать серию' : 'Создать серию'}
        </h2>
        <button onClick={() => {
          setShowSeriesModal(false);
          setEditingSeries(null);
          setSeriesName('');
          setSeriesDescription('');
          setSeriesNote('');
          setSeriesCoverUrl('');
          setSelectedWorks([]);
        }} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Название */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Название серии *
        </label>
        <input
          type="text"
          value={seriesName}
          onChange={(e) => setSeriesName(e.target.value)}
          placeholder="Введите название"
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      {/* Обложка */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Обложка серии
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleSeriesCoverUpload}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
{seriesCoverUrl && (
  <div className="mt-2 relative w-32 h-48">
    <img src={seriesCoverUrl} alt="Обложка" className="w-full h-full object-cover rounded" />
  </div>
)}
      </div>

      {/* Описание с редактором */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Описание серии *
        </label>
        
        {/* Панель форматирования */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg mb-2" style={{
          background: '#000000',
          border: '1px solid #9333ea'
        }}>
          <button onClick={() => applySeriesFormatting('bold', 'description')} className="px-3 py-2 rounded transition font-bold" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <strong>B</strong>
          </button>
          <button onClick={() => applySeriesFormatting('italic', 'description')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <em>I</em>
          </button>
          <button onClick={() => applySeriesFormatting('underline', 'description')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <u>U</u>
          </button>
          <div className="relative">
            <button onClick={() => setShowSeriesColorPicker(!showSeriesColorPicker)} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea' }}>
              🎨
            </button>
            {showSeriesColorPicker && (
              <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#9333ea' }}>
                {['#750017', '#8b1ea9', '#41d8ad', '#dbc78a', '#828282', '#1e2beb'].map(color => (
                  <button key={color} onClick={() => applySeriesFormatting(color, 'description')} className="w-8 h-8 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <textarea
          ref={seriesDescriptionRef}
          value={seriesDescription}
          onChange={(e) => setSeriesDescription(e.target.value)}
          placeholder="Описание серии..."
          rows={6}
          className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
          style={{ minHeight: '150px', resize: 'vertical' }}
        />
      </div>

      {/* Примечание с редактором */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Примечание
        </label>
        
        {/* Панель форматирования */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg mb-2" style={{
          background: '#000000',
          border: '1px solid #9333ea'
        }}>
          <button onClick={() => applySeriesFormatting('bold', 'note')} className="px-3 py-2 rounded transition font-bold" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <strong>B</strong>
          </button>
          <button onClick={() => applySeriesFormatting('italic', 'note')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <em>I</em>
          </button>
          <button onClick={() => applySeriesFormatting('underline', 'note')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <u>U</u>
          </button>
          <div className="relative">
            <button onClick={() => setShowSeriesNoteColorPicker(!showSeriesNoteColorPicker)} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea' }}>
              🎨
            </button>
            {showSeriesNoteColorPicker && (
              <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#9333ea' }}>
                {['#750017', '#8b1ea9', '#41d8ad', '#dbc78a', '#828282', '#1e2beb'].map(color => (
                  <button key={color} onClick={() => applySeriesFormatting(color, 'note')} className="w-8 h-8 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <textarea
          ref={seriesNoteRef}
          value={seriesNote}
          onChange={(e) => setSeriesNote(e.target.value)}
          placeholder="Дополнительное примечание..."
          rows={4}
          className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
          style={{ minHeight: '100px', resize: 'vertical' }}
        />
      </div>

      {/* Выбор работ */}
      <p className="text-sm text-gray-400 mb-4">Выберите работы для серии: *</p>
      <div className="grid grid-cols-2 gap-4 mb-6 max-h-[300px] overflow-y-auto p-2">
        {works.map(work => (
          <button
            key={work.id}
            onClick={() => toggleWorkSelection(work.id)}
            className="relative"
            style={{
              opacity: selectedWorks.includes(work.id) ? 1 : 0.5,
              border: selectedWorks.includes(work.id) ? '3px solid #9370db' : 'none',
              borderRadius: '8px',
              padding: '4px'
            }}
          >
<div className="aspect-[2/3] bg-gray-800 relative rounded-lg overflow-hidden">
  {work.cover_url && (
    <img src={work.cover_url} alt={work.title} className="w-full h-full object-cover" />
  )}
</div>
            <p className="text-xs text-center text-white">{work.title}</p>
          </button>
        ))}
      </div>

      <button
        onClick={editingSeries ? updateSeries : createSeries}
        className="w-full py-3 rounded-lg font-bold"
        style={{
          background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
          color: '#ffffff'
        }}
      >
        {editingSeries ? 'Сохранить изменения' : 'Создать серию'}
      </button>
    </div>
  </div>
)}
      </div>
    </>
  );
}