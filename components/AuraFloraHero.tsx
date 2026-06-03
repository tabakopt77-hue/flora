import React from 'react';
import { Search, Camera, ShoppingBag, Gift, Sparkles } from 'lucide-react';

export default function AuraFloraHero() {
  return (
    <div className="relative min-h-[90vh] w-full bg-[#f8f9fc] text-slate-900 overflow-hidden font-sans">
      
      {/* Premium Modern Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 via-purple-50/20 to-transparent"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-100/40 to-cyan-100/40 blur-[100px]"></div>
        <div className="absolute top-[20%] left-[-100px] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-rose-100/40 to-orange-100/40 blur-[100px]"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif text-xl italic">F</span>
            Floramos
        </div>
        
        <nav className="hidden md:flex space-x-8 text-[15px] font-medium text-slate-600">
          <a href="#" className="hover:text-slate-900 transition-colors">Каталог</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Блог</a>
          <a href="#" className="hover:text-slate-900 transition-colors">О нас</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="hidden md:flex items-center space-x-2 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 px-4 py-2 rounded-xl text-sm transition-all focus:ring-2 focus:ring-slate-200 text-slate-600">
            <Search size={16} />
            <span>Найти букет</span>
            <Camera size={16} className="ml-2 text-slate-400" />
          </button>
          
          <button className="flex items-center space-x-2 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 px-4 py-2 rounded-xl text-sm transition-all text-slate-900 font-medium relative">
            <ShoppingBag size={16} className="text-emerald-600" />
            <span>Корзина</span>
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">3</span>
          </button>
          
          <button className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
            PF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-8 pt-16 md:pt-28 pb-12 flex flex-col justify-center max-w-7xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-8 border border-emerald-100">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            ИИ подбор букетов работает
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-6">
            Искусство дарить <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">воспоминания.</span>
          </h1>
          
          <p className="text-slate-500 text-lg md:text-2xl mb-10 max-w-2xl leading-relaxed font-medium">
            Свежие авторские букеты от <span className="text-slate-800">Floramos</span> с доставкой за час. Мы объединили мастерство флористов и умные технологии.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5">
              Выбрать букет
            </button>
            <button className="flex items-center space-x-2 bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-8 py-4 rounded-2xl font-semibold transition-all shadow-sm">
              <Gift size={20} className="text-rose-500" />
              <span>Подобрать подарок</span>
            </button>
          </div>
        </div>

        {/* Floating cards / elements can go here on the right side if needed, but keeping it clean for modern look */}
      </main>
    </div>
  );
}
