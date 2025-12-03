'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseChapters } from '@/lib/supabase-chapters';
import { Save, Upload, Trash2, Plus, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Music, HelpCircle, X, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import GenreAutocomplete from '@/lib/components/admin/GenreAutocomplete';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('works');
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  const [sectionsExpanded, setSectionsExpanded] = useState({
    workInfo: true,
    characterImages: false,
    chapterEditor: true,
    chapterImages: false,
    chapterAudio: false,
    chapterList: false
  });

const [workForm, setWorkForm] = useState({
    title: '',
    direction: 'Слэш',
    category: 'minific',
    rating: 'NC-21',
    status: 'В процессе',
    total_pages: 0,
    fandom: '',
    pairing: '',
    description: '',
    author_note: '',
    genres: '',
    tags: '',
    spoiler_tags: '',
    character_images: [],
    cover_image: null
  });

  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
const [chapterForm, setChapterForm] = useState({
  title: '',
  content: '',
  author_note: '',
  chapter_number: '',
  pages: 0,
  images: [],
  audio_files: []
});

  const ADMIN_PASSWORD = 'mellostory2025';

  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (isAuth) {
      loadWorks();
    }
  }, [isAuth]);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setWorks(data || []);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      alert('Ошибка загрузки работ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (workId) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('work_id', workId)
        .order('chapter_number', { ascending: true });
      
      if (error) throw error;
      setChapters(data || []);
    } catch (err) {
      console.error('Ошибка загрузки глав:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
    } else {
      alert('Неверный пароль!');
    }
  };

