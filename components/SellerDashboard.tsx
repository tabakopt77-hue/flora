import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Package, DollarSign, Calendar } from 'lucide-react';
import { SELLER_STATS } from '../constants';

export const SellerDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="font-serif text-3xl text-emerald-900 mb-2">Кабинет Партнера</h2>
          <p className="text-gray-500">С возвращением, Green Thumb Store</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm flex items-center gap-2">
          <Calendar size={16} className="text-emerald-600" />
          <span>Последние 30 дней</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {SELLER_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {stat.change}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl font-medium">AI Прогноз спроса</h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Высокая точность</span>
          </div>
          <div className="h-64 flex items-end gap-4">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group">
                 <div 
                  style={{ height: `${h}%` }} 
                  className="bg-emerald-100 rounded-t-lg group-hover:bg-emerald-200 transition-all relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity">
                    {h * 12} Заказов
                  </div>
                </div>
                 <span className="text-xs text-center text-gray-400 mt-2">День {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-emerald-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="font-serif text-xl font-medium mb-6 relative z-10">Инсайты от Flora</h3>
          <ul className="space-y-6 relative z-10">
            <li className="flex gap-4">
              <div className="p-2 bg-white/10 rounded-lg h-fit"><TrendingUp size={20} className="text-emerald-300" /></div>
              <div>
                <p className="font-medium text-sm mb-1">Спрос на Тюльпаны</p>
                <p className="text-emerald-200/80 text-xs">Интерес вырос на 45% за неделю. Рекомендуем пополнить запасы.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="p-2 bg-white/10 rounded-lg h-fit"><Users size={20} className="text-rose-300" /></div>
              <div>
                <p className="font-medium text-sm mb-1">Повторные покупки</p>
                <p className="text-emerald-200/80 text-xs">Персонализированные открытки увеличили удержание клиентов на 12%.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="p-2 bg-white/10 rounded-lg h-fit"><DollarSign size={20} className="text-yellow-300" /></div>
              <div>
                <p className="font-medium text-sm mb-1">Ценообразование</p>
                <p className="text-emerald-200/80 text-xs">Средняя цена на пионы на рынке выросла. Есть возможность скорректировать маржу.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};