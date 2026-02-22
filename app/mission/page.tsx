'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function MissionPage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
  }, []);

  const p = isDarkTheme
    ? { color:'rgba(200,185,230,0.7)', fontFamily:'Georgia,serif', lineHeight:'1.8', fontSize:'clamp(0.78rem,2vw,0.9rem)' }
    : { color:'rgba(201,168,76,0.6)', fontFamily:'Georgia,serif', lineHeight:'1.8', fontSize:'clamp(0.78rem,2vw,0.9rem)' };

  const sections = [
    {
      title: 'Зачем создан MelloStory?',
      text: 'MelloStory — это независимая авторская платформа, созданная для публикации оригинальных произведений и фанфикшена. Этот сайт родился из желания иметь собственное пространство, где творчество не ограничено правилами сторонних площадок и где каждая работа может быть представлена именно так, как задумал автор.'
    },
    {
      title: 'Для кого этот сайт?',
      text: 'Для всех моих читателей, поклонников к-поп фандомов и тех, кто просто ищет приятное времяпрепровождение за чтением. На платформе вы найдёте как короткие минифики и лонгфики, так и многотомные романы. Весь материал предназначен для взрослой аудитории (18+) и может включать откровенные сцены и сложные тематические аспекты.'
    },
    {
      title: 'Что делает нас особенными?',
      text: 'Полная творческая свобода автора, удобный интерфейс для чтения, возможность обратной связи с автором напрямую, отсутствие рекламы и отвлекающих элементов. Каждая работа получает своё уникальное оформление и внимание к деталям.'
    },
    {
      title: 'Наши ценности',
      text: 'Уважение к читателю и его времени. Честность в предупреждениях о контенте. Качество над количеством. Постоянное развитие и улучшение платформы на основе обратной связи от читателей.'
    },
    {
      title: 'Связь с автором',
      text: 'Зарегистрированные пользователи могут отправлять сообщения автору через личный кабинет. Ваши предложения и конструктивная критика всегда приветствуются и помогают делать работы и сайт лучше!'
    },
  ];

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#000000', color:'#fff' }}>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes msShimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes msGoldShimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes msTwinkle { 0%,100%{opacity:0.15;} 50%{opacity:0.55;} }
        .ms-stars {
          background-image:
            radial-gradient(1px 1px at 6% 11%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 91% 7%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 47% 89%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 77% 54%, rgba(255,255,255,0.22) 0%, transparent 100%),
            radial-gradient(1px 1px at 21% 67%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 31%, rgba(255,255,255,0.18) 0%, transparent 100%);
          animation: msTwinkle 8s ease-in-out infinite;
          pointer-events:none;
        }
        .ms-link-dark { color:rgba(147,112,219,0.5); text-decoration:none; font-family:Cinzel,serif; font-size:clamp(0.55rem,1.3vw,0.65rem); letter-spacing:2px; transition:color 0.2s; }
        .ms-link-dark:hover { color:rgba(239,1,203,0.8); }
        .ms-link-light { color:rgba(201,168,76,0.45); text-decoration:none; font-family:Cinzel,serif; font-size:clamp(0.55rem,1.3vw,0.65rem); letter-spacing:2px; transition:color 0.2s; }
        .ms-link-light:hover { color:#c9a84c; }
        .ms-card-dark:hover { border-color:rgba(239,1,203,0.5) !important; box-shadow:0 0 20px rgba(239,1,203,0.08) !important; }
        .ms-card-light:hover { border-color:rgba(201,168,76,0.35) !important; }
      `}}/>

      {isDarkTheme && <div className="ms-stars" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>}
      {!isDarkTheme && (
        <div style={{position:'fixed',bottom:'4%',right:'1%',fontFamily:'serif',
          fontSize:'clamp(14rem,28vw,22rem)',color:'rgba(201,168,76,0.02)',
          pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>
      )}

      {/* HEADER */}
      <header style={{
        borderBottom:`1px solid ${isDarkTheme?'rgba(147,112,219,0.3)':'rgba(201,168,76,0.2)'}`,
        backgroundColor:'#000000',padding:'12px 24px',position:'relative',zIndex:1
      }}>
        {isDarkTheme && <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1px',
          background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,#9370db,transparent)'}}/>}
        {!isDarkTheme && <div style={{position:'absolute',bottom:0,left:0,right:0,height:'1px',
          background:'linear-gradient(90deg,transparent,#c9a84c,transparent)'}}/>}
        <div style={{maxWidth:'860px',margin:'0 auto'}}>
          <button onClick={() => window.history.back()} style={{
            display:'inline-flex',alignItems:'center',gap:'8px',background:'transparent',
            border: isDarkTheme?'1px solid rgba(180,100,255,0.25)':'1px solid rgba(201,168,76,0.2)',
            borderRadius:'6px',padding:'8px 14px',cursor:'pointer',
            color: isDarkTheme?'rgba(147,112,219,0.6)':'rgba(201,168,76,0.5)',
            fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'2px',textTransform:'uppercase',transition:'all 0.2s'
          }}
            onMouseEnter={e=>e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.1)':'rgba(201,168,76,0.06)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <X size={13}/> Закрыть
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main style={{maxWidth:'860px',margin:'0 auto',padding:'clamp(20px,4vw,48px) clamp(14px,4vw,28px)',position:'relative',zIndex:1}}>

        {/* Основной блок */}
        <div className={isDarkTheme?'ms-card-dark':'ms-card-light'} style={{
          background: isDarkTheme?'radial-gradient(ellipse at top,#0d0518 0%,#050008 95%)':'#080808',
          border: isDarkTheme?'1px solid rgba(147,112,219,0.3)':'1px solid rgba(201,168,76,0.2)',
          borderRadius: isDarkTheme?'14px':'4px',
          padding:'clamp(20px,5vw,48px) clamp(18px,5vw,44px)',
          position:'relative',overflow:'hidden',
          boxShadow: isDarkTheme?'0 0 60px rgba(147,50,255,0.08)':'none',
          transition:'border-color 0.3s, box-shadow 0.3s'
        }}>
          {isDarkTheme && <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
            background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)'}}/>}
          {!isDarkTheme && <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
            background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)'}}/>}

          {/* ЗАГОЛОВОК */}
          <div style={{textAlign:'center',marginBottom:'clamp(28px,5vw,48px)'}}>
            {isDarkTheme ? (
              <>
                <div style={{fontSize:'clamp(1.2rem,3vw,1.8rem)',color:'rgba(180,100,255,0.3)',marginBottom:'10px'}}>✦</div>
                <h1 style={{
                  fontFamily:'Cinzel,serif',fontSize:'clamp(1rem,4vw,1.6rem)',
                  letterSpacing:'clamp(4px,1.5vw,8px)',
                  backgroundImage:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',
                  backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  animation:'msShimmer 4s linear infinite',margin:0,marginBottom:'14px'
                }}>Миссия сайта</h1>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                  <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
                  <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'5px'}}>✦ · · · ✦</span>
                  <div style={{height:'1px',width:'60px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
                </div>
              </>
            ) : (
              <>
                <h1 style={{
                  fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.8rem,6vw,3rem)',
                  backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
                  backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  animation:'msGoldShimmer 4s linear infinite',letterSpacing:'4px',margin:0,marginBottom:'12px'
                }}>Миссия сайта</h1>
                <div style={{display:'flex',alignItems:'center',gap:'12px',justifyContent:'center'}}>
                  <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
                  <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
                  <div style={{height:'1px',width:'80px',background:'linear-gradient(270deg,rgba(201,168,76,0.5),transparent)'}}/>
                </div>
              </>
            )}
          </div>

          {/* СЕКЦИИ */}
          <div style={{display:'flex',flexDirection:'column',gap:'clamp(20px,4vw,32px)'}}>
            {sections.map(({title, text}, i) => (
              <div key={i}>
                {/* Разделитель */}
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'clamp(10px,2vw,14px)'}}>
                  <div style={{
                    fontFamily:'Cinzel,serif',fontSize:'clamp(0.5rem,1.2vw,0.6rem)',letterSpacing:'2px',
                    color: isDarkTheme?'rgba(239,1,203,0.45)':'rgba(201,168,76,0.4)',flexShrink:0
                  }}>{String(i+1).padStart(2,'0')}</div>
                  <div style={{height:'1px',flex:1,background: isDarkTheme
                    ?'linear-gradient(90deg,rgba(239,1,203,0.25),rgba(147,112,219,0.1),transparent)'
                    :'linear-gradient(90deg,rgba(201,168,76,0.25),transparent)'}}/>
                </div>

                {/* Заголовок секции */}
                <h2 style={{
                  fontFamily:'Cinzel,serif',fontSize:'clamp(0.78rem,2.2vw,0.95rem)',
                  letterSpacing:'clamp(2px,0.8vw,4px)',textTransform:'uppercase',
                  marginBottom:'clamp(8px,2vw,12px)',
                  backgroundImage: isDarkTheme
                    ?'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)'
                    :'linear-gradient(90deg,#c9a84c 0%,#f0d080 60%,#c9a84c 100%)',
                  backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  animation: isDarkTheme?'msShimmer 5s linear infinite':'msGoldShimmer 5s linear infinite'
                }}>{title}</h2>

                {/* Текст */}
                <p style={p}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{
        borderTop:`1px solid ${isDarkTheme?'rgba(147,112,219,0.15)':'rgba(201,168,76,0.12)'}`,
        padding:'clamp(20px,4vw,32px) 24px',textAlign:'center',position:'relative',zIndex:1
      }}>
        <p style={{
          fontFamily:'Cinzel,serif',fontSize:'clamp(0.6rem,1.5vw,0.7rem)',letterSpacing:'3px',
          color: isDarkTheme?'rgba(147,112,219,0.4)':'rgba(201,168,76,0.35)',
          marginBottom:'14px',textTransform:'uppercase'
        }}>
          {isDarkTheme?'✦':'⚜'} MelloStory © 2025 {isDarkTheme?'✦':'⚜'}
        </p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',flexWrap:'wrap'}}>
          <Link href="/privacy" className={`ms-link-${isDarkTheme?'dark':'light'}`}>
            Политика конфиденциальности
          </Link>
          <span style={{color: isDarkTheme?'rgba(147,112,219,0.2)':'rgba(201,168,76,0.2)',fontSize:'0.5rem'}}>
            {isDarkTheme?'✦':'⚜'}
          </span>
          <Link href="/terms" className={`ms-link-${isDarkTheme?'dark':'light'}`}>
            Пользовательское соглашение
          </Link>
          <span style={{color: isDarkTheme?'rgba(147,112,219,0.2)':'rgba(201,168,76,0.2)',fontSize:'0.5rem'}}>
            {isDarkTheme?'✦':'⚜'}
          </span>
          <Link href="/mission" className={`ms-link-${isDarkTheme?'dark':'light'}`} style={{
            color: isDarkTheme?'rgba(239,1,203,0.6)':'rgba(201,168,76,0.7)'
          }}>
            Миссия сайта
          </Link>
        </div>
      </footer>
    </div>
  );
}