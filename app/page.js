'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, X, Menu, LogOut, User, MessageSquare, Palette, FileText, Settings, Trash2, Send, Mail, MailOpen } from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState('ru');
  const [titleColor, setTitleColor] = useState('#ef4444');
  const [activeCategory, setActiveCategory] = useState('completed');
  const [expandedWork, setExpandedWork] = useState(null);
  
  const [works, setWorks] = useState([]);
  const [completedWorks, setCompletedWorks] = useState([]);
  const [ongoingWorks, setOngoingWorks] = useState([]);
  const [minificWorks, setMinificWorks] = useState([]);
  const [longficWorks, setLongficWorks] = useState([]);
  const [novelWorks, setNovelWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ nickname: '', email: '', password: '' });

  const [showReaderPanel, setShowReaderPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [recentWorks, setRecentWorks] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const [showReaderMessagesModal, setShowReaderMessagesModal] = useState(false);
  const [readerMessages, setReaderMessages] = useState([]);
  const [selectedReaderMessage, setSelectedReaderMessage] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [replyMessageText, setReplyMessageText] = useState('');

  const [messageText, setMessageText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  const [showManagementModal, setShowManagementModal] = useState(false);
  const [managementTab, setManagementTab] = useState('comments');
  const [comments, setComments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  const ADMIN_PASSWORD = 'M@___m@_18_97_mam@_mello_18_97_06_mama';
  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';

  const HEADER_BG_IMAGE = 'https://i.ibb.co/MqDBKhy/001.jpg';

  useEffect(() => {
    loadWorks();
    loadSettings();
    checkUser();
  }, []);

 const checkUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    setUser(session.user);
    
    // Проверяем: это обычный читатель?
    const { data: profile } = await supabase
      .from('reader_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (profile) {
      // Это обычный читатель
      if (profile.is_banned) {
        alert('Ваш аккаунт заблокирован!');
        await supabase.auth.signOut();
        return;
      }
      setUserProfile(profile);
      setIsAdmin(false);
    } else if (session.user.email === ADMIN_EMAIL) {
      // Email совпадает с админским И нет профиля читателя = это админ
      setIsAdmin(true);
    }
  }
};

const loadWorks = async () => {
  setLoading(true);
  
  const { data, error } = await supabase
    .from('works')
    .select('id, title, cover_url, direction, rating, status, category, description, created_at')
    .eq('is_draft', false)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('Ошибка загрузки работ:', error);
  } else {
    const worksData = data || [];
    setWorks(worksData);
    setCompletedWorks(worksData.filter(w => w.status === 'Завершён'));
    setOngoingWorks(worksData.filter(w => w.status === 'В процессе'));
    setMinificWorks(worksData.filter(w => w.category === 'minific'));
    setLongficWorks(worksData.filter(w => w.category === 'longfic'));
    setNovelWorks(worksData.filter(w => w.category === 'novel'));
  }
  setLoading(false);
};

