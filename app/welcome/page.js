'use client';
import '@/app/fonts.css';
import { User, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ nickname: '', email: '', password: '' });
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmMessage, setConfirmMessage] = useState('');
const [confirmAction, setConfirmAction] = useState(null);

const showConfirm = (message, action = null) => {
  setConfirmMessage(message);
  setConfirmAction(() => action);
  setShowConfirmModal(true);
};
  const [isMobile, setIsMobile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
const [user, setUser] = useState(null);
const [userProfile, setUserProfile] = useState(null);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

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
      // НЕ устанавливаем пользователя сразу
showConfirm('Регистрация успешна! Проверьте почту для подтверждения аккаунта.');
setAuthForm({ nickname: '', email: '', password: '' });
setAgreedToPrivacy(false);
setAuthMode('login');
    }
  }
};

const handlePasswordReset = async () => {
  if (!resetEmail) {
    showConfirm('Введите email!');
    return;
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) {
    showConfirm('Ошибка: ' + error.message);
  } else {
    showConfirm('Проверьте почту! Вам отправили ссылку для восстановления пароля.');
    setShowForgotPassword(false);
    setResetEmail('');
  }
};

const handleLogin = async () => {
  if (!authForm.email || !authForm.password) {
    showConfirm('Введите email и пароль!');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authForm.email,
    password: authForm.password
  });

  if (error) {
    showConfirm('Ошибка входа: ' + error.message);
    return;
  }

  if (data.user) {
    // Проверяем подтверждение email
    if (!data.user.email_confirmed_at) {
      showConfirm('Пожалуйста, подтвердите email. Проверьте почту!');
      await supabase.auth.signOut();
      return;
    }

    setUser(data.user);
    
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
    }
    
    setShowAuthModal(false);
    setAuthForm({ nickname: '', email: '', password: '' });
    
    // Перенаправляем на главную страницу
    window.location.href = '/';
  }
};

