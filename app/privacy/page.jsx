'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
        .section-title {
          color: #b48dc4;
          text-shadow: 0 0 15px rgba(180, 141, 196, 0.6);
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 sm:mb-8 transition"
        >
          <ChevronLeft size={20} />
          Вернуться на главную
        </Link>

        <div 
          className="rounded-2xl p-6 sm:p-10 border-2"
          style={{ 
            backgroundColor: '#000000',
            borderColor: '#9370db',
            boxShadow: '0 0 30px rgba(147, 112, 219, 0.3)'
          }}
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 shimmer-title">
            Политика конфиденциальности
          </h1>
          <div className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">1. Общие положения</h2>
              <p>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей веб-сайта <strong>MelloStory</strong> (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями данной Политики.
              </p>
              <p className="mt-2">
                Администрация Сайта обязуется соблюдать конфиденциальность персональных данных пользователей в соответствии с действующим законодательством:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Российская Федерация:</strong> Федеральный закон № 152-ФЗ «О персональных данных»</li>
                <li><strong>Европейский Союз:</strong> Общий регламент по защите данных (GDPR — General Data Protection Regulation)</li>
                <li><strong>Германия:</strong> Bundesdatenschutzgesetz (BDSG) — Федеральный закон о защите данных</li>
              </ul>
              <p className="mt-2">
                Сайт управляется из Федеративной Республики Германия и полностью соответствует европейским стандартам защиты персональных данных.
              </p>
              <p className="mt-2">
                <strong>Важно:</strong> MelloStory является <strong>некоммерческим проектом</strong>, созданным исключительно в творческих и развлекательных целях. Сайт не преследует коммерческих целей, не генерирует прибыль и не содержит рекламы.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">2. Некоммерческий характер проекта</h2>
              <p>
                <strong>MelloStory</strong> является некоммерческим литературным проектом, созданным для публикации авторских произведений и взаимодействия с читателями.
              </p>
              
              <h3 className="text-lg font-semibold section-title mt-4 mb-2">2.1. Отсутствие коммерческой деятельности</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Сайт <strong>не является коммерческой организацией</strong> и не преследует цель извлечения прибыли.</li>
                <li>Все произведения публикуются <strong>бесплатно</strong> и доступны для чтения без какой-либо оплаты.</li>
                <li>Регистрация и использование всех функций Сайта <strong>полностью бесплатны</strong>.</li>
                <li>Сайт не продаёт товары, услуги или подписки.</li>
              </ul>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">2.2. Отсутствие рекламы</h3>
              <p>
 <strong>На сайте никогда не будет рекламы.</strong>
</p>
<ul className="list-disc list-inside mt-2 space-y-1 ml-4">
  <li>На ресурсе <strong>не размещаются</strong> рекламные баннеры, всплывающие окна или видеореклама.</li>
  <li>Сайт <strong>не сотрудничает</strong> с рекламными сетями (Google AdSense, Яндекс.Директ и т.п.).</li>
  <li>На сайте <strong>не используются</strong> партнёрские программы или реферальные ссылки.</li>
  <li>Рекламное пространство <strong>не продаётся</strong> третьим лицам.</li>
</ul>
              <p className="mt-2">
                Это гарантирует, что ваши персональные данные <strong>не используются</strong> для таргетированной рекламы, поведенческого анализа или передачи рекламным платформам.
              </p>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">2.3. Цели проекта</h3>
              <p>
                Сайт создан исключительно для:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Публикации авторских литературных произведений</li>
                <li>Творческого самовыражения автора</li>
                <li>Предоставления читателям доступа к бесплатному качественному контенту</li>
                <li>Создания сообщества единомышленников, увлечённых литературой</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">3. Характер контента и отсутствие пропаганды</h2>
              <p>
                <strong>Все материалы, размещённые на Сайте, являются художественным вымыслом и не преследуют целей пропаганды.</strong>
              </p>
              
              <h3 className="text-lg font-semibold section-title mt-4 mb-2">3.1. Художественная литература</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Все произведения на Сайте являются <strong>художественным вымыслом</strong> и созданы исключительно в развлекательных и творческих целях.</li>
                <li>Сайт <strong>не пропагандирует</strong> насилие, противоправное поведение, употребление наркотиков, алкоголя или какие-либо иные действия, запрещённые законодательством РФ или Германии.</li>
                <li>Описание персонажей, событий и действий в произведениях <strong>не является призывом к их воспроизведению в реальной жизни</strong>.</li>
                <li>Сайт не содержит инструкций, руководств или материалов, направленных на совершение противоправных действий.</li>
              </ul>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">3.2. Возраст персонажей</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Все персонажи, участвующие в сексуальных, романтических или откровенных сценах, являются совершеннолетними (18+).</strong></li>
                <li>Произведения не содержат описаний сексуального характера с участием несовершеннолетних лиц.</li>
              </ul>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">3.3. Отсутствие пропаганды</h3>
              <p>
                Сайт <strong>не осуществляет пропаганду</strong> следующего:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Нетрадиционных сексуальных отношений среди несовершеннолетних (в соответствии с законодательством РФ)</li>
                <li>Экстремизма, терроризма, национальной, расовой или религиозной розни</li>
                <li>Насилия, жестокости, противоправного поведения</li>
                <li>Употребления наркотических средств, психотропных веществ, алкоголя</li>
                <li>Суицида или причинения вреда здоровью</li>
              </ul>
              <p className="mt-2">
                Любые упоминания вышеперечисленного в текстах произведений являются частью художественного сюжета и не носят пропагандистского характера.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">2. Контролёр данных</h2>
              <p>
                Контролёром персональных данных (Data Controller) в соответствии с GDPR является администрация Сайта <strong>MelloStory</strong>.
              </p>
              <p className="mt-2">
                <strong>Контактная информация:</strong><br />
                Email: <a href="mailto:mellostory@protonmail.com" className="text-purple-400 hover:text-purple-300 underline">mellostory@protonmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">3. Какие данные собираются</h2>
              <p>При использовании Сайта администратор можем собирать следующие категории персональных данных:</p>
              
              <h3 className="text-lg font-semibold section-title mt-4 mb-2">3.1. Данные, предоставляемые пользователем</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>При регистрации:</strong> адрес электронной почты (email), никнейм (имя пользователя), пароль (хранится в зашифрованном виде).</li>
                <li><strong>При использовании функций Сайта:</strong> оценки работ, сообщения автору, история чтения.</li>
              </ul>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">3.2. Технические данные (собираются автоматически)(хранятся в зашифрованном ввиде,администрация их не может просматривать)</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>IP-адрес</li>
                <li>Информация о браузере и операционной системе</li>
                <li>Тип устройства (мобильное/десктоп)</li>
                <li>Время доступа к Сайту</li>
                <li>Страницы, которые вы посещаете на Сайте</li>
              </ul>
              <p className="mt-2">
                Технические данные собираются автоматически сервисом хостинга <strong>Vercel</strong> и сервисом базы данных <strong>Supabase</strong> в соответствии с их политиками конфиденциальности.
              </p>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">3.3. Важная информация о паролях</h3>
              <p>
                Пароли хранятся в зашифрованном виде с использованием алгоритма <strong>bcrypt</strong> и недоступны администрации Сайта. Администратор не имеем технической возможности просматривать ваши пароли.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">4. Правовые основания обработки данных</h2>
              <p>
                В соответствии с GDPR (статья 6) мы обрабатываем ваши персональные данные на следующих правовых основаниях:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Согласие (Art. 6(1)(a) GDPR):</strong> Регистрируясь на Сайте, вы даёте явное согласие на обработку ваших персональных данных.</li>
                <li><strong>Исполнение договора (Art. 6(1)(b) GDPR):</strong> Обработка данных необходима для предоставления вам услуг Сайта (авторизация, оценки, сообщения).</li>
                <li><strong>Законные интересы (Art. 6(1)(f) GDPR):</strong> Анализ статистики и улучшение работы Сайта.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">5. Цели обработки данных</h2>
              <p>Администрация использует ваши персональные данные исключительно для следующих целей:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Обеспечение функционирования учётной записи пользователя (авторизация, восстановление доступа).</li>
                <li>Предоставление возможности оставлять предложения, оценки и сообщения.</li>
                <li>Сохранение истории чтения для удобства пользователя.</li>
                <li>Связь с пользователями по вопросам функционирования Сайта.</li>
                <li>Анализ статистики посещаемости и улучшение работы Сайта.</li>
                <li>Предотвращение нарушений правил использования Сайта и обеспечение безопасности.</li>
              </ul>
              <p className="mt-2">
                <strong>Администрация не используем ваши данные для:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Рекламных рассылок (спам)</li>
                <li>Продажи или передачи третьим лицам</li>
                <li>Профилирования или автоматизированного принятия решений</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">6. Кто имеет доступ(видит) к вашим данным</h2>
              
              <h3 className="text-lg font-semibold section-title mt-4 mb-2">6.1. Внутренний доступ</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Администрация Сайта:</strong> имеет доступ к вашему email, никнейму, предложениям, сообщениям и оценкам. Пароли недоступны.</li>
              </ul>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">6.2. Третьи стороны (обработчики данных)</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Vercel (США):</strong> хостинг-провайдер, автоматически сохраняет технические данные (IP-адреса, логи запросов). Vercel сертифицирован по Privacy Shield Framework.</li>
                <li><strong>Supabase (США):</strong> сервис базы данных, хранит пользовательские данные в зашифрованном виде на защищённых серверах. Supabase соответствует GDPR.</li>
              </ul>
              <p className="mt-2">
                Все третьи стороны обязаны соблюдать конфиденциальность ваших данных и используют их только в целях предоставления услуг Сайту.
              </p>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">6.3. Гарантии конфиденциальности</h3>
              <p>
                Администрация <strong>не продаёт, не передаёт и не предоставляет</strong> ваши персональные данные третьим лицам для их собственных целей.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">7. Срок хранения данных</h2>
              <p>
                Ваши персональные данные хранятся до момента удаления вашей учётной записи. После удаления аккаунта:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Все связанные с ним данные (комментарии, сообщения, закладки, история) удаляются из активной базы данных в течение <strong>30 дней</strong>.</li>
                <li>Резервные копии данных удаляются в течение <strong>90 дней</strong>.</li>
                <li>Причины удаления аккаунта (если указаны пользователем) могут сохраняться в анонимизированном виде для анализа качества работы Сайта.</li>
              </ul>
              <p className="mt-2">
                Технические логи (IP-адреса, журналы доступа) хранятся на серверах Vercel в соответствии с их политикой хранения (обычно до 30 дней).
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">8. Ваши права в соответствии с GDPR</h2>
              <p>В соответствии с GDPR и законодательством о защите персональных данных вы имеете следующие права:</p>
              
              <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                <li><strong>Право на доступ (Art. 15 GDPR):</strong> Вы можете запросить информацию о том, какие персональные данные о вас хранятся и как они обрабатываются.</li>
                <li><strong>Право на исправление (Art. 16 GDPR):</strong> Вы можете изменить неточную или устаревшую информацию через настройки профиля или обратившись к администрации.</li>
                <li><strong>Право на удаление ("право на забвение", Art. 17 GDPR):</strong> Вы можете удалить свою учётную запись и все связанные данные через функцию «Удалить аккаунт» в личном кабинете.</li>
                <li><strong>Право на ограничение обработки (Art. 18 GDPR):</strong> Вы можете запросить ограничение использования ваших данных в определённых случаях.</li>
                <li><strong>Право на переносимость данных (Art. 20 GDPR):</strong> Вы можете запросить копию ваших данных в структурированном машиночитаемом формате.</li>
                <li><strong>Право на возражение (Art. 21 GDPR):</strong> Вы можете возразить против обработки ваших данных на основании законных интересов.</li>
                <li><strong>Право на отзыв согласия (Art. 7(3) GDPR):</strong> Вы можете в любой момент отозвать согласие на обработку данных путём удаления аккаунта.</li>
              </ul>
              
              <p className="mt-4">
                <strong>Как реализовать свои права:</strong><br />
                Свяжитесь с нами по адресу:<a href="mailto:mellostory@protonmail.com" className="text-purple-400 hover:text-purple-300 underline">mellostory@protonmail.com</a><br />
                Администратор ответим на ваш запрос в течение <strong>30 дней</strong> в соответствии с требованиями GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">9. Безопасность данных</h2>
              <p>
                Администрация применяет современные технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Шифрование паролей:</strong> Используется алгоритм bcrypt с высоким фактором сложности.</li>
                <li><strong>Защищённое соединение:</strong> Все запросы к Сайту используют протокол HTTPS (TLS 1.3).</li>
                <li><strong>Защита базы данных:</strong> Supabase обеспечивает шифрование данных в покое и при передаче.</li>
                <li><strong>Ограничение доступа:</strong> Доступ к серверам и базам данных имеет только администратор.</li>
                <li><strong>Регулярные обновления:</strong> Программное обеспечение и системы безопасности регулярно обновляются.</li>
                <li><strong>Мониторинг:</strong> Ведётся постоянный мониторинг подозрительной активности.</li>
              </ul>
              <p className="mt-2">
                <strong>Важно:</strong> Я рекомендую использовать надёжные пароли и не разглашать их третьим лицам.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">10. Cookies и локальное хранилище</h2>
              
              <h3 className="text-lg font-semibold section-title mt-4 mb-2">10.1. Использование localStorage</h3>
              <p>
                Сайт использует <strong>localStorage</strong> (локальное хранилище браузера) для сохранения настроек пользователя, таких как:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Выбранный цвет акцента интерфейса</li>
                <li>Язык интерфейса (если применимо)</li>
                <li>Настройки отображения</li>
              </ul>
              <p className="mt-2">
                Эти данные <strong>не передаются на сервер</strong> и остаются только на вашем устройстве. Вы можете очистить их в любой момент через настройки браузера.
              </p>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">10.2. Cookies</h3>
              <p>
                В настоящее время Сайт использует только <strong>технические cookies</strong>, необходимые для функционирования (сессии авторизации). Мы не используем рекламные или аналитические cookies.
              </p>

              <h3 className="text-lg font-semibold section-title mt-4 mb-2">10.3. Аналитика</h3>
              <p>
                В настоящее время мы <strong>не используем</strong> сторонние сервисы аналитики (Google Analytics, Яндекс.Метрика, Facebook Pixel и т.д.).
              </p>
              <p className="mt-2">
                Если в будущем мы решим внедрить аналитические инструменты, мы:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Обновим настоящую Политику конфиденциальности</li>
                <li>Уведомим пользователей о изменениях</li>
                <li>Получим ваше явное согласие (где это требуется по GDPR)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">11. Блокировка и модерация</h2>
              <p>
                Администрация Сайта оставляет за собой право заблокировать учётную запись пользователя в следующих случаях:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Нарушение Пользовательского соглашения и правил использования Сайта</li>
                <li>Размещение оскорбительного, незаконного или вредоносного контента</li>
                <li>Попытки несанкционированного доступа к данным других пользователей</li>
                <li>DDoS-атаки, распространение вредоносного ПО</li>
                <li>Систематическое нарушение правил комментирования</li>
              </ul>
              <p className="mt-2">
                При блокировке аккаунта ваши персональные данные сохраняются в течение 90 дней на случай обжалования решения. Заблокированный пользователь может обратиться к администрации для разъяснения причин блокировки.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">12. Данные несовершеннолетних</h2>
              <p>
                <strong>Сайт предназначен исключительно для лиц старше 18 лет.</strong>
              </p>
              <p className="mt-2">
                Администрация сознательно не собираем персональные данные лиц младше 18 лет. Если мне станет известно, что я непреднамеренно собрала данные несовершеннолетнего, то немедленно удалю такую информацию.
              </p>
              <p className="mt-2">
                Если вы считаете, что несовершеннолетний предоставил администрации свои данные, свяжитесь со мной по адресу <a href="mailto:mellostory@protonmail.com" className="text-purple-400 hover:text-purple-300 underline">mellostory@protonmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">13. Утечки данных</h2>
              <p>
                В маловероятном случае утечки или несанкционированного доступа к персональным данным пользователей мы:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Немедленно примем меры по устранению уязвимости</li>
                <li>Уведомим затронутых пользователей по email в течение 72 часов (в соответствии с Art. 33 GDPR)</li>
                <li>Сообщим в надзорный орган по защите данных (BfDI) в течение 72 часов</li>
                <li>Предоставим рекомендации пользователям по защите их аккаунтов</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">14. Изменения в Политике</h2>
              <p>
                Администрация оставляет за собой право вносить изменения в настоящую Политику конфиденциальности в любое время. Все изменения вступают в силу с момента публикации новой версии на Сайте.
              </p>
              <p className="mt-2">
                При внесении существенных изменений мы:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Опубликуем уведомление на главной странице Сайта</li>
                <li>Отправим email-уведомление зарегистрированным пользователям (где это возможно)</li>
                <li>Укажем дату последнего обновления в конце документа</li>
              </ul>
              <p className="mt-2">
                Рекомендуем периодически проверять данную страницу для ознакомления с актуальной версией Политики.
              </p>
              <p className="mt-2">
                <strong>Дата вступления в силу настоящей редакции: 30 ноября 2025 года</strong>
              </p>
            </section>

            <section>
             <h2 className="text-xl sm:text-2xl font-bold section-title mb-3">15. Контактная информация</h2>
              <p>
                Если у вас возникли вопросы по поводу обработки ваших персональных данных, вы хотите воспользоваться своими правами или сообщить об инциденте безопасности, свяжитесь с нами:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> <a href="mailto:mellostory@protonmail.com" className="text-purple-400 hover:text-purple-300 underline">mellostory@protonmail.com</a>
              </p>
              <p className="mt-2">
                Администратор ответим на ваш запрос в течение 30 дней в соответствии с требованиями GDPR.
              </p>
              <p className="mt-4">
                <strong>Надзорный орган (для жалоб):</strong><br />
                Bundesbeauftragter für den Datenschutz und die Informationsfreiheit (BfDI)<br />
                Graurheindorfer Str. 153<br />
                53117 Bonn, Germany<br />
                Website: <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline">www.bfdi.bund.de</a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                Используя Сайт, вы подтверждаете, что:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 text-center mt-2 space-y-1">
                <li>Вы ознакомились с настоящей Политикой конфиденциальности</li>
                <li>Вы понимаете, как обрабатываются ваши персональные данные</li>
                <li>Вы согласны с условиями обработки данных</li>
                <li>Вы знаете о своих правах и способах их реализации</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}