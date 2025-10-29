'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { MessageSquare, Reply, Trash2, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const workId = params.workId;
  const chapterId = params.chapterId;

  const [chapter, setChapter] = useState(null);
  const [work, setWork] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [showChapterList, setShowChapterList] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const commentsPerPage = 10;

  const t = {
    backToWork: 'К описанию работы',
    backToMain: 'На главную',
    loading: 'Загрузка...',
    notFound: 'Глава не найдена',
    chapterText: 'Текст главы',
    authorNote: 'Примечание автора',
    images: 'Изображения',
    audio: 'Аудио',
    comments: 'Комментарии',
    addComment: 'Написать комментарий',
    reply: 'Ответить',
    cancel: 'Отмена',
    send: 'Отправить',
    loginToComment: 'Войдите, чтобы оставить комментарий',
    previousChapter: 'Предыдущая',
    nextChapter: 'Следующая',
    chapters: 'Главы'
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (chapterId && workId) {
      loadAllData();
      // Скроллим наверх при смене главы
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [chapterId, workId]);
  // ОБРАБОТЧИК КЛИКОВ ПО ПОЯСНЕНИЯМ
  useEffect(() => {
    if (!chapter) return;

    const handleExplanationClick = (e) => {
      const target = e.target;
      
      // Проверяем наличие класса tooltip-word ИЛИ title атрибута
      const hasTooltipClass = target.classList.contains('tooltip-word');
      const titleText = target.getAttribute('title') || target.getAttribute('data-tooltip-text');
      
      if (!titleText && !hasTooltipClass) return;
      if (!titleText) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Проверяем существующий tooltip У ЭТОГО ЭЛЕМЕНТА
      let tooltip = target.querySelector('.explanation-tooltip-click');
      
      if (tooltip) {
        // ЗАКРЫВАЕМ при повторном клике
        tooltip.remove();
        // Возвращаем title обратно
        if (!target.getAttribute('title')) {
          target.setAttribute('title', titleText);
        }
        return; // ВАЖНО: выходим из функции
      }
      
      // Закрываем все другие окошки
      document.querySelectorAll('.explanation-tooltip-click').forEach(t => {
        t.remove();
      });
      
      // Убираем title чтобы не показывалась стандартная подсказка
      target.removeAttribute('title');
      target.setAttribute('data-tooltip-text', titleText);
      
      // Создаём новый tooltip
      tooltip = document.createElement('div');
      tooltip.className = 'explanation-tooltip-click';
      tooltip.textContent = titleText;
      
      target.style.position = 'relative';
      target.style.display = 'inline-block';
      target.appendChild(tooltip);
    };
    
    // Закрываем tooltip при клике вне элемента
    const handleDocumentClick = (e) => {
      if (!e.target.classList.contains('tooltip-word')) {
        document.querySelectorAll('.explanation-tooltip-click').forEach(t => {
          const parent = t.parentElement;
          if (parent) {
            const savedTitle = parent.getAttribute('data-tooltip-text');
            if (savedTitle) parent.setAttribute('title', savedTitle);
          }
          t.remove();
        });
      }
    };
    
    document.addEventListener('click', handleExplanationClick);
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleExplanationClick);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [chapter]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      const { data: profile } = await supabase
        .from('reader_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (profile) setUserProfile(profile);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setCurrentCommentPage(1);

    try {
      const [chapterRes, workRes, chaptersRes, commentsRes] = await Promise.all([
        supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .eq('is_published', true)
          .single(),
        supabase
          .from('works')
          .select('title, id')
          .eq('id', workId)
          .single(),
        supabase
          .from('chapters')
          .select('id, chapter_number, title')
          .eq('work_id', workId)
          .eq('is_published', true)
          .order('chapter_number', { ascending: true }),
        supabase
          .from('comments')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('created_at', { ascending: true })
      ]);

      if (chapterRes.data) setChapter(chapterRes.data);
      if (workRes.data) setWork(workRes.data);
      if (chaptersRes.data) setAllChapters(chaptersRes.data);
      if (commentsRes.data) setComments(commentsRes.data || []);

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }

    setLoading(false);
  };

  const sendComment = async () => {
    if (!newComment.trim() || !user || !userProfile) {
      alert('Напишите комментарий!');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        chapter_id: chapterId,
        user_id: user.id,
        user_nickname: userProfile.nickname,
        comment_text: newComment.trim(),
        parent_comment_id: replyTo
      });

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setNewComment('');
      setReplyTo(null);
      await loadAllData();
    }
  };

  const deleteComment = async (commentId, userId) => {
    if (user?.id !== userId) {
      alert('Вы можете удалять только свои комментарии!');
      return;
    }

    if (!confirm('Удалить комментарий?')) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      await loadAllData();
    }
  };

  const getCommentReplies = (parentId) => {
    return comments.filter(c => c.parent_comment_id === parentId);
  };

  const renderComment = (comment, depth = 0) => {
    const replies = getCommentReplies(comment.id);
    const maxDepth = 3; // Ограничиваем вложенность на мобильных
    
    return (
      <div key={comment.id} style={{ marginLeft: depth > 0 ? (depth > maxDepth ? '20px' : '20px') : '0' }} className="mb-3 sm:mb-4">
        <div className="bg-gray-750 bg-opacity-95 rounded-lg p-3 sm:p-4 border border-gray-600">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-red-500 text-sm sm:text-base break-words">{comment.user_nickname}</span>
              <span className="text-gray-500 text-xs ml-2 block sm:inline">
                {new Date(comment.created_at).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {user && depth < maxDepth && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-gray-400 hover:text-red-500 text-xs sm:text-sm flex items-center gap-1"
                >
                  <Reply size={12} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t.reply}</span>
                </button>
              )}
              {user?.id === comment.user_id && (
                <button
                  onClick={() => deleteComment(comment.id, comment.user_id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={12} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap break-words text-sm sm:text-base">{comment.comment_text}</p>
          
          {replyTo === comment.id && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder={`Ответ для ${comment.user_nickname}...`}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm sm:text-base focus:outline-none focus:border-red-600 mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={sendComment}
                  className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm"
                >
                  {t.send}
                </button>
                <button
                  onClick={() => { setReplyTo(null); setNewComment(''); }}
                  className="bg-gray-700 hover:bg-gray-600 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {replies.length > 0 && (
          <div className="mt-2">
            {replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getPreviousChapter = () => {
    if (!allChapters || allChapters.length === 0) return null;
    const currentIndex = allChapters.findIndex(ch => String(ch.id) === String(chapterId));
    return currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  };

  const getNextChapter = () => {
    if (!allChapters || allChapters.length === 0) return null;
    const currentIndex = allChapters.findIndex(ch => String(ch.id) === String(chapterId));
    return currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  };

  const handlePrevClick = () => {
    const prev = getPreviousChapter();
    if (prev) {
      router.push(`/work/${workId}/chapter/${prev.id}`);
    }
  };

  const handleNextClick = () => {
    const next = getNextChapter();
    if (next) {
      router.push(`/work/${workId}/chapter/${next.id}`);
    }
  };

  const handleChapterSelect = (chId) => {
    router.push(`/work/${workId}/chapter/${chId}`);
    setShowChapterList(false);
  };

  const mainComments = comments.filter(c => !c.parent_comment_id);
  const totalCommentPages = Math.ceil(mainComments.length / commentsPerPage);
  const paginatedComments = mainComments.slice(
    (currentCommentPage - 1) * commentsPerPage,
    currentCommentPage * commentsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-lg sm:text-xl text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl sm:text-2xl text-gray-400 mb-4">{t.notFound}</p>
          <Link href={`/work/${workId}`} className="text-red-600 hover:text-red-500 transition text-sm sm:text-base">
            {t.backToWork}
          </Link>
        </div>
      </div>
    );
  }

  const prevChapter = getPreviousChapter();
  const nextChapter = getNextChapter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      {/* HEADER - АДАПТИВНЫЙ */}
      <header className="bg-gray-950 border-b border-red-900 py-3 sm:py-4 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto">
          {/* НАВИГАЦИЯ */}
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <div className="flex gap-2 sm:gap-4 items-center flex-1 min-w-0">
              <Link href="/" className="text-gray-400 hover:text-red-500 transition text-xs sm:text-sm whitespace-nowrap">
                {t.backToMain}
              </Link>
              <Link href={`/work/${workId}`} className="text-red-600 hover:text-red-500 transition text-xs sm:text-sm whitespace-nowrap hidden sm:inline">
                ← {t.backToWork}
              </Link>
            </div>
            
            {/* КНОПКИ УПРАВЛЕНИЯ */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

              {/* Список глав - мобильная кнопка */}
              <button
                onClick={() => setShowChapterList(true)}
                className="bg-red-600 hover:bg-red-700 px-2 sm:px-3 py-1 rounded flex items-center gap-1 text-xs sm:text-sm"
              >
                <Menu size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t.chapters}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* МОДАЛЬНОЕ ОКНО СПИСКА ГЛАВ */}
      {showChapterList && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col border-2 border-red-600">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-bold text-red-600">{t.chapters} ({allChapters.length})</h2>
              <button onClick={() => setShowChapterList(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {allChapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSelect(ch.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      String(ch.id) === String(chapterId)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <span className="text-sm sm:text-base break-words">
                      {ch.chapter_number}. {ch.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* ЗАГОЛОВОК ГЛАВЫ */}
        <div className="mb-6 sm:mb-8">
          {work && (
            <p className="text-gray-400 mb-2 text-sm sm:text-base break-words">{work.title}</p>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-2 break-words">
            {chapter.chapter_number}. {chapter.title}
          </h1>
        </div>

{/* ТЕКСТ ГЛАВЫ */}
        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-red-900 mb-6 sm:mb-8">
          <style dangerouslySetInnerHTML={{
            __html: `
              /* РАЗМЕР ШРИФТА ТЕКСТА ГЛАВЫ */
              .chapter-text-content {
                font-size: 14px !important;
              }
              
              .chapter-text-content * {
                font-size: 14px !important;
              }
              
              /* ДЛЯ ПК - 15px */
              @media (min-width: 640px) {
                .chapter-text-content {
                  font-size: 15px !important;
                }
                
                .chapter-text-content * {
                  font-size: 15px !important;
                }
              }
              
/* СТИЛИ ДЛЯ ПОЯСНЕНИЙ (КЛИК) */
[title] {
  cursor: pointer;
  position: relative;
}

/* 🔥 ДОБАВЬ ЭТО: */
.tooltip-word {
  position: static !important;
  display: inline !important;
}

.explanation-tooltip-click {
  position: fixed !important;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
  background: rgba(15, 15, 15, 0.98);
  color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  white-space: pre-wrap;
  max-width: 90vw;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 99999;
  border: 2px solid #dc2626;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  line-height: 1.6;
  text-align: left;
  animation: tooltipFadeIn 0.3s ease;
  word-wrap: break-word;
}
              
              @keyframes tooltipFadeIn {
                from {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
              }
              
              /* АДАПТИВ ДЛЯ МОБИЛЬНЫХ */
              @media (max-width: 640px) {
                .explanation-tooltip-click {
                  max-width: 85vw;
                  font-size: 12px;
                  padding: 10px 14px;
                }
              }
            `
          }} />
          
          <div 
            className="chapter-text-content text-gray-300"
            style={{ 
              fontSize: '14px',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.8'
            }}
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        </div>

        {/* ИЗОБРАЖЕНИЯ */}
        {chapter.images && chapter.images.length > 0 && (
          <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-red-900 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">{t.images}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {chapter.images.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden border-2 border-gray-700">
                  <img src={img} alt={`Image ${i + 1}`} className="w-full h-auto" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ПРИМЕЧАНИЕ АВТОРА */}
        {chapter.author_note && (
          <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 border-l-4 border-red-600 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-red-500 mb-2">{t.authorNote}</h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{chapter.author_note}</p>
          </div>
        )}

        {/* АУДИО */}
        {chapter.audio_url && (
          <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-red-900 mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">{t.audio}</h3>
            <div className="space-y-3">
              {JSON.parse(chapter.audio_url).map((audio, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <p className="text-xs sm:text-sm text-gray-300 mb-2 break-words">{audio.name}</p>
                  <audio controls className="w-full" src={audio.data}>
                    Ваш браузер не поддерживает аудио.
                  </audio>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* НАВИГАЦИЯ МЕЖДУ ГЛАВАМИ */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          {prevChapter ? (
            <button 
              onClick={handlePrevClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t.previousChapter}</span>
              <span className="sm:hidden">Пред.</span>
            </button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
          
          <span className="text-gray-400 text-xs sm:text-sm order-first sm:order-none">
            Глава {chapter.chapter_number} из {allChapters.length}
          </span>

          {nextChapter ? (
            <button 
              onClick={handleNextClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
            >
              <span className="hidden sm:inline">{t.nextChapter}</span>
              <span className="sm:hidden">След.</span>
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
        </div>

        {/* КОММЕНТАРИИ */}
        <div className="bg-gray-800 bg-opacity-90 rounded-lg p-4 sm:p-6 md:p-8 border-2 border-red-900">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <MessageSquare size={24} className="sm:w-9 sm:h-9" />
            <span className="break-words">{t.comments} ({mainComments.length})</span>
          </h2>

          {user && userProfile ? (
            <div className="mb-6 sm:mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                placeholder={t.addComment}
                className="w-full bg-gray-850 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-red-600 mb-3"
              />
              <button
                onClick={sendComment}
                disabled={!newComment.trim()}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {t.send}
              </button>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8 bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 text-center">
              <p className="text-gray-400 text-sm sm:text-base">{t.loginToComment}</p>
            </div>
          )}

          <div className="mb-6">
            {mainComments.length === 0 ? (
              <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">Комментариев пока нет. Будьте первым!</p>
            ) : (
              paginatedComments.map(comment => renderComment(comment))
            )}
          </div>

          {/* ПАГИНАЦИЯ КОММЕНТАРИЕВ */}
          {totalCommentPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4 sm:pt-6 border-t border-gray-700 flex-wrap">
              <button
                onClick={() => setCurrentCommentPage(Math.max(1, currentCommentPage - 1))}
                disabled={currentCommentPage === 1}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2"
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              </button>

              {/* УМНАЯ ПАГИНАЦИЯ - показываем не все страницы на мобильном */}
              {totalCommentPages <= 5 ? (
                Array.from({ length: totalCommentPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentCommentPage(page)}
                    className={`px-2 sm:px-3 py-2 rounded transition text-sm sm:text-base ${
                      currentCommentPage === page
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))
              ) : (
                <>
                  {currentCommentPage > 2 && (
                    <>
                      <button
                        onClick={() => setCurrentCommentPage(1)}
                        className="px-2 sm:px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm sm:text-base"
                      >
                        1
                      </button>
                      {currentCommentPage > 3 && <span className="text-gray-500">...</span>}
                    </>
                  )}
                  
                  {[currentCommentPage - 1, currentCommentPage, currentCommentPage + 1]
                    .filter(p => p > 0 && p <= totalCommentPages)
                    .map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentCommentPage(page)}
                        className={`px-2 sm:px-3 py-2 rounded transition text-sm sm:text-base ${
                          currentCommentPage === page
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  
                  {currentCommentPage < totalCommentPages - 1 && (
                    <>
                      {currentCommentPage < totalCommentPages - 2 && <span className="text-gray-500">...</span>}
                      <button
                        onClick={() => setCurrentCommentPage(totalCommentPages)}
                        className="px-2 sm:px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm sm:text-base"
                      >
                        {totalCommentPages}
                      </button>
                    </>
                  )}
                </>
              )}

              <button
                onClick={() => setCurrentCommentPage(Math.min(totalCommentPages, currentCommentPage + 1))}
                disabled={currentCommentPage === totalCommentPages}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 py-2 rounded flex items-center gap-1 sm:gap-2"
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}