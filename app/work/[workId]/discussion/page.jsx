'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Trash2 } from 'lucide-react';

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

  const showConfirm = (message, action = null) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const colors = ['#a91e30', '#8b1ea9', '#41d8ad', '#dbc78a', '#ec83c7', '#83eca5'];

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
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
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
      const { data: profile } = await supabase
        .from('reader_profiles')
        .select('nickname')
        .eq('user_id', currentUser.id)
        .single();

      const nickname = profile?.nickname || currentUser.email?.split('@')[0] || 'Аноним';

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
      <header className="border-b py-4 px-8 sticky top-0 z-50 bg-black" style={{ borderColor: '#8b3cc8' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={`/work/${workId}`} className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition">
            <ChevronLeft size={20} />
            Вернуться к работе
          </Link>
          {work && (
            <h1 className="text-lg font-semibold text-gray-300 truncate max-w-md">
              {work.title}
            </h1>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shimmerDiscussion {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }
            .discussion-title {
              background: linear-gradient(90deg, #b3e7ef 0%, #8b3cc8 50%, #b3e7ef 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmerDiscussion 3s linear infinite;
            }
          `}} />
          <h2 className="text-3xl font-bold discussion-title mb-2">
            💬 Обсуждение работы
          </h2>
          <p className="text-gray-400 text-sm">
            Всего комментариев: {discussions.length}
          </p>
        </div>

        {/* ФОРМА НОВОГО КОММЕНТАРИЯ */}
        <div className="rounded-lg p-6 mb-8 border-2" style={{ background: '#000000', borderColor: '#8b3cc8' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#8b3cc8' }}>
            Написать комментарий
          </h3>
          
          {/* Панель инструментов */}
          <div className="flex flex-wrap gap-2 p-3 rounded-lg border mb-4" style={{
            background: 'rgba(139, 60, 200, 0.1)',
            borderColor: '#8b3cc8'
          }}>
            <button onClick={() => applyFormatting('bold')} className="px-3 py-2 rounded transition font-bold" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Жирный">
              <strong>B</strong>
            </button>
            <button onClick={() => applyFormatting('italic')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Курсив">
              <em>I</em>
            </button>
            <button onClick={() => applyFormatting('underline')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Подчеркнутый">
              <u>U</u>
            </button>
            <div className="relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)} className="px-3 py-2 rounded transition" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Цвет">
                🎨
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#8b3cc8' }}>
                  {colors.map(color => (
                    <button key={color} onClick={() => applyFormatting(color)} className="w-8 h-8 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => applyFormatting('spoiler')} className="px-3 py-2 rounded transition" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Спойлер">
              👁️
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
            rows={6}
            placeholder={currentUser ? "Напишите ваш комментарий..." : "Войдите, чтобы оставить комментарий"}
            disabled={!currentUser}
            className="w-full px-4 py-3 rounded-lg border-2 bg-gray-900 text-white mb-4"
            style={{
              borderColor: '#8b3cc8',
              minHeight: '150px',
              resize: 'vertical'
            }}
          />
          
          <button
            onClick={() => sendDiscussion()}
            disabled={!currentUser || !newDiscussion.trim()}
            className="w-full py-3 rounded-lg font-bold transition"
            style={{
              background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
              color: '#fff',
              opacity: !currentUser || !newDiscussion.trim() ? 0.5 : 1
            }}
          >
            Отправить комментарий
          </button>
        </div>

        {/* СПИСОК КОММЕНТАРИЕВ */}
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border-2 border-gray-700">
              <p className="text-gray-500">Пока нет комментариев. Будьте первым!</p>
            </div>
          ) : (
            discussions
              .filter(d => !d.parent_comment_id)
              .map((disc) => (
                <div key={disc.id} className="space-y-3">
<div 
  className="rounded-lg p-3 sm:p-5 border-2 transition"
  style={{
    background: '#000000',
    borderColor: '#8b3cc8',
    boxShadow: '0 0 15px rgba(139, 60, 200, 0.6)'
  }}
>
  <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
    <div className="flex items-center gap-2">
      <span className="font-bold text-sm sm:text-base" style={{ color: '#b3e7ef' }}>
        {disc.nickname}
      </span>
      <span 
        className="text-xs px-2 py-0.5 sm:py-1 rounded" 
        style={{ 
          background: disc.nickname === 'Мелло' ? '#9333ea' : '#700a21',
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
      background: 'rgba(139, 60, 200, 0.2)',
      border: '1px solid #8b3cc8',
      color: '#d9d5dd',
      boxShadow: '0 0 10px rgba(139, 60, 200, 0.3)'
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
          background: 'rgba(139, 60, 200, 0.2)',
          border: '1px solid #8b3cc8',
          color: '#d9d5dd',
          boxShadow: '0 0 10px rgba(139, 60, 200, 0.3)'
        }}
      >
        ...
      </button>
      
      {openMenuId === disc.id && (
        <div 
          className="absolute top-full mt-2 right-0 rounded-lg border-2 p-2 z-20 min-w-[140px] sm:min-w-[180px]"
          style={{
            background: '#000',
            borderColor: '#8b3cc8',
            boxShadow: '0 0 20px rgba(139, 60, 200, 0.6)'
          }}
        >
          <button
            onClick={() => {
              setEditingComment(disc.id);
              setEditText(disc.message);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded transition hover:bg-gray-800 text-sm"
            style={{ color: '#d9d5dd' }}
          >
            Редактировать
          </button>
          <button
            onClick={() => {
              setOpenMenuId(null);
              deleteDiscussion(disc.id);
            }}
            className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded transition hover:bg-gray-800 text-sm"
            style={{ color: '#d9d5dd' }}
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
    className="text-gray-300 whitespace-pre-wrap break-words mb-2 text-sm sm:text-base"
    dangerouslySetInnerHTML={{ __html: renderFormattedText(disc.message) }}
                    />
                    <span className="text-xs text-gray-500">
                      {new Date(disc.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
 {editingComment === disc.id && (
  <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border-2" style={{ 
    background: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#8b3cc8'
  }}>
    <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: '#8b3cc8' }}>
      Редактирование комментария
    </h4>
    
    <div className="flex flex-wrap gap-1 sm:gap-2 p-2 rounded-lg border mb-2 sm:mb-3" style={{
      background: 'rgba(139, 60, 200, 0.1)',
      borderColor: '#8b3cc8'
    }}>
      <button onClick={() => applyFormatting('bold', 'edit')} className="px-2 py-1 rounded transition text-xs font-bold" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Жирный">
        <strong>B</strong>
      </button>
      <button onClick={() => applyFormatting('italic', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Курсив">
        <em>I</em>
      </button>
      <button onClick={() => applyFormatting('underline', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Подчеркнутый">
        <u>U</u>
      </button>
      <div className="relative">
        <button onClick={() => setShowEditColorPicker(!showEditColorPicker)} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Цвет">
          🎨
        </button>
        {showEditColorPicker && (
          <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#8b3cc8' }}>
            {colors.map(color => (
              <button key={color} onClick={() => applyFormatting(color, 'edit')} className="w-5 h-5 sm:w-6 sm:h-6 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
            ))}
          </div>
        )}
      </div>
      <button onClick={() => applyFormatting('spoiler', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Спойлер">
        👁️
      </button>
    </div>

    <textarea
      ref={editTextareaRef}
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      rows={4}
      className="w-full px-2 sm:px-3 py-2 rounded-lg border bg-gray-900 text-white mb-2 sm:mb-3 text-sm"
      style={{ 
        borderColor: '#8b3cc8',
        minHeight: '100px',
        resize: 'vertical'
      }}
    />
    
    <div className="flex gap-2">
      <button
        onClick={() => editDiscussion()}
        className="px-3 sm:px-4 py-2 rounded-lg font-bold transition text-sm"
        style={{
          background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
          color: '#fff'
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
          border: '1px solid #8b3cc8',
          color: '#8b3cc8'
        }}
      >
        Отмена
      </button>
    </div>
  </div>
)}

                    {replyingTo === disc.id && (
                      <div className="mt-4 pl-4 border-l-2 p-4 rounded-lg" style={{ 
                        borderColor: '#8b3cc8',
                        background: 'rgba(0, 0, 0, 0.6)'
                      }}>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 p-2 rounded-lg border" style={{
                            background: 'rgba(139, 60, 200, 0.1)',
                            borderColor: '#8b3cc8'
                          }}>
                            <button onClick={() => applyFormatting('bold', 'reply')} className="px-2 py-1 rounded transition text-xs font-bold" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Жирный">
                              <strong>B</strong>
                            </button>
                            <button onClick={() => applyFormatting('italic', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Курсив">
                              <em>I</em>
                            </button>
                            <button onClick={() => applyFormatting('underline', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Подчеркнутый">
                              <u>U</u>
                            </button>
                            <div className="relative">
                              <button onClick={() => setShowReplyColorPicker(!showReplyColorPicker)} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Цвет">
                                🎨
                              </button>
                              {showReplyColorPicker && (
                                <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{ background: '#000', borderColor: '#8b3cc8' }}>
                                  {colors.map(color => (
                                    <button key={color} onClick={() => applyFormatting(color, 'reply')} className="w-6 h-6 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => applyFormatting('spoiler', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #8b3cc8' }} title="Спойлер">
                              👁️
                            </button>
                          </div>

                          <textarea
                            ref={replyTextareaRef}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                            placeholder="Напишите ответ..."
                            className="w-full px-3 py-2 rounded-lg border bg-gray-900 text-white mb-2"
                            style={{ 
                              borderColor: '#8b3cc8',
                              minHeight: '100px',
                              resize: 'vertical'
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendDiscussion(disc.id)}
                              className="px-4 py-2 rounded-lg font-bold transition"
                              style={{
                                background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
                                color: '#fff'
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
                                border: '1px solid #8b3cc8',
                                color: '#8b3cc8'
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
  className="ml-4 sm:ml-12 rounded-lg p-3 sm:p-4 border-2 transition"
  style={{
    background: '#000000',
    borderColor: '#ef01cb',
    boxShadow: '0 0 15px rgba(239, 1, 203, 0.6)'
  }}
>
  <div className="mb-2 pb-2 border-b" style={{ borderColor: 'rgba(139, 60, 200, 0.3)' }}>
    <span className="text-xs text-gray-400">
      Ответ на комментарий <span style={{ color: '#b3e7ef' }}>{disc.nickname}</span>
    </span>
  </div>
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <span className="font-bold text-xs sm:text-sm" style={{ color: '#b3e7ef' }}>
        {reply.nickname}
      </span>
      <span 
        className="text-xs px-2 py-0.5 rounded" 
        style={{ 
          background: reply.nickname === 'Мелло' ? '#9333ea' : '#700a21',
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
        className="text-red-400 hover:text-red-300 transition text-xs"
      >
        <Trash2 size={14} />
      </button>
    )}
  </div>
  
  <div 
    className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap break-words mb-2"
    dangerouslySetInnerHTML={{ __html: renderFormattedText(reply.message) }}
  />
  <span className="text-xs text-gray-500">
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
      </main>

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="rounded-2xl w-full max-w-md p-6 border-2" style={{
            background: 'rgba(139, 60, 200, 0.15)',
            borderColor: '#8b3cc8',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(139, 60, 200, 0.6)'
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
                      background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
                      boxShadow: '0 0 15px rgba(139, 60, 200, 0.6)'
                    }}
                  >
                    Да
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold transition border-2"
                    style={{
                      background: 'transparent',
                      borderColor: '#8b3cc8',
                      color: '#8b3cc8'
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
                    background: 'linear-gradient(135deg, #8b3cc8 0%, #4a1d6e 100%)',
                    boxShadow: '0 0 15px rgba(139, 60, 200, 0.6)'
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