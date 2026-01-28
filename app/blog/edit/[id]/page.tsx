'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabaseBlog } from '@/lib/supabase-blog';
import { supabase } from '@/lib/supabase';
import { Monitor, Smartphone } from 'lucide-react';
import '@/app/fonts.css';

export default function EditPost() {
  const router = useRouter();
const params = useParams() as { id: string };
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    desktop: {
      title_font: 'ppelganger',
      title_size: 48,
      content_font: 'ppelganger',
      content_size: 16,
      text_align: 'left'
    },
    mobile: {
      title_font: 'ppelganger',
      title_size: 32,
      content_font: 'ppelganger',
      content_size: 14,
      text_align: 'left'
    }
  });

  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';

const fonts = [
  'ppelganger', 'steamy', 'druzhok', 'miamanueva', 
  'rosses', 'plommir', 'sooonsi', 'victiriya',
  'darkrosse', 'kikamori', 'neffeli', 'ombrosi'
];

  useEffect(() => {
    checkAdmin();
    loadPost();
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') setIsDarkTheme(false);
    }
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email !== ADMIN_EMAIL) {
      router.push('/blog');
    } else {
      setIsAdmin(true);
    }
  };

  const loadPost = async () => {
    const { data } = await supabaseBlog
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .eq('id', params.id as string)
      .single();
    
    if (data) {
      setPostForm({
        title: data.title,
        content: data.content,
        desktop: data.desktop_settings || {
          title_font: 'ppelganger',
          title_size: 48,
          content_font: 'ppelganger',
          content_size: 16,
          text_align: 'left'
        },
        mobile: data.mobile_settings || {
          title_font: 'ppelganger',
          title_size: 32,
          content_font: 'ppelganger',
          content_size: 14,
          text_align: 'left'
        }
      });
    }
  };

  const updatePost = async () => {
    if (!postForm.title || !postForm.content) {
      alert('Заполните название и текст!');
      return;
    }

    const { error } = await supabaseBlog
      .from('blog_posts')
      .update({
        title: postForm.title,
        content: postForm.content,
        desktop_settings: postForm.desktop,
        mobile_settings: postForm.mobile
      })
      .eq('id', params.id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('Пост обновлён!');
      router.push('/blog');
    }
  };

  const currentSettings = postForm[previewDevice];

  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-white">Проверка доступа...</div>;

  return (
    <div className="min-h-screen text-white relative">
      {/* ФОН */}
      <div className="fixed inset-0 -z-10" style={{
        backgroundImage: isDarkTheme 
          ? 'url(/images/darknesas1.webp)' 
          : 'url(/images/theme.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.push('/blog')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          ← Назад к блогу
        </button>

        <h1 className="text-4xl font-bold mb-8" style={{
          fontFamily: 'ppelganger',
          color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
          textShadow: isDarkTheme ? '0 0 20px rgba(179, 231, 239, 0.8)' : 'none'
        }}>
          Редактировать пост
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ЛЕВАЯ ЧАСТЬ - НАСТРОЙКИ */}
          <div className="space-y-6 p-6 rounded-xl" style={{
            background: isDarkTheme ? 'rgba(147, 112, 219, 0.2)' : 'rgba(0, 0, 0, 0.5)',
            border: isDarkTheme ? '2px solid #9370db' : '1px solid #c9c6bb'
          }}>
            
            {/* ПЕРЕКЛЮЧАТЕЛЬ УСТРОЙСТВА */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                style={{
                  background: previewDevice === 'desktop' ? '#9370db' : 'rgba(147, 112, 219, 0.3)',
                  color: '#ffffff'
                }}
              >
                <Monitor size={20} />
                ПК
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className="flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                style={{
                  background: previewDevice === 'mobile' ? '#9370db' : 'rgba(147, 112, 219, 0.3)',
                  color: '#ffffff'
                }}
              >
                <Smartphone size={20} />
                Мобилка
              </button>
            </div>

            {/* ЗАГОЛОВОК */}
            <div>
              <label className="block mb-2 font-bold">Заголовок</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
                placeholder="Введите заголовок"
              />
            </div>

            {/* ШРИФТ ЗАГОЛОВКА */}
            <div>
              <label className="block mb-2 font-bold">Шрифт заголовка</label>
              <select
                value={currentSettings.title_font}
                onChange={(e) => setPostForm({
                  ...postForm,
                  [previewDevice]: {...currentSettings, title_font: e.target.value}
                })}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
              >
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* РАЗМЕР ЗАГОЛОВКА */}
            <div>
              <label className="block mb-2 font-bold">
                Размер заголовка: {currentSettings.title_size}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={currentSettings.title_size}
                onChange={(e) => setPostForm({
                  ...postForm,
                  [previewDevice]: {...currentSettings, title_size: Number(e.target.value)}
                })}
                className="w-full"
              />
            </div>

            {/* ШРИФТ ТЕКСТА */}
            <div>
              <label className="block mb-2 font-bold">Шрифт текста</label>
              <select
                value={currentSettings.content_font}
                onChange={(e) => setPostForm({
                  ...postForm,
                  [previewDevice]: {...currentSettings, content_font: e.target.value}
                })}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
              >
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* РАЗМЕР ТЕКСТА */}
            <div>
              <label className="block mb-2 font-bold">
                Размер текста: {currentSettings.content_size}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={currentSettings.content_size}
                onChange={(e) => setPostForm({
                  ...postForm,
                  [previewDevice]: {...currentSettings, content_size: Number(e.target.value)}
                })}
                className="w-full"
              />
            </div>

            {/* ВЫРАВНИВАНИЕ */}
            <div>
              <label className="block mb-2 font-bold">Выравнивание</label>
              <div className="flex gap-4">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => setPostForm({
                      ...postForm,
                      [previewDevice]: {...currentSettings, text_align: align}
                    })}
                    className="px-6 py-3 rounded-lg font-bold"
                    style={{
                      background: currentSettings.text_align === align ? '#9370db' : 'rgba(147, 112, 219, 0.3)'
                    }}
                  >
                    {align === 'left' ? '⬅' : align === 'center' ? '↕' : '➡'}
                  </button>
                ))}
              </div>
            </div>

            {/* ТЕКСТ */}
            <div>
              <label className="block mb-2 font-bold">Текст поста</label>
              <textarea
                value={postForm.content}
                onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                rows={10}
                className="w-full px-4 py-3 rounded-lg text-white resize-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
                placeholder="Введите текст поста..."
              />
            </div>

            <button
              onClick={updatePost}
              className="w-full py-4 rounded-lg font-bold"
              style={{
                background: isDarkTheme ? 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' : '#c9c6bb',
                color: '#ffffff'
              }}
            >
              Сохранить изменения
            </button>
          </div>

          {/* ПРАВАЯ ЧАСТЬ - ПРЕДПРОСМОТР */}
          <div className="sticky top-8">
            <div 
              className="p-6 rounded-xl"
              style={{
                background: isDarkTheme ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                border: isDarkTheme ? '2px solid #9370db' : '1px solid #c9c6bb',
                maxWidth: previewDevice === 'mobile' ? '375px' : '100%',
                margin: previewDevice === 'mobile' ? '0 auto' : '0'
              }}
            >
              <div className="mb-4 text-center">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                  background: 'rgba(147, 112, 219, 0.3)',
                  color: '#9370db'
                }}>
                  {previewDevice === 'desktop' ? 'Предпросмотр ПК' : 'Предпросмотр Мобилка'}
                </span>
              </div>

              {/* ЗАГОЛОВОК */}
              <h2 
                className="mb-6"
                style={{
                  fontFamily: currentSettings.title_font,
                  fontSize: `${currentSettings.title_size}px`,
                  textAlign: currentSettings.text_align as any,
                  color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
                  lineHeight: '1.2'
                }}
              >
                {postForm.title || 'Заголовок поста'}
              </h2>

              {/* ТЕКСТ */}
              <div 
                style={{
                  fontFamily: currentSettings.content_font,
                  fontSize: `${currentSettings.content_size}px`,
                  textAlign: currentSettings.text_align as any,
                  color: '#ffffff',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}
              >
                {postForm.content || 'Здесь будет текст вашего поста...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}