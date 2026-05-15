import React from 'react';
import { Search, Camera, ShoppingBag, Gift, Sparkles } from 'lucide-react';
import CinematicParticles from './CinematicParticles';

export default function AuraFloraHero() {
  return (
    <div className="relative min-h-screen w-full bg-[#022B1E] text-white overflow-hidden font-sans">
      {/* 3D Particle Background */}
      <div className="absolute inset-0 z-0">
        <CinematicParticles />
      </div>
      
      {/* Gradient overlay to ensure text readability on the left */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#022B1E] via-[#022B1E]/60 to-transparent pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-serif font-bold tracking-wide">Aura Flora</div>
        
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <a href="#" className="hover:text-aura-green transition-colors">Каталог</a>
          <a href="#" className="hover:text-aura-green transition-colors">Блог</a>
          <a href="#" className="hover:text-aura-green transition-colors">О нас</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="hidden md:flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm transition-colors border border-white/10 backdrop-blur-sm">
            <Search size={16} className="opacity-70" />
            <span className="opacity-70">Найти букет</span>
            <Camera size={16} className="ml-2 opacity-70" />
          </button>
          
          <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm transition-colors border border-white/10 backdrop-blur-sm relative">
            <ShoppingBag size={16} />
            <span>Корзина</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
          </button>
          
          <button className="w-9 h-9 rounded-full bg-[#1a4731] border border-aura-green flex items-center justify-center text-sm font-medium hover:bg-[#235c40] transition-colors">
            PF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-8 pt-10 md:pt-20 pb-8 md:pb-12 flex flex-col justify-center min-h-[calc(100vh-88px)] max-w-7xl">
        <div className="max-w-2xl">
          <h1 className="text-6xl md:text-[5.5rem] font-serif leading-[1.1] mb-6">
            Искусство <br />
            <span className="font-cursive text-aura-green text-[5.5rem] md:text-[8rem] lowercase tracking-wider block -mt-6 mb-2">дарить</span>
            чувства.
          </h1>
          
          <p className="text-aura-text text-lg md:text-xl mb-10 max-w-lg leading-relaxed font-light">
            Авторские букеты от Aura Flora с доставкой день в день. Мы объединили мастерство флористов и технологии ИИ.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 ml-[120px] md:ml-0">
            <button className="bg-white text-[#022B1E] px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Выбрать букет
            </button>
            <button className="flex items-center space-x-2 border border-white/30 hover:border-white/60 px-8 py-4 rounded-full font-medium transition-colors bg-white/5 backdrop-blur-sm">
              <Gift size={20} />
              <span>Подобрать подарок</span>
            </button>
          </div>
        </div>

        {/* Bottom Left AI Chat */}
        <div className="absolute bottom-8 left-16 md:left-8 flex items-center space-x-2 text-aura-text text-sm cursor-pointer hover:text-white transition-colors group">
          <Sparkles size={16} className="animate-aster" />
          <span>Чат с флористом Flora AI</span>
        </div>
      </main>
    </div>
  );
}
