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
    <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2" style={{ borderColor: '#8b3cc8' }}></div>
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
  backgroundColor: idx === currentSlide ? '#ce0dbe' : '#ffffff',
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

{/* AUTH MODAL */}
{showAuthModal && (
  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-lg w-full max-w-md p-4 sm:p-8 border-2" style={{
      background: 'rgba(103, 50, 123, 0.3)',
      backdropFilter: 'blur(10px)',
      borderColor: '#9370db'
    }}>
      <div className="flex justify-center items-center mb-4 sm:mb-6 relative">
        <h2 className="text-xl sm:text-2xl font-bold">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes authShimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .auth-shimmer {
              background: linear-gradient(90deg, #9370db 0%, #ffffff 50%, #9370db 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: authShimmer 3s linear infinite;
            }
          `}} />
          <span className="auth-shimmer">
            {authMode === 'login' ? t.login : t.register}
          </span>
        </h2>
        <button onClick={() => {
          setShowAuthModal(false);
          setAgreedToPrivacy(false);
        }} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {authMode === 'register' && (
          <div>
            <label className="block text-gray-300 text-sm mb-1 sm:mb-2">{t.nickname}</label>
<input
  type="text"
  placeholder={t.nickname}
  value={authForm.nickname}
  onChange={(e) => setAuthForm({...authForm, nickname: e.target.value})}
  className="w-full border rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none text-white"
  style={{ 
    background: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#67327b'
  }}
  onFocus={(e) => e.currentTarget.style.borderColor = '#9370db'}
  onBlur={(e) => e.currentTarget.style.borderColor = '#67327b'}
/>
          </div>
        )}

        <div>
          <label className="block text-gray-300 text-sm mb-1 sm:mb-2">{t.email}</label>
<input
  type="email"
  placeholder={t.email}
  value={authForm.email}
  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
  className="w-full border rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none text-white"
  style={{ 
    background: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#67327b'
  }}
  onFocus={(e) => e.currentTarget.style.borderColor = '#9370db'}
  onBlur={(e) => e.currentTarget.style.borderColor = '#67327b'}
/>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1 sm:mb-2">{t.password}</label>
          <input
            type="password"
            placeholder={t.password}
            value={authForm.password}
            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
            className="w-full border rounded px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none text-white"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#67327b'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#9370db'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#67327b'}
          />
        </div>

        {authMode === 'register' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg border" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: '#67327b'
            }}>
              <input
                type="checkbox"
                id="privacy-checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
                style={{ accentColor: '#9370db' }}
              />
              <label htmlFor="privacy-checkbox" className="text-xs sm:text-sm text-gray-300 cursor-pointer">
                Я согласен с{' '}
                <Link href="/privacy" className="hover:text-white underline" style={{ color: '#9370db' }} target="_blank">
                  Политикой конфиденциальности
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg border" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: '#67327b'
            }}>
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
                style={{ accentColor: '#9370db' }}
              />
              <label htmlFor="terms-checkbox" className="text-xs sm:text-sm text-gray-300 cursor-pointer">
                Я согласен с{' '}
                <Link href="/terms" className="hover:text-white underline" style={{ color: '#9370db' }} target="_blank">
                  Пользовательским соглашением
                </Link>
              </label>
            </div>
          </div>
        )}

        <button
          onClick={authMode === 'login' ? handleLogin : handleRegister}
          className="w-full py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
          style={{
            background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
            boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #b48dc4 0%, #9370db 100%)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(180, 141, 196, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #9370db 0%, #67327b 100%)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(147, 112, 219, 0.6)';
          }}
        >
          {authMode === 'login' ? t.login : t.register}
        </button>

        <button
          onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setAgreedToPrivacy(false);
          }}
          className="w-full text-gray-400 hover:text-white text-xs sm:text-sm"
        >
          {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  </div>
)}

{/* DELETE ACCOUNT MODAL */}
{showDeleteAccountModal && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
<div className="bg-black rounded-lg w-full max-w-md p-4 sm:p-6 border-2" style={{ borderColor: '#a837d7' }}>
  <div className="flex justify-between items-center mb-4 sm:mb-6">
    <h2 className="text-xl sm:text-2xl font-bold text-center">
      <span className="shimmer-btn-text">⚠️ Удаление аккаунта</span>
    </h2>
        <button onClick={() => {
          setShowDeleteAccountModal(false);
          setDeleteReason('');
          setDeletePassword('');
        }} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

<div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6" style={{ background: '#c596d9' }}>
  <p className="text-xs sm:text-sm" style={{ color: '#000000' }}>
          ⚠️ Это действие необратимо! Все ваши данные будут удалены навсегда.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Причина удаления <span className="text-gray-500">(необязательно)</span>
          </label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            placeholder="Расскажите, почему вы решили удалить аккаунт..."
           className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none text-white resize-none"
style={{ 
  background: '#000000',
  borderColor: '#8b3cc8'
}}
onFocus={(e) => e.currentTarget.style.borderColor = '#8b3cc8'}
onBlur={(e) => e.currentTarget.style.borderColor = '#8b3cc8'}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Введите пароль для подтверждения <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Ваш пароль"
           className="w-full border rounded px-3 py-2 text-sm sm:text-base focus:outline-none text-white"
style={{ 
  background: '#000000',
  borderColor: '#8b3cc8'
}}
onFocus={(e) => e.currentTarget.style.borderColor = '#8b3cc8'}
onBlur={(e) => e.currentTarget.style.borderColor = '#8b3cc8'}
          />
        </div>

<button
  onClick={handleDeleteAccount}
  className="w-full py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
  style={{ background: '#8b3cc8', color: '#ffffff' }}
>
          <Trash2 size={18} className="sm:w-5 sm:h-5" />
          Удалить аккаунт навсегда
        </button>

<button
  onClick={() => {
    setShowDeleteAccountModal(false);
    setDeleteReason('');
    setDeletePassword('');
  }}
  className="w-full py-2 sm:py-3 rounded-lg font-bold transition text-sm sm:text-base"
  style={{ background: '#8b3cc8', color: '#ffffff' }}
>
  Отмена
</button>
      </div>
    </div>
  </div>
)}

{/* UPDATES MODAL */}
{showUpdatesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
<div className="bg-black rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col border-2" style={{ borderColor: '#a837d7' }}>
  <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
    <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 w-full">
      <span className="shimmer-btn-text">📚 Обновления сайта</span>
    </h2>
        <button onClick={() => setShowUpdatesModal(false)} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {siteUpdates.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border-2 border-gray-700">
            <p className="text-gray-500">Пока нет обновлений</p>
          </div>
        ) : (
          <div className="space-y-3">
            {siteUpdates.map((update) => (
              <div 
                key={update.id}
className="rounded-lg p-4 border-2 transition cursor-pointer bg-black"
style={{
  borderColor: update.type === 'new_work' ? '#8b3cc8' : '#333'
}}
onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b3cc8'}
onMouseLeave={(e) => e.currentTarget.style.borderColor = update.type === 'new_work' ? '#8b3cc8' : '#333'}
                onClick={async () => {
                  await supabase.from('site_updates').delete().eq('id', update.id);
                  loadSiteUpdates();
                  window.location.href = `/work/${update.work_id}`;
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    {update.type === 'new_work' ? (
                      <>
                        <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                          НОВАЯ РАБОТА
                        </span>
                        <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                          {update.work_title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-white font-semibold text-base sm:text-lg mb-1">
                          {update.work_title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-1">
                          {update.chapter_number} глава {update.chapter_title && `- ${update.chapter_title}`}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* READER MESSAGES MODAL */}
{showReaderMessagesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-2 sm:p-8">
<div className="bg-black rounded-lg w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col border-2" style={{ borderColor: '#a837d7' }}>
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-6 border-b border-gray-700 gap-2">
    <h2 className="text-lg sm:text-2xl font-bold text-center">
      <span className="shimmer-btn-text">📧 Мои сообщения</span>
    </h2>
        <button 
          onClick={() => {
            setShowReaderMessagesModal(false);
            setSelectedReaderMessage(null);
            setNewMessageText('');
            setReplyMessageText('');
          }} 
          className="text-gray-400 hover:text-white self-end sm:self-auto z-50"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
<div className="rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 border-2" style={{ 
  background: '#000000',
  borderColor: '#8b3cc8'
}}>
          <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2" style={{ color: '#8b3cc8' }}>
            <Send size={16} className="sm:w-5 sm:h-5" />
            Написать новое сообщение автору
          </h3>
          <textarea
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            rows={3}
            placeholder="Введите ваше сообщение..."
           className="w-full border rounded px-3 py-2 mb-2 sm:mb-3 text-sm sm:text-base focus:outline-none text-white"
style={{ 
  background: '#000000',
  borderColor: '#8b3cc8'
}}
onFocus={(e) => e.currentTarget.style.borderColor = '#8b3cc8'}
onBlur={(e) => e.currentTarget.style.borderColor = '#8b3cc8'}
          />
<button
  onClick={sendNewMessage}
  className="w-full py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
  style={{ background: '#8b3cc8', color: '#ffffff' }}
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
                className={`rounded-lg p-3 sm:p-5 border-2 transition ${
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
  <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-black border-l-2 z-40 overflow-y-auto shadow-2xl" style={{ borderColor: '#b3e7ef' }}>
<div className="sticky top-0 bg-black p-3 sm:p-4 border-b border-gray-700 flex justify-center items-center relative">
  <h2 className="text-lg sm:text-xl font-bold" style={{ 
    color: '#b3e7ef',
    textShadow: '0 0 20px rgba(179, 231, 239, 0.8), 0 0 40px rgba(179, 231, 239, 0.4)'
  }}>{userProfile.nickname}</h2>
      <button onClick={() => setShowReaderPanel(false)} className="text-gray-400 hover:text-white absolute right-3 sm:right-4">
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
  background: 'linear-gradient(135deg, #a063cf 0%, #7c3aad 100%)',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
}}
      >
