'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, X, Menu, LogOut, User, MessageSquare, Palette, FileText, Settings, Trash2, Send, Mail, MailOpen, AlertTriangle, Reply } from 'lucide-react';
import { supabaseUGC } from '@/lib/supabase-ugc';
import { Heart, Bookmark, Image as ImageIcon } from 'lucide-react';


export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState('ru');
  const [titleColor, setTitleColor] = useState('#ef4444');
const [activeCategory, setActiveCategory] = useState('novel');
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
  const [showSnow, setShowSnow] = useState(true); // управление снегом
  const [isDarkTheme, setIsDarkTheme] = useState(true);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmMessage, setConfirmMessage] = useState('');
const [confirmAction, setConfirmAction] = useState(null);
const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
const [changeEmailForm, setChangeEmailForm] = useState({ newEmail: '', password: '' });
const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '' });
const [showCalendarModal, setShowCalendarModal] = useState(false);
const [showEventModal, setShowEventModal] = useState(false);
const [selectedDate, setSelectedDate] = useState(null);
const [eventText, setEventText] = useState('');
const [calendarEvents, setCalendarEvents] = useState({});
const [currentMonth, setCurrentMonth] = useState(new Date());
const [showPageBgEditor, setShowPageBgEditor] = useState(false);
const [editingTheme, setEditingTheme] = useState('dark'); // 'dark' или 'light'
const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' или 'mobile'
const [darkBgImage, setDarkBgImage] = useState(null);
const [lightBgImage, setLightBgImage] = useState(null);
const [darkBgPosition, setDarkBgPosition] = useState({ x: 50, y: 50 });
const [lightBgPosition, setLightBgPosition] = useState({ x: 50, y: 50 });

const showConfirm = (message, action = null) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
};

const loadCalendarEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('calendar_events')
      .eq('id', 1)
      .single();
    
    if (data?.calendar_events) {
      setCalendarEvents(typeof data.calendar_events === 'string' 
        ? JSON.parse(data.calendar_events) 
        : data.calendar_events);
    }
  } catch (err) {
    console.error('Ошибка загрузки событий:', err);
  }
};

const saveEvent = async () => {
  if (!eventText.trim()) {
    showConfirm('Введите текст события!');
    return;
  }

  const dateKey = selectedDate.toISOString().split('T')[0];
  const newEvents = { ...calendarEvents };
  
  if (!newEvents[dateKey]) {
    newEvents[dateKey] = [];
  }
  
  if (newEvents[dateKey].length >= 10) {
    showConfirm('Максимум 10 событий на день!');
    return;
  }
  
  newEvents[dateKey].push(eventText);

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, calendar_events: newEvents }, { onConflict: 'id' });

  if (error) {
    showConfirm('Ошибка: ' + error.message);
  } else {
    setCalendarEvents(newEvents);
    setEventText('');
    setShowEventModal(false);
    showConfirm('Событие добавлено!');
  }
};

const deleteEvent = async (eventIndex) => {
  const dateKey = selectedDate.toISOString().split('T')[0];
  const newEvents = { ...calendarEvents };
  newEvents[dateKey].splice(eventIndex, 1);
  
  if (newEvents[dateKey].length === 0) {
    delete newEvents[dateKey];
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: 1, calendar_events: newEvents }, { onConflict: 'id' });

  if (error) {
    showConfirm('Ошибка: ' + error.message);
  } else {
    setCalendarEvents(newEvents);
  }
};

const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  return { daysInMonth, startingDayOfWeek };
};

  const ADMIN_PASSWORD = 'M@___m@_18_97_mam@_mello_18_97_06_mama';
  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';
  const HEADER_BG_IMAGE = isDarkTheme ? '/images/header-bg-v2.jpg' : '/images/darknesswoo.jpg';

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

useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    setIsDarkTheme(false);
  }
}, []);

const checkUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    setUser(session.user);
    
    // Сначала проверяем - это админ?
    if (session.user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      return;
    }
    
    // Для обычных пользователей - ищем профиль
    const { data: profile, error } = await supabase
      .from('reader_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    console.log('🔍 DEBUG checkUser:', { 
      profile, 
      error, 
      is_deleted: profile?.is_deleted,
      user_id: session.user.id 
    });
    
    // Проверяем: ошибка ИЛИ профиль не найден ИЛИ удалён
    if (error || !profile || profile.is_deleted === true) {
      console.log('❌ БЛОКИРУЕМ ВХОД:', { error, profile, is_deleted: profile?.is_deleted });
      
      // ПОЛНАЯ ОЧИСТКА СЕССИИ
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      sessionStorage.clear();
      
      // Очищаем состояние
      setUser(null);
      setUserProfile(null);
      setShowReaderPanel(false);
      setIsAdmin(false);
      
      alert('Этот аккаунт был удалён.');
      
      // ПРИНУДИТЕЛЬНАЯ ПЕРЕЗАГРУЗКА СТРАНИЦЫ
      window.location.reload();
      return;
    }
    
    // Проверяем бан
    if (profile.is_banned) {
    showConfirm('Ваш аккаунт заблокирован!');
      
      await supabase.auth.signOut({ scope: 'global' });
      localStorage.clear();
      sessionStorage.clear();
      
      setUser(null);
      setUserProfile(null);
      setShowReaderPanel(false);
      setIsAdmin(false);
      
      window.location.reload();
      return;
    }
    
    // Всё ОК - устанавливаем профиль
    setUserProfile(profile);
    setIsAdmin(false);
    
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
      .select('title_color, news_text, about_text, popular_works, dark_bg_url, dark_bg_position, light_bg_url, light_bg_position')
      .eq('id', 1)
      .maybeSingle();
    
    if (data && !error) {
      if (data.title_color && data.title_color.trim() !== '') {
        setTitleColor(data.title_color);
        localStorage.setItem('titleColor', data.title_color);
      }
      if (data.news_text) setNewsText(data.news_text);
      if (data.about_text) setAboutText(data.about_text);
      
      // ЗАГРУЖАЕМ ФОНЫ
      if (data.dark_bg_url) setDarkBgImage(data.dark_bg_url);
      if (data.dark_bg_position) setDarkBgPosition(data.dark_bg_position);
      if (data.light_bg_url) setLightBgImage(data.light_bg_url);
      if (data.light_bg_position) setLightBgPosition(data.light_bg_position);
      
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
    showConfirm('Заполните все поля!');
      return;
    }

    if (!agreedToPrivacy) {
    showConfirm('Необходимо согласиться с политикой конфиденциальности!');
      return;
    }

    const { data: existingNickname } = await supabase
      .from('reader_profiles')
      .select('nickname')
      .eq('nickname', authForm.nickname)
      .single();
    
    if (existingNickname) {
    showConfirm('Этот никнейм уже занят!');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password
    });

    if (error) {
    showConfirm('Ошибка регистрации: ' + error.message);
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
      showConfirm('Ошибка создания профиля: ' + profileError.message);
      } else {
      showConfirm('Регистрация успешна! Проверьте почту для подтверждения.');
        setShowAuthModal(false);
        setAuthForm({ nickname: '', email: '', password: '' });
        setAgreedToPrivacy(false);
      }
    }
  };

const handleLogin = async () => {
  if (!authForm.email || !authForm.password) {
  showConfirm('Введите email и пароль!');
    return;
  }

  // Вход через Supabase Auth (для всех, включая админа)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authForm.email,
    password: authForm.password
  });

  if (error) {
  showConfirm('Ошибка входа: ' + error.message);
    return;
  }

  if (data.user) {
    setUser(data.user);
    
    // Проверяем - это админ?
    if (data.user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setShowAuthModal(false);
      setAuthForm({ nickname: '', email: '', password: '' });
      return;
    }
    
    // Обычный пользователь
    const { data: profile } = await supabase
      .from('reader_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (profile) {
      if (profile.is_banned) {
      showConfirm('Ваш аккаунт заблокирован!');
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

const toggleTheme = () => {
  const newTheme = !isDarkTheme;
  setIsDarkTheme(newTheme);
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
};

const handleChangeEmail = async () => {
  if (!changeEmailForm.newEmail || !changeEmailForm.password) {
    showConfirm('Заполните все поля!');
    return;
  }

  // Проверяем пароль
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: changeEmailForm.password
  });

  if (signInError) {
    showConfirm('Неверный пароль!');
    return;
  }

  const { error } = await supabase.auth.updateUser({
    email: changeEmailForm.newEmail
  });

  if (error) {
    showConfirm('Ошибка: ' + error.message);
  } else {
    showConfirm('Проверьте новую почту для подтверждения!');
    setShowChangeEmailModal(false);
    setChangeEmailForm({ newEmail: '', password: '' });
  }
};

const handleChangePassword = async () => {
  if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword) {
    showConfirm('Заполните все поля!');
    return;
  }

  // Проверяем текущий пароль
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: changePasswordForm.currentPassword
  });

  if (signInError) {
    showConfirm('Неверный текущий пароль!');
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: changePasswordForm.newPassword
  });

  if (error) {
    showConfirm('Ошибка: ' + error.message);
  } else {
    showConfirm('Пароль успешно изменён!');
    setShowChangePasswordModal(false);
    setChangePasswordForm({ currentPassword: '', newPassword: '' });
  }
};

const handleDeleteAccount = async () => {
  if (!deletePassword.trim()) {
  showConfirm('Введите пароль для подтверждения!');
    return;
  }

  // Проверяем пароль
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userProfile.email,
    password: deletePassword
  });

  if (signInError) {
  showConfirm('Неверный пароль!');
    return;
  }
