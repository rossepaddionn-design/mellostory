'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabaseBlog } from '@/lib/supabase-blog';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import '@/app/fonts.css';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();

  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';

  useEffect(() => {
    checkAdmin();
    loadPosts();
    loadCharacters();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
  }, []);

  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    }
  };

  const loadPosts = async () => {
    const { data } = await supabaseBlog
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const loadCharacters = async () => {
    const { data } = await supabaseBlog
      .from('character_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setCharacters(data || []);
  };

const deletePost = async (id) => {
  if (!confirm('Точно удалить пост?')) return;
  
  const res = await fetch('/api/delete-post', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  const data = await res.json();
  if (data.error) alert('Ошибка: ' + data.error);
  else loadPosts();
};

const deleteCharacter = async (id) => {
  if (!confirm('Точно удалить персонажа?')) return;
  
  const res = await fetch('/api/delete-character', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  const data = await res.json();
  if (data.error) {
    alert('Ошибка: ' + data.error);
  } else {
    loadCharacters();
  }
};

return (
  <div className="min-h-screen text-white relative">
    <style jsx global>{`
      @keyframes shimmer-btn {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }

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

      .mystic-scroll::-webkit-scrollbar { width:7px; }
      .mystic-scroll::-webkit-scrollbar-track { background:rgba(0,0,0,0.3); border-radius:10px; }
      .mystic-scroll::-webkit-scrollbar-thumb { background:linear-gradient(135deg, #9370db 0%, #67327b 100%); border-radius:10px; box-shadow:0 0 10px rgba(147,112,219,0.8); }
      .mystic-scroll::-webkit-scrollbar-thumb:hover { background:linear-gradient(135deg, #b48dc4 0%, #9370db 100%); }

      .gold-scroll::-webkit-scrollbar { width:7px; }
      .gold-scroll::-webkit-scrollbar-track { background:rgba(0,0,0,0.3); border-radius:10px; }
      .gold-scroll::-webkit-scrollbar-thumb { background:linear-gradient(135deg, #c9a84c 0%, #8a6a20 100%); border-radius:10px; box-shadow:0 0 10px rgba(201,168,76,0.5); }
    .gold-scroll::-webkit-scrollbar-thumb:hover { background:linear-gradient(135deg, #f0d080 0%, #c9a84c 100%); }  
      @keyframes h-twinkle {
        0%,100% { opacity:0.2; } 50% { opacity:0.7; }
      }
    `}</style>
    
{/* ФОН */}
<div 
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -10,
    pointerEvents: 'none',
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

{/* HEADER */}
<div className="max-w-7xl mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 10 }}>

{isDarkTheme ? (
  /* ===== ТЁМНАЯ ШАПКА — ЗВЁЗДЫ ===== */
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
    }}>
      ← Назад
    </Link>
    {/* Центр */}
    <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
      <div style={{
        fontFamily:"'plommir', Georgia, serif",
        fontSize: isMobile ? 'clamp(3rem, 10vw, 4rem)' : 'clamp(3.5rem, 8vw, 5.5rem)',
        background:'linear-gradient(90deg, #b3e7ef, #ef01cb, #9370db)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        letterSpacing:'12px', marginBottom:'6px'
      }}>Блог</div>
      <div style={{
        fontFamily:'Georgia, serif', fontStyle:'italic',
        color:'rgba(180,100,255,0.4)', fontSize:'0.8rem', letterSpacing:'4px',
        marginBottom:'28px'
      }}>· история · персонажи · размышления ·</div>
      {/* Разделитель */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', marginBottom:'24px' }}>
        <div style={{ height:'1px', width: isMobile ? '40px' : '80px', background:'linear-gradient(90deg, transparent, rgba(147,112,219,0.5))' }}/>
        <span style={{ color:'rgba(180,100,255,0.4)', fontSize:'0.7rem', letterSpacing:'6px' }}>✦ · ✦</span>
        <div style={{ height:'1px', width: isMobile ? '40px' : '80px', background:'linear-gradient(270deg, transparent, rgba(147,112,219,0.5))' }}/>
      </div>
      {/* Кнопки */}
      <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:50, pointerEvents:'all' }}>
        {[['posts','Посты'],['characters','Анкеты героев']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: isMobile ? '6px 16px' : '8px 28px',
            background: activeTab === tab ? 'rgba(147,112,219,0.2)' : 'rgba(147,112,219,0.06)',
            border: `1px solid ${activeTab === tab ? 'rgba(180,100,255,0.6)' : 'rgba(147,112,219,0.25)'}`,
            color: activeTab === tab ? '#e8d5ff' : 'rgba(200,185,230,0.7)',
            fontFamily:'sans-serif',
            fontSize: isMobile ? '0.5rem' : '0.6rem',
            letterSpacing:'3px', textTransform:'uppercase',
            cursor:'pointer', borderRadius:'2px',
            boxShadow: activeTab === tab ? '0 0 20px rgba(147,112,219,0.3)' : 'none',
            transition:'all 0.3s'
          }}>{label}</button>
        ))}
        {isAdmin && (
          <button onClick={() => router.push('/blog/create')} style={{
            padding: isMobile ? '6px 16px' : '8px 28px',
            background:'rgba(147,112,219,0.06)',
            border:'1px solid rgba(147,112,219,0.25)',
            color:'rgba(200,185,230,0.7)',
            fontFamily:'sans-serif',
            fontSize: isMobile ? '0.5rem' : '0.6rem',
            letterSpacing:'3px', textTransform:'uppercase',
            cursor:'pointer', borderRadius:'2px',
            transition:'all 0.3s'
          }}>+ Создать</button>
        )}
      </div>
    </div>
  </div>
) : (
  /* ===== СВЕТЛАЯ ШАПКА — ЗОЛОТО ===== */
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
    {/* Блок заголовка */}
    <div style={{ position:'relative', zIndex:1, flexShrink:0, marginBottom: isMobile ? '20px' : 0 }}>
      <div style={{
        fontFamily:"'victiriya', Georgia, serif",
        fontSize: isMobile ? '3rem' : '5.5rem',
        color:'#c9a84c',
        letterSpacing:'6px',
        fontWeight:400,
        lineHeight:1
      }}>Блог</div>
      <div style={{
        fontFamily:'Georgia, serif', fontStyle:'italic',
        color:'rgba(201,168,76,0.4)', fontSize:'0.75rem',
        letterSpacing:'3px', marginTop:'6px'
      }}>дневник историй</div>
    </div>
    {/* Разделитель */}
    {!isMobile && (
      <div style={{
        width:'1px', height:'60px', flexShrink:0,
        background:'linear-gradient(180deg, transparent, rgba(201,168,76,0.3), transparent)'
      }}/>
    )}
    {/* Кнопки */}
   <div style={{ position:'relative', zIndex:50, display:'flex', flexDirection: isMobile ? 'row' : 'column', gap:'8px', flexWrap:'wrap', pointerEvents:'all' }}>
      {[['posts','Посты'],['characters','Анкеты героев']].map(([tab, label]) => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{
          padding:'6px 20px',
          background:'transparent', border:'none',
          borderLeft: isMobile ? 'none' : `1px solid ${activeTab === tab ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`,
          borderBottom: isMobile ? `1px solid ${activeTab === tab ? '#c9a84c' : 'rgba(201,168,76,0.2)'}` : 'none',
          color: activeTab === tab ? '#c9a84c' : 'rgba(201,168,76,0.5)',
          fontFamily:'Georgia, serif',
          fontSize:'0.6rem', letterSpacing:'3px', textTransform:'uppercase',
          cursor:'pointer', textAlign:'left',
          paddingLeft: !isMobile && activeTab === tab ? '28px' : '20px',
          transition:'all 0.3s'
        }}>{label}</button>
      ))}
      {isAdmin && (
        <button onClick={() => router.push('/blog/create')} style={{
          padding:'6px 20px',
          background:'transparent', border:'none',
          borderLeft: isMobile ? 'none' : '1px solid rgba(201,168,76,0.2)',
          borderBottom: isMobile ? '1px solid rgba(201,168,76,0.2)' : 'none',
          color:'rgba(201,168,76,0.5)',
          fontFamily:'Georgia, serif',
          fontSize:'0.6rem', letterSpacing:'3px', textTransform:'uppercase',
          cursor:'pointer', textAlign:'left', transition:'all 0.3s'
        }}>+ Создать</button>
      )}
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