const loadSettings = async () => {
  try {
    const cachedColor = localStorage.getItem('titleColor');
    if (cachedColor) {
      setTitleColor(cachedColor);
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('title_color')
      .eq('id', 1)
      .maybeSingle();
    
    if (data && !error && data.title_color && data.title_color.trim() !== '') {
      setTitleColor(data.title_color);
      localStorage.setItem('titleColor', data.title_color);
    }
  } catch (err) {
    console.error('Ошибка загрузки настроек:', err);
  }
};

  const loadUserData = async () => {
    if (!userProfile) return;
    setRecentWorks(userProfile.recent_works || []);
    setBookmarks(userProfile.bookmarks || []);
  };

  const loadReaderMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Ошибка загрузки сообщений:', error);
      } else {
        setReaderMessages(data || []);
      }
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
  };

  const loadManagementData = async () => {
    if (!isAdmin) return;

    try {
      const [commentsRes, messagesRes, usersRes] = await Promise.all([
        supabase
          .from('comments')
          .select('*, works(title), chapters(title, chapter_number)')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('reader_profiles')
          .select('id, user_id, nickname, email, is_banned, created_at')
          .order('created_at', { ascending: false })
      ]);

      if (commentsRes.data) setComments(commentsRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
      if (usersRes.data) setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Ошибка загрузки данных управления:', err);
    }
  };

  const handleRegister = async () => {
    if (!authForm.nickname || !authForm.email || !authForm.password) {
      alert('Заполните все поля!');
      return;
    }

    const { data: existingNickname } = await supabase
      .from('reader_profiles')
      .select('nickname')
      .eq('nickname', authForm.nickname)
      .single();
    
    if (existingNickname) {
      alert('Этот никнейм уже занят!');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password
    });

    if (error) {
      alert('Ошибка регистрации: ' + error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('reader_profiles')
        .insert({
          user_id: data.user.id,
          nickname: authForm.nickname,
          email: authForm.email,
          is_banned: false,
          recent_works: [],
          bookmarks: []
        });

      if (profileError) {
        alert('Ошибка создания профиля: ' + profileError.message);
      } else {
        alert('Регистрация успешна! Проверьте почту для подтверждения.');
        setShowAuthModal(false);
        setAuthForm({ nickname: '', email: '', password: '' });
      }
    }
  };

 const handleLogin = async () => {
  if (!authForm.email || !authForm.password) {
    alert('Введите email и пароль!');
    return;
  }

  // АДМИН - проверяем БЕЗ Supabase!
  if (authForm.email === ADMIN_EMAIL && authForm.password === ADMIN_PASSWORD) {
    setIsAdmin(true);
    setShowAuthModal(false);
    setAuthForm({ nickname: '', email: '', password: '' });
    return; // ← ВЫХОДИМ! Без Supabase!
  }

  // ОБЫЧНЫЙ ЮЗЕР - через Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authForm.email,
    password: authForm.password
  });

  if (error) {
    alert('Ошибка входа: ' + error.message);
    return;
  }

  if (data.user) {
    setUser(data.user);
    
    const { data: profile } = await supabase
      .from('reader_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profile) {
      if (profile.is_banned) {
        alert('Ваш аккаунт заблокирован!');
        await supabase.auth.signOut();
        return;
      }
      setUserProfile(profile);
    }
    
    setShowAuthModal(false);
    setAuthForm({ nickname: '', email: '', password: '' });
  }
};

  const sendNewMessage = async () => {
    if (!newMessageText.trim() || !userProfile) {
      alert('Напишите сообщение!');
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
      alert('Ошибка отправки: ' + error.message);
    } else {
      alert('Сообщение отправлено!');
      setNewMessageText('');
      loadReaderMessages();
    }
  };

  const sendReaderReply = async (messageId) => {
    if (!replyMessageText.trim()) {
      alert('Напишите ответ!');
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
      alert('Ошибка отправки ответа: ' + error.message);
    } else {
      alert('Ответ отправлен!');
      setReplyMessageText('');
      setSelectedReaderMessage(null);
      loadReaderMessages();
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !userProfile) {
      alert('Напишите сообщение!');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        from_nickname: userProfile.nickname,
        from_email: userProfile.email,
        message: messageText.trim(),
        is_read: false
      });

    if (error) {
      alert('Ошибка отправки: ' + error.message);
    } else {
      alert('Сообщение отправлено!');
      setMessageText('');
      setShowMessageModal(false);
    }
  };

  const toggleUserBan = async (userId, currentBanStatus) => {
    const { error } = await supabase
      .from('reader_profiles')
      .update({ is_banned: !currentBanStatus })
      .eq('user_id', userId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert(currentBanStatus ? 'Пользователь разблокирован!' : 'Пользователь заблокирован!');
      loadManagementData();
    }
  };

  const replyToMessage = async (messageId) => {
    if (!replyText.trim()) {
      alert('Напишите ответ!');
      return;
    }

    const { error } = await supabase
      .from('messages')
      .update({ 
        admin_reply: replyText.trim(),
        is_read: true 
      })
      .eq('id', messageId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('Ответ отправлен!');
      setReplyText('');
      setSelectedMessage(null);
      loadManagementData();
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Удалить сообщение?')) return;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      loadManagementData();
    }
  };

  const saveTitleColor = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, title_color: titleColor }, { onConflict: 'id' });

      if (error) throw error;
      localStorage.setItem('titleColor', titleColor);
      alert('✅ Цвет акцента сохранён!');
    } catch (err) {
      alert('❌ Ошибка: ' + err.message);
    }
  };

  const translations = {
    ru: {
      completed: 'Завершённые',
      ongoing: 'Онгоинги',
      minific: 'Минифики',
      longfic: 'Лонгфики',
      novels: 'Романы',
      about: 'Обо мне',
      login: 'Вход',
      register: 'Регистрация',
      logout: 'Выход',
      nickname: 'Никнейм',
      email: 'Email',
      password: 'Пароль',
      noWorks: 'Работы не найдены',
      startReading: 'Начать читать',
      disclaimer18: 'Предупреждение о содержании для взрослых (18+)',
      disclaimerText: 'Веб-сайт содержит материалы, предназначенные исключительно для лиц, достигших совершеннолетия (18 лет и старше). Продолжая использование данного ресурса, вы подтверждаете, что являетесь совершеннолетним в соответствии с законодательством вашей страны. Материалы сайта могут содержать сцены насилия, откровенные сексуальные сцены и иной контент, не предназначенный для несовершеннолетних. Администрация сайта не несет ответственности за последствия доступа к материалам со стороны лиц, не достигших 18 лет.',
      copyrightTitle: 'Авторские права и интеллектуальная собственность',
      copyrightText: 'Все литературные произведения, размещенные на данном веб-сайте, являются объектами авторского права и охраняются в соответствии с действующим законодательством об интеллектуальной собственности. Любое воспроизведение, распространение, публичный показ, перевод или иное использование произведений без письменного согласия правообладателя категорически запрещено и может повлечь за собой гражданско-правовую и уголовную ответственность в соответствии с применимым законодательством.'
    },
    en: {
      completed: 'Completed',
      ongoing: 'Ongoing',
      minific: 'Minifics',
      longfic: 'Longfics',
      novels: 'Novels',
      about: 'About Me',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      nickname: 'Nickname',
      email: 'Email',
      password: 'Password',
      noWorks: 'No works found',
      startReading: 'Start Reading',
      disclaimer18: 'Adult Content Warning (18+)',
      disclaimerText: 'This website contains materials intended exclusively for adults.',
      copyrightTitle: 'Copyright and Intellectual Property',
      copyrightText: 'All literary works posted on this website are copyrighted and protected under applicable intellectual property law.'
    }
  };

  const t = translations[language];

  const getCurrentWorks = () => {
    switch(activeCategory) {
      case 'completed': return completedWorks;
      case 'ongoing': return ongoingWorks;
      case 'minific': return minificWorks;
      case 'longfic': return longficWorks;
      case 'novel': return novelWorks;
      default: return works;
    }
  };

  const displayWorks = getCurrentWorks();

  const getVisibleWorks = () => {
    if (displayWorks.length === 0) return [];
    return displayWorks.map((work, index) => ({
      ...work,
      position: index - currentSlide
    }));
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden bg-black">

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-4 sm:p-8 border-2 border-red-600">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-red-600">
                {authMode === 'login' ? t.login : t.register}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder={t.nickname}
                  value={authForm.nickname}
                  onChange={(e) => setAuthForm({...authForm, nickname: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-red-600"
                />
              )}
              
              <input
                type="email"
                placeholder={t.email}
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-red-600"
              />
              
              <input
                type="password"
                placeholder={t.password}
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-red-600"
              />

              <button
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                className="w-full bg-red-600 hover:bg-red-700 py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
              >
                {authMode === 'login' ? t.login : t.register}
              </button>

              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="w-full text-gray-400 hover:text-white text-xs sm:text-sm"
              >
                {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* READER MESSAGES MODAL */}
      {showReaderMessagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-2 sm:p-8">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-[95vh] sm:h-[85vh] flex flex-col border-2 border-red-600">
            <div className="flex justify-between items-center p-3 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-2xl font-bold text-red-600 flex items-center gap-2">
                <Mail size={20} className="sm:w-7 sm:h-7" />
                Мои сообщения
              </h2>
              <button onClick={() => {
                setShowReaderMessagesModal(false);
                setSelectedReaderMessage(null);
                setNewMessageText('');
                setReplyMessageText('');
              }} className="text-gray-400 hover:text-white">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <div className="bg-gray-800 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 border-2 border-gray-700">
                <h3 className="text-sm sm:text-lg font-semibold text-red-500 mb-2 sm:mb-3 flex items-center gap-2">
                  <Send size={16} className="sm:w-5 sm:h-5" />
                  Написать новое сообщение автору
                </h3>
                <textarea
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  rows={3}
                  placeholder="Введите ваше сообщение..."
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none focus:border-red-600 text-white"
                />
                <button
                  onClick={sendNewMessage}
                  className="w-full bg-red-600 hover:bg-red-700 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Send size={16} className="sm:w-5 sm:h-5" />
                  Отправить сообщение
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-xl font-semibold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
                  <MailOpen size={18} className="sm:w-6 sm:h-6" />
                  История переписки
                </h3>
                
                {readerMessages.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-800 rounded-lg border-2 border-gray-700">
                    <Mail size={32} className="sm:w-12 sm:h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm sm:text-base text-gray-500">У вас пока нет сообщений</p>
                  </div>
                ) : (
                  readerMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`bg-gray-800 rounded-lg p-3 sm:p-5 border-2 transition ${
                        msg.admin_reply && !msg.is_read 
                          ? 'border-red-600 shadow-lg shadow-red-600/20' 
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-semibold text-white text-sm sm:text-base">Вы</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(msg.created_at).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {msg.admin_reply && !msg.is_read && (
                            <span className="bg-red-600 text-xs px-2 py-1 rounded font-bold animate-pulse">
                              НОВЫЙ ОТВЕТ
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedReaderMessage(
                            selectedReaderMessage?.id === msg.id ? null : msg
                          )}
                          className="text-gray-400 hover:text-red-500 text-xs sm:text-sm flex items-center gap-1"
                        >
                          {selectedReaderMessage?.id === msg.id ? 'Свернуть' : 'Развернуть'}
                        </button>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3">
                        <p className="text-xs text-gray-500 mb-2">Ваше сообщение:</p>
                        <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">
                          {selectedReaderMessage?.id === msg.id 
                            ? msg.message 
                            : msg.message.length > 100 
                              ? msg.message.slice(0, 100) + '...' 
                              : msg.message
                          }
                        </p>
                      </div>

{msg.admin_reply && (
  <div className="bg-red-900 bg-opacity-20 border-2 border-red-600 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3">
    <p className="text-xs text-red-400 mb-2 font-semibold flex items-center gap-1">
      <Mail size={12} className="sm:w-4 sm:h-4" />
      Ответ автора:
    </p>
    <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-wrap break-words">
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
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">
                            Ответить автору:
                          </h4>
                          <textarea
                            value={replyMessageText}
                            onChange={(e) => setReplyMessageText(e.target.value)}
                            rows={3}
                            placeholder="Напишите ваш ответ..."
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none focus:border-red-600 text-white"
                          />
                          <button
                            onClick={() => sendReaderReply(msg.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm flex items-center gap-2"
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
            </div>
          </div>
        </div>
      )}

      {/* READER PANEL */}
      {showReaderPanel && userProfile && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 border-l-2 border-red-600 z-40 overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gray-900 p-3 sm:p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-red-600">{userProfile.nickname}</h2>
            <button onClick={() => setShowReaderPanel(false)} className="text-gray-400 hover:text-white">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
            <button
              onClick={() => setShowReaderMessagesModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base"
            >
              <MessageSquare size={18} className="sm:w-5 sm:h-5" />
              Мои сообщения
              {readerMessages.some(m => m.admin_reply && !m.is_read) && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
                  {readerMessages.filter(m => m.admin_reply && !m.is_read).length}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-700 hover:bg-gray-600 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              {t.logout}
            </button>
          </div>
        </div>
      )}

      {/* ADMIN PANEL */}
      {showAdminPanel && isAdmin && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900 border-l-2 border-red-600 z-40 overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gray-900 p-3 sm:p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-red-600">Админ-панель</h2>
            <button onClick={() => setShowAdminPanel(false)} className="text-gray-400 hover:text-white">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <button
              onClick={() => {
                setShowManagementModal(true);
                loadManagementData();
              }}
              className="w-full bg-red-600 hover:bg-red-700 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Settings size={18} className="sm:w-5 sm:h-5" />
              Управление
            </button>

            <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                <Palette size={18} className="sm:w-5 sm:h-5 text-red-500" />
                Цвет акцента
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    className="w-16 sm:w-20 h-8 sm:h-10 rounded cursor-pointer border-2 border-gray-700"
                  />
                  <span className="text-xs sm:text-sm text-gray-400">{titleColor}</span>
                </div>
                <button
                  onClick={saveTitleColor}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition text-xs sm:text-sm font-bold"
                >
                  Сохранить
                </button>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/admin'}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FileText size={18} className="sm:w-5 sm:h-5" />
              Мои работы
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-700 hover:bg-gray-600 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              {t.logout}
            </button>
          </div>
        </div>
      )}

{/* HEADER */}
<div className="relative overflow-hidden px-4 sm:px-8 pt-4 sm:pt-6">
  <div className="max-w-7xl mx-auto">
    {/* РАМКА С ГРАДИЕНТОМ */}
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{
        padding: '3px',
        background: 'linear-gradient(135deg, #dc2626 0%, #000000 50%, #dc2626 100%)'
      }}
    >
      {/* ФОНОВОЕ ИЗОБРАЖЕНИЕ */}
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{
          backgroundImage: `url(${HEADER_BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '90px'
        }}
      >
        <style jsx>{`
          @media (min-width: 640px) {
            div[style*="backgroundImage"] {
              min-height: 35vh !important;
            }
          }
        `}</style>
        
        <div className="relative z-10 h-full flex flex-col min-h-[90px] sm:min-h-[35vh]">
          {/* ВЕРХНЯЯ ПАНЕЛЬ */}
          <div className="px-3 sm:px-6 py-2 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-red-600 rounded-full w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-xs sm:text-sm border-2 border-white shadow-lg flex-shrink-0">
                  18+
                </div>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm hover:border-red-600 transition"
                >
                  <option value="ru">RU</option>
                  <option value="en">EN</option>
                </select>
              </div>

              <div className="flex-shrink-0">
                {!user ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-red-600 hover:bg-red-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
                  >
                    <User size={14} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t.login}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => isAdmin ? setShowAdminPanel(true) : setShowReaderPanel(true)}
                    className="bg-red-600 hover:bg-red-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
                  >
                    <Menu size={14} className="sm:w-5 sm:h-5" />
                    <span className="max-w-[80px] sm:max-w-none truncate text-xs sm:text-base">{isAdmin ? 'Админ' : userProfile?.nickname}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* НАЗВАНИЕ */}
          <div className="flex-1 flex items-center justify-center px-3 sm:px-4 pb-2 sm:pb-4">
            <div className="text-center">
              <h1 className="text-3xl sm:text-6xl md:text-7xl font-bold tracking-widest leading-tight" style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}>
                <span style={{ color: titleColor }}>MELLO</span>
                <span className="text-white">STORY</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* NAVIGATION */}
