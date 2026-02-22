'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function TermsOfService() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
  }, []);

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#000000', color:'#fff' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes termsShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes termsTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.55; } }
        @keyframes termsGoldShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

        .terms-stars {
          background-image:
            radial-gradient(1px 1px at 4% 10%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 93% 6%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 48% 88%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 52%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 68%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 62% 28%, rgba(255,255,255,0.18) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 45%, rgba(255,255,255,0.12) 0%, transparent 100%);
          animation: termsTwinkle 8s ease-in-out infinite;
          pointer-events: none;
        }

        .terms-dark-scroll::-webkit-scrollbar { width: 4px; }
        .terms-dark-scroll::-webkit-scrollbar-track { background: transparent; }
        .terms-dark-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#9370db,#ef01cb,#9370db); border-radius:10px; }
        .terms-dark-scroll { scrollbar-width: thin; scrollbar-color: #9370db transparent; }

        .terms-light-scroll::-webkit-scrollbar { width: 4px; }
        .terms-light-scroll::-webkit-scrollbar-track { background: transparent; }
        .terms-light-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,transparent,#c9a84c,transparent); border-radius:10px; }
        .terms-light-scroll { scrollbar-width: thin; scrollbar-color: #c9a84c transparent; }

        /* Ссылки */
        .terms-link-dark { color: #b3e7ef; text-decoration: underline; transition: color 0.2s; }
        .terms-link-dark:hover { color: #ef01cb; }
        .terms-link-light { color: #c9a84c; text-decoration: underline; transition: color 0.2s; }
        .terms-link-light:hover { color: #f0d080; }

        /* Списки */
        .terms-list { list-style: none; padding: 0; margin: 0; }
        .terms-list li { padding: clamp(3px,0.8vw,5px) 0 clamp(3px,0.8vw,5px) 20px; position: relative; }
        .terms-list-dark li::before { content: '✦'; position: absolute; left: 0; font-size: 0.5rem; color: rgba(239,1,203,0.5); top: 50%; transform: translateY(-50%); }
        .terms-list-light li::before { content: '⚜'; position: absolute; left: 0; font-size: 0.5rem; color: rgba(201,168,76,0.5); top: 50%; transform: translateY(-50%); }

        /* Параграфы */
        .terms-p-dark { color: rgba(200,185,230,0.7); font-family: Georgia, serif; line-height: 1.8; font-size: clamp(0.78rem,2vw,0.9rem); }
        .terms-p-light { color: rgba(201,168,76,0.6); font-family: Georgia, serif; line-height: 1.8; font-size: clamp(0.78rem,2vw,0.9rem); }

        .terms-strong-dark { color: rgba(228,213,255,0.9); }
        .terms-strong-light { color: rgba(201,168,76,0.9); }
      `}} />

      {/* Фон */}
      {isDarkTheme && <div className="terms-stars" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>}
      {!isDarkTheme && (
        <div style={{position:'fixed',bottom:'3%',right:'1%',fontFamily:'serif',
          fontSize:'clamp(14rem,28vw,22rem)',color:'rgba(201,168,76,0.02)',
          pointerEvents:'none',userSelect:'none',lineHeight:1,zIndex:0}}>⚜</div>
      )}

      <div style={{maxWidth:'860px',margin:'0 auto',padding:'clamp(20px,4vw,48px) clamp(14px,4vw,28px)',position:'relative',zIndex:1}}>

        {/* Кнопка закрыть */}
        <button onClick={() => window.history.back()} style={{
          display:'inline-flex',alignItems:'center',gap:'8px',
          background:'transparent',
          border: isDarkTheme ? '1px solid rgba(180,100,255,0.25)' : '1px solid rgba(201,168,76,0.2)',
          borderRadius:'6px',padding:'8px 14px',cursor:'pointer',marginBottom:'clamp(20px,4vw,36px)',
          color: isDarkTheme ? 'rgba(147,112,219,0.6)' : 'rgba(201,168,76,0.5)',
          fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'2px',
          textTransform:'uppercase',transition:'all 0.2s'
        }}
          onMouseEnter={e=>{e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.1)':'rgba(201,168,76,0.06)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
        >
          <X size={13}/> Закрыть
        </button>

        {/* Основной блок */}
        <div style={{
          background: isDarkTheme ? 'radial-gradient(ellipse at top,#0d0518 0%,#050008 95%)' : '#080808',
          border: isDarkTheme ? '1px solid rgba(147,112,219,0.3)' : '1px solid rgba(201,168,76,0.2)',
          borderRadius: isDarkTheme ? '14px' : '4px',
          padding:'clamp(20px,5vw,48px) clamp(18px,5vw,44px)',
          position:'relative',overflow:'hidden',
          boxShadow: isDarkTheme ? '0 0 60px rgba(147,50,255,0.08)' : 'none'
        }}>
          {/* Тёмная — верхняя линия */}
          {isDarkTheme && (
            <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
              background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)'}}/>
          )}
          {/* Светлая — левая полоска */}
          {!isDarkTheme && (
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
              background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)'}}/>
          )}

          {/* ══ ЗАГОЛОВОК ══ */}
          <div style={{textAlign:'center',marginBottom:'clamp(24px,5vw,44px)'}}>
            {isDarkTheme ? (
              <>
                <div style={{fontSize:'clamp(1rem,3vw,1.5rem)',color:'rgba(180,100,255,0.35)',marginBottom:'10px'}}>✦</div>
                <h1 style={{
                  fontFamily:'Cinzel,serif',fontSize:'clamp(1rem,4vw,1.6rem)',
                  letterSpacing:'clamp(3px,1.5vw,7px)',
                  background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',backgroundSize:'200% auto',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  animation:'termsShimmer 4s linear infinite',margin:0,marginBottom:'14px'
                }}>Пользовательское соглашение</h1>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                  <div style={{height:'1px',width:'60px',background:'linear-gradient(90deg,transparent,rgba(147,112,219,0.4))'}}/>
                  <span style={{color:'rgba(180,100,255,0.3)',fontSize:'0.5rem',letterSpacing:'5px'}}>✦ · · · ✦</span>
                  <div style={{height:'1px',width:'60px',background:'linear-gradient(270deg,transparent,rgba(147,112,219,0.4))'}}/>
                </div>
              </>
            ) : (
              <>
                <h1 style={{
                  fontFamily:"'victiriya',Georgia,serif",fontSize:'clamp(1.6rem,6vw,2.8rem)',
                  backgroundImage:'linear-gradient(90deg,#c9a84c 0%,#f0d080 40%,#c9a84c 100%)',
                  backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  animation:'termsGoldShimmer 4s linear infinite',letterSpacing:'4px',margin:0,marginBottom:'12px'
                }}>Пользовательское соглашение</h1>
                <div style={{display:'flex',alignItems:'center',gap:'12px',justifyContent:'center'}}>
                  <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
                  <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
                  <div style={{height:'1px',width:'80px',background:'linear-gradient(270deg,rgba(201,168,76,0.5),transparent)'}}/>
                </div>
              </>
            )}
          </div>

          {/* ══ КОНТЕНТ ══ */}
          <div style={{display:'flex',flexDirection:'column',gap:'clamp(24px,4vw,36px)'}}>

            {[
              {
                num:'1', title:'Общие положения',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>
                      Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует порядок использования веб-сайта <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>MelloStory</strong> (далее — «Сайт») и определяет права и обязанности пользователей.
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                      Сайт управляется с территории Федеративной Республики Германия. К отношениям, регулируемым настоящим Соглашением, применяется законодательство Германии, а в части авторских прав — также международные конвенции, участниками которых является Германия.
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                      Регистрируясь на Сайте или используя его функции, вы подтверждаете, что:
                    </p>
                    <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                      {['Вам исполнилось 18 лет или вы достигли возраста совершеннолетия в вашей стране.',
                        'Вы ознакомились с настоящим Соглашением и обязуетесь его соблюдать.',
                        'Вы предоставили достоверные данные при регистрации.',
                        'Вы понимаете и принимаете юридические последствия нарушения настоящего Соглашения.'
                      ].map((item,i) => (
                        <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              },
              {
                num:'2', title:'Возрастное ограничение (18+)',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>
                      Сайт содержит контент для взрослых (18+), включая сцены насилия, откровенные сексуальные описания и другие материалы, не предназначенные для несовершеннолетних.
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                      <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>Строго запрещается использование Сайта лицами младше 18 лет.</strong>
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>В соответствии с:</p>
                    <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                      {['Законодательством Германии: §184 StGB — распространение порнографических материалов несовершеннолетним; Jugendschutzgesetz (JuSchG) — Закон о защите молодёжи.',
                        'Международными стандартами защиты несовершеннолетних в сети (COPPA, DSA).'
                      ].map((item,i) => (
                        <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>
                      ))}
                    </ul>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                      Администрация не несёт ответственности за последствия доступа к контенту со стороны несовершеннолетних. Ответственность за контроль доступа детей к Сайту лежит на родителях и законных представителях.
                    </p>
                  </div>
                )
              },
              {
                num:'3', title:'Характер контента и художественный вымысел',
                content: (
                  <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>
                      <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>Все материалы, размещённые на Сайте, являются художественным вымыслом и не преследуют целей пропаганды.</strong>
                    </p>

                    {[
                      { sub:'3.1. Художественная литература', items:[
                        'Все произведения на Сайте являются художественным вымыслом и созданы исключительно в развлекательных и творческих целях.',
                        'Сайт не пропагандирует насилие, противоправное поведение, употребление наркотиков, алкоголя или какие-либо иные действия, запрещённые законодательством.',
                        'Описание персонажей, событий и действий в произведениях не является призывом к их воспроизведению в реальной жизни.',
                        'Сайт не содержит инструкций или материалов, направленных на совершение противоправных действий.'
                      ]},
                      { sub:'3.2. Возраст персонажей', items:[
                        'Все персонажи, участвующие в сексуальных, романтических или откровенных сценах, являются совершеннолетними (18+).',
                        'Произведения не содержат описаний сексуального характера с участием несовершеннолетних.',
                        'В случаях, когда персонажи в исходном произведении являются несовершеннолетними, на данном Сайте они изображаются взрослыми (18+).'
                      ]},
                      { sub:'3.3. Тематика произведений', items:[
                        'Романтических и сексуальных отношений между совершеннолетними персонажами.',
                        'Сцен насилия, конфликтов и психологической драмы в контексте художественного повествования.',
                        'Фантастических, мистических и вымышленных миров.',
                        'Все вышеперечисленные элементы представлены исключительно как часть художественного вымысла.'
                      ]},
                      { sub:'3.4. Отсутствие пропаганды', items:[
                        'Экстремизма, терроризма, национальной, расовой или религиозной розни.',
                        'Насилия, жестокости или противоправного поведения.',
                        'Употребления наркотических средств, психотропных веществ, алкоголя.',
                        'Суицида или причинения вреда здоровью.',
                        'Любые упоминания вышеперечисленного в текстах произведений являются частью художественного сюжета и не носят пропагандистского характера.'
                      ]}
                    ].map(({sub, items}) => (
                      <div key={sub}>
                        <SubTitle text={sub} isDarkTheme={isDarkTheme}/>
                        <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                          {items.map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                num:'4', title:'Права и обязанности пользователей',
                content: (
                  <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                    <div>
                      <SubTitle text="4.1. Пользователь имеет право:" isDarkTheme={isDarkTheme}/>
                      <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                        {['Читать литературные произведения, размещённые на Сайте.',
                          'Оценивать работы (ставить оценки от 1 до 10).',
                          'Отправлять сообщения администрации Сайта.',
                          'Добавлять произведения в избранное и сохранять изображения в личную галерею.',
                          'Удалить свою учётную запись в любой момент.'
                        ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <SubTitle text="4.2. Пользователь обязуется:" isDarkTheme={isDarkTheme}/>
                      <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                        {['Не использовать Сайт в незаконных целях.',
                          'Не размещать спам, рекламу или ссылки на сторонние ресурсы без разрешения администрации.',
                          'Не пытаться получить несанкционированный доступ к данным других пользователей или системам Сайта.',
                          'Не использовать автоматизированные средства (боты, скрипты) без разрешения.',
                          'Соблюдать нормы этики в общении с администрацией.',
                          'Не нарушать авторские права, изложенные в разделе 7 настоящего Соглашения.'
                        ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                num:'5', title:'Запрещённые действия',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>Пользователю строго запрещается:</p>
                    <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                      {['Публиковать контент, содержащий материалы сексуального насилия над несовершеннолетними, экстремизм, терроризм, пропаганду насилия или разжигание ненависти.',
                        'Выдавать себя за другого пользователя или администрацию Сайта.',
                        'Использовать уязвимости Сайта для получения несанкционированного доступа.',
                        'Копировать, воспроизводить, распространять или публиковать произведения без письменного разрешения правообладателя.',
                        'Преследовать, угрожать или запугивать других пользователей.',
                        'Нарушать работу Сайта путём DDoS-атак, внедрения вредоносного кода или иных деструктивных действий.'
                      ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                    </ul>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'12px'}}>
                      <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>Нарушение данных правил влечёт немедленную блокировку учётной записи и возможное привлечение к ответственности в соответствии с применимым законодательством.</strong>
                    </p>
                  </div>
                )
              },
              {
                num:'6', title:'Права администрации',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>Администрация Сайта оставляет за собой право:</p>
                    <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                      {['Заблокировать или удалить учётную запись пользователя при нарушении правил без предварительного уведомления.',
                        'Изменять функциональность, дизайн и структуру Сайта.',
                        'Приостановить работу Сайта для проведения технических работ или обновлений.',
                        'Изменять настоящее Соглашение. Новая версия вступает в силу с момента публикации на Сайте.'
                      ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                    </ul>
                  </div>
                )
              },
              {
                num:'7', title:'Интеллектуальная собственность и авторские права',
                content: (
                  <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                    <div>
                      <SubTitle text="7.1. Правообладание" isDarkTheme={isDarkTheme}/>
                      <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                        Все литературные произведения, тексты, обложки, изображения персонажей, графический контент и иные материалы, размещённые на Сайте, являются объектами авторского права и принадлежат исключительно администрации Сайта <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>MelloStory</strong>.
                      </p>
                    </div>
                    <div>
                      <SubTitle text="7.2. Строго запрещается без письменного согласия:" isDarkTheme={isDarkTheme}/>
                      <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                        {['Копировать тексты, обложки, изображения или иной контент полностью или частично.',
                          'Размещать произведения, обложки, иллюстрации или цитаты в социальных сетях (ВКонтакте, Telegram, Instagram, TikTok, YouTube, Twitter/X и др.).',
                          'Использовать тексты, обложки или изображения в видеороликах, стримах, подкастах или иных мультимедийных материалах.',
                          'Использовать произведения в коммерческих целях, включая продажу, перевод, публикацию в печатных изданиях, создание аудиокниг.',
                          'Создавать адаптации, переработки, ремиксы или иные производные произведения на основе контента Сайта.'
                        ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <SubTitle text="7.3. Получение разрешения" isDarkTheme={isDarkTheme}/>
                      <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                        Для получения разрешения на использование контента направьте запрос на:{' '}
                        <a href="mailto:mellostory@protonmail.com" className={`terms-link-${isDarkTheme?'dark':'light'}`}>mellostory@protonmail.com</a>
                      </p>
                      <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>В запросе укажите: ваши контактные данные, название произведения, цель и способ использования. Администрация рассматривает запросы в течение 14 рабочих дней. Отсутствие ответа <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>не является</strong> разрешением.</p>
                    </div>
                    <div>
                      <SubTitle text="7.4. Юридическая ответственность" isDarkTheme={isDarkTheme}/>
                      <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                        Несанкционированное использование контента влечёт ответственность в соответствии с: Законодательством Германии (Urheberrechtsgesetz, UrhG), Бернской конвенцией об охране литературных и художественных произведений, а также иными применимыми международными нормами. Администрация оставляет за собой право обращаться в суд для защиты авторских прав.
                      </p>
                    </div>
                  </div>
                )
              },
              {
                num:'8', title:'Ограничение ответственности',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>Администрация Сайта не несёт ответственности за:</p>
                    <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                      {['Моральный или иной ущерб, причинённый использованием или невозможностью использования Сайта.',
                        'Точность, актуальность и полноту информации, размещённой пользователями.',
                        'Технические сбои, перебои в работе Сайта или потерю данных вследствие форс-мажорных обстоятельств.'
                      ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                    </ul>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'12px'}}>
                      <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>Сайт предоставляется «как есть» (as is) без каких-либо явных или подразумеваемых гарантий.</strong>
                    </p>
                  </div>
                )
              },
              {
                num:'9', title:'Блокировка пользователей',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>Учётная запись может быть заблокирована без предупреждения в следующих случаях:</p>
                    <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                      {['Нарушение правил, указанных в разделе 5.',
                        'Нарушение авторских прав (раздел 7).',
                        'Систематические оскорбления других пользователей или администрации.',
                        'Попытки взлома, DDoS-атак или иного вредоносного воздействия.',
                        'Использование нескольких аккаунтов для обхода блокировки (мультиаккаунтинг).',
                        'Распространение спама, рекламы или вредоносных ссылок.',
                        'Предоставление заведомо ложных данных при регистрации.'
                      ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                    </ul>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'12px'}}>
                      Заблокированный пользователь может обратиться к администрации для уточнения причин по адресу{' '}
                      <a href="mailto:mellostory@protonmail.com" className={`terms-link-${isDarkTheme?'dark':'light'}`}>mellostory@protonmail.com</a>,{' '}
                      однако восстановление доступа не гарантируется и остаётся на усмотрение администрации.
                    </p>
                  </div>
                )
              },
              {
                num:'10', title:'Применимое право и разрешение споров',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>
                      Настоящее Соглашение регулируется и толкуется в соответствии с законодательством Федеративной Республики Германия. В вопросах авторских прав применяется также Бернская конвенция и иные международные соглашения.
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                      Все споры, возникающие из настоящего Соглашения, подлежат разрешению путём переговоров. В случае невозможности достичь согласия — в компетентном суде по месту нахождения администрации Сайта (Германия).
                    </p>
                  </div>
                )
              },
              {
                num:'11', title:'Изменения в Соглашении',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>
                      Администрация оставляет за собой право вносить изменения в настоящее Соглашение в любое время. Новая версия вступает в силу с момента публикации на Сайте. Продолжая использовать Сайт после внесения изменений, вы принимаете новую версию Соглашения.
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                      Дата вступления в силу настоящей редакции: <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>30 ноября 2025 года</strong>
                    </p>
                  </div>
                )
              },
              {
                num:'12', title:'Контактная информация',
                content: (
                  <div>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`}>
                      По всем вопросам, связанным с использованием Сайта, авторскими правами, блокировкой учётных записей или получением разрешений на использование контента:
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                      <strong className={`terms-strong-${isDarkTheme?'dark':'light'}`}>Email:</strong>{' '}
                      <a href="mailto:mellostory@protonmail.com" className={`terms-link-${isDarkTheme?'dark':'light'}`}>mellostory@protonmail.com</a>
                    </p>
                    <p className={`terms-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'6px'}}>
                      Ответы предоставляются в течение 14 рабочих дней.
                    </p>
                  </div>
                )
              }
            ].map(({ num, title, content }) => (
              <Section key={num} num={num} title={title} isDarkTheme={isDarkTheme}>
                {content}
              </Section>
            ))}

            {/* Итоговый блок */}
            <div style={{
              borderTop: isDarkTheme ? '1px solid rgba(147,112,219,0.2)' : '1px solid rgba(201,168,76,0.15)',
              paddingTop:'clamp(20px,4vw,32px)',marginTop:'8px'
            }}>
              <div style={{
                background: isDarkTheme ? 'rgba(147,112,219,0.06)' : 'rgba(201,168,76,0.05)',
                border: isDarkTheme ? '1px solid rgba(147,112,219,0.2)' : '1px solid rgba(201,168,76,0.15)',
                borderRadius: isDarkTheme ? '8px' : '2px',
                padding:'clamp(14px,3vw,22px)',textAlign:'center'
              }}>
                <p style={{
                  fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'3px',
                  color: isDarkTheme ? 'rgba(180,100,255,0.5)' : 'rgba(201,168,76,0.45)',
                  textTransform:'uppercase',marginBottom:'12px'
                }}>
                  {isDarkTheme ? '✦ Используя Сайт, вы подтверждаете ✦' : '⚜ Используя Сайт, вы подтверждаете ⚜'}
                </p>
                <ul className={`terms-list terms-list-${isDarkTheme?'dark':'light'}`}
                  style={{display:'inline-block',textAlign:'left'}}>
                  {['Вам исполнилось 18 лет',
                    'Вы ознакомились с настоящим Соглашением',
                    'Вы понимаете и принимаете все условия и правовые последствия',
                    'Вы обязуетесь соблюдать данное Соглашение'
                  ].map((item,i) => <li key={i} className={`terms-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Вспомогательные компоненты ─── */

function Section({ num, title, isDarkTheme, children }) {
  return (
    <section>
      {/* Разделитель */}
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'clamp(12px,2.5vw,18px)'}}>
        <div style={{
          fontFamily:'Cinzel,serif',fontSize:'clamp(0.55rem,1.3vw,0.65rem)',letterSpacing:'2px',
          color: isDarkTheme ? 'rgba(239,1,203,0.5)' : 'rgba(201,168,76,0.4)',
          flexShrink:0
        }}>{num}</div>
        <div style={{height:'1px',flex:1,background: isDarkTheme
          ? 'linear-gradient(90deg,rgba(239,1,203,0.3),rgba(147,112,219,0.15),transparent)'
          : 'linear-gradient(90deg,rgba(201,168,76,0.3),transparent)'}}/>
      </div>

      {/* Заголовок секции */}
      <h2 style={{
        fontFamily:'Cinzel,serif',fontSize:'clamp(0.8rem,2.5vw,1rem)',
        letterSpacing:'clamp(2px,0.8vw,4px)',textTransform:'uppercase',
        marginBottom:'clamp(10px,2vw,16px)',
 backgroundImage: isDarkTheme
  ? 'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)'
  : 'linear-gradient(90deg,#c9a84c 0%,#f0d080 60%,#c9a84c 100%)',
backgroundSize: '200% auto',
WebkitBackgroundClip: 'text',
WebkitTextFillColor: 'transparent',
animation: isDarkTheme ? 'termsShimmer 5s linear infinite' : 'termsGoldShimmer 5s linear infinite',
      }}>{title}</h2>

      {children}
    </section>
  );
}

function SubTitle({ text, isDarkTheme }) {
  return (
    <h3 style={{
      fontFamily:'Cinzel,serif',fontSize:'clamp(0.65rem,1.8vw,0.78rem)',
      letterSpacing:'2px',textTransform:'uppercase',marginBottom:'6px',
      color: isDarkTheme ? 'rgba(179,231,239,0.6)' : 'rgba(201,168,76,0.5)'
    }}>{text}</h3>
  );
}