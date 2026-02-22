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
@keyframes h-twinkle {
  0%,100% { opacity:0.2; } 50% { opacity:0.7; }
}
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
        ? 'url(/images/mobail.webp)'
        : 'url(/images/descort.webp)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
/>
 <div className="max-w-6xl mx-auto px-4 py-8">

{isDarkTheme ? (
  <div style={{
    background:'radial-gradient(ellipse at top, rgba(26, 10, 46, 0.82) 0%, rgba(8, 8, 15, 0.62) 60%)',
    backdropFilter:'blur(8px)',
    padding: isMobile ? '32px 20px 24px' : '40px 40px 30px',
    position:'relative', overflow:'visible',
    marginBottom:'32px',
    borderBottom:'1px solid rgba(147,112,219,0.1)',
    zIndex: 10
  }}>
    {/* Линия сверху */}
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:'2px',
      background:'linear-gradient(90deg, transparent, #9370db, #ef01cb, #b3e7ef, transparent)'
    }}/>
    {/* Звёзды */}
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none',
      backgroundImage:`
        radial-gradient(1px 1px at 15% 30%, rgba(255,255,255,0.5) 0%, transparent 100%),
        radial-gradient(1px 1px at 75% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 45% 70%, rgba(255,255,255,0.25) 0%, transparent 100%),
        radial-gradient(1px 1px at 90% 50%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 8% 80%, rgba(255,255,255,0.2) 0%, transparent 100%),
        radial-gradient(1px 1px at 60% 15%, rgba(255,255,255,0.35) 0%, transparent 100%),
        radial-gradient(1px 1px at 30% 55%, rgba(255,255,255,0.15) 0%, transparent 100%)`,
      animation:'h-twinkle 4s ease-in-out infinite'
    }}/>
    {/* Кнопка назад */}
    <Link href="/" style={{
      position:'absolute', top:'16px', right:'24px', zIndex:50,
      display:'inline-flex', alignItems:'center', gap:'6px',
      color:'rgba(180,100,255,0.6)',
      fontFamily:'sans-serif',
      fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
      textDecoration:'none'
    }}>← Назад</Link>
    {/* Центр */}
    <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
      <div style={{
        fontFamily:"'plommir', Georgia, serif",
       fontSize: isMobile ? 'clamp(1.8rem, 7vw, 2.5rem)' : 'clamp(3.5rem, 8vw, 5.5rem)',
        background:'linear-gradient(90deg, #b3e7ef, #ef01cb, #9370db)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        letterSpacing:'12px', marginBottom:'6px'
      }}>Библиотека</div>
      <div style={{
        fontFamily:'Georgia, serif', fontStyle:'italic',
        color:'rgba(180,100,255,0.4)', fontSize:'0.8rem', letterSpacing:'4px',
        marginBottom:'20px'
      }}>· добро пожаловать в мир историй ·</div>
      {/* Разделитель */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', marginBottom:'20px' }}>
        <div style={{ height:'1px', width: isMobile ? '40px' : '80px', background:'linear-gradient(90deg, transparent, rgba(147,112,219,0.5))' }}/>
        <span style={{ color:'rgba(180,100,255,0.4)', fontSize:'0.7rem', letterSpacing:'6px' }}>✦ · ✦</span>
        <div style={{ height:'1px', width: isMobile ? '40px' : '80px', background:'linear-gradient(270deg, transparent, rgba(147,112,219,0.5))' }}/>
      </div>

      {/* Кнопки категорий */}
     <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'nowrap', position:'relative', zIndex:50, pointerEvents:'all' }}>
        {[
          { key:'novel', label:'Романы' },
          { key:'longfic', label:'Лонгфики' },
          { key:'minific', label:'Минифики' },
          { key:'series', label:'Серии' }
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setCategory(key)} style={{
            position:'relative',
            padding: isMobile ? '5px 8px' : '8px 28px',
            background: category === key ? 'rgba(147,112,219,0.2)' : 'rgba(147,112,219,0.06)',
            border: `1px solid ${category === key ? 'rgba(180,100,255,0.6)' : 'rgba(147,112,219,0.25)'}`,
            color: category === key ? '#e8d5ff' : 'rgba(200,185,230,0.7)',
            fontFamily:'sans-serif',
fontSize: isMobile ? '0.42rem' : '0.6rem',
            letterSpacing: isMobile ? '1px' : '3px', textTransform:'uppercase',
            cursor:'pointer', borderRadius:'2px',
            boxShadow: category === key ? '0 0 20px rgba(147,112,219,0.3)' : 'none',
            transition:'all 0.3s'
          }}>
            {label}
            {key === 'series' && isAdmin && (
              <div
                onClick={(e) => { e.stopPropagation(); setShowSeriesModal(true); }}
                style={{
                  position:'absolute', top:'-8px', right:'-8px',
                  background:'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                  boxShadow:'0 0 10px rgba(147,112,219,0.8)',
                  borderRadius:'50%', width:'18px', height:'18px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'12px', color:'white', cursor:'pointer'
                }}
              >+</div>
            )}
          </button>
        ))}
      </div>
    </div>
  </div>
) : (
  <div style={{
    background:'rgba(5, 3, 2, 0.61)',
    backdropFilter:'blur(8px)',
    borderBottom:'1px solid #1a1508',
    padding: isMobile ? '28px 20px 24px' : '32px 40px 28px',
    display: isMobile ? 'block' : 'flex',
    alignItems:'center',
    gap:'32px',
    position:'relative',
    marginBottom:'32px',
    zIndex: 10
  }}>
    {/* Левая золотая полоса */}
    <div style={{
      position:'absolute', left:0, top:0, bottom:0, width:'3px',
      background:'linear-gradient(180deg, transparent, #c9a84c, transparent)'
    }}/>
    {/* ⚜ фоном */}
    <div style={{
      position:'absolute',
      top:'50%', left: isMobile ? '50%' : '60px',
      transform: isMobile ? 'translate(-50%,-50%)' : 'translateY(-50%)',
      fontFamily:'serif', fontSize: isMobile ? '8rem' : '10rem',
      color:'rgba(201,168,76,0.06)',
      pointerEvents:'none', userSelect:'none', lineHeight:1, zIndex:0
    }}>⚜</div>
    {/* Заголовок */}
    <div style={{ position:'relative', zIndex:1, flexShrink:0, marginBottom: isMobile ? '20px' : 0 }}>
      <div style={{
        fontFamily:"'victiriya', Georgia, serif",
        fontSize: isMobile ? '3rem' : '5.5rem',
        color:'#c9a84c',
        letterSpacing:'6px',
        fontWeight:400,
        lineHeight:1
      }}>Библиотека</div>
      <div style={{
        fontFamily:'Georgia, serif', fontStyle:'italic',
        color:'rgba(201,168,76,0.4)', fontSize:'0.75rem',
        letterSpacing:'3px', marginTop:'6px'
      }}>добро пожаловать в мир историй</div>
    </div>
    {/* Разделитель */}
    {!isMobile && (
      <div style={{
        width:'1px', height:'60px', flexShrink:0,
        background:'linear-gradient(180deg, transparent, rgba(201,168,76,0.3), transparent)'
      }}/>
    )}
    {/* Кнопки + поиск */}
    <div style={{ position:'relative', zIndex:50, display:'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '4px' : '6px', flexWrap:'nowrap', pointerEvents:'all' }}>
      {[
        { key:'novel', label:'Романы' },
        { key:'longfic', label:'Лонгфики' },
        { key:'minific', label:'Минифики' },
        { key:'series', label:'Серии' }
      ].map(({ key, label }) => (
        <button key={key} onClick={() => setCategory(key)} style={{
          padding: isMobile ? '5px 8px' : category === key ? '6px 20px 6px 28px' : '6px 20px',
          background:'transparent', border:'none',
          borderLeft: isMobile ? 'none' : `1px solid ${category === key ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`,
          borderBottom: isMobile ? `1px solid ${category === key ? '#c9a84c' : 'rgba(201,168,76,0.2)'}` : 'none',
          color: category === key ? '#c9a84c' : 'rgba(201,168,76,0.5)',
          fontFamily:'Georgia, serif',
fontSize: isMobile ? '0.42rem' : '0.6rem', letterSpacing: isMobile ? '1px' : '3px', textTransform:'uppercase',
          cursor:'pointer', textAlign:'left',
          transition:'all 0.3s',
          position:'relative'
        }}>
          {label}
          {key === 'series' && isAdmin && (
            <span
              onClick={(e) => { e.stopPropagation(); setShowSeriesModal(true); }}
              style={{
                marginLeft:'8px',
                background:'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                borderRadius:'50%', width:'16px', height:'16px',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                fontSize:'11px', color:'white', cursor:'pointer', verticalAlign:'middle'
              }}
            >+</span>
          )}
        </button>
      ))}
    </div>
    {/* Кнопка назад */}
    <Link href="/" style={{
      position:'absolute', top:'16px', right:'24px', zIndex:50,
      display:'flex', alignItems:'center', gap:'6px',
      color:'rgba(201,168,76,0.4)',
      fontFamily:'Georgia, serif', fontStyle:'italic',
      fontSize:'0.75rem', letterSpacing:'2px',
      textDecoration:'none'
    }}>← вернуться</Link>
  </div>
)}

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3"
      style={{ background: isDarkTheme ? 'rgba(0,0,0,0.97)' : 'rgba(0,0,0,0.85)', backdropFilter:'blur(6px)' }}>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes seriesTwinkle { 0%,100%{opacity:0.15;} 50%{opacity:0.6;} }
        @keyframes seriesModalIn { from{opacity:0;transform:translateY(20px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
        .s-modal-dark {
          animation: seriesModalIn 0.4s cubic-bezier(0.4,0,0.2,1);
          background: radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 70%);
          border: 1px solid rgba(180,100,255,0.25);
          box-shadow: 0 0 80px rgba(147,50,255,0.15), inset 0 0 80px rgba(0,0,0,0.5);
          position:relative; overflow:hidden;
        }
        .s-modal-dark::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image:
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 67% 22%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 12%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 22% 55%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 85%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 5% 90%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 93% 80%, rgba(255,255,255,0.2) 0%, transparent 100%);
          animation: seriesTwinkle 4s ease-in-out infinite;
        }
        .s-modal-gold {
          animation: seriesModalIn 0.4s cubic-bezier(0.4,0,0.2,1);
          background: #080808;
          border: 1px solid #2a2218;
          position:relative; overflow:hidden;
        }
        .s-scroll-dark::-webkit-scrollbar{width:7px;}
        .s-scroll-dark::-webkit-scrollbar-track{background:rgba(0,0,0,0.3);border-radius:10px;}
        .s-scroll-dark::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#9370db 0%,#67327b 100%);border-radius:10px;box-shadow:0 0 10px rgba(147,112,219,0.8);}
        .s-scroll-dark::-webkit-scrollbar-thumb:hover{background:linear-gradient(135deg,#b48dc4 0%,#9370db 100%);}
        .s-scroll-gold::-webkit-scrollbar{width:7px;}
        .s-scroll-gold::-webkit-scrollbar-track{background:rgba(0,0,0,0.3);border-radius:10px;}
        .s-scroll-gold::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#94896b 0%,#5f5744 100%);border-radius:10px;box-shadow:0 0 10px rgba(201,168,76,0.5);}
        .s-scroll-gold::-webkit-scrollbar-thumb:hover{background:linear-gradient(135deg,#beb292 0%,#c9ba91 100%);}
      `}}/>

      <div className={isDarkTheme ? 's-modal-dark s-scroll-dark' : 's-modal-gold s-scroll-gold'}
        style={{ width:'100%', maxWidth:'48rem', maxHeight:'92vh', overflowY:'auto', borderRadius:'16px' }}>

        {/* Кнопка закрыть */}
        <button onClick={() => setExpandedSeries(null)}
          style={{ position:'absolute', top:'14px', right:'14px', zIndex:10,
            background: isDarkTheme ? 'rgba(180,100,255,0.1)' : 'transparent',
            border: isDarkTheme ? '1px solid rgba(180,100,255,0.3)' : '1px solid rgba(201,168,76,0.3)',
            borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer',
            color: isDarkTheme ? 'rgba(180,100,255,0.8)' : 'rgba(201,168,76,0.7)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X size={16}/>
        </button>

        {/* Верхняя часть — обложка + название */}
{isDarkTheme ? (
          <div style={{ display:'flex', gap:'16px',
            padding: isMobile ? '20px 16px 12px' : '24px 24px 16px',
            flexDirection: 'column',
            alignItems: 'center' }}>
            {currentSeries.cover_url && (
              <div style={{ flexShrink:0, width: isMobile ? '140px' : '160px',
                height: isMobile ? '190px' : '220px', overflow:'hidden',
                border:'1px solid rgba(180,100,255,0.4)',
                boxShadow:'0 0 30px rgba(180,100,255,0.2), inset 0 0 20px rgba(0,0,0,0.5)',
                borderRadius:'4px' }}>
                <img src={currentSeries.cover_url} alt={currentSeries.name}
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', justifyContent:'center',
              textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ fontFamily:'Cinzel, serif', fontSize: isMobile ? '2rem' : '3rem',
                color:'rgba(180,100,255,0.25)', lineHeight:1, userSelect:'none' }}>✦</div>
              <h2 style={{ fontFamily:'Cinzel, serif',
                fontSize: isMobile ? '1.4rem' : '1.9rem',
                color:'#e8d5ff', letterSpacing:'3px', marginTop:'-6px', lineHeight:1.2 }}>
                {currentSeries.name}
              </h2>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'stretch' }}>
            {currentSeries.cover_url && (
              <div style={{ flexShrink:0, width: isMobile ? '100%' : '180px',
                height: isMobile ? '200px' : '260px', overflow:'hidden', position:'relative' }}>
                <img src={currentSeries.cover_url} alt={currentSeries.name}
                  style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}/>
                {!isMobile && <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, transparent 50%, #080808)' }}/>}
                {isMobile && <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, #080808)' }}/>}
              </div>
            )}
            <div style={{ flex:1, padding: isMobile ? '0 24px 16px' : '32px 32px 16px',
              display:'flex', flexDirection:'column', justifyContent:'flex-end',
              textAlign: isMobile ? 'center' : 'left' }}>
              <h2 style={{ fontFamily:'Cinzel, serif',
                fontSize: isMobile ? '1.5rem' : '2rem',
                backgroundImage:'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 60%, #e8c060 100%)',
                backgroundSize:'200% auto',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                animation:'goldShimmer 4s linear infinite',
                letterSpacing:'3px', fontWeight:400 }}>
                {currentSeries.name}
              </h2>
            </div>
          </div>
        )}

        {/* Разделитель */}
        <div style={{ textAlign:'center',
          color: isDarkTheme ? 'rgba(180,100,255,0.35)' : 'rgba(201,168,76,0.4)',
          fontSize:'0.75rem',
          letterSpacing: isDarkTheme ? '8px' : '10px',
          margin:'0 20px 16px',
          borderTop: isDarkTheme ? '1px solid rgba(180,100,255,0.12)' : '1px solid rgba(201,168,76,0.15)',
          paddingTop:'12px', fontFamily:'serif' }}>
          {isDarkTheme ? '✦ · · · ✦ · · · ✦' : '⚜ · · ⚜ · · ⚜'}
        </div>

        {/* Описание */}
        {currentSeries.description && (
          <div style={{ margin:'0 20px 12px', textAlign:'center',
            color: isDarkTheme ? '#d0c0e8' : '#d0c8b8',
            fontFamily:'Georgia, serif', fontSize:'0.95rem', lineHeight:1.7 }}
            dangerouslySetInnerHTML={{ __html: currentSeries.description }}/>
        )}

        {/* Примечание */}
        {currentSeries.note && (
          <div style={{ margin:'0 20px 20px', textAlign:'center', fontStyle:'italic',
            color: isDarkTheme ? 'rgba(180,100,255,0.5)' : 'rgba(201,168,76,0.5)',
            fontSize:'0.85rem', lineHeight:1.7, fontFamily:'Georgia, serif',
            borderTop: isDarkTheme ? '1px solid rgba(180,100,255,0.1)' : '1px solid rgba(201,168,76,0.1)',
            paddingTop:'12px' }}
            dangerouslySetInnerHTML={{ __html: currentSeries.note }}/>
        )}

        {/* Галерея работ */}
        <div style={{ margin:'0 20px 24px' }}>
          <div style={{ fontSize:'0.55rem', letterSpacing:'4px', textTransform:'uppercase',
            color: isDarkTheme ? 'rgba(180,100,255,0.4)' : 'rgba(201,168,76,0.4)',
            marginBottom:'12px', textAlign:'center',
            fontFamily: isDarkTheme ? 'sans-serif' : 'Cinzel, serif' }}>
            {isDarkTheme ? '✦ работы серии ✦' : '⚜ работы серии ⚜'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {seriesWorks.map(work => {
              const isWorkExpanded = expandedWorkId === work.id;
              return (
                <div key={work.id}
                  onMouseEnter={() => !isMobile && setExpandedWorkId(work.id)}
                  onMouseLeave={() => !isMobile && setExpandedWorkId(null)}
                  onClick={() => {
                    if (isMobile) setExpandedWorkId(isWorkExpanded ? null : work.id);
                    else { setExpandedSeries(null); router.push(`/work/${work.id}`); }
                  }}
                  className="cursor-pointer relative"
                  style={{
                    height: isWorkExpanded ? '450px' : '400px',
                    borderRadius:'12px', overflow:'hidden',
                    border: isDarkTheme ? '1px solid rgba(180,100,255,0.35)' : '1px solid rgba(201,168,76,0.3)',
                    transform: isWorkExpanded ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isWorkExpanded
                      ? isDarkTheme ? '0 0 30px rgba(180,100,255,0.3)' : '0 0 20px rgba(201,168,76,0.2)'
                      : 'none',
                    transition:'all 0.5s cubic-bezier(0.4,0,0.2,1)'
                  }}>
                  {work.cover_url && (
                    <img src={work.cover_url} alt={work.title}
                      className="w-full h-full object-cover"
                      style={{ filter: isWorkExpanded ? 'brightness(0.7)' : 'brightness(1)', transition:'filter 0.5s ease' }}/>
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end p-3 pointer-events-none">
                    {!isWorkExpanded ? (
                      <p style={{ writingMode:'vertical-rl', transform:'rotate(180deg)',
                        fontSize:'1.3rem', letterSpacing:'2px', fontWeight:'bold',
                        position:'absolute', left:'12px', bottom:'12px',
                        textShadow: isDarkTheme ? '0 0 20px rgba(179,231,239,0.8), 2px 2px 8px rgba(0,0,0,0.8)' : '2px 2px 8px rgba(0,0,0,0.8)',
                        animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                        background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                        backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                        WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                        WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                        fontFamily: isDarkTheme ? 'plommir' : 'kikamori' }}>
                        {work.title}
                      </p>
                    ) : (
                      <div style={{ animation:'fadeIn 0.3s ease-out' }} className="space-y-2">
                        <h3 style={{ fontWeight:'bold',
                          fontSize: isMobile ? '1rem' : '1.2rem',
                          textShadow: isDarkTheme ? '0 0 20px rgba(179,231,239,0.8), 2px 2px 8px rgba(0,0,0,0.8)' : '2px 2px 8px rgba(0,0,0,0.8)',
                          animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                          background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                          backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                          WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                          WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                          color: isDarkTheme ? 'white' : 'transparent',
                          fontFamily: isDarkTheme ? 'plommir' : 'kikamori' }}>
                          {work.title}
                        </h3>
                        <Link href={`/work/${work.id}`}
                          onClick={(e) => { e.stopPropagation(); setExpandedSeries(null); }}
                          className="flex items-center gap-1 pointer-events-auto"
                          style={{ fontWeight:'bold', fontSize:'0.85rem',
                            textShadow: isDarkTheme ? '0 0 20px rgba(179,231,239,0.8)' : '2px 2px 8px rgba(0,0,0,0.8)',
                            animation: isDarkTheme ? 'neonPulse 2s infinite' : 'shimmer 3s linear infinite',
                            background: !isDarkTheme ? 'linear-gradient(90deg, #c9c6bb, #f0e68c, #c9c6bb, #f0e68c)' : 'none',
                            backgroundSize: !isDarkTheme ? '200% 100%' : 'auto',
                            WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
                            WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'white',
                            color: isDarkTheme ? 'white' : 'transparent' }}>
                          <span>Читать</span>
                          <span style={{ animation:'bounce 1s infinite',
                            color: !isDarkTheme ? '#c9c6bb' : 'white',
                            WebkitTextFillColor: !isDarkTheme ? '#c9c6bb' : 'white' }}>→</span>
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