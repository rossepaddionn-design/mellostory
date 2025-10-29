'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/main-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#000'
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 mb-6 sm:mb-8 transition"
        >
          <ChevronLeft size={20} />
          Вернуться на главную
        </Link>

        <div className="bg-gray-900 bg-opacity-95 rounded-2xl p-6 sm:p-10 border-2 border-red-600">
          <h1 className="text-3xl sm:text-4xl font-bold text-red-500 mb-6 sm:mb-8">
            Политика конфиденциальности
          </h1>

          <div className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">1. Общие положения</h2>
              <p>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей веб-сайта <strong>MelloStory</strong> (далее — «Сайт»). Используя Сайт, вы соглашаетесь с условиями данной Политики.
              </p>
              <p className="mt-2">
                Администрация Сайта обязуется соблюдать конфиденциальность персональных данных пользователей в соответствии с действующим законодательством, включая Федеральный закон РФ № 152-ФЗ «О персональных данных» и Общий регламент по защите данных (GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">2. Какие данные мы собираем</h2>
              <p>При использовании Сайта мы можем собирать следующие категории персональных данных:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>При регистрации:</strong> адрес электронной почты (email), никнейм (имя пользователя), пароль (хранится в зашифрованном виде).</li>
                <li><strong>При использовании функций Сайта:</strong> комментарии к главам, оценки работ, сообщения администрации, закладки, история чтения.</li>
                <li><strong>Технические данные:</strong> IP-адрес, информация о браузере и устройстве (собирается автоматически сервисом хостинга Vercel).</li>
              </ul>
              <p className="mt-2">
                <strong>Важно:</strong> Пароли хранятся в зашифрованном виде и недоступны администрации Сайта. Мы не имеем возможности просматривать ваши пароли.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">3. Цели обработки данных</h2>
              <p>Мы используем ваши персональные данные исключительно для следующих целей:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Обеспечение функционирования учётной записи пользователя (авторизация, восстановление доступа).</li>
                <li>Предоставление возможности оставлять комментарии, оценки и сообщения.</li>
                <li>Сохранение истории чтения и закладок для удобства пользователя.</li>
                <li>Связь с пользователями по вопросам функционирования Сайта.</li>
                <li>Анализ статистики посещаемости и улучшение работы Сайта.</li>
                <li>Предотвращение нарушений правил использования Сайта.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">4. Кто имеет доступ к вашим данным</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Администрация Сайта:</strong> имеет доступ к вашему email, никнейму, комментариям, сообщениям и оценкам. Пароли недоступны.</li>
                <li><strong>Сервис хостинга (Vercel):</strong> автоматически сохраняет технические данные (IP-адреса, логи запросов) в соответствии со своей политикой конфиденциальности.</li>
                <li><strong>Сервис базы данных (Supabase):</strong> хранит пользовательские данные в зашифрованном виде на защищённых серверах.</li>
              </ul>
              <p className="mt-2">
                Мы <strong>не продаём, не передаём и не предоставляем</strong> ваши персональные данные третьим лицам без вашего явного согласия, за исключением случаев, предусмотренных законодательством.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">5. Срок хранения данных</h2>
              <p>
                Ваши персональные данные хранятся до момента удаления вашей учётной записи. После удаления аккаунта все связанные с ним данные (комментарии, сообщения, закладки, история) удаляются из базы данных в течение 30 дней.
              </p>
              <p className="mt-2">
                Причины удаления аккаунта (если указаны пользователем) могут сохраняться в анонимизированном виде для анализа качества работы Сайта.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">6. Ваши права</h2>
              <p>В соответствии с законодательством о защите персональных данных вы имеете право:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li><strong>Доступ к данным:</strong> запросить информацию о том, какие данные о вас хранятся.</li>
                <li><strong>Исправление данных:</strong> изменить неточную или устаревшую информацию.</li>
                <li><strong>Удаление данных:</strong> удалить свою учётную запись и все связанные данные через функцию «Удалить аккаунт» в личном кабинете.</li>
                <li><strong>Ограничение обработки:</strong> запросить ограничение использования ваших данных.</li>
                <li><strong>Отзыв согласия:</strong> в любой момент отозвать согласие на обработку данных путём удаления аккаунта.</li>
              </ul>
              <p className="mt-2">
                Для реализации ваших прав свяжитесь с нами по адресу: <a href="mailto:rossepaddionn@gmail.com" className="text-red-500 hover:text-red-400 underline">rossepaddionn@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">7. Безопасность данных</h2>
              <p>
                Мы применяем современные технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Шифрование паролей с использованием алгоритма bcrypt.</li>
                <li>Защищённое соединение HTTPS для всех запросов.</li>
                <li>Регулярное обновление систем безопасности.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">8. Cookies и аналитика</h2>
              <p>
                Сайт использует <strong>localStorage</strong> (локальное хранилище браузера) для сохранения настроек пользователя (например, выбранный цвет акцента). Эти данные не передаются на сервер и остаются только на вашем устройстве.
              </p>
              <p className="mt-2">
                В настоящее время мы <strong>не используем</strong> сторонние сервисы аналитики (Google Analytics, Яндекс.Метрика). Если такие сервисы будут внедрены, мы обновим данную Политику и уведомим пользователей.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">9. Блокировка пользователей</h2>
              <p>
                Администрация Сайта оставляет за собой право заблокировать учётную запись пользователя в следующих случаях:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Нарушение правил использования Сайта.</li>
                <li>Размещение оскорбительного, незаконного или вредоносного контента.</li>
                <li>Попытки несанкционированного доступа к данным других пользователей.</li>
              </ul>
              <p className="mt-2">
                Заблокированный пользователь может обратиться к администрации для разъяснения причин блокировки.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">10. Изменения в Политике</h2>
              <p>
                Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. Все изменения вступают в силу с момента публикации новой версии на Сайте. Рекомендуем периодически проверять данную страницу.
              </p>
              <p className="mt-2">
                Дата последнего обновления: <strong>29 октября 2025 года</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400 mb-3">11. Контакты</h2>
              <p>
                Если у вас возникли вопросы по поводу обработки ваших персональных данных или вы хотите воспользоваться своими правами, свяжитесь с нами:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> <a href="mailto:rossepaddionn@gmail.com" className="text-red-500 hover:text-red-400 underline">rossepaddionn@gmail.com</a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">
                Используя Сайт, вы подтверждаете, что ознакомились с настоящей Политикой конфиденциальности и согласны с её условиями.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}