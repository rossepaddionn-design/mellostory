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
  const [isDarkTheme, setIsDarkTheme] = useState(true);

useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') setIsDarkTheme(false);
}, []);

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
   <div className="min-h-screen text-white" style={{
  background: isDarkTheme
    ? 'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 70%)'
    : '#080808'
}}>
  <style dangerouslySetInnerHTML={{__html: `
  @keyframes twinkle { 0%,100% { opacity:0.15; } 50% { opacity:0.6; } }
  @keyframes goldShimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
  @keyframes h-twinkle { 0%,100% { opacity:0.2; } 50% { opacity:0.7; } }
  .spoiler-text { filter:blur(8px); background:rgba(139,60,200,0.3); cursor:pointer; padding:2px 4px; border-radius:4px; user-select:none; display:inline-block; transition:filter 0.3s ease; }
  .spoiler-text.revealed { filter:blur(0); background:transparent; user-select:text; }
`}} />

      {/* HEADER */}
<header className="border-b py-4 px-8 sticky top-0 z-50" style={{
  background: isDarkTheme
    ? 'radial-gradient(ellipse at top, rgba(26,10,46,0.95) 0%, rgba(8,8,15,0.95) 70%)'
    : 'rgba(5,3,2,0.97)',
  borderColor: isDarkTheme ? 'rgba(147,112,219,0.3)' : '#1a1508',
  backdropFilter: 'blur(8px)'
}}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href={`/work/${workId}`} className="flex items-center gap-2 hover:opacity-80 transition" 
style={{ color: isDarkTheme ? 'rgba(180,100,255,0.6)' : 'rgba(201,168,76,0.6)' }}>
            <ChevronLeft size={20} />
            Вернуться к работе
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRules(true)}
              className="px-4 py-2 rounded-lg transition"
style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.3)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}
            >
              Правила
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:opacity-80 transition"
             style={{ color: isDarkTheme ? 'rgba(147,112,219,0.6)' : 'rgba(201,168,76,0.5)' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-8">
{/* НАЗВАНИЕ РАБОТЫ + РАЗДЕЛИТЕЛЬ */}
{work && (
  isDarkTheme ? (
    <div style={{ textAlign:'center', marginBottom:'32px', position:'relative' }}>
      {/* Звёзды-декор */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`
          radial-gradient(1px 1px at 15% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 50% 80%, rgba(255,255,255,0.2) 0%, transparent 100%)`,
        animation:'twinkle 4s ease-in-out infinite'
      }}/>
      <div style={{
        fontFamily:'Cinzel, serif',
        fontSize:'clamp(1.5rem, 4vw, 2.5rem)',
        background:'linear-gradient(90deg, #b3e7ef, #ef01cb, #9370db)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        letterSpacing:'6px', marginBottom:'16px',
        position:'relative', zIndex:1
      }}>{work.title}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'8px' }}>
        <div style={{ height:'1px', width:'60px', background:'linear-gradient(90deg, transparent, rgba(147,112,219,0.5))' }}/>
        <span style={{ color:'rgba(180,100,255,0.5)', fontSize:'0.7rem', letterSpacing:'6px' }}>✦ · · · ✦ · · · ✦</span>
        <div style={{ height:'1px', width:'60px', background:'linear-gradient(270deg, transparent, rgba(147,112,219,0.5))' }}/>
      </div>
    </div>
  ) : (
    <div style={{ position:'relative', marginBottom:'32px', paddingLeft:'24px', borderLeft:'3px solid linear-gradient(180deg, transparent, #c9a84c, transparent)' }}>
      {/* Левая золотая полоса */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(180deg, transparent, #c9a84c, transparent)' }}/>
      {/* ⚜ фоном */}
      <div style={{
        position:'absolute', top:'50%', left:'20px',
        transform:'translateY(-50%)',
        fontFamily:'serif', fontSize:'8rem',
        color:'rgba(201,168,76,0.06)',
        pointerEvents:'none', userSelect:'none', lineHeight:1, zIndex:0
      }}>⚜</div>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{
          fontFamily:"'victiriya', Georgia, serif",
          fontSize:'clamp(1.8rem, 4vw, 3rem)',
          backgroundImage:'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 60%, #e8c060 100%)',
          backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          animation:'goldShimmer 4s linear infinite',
          letterSpacing:'4px', fontWeight:400
        }}>{work.title}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'10px' }}>
          <div style={{ height:'1px', flex:1, background:'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }}/>
          <span style={{ color:'rgba(201,168,76,0.5)', fontSize:'1rem', letterSpacing:'8px', fontFamily:'serif' }}>⚜ · · ⚜</span>
        </div>
      </div>
    </div>
  )
)}

        {/* ФОРМА НОВОГО КОММЕНТАРИЯ */}
