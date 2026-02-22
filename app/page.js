'use client';
import '@/app/fonts.css'; 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { supabaseBlog } from '@/lib/supabase-blog';
import { ChevronLeft, ChevronRight, X, Menu, LogOut, User, MessageSquare, Palette, FileText, Settings, Trash2, Send, Mail, MailOpen, AlertTriangle, Reply } from 'lucide-react';
import { supabaseUGC } from '@/lib/supabase-ugc';
import { Heart, Bookmark, Image as ImageIcon } from 'lucide-react';


export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState('ru');
  const [titleColor, setTitleColor] = useState('#ef4444');
const [activeCategory, setActiveCategory] = useState('novel');
  const [expandedWork, setExpandedWork] = useState(null);

  const [textFormatState, setTextFormatState] = useState({
  bold: false,
  italic: false,
  underline: false,
  align: 'left'
});
  
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
const [newsPosts, setNewsPosts] = useState([]);
const [showNewsModal, setShowNewsModal] = useState(false);
const [selectedNews, setSelectedNews] = useState(null);
const [showAddNewsModal, setShowAddNewsModal] = useState(false);
const [newsForm, setNewsForm] = useState({ title: '', content: '' });
const [newsCarouselIndex, setNewsCarouselIndex] = useState(0);
const [currentMonth, setCurrentMonth] = useState(new Date());
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
const [showNotificationsModal, setShowNotificationsModal] = useState(false);
const [isMobile, setIsMobile] = useState(false);
const [showNewsletterModal, setShowNewsletterModal] = useState(false);
const [isSubscribed, setIsSubscribed] = useState(false);

const showConfirm = (message, action = null) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
};

const applyTextFormat = (format) => {
  const textarea = document.getElementById('text-editor-textarea');
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = editText.substring(start, end);
  
  if (!selectedText) {
    showConfirm('Выделите текст для форматирования!');
    return;
  }
  
  let formattedText = selectedText;
  
  switch(format) {
    case 'bold':
      formattedText = `**${selectedText}**`;
      break;
    case 'italic':
      formattedText = `*${selectedText}*`;
      break;
    case 'underline':
      formattedText = `__${selectedText}__`;
      break;
  }
  
  const newText = editText.substring(0, start) + formattedText + editText.substring(end);
  setEditText(newText);
  
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
  }, 0);
};

const setTextAlignment = (align) => {
  setTextFormatState({...textFormatState, align});
};

const renderFormattedText = (text, defaultAlign = 'left') => {
  let align = defaultAlign;
  let content = text;
  
  // Извлекаем выравнивание из текста
  const alignMatch = text.match(/^\[ALIGN:(left|center|right)\]/);
  if (alignMatch) {
    align = alignMatch[1];
    content = text.replace(/^\[ALIGN:(left|center|right)\]/, '');
  }
  
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>');
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: formatted }} 
      style={{ textAlign: align, whiteSpace: 'pre-wrap' }}
    />
  );
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



const [formatState, setFormatState] = useState({
  bold: false,
  italic: false,
  underline: false,
  align: 'left'
});

const applyFormat = (format) => {
  const textarea = document.getElementById('event-textarea');
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = eventText.substring(start, end);
  
  if (!selectedText) {
    showConfirm('Выделите текст для форматирования!');
    return;
  }
  
  let formattedText = selectedText;
  
  switch(format) {
    case 'bold':
      formattedText = `**${selectedText}**`;
      break;
    case 'italic':
      formattedText = `*${selectedText}*`;
      break;
    case 'underline':
      formattedText = `__${selectedText}__`;
      break;
  }
  
  const newText = eventText.substring(0, start) + formattedText + eventText.substring(end);
  setEventText(newText);
  
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
  }, 0);
};

const setAlignment = (align) => {
  setFormatState({...formatState, align});
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

const saveNews = async () => {
  if (!newsForm.title.trim() || !newsForm.content.trim()) {
    showConfirm('Заполните название и текст новости!');
    return;
  }

  const { error } = await supabase
    .from('site_news')
    .insert({
      title: newsForm.title,
      content: newsForm.content
    });

  if (error) {
    showConfirm('Ошибка: ' + error.message);
  } else {
    setNewsForm({ title: '', content: '' });
    setShowAddNewsModal(false);
    loadNews();
    showConfirm('Новость добавлена!');
  }
};

const deleteNews = async (newsId) => {
  showConfirm('Удалить новость?', async () => {
    const { error } = await supabase
      .from('site_news')
      .delete()
      .eq('id', newsId);

    if (error) {
      showConfirm('Ошибка: ' + error.message);
    } else {
      loadNews();
      setShowNewsModal(false);
    }
  });
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
  const checkAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/welcome');
    } else {
      loadWorks();
      loadSettings();
      checkUser();
      loadSiteUpdates();
      loadNews();
    }
  };
  
  checkAndRedirect();
}, []);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth <= 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// ДОБАВЬ НОВЫЙ useEffect для уведомлений
useEffect(() => {
  if (user && userProfile) {
    loadNotifications();
  }
}, [user, userProfile]);

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

// Проверяем подписку на рассылку в supabaseBlog
try {
  const { data: subscription } = await supabaseBlog
    .from('newsletter_subscribers')
    .select('is_active')
    .eq('user_id', session.user.id)
    .maybeSingle();

  setIsSubscribed(subscription?.is_active || false);
} catch (err) {
  console.error('Ошибка загрузки статуса рассылки:', err);
  setIsSubscribed(false);
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

const loadNews = async () => {
  try {
    const { data, error } = await supabase
      .from('site_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    setNewsPosts(data || []);
  } catch (err) {
    console.error('Ошибка загрузки новостей:', err);
  }
};


const loadNotifications = async () => {
  if (!user || !userProfile) return;
  
  try {
    const [notificationsRes, countRes] = await Promise.all([
      fetch(`/api/ugc?action=get_notifications&userId=${user.id}`),
      fetch(`/api/ugc?action=get_unread_count&userId=${user.id}`)
    ]);
    
    const notificationsData = await notificationsRes.json();
    const countData = await countRes.json();
    
    if (notificationsData.notifications) {
      setNotifications(notificationsData.notifications);
    }
    
    if (countData.count !== undefined) {
      setUnreadCount(countData.count);
    }
  } catch (err) {
    console.error('Ошибка загрузки уведомлений:', err);
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    await fetch('/api/ugc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mark_as_read',
        userId: user.id,
        notificationId: notificationId
      })
    });
    
    loadNotifications(); // Перезагружаем
  } catch (err) {
    console.error('Ошибка отметки уведомления:', err);
  }
};

