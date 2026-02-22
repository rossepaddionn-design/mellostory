'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Mail, X, Send } from 'lucide-react';

export default function MyMessagesPage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readerMessages, setReaderMessages] = useState([]);
  const [selectedReaderMessage, setSelectedReaderMessage] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [replyMessageText, setReplyMessageText] = useState('');
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
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('reader_profiles').select('*').eq('user_id', user.id).single();
        if (profile) {
          setUserProfile(profile);
          loadReaderMessages(user.id);
        }
      } else {
        window.location.href = '/';
      }
    };
    checkUser();
  }, []);

  const loadReaderMessages = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages').select('*').eq('from_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) console.error('Ошибка загрузки сообщений:', error);
      else setReaderMessages(data || []);
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
    setLoading(false);
  };

  const sendNewMessage = async () => {
    if (!newMessageText.trim() || !userProfile) { showConfirm('Напишите сообщение!'); return; }
    const { error } = await supabase.from('messages').insert({
      from_user_id: user.id, from_nickname: userProfile.nickname,
      from_email: userProfile.email, message: newMessageText.trim(),
      is_read: false, admin_reply: null
    });
    if (error) showConfirm('Ошибка отправки: ' + error.message);
    else { showConfirm('Сообщение отправлено!'); setNewMessageText(''); loadReaderMessages(user.id); }
  };

  const sendReaderReply = async (messageId) => {
    if (!replyMessageText.trim()) { showConfirm('Напишите ответ!'); return; }
    const { error } = await supabase.from('messages').insert({
      from_user_id: user.id, from_nickname: userProfile.nickname,
      from_email: userProfile.email, message: replyMessageText.trim(),
      is_read: false, admin_reply: null, reply_to_message_id: messageId
    });
    if (error) showConfirm('Ошибка отправки ответа: ' + error.message);
    else { showConfirm('Ответ отправлен!'); setReplyMessageText(''); setSelectedReaderMessage(null); loadReaderMessages(user.id); }
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#000000' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes msgShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes msgTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.6; } }
        @keyframes msgGoldShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes msgPulse { 0%,100% { box-shadow: 0 0 8px rgba(239,1,203,0.4); } 50% { box-shadow: 0 0 20px rgba(239,1,203,0.9); } }
        @keyframes msgGoldPulse { 0%,100% { box-shadow: 0 0 6px rgba(201,168,76,0.3); } 50% { box-shadow: 0 0 14px rgba(201,168,76,0.7); } }

        /* Тёмная тема — скроллбар */
        .msg-dark-scroll::-webkit-scrollbar { width: 4px; }
        .msg-dark-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-dark-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#9370db,#ef01cb,#9370db); border-radius:10px; box-shadow: 0 0 8px rgba(147,112,219,0.8); }
        .msg-dark-scroll { scrollbar-width: thin; scrollbar-color: #9370db transparent; }

        /* Светлая тема — скроллбар */
        .msg-light-scroll::-webkit-scrollbar { width: 4px; }
        .msg-light-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-light-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,transparent,#c9a84c,transparent); border-radius:10px; box-shadow: 0 0 6px rgba(201,168,76,0.5); }
        .msg-light-scroll { scrollbar-width: thin; scrollbar-color: #c9a84c transparent; }

        /* Карточки сообщений hover */
        .msg-card-dark:hover { border-color: rgba(239,1,203,0.7) !important; box-shadow: 0 0 20px rgba(239,1,203,0.2) !important; }
        .msg-card-light:hover { border-color: rgba(201,168,76,0.45) !important; }

        /* Звёзды фоновые */
        .msg-stars { background-image:
          radial-gradient(1px 1px at 5% 12%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 8%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 45% 90%, rgba(255,255,255,0.2) 0%, transparent 100%),
          radial-gradient(1px 1px at 78% 55%, rgba(255,255,255,0.25) 0%, transparent 100%),
          radial-gradient(1px 1px at 18% 70%, rgba(255,255,255,0.15) 0%, transparent 100%);
          animation: msgTwinkle 7s ease-in-out infinite;
          pointer-events: none; }

        /* Инпуты */
        .msg-input-dark { background: rgba(147,112,219,0.06) !important; border: 1px solid rgba(147,112,219,0.25) !important; color: #e8d5ff !important; border-radius: 4px !important; transition: border-color 0.2s; }
        .msg-input-dark:focus { border-color: rgba(239,1,203,0.6) !important; outline: none !important; }
        .msg-input-dark::placeholder { color: rgba(180,100,255,0.3) !important; }
        .msg-input-light { background: rgba(201,168,76,0.04) !important; border: 1px solid rgba(201,168,76,0.2) !important; color: rgba(201,168,76,0.85) !important; border-radius: 2px !important; transition: border-color 0.2s; }
        .msg-input-light:focus { border-color: rgba(201,168,76,0.5) !important; outline: none !important; }
        .msg-input-light::placeholder { color: rgba(201,168,76,0.25) !important; }
      `}} />

      {/* ═══════════════════════════════ HEADER ═══════════════════════════════ */}
      <header style={{
        borderBottom: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.2)'}`,
        backgroundColor: '#000000',
        padding: '12px 24px',
        position: 'relative'
      }}>
        {isDarkTheme && (
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1px',
            background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,#9370db,transparent)'}}/>
        )}
        {!isDarkTheme && (
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1px',
            background:'linear-gradient(90deg,transparent,#c9a84c,transparent)'}}/>
        )}
        <div style={{maxWidth:'900px',margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <Link href="/" style={{
            display:'inline-flex',alignItems:'center',gap:'6px',
            color: isDarkTheme ? 'rgba(147,112,219,0.6)' : 'rgba(201,168,76,0.5)',
            fontFamily:'Cinzel,serif',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',letterSpacing:'2px',
            textDecoration:'none',transition:'color 0.2s'
          }}>
            <ChevronLeft size={14}/>
            На главную
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
      <main style={{maxWidth:'760px',margin:'0 auto',padding:'clamp(20px,4vw,48px) clamp(14px,4vw,24px)',position:'relative'}}>

        {/* Звёзды фона для тёмной темы */}
        {isDarkTheme && (
          <div className="msg-stars" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
        )}
        {/* Водяной знак ⚜ для светлой */}
        {!isDarkTheme && (
          <div style={{position:'fixed',bottom:'5%',right:'2%',fontFamily:'serif',fontSize:'clamp(12rem,25vw,20rem)',
            color:'rgba(201,168,76,0.02)',pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>
        )}

        {loading ? (
          <div style={{textAlign:'center',padding:'80px 20px',position:'relative',zIndex:1}}>
            <div style={{
              display:'inline-block',width:'40px',height:'40px',borderRadius:'50%',
              border: isDarkTheme ? '2px solid transparent' : '2px solid transparent',
              borderTop: isDarkTheme ? '2px solid #9370db' : '2px solid #c9a84c',
              borderRight: isDarkTheme ? '2px solid #ef01cb' : '2px solid rgba(201,168,76,0.5)',
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
                    background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
                    backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                    animation:'msgShimmer 4s linear infinite',margin:0
                  }}>Мои сообщения</h1>
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
                    animation:'msgGoldShimmer 4s linear infinite',letterSpacing:'4px',margin:0
                  }}>Мои сообщения</h1>
                  <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'10px',justifyContent:'center'}}>
                    <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
                    <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
                    <div style={{height:'1px',width:'80px',background:'linear-gradient(270deg,rgba(201,168,76,0.5),transparent)'}}/>
                  </div>
                </>
              )}
            </div>

            {/* ── ФОРМА НОВОГО СООБЩЕНИЯ ── */}
            {isDarkTheme ? (
              <div style={{
                background:'radial-gradient(ellipse at top,#0d0518 0%,#050008 100%)',
                border:'1px solid rgba(239,1,203,0.35)',
                borderRadius:'10px',padding:'clamp(14px,3vw,22px)',marginBottom:'clamp(16px,3vw,24px)',
                position:'relative',overflow:'hidden',
                boxShadow:'0 0 30px rgba(239,1,203,0.08)'
              }}>
                {/* Верхняя линия */}
                <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
                  background:'linear-gradient(90deg,transparent,#ef01cb,#9370db,transparent)'}}/>
                {/* Угловые звёздочки */}
                <div style={{position:'absolute',top:'10px',right:'14px',color:'rgba(239,1,203,0.2)',fontSize:'0.6rem'}}>✦</div>
                <div style={{position:'absolute',bottom:'10px',left:'14px',color:'rgba(147,112,219,0.15)',fontSize:'0.5rem'}}>✦</div>

                <p style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',letterSpacing:'3px',
                  color:'rgba(180,100,255,0.5)',textTransform:'uppercase',marginBottom:'12px'}}>
                  ✦ Написать автору
                </p>
                <textarea
                  value={newMessageText}
                  onChange={e => setNewMessageText(e.target.value)}
                  rows={3}
                  placeholder="Введите ваше сообщение..."
                  className="msg-input-dark"
                  style={{width:'100%',padding:'10px 12px',fontSize:'clamp(0.8rem,2vw,0.9rem)',
                    resize:'vertical',boxSizing:'border-box',marginBottom:'12px'}}
                />
                <button onClick={sendNewMessage} style={{
                  width:'100%',padding:'clamp(10px,2vw,12px)',
                  background:'rgba(147,112,219,0.18)',border:'1px solid rgba(147,112,219,0.6)',
                  borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',
                  fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',
                  letterSpacing:'3px',textTransform:'uppercase',
                  boxShadow:'0 0 15px rgba(147,112,219,0.15)',transition:'all 0.2s'
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(147,112,219,0.28)';e.currentTarget.style.boxShadow='0 0 25px rgba(147,112,219,0.3)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(147,112,219,0.18)';e.currentTarget.style.boxShadow='0 0 15px rgba(147,112,219,0.15)';}}
                >
                  ✦ Отправить сообщение
                </button>
              </div>
            ) : (
              <div style={{
                background:'#080808',border:'1px solid rgba(201,168,76,0.25)',
                borderRadius:'2px',padding:'clamp(14px,3vw,22px)',marginBottom:'clamp(16px,3vw,24px)',
                position:'relative',overflow:'hidden'
              }}>
                <div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',
                  background:'linear-gradient(180deg,transparent,#c9a84c,transparent)'}}/>
                <p style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',letterSpacing:'3px',
                  color:'rgba(201,168,76,0.4)',textTransform:'uppercase',marginBottom:'12px',paddingLeft:'8px'}}>
                  ⚜ Написать автору
                </p>
                <textarea
                  value={newMessageText}
                  onChange={e => setNewMessageText(e.target.value)}
                  rows={3}
                  placeholder="Введите ваше сообщение..."
                  className="msg-input-light"
                  style={{width:'100%',padding:'10px 12px',fontSize:'clamp(0.8rem,2vw,0.9rem)',
                    resize:'vertical',boxSizing:'border-box',marginBottom:'12px'}}
                />
                <button onClick={sendNewMessage} style={{
                  width:'100%',padding:'clamp(10px,2vw,12px)',
                  background:'transparent',border:'1px solid rgba(201,168,76,0.55)',
                  borderRadius:'2px',cursor:'pointer',color:'#c9a84c',
                  fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',
                  letterSpacing:'3px',textTransform:'uppercase',transition:'all 0.2s'
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,168,76,0.08)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
                >
                  ⚜ Отправить сообщение
                </button>
              </div>
            )}

            {/* ── ИСТОРИЯ ПЕРЕПИСКИ ── */}
            <div>
              {isDarkTheme ? (
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'clamp(12px,2.5vw,20px)'}}>
                  <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(147,112,219,0.2),transparent)'}}/>
                  <p style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',
                    color:'rgba(180,100,255,0.4)',textTransform:'uppercase'}}>✦ История переписки ✦</p>
                  <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,rgba(147,112,219,0.2),transparent)'}}/>
                </div>
              ) : (
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'clamp(12px,2.5vw,20px)'}}>
                  <div style={{height:'1px',flex:1,background:'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)'}}/>
                  <p style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',
                    color:'rgba(201,168,76,0.4)',textTransform:'uppercase'}}>⚜ История переписки ⚜</p>
                  <div style={{height:'1px',flex:1,background:'linear-gradient(270deg,rgba(201,168,76,0.3),transparent)'}}/>
                </div>
              )}

              {readerMessages.length === 0 ? (
                <div style={{
                  textAlign:'center',padding:'clamp(30px,6vw,60px) 20px',
                  background: isDarkTheme ? 'radial-gradient(ellipse at center,#0d0518 0%,#050008 100%)' : '#080808',
                  border: isDarkTheme ? '1px solid rgba(147,112,219,0.15)' : '1px solid rgba(201,168,76,0.12)',
                  borderRadius: isDarkTheme ? '10px' : '2px'
                }}>
                  {isDarkTheme ? (
                    <>
                      <div style={{fontSize:'1.8rem',color:'rgba(180,100,255,0.2)',marginBottom:'10px'}}>✦</div>
                      <p style={{color:'rgba(180,100,255,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.8rem,2vw,0.9rem)'}}>
                        У вас пока нет сообщений
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{fontSize:'1.8rem',color:'rgba(201,168,76,0.15)',fontFamily:'serif',marginBottom:'10px'}}>⚜</div>
                      <p style={{color:'rgba(201,168,76,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.8rem,2vw,0.9rem)'}}>
                        У вас пока нет сообщений
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'clamp(10px,2vw,14px)'}}>
                  {readerMessages.map((msg) => (
                    <div key={msg.id}
                      className={isDarkTheme ? 'msg-card-dark' : 'msg-card-light'}
                      style={{
                        background: isDarkTheme
                          ? (msg.admin_reply && !msg.is_read ? 'radial-gradient(ellipse at top,#0d0518 0%,#050008 100%)' : 'rgba(0,0,0,0.6)')
                          : '#080808',
                        border: isDarkTheme
                          ? (msg.admin_reply && !msg.is_read ? '1px solid rgba(239,1,203,0.55)' : '1px solid rgba(147,112,219,0.2)')
                          : (msg.admin_reply && !msg.is_read ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(201,168,76,0.12)'),
                        borderRadius: isDarkTheme ? '8px' : '2px',
                        padding:'clamp(12px,3vw,18px)',
                        position:'relative',overflow:'hidden',
                        animation: (msg.admin_reply && !msg.is_read)
                          ? (isDarkTheme ? 'msgPulse 2.5s ease-in-out infinite' : 'msgGoldPulse 2.5s ease-in-out infinite')
                          : 'none',
                        transition:'border-color 0.2s, box-shadow 0.2s'
                      }}
                    >
                      {/* Светлая тема — левая полоска */}
                      {!isDarkTheme && (
                        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',
                          background: msg.admin_reply && !msg.is_read
                            ? 'linear-gradient(180deg,transparent,#c9a84c,transparent)'
                            : 'linear-gradient(180deg,transparent,rgba(201,168,76,0.2),transparent)'}}/>
                      )}
                      {/* Тёмная тема — верхняя линия для непрочитанных */}
                      {isDarkTheme && msg.admin_reply && !msg.is_read && (
                        <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',
                          background:'linear-gradient(90deg,transparent,#ef01cb,transparent)'}}/>
                      )}

                      {/* Шапка карточки */}
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                        <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'8px'}}>
                          <span style={{
                            fontFamily:'Cinzel,serif',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',letterSpacing:'2px',
                            color: isDarkTheme ? 'rgba(200,185,230,0.7)' : 'rgba(201,168,76,0.6)',
                            textTransform:'uppercase'
                          }}>Вы</span>
                          <span style={{
                            fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.55rem,1.3vw,0.63rem)',
                            color: isDarkTheme ? 'rgba(147,112,219,0.35)' : 'rgba(201,168,76,0.3)'
                          }}>
                            {new Date(msg.created_at).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                          </span>
                          {msg.admin_reply && !msg.is_read && (
                            <span style={{
                              background: isDarkTheme ? 'rgba(239,1,203,0.2)' : 'rgba(201,168,76,0.15)',
                              border: isDarkTheme ? '1px solid rgba(239,1,203,0.5)' : '1px solid rgba(201,168,76,0.4)',
                              color: isDarkTheme ? '#ef01cb' : '#c9a84c',
                              fontFamily:'Cinzel,serif',fontSize:'clamp(0.45rem,1vw,0.52rem)',letterSpacing:'2px',
                              padding:'2px 8px',borderRadius: isDarkTheme ? '2px' : '1px',
                              animation:'pulse 1.5s ease-in-out infinite'
                            }}>НОВЫЙ ОТВЕТ</span>
                          )}
                        </div>

                        {/* Меню ••• */}
                        <div style={{position:'relative'}}>
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedReaderMessage(selectedReaderMessage?.id === msg.id ? null : msg); }}
                            style={{
                              background:'transparent',
                              border: isDarkTheme ? '1px solid rgba(147,112,219,0.2)' : '1px solid rgba(201,168,76,0.15)',
                              borderRadius:'4px',padding:'2px 8px',cursor:'pointer',
                              color: isDarkTheme ? 'rgba(180,100,255,0.5)' : 'rgba(201,168,76,0.4)',
                              fontSize:'0.75rem',letterSpacing:'1px',transition:'all 0.2s'
                            }}
                            onMouseEnter={e=>{e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.1)':'rgba(201,168,76,0.06)';}}
                            onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
                          >•••</button>

                          {selectedReaderMessage?.id === msg.id && (
                            <div style={{
                              position:'absolute',right:0,top:'32px',
                              background: isDarkTheme ? 'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 100%)' : '#080808',
                              border: isDarkTheme ? '1px solid rgba(147,112,219,0.3)' : '1px solid rgba(201,168,76,0.2)',
                              borderRadius: isDarkTheme ? '8px' : '2px',
                              padding:'6px',zIndex:20,minWidth:'130px',
                              boxShadow: isDarkTheme ? '0 0 20px rgba(147,50,255,0.2)' : '0 4px 20px rgba(0,0,0,0.5)'
                            }}>
                              <button onClick={() => setSelectedReaderMessage(null)} style={{
                                width:'100%',textAlign:'left',padding:'8px 12px',background:'transparent',border:'none',
                                cursor:'pointer',color: isDarkTheme ? 'rgba(200,185,230,0.7)' : 'rgba(201,168,76,0.6)',
                                fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.62rem)',letterSpacing:'2px',
                                textTransform:'uppercase',borderRadius:'4px',transition:'background 0.15s'
                              }}
                                onMouseEnter={e=>e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.15)':'rgba(201,168,76,0.06)'}
                                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                              >Свернуть</button>
                              <button onClick={() => {
                                showConfirm('Удалить сообщение?', async () => {
                                  await supabase.from('messages').delete().eq('id', msg.id);
                                  loadReaderMessages(user.id);
                                });
                              }} style={{
                                width:'100%',textAlign:'left',padding:'8px 12px',background:'transparent',border:'none',
                                cursor:'pointer',color: isDarkTheme ? 'rgba(239,1,203,0.6)' : 'rgba(201,168,76,0.45)',
                                fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.62rem)',letterSpacing:'2px',
                                textTransform:'uppercase',borderRadius:'4px',transition:'background 0.15s'
                              }}
                                onMouseEnter={e=>e.currentTarget.style.background=isDarkTheme?'rgba(239,1,203,0.1)':'rgba(201,168,76,0.06)'}
                                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                              >Удалить</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Сообщение читателя */}
                      <div style={{
                        background: isDarkTheme ? 'rgba(0,0,0,0.4)' : 'rgba(201,168,76,0.03)',
                        border: isDarkTheme ? '1px solid rgba(147,112,219,0.15)' : '1px solid rgba(201,168,76,0.1)',
                        borderRadius: isDarkTheme ? '6px' : '2px',
                        padding:'clamp(8px,2vw,12px)',marginBottom:'10px'
                      }}>
                        <p style={{
                          fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.58rem)',letterSpacing:'2px',
                          color: isDarkTheme ? 'rgba(179,231,239,0.4)' : 'rgba(201,168,76,0.35)',
                          textTransform:'uppercase',marginBottom:'6px'
                        }}>Ваше сообщение</p>
                        <p style={{
                          fontFamily:'Georgia,serif',fontSize:'clamp(0.78rem,2vw,0.88rem)',lineHeight:'1.6',
                          color: isDarkTheme ? 'rgba(228,213,255,0.85)' : 'rgba(201,168,76,0.7)',
                          whiteSpace:'pre-wrap',wordBreak:'break-word'
                        }}>
                          {selectedReaderMessage?.id === msg.id
                            ? msg.message
                            : msg.message.length > 120 ? msg.message.slice(0,120) + '…' : msg.message}
                        </p>
                      </div>

                      {/* Ответ автора */}
                      {msg.admin_reply && (
                        <div style={{
                          background: isDarkTheme ? 'rgba(239,1,203,0.04)' : 'rgba(201,168,76,0.04)',
                          border: isDarkTheme ? '1px solid rgba(239,1,203,0.3)' : '1px solid rgba(201,168,76,0.2)',
                          borderRadius: isDarkTheme ? '6px' : '2px',
                          padding:'clamp(8px,2vw,12px)',marginBottom:'10px',
                          position:'relative'
                        }}>
                          {isDarkTheme && (
                            <div style={{position:'absolute',top:0,left:'20px',right:'20px',height:'1px',
                              background:'linear-gradient(90deg,transparent,rgba(239,1,203,0.4),transparent)'}}/>
                          )}
                          <p style={{
                            fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.58rem)',letterSpacing:'2px',
                            color: isDarkTheme ? 'rgba(179,231,239,0.5)' : 'rgba(201,168,76,0.4)',
                            textTransform:'uppercase',marginBottom:'6px'
                          }}>
                            {isDarkTheme ? '✦ Ответ автора' : '⚜ Ответ автора'}
                          </p>
                          <p style={{
                            fontFamily:'Georgia,serif',fontSize:'clamp(0.78rem,2vw,0.88rem)',lineHeight:'1.6',
                            fontStyle:'italic',
                            color: isDarkTheme ? 'rgba(228,213,255,0.75)' : 'rgba(201,168,76,0.65)',
                            whiteSpace:'pre-wrap',wordBreak:'break-word'
                          }}>
                            {selectedReaderMessage?.id === msg.id
                              ? msg.admin_reply
                              : msg.admin_reply.length > 120 ? msg.admin_reply.slice(0,120) + '…' : msg.admin_reply}
                          </p>
                        </div>
                      )}

                      {/* Форма ответа */}
                      {selectedReaderMessage?.id === msg.id && msg.admin_reply && (
                        <div style={{
                          paddingTop:'12px',marginTop:'4px',
                          borderTop: isDarkTheme ? '1px solid rgba(147,112,219,0.15)' : '1px solid rgba(201,168,76,0.1)'
                        }}>
                          <p style={{
                            fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.58rem)',letterSpacing:'2px',
                            color: isDarkTheme ? 'rgba(180,100,255,0.4)' : 'rgba(201,168,76,0.35)',
                            textTransform:'uppercase',marginBottom:'8px'
                          }}>Ответить автору</p>
                          <textarea
                            value={replyMessageText}
                            onChange={e => setReplyMessageText(e.target.value)}
                            rows={3}
                            placeholder="Напишите ваш ответ..."
                            className={isDarkTheme ? 'msg-input-dark' : 'msg-input-light'}
                            style={{width:'100%',padding:'10px 12px',fontSize:'clamp(0.78rem,2vw,0.88rem)',
                              resize:'vertical',boxSizing:'border-box',marginBottom:'10px'}}
                          />
                          <button onClick={() => sendReaderReply(msg.id)} style={{
                            display:'inline-flex',alignItems:'center',gap:'6px',
                            padding:'clamp(8px,2vw,10px) clamp(14px,3vw,20px)',
                            background: isDarkTheme ? 'rgba(147,112,219,0.18)' : 'transparent',
                            border: isDarkTheme ? '1px solid rgba(147,112,219,0.5)' : '1px solid rgba(201,168,76,0.45)',
                            borderRadius: isDarkTheme ? '4px' : '2px',
                            cursor:'pointer',
                            color: isDarkTheme ? '#d8b4fe' : '#c9a84c',
                            fontFamily:'Cinzel,serif',fontSize:'clamp(0.52rem,1.2vw,0.6rem)',letterSpacing:'2px',textTransform:'uppercase',
                            transition:'all 0.2s'
                          }}
                            onMouseEnter={e=>e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.28)':'rgba(201,168,76,0.08)'}
                            onMouseLeave={e=>e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.18)':'transparent'}
                          >
                            <Send size={11}/>{isDarkTheme ? '✦ Отправить ответ' : '⚜ Отправить ответ'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ═══════════════════ МОДАЛКА — ТЁМНАЯ ═══════════════════ */}
      {showConfirmModal && isDarkTheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
          <style dangerouslySetInnerHTML={{__html:`
            @keyframes confTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.5;}}
          `}}/>
          <div style={{
            background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
            border:'1px solid rgba(180,100,255,0.25)',
            boxShadow:'0 0 60px rgba(147,50,255,0.15)',
            borderRadius:'14px',
            width:'92vw',maxWidth:'360px',
            position:'relative',overflow:'hidden',padding:'clamp(20px,4vw,32px) clamp(18px,4vw,28px)'
          }}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
              background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)'}}/>
            <div style={{position:'absolute',inset:0,pointerEvents:'none',
              backgroundImage:`radial-gradient(1px 1px at 15% 25%,rgba(255,255,255,0.3) 0%,transparent 100%),radial-gradient(1px 1px at 80% 70%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
              animation:'confTwinkle 5s ease-in-out infinite'}}/>

            <div style={{textAlign:'center',marginBottom:'20px',position:'relative',zIndex:1}}>
              <div style={{fontSize:'1.1rem',color:'rgba(180,100,255,0.4)',marginBottom:'6px'}}>✦</div>
            </div>

            <p style={{
              textAlign:'center',position:'relative',zIndex:1,
              fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.7',
              color:'rgba(228,213,255,0.85)',fontSize:'clamp(0.82rem,2vw,0.95rem)',
              marginBottom:'20px',whiteSpace:'pre-wrap'
            }}>{confirmMessage}</p>

            <div style={{display:'flex',gap:'10px',position:'relative',zIndex:1}}>
              {confirmAction ? (
                <>
                  <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
                    flex:1,padding:'clamp(9px,2vw,11px)',
                    background:'rgba(147,112,219,0.2)',border:'1px solid rgba(147,112,219,0.6)',
                    borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',
                    fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',
                    boxShadow:'0 0 12px rgba(147,112,219,0.2)'
                  }}>✦ Да</button>
                  <button onClick={() => setShowConfirmModal(false)} style={{
                    flex:1,padding:'clamp(9px,2vw,11px)',
                    background:'transparent',border:'1px solid rgba(147,112,219,0.2)',
                    borderRadius:'4px',cursor:'pointer',color:'rgba(180,100,255,0.45)',
                    fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'
                  }}>Отмена</button>
                </>
              ) : (
                <button onClick={() => setShowConfirmModal(false)} style={{
                  width:'100%',padding:'clamp(9px,2vw,11px)',
                  background:'rgba(147,112,219,0.2)',border:'1px solid rgba(147,112,219,0.6)',
                  borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',
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
          <style dangerouslySetInnerHTML={{__html:`
            @keyframes confGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
          `}}/>
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
                      flex:1,padding:'clamp(9px,2vw,11px)',
                      background:'transparent',border:'1px solid rgba(201,168,76,0.55)',
                      borderRadius:'2px',cursor:'pointer',color:'#c9a84c',
                      fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'
                    }}>⚜ Да</button>
                    <button onClick={() => setShowConfirmModal(false)} style={{
                      flex:1,padding:'clamp(9px,2vw,11px)',
                      background:'transparent',border:'1px solid rgba(201,168,76,0.15)',
                      borderRadius:'2px',cursor:'pointer',color:'rgba(201,168,76,0.35)',
                      fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'
                    }}>Отмена</button>
                  </>
                ) : (
                  <button onClick={() => setShowConfirmModal(false)} style={{
                    width:'100%',padding:'clamp(9px,2vw,11px)',
                    background:'transparent',border:'1px solid rgba(201,168,76,0.55)',
                    borderRadius:'2px',cursor:'pointer',color:'#c9a84c',
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