showConfirm('Вы уверены? Это действие необратимо!', async () => {
    try {
      // 1. Помечаем профиль как удалённый (НЕ удаляем!)
      const { error: updateError } = await supabase
        .from('reader_profiles')
        .update({ is_deleted: true })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // 2. Сохраняем причину удаления
      await supabase.from('deletion_reasons').insert({
        user_id: user.id,
        nickname: userProfile.nickname,
        reason: deleteReason.trim() || 'Причина не указана',
        deleted_at: new Date().toISOString()
      });

      // 3. Удаляем комментарии и сообщения (по желанию)
      await supabase.from('comments').delete().eq('user_id', user.id);
      await supabase.from('messages').delete().eq('from_user_id', user.id);

      // 4. Выходим из системы
      await supabase.auth.signOut();
      
      showConfirm('Ваш аккаунт успешно удалён.');
      setShowDeleteAccountModal(false);
      setDeleteReason('');
      setDeletePassword('');
      setUser(null);
      setUserProfile(null);
      setShowReaderPanel(false);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      showConfirm('Ошибка при удалении аккаунта: ' + err.message);
    }
  });
};

  const toggleUserBan = async (userId, currentBanStatus) => {
    const { error } = await supabase
      .from('reader_profiles')
      .update({ is_banned: !currentBanStatus })
      .eq('user_id', userId);

    if (error) {
     showConfirm('Ошибка: ' + error.message);
    } else {
      showConfirm(currentBanStatus ? 'Пользователь разблокирован!' : 'Пользователь заблокирован!');
      loadManagementData();
    }
  };

  const replyToMessage = async (messageId) => {
    if (!replyText.trim()) {
    showConfirm('Напишите ответ!');
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
    showConfirm('Ошибка: ' + error.message);
    } else {
    showConfirm('Ответ отправлен!');
      setReplyText('');
      setSelectedMessage(null);
      loadManagementData();
    }
  };

 const deleteMessage = async (messageId) => {
  showConfirm('Удалить сообщение?', async () => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      showConfirm('Ошибка: ' + error.message);
    } else {
      loadManagementData();
    }
  });
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
    showConfirm('✅ Текст сохранён!');
    } catch (err) {
    showConfirm('❌ Ошибка: ' + err.message);
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
    showConfirm('✅ Популярная работа сохранена!');
    } catch (err) {
    showConfirm('❌ Ошибка: ' + err.message);
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

// ❄️ ЭФФЕКТ СНЕГА
useEffect(() => {
  if (!showSnow) return; // если выключен - не запускаем
  
  const createSnowflake = () => {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
    snowflake.style.opacity = Math.random() * 0.7 + 0.3;
    snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
    
    document.querySelector('.snow-container')?.appendChild(snowflake);
    
    setTimeout(() => {
      snowflake.remove();
    }, 5000);
  };
  
  // Адаптивная частота для мобильных
  const isMobile = window.innerWidth < 768;
  const interval = setInterval(createSnowflake, isMobile ? 500 : 300);
  
  return () => clearInterval(interval);
}, [showSnow]); // ← ДОБАВИЛИ ЗАВИСИМОСТЬ

useEffect(() => {
  loadCalendarEvents();
}, []);

return (
    <>
      <link rel="preload" href="/images/main-bg.jpg" as="image" />
      <link rel="preload" href="/images/header-bg.jpg" as="image" />

<style dangerouslySetInnerHTML={{__html: `
  @font-face {
    font-family: 'Anticva';
    src: url('/fonts/ofont.ru_Anticva.ttf') format('truetype');
  }
  @font-face {
    font-family: 'RuinedC';
    src: url('/fonts/ofont.ru_RuinedC.ttf') format('truetype');
  }
`}} />

<style dangerouslySetInnerHTML={{__html: `
  /* Скроллбар для модальных окон - ТЕМНАЯ ТЕМА */
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
  /* Скроллбар для модальных окон - СВЕТЛАЯ ТЕМА */
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
  `}
`}} />
      
      {/* ❄️ СТИЛИ И КОНТЕЙНЕР ДЛЯ СНЕГА */}
      <style dangerouslySetInnerHTML={{__html: `
        .snow-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }
        
        .snowflake {
          position: absolute;
          top: -20px;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          animation: fall linear forwards;
          user-select: none;
        }
        
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}} />
      
      <div className="snow-container"></div>
      
      <div className="min-h-screen text-white overflow-x-hidden relative">
<div 
  className="fixed inset-0 -z-10"
  style={{
    backgroundColor: '#000000',
    backgroundImage: isDarkTheme && darkBgImage ? `url(${darkBgImage})` : !isDarkTheme && lightBgImage ? `url(${lightBgImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: isDarkTheme ? `${darkBgPosition.x}% ${darkBgPosition.y}%` : `${lightBgPosition.x}% ${lightBgPosition.y}%`,
    backgroundRepeat: 'no-repeat'
  }}
/>

{/* HEADER */}
<div className="relative overflow-hidden px-4 sm:px-8 pt-4 sm:pt-6">
  <div className="max-w-7xl mx-auto">
    {/* РАМКА С ГРАДИЕНТОМ */}
<div 
  className="relative overflow-hidden rounded-lg"
  style={{
    padding: '3px',
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #200a2e 0%, #000000 50%, #200a2e 100%)'
      : 'linear-gradient(135deg, #c2beae 0%, #000000 50%, #c2beae 100%)'
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
<div className="absolute inset-0 z-10 flex flex-col">
  <div className="px-3 sm:px-6 py-2 sm:py-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 sm:gap-4">
        <div
          className="rounded-full w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
          style={{
            background: '#42000a',
            border: '2px solid #42000a',
            boxShadow: '0 0 20px rgba(220, 0, 0, 0.9), 0 0 40px rgba(255, 0, 0, 0.6)',
            animation: 'pulse18 2s ease-in-out infinite'
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @keyframes pulse18 {
                0%, 100% {
                  box-shadow: 0 0 20px rgba(220, 0, 0, 0.9), 0 0 40px rgba(255, 0, 0, 0.6);
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 30px rgba(255, 0, 0, 1), 0 0 60px rgba(255, 0, 0, 0.8);
                  transform: scale(1.05);
                }
              }
            `
            }}
          />
          18+
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}
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
      background: isDarkTheme 
        ? 'rgba(147, 112, 219, 0.3)'
        : 'rgba(184, 171, 127, 0.3)',
      backdropFilter: 'blur(10px)',
      border: isDarkTheme 
        ? '1px solid rgba(147, 112, 219, 0.5)'
        : '1px solid rgba(184, 171, 127, 0.5)'
    }}
  >
    <User size={14} className="sm:w-5 sm:h-5" />
    <span className="hidden sm:inline">{t.login}</span>
  </button>
        ) : (
<button
  onClick={() => (isAdmin ? setShowAdminPanel(true) : setShowReaderPanel(true))}
  className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
  style={{
    background: isDarkTheme 
      ? 'rgba(147, 112, 219, 0.3)'
      : 'rgba(184, 171, 127, 0.3)',
    backdropFilter: 'blur(10px)',
    border: isDarkTheme 
      ? '1px solid rgba(147, 112, 219, 0.5)'
      : '1px solid rgba(184, 171, 127, 0.5)'
  }}
>
            <Menu size={14} className="sm:w-5 sm:h-5" />
            <span className="max-w-[80px] sm:max-w-none truncate text-xs sm:text-base">
              {isAdmin ? 'Админ' : userProfile?.nickname}
            </span>
          </button>
        )}
      </div>
    </div>
  </div>
 <div className="flex-1 flex items-center justify-center px-4 pb-8">
<h1
  className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-widest"
  style={{
    fontFamily: "'Playfair Display', Georgia, serif"
  }}
>
  <style
    dangerouslySetInnerHTML={{
      __html: `
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .mello-shimmer {
          ${isDarkTheme 
            ? `background: linear-gradient(90deg, #a72cc9 0%, #e6009b 33%, #9f68f3 66%, #a855f7 100%);
               background-size: 200% auto;
               -webkit-background-clip: text;
               -webkit-text-fill-color: transparent;
       background-clip: text;
       animation: shimmer 3s linear infinite;`
    : `background-image: linear-gradient(to bottom, #4e040f  0%, #000000 100%);
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
       background-clip: text;`
  }
}
        .story-text {
          ${isDarkTheme
            ? `color: #cdb0e3;
               text-shadow: 0 0 30px rgba(205, 176, 227, 1), 0 0 60px rgba(205, 176, 227, 0.6);`
            : `background: radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%);
               -webkit-background-clip: text;
               -webkit-text-fill-color: transparent;
               background-clip: text;`
          }
        }
      `
    }}
  />
  <span className="mello-shimmer">MELLO</span> <span className="story-text">STORY</span>
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
   { key: 'novel', label: t.novels },
    { key: 'longfic', label: t.longfic },
    { key: 'minific', label: t.minific },
  ].map((item) => {
    const isActive = activeCategory === item.key;
    
    if (!isDarkTheme) {
      return (
        <button
          key={item.key}
          onClick={() => {
            setActiveCategory(item.key);
            setCurrentSlide(0);
            setExpandedWork(null);
          }}
          className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2.5 rounded-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap relative"
style={{
  background: isActive ? 'rgba(194, 194, 168, 0.3)' : 'transparent', // ← Активная = матовая, неактивная = прозрачная
  border: '2px solid #c2c2a8', // ← Рамка всегда одинаковая
  borderRadius: '12px',
  color: '#c2c2a8' // ← Текст всегда #c2c2a8
}}
        >
          <div style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '12px',
            padding: '3px',
            background: 'linear-gradient(135deg, #62091e 0%, #000000 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
            zIndex: -1
          }} />
          {item.label}
        </button>
      );
    }
    
    return (
      <button
        key={item.key}
        onClick={() => {
          setActiveCategory(item.key);
          setCurrentSlide(0);
          setExpandedWork(null);
        }}
        className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2.5 border-2 rounded-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
        style={{
          borderColor: isActive ? '#a87ec4' : '#7430a1',
          backgroundColor: 'transparent',
          color: '#ffffff'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.borderColor = '#a87ec4';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(168, 126, 196, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.borderColor = '#7430a1';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {item.label}
      </button>
    );
  })}
</nav>
  </div>
</div>



 {/* MAIN CONTENT */}
<main className="pb-16 sm:pb-32 px-4 sm:px-8 min-h-screen" style={{ paddingTop: isDarkTheme ? '0' : '1rem' }}>
        <div className="max-w-7xl mx-auto relative z-10">
{loading ? (
  <div className="text-center py-12 sm:py-20">
    <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2" style={{ 
      borderColor: isDarkTheme ? '#8b3cc8' : '#c9c6bb' 
    }}></div>
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
    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : '#c9c6bb',
    boxShadow: isDarkTheme ? '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)' : 'none',
    color: '#000000'
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
    backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : '#c9c6bb',
    boxShadow: isDarkTheme ? '0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.4)' : 'none',
    color: '#000000'
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
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)'
      : '#c9c6bb',
    boxShadow: isDarkTheme 
      ? '0 0 20px rgba(188, 141, 216, 0.9), 0 0 35px rgba(147, 112, 219, 0.7)'
      : 'none'
  }}
  onMouseEnter={(e) => {
    if (isDarkTheme) {
      e.currentTarget.style.background = 'linear-gradient(135deg, #d5acec 0%, #bc8dd8 100%)';
      e.currentTarget.style.boxShadow = '0 0 25px rgba(213, 172, 236, 1), 0 0 45px rgba(188, 141, 216, 0.8)';
    }
  }}
  onMouseLeave={(e) => {
    if (isDarkTheme) {
      e.currentTarget.style.background = 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)';
      e.currentTarget.style.boxShadow = '0 0 20px rgba(188, 141, 216, 0.9), 0 0 35px rgba(147, 112, 219, 0.7)';
    }
  }}
