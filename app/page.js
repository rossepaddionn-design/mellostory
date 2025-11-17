'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, X, Menu, LogOut, User, MessageSquare, Palette, FileText, Settings, Trash2, Send, Mail, MailOpen, AlertTriangle, Reply } from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState('ru');
  const [titleColor, setTitleColor] = useState('#ef4444');
  const [activeCategory, setActiveCategory] = useState('minific');
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
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const [siteUpdates, setSiteUpdates] = useState([]);
  
  const [showReaderPanel, setShowReaderPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [showReaderMessagesModal, setShowReaderMessagesModal] = useState(false);
  const [readerMessages, setReaderMessages] = useState([]);
  const [selectedReaderMessage, setSelectedReaderMessage] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [replyMessageText, setReplyMessageText] = useState('');

  const [messageText, setMessageText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  const [showManagementModal, setShowManagementModal] = useState(false);
  const [newsText, setNewsText] = useState('Здесь будут появляться новости о новых работах и обновлениях сайта.');
  const [aboutText, setAboutText] = useState('Ранее я публиковала свои работы на Фикбуке под именем Rossepadion, поэтому "старые" произведения будут иметь обложки с этим псевдонимом. Однако все новые фанфики и романы будут выходить под новым именем. Этот сайт сейчас находится в разработке и будет постепенно улучшаться, а также пополняться новыми работами. Буду признательна за ваши отзывы и обратную связь!');
  const [popularWorks, setPopularWorks] = useState([
    { id: 1, title: '', rating: '', views: '' },
    { id: 2, title: '', rating: '', views: '' },
    { id: 3, title: '', rating: '', views: '' }
  ]);
  const [showPopularEditModal, setShowPopularEditModal] = useState(false);
  const [editingPopularIndex, setEditingPopularIndex] = useState(null);
  const [editPopularForm, setEditPopularForm] = useState({ title: '', rating: '', views: '' });
  const [editingSection, setEditingSection] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [managementTab, setManagementTab] = useState('comments');
  const [comments, setComments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');

  const ADMIN_PASSWORD = 'M@___m@_18_97_mam@_mello_18_97_06_mama';
  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';
  const HEADER_BG_IMAGE = '/images/header-bg-v2.jpg';

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

  useEffect(() => {
    loadWorks();
    loadSettings();
    checkUser();
    loadSiteUpdates();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setUser(session.user);
      
      const { data: profile } = await supabase
        .from('reader_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profile) {
        if (profile.is_banned) {
          alert('Ваш аккаунт заблокирован!');
          await supabase.auth.signOut();
          return;
        }
        setUserProfile(profile);
        setIsAdmin(false);
      } else if (session.user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      }
    } else {
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession === 'true') {
        setIsAdmin(true);
        setUser({ email: ADMIN_EMAIL, id: 'admin' });
      }
    }
  };

  const loadWorks = async () => {
    const cacheKey = 'homepage_works';
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const worksData = JSON.parse(cached);
        setWorks(worksData);
        setCompletedWorks(worksData.filter(w => w.status === 'Завершён'));
        setOngoingWorks(worksData.filter(w => w.status === 'В процессе'));
        setMinificWorks(worksData.filter(w => w.category === 'minific'));
        setLongficWorks(worksData.filter(w => w.category === 'longfic'));
        setNovelWorks(worksData.filter(w => w.category === 'novel'));
        setLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка чтения кэша:', e);
      }
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('works')
      .select('id, title, cover_url, direction, rating, status, category, fandom, pairing, description, created_at')
      .eq('is_draft', false)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Ошибка загрузки работ:', error);
    } else {
      const worksData = data || [];
      
      sessionStorage.setItem(cacheKey, JSON.stringify(worksData));
      
      setWorks(worksData);
      setCompletedWorks(worksData.filter(w => w.status === 'Завершён'));
      setOngoingWorks(worksData.filter(w => w.status === 'В процессе'));
      setMinificWorks(worksData.filter(w => w.category === 'minific'));
      setLongficWorks(worksData.filter(w => w.category === 'longfic'));
      setNovelWorks(worksData.filter(w => w.category === 'novel'));
    }
    setLoading(false);
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

  const loadSettings = async () => {
    try {
      const cachedColor = localStorage.getItem('titleColor');
      if (cachedColor) {
        setTitleColor(cachedColor);
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('title_color, news_text, about_text, popular_works')
        .eq('id', 1)
        .maybeSingle();
      
      if (data && !error) {
        if (data.title_color && data.title_color.trim() !== '') {
          setTitleColor(data.title_color);
          localStorage.setItem('titleColor', data.title_color);
        }
        if (data.news_text) setNewsText(data.news_text);
        if (data.about_text) setAboutText(data.about_text);
        
        if (data.popular_works) {
          try {
            const parsed = typeof data.popular_works === 'string' 
              ? JSON.parse(data.popular_works) 
              : data.popular_works;
            setPopularWorks(parsed);
          } catch (e) {
            console.error('Ошибка парсинга popular_works:', e);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки настроек:', err);
    }
  };

  useEffect(() => {
    if (showReaderMessagesModal && user && userProfile) {
      loadReaderMessages();
    }
  }, [showReaderMessagesModal, user, userProfile]);

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

    if (!agreedToPrivacy) {
      alert('Необходимо согласиться с политикой конфиденциальности!');
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
        setAgreedToPrivacy(false);
      }
    }
  };

  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) {
      alert('Введите email и пароль!');
      return;
    }

    if (authForm.email === ADMIN_EMAIL && authForm.password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setUser({ email: ADMIN_EMAIL, id: 'admin' });
      localStorage.setItem('admin_session', 'true');
      setShowAuthModal(false);
      setAuthForm({ nickname: '', email: '', password: '' });
      return;
    }

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
        setIsAdmin(false);
      }
      
      setShowAuthModal(false);
      setAuthForm({ nickname: '', email: '', password: '' });
    }
  };

  const handleLogout = async () => {
    if (isAdmin) {
      setIsAdmin(false);
      setUser(null);
      localStorage.removeItem('admin_session');
    } else {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    }
    setShowReaderPanel(false);
    setShowAdminPanel(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      alert('Введите пароль для подтверждения!');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password: deletePassword
    });

    if (signInError) {
      alert('Неверный пароль!');
      return;
    }

    if (!confirm('Вы уверены? Это действие необратимо!')) {
      return;
    }

    try {
      if (deleteReason.trim()) {
        await supabase.from('deletion_reasons').insert({
          user_id: user.id,
          nickname: userProfile.nickname,
          reason: deleteReason.trim(),
          deleted_at: new Date().toISOString()
        });
      }

      await supabase.from('reader_profiles').delete().eq('user_id', user.id);
      await supabase.from('comments').delete().eq('user_id', user.id);
      await supabase.from('messages').delete().eq('from_user_id', user.id);
      await supabase.auth.signOut();
      
      alert('Ваш аккаунт успешно удалён.');
      setShowDeleteAccountModal(false);
      setDeleteReason('');
      setDeletePassword('');
      setUser(null);
      setUserProfile(null);
      setShowReaderPanel(false);
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
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
  
  const saveText = async () => {
    try {
      const updateData = editingSection === 'news' 
        ? { news_text: editText } 
        : { about_text: editText };

      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, ...updateData }, { onConflict: 'id' });

      if (error) throw error;
      
      if (editingSection === 'news') {
        setNewsText(editText);
      } else {
        setAboutText(editText);
      }
      
      setShowEditModal(false);
      setEditingSection(null);
      setEditText('');
      alert('✅ Текст сохранён!');
    } catch (err) {
      alert('❌ Ошибка: ' + err.message);
    }
  };

  const savePopularWork = async (index) => {
    try {
      const updatedWorks = [...popularWorks];
      updatedWorks[index] = { ...editPopularForm, id: index + 1 };

      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          id: 1, 
          popular_works: updatedWorks 
        }, { onConflict: 'id' });

      if (error) throw error;
      
      setPopularWorks(updatedWorks);
      setShowPopularEditModal(false);
      setEditingPopularIndex(null);
      setEditPopularForm({ title: '', rating: '', views: '' });
      alert('✅ Популярная работа сохранена!');
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

