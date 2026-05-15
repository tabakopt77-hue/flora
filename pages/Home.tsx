import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Gift, Star, Clock, ArrowRight, Plus, Mic, AudioLines, Eye, EyeOff, Flower2, Leaf, Heart, Wind, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_FLOWERS } from '../constants';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import CinematicParticles from '../components/CinematicParticles';

// Extend Window interface for AI Studio helpers
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const ROMANTIC_QUOTES = [
  "«Цветы — это стихи, написанные природой, чтобы мы могли дарить их любимым.»",
  "«Подарок, преподнесенный с душой, расцветает в сердце навсегда.»",
  "«Язык цветов красноречивее тысячи слов, когда нужно выразить истинные чувства.»",
  "«Дарить цветы — значит делиться мгновением чистой красоты.»",
  "«Лучшие подарки не измеряются ценой, они измеряются эмоциями, которые приносят.»"
];

const REVIEWS = [
  { id: 1, name: "Екатерина Д.", text: "Заказывала букет маме на юбилей. Цветы простояли больше недели! Очень красивая упаковка и вежливый курьер. Спасибо Aura Flora за праздник!", rating: 5 },
  { id: 2, name: "Александр П.", text: "Долго не мог выбрать букет для девушки, решил попробовать чат с ИИ. Он подобрал идеальный вариант с кенийскими розами. Девушка в восторге!", rating: 5 },
  { id: 3, name: "Мария В.", text: "Потрясающий сервис. Заказываю уже третий раз, всегда свежие цветы и доставка точно ко времени. Отдельное спасибо за открытку с рукописным текстом.", rating: 5 }
];