>
  <X size={24} className="sm:w-8 sm:h-8" />
</button>
)}
                        
<div 
  className={`relative overflow-hidden transition-all duration-300 ${!isExpanded && 'cursor-pointer'}`}
  style={{ 
    padding: isDarkTheme ? '6px' : '3px',
    background: isDarkTheme 
      ? 'linear-gradient(135deg, #000000 0%, #8c32d2 50%, #000000 100%)'
      : 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
    maxWidth: isExpanded ? '1000px' : 'auto',
    width: '100%',
    borderRadius: '8px',
    position: 'relative'
  }}
  onClick={() => !isExpanded && setExpandedWork(work.id)}
>
{isExpanded ? (
<div 
  className="flex flex-col sm:grid sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr] gap-4 sm:gap-6 p-4 sm:p-6 max-h-[85vh] overflow-y-auto relative" 
  style={{
background: isDarkTheme
  ? '#000000'
  : 'rgba(0, 0, 0, 0.95)',

    boxShadow: !isDarkTheme ? 'inset 0 0 50px rgba(0, 0, 0, 0.6)' : 'none',
    borderRadius: isDarkTheme ? '14px' : '10px'
  }}
>
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
          color: isDarkTheme ? '#bc8dd8' : '#c9c6bb',
          textShadow: isDarkTheme ? '0 0 20px rgba(188, 141, 216, 0.8)' : 'none',
          fontStyle: !isDarkTheme ? 'italic' : 'normal',
          background: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #65635d 100%)' : 'none',
          WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
          WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
          backgroundClip: !isDarkTheme ? 'text' : 'unset'
        }}>{work.title}</h3>
        
        {(work.fandom || work.pairing) && (
          <div className="mb-3 space-y-1">
            {work.fandom && (
              <div className="text-xs sm:text-sm">
                <span className="text-gray-400">Фандом: </span>
                <span style={{ color: isDarkTheme ? '#e5e5e5' : '#ffffff' }}>{work.fandom}</span>
              </div>
            )}
            {work.pairing && (
              <div className="text-xs sm:text-sm">
                <span className="text-gray-400">Пейринг: </span>
                <span style={{ color: isDarkTheme ? '#e5e5e5' : '#ffffff' }}>{work.pairing}</span>
              </div>
            )}
          </div>
        )}
        
        {work.description && (
          <p className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed whitespace-pre-wrap break-words" style={{ 
            color: isDarkTheme ? '#9ca3af' : '#ffffff',
            wordBreak: 'break-word', 
            overflowWrap: 'break-word' 
          }}>{work.description}</p>
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
          background: isDarkTheme 
            ? 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)'
            : '#c9c6bb',
          boxShadow: isDarkTheme 
            ? '0 0 15px rgba(188, 141, 216, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)'
            : 'none',
          color: isDarkTheme ? '#ffffff' : '#000000'
        }}
        onMouseEnter={(e) => {
          if (isDarkTheme) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #d5acec 0%, #bc8dd8 100%)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(213, 172, 236, 0.9), 0 0 35px rgba(188, 141, 216, 0.7)';
          }
        }}
        onMouseLeave={(e) => {
          if (isDarkTheme) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(188, 141, 216, 0.8), 0 0 25px rgba(147, 112, 219, 0.6)';
          }
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
          backgroundColor: idx === currentSlide 
            ? (isDarkTheme ? '#ce0dbe' : '#c9c6bb')
            : '#ffffff',
          transform: idx === currentSlide ? 'scale(1.5)' : 'scale(1)'
        }}
      />
                  ))}
                </div>
              )} 
            </>
          )}
        </div>
</main>

{/* РАСПИСАНИЕ ОБНОВЛЕНИЙ */}
<div className="max-w-5xl mx-auto mt-8 sm:mt-12 px-4 relative z-0">
  <button
    onClick={() => {
      setShowCalendarModal(true);
      loadCalendarEvents();
    }}
    className="w-full py-4 sm:py-6 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] text-base sm:text-xl relative overflow-hidden flex items-center justify-center gap-3"
    style={{
      background: isDarkTheme 
        ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(194, 194, 168, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)',
      border: isDarkTheme ? '2px solid #9333ea' : '2px solid #afafa9ff',
      backdropFilter: 'blur(20px)',
      boxShadow: isDarkTheme 
        ? '0 0 30px rgba(147, 51, 234, 0.4)'
        : 'inset 0 0 50px rgba(0, 0, 0, 0.6)',
      color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
fontFamily: "'Playfair Display', Georgia, serif",
fontStyle: isDarkTheme ? 'normal' : 'italic'  // ← ДОБАВЬ ЭТУ СТРОКУ
    }}
  >
    <span>Расписание обновлений сайта и работ</span>
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className="flex-shrink-0"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>
</div>

{/* ПОПУЛЯРНЫЕ РАБОТЫ */}
<div className="max-w-5xl mx-auto mt-12 sm:mt-16 relative z-0" style={{ marginTop: isDarkTheme ? '3rem' : '2rem' }}>
<h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8" style={{
  color: isDarkTheme ? '#b3e7ef' : 'transparent',
  textShadow: isDarkTheme ? '0 0 20px rgba(179, 231, 239, 0.8), 0 0 40px rgba(179, 231, 239, 0.5)' : 'none',
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: !isDarkTheme ? 'italic' : 'normal',
  backgroundImage: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)' : 'none',
  backgroundSize: !isDarkTheme ? '200% auto' : 'auto',
  WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
  WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
  backgroundClip: !isDarkTheme ? 'text' : 'unset'
}}>
  Популярные работы
</h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
    {popularWorks.map((work, index) => (
<div
  key={work.id}
  className="relative rounded-xl p-6 transition hover:scale-105"
  style={{
    background: isDarkTheme
  ? 'rgba(0, 0, 0, 0.3)'
  : 'transparent',
    backdropFilter: 'blur(10px)',
    border: isDarkTheme ? '2px solid #9b73b0' : '3px solid transparent',
    borderRadius: '24px',
    backgroundClip: !isDarkTheme ? 'padding-box' : 'border-box',
    boxShadow: isDarkTheme ? '0 0 20px rgba(155, 115, 176, 0.6), 0 0 40px rgba(155, 115, 176, 0.3)' : 'none',
    position: 'relative'
  }}
>
  {!isDarkTheme && (
    <div style={{
      position: 'absolute',
      inset: '-3px',
      borderRadius: '24px',
      padding: '3px',
      background: 'linear-gradient(135deg, #c2c2a8 0%, #000000 100%)',
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
      zIndex: -1
    }} />
  )}
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
<h3 className="font-bold text-lg sm:text-xl mb-6 text-center pr-6 break-words" style={{
  color: isDarkTheme ? '#b3e7ef' : 'transparent',
  textShadow: isDarkTheme ? '0 0 15px rgba(179, 231, 239, 0.6)' : 'none',
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: !isDarkTheme ? 'italic' : 'normal',
  backgroundImage: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)' : 'none',
  backgroundSize: !isDarkTheme ? '200% auto' : 'auto',
  WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
  WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset',
  backgroundClip: !isDarkTheme ? 'text' : 'unset'
}}>
  {work.title}
</h3>
            
            <div className="flex justify-center items-center gap-6">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
<span className="text-white font-bold text-lg">
  {work.rating || '—'}
</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
<span className="text-white font-bold text-lg">
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
    {/* НОВЫЙ ТЕКСТ ДОБАВЛЯЕТСЯ ЗДЕСЬ */}
  <p className="text-center mt-6 text-xs sm:text-sm opacity-70" style={{
    color: isDarkTheme ? '#b3e7ef' : '#c8c0c2',
    fontFamily: "'Playfair Display', Georgia, serif"
  }}>
    Обновление рейтинга и статистики просмотров производится один раз в три дня на основе суммарных пользовательских оценок. Раздел «Популярные работы» обновляется еженедельно.
  </p>
</div>

{/* НОВОСТИ */}
<div className="max-w-3xl mx-auto mt-8 sm:mt-12 relative z-0">
<div className="p-6 sm:p-10 relative" style={{
  background: isDarkTheme 
    ? 'rgba(147, 51, 234, 0.15)' 
    : 'radial-gradient(ellipse at center, rgba(113, 20, 31, 0.8) 0%, rgba(74, 13, 21, 0.95) 100%)',
  borderRadius: '24px',
  border: isDarkTheme ? '2px solid transparent' : '2px solid #c2c2a8',
  backgroundImage: isDarkTheme ? 'linear-gradient(#000, #000), linear-gradient(135deg, #9370db 0%, #ef01cb 100%)' : 'none',
  backgroundOrigin: isDarkTheme ? 'border-box' : 'unset',
  backgroundClip: isDarkTheme ? 'padding-box, border-box' : 'unset',
  backdropFilter: 'blur(20px)',
  boxShadow: isDarkTheme 
    ? '0 0 30px rgba(147, 51, 234, 0.6)' 
    : 'inset 0 0 50px rgba(0, 0, 0, 0.6)'  // ← ДОБАВЬ ЭТО!
}}>
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
<div className="p-6 sm:p-10 relative" style={{
  background: isDarkTheme 
    ? 'rgba(147, 51, 234, 0.15)' 
    : 'radial-gradient(ellipse at center, rgba(113, 20, 31, 0.8) 0%, rgba(74, 13, 21, 0.95) 100%)',
  borderRadius: '24px',
  border: isDarkTheme ? '2px solid transparent' : '2px solid #c2c2a8',
  backgroundImage: isDarkTheme ? 'linear-gradient(#000, #000), linear-gradient(135deg, #9370db 0%, #ef01cb 100%)' : 'none',
  backgroundOrigin: isDarkTheme ? 'border-box' : 'unset',
  backgroundClip: isDarkTheme ? 'padding-box, border-box' : 'unset',
  backdropFilter: 'blur(20px)',
  boxShadow: isDarkTheme 
    ? '0 0 30px rgba(147, 51, 234, 0.6)' 
    : 'inset 0 0 50px rgba(0, 0, 0, 0.6)'  // ← ДОБАВЬ ЭТО!
}}>

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


{/* AUTH MODAL */}
{showAuthModal && isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-8 border-2" style={{
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

        {authMode === 'login' && (
          <button
            onClick={async () => {
              if (!authForm.email) {
                showConfirm('Введите email для восстановления пароля');
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(authForm.email);
              if (error) {
                showConfirm('Ошибка: ' + error.message);
              } else {
                showConfirm('Проверьте почту! Мы отправили ссылку для восстановления пароля.');
              }
            }}
            className="w-full text-gray-400 hover:text-white text-xs"
          >
            Забыли пароль?
          </button>
        )}

        <button
          onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setAgreedToPrivacy(false);
          }}
          className="w-full text-gray-400 hover:text-white text-xs sm:text-sm"
        >
          {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
        </button>

        {authMode === 'register' && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Заполнив все графы данными не нажимайте несколько раз по кнопке "Регистрация" - только один раз, иначе у вас несколько раз проходит регистрация. Чтобы подтвердить аккаунт проверьте почту от имени Supabase.
          </p>
        )}
      </div>
    </div>
  </div>
)}