return (
    <>
      <link rel="preload" href="/images/main-bg.jpg" as="image" />
      <link rel="preload" href="/images/header-bg.jpg" as="image" />
      
      <div className="min-h-screen text-white overflow-x-hidden relative">
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/main-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#000'
        }}
      />

{/* HEADER */}
<div className="relative overflow-hidden px-4 sm:px-8 pt-4 sm:pt-6">
  <div className="max-w-7xl mx-auto">
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{
        padding: '3px',
        background: 'linear-gradient(135deg, #67327b 0%, #000000 50%, #67327b 100%)'
      }}
    >
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
          <div className="px-3 sm:px-6 py-2 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-4">
                <div 
                  className="rounded-full w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
                    boxShadow: '0 0 15px rgba(220, 38, 38, 0.8), 0 0 30px rgba(127, 29, 29, 0.6), inset 0 0 10px rgba(220, 38, 38, 0.5)',
                    border: '2px solid rgba(220, 38, 38, 0.8)'
                  }}
                >
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
                    className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
                    style={{
                      background: 'linear-gradient(135deg, #b48dc4 0%, #9370db 100%)',
                      boxShadow: '0 0 15px rgba(180, 141, 196, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #d5acec 0%, #b48dc4 100%)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(213, 172, 236, 0.9), 0 0 35px rgba(180, 141, 196, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #b48dc4 0%, #9370db 100%)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 141, 196, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)';
                    }}
                  >
                    <User size={14} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t.login}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => isAdmin ? setShowAdminPanel(true) : setShowReaderPanel(true)}
                    className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
                    style={{
                      background: 'linear-gradient(135deg, #b48dc4 0%, #9370db 100%)',
                      boxShadow: '0 0 15px rgba(180, 141, 196, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #d5acec 0%, #b48dc4 100%)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(213, 172, 236, 0.9), 0 0 35px rgba(180, 141, 196, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #b48dc4 0%, #9370db 100%)';
                      e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 141, 196, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)';
                    }}
                  >
                    <Menu size={14} className="sm:w-5 sm:h-5" />
                    <span className="max-w-[80px] sm:max-w-none truncate text-xs sm:text-base">{isAdmin ? 'Админ' : userProfile?.nickname}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-3 sm:px-4 pb-2 sm:pb-4">
            <div className="text-center">