const handleNotificationClick = async (notification) => {
  // Отмечаем как прочитанное
  await markNotificationAsRead(notification.id);
  
  // Перенаправляем в зависимости от типа
  if (notification.type === 'new_work' || notification.type === 'new_chapter') {
    window.location.href = `/work/${notification.work_id}`;
  } else if (notification.type === 'comment_reply') {
    // ← ИСПРАВЛЕНО: перенаправление на страницу обсуждения
    window.location.href = `/work/${notification.work_id}/discussion`;
  } else if (notification.type === 'admin_message') {
    window.location.href = '/my-messages';
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
  .select('title_color, news_text, about_text, popular_works, popular_covers')
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
      
      // Добавляем обложки из отдельной колонки
      const covers = data.popular_covers ? 
        (typeof data.popular_covers === 'string' ? JSON.parse(data.popular_covers) : data.popular_covers) 
        : [{}, {}, {}];
      
      const combined = parsed.map((work, i) => ({
        ...work,
        cover_url: covers[i]?.url || work.cover_url || ''
      }));
      
      setPopularWorks(combined);
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
  
  // Перенаправляем на велком
  window.location.href = '/welcome';
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

  // Находим сообщение чтобы получить user_id автора
  const message = messages.find(m => m.id === messageId);
  if (!message) {
    showConfirm('Сообщение не найдено');
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
    // СОЗДАЁМ УВЕДОМЛЕНИЕ
    try {
      await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_admin_message_notification',
          userId: message.from_user_id,
          messageId: messageId
        })
      });
    } catch (notifError) {
      console.error('Ошибка создания уведомления:', notifError);
    }
    
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
    const textWithAlignment = `[ALIGN:${textFormatState.align}]${editText}`;
    
    const updateData = editingSection === 'news' 
      ? { news_text: textWithAlignment } 
      : { about_text: textWithAlignment };

    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, ...updateData }, { onConflict: 'id' });

    if (error) throw error;
    
    if (editingSection === 'news') {
      setNewsText(textWithAlignment);
    } else {
      setAboutText(textWithAlignment);
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
    const { cover_url, ...workData } = editPopularForm;
    updatedWorks[index] = { ...workData, id: index + 1 };
    
    // Обложки отдельно
    const covers = popularWorks.map(w => ({ url: w.cover_url || '' }));
    covers[index] = { url: cover_url || '' };

    const { error } = await supabase
      .from('site_settings')
      .upsert({ 
        id: 1, 
        popular_works: updatedWorks,
        popular_covers: covers
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
    about: 'Обо мне',
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Выход',
    nickname: 'Никнейм',
    email: 'Email',
    password: 'Пароль',
    noWorks: 'Работы не найдены',
    startReading: 'Начать читать',
    updates: 'Обновления',
    myCollection: 'Моя коллекция',
    myMessages: 'Мои сообщения',
    settings: 'Настройки',
    library: 'Библиотека',
    blog: 'Блог',
    notifications: 'Уведомления',
    mailing: 'Рассылка',
    schedule: 'Расписание',
    news: 'Новости',
    information: 'Информация',
    popularWorks: 'Популярные работы'
  },
  en: {
    about: 'About Me',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    nickname: 'Nickname',
    email: 'Email',
    password: 'Password',
    noWorks: 'No works found',
    startReading: 'Start Reading',
    updates: 'Updates',
    myCollection: 'My Collection',
    myMessages: 'My Messages',
    settings: 'Settings',
    library: 'Library',
    blog: 'Blog',
    notifications: 'Notifications',
    mailing: 'Mailing',
    schedule: 'Schedule',
    news: 'News',
    information: 'Information',
    popularWorks: 'Popular Works'
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


useEffect(() => {
  loadCalendarEvents();
}, []);

return (
    <>
      <link rel="preload" href="/images/main-bg.jpg" as="image" />
      <link rel="preload" href="/images/header-bg.jpg" as="image" />


<style dangerouslySetInnerHTML={{__html: `
/* Анимация волн для букв "Story" в светлой теме */
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
  /* Неоновая лава-лампа для карточек в темной теме */
@keyframes neonLava1 {
  0%, 100% { 
    transform: translate(-30%, -30%) scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: translate(30%, 30%) scale(1.2);
    opacity: 0.8;
  }
}

@keyframes neonLava2 {
  0%, 100% { 
    transform: translate(25%, -25%) scale(1.1);
    opacity: 0.7;
  }
  50% { 
    transform: translate(-25%, 25%) scale(1);
    opacity: 0.5;
  }
}

.neon-pulse {
  position: relative;
  background: rgba(0, 0, 0, 0.6);
}

.neon-pulse::before,
.neon-pulse::after {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  pointer-events: none;
  z-index: 0;
}

.neon-pulse::before {
  background: 
    radial-gradient(circle at 20% 30%, rgba(112, 219, 169, 0.8) 0%, transparent 25%),
    radial-gradient(circle at 70% 60%, rgba(239, 1, 203, 0.7) 0%, transparent 30%),
    radial-gradient(circle at 50% 80%, rgba(146, 56, 230, 0.6) 0%, transparent 35%);
  filter: blur(40px);
  animation: neonLava1 8s ease-in-out infinite;
}

.neon-pulse::after {
  background: 
    radial-gradient(circle at 80% 20%, rgba(239, 1, 203, 0.7) 0%, transparent 28%),
    radial-gradient(circle at 30% 70%, rgba(147, 112, 219, 0.65) 0%, transparent 32%),
    radial-gradient(circle at 60% 40%, rgba(62, 222, 247, 0.5) 0%, transparent 25%);
  filter: blur(35px);
  animation: neonLava2 10s ease-in-out infinite reverse;
}

.neon-pulse > img {
  position: relative;
  z-index: 1;
}

.fog-overlay {
  position: relative;
  background: rgba(0, 0, 0, 0.7);
}

.fog-overlay::before,
.fog-overlay::after {
  content: '';
  position: absolute;
  width: 150%;
  height: 150%;
  top: -25%;
  left: -25%;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(243, 243, 243, 0.5) 0%, transparent 12%),
    radial-gradient(circle at 60% 70%, rgba(200, 200, 200, 0.45) 0%, transparent 15%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 14%),
    radial-gradient(circle at 40% 80%, rgba(189, 179, 179, 0.48) 0%, transparent 16%),
    radial-gradient(circle at 50% 50%, rgba(240, 240, 240, 0.35) 0%, transparent 20%);
  filter: blur(20px);
  pointer-events: none;
  z-index: 0;
}

.fog-overlay::before {
  animation: fog1 16s ease-in-out infinite;
}

.fog-overlay::after {
  animation: fog2 12s ease-in-out infinite;
  background-image: 
    radial-gradient(circle at 35% 45%, rgba(255, 251, 251, 0.45) 0%, transparent 13%),
    radial-gradient(circle at 75% 55%, rgba(210, 210, 210, 0.42) 0%, transparent 16%),
    radial-gradient(circle at 15% 65%, rgba(250, 250, 250, 0.47) 0%, transparent 14%),
    radial-gradient(circle at 90% 40%, rgba(230, 230, 230, 0.4) 0%, transparent 18%);
}

.fog-overlay > img {
  position: relative;
  z-index: 1;
}

/* Туман для светлой темы */
@keyframes fog1 {
  0%, 100% { 
    transform: translate(-30%, -30%) rotate(0deg);
    opacity: 0.6;
  }
  50% { 
    transform: translate(30%, 30%) rotate(180deg);
    opacity: 0.4;
  }
}

@keyframes fog2 {
  0%, 100% { 
    transform: translate(25%, -25%) rotate(0deg);
    opacity: 0.55;
  }
  50% { 
    transform: translate(-25%, 25%) rotate(-180deg);
    opacity: 0.35;
  }
}

.fog-overlay {
  position: relative;
  overflow: hidden;
}

.fog-overlay::before,
.fog-overlay::after {
  content: '';
  position: absolute;
  width: 150%;
  height: 150%;
  top: -25%;
  left: -25%;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(243, 243, 243, 0.5) 0%, transparent 12%),
    radial-gradient(circle at 60% 70%, rgba(200, 200, 200, 0.45) 0%, transparent 15%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 14%),
    radial-gradient(circle at 40% 80%, rgba(189, 179, 179, 0.48) 0%, transparent 16%),
    radial-gradient(circle at 50% 50%, rgba(240, 240, 240, 0.35) 0%, transparent 20%);
  filter: blur(20px);
  pointer-events: none;
}

.fog-overlay::before {
  animation: fog1 16s ease-in-out infinite;
  z-index: 1;
}

.fog-overlay::after {
  animation: fog2 12s ease-in-out infinite;
  z-index: 1;
  background-image: 
    radial-gradient(circle at 35% 45%, rgba(255, 251, 251, 0.45) 0%, transparent 13%),
    radial-gradient(circle at 75% 55%, rgba(210, 210, 210, 0.42) 0%, transparent 16%),
    radial-gradient(circle at 15% 65%, rgba(250, 250, 250, 0.47) 0%, transparent 14%),
    radial-gradient(circle at 90% 40%, rgba(230, 230, 230, 0.4) 0%, transparent 18%);
}

.fog-overlay > * {
  position: relative;
  z-index: 2;
}
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
    @media (max-width: 640px) {
  .group span {
    display: none !important;
    max-width: 0 !important;
    opacity: 0 !important;
  }
  `}
`}} />
      
      
      <div className="min-h-screen text-white overflow-x-hidden relative">
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
        ? 'url(/images/mobail.webp)'
        : 'url(/images/descort.webp)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
/>

{/* HEADER */}
<div className="relative overflow-visible px-4 sm:px-8 pt-4 sm:pt-6">
  <div className="max-w-7xl mx-auto">
    {/* БЕЗ РАМКИ И ФОНА - ПРОСТО КОНТЕНТ */}
    <div className="relative overflow-hidden rounded-lg">
      
      {/* КОНТЕЙНЕР БЕЗ ФОНОВОГО ИЗОБРАЖЕНИЯ */}
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{
          background: 'transparent', // ← Просто прозрачный
          minHeight: '200px'
        }}
      >
        <style jsx>{`
          @media (min-width: 640px) {
            div[style*="minHeight"] {
              min-height: 480px !important;
            }
          }
          @media (max-width: 639px) {
            div[style*="minHeight"] {
              min-height: 200px !important;
            }
          }
        `}</style>
        
        <div className="relative z-10 h-full flex flex-col min-h-[200px] sm:min-h-[480px]">
          
          
{/* ВЕРХНЯЯ ПАНЕЛЬ */}
<div className="absolute inset-0 z-10 flex flex-col">
  <div className="px-3 sm:px-6 py-2 sm:py-4">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-1 sm:gap-4">
      </div>
      
 <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

{/* СМЕНА ТЕМЫ */}
<div className="relative">
  <button
    onClick={toggleTheme}
    className="p-2 transition relative flex items-center group"
    style={{ background: 'transparent', border: 'none', overflow: 'hidden' }}
  >
    {isDarkTheme ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    )}
    <span className="ml-2 whitespace-nowrap text-sm font-medium">Тема</span>
  </button>
</div>

{/* РАССЫЛКА */}
<div className="relative">
  <button
    onClick={() => {
      if (user && userProfile) {
        setShowNewsletterModal(true);
      } else {
        showConfirm('Войдите в аккаунт для управления рассылкой');
      }
    }}
    className="p-2 transition relative flex items-center group"
    style={{
      background: isSubscribed 
        ? (isDarkTheme 
          ? 'rgba(179, 231, 239, 0.2)' 
          : 'rgba(98, 9, 30, 0.3)') 
        : 'transparent',
      border: isSubscribed 
        ? (isDarkTheme ? '2px solid #b3e7ef' : '2px solid #62091e')
        : 'none',
      overflow: 'hidden',
      borderRadius: '8px',
      boxShadow: isSubscribed 
        ? (isDarkTheme 
          ? '0 0 20px rgba(179, 231, 239, 0.6)' 
          : '0 0 20px rgba(98, 9, 30, 0.6)')
        : 'none',
      animation: isSubscribed 
        ? (isDarkTheme ? 'neonPulseSubscribed 2s ease-in-out infinite' : 'burgundyPulseSubscribed 2s ease-in-out infinite')
        : 'none'
    }}
  >
    <style dangerouslySetInnerHTML={{__html: `
      .group span {
        max-width: 0;
        opacity: 0;
        transition: all 0.3s ease;
      }
      .group:hover span,
      .group:active span {
        max-width: 200px;
        opacity: 1;
      }
        /* Фикс для мобильного фона */
@media (max-width: 768px) {
  body {
    overflow-x: hidden;
  }
  .fixed.inset-0.-z-10 {
    position: absolute !important;
    min-height: 100% !important;
  }
}
    `}} />
    
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
    
    <span className="ml-2 whitespace-nowrap text-sm font-medium">
      Рассылка
    </span>
  </button>
</div>

{/* СМЕНА ЯЗЫКА */}
  <div className="relative">
    <button
      onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
      className="p-2 transition relative flex items-center group"
      style={{
        background: 'transparent',
        border: 'none',
        overflow: 'hidden'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .group span {
          max-width: 0;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .group:hover span,
        .group:active span {
          max-width: 200px;
          opacity: 1;
        }
      `}} />
      
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      
      <span className="ml-2 whitespace-nowrap text-sm font-medium">
        {language === 'ru' ? 'RU' : 'EN'}
      </span>
    </button>
  </div>

  {/* УВЕДОМЛЕНИЯ */}
  {user && userProfile && (
    <div className="relative">
      <button
        onClick={() => {
          setShowNotificationsPanel(!showNotificationsPanel);
          if (!showNotificationsPanel) {
            loadNotifications();
          }
        }}
        className="p-2 transition relative flex items-center group"
        style={{
          background: 'transparent',
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .group span {
            max-width: 0;
            opacity: 0;
            transition: all 0.3s ease;
          }
          .group:hover span,
          .group:active span {
            max-width: 200px;
            opacity: 1;
          }
        `}} />
        
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        
<span className="ml-2 whitespace-nowrap text-sm font-medium">
  {t.notifications}
</span>
        
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: isDarkTheme ? '#ef01cb' : '#62091e',
              color: '#ffffff',
              boxShadow: isDarkTheme ? '0 0 10px rgba(239, 1, 203, 0.8)' : 'none',
              maxWidth: 'none',
              opacity: 1
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotificationsPanel && (
        <div 
          className="fixed right-2 w-50 sm:w-80 rounded-xl p-2 sm:p-4 shadow-2xl z-[10000] max-h-48 sm:max-h-96 overflow-y-auto"
          style={{
            background: isDarkTheme 
              ? 'rgba(126, 50, 189, 0.5)'
              : 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            border: isDarkTheme ? '1px solid rgba(102, 69, 146, 0.6)' : '1px solid rgba(0, 0, 0, 0.6)',
            top: isMobile ? '60px' : '80px'
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm" style={{ color: isDarkTheme ? '#b3e7ef' : '#c9c6bb' }}>
              Уведомления
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowNotificationsModal(true);
                  loadNotifications();
                }}
                className="text-xs underline"
                style={{ color: isDarkTheme ? '#9370db' : '#c9c6bb' }}
              >
                Все
              </button>
              <button
                onClick={() => setShowNotificationsPanel(false)}
                className="hover:opacity-70 transition"
                style={{ color: isDarkTheme ? '#b3e7ef' : '#c9c6bb' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: isDarkTheme ? '#ffffff' : '#c9c6bb' }}>
              Нет уведомлений
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    handleNotificationClick(notif);
                    setShowNotificationsPanel(false);
                  }}
                  className="w-full text-left p-2 rounded transition"
                  style={{
                    background: notif.is_read 
                      ? 'rgba(0, 0, 0, 0.2)' 
                      : isDarkTheme 
                        ? 'rgba(239, 1, 203, 0.2)' 
                        : 'rgba(98, 9, 30, 0.3)',
                    border: notif.is_read ? 'none' : isDarkTheme ? '1px solid #ef01cb' : '1px solid #62091e'
                  }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: '#ffffff' }}>
                    {notif.message}
                  </p>
                  <p className="text-[10px]" style={{ color: isDarkTheme ? '#9ca3af' : '#c9c6bb' }}>
                    {new Date(notif.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )}
  

  {/* БИБЛИОТЕКА */}
  <Link
    href="/library"
    className="p-2 transition flex items-center group"
    style={{
      background: 'transparent',
      border: 'none',
      overflow: 'hidden'
    }}
  >
    <style dangerouslySetInnerHTML={{__html: `
      .group span {
        max-width: 0;
        opacity: 0;
        transition: all 0.3s ease;
      }
      .group:hover span,
      .group:active span {
        max-width: 200px;
        opacity: 1;
      }
    `}} />
    
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
<span className="ml-2 whitespace-nowrap text-sm font-medium">
  {t.library}
</span>
  </Link>

{/* ИКОНКА БЛОГА */}
<Link
  href="/blog"
  className="p-2 transition relative flex items-center group"
  style={{
    background: 'transparent',
    border: 'none',
    overflow: 'hidden'
  }}
>
  <style dangerouslySetInnerHTML={{__html: `
    .group span {
      max-width: 0;
      opacity: 0;
      transition: all 0.3s ease;
    }
    .group:hover span,
    .group:active span {
      max-width: 200px;
      opacity: 1;
    }
  `}} />
  
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
  
  <span className="ml-2 whitespace-nowrap text-sm font-medium">
  {t.blog}
  </span>
</Link>

  {/* ВХОД/МЕНЮ */}
  {!user ? (
    <button
      onClick={() => setShowAuthModal(true)}
      className="p-2 transition flex items-center group"
      style={{
        background: 'transparent',
        border: 'none',
        overflow: 'hidden'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .group span {
          max-width: 0;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .group:hover span,
        .group:active span {
          max-width: 200px;
          opacity: 1;
        }
      `}} />
      
      <User size={20} />
      <span className="ml-2 whitespace-nowrap text-sm font-medium">
        {t.login}
      </span>
    </button>
  ) : (
    <button
      onClick={() => (isAdmin ? setShowAdminPanel(true) : setShowReaderPanel(true))}
      className="p-2 transition flex items-center group"
      style={{
        background: 'transparent',
        border: 'none',
        overflow: 'hidden'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .group span {
          max-width: 0;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .group:hover span,
        .group:active span {
          max-width: 200px;
          opacity: 1;
        }
      `}} />
      
      <Menu size={20} />
      <span className="ml-2 whitespace-nowrap text-sm font-medium">
        {isAdmin ? 'Админ' : userProfile?.nickname}
      </span>
    </button>
  )}
</div>
    </div>
  </div>
<div className="flex-1 flex items-center justify-center px-8 pb-20 sm:pb-0" style={{ overflow: 'visible' }}>
<h1 style={{ lineHeight: '1', overflow: 'visible', display: 'block', textAlign: 'center' }}>
  <style dangerouslySetInnerHTML={{__html:`
    @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes hgold { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    .mello-dark {
      background: linear-gradient(90deg, #a72cc9 0%, #e6009b 33%, #68d3f3 66%, #a855f7 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }
    .mello-light {
      background: linear-gradient(135deg, #1a0000 0%, #6b0d1a 50%, #3a0008 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 400;
    }
  `}}/>

  {isDarkTheme ? (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      {/* Верхний разделитель */}
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'12px'}}>
        <div style={{width:'60px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.4))'}}/>
        <span style={{color:'rgba(179,231,239,0.3)',fontSize:'0.6rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
        <div style={{width:'60px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.4))'}}/>
      </div>
      {/* Название */}
      <div style={{display:'flex',alignItems:'baseline',gap:'0.2em',flexWrap:'nowrap'}}>
        <span className="mello-dark" style={{fontSize:'clamp(3.5rem,12vw,11rem)',fontFamily:"'plommir', Georgia, serif"}}>
          Mello
        </span>
        <span style={{fontSize:'clamp(3.5rem,12vw,11rem)',fontFamily:"'plommir', Georgia, serif",color:'#a4d9f1',
          textShadow:'0 0 30px rgba(164,217,241,0.5)'}}>
          Story
        </span>
      </div>
      {/* Нижний разделитель */}
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginTop:'8px'}}>
        <div style={{width:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.25))'}}/>
        <span style={{color:'rgba(179,231,239,0.2)',fontSize:'0.5rem',letterSpacing:'10px'}}>· · · · · · ·</span>
        <div style={{width:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.25))'}}/>
      </div>
    </div>
  ) : (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      {/* Верхний разделитель */}
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'12px'}}>
        <div style={{width:'60px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.5))'}}/>
        <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.75rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
        <div style={{width:'60px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.5))'}}/>
      </div>
      {/* Название */}
      <div style={{display:'flex',alignItems:'baseline',gap:'0.15em',flexWrap:'nowrap'}}>
        <span className="mello-light" style={{fontSize:'clamp(3.5rem,12vw,11rem)',fontFamily:"'victiriya', Georgia, serif"}}>
          Mello
        </span>
        <span style={{fontSize:'clamp(2rem,6vw,5rem)',color:'rgba(201,168,76,0.6)',fontFamily:'serif',
          alignSelf:'center',margin:'0 0.1em'}}>⚜</span>
        <span style={{fontSize:'clamp(3.5rem,12vw,11rem)',fontFamily:"'victiriya', Georgia, serif",
          backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
          backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          animation:'hgold 4s linear infinite',fontWeight:'400'}}>
          Story
        </span>
      </div>
      {/* Нижний разделитель */}
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginTop:'8px'}}>
        <div style={{width:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.3))'}}/>
        <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'10px',fontFamily:'serif'}}>· · · · · · ·</span>
        <div style={{width:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.3))'}}/>
      </div>
    </div>
  )}
</h1>
</div>
</div>
        </div>
      </div>
    </div>
  </div>
</div>


{/* ПОПУЛЯРНЫЕ РАБОТЫ */}
<div className="max-w-5xl mx-auto mt-12 sm:mt-16 relative z-0 px-2 sm:px-4" style={{ marginTop: isDarkTheme ? '3rem' : '2rem' }}>
<div className="text-center mb-6 sm:mb-8 mt-6 sm:mt-0">
  {isDarkTheme ? (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginBottom:'10px'}}>
        <div style={{flex:1,maxWidth:'100px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.4))'}}/>
        <span style={{color:'rgba(179,231,239,0.35)',fontSize:'0.6rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
        <div style={{flex:1,maxWidth:'100px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.4))'}}/>
      </div>
<div style={{fontFamily:'plommir, Georgia, serif',fontSize:'clamp(2rem,6vw,6rem)',fontWeight:'normal',
  color:'#b3e7ef',textShadow:'0 0 20px rgba(179,231,239,0.8),0 0 40px rgba(179,231,239,0.4)'}}>
  {t.popularWorks}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginTop:'10px'}}>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.2))'}}/>
        <span style={{color:'rgba(179,231,239,0.15)',fontSize:'0.5rem',letterSpacing:'10px'}}>· · · · · · ·</span>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.2))'}}/>
      </div>
    </div>
  ) : (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginBottom:'10px'}}>
        <div style={{flex:1,maxWidth:'100px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.5))'}}/>
        <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.75rem',letterSpacing:'6px',fontFamily:'serif'}}>⚜ · · ⚜</span>
        <div style={{flex:1,maxWidth:'100px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.5))'}}/>
      </div>
      <div style={{fontFamily:"'victiriya', Georgia, serif",fontSize:'clamp(1.5rem,4vw,4rem)',
        backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
        backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
        animation:'hgold 4s linear infinite',letterSpacing:'3px',fontWeight:'400'}}>
        {t.popularWorks}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'14px',marginTop:'10px'}}>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.3))'}}/>
        <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'10px',fontFamily:'serif'}}>· · · · · · ·</span>
        <div style={{flex:1,maxWidth:'80px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.3))'}}/>
      </div>
    </div>
  )}
</div>
  
<div className="grid grid-cols-3 gap-2 sm:gap-6">
{popularWorks.map((work, index) => (
  <div key={index} className="relative" style={{ minHeight: isMobile ? '150px' : '380px' }}> {/* ← ДОБАВЬ */}
    {/* БОЛЬШАЯ ЦИФРА СНАРУЖИ */}
    <div className="absolute -left-2 sm:-left-4 bottom-2 sm:bottom-4 z-20 pointer-events-none" style={{
      fontSize: 'clamp(80px, 20vw, 180px)',
      fontWeight: '900',
      lineHeight: '0.75',
      WebkitTextStroke: '3px rgba(255, 255, 255, 0.3)',
      color: 'transparent',
      textShadow: '0 5px 20px rgba(0, 0, 0, 0.9)',
      transform: 'translateX(8px)'
    }}>
      {index + 1}
    </div>

    {/* КАРТОЧКА С ЭФФЕКТАМИ НА ЗАДНИКЕ */}
<div className={`relative rounded-l.1g sm:rounded-xl transition hover:scale-105 overflow-hidden ${!isDarkTheme ? 'fog-overlay' : 'neon-pulse'}`} style={{
  background: isDarkTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  border: isDarkTheme ? '2px solid #9b73b0' : '1px solid #353534',
  borderRadius: '12px',
  backgroundClip: !isDarkTheme ? 'padding-box' : 'border-box',
  boxShadow: isDarkTheme ? '0 0 20px rgba(155, 115, 176, 0.6), 0 0 40px rgba(155, 115, 176, 0.3)' : 'none',
  display: 'flex',           
  flexDirection: 'column',   
  height: '100%'             
}}>
      {isAdmin && (
        <button
          onClick={() => {
            setEditingPopularIndex(index);
            setEditPopularForm(work);
            setShowPopularEditModal(true);
          }}
          className="absolute top-1 right-1 sm:top-3 sm:right-3 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition z-30"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)',
            boxShadow: '0 0 10px rgba(220, 38, 38, 0.8)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}

      {/* ОБЛОЖКА */}
      {work.cover_url && (
        <div className="w-[60%] mx-auto mt-2 sm:mt-3 rounded-lg overflow-hidden relative z-10">
          <img 
            src={work.cover_url} 
            alt={work.title}
            style={{ 
              aspectRatio: '2/3', 
              objectFit: 'cover',
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
      )}

{(work.title || work.rating || work.views) ? (
  <div className="p-2 sm:p-4 relative z-10 flex-1 flex flex-col justify-end">
{work.title && (
  <h3 className="font-bold text-[10px] sm:text-base mb-2 text-center break-words line-clamp-2" style={{
    color: isDarkTheme ? '#b3e7ef' : 'transparent',
    textShadow: isDarkTheme ? '0 0 15px rgba(179, 231, 239, 0.6)' : 'none',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontStyle: !isDarkTheme ? 'italic' : 'normal',
    backgroundImage: !isDarkTheme ? 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)' : 'none',
    WebkitBackgroundClip: !isDarkTheme ? 'text' : 'unset',
    WebkitTextFillColor: !isDarkTheme ? 'transparent' : 'unset'
  }}>
    {work.title}
  </h3>
)}
          
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff" className="sm:w-4 sm:h-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span className="text-white font-bold text-[10px] sm:text-sm">
                {work.rating || '—'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" className="sm:w-4 sm:h-4">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span className="text-white font-bold text-[10px] sm:text-sm">
                {work.views || '—'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 sm:py-8 relative z-10">
          <p className="text-gray-400 text-[10px] sm:text-sm">
            Скоро здесь появится работа
          </p>
        </div>
      )}
    </div>
  </div>
))}
  </div>
  
    {/* НОВЫЙ ТЕКСТ ДОБАВЛЯЕТСЯ ЗДЕСЬ */}
<p style={{
  textAlign: 'center', marginTop: '24px',
  fontSize: 'clamp(0.6rem, 1.2vw, 0.72rem)',
  color: isDarkTheme ? 'rgba(179,231,239,0.45)' : 'rgba(201,168,76,0.45)',
  fontFamily: 'Georgia, serif', fontStyle: 'italic',
  letterSpacing: isDarkTheme ? '0px' : '1px',
  lineHeight: '1.7', padding: '0 8px'
}}>
    Обновление рейтинга и статистики просмотров производится один раз в три дня на основе суммарных пользовательских оценок. Раздел «Популярные работы» обновляется еженедельно.
  </p>

  {/* КНОПКА РАСПИСАНИЯ ПОД ПОПУЛЯРНЫМИ РАБОТАМИ */}
  <div className="mt-8">
<button
  onClick={() => {
    setShowCalendarModal(true);
    loadCalendarEvents();
  }}
  className="w-full py-4 sm:py-6 font-bold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
  style={{
    background: 'transparent',
    border: 'none'
  }}
>
{isDarkTheme ? (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.4))'}}/>
      <span style={{color:'rgba(179,231,239,0.35)',fontSize:'0.6rem',letterSpacing:'6px'}}>✦ · ✦</span>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.4))'}}/>
    </div>
<span style={{fontSize:'clamp(2rem,6vw,6rem)',color:'#b3e7ef',fontFamily:'plommir, Georgia, serif',fontWeight:'normal',
  textShadow:'0 0 20px rgba(179,231,239,0.8)'}}>
  {t.schedule}
    </span>
    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(179,231,239,0.2))'}}/>
      <span style={{color:'rgba(179,231,239,0.15)',fontSize:'0.5rem',letterSpacing:'8px'}}>· · · · ·</span>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(179,231,239,0.2))'}}/>
    </div>
  </div>
) : (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.45))'}}/>
      <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'5px',fontFamily:'serif'}}>⚜ · ⚜</span>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.45))'}}/>
    </div>
    <span style={{fontFamily:"'victiriya', Georgia, serif",fontSize:'clamp(1.5rem,4vw,4rem)',
      backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
      backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
      animation:'hgold 4s linear infinite',letterSpacing:'2px',fontWeight:'400'}}>
      {t.schedule}
    </span>
    <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(90deg,transparent,rgba(201,168,76,0.25))'}}/>
      <span style={{color:'rgba(201,168,76,0.15)',fontSize:'0.5rem',letterSpacing:'8px',fontFamily:'serif'}}>· · · · ·</span>
      <div style={{width:'50px',height:'1px',background:'linear-gradient(270deg,transparent,rgba(201,168,76,0.25))'}}/>
    </div>
  </div>
)}
<svg width="30" height="30" viewBox="0 0 24 24" fill="none"
  stroke={isDarkTheme ? '#b3e7ef' : '#c9a84c'} strokeWidth="1.2"
  strokeLinecap="round" strokeLinejoin="round"
  style={{
    filter: isDarkTheme
      ? 'drop-shadow(0 0 14px rgba(179,231,239,1)) drop-shadow(0 0 6px rgba(239,1,203,0.5))'
      : 'drop-shadow(0 0 10px rgba(201,168,76,0.8))',
    animation: 'bounce 2s infinite'
  }}>
  <polyline points="6 9 12 15 18 9"/>
</svg>
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(10px); }
    }
  `}} />
</button>
  </div>
</div>

{/* БЛОК НОВОСТЕЙ */}
{newsPosts.length > 0 && (
<div className="max-w-7xl mt-1 sm:mt-14 relative z-0 px-4 sm:px-8">
<div className="mb-8 mt-9 sm:mt-12">
<div className="mb-4 mt-6 sm:mt-0">
  {isDarkTheme ? (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'10px'}}>
        <span style={{color:'rgba(179,231,239,0.35)',fontSize:'0.6rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
        <div style={{flex:1,maxWidth:'140px',height:'1px',background:'linear-gradient(90deg,rgba(179,231,239,0.4),transparent)'}}/>
      </div>
<div style={{fontFamily:'plommir, Georgia, serif',fontSize:'clamp(2rem,6vw,6rem)',fontWeight:'normal',
  color:'#b3e7ef',textShadow:'0 0 20px rgba(179,231,239,0.8)'}}>
  {t.news}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'10px'}}>
        <div style={{width:'120px',height:'1px',background:'linear-gradient(90deg,rgba(179,231,239,0.3),transparent)'}}/>
        <span style={{color:'rgba(179,231,239,0.15)',fontSize:'0.5rem',letterSpacing:'8px'}}>· · · · · · ·</span>
      </div>
    </div>
  ) : (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'10px'}}>
        <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.75rem',letterSpacing:'5px',fontFamily:'serif'}}>⚜ · · ⚜</span>
        <div style={{flex:1,maxWidth:'140px',height:'1px',background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)'}}/>
      </div>
      <div style={{fontFamily:"'victiriya', Georgia, serif",fontSize:'clamp(1.5rem,4vw,4rem)',
        backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
        backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
        animation:'hgold 4s linear infinite',letterSpacing:'2px',fontWeight:'400'}}>
        {t.news}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'10px'}}>
        <div style={{width:'120px',height:'1px',background:'linear-gradient(90deg,rgba(201,168,76,0.35),transparent)'}}/>
        <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'8px',fontFamily:'serif'}}>· · · · · · ·</span>
      </div>
    </div>
  )}
</div>
      
{isAdmin && (
        <button
          onClick={() => setShowAddNewsModal(true)}
          className="px-4 py-2 rounded-lg font-bold text-sm transition mb-6"
          style={{
            background: isDarkTheme ? 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' : '#c9c6bb',
            color: isDarkTheme ? '#ffffff' : '#000000',
            boxShadow: isDarkTheme ? '0 0 10px rgba(220, 38, 38, 0.8)' : 'none'
          }}
        >
          + Добавить новость
        </button>
      )}
    </div>

  <div className="relative max-w-4xl">
{/* СТРЕЛКА ВЛЕВО */}
{newsCarouselIndex > 0 && (
  <button
    onClick={() => setNewsCarouselIndex(newsCarouselIndex - 1)}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full px-1 sm:px-3 flex items-center justify-center transition group"
  >
    <div className="flex items-center justify-center transition-all group-hover:scale-125">
<svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={isDarkTheme ? '#b3e7ef' : '#c9a84c'} strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{
          filter: isDarkTheme
            ? 'drop-shadow(0 0 12px rgba(179,231,239,1)) drop-shadow(0 0 4px rgba(147,112,219,0.8))'
            : 'drop-shadow(0 0 8px rgba(201,168,76,0.7))',
          animation: 'bounce 2s infinite'
        }}>
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </div>
  </button>
)}

  {/* КАРТОЧКИ НОВОСТЕЙ */}
<div className="overflow-hidden px-0">
    <div 
      className="flex gap-4 transition-transform duration-300"
      style={{ transform: `translateX(-${newsCarouselIndex * 100}%)` }}
    >
 {newsPosts.map((news) => (
  <div
    key={news.id}
    onClick={() => {
      setSelectedNews(news);
      setShowNewsModal(true);
    }}
    className="min-w-[calc(50%-8px)] sm:min-w-[calc(50%-8px)] lg:min-w-[calc(33.333%-11px)] p-3 sm:p-4 cursor-pointer transition"
    style={{
      background: 'transparent'
    }}
  >
{/* ЗАГОЛОВОК новости */}
<h3
  className="text-base sm:text-lg mb-2 line-clamp-2 transition-colors duration-300 hover-news-title"
  style={{
    color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
    fontWeight: '300',
    fontStyle: 'italic',
    fontFamily: 'Georgia, serif'
  }}
>
  {news.title}
</h3>

{/* ДАТА новости */}
<p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{
  color: isDarkTheme ? '#9ca3af' : '#c9c6bb',
  opacity: 0.8,
  fontWeight: '300',
  fontStyle: 'italic'
}}>
  {new Date(news.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })}
</p>
<div className="flex items-center gap-2">
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes slideRight {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(5px); }
    }
    .animate-slide-right {
      animation: slideRight 1.5s ease-in-out infinite;
    }
  `}} />
  <span className="text-xs sm:text-sm font-semibold" style={{
    color: isDarkTheme ? '#9370db' : '#c9c6bb'
  }}>
    Подробнее
  </span>
  <span className="animate-slide-right" style={{
    color: isDarkTheme ? '#9370db' : '#c9c6bb'
  }}>
    →
  </span>
</div>
  </div>
))}
    </div>
  </div>

{/* СТРЕЛКА ВПРАВО */}
{newsCarouselIndex < newsPosts.length - 1 && (
  <button
    onClick={() => setNewsCarouselIndex(newsCarouselIndex + 1)}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full px-1 sm:px-3 flex items-center justify-center transition group"
  >
    <div className="flex items-center justify-center transition-all group-hover:scale-125">
 <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={isDarkTheme ? '#b3e7ef' : '#c9a84c'} strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{
          filter: isDarkTheme
            ? 'drop-shadow(0 0 12px rgba(179,231,239,1)) drop-shadow(0 0 4px rgba(147,112,219,0.8))'
            : 'drop-shadow(0 0 8px rgba(201,168,76,0.7))',
          animation: 'bounce 2s infinite'
        }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  </button>
)}
    </div>
  </div>
)}

{/* ABOUT SECTION */}
<div className="max-w-7xl mx-auto mt-12 sm:mt-20 relative z-0 px-4 sm:px-8">
<div className="max-w-2xl sm:ml-auto">


<div className="text-left leading-relaxed">
<div className="mb-8 mt-6 sm:mt-0">
  {isDarkTheme ? (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'10px'}}>
        <span style={{color:'rgba(179,231,239,0.35)',fontSize:'0.6rem',letterSpacing:'8px'}}>✦ · · · ✦</span>
        <div style={{flex:1,maxWidth:'140px',height:'1px',background:'linear-gradient(90deg,rgba(179,231,239,0.4),transparent)'}}/>
      </div>
<div style={{fontFamily:'plommir, Georgia, serif',fontSize:'clamp(2rem,6vw,6rem)',fontWeight:'normal',
  color:'#b3e7ef',textShadow:'0 0 20px rgba(179,231,239,0.8)'}}>
  {t.information}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'10px'}}>
        <div style={{width:'120px',height:'1px',background:'linear-gradient(90deg,rgba(179,231,239,0.3),transparent)'}}/>
        <span style={{color:'rgba(179,231,239,0.15)',fontSize:'0.5rem',letterSpacing:'8px'}}>· · · · · · ·</span>
      </div>
    </div>
  ) : (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'10px'}}>
        <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.75rem',letterSpacing:'5px',fontFamily:'serif'}}>⚜ · · ⚜</span>
        <div style={{flex:1,maxWidth:'140px',height:'1px',background:'linear-gradient(90deg,rgba(201,168,76,0.4),transparent)'}}/>
      </div>
      <div style={{fontFamily:"'victiriya', Georgia, serif",fontSize:'clamp(1.5rem,4vw,4rem)',
        backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
        backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
        animation:'hgold 4s linear infinite',letterSpacing:'2px',fontWeight:'400'}}>
        {t.information}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'10px'}}>
        <div style={{width:'120px',height:'1px',background:'linear-gradient(90deg,rgba(201,168,76,0.35),transparent)'}}/>
        <span style={{color:'rgba(201,168,76,0.2)',fontSize:'0.55rem',letterSpacing:'8px',fontFamily:'serif'}}>· · · · · · ·</span>
      </div>
    </div>
  )}
</div>
<div className="mt-8 max-w-xl" style={{
  fontFamily:'Georgia,serif', fontStyle:'italic', lineHeight:'1.9',
  color: isDarkTheme ? 'rgba(200,185,230,0.78)' : 'rgba(255, 255, 255, 0.88)',
  borderLeft: isDarkTheme ? '2px solid rgba(147,112,219,0.35)' : '2px solid rgba(201,168,76,0.28)',
  paddingLeft: '1.2rem'
}}>
  <p className="mb-2">Если у вас возникнут трудности или вопросы при регистрации и отсутствует возможность написать из личного кабинета, вы можете связаться со мной по электронной почте:</p>
    <a 
      href="mailto:mellostory@protonmail.com"
      className="inline-block font-bold underline transition"
      style={{
        color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
        textShadow: isDarkTheme ? '0 0 10px rgba(179, 231, 239, 0.6)' : 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textShadow = isDarkTheme ? '0 0 20px rgba(179, 231, 239, 1)' : 'none';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textShadow = isDarkTheme ? '0 0 10px rgba(179, 231, 239, 0.6)' : 'none';
      }}
    >
      mellostory@protonmail.com
    </a>
  </div>
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
            После заполнения всех полей нажимайте кнопку «Регистрация» только один раз. Повторное нажатие может привести к многократному созданию аккаунта.
Для подтверждения регистрации проверьте письмо от Supabase в вашей электронной почте.
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
{showDeleteAccountModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes delGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .del-light-scroll::-webkit-scrollbar{width:3px;}
      .del-light-scroll::-webkit-scrollbar-track{background:transparent;}
      .del-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .del-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'360px',
      maxHeight:'min(85vh,580px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',top:'50%',right:'5px',transform:'translateY(-50%)',
        fontFamily:'serif',fontSize:'clamp(6rem,15vw,10rem)',color:'rgba(201,168,76,0.03)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      <div className="del-light-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,26px) clamp(14px,4vw,28px)',paddingTop:'clamp(16px,4vw,26px)',position:'relative',zIndex:1}}>
        <button onClick={()=>{setShowDeleteAccountModal(false);setDeleteReason('');setDeletePassword('');}} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        <div style={{marginBottom:'clamp(12px,3vw,18px)'}}>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.2rem,5vw,1.8rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'delGold 4s linear infinite',letterSpacing:'3px',marginBottom:'8px'}}>Удаление профиля</div>
          <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
        </div>

        <div style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'10px 12px',marginBottom:'14px'}}>
          <p style={{color:'rgba(201,168,76,0.5)',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.6'}}>
            Это действие необратимо. Все данные будут удалены навсегда.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,12px)'}}>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>
              Причина <span style={{opacity:0.6,textTransform:'none',fontSize:'0.9em'}}>(необязательно)</span>
            </label>
            <textarea value={deleteReason} onChange={e=>setDeleteReason(e.target.value)} rows={2} placeholder="Расскажите почему..."
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.7)',fontSize:'clamp(0.72rem,2vw,0.82rem)',outline:'none',resize:'none',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Пароль *</label>
            <input type="password" value={deletePassword} onChange={e=>setDeletePassword(e.target.value)} placeholder="••••••••"
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.8)',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleDeleteAccount} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.5)',borderRadius:'2px',cursor:'pointer',color:'#c9a84c',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',marginTop:'4px'}}>
            ⚜ Удалить
          </button>
          <button onClick={()=>{setShowDeleteAccountModal(false);setDeleteReason('');setDeletePassword('');}} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.12)',borderRadius:'2px',cursor:'pointer',color:'rgba(201,168,76,0.3)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* DELETE ACCOUNT MODAL - СВЕТЛАЯ ТЕМА */}
{showDeleteAccountModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes delGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .del-light-scroll::-webkit-scrollbar{width:3px;}
      .del-light-scroll::-webkit-scrollbar-track{background:transparent;}
      .del-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .del-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'360px',
      maxHeight:'min(85vh,580px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',top:'50%',right:'5px',transform:'translateY(-50%)',
        fontFamily:'serif',fontSize:'clamp(6rem,15vw,10rem)',color:'rgba(201,168,76,0.03)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      <div className="del-light-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,26px) clamp(14px,4vw,28px)',paddingTop:'clamp(16px,4vw,26px)',position:'relative',zIndex:1}}>
        <button onClick={()=>{setShowDeleteAccountModal(false);setDeleteReason('');setDeletePassword('');}} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        <div style={{marginBottom:'clamp(12px,3vw,18px)'}}>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.2rem,5vw,1.8rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'delGold 4s linear infinite',letterSpacing:'3px',marginBottom:'8px'}}>Удаление профиля</div>
          <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
        </div>

        <div style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'10px 12px',marginBottom:'14px'}}>
          <p style={{color:'rgba(201,168,76,0.5)',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.6'}}>
            Это действие необратимо. Все данные будут удалены навсегда.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,12px)'}}>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>
              Причина <span style={{opacity:0.6,textTransform:'none',fontSize:'0.9em'}}>(необязательно)</span>
            </label>
            <textarea value={deleteReason} onChange={e=>setDeleteReason(e.target.value)} rows={2} placeholder="Расскажите почему..."
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.7)',fontSize:'clamp(0.72rem,2vw,0.82rem)',outline:'none',resize:'none',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Пароль *</label>
            <input type="password" value={deletePassword} onChange={e=>setDeletePassword(e.target.value)} placeholder="••••••••"
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.8)',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleDeleteAccount} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.5)',borderRadius:'2px',cursor:'pointer',color:'#c9a84c',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',marginTop:'4px'}}>
            ⚜ Удалить
          </button>
          <button onClick={()=>{setShowDeleteAccountModal(false);setDeleteReason('');setDeletePassword('');}} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.12)',borderRadius:'2px',cursor:'pointer',color:'rgba(201,168,76,0.3)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* UPDATES MODAL */}
{showUpdatesModal && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes updTwinkle{0%,100%{opacity:0.1;}50%{opacity:0.5;}}
      .upd-dark-scroll::-webkit-scrollbar{width:4px;}
      .upd-dark-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .upd-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .upd-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
      .upd-card:hover{border-color:#ef01cb !important;box-shadow:0 0 20px rgba(239,1,203,0.4) !important;}
    `}}/>
    <div style={{
      background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
      border:'1px solid rgba(180,100,255,0.25)',
      boxShadow:'0 0 60px rgba(147,50,255,0.15)',
      borderRadius:'14px',
      width:'92vw',maxWidth:'560px',
      maxHeight:'min(88vh,640px)',
      display:'flex',flexDirection:'column',
      position:'relative'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3,flexShrink:0}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',borderRadius:'14px',
        backgroundImage:`radial-gradient(1px 1px at 5% 10%,rgba(255,255,255,0.3) 0%,transparent 100%),
          radial-gradient(1px 1px at 90% 8%,rgba(255,255,255,0.25) 0%,transparent 100%),
          radial-gradient(1px 1px at 70% 90%,rgba(255,255,255,0.2) 0%,transparent 100%),
          radial-gradient(1px 1px at 15% 85%,rgba(255,255,255,0.15) 0%,transparent 100%)`,
        animation:'updTwinkle 6s ease-in-out infinite',zIndex:0}}/>

      {/* Шапка — фиксированная */}
      <div style={{padding:'clamp(14px,3vw,22px) clamp(14px,3vw,24px)',paddingBottom:'clamp(10px,2vw,16px)',borderBottom:'1px solid rgba(147,112,219,0.15)',position:'relative',zIndex:2,flexShrink:0}}>
        <button onClick={()=>setShowUpdatesModal(false)} style={{
          position:'absolute',top:'12px',right:'12px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'clamp(0.9rem,2.5vw,1.2rem)',color:'rgba(180,100,255,0.4)',marginBottom:'4px'}}>✦</div>
          <div style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.85rem,2.5vw,1.05rem)',letterSpacing:'clamp(3px,1vw,6px)',
            background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Обновления</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'6px'}}>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
        </div>
      </div>

      {/* Список — скроллируемый */}
      <div className="upd-dark-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',position:'relative',zIndex:1,flex:1}}>
        {siteUpdates.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 20px',background:'rgba(147,112,219,0.05)',border:'1px solid rgba(147,112,219,0.15)',borderRadius:'8px'}}>
            <div style={{fontSize:'2rem',marginBottom:'8px',opacity:0.3}}>✦</div>
            <p style={{color:'rgba(180,100,255,0.4)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.85rem'}}>Пока нет обновлений</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,12px)'}}>
            {siteUpdates.map((update) => (
              <div key={update.id} className="upd-card"
                onClick={async()=>{loadSiteUpdates();window.location.href=`/work/${update.work_id}`;}}
                style={{
                  background:'rgba(0,0,0,0.4)',
                  border: update.type==='new_work' ? '1px solid rgba(239,1,203,0.4)' : '1px solid rgba(147,112,219,0.2)',
                  borderRadius:'8px',padding:'clamp(10px,2vw,14px)',cursor:'pointer',
                  boxShadow: update.type==='new_work' ? '0 0 12px rgba(239,1,203,0.15)' : 'none',
                  transition:'all 0.2s'
                }}>
                <div style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                  <div style={{flexShrink:0,marginTop:'2px'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={update.type==='new_work'?'#ef01cb':'#9370db'} style={{filter:`drop-shadow(0 0 4px ${update.type==='new_work'?'rgba(239,1,203,0.6)':'rgba(147,112,219,0.5)'})`}}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    {update.type==='new_work' ? (
                      <>
                        <span style={{display:'inline-block',background:'linear-gradient(135deg,#ef01cb,#bc0897)',color:'#fff',fontSize:'clamp(0.45rem,1.2vw,0.55rem)',fontFamily:'Cinzel,serif',letterSpacing:'2px',padding:'2px 8px',borderRadius:'2px',marginBottom:'6px',boxShadow:'0 0 10px rgba(239,1,203,0.6)'}}>НОВАЯ РАБОТА</span>
                        <p style={{color:'#e8d5ff',fontFamily:'Georgia,serif',fontSize:'clamp(0.8rem,2vw,0.95rem)',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                        <p style={{color:'rgba(180,100,255,0.4)',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                          {new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{color:'rgba(200,185,230,0.8)',fontFamily:'Georgia,serif',fontSize:'clamp(0.8rem,2vw,0.92rem)',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                        <p style={{color:'rgba(180,100,255,0.5)',fontSize:'clamp(0.65rem,1.5vw,0.75rem)',marginBottom:'4px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                          {update.chapter_number} глава{update.chapter_title&&` · ${update.chapter_title}`}
                        </p>
                        <p style={{color:'rgba(147,112,219,0.35)',fontSize:'clamp(0.58rem,1.3vw,0.65rem)',fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                          {new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}
                        </p>
                      </>
                    )}
                  </div>
                  <div style={{flexShrink:0,color:'rgba(180,100,255,0.3)',fontSize:'0.7rem',alignSelf:'center'}}>→</div>
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
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes updGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .upd-light-scroll::-webkit-scrollbar{width:4px;}
      .upd-light-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .upd-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .upd-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
      .upd-card-light:hover{border-color:rgba(201,168,76,0.5) !important;background:rgba(201,168,76,0.06) !important;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'560px',
      maxHeight:'min(88vh,640px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',bottom:'20px',right:'10px',
        fontFamily:'serif',fontSize:'clamp(8rem,20vw,14rem)',color:'rgba(201,168,76,0.025)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      {/* Шапка */}
      <div style={{padding:'clamp(14px,3vw,22px) clamp(18px,4vw,28px)',paddingBottom:'clamp(10px,2vw,14px)',borderBottom:'1px solid rgba(201,168,76,0.1)',position:'relative',zIndex:2,flexShrink:0}}>
        <button onClick={()=>setShowUpdatesModal(false)} style={{
          position:'absolute',top:'12px',right:'12px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        <div>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.4rem,5vw,2rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'updGold 4s linear infinite',letterSpacing:'3px',marginBottom:'8px'}}>Обновления</div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>
      </div>

      {/* Список */}
      <div className="upd-light-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',position:'relative',zIndex:1,flex:1}}>
        {siteUpdates.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px 20px',background:'rgba(201,168,76,0.03)',border:'1px solid rgba(201,168,76,0.12)',borderRadius:'2px'}}>
            <div style={{fontSize:'2rem',marginBottom:'8px',color:'rgba(201,168,76,0.2)',fontFamily:'serif'}}>⚜</div>
            <p style={{color:'rgba(201,168,76,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'0.85rem'}}>Пока нет обновлений</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)'}}>
            {siteUpdates.map((update) => (
              <div key={update.id} className="upd-card-light"
                onClick={async()=>{loadSiteUpdates();window.location.href=`/work/${update.work_id}`;}}
                style={{
                  background:'rgba(201,168,76,0.03)',
                  border: update.type==='new_work' ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(201,168,76,0.12)',
                  borderRadius:'2px',padding:'clamp(10px,2vw,14px)',cursor:'pointer',
                  transition:'all 0.2s',position:'relative'
                }}>
                {/* Левая метка для новой работы */}
                {update.type==='new_work' && (
                  <div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',background:'linear-gradient(180deg,transparent,#c9a84c,transparent)'}}/>
                )}
                <div style={{display:'flex',alignItems:'flex-start',gap:'12px',paddingLeft: update.type==='new_work' ? '8px' : '0'}}>
                  <div style={{flexShrink:0,marginTop:'2px'}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(201,168,76,0.6)" style={{filter:'drop-shadow(0 0 3px rgba(201,168,76,0.3))'}}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    {update.type==='new_work' ? (
                      <>
                        <span style={{display:'inline-block',background:'rgba(201,168,76,0.15)',border:'1px solid rgba(201,168,76,0.4)',color:'#c9a84c',fontSize:'clamp(0.45rem,1.2vw,0.55rem)',fontFamily:'Cinzel,serif',letterSpacing:'2px',padding:'2px 8px',borderRadius:'1px',marginBottom:'6px'}}>НОВАЯ РАБОТА</span>
                        <p style={{color:'rgba(201,168,76,0.85)',fontFamily:'Georgia,serif',fontSize:'clamp(0.8rem,2vw,0.92rem)',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                        <p style={{color:'rgba(201,168,76,0.35)',fontSize:'clamp(0.6rem,1.5vw,0.68rem)',fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                          {new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{color:'rgba(201,168,76,0.7)',fontFamily:'Georgia,serif',fontSize:'clamp(0.8rem,2vw,0.92rem)',marginBottom:'4px',fontWeight:'600'}}>{update.work_title}</p>
                        <p style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.65rem,1.5vw,0.72rem)',marginBottom:'4px',fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                          {update.chapter_number} глава{update.chapter_title&&` · ${update.chapter_title}`}
                        </p>
                        <p style={{color:'rgba(201,168,76,0.25)',fontSize:'clamp(0.58rem,1.3vw,0.63rem)',fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                          {new Date(update.published_date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}
                        </p>
                      </>
                    )}
                  </div>
                  <div style={{flexShrink:0,color:'rgba(201,168,76,0.25)',fontSize:'0.7rem',alignSelf:'center'}}>→</div>
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
      <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-30 overflow-y-auto shadow-2xl" style={{
        background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
        borderLeft:'1px solid rgba(180,100,255,0.25)',
        boxShadow:'-5px 0 60px rgba(147,50,255,0.15)'
      }}>
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes rpTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.55;}}
          @keyframes rpShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
          .rp-dark-scroll::-webkit-scrollbar{width:4px;}
          .rp-dark-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
          .rp-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
          .rp-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
          .rp-btn-dark{transition:all 0.2s;}
          .rp-btn-dark:hover{border-color:rgba(179,231,239,0.8)!important;box-shadow:0 0 20px rgba(179,231,239,0.4)!important;transform:translateY(-2px);}
        `}}/>

        {/* Верхняя линия */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
          background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>

        {/* Звёзды */}
        <div style={{position:'fixed',top:0,right:0,width:'inherit',height:'100%',pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,0.35) 0%,transparent 100%),
            radial-gradient(1px 1px at 80% 8%,rgba(255,255,255,0.25) 0%,transparent 100%),
            radial-gradient(1px 1px at 55% 70%,rgba(255,255,255,0.2) 0%,transparent 100%),
            radial-gradient(1px 1px at 90% 55%,rgba(255,255,255,0.15) 0%,transparent 100%),
            radial-gradient(1px 1px at 20% 90%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
          animation:'rpTwinkle 6s ease-in-out infinite',zIndex:0}}/>

        {/* Шапка */}
        <div style={{
          padding:'clamp(16px,3vw,24px) clamp(14px,3vw,22px)',
          paddingBottom:'clamp(12px,2vw,18px)',
          borderBottom:'1px solid rgba(147,112,219,0.15)',
          position:'relative',zIndex:2,flexShrink:0,
          background:'rgba(147,50,255,0.08)'
        }}>
          <button onClick={()=>setShowReaderPanel(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
            borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
            color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'14px',zIndex:10
          }}>✕</button>

          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'clamp(0.8rem,2vw,1rem)',color:'rgba(180,100,255,0.4)',marginBottom:'8px'}}>✦</div>
            <div style={{
              fontFamily:'ppelganger, Georgia, serif',
              fontSize:'clamp(1.6rem,5vw,2.8rem)',
              background:'linear-gradient(90deg,#b3e7ef 0%,#ef01cb 50%,#9370db 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              animation:'rpShimmer 3s linear infinite',
              marginBottom:'10px',lineHeight:'1.2'
            }}>{userProfile.nickname}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
              <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
              <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
              <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="rp-dark-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)',position:'relative',zIndex:1}}>

          {/* Обновления */}
          <button onClick={()=>{setShowUpdatesModal(true);loadSiteUpdates();}} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:siteUpdates.length>0?'rgba(239,1,203,0.12)':'rgba(147,112,219,0.08)',
            border:siteUpdates.length>0?'1px solid rgba(239,1,203,0.5)':'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
            boxShadow:siteUpdates.length>0?'0 0 15px rgba(239,1,203,0.2)':'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={siteUpdates.length>0?'#ef01cb':'#9370db'} strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:siteUpdates.length>0?'#ef01cb':'rgba(200,185,230,0.7)'}}>
              {t.updates}
            </span>
          </button>

          {/* Моя коллекция */}
          <Link href="/collection" className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <Heart size={16} style={{color:'#9370db',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(200,185,230,0.7)'}}>
              {t.myCollection}
            </span>
          </Link>

          {/* Мои сообщения */}
          <Link href="/my-messages" className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <MessageSquare size={16} style={{color:'#9370db',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(200,185,230,0.7)'}}>
              {t.myMessages}
            </span>
          </Link>

          {/* Настройки */}
          <button onClick={()=>setShowManagementModal(true)} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.08)',border:'1px solid rgba(147,112,219,0.25)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <Settings size={16} style={{color:'#9370db',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(200,185,230,0.7)'}}>
              {t.settings}
            </span>
          </button>

          {/* Разделитель */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'2px 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
            <span style={{color:'rgba(180,100,255,0.25)',fontSize:'0.5rem',letterSpacing:'3px'}}>✦ · · · ✦</span>
            <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
          </div>

          {/* Выход */}
          <button onClick={handleLogout} className="rp-btn-dark" style={{
            width:'100%',padding:'clamp(10px,2vw,13px) 16px',
            background:'rgba(147,112,219,0.05)',border:'1px solid rgba(147,112,219,0.15)',
            borderRadius:'6px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <LogOut size={16} style={{color:'rgba(147,112,219,0.5)',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.68rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(180,100,255,0.4)'}}>
              {t.logout}
            </span>
          </button>

        </div>
      </div>
    )}

    {/* СВЕТЛАЯ ПАНЕЛЬ */}
    {!isDarkTheme && (
      <div className="fixed top-0 right-0 h-full w-75 sm:w-90 z-30 overflow-y-auto shadow-2xl" style={{
        background:'#080808',
        borderLeft:'1px solid #2a2218',
        boxShadow:'-5px 0 40px rgba(0,0,0,0.8)'
      }}>
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes rpGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
          .rp-light-scroll::-webkit-scrollbar{width:4px;}
          .rp-light-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
          .rp-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
          .rp-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
          .rp-btn-light{transition:all 0.2s;}
          .rp-btn-light:hover{border-color:rgba(201,168,76,0.5)!important;background:rgba(201,168,76,0.06)!important;}
        `}}/>

        {/* Левая золотая линия */}
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
          background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>

        {/* Фоновый символ */}
        <div style={{position:'fixed',top:'50%',right:'5px',transform:'translateY(-50%)',
          fontFamily:'serif',fontSize:'clamp(8rem,20vw,14rem)',color:'rgba(201,168,76,0.025)',
          pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

        {/* Шапка */}
        <div style={{
          padding:'clamp(16px,3vw,26px) clamp(18px,4vw,28px)',
          paddingBottom:'clamp(12px,2vw,18px)',
          borderBottom:'1px solid rgba(201,168,76,0.1)',
          position:'relative',zIndex:2,flexShrink:0
        }}>
          <button onClick={()=>setShowReaderPanel(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
            borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
            color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'14px',zIndex:10
          }}>✕</button>

          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.6rem,5vw,2.8rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'rpGold 4s linear infinite',letterSpacing:'3px',marginBottom:'10px',lineHeight:'1.2'}}>
            {userProfile.nickname}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="rp-light-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)',position:'relative',zIndex:1}}>

          {/* Обновления */}
          <button onClick={()=>{setShowUpdatesModal(true);loadSiteUpdates();}} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:siteUpdates.length>0?'rgba(201,168,76,0.1)':'transparent',
            border:siteUpdates.length>0?'1px solid rgba(201,168,76,0.55)':'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={siteUpdates.length>0?'#c9a84c':'rgba(201,168,76,0.45)'} strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:siteUpdates.length>0?'#c9a84c':'rgba(201,168,76,0.5)'}}>
              {t.updates}
            </span>
          </button>

          {/* Моя коллекция */}
          <Link href="/collection" className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <Heart size={15} style={{color:'rgba(201,168,76,0.5)',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.5)'}}>
              {t.myCollection}
            </span>
          </Link>

          {/* Мои сообщения */}
          <Link href="/my-messages" className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',textDecoration:'none'
          }}>
            <MessageSquare size={15} style={{color:'rgba(201,168,76,0.5)',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.5)'}}>
              {t.myMessages}
            </span>
          </Link>

          {/* Настройки */}
          <button onClick={()=>setShowManagementModal(true)} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <Settings size={15} style={{color:'rgba(201,168,76,0.5)',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.5)'}}>
              {t.settings}
            </span>
          </button>

          {/* Разделитель */}
          <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'2px 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
            <span style={{color:'rgba(201,168,76,0.25)',fontSize:'0.55rem',letterSpacing:'3px',fontFamily:'serif'}}>· ⚜ ·</span>
            <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
          </div>

          {/* Выход */}
          <button onClick={handleLogout} className="rp-btn-light" style={{
            width:'100%',padding:'clamp(10px,2vw,12px) 16px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.1)',
            borderRadius:'2px',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'
          }}>
            <LogOut size={15} style={{color:'rgba(201,168,76,0.3)',flexShrink:0}}/>
            <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.5vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',
              color:'rgba(201,168,76,0.3)'}}>
              {t.logout}
            </span>
          </button>

        </div>
      </div>
    )}
  </>
)}

{/* МОДАЛЬНОЕ ОКНО НАСТРОЕК (ДЛЯ ЧИТАТЕЛЕЙ) */}
{showManagementModal && !isAdmin && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(10px)'
  }}>
 <style dangerouslySetInnerHTML={{__html:`
  @keyframes settingsTwinkle { 0%,100% { opacity:0.12; } 50% { opacity:0.55; } }
  @keyframes settingsGoldShimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }

  .settings-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .settings-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .settings-scroll-dark::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #9370db, #ef01cb, #9370db);
    border-radius: 10px;
    box-shadow: 0 0 8px rgba(147,112,219,0.8);
  }
  .settings-scroll-dark::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #b48dc4, #ef01cb, #b48dc4);
    box-shadow: 0 0 12px rgba(180,100,255,1);
  }
  .settings-scroll-light::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, transparent, #c9a84c, transparent);
    border-radius: 10px;
    box-shadow: 0 0 6px rgba(201,168,76,0.5);
  }
  .settings-scroll-light::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, transparent, #f0d080, transparent);
    box-shadow: 0 0 10px rgba(201,168,76,0.8);
  }
  /* Firefox */
  .settings-scroll-dark { scrollbar-width: thin; scrollbar-color: #9370db transparent; }
  .settings-scroll-light { scrollbar-width: thin; scrollbar-color: #c9a84c transparent; }
`}}/>

    {isDarkTheme ? (
      /* ═══════ ТЁМНАЯ ТЕМА — МИСТИКА ═══════ */
 <div style={{
  background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 85%)',
  border: '1px solid rgba(180,100,255,0.25)',
  boxShadow: '0 0 60px rgba(147,50,255,0.15)',
  borderRadius: '14px',
  width: '92vw',
  maxWidth: '360px',
  maxHeight: 'min(85vh, 640px)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative'
}}>
  {/* Верхняя линия */}
  <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', borderRadius:'14px 14px 0 0',
    background:'linear-gradient(90deg, transparent, #9370db, #ef01cb, transparent)', zIndex:3, flexShrink:0 }}/>
  
  {/* Скроллируемое содержимое */}
  <div className="settings-scroll settings-scroll-dark" style={{ overflowY:'auto', padding:'clamp(14px,4vw,28px) clamp(12px,4vw,24px)', paddingTop:'clamp(18px,4vw,32px)' }}>
    {/* Звёзды */}
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
      backgroundImage:`radial-gradient(1px 1px at 8% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 85% 10%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 45% 80%, rgba(255,255,255,0.2) 0%, transparent 100%),
        radial-gradient(1px 1px at 92% 65%, rgba(255,255,255,0.25) 0%, transparent 100%)`,
      animation:'settingsTwinkle 5s ease-in-out infinite' }}/>

    {/* Закрыть */}
    <button onClick={() => setShowManagementModal(false)} style={{
      position:'absolute', top:'10px', right:'10px',
      background:'rgba(180,100,255,0.1)', border:'1px solid rgba(180,100,255,0.3)',
      borderRadius:'50%', width:'26px', height:'26px', cursor:'pointer',
      color:'rgba(180,100,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'13px', zIndex:10, flexShrink:0
    }}>✕</button>

    {/* Заголовок */}
    <div style={{ textAlign:'center', marginBottom:'clamp(14px,3vw,24px)', position:'relative', zIndex:1 }}>
      <div style={{ fontSize:'clamp(1rem,3vw,1.4rem)', color:'rgba(180,100,255,0.4)', marginBottom:'4px' }}>✦</div>
      <div style={{
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.85rem,3vw,1.1rem)', letterSpacing:'clamp(3px,1vw,6px)',
        background:'linear-gradient(90deg, #b3e7ef, #ef01cb, #9370db)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
      }}>Настройки</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'6px' }}>
        <div style={{ height:'1px', width:'35px', background:'linear-gradient(90deg, transparent, rgba(147,112,219,0.4))' }}/>
        <span style={{ color:'rgba(180,100,255,0.3)', fontSize:'0.5rem', letterSpacing:'4px' }}>✦ · · · ✦</span>
        <div style={{ height:'1px', width:'35px', background:'linear-gradient(270deg, transparent, rgba(147,112,219,0.4))' }}/>
      </div>
    </div>

    <div style={{ display:'flex', flexDirection:'column', gap:'clamp(6px,1.5vw,10px)', position:'relative', zIndex:1 }}>

      {/* Рассылка */}
      <button onClick={() => { setShowNewsletterModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,13px) 12px',
        background: isSubscribed ? 'rgba(179,231,239,0.12)' : 'rgba(147,112,219,0.1)',
        border: isSubscribed ? '1px solid rgba(179,231,239,0.5)' : '1px solid rgba(147,112,219,0.3)',
        borderRadius:'5px', cursor:'pointer', color:'#e8d5ff',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.7rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        boxShadow: isSubscribed ? '0 0 15px rgba(179,231,239,0.2)' : 'none', transition:'all 0.2s'
      }}>
        {isSubscribed ? '✦ Рассылка активна' : 'Подписка на рассылку'}
      </button>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', margin:'2px 0' }}>
        <div style={{ flex:1, height:'1px', background:'rgba(147,112,219,0.15)' }}/>
        <span style={{ color:'rgba(180,100,255,0.25)', fontSize:'0.5rem', letterSpacing:'3px' }}>· · ·</span>
        <div style={{ flex:1, height:'1px', background:'rgba(147,112,219,0.15)' }}/>
      </div>

      {/* Сменить email */}
      <button onClick={() => { setShowChangeEmailModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,13px) 12px',
        background:'rgba(147,112,219,0.08)', border:'1px solid rgba(147,112,219,0.2)',
        borderRadius:'5px', cursor:'pointer', color:'rgba(200,185,230,0.7)',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.7rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        transition:'all 0.2s'
      }}>Сменить email</button>

      {/* Сменить пароль */}
      <button onClick={() => { setShowChangePasswordModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,13px) 12px',
        background:'rgba(147,112,219,0.08)', border:'1px solid rgba(147,112,219,0.2)',
        borderRadius:'5px', cursor:'pointer', color:'rgba(200,185,230,0.7)',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.7rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        transition:'all 0.2s'
      }}>Сменить пароль</button>

      {/* Удалить */}
      <button onClick={() => { setShowDeleteAccountModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,13px) 12px',
        background:'rgba(147,112,219,0.05)', border:'1px solid rgba(147,112,219,0.15)',
        borderRadius:'5px', cursor:'pointer', color:'rgba(200,185,230,0.45)',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.7rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        transition:'all 0.2s'
      }}>Удалить профиль</button>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', margin:'2px 0' }}>
        <div style={{ flex:1, height:'1px', background:'rgba(147,112,219,0.15)' }}/>
        <span style={{ color:'rgba(180,100,255,0.25)', fontSize:'0.5rem', letterSpacing:'3px' }}>✦ · · · ✦</span>
        <div style={{ flex:1, height:'1px', background:'rgba(147,112,219,0.15)' }}/>
      </div>

      {/* Тема */}
      <div>
        <p style={{ color:'rgba(180,100,255,0.4)', fontSize:'clamp(0.5rem,1.3vw,0.6rem)', letterSpacing:'3px',
          textTransform:'uppercase', fontFamily:'Cinzel, serif', textAlign:'center', marginBottom:'8px' }}>
          Интерфейс сайта
        </p>
        <button onClick={toggleTheme} className="w-full relative rounded-full overflow-hidden transition-all duration-300" style={{
          background:'radial-gradient(ellipse at center, #1a0033 0%, #000000 100%)',
          border:'1px solid rgba(147,51,234,0.5)',
          boxShadow:'0 0 20px rgba(147,51,234,0.15)',
          padding:'clamp(8px,2vw,14px) 16px'
        }}>
          {[...Array(10)].map((_,i) => (
            <div key={i} style={{
              position:'absolute', width:'2px', height:'2px',
              background: i%2===0 ? '#9333ea' : '#a855f7', borderRadius:'50%',
              boxShadow:`0 0 5px ${i%2===0 ? '#9333ea' : '#a855f7'}`,
              left:`${10+i*8}%`, top:`${20+(i%3)*25}%`,
              animation:'settingsTwinkle 3s ease-in-out infinite',
              animationDelay:`${i*0.2}s`, pointerEvents:'none'
            }}/>
          ))}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <span style={{ color:'#c084fc', fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.7rem)', letterSpacing:'2px' }}>HD 189733</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,0.2)" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
          </div>
        </button>
      </div>

    </div>
  </div>
</div>

    ) : (
      /* ═══════ СВЕТЛАЯ ТЕМА — ЗОЛОТО ═══════ */
<div style={{
  background: '#080808',
  border: '1px solid #2a2218',
  borderRadius: '4px',
  width: '92vw',
  maxWidth: '360px',
 maxHeight: 'min(85vh, 640px)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden'
}}>
  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px',
    background:'linear-gradient(180deg, transparent, #c9a84c, transparent)', zIndex:2 }}/>
  <div style={{ position:'absolute', top:'50%', right:'5px', transform:'translateY(-50%)',
    fontFamily:'serif', fontSize:'clamp(6rem,15vw,12rem)', color:'rgba(201,168,76,0.03)',
    pointerEvents:'none', userSelect:'none', lineHeight:1, zIndex:0 }}>⚜</div>

  <div className="settings-scroll settings-scroll-light" style={{ overflowY:'auto', padding:'clamp(14px,4vw,28px) clamp(14px,4vw,32px)', paddingTop:'clamp(16px,4vw,28px)', position:'relative', zIndex:1 }}>

    <button onClick={() => setShowManagementModal(false)} style={{
      position:'absolute', top:'10px', right:'10px',
      background:'transparent', border:'1px solid rgba(201,168,76,0.25)',
      borderRadius:'50%', width:'26px', height:'26px', cursor:'pointer',
      color:'rgba(201,168,76,0.6)', display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'13px', zIndex:10
    }}>✕</button>

    {/* Заголовок */}
    <div style={{ marginBottom:'clamp(14px,3vw,22px)' }}>
      <div style={{
        fontFamily:"'victiriya', Georgia, serif", fontSize:'clamp(1.3rem,5vw,2rem)',
        backgroundImage:'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 100%)',
        backgroundSize:'200% auto', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        animation:'settingsGoldShimmer 4s linear infinite', letterSpacing:'3px', marginBottom:'8px'
      }}>Настройки</div>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ height:'1px', flex:1, background:'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }}/>
        <span style={{ color:'rgba(201,168,76,0.4)', fontSize:'0.65rem', letterSpacing:'4px', fontFamily:'serif' }}>⚜ · · ⚜</span>
      </div>
    </div>

    <div style={{ display:'flex', flexDirection:'column', gap:'clamp(6px,1.5vw,10px)' }}>

      {/* Рассылка */}
      <button onClick={() => { setShowNewsletterModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,12px) 12px',
        background: isSubscribed ? 'rgba(201,168,76,0.12)' : 'transparent',
        border: isSubscribed ? '1px solid rgba(201,168,76,0.6)' : '1px solid rgba(201,168,76,0.25)',
        borderRadius:'2px', cursor:'pointer',
        color: isSubscribed ? '#c9a84c' : 'rgba(201,168,76,0.55)',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.68rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        transition:'all 0.2s'
      }}>
        {isSubscribed ? '⚜ Рассылка активна' : 'Подписка на рассылку'}
      </button>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', margin:'2px 0' }}>
        <div style={{ flex:1, height:'1px', background:'rgba(201,168,76,0.12)' }}/>
        <span style={{ color:'rgba(201,168,76,0.25)', fontSize:'0.55rem', letterSpacing:'3px', fontFamily:'serif' }}>· ⚜ ·</span>
        <div style={{ flex:1, height:'1px', background:'rgba(201,168,76,0.12)' }}/>
      </div>

      {/* Сменить email */}
      <button onClick={() => { setShowChangeEmailModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,12px) 12px',
        background:'transparent', border:'1px solid rgba(201,168,76,0.2)',
        borderRadius:'2px', cursor:'pointer', color:'rgba(201,168,76,0.5)',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.68rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        transition:'all 0.2s'
      }}>Сменить email</button>

      {/* Сменить пароль */}
      <button onClick={() => { setShowChangePasswordModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,12px) 12px',
        background:'transparent', border:'1px solid rgba(201,168,76,0.2)',
        borderRadius:'2px', cursor:'pointer', color:'rgba(201,168,76,0.5)',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.68rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        transition:'all 0.2s'
      }}>Сменить пароль</button>

      {/* Удалить */}
      <button onClick={() => { setShowDeleteAccountModal(true); setShowManagementModal(false); }} style={{
        width:'100%', padding:'clamp(9px,2vw,12px) 12px',
        background:'transparent', border:'1px solid rgba(201,168,76,0.1)',
        borderRadius:'2px', cursor:'pointer', color:'rgba(201,168,76,0.3)',
        fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.68rem)', letterSpacing:'clamp(1px,0.5vw,3px)', textTransform:'uppercase',
        transition:'all 0.2s'
      }}>Удалить профиль</button>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', margin:'2px 0' }}>
        <div style={{ flex:1, height:'1px', background:'rgba(201,168,76,0.12)' }}/>
        <span style={{ color:'rgba(201,168,76,0.2)', fontSize:'0.55rem', letterSpacing:'3px', fontFamily:'serif' }}>· ⚜ ·</span>
        <div style={{ flex:1, height:'1px', background:'rgba(201,168,76,0.12)' }}/>
      </div>

      {/* Тема */}
      <div>
        <p style={{ color:'rgba(201,168,76,0.35)', fontSize:'clamp(0.5rem,1.3vw,0.6rem)', letterSpacing:'3px',
          textTransform:'uppercase', fontFamily:'Cinzel, serif', marginBottom:'8px' }}>
          Интерфейс сайта
        </p>
        <button onClick={toggleTheme} style={{
          width:'100%', position:'relative', padding:'clamp(8px,2vw,14px) 16px',
          background:'#000000', border:'1px solid rgba(201,168,76,0.3)',
          borderRadius:'2px', overflow:'hidden', cursor:'pointer',
          boxShadow:'0 0 10px rgba(201,168,76,0.06)'
        }}>
          {[1,2,3].map((_,i) => (
            <div key={i} style={{
              position:'absolute', width:`${80+i*20}px`, height:`${80+i*20}px`,
              background:`radial-gradient(circle, rgba(114,17,49,${0.5+i*0.1}) 0%, transparent 70%)`,
              borderRadius:'40% 60% 70% 30%', filter:'blur(10px)',
              animation:`plasmaMove${i+1} ${7+i*2}s ease-in-out infinite`,
              pointerEvents:'none', top:`${10+i*15}%`, left:`${15+i*20}%`
            }}/>
          ))}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ color:'rgba(201,168,76,0.7)', fontFamily:'Cinzel, serif', fontSize:'clamp(0.55rem,1.5vw,0.68rem)', letterSpacing:'2px' }}>Лилия и Роза</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              </svg>
            </div>
          </div>
        </button>
      </div>

    </div>
  </div>