{/* AUTH MODAL - СВЕТЛАЯ ТЕМА */}
{showAuthModal && !isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-8 border-2" style={{
      background: 'rgba(0, 0, 0, 0.95)',
      borderColor: '#c9c6bb',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="flex justify-center items-center mb-4 sm:mb-6 relative">
        <h2 className="text-xl sm:text-2xl font-bold" style={{
          color: '#c9c6bb'
        }}>
          {authMode === 'login' ? t.login : t.register}
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
                borderColor: '#c9c6bb'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#c9c6bb'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#c9c6bb'}
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
              borderColor: '#c9c6bb'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#c9c6bb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#c9c6bb'}
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
              borderColor: '#c9c6bb'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#c9c6bb'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#c9c6bb'}
          />
        </div>

        {authMode === 'register' && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg border" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: '#c9c6bb'
            }}>
              <input
                type="checkbox"
                id="privacy-checkbox-light"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
                style={{ accentColor: '#c9c6bb' }}
              />
              <label htmlFor="privacy-checkbox-light" className="text-xs sm:text-sm text-gray-300 cursor-pointer">
                Я согласен с{' '}
                <Link href="/privacy" className="hover:text-white underline" style={{ color: '#c9c6bb' }} target="_blank">
                  Политикой конфиденциальности
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg border" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: '#c9c6bb'
            }}>
              <input
                type="checkbox"
                id="terms-checkbox-light"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
                style={{ accentColor: '#c9c6bb' }}
              />
              <label htmlFor="terms-checkbox-light" className="text-xs sm:text-sm text-gray-300 cursor-pointer">
                Я согласен с{' '}
                <Link href="/terms" className="hover:text-white underline" style={{ color: '#c9c6bb' }} target="_blank">
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
            background: '#c9c6bb',
            color: '#000000'
          }}
        >
          {authMode === 'login' ? t.login : t.register}
        </button>

        {authMode === 'login' && (
          <button
            onClick={async () => {
              if (!authForm.email) {
                showConfirm('Введите email для восстановления пароля');
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(authForm.email);
              if (error) {
                showConfirm('Ошибка: ' + error.message);
              } else {
                showConfirm('Проверьте почту! Мы отправили ссылку для восстановления пароля.');
              }
            }}
            className="w-full text-gray-400 hover:text-white text-xs"
          >
            Забыли пароль?
          </button>
        )}

        <button
          onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setAgreedToPrivacy(false);
          }}
          className="w-full text-gray-400 hover:text-white text-xs sm:text-sm"
        >
          {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
        </button>

        {authMode === 'register' && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Заполнив все графы данными не нажимайте несколько раз по кнопке "Регистрация" - только один раз, иначе у вас несколько раз проходит регистрация. Чтобы подтвердить аккаунт проверьте почту от имени Supabase.
          </p>
        )}
      </div>
    </div>
  </div>
)}

