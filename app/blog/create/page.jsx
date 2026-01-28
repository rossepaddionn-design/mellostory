'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBlog } from '@/lib/supabase-blog';
import { supabase } from '@/lib/supabase';
import { X, Upload, Monitor, Smartphone } from 'lucide-react';
import '@/app/fonts.css';

export default function CreateBlogContent() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [contentType, setContentType] = useState('post');
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' или 'mobile'

  // ДАННЫЕ ПОСТА С НАСТРОЙКАМИ ДЛЯ ПК И МОБИЛКИ
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

  // ДАННЫЕ ПЕРСОНАЖА
  const [characterForm, setCharacterForm] = useState({
    name: '',
    story_name: '',
    surname: '',
    age: '',
    zodiac_sign: '',
    height: '',
    weight: '',
    favorite_color: '',
    favorite_food: '',
    likes: '',
    dislikes: '',
    favorite_quote: '',
    interesting_fact: '',
    backstory: '',
    main_image_url: '',
    gallery_images: []
  });

  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';

const fonts = [
  'ppelganger', 'steamy', 'druzhok', 'miamanueva', 
  'rosses', 'plommir', 'sooonsi', 'victiriya',
  'darkrosse', 'kikamori', 'neffeli', 'ombrosi' // ← ДОБАВИЛИ 4 НОВЫХ
];

  useEffect(() => {
    checkAdmin();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email !== ADMIN_EMAIL) {
      router.push('/blog');
    } else {
      setIsAdmin(true);
    }
  };

  const uploadImage = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabaseBlog.storage
      .from('blog_media')
      .upload(fileName, file);

    if (error) {
      alert('Ошибка загрузки: ' + error.message);
      return null;
    }

    const { data: urlData } = supabaseBlog.storage
      .from('blog_media')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const createPost = async () => {
    if (!postForm.title || !postForm.content) {
      alert('Заполните название и текст!');
      return;
    }

    const { error } = await supabaseBlog
      .from('blog_posts')
      .insert({
        title: postForm.title,
        content: postForm.content,
        desktop_settings: postForm.desktop,
        mobile_settings: postForm.mobile
      });

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('Пост создан!');
      router.push('/blog');
    }
  };

