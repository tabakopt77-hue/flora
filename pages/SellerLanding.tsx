import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Helmet } from 'react-helmet-async';

interface SellerLandingProps {
  onJoin: () => void;
}

export const SellerLanding: React.FC<SellerLandingProps> = ({ onJoin }) => {
  return (
    <>
      <Helmet>
        <title>Партнерам</title>
      </Helmet>
      <div className="bg-white pt-20 md:pt-24 pb-10 md:pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          {/* Hero */}
          <div className="text-center mb-10 md:mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif text-emerald-900 mb-6 leading-tight"
            >
              Продавайте цветы тем, <br className="hidden md:block"/> кто ценит искусство
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Floramos — это маркетплейс от людей и для людей. Мы, возможно, не первые на рынке, но стараемся быть лучшими, потому что делаем всё как для себя. Мы берем на себя привлечение клиентов и технологии, а вы можете спокойно заниматься любимым делом.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button size="lg" onClick={onJoin} className="text-lg px-10 py-4 shadow-xl shadow-emerald-900/20">
                Стать партнером
              </Button>
            </motion.div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-20">
            <div className="bg-sage-50 p-6 md:p-8 rounded-3xl">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <TrendingUp className="text-emerald-700" size={28} />
              </div>
              <h3 className="text-2xl font-serif text-emerald-900 mb-3">0% комиссии на старт</h3>
              <p className="text-gray-600 leading-relaxed">Первый месяц работы на платформе абсолютно бесплатен. Далее — прозрачная комиссия только за успешные заказы.</p>
            </div>
            <div className="bg-sage-50 p-6 md:p-8 rounded-3xl">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Users className="text-emerald-700" size={28} />
              </div>
              <h3 className="text-2xl font-serif text-emerald-900 mb-3">Ценители честного труда</h3>
              <p className="text-gray-600 leading-relaxed">Наши покупатели ищут букеты, сделанные с душой, и ценят ваше мастерство и человеческое отношение.</p>
            </div>
            <div className="bg-sage-50 p-6 md:p-8 rounded-3xl">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Zap className="text-emerald-700" size={28} />
              </div>
              <h3 className="text-2xl font-serif text-emerald-900 mb-3">ИИ-продажи</h3>
              <p className="text-gray-600 leading-relaxed">Наш умный ассистент Flora AI сам рекомендует ваши букеты покупателям на основе их запросов.</p>
            </div>
            <div className="bg-sage-50 p-6 md:p-8 rounded-3xl">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="text-emerald-700" size={28} />
              </div>
              <h3 className="text-2xl font-serif text-emerald-900 mb-3">Удобный кабинет</h3>
              <p className="text-gray-600 leading-relaxed">Простое управление товарами, заказами и аналитикой в реальном времени.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-emerald-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-serif mb-6">Готовы увеличить продажи?</h2>
              <p className="text-emerald-100 mb-8 max-w-xl mx-auto text-lg">Присоединяйтесь к числу лучших флористов города прямо сейчас.</p>
              <Button variant="white" size="lg" onClick={onJoin}>
                Зарегистрировать магазин
              </Button>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/flowers/1200/400')] opacity-10 object-cover mix-blend-overlay"></div>
          </div>
        </div>
      </div>
    </>
  );
};