{/* DELETE ACCOUNT MODAL */}
{showDeleteAccountModal && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Удаление аккаунта</h2>
        <button onClick={() => {
          setShowDeleteAccountModal(false);
          setDeleteReason('');
          setDeletePassword('');
        }} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      <div className="rounded-lg p-4 mb-6" style={{ 
        background: 'rgba(147, 112, 219, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <p className="text-sm text-white">
          Это действие необратимо! Все ваши данные будут удалены навсегда.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Причина удаления <span className="text-gray-500">(необязательно)</span>
          </label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            placeholder="Расскажите, почему вы решили удалить аккаунт..."
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none text-white resize-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
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
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none text-white"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
          />
        </div>

        <button
          onClick={handleDeleteAccount}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
            boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 25px rgba(147, 112, 219, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 15px rgba(147, 112, 219, 0.6)';
          }}
        >
          Удалить
        </button>

        <button
          onClick={() => {
            setShowDeleteAccountModal(false);
            setDeleteReason('');
            setDeletePassword('');
          }}
          className="w-full py-3 rounded-lg font-bold transition border-2"
          style={{
            background: 'transparent',
            borderColor: '#9333ea',
            color: '#9370db'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#b48dc4';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#9333ea';
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

{/* DELETE ACCOUNT MODAL - СВЕТЛАЯ ТЕМА */}
{showDeleteAccountModal && !isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-2xl w-full max-w-md p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Удаление аккаунта</h2>
        <button onClick={() => {
          setShowDeleteAccountModal(false);
          setDeleteReason('');
          setDeletePassword('');
        }} className="absolute right-0" style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="rounded-lg p-4 mb-6" style={{ 
        background: 'rgba(180, 154, 95, 0.15)',
        border: '1px solid rgba(180, 154, 95, 0.3)'
      }}>
        <p className="text-sm" style={{ color: '#c9c6bb' }}>
          Это действие необратимо! Все ваши данные будут удалены навсегда.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>
            Причина удаления <span style={{ color: '#c9c6bb', opacity: 0.7 }}>(необязательно)</span>
          </label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            placeholder="Расскажите, почему вы решили удалить аккаунт..."
            className="w-full rounded px-3 py-2 text-sm focus:outline-none resize-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(180, 154, 95, 0.4)',
              color: '#c9c6bb'
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>
            Введите пароль для подтверждения <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Ваш пароль"
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(180, 154, 95, 0.4)',
              color: '#c9c6bb'
            }}
          />
        </div>

        <button
          onClick={handleDeleteAccount}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: '#c9c6bb',
            color: '#000000'
          }}
        >
          Удалить
        </button>

        <button
          onClick={() => {
            setShowDeleteAccountModal(false);
            setDeleteReason('');
            setDeletePassword('');
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'transparent',
            border: '2px solid #c9c6bb',
            color: '#c9c6bb'
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

{/* UPDATES MODAL */}
{showUpdatesModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Обновления</h2>
        <button onClick={() => setShowUpdatesModal(false)} className="text-gray-400 hover:text-white absolute right-0">
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
    borderColor: update.type === 'new_work' ? '#ef01cb' : '#9370db',
    boxShadow: update.type === 'new_work' ? '0 0 15px rgba(239, 1, 203, 0.4)' : 'none'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#ef01cb';
    e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 1, 203, 0.6)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = update.type === 'new_work' ? '#ef01cb' : '#9370db';
    e.currentTarget.style.boxShadow = update.type === 'new_work' ? '0 0 15px rgba(239, 1, 203, 0.4)' : 'none';
  }}
                onClick={async () => {

                  loadSiteUpdates();
                  window.location.href = `/work/${update.work_id}`;
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ 
  color: '#ef01cb',
  filter: 'drop-shadow(0 0 5px rgba(239, 1, 203, 0.6))'
}}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    {update.type === 'new_work' ? (
                      <>
           <span className="inline-block text-xs font-bold px-2 py-1 rounded mb-2" style={{
  background: 'linear-gradient(135deg, #ef01cb 0%, #bc0897 100%)',
  boxShadow: '0 0 15px rgba(239, 1, 203, 0.8)',
  color: '#ffffff'
}}>
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

{/* UPDATES MODAL - СВЕТЛАЯ ТЕМА */}
{showUpdatesModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Обновления</h2>
        <button onClick={() => setShowUpdatesModal(false)} className="absolute right-0" style={{ color: '#c2ab75' }}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {siteUpdates.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(180, 154, 95, 0.3)'
          }}>
            <p style={{ color: '#c9c6bb' }}>Пока нет обновлений</p>
          </div>
        ) : (
          <div className="space-y-3">
            {siteUpdates.map((update) => (
              <div 
                key={update.id}
                className="rounded-lg p-4 transition cursor-pointer"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: update.type === 'new_work' ? '2px solid #c9c6bb' : '1px solid rgba(180, 154, 95, 0.3)'
                }}
                onClick={async () => {
                  loadSiteUpdates();
                  window.location.href = `/work/${update.work_id}`;
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#c9c6bb" style={{ 
                      filter: 'drop-shadow(0 0 5px rgba(194, 171, 117, 0.4))'
                    }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    {update.type === 'new_work' ? (
                      <>
                        <span className="inline-block text-xs font-bold px-2 py-1 rounded mb-2" style={{
                          background: '#c9c6bb',
                          color: '#000000'
                        }}>
                          НОВАЯ РАБОТА
                        </span>
                        <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: '#c9c6bb' }}>
                          {update.work_title}
                        </h3>
                        <p className="text-sm" style={{ color: '#c9c6bb', opacity: 0.8 }}>
                          Опубликовано {new Date(update.published_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: '#c9c6bb' }}>
                          {update.work_title}
                        </h3>
                        <p className="text-sm mb-1" style={{ color: '#c9c6bb' }}>
                          {update.chapter_number} глава {update.chapter_title && `- ${update.chapter_title}`}
                        </p>
                        <p className="text-xs" style={{ color: '#c9c6bb', opacity: 0.7 }}>
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

{/* READER PANEL */}
{showReaderPanel && userProfile && (
  <>
    {/* ТЕМНАЯ ПАНЕЛЬ */}
    {isDarkTheme && (
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 border-l-2 z-40 overflow-y-auto shadow-2xl" style={{ 
        borderColor: '#b3e7ef',
        backgroundImage: 'url(/textures/dark-erys.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="sticky top-0 p-4 sm:p-5 flex justify-center items-center relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
          borderBottom: '3px solid rgba(147, 112, 219, 0.6)'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shineHeader {
              0% { left: -100%; }
              100% { left: 200%; }
            }
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
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shineHeader 3s infinite'
          }}></div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes neonPulse {
              0%, 100% { 
                text-shadow: 0 0 10px #e8d3e9, 0 0 20px #e8d3e9, 0 0 30px #e8d3e9;
              }
              50% { 
                text-shadow: 0 0 20px #e8d3e9, 0 0 40px #e8d3e9, 0 0 60px #e8d3e9;
              }
            }
          `}} />
          <h2 className="text-lg sm:text-xl font-bold" style={{ 
            color: '#fff',
            textShadow: '0 0 30px rgba(179, 231, 239, 1)',
            position: 'relative',
            zIndex: 1
          }}>{userProfile.nickname}</h2>
          <button onClick={() => setShowReaderPanel(false)} className="text-gray-400 hover:text-white absolute right-3 sm:right-4" style={{ zIndex: 2 }}>
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
<button
  onClick={() => {
    setShowUpdatesModal(true);
    loadSiteUpdates();
  }}
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base overflow-hidden"
  style={{
    background: 'rgba(160, 99, 207, 0.4)',
    border: '2px solid',
    borderColor: siteUpdates.length > 0 ? '#ef01cb' : '#a063cf',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    boxShadow: siteUpdates.length > 0 ? '0 0 25px rgba(239, 1, 203, 0.8)' : 'none'
  }}
  onMouseEnter={(e) => {
    if (siteUpdates.length === 0) {
      e.currentTarget.style.borderColor = '#fff';
      e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    }
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = siteUpdates.length > 0 ? '#ef01cb' : '#a063cf';
    e.currentTarget.style.boxShadow = siteUpdates.length > 0 ? '0 0 25px rgba(239, 1, 203, 0.8)' : 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" className="sm:w-5 sm:h-5">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
  <span style={{ 
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}>Обновления</span>
</button>

<Link
  href="/collection"
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base overflow-hidden block"
  style={{
    background: 'rgba(160, 99, 207, 0.4)',
    border: '2px solid #a063cf',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#fff';
    e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#a063cf';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  <Heart size={18} className="sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
  <span style={{ 
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}>Моя коллекция</span>
</Link>

<Link
  href="/my-messages"
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 relative text-sm sm:text-base overflow-hidden block"
  style={{
    background: 'rgba(160, 99, 207, 0.4)',
    border: '2px solid #a063cf',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#fff';
    e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#a063cf';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  <MessageSquare size={18} className="sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
  <span style={{ 
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}>Мои сообщения</span>
</Link>

 <button
  onClick={() => setShowManagementModal(true)}
  className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base overflow-hidden"
  style={{
    background: 'rgba(160, 99, 207, 0.4)',
    border: '2px solid #a063cf',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#fff';
    e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#a063cf';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  <Settings size={18} className="sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
  <span style={{ 
    color: '#ffffff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
  }}>Настройки</span>
</button>

<div className="mt-4">
  <button
    onClick={handleLogout}
    className="w-full py-2 sm:py-3 font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base overflow-hidden"
    style={{
      background: 'rgba(160, 99, 207, 0.4)',
      border: '2px solid #a063cf',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#fff';
      e.currentTarget.style.boxShadow = '0 0 25px rgba(179, 231, 239, 0.8)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#a063cf';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <LogOut size={18} className="sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
    <span style={{ 
      color: '#ffffff',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
    }}>Выход</span>
  </button>
</div>
        </div>
      </div>
    )}

    {/* СВЕТЛАЯ ПАНЕЛЬ */}
    {!isDarkTheme && (
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 z-40 overflow-y-auto shadow-2xl" style={{ 
        borderLeft: '12px solid',
        borderImage: 'linear-gradient(to bottom, #000000 0%, #000000 20%, #000000 40%, #000000 60%, #000000 80%, #000000 100%) 1',
        boxShadow: 'inset 8px 0 15px hsla(0, 0%, 0%, 0.50), -3px 0 10px rgba(0, 0, 0, 0.3)',
        backgroundImage: 'url(/textures/darkness.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="sticky top-0 p-6 backdrop-blur-xl relative overflow-hidden" style={{
background: 'linear-gradient(135deg, rgba(188, 187, 174, 0.25) 0%, rgba(188, 187, 174, 0.15) 100%)',
borderBottom: '1px solid rgba(188, 187, 174, 0.35)',
boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'

        }}>

<h2 className="text-lg sm:text-xl font-bold text-center mb-4" style={{ 
  color: '#c9c6bb',
  fontFamily: "'RuinedC', Georgia, serif"
}}>{userProfile.nickname}</h2>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes champagneBubbles {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
              50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
            }
            @keyframes shimmerGold {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .champagne-text {
              background: linear-gradient(90deg, #c9c6bb 0%, #c9c6bb 50%, #bcbbae 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmerGold 3s linear infinite;
              font-family: 'Playfair Display', Georgia, serif;
            }
          `}} />
          
<button 
  onClick={() => setShowReaderPanel(false)}
  className="absolute right-4 top-4 p-2 rounded-full transition-all z-20"
            style={{
              background: 'rgba(188, 187, 174, 0.35)',
              backdropFilter: 'blur(1px)',
              border: '1px solid rgba(188, 187, 174, 0.15)'
            }}
          >
            <X size={20} color="#c9c6bb" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex flex-col h-[calc(100vh-120px)]">
<button
  onClick={() => {
    setShowUpdatesModal(true);
    loadSiteUpdates();
  }}
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
  style={{
    background: siteUpdates.length > 0 ? '#35030e' : 'linear-gradient(135deg, rgba(188, 187, 174, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(188, 187, 174, 0.35)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(188, 187, 174, 0.15)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
  }} />
  
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={siteUpdates.length > 0 ? "#e9e6d8" : "#62091e"} strokeWidth="2" className="relative z-10">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
  <span className="relative z-10" style={{ 
    color: siteUpdates.length > 0 ? '#e9e6d8' : '#62091e',
    fontStyle: 'italic'
  }}>
    Обновления
  </span>
</button>

<Link
  href="/collection"
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group block"
  style={{
    background: 'linear-gradient(135deg, rgba(188, 187, 174, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(188, 187, 174, 0.35)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(188, 187, 174, 0.15)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
  }} />
  
  <Heart size={20} color="#62091e" className="relative z-10" />
  <span className="relative z-10" style={{ 
    background: 'linear-gradient(90deg, #62091e 0%, #e9e6d8 50%, #62091e 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmerGoldBtn 3s linear infinite',
    fontStyle: 'normal',
    fontWeight: '600'
  }}>
    Моя коллекция
  </span>
</Link>

<Link
  href="/my-messages"
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group block"
  style={{
    background: 'linear-gradient(135deg, rgba(188, 187, 174, 0.35), rgba(188, 187, 174, 0.15))',
    border: '1px solid rgba(188, 187, 174, 0.35)',
    backdropFilter: 'blur(1px)',
    boxShadow: '0 4px 15px rgba(188, 187, 174, 0.15)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
  }} />
  
  <MessageSquare size={20} color="#62091e" className="relative z-10" />
  <span className="relative z-10" style={{ 
    background: 'linear-gradient(90deg, #62091e 0%, #e9e6d8 50%, #62091e 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmerGoldBtn 3s linear infinite',
    fontStyle: 'normal',
    fontWeight: '600'
  }}>
    Мои сообщения
  </span>
</Link>

 <button
  onClick={() => setShowManagementModal(true)}
  className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
  style={{
              background: 'linear-gradient(135deg, rgba(188, 187, 174, 0.35), rgba(188, 187, 174, 0.15))',
              border: '1px solid rgba(188, 187, 174, 0.35)',
              backdropFilter: 'blur(1px)',
              boxShadow: '0 4px 15px rgba(188, 187, 174, 0.15)'
  }}
>
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
    background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
  }} />
  
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes shimmerGoldBtn {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `}} />
  
  <Settings size={20} color="#62091e" className="relative z-10" />
  <span className="relative z-10" style={{ 
    background: 'linear-gradient(90deg, #62091e 0%, #e9e6d8 50%, #62091e 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'shimmerGoldBtn 3s linear infinite',
    fontStyle: 'normal',
    fontWeight: '600'
  }}>
    Настройки
  </span>
</button>

<div className="mt-4">
  <button
    onClick={handleLogout}
    className="w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
    style={{
              background: 'linear-gradient(135deg, rgba(188, 187, 174, 0.35), rgba(188, 187, 174, 0.15))',
              border: '1px solid rgba(188, 187, 174, 0.35)',
              backdropFilter: 'blur(1px)',
              boxShadow: '0 4px 15px rgba(188, 187, 174, 0.15)'
    }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
      background: 'radial-gradient(circle at center, rgba(201, 181, 135, 0.3), transparent)'
    }} />
    
    <LogOut size={20} color="#62091e" className="relative z-10" />
    <span className="relative z-10" style={{ 
      background: 'linear-gradient(90deg, #62091e 0%, #e9e6d8 50%, #62091e 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'shimmerGoldBtn 3s linear infinite',
      fontStyle: 'normal',
      fontWeight: '600'
    }}>
      Выход
    </span>
  </button>
</div>
        </div>
      </div>
    )}
  </>
)}

{/* МОДАЛЬНОЕ ОКНО НАСТРОЕК (ДЛЯ ЧИТАТЕЛЕЙ) */}
{showManagementModal && !isAdmin && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Настройки</h2>
        <button onClick={() => setShowManagementModal(false)} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-3">
        {/* КНОПКА СМЕНЫ EMAIL */}
        <button
          onClick={() => {
            setShowChangeEmailModal(true);
            setShowManagementModal(false);
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'rgba(147, 112, 219, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(147, 112, 219, 0.5)',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(180, 141, 196, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(180, 141, 196, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(147, 112, 219, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(147, 112, 219, 0.5)';
          }}
        >
          Сменить email
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
  Для подтверждения аккаунта проверьте письмо от Supabase на электронной почте.
</p>

        {/* КНОПКА СМЕНЫ ПАРОЛЯ */}
        <button
          onClick={() => {
            setShowChangePasswordModal(true);
            setShowManagementModal(false);
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'rgba(147, 112, 219, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(147, 112, 219, 0.5)',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(180, 141, 196, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(180, 141, 196, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(147, 112, 219, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(147, 112, 219, 0.5)';
          }}
        >
          Сменить пароль
        </button>

        <p className="text-xs text-gray-400 text-center mt-2">
  Изменение пароля через личный кабинет производится без дополнительного подтверждения по электронной почте.
</p>
        {/* КНОПКА УДАЛЕНИЯ */}
        <button
          onClick={() => {
            setShowDeleteAccountModal(true);
            setShowManagementModal(false);
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'rgba(147, 112, 219, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(147, 112, 219, 0.5)',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(180, 141, 196, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(180, 141, 196, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(147, 112, 219, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(147, 112, 219, 0.5)';
          }}
        >
          Удалить профиль
        </button>

        {/* ТЕМА */}
        <div className="pt-4">
          <p className="text-white mb-2 text-sm shimmer-btn-text">Интерфейс сайта:</p>
          <button
            onClick={toggleTheme}
            className="w-full relative rounded-full p-1 transition-all duration-300"
            style={{
              background: isDarkTheme 
                ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
                : 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              boxShadow: '0 0 20px rgba(147, 112, 219, 0.6)',
              height: '40px'
            }}
          >
            <div 
              className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                boxShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
                transform: isDarkTheme ? 'translateX(0)' : 'translateX(240px)',
              }}
            >
              <span style={{ fontSize: '16px', filter: 'grayscale(100%)' }}>
                {isDarkTheme ? '🌙' : '☀️'}
              </span>
            </div>
          </button>
        </div>

        {/* СНЕГ */}
        <div className="pt-2">
          <p className="text-white mb-2 text-sm shimmer-btn-text">Эффект снега:</p>
          <button
            onClick={() => setShowSnow(!showSnow)}
            className="w-full relative rounded-full p-1 transition-all duration-300"
            style={{
              background: showSnow 
                ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
                : 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              boxShadow: showSnow ? '0 0 20px rgba(147, 112, 219, 0.6)' : '0 0 10px rgba(255, 255, 255, 0.1)',
              height: '40px'
            }}
          >
            <div 
              className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                background: showSnow ? 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)' : 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)',
                boxShadow: showSnow ? '0 2px 8px rgba(255, 255, 255, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.5)',
                transform: showSnow ? 'translateX(240px)' : 'translateX(0)',
              }}
            >
              <span style={{ fontSize: '16px', filter: 'grayscale(100%)' }}>
                {showSnow ? '❄️' : '☀️'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО НАСТРОЕК - СВЕТЛАЯ ТЕМА */}
{showManagementModal && !isAdmin && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)'
  }}>
    <div className="rounded-2xl w-full max-w-md p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Настройки</h2>
        <button onClick={() => setShowManagementModal(false)} className="absolute right-0" style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            setShowChangeEmailModal(true);
            setShowManagementModal(false);
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'rgba(201, 198, 187, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(201, 198, 187, 0.4)',
            color: '#c9c6bb'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(201, 198, 187, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(201, 198, 187, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(201, 198, 187, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(201, 198, 187, 0.4)';
          }}
        >
          Сменить email
        </button>
<p className="text-xs text-center mt-2" style={{ color: '#c9c6bb' }}>
  Для подтверждения аккаунта проверьте письмо от Supabase на электронной почте.
</p>

        <button
          onClick={() => {
            setShowChangePasswordModal(true);
            setShowManagementModal(false);
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'rgba(201, 198, 187, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(201, 198, 187, 0.4)',
            color: '#c9c6bb'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(201, 198, 187, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(201, 198, 187, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(201, 198, 187, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(201, 198, 187, 0.4)';
          }}
        >
          Сменить пароль
        </button>
<p className="text-xs text-center mt-2" style={{ color: '#c9c6bb' }}>
  Изменение пароля через личный кабинет производится без дополнительного подтверждения по электронной почте.
</p>
        <button
          onClick={() => {
            setShowDeleteAccountModal(true);
            setShowManagementModal(false);
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'rgba(201, 198, 187, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(201, 198, 187, 0.4)',
            color: '#c9c6bb'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(201, 198, 187, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(201, 198, 187, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(201, 198, 187, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(201, 198, 187, 0.4)';
          }}
        >
          Удалить профиль
        </button>

        <div className="pt-4">
          <p className="mb-2 text-sm" style={{ color: '#65635d' }}>Интерфейс сайта:</p>
          <button
            onClick={toggleTheme}
            className="w-full relative rounded-full p-1 transition-all duration-300"
            style={{
              background: isDarkTheme 
                ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' 
                : 'linear-gradient(135deg, #c9c6bb 0%, #65635d 100%)',
              boxShadow: isDarkTheme 
                ? '0 0 20px rgba(147, 112, 219, 0.6)' 
                : '0 0 15px rgba(216, 197, 162, 0.4)',
              height: '40px'
            }}
          >
            <div 
              className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #ffffff 0%, #939085 100%)',
                boxShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
                transform: isDarkTheme ? 'translateX(0)' : 'translateX(240px)',
              }}
            >
              <span style={{ fontSize: '16px', filter: 'grayscale(100%)' }}>
                {isDarkTheme ? '🌙' : '☀️'}
              </span>
            </div>
          </button>
        </div>

        <div className="pt-2">
          <p className="mb-2 text-sm" style={{ color: '#65635d' }}>Эффект снега:</p>
          <button
            onClick={() => setShowSnow(!showSnow)}
            className="w-full relative rounded-full p-1 transition-all duration-300"
            style={{
              background: isDarkTheme 
                ? 'linear-gradient(135deg, #939085 0%, #c9c6bb 100%)' 
                : 'linear-gradient(135deg, #65635d 0%, #c9c6bb 100%)',
              boxShadow: isDarkTheme 
                ? '0 0 20px rgba(147, 112, 219, 0.6)' 
                : '0 0 15px rgba(216, 197, 162, 0.4)',
              height: '40px'
            }}
          >
            <div 
              className="absolute top-1 left-1 rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                background: showSnow ? 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)' : 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)',
                boxShadow: showSnow ? '0 2px 8px rgba(255, 255, 255, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.5)',
                transform: showSnow ? 'translateX(240px)' : 'translateX(0)',
              }}
            >
              <span style={{ fontSize: '16px', filter: 'grayscale(100%)' }}>
                {showSnow ? '❄️' : '☀️'}
              </span>
            </div>
          </button>
        </div>
      </div>
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
  onClick={() => setShowPageBgEditor(true)}
  className="w-full bg-purple-600 hover:bg-purple-700 py-2 sm:py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base"
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
  Фон страницы
</button>
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

{/* ADMIN MANAGEMENT MODAL */}
{showManagementModal && isAdmin && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-2 sm:p-8">
    <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col border-2 border-red-600">
      <div className="flex justify-between items-center p-3 sm:p-6 border-b border-gray-700">
        <h2 className="text-lg sm:text-2xl font-bold text-red-600">Управление сайтом</h2>
        <button onClick={() => setShowManagementModal(false)} className="text-gray-400 hover:text-white">
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setManagementTab('comments')}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition text-xs sm:text-base ${
            managementTab === 'comments' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Комментарии
        </button>
        <button
          onClick={() => setManagementTab('messages')}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition text-xs sm:text-base ${
            managementTab === 'messages' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Сообщения
        </button>
        <button
          onClick={() => setManagementTab('users')}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition text-xs sm:text-base ${
            managementTab === 'users' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Пользователи
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        {managementTab === 'comments' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-semibold text-gray-300 mb-3 sm:mb-4">
              Последние комментарии ({comments.length})
            </h3>
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Комментариев пока нет</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{comment.nickname}</p>
                      <p className="text-gray-400 text-xs">
                        {comment.works?.title} - Глава {comment.chapters?.chapter_number}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(comment.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <button
onClick={async () => {
  showConfirm('Удалить комментарий?', async () => {
    const { error } = await supabase.from('comments').delete().eq('id', comment.id);
    if (error) {
      showConfirm('Ошибка: ' + error.message);
    } else {
      loadManagementData();
    }
  });
}}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mt-2 whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {managementTab === 'messages' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-semibold text-gray-300 mb-3 sm:mb-4">
              Сообщения от читателей ({messages.length})
            </h3>
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Сообщений пока нет</p>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`bg-gray-800 rounded-lg p-3 sm:p-4 border-2 ${
                    msg.is_read ? 'border-gray-700' : 'border-yellow-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {msg.from_nickname} ({msg.from_email})
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(msg.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={16} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded p-2 sm:p-3 mb-2">
                    <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  </div>
                  {msg.admin_reply ? (
                    <div className="bg-red-900 bg-opacity-20 rounded p-2 sm:p-3 border border-red-600">
                      <p className="text-xs text-red-400 mb-1">Ваш ответ:</p>
                      <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap break-words">
                        {msg.admin_reply}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      {selectedMessage?.id === msg.id ? (
                        <div>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            placeholder="Напишите ответ..."
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 mb-2 text-xs sm:text-sm focus:outline-none focus:border-red-600 text-white"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => replyToMessage(msg.id)}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs sm:text-sm"
                            >
                              Отправить
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMessage(null);
                                setReplyText('');
                              }}
                              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs sm:text-sm"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="text-red-500 hover:text-red-400 text-xs sm:text-sm flex items-center gap-1"
                        >
                          <Reply size={14} className="sm:w-4 sm:h-4" />
                          Ответить
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {managementTab === 'users' && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-xl font-semibold text-gray-300 mb-3 sm:mb-4">
              Пользователи ({allUsers.length})
            </h3>
            {allUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Пользователей пока нет</p>
            ) : (
              allUsers.map((u) => (
                <div 
                  key={u.id} 
                  className={`bg-gray-800 rounded-lg p-3 sm:p-4 border-2 ${
                    u.is_banned ? 'border-red-600' : 'border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{u.nickname}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                      <p className="text-gray-500 text-xs">
                        Регистрация: {new Date(u.created_at).toLocaleDateString('ru-RU')}
                      </p>
                      {u.is_banned && (
                        <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded mt-1">
                          ЗАБЛОКИРОВАН
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleUserBan(u.user_id, u.is_banned)}
                      className={`px-3 py-1 rounded text-xs sm:text-sm font-bold ${
                        u.is_banned 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {u.is_banned ? 'Разблокировать' : 'Заблокировать'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* EDIT TEXT MODAL */}
{showEditModal && isAdmin && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="bg-gray-900 rounded-lg w-full max-w-2xl p-4 sm:p-6 border-2 border-red-600">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600">
          {editingSection === 'news' ? 'Редактировать новости' : 'Редактировать информацию'}
        </h2>
        <button onClick={() => {
          setShowEditModal(false);
          setEditingSection(null);
          setEditText('');
        }} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        rows={10}
        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 mb-4 text-sm sm:text-base focus:outline-none focus:border-red-600 text-white resize-none"
        placeholder="Введите текст..."
      />

      <button
        onClick={saveText}
        className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold transition"
      >
        Сохранить
      </button>
    </div>
  </div>
)}

{/* POPULAR WORK EDIT MODAL */}
{showPopularEditModal && isAdmin && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 border-2 border-red-600">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-red-600">
          Редактировать работу #{editingPopularIndex + 1}
        </h2>
        <button 
          onClick={() => {
            setShowPopularEditModal(false);
            setEditingPopularIndex(null);
            setEditPopularForm({ title: '', rating: '', views: '' });
          }} 
          className="text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Название работы</label>
          <input
            type="text"
            value={editPopularForm.title}
            onChange={(e) => setEditPopularForm({...editPopularForm, title: e.target.value})}
            placeholder="Введите название"
            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Оценка</label>
          <input
            type="text"
            value={editPopularForm.rating}
            onChange={(e) => setEditPopularForm({...editPopularForm, rating: e.target.value})}
            placeholder="Например: 9.5"
            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Прочтения</label>
          <input
            type="text"
            value={editPopularForm.views}
            onChange={(e) => setEditPopularForm({...editPopularForm, views: e.target.value})}
            placeholder="Например: 15.2K"
            className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-red-600"
          />
        </div>

        <button
          onClick={() => savePopularWork(editingPopularIndex)}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold transition"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>
)}

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
                background: '#d8c5a2',
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
                border: '2px solid #d8c5a2',
                color: '#d8c5a2'
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
              background: '#d8c5a2',
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

{/* CHANGE EMAIL MODAL - ТЕМНАЯ ТЕМА */}
{showChangeEmailModal && isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Смена email</h2>
        <button onClick={() => {
          setShowChangeEmailModal(false);
          setChangeEmailForm({ newEmail: '', password: '' });
        }} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Новый email</label>
          <input
            type="email"
            value={changeEmailForm.newEmail}
            onChange={(e) => setChangeEmailForm({...changeEmailForm, newEmail: e.target.value})}
            placeholder="Новый email"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none text-white"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">
            Текущий пароль <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={changeEmailForm.password}
            onChange={(e) => setChangeEmailForm({...changeEmailForm, password: e.target.value})}
            placeholder="Ваш пароль"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none text-white"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
          />
        </div>

        <button
          onClick={handleChangeEmail}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
            boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)',
            color: '#ffffff'
          }}
        >
          Сменить email
        </button>

        <button
          onClick={() => {
            setShowChangeEmailModal(false);
            setChangeEmailForm({ newEmail: '', password: '' });
          }}
          className="w-full py-3 rounded-lg font-bold transition border-2"
          style={{
            background: 'transparent',
            borderColor: '#9333ea',
            color: '#9370db'
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

{/* CHANGE EMAIL MODAL - СВЕТЛАЯ ТЕМА */}
{showChangeEmailModal && !isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-2xl w-full max-w-md p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Смена email</h2>
        <button onClick={() => {
          setShowChangeEmailModal(false);
          setChangeEmailForm({ newEmail: '', password: '' });
        }} className="absolute right-0" style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>Новый email</label>
          <input
            type="email"
            value={changeEmailForm.newEmail}
            onChange={(e) => setChangeEmailForm({...changeEmailForm, newEmail: e.target.value})}
            placeholder="Новый email"
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(180, 154, 95, 0.4)',
              color: '#c9c6bb'
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>
            Текущий пароль <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={changeEmailForm.password}
            onChange={(e) => setChangeEmailForm({...changeEmailForm, password: e.target.value})}
            placeholder="Ваш пароль"
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(180, 154, 95, 0.4)',
              color: '#c9c6bb'
            }}
          />
        </div>

        <button
          onClick={handleChangeEmail}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: '#c9c6bb',
            color: '#000000'
          }}
        >
          Сменить email
        </button>

        <button
          onClick={() => {
            setShowChangeEmailModal(false);
            setChangeEmailForm({ newEmail: '', password: '' });
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'transparent',
            border: '2px solid #c9c6bb',
            color: '#c9c6bb'
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

{/* CHANGE PASSWORD MODAL - ТЕМНАЯ ТЕМА */}
{showChangePasswordModal && isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold shimmer-btn-text">Смена пароля</h2>
        <button onClick={() => {
          setShowChangePasswordModal(false);
          setChangePasswordForm({ currentPassword: '', newPassword: '' });
        }} className="text-gray-400 hover:text-white absolute right-0">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Текущий пароль</label>
          <input
            type="password"
            value={changePasswordForm.currentPassword}
            onChange={(e) => setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})}
            placeholder="Текущий пароль"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none text-white"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Новый пароль</label>
          <input
            type="password"
            value={changePasswordForm.newPassword}
            onChange={(e) => setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})}
            placeholder="Новый пароль"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none text-white"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
          />
        </div>

        <button
          onClick={handleChangePassword}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
            boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)',
            color: '#ffffff'
          }}
        >
          Сменить пароль
        </button>

        <button
          onClick={() => {
            setShowChangePasswordModal(false);
            setChangePasswordForm({ currentPassword: '', newPassword: '' });
          }}
          className="w-full py-3 rounded-lg font-bold transition border-2"
          style={{
            background: 'transparent',
            borderColor: '#9333ea',
            color: '#9370db'
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

{/* CHANGE PASSWORD MODAL - СВЕТЛАЯ ТЕМА */}
{showChangePasswordModal && !isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
    <div className="rounded-2xl w-full max-w-md p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-center items-center mb-6 relative">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Смена пароля</h2>
        <button onClick={() => {
          setShowChangePasswordModal(false);
          setChangePasswordForm({ currentPassword: '', newPassword: '' });
        }} className="absolute right-0" style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>Текущий пароль</label>
          <input
            type="password"
            value={changePasswordForm.currentPassword}
            onChange={(e) => setChangePasswordForm({...changePasswordForm, currentPassword: e.target.value})}
            placeholder="Текущий пароль"
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(180, 154, 95, 0.4)',
              color: '#c9c6bb'
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>Новый пароль</label>
          <input
            type="password"
            value={changePasswordForm.newPassword}
            onChange={(e) => setChangePasswordForm({...changePasswordForm, newPassword: e.target.value})}
            placeholder="Новый пароль"
            className="w-full rounded px-3 py-2 text-sm focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(180, 154, 95, 0.4)',
              color: '#c9c6bb'
            }}
          />
        </div>

        <button
          onClick={handleChangePassword}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: '#c9c6bb',
            color: '#000000'
          }}
        >
          Сменить пароль
        </button>

        <button
          onClick={() => {
            setShowChangePasswordModal(false);
            setChangePasswordForm({ currentPassword: '', newPassword: '' });
          }}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'transparent',
            border: '2px solid #c9c6bb',
            color: '#c9c6bb'
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}

{/* CALENDAR MODAL - ТЕМНАЯ ТЕМА */}
{showCalendarModal && isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
    <div className="rounded-2xl w-full max-w-3xl p-6 border-2 max-h-[90vh] overflow-y-auto" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold shimmer-btn-text">Расписание обновлений</h2>
        <button onClick={() => setShowCalendarModal(false)} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-purple-500/20 rounded">
          ←
        </button>
        <span className="text-lg font-bold" style={{ color: '#b3e7ef' }}>
          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-purple-500/20 rounded">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center font-bold text-sm" style={{ color: '#9370db' }}>{day}</div>
        ))}
        
        {(() => {
          const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
          const days = [];
          
          for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
            days.push(<div key={`empty-${i}`} />);
          }
          
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateKey = date.toISOString().split('T')[0];
            const hasEvents = calendarEvents[dateKey]?.length > 0;
            
            days.push(
              <button
                key={day}
onClick={() => {
  setSelectedDate(date);
  setShowEventModal(true); // ← убрали проверку isAdmin
}}
                className="aspect-square rounded-lg flex items-center justify-center text-sm transition"
                style={{
                  background: hasEvents ? 'rgba(91, 1, 32, 0.5)' : 'rgba(147, 112, 219, 0.1)',
                  border: hasEvents ? '2px solid #5b0120' : '1px solid rgba(147, 112, 219, 0.3)',
                  boxShadow: hasEvents ? '0 0 15px rgba(91, 1, 32, 0.6)' : 'none',
                  color: '#ffffff'
                }}
              >
                {day}
              </button>
            );
          }
          
          return days;
        })()}
      </div>

      {!isAdmin && (
        <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(147, 112, 219, 0.2)' }}>
          <p className="text-sm text-gray-300">Нажмите на дату, чтобы увидеть запланированные события</p>
        </div>
      )}
    </div>
  </div>
)}

