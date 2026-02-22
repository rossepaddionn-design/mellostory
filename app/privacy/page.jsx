'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PrivacyPolicy() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkTheme(false);
  }, []);

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#000000', color:'#fff' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes privShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes privTwinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.55; } }
        @keyframes privGoldShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

        .priv-stars {
          background-image:
            radial-gradient(1px 1px at 3% 9%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 94% 7%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 87%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(1px 1px at 79% 53%, rgba(255,255,255,0.25) 0%, transparent 100%),
            radial-gradient(1px 1px at 22% 66%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 63% 29%, rgba(255,255,255,0.18) 0%, transparent 100%),
            radial-gradient(1px 1px at 37% 44%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 78%, rgba(255,255,255,0.1) 0%, transparent 100%);
          animation: privTwinkle 8s ease-in-out infinite;
          pointer-events: none;
        }

        .priv-link-dark { color: #b3e7ef; text-decoration: underline; transition: color 0.2s; }
        .priv-link-dark:hover { color: #ef01cb; }
        .priv-link-light { color: #c9a84c; text-decoration: underline; transition: color 0.2s; }
        .priv-link-light:hover { color: #f0d080; }

        .priv-list { list-style: none; padding: 0; margin: 0; }
        .priv-list li { padding: clamp(3px,0.8vw,5px) 0 clamp(3px,0.8vw,5px) 20px; position: relative; }
        .priv-list-dark li::before { content: '✦'; position: absolute; left: 0; font-size: 0.5rem; color: rgba(239,1,203,0.5); top: 50%; transform: translateY(-50%); }
        .priv-list-light li::before { content: '⚜'; position: absolute; left: 0; font-size: 0.5rem; color: rgba(201,168,76,0.5); top: 50%; transform: translateY(-50%); }

        .priv-p-dark { color: rgba(200,185,230,0.7); font-family: Georgia, serif; line-height: 1.8; font-size: clamp(0.78rem,2vw,0.9rem); }
        .priv-p-light { color: rgba(201,168,76,0.6); font-family: Georgia, serif; line-height: 1.8; font-size: clamp(0.78rem,2vw,0.9rem); }
        .priv-strong-dark { color: rgba(228,213,255,0.9); }
        .priv-strong-light { color: rgba(201,168,76,0.9); }
      `}} />

      {isDarkTheme && <div className="priv-stars" style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>}
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
          onMouseEnter={e=>e.currentTarget.style.background=isDarkTheme?'rgba(147,112,219,0.1)':'rgba(201,168,76,0.06)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
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
          {isDarkTheme && (
            <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
              background:'linear-gradient(90deg,transparent,#9370db,#ef01cb,transparent)'}}/>
          )}
          {!isDarkTheme && (
            <div style={{position:'absolute',left:0,top:0,bottom:0,width:'3px',
              background:'linear-gradient(180deg,transparent,#c9a84c,#c9a84c,transparent)'}}/>
          )}

          {/* ЗАГОЛОВОК */}
          <div style={{textAlign:'center',marginBottom:'clamp(24px,5vw,44px)'}}>
            {isDarkTheme ? (
              <>
                <div style={{fontSize:'clamp(1rem,3vw,1.5rem)',color:'rgba(180,100,255,0.35)',marginBottom:'10px'}}>✦</div>
                <h1 style={{
                  fontFamily:'Cinzel,serif',fontSize:'clamp(1rem,4vw,1.6rem)',
                  letterSpacing:'clamp(3px,1.5vw,7px)',
                  background:'linear-gradient(90deg,#b3e7ef,#ef01cb,#9370db)',backgroundSize:'200% auto',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
                  animation:'privShimmer 4s linear infinite',margin:0,marginBottom:'14px'
                }}>Политика конфиденциальности</h1>
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
                  animation:'privGoldShimmer 4s linear infinite',letterSpacing:'4px',margin:0,marginBottom:'12px'
                }}>Политика конфиденциальности</h1>
                <div style={{display:'flex',alignItems:'center',gap:'12px',justifyContent:'center'}}>
                  <div style={{height:'1px',width:'80px',background:'linear-gradient(90deg,rgba(201,168,76,0.5),transparent)'}}/>
                  <span style={{color:'rgba(201,168,76,0.4)',fontSize:'0.7rem',letterSpacing:'4px',fontFamily:'serif'}}>⚜ · · ⚜</span>
                  <div style={{height:'1px',width:'80px',background:'linear-gradient(270deg,rgba(201,168,76,0.5),transparent)'}}/>
                </div>
              </>
            )}
          </div>

          {/* КОНТЕНТ */}
          <div style={{display:'flex',flexDirection:'column',gap:'clamp(24px,4vw,36px)'}}>

            <PrivSection num="1" title="Общие положения" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей веб-сайта <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>MelloStory</strong> (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями данной Политики.
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                Администрация Сайта обязуется соблюдать конфиденциальность персональных данных в соответствии с:
              </p>
              <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                {[
                  'Общим регламентом по защите данных ЕС (GDPR — General Data Protection Regulation, Regulation (EU) 2016/679)',
                  'Германским федеральным законом о защите данных (Bundesdatenschutzgesetz, BDSG)',
                  'Иными применимыми нормами законодательства Германии и ЕС'
                ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
              </ul>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                Сайт управляется с территории Федеративной Республики Германия и полностью соответствует европейским стандартам защиты персональных данных.
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Важно:</strong> MelloStory является <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>некоммерческим проектом</strong>, созданным исключительно в творческих и развлекательных целях, без извлечения прибыли и без рекламы.
              </p>
            </PrivSection>

            <PrivSection num="2" title="Некоммерческий характер проекта" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>
                <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>MelloStory</strong> — некоммерческий литературный проект для публикации авторских произведений и взаимодействия с читателями.
              </p>
              <div style={{marginTop:'14px'}}>
                <PrivSubTitle text="2.1. Отсутствие коммерческой деятельности" isDarkTheme={isDarkTheme}/>
                <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                  {['Сайт не является коммерческой организацией и не преследует цель извлечения прибыли.',
                    'Все произведения публикуются бесплатно и доступны для чтения без какой-либо оплаты.',
                    'Регистрация и использование всех функций Сайта полностью бесплатны.',
                    'Сайт не продаёт товары, услуги или подписки.'
                  ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                </ul>
              </div>
              <div style={{marginTop:'14px'}}>
                <PrivSubTitle text="2.2. Отсутствие рекламы" isDarkTheme={isDarkTheme}/>
                <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'6px'}}>
                  <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>На сайте никогда не будет рекламы.</strong>
                </p>
                <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                  {['На ресурсе не размещаются рекламные баннеры, всплывающие окна или видеореклама.',
                    'Сайт не сотрудничает с рекламными сетями (Google AdSense и т.п.).',
                    'На сайте не используются партнёрские программы или реферальные ссылки.',
                    'Рекламное пространство не продаётся третьим лицам.',
                    'Ваши персональные данные не используются для таргетированной рекламы или передачи рекламным платформам.'
                  ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                </ul>
              </div>
            </PrivSection>

            <PrivSection num="3" title="Контролёр данных" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>
                Контролёром персональных данных (Data Controller) в соответствии с GDPR является администрация Сайта <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>MelloStory</strong>.
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Контактная информация:</strong><br/>
                Email:{' '}<a href="mailto:mellostory@protonmail.com" className={`priv-link-${isDarkTheme?'dark':'light'}`}>mellostory@protonmail.com</a>
              </p>
            </PrivSection>

            <PrivSection num="4" title="Какие данные собираются" isDarkTheme={isDarkTheme}>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <PrivSubTitle text="4.1. Данные, предоставляемые пользователем" isDarkTheme={isDarkTheme}/>
                  <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    {['При регистрации: адрес электронной почты (email), никнейм, пароль (хранится исключительно в зашифрованном виде и администрация не имеет возможности его увидеть, либо воспользоваться).',
                      'При использовании функций Сайта: оценки работ, сообщения автору, список избранного, сохранённые изображения, отзывы к работам и главам, сохранённые закладки.'
                    ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <PrivSubTitle text="4.2. Технические данные (собираются автоматически)" isDarkTheme={isDarkTheme}/>
                  <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    {['IP-адрес',
                      'Информация о браузере и операционной системе',
                      'Тип устройства (мобильное / десктоп)',
                      'Время доступа к Сайту и посещённые страницы'
                    ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                  </ul>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    Технические данные собираются автоматически сервисами <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Vercel</strong> и <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Supabase</strong> в соответствии с их политиками конфиденциальности. Администрация Сайта не имеет прямого доступа к этим логам.
                  </p>
                </div>
                <div>
                  <PrivSubTitle text="4.3. О паролях" isDarkTheme={isDarkTheme}/>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    Пароли хранятся в зашифрованном виде с использованием алгоритма <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>bcrypt</strong>. Администрация Сайта не имеет технической возможности просматривать ваши пароли.
                  </p>
                </div>
              </div>
            </PrivSection>

            <PrivSection num="5" title="Правовые основания обработки данных" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>В соответствии с GDPR (статья 6) данные обрабатываются на следующих основаниях:</p>
              <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                {['Согласие (Art. 6(1)(a) GDPR): регистрируясь на Сайте, вы даёте явное согласие на обработку ваших персональных данных.',
                  'Исполнение договора (Art. 6(1)(b) GDPR): обработка данных необходима для предоставления услуг Сайта (авторизация, оценки, сообщения).',
                  'Законные интересы (Art. 6(1)(f) GDPR): анализ статистики и улучшение работы Сайта.'
                ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
              </ul>
            </PrivSection>

            <PrivSection num="6" title="Цели обработки данных" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>Ваши данные используются исключительно для:</p>
              <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                {['Обеспечения функционирования учётной записи (авторизация, восстановление доступа).',
                  'Предоставления возможности оставлять оценки, сообщения и использовать функции коллекции.',
                  'Связи с пользователями по вопросам функционирования Сайта.',
                  'Анализа статистики посещаемости и улучшения работы Сайта.',
                  'Предотвращения нарушений правил и обеспечения безопасности.'
                ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
              </ul>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'12px'}}>
                <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Данные не используются для:</strong> рекламных рассылок, продажи или передачи третьим лицам, профилирования или автоматизированного принятия решений.
              </p>
            </PrivSection>

            <PrivSection num="7" title="Кто имеет доступ к вашим данным" isDarkTheme={isDarkTheme}>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <PrivSubTitle text="7.1. Внутренний доступ" isDarkTheme={isDarkTheme}/>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    Администрация Сайта имеет доступ к вашему email, никнейму, сообщениям, оценкам, уведомлениям, сохранённым работам, изоображениям и комментариям. Пароли недоступны никому.
                  </p>
                </div>
                <div>
                  <PrivSubTitle text="7.2. Обработчики данных (третьи стороны)" isDarkTheme={isDarkTheme}/>
                  <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    {['Vercel (США/ЕС): хостинг-провайдер, автоматически сохраняет технические логи (IP, запросы). Vercel соответствует требованиям EU-US Data Privacy Framework и GDPR.',
                      'Supabase (США/ЕС): сервис базы данных, хранит пользовательские данные в зашифрованном виде на защищённых серверах. Supabase соответствует GDPR и заключил стандартные договорные положения (SCCs).'
                    ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
                  </ul>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    Все третьи стороны обязаны соблюдать конфиденциальность данных и используют их только для предоставления услуг Сайту.
                  </p>
                </div>
                <div>
                  <PrivSubTitle text="7.3. Гарантии" isDarkTheme={isDarkTheme}/>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    Администрация <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>не продаёт, не передаёт и не предоставляет</strong> ваши персональные данные третьим лицам для их собственных целей.
                  </p>
                </div>
              </div>
            </PrivSection>

            <PrivSection num="8" title="Срок хранения данных" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>Ваши данные хранятся до момента удаления учётной записи. После удаления аккаунта:</p>
              <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                {['Все связанные данные (сообщения, оценки, избранное, история) удаляются из активной базы в течение 30 дней.',
                  'Резервные копии удаляются в течение 90 дней.',
                  'Причины удаления аккаунта (если указаны) могут храниться в анонимизированном виде для анализа качества Сайта.'
                ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
              </ul>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                Технические логи на серверах Vercel хранятся в соответствии с их политикой (как правило, до 30 дней).
              </p>
            </PrivSection>

            <PrivSection num="9" title="Ваши права в соответствии с GDPR" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>В соответствии с GDPR вы имеете следующие права:</p>
              <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                {['Право на доступ (Art. 15): запросить информацию о том, какие данные о вас хранятся и как обрабатываются.',
                  'Право на исправление (Art. 16): изменить неточные данные через настройки профиля или обратившись к администрации.',
                  'Право на удаление / «право на забвение» (Art. 17): удалить учётную запись и все связанные данные через функцию в личном кабинете.',
                  'Право на ограничение обработки (Art. 18): запросить ограничение использования ваших данных в определённых случаях.',
                  'Право на переносимость (Art. 20): получить копию ваших данных в структурированном машиночитаемом формате.',
                  'Право на возражение (Art. 21): возразить против обработки данных на основании законных интересов.',
                  'Право на отзыв согласия (Art. 7(3)): отозвать согласие в любой момент, удалив аккаунт.'
                ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
              </ul>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'12px'}}>
                Для реализации прав свяжитесь с нами:{' '}
                <a href="mailto:mellostory@protonmail.com" className={`priv-link-${isDarkTheme?'dark':'light'}`}>mellostory@protonmail.com</a>.{' '}
                Ответ предоставляется в течение <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>30 дней</strong> в соответствии с GDPR.
              </p>
            </PrivSection>

            <PrivSection num="10" title="Безопасность данных" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>Применяются следующие меры защиты:</p>
              <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                {['Шифрование паролей: алгоритм bcrypt с высоким фактором сложности.',
                  'Защищённое соединение: протокол HTTPS / TLS для всех запросов.',
                  'Защита базы данных: Supabase обеспечивает шифрование данных в покое и при передаче.',
                  'Ограничение доступа: к серверам и базам данных имеет доступ только администратор.',
                  'Регулярные обновления программного обеспечения и систем безопасности.',
                  'Мониторинг подозрительной активности.'
                ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
              </ul>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                Рекомендуется использовать надёжные уникальные пароли и не передавать их третьим лицам.
              </p>
            </PrivSection>

            <PrivSection num="11" title="Cookies и локальное хранилище" isDarkTheme={isDarkTheme}>
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                <div>
                  <PrivSubTitle text="11.1. localStorage" isDarkTheme={isDarkTheme}/>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    Сайт использует локальное хранилище браузера для сохранения пользовательских настроек (выбранная тема интерфейса и другие параметры отображения). Эти данные <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>не передаются на сервер</strong> и остаются только на вашем устройстве. Вы можете очистить их через настройки браузера.
                  </p>
                </div>
                <div>
                  <PrivSubTitle text="11.2. Cookies" isDarkTheme={isDarkTheme}/>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    Сайт использует только <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>технические cookies</strong>, необходимые для функционирования (поддержание сессии авторизации). Рекламные или аналитические cookies не используются.
                  </p>
                </div>
                <div>
                  <PrivSubTitle text="11.3. Аналитика" isDarkTheme={isDarkTheme}/>
                  <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                    В настоящее время сторонние сервисы аналитики (Google Analytics и т.п.) не используются. Если в будущем это изменится — настоящая Политика будет обновлена, пользователи уведомлены, а там, где требуется GDPR, получено явное согласие.
                  </p>
                </div>
              </div>
            </PrivSection>

            <PrivSection num="12" title="Данные несовершеннолетних" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>
                <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Сайт предназначен исключительно для лиц старше 18 лет.</strong>
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                Администрация не собирает сознательно персональные данные лиц младше 18 лет. Если станет известно, что данные несовершеннолетнего были получены непреднамеренно, они будут немедленно удалены.
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                Если вы считаете, что несовершеннолетний зарегистрировался на Сайте, сообщите об этом:{' '}
                <a href="mailto:mellostory@protonmail.com" className={`priv-link-${isDarkTheme?'dark':'light'}`}>mellostory@protonmail.com</a>
              </p>
            </PrivSection>

            <PrivSection num="13" title="Утечки данных" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>В случае утечки или несанкционированного доступа к персональным данным:</p>
              <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`} style={{marginTop:'8px'}}>
                {['Немедленно будут приняты меры по устранению уязвимости.',
                  'Затронутые пользователи будут уведомлены по email в течение 72 часов (в соответствии с Art. 33 GDPR).',
                  'Сообщение направляется в надзорный орган по защите данных Германии (BfDI) в течение 72 часов.',
                  'Пользователям будут предоставлены рекомендации по защите их аккаунтов.'
                ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
              </ul>
            </PrivSection>

            <PrivSection num="14" title="Изменения в Политике" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>
                Администрация вправе вносить изменения в настоящую Политику в любое время. Все изменения вступают в силу с момента публикации новой версии. При существенных изменениях будет опубликовано уведомление на главной странице и, где возможно, направлено email-уведомление.
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Дата вступления в силу настоящей редакции: 30 ноября 2025 года</strong>
              </p>
            </PrivSection>

            <PrivSection num="15" title="Контактная информация" isDarkTheme={isDarkTheme}>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>
                По всем вопросам обработки персональных данных, реализации ваших прав или сообщению об инциденте безопасности:
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'10px'}}>
                <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Email:</strong>{' '}
                <a href="mailto:mellostory@protonmail.com" className={`priv-link-${isDarkTheme?'dark':'light'}`}>mellostory@protonmail.com</a>
              </p>
              <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginTop:'6px'}}>
                Ответ предоставляется в течение 30 дней в соответствии с требованиями GDPR.
              </p>
              <div style={{
                marginTop:'16px',padding:'clamp(12px,2.5vw,18px)',
                background: isDarkTheme ? 'rgba(147,112,219,0.06)' : 'rgba(201,168,76,0.05)',
                border: isDarkTheme ? '1px solid rgba(147,112,219,0.18)' : '1px solid rgba(201,168,76,0.15)',
                borderRadius: isDarkTheme ? '6px' : '2px'
              }}>
                <p className={`priv-p-${isDarkTheme?'dark':'light'}`} style={{marginBottom:'6px'}}>
                  <strong className={`priv-strong-${isDarkTheme?'dark':'light'}`}>Надзорный орган по защите данных Германии (для жалоб):</strong>
                </p>
                <p className={`priv-p-${isDarkTheme?'dark':'light'}`}>
                  Bundesbeauftragter für den Datenschutz und die Informationsfreiheit (BfDI)<br/>
                  Graurheindorfer Str. 153, 53117 Bonn, Germany<br/>
                  <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer"
                    className={`priv-link-${isDarkTheme?'dark':'light'}`}>www.bfdi.bund.de</a>
                </p>
              </div>
            </PrivSection>

            {/* Итоговый блок */}
            <div style={{
              borderTop: isDarkTheme ? '1px solid rgba(147,112,219,0.2)' : '1px solid rgba(201,168,76,0.15)',
              paddingTop:'clamp(20px,4vw,32px)'
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
                <ul className={`priv-list priv-list-${isDarkTheme?'dark':'light'}`}
                  style={{display:'inline-block',textAlign:'left'}}>
                  {['Вы ознакомились с настоящей Политикой конфиденциальности',
                    'Вы понимаете, как обрабатываются ваши персональные данные',
                    'Вы согласны с условиями обработки данных',
                    'Вы знаете о своих правах и способах их реализации'
                  ].map((item,i) => <li key={i} className={`priv-p-${isDarkTheme?'dark':'light'}`}>{item}</li>)}
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

function PrivSection({ num, title, isDarkTheme, children }) {
  return (
    <section>
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
animation: isDarkTheme ? 'privShimmer 5s linear infinite' : 'privGoldShimmer 5s linear infinite',
      }}>{title}</h2>
      {children}
    </section>
  );
}

function PrivSubTitle({ text, isDarkTheme }) {
  return (
    <h3 style={{
      fontFamily:'Cinzel,serif',fontSize:'clamp(0.65rem,1.8vw,0.78rem)',
      letterSpacing:'2px',textTransform:'uppercase',marginBottom:'4px',
      color: isDarkTheme ? 'rgba(179,231,239,0.6)' : 'rgba(201,168,76,0.5)'
    }}>{text}</h3>
  );
}
