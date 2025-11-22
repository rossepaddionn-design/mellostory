'use client';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function MissionPage() {
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

      {/* Header */}
      <div className="bg-black border-b border-gray-800 py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ChevronLeft size={20} />
            <span className="text-sm sm:text-base">Вернуться на главную</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div 
            className="rounded-2xl p-6 sm:p-10 border-2"
            style={{ 
              backgroundColor: '#000000',
              borderColor: '#9370db',
              boxShadow: '0 0 30px rgba(147, 112, 219, 0.3)'
            }}
          >
            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 shimmer-title">
              Миссия сайта
            </h1>

            {/* Content Sections */}
            <div className="space-y-8 text-sm sm:text-base leading-relaxed">
              
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 section-title">
                  Зачем создан MelloStory?
                </h2>
                <p className="text-gray-200">
                  MelloStory — это независимая авторская платформа, созданная для публикации оригинальных произведений и фанфикшена. Этот сайт родился из желания иметь собственное пространство, где творчество не ограничено правилами сторонних площадок и где каждая работа может быть представлена именно так, как задумал автор.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 section-title">
                  Для кого этот сайт?
                </h2>
                <p className="text-gray-200">
                  Для всех моих читателей, поклонников к-поп фандомов и тех, кто просто ищет приятное времяпрепровождение за чтением, предлагаю ознакомиться с разнообразным контентом. На этой платформе вы найдёте как короткие минифики и лонгфики, так и многотомные романы. Весь материал предназначен для взрослой аудитории (18+) и может включать откровенные сцены и сложные тематические аспекты.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 section-title">
                  Что делает нас особенными?
                </h2>
                <p className="text-gray-200">
                  Полная творческая свобода автора, удобный интерфейс для чтения, возможность обратной связи с автором напрямую, отсутствие рекламы и отвлекающих элементов. Каждая работа получает своё уникальное оформление и внимание к деталям.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 section-title">
                  Наши ценности
                </h2>
                <p className="text-gray-200">
                  Уважение к читателю и его времени. Честность в предупреждениях о контенте. Качество над количеством. Постоянное развитие и улучшение платформы на основе обратной связи от читателей.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 section-title">
                  Связь с автором
                </h2>
                <p className="text-gray-200">
                  Зарегистрированные пользователи могут отправлять сообщения автору через личный кабинет. Ваши предложения и конструктивная критика всегда приветствуются и помогают делать работы и сайт лучше!
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black py-6 sm:py-8 text-center text-gray-500 border-t border-gray-800">
        <p className="text-base sm:text-lg mb-2">MelloStory © 2025</p>
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap px-4">
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-purple-400 transition underline">
            Политика конфиденциальности
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/terms" className="text-sm text-gray-400 hover:text-purple-400 transition underline">
            Пользовательское соглашение
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/mission" className="text-sm text-purple-400 transition">
            Миссия сайта
          </Link>
        </div>
      </footer>
    </div>
  );
}