<h1 className="text-3xl sm:text-6xl md:text-7xl font-bold tracking-widest leading-tight" style={{
  fontFamily: "'Playfair Display', Georgia, serif",
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
}}>
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .mello-shimmer {
      background: linear-gradient(90deg, #9370db 0%, #ffffff 50%, #9370db 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }
  `}} />
<span className="mello-shimmer">MELLO</span>
<span style={{
  color: '#8c32d2',
  textShadow: '0 0 20px rgba(140, 50, 210, 0.9), 0 0 40px rgba(140, 50, 210, 0.6), 0 0 60px rgba(140, 50, 210, 0.4)'
}}>STORY</span>
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
  borderColor: activeCategory === item.key ? '#ffffff' : '#984bc3',
  backgroundColor: activeCategory === item.key ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  color: activeCategory === item.key ? '#ffffff' : '#d1d5db'
}}
          onMouseEnter={(e) => {
            if (activeCategory !== item.key) {
              e.currentTarget.style.borderColor = '#d5acec';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(213, 172, 236, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeCategory !== item.key) {
              e.currentTarget.style.borderColor = '#984bc3';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </div>
</div>

      {/* MAIN CONTENT */}
      <main className="pb-16 sm:pb-32 px-4 sm:px-8 min-h-screen">
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
                      className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full p-1 sm:p-2 transition hover:scale-110"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)',
                        color: '#000000'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)';
                      }}
                    >
                      <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentSlide((currentSlide + 1) % displayWorks.length);
                        setExpandedWork(null);
                      }}
                      className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full p-1 sm:p-2 transition hover:scale-110"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)',
                        color: '#000000'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)';
                      }}
                    >
                      <ChevronRight size={16} className="sm:w-5 sm:h-5" />
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
                            ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4 sm:p-8 overflow-y-auto' 
                            : 'w-full max-w-[280px] sm:max-w-[320px]'
                        }`}
                      >
                        {isExpanded && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedWork(null);
                            }}
                            className="fixed top-4 sm:top-8 right-4 sm:right-8 rounded-full p-2 sm:p-3 transition z-[10000]"
                            style={{
                              background: 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)',
                              boxShadow: '0 0 20px rgba(188, 141, 216, 0.9), 0 0 35px rgba(147, 112, 219, 0.7)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #d5acec 0%, #bc8dd8 100%)';
                              e.currentTarget.style.boxShadow = '0 0 25px rgba(213, 172, 236, 1), 0 0 45px rgba(188, 141, 216, 0.8)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)';
                              e.currentTarget.style.boxShadow = '0 0 20px rgba(188, 141, 216, 0.9), 0 0 35px rgba(147, 112, 219, 0.7)';
                            }}
                          >
                            <X size={24} className="sm:w-8 sm:h-8" />
                          </button>
                        )}
                        