interface HomeProps {
    allProducts: Product[];
    onAddToCart: (product: Product) => void;
    onQuickView: (product: Product) => void;
    navigate: (path: string) => void;
    setIsAiOpen: (isOpen: boolean) => void;
    setIsGiftWizardOpen: (isOpen: boolean) => void;
    wishlist: string[];
    onToggleWishlist: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ allProducts, onAddToCart, onQuickView, navigate, setIsAiOpen, setIsGiftWizardOpen, wishlist, onToggleWishlist }) => {
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % ROMANTIC_QUOTES.length);
        }, 6000); // Change quote every 6 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                // Removed audioRef.current.src = "" to avoid StrictMode bugs
            }
        };
    }, []);

    const toggleMusic = (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (audioRef.current) {
            audioRef.current.volume = 0.3; // Low ambient volume
            
            if (isMusicPlaying) {
                audioRef.current.pause();
                setIsMusicPlaying(false);
            } else {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setIsMusicPlaying(true);
                    }).catch(error => {
                        console.error('Audio playback was prevented by the browser:', error);
                        setIsMusicPlaying(false);
                    });
                }
            }
        }
    };
    
    return (
    <>
      {/* New Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[#060411] via-[#022B1E] to-[#140616] bg-[length:300%_300%] animate-shimmer">
        
        {/* NATIVE AUDIO TAG FOR RELIABLE PLAYBACK */}
        <audio 
           ref={audioRef} 
           src="https://archive.org/download/MoonlightSonata_755/Beethoven-MoonlightSonata.mp3" 
           loop 
           preload="auto" 
           className="w-0 h-0 opacity-0 absolute pointer-events-none"
        />

        {/* Toggle Music Button */}
        <div className="absolute top-24 right-4 md:right-8 z-50 pointer-events-auto">
           <button
             onClick={toggleMusic}
             className={`flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 md:px-5 md:py-3 rounded-full border border-white/10 transition-all duration-300 hover:bg-black/40 hover:border-emerald-500/50 group ${isMusicPlaying ? 'text-emerald-300' : 'text-white/60 hover:text-white'}`}
             title="Музыкальное сопровождение ИИ-Фантазий"
           >
             <div className="relative">
               {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
               {isMusicPlaying && (
                 <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
               )}
             </div>
             <span className="hidden md:inline text-sm font-medium tracking-wider">
               {isMusicPlaying ? 'СИМФОНИЯ ИИ' : 'ВКЛЮЧИТЬ МУЗЫКУ'}
             </span>
           </button>
        </div>

        {/* 1. Слой с анимацией частиц */}
        <div className="absolute inset-0 z-0">
          <CinematicParticles />
        </div>

        {/* 1.5. Слой затемнения для читаемости текста */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* 2. Слой контента (Next.js + Tailwind) */}
        <div className="container relative z-20 mx-auto h-full flex flex-col justify-start md:justify-center pt-32 md:pt-0 px-6 md:px-8">
          <div className="max-w-xl pointer-events-none">
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white text-5xl md:text-7xl font-serif leading-none"
            >
              Искусство <br />
              <span className="text-[#87CEEB] italic font-light">дарить</span> <br />
              чувства.
            </motion.h1>

            <div className="mt-8 md:mt-12 flex gap-4 pointer-events-auto mb-8">
              <Button variant="glass" size="lg" onClick={() => navigate('/catalog')}>
                Выбрать букет
              </Button>
            </div>

            <div className="border-l-2 border-[#87CEEB]/50 pl-4 md:pl-6 h-32 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0"
                >
                  <p className="text-gray-300 italic text-lg md:text-xl leading-relaxed drop-shadow-md">
                    {ROMANTIC_QUOTES[currentQuoteIndex].split('—')[0].trim()}
                  </p>
                  <span className="text-[#87CEEB] text-xs md:text-sm uppercase tracking-widest mt-3 block drop-shadow-md">
                    — {ROMANTIC_QUOTES[currentQuoteIndex].split('—')[1]?.trim()}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-4 md:py-8 bg-sage-50 border-b border-emerald-100/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-4 md:mb-6 max-w-2xl mx-auto">
             <h2 className="font-serif text-3xl md:text-3xl text-emerald-900 mb-2">Категории</h2>
             <p className="text-emerald-700/80">Выберите идеальный подарок для любого случая</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {[
              { id: Category.BOUQUETS, icon: <Flower2 size={32} strokeWidth={1.5} />, label: Category.BOUQUETS, color: 'bg-rose-100 text-rose-700' },
              { id: Category.POTTED, icon: <Leaf size={32} strokeWidth={1.5} />, label: Category.POTTED, color: 'bg-emerald-100 text-emerald-700' },
              { id: Category.WEDDING, icon: <Heart size={32} strokeWidth={1.5} />, label: Category.WEDDING, color: 'bg-pink-100 text-pink-700' },
              { id: Category.DRIED, icon: <Wind size={32} strokeWidth={1.5} />, label: Category.DRIED, color: 'bg-amber-100 text-amber-700' },
              { id: Category.GIFTS, icon: <Gift size={32} strokeWidth={1.5} />, label: Category.GIFTS, color: 'bg-indigo-100 text-indigo-700' },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => navigate(`/catalog?category=${cat.id}`)}
                className="group flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-50/50 hover:-translate-y-1"
              >
                <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <span className="font-medium text-emerald-900 text-center text-sm md:text-base">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-4 md:mb-8 max-w-2xl mx-auto">
             <h2 className="font-serif text-3xl md:text-3xl text-emerald-900 mb-2 md:mb-4">Избранное флористами</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-8">
            {allProducts.slice(0, 12).map((product: Product, index: number) => (
              <ProductCard 
                key={`${product.id}-${index}`} 
                product={product} 
                onAddToCart={onAddToCart} 
                onQuickView={onQuickView}
                isFavorite={wishlist.includes(product.id)}
                onToggleFavorite={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile only animation banner */}
      <section className="md:hidden overflow-hidden py-4 bg-emerald-900 text-emerald-50 border-y border-emerald-800 relative">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-8 w-max">
           <span className="flex items-center gap-2 text-sm font-medium"><Sparkles size={14} className="text-emerald-300"/> Свежие цветы каждый день</span>
           <span className="flex items-center gap-2 text-sm font-medium"><Heart size={14} className="text-emerald-300"/> Авторская упаковка в подарок</span>
           <span className="flex items-center gap-2 text-sm font-medium"><Clock size={14} className="text-emerald-300"/> Доставка от 60 минут</span>
           <span className="flex items-center gap-2 text-sm font-medium"><Sparkles size={14} className="text-emerald-300"/> Свежие цветы каждый день</span>
           <span className="flex items-center gap-2 text-sm font-medium"><Heart size={14} className="text-emerald-300"/> Авторская упаковка в подарок</span>
           <span className="flex items-center gap-2 text-sm font-medium"><Clock size={14} className="text-emerald-300"/> Доставка от 60 минут</span>
        </div>
      </section>

      {/* Только что купили */}
      <section className="py-4 md:py-8 bg-sage-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
             <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
             <h2 className="font-serif text-3xl md:text-3xl text-emerald-900">Только что купили</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-8">
            {allProducts.slice(2, 14).map((product: Product, index: number) => (
              <div key={`${product.id}-${index}`} className="relative">
                 <ProductCard 
                    product={product} 
                    onAddToCart={onAddToCart} 
                    onQuickView={onQuickView}
                    isFavorite={wishlist.includes(product.id)}
                    onToggleFavorite={onToggleWishlist}
                 />
                 <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] md:text-[11px] font-medium text-emerald-800 shadow-sm flex items-center gap-1.5 z-[25] pointer-events-none">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                   </span>
                   Купили 5 мин назад
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Новинки */}
      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-4 md:mb-6">
             <h2 className="font-serif text-3xl md:text-3xl text-emerald-900">Новые поступления</h2>
             <button onClick={() => navigate('/catalog')} className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-2 transition-colors">Смотреть все <ArrowRight size={16}/></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-8">
            {allProducts.slice(-12).reverse().map((product: Product, index: number) => (
              <ProductCard 
                key={`${product.id}-${index}`} 
                product={product} 
                onAddToCart={onAddToCart} 
                onQuickView={onQuickView}
                isFavorite={wishlist.includes(product.id)}
                onToggleFavorite={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Отзывы */}
      <section className="py-8 md:py-12 bg-emerald-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-6 md:mb-10 max-w-2xl mx-auto">
             <h2 className="font-serif text-3xl md:text-4xl mb-4">Что говорят клиенты</h2>
             <p className="text-emerald-200">Мы гордимся каждым доставленным букетом</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
             {REVIEWS.map(review => (
               <div key={review.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl hover:bg-white/20 transition-colors">
                  <div className="flex gap-1 mb-4 text-rose-300">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                  </div>
                  <p className="text-lg leading-relaxed mb-6 font-serif italic">"{review.text}"</p>
                  <p className="font-medium text-emerald-100">— {review.name}</p>
               </div>
             ))}
          </div>
        </div>
      </section>
    </>
);
};