<div className="rounded-lg p-6 mb-8" style={{
  background: isDarkTheme ? 'rgba(26,10,46,0.6)' : '#080808',
  border: `2px solid ${isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.3)'}`,
  boxShadow: isDarkTheme ? '0 0 30px rgba(147,50,255,0.1)' : 'none'
}}>
         <h3 className="text-lg font-semibold mb-4" style={{
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c',
  letterSpacing: '2px'
}}>
            Написать комментарий
          </h3>
          
          {/* Панель инструментов */}
<div className="flex flex-wrap gap-2 p-3 rounded-lg mb-4" style={{
  background: isDarkTheme ? 'rgba(8,8,15,0.8)' : '#000000',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`
}}>
            <button onClick={() => applyFormatting('bold')} className="px-3 py-2 rounded transition font-bold" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}} title="Жирный">
              <strong>B</strong>
            </button>
            <button onClick={() => applyFormatting('italic')} className="px-3 py-2 rounded transition" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}} title="Курсив">
              <em>I</em>
            </button>
            <button onClick={() => applyFormatting('underline')} className="px-3 py-2 rounded transition" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}} title="Подчеркнутый">
              <u>U</u>
            </button>
            <div className="relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)} className="px-3 py-2 rounded transition" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}} title="Цвет">
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
            <button onClick={() => applyFormatting('spoiler')} className="px-3 py-2 rounded transition" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}} title="Спойлер">
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
  background: isDarkTheme ? 'rgba(8,8,15,0.8)' : '#000000',
  borderColor: isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)',
  color: '#ffffff',
  minHeight: '150px',
  resize: 'vertical'
}}
          />
          
          <button
            onClick={() => sendDiscussion()}
            disabled={!currentUser || !newDiscussion.trim()}
            className="w-full py-3 rounded-lg font-bold transition"
style={{
  background: !currentUser || !newDiscussion.trim()
    ? (isDarkTheme ? 'rgba(147,112,219,0.2)' : 'rgba(201,168,76,0.2)')
    : (isDarkTheme ? 'rgba(147,112,219,0.8)' : '#c9a84c'),
  color: '#ffffff',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.5)' : 'rgba(201,168,76,0.5)'}`,
  boxShadow: !currentUser || !newDiscussion.trim() ? 'none'
    : isDarkTheme ? '0 0 20px rgba(147,112,219,0.4)' : '0 0 15px rgba(201,168,76,0.3)'
}}
          >
            Отправить комментарий
          </button>
        </div>

{/* ЗАГОЛОВОК ОБСУЖДЕНИЕ */}
<div className="mb-8">
  {isDarkTheme ? (
    <div style={{ textAlign:'center' }}>
      <h2 style={{
        fontFamily:'Cinzel, serif',
        fontSize:'1.4rem',
        color:'#e8d5ff',
        letterSpacing:'5px',
        marginBottom:'12px'
      }}>Обсуждение</h2>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px' }}>
        <div style={{ height:'1px', width:'80px', background:'linear-gradient(90deg, transparent, rgba(147,112,219,0.5))' }}/>
        <span style={{ color:'rgba(180,100,255,0.4)', fontSize:'0.65rem', letterSpacing:'6px' }}>✦ · · · ✦ · · · ✦</span>
        <div style={{ height:'1px', width:'80px', background:'linear-gradient(270deg, transparent, rgba(147,112,219,0.5))' }}/>
      </div>
    </div>
  ) : (
    <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
      <div style={{ width:'3px', height:'40px', background:'linear-gradient(180deg, transparent, #c9a84c, transparent)', flexShrink:0 }}/>
      <div>
        <h2 style={{
          fontFamily:'Cinzel, serif',
          fontSize:'1.4rem',
          backgroundImage:'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 100%)',
          backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          animation:'goldShimmer 4s linear infinite',
          letterSpacing:'4px', marginBottom:'6px'
        }}>Обсуждение</h2>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ height:'1px', width:'100px', background:'linear-gradient(90deg, rgba(201,168,76,0.4), transparent)' }}/>
          <span style={{ color:'rgba(201,168,76,0.4)', fontSize:'0.7rem', letterSpacing:'4px', fontFamily:'serif' }}>⚜ · · ⚜</span>
        </div>
      </div>
    </div>
  )}
