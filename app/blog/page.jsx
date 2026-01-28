'use client';
import { useState, useEffect } from 'react';
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
  
  const { error } = await supabaseBlog
    .from('blog_posts')
    .delete()
    .eq('id', id);
  
  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    loadPosts(); // перезагружаем список
  }
};

const deleteCharacter = async (id) => {
  if (!confirm('Точно удалить персонажа?')) return;
  
  const { error } = await supabaseBlog
    .from('character_profiles')
    .delete()
    .eq('id', id);
  
  if (error) {
    alert('Ошибка: ' + error.message);
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

      {/* HEADER */}
<div className="max-w-7xl mx-auto px-4 py-8">
{/* КНОПКА НАЗАД */}
<Link 
  href="/" 
  className="inline-flex items-center gap-1 px-2 py-1 sm:gap-2 sm:px-4 rounded-lg flex-shrink-0 text-sm transition-all duration-300"
  style={{
    background: isDarkTheme ? 'rgba(111, 53, 156, 0.4)' : 'rgba(0, 0, 0, 0.6)',
    border: isDarkTheme ? '2px solid #a063cf94' : 'none',
    backdropFilter: isDarkTheme ? 'blur(10px)' : 'none',
    borderRadius: isDarkTheme ? '12px' : '0',
    clipPath: !isDarkTheme ? 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' : 'none',
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
  Назад
</Link>

  <div className="mb-8">
    {/* УБРАЛИ ОТСЮДА КНОПКУ */}
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
      Блог
    </span>
  ) : (
    'Блог'.split('').map((char, index) => (
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
  </div>

{/* ТАБЫ - УБРАТЬ ЛЕТУЧИХ МЫШЕЙ */}
<div className="flex gap-4 mb-8 items-center">
  <button
    onClick={() => setActiveTab('posts')}
    className={isDarkTheme ? (activeTab === 'posts' ? 'tab-btn-active' : 'tab-btn-inactive') : ''}
    style={{
      background: isDarkTheme 
        ? 'rgba(111, 53, 156, 0.4)'
        : activeTab === 'posts' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
      border: isDarkTheme ? '2px solid' : 'none',
      borderColor: isDarkTheme ? (activeTab === 'posts' ? '#ef01cb85' : '#a063cf94') : 'transparent',
      backdropFilter: isDarkTheme ? 'blur(10px)' : 'none',
      boxShadow: isDarkTheme && activeTab === 'posts' ? '0 0 25px rgba(239, 1, 203, 0.44)' : 'none',
      borderRadius: isDarkTheme ? '12px' : '0',
padding: isDarkTheme 
  ? (isMobile ? '0.4rem 0.8rem' : 'clamp(0.5rem, 2vw, 0.8rem) clamp(1rem, 4vw, 2.5rem)')
  : (isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem'),
fontSize: isDarkTheme 
  ? (isMobile ? '0.5rem' : 'clamp(0.5rem, 1.5vw, 0.6875rem)')
  : (isMobile ? '0.5rem' : '0.6rem'),
      fontWeight: '700',
      letterSpacing: isDarkTheme ? 'clamp(0.1rem, 0.5vw, 0.3rem)' : '0.2rem',
      position: 'relative',
      textTransform: 'uppercase',
      cursor: 'pointer',
      clipPath: !isDarkTheme ? 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' : 'none',
      display: !isDarkTheme ? 'flex' : 'block',
      flexDirection: !isDarkTheme ? 'column' : 'row',
      alignItems: !isDarkTheme ? 'center' : 'normal',
      gap: !isDarkTheme ? '0.05rem' : '0',
      transition: 'all 0.3s ease',
      color: '#ffffff',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
    }}
    onMouseEnter={(e) => {
      if (isDarkTheme && activeTab !== 'posts') {
        e.currentTarget.style.borderColor = '#fff';
        e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      if (isDarkTheme && activeTab !== 'posts') {
        e.currentTarget.style.borderColor = '#a063cf94';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }}
  >
    Посты
  </button>
  
  <button
    onClick={() => setActiveTab('characters')}
    className={isDarkTheme ? (activeTab === 'characters' ? 'tab-btn-active' : 'tab-btn-inactive') : ''}
    style={{
      background: isDarkTheme 
        ? 'rgba(111, 53, 156, 0.4)'
        : activeTab === 'characters' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)',
      border: isDarkTheme ? '2px solid' : 'none',
      borderColor: isDarkTheme ? (activeTab === 'characters' ? '#ef01cb85' : '#a063cf94') : 'transparent',
      backdropFilter: isDarkTheme ? 'blur(10px)' : 'none',
      boxShadow: isDarkTheme && activeTab === 'characters' ? '0 0 25px rgba(239, 1, 203, 0.44)' : 'none',
      borderRadius: isDarkTheme ? '12px' : '0',
padding: isDarkTheme 
  ? (isMobile ? '0.4rem 0.8rem' : 'clamp(0.5rem, 2vw, 0.8rem) clamp(1rem, 4vw, 2.5rem)')
  : (isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem'),
fontSize: isDarkTheme 
  ? (isMobile ? '0.5rem' : 'clamp(0.5rem, 1.5vw, 0.6875rem)')
  : (isMobile ? '0.5rem' : '0.6rem'),
      fontWeight: '700',
      letterSpacing: isDarkTheme ? 'clamp(0.1rem, 0.5vw, 0.3rem)' : '0.2rem',
      position: 'relative',
      textTransform: 'uppercase',
      cursor: 'pointer',
      clipPath: !isDarkTheme ? 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' : 'none',
      display: !isDarkTheme ? 'flex' : 'block',
      flexDirection: !isDarkTheme ? 'column' : 'row',
      alignItems: !isDarkTheme ? 'center' : 'normal',
      gap: !isDarkTheme ? '0.05rem' : '0',
      transition: 'all 0.3s ease',
      color: '#ffffff',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
    }}
    onMouseEnter={(e) => {
      if (isDarkTheme && activeTab !== 'characters') {
        e.currentTarget.style.borderColor = '#fff';
        e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      if (isDarkTheme && activeTab !== 'characters') {
        e.currentTarget.style.borderColor = '#a063cf94';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }}
  >
    Анкеты героев
  </button>
  
  {isAdmin && (
    <button
      onClick={() => router.push('/blog/create')}
      className={isDarkTheme ? 'tab-btn-inactive' : ''}
      style={{
        background: isDarkTheme ? 'rgba(111, 53, 156, 0.4)' : 'rgba(0, 0, 0, 0.6)',
        border: isDarkTheme ? '2px solid #a063cf94' : 'none',
        backdropFilter: isDarkTheme ? 'blur(10px)' : 'none',
        borderRadius: isDarkTheme ? '12px' : '0',
padding: isDarkTheme 
  ? (isMobile ? '0.4rem 0.8rem' : 'clamp(0.5rem, 2vw, 0.8rem) clamp(1rem, 4vw, 2.5rem)')
  : (isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem'),
fontSize: isDarkTheme 
  ? (isMobile ? '0.5rem' : 'clamp(0.5rem, 1.5vw, 0.6875rem)')
  : (isMobile ? '0.5rem' : '0.6rem'),
        fontWeight: '700',
        letterSpacing: isDarkTheme ? 'clamp(0.1rem, 0.5vw, 0.3rem)' : '0.2rem',
        position: 'relative',
        textTransform: 'uppercase',
        cursor: 'pointer',
        clipPath: !isDarkTheme ? 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' : 'none',
        transition: 'all 0.3s ease',
        color: '#ffffff',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
      }}
      onMouseEnter={(e) => {
        if (isDarkTheme) {
          e.currentTarget.style.borderColor = '#fff';
          e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (isDarkTheme) {
          e.currentTarget.style.borderColor = '#a063cf94';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      + Создать
    </button>
  )}
</div>

{/* КОНТЕНТ */}
        {activeTab === 'posts' ? (
          <div className="space-y-8">
            {posts.length === 0 ? (
              <p className="text-center py-12 text-gray-400">Постов пока нет</p>
            ) : (
              posts.map(post => {
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
      <div 
        className={`rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 border-2 ${isDarkTheme ? 'dark-scroll' : 'light-scroll'}`}
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          borderColor: isDarkTheme ? '#9333ea' : '#c9c6bb'
        }}
      >
        <div className="flex justify-between items-start mb-6">
<h2 className="text-3xl font-bold" style={{
  color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
  fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
}}>
  {character.name}
</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* ФОТО СЛЕВА */}
          <div className="col-span-1">
            <img 
              src={character.main_image_url} 
              alt={character.name}
              className="w-full rounded-lg"
            />
          </div>

          {/* ИНФО СПРАВА */}
          <div className="col-span-2 space-y-4">
            {character.story_name && <InfoField label="Из истории" value={character.story_name} isDark={isDarkTheme} />}
            {character.surname && <InfoField label="Фамилия" value={character.surname} isDark={isDarkTheme} />}
            {character.age && <InfoField label="Возраст" value={character.age} isDark={isDarkTheme} />}
            {character.zodiac_sign && <InfoField label="Знак зодиака" value={character.zodiac_sign} isDark={isDarkTheme} />}
            {character.height && <InfoField label="Рост" value={character.height} isDark={isDarkTheme} />}
            {character.weight && <InfoField label="Вес" value={character.weight} isDark={isDarkTheme} />}
            {character.favorite_color && <InfoField label="Любимый цвет" value={character.favorite_color} isDark={isDarkTheme} />}
            {character.favorite_food && <InfoField label="Любимая еда" value={character.favorite_food} isDark={isDarkTheme} />}
            {character.likes && <InfoField label="Что любит" value={character.likes} isDark={isDarkTheme} />}
            {character.dislikes && <InfoField label="Что ненавидит" value={character.dislikes} isDark={isDarkTheme} />}
            {character.favorite_quote && <InfoField label="Любимая цитата" value={character.favorite_quote} isDark={isDarkTheme} />}
            {character.interesting_fact && <InfoField label="Интересный факт" value={character.interesting_fact} isDark={isDarkTheme} />}
            {character.backstory && <InfoField label="Предыстория" value={character.backstory} isDark={isDarkTheme} />}
          </div>
        </div>

{/* ГАЛЕРЕЯ */}
        {character.gallery_images?.length > 0 && (
          <div className="mt-6">
<h3 className="text-lg font-bold mb-4" style={{ 
  color: isDarkTheme ? '#9370db' : '#c9c6bb',
  fontFamily: isDarkTheme ? 'plommir' : 'kikamori'
}}>
  Галерея
</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {character.gallery_images.map((img, i) => (
                <div 
                  key={i} 
                  className="rounded-lg overflow-hidden border-2 cursor-pointer transition"
                  style={{
                    aspectRatio: '2/3',
                    borderColor: isDarkTheme ? '#9370db' : '#c9c6bb'
                  }}
                  onClick={() => setSelectedImage(img)}
                >
                  <img 
                    src={img} 
                    alt={`Gallery ${i + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, isDark }) {
  return (
    <div>
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