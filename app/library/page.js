'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, X, Plus, Trash2 } from 'lucide-react';

export default function Library() {
  const [works, setWorks] = useState([]);
  const [category, setCategory] = useState('longfic');
  const [series, setSeries] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [expandedWork, setExpandedWork] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [seriesName, setSeriesName] = useState('');
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [seriesDescription, setSeriesDescription] = useState('');
const [seriesNote, setSeriesNote] = useState('');
const [seriesCoverUrl, setSeriesCoverUrl] = useState('');
const [editingSeries, setEditingSeries] = useState(null);
const [showSeriesColorPicker, setShowSeriesColorPicker] = useState(false);
const [showSeriesNoteColorPicker, setShowSeriesNoteColorPicker] = useState(false);
const [expandedSeries, setExpandedSeries] = useState(null);
const seriesDescriptionRef = useRef(null);
const seriesNoteRef = useRef(null);

  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
    checkUser();
    loadWorks();
    loadSeries();
  }, []);

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

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setUser(session.user);
    }
  };

  const loadWorks = async () => {
    const { data } = await supabase
      .from('works')
      .select('*')
      .eq('is_draft', false)
      .order('created_at', { ascending: false });
    setWorks(data || []);
  };

  const loadSeries = async () => {
    const { data } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false });
    setSeries(data || []);
  };

const handleSeriesCoverUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setSeriesCoverUrl(reader.result);
  };
  reader.readAsDataURL(file);
};

const createSeries = async () => {
  if (!seriesName.trim() || selectedWorks.length === 0 || !seriesDescription.trim()) {
    alert('Заполните название, описание и выберите работы!');
    return;
  }

  const { error } = await supabase
    .from('series')
    .insert({ 
      name: seriesName, 
      work_ids: selectedWorks,
      description: seriesDescription,
      note: seriesNote,
      cover_url: seriesCoverUrl
    });

  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('Серия создана!');
    setShowSeriesModal(false);
    setSeriesName('');
    setSeriesDescription('');
    setSeriesNote('');
    setSeriesCoverUrl('');
    setSelectedWorks([]);
    loadSeries();
  }
};

const updateSeries = async () => {
  if (!seriesName.trim() || selectedWorks.length === 0 || !seriesDescription.trim()) {
    alert('Заполните название, описание и выберите работы!');
    return;
  }

  const { error } = await supabase
    .from('series')
    .update({ 
      name: seriesName, 
      work_ids: selectedWorks,
      description: seriesDescription,
      note: seriesNote,
      cover_url: seriesCoverUrl
    })
    .eq('id', editingSeries);

  if (error) {
    alert('Ошибка: ' + error.message);
  } else {
    alert('Серия обновлена!');
    setShowSeriesModal(false);
    setEditingSeries(null);
    setSeriesName('');
    setSeriesDescription('');
    setSeriesNote('');
    setSeriesCoverUrl('');
    setSelectedWorks([]);
    loadSeries();
  }
};

const applySeriesFormatting = (type, field) => {
  const textarea = field === 'description' ? seriesDescriptionRef.current : seriesNoteRef.current;
  const value = field === 'description' ? seriesDescription : seriesNote;
  const setValue = field === 'description' ? setSeriesDescription : setSeriesNote;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);

  if (!selectedText) return;

  let wrapped = '';
  if (type === 'bold') wrapped = `<strong>${selectedText}</strong>`;
  else if (type === 'italic') wrapped = `<em>${selectedText}</em>`;
  else if (type === 'underline') wrapped = `<u>${selectedText}</u>`;
  else if (type.startsWith('#')) wrapped = `<span style="color:${type}">${selectedText}</span>`;

  const newValue = value.substring(0, start) + wrapped + value.substring(end);
  setValue(newValue);

  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + wrapped.length, start + wrapped.length);
  }, 0);
};

  const deleteSeries = async (seriesId) => {
    if (!confirm('Удалить серию?')) return;
    
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', seriesId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      loadSeries();
    }
  };

  const filteredWorks = category === 'series' 
    ? [] 
    : works.filter(w => w.category === category);

  const getSeriesWorks = (seriesId) => {
    const s = series.find(x => x.id === seriesId);
    if (!s || !s.work_ids) return [];
    return works.filter(w => s.work_ids.includes(w.id));
  };

  const toggleWorkSelection = (workId) => {
    setSelectedWorks(prev => 
      prev.includes(workId) 
        ? prev.filter(id => id !== workId) 
        : [...prev, workId]
    );
  };

