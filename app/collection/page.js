'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { supabaseUGC } from '@/lib/supabase-ugc';
import { ChevronLeft, Heart, Image as ImageIcon, X } from 'lucide-react';

export default function CollectionPage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [collectionTab, setCollectionTab] = useState('favorites');
  const [userFavorites, setUserFavorites] = useState([]);
  const [userGallery, setUserGallery] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  const showConfirm = (message, action = null) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  // Синхронизация темы
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkTheme(false);
    }
  }, []);

  // Проверка пользователя
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        loadUserCollection(user.id);
      } else {
        window.location.href = '/';
      }
    };
    checkUser();
  }, []);

  const loadUserCollection = async (userId) => {
    setLoading(true);
    try {
      // Избранное
      const { data: favs } = await supabaseUGC
        .from('user_favorites')
        .select('work_id')
        .eq('user_id', userId);
      
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setUserGallery(images || []);
    } catch (err) {
      console.error('Ошибка загрузки коллекции:', err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-white" style={{ 
      backgroundColor: isDarkTheme ? '#000000' : '#000000' 
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        /* Скроллбар - ТЕМНАЯ ТЕМА */
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
        /* Скроллбар - СВЕТЛАЯ ТЕМА */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #c9c6bb 0%, #c9c6bb 100%);
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(194, 171, 117, 0.6);
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #c9c6bb 0%, #c9c6bb 100%);
          box-shadow: 0 0 15px rgba(216, 197, 162, 0.8);
        }
        `}

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
      На главную
    </Link>
    
    <button
      onClick={() => window.history.back()}
      className="p-2 rounded-full transition"
      style={{
        color: isDarkTheme ? '#916eb4' : '#c9c6bb',
        textShadow: isDarkTheme ? '0 0 10px #916eb4' : 'none'
      }}
      onMouseEnter={(e) => {
        if (isDarkTheme) {
          e.currentTarget.style.textShadow = '0 0 20px #916eb4';
        }
      }}
      onMouseLeave={(e) => {
        if (isDarkTheme) {
          e.currentTarget.style.textShadow = '0 0 10px #916eb4';
        }
      }}
    >
      <X size={24} />
    </button>
  </div>
</header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ 
              borderColor: isDarkTheme ? '#c084fc' : '#c9c6bb' 
            }}></div>
          </div>
        ) : (
          <>
            {/* ЗАГОЛОВОК */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: isDarkTheme ? 'transparent' : 'transparent',
              backgroundImage: isDarkTheme 
                ? 'linear-gradient(90deg, #9370db 0%, #ffffff 50%, #9370db 100%)'
                : 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)',
              backgroundSize: isDarkTheme ? '200% auto' : '100% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: isDarkTheme ? 'shimmerTab 3s linear infinite' : 'none',
              fontStyle: !isDarkTheme ? 'italic' : 'normal'
            }}>
              Моя коллекция
            </h1>

            {/* ТАБЫ */}
            <div className="flex border-b overflow-x-auto flex-shrink-0 mb-8" style={{
              borderColor: isDarkTheme ? '#374151' : 'rgba(180, 154, 95, 0.3)'
            }}>
              {[
                { key: 'favorites', label: 'Избранное', icon: Heart },
                { key: 'gallery', label: 'Галерея', icon: ImageIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCollectionTab(key)}
                  className="flex-1 min-w-[100px] px-3 sm:px-6 py-3 sm:py-4 font-semibold transition text-center whitespace-nowrap"
                  style={{
                    background: collectionTab === key 
                      ? (isDarkTheme ? 'linear-gradient(135deg, #a063cf 0%, #7c3aad 100%)' : 'rgba(194, 171, 117, 0.2)')
                      : 'transparent',
                    borderBottom: collectionTab === key && !isDarkTheme ? '2px solid #c9c6bb' : 'none'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon size={16} className="sm:w-5 sm:h-5" style={{ 
                      color: collectionTab === key 
                        ? (isDarkTheme ? '#b3e7ef' : '#c9c6bb')
                        : (isDarkTheme ? '#666' : '#c9c6bb')
                    }} />
                    <span className={`text-xs sm:text-base ${collectionTab === key && isDarkTheme ? 'tab-shimmer' : ''}`} style={{
                      color: collectionTab === key && !isDarkTheme ? '#c9c6bb' : (collectionTab !== key && !isDarkTheme ? '#958150' : '')
                    }}>
                      {label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* КОНТЕНТ */}
            <div>
              {collectionTab === 'favorites' && (
                <div>
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4" style={{
                    color: isDarkTheme ? '#d1d5db' : '#c9c6bb'
                  }}>
                    Избранные работы ({userFavorites.length})
                  </h3>
                  {userFavorites.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 rounded-lg" style={{
                      background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                      border: isDarkTheme ? '1px solid rgba(239, 1, 203, 0.2)' : '1px solid rgba(180, 154, 95, 0.3)'
                    }}>
                      <Heart size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
                        color: isDarkTheme ? 'rgba(239, 1, 203, 0.3)' : 'rgba(194, 171, 117, 0.5)'
                      }} />
                      <p className="text-sm sm:text-base" style={{
                        color: isDarkTheme ? '#ffffff' : '#c9c6bb'
                      }}>У вас пока нет избранных работ</p>
                    </div>
                  ) : (
 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {userFavorites.map((work) => (
                        <div
                          key={work.id}
                          className="rounded-lg overflow-hidden transition hover:scale-105 relative group"
                          style={{ 
                            border: isDarkTheme ? '2px solid #ef01cb' : '2px solid #c9c6bb',
                            boxShadow: isDarkTheme ? '0 0 15px rgba(239, 1, 203, 0.4)' : 'none'
                          }}
                        >
                          <Link href={`/work/${work.id}`}>
                            <div className="aspect-[2/3] relative" style={{
                              background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.5)'
                            }}>
                              {work.cover_url && (
                                <img src={work.cover_url} alt={work.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                            
                            <div className="p-3 sm:p-4" style={{
                              background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.8)'
                            }}>
                              <h4 className="font-semibold text-xs sm:text-base mb-1 sm:mb-2 line-clamp-2" style={{
                                color: isDarkTheme ? '#ffffff' : '#c9c6bb'
                              }}>{work.title}</h4>
                              <p className="text-xs line-clamp-2" style={{
                                color: isDarkTheme ? '#9ca3af' : '#c9c6bb'
                              }}>{work.description}</p>
                            </div>
                          </Link>
                          
              // Замените эту часть кода в кнопке удаления:

<button
  onClick={async () => {
    showConfirm('Удалить из избранного?', async () => {
      try {
        await supabaseUGC.from('user_favorites').delete()
          .eq('user_id', user.id)
          .eq('work_id', work.id);
        
        // Сразу обновляем состояние, убирая удалённую работу
        setUserFavorites(prev => prev.filter(w => w.id !== work.id));
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    });
  }}
  className="absolute top-1 right-1 sm:top-2 sm:right-2 rounded-full p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition"
  style={{
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #ef01cb 0%, #bc0897 100%)'
      : 'linear-gradient(135deg, #65635d 0%, #65635d 100%)',
    boxShadow: isDarkTheme 
      ? '0 0 15px rgba(239, 1, 203, 0.8)'
      : '0 0 15px rgba(194, 171, 117, 0.8)'
  }}
>
  <X size={12} className="sm:w-4 sm:h-4" color={isDarkTheme ? '#fff' : '#000'} />
</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {collectionTab === 'gallery' && (
                <div>
                  <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4" style={{
                    color: isDarkTheme ? '#d1d5db' : '#c9c6bb'
                  }}>
                    Галерея ({userGallery.length})
                  </h3>
                  {userGallery.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 rounded-lg" style={{
                      background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                      border: isDarkTheme ? '1px solid rgba(239, 1, 203, 0.2)' : '1px solid rgba(180, 154, 95, 0.3)'
                    }}>
                      <ImageIcon size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
                        color: isDarkTheme ? 'rgba(239, 1, 203, 0.3)' : 'rgba(194, 171, 117, 0.5)'
                      }} />
                      <p className="text-sm sm:text-base" style={{
                        color: isDarkTheme ? '#ffffff' : '#c9c6bb'
                      }}>У вас пока нет сохранённых изображений</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {userGallery.map((img) => (
                        <div key={img.id} className="aspect-[3/4] rounded-lg overflow-hidden relative group" style={{
                          border: isDarkTheme ? '2px solid #a855f7' : '2px solid #c9c6bb'
                        }}>
                          <img src={img.image_url} alt="Saved" className="w-full h-full object-cover" />
    <button
  onClick={() => {
    showConfirm('Удалить изображение?', async () => {
      try {
        await supabaseUGC.from('saved_images').delete().eq('id', img.id);
        
        // Сразу обновляем состояние, убирая удалённое изображение
        setUserGallery(prev => prev.filter(i => i.id !== img.id));
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    });
  }}
  className="absolute top-1 right-1 sm:top-2 sm:right-2 rounded-full p-1 sm:p-2 opacity-0 group-hover:opacity-100 transition"
  style={{
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #ef01cb 0%, #bc0897 100%)'
      : 'linear-gradient(135deg, #65635d 0%, #65635d 100%)',
    boxShadow: isDarkTheme 
      ? '0 0 15px rgba(239, 1, 203, 0.8)'
      : '0 0 15px rgba(194, 171, 117, 0.8)'
  }}
>
  <X size={12} className="sm:w-4 sm:h-4" color={isDarkTheme ? '#fff' : '#000'} />
</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ - ТЕМНАЯ ТЕМА */}
      {showConfirmModal && isDarkTheme && (
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

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ - СВЕТЛАЯ ТЕМА */}
      {showConfirmModal && !isDarkTheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="rounded-2xl w-full max-w-md p-6 relative" style={{
            background: 'radial-gradient(ellipse at center, #000000%, #000000 100%)',
            border: '3px solid transparent',
            borderRadius: '16px',
            backgroundClip: 'padding-box',
            boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.6)'
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
            
            <p className="text-center text-base sm:text-lg mb-6 whitespace-pre-wrap" style={{
              color: '#c9c6bb'
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
                      background: '#c9c6bb',
                      color: '#000000',
                      boxShadow: '0 0 15px rgba(216, 197, 162, 0.4)'
                    }}
                  >
                    Да
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold transition"
                    style={{
                      background: 'rgba(216, 197, 162, 0.15)',
                      border: '2px solid #c9c6bb',
                      color: '#c9c6bb'
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
                    background: '#c9c6bb',
                    color: '#000000',
                    boxShadow: '0 0 15px rgba(216, 197, 162, 0.4)'
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