{/* CALENDAR MODAL - СВЕТЛАЯ ТЕМА */}
{showCalendarModal && !isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
    <div className="rounded-2xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto overflow-x-hidden" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '3px solid transparent',
      borderRadius: '24px',
      backgroundClip: 'padding-box',
      boxShadow: '0 0 0 3px #000000, inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        position: 'absolute',
        inset: '-3px',
        borderRadius: '24px',
        padding: '3px',
        background: 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none',
        zIndex: -1
      }} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Расписание обновлений</h2>
        <button onClick={() => setShowCalendarModal(false)} style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 rounded" style={{ color: '#c9c6bb' }}>
          ←
        </button>
        <span className="text-lg font-bold" style={{ color: '#c9c6bb' }}>
          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 rounded" style={{ color: '#c9c6bb' }}>
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center font-bold text-sm" style={{ color: '#c9c6bb' }}>{day}</div>
        ))}
        
        {(() => {
          const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
          const days = [];
          
          for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
            days.push(<div key={`empty-${i}`} />);
          }
          
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateKey = date.toISOString().split('T')[0];
            const hasEvents = calendarEvents[dateKey]?.length > 0;
            
            days.push(
              <button
                key={day}
onClick={() => {
  setSelectedDate(date);
  setShowEventModal(true); // ← убрали проверку isAdmin
                }}
                className="aspect-square rounded-lg flex items-center justify-center text-sm transition"
                style={{
                  background: hasEvents ? 'rgba(91, 1, 32, 0.5)' : 'rgba(201, 198, 187, 0.1)',
                  border: hasEvents ? '2px solid #5b0120' : '1px solid rgba(201, 198, 187, 0.3)',
                  boxShadow: hasEvents ? '0 0 15px rgba(91, 1, 32, 0.6)' : 'none',
                  color: '#c9c6bb'
                }}
              >
                {day}
              </button>
            );
          }
          
          return days;
        })()}
      </div>

      {!isAdmin && (
<div className="mt-6 p-4 rounded-lg" style={{ 
  background: 'rgba(201, 198, 187, 0.2)',
  border: '1px solid rgba(201, 198, 187, 0.3)'
}}>
  <p className="text-sm" style={{ color: '#c9c6bb' }}>
    Нажмите на дату, чтобы увидеть запланированные события
  </p>
</div>
      )}
    </div>
  </div>
)}