{/* КОНТЕНТ */}
<div style={{ position:'relative', zIndex:1 }}>
        {activeTab === 'posts' ? (
          <div className="space-y-8">
            {posts.length === 0 ? (
              <p className="text-center py-12 text-gray-400">Постов пока нет</p>
            ) : (
              posts.map(post => {
                const settings = isMobile ? post.mobile_settings : post.desktop_settings;
                
                return (
                  <div key={post.id} className="mb-8">
                    {/* ЗАГОЛОВОК */}
                    <h2 
                      className="mb-6"
                      style={{
                        fontFamily: settings?.title_font || 'ppelganger',
                        fontSize: `${settings?.title_size || 48}px`,
                        textAlign: settings?.text_align || 'left',
                        color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
                        lineHeight: '1.2'
                      }}
                    >
                      {post.title}
                    </h2>

                    {/* ТЕКСТ */}
                    <div 
                      style={{
                        fontFamily: settings?.content_font || 'ppelganger',
                        fontSize: `${settings?.content_size || 16}px`,
                        textAlign: settings?.text_align || 'left',
                        color: '#ffffff',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}
                    >
                      {post.content}
                    </div>

                    {/* ДАТА */}
                    <p className="text-sm text-gray-500 mt-6">
                      {new Date(post.created_at).toLocaleDateString('ru-RU')}
                    </p>

                    {/* КНОПКИ АДМИНА */}
                    {isAdmin && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => router.push(`/blog/edit/${post.id}`)}
                          className="px-4 py-2 rounded-lg text-sm font-bold"
                          style={{
                            background: 'rgba(147, 112, 219, 0.3)',
                            color: '#9370db'
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="px-4 py-2 rounded-lg text-sm font-bold"
                          style={{
                            background: 'rgba(220, 38, 38, 0.3)',
                            color: '#dc2626'
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {characters.map(char => (
 <CharacterCard 
  key={char.id} 
  character={char} 
  onClick={() => setSelectedCharacter(char)}
  isDarkTheme={isDarkTheme}
  isAdmin={isAdmin}
  router={router}
  deleteCharacter={deleteCharacter}
/>
            ))}
          </div>
)}
</div>
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

      {/* МОДАЛКА ПЕРСОНАЖА */}
{selectedCharacter && (
  <CharacterModal 
    character={selectedCharacter} 
    onClose={() => setSelectedCharacter(null)}
    isDarkTheme={isDarkTheme}
    selectedImage={selectedImage}
    setSelectedImage={setSelectedImage}
  />
)}
    </div>
  );
}

// КАРТОЧКА ПЕРСОНАЖА
function CharacterCard({ character, onClick, isDarkTheme, isAdmin, router, deleteCharacter }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
      className="cursor-pointer relative group"
style={{
  height: isExpanded ? '450px' : '400px',
  width: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  border: isDarkTheme ? '2px solid #9370db' : '1px solid #580823',
  transform: isExpanded ? 'scale(1.05)' : 'scale(1)',
  boxShadow: isExpanded 
    ? isDarkTheme 
      ? '0 20px 60px rgba(147, 112, 219, 0.6)' 
      : '0 20px 60px rgba(124, 6, 45, 0.6)'
    : 'none',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
}}
    >
      {/* ФОТО */}
      <img 
        src={character.main_image_url} 
        alt={character.name}
        className="w-full h-full object-cover"
        style={{
          filter: isExpanded ? 'brightness(0.7)' : 'brightness(1)',
          transition: 'filter 0.5s ease'
        }}
        crossOrigin="anonymous"
      />

      {/* КОНТЕНТ */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
        {!isExpanded ? (
          /* ИМЯ ВЕРТИКАЛЬНО */
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
  {character.name}
</p>
        ) : (
          /* ГОРИЗОНТАЛЬНЫЙ БЛОК ПРИ НАВЕДЕНИИ/КЛИКЕ */
          <div className="space-y-3" style={{
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h3 
              className="text-2xl font-bold"
              style={{
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
  {character.name}
</h3>
            
            {character.story_name && (
              <p className="text-sm text-gray-300" style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}>
                Из истории: <span className="font-bold">{character.story_name}</span>
              </p>
            )}
            
            {character.favorite_quote && (
              <p className="text-xs italic text-gray-400 line-clamp-2" style={{
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
              }}>
                "{character.favorite_quote}"
              </p>
            )}
            
<button
  onClick={handleDetailsClick}
  className="flex items-center gap-2 font-bold pointer-events-auto mt-2"
  style={{
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
<span className="text-xl" style={{
  animation: 'bounce 1s infinite',
  color: !isDarkTheme ? '#c9c6bb' : 'white',
  WebkitTextFillColor: !isDarkTheme ? '#c9c6bb' : 'white'
}}>→</span>
</button>
          </div>
        )}
      </div>

      {/* КНОПКИ АДМИНА */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-2 z-10 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/blog/edit-character/${character.id}`);
            }}
            className="px-3 py-1 rounded-lg text-xs font-bold hover:scale-110 transition"
            style={{
              background: 'rgba(147, 112, 219, 0.9)',
              color: '#ffffff'
            }}
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCharacter(character.id);
            }}
            className="px-3 py-1 rounded-lg text-xs font-bold hover:scale-110 transition"
            style={{
              background: 'rgba(220, 38, 38, 0.9)',
              color: '#ffffff'
            }}
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

// МОДАЛКА ПЕРСОНАЖА
function CharacterModal({ character, onClose, isDarkTheme, selectedImage, setSelectedImage }) {
  const galleryRef = useRef(null);
  const [galleryOpen, setGalleryOpen] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scrollGallery = (dir) => {
    if (!galleryRef.current) return;
    galleryRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const gallery = character.gallery_images || [];
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && galleryOpen < gallery.length - 1) setGalleryOpen(galleryOpen + 1);
      if (diff < 0 && galleryOpen > 0) setGalleryOpen(galleryOpen - 1);
    }
    touchStartX.current = null;
  };

  // ---- ТЁМНАЯ ТЕМА — МИСТИКА/ЗВЁЗДЫ ----
  if (isDarkTheme) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(6px)' }}>
      <style jsx global>{`
        @keyframes twinkle {
          0%,100% { opacity:0.15; } 50% { opacity:0.6; }
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .mystic-modal {
          animation: modalIn 0.4s cubic-bezier(0.4,0,0.2,1);
          background: radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 70%);
          border: 1px solid rgba(180,100,255,0.25);
          box-shadow: 0 0 80px rgba(147,50,255,0.15), inset 0 0 80px rgba(0,0,0,0.5);
          position: relative;
          overflow: hidden;
        }
        .mystic-modal::before {
          content:'';
          position:absolute; inset:0; pointer-events:none;
          background-image:
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 8%,  rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 67% 22%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 12%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 22% 55%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 85%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 5%  90%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 93% 80%, rgba(255,255,255,0.2) 0%, transparent 100%);
          animation: twinkle 4s ease-in-out infinite;
        }
        .mystic-scroll::-webkit-scrollbar { width:5px; }
        .mystic-scroll::-webkit-scrollbar-track { background:transparent; }
        .mystic-scroll::-webkit-scrollbar-thumb { background:rgba(180,100,255,0.3); border-radius:10px; }
      `}</style>

      <div className="mystic-modal rounded-2xl w-full max-w-3xl mystic-scroll"
        style={{ maxHeight:'92vh', overflowY:'auto' }}>

        {/* Кнопка закрыть */}
        <button onClick={onClose}
          style={{ position:'absolute', top:'14px', right:'14px', zIndex:10,
            background:'rgba(180,100,255,0.1)', border:'1px solid rgba(180,100,255,0.3)',
            borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer',
            color:'rgba(180,100,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X size={16}/>
        </button>

        {/* ВОТ ВЕРХНЯЯ ЧАСТЬ — фото + имя */}
        <div style={{ display:'flex', gap:'16px', padding: isMobile ? '20px 16px 12px' : '24px 24px 16px',
          flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start' }}>

          {/* Фото */}
          <div style={{ flexShrink:0, width: isMobile ? '140px' : '160px',
            height: isMobile ? '190px' : '220px', overflow:'hidden',
            border:'1px solid rgba(180,100,255,0.4)',
            boxShadow:'0 0 30px rgba(180,100,255,0.2), inset 0 0 20px rgba(0,0,0,0.5)',
            borderRadius:'4px' }}>
            <img src={character.main_image_url} alt={character.name}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          </div>

          {/* Имя + история */}
          <div style={{ display:'flex', flexDirection:'column', justifyContent:'center',
            textAlign: isMobile ? 'center' : 'left' }}>
            <div style={{ fontFamily:'Cinzel, serif', fontSize: isMobile ? '2rem' : '3rem',
              color:'rgba(180,100,255,0.25)', lineHeight:1, userSelect:'none' }}>✦</div>
            <h2 style={{ fontFamily:'Cinzel, serif',
              fontSize: isMobile ? '1.4rem' : '1.9rem',
              color:'#e8d5ff', letterSpacing:'3px', marginTop:'-6px', lineHeight:1.2 }}>
              {character.name}
            </h2>
            {character.story_name && (
              <p style={{ fontFamily:'Georgia, serif', fontStyle:'italic',
                color:'rgba(180,100,255,0.55)', fontSize:'0.8rem',
                letterSpacing:'1px', marginTop:'8px' }}>
                из истории «{character.story_name}»
              </p>
            )}
          </div>
        </div>

        {/* Разделитель */}
        <div style={{ textAlign:'center', color:'rgba(180,100,255,0.35)',
          fontSize:'0.75rem', letterSpacing:'8px', margin:'0 20px 16px',
          borderTop:'1px solid rgba(180,100,255,0.12)', paddingTop:'12px' }}>
          ✦ · · · ✦ · · · ✦
        </div>

        {/* Поля в 2 колонки */}
        <div style={{ display:'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          gap:'1px', background:'rgba(180,100,255,0.1)',
          margin:'0 20px 16px' }}>
          {[
            ['Фамилия', character.surname],
            ['Возраст', character.age],
            ['Знак зодиака', character.zodiac_sign],
            ['Рост', character.height],
            ['Вес', character.weight],
            ['Любимый цвет', character.favorite_color],
            ['Любимая еда', character.favorite_food],
            ['Что любит', character.likes],
          ].filter(([,v]) => v).map(([label, val]) => (
            <div key={label} style={{ background:'rgba(8,8,15,0.95)', padding:'10px 12px' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(180,100,255,0.55)', marginBottom:'3px' }}>{label}</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c0e8', fontFamily:'Georgia, serif' }}>{val}</div>
            </div>
          ))}
          {character.dislikes && (
            <div style={{ background:'rgba(8,8,15,0.95)', padding:'10px 12px',
              gridColumn: isMobile ? 'span 2' : 'span 4' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(180,100,255,0.55)', marginBottom:'3px' }}>Что ненавидит</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c0e8', fontFamily:'Georgia, serif' }}>{character.dislikes}</div>
            </div>
          )}
          {character.interesting_fact && (
            <div style={{ background:'rgba(8,8,15,0.95)', padding:'10px 12px',
              gridColumn: isMobile ? 'span 2' : 'span 4' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(180,100,255,0.55)', marginBottom:'3px' }}>Интересный факт</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c0e8', fontFamily:'Georgia, serif' }}>{character.interesting_fact}</div>
            </div>
          )}
          {character.backstory && (
            <div style={{ background:'rgba(8,8,15,0.95)', padding:'10px 12px',
              gridColumn: isMobile ? 'span 2' : 'span 4' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(180,100,255,0.55)', marginBottom:'3px' }}>Предыстория</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c0e8', fontFamily:'Georgia, serif', lineHeight:1.6 }}>{character.backstory}</div>
            </div>
          )}
        </div>

        {/* Цитата */}
        {character.favorite_quote && (
          <div style={{ margin:'0 20px 20px', textAlign:'center', fontStyle:'italic',
            color:'rgba(180,100,255,0.5)', fontSize:'0.85rem', lineHeight:1.7,
            fontFamily:'Georgia, serif', borderTop:'1px solid rgba(180,100,255,0.1)',
            paddingTop:'14px' }}>
            "{character.favorite_quote}"
          </div>
        )}

        {/* ГАЛЕРЕЯ */}
        {gallery.length > 0 && (
          <div style={{ margin:'0 20px 24px' }}>
            <div style={{ fontSize:'0.55rem', letterSpacing:'4px', textTransform:'uppercase',
              color:'rgba(180,100,255,0.4)', marginBottom:'10px', textAlign:'center' }}>
              ✦ галерея ✦
            </div>
            <div style={{ position:'relative' }}>
              <div ref={galleryRef} style={{ display:'flex', gap:'8px', overflowX:'auto',
                scrollbarWidth:'none', paddingBottom:'4px' }}>
                {gallery.map((img, i) => (
                  <div key={i} onClick={() => setGalleryOpen(i)}
                    style={{ flexShrink:0, width:'100px', height:'140px', cursor:'pointer',
                      border:'1px solid rgba(180,100,255,0.35)', borderRadius:'4px', overflow:'hidden',
                      boxShadow:'0 0 12px rgba(180,100,255,0.15)', transition:'transform 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </div>
                ))}
              </div>
              {!isMobile && gallery.length > 4 && (
                <>
                  <button onClick={()=>scrollGallery('left')} style={{ position:'absolute', left:'-20px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(180,100,255,0.6)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button onClick={()=>scrollGallery('right')} style={{ position:'absolute', right:'-20px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(180,100,255,0.6)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ЛАЙТБОКС */}
      {galleryOpen !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background:'rgba(0,0,0,0.97)', backdropFilter:'blur(8px)' }}
          onClick={() => setGalleryOpen(null)}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="relative flex items-center justify-center w-full max-w-2xl px-12"
            onClick={e=>e.stopPropagation()}>
            {!isMobile && galleryOpen > 0 && (
              <button onClick={()=>setGalleryOpen(galleryOpen-1)}
                style={{ position:'absolute', left:0, background:'none', border:'none', cursor:'pointer', color:'rgba(180,100,255,0.7)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
<img src={gallery[galleryOpen]} alt=""
             style={{ width: isMobile ? '85vw' : '360px', height: isMobile ? '70vw' : '520px', objectFit:'cover', borderRadius:'8px',
                border:'2px solid rgba(180,100,255,0.4)',
                boxShadow:'0 0 60px rgba(147,50,255,0.3)' }}/>
            {!isMobile && galleryOpen < gallery.length-1 && (
              <button onClick={()=>setGalleryOpen(galleryOpen+1)}
                style={{ position:'absolute', right:0, background:'none', border:'none', cursor:'pointer', color:'rgba(180,100,255,0.7)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )}
            <button onClick={()=>setGalleryOpen(null)}
             style={{ position:'absolute', top: isMobile ? '-36px' : '-40px', right:0, background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'50%', padding:'4px', cursor:'pointer', color:'#dccbe2' }}>
              <X size={24}/>
            </button>
            {gallery.length > 1 && (
              <div style={{ position:'absolute', bottom:'-28px', display:'flex', gap:'6px', left:'50%', transform:'translateX(-50%)' }}>
                {gallery.map((_,i)=>(
                  <div key={i} style={{ width: i===galleryOpen?'18px':'7px', height:'7px',
                    borderRadius:'4px', background: i===galleryOpen?'rgba(180,100,255,0.9)':'rgba(180,100,255,0.3)',
                    transition:'all 0.3s' }}/>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ---- СВЕТЛАЯ ТЕМА — ЛЮКС / ЗОЛОТО / ЦАРСКИЙ ----
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background:'rgba(0,0,0,0.85)', backdropFilter:'blur(4px)' }}>
<style jsx global>{`
        @keyframes goldShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes modalIn {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .gold-modal {
          animation: modalIn 0.4s cubic-bezier(0.4,0,0.2,1);
          background: #080808;
          border: 1px solid #2a2218;
          position: relative;
          overflow: hidden;
        }
        .gold-modal::before { display:none; }
        .gold-modal::after { display:none; }
        .gold-scroll::-webkit-scrollbar { width:7px; }
        .gold-scroll::-webkit-scrollbar-track { background:rgba(0,0,0,0.3); border-radius:10px; }
        .gold-scroll::-webkit-scrollbar-thumb { background:linear-gradient(135deg, #94896b 0%, #5f5744 100%); border-radius:10px; box-shadow:0 0 10px rgba(201,168,76,0.5); }
        .gold-scroll::-webkit-scrollbar-thumb:hover { background:linear-gradient(135deg, #beb292 0%, #c9ba91 100%); }
        .mystic-scroll::-webkit-scrollbar { width:7px; }
        .mystic-scroll::-webkit-scrollbar-track { background:rgba(0,0,0,0.3); border-radius:10px; }
        .mystic-scroll::-webkit-scrollbar-thumb { background:linear-gradient(135deg, #9370db 0%, #67327b 100%); border-radius:10px; box-shadow:0 0 10px rgba(147,112,219,0.8); }
        .mystic-scroll::-webkit-scrollbar-thumb:hover { background:linear-gradient(135deg, #b48dc4 0%, #9370db 100%); }
      `}</style>

      <div className="gold-modal gold-scroll rounded-sm w-full max-w-3xl"
        style={{ maxHeight:'92vh', overflowY:'auto' }}>

        <button onClick={onClose}
          style={{ position:'absolute', top:'16px', right:'16px', zIndex:10,
            background:'transparent', border:'1px solid rgba(201,168,76,0.3)',
            borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer',
            color:'rgba(201,168,76,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X size={15}/>
        </button>

        {/* Верхняя часть */}
        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'stretch' }}>

          {/* Фото */}
          <div style={{ flexShrink:0, width: isMobile ? '100%' : '180px',
            height: isMobile ? '200px' : '260px', overflow:'hidden', position:'relative' }}>
            <img src={character.main_image_url} alt={character.name}
              style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top' }}/>
            {!isMobile && (
              <div style={{ position:'absolute', inset:0,
                background:'linear-gradient(to right, transparent 50%, #080808)' }}/>
            )}
            {isMobile && (
              <div style={{ position:'absolute', inset:0,
                background:'linear-gradient(to bottom, transparent 50%, #080808)' }}/>
            )}
          </div>

          {/* Имя */}
          <div style={{ flex:1, padding: isMobile ? '0 24px 16px' : '32px 32px 16px',
            display:'flex', flexDirection:'column', justifyContent:'flex-end',
            textAlign: isMobile ? 'center' : 'left' }}>
            <h2 style={{ fontFamily:'Cinzel, serif',
              fontSize: isMobile ? '1.5rem' : '2rem',
              backgroundImage:'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 60%, #e8c060 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text',
              animation:'goldShimmer 4s linear infinite',
              letterSpacing:'3px', fontWeight:400 }}>
              {character.name}
            </h2>
            {character.story_name && (
              <p style={{ fontFamily:'Georgia, serif', fontStyle:'italic',
                color:'rgba(201,168,76,0.45)', fontSize:'0.75rem',
                letterSpacing:'2px', textTransform:'uppercase', marginTop:'8px' }}>
                из истории: {character.story_name}
              </p>
            )}
          </div>
        </div>

        {/* Орнамент */}
        <div style={{ textAlign:'center', color:'rgba(201,168,76,0.4)',
          fontSize:'1rem', letterSpacing:'10px', margin:'4px 0 16px',
          fontFamily:'serif' }}>
          ⚜ · · ⚜ · · ⚜
        </div>

        {/* Поля в сетке */}
        <div style={{ display:'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          gap:'1px', background:'#1a1508',
          margin:'0 24px 8px' }}>
          {[
            ['Фамилия', character.surname],
            ['Возраст', character.age],
            ['Знак зодиака', character.zodiac_sign],
            ['Рост', character.height],
            ['Вес', character.weight],
            ['Любимый цвет', character.favorite_color],
            ['Любимая еда', character.favorite_food],
            ['Что любит', character.likes],
          ].filter(([,v]) => v).map(([label, val]) => (
            <div key={label} style={{ background:'#080808', padding:'10px 12px' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(201,168,76,0.5)', marginBottom:'3px', fontFamily:'Cinzel, serif' }}>{label}</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c8b8', fontFamily:'Georgia, serif' }}>{val}</div>
            </div>
          ))}
          {character.dislikes && (
            <div style={{ background:'#080808', padding:'10px 12px',
              gridColumn: isMobile ? 'span 2' : 'span 4' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(201,168,76,0.5)', marginBottom:'3px', fontFamily:'Cinzel, serif' }}>Что ненавидит</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c8b8', fontFamily:'Georgia, serif' }}>{character.dislikes}</div>
            </div>
          )}
          {character.interesting_fact && (
            <div style={{ background:'#080808', padding:'10px 12px',
              gridColumn: isMobile ? 'span 2' : 'span 4' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(201,168,76,0.5)', marginBottom:'3px', fontFamily:'Cinzel, serif' }}>Интересный факт</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c8b8', fontFamily:'Georgia, serif' }}>{character.interesting_fact}</div>
            </div>
          )}
          {character.backstory && (
            <div style={{ background:'#080808', padding:'10px 12px',
              gridColumn: isMobile ? 'span 2' : 'span 4' }}>
              <div style={{ fontSize:'0.5rem', letterSpacing:'2px', textTransform:'uppercase',
                color:'rgba(201,168,76,0.5)', marginBottom:'3px', fontFamily:'Cinzel, serif' }}>Предыстория</div>
              <div style={{ fontSize:'0.9rem', color:'#d0c8b8', fontFamily:'Georgia, serif', lineHeight:1.6 }}>{character.backstory}</div>
            </div>
          )}
        </div>

        {/* Цитата */}
        {character.favorite_quote && (
          <div style={{ margin:'12px 24px 20px', textAlign:'center', fontStyle:'italic',
            color:'rgba(201,168,76,0.5)', fontSize:'0.85rem', lineHeight:1.7,
            fontFamily:'Georgia, serif', borderTop:'1px solid rgba(201,168,76,0.15)',
            paddingTop:'14px' }}>
            "{character.favorite_quote}"
          </div>
        )}

        {/* ГАЛЕРЕЯ */}
        {gallery.length > 0 && (
          <div style={{ margin:'0 24px 28px' }}>
            <div style={{ fontSize:'0.55rem', letterSpacing:'4px', textTransform:'uppercase',
              color:'rgba(201,168,76,0.4)', marginBottom:'10px', textAlign:'center',
              fontFamily:'Cinzel, serif' }}>
              ⚜ галерея ⚜
            </div>
            <div style={{ position:'relative' }}>
              <div ref={galleryRef} style={{ display:'flex', gap:'8px', overflowX:'auto',
                scrollbarWidth:'none', paddingBottom:'4px' }}>
                {gallery.map((img, i) => (
                  <div key={i} onClick={() => setGalleryOpen(i)}
                    style={{ flexShrink:0, width:'100px', height:'140px', cursor:'pointer',
                      border:'1px solid rgba(201,168,76,0.3)', borderRadius:'2px', overflow:'hidden',
                      transition:'transform 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  </div>
                ))}
              </div>
              {!isMobile && gallery.length > 4 && (
                <>
                  <button onClick={()=>scrollGallery('left')} style={{ position:'absolute', left:'-20px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(201,168,76,0.6)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button onClick={()=>scrollGallery('right')} style={{ position:'absolute', right:'-20px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(201,168,76,0.6)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ЛАЙТБОКС */}
      {galleryOpen !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background:'rgba(0,0,0,0.97)', backdropFilter:'blur(8px)' }}
          onClick={() => setGalleryOpen(null)}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="relative flex items-center justify-center w-full max-w-2xl px-12"
            onClick={e=>e.stopPropagation()}>
            {!isMobile && galleryOpen > 0 && (
              <button onClick={()=>setGalleryOpen(galleryOpen-1)}
                style={{ position:'absolute', left:0, background:'none', border:'none', cursor:'pointer', color:'rgba(201,168,76,0.7)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
          <img src={gallery[galleryOpen]} alt=""
             style={{ width: isMobile ? '60vw' : '360px', height: isMobile ? '90vw' : '520px', objectFit:'cover', borderRadius:'8px',
                border:'2px solid rgba(201,168,76,0.4)',
                boxShadow:'0 0 60px rgba(201,168,76,0.2)' }}/>
            {!isMobile && galleryOpen < gallery.length-1 && (
              <button onClick={()=>setGalleryOpen(galleryOpen+1)}
                style={{ position:'absolute', right:0, background:'none', border:'none', cursor:'pointer', color:'rgba(201,168,76,0.7)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )}
            <button onClick={()=>setGalleryOpen(null)}
             style={{ position:'absolute', top: isMobile ? '-36px' : '-40px', right:0, background:'rgba(0,0,0,0.5)', border:'none', borderRadius:'50%', padding:'4px', cursor:'pointer', color:'#c9c3b2' }}>
              <X size={24}/>
            </button>
            {gallery.length > 1 && (
              <div style={{ position:'absolute', bottom:'-28px', display:'flex', gap:'6px', left:'50%', transform:'translateX(-50%)' }}>
                {gallery.map((_,i)=>(
                  <div key={i} style={{ width: i===galleryOpen?'18px':'7px', height:'7px',
                    borderRadius:'4px', background: i===galleryOpen?'rgba(201,168,76,0.9)':'rgba(201,168,76,0.25)',
                    transition:'all 0.3s' }}/>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, isDark, style }) {
  return (
    <div style={style}>
      <p className="text-sm font-bold mb-1" style={{ color: isDark ? '#9370db' : '#c9c6bb' }}>
        {label}
      </p>
      <p className="text-white">{value}</p>
<style jsx global>{`
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

  @keyframes bounce {
    0%, 100% { 
      transform: translateX(0); 
    }
    50% { 
      transform: translateX(5px); 
    }
  }
    /* Скроллбар для модалки персонажа */
.dark-scroll::-webkit-scrollbar {
  width: 8px;
}
.dark-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
.dark-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #9370db 0%, #67327b 100%);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(147, 112, 219, 0.8);
}
.dark-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #b48dc4 0%, #9370db 100%);
  box-shadow: 0 0 15px rgba(180, 141, 196, 1);
}

.light-scroll::-webkit-scrollbar {
  width: 8px;
}
.light-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
.light-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #c9c6bb 0%, #65635d 100%);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(80, 79, 78, 0.6);
}
.light-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #c9c6bb 0%, #65635d 100%);
  box-shadow: 0 0 15px rgba(78, 77, 76, 0.8);
}
`}</style>
    </div>
  );
}