return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #a72cc9 0%, #e6009b 33%, #68d3f3 66%, #a855f7 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 8s linear infinite;
        }
      `}</style>

<div className="min-h-screen text-white overflow-x-hidden relative">
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -10,
          backgroundImage: isMobile ? 'url(/images/11111.webp)' : 'url(/images/22222.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
        
        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
          <div className={`w-full ${isMobile ? 'flex flex-col items-center space-y-6 pt-[24px] pb-12' : 'max-w-6xl grid md:grid-cols-2 gap-12 items-center my-auto'}`}>
            
            {isMobile && (
              <div className="text-white text-center w-full max-w-sm">
                <h1 className="text-7xl font-bold shimmer-text mb-4" style={{
                  fontFamily: "'plommir', Georgia, serif"
                }}>
                  MelloStory
                </h1>
                
                <p className="text-xl mb-6" style={{ 
                  color: '#b3e7ef',
                  textShadow: '0 0 20px rgba(179, 231, 239, 0.6)',
                  fontFamily: "'miamanueva', Georgia, serif"
                }}>
                  Мир фанфикшна и оригинальных романов
                </p>
                
                <ul className="space-y-3 text-base text-left mb-6">
                  <li>• Эксклюзивный контент и авторские материалы о творческом процессе</li>
                  <li>• Визуальное оформление, саундтреки, анкеты персонажей и бонусный контент</li>
                  <li>• Интерактивное сообщество: общение с автором, обсуждения и рецензии читателей</li>
                  <li>• Личная коллекция избранного</li>
                </ul>
              </div>
            )}

            {!isMobile && (
              <div className="text-white space-y-8">
                <h1 className="text-9xl md:text-10xl font-bold shimmer-text" style={{
                  fontFamily: "'plommir', Georgia, serif"
                }}>
                  MelloStory
                </h1>
                <p className="text-3xl md:text-4xl" style={{ 
                  color: '#b3e7ef',
                  textShadow: '0 0 20px rgba(179, 231, 239, 0.6)',
                  fontFamily: "'miamanueva', Georgia, serif"
                }}>
                  Мир фанфикшна и оригинальных романов
                </p>
                
                <ul className="space-y-4 text-xl">
                  <li className="flex items-center gap-4">
<span>• Эксклюзивный контент и авторские материалы о творческом процессе</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span>• Визуальное оформление, саундтреки, анкеты персонажей и бонусный контент</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span>• Интерактивное сообщество: общение с автором, обсуждения и рецензии читателей</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span>• Личная коллекция избранного</span>
                  </li>
                </ul>
              </div>
            )}

            {/* ФОРМА */}
            <div className={`rounded-2xl ${isMobile ? 'p-4' : 'p-3'} border-2 max-w-sm w-full mx-auto relative z-20`} style={{
              background: 'rgba(147, 51, 234, 0.15)',
              borderColor: '#9333ea',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
            }}>
              <h2 className="text-5xl font-bold mb-2 text-center shimmer-text" style={{
                fontFamily: "'plommir', Georgia, serif"
              }}>
                {authMode === 'login' ? 'Вход' : 'Регистрация'}
              </h2>

              <p className="text-center text-sm mb-6" style={{ 
                color: '#b3e7ef',
                opacity: 0.8
              }}>
                {authMode === 'login' 
                  ? 'Пожалуйста, введите ваш почтовый ящик, указанный при регистрации, и пароль.'
                  : 'Заполните все поля для создания аккаунта'
                }
              </p>

              <div className="space-y-4">
                {authMode === 'register' && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" style={{
                      background: (focusedField === 'nickname' || authForm.nickname.length > 0) 
                        ? 'linear-gradient(135deg, rgba(239, 1, 203, 0.2) 0%, rgba(147, 112, 219, 0.2) 100%)'
                        : 'rgba(103, 50, 123, 0.2)',
                      border: (focusedField === 'nickname' || authForm.nickname.length > 0) 
                        ? '2px solid #ef01cb'
                        : '2px solid #67327b',
                      boxShadow: (focusedField === 'nickname' || authForm.nickname.length > 0) 
                        ? '0 0 20px rgba(239, 1, 203, 0.6), inset 0 0 10px rgba(147, 112, 219, 0.3)'
                        : 'none'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke={(focusedField === 'nickname' || authForm.nickname.length > 0) ? "#ef01cb" : "#67327b"} strokeWidth="2" />
                        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke={(focusedField === 'nickname' || authForm.nickname.length > 0) ? "#9370db" : "#67327b"} strokeWidth="2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={authForm.nickname}
                      onChange={(e) => setAuthForm({...authForm, nickname: e.target.value})}
                      onFocus={() => setFocusedField('nickname')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full border rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none"
                      style={{ 
                        background: 'rgba(0, 0, 0, 0.4)',
                        borderColor: '#67327b'
                      }}
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" style={{
                    background: (focusedField === 'email' || authForm.email.length > 0) 
                      ? 'linear-gradient(135deg, rgba(239, 1, 203, 0.2) 0%, rgba(147, 112, 219, 0.2) 100%)'
                      : 'rgba(103, 50, 123, 0.2)',
                    border: (focusedField === 'email' || authForm.email.length > 0) 
                      ? '2px solid #ef01cb'
                      : '2px solid #67327b',
                    boxShadow: (focusedField === 'email' || authForm.email.length > 0) 
                      ? '0 0 20px rgba(239, 1, 203, 0.6), inset 0 0 10px rgba(147, 112, 219, 0.3)'
                      : 'none'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="16" rx="2" stroke={(focusedField === 'email' || authForm.email.length > 0) ? "#ef01cb" : "#67327b"} strokeWidth="2" />
                      <path d="M3 7l9 6 9-6" stroke={(focusedField === 'email' || authForm.email.length > 0) ? "#9370db" : "#67327b"} strokeWidth="2" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full border rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none"
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderColor: '#67327b'
                    }}
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" style={{
                    background: (focusedField === 'password' || authForm.password.length > 0) 
                      ? 'linear-gradient(135deg, rgba(239, 1, 203, 0.2) 0%, rgba(147, 112, 219, 0.2) 100%)'
                      : 'rgba(103, 50, 123, 0.2)',
                    border: (focusedField === 'password' || authForm.password.length > 0) 
                      ? '2px solid #ef01cb'
                      : '2px solid #67327b',
                    boxShadow: (focusedField === 'password' || authForm.password.length > 0) 
                      ? '0 0 20px rgba(239, 1, 203, 0.6), inset 0 0 10px rgba(147, 112, 219, 0.3)'
                      : 'none'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke={(focusedField === 'password' || authForm.password.length > 0) ? "#ef01cb" : "#67327b"} strokeWidth="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={(focusedField === 'password' || authForm.password.length > 0) ? "#9370db" : "#67327b"} strokeWidth="2" />
                      <circle cx="12" cy="16" r="1" fill={(focusedField === 'password' || authForm.password.length > 0) ? "#ef01cb" : "#67327b"} />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full border rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none"
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderColor: '#67327b'
                    }}
                  />
                </div>

                {authMode === 'register' && (
                  <div className="flex items-start gap-2 p-3 rounded-lg border" style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: '#67327b'
                  }}>
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1"
                      style={{ accentColor: '#9370db' }}
                    />
                    <label htmlFor="privacy" className="text-sm text-gray-300">
                      Согласен с{' '}
                      <Link href="/privacy" className="underline" style={{ color: '#9370db' }}>
                        Политикой конфиденциальности
                      </Link>
                      {' '}и{' '}
                      <Link href="/terms" className="underline" style={{ color: '#9370db' }}>
                        Пользовательским соглашением
                      </Link>
                    </label>
                  </div>
                )}

                <button
                  onClick={authMode === 'login' ? handleLogin : handleRegister}
                  className="w-full py-3 rounded-lg font-bold transition"
                  style={{
                    background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                    boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)'
                  }}
                >
                  {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </button>

                {authMode === 'login' ? (
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-gray-400 hover:text-white text-sm"
                  >
                    Забыли пароль?
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 text-center">
                    После заполнения всех полей нажимайте кнопку «Регистрация» только один раз. Повторное нажатие может привести к многократному созданию аккаунта.
Для подтверждения регистрации проверьте письмо от Supabase в вашей электронной почте.
                  </p>
                )}

                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="w-full text-gray-400 hover:text-white text-sm"
                >
                  {authMode === 'login' ? 'Нет аккаунта? Регистрация' : 'Есть аккаунт? Войти'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
<footer className="py-6 sm:py-8 text-center text-gray-500 relative z-[5]" style={{
          background: 'transparent',
          borderTop: '1px solid rgba(147, 112, 219, 0.3)'
        }}>
          <p className="text-sm sm:text-base mb-2">MelloStory © 2026</p>
          <p className="text-xs sm:text-sm mb-4 px-4">Все права защищены. Копирование, распространение и любое иное использование материалов без разрешения автора запрещены.</p>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-4 text-xs sm:text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-300 transition underline">
              Политика конфиденциальности
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/terms" className="text-gray-400 hover:text-gray-300 transition underline">
              Пользовательское соглашение
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/mission" className="text-gray-400 hover:text-gray-300 transition underline">
              Миссия сайта
            </Link>
          </div>
        </footer>

        {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="rounded-2xl w-full max-w-md p-6" style={{
              background: 'rgba(147, 51, 234, 0.15)',
              border: '2px solid #9333ea',
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

        {/* FORGOT PASSWORD MODAL */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center p-4">
            <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
              background: 'rgba(147, 51, 234, 0.15)',
              borderColor: '#9333ea',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)'
            }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold shimmer-text" style={{
                  fontFamily: "'plommir', Georgia, serif"
                }}>
                  Восстановление
                </h2>
                <button onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <p className="text-sm mb-4" style={{ color: '#b3e7ef' }}>
                Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300" style={{
                    background: (focusedField === 'reset-email' || resetEmail.length > 0) 
                      ? 'linear-gradient(135deg, rgba(239, 1, 203, 0.2) 0%, rgba(147, 112, 219, 0.2) 100%)'
                      : 'rgba(103, 50, 123, 0.2)',
                    border: (focusedField === 'reset-email' || resetEmail.length > 0) 
                      ? '2px solid #ef01cb'
                      : '2px solid #67327b',
                    boxShadow: (focusedField === 'reset-email' || resetEmail.length > 0) 
                      ? '0 0 20px rgba(239, 1, 203, 0.6), inset 0 0 10px rgba(147, 112, 219, 0.3)'
                      : 'none'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="16" rx="2" stroke={(focusedField === 'reset-email' || resetEmail.length > 0) ? "#ef01cb" : "#67327b"} strokeWidth="2" />
                      <path d="M3 7l9 6 9-6" stroke={(focusedField === 'reset-email' || resetEmail.length > 0) ? "#9370db" : "#67327b"} strokeWidth="2" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onFocus={() => setFocusedField('reset-email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full border rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none"
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderColor: '#67327b'
                    }}
                  />
                </div>

                <button
                  onClick={handlePasswordReset}
                  className="w-full py-3 rounded-lg font-bold transition"
                  style={{
                    background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
                    boxShadow: '0 0 15px rgba(147, 112, 219, 0.6)'
                  }}
                >
                  Отправить ссылку
                </button>

                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  className="w-full text-gray-400 hover:text-white text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}