{/* EVENT MODAL - для всех пользователей */}
{showEventModal && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4">
    <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
      background: isDarkTheme ? 'rgba(147, 51, 234, 0.15)' : 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      borderColor: isDarkTheme ? '#9333ea' : '#c9c6bb',
      backdropFilter: 'blur(20px)',
      boxShadow: isDarkTheme ? '0 0 30px rgba(147, 51, 234, 0.6)' : 'inset 0 0 40px rgba(0, 0, 0, 0.5)'
    }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold" style={{ 
          color: isDarkTheme ? '#b3e7ef' : '#c9c6bb' 
        }}>
          {selectedDate?.toLocaleDateString('ru-RU')}
        </h3>
        <button onClick={() => setShowEventModal(false)} style={{ color: isDarkTheme ? '#ffffff' : '#c9c6bb' }}>
          <X size={20} />
        </button>
      </div>

      {/* СПИСОК СОБЫТИЙ - ВИДЯТ ВСЕ */}
      <div className="space-y-3 mb-4">
        {calendarEvents[selectedDate?.toISOString().split('T')[0]]?.length > 0 ? (
          calendarEvents[selectedDate?.toISOString().split('T')[0]].map((event, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 rounded" style={{
              background: 'rgba(91, 1, 32, 0.3)',
              border: '1px solid #5b0120'
            }}>
              <span className="text-sm" style={{ color: '#ffffff' }}>{event}</span>
              {isAdmin && (
                <button onClick={() => deleteEvent(idx)} className="text-red-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-sm" style={{ color: isDarkTheme ? '#9ca3af' : '#c9c6bb' }}>
            На эту дату событий нет
          </p>
        )}
      </div>

      {/* ФОРМА ДОБАВЛЕНИЯ - ТОЛЬКО ДЛЯ АДМИНА */}
      {isAdmin && (
        <>
          <textarea
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            placeholder="Введите событие..."
            rows={3}
            className="w-full rounded px-3 py-2 mb-4 text-sm"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: isDarkTheme ? '1px solid #9333ea' : '1px solid #c9c6bb',
              color: '#ffffff'
            }}
          />

          <button
            onClick={saveEvent}
            className="w-full py-2 rounded font-bold"
            style={{
              background: isDarkTheme ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' : '#c9c6bb',
              color: isDarkTheme ? '#ffffff' : '#000000'
            }}
          >
            Сохранить событие
          </button>
        </>
      )}
    </div>
  </div>
)}

