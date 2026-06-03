import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Gift, Star, Clock, ArrowRight, Plus, Mic, AudioLines, Eye, EyeOff, Flower2, Leaf, Heart, Wind, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_FLOWERS } from '../constants';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { AIFloralBackground } from '../components/AIFloralBackground';

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
  "«Цветы — это стихи, написанные природой, чтобы мы могли дарить их любимым.» — Автор неизвестен",
  "«Подарок, преподнесенный с душой, расцветает в сердце навсегда.» — Ральф Уолдо Эмерсон",
  "«Язык цветов красноречивее тысячи слов, когда нужно выразить истинные чувства.» — Уильям Шекспир",
  "«Дарить цветы — значит делиться мгновением чистой красоты.» — Одри Хепберн",
  "«Лучшие подарки не измеряются ценой, они измеряются эмоциями, которые приносят.» — Антуан де Сент-Экзюпери"
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

    const [hoveredFeedImage, setHoveredFeedImage] = useState<{ src: string, name: string } | null>(null);

    // Dynamic Live Order Stream of 100 items (rendered in looping vertical marquee)
    const RECENT_ORDERS = React.useMemo(() => {
        const list = [];
        const names = ["Александр", "Екатерина", "Дмитрий", "Анна", "Сергей", "Мария", "Елена", "Иван", "Анастасия", "Ольга", "Артем", "Владимир", "София", "Николай", "Дарья", "Алексей", "Юлия", "Максим", "Ксения", "Михаил", "Ирина", "Андрей", "Татьяна", "Павел", "Светлана", "Роман", "Наталья", "Виталий", "Оксана", "Денис", "Алена", "Антон", "Марина", "Игорь", "Елизавета", "Георгий", "Кристина", "Ярослав", "Виктория", "Егор", "Любовь", "Валерий", "Кира", "Глеб", "Вера", "Федор", "Яна", "Никита", "Алиса", "Артур"];
        const surnames = ["К.", "Б.", "М.", "С.", "В.", "Н.", "П.", "Д.", "Т.", "А.", "Г.", "Л.", "Ф.", "И.", "О.", "Ш.", "Р.", "Е.", "Ц.", "Ю."];
        const cities = ["Москва", "Санкт-Петербург", "Пресня", "Казань", "Сочи", "Краснодар", "Екатеринбург", "Нижний Новгород", "Новосибирск", "Владивосток", "Одинцово", "Химки"];
        
        const flowersBase = allProducts && allProducts.length > 0 ? allProducts : (HERO_FLOWERS && HERO_FLOWERS.length > 0 ? HERO_FLOWERS : [
          { name: "Розовая Нежность", image: "https://images.unsplash.com/photo-1596073419667-9d77d59f033f", price: 3400 },
          { name: "Алая Страсть", image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91", price: 4500 }
        ]);

        for (let i = 0; i < 100; i++) {
          const fIdx = (i * 7) % flowersBase.length; 
          const nIdx = (i * 3) % names.length;
          const sIdx = (i * 11) % surnames.length;
          const cIdx = (i * 17) % cities.length;
          const minutesAgo = Math.floor(i * 0.8) + 1; 
          
          const item = flowersBase[fIdx] as any;
          const price = item.price || Math.floor((3400 + (i * 130) % 4600) / 100) * 100; 
          
          list.push({
            id: `order-${i}`,
            customer: `${names[nIdx]} ${surnames[sIdx]}`,
            city: cities[cIdx],
            itemName: item.name,
            itemImage: item.image,
            time: minutesAgo === 1 ? 'Только что заказан' : `${minutesAgo} мин. назад`,
            price: price.toLocaleString() + ' ₽'
          });
        }
        return list;
    }, [allProducts]);

    const handleOrderClick = (orderItem: any) => {
        if (!allProducts || allProducts.length === 0) {
            navigate('/catalog');
            return;
        }
        const match = allProducts.find(p => 
            p.name.toLowerCase().includes(orderItem.itemName.substring(0, 6).toLowerCase())
        );
        if (match) {
            onQuickView(match);
        } else {
            navigate('/catalog');
        }
    };

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
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes verticalMarquee {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical {
          animation: verticalMarquee 48s linear infinite;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
      {/* New Hero Section */}
      <section className="relative min-h-[110vh] lg:h-screen w-full overflow-hidden bg-[#f8f9fc] flex items-center">
        
        {/* Premium Modern Background Effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 via-emerald-50/20 to-transparent pointer-events-none"></div>
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-100/40 to-cyan-100/40 blur-[100px] pointer-events-none"></div>
          <div className="absolute top-[20%] left-[-100px] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-orange-50/60 to-rose-50/60 blur-[100px] pointer-events-none"></div>
          <AIFloralBackground />
        </div>
        
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
             className={`flex items-center gap-3 bg-white/50 backdrop-blur-xl p-3 md:px-5 md:py-3 rounded-full border border-slate-200/80 shadow-sm transition-all duration-300 hover:bg-white hover:border-emerald-500/50 hover:shadow-md group ${isMusicPlaying ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
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

        {/* 2. Слой контента (Next.js + Tailwind) */}
        <div className="container relative z-20 mx-auto px-6 md:px-8 pt-28 pb-12 lg:py-0 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left relative min-h-[500px]">
              
              {/* Image Preview Overlay */}
              <AnimatePresence>
                {hoveredFeedImage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-0 z-30 flex flex-col items-start justify-center pointer-events-none pr-8"
                  >
                    <div className="relative w-full max-w-2xl aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                      <img src={hoveredFeedImage.src} alt={hoveredFeedImage.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 pt-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <h3 className="text-white text-3xl md:text-4xl font-serif font-bold drop-shadow-md">{hoveredFeedImage.name}</h3>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`transition-all duration-500 flex flex-col justify-center h-full w-full ${hoveredFeedImage ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-slate-900 text-4xl sm:text-5xl md:text-7xl font-serif leading-tight md:leading-none font-bold"
              >
                Искусство <br />
                <span className="text-[#00c853] italic font-medium">дарить</span> <br />
                чувства.
              </motion.h1>

              {/* Quotes Row */}
              <div className="border-l-2 border-[#00c853] pl-4 md:pl-6 h-28 relative mt-6 md:mt-8 mb-4 max-w-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                  >
                    <p className="text-slate-600 italic text-base md:text-lg leading-relaxed">
                      {ROMANTIC_QUOTES[currentQuoteIndex].split('—')[0].trim()}
                    </p>
                    <span className="text-[#00c853] font-semibold text-xs md:text-sm uppercase tracking-widest mt-2 block">
                      — {ROMANTIC_QUOTES[currentQuoteIndex].split('—')[1]?.trim()}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Unified Feature Row & Select Button (From Mockup Image) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 md:mt-10 w-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-2xl md:rounded-[24px] border border-slate-200/50 shadow-[0_4px_30px_rgb(0,0,0,0.02)] p-4 md:p-5 pointer-events-auto"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-4 items-center">
                  
                  {/* Black action button */}
                  <button 
                    onClick={() => navigate('/catalog')}
                    className="col-span-2 md:col-span-1 w-full bg-[#161b22] text-white hover:bg-slate-900 px-4 py-4 rounded-xl md:rounded-[18px] flex items-center justify-between group transition-all duration-300 shadow-md shadow-zinc-950/15 active:scale-95"
                  >
                    <span className="font-semibold text-sm md:text-[15px] tracking-tight">Выбрать букет</span>
                    <ArrowRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>

                  {/* Icon 1: Photo */}
                  <div className="flex items-center gap-3.5 pl-2 md:border-r border-slate-100 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-slate-100">
                      <svg className="w-5.3 h-5.3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs md:text-[13px] text-slate-800 leading-tight">Фото букета</h4>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 leading-none">перед отправкой</p>
                    </div>
                  </div>

                  {/* Icon 2: Freshness */}
                  <div className="flex items-center gap-3.5 pl-2 md:border-r border-slate-100 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-slate-100">
                      <Heart size={19} className="stroke-emerald-600 fill-transparent" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs md:text-[13px] text-slate-800 leading-tight">Свежие цветы</h4>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 leading-none">каждый день</p>
                    </div>
                  </div>

                  {/* Icon 3: Delivery Speed */}
                  <div className="flex items-center gap-3.5 pl-2 md:border-r border-slate-100 last:border-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-slate-100">
                      <Clock size={19} className="stroke-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs md:text-[13px] text-slate-800 leading-tight">Доставка за 90 мин</h4>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 leading-none">или бесплатно</p>
                    </div>
                  </div>

                  {/* Icon 4: Loyalty count */}
                  <div className="flex items-center gap-3.5 pl-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-slate-100">
                      <svg className="w-5.3 h-5.3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs md:text-[13px] text-slate-800 leading-tight">Более 5000</h4>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 leading-none">довольных клиентов</p>
                    </div>
                  </div>

                </div>
              </motion.div>
              </div>
            </div>

            {/* Right Row Side (Awwwards 100 Live Orders Carousel scroller feed) */}
            <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative pointer-events-auto h-full pr-4">
              <div className="bg-white/45 backdrop-blur-xl border border-slate-200/50 p-6 rounded-[32px] w-full max-w-lg flex flex-col shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_12px_40px_rgba(0,0,0,0.02)] select-none relative overflow-hidden h-[680px]">
                
                {/* Header of Feed */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200/50">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[13px] font-bold uppercase tracking-wider text-slate-700">Сейчас заказывают</span>
                  </div>
                  <span className="text-[10px] text-[#00c853] font-bold uppercase bg-emerald-50 px-2.5 py-1 rounded-full">100 заказов в эфире</span>
                </div>

                {/* Animated Marquee Container */}
                <div className="flex-grow overflow-hidden relative">
                  {/* Top Fade Gradient to hide borders smoothly */}
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/95 via-white/10 to-transparent z-10 pointer-events-none" />
                  {/* Bottom Fade Gradient to hide borders smoothly */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/95 via-white/10 to-transparent z-10 pointer-events-none" />

                  {/* Scrolling Inner Track */}
                  <div className="animate-marquee-vertical flex flex-col gap-4 py-1">
                    {/* Render first tranche of 30 unique items */}
                    {RECENT_ORDERS.slice(0, 30).map((order) => (
                      <div 
                        key={`feed-1-${order.id}`} 
                        onClick={() => handleOrderClick(order)}
                        onMouseEnter={() => setHoveredFeedImage({ src: order.itemImage, name: order.itemName })}
                        onMouseLeave={() => setHoveredFeedImage(null)}
                        className="flex items-center gap-4 bg-white/80 hover:bg-white p-4 rounded-2xl border border-slate-200/40 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-300 w-full cursor-pointer hover:border-[#00c853]/40 hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-100">
                          <img src={order.itemImage} alt={order.itemName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="font-bold text-[14px] text-slate-800 truncate">{order.customer}</p>
                            <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">{order.time}</span>
                          </div>
                          <p className="text-[14px] font-serif italic text-emerald-800 truncate font-medium">{order.itemName}</p>
                          <div className="flex items-center justify-between text-[12px] mt-1.5 text-slate-400">
                            <span className="truncate">{order.city}</span>
                            <span className="font-bold text-[13px] text-slate-800 font-sans">{order.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Duplicate the EXACT SAME range for seamless looping scroll wrapping */}
                    {RECENT_ORDERS.slice(0, 30).map((order) => (
                      <div 
                        key={`feed-2-${order.id}`} 
                        onClick={() => handleOrderClick(order)}
                        onMouseEnter={() => setHoveredFeedImage({ src: order.itemImage, name: order.itemName })}
                        onMouseLeave={() => setHoveredFeedImage(null)}
                        className="flex items-center gap-4 bg-white/80 hover:bg-white p-4 rounded-2xl border border-slate-200/40 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-300 w-full cursor-pointer hover:border-[#00c853]/40 hover:-translate-y-0.5 active:scale-[0.98]"
                      >
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border border-slate-100">
                          <img src={order.itemImage} alt={order.itemName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="font-bold text-[14px] text-slate-800 truncate">{order.customer}</p>
                            <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">{order.time}</span>
                          </div>
                          <p className="text-[14px] font-serif italic text-emerald-800 truncate font-medium">{order.itemName}</p>
                          <div className="flex items-center justify-between text-[12px] mt-1.5 text-slate-400">
                            <span className="truncate">{order.city}</span>
                            <span className="font-bold text-[13px] text-slate-800 font-sans">{order.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

          </div>
          
          {/* Real-time scrolling reviews at the bottom of the hero section */}
          <div className="mt-16 sm:mt-24 w-full overflow-hidden relative pb-6">
             <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#f8f9fa] to-transparent z-10"></div>
             <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#f8f9fa] to-transparent z-10"></div>
             
             <div className="flex w-max animate-marquee-horizontal-reverse">
                {/* Initial set of reviews */}
                {[...Array(2)].map((_, arrayIndex) => (
                   <div key={`reviews-${arrayIndex}`} className="flex gap-4 px-2">
                     {[
                       { name: "Анна С.", text: "Шикарные пионы, доставка минута в минуту! 🌸", rating: 5, time: "2 мин назад" },
                       { name: "Виктор М.", text: "Жена просто в восторге от роз. Спасибо!", rating: 5, time: "7 мин назад" },
                       { name: "Елена В.", text: "Очень стильная упаковка и свежайшие цветы.", rating: 5, time: "14 мин назад" },
                       { name: "Максим Д.", text: "Оперативно, красиво, еще и открытку подписали.", rating: 5, time: "19 мин назад" },
                       { name: "Ольга Н.", text: "Лучший сервис в городе. Цветы стоят уже неделю!", rating: 5, time: "25 мин назад" },
                       { name: "Денис К.", text: "Приятные цены и очень крутое качество.", rating: 5, time: "32 мин назад" },
                     ].map((review, i) => (
                       <div key={i} className="flex-shrink-0 w-[300px] bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-default">
                         <div className="flex justify-between items-start mb-2">
                           <div className="font-semibold text-slate-800 text-sm">{review.name}</div>
                           <div className="text-xs text-slate-400 font-medium whitespace-nowrap">{review.time}</div>
                         </div>
                         <div className="flex gap-0.5 mb-2">
                           {[...Array(5)].map((_, starIndex) => (
                             <Star key={starIndex} size={12} className={starIndex < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
                           ))}
                         </div>
                         <p className="text-slate-600 text-sm leading-snug">{review.text}</p>
                       </div>
                     ))}
                   </div>
                ))}
             </div>
          </div>
          
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 md:mb-12">
             <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-2">
               Категории для <span className="text-[#00c853]">любого повода</span>
             </h2>
             <p className="text-slate-500 text-lg">Быстрый выбор лучших предложений</p>
          </div>
          
          {/* Scrollable container for mobile, grid for desktop */}
          <div 
             className="flex overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible gap-4 md:gap-5 hide-scrollbar"
             style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {[
              { 
                id: Category.BOUQUETS, 
                query: 'author',
                label: 'Авторские букеты', 
                icon: <Flower2 size={96} strokeWidth={1} />, 
                bg: 'bg-[#ffebf0] hover:bg-[#ffdce5]', 
                text: 'text-slate-900', 
                iconColor: 'text-[#ffa6bf]/35',
                subcategories: [
                  { name: 'Монобукеты', query: 'mono' },
                  { name: 'Цветы в коробке', query: 'box' },
                  { name: 'Корзины цветов', query: 'basket' },
                  { name: 'Премиум букеты', query: 'premium' }
                ]
              },
              { 
                id: Category.POTTED, 
                query: 'plants',
                label: 'Комнатные растения', 
                icon: <Leaf size={96} strokeWidth={1} />, 
                bg: 'bg-[#f0fcf4] hover:bg-[#dff9e7]', 
                text: 'text-slate-900', 
                iconColor: 'text-[#9eeab4]/35',
                subcategories: [
                  { name: 'Цветущие растения', query: 'blooming' },
                  { name: 'Лиственные растения', query: 'foliage' },
                  { name: 'Суккуленты & кактусы', query: 'succulents' },
                  { name: 'Крупные растения', query: 'large' }
                ]
              },
              { 
                id: Category.WEDDING, 
                query: 'wedding',
                label: 'Свадебная коллекция', 
                icon: <Heart size={96} strokeWidth={1} />, 
                bg: 'bg-[#fbf4ff] hover:bg-[#f3e1ff]', 
                text: 'text-slate-900', 
                iconColor: 'text-[#d69eff]/35',
                subcategories: [
                  { name: 'Букеты невесты', query: 'bride' },
                  { name: 'Бутоньерки', query: 'boutonniere' },
                  { name: 'Свадебный декор', query: 'wedding_decor' },
                  { name: 'Лепестки роз', query: 'petals' }
                ]
              },
              { 
                id: Category.DRIED, 
                query: 'dried',
                label: 'Сухоцветы и декор', 
                icon: <Wind size={96} strokeWidth={1} />, 
                bg: 'bg-[#fffcf0] hover:bg-[#fff5cc]', 
                text: 'text-slate-900', 
                iconColor: 'text-[#ffd375]/35',
                subcategories: [
                  { name: 'Охапки сухоцветов', query: 'dried_bouquets' },
                  { name: 'Лавандовые наборы', query: 'lavender' },
                  { name: 'Интерьерный декор', query: 'home_decor' },
                  { name: 'Пампасная трава', query: 'pampas' }
                ]
              },
              { 
                id: Category.GIFTS, 
                query: 'gifts',
                label: 'Подарки и вазы', 
                icon: <Gift size={96} strokeWidth={1} />, 
                bg: 'bg-[#f0f5ff] hover:bg-[#dee8ff]', 
                text: 'text-slate-900', 
                iconColor: 'text-[#9cc4ff]/35',
                subcategories: [
                  { name: 'Дизайнерские вазы', query: 'vases' },
                  { name: 'Открытки ручной работы', query: 'cards' },
                  { name: 'Подарочные наборы', query: 'sweets' },
                  { name: 'Мягкие игрушки & Шары', query: 'toys' }
                ]
              },
            ].map((cat) => (
              <div 
                key={cat.id}
                onClick={() => navigate(`/catalog?category=${cat.query}`)}
                className={`group relative min-w-[210px] md:min-w-0 h-[220px] md:h-[260px] rounded-2xl md:rounded-[24px] p-5 md:p-6 flex flex-col justify-start items-start overflow-hidden text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer ${cat.bg}`}
              >
                <span className={`font-semibold text-base md:text-[18px] z-10 leading-snug w-full ${cat.text} group-hover:text-[#00c853] transition-colors`}>
                  {cat.label}
                </span>

                {/* Subcategories list */}
                <div className="flex flex-col gap-1.5 md:gap-2 mt-4 z-15 w-full relative">
                   {cat.subcategories.map((sub, sIdx) => {
                     return (
                       <div 
                         key={sIdx}
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/catalog?category=${sub.query}`);
                         }}
                         className="group/item flex items-center gap-2 py-0.5 text-xs md:text-[13px] font-medium text-slate-500 hover:text-[#00c853] transition-all duration-150 cursor-pointer"
                       >
                         <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-[#00c853] group-hover/item:scale-125 transition-all duration-200" />
                         <span className="truncate group-hover/item:translate-x-1.0 transition-transform duration-200">{sub.name}</span>
                       </div>
                     );
                   })}
                </div>
                
                {/* Minimalist Oversized Icon */}
                <div className={`absolute -bottom-4 -right-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${cat.iconColor}`}>
                   {cat.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-4 md:mb-8 max-w-2xl mx-auto">
             <h2 className="font-serif text-2xl md:text-3xl text-emerald-900 mb-2 md:mb-4">Избранное флористами</h2>
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
             <h2 className="font-serif text-2xl md:text-3xl text-emerald-900">Только что купили</h2>
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
             <h2 className="font-serif text-2xl md:text-3xl text-emerald-900">Новые поступления</h2>
             <button onClick={() => navigate('/catalog')} className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-2 transition-colors text-sm md:text-base">Смотреть все <ArrowRight size={16}/></button>
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


    </>
);
};
