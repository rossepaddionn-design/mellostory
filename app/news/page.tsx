'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [newForm, setNewForm] = useState({ title: '', content: '' });

  const ADMIN_EMAIL = 'rossepaddionn@gmail.com';
  const MAX_NEWS = 5;

  useEffect(() => {
    checkAdmin();
    loadNews();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    } else {
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession === 'true') setIsAdmin(true);
    }
  };

  const loadNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(MAX_NEWS);
    
    if (!error && data) setNews(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newForm.title.trim() || !newForm.content.trim()) {
      alert('Заполните все поля!');
      return;
    }
    if (news.length >= MAX_NEWS) {
      alert(`Максимум ${MAX_NEWS} записей! Удалите старую перед добавлением.`);
      return;
    }

    const { error } = await supabase.from('site_news').insert({
      title: newForm.title.trim(),
      content: newForm.content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setNewForm({ title: '', content: '' });
      setShowAddModal(false);
      loadNews();
    }
  };

  const handleEdit = async (id: number) => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      alert('Заполните все поля!');
      return;
    }

    const { error } = await supabase
      .from('site_news')
      .update({
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setEditingId(null);
      setEditForm({ title: '', content: '' });
      loadNews();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;

    const { error } = await supabase.from('site_news').delete().eq('id', id);
    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      loadNews();
    }
  };

  const startEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, content: item.content });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-title {
          background: linear-gradient(90deg, #9370db 0%, #ffffff 50%, #9370db 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .news-date {
          color: #b48dc4;
          text-shadow: 0 0 10px rgba(180, 141, 196, 0.5);
        }
      `}</style>

      {/* Header */}
      <div className="bg-black border-b border-gray-800 py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ChevronLeft size={20} />
            <span className="text-sm sm:text-base">Вернуться на главную</span>
          </Link>
          {isAdmin && news.length < MAX_NEWS && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm"
              style={{ background: '#9370db' }}
            >
              <Plus size={18} />
              Добавить
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 shimmer-title">
            Новости и обновления сайта
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: '#9370db' }}></div>
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-2xl p-8 sm:p-12 border-2 text-center" style={{ borderColor: '#9370db' }}>
              <p className="text-gray-400 text-lg">Пока нет новостей</p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl p-6 sm:p-8 border-2 relative"
                  style={{
                    borderColor: idx === 0 ? '#b48dc4' : '#9370db',
                    boxShadow: idx === 0 ? '0 0 25px rgba(180, 141, 196, 0.4)' : '0 0 15px rgba(147, 112, 219, 0.2)'
                  }}
                >
                  {idx === 0 && (
                    <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold rounded-full" style={{ background: '#b48dc4', color: '#000' }}>
                      НОВОЕ
                    </span>
                  )}

                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => startEdit(item)} className="p-2 rounded-full transition" style={{ background: '#9370db' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {editingId === item.id ? (
                    <div className="space-y-4 pr-20">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full bg-gray-900 border rounded px-4 py-2 text-white focus:outline-none"
                        style={{ borderColor: '#9370db' }}
                        placeholder="Заголовок"
                      />
                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        rows={5}
                        className="w-full bg-gray-900 border rounded px-4 py-3 text-white focus:outline-none resize-none"
                        style={{ borderColor: '#9370db' }}
                        placeholder="Содержание"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: '#9370db' }}>
                          <Save size={16} /> Сохранить
                        </button>
                        <button onClick={() => { setEditingId(null); setEditForm({ title: '', content: '' }); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700">
                          <X size={16} /> Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="news-date text-sm mb-2">
                        {new Date(item.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {item.updated_at !== item.created_at && <span className="text-gray-500 ml-2">(обновлено)</span>}
                      </p>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 pr-16">{item.title}</h2>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {isAdmin && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Записей: {news.length} / {MAX_NEWS}
            </p>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-xl p-6 border-2" style={{ background: '#000', borderColor: '#9370db' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold shimmer-title">Новая запись</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                className="w-full bg-gray-900 border rounded px-4 py-3 text-white focus:outline-none"
                style={{ borderColor: '#9370db' }}
                placeholder="Заголовок новости"
              />
              <textarea
                value={newForm.content}
                onChange={(e) => setNewForm({ ...newForm, content: e.target.value })}
                rows={6}
                className="w-full bg-gray-900 border rounded px-4 py-3 text-white focus:outline-none resize-none"
                style={{ borderColor: '#9370db' }}
                placeholder="Содержание новости..."
              />
              <button onClick={handleAdd} className="w-full py-3 rounded-lg font-bold transition" style={{ background: '#9370db' }}>
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black py-6 sm:py-8 text-center text-gray-500 border-t border-gray-800">
        <p className="text-base sm:text-lg mb-2">MelloStory © 2025</p>
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap px-4">
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-purple-400 transition underline">Политика конфиденциальности</Link>
          <span className="text-gray-600">•</span>
          <Link href="/terms" className="text-sm text-gray-400 hover:text-purple-400 transition underline">Пользовательское соглашение</Link>
          <span className="text-gray-600">•</span>
          <Link href="/news" className="text-sm text-purple-400 transition">Новости сайта</Link>
        </div>
      </footer>
    </div>
  );
}