
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Heart, ShieldCheck, Truck, Users, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <Helmet>
        <title>О нас</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900">
           <img 
             src="https://images.unsplash.com/photo-1591951425328-48c1fe7179cd?q=80&w=2000&auto=format&fit=crop" 
             className="w-full h-full object-cover opacity-40 mix-blend-overlay fixed-on-scroll"
             alt="Florist working"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-950"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4">
           <span className="text-emerald-300 font-bold tracking-widest uppercase text-sm mb-4 block">Наша миссия</span>
           <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
             Где природа встречает <br/> <span className="italic text-emerald-200">технологии</span>
           </h1>
           <p className="text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
             Floramos — это первый в мире маркетплейс, объединивший тепло рук лучших флористов и точность искусственного интеллекта.
           </p>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
              <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                    <Heart size={32} />
                 </div>
                 <h3 className="font-serif text-2xl text-emerald-900">С душой</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Мы работаем только с проверенными локальными фермерами и флористами, которые любят свое дело. Каждый букет собирается вручную.
                 </p>
              </div>
              <div className="text-center space-y-4 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 transform md:-translate-y-8 shadow-xl">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4 shadow-sm">
                    <Cpu size={32} />
                 </div>
                 <h3 className="font-serif text-2xl text-emerald-900">С умом</h3>
                 <p className="text-emerald-800 leading-relaxed">
                   Наш ИИ "Flora" проверяет свежесть цветов по фото, прогнозирует спрос, чтобы избежать списаний, и помогает вам подобрать идеальный подарок.
                 </p>
              </div>
              <div className="text-center space-y-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                    <ShieldCheck size={32} />
                 </div>
                 <h3 className="font-serif text-2xl text-emerald-900">С гарантией</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Если цветы завянут в течение 72 часов при правильном уходе, мы бесплатно заменим букет. Мы уверены в качестве.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-24 bg-sage-50 overflow-hidden">
         <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
               <div className="w-full md:w-1/2 relative">
                  <div className="absolute top-4 left-4 w-full h-full border-2 border-emerald-800 rounded-2xl z-0"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop" 
                    alt="Flower Shop" 
                    className="relative z-10 rounded-2xl shadow-2xl w-full"
                  />
               </div>
               <div className="w-full md:w-1/2 space-y-6">
                  <h2 className="font-serif text-4xl text-emerald-900">История создания</h2>
                  <div className="prose prose-lg text-gray-600">
                    <p>
                      Всё началось в 2023 году с простой идеи: почему покупка цветов в интернете часто превращается в лотерею?
                      Фото на сайте красивые, а приезжает "уставший" букет.
                    </p>
                    <p>
                      Мы решили изменить правила игры. Мы создали платформу, где каждый цветок проходит двойной контроль: сначала опытного флориста, а затем — компьютерного зрения.
                    </p>
                    <p>
                      Сегодня Floramos — это сообщество из 500+ мастеров, объединенных общей платформой качества.
                    </p>
                  </div>
                  <Link to="/catalog">
                    <Button size="lg" className="mt-4">Стать частью истории</Button>
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Stats */}
      <section className="py-10 md:py-20 bg-emerald-900 text-white">
         <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center divide-x divide-white/10">
               <div>
                  <div className="text-4xl md:text-5xl font-serif mb-2">15k+</div>
                  <div className="text-emerald-200 text-sm uppercase tracking-wider">Доставленных улыбок</div>
               </div>
               <div>
                  <div className="text-4xl md:text-5xl font-serif mb-2">98%</div>
                  <div className="text-emerald-200 text-sm uppercase tracking-wider">Рейтинг свежести</div>
               </div>
               <div>
                  <div className="text-4xl md:text-5xl font-serif mb-2">45 мин</div>
                  <div className="text-emerald-200 text-sm uppercase tracking-wider">Среднее время доставки</div>
               </div>
               <div>
                  <div className="text-4xl md:text-5xl font-serif mb-2">24/7</div>
                  <div className="text-emerald-200 text-sm uppercase tracking-wider">Поддержка клиентов</div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};