<div className="relative z-10 px-4 sm:px-8 py-4">
  <div className="max-w-7xl mx-auto">
    <nav className="flex items-center justify-center gap-2 sm:gap-3 md:gap-6 text-sm sm:text-base flex-wrap">
      {[
        { key: 'completed', label: t.completed },
        { key: 'ongoing', label: t.ongoing },
        { key: 'minific', label: t.minific },
        { key: 'longfic', label: t.longfic },
        { key: 'novel', label: t.novels }
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => {
            setActiveCategory(item.key);
            setCurrentSlide(0);
            setExpandedWork(null);
          }}
          className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2.5 border-2 rounded-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap`}
          style={{
            borderColor: activeCategory === item.key ? titleColor : '#4b5563',
            backgroundColor: activeCategory === item.key ? `${titleColor}33` : 'rgba(17, 24, 39, 0.8)'
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </div>
</div>

      {/* MAIN CONTENT */}
      <main className="relative pb-16 sm:pb-32 px-4 sm:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto relative z-10">
          {loading ? (
            <div className="text-center py-12 sm:py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : displayWorks.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <p className="text-gray-400 text-lg sm:text-xl">{t.noWorks}</p>
            </div>
          ) : (
            <>
              <div className="relative">
                {displayWorks.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setCurrentSlide((currentSlide - 1 + displayWorks.length) % displayWorks.length);
                        setExpandedWork(null);
                      }}
                      className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-red-600 hover:bg-red-700 rounded-full p-2 sm:p-4 transition hover:scale-110 shadow-2xl"
                    >
                      <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentSlide((currentSlide + 1) % displayWorks.length);
                        setExpandedWork(null);
                      }}
                      className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-red-600 hover:bg-red-700 rounded-full p-2 sm:p-4 transition hover:scale-110 shadow-2xl"
                    >
                      <ChevronRight size={24} className="sm:w-8 sm:h-8" />
                    </button>
                  </>
                )}

                <div className="flex items-center justify-center py-8 sm:py-12 overflow-hidden" style={{ minHeight: '300px' }}>
                  {displayWorks.map((work, idx) => {
                    const isCenter = idx === currentSlide;
                    const isExpanded = expandedWork === work.id;

                    if (!isCenter && !isExpanded) return null;

                    return (
                      <div
                        key={work.id}
                        className={`transition-all duration-700 ${
                          isExpanded 
                            ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 sm:p-8' 
                            : 'w-full max-w-sm sm:max-w-md'
                        }`}
                      >
                        {isExpanded && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedWork(null);
                            }}
                            className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-red-600 hover:bg-red-700 rounded-full p-2 sm:p-3 transition z-60"
                          >
                            <X size={24} className="sm:w-8 sm:h-8" />
                          </button>
                        )}
                        
                        <div 
                          className={`bg-gray-900 rounded-2xl overflow-hidden border-4 hover:border-red-500 transition-all duration-300 shadow-2xl hover:shadow-red-600/50 ${!isExpanded && 'cursor-pointer'}`}
                          style={{ 
                            borderColor: isCenter ? titleColor : '#7f1d1d',
                            maxWidth: isExpanded ? '1000px' : 'auto',
                            width: '100%'
                          }}
                          onClick={() => !isExpanded && setExpandedWork(work.id)}
                        >
                          {isExpanded ? (
                            <div className="flex flex-col sm:grid sm:grid-cols-[300px_1fr] md:grid-cols-[400px_1fr] gap-4 sm:gap-6 p-4 sm:p-6 bg-black max-h-[90vh] overflow-y-auto">
                              <div className="aspect-[2/3] w-full sm:w-auto bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                {work.cover_url ? (
                                  <Image 
                                    src={work.cover_url} 
                                    alt={work.title} 
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    priority
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                    Нет обложки
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col justify-between">
                                <div>
                                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-red-600">{work.title}</h3>
                                  <div className="flex gap-2 flex-wrap mb-3 sm:mb-4">
                                    <span className="text-xs bg-gray-800 px-2 sm:px-3 py-1 rounded-full">{work.direction}</span>
                                    <span className="text-xs bg-red-900 px-2 sm:px-3 py-1 rounded-full">{work.rating}</span>
                                    <span className="text-xs bg-gray-700 px-2 sm:px-3 py-1 rounded-full">{work.status}</span>
                                  </div>
                                  <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 max-h-60 sm:max-h-96 overflow-y-auto">
                                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{work.description}</p>
                                  </div>
                                </div>
                                <Link 
                                  href={`/work/${work.id}`}
                                  className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 rounded-lg text-center transition text-sm sm:text-base"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t.startReading}
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="aspect-[2/3] bg-gray-800 relative">
                                {work.cover_url ? (
                                  <Image 
                                    src={work.cover_url} 
                                    alt={work.title} 
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 400px"
                                    priority={idx === currentSlide}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                    Нет обложки
                                  </div>
                                )}
                              </div>
                              <div className="p-4 sm:p-6 bg-black">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2 sm:mb-3 text-white">{work.title}</h3>
                                <p className="text-xs sm:text-sm text-gray-400 text-center line-clamp-3 mb-3 sm:mb-4">{work.description}</p>
                                <div className="flex gap-2 justify-center flex-wrap">
                                  <span className="text-xs bg-gray-800 px-2 sm:px-3 py-1 rounded-full">{work.direction}</span>
                                  <span className="text-xs bg-red-900 px-2 sm:px-3 py-1 rounded-full">{work.rating}</span>
                                  <span className="text-xs bg-gray-700 px-2 sm:px-3 py-1 rounded-full">{work.status}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {displayWorks.length > 1 && (
                <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                  {displayWorks.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentSlide(idx);
                        setExpandedWork(null);
                      }}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300`}
                      style={{
                        backgroundColor: idx === currentSlide ? titleColor : '#4b5563',
                        transform: idx === currentSlide ? 'scale(1.5)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ABOUT SECTION */}
        <div className="max-w-4xl mx-auto mt-16 sm:mt-32 relative z-10">
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-10 border-2" style={{ borderColor: titleColor }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: titleColor
            }}>
              {t.about}
            </h2>
            <div className="text-gray-300 text-center leading-relaxed text-sm sm:text-base">
              <p>Ранее я публиковала свои работы на Фикбуке под именем Rossepadion, поэтому "старые" произведения будут иметь обложки с этим псевдонимом. Однако все новые фанфики и романы будут выходить под новым именем. Этот сайт сейчас находится в разработке и будет постепенно улучшаться, а также пополняться новыми работами. Буду признательна за ваши отзывы и обратную связь!</p>
            </div>
          </div>
        </div>

        {/* DISCLAIMERS */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16 space-y-4 sm:space-y-6 relative z-10">
          <div className="bg-red-900 bg-opacity-30 border-2 sm:border-4 border-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-8 sm:h-8">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
              <span className="text-base sm:text-2xl md:text-3xl">{t.disclaimer18}</span>
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed text-justify">{t.disclaimerText}</p>
          </div>

          <div className="bg-gray-900 border-2 sm:border-4 border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-300 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-8 sm:h-8">
                <circle cx="12" cy="12" r="10"/>
                <path d="M14.83 14.83a4 4 0 1 1 0-5.66"/>
              </svg>
              <span className="text-base sm:text-2xl md:text-3xl">{t.copyrightTitle}</span>
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed text-justify">{t.copyrightText}</p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black py-6 sm:py-8 text-center text-gray-500 relative z-10 border-t border-gray-800">
        <p className="text-base sm:text-lg">MelloStory © 2025</p>
      </footer>
    </div>
  );
}
