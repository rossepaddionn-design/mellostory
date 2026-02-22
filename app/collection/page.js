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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { setUser(user); loadUserCollection(user.id); }
      else window.location.href = '/';
    };
    checkUser();
  }, []);

  const loadUserCollection = async (userId) => {
    setLoading(true);
    try {
      const { data: favs } = await supabaseUGC.from('user_favorites').select('work_id').eq('user_id', userId);
      if (favs && favs.length > 0) {
        const workIds = favs.map(f => f.work_id);
        const { data: works } = await supabase.from('works').select('id, title, cover_url, description').in('id', workIds);
        setUserFavorites(works || []);
      }
      const { data: images } = await supabaseUGC.from('saved_images').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setUserGallery(images || []);
    } catch (err) { console.error('Ошибка загрузки коллекции:', err); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#000000' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes colShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes colTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.6; } }
        @keyframes colGoldShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes colCardGlow { 0%,100% { box-shadow: 0 0 8px rgba(239,1,203,0.3); } 50% { box-shadow: 0 0 22px rgba(239,1,203,0.7); } }
        @keyframes colCardGoldGlow { 0%,100% { box-shadow: 0 0 6px rgba(201,168,76,0.2); } 50% { box-shadow: 0 0 16px rgba(201,168,76,0.5); } }

        .col-dark-scroll::-webkit-scrollbar { width: 4px; }
        .col-dark-scroll::-webkit-scrollbar-track { background: transparent; }
        .col-dark-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#9370db,#ef01cb,#9370db); border-radius:10px; box-shadow: 0 0 8px rgba(147,112,219,0.8); }
        .col-dark-scroll { scrollbar-width: thin; scrollbar-color: #9370db transparent; }

        .col-light-scroll::-webkit-scrollbar { width: 4px; }
        .col-light-scroll::-webkit-scrollbar-track { background: transparent; }
        .col-light-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,transparent,#c9a84c,transparent); border-radius:10px; box-shadow: 0 0 6px rgba(201,168,76,0.5); }
        .col-light-scroll { scrollbar-width: thin; scrollbar-color: #c9a84c transparent; }

        /* Звёзды фона */
        .col-stars { background-image:
          radial-gradient(1px 1px at 5% 12%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 90%, rgba(255,255,255,0.2) 0%, transparent 100%),
          radial-gradient(1px 1px at 78% 55%, rgba(255,255,255,0.25) 0%, transparent 100%),
          radial-gradient(1px 1px at 18% 70%, rgba(255,255,255,0.15) 0%, transparent 100%),
          radial-gradient(1px 1px at 60% 30%, rgba(255,255,255,0.2) 0%, transparent 100%);
          animation: colTwinkle 7s ease-in-out infinite; pointer-events: none; }

        /* Таб-кнопки hover */
        .col-tab-dark:hover { background: rgba(147,112,219,0.1) !important; }
        .col-tab-light:hover { background: rgba(201,168,76,0.06) !important; }

        /* Карточки избранного */
        .fav-card-dark { transition: transform 0.2s, box-shadow 0.2s; }
        .fav-card-dark:hover { transform: translateY(-3px); box-shadow: 0 0 30px rgba(239,1,203,0.4) !important; }
        .fav-card-light { transition: transform 0.2s, box-shadow 0.2s; }
        .fav-card-light:hover { transform: translateY(-3px); box-shadow: 0 0 20px rgba(201,168,76,0.25) !important; }

        /* Карточки галереи */
        .gal-card-dark:hover .gal-del-btn { opacity: 1 !important; }
        .gal-card-light:hover .gal-del-btn { opacity: 1 !important; }
        .fav-card-dark:hover .gal-del-btn { opacity: 1 !important; }
        .fav-card-light:hover .gal-del-btn { opacity: 1 !important; }
      `}} />

      {/* ═══════════════════════════════ HEADER ═══════════════════════════════ */}
      <header style={{
        borderBottom: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.2)'}`,
        backgroundColor: '#000000', padding: '12px 24px', position: 'relative'
      }}>
        {isDarkTheme && (
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1px',
            background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,#9370db,transparent)'}}/>
        )}
        {!isDarkTheme && (
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1px',
            background:'linear-gradient(90deg,transparent,#c9a84c,transparent)'}}/>
        )}
        <div style={{maxWidth:'1100px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <Link href="/" style={{
            display:'inline-flex',alignItems:'center',gap:'6px',
            color: isDarkTheme ? 'rgba(147,112,219,0.6)' : 'rgba(201,168,76,0.5)',
            fontFamily:'Cinzel,serif',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',letterSpacing:'2px',
            textDecoration:'none',transition:'color 0.2s'
          }}>
            <ChevronLeft size={14}/> На главную
          </Link>
          <button onClick={() => window.history.back()} style={{
            background:'transparent',
            border: isDarkTheme ? '1px solid rgba(180,100,255,0.25)' : '1px solid rgba(201,168,76,0.2)',
            borderRadius:'50%',width:'30px',height:'30px',cursor:'pointer',
            color: isDarkTheme ? 'rgba(180,100,255,0.6)' : 'rgba(201,168,76,0.5)',
            display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'
          }}>
            <X size={14}/>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════ MAIN ═══════════════════════════════ */}
      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'clamp(20px,4vw,48px) clamp(14px,4vw,24px)',position:'relative'}}>

        {/* Звёзды / водяной знак */}
        {isDarkTheme && <div className="col-stars" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>}
        {!isDarkTheme && (
          <div style={{position:'fixed',bottom:'5%',right:'2%',fontFamily:'serif',fontSize:'clamp(12rem,25vw,20rem)',
            color:'rgba(201,168,76,0.02)',pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>
        )}

        {loading ? (
          <div style={{textAlign:'center',padding:'80px 20px',position:'relative',zIndex:1}}>
            <div style={{
              display:'inline-block',width:'40px',height:'40px',borderRadius:'50%',
              borderTop: isDarkTheme ? '2px solid #9370db' : '2px solid #c9a84c',
              borderRight: isDarkTheme ? '2px solid #ef01cb' : '2px solid rgba(201,168,76,0.4)',
              borderBottom:'2px solid transparent',borderLeft:'2px solid transparent',
              animation:'spin 1s linear infinite'
            }}/>
          </div>
        ) : (
          <div style={{position:'relative',zIndex:1}}>

            {/* ── ЗАГОЛОВОК ── */}
            <div style={{textAlign:'center',marginBottom:'clamp(24px,5vw,40px)'}}>
              {isDarkTheme ? (
                <>
                  <div style={{fontSize:'clamp(1rem,3vw,1.4rem)',color:'rgba(180,100,255,0.35)',marginBottom:'8px'}}>✦</div>
                  <h1 style={{
                    fontFamily:'Cinzel,serif',fontSize:'clamp(1.2rem,4vw,1.8rem)',letterSpacing:'clamp(4px,1.5vw,8px)',
                    background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',backgroundSize:'200% auto',
                    WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                    animation:'colShimmer 4s linear infinite',margin:0
                  }}>Моя коллекция</h1>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginTop:'10px'}}>
                    <div style={{height:'1px',width:'50px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
                    <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'5px'}}>✦ · · · ✦</span>
                    <div style={{height:'1px',width:'50px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
                  </div>
                </>
              ) : (
                <>
                  <h1 style={{
                    fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.8rem,6vw,2.8rem)',
                    backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
                    backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                    animation:'colGoldShimmer 4s linear infinite',letterSpacing:'4px',margin:0
                  }}>Моя коллекция</h1>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'10px',justifyContent:'center'}}>
                    <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
                    <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
                    <div style={{height:'1px',width:'80px',background:'linear-gradient(270deg,rgba(201,168,76,0.5),transparent)'}}/>
                  </div>
                </>
              )}
            </div>

            {/* ── ТАБЫ ── */}
            <div style={{
              display:'flex',marginBottom:'clamp(20px,4vw,32px)',
              borderBottom: isDarkTheme ? '1px solid rgba(147,112,219,0.2)' : '1px solid rgba(201,168,76,0.15)',
              position:'relative'
            }}>
              {[
                { key: 'favorites', label: 'Избранное', icon: Heart, symbol: isDarkTheme ? '✦' : '⚜' },
                { key: 'gallery', label: 'Галерея', icon: ImageIcon, symbol: isDarkTheme ? '✦' : '⚜' },
              ].map(({ key, label, icon: Icon, symbol }) => {
                const active = collectionTab === key;
                return (
                  <button key={key} onClick={() => setCollectionTab(key)}
                    className={isDarkTheme ? 'col-tab-dark' : 'col-tab-light'}
                    style={{
                      flex:1,padding:'clamp(10px,2vw,14px) 12px',background:'transparent',border:'none',
                      cursor:'pointer',position:'relative',transition:'background 0.2s',
                      borderRadius:'4px 4px 0 0'
                    }}>
                    {active && (
                      <div style={{
                        position:'absolute',bottom:'-1px',left:0,right:0,height:'2px',
                        background: isDarkTheme
                          ? 'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)'
                          : 'linear-gradient(90deg,transparent,#c9a84c,transparent)'
                      }}/>
                    )}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                      <Icon size={14} style={{
                        color: active
                          ? (isDarkTheme ? '#b3e7ef' : '#c9a84c')
                          : (isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)')
                      }}/>
                      <span style={{
                        fontFamily:'Cinzel,serif',fontSize:'clamp(0.58rem,1.4vw,0.7rem)',letterSpacing:'3px',
                        textTransform:'uppercase',
                        ...(active && isDarkTheme ? {
                          background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',backgroundSize:'200% auto',
                          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                          animation:'colShimmer 4s linear infinite'
                        } : {}),
                        ...(active && !isDarkTheme ? {
                          background:'linear-gradient(90deg,#c9a84c,#f0d080,#c9a84c)',backgroundSize:'200% auto',
                          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                          animation:'colGoldShimmer 4s linear infinite'
                        } : {}),
                        ...(!active ? {color: isDarkTheme ? 'rgba(147,112,219,0.35)' : 'rgba(201,168,76,0.3)'} : {})
                      }}>
                        {active ? `${symbol} ${label}` : label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ══════════════ ИЗБРАННОЕ ══════════════ */}
            {collectionTab === 'favorites' && (
              <div>
                {/* Подзаголовок */}
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'clamp(14px,3vw,22px)'}}>
                  <div style={{height:'1px',flex:1,background: isDarkTheme
                    ? 'linear-gradient(90deg,rgba(239,1,203,0.3),transparent)'
                    : 'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)'}}/>
                  <p style={{
                    fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',
                    color: isDarkTheme ? 'rgba(180,100,255,0.4)' : 'rgba(201,168,76,0.4)',
                    textTransform:'uppercase',whiteSpace:'nowrap'
                  }}>
                    {isDarkTheme ? '✦' : '⚜'} Избранных работ: {userFavorites.length}
                  </p>
                  <div style={{height:'1px',flex:1,background: isDarkTheme
                    ? 'linear-gradient(270deg,rgba(239,1,203,0.3),transparent)'
                    : 'linear-gradient(270deg,rgba(201,168,76,0.3),transparent)'}}/>
                </div>

                {userFavorites.length === 0 ? (
                  <div style={{
                    textAlign:'center',padding:'clamp(40px,8vw,70px) 20px',
                    background: isDarkTheme ? 'radial-gradient(ellipse at center,#0d0518 0%,#050008 100%)' : '#080808',
                    border: isDarkTheme ? '1px solid rgba(147,112,219,0.15)' : '1px solid rgba(201,168,76,0.12)',
                    borderRadius: isDarkTheme ? '10px' : '2px'
                  }}>
                    {isDarkTheme
                      ? <><div style={{fontSize:'2rem',color:'rgba(180,100,255,0.2)',marginBottom:'10px'}}>✦</div>
                         <p style={{color:'rgba(180,100,255,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.8rem,2vw,0.9rem)'}}>У вас пока нет избранных работ</p></>
                      : <><div style={{fontSize:'2rem',color:'rgba(201,168,76,0.15)',fontFamily:'serif',marginBottom:'10px'}}>⚜</div>
                         <p style={{color:'rgba(201,168,76,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.8rem,2vw,0.9rem)'}}>У вас пока нет избранных работ</p></>
                    }
                  </div>
                ) : (
                  <div style={{
                    display:'grid',
                    gridTemplateColumns:'repeat(auto-fill, minmax(clamp(130px,20vw,200px), 1fr))',
                    gap:'clamp(10px,2vw,16px)'
                  }}>
                    {userFavorites.map((work) => (
                      <div key={work.id}
                        className={isDarkTheme ? 'fav-card-dark' : 'fav-card-light'}
                        style={{
                          borderRadius: isDarkTheme ? '8px' : '2px',
                          overflow:'hidden',position:'relative',
                          border: isDarkTheme ? '1px solid rgba(239,1,203,0.4)' : '1px solid rgba(201,168,76,0.25)',
                          boxShadow: isDarkTheme ? '0 0 12px rgba(239,1,203,0.15)' : 'none'
                        }}>
                        <Link href={`/work/${work.id}`} style={{textDecoration:'none'}}>
                          <div style={{aspectRatio:'2/3',position:'relative',
                            background: isDarkTheme ? '#0a0010' : '#080808'}}>
                            {work.cover_url
                              ? <img src={work.cover_url} alt={work.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                              : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',
                                  color: isDarkTheme ? 'rgba(147,112,219,0.2)' : 'rgba(201,168,76,0.15)',fontSize:'2rem'}}>
                                  {isDarkTheme ? '✦' : '⚜'}
                                </div>
                            }
                            {/* Градиент поверх изображения */}
                            <div style={{position:'absolute',bottom:0,left:0,right:0,height:'50%',
                              background: isDarkTheme
                                ? 'linear-gradient(transparent,rgba(10,0,20,0.95))'
                                : 'linear-gradient(transparent,rgba(8,8,8,0.95))'}}/>
                          </div>
                          <div style={{
                            padding:'clamp(8px,2vw,12px)',
                            background: isDarkTheme ? '#050008' : '#080808'
                          }}>
                            <h4 style={{
                              fontFamily:'Georgia,serif',fontWeight:'600',
                              fontSize:'clamp(0.72rem,1.8vw,0.85rem)',lineHeight:'1.4',marginBottom:'4px',
                              color: isDarkTheme ? 'rgba(228,213,255,0.9)' : 'rgba(201,168,76,0.8)',
                              display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'
                            }}>{work.title}</h4>
                            {work.description && (
                              <p style={{
                                fontFamily:'Georgia,serif',fontStyle:'italic',
                                fontSize:'clamp(0.62rem,1.5vw,0.72rem)',lineHeight:'1.4',
                                color: isDarkTheme ? 'rgba(147,112,219,0.35)' : 'rgba(201,168,76,0.3)',
                                display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'
                              }}>{work.description}</p>
                            )}
                          </div>
                        </Link>

                        {/* Кнопка удаления */}
                        <button className="gal-del-btn" onClick={() => {
                          showConfirm('Удалить из избранного?', async () => {
                            try {
                              await supabaseUGC.from('user_favorites').delete().eq('user_id', user.id).eq('work_id', work.id);
                              setUserFavorites(prev => prev.filter(w => w.id !== work.id));
                            } catch (error) { console.error('Ошибка удаления:', error); }
                          });
                        }} style={{
                          position:'absolute',top:'8px',right:'8px',
                          width:'26px',height:'26px',borderRadius:'50%',
                          background: isDarkTheme ? 'rgba(239,1,203,0.8)' : 'rgba(201,168,76,0.7)',
                          border:'none',cursor:'pointer',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          opacity:0,transition:'opacity 0.2s',
                          boxShadow: isDarkTheme ? '0 0 10px rgba(239,1,203,0.6)' : '0 0 8px rgba(201,168,76,0.5)'
                        }}>
                          <X size={12} color="#fff"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════════ ГАЛЕРЕЯ ══════════════ */}
            {collectionTab === 'gallery' && (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'clamp(14px,3vw,22px)'}}>
                  <div style={{height:'1px',flex:1,background: isDarkTheme
                    ? 'linear-gradient(90deg,rgba(147,112,219,0.3),transparent)'
                    : 'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)'}}/>
                  <p style={{
                    fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',
                    color: isDarkTheme ? 'rgba(180,100,255,0.4)' : 'rgba(201,168,76,0.4)',
                    textTransform:'uppercase',whiteSpace:'nowrap'
                  }}>
                    {isDarkTheme ? '✦' : '⚜'} Изображений: {userGallery.length}
                  </p>
                  <div style={{height:'1px',flex:1,background: isDarkTheme
                    ? 'linear-gradient(270deg,rgba(147,112,219,0.3),transparent)'
                    : 'linear-gradient(270deg,rgba(201,168,76,0.3),transparent)'}}/>
                </div>

                {userGallery.length === 0 ? (
                  <div style={{
                    textAlign:'center',padding:'clamp(40px,8vw,70px) 20px',
                    background: isDarkTheme ? 'radial-gradient(ellipse at center,#0d0518 0%,#050008 100%)' : '#080808',
                    border: isDarkTheme ? '1px solid rgba(147,112,219,0.15)' : '1px solid rgba(201,168,76,0.12)',
                    borderRadius: isDarkTheme ? '10px' : '2px'
                  }}>
                    {isDarkTheme
                      ? <><div style={{fontSize:'2rem',color:'rgba(180,100,255,0.2)',marginBottom:'10px'}}>✦</div>
                         <p style={{color:'rgba(180,100,255,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.8rem,2vw,0.9rem)'}}>У вас пока нет сохранённых изображений</p></>
                      : <><div style={{fontSize:'2rem',color:'rgba(201,168,76,0.15)',fontFamily:'serif',marginBottom:'10px'}}>⚜</div>
                         <p style={{color:'rgba(201,168,76,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.8rem,2vw,0.9rem)'}}>У вас пока нет сохранённых изображений</p></>
                    }
                  </div>
                ) : (
                  <div style={{
                    display:'grid',
                    gridTemplateColumns:'repeat(auto-fill, minmax(clamp(130px,18vw,180px), 1fr))',
                    gap:'clamp(8px,1.5vw,12px)'
                  }}>
                    {userGallery.map((img) => (
                      <div key={img.id}
                        className={isDarkTheme ? 'gal-card-dark' : 'gal-card-light'}
                        style={{
                          aspectRatio:'3/4',borderRadius: isDarkTheme ? '6px' : '2px',
                          overflow:'hidden',position:'relative',
                          border: isDarkTheme ? '1px solid rgba(147,112,219,0.25)' : '1px solid rgba(201,168,76,0.18)',
                          transition:'border-color 0.2s, box-shadow 0.2s'
                        }}>
                        <img src={img.image_url} alt="Saved" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        {/* Тёмный оверлей при hover */}
                        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0)',transition:'background 0.2s'}}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,0,0,0.3)'}
                          onMouseLeave={e=>e.currentTarget.style.background='rgba(0,0,0,0)'}/>
                        <button className="gal-del-btn" onClick={() => {
                          showConfirm('Удалить изображение?', async () => {
                            try {
                              await supabaseUGC.from('saved_images').delete().eq('id', img.id);
                              setUserGallery(prev => prev.filter(i => i.id !== img.id));
                            } catch (error) { console.error('Ошибка удаления:', error); }
                          });
                        }} style={{
                          position:'absolute',top:'8px',right:'8px',
                          width:'26px',height:'26px',borderRadius:'50%',
                          background: isDarkTheme ? 'rgba(239,1,203,0.8)' : 'rgba(201,168,76,0.7)',
                          border:'none',cursor:'pointer',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          opacity:0,transition:'opacity 0.2s',
                          boxShadow: isDarkTheme ? '0 0 10px rgba(239,1,203,0.6)' : '0 0 8px rgba(201,168,76,0.5)'
                        }}>
                          <X size={12} color="#fff"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════ МОДАЛКА — ТЁМНАЯ ═══════════════════ */}
      {showConfirmModal && isDarkTheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
          <style dangerouslySetInnerHTML={{__html:`@keyframes confTwinkle2{0%,100%{opacity:0.12;}50%{opacity:0.5;}}`}}/>
          <div style={{
            background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
            border:'1px solid rgba(180,100,255,0.25)',boxShadow:'0 0 60px rgba(147,50,255,0.15)',
            borderRadius:'14px',width:'92vw',maxWidth:'360px',
            position:'relative',overflow:'hidden',padding:'clamp(20px,4vw,32px) clamp(18px,4vw,28px)'
          }}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
              background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)'}}/>
            <div style={{position:'absolute',inset:0,pointerEvents:'none',
              backgroundImage:`radial-gradient(1px 1px at 15% 25%,rgba(255,255,255,0.3) 0%,transparent 100%),radial-gradient(1px 1px at 80% 70%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
              animation:'confTwinkle2 5s ease-in-out infinite'}}/>
            <div style={{textAlign:'center',marginBottom:'16px',position:'relative',zIndex:1}}>
              <div style={{fontSize:'1rem',color:'rgba(180,100,255,0.4)'}}>✦</div>
            </div>
            <p style={{
              textAlign:'center',position:'relative',zIndex:1,fontFamily:'Georgia,serif',fontStyle:'italic',
              lineHeight:'1.7',color:'rgba(228,213,255,0.85)',fontSize:'clamp(0.82rem,2vw,0.95rem)',
              marginBottom:'20px',whiteSpace:'pre-wrap'
            }}>{confirmMessage}</p>
            <div style={{display:'flex',gap:'10px',position:'relative',zIndex:1}}>
              {confirmAction ? (
                <>
                  <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
                    flex:1,padding:'clamp(9px,2vw,11px)',background:'rgba(147,112,219,0.2)',
                    border:'1px solid rgba(147,112,219,0.6)',borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',
                    fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',
                    boxShadow:'0 0 12px rgba(147,112,219,0.2)'
                  }}>✦ Да</button>
                  <button onClick={() => setShowConfirmModal(false)} style={{
                    flex:1,padding:'clamp(9px,2vw,11px)',background:'transparent',
                    border:'1px solid rgba(147,112,219,0.2)',borderRadius:'4px',cursor:'pointer',
                    color:'rgba(180,100,255,0.45)',fontFamily:'Cinzel,serif',
                    fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'
                  }}>Отмена</button>
                </>
              ) : (
                <button onClick={() => setShowConfirmModal(false)} style={{
                  width:'100%',padding:'clamp(9px,2vw,11px)',background:'rgba(147,112,219,0.2)',
                  border:'1px solid rgba(147,112,219,0.6)',borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',
                  fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',
                  boxShadow:'0 0 12px rgba(147,112,219,0.2)'
                }}>✦ ОК</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ МОДАЛКА — СВЕТЛАЯ ═══════════════════ */}
      {showConfirmModal && !isDarkTheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
          <div style={{
            background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
            width:'92vw',maxWidth:'360px',
            position:'relative',overflow:'hidden',padding:'clamp(20px,4vw,30px) clamp(18px,4vw,28px)'
          }}>
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
              background:'linear-gradient(180deg,transparent,#c9a84c,transparent)'}}/>
            <div style={{position:'absolute',top:'50%',right:'8px',transform:'translateY(-50%)',
              fontFamily:'serif',fontSize:'7rem',color:'rgba(201,168,76,0.03)',
              pointerEvents:'none',userSelect:'none',lineHeight:1}}>⚜</div>
            <div style={{paddingLeft:'8px',position:'relative',zIndex:1}}>
              <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)',marginBottom:'16px'}}/>
              <p style={{
                fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.7',
                color:'rgba(201,168,76,0.7)',fontSize:'clamp(0.82rem,2vw,0.95rem)',
                marginBottom:'20px',whiteSpace:'pre-wrap'
              }}>{confirmMessage}</p>
              <div style={{display:'flex',gap:'10px'}}>
                {confirmAction ? (
                  <>
                    <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
                      flex:1,padding:'clamp(9px,2vw,11px)',background:'transparent',
                      border:'1px solid rgba(201,168,76,0.55)',borderRadius:'2px',cursor:'pointer',color:'#c9a84c',
                      fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'
                    }}>⚜ Да</button>
                    <button onClick={() => setShowConfirmModal(false)} style={{
                      flex:1,padding:'clamp(9px,2vw,11px)',background:'transparent',
                      border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',cursor:'pointer',
                      color:'rgba(201,168,76,0.35)',fontFamily:'Cinzel,serif',
                      fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'
                    }}>Отмена</button>
                  </>
                ) : (
                  <button onClick={() => setShowConfirmModal(false)} style={{
                    width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',
                    border:'1px solid rgba(201,168,76,0.55)',borderRadius:'2px',cursor:'pointer',color:'#c9a84c',
                    fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'
                  }}>⚜ ОК</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}