const saveWork = async (isDraft) => {
    if (!workForm.title.trim()) {
      alert('Введите название работы!');
      return;
    }

    setLoading(true);
    
const workData = {
  title: workForm.title.trim(),
  direction: workForm.direction,
  category: workForm.category,
  rating: workForm.rating,
  status: workForm.status,
  total_pages: parseInt(workForm.total_pages) || 0,
  fandom: workForm.fandom ? workForm.fandom.trim() : null,
  pairing: workForm.pairing ? workForm.pairing.trim() : null,
  description: workForm.description.trim(),
  author_note: workForm.author_note.trim(),
  genres: workForm.genres ? workForm.genres.replace(/,\s*$/, '').split(',').map(s => s.trim()).filter(s => s) : [],
  tags: workForm.tags ? workForm.tags.replace(/,\s*$/, '').split(',').map(s => s.trim()).filter(s => s) : [],
  spoiler_tags: workForm.spoiler_tags ? workForm.spoiler_tags.replace(/,\s*$/, '').split(',').map(s => s.trim()).filter(s => s) : [],
  character_images: workForm.character_images || [],
  cover_url: workForm.cover_image,
  is_draft: isDraft
};

console.log('📤 Отправляю данные:', workData);

    try {
      let result;
      if (selectedWork?.id) {
        result = await supabase
          .from('works')
          .update(workData)
          .eq('id', selectedWork.id)
          .select();
      } else {
        result = await supabase
          .from('works')
          .insert([workData])
          .select();
      }

      if (result.error) throw result.error;

      alert(isDraft ? 'Черновик сохранён!' : 'Работа опубликована!');
      // Добавляем обновление, если публикуем новую работу
if (!isDraft && !selectedWork.id) {
  await supabase.from('site_updates').insert({
    work_id: result.data[0].id,
    work_title: workData.title,
    type: 'new_work'
  });
}
      await loadWorks();
      
      if (result.data && result.data[0]) {
        setSelectedWork(result.data[0]);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

const saveChapter = async (isPublished) => {
  if (!selectedWork || selectedWork.isNew || !selectedWork.id) {
    alert('Сначала сохраните работу!');
    return;
  }

  if (!chapterForm.title.trim()) {
    alert('Заполните название главы!');
    return;
  }

  // КРИТИЧНО: берём текст ПРЯМО из редактора
  const currentEditorContent = editorRef.current?.innerHTML?.trim() || '';
  console.log('💾 Сохраняем текст:', currentEditorContent.substring(0, 100));

  if (!currentEditorContent) {
    alert('Заполните текст главы!');
    return;
  }

  setLoading(true);

  try {
    // 1. Создаём данные главы (БЕЗ text_blob_url!)
    const chapterData = {
      work_id: selectedWork.id,
      title: chapterForm.title.trim(),
      author_note: chapterForm.author_note.trim(),
      chapter_number: chapterForm.chapter_number,
      pages: parseInt(chapterForm.pages) || 0,
      images: chapterForm.images,
      audio_url: chapterForm.audio_files.length > 0 
        ? JSON.stringify(chapterForm.audio_files) 
        : null,
      is_published: isPublished
    };

    // 2. Сохраняем метаданные в Supabase #1 (старая база)
    let result;
    if (selectedChapter) {
      // Обновление существующей главы
      result = await supabase
        .from('chapters')
        .update(chapterData)
        .eq('id', selectedChapter.id)
        .select();
    } else {
      // Создание новой главы
      result = await supabase
        .from('chapters')
        .insert([chapterData])
        .select();
    }

    if (result.error) throw result.error;

    const savedChapter = result.data[0];
    console.log('✅ Метаданные сохранены в Supabase #1:', savedChapter.id);

    // 3. Сохраняем ТЕКСТ в Supabase #2 (новая база)
    const { error: textError } = await supabaseChapters
      .from('chapter_texts')
      .upsert({
        chapter_id: savedChapter.id,
        work_id: selectedWork.id,
        text_content: currentEditorContent,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'chapter_id' 
      });

    if (textError) throw textError;
    console.log('✅ Текст сохранён в Supabase #2');

    // 4. Добавляем обновление о новой главе
    if (isPublished && !selectedChapter) {
      await supabase.from('site_updates').insert({
        work_id: selectedWork.id,
        work_title: workForm.title,
        chapter_number: chapterData.chapter_number,
        chapter_title: chapterData.title,
        type: 'new_chapter'
      });
    }

    // 5. Публикуем работу, если она была черновиком
    if (isPublished && selectedWork.is_draft) {
      await supabase
        .from('works')
        .update({ is_draft: false })
        .eq('id', selectedWork.id);
      
      alert('Глава опубликована! Работа тоже опубликована.');
      await loadWorks();
    } else {
      alert(isPublished ? 'Глава опубликована!' : 'Черновик сохранён!');
    }

    // ОБНОВЛЯЕМ список глав
    await loadChapters(selectedWork.id);
    
  } catch (err) {
    console.error('❌ Ошибка сохранения:', err);
    alert('Ошибка: ' + err.message);
  } finally {
    setLoading(false);
  }
};

const createNewChapter = () => {
  setSelectedChapter(null);
  setChapterForm({
    title: '',
    content: '',
    author_note: '',
    chapter_number: '',
    pages: 0,
    images: [],
    audio_files: []
  });
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setSectionsExpanded(prev => ({ ...prev, chapterEditor: true }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteWork = async (id) => {
    if (!confirm('Удалить работу?')) return;
    
    try {
      const { error } = await supabase.from('works').delete().eq('id', id);
      if (error) throw error;
      
      await loadWorks();
      if (selectedWork?.id === id) {
        setSelectedWork(null);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const deleteChapter = async (id) => {
    if (!confirm('Удалить главу?')) return;
    
    try {
      const { error } = await supabase.from('chapters').delete().eq('id', id);
      if (error) throw error;
      
      await loadChapters(selectedWork.id);
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const publishAllChapters = async () => {
    if (!selectedWork || !selectedWork.id) return;
    if (!confirm('Опубликовать все главы?')) return;

    setLoading(true);
    try {
      await supabase.from('chapters').update({ is_published: true }).eq('work_id', selectedWork.id);
      await supabase.from('works').update({ is_draft: false }).eq('id', selectedWork.id);
      
      alert('Всё опубликовано!');
      await loadChapters(selectedWork.id);
      await loadWorks();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const hideAllChapters = async () => {
    if (!selectedWork || !selectedWork.id) return;
    if (!confirm('Скрыть все главы?')) return;

    setLoading(true);
    try {
      await supabase.from('chapters').update({ is_published: false }).eq('work_id', selectedWork.id);
      await supabase.from('works').update({ is_draft: true }).eq('id', selectedWork.id);
      
      alert('Всё скрыто!');
      await loadChapters(selectedWork.id);
      await loadWorks();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWorkForm({...workForm, cover_image: event.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e, target) => {
    const files = Array.from(e.target.files || []);
    const maxImages = target === 'work' ? 20 : 10;

    if (files.length > maxImages) {
      alert(`Максимум ${maxImages} изображений!`);
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (target === 'work') {
          setWorkForm(prev => ({
            ...prev,
            character_images: [...prev.character_images, event.target.result].slice(0, 20)
          }));
        } else if (target === 'chapter') {
          setChapterForm(prev => ({
            ...prev,
            images: [...prev.images, event.target.result].slice(0, 10)
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index, target) => {
    if (target === 'work') {
      setWorkForm(prev => ({
        ...prev,
        character_images: prev.character_images.filter((_, i) => i !== index)
      }));
    } else if (target === 'chapter') {
      setChapterForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAudioUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (chapterForm.audio_files.length + files.length > 8) {
      alert('Максимум 8 аудио!');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setChapterForm(prev => ({
          ...prev,
          audio_files: [...prev.audio_files, { name: file.name, data: event.target.result }].slice(0, 8)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAudio = (index) => {
    setChapterForm(prev => ({
      ...prev,
      audio_files: prev.audio_files.filter((_, i) => i !== index)
    }));
  };

const formatText = (command, value = null) => {
  if (command === 'undo' || command === 'redo') {
    document.execCommand(command);
  } else {
    document.execCommand(command, false, value);
  }
  editorRef.current?.focus();
};

const insertTooltip = () => {
    const word = window.getSelection().toString();
    if (!word) {
      alert('Выделите слово!');
      return;
    }
    const explanation = prompt('Введите пояснение:');
    if (explanation) {
      const tooltip = `<span class="tooltip-word" title="${explanation}" style="color: #ef4444; cursor: help;">${word}(?)</span>`;
      document.execCommand('insertHTML', false, tooltip);
      editorRef.current?.focus();
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-gray-900 rounded-lg p-6 sm:p-8 border-2 border-red-900 max-w-md w-full">
          <h1 className="text-3xl sm:text-4xl font-bold text-red-600 mb-4 sm:mb-6 text-center">MELLOSTORY</h1>
          <h2 className="text-xl sm:text-2xl text-white mb-4 sm:mb-6 text-center">Админ-панель</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 sm:px-4 py-2 sm:py-3 mb-4 text-sm sm:text-base focus:outline-none focus:border-red-600"
            />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 rounded transition text-sm sm:text-base">
              Войти
            </button>
          </form>
          <p className="text-gray-500 text-xs sm:text-sm text-center mt-4">Пароль</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <header className="bg-gray-900 border-b border-red-900 py-3 sm:py-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">MELLOSTORY Admin</h1>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            <button onClick={() => { setActiveTab('works'); setSelectedWork(null); }} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base ${activeTab === 'works' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
              Работы
            </button>
            <button 
  onClick={async () => {
    if (!confirm('Начать миграцию текстов в Supabase #2?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/migrate-to-supabase', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Готово!\nМигрировано: ${result.migrated}/${result.total} глав`);
      } else {
        alert('❌ Ошибка: ' + result.error);
      }
    } catch (err) {
      alert('❌ Ошибка миграции: ' + err.message);
    } finally {
      setLoading(false);
    }
  }} 
  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm sm:text-base"
>
  🔄 Миграция
</button>
            <button onClick={() => setIsAuth(false)} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm sm:text-base">
              Выход
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'works' && !selectedWork && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Мои работы {loading && <span className="text-gray-500 text-base sm:text-lg">(загрузка...)</span>}
              </h2>
              <button onClick={() => { 
                setSelectedWork({ isNew: true }); 
                setWorkForm({ title: '', direction: 'Слэш', category: 'minific', rating: 'NC-21', status: 'В процессе', description: '', author_note: '', genres: '', tags: '', spoiler_tags: '', character_images: [], cover_image: null });
                setChapterForm({ title: '', content: '', author_note: '', chapter_number: 1, images: [], audio_files: [] });
              }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base">
                <Plus size={18} className="sm:w-5 sm:h-5" />
                Создать работу
              </button>
            </div>

            {works.length === 0 && !loading && (
              <div className="bg-gray-900 rounded-lg p-8 sm:p-12 text-center border-2 border-dashed border-gray-700">
                <p className="text-gray-400 text-base sm:text-lg mb-4">Работы ещё не созданы</p>
              </div>
            )}

            <div className="grid gap-3 sm:gap-4">
              {works.map((work) => (
                <div key={work.id} className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-red-900 transition">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold mb-2 break-words">{work.title}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">{work.direction} • {work.rating} • {work.status}</p>
                      <p className="text-gray-500 text-xs sm:text-sm">{work.is_draft ? '📝 Черновик' : '✅ Опубликовано'}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
<button onClick={async () => { 
  const workToEdit = work;
  
setWorkForm({
    title: workToEdit.title,
    direction: workToEdit.direction,
    category: workToEdit.category || 'minific',
    rating: workToEdit.rating,
    status: workToEdit.status,
    total_pages: workToEdit.total_pages || 0,  // ← ДОБАВИЛИ!
    fandom: workToEdit.fandom || '',
    pairing: workToEdit.pairing || '',
    description: workToEdit.description || '',
    author_note: workToEdit.author_note || '',
    genres: workToEdit.genres?.join(', ') || '',
    tags: workToEdit.tags?.join(', ') || '',
    spoiler_tags: workToEdit.spoiler_tags?.join(', ') || '',
    character_images: workToEdit.character_images || [],
    cover_image: workToEdit.cover_url || null
  });
  
  setSelectedWork(workToEdit);
  
  // АВТОМАТИЧЕСКИ ОТКРЫВАЕМ СЕКЦИЮ С ГЛАВАМИ!
  setSectionsExpanded(prev => ({ ...prev, chapterList: true }));
  
  // Загружаем главы
  await loadChapters(workToEdit.id);
}} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-lg transition text-xs sm:text-sm">
  Редактировать
</button>
                      <button onClick={() => deleteWork(work.id)} className="bg-red-900 hover:bg-red-800 p-2 rounded-lg transition">
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedWork && (
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button onClick={() => { setActiveTab('works'); setSelectedWork(null); }} className="text-red-600 hover:text-red-500 text-sm sm:text-base">← Назад</button>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{selectedWork.isNew ? 'Новая работа' : `Редактирование`}</h2>
            </div>

<div className="bg-gray-900 rounded-lg border border-gray-700 mb-4 sm:mb-6">
              <button onClick={() => toggleSection('workInfo')} className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-gray-800 transition">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">Шапка работы</h3>
                {sectionsExpanded.workInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {sectionsExpanded.workInfo && (
                <div className="p-4 sm:p-6 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
<div className="md:col-span-3">
  <label className="block text-xs sm:text-sm text-gray-400 mb-2">Обложка</label>
  {workForm.cover_image ? (
    <div className="max-w-xs mx-auto md:max-w-none">
      <div className="relative group mb-3">
        <img src={workForm.cover_image} alt="Cover" className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-gray-700" />
        <button 
          onClick={() => setWorkForm({...workForm, cover_image: null})} 
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          title="Удалить обложку"
        >
          <X size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
      
      {/* КНОПКА СМЕНЫ ОБЛОЖКИ */}
      <label className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition text-sm">
        <ImageIcon size={16} />
        Сменить обложку
        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
      </label>
    </div>
  ) : (
                        <label className="flex flex-col items-center justify-center h-48 sm:h-64 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer transition">
                          <ImageIcon size={24} className="sm:w-8 sm:h-8 text-gray-500 mb-2" />
                          <span className="text-gray-500 text-xs sm:text-sm text-center">Загрузить обложку</span>
                          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        </label>
                      )}
                    </div>

                    <div className="md:col-span-9 space-y-3 sm:space-y-4">
                      <input value={workForm.title} onChange={(e) => setWorkForm({...workForm, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:outline-none focus:border-red-600" placeholder="Название работы" />
                      
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 sm:mb-2">Направление:</label>
                          <select value={workForm.direction} onChange={(e) => setWorkForm({...workForm, direction: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600">
                            <option>Слэш</option><option>Гет</option><option>Фемслэш</option><option>Джен</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-400 mb-1 sm:mb-2">Категория:</label>
                          <select value={workForm.category} onChange={(e) => setWorkForm({...workForm, category: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600">
                            <option value="minific">Минифик</option><option value="longfic">Лонгфик</option><option value="novel">Роман</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 sm:mb-2">Рейтинг:</label>
                          <select value={workForm.rating} onChange={(e) => setWorkForm({...workForm, rating: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600">
                            <option>G</option><option>PG-13</option><option>R</option><option>NC-17</option><option>NC-21</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 sm:mb-2">Статус:</label>
                          <select value={workForm.status} onChange={(e) => setWorkForm({...workForm, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-2 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600">
                            <option>В процессе</option><option>Завершён</option><option>Заморожен</option>
                          </select>
                        </div>
                      </div>

                      {/* КОЛИЧЕСТВО СТРАНИЦ */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1 sm:mb-2">Количество страниц:</label>
                        <input 
                          type="number" 
                          value={workForm.total_pages} 
                          onChange={(e) => setWorkForm({...workForm, total_pages: e.target.value})} 
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600" 
                          placeholder="Например: 156" 
                          min="0"
                        />
                      </div>

                      <input value={workForm.fandom} onChange={(e) => setWorkForm({...workForm, fandom: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600" placeholder="Фандом" />
                      <input value={workForm.pairing} onChange={(e) => setWorkForm({...workForm, pairing: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600" placeholder="Пейринг" />
<GenreAutocomplete 
  value={workForm.genres} 
  onChange={(val) => setWorkForm({...workForm, genres: val})} 
  placeholder="Жанры (начните вводить...)" 
/>

<GenreAutocomplete 
  value={workForm.tags} 
  onChange={(val) => setWorkForm({...workForm, tags: val})} 
  placeholder="Теги (начните вводить...)" 
/>

<GenreAutocomplete 
  value={workForm.spoiler_tags} 
  onChange={(val) => setWorkForm({...workForm, spoiler_tags: val})} 
  placeholder="Спойлеры (начните вводить...)" 
/>
                      <textarea value={workForm.description} onChange={(e) => setWorkForm({...workForm, description: e.target.value})} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600" placeholder="Описание" />
                      <textarea value={workForm.author_note} onChange={(e) => setWorkForm({...workForm, author_note: e.target.value})} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-red-600" placeholder="Примечание автора" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-700 mb-4 sm:mb-6">
              <button onClick={() => toggleSection('characterImages')} className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-gray-800 transition">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-300">Изображения персонажей ({workForm.character_images.length}/20)</h3>
                {sectionsExpanded.characterImages ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {sectionsExpanded.characterImages && (
                <div className="p-4 sm:p-6 border-t border-gray-700">
                  <label className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg p-4 sm:p-6 cursor-pointer transition mb-4">
                    <ImageIcon size={20} className="sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">Загрузить изображения</span>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'work')} className="hidden" />
                  </label>

                  {workForm.character_images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                      {workForm.character_images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt={`Character ${i + 1}`} className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-700" />
                          <button onClick={() => removeImage(i, 'work')} className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                            <X size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-700 mb-4 sm:mb-6">
              <button onClick={() => toggleSection('chapterEditor')} className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-gray-800 transition">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-red-600">{selectedChapter ? `Редактирование: ${selectedChapter.title}` : 'Новая глава'}</h3>
                {sectionsExpanded.chapterEditor ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {sectionsExpanded.chapterEditor && (
                <div className="p-4 sm:p-6 border-t border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
<div>
                      <label className="block text-xs sm:text-sm text-gray-400 mb-2">Номер главы</label>
                      <input 
                        type="text" 
                        value={chapterForm.chapter_number} 
                        onChange={(e) => setChapterForm({...chapterForm, chapter_number: e.target.value})} 
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:outline-none focus:border-red-600" 
                        placeholder="1, 2, I, II, III..." 
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-gray-400 mb-2">Название главы</label>
                      <input value={chapterForm.title} onChange={(e) => setChapterForm({...chapterForm, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:outline-none focus:border-red-600" placeholder="Глава 1: Начало" />
                    </div>
</div>

                  {/* КНОПКА НОВАЯ ГЛАВА */}
                  <div className="mb-4">
                    <button 
                      onClick={createNewChapter}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg transition text-sm sm:text-base font-semibold"
                    >
                      <Plus size={20} />
                      ➕ Новая глава
                    </button>
                  </div>

<div className="sticky top-16 z-30 flex flex-wrap gap-2 mb-4 p-3 sm:p-4 bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto shadow-lg">
                    <button onClick={() => formatText('bold')} className="p-2 hover:bg-gray-700 rounded shrink-0" title="Жирный"><Bold size={18} className="sm:w-5 sm:h-5" /></button>
                    <button onClick={() => formatText('italic')} className="p-2 hover:bg-gray-700 rounded shrink-0" title="Курсив"><Italic size={18} className="sm:w-5 sm:h-5" /></button>
                    <div className="w-px bg-gray-600 shrink-0"></div>
                    <button onClick={() => formatText('justifyLeft')} className="p-2 hover:bg-gray-700 rounded shrink-0" title="Влево"><AlignLeft size={18} className="sm:w-5 sm:h-5" /></button>
                    <button onClick={() => formatText('justifyCenter')} className="p-2 hover:bg-gray-700 rounded shrink-0" title="Центр"><AlignCenter size={18} className="sm:w-5 sm:h-5" /></button>
                    <button onClick={() => formatText('justifyRight')} className="p-2 hover:bg-gray-700 rounded shrink-0" title="Вправо"><AlignRight size={18} className="sm:w-5 sm:h-5" /></button>
                    <div className="w-px bg-gray-600 shrink-0"></div>
                    <button onClick={insertTooltip} className="p-2 hover:bg-gray-700 rounded shrink-0" title="Пояснение"><HelpCircle size={18} className="sm:w-5 sm:h-5" /></button>
<div className="w-px bg-gray-600 shrink-0"></div>
<button 
  onClick={() => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Удаляем ВСЕ inline-стили и классы
    tempDiv.querySelectorAll('*').forEach(el => {
      // Сохраняем только выравнивание и пояснения
      const align = el.style.textAlign;
      const title = el.getAttribute('title');
      const tooltipClass = el.classList.contains('tooltip-word');
      
      // Удаляем все стили
      el.removeAttribute('style');
      el.removeAttribute('class');
      
      // Возвращаем выравнивание если было
      if (align) el.style.textAlign = align;
      
      // Возвращаем пояснение если было
      if (title) {
        el.setAttribute('title', title);
        el.classList.add('tooltip-word');
        el.style.color = '#ef4444';
        el.style.cursor = 'help';
      }
    });
    
    editorRef.current.innerHTML = tempDiv.innerHTML;
    setChapterForm({...chapterForm, content: tempDiv.innerHTML});
    editorRef.current.focus();
  }} 
  className="p-2 hover:bg-gray-700 rounded shrink-0 bg-purple-600 hover:bg-purple-700" 
  title="Очистить форматирование (сохранит жирный, курсив, выравнивание)"
>
  🧹
</button>
                  </div>

 <div 
  ref={editorRef}
  contentEditable
  onInput={(e) => {
    // КРИТИЧНО: Обновляем форму при КАЖДОМ изменении в редакторе
    const currentContent = e.currentTarget.innerHTML;
    setChapterForm(prev => ({...prev, content: currentContent}));
    console.log('✍️ Изменили текст:', currentContent.substring(0, 100));
  }}
  onPaste={(e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const lines = text.split('\n');
    const cleanHTML = lines.join('<br>');
    document.execCommand('insertHTML', false, cleanHTML);
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    }
  }}
  className="min-h-[300px] sm:min-h-[400px] w-full bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 focus:border-red-600 focus:outline-none text-white mb-4 overflow-auto"
  style={{ 
    fontSize: '16px',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    fontFamily: 'Georgia, "Times New Roman", serif',
    textAlign: 'left'
  }}
  suppressContentEditableWarning={true}
/>

                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm text-gray-400 mb-2">Примечание автора к главе</label>
                    <textarea value={chapterForm.author_note} onChange={(e) => setChapterForm({...chapterForm, author_note: e.target.value})} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded px-3 sm:px-4 py-2 text-white text-sm sm:text-base focus:outline-none focus:border-red-600" placeholder="Ваши комментарии..." />
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border-2 border-yellow-600">
                    <h4 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-yellow-500">Сохранение главы</h4>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <button onClick={() => saveChapter(false)} disabled={loading} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition disabled:opacity-50 text-sm sm:text-base">
                        <Save size={18} className="sm:w-5 sm:h-5" />
                        {loading ? 'Сохранение...' : 'Черновик'}
                      </button>
                      <button onClick={() => saveChapter(true)} disabled={loading} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition disabled:opacity-50 text-sm sm:text-base">
                        <Upload size={18} className="sm:w-5 sm:h-5" />
                        {loading ? 'Публикация...' : 'Опубликовать'}
                      </button>
<button onClick={createNewChapter} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-sm sm:text-base">
                        Очистить
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

{/* СТРАНИЦЫ ГЛАВЫ */}
<div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
  <label className="block text-xs sm:text-sm text-gray-400 mb-2">Количество страниц в этой главе</label>
  <input 
    type="number" 
    value={chapterForm.pages} 
    onChange={(e) => setChapterForm({...chapterForm, pages: e.target.value})} 
    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" 
    placeholder="Например: 12" 
    min="0"
  />
</div>

            <div className="bg-gray-900 rounded-lg border border-gray-700 mb-4 sm:mb-6">
              <button onClick={() => toggleSection('chapterImages')} className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-gray-800 transition">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-300">Изображения в тексте ({chapterForm.images.length}/10)</h3>
                {sectionsExpanded.chapterImages ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {sectionsExpanded.chapterImages && (
                <div className="p-4 sm:p-6 border-t border-gray-700">
                  <label className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg p-3 sm:p-4 cursor-pointer transition mb-4">
                    <ImageIcon size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Загрузить</span>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'chapter')} className="hidden" />
                  </label>

                  {chapterForm.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {chapterForm.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} alt={`Image ${i + 1}`} className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-700" />
                          <button onClick={() => removeImage(i, 'chapter')} className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                            <X size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-700 mb-4 sm:mb-6">
              <button onClick={() => toggleSection('chapterAudio')} className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-gray-800 transition">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-300">Аудиофайлы ({chapterForm.audio_files.length}/8)</h3>
                {sectionsExpanded.chapterAudio ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {sectionsExpanded.chapterAudio && (
                <div className="p-4 sm:p-6 border-t border-gray-700">
                  <label className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg p-3 sm:p-4 cursor-pointer transition mb-4">
                    <Music size={18} className="sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Загрузить аудио</span>
                    <input type="file" accept="audio/*" multiple onChange={handleAudioUpload} className="hidden" />
                  </label>

                  {chapterForm.audio_files.length > 0 && (
                    <div className="space-y-3">
                      {chapterForm.audio_files.map((audio, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs sm:text-sm text-gray-300 truncate flex-1 break-all">{audio.name}</span>
                            <button onClick={() => removeAudio(i)} className="bg-red-900 hover:bg-red-800 p-1 rounded ml-2 shrink-0">
                              <X size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <audio controls className="w-full" src={audio.data}>Ваш браузер не поддерживает аудио.</audio>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedWork?.id && (
              <div className="bg-gray-900 rounded-lg border border-gray-700 mb-4 sm:mb-6">
                <button onClick={() => toggleSection('chapterList')} className="w-full flex justify-between items-center p-4 sm:p-6 hover:bg-gray-800 transition">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Содержание ({chapters.length})</h3>
                  {sectionsExpanded.chapterList ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {sectionsExpanded.chapterList && (
                  <div className="p-4 sm:p-6 border-t border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                      <button onClick={publishAllChapters} disabled={loading} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-2 rounded-lg transition disabled:opacity-50 text-xs sm:text-sm">
                        <Eye size={16} className="sm:w-5 sm:h-5" />
                        Опубликовать все
                      </button>
                      <button onClick={hideAllChapters} disabled={loading} className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 px-3 sm:px-4 py-2 rounded-lg transition disabled:opacity-50 text-xs sm:text-sm">
                        <EyeOff size={16} className="sm:w-5 sm:h-5" />
                        Скрыть все
                      </button>
                    </div>

                    {chapters.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 text-sm sm:text-base">Глав пока нет</p>
                    ) : (
                      <div className="space-y-2">
                        {chapters.map((chapter) => (
                          <div key={chapter.id} className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-red-900 transition">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base md:text-lg break-words">{chapter.chapter_number}. {chapter.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">{chapter.is_published ? '✅ Опубликовано' : '📝 Черновик'}</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
<button onClick={async () => {
  // ЗАГРУЖАЕМ ТЕКСТ ИЗ SUPABASE #2!
  let chapterContent = '';
  
  try {
    const { data: textData, error } = await supabaseChapters
      .from('chapter_texts')
      .select('text_content')
      .eq('chapter_id', chapter.id)
      .single();
    
    if (error) throw error;
    chapterContent = textData.text_content || '';
    console.log('📥 Загрузили из Supabase #2:', chapterContent.substring(0, 100));
  } catch (error) {
    console.error('❌ Ошибка загрузки текста:', error);
    alert('Ошибка загрузки текста главы');
  }
  
  // Устанавливаем форму
  setChapterForm({
    title: chapter.title,
    content: chapterContent,
    author_note: chapter.author_note || '',
    chapter_number: chapter.chapter_number,
    pages: chapter.pages || 0,
    images: chapter.images || [],
    audio_files: chapter.audio_url ? JSON.parse(chapter.audio_url) : []
  });
  
  setSelectedChapter(chapter);
  
  // Заполняем редактор
  if (editorRef.current) {
    editorRef.current.innerHTML = chapterContent;
    console.log('✏️ Вставили в редактор:', editorRef.current.innerHTML.substring(0, 100));
  }
  
  setSectionsExpanded(prev => ({ ...prev, chapterEditor: true }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition">
  Редактировать
</button>
                              <button onClick={() => deleteChapter(chapter.id)} className="bg-red-900 hover:bg-red-800 p-2 rounded-lg transition">
                                <Trash2 size={16} className="sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border-2 border-red-900">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-red-600">Сохранение работы</h3>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                {selectedWork.isNew ? 'Сохраните работу, чтобы начать добавлять главы.' : 'Сохраните изменения в работе.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button onClick={() => saveWork(true)} disabled={loading} className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition disabled:opacity-50 text-sm sm:text-base md:text-lg">
                  <Save size={20} className="sm:w-6 sm:h-6" />
                  {loading ? 'Сохранение...' : 'Черновик'}
                </button>
                <button onClick={() => saveWork(false)} disabled={loading} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition disabled:opacity-50 text-sm sm:text-base md:text-lg">
                  <Upload size={20} className="sm:w-6 sm:h-6" />
                  {loading ? 'Публикация...' : 'Опубликовать'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}