</div>
    )}
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

      {/* ПАНЕЛЬ ИНСТРУМЕНТОВ */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => applyTextFormat('bold')}
          className="px-3 py-2 rounded font-bold text-white"
          style={{
            background: textFormatState.bold ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
            border: '1px solid #dc2626'
          }}
        >
          B
        </button>
        <button
          onClick={() => applyTextFormat('italic')}
          className="px-3 py-2 rounded italic text-white"
          style={{
            background: textFormatState.italic ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
            border: '1px solid #dc2626'
          }}
        >
          I
        </button>
        <button
          onClick={() => applyTextFormat('underline')}
          className="px-3 py-2 rounded underline text-white"
          style={{
            background: textFormatState.underline ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
            border: '1px solid #dc2626'
          }}
        >
          U
        </button>
        
        <div className="flex-1" />
        
        <button 
          onClick={() => setTextAlignment('left')} 
          className="px-3 py-2 rounded text-white"
          style={{ 
            background: textFormatState.align === 'left' ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
            border: '1px solid #dc2626'
          }}
          title="По левому краю"
        >
          ⬅
        </button>
        <button 
          onClick={() => setTextAlignment('center')} 
          className="px-3 py-2 rounded text-white"
          style={{ 
            background: textFormatState.align === 'center' ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
            border: '1px solid #dc2626'
          }}
          title="По центру"
        >
          ↕
        </button>
        <button 
          onClick={() => setTextAlignment('right')} 
          className="px-3 py-2 rounded text-white"
          style={{ 
            background: textFormatState.align === 'right' ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
            border: '1px solid #dc2626'
          }}
          title="По правому краю"
        >
          ➡
        </button>
      </div>

      <textarea
        id="text-editor-textarea"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        rows={12}
        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 mb-4 text-sm sm:text-base focus:outline-none focus:border-red-600 text-white resize-none"
        placeholder="Введите текст..."
        style={{
          textAlign: textFormatState.align,
          whiteSpace: 'pre-wrap'
        }}
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
  <label className="block text-gray-300 text-sm mb-2">Обложка</label>
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      if (file.size > 2 * 1024 * 1024) {
        showConfirm('Файл слишком большой! Максимум 2MB');
        return;
      }
      
      try {
        // Генерируем уникальное имя файла
        const fileName = `popular-${editingPopularIndex + 1}-${Date.now()}.${file.name.split('.').pop()}`;
        
        // Загружаем в Supabase Storage
        const { data, error } = await supabase.storage
          .from('covers')
          .upload(`popular/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) throw error;
        
        // Получаем публичный URL
        const { data: urlData } = supabase.storage
          .from('covers')
          .getPublicUrl(`popular/${fileName}`);
        
        setEditPopularForm({...editPopularForm, cover_url: urlData.publicUrl});
        showConfirm('Обложка загружена!');
      } catch (err) {
        showConfirm('Ошибка загрузки: ' + err.message);
      }
    }}
    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-red-600"
  />
  {editPopularForm.cover_url && (
    <img src={editPopularForm.cover_url} alt="Preview" className="mt-2 w-32 h-auto rounded" />
  )}
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

{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
{showConfirmModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(10px)'
  }}>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes confirmTwinkle { 0%,100% { opacity:0.15; } 50% { opacity:0.6; } }
      @keyframes confirmGoldShimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    `}} />
    {isDarkTheme ? (
      <div style={{
        background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 80%)',
        border: '1px solid rgba(180,100,255,0.25)',
        boxShadow: '0 0 60px rgba(147,50,255,0.2)',
        borderRadius: '12px',
        width: '100%', maxWidth: '420px',
        padding: '32px 28px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(90deg, transparent, #9370db, #ef01cb, transparent)' }}/>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 20%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 75%, rgba(255,255,255,0.15) 0%, transparent 100%)`,
          animation:'confirmTwinkle 4s ease-in-out infinite' }}/>

        <div style={{ fontSize:'1.5rem', marginBottom:'8px', color:'rgba(180,100,255,0.5)' }}>✦</div>
        <p style={{ color:'#e8d5ff', fontSize:'1rem', lineHeight:'1.7', marginBottom:'8px',
          fontFamily:'Georgia, serif', fontStyle:'italic', position:'relative', zIndex:1 }}>
          {confirmMessage}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'24px' }}>
          <div style={{ height:'1px', width:'30px', background:'rgba(147,112,219,0.3)' }}/>
          <span style={{ color:'rgba(180,100,255,0.3)', fontSize:'0.6rem', letterSpacing:'4px' }}>· · ·</span>
          <div style={{ height:'1px', width:'30px', background:'rgba(147,112,219,0.3)' }}/>
        </div>

        <div className="flex gap-3" style={{ position:'relative', zIndex:1 }}>
          {confirmAction ? (
            <>
              <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
                flex:1, padding:'10px',
                background:'rgba(147,112,219,0.2)',
                border:'1px solid rgba(147,112,219,0.6)',
                color:'#d8b4fe',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'4px',
                boxShadow:'0 0 15px rgba(147,112,219,0.2)'
              }}>✦ Да</button>
              <button onClick={() => setShowConfirmModal(false)} style={{
                flex:1, padding:'10px',
                background:'transparent',
                border:'1px solid rgba(147,112,219,0.25)',
                color:'rgba(180,100,255,0.5)',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'4px'
              }}>Отмена</button>
            </>
          ) : (
            <button onClick={() => setShowConfirmModal(false)} style={{
              width:'100%', padding:'10px',
              background:'rgba(147,112,219,0.15)',
              border:'1px solid rgba(147,112,219,0.5)',
              color:'#d8b4fe',
              fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'4px', textTransform:'uppercase',
              cursor:'pointer', borderRadius:'4px',
              boxShadow:'0 0 15px rgba(147,112,219,0.2)'
            }}>✦ ОК ✦</button>
          )}
        </div>
      </div>
    ) : (
      <div style={{
        background: '#080808',
        border: '1px solid #2a2218',
        borderRadius: '2px',
        width: '100%', maxWidth: '420px',
        padding: '32px 28px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center'
      }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px',
          background:'linear-gradient(180deg, transparent, #c9a84c, transparent)' }}/>
        <div style={{ position:'absolute', top:'50%', right:'20px', transform:'translateY(-50%)',
          fontFamily:'serif', fontSize:'8rem', color:'rgba(201,168,76,0.04)',
          pointerEvents:'none', userSelect:'none', lineHeight:1 }}>⚜</div>

        <div style={{ fontSize:'1.2rem', marginBottom:'8px', color:'rgba(201,168,76,0.5)', fontFamily:'serif' }}>⚜</div>
        <p style={{ color:'#d0c8b8', fontSize:'1rem', lineHeight:'1.7', marginBottom:'8px',
          fontFamily:'Georgia, serif', fontStyle:'italic', position:'relative', zIndex:1 }}>
          {confirmMessage}
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'24px' }}>
          <div style={{ height:'1px', width:'40px', background:'rgba(201,168,76,0.3)' }}/>
          <span style={{ color:'rgba(201,168,76,0.4)', fontSize:'0.7rem', letterSpacing:'4px', fontFamily:'serif' }}>· ⚜ ·</span>
          <div style={{ height:'1px', width:'40px', background:'rgba(201,168,76,0.3)' }}/>
        </div>

        <div className="flex gap-3" style={{ position:'relative', zIndex:1 }}>
          {confirmAction ? (
            <>
              <button onClick={() => { confirmAction(); setShowConfirmModal(false); }} style={{
                flex:1, padding:'10px',
                background:'transparent',
                border:'1px solid rgba(201,168,76,0.6)',
                color:'#c9a84c',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'1px'
              }}>⚜ Да</button>
              <button onClick={() => setShowConfirmModal(false)} style={{
                flex:1, padding:'10px',
                background:'transparent',
                border:'1px solid rgba(201,168,76,0.2)',
                color:'rgba(201,168,76,0.4)',
                fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'3px', textTransform:'uppercase',
                cursor:'pointer', borderRadius:'1px'
              }}>Отмена</button>
            </>
          ) : (
            <button onClick={() => setShowConfirmModal(false)} style={{
              width:'100%', padding:'10px',
              background:'transparent',
              border:'1px solid rgba(201,168,76,0.5)',
              color:'#c9a84c',
              fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'4px', textTransform:'uppercase',
              cursor:'pointer', borderRadius:'1px'
            }}>⚜ ОК ⚜</button>
          )}
        </div>
      </div>
    )}
  </div>
)}

{/* CHANGE EMAIL MODAL - ТЕМНАЯ ТЕМА */}
{showChangeEmailModal && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes ceTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.5;}}
      .ce-dark-scroll::-webkit-scrollbar{width:3px;}
      .ce-dark-scroll::-webkit-scrollbar-track{background:transparent;}
      .ce-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .ce-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
    `}}/>
    <div style={{
      background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
      border:'1px solid rgba(180,100,255,0.25)',
      boxShadow:'0 0 60px rgba(147,50,255,0.15)',
      borderRadius:'14px',
      width:'92vw', maxWidth:'360px',
      maxHeight:'min(85vh,520px)',
      display:'flex', flexDirection:'column',
      position:'relative'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>

      <div className="ce-dark-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,26px) clamp(12px,4vw,22px)',paddingTop:'clamp(16px,4vw,28px)',position:'relative'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 15% 25%,rgba(255,255,255,0.3) 0%,transparent 100%),radial-gradient(1px 1px at 80% 70%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
          animation:'ceTwinkle 5s ease-in-out infinite',zIndex:0}}/>

        <button onClick={()=>{setShowChangeEmailModal(false);setChangeEmailForm({newEmail:'',password:''}); }} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        {/* Заголовок */}
        <div style={{textAlign:'center',marginBottom:'clamp(12px,3vw,20px)',position:'relative',zIndex:1}}>
          <div style={{fontSize:'clamp(1rem,3vw,1.3rem)',color:'rgba(180,100,255,0.4)',marginBottom:'4px'}}>✦</div>
          <div style={{fontFamily:'Cinzel, serif',fontSize:'clamp(0.8rem,3vw,1rem)',letterSpacing:'clamp(3px,1vw,5px)',
            background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Смена email</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'6px'}}>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'3px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
        </div>

        {/* Подписка-примечание */}
        <div style={{background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.15)',borderRadius:'4px',padding:'10px 12px',marginBottom:'16px',position:'relative',zIndex:1}}>
          <p style={{color:'rgba(180,100,255,0.5)',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.6',textAlign:'center'}}>
            Смена почты проходит без дополнительного подтверждения.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,12px)',position:'relative',zIndex:1}}>
          <div>
            <label style={{color:'rgba(180,100,255,0.5)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Новый email</label>
            <input type="email" value={changeEmailForm.newEmail} onChange={e=>setChangeEmailForm({...changeEmailForm,newEmail:e.target.value})} placeholder="новый@email.com"
              style={{width:'100%',background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.25)',borderRadius:'4px',padding:'clamp(8px,2vw,10px) 12px',color:'#e8d5ff',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{color:'rgba(180,100,255,0.5)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Текущий пароль</label>
            <input type="password" value={changeEmailForm.password} onChange={e=>setChangeEmailForm({...changeEmailForm,password:e.target.value})} placeholder="••••••••"
              style={{width:'100%',background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.25)',borderRadius:'4px',padding:'clamp(8px,2vw,10px) 12px',color:'#e8d5ff',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleChangeEmail} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'rgba(147,112,219,0.18)',border:'1px solid rgba(147,112,219,0.6)',borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',boxShadow:'0 0 12px rgba(147,112,219,0.2)',marginTop:'4px'}}>
            ✦ Сменить email
          </button>
          <button onClick={()=>{setShowChangeEmailModal(false);setChangeEmailForm({newEmail:'',password:''}); }} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(147,112,219,0.2)',borderRadius:'4px',cursor:'pointer',color:'rgba(180,100,255,0.4)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* CHANGE EMAIL MODAL - СВЕТЛАЯ ТЕМА */}
{showChangeEmailModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes ceGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .ce-light-scroll::-webkit-scrollbar{width:3px;}
      .ce-light-scroll::-webkit-scrollbar-track{background:transparent;}
      .ce-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .ce-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'360px',
      maxHeight:'min(85vh,520px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',top:'50%',right:'5px',transform:'translateY(-50%)',
        fontFamily:'serif',fontSize:'clamp(6rem,15vw,10rem)',color:'rgba(201,168,76,0.03)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      <div className="ce-light-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,26px) clamp(14px,4vw,28px)',paddingTop:'clamp(16px,4vw,26px)',position:'relative',zIndex:1}}>
        <button onClick={()=>{setShowChangeEmailModal(false);setChangeEmailForm({newEmail:'',password:''}); }} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        <div style={{marginBottom:'clamp(12px,3vw,20px)'}}>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.3rem,5vw,1.9rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'ceGold 4s linear infinite',letterSpacing:'3px',marginBottom:'8px'}}>Смена email</div>
          <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
        </div>

        {/* Примечание */}
        <div style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'10px 12px',marginBottom:'16px'}}>
          <p style={{color:'rgba(201,168,76,0.5)',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.6'}}>
            Смена почты проходит без дополнительного подтверждения.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,12px)'}}>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Новый email</label>
            <input type="email" value={changeEmailForm.newEmail} onChange={e=>setChangeEmailForm({...changeEmailForm,newEmail:e.target.value})} placeholder="новый@email.com"
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.8)',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Текущий пароль</label>
            <input type="password" value={changeEmailForm.password} onChange={e=>setChangeEmailForm({...changeEmailForm,password:e.target.value})} placeholder="••••••••"
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.8)',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleChangeEmail} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.6)',borderRadius:'2px',cursor:'pointer',color:'#c9a84c',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',marginTop:'4px'}}>
            ⚜ Сменить email
          </button>
          <button onClick={()=>{setShowChangeEmailModal(false);setChangeEmailForm({newEmail:'',password:''}); }} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',cursor:'pointer',color:'rgba(201,168,76,0.35)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* CHANGE PASSWORD MODAL - ТЕМНАЯ ТЕМА */}
{showChangePasswordModal && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes cpTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.5;}}
      .cp-dark-scroll::-webkit-scrollbar{width:3px;}
      .cp-dark-scroll::-webkit-scrollbar-track{background:transparent;}
      .cp-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .cp-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
    `}}/>
    <div style={{
      background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
      border:'1px solid rgba(180,100,255,0.25)',
      boxShadow:'0 0 60px rgba(147,50,255,0.15)',
      borderRadius:'14px',
      width:'92vw',maxWidth:'360px',
      maxHeight:'min(85vh,560px)',
      display:'flex',flexDirection:'column',
      position:'relative'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>

      <div className="cp-dark-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,26px) clamp(12px,4vw,22px)',paddingTop:'clamp(16px,4vw,28px)',position:'relative'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 15% 25%,rgba(255,255,255,0.3) 0%,transparent 100%),radial-gradient(1px 1px at 80% 70%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
          animation:'cpTwinkle 5s ease-in-out infinite',zIndex:0}}/>

        <button onClick={()=>{setShowChangePasswordModal(false);setChangePasswordForm({currentPassword:'',newPassword:''}); }} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        <div style={{textAlign:'center',marginBottom:'clamp(12px,3vw,20px)',position:'relative',zIndex:1}}>
          <div style={{fontSize:'clamp(1rem,3vw,1.3rem)',color:'rgba(180,100,255,0.4)',marginBottom:'4px'}}>✦</div>
          <div style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.8rem,3vw,1rem)',letterSpacing:'clamp(3px,1vw,5px)',
            background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Смена пароля</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'6px'}}>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'3px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
        </div>

        {/* Примечание */}
        <div style={{background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.15)',borderRadius:'4px',padding:'10px 12px',marginBottom:'16px',position:'relative',zIndex:1}}>
          <p style={{color:'rgba(180,100,255,0.5)',fontSize:'clamp(0.52rem,1.2vw,0.62rem)',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.7',textAlign:'center'}}>
            Смена пароля проходит без подтверждения по почте.
            <br/>
            <span style={{color:'rgba(180,100,255,0.35)',fontSize:'clamp(0.5rem,1.1vw,0.58rem)'}}>
              Если вы потеряли доступ к почте — напишите на{' '}
              <span style={{color:'#b3e7ef',textDecoration:'underline'}}>mellostory@protonmail.com</span>{' '}
              и я помогу вернуть доступ.
            </span>
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,12px)',position:'relative',zIndex:1}}>
          <div>
            <label style={{color:'rgba(180,100,255,0.5)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Текущий пароль</label>
            <input type="password" value={changePasswordForm.currentPassword} onChange={e=>setChangePasswordForm({...changePasswordForm,currentPassword:e.target.value})} placeholder="••••••••"
              style={{width:'100%',background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.25)',borderRadius:'4px',padding:'clamp(8px,2vw,10px) 12px',color:'#e8d5ff',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{color:'rgba(180,100,255,0.5)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Новый пароль</label>
            <input type="password" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm,newPassword:e.target.value})} placeholder="••••••••"
              style={{width:'100%',background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.25)',borderRadius:'4px',padding:'clamp(8px,2vw,10px) 12px',color:'#e8d5ff',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleChangePassword} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'rgba(147,112,219,0.18)',border:'1px solid rgba(147,112,219,0.6)',borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',boxShadow:'0 0 12px rgba(147,112,219,0.2)',marginTop:'4px'}}>
            ✦ Сменить пароль
          </button>
          <button onClick={()=>{setShowChangePasswordModal(false);setChangePasswordForm({currentPassword:'',newPassword:''}); }} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(147,112,219,0.2)',borderRadius:'4px',cursor:'pointer',color:'rgba(180,100,255,0.4)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* CHANGE PASSWORD MODAL - СВЕТЛАЯ ТЕМА */}
{showChangePasswordModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes cpGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .cp-light-scroll::-webkit-scrollbar{width:3px;}
      .cp-light-scroll::-webkit-scrollbar-track{background:transparent;}
      .cp-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .cp-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'360px',
      maxHeight:'min(85vh,560px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',top:'50%',right:'5px',transform:'translateY(-50%)',
        fontFamily:'serif',fontSize:'clamp(6rem,15vw,10rem)',color:'rgba(201,168,76,0.03)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      <div className="cp-light-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,26px) clamp(14px,4vw,28px)',paddingTop:'clamp(16px,4vw,26px)',position:'relative',zIndex:1}}>
        <button onClick={()=>{setShowChangePasswordModal(false);setChangePasswordForm({currentPassword:'',newPassword:''}); }} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        <div style={{marginBottom:'clamp(12px,3vw,18px)'}}>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.3rem,5vw,1.9rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'cpGold 4s linear infinite',letterSpacing:'3px',marginBottom:'8px'}}>Смена пароля</div>
          <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
        </div>

        {/* Примечание */}
        <div style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'10px 12px',marginBottom:'16px'}}>
          <p style={{color:'rgba(201,168,76,0.5)',fontSize:'clamp(0.52rem,1.2vw,0.62rem)',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:'1.7'}}>
            Смена пароля проходит без подтверждения по почте.
            <br/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'clamp(0.5rem,1.1vw,0.58rem)'}}>
              Если вы потеряли доступ к почте — напишите на{' '}
              <span style={{color:'#c9a84c',textDecoration:'underline'}}>mellostory@protonmail.com</span>{' '}
              и я помогу вернуть доступ.
            </span>
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,12px)'}}>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Текущий пароль</label>
            <input type="password" value={changePasswordForm.currentPassword} onChange={e=>setChangePasswordForm({...changePasswordForm,currentPassword:e.target.value})} placeholder="••••••••"
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.8)',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{color:'rgba(201,168,76,0.4)',fontSize:'clamp(0.5rem,1.3vw,0.6rem)',letterSpacing:'2px',fontFamily:'Cinzel,serif',textTransform:'uppercase',display:'block',marginBottom:'5px'}}>Новый пароль</label>
            <input type="password" value={changePasswordForm.newPassword} onChange={e=>setChangePasswordForm({...changePasswordForm,newPassword:e.target.value})} placeholder="••••••••"
              style={{width:'100%',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.2)',borderRadius:'2px',padding:'clamp(8px,2vw,10px) 12px',color:'rgba(201,168,76,0.8)',fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleChangePassword} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.6)',borderRadius:'2px',cursor:'pointer',color:'#c9a84c',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',marginTop:'4px'}}>
            ⚜ Сменить пароль
          </button>
          <button onClick={()=>{setShowChangePasswordModal(false);setChangePasswordForm({currentPassword:'',newPassword:''}); }} style={{width:'100%',padding:'clamp(9px,2vw,11px)',background:'transparent',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',cursor:'pointer',color:'rgba(201,168,76,0.35)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* CALENDAR MODAL - ТЕМНАЯ ТЕМА */}
{showCalendarModal && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes calTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.55;}}
      .cal-dark-scroll::-webkit-scrollbar{width:4px;}
      .cal-dark-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .cal-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .cal-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
      .cal-day-btn:hover{border-color:#ef01cb !important;box-shadow:0 0 12px rgba(239,1,203,0.4) !important;}
    `}}/>
    <div style={{
      background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
      border:'1px solid rgba(180,100,255,0.25)',
      boxShadow:'0 0 60px rgba(147,50,255,0.15)',
      borderRadius:'14px',
      width:'92vw',maxWidth:'600px',
      maxHeight:'min(88vh,640px)',
      display:'flex',flexDirection:'column',
      position:'relative'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3,flexShrink:0}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',borderRadius:'14px',
        backgroundImage:`radial-gradient(1px 1px at 5% 10%,rgba(255,255,255,0.3) 0%,transparent 100%),
          radial-gradient(1px 1px at 90% 8%,rgba(255,255,255,0.25) 0%,transparent 100%),
          radial-gradient(1px 1px at 70% 90%,rgba(255,255,255,0.2) 0%,transparent 100%),
          radial-gradient(1px 1px at 15% 85%,rgba(255,255,255,0.15) 0%,transparent 100%)`,
        animation:'calTwinkle 6s ease-in-out infinite',zIndex:0}}/>

      {/* Шапка */}
      <div style={{padding:'clamp(14px,3vw,22px) clamp(14px,3vw,24px)',paddingBottom:'clamp(10px,2vw,16px)',borderBottom:'1px solid rgba(147,112,219,0.15)',position:'relative',zIndex:2,flexShrink:0}}>
        <button onClick={()=>setShowCalendarModal(false)} style={{
          position:'absolute',top:'12px',right:'12px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'clamp(0.9rem,2.5vw,1.2rem)',color:'rgba(180,100,255,0.4)',marginBottom:'4px'}}>✦</div>
          <div style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.85rem,2.5vw,1.05rem)',letterSpacing:'clamp(3px,1vw,6px)',
            background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Расписание обновлений</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'6px'}}>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',width:'30px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="cal-dark-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',position:'relative',zIndex:1,flex:1}}>
        {/* Навигация по месяцу */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <button onClick={()=>setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))} style={{
            background:'rgba(147,112,219,0.15)',border:'1px solid rgba(147,112,219,0.3)',borderRadius:'6px',
            padding:'6px 12px',cursor:'pointer',color:'#b3e7ef',fontFamily:'Cinzel,serif',fontSize:'0.7rem',letterSpacing:'2px'
          }}>←</button>
          <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.75rem,2vw,0.9rem)',letterSpacing:'3px',
            background:'linear-gradient(90deg,#b3e7ef,#9370db)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            {currentMonth.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}
          </span>
          <button onClick={()=>setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))} style={{
            background:'rgba(147,112,219,0.15)',border:'1px solid rgba(147,112,219,0.3)',borderRadius:'6px',
            padding:'6px 12px',cursor:'pointer',color:'#b3e7ef',fontFamily:'Cinzel,serif',fontSize:'0.7rem',letterSpacing:'2px'
          }}>→</button>
        </div>

        {/* Дни недели */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',marginBottom:'8px'}}>
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day=>(
            <div key={day} style={{textAlign:'center',fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'1px',color:'rgba(147,112,219,0.6)',padding:'4px 0'}}>{day}</div>
          ))}
        </div>

        {/* Календарная сетка */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px'}}>
          {(()=>{
            const {daysInMonth,startingDayOfWeek}=getDaysInMonth(currentMonth);
            const days=[];
            for(let i=0;i<(startingDayOfWeek===0?6:startingDayOfWeek-1);i++){days.push(<div key={`e-${i}`}/>);}
            for(let day=1;day<=daysInMonth;day++){
              const date=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),day);
              const dateKey=date.toISOString().split('T')[0];
              const hasEvents=calendarEvents[dateKey]?.length>0;
              days.push(
                <button key={day} className="cal-day-btn"
                  onClick={()=>{setSelectedDate(date);setShowEventModal(true);}}
                  style={{
                    aspectRatio:'1',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'clamp(0.65rem,1.8vw,0.8rem)',fontFamily:'Georgia,serif',
                    background:hasEvents?'rgba(239,1,203,0.2)':'rgba(147,112,219,0.08)',
                    border:hasEvents?'1px solid rgba(239,1,203,0.6)':'1px solid rgba(147,112,219,0.2)',
                    boxShadow:hasEvents?'0 0 12px rgba(239,1,203,0.3)':'none',
                    color:hasEvents?'#ef01cb':'rgba(200,185,230,0.7)',
                    cursor:'pointer',transition:'all 0.2s'
                  }}
                >{day}</button>
              );
            }
            return days;
          })()}
        </div>

        {!isAdmin&&(
          <div style={{marginTop:'16px',background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.15)',borderRadius:'6px',padding:'10px 14px',textAlign:'center'}}>
            <p style={{color:'rgba(180,100,255,0.5)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.65rem,1.5vw,0.75rem)'}}>
              ✦ Нажмите на дату, чтобы увидеть запланированные события
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* CALENDAR MODAL - СВЕТЛАЯ ТЕМА */}
{showCalendarModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes calGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .cal-light-scroll::-webkit-scrollbar{width:4px;}
      .cal-light-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .cal-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .cal-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
      .cal-day-light:hover{border-color:rgba(201,168,76,0.5)!important;background:rgba(201,168,76,0.08)!important;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'600px',
      maxHeight:'min(88vh,640px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',bottom:'20px',right:'10px',
        fontFamily:'serif',fontSize:'clamp(8rem,20vw,14rem)',color:'rgba(201,168,76,0.025)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      {/* Шапка */}
      <div style={{padding:'clamp(14px,3vw,22px) clamp(18px,4vw,28px)',paddingBottom:'clamp(10px,2vw,14px)',borderBottom:'1px solid rgba(201,168,76,0.1)',position:'relative',zIndex:2,flexShrink:0}}>
        <button onClick={()=>setShowCalendarModal(false)} style={{
          position:'absolute',top:'12px',right:'12px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>
        <div>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.4rem,5vw,2rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'calGold 4s linear infinite',letterSpacing:'3px',marginBottom:'8px'}}>Расписание обновлений</div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="cal-light-scroll" style={{overflowY:'auto',padding:'clamp(12px,3vw,20px)',position:'relative',zIndex:1,flex:1}}>
        {/* Навигация */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <button onClick={()=>setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()-1)))} style={{
            background:'transparent',border:'1px solid rgba(201,168,76,0.3)',borderRadius:'2px',
            padding:'6px 12px',cursor:'pointer',color:'rgba(201,168,76,0.7)',fontFamily:'Cinzel,serif',fontSize:'0.7rem',letterSpacing:'2px'
          }}>←</button>
          <span style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.75rem,2vw,0.9rem)',letterSpacing:'3px',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 50%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'calGold 4s linear infinite'}}>
            {currentMonth.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}
          </span>
          <button onClick={()=>setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth()+1)))} style={{
            background:'transparent',border:'1px solid rgba(201,168,76,0.3)',borderRadius:'2px',
            padding:'6px 12px',cursor:'pointer',color:'rgba(201,168,76,0.7)',fontFamily:'Cinzel,serif',fontSize:'0.7rem',letterSpacing:'2px'
          }}>→</button>
        </div>

        {/* Дни недели */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px',marginBottom:'8px'}}>
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day=>(
            <div key={day} style={{textAlign:'center',fontFamily:'Cinzel,serif',fontSize:'0.6rem',letterSpacing:'1px',color:'rgba(201,168,76,0.4)',padding:'4px 0'}}>{day}</div>
          ))}
        </div>

        {/* Сетка */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px'}}>
          {(()=>{
            const {daysInMonth,startingDayOfWeek}=getDaysInMonth(currentMonth);
            const days=[];
            for(let i=0;i<(startingDayOfWeek===0?6:startingDayOfWeek-1);i++){days.push(<div key={`e-${i}`}/>);}
            for(let day=1;day<=daysInMonth;day++){
              const date=new Date(currentMonth.getFullYear(),currentMonth.getMonth(),day);
              const dateKey=date.toISOString().split('T')[0];
              const hasEvents=calendarEvents[dateKey]?.length>0;
              days.push(
                <button key={day} className="cal-day-light"
                  onClick={()=>{setSelectedDate(date);setShowEventModal(true);}}
                  style={{
                    aspectRatio:'1',borderRadius:'2px',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'clamp(0.65rem,1.8vw,0.8rem)',fontFamily:'Georgia,serif',
                    background:hasEvents?'rgba(201,168,76,0.12)':'rgba(201,168,76,0.03)',
                    border:hasEvents?'1px solid rgba(201,168,76,0.55)':'1px solid rgba(201,168,76,0.12)',
                    boxShadow:hasEvents?'0 0 8px rgba(201,168,76,0.2)':'none',
                    color:hasEvents?'#c9a84c':'rgba(201,168,76,0.45)',
                    cursor:'pointer',transition:'all 0.2s',position:'relative'
                  }}
                >
                  {hasEvents&&<div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',background:'linear-gradient(180deg,transparent,#c9a84c,transparent)'}}/>}
                  {day}
                </button>
              );
            }
            return days;
          })()}
        </div>

        {!isAdmin&&(
          <div style={{marginTop:'16px',background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',padding:'10px 14px',textAlign:'center'}}>
            <p style={{color:'rgba(201,168,76,0.4)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.65rem,1.5vw,0.75rem)'}}>
              ⚜ Нажмите на дату, чтобы увидеть запланированные события
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* EVENT MODAL - для всех пользователей */}
{showEventModal && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes evTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.5;}}
      @keyframes evGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .ev-scroll::-webkit-scrollbar{width:3px;}
      .ev-scroll::-webkit-scrollbar-track{background:transparent;}
      .ev-scroll-dark::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .ev-scroll-light::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;}
      .ev-scroll-dark{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
      .ev-scroll-light{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
    `}}/>

    {isDarkTheme ? (
      <div style={{
        background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
        border:'1px solid rgba(180,100,255,0.25)',
        boxShadow:'0 0 60px rgba(147,50,255,0.15)',
        borderRadius:'14px',
        width:'92vw',maxWidth:'460px',
        maxHeight:'min(85vh,600px)',
        display:'flex',flexDirection:'column',
        position:'relative'
      }}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
          background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',borderRadius:'14px',
          backgroundImage:`radial-gradient(1px 1px at 8% 15%,rgba(255,255,255,0.35) 0%,transparent 100%),
            radial-gradient(1px 1px at 85% 10%,rgba(255,255,255,0.25) 0%,transparent 100%),
            radial-gradient(1px 1px at 50% 80%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
          animation:'evTwinkle 5s ease-in-out infinite',zIndex:0}}/>

        {/* Шапка */}
        <div style={{padding:'clamp(14px,3vw,22px) clamp(14px,3vw,24px)',paddingBottom:'clamp(10px,2vw,14px)',borderBottom:'1px solid rgba(147,112,219,0.15)',position:'relative',zIndex:2,flexShrink:0}}>
          <button onClick={()=>setShowEventModal(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
            borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
            color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'13px',zIndex:10
          }}>✕</button>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'clamp(0.8rem,2vw,1rem)',color:'rgba(180,100,255,0.4)',marginBottom:'4px'}}>✦</div>
            <div style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.8rem,2.5vw,1rem)',letterSpacing:'clamp(2px,1vw,5px)',
              background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
              {selectedDate?.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'6px'}}>
              <div style={{height:'1px',width:'25px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
              <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'3px'}}>✦ · · · ✦</span>
              <div style={{height:'1px',width:'25px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
            </div>
          </div>
        </div>

        {/* Контент */}
        <div className="ev-scroll ev-scroll-dark" style={{overflowY:'auto',padding:'clamp(12px,3vw,18px)',position:'relative',zIndex:1,flex:1}}>
          {/* Список событий */}
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'14px'}}>
            {calendarEvents[selectedDate?.toISOString().split('T')[0]]?.length>0 ? (
              calendarEvents[selectedDate?.toISOString().split('T')[0]].map((event,idx)=>(
                <div key={idx} style={{
                  background:'rgba(239,1,203,0.08)',
                  border:'1px solid rgba(239,1,203,0.3)',
                  borderRadius:'6px',padding:'10px 12px',
                  display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',
                  boxShadow:'0 0 10px rgba(239,1,203,0.1)'
                }}>
                  <div style={{flex:1,color:'rgba(200,185,230,0.85)',fontSize:'clamp(0.75rem,2vw,0.85rem)',fontFamily:'Georgia,serif',lineHeight:'1.6'}}>
                    {renderFormattedText(event)}
                  </div>
                  {isAdmin&&(
                    <button onClick={()=>deleteEvent(idx)} style={{
                      background:'transparent',border:'none',cursor:'pointer',
                      color:'rgba(239,1,203,0.5)',flexShrink:0,padding:'2px'
                    }}>
                      <Trash2 size={14}/>
                    </button>
                  )}
                </div>
              ))
            ):(
              <div style={{textAlign:'center',padding:'20px',background:'rgba(147,112,219,0.05)',border:'1px solid rgba(147,112,219,0.12)',borderRadius:'6px'}}>
                <div style={{fontSize:'1.2rem',color:'rgba(180,100,255,0.25)',marginBottom:'6px'}}>✦</div>
                <p style={{color:'rgba(180,100,255,0.4)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.65rem,1.5vw,0.75rem)'}}>
                  На эту дату событий нет
                </p>
              </div>
            )}
          </div>

          {/* Форма добавления — только для админа */}
          {isAdmin&&(
            <>
              <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'10px 0'}}>
                <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
                <span style={{color:'rgba(180,100,255,0.25)',fontSize:'0.5rem',letterSpacing:'3px'}}>✦ · · · ✦</span>
                <div style={{flex:1,height:'1px',background:'rgba(147,112,219,0.15)'}}/>
              </div>
              <div style={{display:'flex',gap:'6px',marginBottom:'8px',flexWrap:'wrap'}}>
                {[['bold','B','font-bold'],['italic','I','italic'],['underline','U','underline']].map(([f,l,cls])=>(
                  <button key={f} onClick={()=>applyFormat(f)} className={cls} style={{
                    padding:'5px 10px',borderRadius:'4px',fontSize:'0.75rem',cursor:'pointer',color:'#d8b4fe',
                    background:formatState[f]?'rgba(239,1,203,0.3)':'rgba(147,112,219,0.12)',
                    border:`1px solid ${formatState[f]?'rgba(239,1,203,0.6)':'rgba(147,112,219,0.3)'}`
                  }}>{l}</button>
                ))}
                <div style={{flex:1}}/>
                {[['left','⬅'],['center','↕'],['right','➡']].map(([a,icon])=>(
                  <button key={a} onClick={()=>setAlignment(a)} style={{
                    padding:'5px 8px',borderRadius:'4px',fontSize:'0.75rem',cursor:'pointer',color:'#d8b4fe',
                    background:formatState.align===a?'rgba(239,1,203,0.3)':'rgba(147,112,219,0.12)',
                    border:'1px solid rgba(147,112,219,0.3)'
                  }}>{icon}</button>
                ))}
              </div>
              <textarea id="event-textarea" value={eventText} onChange={e=>setEventText(e.target.value)}
                placeholder="Введите событие..." rows={4}
                className="w-full" style={{
                  background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.3)',
                  borderRadius:'4px',padding:'10px 12px',color:'#e8d5ff',
                  fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',resize:'none',
                  width:'100%',boxSizing:'border-box',marginBottom:'10px',
                  textAlign:formatState.align,fontFamily:'Georgia,serif'
                }}/>
              <button onClick={saveEvent} style={{
                width:'100%',padding:'clamp(9px,2vw,11px)',
                background:'rgba(147,112,219,0.18)',border:'1px solid rgba(147,112,219,0.6)',
                borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',
                fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',
                letterSpacing:'3px',textTransform:'uppercase',
                boxShadow:'0 0 12px rgba(147,112,219,0.2)'
              }}>✦ Сохранить событие</button>
            </>
          )}
        </div>
      </div>
    ) : (
      /* СВЕТЛАЯ ТЕМА */
      <div style={{
        background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
        width:'92vw',maxWidth:'460px',
        maxHeight:'min(85vh,600px)',
        display:'flex',flexDirection:'column',
        position:'relative',overflow:'hidden'
      }}>
        <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
          background:'linear-gradient(180deg,transparent,#c9a84c,transparent)',zIndex:2}}/>
        <div style={{position:'absolute',top:'50%',right:'8px',transform:'translateY(-50%)',
          fontFamily:'serif',fontSize:'clamp(6rem,15vw,10rem)',color:'rgba(201,168,76,0.03)',
          pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

        {/* Шапка */}
        <div style={{padding:'clamp(14px,3vw,20px) clamp(18px,4vw,26px)',paddingBottom:'clamp(10px,2vw,12px)',borderBottom:'1px solid rgba(201,168,76,0.1)',position:'relative',zIndex:2,flexShrink:0}}>
          <button onClick={()=>setShowEventModal(false)} style={{
            position:'absolute',top:'12px',right:'12px',
            background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
            borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
            color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'13px',zIndex:10
          }}>✕</button>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.2rem,4vw,1.7rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'evGold 4s linear infinite',letterSpacing:'2px',marginBottom:'8px'}}>
            {selectedDate?.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{height:'1px',width:'50px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>

        {/* Контент */}
        <div className="ev-scroll ev-scroll-light" style={{overflowY:'auto',padding:'clamp(12px,3vw,18px)',position:'relative',zIndex:1,flex:1}}>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'14px'}}>
            {calendarEvents[selectedDate?.toISOString().split('T')[0]]?.length>0 ? (
              calendarEvents[selectedDate?.toISOString().split('T')[0]].map((event,idx)=>(
                <div key={idx} style={{
                  background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.25)',
                  borderRadius:'2px',padding:'10px 12px',
                  display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',
                  position:'relative'
                }}>
                  <div style={{position:'absolute',left:0,top:0,bottom:0,width:'2px',background:'linear-gradient(180deg,transparent,#c9a84c,transparent)'}}/>
                  <div style={{flex:1,color:'rgba(201,168,76,0.75)',fontSize:'clamp(0.75rem,2vw,0.85rem)',fontFamily:'Georgia,serif',lineHeight:'1.6',paddingLeft:'8px'}}>
                    {renderFormattedText(event)}
                  </div>
                  {isAdmin&&(
                    <button onClick={()=>deleteEvent(idx)} style={{
                      background:'transparent',border:'none',cursor:'pointer',
                      color:'rgba(201,168,76,0.4)',flexShrink:0,padding:'2px'
                    }}>
                      <Trash2 size={14}/>
                    </button>
                  )}
                </div>
              ))
            ):(
              <div style={{textAlign:'center',padding:'20px',background:'rgba(201,168,76,0.03)',border:'1px solid rgba(201,168,76,0.1)',borderRadius:'2px'}}>
                <div style={{fontSize:'1.2rem',color:'rgba(201,168,76,0.2)',marginBottom:'6px',fontFamily:'serif'}}>⚜</div>
                <p style={{color:'rgba(201,168,76,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.65rem,1.5vw,0.75rem)'}}>
                  На эту дату событий нет
                </p>
              </div>
            )}
          </div>

          {isAdmin&&(
            <>
              <div style={{display:'flex',alignItems:'center',gap:'8px',margin:'10px 0'}}>
                <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
                <span style={{color:'rgba(201,168,76,0.25)',fontSize:'0.55rem',letterSpacing:'3px',fontFamily:'serif'}}>· ⚜ ·</span>
                <div style={{flex:1,height:'1px',background:'rgba(201,168,76,0.12)'}}/>
              </div>
              <div style={{display:'flex',gap:'6px',marginBottom:'8px',flexWrap:'wrap'}}>
                {[['bold','B','font-bold'],['italic','I','italic'],['underline','U','underline']].map(([f,l,cls])=>(
                  <button key={f} onClick={()=>applyFormat(f)} className={cls} style={{
                    padding:'5px 10px',borderRadius:'2px',fontSize:'0.75rem',cursor:'pointer',
                    color:formatState[f]?'#c9a84c':'rgba(201,168,76,0.5)',
                    background:'transparent',
                    border:`1px solid ${formatState[f]?'rgba(201,168,76,0.6)':'rgba(201,168,76,0.2)'}`
                  }}>{l}</button>
                ))}
                <div style={{flex:1}}/>
                {[['left','⬅'],['center','↕'],['right','➡']].map(([a,icon])=>(
                  <button key={a} onClick={()=>setAlignment(a)} style={{
                    padding:'5px 8px',borderRadius:'2px',fontSize:'0.75rem',cursor:'pointer',
                    color:formatState.align===a?'#c9a84c':'rgba(201,168,76,0.4)',
                    background:'transparent',border:'1px solid rgba(201,168,76,0.2)'
                  }}>{icon}</button>
                ))}
              </div>
              <textarea id="event-textarea" value={eventText} onChange={e=>setEventText(e.target.value)}
                placeholder="Введите событие..." rows={4}
                style={{
                  background:'rgba(201,168,76,0.04)',border:'1px solid rgba(201,168,76,0.25)',
                  borderRadius:'2px',padding:'10px 12px',color:'rgba(201,168,76,0.8)',
                  fontSize:'clamp(0.75rem,2vw,0.85rem)',outline:'none',resize:'none',
                  width:'100%',boxSizing:'border-box',marginBottom:'10px',
                  textAlign:formatState.align,fontFamily:'Georgia,serif'
                }}/>
              <button onClick={saveEvent} style={{
                width:'100%',padding:'clamp(9px,2vw,11px)',
                background:'transparent',border:'1px solid rgba(201,168,76,0.55)',
                borderRadius:'2px',cursor:'pointer',color:'#c9a84c',
                fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',
                letterSpacing:'3px',textTransform:'uppercase'
              }}>⚜ Сохранить событие</button>
            </>
          )}
        </div>
      </div>
    )}
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО ЧТЕНИЯ НОВОСТИ - ТЕМНАЯ ТЕМА */}
{showNewsModal && selectedNews && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes newsTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.5;}}
      @keyframes newsShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .news-dark-scroll::-webkit-scrollbar{width:4px;}
      .news-dark-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .news-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .news-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
    `}}/>
    <div style={{
      background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
      border:'1px solid rgba(180,100,255,0.25)',
      boxShadow:'0 0 60px rgba(147,50,255,0.15)',
      borderRadius:'14px',
      width:'92vw',maxWidth:'620px',
      maxHeight:'min(88vh,700px)',
      display:'flex',flexDirection:'column',
      position:'relative'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',borderRadius:'14px',
        backgroundImage:`radial-gradient(1px 1px at 5% 10%,rgba(255,255,255,0.3) 0%,transparent 100%),
          radial-gradient(1px 1px at 90% 8%,rgba(255,255,255,0.25) 0%,transparent 100%),
          radial-gradient(1px 1px at 70% 90%,rgba(255,255,255,0.2) 0%,transparent 100%)`,
        animation:'newsTwinkle 6s ease-in-out infinite',zIndex:0}}/>

      {/* Шапка */}
      <div style={{padding:'clamp(14px,3vw,22px) clamp(14px,3vw,24px)',paddingBottom:'clamp(10px,2vw,16px)',borderBottom:'1px solid rgba(147,112,219,0.15)',position:'relative',zIndex:2,flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:'clamp(0.8rem,2vw,1rem)',color:'rgba(180,100,255,0.4)',marginBottom:'6px'}}>✦</div>
            <div style={{
              fontFamily:'ppelganger, Georgia, serif',
              fontSize:'clamp(1.1rem,4vw,1.7rem)',
              background:'linear-gradient(90deg,#b3e7ef 0%,#ef01cb 50%,#9370db 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              animation:'newsShimmer 3s linear infinite',
              lineHeight:'1.3',marginBottom:'8px'
            }}>{selectedNews.title}</div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px'}}>
              <div style={{height:'1px',width:'40px',background:'linear-gradient(90deg,rgba(147,112,219,0.5),transparent)'}}/>
              <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
            </div>
            <p style={{color:'rgba(147,112,219,0.45)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',letterSpacing:'1px'}}>
              {new Date(selectedNews.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}
            </p>
          </div>
          <div style={{display:'flex',gap:'8px',flexShrink:0}}>
            {isAdmin&&(
              <button onClick={()=>deleteNews(selectedNews.id)} style={{
                background:'rgba(239,1,203,0.1)',border:'1px solid rgba(239,1,203,0.3)',
                borderRadius:'6px',padding:'6px',cursor:'pointer',color:'rgba(239,1,203,0.7)',
                display:'flex',alignItems:'center',justifyContent:'center'
              }}><Trash2 size={16}/></button>
            )}
            <button onClick={()=>setShowNewsModal(false)} style={{
              background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
              borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
              color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'13px'
            }}>✕</button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="news-dark-scroll" style={{overflowY:'auto',padding:'clamp(14px,3vw,22px)',position:'relative',zIndex:1,flex:1}}>
        <div style={{
          color:'rgba(200,185,230,0.8)',fontFamily:'Georgia,serif',fontSize:'clamp(0.85rem,2vw,1rem)',
          lineHeight:'1.8',whiteSpace:'pre-wrap'
        }}>{selectedNews.content}</div>
      </div>
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО ЧТЕНИЯ НОВОСТИ - СВЕТЛАЯ ТЕМА */}
{showNewsModal && selectedNews && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes newsGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .news-light-scroll::-webkit-scrollbar{width:4px;}
      .news-light-scroll::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:10px;}
      .news-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .news-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'620px',
      maxHeight:'min(88vh,700px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',bottom:'20px',right:'10px',
        fontFamily:'serif',fontSize:'clamp(8rem,20vw,14rem)',color:'rgba(201,168,76,0.025)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      {/* Шапка */}
      <div style={{padding:'clamp(14px,3vw,22px) clamp(18px,4vw,28px)',paddingBottom:'clamp(10px,2vw,14px)',borderBottom:'1px solid rgba(201,168,76,0.1)',position:'relative',zIndex:2,flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px'}}>
          <div style={{flex:1}}>
            <div style={{
              fontFamily:"'victiriya',Georgia,serif",
              fontSize:'clamp(1.2rem,4vw,2rem)',
              backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
              backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
              animation:'newsGold 4s linear infinite',letterSpacing:'2px',marginBottom:'10px',lineHeight:'1.3'
            }}>{selectedNews.title}</div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
              <div style={{height:'1px',width:'50px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
              <span style={{color:'rgba(201,168,76,0.35)',fontSize:'0.65rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
            </div>
            <p style={{color:'rgba(201,168,76,0.35)',fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'clamp(0.6rem,1.5vw,0.7rem)'}}>
              {new Date(selectedNews.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}
            </p>
          </div>
          <div style={{display:'flex',gap:'8px',flexShrink:0}}>
            {isAdmin&&(
              <button onClick={()=>deleteNews(selectedNews.id)} style={{
                background:'transparent',border:'1px solid rgba(201,168,76,0.2)',
                borderRadius:'2px',padding:'6px',cursor:'pointer',color:'rgba(201,168,76,0.4)',
                display:'flex',alignItems:'center',justifyContent:'center'
              }}><Trash2 size={16}/></button>
            )}
            <button onClick={()=>setShowNewsModal(false)} style={{
              background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
              borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',
              color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'13px'
            }}>✕</button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="news-light-scroll" style={{overflowY:'auto',padding:'clamp(14px,3vw,22px) clamp(18px,4vw,28px)',position:'relative',zIndex:1,flex:1}}>
        <div style={{
          color:'rgba(201,168,76,0.65)',fontFamily:'Georgia,serif',fontSize:'clamp(0.85rem,2vw,1rem)',
          lineHeight:'1.8',whiteSpace:'pre-wrap'
        }}>{selectedNews.content}</div>
      </div>
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ НОВОСТИ - ТЕМНАЯ ТЕМА */}
{showAddNewsModal && isAdmin && isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
    <div className="rounded-2xl w-full max-w-2xl p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold shimmer-btn-text">Добавить новость</h2>
        <button onClick={() => {
          setShowAddNewsModal(false);
          setNewsForm({ title: '', content: '' });
        }} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Заголовок</label>
          <input
            type="text"
            value={newsForm.title}
            onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
            placeholder="Введите заголовок новости"
            className="w-full border rounded px-4 py-3 text-white focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Текст новости</label>
          <textarea
            value={newsForm.content}
            onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
            rows={8}
            placeholder="Введите полный текст новости..."
            className="w-full border rounded px-4 py-3 text-white focus:outline-none resize-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#9333ea'
            }}
          />
        </div>

        <button
          onClick={saveNews}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
            boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)'
          }}
        >
          Опубликовать
        </button>
      </div>
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ НОВОСТИ - СВЕТЛАЯ ТЕМА */}
{showAddNewsModal && isAdmin && !isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
    <div className="rounded-2xl w-full max-w-2xl p-6 relative" style={{
      background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
      border: '2px solid #c2c2a8',
      backdropFilter: 'blur(20px)',
      boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.6)'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Добавить новость</h2>
        <button onClick={() => {
          setShowAddNewsModal(false);
          setNewsForm({ title: '', content: '' });
        }} style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>Заголовок</label>
          <input
            type="text"
            value={newsForm.title}
            onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
            placeholder="Введите заголовок новости"
            className="w-full rounded px-4 py-3 focus:outline-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #c9c6bb',
              color: '#c9c6bb'
            }}
          />
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: '#c9c6bb' }}>Текст новости</label>
          <textarea
            value={newsForm.content}
            onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
            rows={8}
            placeholder="Введите полный текст новости..."
            className="w-full rounded px-4 py-3 focus:outline-none resize-none"
            style={{ 
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #c9c6bb',
              color: '#c9c6bb'
            }}
          />
        </div>

        <button
          onClick={saveNews}
          className="w-full py-3 rounded-lg font-bold transition"
          style={{
            background: '#c9c6bb',
            color: '#000000'
          }}
        >
          Опубликовать
        </button>
      </div>
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО ВСЕХ УВЕДОМЛЕНИЙ - ТЕМНАЯ ТЕМА */}
{showNotificationsModal && isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
    <div className="rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 border-2" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold shimmer-btn-text">Все уведомления</h2>
        <button onClick={() => setShowNotificationsModal(false)} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {notifications.length === 0 ? (
          <p className="text-center py-8 text-gray-400">Нет уведомлений</p>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => {
                handleNotificationClick(notif);
                setShowNotificationsModal(false);
              }}
              className="w-full text-left p-4 rounded-lg transition"
              style={{
                background: notif.is_read ? 'rgba(0, 0, 0, 0.3)' : 'rgba(239, 1, 203, 0.2)',
                border: notif.is_read ? '1px solid rgba(147, 112, 219, 0.3)' : '2px solid #ef01cb',
                boxShadow: notif.is_read ? 'none' : '0 0 15px rgba(239, 1, 203, 0.4)'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {notif.type === 'new_work' || notif.type === 'new_chapter' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#ef01cb' }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  ) : notif.type === 'comment_reply' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9370db" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b3e7ef" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">{notif.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(notif.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
)}

{/* МОДАЛЬНОЕ ОКНО ВСЕХ УВЕДОМЛЕНИЙ - СВЕТЛАЯ ТЕМА */}
{showNotificationsModal && !isDarkTheme && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{
          color: '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic'
        }}>Все уведомления</h2>
        <button onClick={() => setShowNotificationsModal(false)} style={{ color: '#c9c6bb' }}>
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {notifications.length === 0 ? (
          <p className="text-center py-8" style={{ color: '#c9c6bb' }}>Нет уведомлений</p>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => {
                handleNotificationClick(notif);
                setShowNotificationsModal(false);
              }}
              className="w-full text-left p-4 rounded-lg transition"
              style={{
                background: notif.is_read ? 'rgba(0, 0, 0, 0.3)' : 'rgba(98, 9, 30, 0.3)',
                border: notif.is_read ? '1px solid rgba(201, 198, 187, 0.3)' : '2px solid #62091e'
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {notif.type === 'new_work' || notif.type === 'new_chapter' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#62091e' }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  ) : notif.type === 'comment_reply' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9c6bb" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9c6bb" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: '#c9c6bb' }}>{notif.message}</p>
                  <p className="text-xs" style={{ color: '#c9c6bb', opacity: 0.7 }}>
                    {new Date(notif.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
)}

{/* NEWSLETTER MODAL - ТЕМНАЯ ТЕМА */}
{showNewsletterModal && isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes nlTwinkle{0%,100%{opacity:0.12;}50%{opacity:0.5;}}
      @keyframes nlShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .nl-dark-scroll::-webkit-scrollbar{width:3px;}
      .nl-dark-scroll::-webkit-scrollbar-track{background:transparent;}
      .nl-dark-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#9370db,#ef01cb,#9370db);border-radius:10px;box-shadow:0 0 8px rgba(147,112,219,0.8);}
      .nl-dark-scroll{scrollbar-width:thin;scrollbar-color:#9370db transparent;}
    `}}/>
    <div style={{
      background:'radial-gradient(ellipse at top,#1a0a2e 0%,#08080f 85%)',
      border:'1px solid rgba(180,100,255,0.25)',
      boxShadow:'0 0 60px rgba(147,50,255,0.15)',
      borderRadius:'14px',
      width:'92vw', maxWidth:'380px',
      maxHeight:'min(85vh,500px)',
      display:'flex', flexDirection:'column',
      position:'relative'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',borderRadius:'14px 14px 0 0',
        background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)',zIndex:3}}/>

      <div className="nl-dark-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,28px) clamp(12px,4vw,24px)',paddingTop:'clamp(18px,4vw,32px)',position:'relative'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 10% 20%,rgba(255,255,255,0.35) 0%,transparent 100%),
            radial-gradient(1px 1px at 85% 15%,rgba(255,255,255,0.25) 0%,transparent 100%),
            radial-gradient(1px 1px at 50% 75%,rgba(255,255,255,0.2) 0%,transparent 100%),
            radial-gradient(1px 1px at 90% 60%,rgba(255,255,255,0.15) 0%,transparent 100%)`,
          animation:'nlTwinkle 5s ease-in-out infinite',zIndex:0}}/>

        <button onClick={()=>setShowNewsletterModal(false)} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'rgba(180,100,255,0.1)',border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(180,100,255,0.8)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        {/* Заголовок */}
        <div style={{textAlign:'center',marginBottom:'clamp(14px,3vw,22px)',position:'relative',zIndex:1}}>
          <div style={{fontSize:'clamp(1rem,3vw,1.4rem)',color:'rgba(180,100,255,0.4)',marginBottom:'6px'}}>✦</div>
          <div style={{fontFamily:'Cinzel,serif',fontSize:'clamp(0.85rem,3vw,1.1rem)',letterSpacing:'clamp(3px,1vw,6px)',
            background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Почтовая рассылка</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginTop:'8px'}}>
            <div style={{height:'1px',width:'35px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
            <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'4px'}}>✦ · · · ✦</span>
            <div style={{height:'1px',width:'35px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
          </div>
        </div>

        {/* Инфо-блок */}
        <div style={{background:'rgba(147,112,219,0.06)',border:'1px solid rgba(147,112,219,0.18)',borderRadius:'6px',padding:'clamp(10px,2vw,14px)',marginBottom:'clamp(14px,3vw,20px)',position:'relative',zIndex:1}}>
          <p style={{color:'rgba(200,185,230,0.65)',fontSize:'clamp(0.7rem,1.8vw,0.8rem)',lineHeight:'1.7',fontFamily:'Georgia,serif',fontStyle:'italic',textAlign:'center'}}>
            Подписавшись, вы будете получать уведомления о новых главах и произведениях на почту:{' '}
            <span style={{color:'#b3e7ef',fontStyle:'normal'}}>{userProfile?.email}</span>
            <br/>
            <span style={{fontSize:'clamp(0.62rem,1.5vw,0.7rem)',color:'rgba(180,100,255,0.4)'}}>
              Отказаться можно в любой момент через настройки
            </span>
          </p>
        </div>

        {/* Кнопки */}
        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)',position:'relative',zIndex:1}}>
          <button onClick={async()=>{try{const{error}=await supabaseBlog.from('newsletter_subscribers').upsert({user_id:user.id,email:userProfile.email,nickname:userProfile.nickname,is_active:true},{onConflict:'user_id'});if(error)throw error;setIsSubscribed(true);showConfirm('Вы подписались на рассылку!');setShowNewsletterModal(false);}catch(err){showConfirm('Ошибка: '+err.message);}}}
            style={{width:'100%',padding:'clamp(10px,2vw,12px)',background:'rgba(147,112,219,0.18)',border:'1px solid rgba(147,112,219,0.6)',borderRadius:'4px',cursor:'pointer',color:'#d8b4fe',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase',boxShadow:'0 0 15px rgba(147,112,219,0.2)'}}>
            ✦ Получать уведомления
          </button>
          <button onClick={async()=>{try{const{error}=await supabaseBlog.from('newsletter_subscribers').update({is_active:false}).eq('user_id',user.id);if(error)throw error;setIsSubscribed(false);showConfirm('Вы отказались от рассылки');setShowNewsletterModal(false);}catch(err){showConfirm('Ошибка: '+err.message);}}}
            style={{width:'100%',padding:'clamp(10px,2vw,12px)',background:'transparent',border:'1px solid rgba(147,112,219,0.2)',borderRadius:'4px',cursor:'pointer',color:'rgba(180,100,255,0.4)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отказаться
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* NEWSLETTER MODAL - СВЕТЛАЯ ТЕМА */}
{showNewsletterModal && !isDarkTheme && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}>
    <style dangerouslySetInnerHTML={{__html:`
      @keyframes nlGold{0%{background-position:-200% center;}100%{background-position:200% center;}}
      .nl-light-scroll::-webkit-scrollbar{width:3px;}
      .nl-light-scroll::-webkit-scrollbar-track{background:transparent;}
      .nl-light-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,transparent,#c9a84c,transparent);border-radius:10px;box-shadow:0 0 6px rgba(201,168,76,0.5);}
      .nl-light-scroll{scrollbar-width:thin;scrollbar-color:#c9a84c transparent;}
    `}}/>
    <div style={{
      background:'#080808',border:'1px solid #2a2218',borderRadius:'4px',
      width:'92vw',maxWidth:'380px',
      maxHeight:'min(85vh,500px)',
      display:'flex',flexDirection:'column',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
        background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)',zIndex:2}}/>
      <div style={{position:'absolute',top:'50%',right:'8px',transform:'translateY(-50%)',
        fontFamily:'serif',fontSize:'clamp(7rem,18vw,11rem)',color:'rgba(201,168,76,0.03)',
        pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>

      <div className="nl-light-scroll" style={{overflowY:'auto',padding:'clamp(14px,4vw,28px) clamp(14px,4vw,32px)',paddingTop:'clamp(18px,4vw,30px)',position:'relative',zIndex:1}}>
        <button onClick={()=>setShowNewsletterModal(false)} style={{
          position:'absolute',top:'10px',right:'10px',
          background:'transparent',border:'1px solid rgba(201,168,76,0.25)',
          borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',
          color:'rgba(201,168,76,0.6)',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:'13px',zIndex:10
        }}>✕</button>

        {/* Заголовок */}
        <div style={{marginBottom:'clamp(14px,3vw,22px)'}}>
          <div style={{fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.3rem,5vw,2rem)',
            backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
            backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
            animation:'nlGold 4s linear infinite',letterSpacing:'3px',marginBottom:'10px'}}>Почтовая рассылка</div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{height:'1px',width:'70px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
            <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
          </div>
        </div>

        {/* Инфо-блок */}
        <div style={{background:'rgba(201,168,76,0.05)',border:'1px solid rgba(201,168,76,0.18)',borderRadius:'2px',padding:'clamp(10px,2vw,14px)',marginBottom:'clamp(14px,3vw,20px)'}}>
          <p style={{color:'rgba(201,168,76,0.6)',fontSize:'clamp(0.7rem,1.8vw,0.8rem)',lineHeight:'1.7',fontFamily:'Georgia,serif',fontStyle:'italic'}}>
            Подписавшись, вы будете получать уведомления о новых главах и произведениях на почту:{' '}
            <span style={{color:'#c9a84c',fontStyle:'normal'}}>{userProfile?.email}</span>
            <br/>
            <span style={{fontSize:'clamp(0.62rem,1.5vw,0.7rem)',color:'rgba(201,168,76,0.35)'}}>
              Отказаться можно в любой момент через настройки
            </span>
          </p>
        </div>

        {/* Кнопки */}
        <div style={{display:'flex',flexDirection:'column',gap:'clamp(8px,2vw,10px)'}}>
          <button onClick={async()=>{try{const{error}=await supabaseBlog.from('newsletter_subscribers').upsert({user_id:user.id,email:userProfile.email,nickname:userProfile.nickname,is_active:true},{onConflict:'user_id'});if(error)throw error;setIsSubscribed(true);showConfirm('Вы подписались на рассылку!');setShowNewsletterModal(false);}catch(err){showConfirm('Ошибка: '+err.message);}}}
            style={{width:'100%',padding:'clamp(10px,2vw,12px)',background:'transparent',border:'1px solid rgba(201,168,76,0.6)',borderRadius:'2px',cursor:'pointer',color:'#c9a84c',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            ⚜ Получать уведомления
          </button>
          <button onClick={async()=>{try{const{error}=await supabaseBlog.from('newsletter_subscribers').update({is_active:false}).eq('user_id',user.id);if(error)throw error;setIsSubscribed(false);showConfirm('Вы отказались от рассылки');setShowNewsletterModal(false);}catch(err){showConfirm('Ошибка: '+err.message);}}}
            style={{width:'100%',padding:'clamp(10px,2vw,12px)',background:'transparent',border:'1px solid rgba(201,168,76,0.15)',borderRadius:'2px',cursor:'pointer',color:'rgba(201,168,76,0.35)',fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',textTransform:'uppercase'}}>
            Отказаться
          </button>
        </div>
      </div>
    </div>
  </div>
)}

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
      </div>
    </>
  );
}