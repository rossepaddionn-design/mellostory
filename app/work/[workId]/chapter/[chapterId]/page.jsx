'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCachedChapterText, prefetchNextChapter } from '@/lib/chapterCache';
import { useParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

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

  const t = {
    backToWork: 'К описанию работы',
    backToMain: 'На главную',
    loading: 'Загрузка...',
    notFound: 'Глава не найдена',
    chapterText: 'Текст главы',
    authorNote: 'Примечание автора',
    images: 'Изображения',
    audio: 'Аудио',
    previousChapter: 'Предыдущая',
    nextChapter: 'Следующая',
    chapters: 'Главы'
  };

  // Загрузка данных при смене главы
  useEffect(() => {
    if (chapterId && workId) {
      loadAllData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [chapterId, workId]);

  // PREFETCH следующей главы
  useEffect(() => {
    if (chapter && allChapters.length > 0) {
      const nextCh = getNextChapter();
      if (nextCh) {
        prefetchNextChapterData(nextCh.id);
      }
    }
  }, [chapter, allChapters]);

  // ОБРАБОТЧИК КЛИКОВ ПО ПОЯСНЕНИЯМ
  useEffect(() => {
    if (!chapter) return;

    const handleExplanationClick = (e) => {
      const target = e.target;
      
      const hasTooltipClass = target.classList.contains('tooltip-word');
      const titleText = target.getAttribute('title') || target.getAttribute('data-tooltip-text');
      
      if (!titleText && !hasTooltipClass) return;
      if (!titleText) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      let tooltip = target.querySelector('.explanation-tooltip-click');
      
      if (tooltip) {
        tooltip.remove();
        if (!target.getAttribute('title')) {
          target.setAttribute('title', titleText);
        }
        return;
      }
      
      document.querySelectorAll('.explanation-tooltip-click').forEach(t => {
        t.remove();
      });
      
      target.removeAttribute('title');
      target.setAttribute('data-tooltip-text', titleText);
      
      tooltip = document.createElement('div');
      tooltip.className = 'explanation-tooltip-click';
      tooltip.textContent = titleText;
      
      target.style.position = 'relative';
      target.style.display = 'inline-block';
      target.appendChild(tooltip);
    };
    
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

  // Функция prefetch следующей главы
  const prefetchNextChapterData = async (nextChapterId) => {
    try {
      const { data } = await supabase
        .from('chapters')
        .select('text_blob_url')
        .eq('id', nextChapterId)
        .single();
      
      if (data?.text_blob_url) {
        prefetchNextChapter(data.text_blob_url);
      }
    } catch (error) {
      console.error('Prefetch error:', error);
    }
  };

  // Загрузка всех данных
  const loadAllData = async () => {
    setLoading(true);

    try {
      const [chapterRes, workRes, chaptersRes] = await Promise.all([
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
          .select('id, chapter_number, title, text_blob_url')
          .eq('work_id', workId)
          .eq('is_published', true)
          .order('chapter_number', { ascending: true })
      ]);

      if (workRes.data) setWork(workRes.data);
      if (chaptersRes.data) setAllChapters(chaptersRes.data);

      if (chapterRes.data) {
        const chapterData = chapterRes.data;
        
        setChapter({
          ...chapterData,
          content: '<p class="text-gray-500 text-center py-8">Загрузка текста...</p>'
        });
        setLoading(false);

        if (chapterData.text_blob_url) {
          try {
            const textContent = await getCachedChapterText(chapterData.text_blob_url);
            setChapter({
              ...chapterData,
              content: textContent
            });
          } catch (error) {
            console.error('Ошибка загрузки текста:', error);
            setChapter({
              ...chapterData,
              content: '<p class="text-red-500">Ошибка загрузки текста главы</p>'
            });
          }
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
    <div className="min-h-screen text-white" style={{ backgroundColor: '#D3D3D3' }}>
      <header className="border-b py-3 sm:py-4 px-4 sm:px-8 sticky top-0 z-40" style={{
        backgroundColor: '#000000',
        borderColor: '#7f1d1d'
      }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <div className="flex gap-2 sm:gap-4 items-center flex-1 min-w-0">
              <Link href="/" className="text-gray-400 hover:text-red-500 transition text-xs sm:text-sm whitespace-nowrap">
                {t.backToMain}
              </Link>
              <Link href={`/work/${workId}`} className="text-red-600 hover:text-red-500 transition text-xs sm:text-sm whitespace-nowrap hidden sm:inline">
                ← {t.backToWork}
              </Link>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={() => setShowChapterList(true)}
                className="px-2 sm:px-3 py-1 rounded flex items-center gap-1 text-xs sm:text-sm transition"
                style={{
                  backgroundColor: '#7f1d1d',
                  boxShadow: '0 0 10px rgba(127, 29, 29, 0.6)',
                  border: '1px solid #7f1d1d'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#991b1b';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(127, 29, 29, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7f1d1d';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(127, 29, 29, 0.6)';
                }}
              >
                <Menu size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t.chapters}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {showChapterList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.95)'
        }}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{
            backgroundColor: '#1a1a1a',
            border: '2px solid #7f1d1d',
            boxShadow: '0 0 40px rgba(127, 29, 29, 0.6), 0 0 80px rgba(127, 29, 29, 0.3)'
          }}>
            <div className="flex justify-between items-center p-5 sm:p-6" style={{
              borderBottom: '2px solid #7f1d1d',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
            }}>
              <h2 className="text-xl sm:text-2xl font-bold" style={{
                color: '#b91c1c',
                textShadow: '0 0 20px rgba(185, 28, 28, 0.9), 0 0 40px rgba(185, 28, 28, 0.5)'
              }}>
                Содержание
              </h2>
              <button 
                onClick={() => setShowChapterList(false)} 
                className="transition rounded-full p-2"
                style={{
                  color: '#7f1d1d',
                  backgroundColor: 'rgba(127, 29, 29, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(127, 29, 29, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(127, 29, 29, 0.1)';
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{
              backgroundColor: '#0a0a0a'
            }}>
              <div className="space-y-2">
                {allChapters.map((ch) => {
                  const isActive = String(ch.id) === String(chapterId);
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleChapterSelect(ch.id)}
                      className="w-full text-left p-3 sm:p-4 rounded-lg transition-all duration-300"
                      style={{
                        background: isActive 
                          ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)'
                          : '#1a1a1a',
                        border: `2px solid ${isActive ? '#b91c1c' : '#333'}`,
                        boxShadow: isActive 
                          ? '0 0 20px rgba(127, 29, 29, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)' 
                          : '0 2px 6px rgba(0, 0, 0, 0.3)',
                        transform: isActive ? 'scale(1.02)' : 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#2a2a2a';
                          e.currentTarget.style.borderColor = '#7f1d1d';
                          e.currentTarget.style.boxShadow = '0 0 12px rgba(127, 29, 29, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#1a1a1a';
                          e.currentTarget.style.borderColor = '#333';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base sm:text-lg flex-shrink-0" style={{
                          color: isActive ? '#ffffff' : '#7f1d1d',
                          textShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none',
                          minWidth: '30px'
                        }}>
                          {ch.chapter_number}.
                        </span>
                        <span className="text-sm sm:text-base break-words flex-1" style={{
                          color: isActive ? '#ffffff' : '#d1d5db',
                          fontWeight: isActive ? '600' : '400'
                        }}>
                          {ch.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          {work && (
            <p className="mb-2 text-sm sm:text-base break-words font-semibold" style={{
              color: '#000000'
            }}>{work.title}</p>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words" style={{
            color: '#7f1d1d',
            textShadow: '0 0 10px rgba(127, 29, 29, 0.8)'
          }}>
            {chapter.chapter_number}. {chapter.title}
          </h1>
        </div>

        <div className="bg-black rounded-lg p-4 sm:p-6 md:p-8 border-2 mb-6 sm:mb-8" style={{
          borderColor: '#7f1d1d',
          boxShadow: '0 0 20px rgba(127, 29, 29, 0.6), 0 0 40px rgba(127, 29, 29, 0.4), inset 0 0 20px rgba(127, 29, 29, 0.1)'
        }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              .chapter-text-content {
                font-size: 16px !important;
                line-height: 1.8 !important;
                font-family: Georgia, 'Times New Roman', serif !important;
                color: #d1d5db !important;
                text-align: justify !important;
                width: 100% !important;
                max-width: 100% !important;
                white-space: pre-wrap !important;
                word-break: break-word !important;
              }
              
              .chapter-text-content *:not(.tooltip-word):not(.explanation-tooltip-click) {
                font-size: inherit !important;
                font-family: inherit !important;
                color: inherit !important;
                background: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              
              .chapter-text-content strong,
              .chapter-text-content b {
                font-weight: bold !important;
              }
              
              .chapter-text-content em,
              .chapter-text-content i {
                font-style: italic !important;
              }
              
              .chapter-text-content br {
                display: block !important;
              }
              
              @media (max-width: 640px) {
                .chapter-text-content {
                  font-size: 14px !important;
                  text-align: left !important;
                  white-space: pre-wrap !important;
                }
                
                .chapter-text-content br {
                  display: block !important;
                }
              }

              .tooltip-word {
                color: #ef4444 !important;
                cursor: help !important;
                position: static !important;
                display: inline !important;
                font-size: inherit !important;
                font-family: inherit !important;
                background: none !important;
              }

              .explanation-tooltip-click {
                position: fixed !important;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) !important;
                background: rgba(15, 15, 15, 0.98) !important;
                color: #fff !important;
                padding: 12px 16px !important;
                border-radius: 12px !important;
                font-size: 13px !important;
                white-space: pre-wrap !important;
                max-width: 90vw !important;
                max-height: 60vh !important;
                overflow-y: auto !important;
                z-index: 99999 !important;
                border: 2px solid #dc2626 !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7) !important;
                line-height: 1.6 !important;
                text-align: left !important;
                animation: tooltipFadeIn 0.3s ease !important;
                word-wrap: break-word !important;
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
              
              @media (max-width: 640px) {
                .explanation-tooltip-click {
                  max-width: 85vw !important;
                  font-size: 12px !important;
                  padding: 10px 14px !important;
                }
              }
            `
          }} />
          
          <div 
            className="chapter-text-content text-gray-300"
            dangerouslySetInnerHTML={{ __html: chapter.content }}
          />
        </div>

        {chapter.images && chapter.images.length > 0 && (
          <div className="bg-black rounded-lg p-4 sm:p-6 md:p-8 border-2 mb-6 sm:mb-8" style={{
            borderColor: '#7f1d1d',
            boxShadow: '0 0 20px rgba(127, 29, 29, 0.6)'
          }}>
            <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{
              color: '#7f1d1d',
              textShadow: '0 0 10px rgba(127, 29, 29, 0.8)'
            }}>{t.images}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {chapter.images.map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden border-2 border-gray-700">
                  <img src={img} alt={`Image ${i + 1}`} className="w-full h-auto" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {chapter.author_note && (
          <div className="bg-black rounded-lg p-4 sm:p-6 mb-6 sm:mb-8" style={{
            borderLeft: '4px solid #7f1d1d',
            boxShadow: '-5px 0 15px rgba(127, 29, 29, 0.4)'
          }}>
            <h3 className="text-base sm:text-lg font-bold mb-2" style={{
              color: '#7f1d1d'
            }}>{t.authorNote}</h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{chapter.author_note}</p>
          </div>
        )}

        {chapter.audio_url && (
          <div className="bg-black rounded-lg p-4 sm:p-6 md:p-8 border-2 mb-6 sm:mb-8" style={{
            borderColor: '#b91c1c',
            boxShadow: '0 0 25px rgba(185, 28, 28, 0.8), 0 0 50px rgba(185, 28, 28, 0.5)'
          }}>
            <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{
              color: '#b91c1c',
              textShadow: '0 0 15px rgba(185, 28, 28, 0.9)'
            }}>{t.audio}</h3>
            <div className="space-y-3">
              {JSON.parse(chapter.audio_url).map((audio, i) => (
                <div key={i} className="rounded-lg p-3 border-2" style={{
                  backgroundColor: '#0a0a0a',
                  borderColor: '#b91c1c',
                  boxShadow: '0 0 15px rgba(185, 28, 28, 0.5)'
                }}>
                  <p className="text-xs sm:text-sm text-gray-300 mb-2 break-words">{audio.name}</p>
                  <audio controls className="w-full" src={audio.url || audio.data}>
                    Ваш браузер не поддерживает аудио.
                  </audio>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          {prevChapter ? (
            <button 
              onClick={handlePrevClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
              style={{
                backgroundColor: '#1a1a1a',
                border: '2px solid #7f1d1d',
                boxShadow: '0 0 10px rgba(127, 29, 29, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(127, 29, 29, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 10px rgba(127, 29, 29, 0.4)';
              }}
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t.previousChapter}</span>
              <span className="sm:hidden">Пред.</span>
            </button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
          
          <span className="text-xs sm:text-sm order-first sm:order-none font-semibold" style={{
            color: '#000000'
          }}>
            Глава {chapter.chapter_number} из {allChapters.length}
          </span>

          {nextChapter ? (
            <button 
              onClick={handleNextClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
              style={{
                backgroundColor: '#1a1a1a',
                border: '2px solid #7f1d1d',
                boxShadow: '0 0 10px rgba(127, 29, 29, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(127, 29, 29, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 10px rgba(127, 29, 29, 0.4)';
              }}
            >
              <span className="hidden sm:inline">{t.nextChapter}</span>
              <span className="sm:hidden">След.</span>
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
        </div>
      </main>
    </div>
  );
}