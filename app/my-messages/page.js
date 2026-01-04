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
        
        // Загружаем профиль
        const { data: profile } = await supabase
          .from('reader_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
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
        .from('messages')
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки сообщений:', error);
      } else {
        setReaderMessages(data || []);
      }
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
    setLoading(false);
  };

  const sendNewMessage = async () => {
    if (!newMessageText.trim() || !userProfile) {
      showConfirm('Напишите сообщение!');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        from_nickname: userProfile.nickname,
        from_email: userProfile.email,
        message: newMessageText.trim(),
        is_read: false,
        admin_reply: null
      });

    if (error) {
      showConfirm('Ошибка отправки: ' + error.message);
    } else {
      showConfirm('Сообщение отправлено!');
      setNewMessageText('');
      loadReaderMessages(user.id);
    }
  };

  const sendReaderReply = async (messageId) => {
    if (!replyMessageText.trim()) {
      showConfirm('Напишите ответ!');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        from_nickname: userProfile.nickname,
        from_email: userProfile.email,
        message: replyMessageText.trim(),
        is_read: false,
        admin_reply: null,
        reply_to_message_id: messageId
      });

    if (error) {
      showConfirm('Ошибка отправки ответа: ' + error.message);
    } else {
      showConfirm('Ответ отправлен!');
      setReplyMessageText('');
      setSelectedReaderMessage(null);
      loadReaderMessages(user.id);
    }
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
        .shimmer-btn-text {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
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
              Мои сообщения
            </h1>

            {/* ФОРМА НОВОГО СООБЩЕНИЯ */}
            <div className="rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 border-2" style={{ 
              background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.3)',
              borderColor: isDarkTheme ? '#ef01cb' : '#c9c6bb',
              boxShadow: isDarkTheme ? '0 0 15px rgba(239, 1, 203, 0.6)' : 'none'
            }}>
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3" style={{
                color: isDarkTheme ? '#b3e7ef' : '#c9c6bb'
              }}>
                Написать новое сообщение автору
              </h3>
              <textarea
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                rows={3}
                placeholder="Введите ваше сообщение..."
                className="w-full border rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none text-white"
                style={{ 
                  background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.4)',
                  borderColor: isDarkTheme ? '#ef01cb' : '#c9c6bb'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = isDarkTheme ? '#ef01cb' : '#c9c6bb'}
                onBlur={(e) => e.currentTarget.style.borderColor = isDarkTheme ? '#ef01cb' : '#c9c6bb'}
              />
              <button
                onClick={sendNewMessage}
                className="w-full py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
                style={{ 
                  background: isDarkTheme 
                    ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)'
                    : '#d8c5a2',
                  boxShadow: isDarkTheme ? '0 0 15px rgba(147, 112, 219, 0.6)' : 'none',
                  color: isDarkTheme ? '#ffffff' : '#000000'
                }}
                onMouseEnter={(e) => {
                  if (isDarkTheme) {
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(147, 112, 219, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isDarkTheme) {
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(147, 112, 219, 0.6)';
                  }
                }}
              >
                Отправить сообщение
              </button>
            </div>

            {/* ИСТОРИЯ ПЕРЕПИСКИ */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4" style={{
                color: isDarkTheme ? '#b3e7ef' : '#c9c6bb'
              }}>
                История переписки
              </h3>

              {readerMessages.length === 0 ? (
                <div className="text-center py-8 sm:py-12 rounded-lg border" style={{
                  background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                  borderColor: isDarkTheme ? 'rgba(239, 1, 203, 0.2)' : 'rgba(180, 154, 95, 0.3)'
                }}>
                  <Mail size={32} className="sm:w-12 sm:h-12 mx-auto mb-3" style={{ 
                    color: isDarkTheme ? 'rgba(239, 1, 203, 0.3)' : 'rgba(194, 171, 117, 0.5)'
                  }} />
                  <p className="text-sm sm:text-base" style={{
                    color: isDarkTheme ? '#ffffff' : '#c9c6bb'
                  }}>У вас пока нет сообщений</p>
                </div>
              ) : (
                readerMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className="rounded-lg p-3 sm:p-5 border-2 transition"
                    style={{
                      background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.3)',
                      borderColor: msg.admin_reply && !msg.is_read 
                        ? (isDarkTheme ? '#ef01cb' : '#c9c6bb')
                        : (isDarkTheme ? '#ef01cb' : 'rgba(180, 154, 95, 0.3)'),
                      boxShadow: msg.admin_reply && !msg.is_read 
                        ? (isDarkTheme ? '0 0 20px rgba(239, 1, 203, 0.6)' : 'none')
                        : (isDarkTheme ? '0 0 10px rgba(239, 1, 203, 0.3)' : 'none')
                    }}
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-sm sm:text-base" style={{
                          color: isDarkTheme ? '#ffffff' : '#c9c6bb'
                        }}>Вы</span>
                        <span className="text-xs" style={{
                          color: isDarkTheme ? '#9ca3af' : '#c9c6bb',
                          opacity: 0.7
                        }}>
                          {new Date(msg.created_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {msg.admin_reply && !msg.is_read && (
                          <span className="text-xs px-2 py-1 rounded font-bold animate-pulse" style={{
                            background: isDarkTheme ? '#c9c6bb' : '#c9c6bb',
                            color: isDarkTheme ? '#ffffff' : '#000000'
                          }}>
                            НОВЫЙ ОТВЕТ
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReaderMessage(selectedReaderMessage?.id === msg.id ? null : msg);
                          }}
                          className="text-xs sm:text-sm transition p-1 rounded"
                          style={{ color: isDarkTheme ? '#ef01cb' : '#c9c6bb' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = isDarkTheme ? '#ff6bcb' : '#c9c6bb';
                            e.currentTarget.style.background = isDarkTheme ? 'rgba(239, 1, 203, 0.1)' : 'rgba(194, 171, 117, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = isDarkTheme ? '#ef01cb' : '#c9c6bb';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          •••
                        </button>
                        
                        {selectedReaderMessage?.id === msg.id && (
                          <div className="absolute right-0 top-8 rounded-lg border-2 p-2 z-10 min-w-[150px]" style={{
                            background: isDarkTheme 
                              ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)'
                              : 'rgba(194, 171, 117, 0.9)',
                            borderColor: isDarkTheme ? '#ef01cb' : '#c9c6bb',
                            boxShadow: isDarkTheme ? '0 0 20px rgba(239, 1, 203, 0.6)' : 'none'
                          }}>
                            <button
                              onClick={() => setSelectedReaderMessage(null)}
                              className="w-full text-left px-3 py-2 rounded text-xs sm:text-sm transition"
                              style={{ color: isDarkTheme ? '#ffffff' : '#000000' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = isDarkTheme ? 'rgba(239, 1, 203, 0.3)' : 'rgba(0, 0, 0, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              Свернуть
                            </button>
                            <button
                              onClick={() => {
                                showConfirm('Удалить сообщение?', async () => {
                                  await supabase.from('messages').delete().eq('id', msg.id);
                                  loadReaderMessages(user.id);
                                });
                              }}
                              className="w-full text-left px-3 py-2 rounded text-xs sm:text-sm transition"
                              style={{ color: isDarkTheme ? '#ffffff' : '#000000' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = isDarkTheme ? 'rgba(239, 1, 203, 0.3)' : 'rgba(0, 0, 0, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 border" style={{
                      background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.4)',
                      borderColor: isDarkTheme ? '#ef01cb' : '#c9c6bb'
                    }}>
                      <p className="text-xs mb-2" style={{
                        color: isDarkTheme ? '#b3e7ef' : '#c9c6bb'
                      }}>Ваше сообщение:</p>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words" style={{
                        color: isDarkTheme ? '#ffffff' : '#c9c6bb'
                      }}>
                        {selectedReaderMessage?.id === msg.id 
                          ? msg.message 
                          : msg.message.length > 100 
                            ? msg.message.slice(0, 100) + '...' 
                            : msg.message
                        }
                      </p>
                    </div>

                    {msg.admin_reply && (
                      <div className="border-2 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3" style={{
                        background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.4)',
                        borderColor: isDarkTheme ? '#ef01cb' : '#c9c6bb',
                        boxShadow: isDarkTheme ? '0 0 15px rgba(239, 1, 203, 0.4)' : 'none'
                      }}>
                        <p className="text-xs mb-2 font-semibold" style={{
                          color: isDarkTheme ? '#b3e7ef' : '#c9c6bb'
                        }}>
                          Ответ автора:
                        </p>
                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words" style={{
                          color: isDarkTheme ? '#e5e7eb' : '#c9c6bb'
                        }}>
                          {selectedReaderMessage?.id === msg.id 
                            ? msg.admin_reply 
                            : msg.admin_reply.length > 100 
                              ? msg.admin_reply.slice(0, 100) + '...' 
                              : msg.admin_reply
                          }
                        </p>
                      </div>
                    )}

                    {selectedReaderMessage?.id === msg.id && msg.admin_reply && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4" style={{
                        borderTop: isDarkTheme ? '1px solid #374151' : '1px solid rgba(180, 154, 95, 0.3)'
                      }}>
                        <h4 className="text-xs sm:text-sm font-semibold mb-2" style={{
                          color: isDarkTheme ? '#9ca3af' : '#c9c6bb'
                        }}>
                          Ответить автору:
                        </h4>
                        <textarea
                          value={replyMessageText}
                          onChange={(e) => setReplyMessageText(e.target.value)}
                          rows={3}
                          placeholder="Напишите ваш ответ..."
                          className="w-full rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none text-white"
                          style={{
                            background: isDarkTheme ? '#1f2937' : 'rgba(0, 0, 0, 0.4)',
                            border: `1px solid ${isDarkTheme ? '#4b5563' : 'rgba(180, 154, 95, 0.4)'}`
                          }}
                        />
                        <button
                          onClick={() => sendReaderReply(msg.id)}
                          className="px-3 sm:px-4 py-2 rounded text-xs sm:text-sm flex items-center gap-2"
                          style={{
                            background: isDarkTheme ? '#c9c6bb' : '#c9c6bb',
                            color: isDarkTheme ? '#ffffff' : '#000000'
                          }}
                        >
                          <Send size={12} className="sm:w-4 sm:h-4" />
                          Отправить ответ
                        </button>
                      </div>
                    )}
                  </div>
                ))
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
            background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
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
              color: '#d8c5a2'
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