return (
  <>
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes shimmer-btn {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      
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

      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg"
            style={{
              background: isDarkTheme ? 'rgba(147, 112, 219, 0.3)' : 'rgba(194, 194, 168, 0.3)',
              border: isDarkTheme ? '1px solid #9370db' : '1px solid #c2c2a8',
              color: isDarkTheme ? '#ffffff' : '#c2c2a8'
            }}
          >
            <ChevronLeft size={20} />
            Назад
          </Link>

<h1 className="text-3xl font-bold mb-8 text-center" style={{
  color: isDarkTheme ? 'transparent' : 'transparent',
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: !isDarkTheme ? 'italic' : 'normal',
  backgroundImage: isDarkTheme 
    ? 'linear-gradient(90deg, #b3e7ef 0%, #ef01cb 50%, #b3e7ef 100%)'
    : 'radial-gradient(ellipse at top left, #c8c0c2 0%, #82713a 100%)',
  backgroundSize: isDarkTheme ? '200% auto' : 'auto',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: isDarkTheme ? 'shimmer-btn 3s linear infinite' : 'none'
}}>
  Библиотека
</h1>

          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            {[
              { key: 'novel', label: 'Романы' },
              { key: 'longfic', label: 'Лонгфики' },
              { key: 'minific', label: 'Минифики' },
              { key: 'series', label: 'Серийные' }
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className="px-6 py-2 rounded-lg transition relative"
                style={{
                  background: category === cat.key 
                    ? (isDarkTheme ? 'rgba(147, 112, 219, 0.5)' : 'rgba(194, 194, 168, 0.5)')
                    : 'transparent',
                  border: isDarkTheme ? '2px solid #9370db' : '2px solid #c2c2a8',
                  color: isDarkTheme ? '#ffffff' : '#c2c2a8'
                }}
              >
                {cat.label}
{cat.key === 'series' && isAdmin && (
  <div
    onClick={(e) => {
      e.stopPropagation();
      setShowSeriesModal(true);
    }}
    className="absolute -top-2 -right-2 rounded-full p-1 cursor-pointer"
    style={{
      background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
      boxShadow: '0 0 10px rgba(147, 112, 219, 0.8)'
    }}
  >
    <Plus size={16} />
  </div>
)}
              </button>
            ))}
          </div>

{category === 'series' ? (
  <div className="grid grid-cols-3 gap-6">
    {series.map(s => (
      <div key={s.id} className="relative">
        {/* Карточка серии */}
        <div 
          onClick={() => setExpandedSeries(s.id)}
          className="cursor-pointer overflow-hidden transition-all duration-300 rounded-lg"
        >
          <div className="aspect-[2/3] bg-gray-800 relative">
            {s.cover_url && (
              <Image 
                src={s.cover_url} 
                alt={s.name} 
                fill 
                className="object-cover" 
              />
            )}
          </div>
          <div className="p-6 bg-black">
            <h3 className="text-xl font-bold text-center mb-3" style={{ 
              color: isDarkTheme ? '#b3e7ef' : '#c9c6bb'
            }}>
              {s.name}
            </h3>
            {s.description && (
              <div 
                className="text-sm text-gray-400 text-center line-clamp-3 mb-4"
                dangerouslySetInnerHTML={{ __html: s.description }}
              />
            )}
            {s.note && (
              <div 
                className="text-xs text-gray-500 text-center line-clamp-2"
                dangerouslySetInnerHTML={{ __html: s.note }}
              />
            )}
          </div>
        </div>

        {/* Кнопки редактирования для админа */}
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingSeries(s.id);
                setSeriesName(s.name);
                setSeriesDescription(s.description || '');
                setSeriesNote(s.note || '');
                setSeriesCoverUrl(s.cover_url || '');
                setSelectedWorks(s.work_ids || []);
                setShowSeriesModal(true);
              }}
              className="bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-full"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSeries(s.id);
              }}
              className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-full"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredWorks.map(work => (
                <div 
                  key={work.id} 
                  onClick={() => setExpandedWork(work)}
                  className="cursor-pointer"
                >
<div className="overflow-hidden transition-all duration-300 rounded-lg">
                    <div className="aspect-[2/3] bg-gray-800 relative">
                      {work.cover_url && (
                        <Image 
                          src={work.cover_url} 
                          alt={work.title} 
                          fill 
                          className="object-cover" 
                        />
                      )}
                    </div>
                    <div className="p-6 bg-black">
                      <h3 className="text-xl font-bold text-center mb-3 text-white">
                        {work.title}
                      </h3>
                      <p className="text-sm text-gray-400 text-center line-clamp-3 mb-4">
                        {work.description}
                      </p>
<div className="flex gap-2 justify-center flex-wrap">
  <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-white">
    {work.direction}
  </span>
  <span className="text-xs bg-red-900 px-3 py-1 rounded-full text-white">
    {work.rating}
  </span>
  <span className="text-xs bg-gray-700 px-3 py-1 rounded-full text-white">
    {work.status}
  </span>
</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

{/* EXPANDED SERIES */}
{expandedSeries && (() => {
  const currentSeries = series.find(x => x.id === expandedSeries);
  if (!currentSeries) return null;
  
  let workIds = [];
  if (Array.isArray(currentSeries.work_ids)) {
    workIds = currentSeries.work_ids;
  } else if (typeof currentSeries.work_ids === 'string') {
    try {
      workIds = JSON.parse(currentSeries.work_ids);
    } catch {
      workIds = [];
    }
  }
  const workIdsNum = workIds.map(id => parseInt(id));
  const seriesWorks = works.filter(w => workIdsNum.includes(w.id));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
      <button 
        onClick={() => setExpandedSeries(null)}
        className="fixed top-8 right-8 rounded-full p-3 transition z-[10001]"
        style={{
          background: isDarkTheme 
            ? 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)'
            : '#c9c6bb'
        }}
      >
        <X size={24} />
      </button>

      <div 
        className="w-full max-w-6xl rounded-lg p-8 max-h-[85vh] overflow-y-auto"
        style={{
          background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.95)',
          border: isDarkTheme ? '2px solid #9370db' : '2px solid #c2c2a8'
        }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center" style={{ 
          color: isDarkTheme ? '#b3e7ef' : '#c9c6bb',
          fontFamily: "'Playfair Display', Georgia, serif"
        }}>
          {currentSeries.name}
        </h2>

        {currentSeries.description && (
          <div 
            className="text-lg text-center mb-4 leading-relaxed"
            style={{ color: isDarkTheme ? '#ffffff' : '#ffffff' }}
            dangerouslySetInnerHTML={{ __html: currentSeries.description }}
          />
        )}

        {currentSeries.note && (
          <div 
            className="text-sm text-center mb-8"
            style={{ color: isDarkTheme ? '#9ca3af' : '#9ca3af' }}
            dangerouslySetInnerHTML={{ __html: currentSeries.note }}
          />
        )}

        <div className="grid grid-cols-4 gap-4 mt-8">
          {seriesWorks.map(work => (
            <div 
              key={work.id} 
              onClick={() => {
                setExpandedSeries(null);
                setExpandedWork(work);
              }}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <div className="overflow-hidden rounded-lg" style={{
                background: isDarkTheme ? 'rgba(147, 112, 219, 0.1)' : 'rgba(194, 194, 168, 0.1)',
                border: isDarkTheme ? '1px solid #9370db' : '1px solid #c2c2a8'
              }}>
                <div className="aspect-[2/3] bg-gray-800 relative">
                  {work.cover_url && (
                    <Image 
                      src={work.cover_url} 
                      alt={work.title} 
                      fill 
                      className="object-cover" 
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-center mb-3" style={{ 
                    color: isDarkTheme ? '#ffffff' : '#ffffff' 
                  }}>
                    {work.title}
                  </h3>
                  <p className="text-sm text-center line-clamp-3 mb-4" style={{ 
                    color: isDarkTheme ? '#9ca3af' : '#9ca3af' 
                  }}>
                    {work.description}
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <span className="text-xs px-3 py-1 rounded-full" style={{
                      background: isDarkTheme ? '#374151' : '#4b5563',
                      color: '#ffffff'
                    }}>
                      {work.direction}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full" style={{
                      background: '#7f1d1d',
                      color: '#ffffff'
                    }}>
                      {work.rating}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full" style={{
                      background: isDarkTheme ? '#374151' : '#4b5563',
                      color: '#ffffff'
                    }}>
                      {work.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
})()}



        {/* EXPANDED WORK */}
        {expandedWork && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4 overflow-y-auto">
            <button 
              onClick={() => setExpandedWork(null)}
              className="fixed top-8 right-8 rounded-full p-3 transition z-[10000]"
              style={{
                background: isDarkTheme 
                  ? 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)'
                  : '#c9c6bb'
              }}
            >
              <X size={24} />
            </button>

            <div 
              className="w-full max-w-4xl"
              style={{ 
                padding: isDarkTheme ? '6px' : '3px',
                background: isDarkTheme 
                  ? 'linear-gradient(135deg, #000000 0%, #8c32d2 50%, #000000 100%)'
                  : 'linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
                borderRadius: '8px'
              }}
            >
              <div 
                className="flex flex-col md:grid md:grid-cols-[260px_1fr] gap-6 p-6 max-h-[85vh] overflow-y-auto" 
                style={{
                  background: isDarkTheme ? '#000000' : 'rgba(0, 0, 0, 0.95)',
                  borderRadius: '8px'
                }}
              >
                <div className="aspect-[2/3] w-full bg-gray-800 rounded-lg overflow-hidden relative">
                  {expandedWork.cover_url && (
                    <Image 
                      src={expandedWork.cover_url} 
                      alt={expandedWork.title} 
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-4" style={{ 
                      color: isDarkTheme ? '#bc8dd8' : '#c9c6bb'
                    }}>
                      {expandedWork.title}
                    </h3>

                    {(expandedWork.fandom || expandedWork.pairing) && (
                      <div className="mb-3 space-y-1">
                        {expandedWork.fandom && (
                          <div className="text-sm">
                            <span className="text-gray-400">Фандом: </span>
                            <span style={{ color: isDarkTheme ? '#e5e5e5' : '#ffffff' }}>
                              {expandedWork.fandom}
                            </span>
                          </div>
                        )}
                        {expandedWork.pairing && (
                          <div className="text-sm">
                            <span className="text-gray-400">Пейринг: </span>
                            <span style={{ color: isDarkTheme ? '#e5e5e5' : '#ffffff' }}>
                              {expandedWork.pairing}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {expandedWork.description && (
                      <p className="text-sm mb-4 leading-relaxed whitespace-pre-wrap" style={{ 
                        color: isDarkTheme ? '#9ca3af' : '#ffffff'
                      }}>
                        {expandedWork.description}
                      </p>
                    )}

<div className="flex gap-2 flex-wrap mb-4">
  <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-white">
    {expandedWork.direction}
  </span>
  <span className="text-xs bg-red-900 px-3 py-1 rounded-full text-white">
    {expandedWork.rating}
  </span>
  <span className="text-xs bg-gray-700 px-3 py-1 rounded-full text-white">
    {expandedWork.status}
  </span>
                    </div>
                  </div>

                  <Link 
                    href={`/work/${expandedWork.id}`}
                    className="block w-full text-white font-bold py-3 rounded-lg text-center transition"
                    style={{
                      background: isDarkTheme 
                        ? 'linear-gradient(135deg, #bc8dd8 0%, #9370db 100%)'
                        : '#c9c6bb',
                      color: isDarkTheme ? '#ffffff' : '#000000'
                    }}
                  >
                    Начать читать
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

 {/* CREATE/EDIT SERIES MODAL */}
{showSeriesModal && isAdmin && (
  <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="rounded-2xl w-full max-w-4xl p-6 border-2 max-h-[90vh] overflow-y-auto" style={{
      background: 'rgba(147, 51, 234, 0.15)',
      borderColor: '#9333ea'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#b3e7ef' }}>
          {editingSeries ? 'Редактировать серию' : 'Создать серию'}
        </h2>
        <button onClick={() => {
          setShowSeriesModal(false);
          setEditingSeries(null);
          setSeriesName('');
          setSeriesDescription('');
          setSeriesNote('');
          setSeriesCoverUrl('');
          setSelectedWorks([]);
        }} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Название */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Название серии *
        </label>
        <input
          type="text"
          value={seriesName}
          onChange={(e) => setSeriesName(e.target.value)}
          placeholder="Введите название"
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      {/* Обложка */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Обложка серии
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleSeriesCoverUpload}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        {seriesCoverUrl && (
          <div className="mt-2 relative w-32 h-48">
            <Image src={seriesCoverUrl} alt="Обложка" fill className="object-cover rounded" />
          </div>
        )}
      </div>

      {/* Описание с редактором */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Описание серии *
        </label>
        
        {/* Панель форматирования */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg mb-2" style={{
          background: '#000000',
          border: '1px solid #9333ea'
        }}>
          <button onClick={() => applySeriesFormatting('bold', 'description')} className="px-3 py-2 rounded transition font-bold" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <strong>B</strong>
          </button>
          <button onClick={() => applySeriesFormatting('italic', 'description')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <em>I</em>
          </button>
          <button onClick={() => applySeriesFormatting('underline', 'description')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <u>U</u>
          </button>
          <div className="relative">
            <button onClick={() => setShowSeriesColorPicker(!showSeriesColorPicker)} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea' }}>
              🎨
            </button>
            {showSeriesColorPicker && (
              <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#9333ea' }}>
                {['#750017', '#8b1ea9', '#41d8ad', '#dbc78a', '#828282', '#1e2beb'].map(color => (
                  <button key={color} onClick={() => applySeriesFormatting(color, 'description')} className="w-8 h-8 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <textarea
          ref={seriesDescriptionRef}
          value={seriesDescription}
          onChange={(e) => setSeriesDescription(e.target.value)}
          placeholder="Описание серии..."
          rows={6}
          className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
          style={{ minHeight: '150px', resize: 'vertical' }}
        />
      </div>

      {/* Примечание с редактором */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#b3e7ef' }}>
          Примечание
        </label>
        
        {/* Панель форматирования */}
        <div className="flex flex-wrap gap-2 p-3 rounded-lg mb-2" style={{
          background: '#000000',
          border: '1px solid #9333ea'
        }}>
          <button onClick={() => applySeriesFormatting('bold', 'note')} className="px-3 py-2 rounded transition font-bold" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <strong>B</strong>
          </button>
          <button onClick={() => applySeriesFormatting('italic', 'note')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <em>I</em>
          </button>
          <button onClick={() => applySeriesFormatting('underline', 'note')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea', color: '#b3e7ef' }}>
            <u>U</u>
          </button>
          <div className="relative">
            <button onClick={() => setShowSeriesNoteColorPicker(!showSeriesNoteColorPicker)} className="px-3 py-2 rounded transition" style={{ background: 'rgba(147, 51, 234, 0.2)', border: '1px solid #9333ea' }}>
              🎨
            </button>
            {showSeriesNoteColorPicker && (
              <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#9333ea' }}>
                {['#750017', '#8b1ea9', '#41d8ad', '#dbc78a', '#828282', '#1e2beb'].map(color => (
                  <button key={color} onClick={() => applySeriesFormatting(color, 'note')} className="w-8 h-8 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <textarea
          ref={seriesNoteRef}
          value={seriesNote}
          onChange={(e) => setSeriesNote(e.target.value)}
          placeholder="Дополнительное примечание..."
          rows={4}
          className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white"
          style={{ minHeight: '100px', resize: 'vertical' }}
        />
      </div>

      {/* Выбор работ */}
      <p className="text-sm text-gray-400 mb-4">Выберите работы для серии: *</p>
      <div className="grid grid-cols-2 gap-4 mb-6 max-h-[300px] overflow-y-auto p-2">
        {works.map(work => (
          <button
            key={work.id}
            onClick={() => toggleWorkSelection(work.id)}
            className="relative"
            style={{
              opacity: selectedWorks.includes(work.id) ? 1 : 0.5,
              border: selectedWorks.includes(work.id) ? '3px solid #9370db' : 'none',
              borderRadius: '8px',
              padding: '4px'
            }}
          >
            <div className="aspect-[2/3] bg-gray-800 relative rounded-lg overflow-hidden">
              {work.cover_url && (
                <Image src={work.cover_url} alt={work.title} fill className="object-cover" />
              )}
            </div>
            <p className="text-xs text-center text-white">{work.title}</p>
          </button>
        ))}
      </div>

      <button
        onClick={editingSeries ? updateSeries : createSeries}
        className="w-full py-3 rounded-lg font-bold"
        style={{
          background: 'linear-gradient(135deg, #9370db 0%, #67327b 100%)',
          color: '#ffffff'
        }}
      >
        {editingSeries ? 'Сохранить изменения' : 'Создать серию'}
      </button>
    </div>
  </div>
)}
      </div>
    </>
  );
}