</div>

        {/* СПИСОК КОММЕНТАРИЕВ */}
        <div className="space-y-4">
          {discussions.length === 0 ? (
 <div className="text-center py-12 rounded-lg" style={{
  background: isDarkTheme ? 'rgba(26,10,46,0.4)' : '#080808',
  border: `2px solid ${isDarkTheme ? 'rgba(147,112,219,0.2)' : 'rgba(201,168,76,0.2)'}`
}}>
  <p style={{ color: isDarkTheme ? 'rgba(180,100,255,0.5)' : 'rgba(201,168,76,0.5)' }}>Пока нет комментариев. Будьте первым!</p>
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
  : isDarkTheme
    ? 'linear-gradient(rgba(26,10,46,0.8), rgba(26,10,46,0.8)), linear-gradient(135deg, #9370db 0%, #000000 100%)'
    : 'linear-gradient(#080808, #080808), linear-gradient(135deg, #c9a84c 0%, #000000 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box'
}}
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base" style={{ color: disc.nickname === 'Мелло' ? '#550112' : isDarkTheme ? '#d8b4fe' : '#c9a84c' }}>
                          {disc.nickname}
                        </span>
                        <span 
                          className="text-xs px-2 py-0.5 sm:py-1 rounded" 
                          style={{ 
                           background: disc.nickname === 'Мелло' ? '#550112' : isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.3)',
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
  background: 'transparent',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.3)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
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
  background: 'transparent',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.3)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}
                            >
                              ...
                            </button>
                            
                            {openMenuId === disc.id && (
<div 
  className="absolute top-full mt-2 right-0 rounded-lg p-2 z-20 min-w-[140px] sm:min-w-[180px]"
  style={{
    background: isDarkTheme ? 'rgba(20,8,36,0.97)' : '#080808',
    border: '1px solid transparent',
    backgroundImage: isDarkTheme
      ? 'none'
      : 'none',
    boxShadow: isDarkTheme
      ? '0 0 20px rgba(147,112,219,0.3), inset 0 0 20px rgba(0,0,0,0.5)'
      : '0 0 20px rgba(201,168,76,0.15)',
    borderLeft: `2px solid ${isDarkTheme ? 'rgba(147,112,219,0.6)' : '#c9a84c'}`,
    backdropFilter: 'blur(10px)'
  }}
>
  <button
    onClick={() => { setEditingComment(disc.id); setEditText(disc.message); setOpenMenuId(null); }}
    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded transition text-sm"
    style={{ color: isDarkTheme ? '#d8b4fe' : '#c9a84c' }}
    onMouseEnter={e => e.currentTarget.style.background = isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    {isDarkTheme ? '✦ ' : '⚜ '}Редактировать
  </button>
  <div style={{ height:'1px', margin:'2px 0', background: isDarkTheme ? 'rgba(147,112,219,0.2)' : 'rgba(201,168,76,0.2)' }}/>
  <button
    onClick={() => { setOpenMenuId(null); deleteDiscussion(disc.id); }}
    className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded transition text-sm"
    style={{ color: '#c0392b' }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.1)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    {isDarkTheme ? '✦ ' : '⚜ '}Удалить
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
                   <span className="text-xs" style={{ color: isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.35)' }}>
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
  background: isDarkTheme ? 'rgba(26,10,46,0.6)' : '#080808',
  border: `2px solid ${disc.nickname === 'Мелло' ? '#550112' : isDarkTheme ? 'rgba(147,112,219,0.5)' : 'rgba(201,168,76,0.3)'}`
}}>
<h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: isDarkTheme ? '#d8b4fe' : '#c9a84c', letterSpacing: '1px' }}>
  Редактирование комментария
</h4>
                        
