'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Trash2, X } from 'lucide-react';

export default function DiscussionPage() {
  const params = useParams();
  const workId = params.workId;
  
  const [work, setWork] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showReplyColorPicker, setShowReplyColorPicker] = useState(false);
  const textareaRef = useRef(null);
  const replyTextareaRef = useRef(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showEditColorPicker, setShowEditColorPicker] = useState(false);
  const editTextareaRef = useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const commentsPerPage = 10;

  const showConfirm = (message, action = null) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const colors = ['#750017', '#8b1ea9', '#41d8ad', '#dbc78a', '#828282', '#1e2beb'];

  useEffect(() => {
    loadWork();
    loadDiscussions();
    checkUser();
  }, [workId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUser(user);
  };

  const loadWork = async () => {
    const { data } = await supabase
      .from('works')
      .select('id, title')
      .eq('id', workId)
      .single();
    if (data) setWork(data);
  };

  const loadDiscussions = async () => {
    try {
      const res = await fetch(`/api/ugc?action=get_discussions&workId=${workId}`);
      const { discussions } = await res.json();
      setDiscussions(discussions || []);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    }
  };

  const applyFormatting = (format, mode = 'new') => {
    let textarea, text, setText;
    
    if (mode === 'reply') {
      textarea = replyTextareaRef.current;
      text = replyText;
      setText = setReplyText;
    } else if (mode === 'edit') {
      textarea = editTextareaRef.current;
      text = editText;
      setText = setEditText;
    } else {
      textarea = textareaRef.current;
      text = newDiscussion;
      setText = setNewDiscussion;
    }
    
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    if (!selectedText) {
      showConfirm('Выделите текст для форматирования');
      return;
    }
    
    let formattedText = '';
    
    switch(format) {
      case 'bold':
        formattedText = `<b>${selectedText}</b>`;
        break;
      case 'italic':
        formattedText = `<i>${selectedText}</i>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'spoiler':
        formattedText = `<spoiler>${selectedText}</spoiler>`;
        break;
      default:
        if (format.startsWith('#')) {
          formattedText = `<color=${format}>${selectedText}</color>`;
        }
    }
    
const newText = text.substring(0, start) + formattedText + text.substring(end);
setText(newText);

// Вычисляем правильную позицию курсора
let cursorPosition;
if (format === 'bold' || format === 'italic' || format === 'underline') {
  // Для простых тегов ставим курсор после закрывающего тега
  cursorPosition = start + formattedText.length;
} else if (format === 'spoiler') {
  // Для спойлера: <spoiler>текст</spoiler> - курсор после </spoiler>
  cursorPosition = start + formattedText.length;
} else if (format.startsWith('#')) {
  // Для цвета: <color=#xxx>текст</color> - курсор после </color>
  cursorPosition = start + formattedText.length;
}

setTimeout(() => {
  textarea.focus();
  textarea.setSelectionRange(cursorPosition, cursorPosition);
}, 0);
    
    setShowColorPicker(false);
    setShowReplyColorPicker(false);
    setShowEditColorPicker(false);
  };

  const renderFormattedText = (text) => {
    if (!text) return text;
    
    let result = text;
    result = result.replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');
    result = result.replace(/<i>(.*?)<\/i>/g, '<em>$1</em>');
    result = result.replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline;">$1</span>');
    result = result.replace(/<color=(#[0-9a-fA-F]{6})>(.*?)<\/color>/g, '<span style="color: $1;">$2</span>');
    result = result.replace(/<spoiler>(.*?)<\/spoiler>/g, '<span class="spoiler-text" onclick="this.classList.toggle(\'revealed\')">$1</span>');
    
    return result;
  };

  const sendDiscussion = async (parentId = null) => {
    if (!currentUser) {
      showConfirm('Войдите, чтобы оставить комментарий');
      return;
    }
    
    const messageToSend = parentId ? replyText : newDiscussion;
    
    if (!messageToSend.trim()) {
      showConfirm('Напишите комментарий');
      return;
    }

    try {
// Проверяем, это админ или обычный пользователь
let nickname;
if (currentUser.email === 'rossepaddionn@gmail.com') {
  nickname = 'Мелло';
} else {
  const { data: profile } = await supabase
    .from('reader_profiles')
    .select('nickname')
    .eq('user_id', currentUser.id)
    .single();
  
  nickname = profile?.nickname || currentUser.email?.split('@')[0] || 'Аноним';
}

      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          userId: currentUser.id,
          workId: workId,
          nickname: nickname,
          message: messageToSend.trim(),
          parentCommentId: parentId
        })
      });

      const result = await res.json();
      
      if (result.success) {
        showConfirm(parentId ? 'Ответ отправлен' : 'Комментарий отправлен');
        if (parentId) {
          setReplyText('');
          setReplyingTo(null);
        } else {
          setNewDiscussion('');
        }
        loadDiscussions();
      } else {
        showConfirm('Ошибка: ' + result.error);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showConfirm('Ошибка: ' + err.message);
    }
  };

  const deleteDiscussion = async (commentId) => {
    if (!currentUser) return;
    
    showConfirm('Удалить комментарий?', async () => {
      try {
        const res = await fetch('/api/ugc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_comment',
            userId: currentUser.id,
            commentId: commentId
          })
        });

        const result = await res.json();
        
        if (result.success) {
          showConfirm('Комментарий удалён');
          loadDiscussions();
        } else {
          showConfirm('Ошибка: ' + result.error);
        }
      } catch (err) {
        console.error('Ошибка:', err);
        showConfirm('Ошибка: ' + err.message);
      }
    });
  };

  const editDiscussion = async () => {
    if (!currentUser || !editText.trim()) return;
    
    try {
      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit_comment',
          userId: currentUser.id,
          commentId: editingComment,
          message: editText.trim()
        })
      });

      const result = await res.json();
      
      if (result.success) {
        showConfirm('Комментарий отредактирован');
        setEditingComment(null);
        setEditText('');
        loadDiscussions();
      } else {
        showConfirm('Ошибка: ' + result.error);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      showConfirm('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <style dangerouslySetInnerHTML={{__html: `
.spoiler-text {
  filter: blur(8px);
  background: rgba(139, 60, 200, 0.3);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  user-select: none;
  display: inline-block;
  transition: filter 0.3s ease;
}

.spoiler-text.revealed {
  filter: blur(0);
  background: transparent;
  user-select: text;
}
      `}} />

      {/* HEADER */}
      <header className="border-b py-4 px-8 sticky top-0 z-50 bg-black" style={{ borderColor: '#65635d' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={`/work/${workId}`} className="flex items-center gap-2 hover:opacity-80 transition" style={{ color: '#65635d' }}>
            <ChevronLeft size={20} />
            Вернуться к работе
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRules(true)}
              className="px-4 py-2 rounded-lg transition"
style={{
  background: 'rgba(101, 99, 93, 0.3)',
  border: 'none',
  color: '#c9c6bb'
}}
            >
              Правила
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:opacity-80 transition"
              style={{ color: '#65635d' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* НАЗВАНИЕ РАБОТЫ */}
        {work && (
          <h1 className="text-2xl font-bold mb-6 uppercase" style={{ color: '#65635d' }}>
            {work.title}
          </h1>
        )}

        {/* ФОРМА НОВОГО КОММЕНТАРИЯ */}
        <div className="rounded-lg p-6 mb-8" style={{ 
          background: '#000000',
          border: '2px solid #c9c6bb'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#c9c6bb' }}>
            Написать комментарий
          </h3>
          
          {/* Панель инструментов */}
          <div className="flex flex-wrap gap-2 p-3 rounded-lg mb-4" style={{
            background: '#000000',
            border: '1px solid #65635d'
          }}>
            <button onClick={() => applyFormatting('bold')} className="px-3 py-2 rounded transition font-bold" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }} title="Жирный">
              <strong>B</strong>
            </button>
            <button onClick={() => applyFormatting('italic')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }} title="Курсив">
              <em>I</em>
            </button>
            <button onClick={() => applyFormatting('underline')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }} title="Подчеркнутый">
              <u>U</u>
            </button>
            <div className="relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)} className="px-3 py-2 rounded transition" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d' }} title="Цвет">
                <span style={{ filter: 'grayscale(100%)' }}>🎨</span>
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#65635d' }}>
                  {colors.map(color => (
                    <button key={color} onClick={() => applyFormatting(color)} className="w-8 h-8 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => applyFormatting('spoiler')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d' }} title="Спойлер">
              <span style={{ filter: 'grayscale(100%)' }}>👁️</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
            rows={6}
            placeholder={currentUser ? "Напишите ваш комментарий..." : "Войдите, чтобы оставить комментарий"}
            disabled={!currentUser}
            className="w-full px-4 py-3 rounded-lg border-2 text-white mb-4"
            style={{
              background: '#000000',
              borderColor: '#65635d',
              minHeight: '150px',
              resize: 'vertical'
            }}
          />
          
          <button
            onClick={() => sendDiscussion()}
            disabled={!currentUser || !newDiscussion.trim()}
            className="w-full py-3 rounded-lg font-bold transition"
            style={{
              background: !currentUser || !newDiscussion.trim() ? 'rgba(201, 198, 187, 0.5)' : '#c9c6bb',
              color: '#000'
            }}
          >
            Отправить комментарий
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#c9c6bb' }}>
            Обсуждение работы
          </h2>
        </div>

        {/* СПИСОК КОММЕНТАРИЕВ */}
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <div className="text-center py-12 rounded-lg" style={{ 
              background: '#000000',
              border: '2px solid #65635d'
            }}>
              <p style={{ color: '#65635d' }}>Пока нет комментариев. Будьте первым!</p>
            </div>
          ) : (
discussions
  .filter(d => !d.parent_comment_id)
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage)
  .map((disc) => (
                <div key={disc.id} className="space-y-3">
                  <div 
                    className="rounded-lg p-3 sm:p-5"
style={{
  background: '#000000',
  border: '3px solid transparent',
  backgroundImage: disc.nickname === 'Мелло' 
    ? 'linear-gradient(#000000, #000000), linear-gradient(135deg, #550112 0%, #000000 100%)'
    : 'linear-gradient(#000000, #000000), linear-gradient(135deg, #c9c6bb 0%, #000000 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box'
}}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base" style={{ color: disc.nickname === 'Мелло' ? '#550112' : '#c9c6bb' }}>
                          {disc.nickname}
                        </span>
                        <span 
                          className="text-xs px-2 py-0.5 sm:py-1 rounded" 
                          style={{ 
                            background: disc.nickname === 'Мелло' ? '#550112' : '#65635d',
                            color: 'white'
                          }}
                        >
                          {disc.nickname === 'Мелло' ? 'Автор' : 'Читатель'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setReplyingTo(disc.id);
                            setReplyText('');
                          }}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition"
                          style={{
                            background: '#000000',
                            border: '1px solid #65635d',
                            color: '#c9c6bb'
                          }}
                        >
                          Ответить
                        </button>
                        
                        {currentUser && disc.user_id === currentUser.id && (
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === disc.id ? null : disc.id)}
                              className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition"
                              style={{
                                background: '#000000',
                                border: '1px solid #65635d',
                                color: '#c9c6bb'
                              }}
                            >
                              ...
                            </button>
                            
                            {openMenuId === disc.id && (
                              <div 
                                className="absolute top-full mt-2 right-0 rounded-lg p-2 z-20 min-w-[140px] sm:min-w-[180px]"
style={{
  background: '#000000',
  border: '3px solid transparent',
  backgroundImage: 'linear-gradient(#000000, #000000), linear-gradient(135deg, #550112 0%, #000000 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box'
}}
                              >
                                <button
                                  onClick={() => {
                                    setEditingComment(disc.id);
                                    setEditText(disc.message);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded transition hover:bg-gray-800 text-sm"
                                  style={{ color: '#c9c6bb' }}
                                >
                                  Редактировать
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    deleteDiscussion(disc.id);
                                  }}
                                  className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded transition hover:bg-gray-800 text-sm"
                                  style={{ color: '#c9c6bb' }}
                                >
                                  Удалить
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className="whitespace-pre-wrap break-words mb-2 text-sm sm:text-base"
                      style={{ color: '#c9c6bb' }}
                      dangerouslySetInnerHTML={{ __html: renderFormattedText(disc.message) }}
                    />
                    <span className="text-xs" style={{ color: '#65635d' }}>
                      {new Date(disc.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
                    {editingComment === disc.id && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg" style={{ 
                        background: '#000000',
                        border: disc.nickname === 'Мелло' ? '2px solid #550112' : '2px solid #c9c6bb'
                      }}>
                        <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: '#c9c6bb' }}>
                          Редактирование комментария
                        </h4>
                        
                        <div className="flex flex-wrap gap-1 sm:gap-2 p-2 rounded-lg mb-2 sm:mb-3" style={{
                          background: '#000000',
                          border: '1px solid #65635d'
                        }}>
                          <button onClick={() => applyFormatting('bold', 'edit')} className="px-2 py-1 rounded transition text-xs font-bold" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }}>
                            <strong>B</strong>
                          </button>
                          <button onClick={() => applyFormatting('italic', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }}>
                            <em>I</em>
                          </button>
                          <button onClick={() => applyFormatting('underline', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }}>
                            <u>U</u>
                          </button>
                          <div className="relative">
                            <button onClick={() => setShowEditColorPicker(!showEditColorPicker)} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d' }}>
                             <span style={{ filter: 'grayscale(100%)' }}>🎨</span>
                            </button>
                            {showEditColorPicker && (
                              <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#65635d' }}>
                                {colors.map(color => (
                                  <button key={color} onClick={() => applyFormatting(color, 'edit')} className="w-5 h-5 sm:w-6 sm:h-6 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={() => applyFormatting('spoiler', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d' }}>
                            <span style={{ filter: 'grayscale(100%)' }}>👁️</span>
                          </button>
                        </div>

                        <textarea
                          ref={editTextareaRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="w-full px-2 sm:px-3 py-2 rounded-lg border text-white mb-2 sm:mb-3 text-sm"
                          style={{ 
                            background: '#000000',
                            borderColor: '#65635d',
                            minHeight: '100px',
                            resize: 'vertical'
                          }}
                        />
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => editDiscussion()}
                            className="px-3 sm:px-4 py-2 rounded-lg font-bold transition text-sm"
                            style={{
                              background: '#c9c6bb',
                              color: '#000'
                            }}
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            className="px-3 sm:px-4 py-2 rounded-lg font-bold transition text-sm"
                            style={{
                              background: 'transparent',
                              border: '1px solid #65635d',
                              color: '#c9c6bb'
                            }}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}

                    {replyingTo === disc.id && (
                      <div className="mt-4 p-4 rounded-lg" style={{ 
                        background: '#000000',
                        border: disc.nickname === 'Мелло' ? '2px solid #550112' : '2px solid #c9c6bb'
                      }}>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 p-2 rounded-lg" style={{
                            background: '#000000',
                            border: '1px solid #65635d'
                          }}>
                            <button onClick={() => applyFormatting('bold', 'reply')} className="px-2 py-1 rounded transition text-xs font-bold" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }}>
                              <strong>B</strong>
                            </button>
                            <button onClick={() => applyFormatting('italic', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }}>
                              <em>I</em>
                            </button>
                            <button onClick={() => applyFormatting('underline', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d', color: '#c9c6bb' }}>
                              <u>U</u>
                            </button>
                            <div className="relative">
                              <button onClick={() => setShowReplyColorPicker(!showReplyColorPicker)} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d' }}>
                                <span style={{ filter: 'grayscale(100%)' }}>🎨</span>
                              </button>
                              {showReplyColorPicker && (
                                <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#65635d' }}>
                                  {colors.map(color => (
                                    <button key={color} onClick={() => applyFormatting(color, 'reply')} className="w-6 h-6 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => applyFormatting('spoiler', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(101, 99, 93, 0.2)', border: '1px solid #65635d' }}>
                              <span style={{ filter: 'grayscale(100%)' }}>👁️</span>
                            </button>
                          </div>

                          <textarea
                            ref={replyTextareaRef}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                            placeholder="Напишите ответ..."
                            className="w-full px-3 py-2 rounded-lg border text-white mb-2"
                            style={{ 
                              background: '#000000',
                              borderColor: '#65635d',
                              minHeight: '100px',
                              resize: 'vertical'
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendDiscussion(disc.id)}
                              className="px-4 py-2 rounded-lg font-bold transition"
                              style={{
                                background: '#c9c6bb',
                                color: '#000'
                              }}
                            >
                              Отправить
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-4 py-2 rounded-lg font-bold transition"
                              style={{
                                background: 'transparent',
                                border: '1px solid #65635d',
                                color: '#c9c6bb'
                              }}
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ОТВЕТЫ НА КОММЕНТАРИЙ */}
                  {discussions
                    .filter(reply => reply.parent_comment_id === disc.id)
                    .map(reply => (
                      <div 
                        key={reply.id}
                        className="ml-4 sm:ml-12 rounded-lg p-3 sm:p-4"
style={{
  background: '#000000',
  border: '3px solid transparent',
  backgroundImage: 'linear-gradient(#000000, #000000), linear-gradient(135deg, #6b0015 0%, #000000 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box'
}}
                      >
                        <div className="mb-2 pb-2 border-b" style={{ borderColor: '#65635d' }}>
                          <span className="text-xs" style={{ color: '#65635d' }}>
                            Ответ на комментарий <span style={{ color: '#c9c6bb' }}>{disc.nickname}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm" style={{ color: '#c9c6bb' }}>
                              {reply.nickname}
                            </span>
                            <span 
                              className="text-xs px-2 py-0.5 rounded" 
                              style={{ 
                                background: reply.nickname === 'Мелло' ? '#550112' : '#65635d',
                                color: 'white',
                                fontSize: '10px'
                              }}
                            >
                              {reply.nickname === 'Мелло' ? 'Автор' : 'Читатель'}
                            </span>
                          </div>
                          
                          {currentUser && reply.user_id === currentUser.id && (
                            <button
                              onClick={() => deleteDiscussion(reply.id)}
                              className="transition text-xs hover:opacity-70"
                              style={{ color: '#c9c6bb' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        <div 
                          className="text-xs sm:text-sm whitespace-pre-wrap break-words mb-2"
                          style={{ color: '#c9c6bb' }}
                          dangerouslySetInnerHTML={{ __html: renderFormattedText(reply.message) }}
                        />
                        <span className="text-xs" style={{ color: '#65635d' }}>
                          {new Date(reply.created_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ))}
                </div>
              ))
          )}
        </div>
        {discussions.filter(d => !d.parent_comment_id).length > commentsPerPage && (
  <div className="flex justify-center gap-4 mt-8">
    <button
      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
      disabled={currentPage === 1}
      className="px-6 py-2 rounded-lg font-bold transition"
      style={{
        background: currentPage === 1 ? 'rgba(101, 99, 93, 0.3)' : '#65635d',
        color: currentPage === 1 ? '#65635d' : '#000',
        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
      }}
    >
      Предыдущая
    </button>
    <button
      onClick={() => setCurrentPage(prev => prev + 1)}
      disabled={currentPage * commentsPerPage >= discussions.filter(d => !d.parent_comment_id).length}
      className="px-6 py-2 rounded-lg font-bold transition"
      style={{
        background: currentPage * commentsPerPage >= discussions.filter(d => !d.parent_comment_id).length ? 'rgba(101, 99, 93, 0.3)' : '#65635d',
        color: currentPage * commentsPerPage >= discussions.filter(d => !d.parent_comment_id).length ? '#65635d' : '#000',
        cursor: currentPage * commentsPerPage >= discussions.filter(d => !d.parent_comment_id).length ? 'not-allowed' : 'pointer'
      }}
    >
      Следующая
    </button>
  </div>
)}
      </main>

      {/* МОДАЛЬНОЕ ОКНО ПРАВИЛ */}
      {showRules && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="rounded-2xl w-full max-w-2xl p-6" style={{
            background: '#000000',
            border: '2px solid #65635d'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#550112' }}>Правила</h2>
              <button
                onClick={() => setShowRules(false)}
                className="p-2 hover:opacity-70 transition"
                style={{ color: '#65635d' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6" style={{ color: '#c9c6bb' }}>
              <div className="flex gap-3">
                <span style={{ color: '#550112' }}>•</span>
                <p>Запрещено оскорблять в любой форме автора и читателей. Вы можете высказываться как угодно о персонажах истории, но не о реальных людях.</p>
              </div>
              
              <div className="flex gap-3">
                <span style={{ color: '#550112' }}>•</span>
                <p>Запрещена реклама, флуд и спам.</p>
              </div>
              
              <div className="flex gap-3">
                <span style={{ color: '#550112' }}>•</span>
                <p>Запрещено упоминать или обсуждать политические темы.</p>
              </div>
              
              <div className="flex gap-3">
                <span style={{ color: '#550112' }}>•</span>
                <p>Запрещено разжигание ненависти по любому признаку.</p>
              </div>
              
              <div className="flex gap-3">
                <span style={{ color: '#550112' }}>•</span>
                <p>Запрещено распространение запрещённой информации и нарушение законодательства.</p>
              </div>
            </div>
            
            <p className="text-xs text-center mb-6" style={{ color: '#65635d' }}>
              Нарушение этих правил в первый раз приведёт к предупреждению от администрации.<br />
              Повторное нарушение приведёт к бану без возможности создать новый аккаунт.
            </p>
            
            <button
              onClick={() => setShowRules(false)}
              className="w-full py-3 rounded-lg font-bold transition"
              style={{
                background: '#65635d',
                color: '#000'
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{
            background: 'radial-gradient(ellipse at center, #000000 0%, #000000 100%)',
            border: '3px solid transparent',
            borderRadius: '16px',
            backgroundClip: 'padding-box',
            position: 'relative',
            backdropFilter: 'blur(20px)',
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
              color: '#c9c6bb'
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
                      background: '#c9c6bb',
                      color: '#000000',
                      boxShadow: '0 0 15px rgba(216, 197, 162, 0.4)',
                      border: 'none'
                    }}
                  >
                    Да
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold transition"
                    style={{
                      background: 'rgba(216, 197, 162, 0.15)',
                      borderColor: '#c9c6bb',
                      border: '2px solid #c9c6bb',
                      color: '#c9c6bb'
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
                    background: '#c9c6bb',
                    color: '#000000',
                    boxShadow: '0 0 15px rgba(216, 197, 162, 0.4)',
                    border: 'none'
                  }}
                >
                  ОК
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}