<div 
  className="relative bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 ${!isExpanded && 'cursor-pointer'}"
  style={{ 
    padding: '6px',
    background: 'linear-gradient(135deg, #000000 0%, #8c32d2 50%, #000000 100%)',
    maxWidth: isExpanded ? '1000px' : 'auto',
    width: '100%'
  }}
                          onClick={() => !isExpanded && setExpandedWork(work.id)}
                        >
                          {isExpanded ? (
                            <div className="flex flex-col sm:grid sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] gap-4 sm:gap-6 p-4 sm:p-6 bg-black max-h-[85vh] overflow-y-auto rounded-2xl">
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
                                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4" style={{ 
                                    color: '#bc8dd8',
                                    textShadow: '0 0 20px rgba(188, 141, 216, 0.8)'
                                  }}>{work.title}</h3>
                                  
                                  {(work.fandom || work.pairing) && (
                                    <div className="mb-3 space-y-1">
                                      {work.fandom && (
                                        <div className="text-xs sm:text-sm">
                                          <span className="text-gray-400">Фандом: </span>
                                          <span className="text-gray-200">{work.fandom}</span>
                                        </div>
                                      )}
                                      {work.pairing && (
                                        <div className="text-xs sm:text-sm">
                                          <span className="text-gray-400">Пейринг: </span>
                                          <span className="text-gray-200">{work.pairing}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {work.description && (
                                    <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 leading-relaxed whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{work.description}</p>
                                  )}
                                  
                                  <div className="flex gap-2 flex-wrap mb-3 sm:mb-4">
                                    <span className="text-xs bg-gray-800 px-2 sm:px-3 py-1 rounded-full">{work.direction}</span>
                                    <span className="text-xs bg-red-900 px-2 sm:px-3 py-1 rounded-full">{work.rating}</span>
                                    <span className="text-xs bg-gray-700 px-2 sm:px-3 py-1 rounded-full">{work.status}</span>
                                  </div>
                                </div>
                                
                                <Link 
                                  href={`/work/${work.id}`}
                                  className="block w-full text-white font-bold py-2 sm:py-3 rounded-lg text-center transition text-sm sm:text-base"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    background: 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)',
                                    boxShadow: '0 0 15px rgba(188, 141, 216, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #d5acec 0%, #bc8dd8 100%)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(213, 172, 236, 0.9), 0 0 35px rgba(188, 141, 216, 0.7)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(188, 141, 216, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)';
                                  }}
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

{/* ПОПУЛЯРНЫЕ РАБОТЫ */}
<div className="max-w-5xl mx-auto mt-12 sm:mt-16 relative z-0">
  <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
    Популярные работы
  </h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
    {popularWorks.map((work, index) => (
      <div
        key={work.id}
        className="relative rounded-xl p-6 border-2 transition hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(155, 115, 176, 0.4) 0%, rgba(103, 50, 123, 0.6) 100%)',
          borderColor: '#9b73b0',
          boxShadow: '0 0 20px rgba(155, 115, 176, 0.6), 0 0 40px rgba(155, 115, 176, 0.3)'
        }}
      >
        {isAdmin && (
          <button
            onClick={() => {
              setEditingPopularIndex(index);
              setEditPopularForm(work);
              setShowPopularEditModal(true);
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
              boxShadow: '0 0 10px rgba(220, 38, 38, 0.8)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        )}

        {work.title ? (
          <>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-6 text-center pr-6 break-words">
              {work.title}
            </h3>
            
            <div className="flex justify-center items-center gap-6">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span className="text-yellow-400 font-bold text-lg">
                  {work.rating || '—'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span className="text-blue-400 font-bold text-lg">
                  {work.views || '—'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              Скоро здесь появится работа
            </p>
          </div>
        )}
      </div>
    ))}
  </div>
</div>

{/* НОВОСТИ */}
<div className="max-w-3xl mx-auto mt-8 sm:mt-12 relative z-0">
  <div className="bg-black rounded-2xl p-6 sm:p-10 border-2 relative" style={{ borderColor: '#cdb0e3' }}>
    {isAdmin && (
      <button
        onClick={() => {
          setEditingSection('news');
          setEditText(newsText);
          setShowEditModal(true);
        }}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 w-8 h-8 rounded-full flex items-center justify-center transition"
        title="Редактировать новости"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    )}
    <div className="text-white text-center leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
      <p>{newsText}</p>
    </div>
  </div>
</div>

{/* ABOUT SECTION */}
<div className="max-w-3xl mx-auto mt-12 sm:mt-20 relative z-0">
  <div className="bg-black rounded-2xl p-6 sm:p-10 border-2 relative" style={{ borderColor: '#cdb0e3' }}>
    {isAdmin && (
      <button
        onClick={() => {
          setEditingSection('about');
          setEditText(aboutText);
          setShowEditModal(true);
        }}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 w-8 h-8 rounded-full flex items-center justify-center transition"
        title="Редактировать информацию"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    )}
    <div className="text-white text-center leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
      <p>{aboutText}</p>
    </div>
  </div>
</div>

{/* DISCLAIMERS */}
<div className="max-w-3xl mx-auto mt-8 sm:mt-12 space-y-3 sm:space-y-4 relative z-0">
  <div 
    className="border-2 sm:border-4 rounded-xl sm:rounded-2xl p-4 sm:p-8"
    style={{
      background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.4) 0%, rgba(74, 14, 14, 0.6) 100%)',
      borderColor: '#7f1d1d'
    }}
  >
    <h3 
      className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3"
      style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 30px rgba(220, 38, 38, 0.8), 0 0 50px rgba(127, 29, 29, 0.6)',
        filter: 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.7))'
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" className="sm:w-8 sm:h-8">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/>
        <path d="M12 17h.01"/>
      </svg>
      <span className="text-base sm:text-2xl md:text-3xl">{t.disclaimer18}</span>
    </h3>
    <p className="text-xs sm:text-sm md:text-base text-white leading-relaxed">{t.disclaimerText}</p>
  </div>

 <div className="bg-black border-2 sm:border-4 rounded-xl sm:rounded-2xl p-4 sm:p-8" style={{ borderColor: '#cdb0e3' }}>
    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-8 sm:h-8">
        <circle cx="12" cy="12"r="10"/>
        <path d="M14.83 14.83a4 4 0 1 1 0-5.66"/>
      </svg>
      <span className="text-base sm:text-2xl md:text-3xl">{t.copyrightTitle}</span>
    </h3>
    <p className="text-xs sm:text-sm md:text-base text-white leading-relaxed">{t.copyrightText}</p>
  </div>
</div>
      </main>

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
        onClick={() => {
          setShowUpdatesModal(true);
          loadSiteUpdates();
        }}
        className="w-full py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base text-white"
        style={{
          background: siteUpdates.length > 0
            ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        Обновления
        {siteUpdates.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
            {siteUpdates.length}
          </span>
        )}
      </button>

      <button
        onClick={() => setShowReaderMessagesModal(true)}
        className="w-full py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base text-white"
        style={{
          background: readerMessages.some(m => m.admin_reply && !m.is_read)
            ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
            : 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
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
        onClick={() => setShowDeleteAccountModal(true)}
        className="w-full py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base text-white"
        style={{
          background: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Trash2 size={18} className="sm:w-5 sm:h-5" />
        Удалить аккаунт
      </button>

      <button
        onClick={handleLogout}
        className="w-full py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base text-white"
        style={{
          background: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        }}
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

      {/* FOOTER */}
      <footer className="bg-black py-6 sm:py-8 text-center text-gray-500 relative z-[5] border-t border-gray-800">
        <p className="text-base sm:text-lg mb-2">MelloStory © 2025</p>
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-red-500 transition underline">
            Политика конфиденциальности
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/terms" className="text-sm text-gray-400 hover:text-red-500 transition underline">
            Пользовательское соглашение
          </Link>
        </div>
      </footer>
    </div>
    </>
  );
} 