const createCharacter = async () => {
  if (!characterForm.name || !characterForm.main_image_url) {
    alert('Укажите имя и загрузите главное фото!');
    return;
  }

  // Преобразуем пустые строки в null для числовых полей
  const dataToInsert = {
    ...characterForm,
    age: characterForm.age ? parseInt(characterForm.age) : null,
    height: characterForm.height || null,
    weight: characterForm.weight || null,
  };

  const { error } = await supabaseBlog
    .from('character_profiles')
    .insert(dataToInsert);

  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('Персонаж добавлен!');
    router.push('/blog');
  }
};

  // ПОЛУЧАЕМ ТЕКУЩИЕ НАСТРОЙКИ (ПК или МОБИЛКА)
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
          Создать контент
        </h1>

        {/* ВЫБОР ТИПА */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setContentType('post')}
            className="px-6 py-3 rounded-lg font-bold"
            style={{
              background: contentType === 'post' 
                ? isDarkTheme ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' : '#c9c6bb'
                : 'rgba(147, 112, 219, 0.3)',
              color: contentType === 'post' ? '#ffffff' : '#9370db'
            }}
          >
            Пост
          </button>
          <button
            onClick={() => setContentType('character')}
            className="px-6 py-3 rounded-lg font-bold"
            style={{
              background: contentType === 'character' 
                ? isDarkTheme ? 'linear-gradient(135deg, #9370db 0%, #67327b 100%)' : '#c9c6bb'
                : 'rgba(147, 112, 219, 0.3)',
              color: contentType === 'character' ? '#ffffff' : '#9370db'
            }}
          >
            Персонаж
          </button>
        </div>

        {/* ФОРМА ПОСТА */}
        {contentType === 'post' && (
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
                onClick={createPost}
                className="w-full py-4 rounded-lg font-bold"
                style={{
                  background: isDarkTheme ? 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' : '#c9c6bb',
                  color: '#ffffff'
                }}
              >
                Опубликовать пост
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
                    textAlign: currentSettings.text_align,
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
                    textAlign: currentSettings.text_align,
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
        )}

        {/* ФОРМА ПЕРСОНАЖА (БЕЗ ИЗМЕНЕНИЙ) */}
        {contentType === 'character' && (
          <div className="space-y-6 p-6 rounded-xl" style={{
            background: isDarkTheme ? 'rgba(147, 112, 219, 0.2)' : 'rgba(0, 0, 0, 0.5)',
            border: isDarkTheme ? '2px solid #9370db' : '1px solid #c9c6bb'
          }}>
            {/* ИМЯ */}
            <div>
              <label className="block mb-2 font-bold">Имя *</label>
              <input
                type="text"
                value={characterForm.name}
                onChange={(e) => setCharacterForm({...characterForm, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
              />
            </div>

            {/* ГЛАВНОЕ ФОТО */}
            <div>
              <label className="block mb-2 font-bold">Главное фото *</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadImage(file);
                    if (url) setCharacterForm({...characterForm, main_image_url: url});
                  }
                }}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
              />
              {characterForm.main_image_url && (
                <img src={characterForm.main_image_url} className="mt-4 w-32 h-32 object-cover rounded-lg" />
              )}
            </div>

            {/* ОСТАЛЬНЫЕ ПОЛЯ */}
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Из истории" value={characterForm.story_name} onChange={(v) => setCharacterForm({...characterForm, story_name: v})} />
              <InputField label="Фамилия" value={characterForm.surname} onChange={(v) => setCharacterForm({...characterForm, surname: v})} />
              <InputField label="Возраст" type="number" value={characterForm.age} onChange={(v) => setCharacterForm({...characterForm, age: v})} />
              <InputField label="Знак зодиака" value={characterForm.zodiac_sign} onChange={(v) => setCharacterForm({...characterForm, zodiac_sign: v})} />
              <InputField label="Рост" value={characterForm.height} onChange={(v) => setCharacterForm({...characterForm, height: v})} />
              <InputField label="Вес" value={characterForm.weight} onChange={(v) => setCharacterForm({...characterForm, weight: v})} />
              <InputField label="Любимый цвет" value={characterForm.favorite_color} onChange={(v) => setCharacterForm({...characterForm, favorite_color: v})} />
              <InputField label="Любимая еда" value={characterForm.favorite_food} onChange={(v) => setCharacterForm({...characterForm, favorite_food: v})} />
            </div>

            <TextareaField label="Что любит" value={characterForm.likes} onChange={(v) => setCharacterForm({...characterForm, likes: v})} />
            <TextareaField label="Что ненавидит" value={characterForm.dislikes} onChange={(v) => setCharacterForm({...characterForm, dislikes: v})} />
            <TextareaField label="Любимая цитата" value={characterForm.favorite_quote} onChange={(v) => setCharacterForm({...characterForm, favorite_quote: v})} />
            <TextareaField label="Интересный факт" value={characterForm.interesting_fact} onChange={(v) => setCharacterForm({...characterForm, interesting_fact: v})} />
            <TextareaField label="Предыстория" value={characterForm.backstory} onChange={(v) => setCharacterForm({...characterForm, backstory: v})} rows={5} />

            {/* ГАЛЕРЕЯ (до 5 фото) */}
            <div>
              <label className="block mb-2 font-bold">Галерея (до 5 фото)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []).slice(0, 5);
                  const urls = [];
                  for (const file of files) {
                    const url = await uploadImage(file);
                    if (url) urls.push(url);
                  }
                  setCharacterForm({...characterForm, gallery_images: urls});
                }}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
              />
              <div className="mt-4 grid grid-cols-5 gap-2">
                {characterForm.gallery_images.map((url, i) => (
                  <img key={i} src={url} className="w-full h-20 object-cover rounded-lg" />
                ))}
              </div>
            </div>

            <button
              onClick={createCharacter}
              className="w-full py-4 rounded-lg font-bold"
              style={{
                background: isDarkTheme ? 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' : '#c9c6bb',
                color: '#ffffff'
              }}
            >
              Добавить персонажа
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
function InputField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg text-white"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid #9370db'
        }}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="block mb-2 font-bold">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-2 rounded-lg text-white resize-none"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid #9370db'
        }}
      />
    </div>
  );
}