<div className="flex flex-wrap gap-1 sm:gap-2 p-2 rounded-lg mb-2 sm:mb-3" style={{
  background: isDarkTheme ? 'rgba(8,8,15,0.8)' : '#000000',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`
}}>
                          <button onClick={() => applyFormatting('bold', 'edit')} className="px-2 py-1 rounded transition text-xs font-bold" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
                            <strong>B</strong>
                          </button>
                          <button onClick={() => applyFormatting('italic', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
                            <em>I</em>
                          </button>
                          <button onClick={() => applyFormatting('underline', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
                            <u>U</u>
                          </button>
                          <div className="relative">
                            <button onClick={() => setShowEditColorPicker(!showEditColorPicker)} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
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
                          <button onClick={() => applyFormatting('spoiler', 'edit')} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
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
  background: isDarkTheme ? 'rgba(8,8,15,0.8)' : '#000000',
  borderColor: isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)',
  color: '#ffffff',
  minHeight: '150px',
  resize: 'vertical'
}}
                        />
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => editDiscussion()}
                            className="px-3 sm:px-4 py-2 rounded-lg font-bold transition text-sm"
style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.8)' : '#c9a84c',
  color: '#ffffff',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.5)' : 'rgba(201,168,76,0.5)'}`,
  boxShadow: isDarkTheme ? '0 0 20px rgba(147,112,219,0.4)' : '0 0 15px rgba(201,168,76,0.3)'
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
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.3)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}

                    {replyingTo === disc.id && (
<div className="mt-4 p-4 rounded-lg" style={{ 
  background: isDarkTheme ? 'rgba(26,10,46,0.6)' : '#080808',
  border: `2px solid ${disc.nickname === 'Мелло' ? '#550112' : isDarkTheme ? 'rgba(147,112,219,0.5)' : 'rgba(201,168,76,0.3)'}`
}}>
                        <div className="space-y-3">
<div className="flex flex-wrap gap-2 p-2 rounded-lg" style={{
  background: isDarkTheme ? 'rgba(8,8,15,0.8)' : '#000000',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`
}}>
                            <button onClick={() => applyFormatting('bold', 'reply')} className="px-2 py-1 rounded transition text-xs font-bold" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
                              <strong>B</strong>
                            </button>
                            <button onClick={() => applyFormatting('italic', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
                              <em>I</em>
                            </button>
                            <button onClick={() => applyFormatting('underline', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
                              <u>U</u>
                            </button>
                            <div className="relative">
                              <button onClick={() => setShowReplyColorPicker(!showReplyColorPicker)} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
                                <span style={{ filter: 'grayscale(100%)' }}>🎨</span>
                              </button>
{showReplyColorPicker && (
  <div className="absolute top-full mt-1 left-0 p-2 rounded-lg border z-10 flex gap-1" style={{
    background: '#000',
    borderColor: isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'
  }}>
                                  {colors.map(color => (
                                    <button key={color} onClick={() => applyFormatting(color, 'reply')} className="w-6 h-6 rounded border-2 border-white transition hover:scale-110" style={{ background: color }} />
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={() => applyFormatting('spoiler', 'reply')} className="px-2 py-1 rounded transition text-xs" style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.15)' : 'rgba(201,168,76,0.1)',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
}}>
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
  background: isDarkTheme ? 'rgba(8,8,15,0.8)' : '#000000',
  borderColor: isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.25)',
  color: '#ffffff',
  minHeight: '150px',
  resize: 'vertical'
}}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendDiscussion(disc.id)}
                              className="px-4 py-2 rounded-lg font-bold transition"
style={{
  background: isDarkTheme ? 'rgba(147,112,219,0.8)' : '#c9a84c',
  color: '#ffffff',
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.5)' : 'rgba(201,168,76,0.5)'}`,
  boxShadow: isDarkTheme ? '0 0 20px rgba(147,112,219,0.4)' : '0 0 15px rgba(201,168,76,0.3)'
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
  border: `1px solid ${isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.3)'}`,
  color: isDarkTheme ? '#d8b4fe' : '#c9a84c'
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
  backgroundImage: isDarkTheme
  ? 'linear-gradient(rgba(20,8,36,0.9), rgba(20,8,36,0.9)), linear-gradient(135deg, #7c3aed 0%, #000000 100%)'
  : 'linear-gradient(#050303, #050303), linear-gradient(135deg, #6b0015 0%, #000000 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box'
}}
                      >
                        <div className="mb-2 pb-2 border-b" style={{ borderColor: '#65635d' }}>
                      <span className="text-xs" style={{ color: isDarkTheme ? 'rgba(147,112,219,0.5)' : 'rgba(201,168,76,0.4)' }}>
  Ответ на комментарий <span style={{ color: isDarkTheme ? '#d8b4fe' : '#c9a84c' }}>{disc.nickname}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
<span className="font-bold text-xs sm:text-sm" style={{ color: reply.nickname === 'Мелло' ? '#550112' : isDarkTheme ? '#d8b4fe' : '#c9a84c' }}>
  {reply.nickname}
</span>
                            <span 
                              className="text-xs px-2 py-0.5 rounded" 
style={{ 
  background: reply.nickname === 'Мелло' ? '#550112' : isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.3)',
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
  style={{ color: isDarkTheme ? '#d8b4fe' : '#c9a84c' }}
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
                        <span className="text-xs" style={{ color: isDarkTheme ? 'rgba(147,112,219,0.4)' : 'rgba(201,168,76,0.35)' }}>
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
background: currentPage === 1
  ? (isDarkTheme ? 'rgba(147,112,219,0.1)' : 'rgba(201,168,76,0.1)')
  : (isDarkTheme ? 'rgba(147,112,219,0.6)' : '#c9a84c'),
color: currentPage === 1
  ? (isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.3)')
  : '#000000',
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
  background: currentPage * commentsPerPage >= discussions.filter(d => !d.parent_comment_id).length
    ? (isDarkTheme ? 'rgba(147,112,219,0.1)' : 'rgba(201,168,76,0.1)')
    : (isDarkTheme ? 'rgba(147,112,219,0.6)' : '#c9a84c'),
  color: currentPage * commentsPerPage >= discussions.filter(d => !d.parent_comment_id).length
    ? (isDarkTheme ? 'rgba(147,112,219,0.3)' : 'rgba(201,168,76,0.3)')
    : '#000000',
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
    backgroundColor: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(10px)'
  }}>
    {isDarkTheme ? (
      /* ТЁМНАЯ — МИСТИКА */
      <div style={{
        background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #08080f 80%)',
        border: '1px solid rgba(180,100,255,0.25)',
        boxShadow: '0 0 80px rgba(147,50,255,0.15), inset 0 0 80px rgba(0,0,0,0.5)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '580px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Верхняя линия */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(90deg, transparent, #9370db, #ef01cb, transparent)' }}/>
        {/* Звёзды */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 15%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.25) 0%, transparent 100%)`,
          animation:'twinkle 4s ease-in-out infinite' }}/>
        
        {/* Кнопка закрыть */}
        <button onClick={() => setShowRules(false)} style={{
          position:'absolute', top:'14px', right:'14px',
          background:'rgba(180,100,255,0.1)', border:'1px solid rgba(180,100,255,0.3)',
          borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer',
          color:'rgba(180,100,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center'
        }}><X size={16}/></button>

        {/* Заголовок */}
        <div style={{ textAlign:'center', marginBottom:'24px', position:'relative', zIndex:1 }}>
          <div style={{ fontFamily:'Cinzel, serif', fontSize:'1.8rem',
            background:'linear-gradient(90deg, #b3e7ef, #ef01cb, #9370db)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'6px', marginBottom:'12px' }}>Правила</div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
            <div style={{ height:'1px', width:'50px', background:'linear-gradient(90deg, transparent, rgba(147,112,219,0.5))' }}/>
            <span style={{ color:'rgba(180,100,255,0.5)', fontSize:'0.65rem', letterSpacing:'6px' }}>✦ · · · ✦ · · · ✦</span>
            <div style={{ height:'1px', width:'50px', background:'linear-gradient(270deg, transparent, rgba(147,112,219,0.5))' }}/>
          </div>
        </div>

        {/* Правила */}
        <div style={{ position:'relative', zIndex:1, marginBottom:'20px' }}>
          {[
            'Запрещено оскорблять в любой форме автора и читателей. Вы можете высказываться как угодно о персонажах истории, но не о реальных людях.',
            'Запрещена реклама, флуд и спам.',
            'Запрещено упоминать или обсуждать политические темы.',
            'Запрещено разжигание ненависти по любому признаку.',
            'Запрещено распространение запрещённой информации и нарушение законодательства.'
          ].map((rule, i) => (
            <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'12px', alignItems:'flex-start' }}>
              <span style={{ color:'rgba(180,100,255,0.6)', flexShrink:0, marginTop:'2px' }}>✦</span>
              <p style={{ color:'rgba(200,185,230,0.85)', fontSize:'0.9rem', lineHeight:'1.6', fontFamily:'Georgia, serif', fontStyle:'italic' }}>{rule}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign:'center', fontSize:'0.7rem', color:'rgba(147,112,219,0.4)',
          letterSpacing:'1px', marginBottom:'20px', fontFamily:'Georgia, serif', fontStyle:'italic',
          borderTop:'1px solid rgba(147,112,219,0.15)', paddingTop:'14px', position:'relative', zIndex:1 }}>
          Нарушение правил → предупреждение. Повторное → бан.
        </p>

        <button onClick={() => setShowRules(false)} style={{
          width:'100%', padding:'12px',
          background:'rgba(147,112,219,0.15)',
          border:'1px solid rgba(147,112,219,0.5)',
          color:'#d8b4fe',
          fontFamily:'Cinzel, serif', fontSize:'0.7rem', letterSpacing:'4px', textTransform:'uppercase',
          cursor:'pointer', borderRadius:'4px',
          boxShadow:'0 0 20px rgba(147,112,219,0.2)',
          position:'relative', zIndex:1
        }}>✦ Понятно ✦</button>
      </div>
    ) : (
      /* СВЕТЛАЯ — ЗОЛОТО */
      <div style={{
        background: '#080808',
        border: '1px solid #2a2218',
        borderRadius: '4px',
        width: '100%',
        maxWidth: '580px',
        padding: '0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Левая золотая полоса */}
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'3px',
          background:'linear-gradient(180deg, transparent, #c9a84c, transparent)' }}/>
        {/* ⚜ фоном */}
        <div style={{ position:'absolute', top:'50%', right:'30px',
          transform:'translateY(-50%)', fontFamily:'serif', fontSize:'12rem',
          color:'rgba(201,168,76,0.04)', pointerEvents:'none', userSelect:'none', lineHeight:1 }}>⚜</div>

        <div style={{ padding:'32px 36px' }}>
          {/* Кнопка закрыть */}
          <button onClick={() => setShowRules(false)} style={{
            position:'absolute', top:'16px', right:'16px',
            background:'transparent', border:'1px solid rgba(201,168,76,0.3)',
            borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer',
            color:'rgba(201,168,76,0.7)', display:'flex', alignItems:'center', justifyContent:'center'
          }}><X size={15}/></button>

          {/* Заголовок */}
          <div style={{ marginBottom:'24px', position:'relative', zIndex:1 }}>
            <div style={{ fontFamily:"'victiriya', Georgia, serif", fontSize:'2.5rem',
              backgroundImage:'linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              animation:'goldShimmer 4s linear infinite',
              letterSpacing:'4px', fontWeight:400, marginBottom:'10px' }}>Правила</div>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ height:'1px', width:'80px', background:'linear-gradient(90deg, rgba(201,168,76,0.5), transparent)' }}/>
              <span style={{ color:'rgba(201,168,76,0.5)', fontSize:'0.8rem', letterSpacing:'6px', fontFamily:'serif' }}>⚜ · · ⚜</span>
            </div>
          </div>

          {/* Правила */}
          <div style={{ position:'relative', zIndex:1, marginBottom:'20px' }}>
            {[
              'Запрещено оскорблять в любой форме автора и читателей. Вы можете высказываться как угодно о персонажах истории, но не о реальных людях.',
              'Запрещена реклама, флуд и спам.',
              'Запрещено упоминать или обсуждать политические темы.',
              'Запрещено разжигание ненависти по любому признаку.',
              'Запрещено распространение запрещённой информации и нарушение законодательства.'
            ].map((rule, i) => (
              <div key={i} style={{ display:'flex', gap:'10px', marginBottom:'12px', paddingLeft:'8px',
                borderLeft: i === 0 ? '1px solid rgba(201,168,76,0.3)' : 'none' }}>
                <span style={{ color:'rgba(201,168,76,0.6)', flexShrink:0 }}>⚜</span>
                <p style={{ color:'#d0c8b8', fontSize:'0.88rem', lineHeight:'1.6', fontFamily:'Georgia, serif' }}>{rule}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign:'center', fontSize:'0.7rem', color:'rgba(201,168,76,0.35)',
            letterSpacing:'1px', marginBottom:'20px', fontFamily:'Georgia, serif', fontStyle:'italic',
            borderTop:'1px solid rgba(201,168,76,0.15)', paddingTop:'14px' }}>
            Нарушение правил → предупреждение. Повторное → бан.
          </p>

          <button onClick={() => setShowRules(false)} style={{
            width:'100%', padding:'12px',
            background:'transparent',
            border:'1px solid rgba(201,168,76,0.5)',
            color:'#c9a84c',
            fontFamily:'Cinzel, serif', fontSize:'0.65rem', letterSpacing:'4px', textTransform:'uppercase',
            cursor:'pointer', borderRadius:'1px'
          }}>⚜ Понятно ⚜</button>
        </div>
      </div>
    )}
  </div>
)}

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ */}
{showConfirmModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
    backgroundColor: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(10px)'
  }}>
    {isDarkTheme ? (
      /* ТЁМНАЯ */
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
          animation:'twinkle 4s ease-in-out infinite' }}/>

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
      /* СВЕТЛАЯ */
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
    </div>
  );
}