<style dangerouslySetInnerHTML={{__html: `
  @keyframes shimmer-btn {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
.shimmer-btn-text {
  background: linear-gradient(90deg, #b3e7ef 0%, #ef01cb 50%, #b3e7ef 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-btn 3s linear infinite;
  }
`}} />
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b3e7ef" strokeWidth="2" className="sm:w-5 sm:h-5">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
  <path d="M2 17l10 5 10-5"/>
  <path d="M2 12l10 5 10-5"/>
</svg>
<span className="shimmer-btn-text">Обновления</span>
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
  background: 'linear-gradient(135deg, #a063cf 0%, #7c3aad 100%)',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
}}
>
<MessageSquare size={18} className="sm:w-5 sm:h-5" style={{ color: '#b3e7ef' }} />
<span className="shimmer-btn-text">Мои сообщения</span>
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
  background: 'linear-gradient(135deg, #a063cf 0%, #7c3aad 100%)',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
}}
>
<Trash2 size={18} className="sm:w-5 sm:h-5" style={{ color: '#b3e7ef' }} />
<span className="shimmer-btn-text">Удалить аккаунт</span>
      </button>

<button
  onClick={handleLogout}
  className="w-full py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base text-white"
  style={{
    background: 'linear-gradient(135deg, #a063cf 0%, #7c3aad 100%)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  }}
>
  <LogOut size={18} className="sm:w-5 sm:h-5" style={{ color: '#b3e7ef' }} />
  <span className="shimmer-btn-text">Выход</span>
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