{showPageBgEditor && isAdmin && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-[999] flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-2xl w-full max-w-4xl p-6 border-2 border-purple-600 max-h-[95vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-500">Редактор фона страницы</h2>
        <button onClick={() => setShowPageBgEditor(false)} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* ВКЛАДКИ ТЕМ */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setEditingTheme('dark')}
          className={`flex-1 py-3 rounded-lg font-bold transition ${
            editingTheme === 'dark' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          🌙 Темная тема
        </button>
        <button
          onClick={() => setEditingTheme('light')}
          className={`flex-1 py-3 rounded-lg font-bold transition ${
            editingTheme === 'light' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          ☀️ Светлая тема
        </button>
      </div>

      {/* ЗАГРУЗКА */}
      <div className="mb-6">
        <label className="block w-full py-4 border-2 border-dashed border-purple-500 rounded-lg text-center cursor-pointer hover:bg-purple-500/10">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  if (editingTheme === 'dark') {
                    setDarkBgImage(ev.target.result);
                  } else {
                    setLightBgImage(ev.target.result);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <svg className="mx-auto mb-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span className="text-purple-400">Загрузить фон для {editingTheme === 'dark' ? 'темной' : 'светлой'} темы</span>
        </label>
      </div>

      {((editingTheme === 'dark' && darkBgImage) || (editingTheme === 'light' && lightBgImage)) && (
        <>
          <div className="mb-6 space-y-4">
            {/* СЛАЙДЕРЫ */}
            <div>
              <label className="block text-white mb-2 text-sm">
                Горизонтальное положение: {editingTheme === 'dark' ? darkBgPosition.x : lightBgPosition.x}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editingTheme === 'dark' ? darkBgPosition.x : lightBgPosition.x}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (editingTheme === 'dark') {
                    setDarkBgPosition({...darkBgPosition, x: val});
                  } else {
                    setLightBgPosition({...lightBgPosition, x: val});
                  }
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{accentColor: '#9333ea'}}
              />
            </div>

            <div>
              <label className="block text-white mb-2 text-sm">
                Вертикальное положение: {editingTheme === 'dark' ? darkBgPosition.y : lightBgPosition.y}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editingTheme === 'dark' ? darkBgPosition.y : lightBgPosition.y}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (editingTheme === 'dark') {
                    setDarkBgPosition({...darkBgPosition, y: val});
                  } else {
                    setLightBgPosition({...lightBgPosition, y: val});
                  }
                }}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{accentColor: '#9333ea'}}
              />
            </div>
          </div>

          {/* ПРЕВЬЮ */}
          <div className="mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border-2 border-purple-500">
              <div className="grid grid-cols-2 gap-4">
                {/* ПК */}
                <div>
                  <p className="text-white text-sm mb-2 text-center">💻 ПК</p>
                  <div 
                    className="w-full h-48 rounded border-2 border-gray-600"
                    style={{
                      backgroundImage: editingTheme === 'dark' ? `url(${darkBgImage})` : `url(${lightBgImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: editingTheme === 'dark' 
                        ? `${darkBgPosition.x}% ${darkBgPosition.y}%` 
                        : `${lightBgPosition.x}% ${lightBgPosition.y}%`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>

                {/* МОБИЛЬНЫЙ */}
                <div>
                  <p className="text-white text-sm mb-2 text-center">📱 Мобильный</p>
                  <div className="flex justify-center">
                    <div 
                      className="w-32 h-48 rounded border-2 border-gray-600"
                      style={{
                        backgroundImage: editingTheme === 'dark' ? `url(${darkBgImage})` : `url(${lightBgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: editingTheme === 'dark' 
                          ? `${darkBgPosition.x}% ${darkBgPosition.y}%` 
                          : `${lightBgPosition.x}% ${lightBgPosition.y}%`,
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* БЫСТРЫЕ ПОЗИЦИИ */}
          <div className="mb-6">
            <p className="text-white text-sm mb-2">Быстрые позиции:</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 0, y: 0});
                else setLightBgPosition({x: 0, y: 0});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ↖️ Верх-лево
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 50, y: 0});
                else setLightBgPosition({x: 50, y: 0});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ⬆️ Верх-центр
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 100, y: 0});
                else setLightBgPosition({x: 100, y: 0});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ↗️ Верх-право
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 0, y: 50});
                else setLightBgPosition({x: 0, y: 50});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ⬅️ Центр-лево
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 50, y: 50});
                else setLightBgPosition({x: 50, y: 50});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                🎯 Центр
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 100, y: 50});
                else setLightBgPosition({x: 100, y: 50});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ➡️ Центр-право
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 0, y: 100});
                else setLightBgPosition({x: 0, y: 100});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ↙️ Низ-лево
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 50, y: 100});
                else setLightBgPosition({x: 50, y: 100});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ⬇️ Низ-центр
              </button>
              <button onClick={() => {
                if (editingTheme === 'dark') setDarkBgPosition({x: 100, y: 100});
                else setLightBgPosition({x: 100, y: 100});
              }} className="bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">
                ↘️ Низ-право
              </button>
            </div>
          </div>

          {/* КНОПКИ */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (editingTheme === 'dark') {
                  setDarkBgImage(null);
                  setDarkBgPosition({ x: 50, y: 50 });
                } else {
                  setLightBgImage(null);
                  setLightBgPosition({ x: 50, y: 50 });
                }
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold"
            >
              🗑️ Удалить
            </button>
            <button
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('site_settings')
                    .upsert({ 
                      id: 1, 
                      dark_bg_url: darkBgImage,
                      dark_bg_position: darkBgPosition,
                      light_bg_url: lightBgImage,
                      light_bg_position: lightBgPosition
                    }, { onConflict: 'id' });

                  if (error) {
                    showConfirm('Ошибка: ' + error.message);
                  } else {
                    showConfirm('✅ Фон сохранён! Перезагрузи страницу.');
                    setShowPageBgEditor(false);
                  }
                } catch (err) {
                  showConfirm('Ошибка: ' + err.message);
                }
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold"
            >
              💾 Сохранить
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}

{/* FOOTER */}
<footer className="bg-black py-6 sm:py-8 text-center text-gray-500 relative z-[5] border-t border-gray-800">
  <p className="text-base sm:text-lg mb-2">MelloStory © 2026</p>
  <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap px-4">
<Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-400 transition underline">
  Политика конфиденциальности
</Link>
<span className="text-gray-600">•</span>
<Link href="/terms" className="text-sm text-gray-400 hover:text-gray-400 transition underline">
  Пользовательское соглашение
</Link>
<span className="text-gray-600">•</span>
<Link href="/mission" className="text-sm text-gray-400 hover:text-gray-400 transition underline">
  Миссия сайта
</Link>
<span className="text-gray-600">•</span>
<Link href="/news" className="text-sm text-gray-400 hover:text-gray-400 transition underline">
  Новости сайта
</Link>
  </div>
</footer>
      </div>
    </>
  );
}