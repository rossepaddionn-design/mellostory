'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabaseBlog } from '@/lib/supabase-blog';
import { supabase } from '@/lib/supabase';
import '@/app/fonts.css';

export default function EditCharacter() {
  const router = useRouter();
  const { id } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [characterForm, setCharacterForm] = useState(null);

  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';

  useEffect(() => {
    checkAdmin();
    loadCharacter();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
  }, [id]);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email !== ADMIN_EMAIL) {
      router.push('/blog');
    } else {
      setIsAdmin(true);
    }
  };

  const loadCharacter = async () => {
    const { data, error } = await supabaseBlog
      .from('character_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      alert('Ошибка загрузки: ' + error.message);
      router.push('/blog');
    } else {
      setCharacterForm({
        ...data,
        gallery_images: data.gallery_images || []
      });
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

  const updateCharacter = async () => {
    if (!characterForm.name || !characterForm.main_image_url) {
      alert('Укажите имя и главное фото!');
      return;
    }

    const dataToUpdate = {
      ...characterForm,
      age: characterForm.age ? parseInt(characterForm.age) : null,
      height: characterForm.height || null,
      weight: characterForm.weight || null,
    };

    const { error } = await supabaseBlog
      .from('character_profiles')
      .update(dataToUpdate)
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('Персонаж обновлён!');
      router.push('/blog');
    }
  };

  if (!isAdmin || !characterForm) {
    return <div className="min-h-screen flex items-center justify-center text-white">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen text-white relative">
      <div className="fixed inset-0 -z-10" style={{
        backgroundImage: isDarkTheme ? 'url(/images/darknesas1.webp)' : 'url(/images/theme.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.push('/blog')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          ← Назад к блогу
        </button>

        <h1 className="text-4xl font-bold mb-8" style={{
          fontFamily: 'ppelganger',
          color: isDarkTheme ? '#b3e7ef' : '#c9c6bb'
        }}>
          Редактировать персонажа
        </h1>

        <div className="space-y-6 p-6 rounded-xl" style={{
          background: isDarkTheme ? 'rgba(147, 112, 219, 0.2)' : 'rgba(0, 0, 0, 0.5)',
          border: isDarkTheme ? '2px solid #9370db' : '1px solid #c9c6bb'
        }}>
          <InputField label="Имя *" value={characterForm.name} onChange={(v) => setCharacterForm({...characterForm, name: v})} />

          {/* ГЛАВНОЕ ФОТО */}
          <div>
            <label className="block mb-2 font-bold">Главное фото *</label>
            {characterForm.main_image_url && (
              <img src={characterForm.main_image_url} className="mb-4 w-32 h-32 object-cover rounded-lg" />
            )}
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
          </div>

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

          {/* ГАЛЕРЕЯ */}
          <div>
            <label className="block mb-2 font-bold">Галерея (до 5 фото)</label>
            <div className="mt-4 grid grid-cols-5 gap-2 mb-4">
              {characterForm.gallery_images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="w-full h-20 object-cover rounded-lg" />
                  <button
                    onClick={() => {
                      const newImages = characterForm.gallery_images.filter((_, index) => index !== i);
                      setCharacterForm({...characterForm, gallery_images: newImages});
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {characterForm.gallery_images.length < 5 && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []).slice(0, 5 - characterForm.gallery_images.length);
                  const urls = [];
                  for (const file of files) {
                    const url = await uploadImage(file);
                    if (url) urls.push(url);
                  }
                  setCharacterForm({...characterForm, gallery_images: [...characterForm.gallery_images, ...urls]});
                }}
                className="w-full px-4 py-3 rounded-lg text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid #9370db'
                }}
              />
            )}
          </div>

          <button
            onClick={updateCharacter}
            className="w-full py-4 rounded-lg font-bold"
            style={{
              background: isDarkTheme ? 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' : '#c9c6bb',
              color: '#ffffff'
            }}
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-bold">{label}</label>
      <input
        type={type}
        value={value || ''}
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
        value={value || ''}
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