import React from 'react';
import { Package, Clock, Heart, LogOut, Settings } from 'lucide-react';
import { User, Order } from '../types';
import { Button } from './Button';

interface BuyerDashboardProps {
  user: User;
  onLogout: () => void;
  orders: Order[]; // New prop
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onLogout, orders }) => {
  return (
    <div className="container mx-auto px-4 py-32 max-w-4xl animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center mb-6">
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-emerald-50" />
              <h2 className="font-serif text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-emerald-600 text-sm mb-6">{user.email}</p>
              
              <div className="flex flex-col gap-2">
                 <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings size={16} /> Настройки
                 </Button>
                 <Button variant="ghost" className="w-full justify-start gap-2 text-rose-500 hover:bg-rose-50" onClick={onLogout}>
                    <LogOut size={16} /> Выйти
                 </Button>
              </div>
           </div>

           {/* AI Tip for Buyer */}
           <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="font-serif text-lg mb-2 relative z-10">Совет от Flora</h3>
              <p className="text-emerald-100 text-sm leading-relaxed relative z-10">
                "Алексей, скоро День Матери! На основе ваших прошлых покупок, вашей маме могут понравиться пионы пастельных тонов."
              </p>
           </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3">
           <h3 className="font-serif text-2xl text-emerald-900 mb-6">Мои заказы</h3>
           
           <div className="space-y-4">
              {orders.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                      <Package size={48} className="mx-auto text-gray-200 mb-4" />
                      <p className="text-gray-500">У вас пока нет заказов</p>
                  </div>
              ) : (
                orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center text-emerald-800">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Заказ #{order.id}</p>
                            <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <p className="font-bold text-gray-900">{order.total} ₽</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {order.status === 'delivered' ? 'Доставлен' : 'В обработке'}
                        </span>
                    </div>
                    </div>
                ))
              )}
           </div>

           <h3 className="font-serif text-2xl text-emerald-900 mb-6 mt-12">Избранное</h3>
           <div className="bg-sage-50 rounded-2xl p-8 text-center border border-sage-100 border-dashed">
              <Heart className="mx-auto text-gray-300 mb-3" size={32} />
              <p className="text-gray-500">Вы пока ничего не добавили в избранное.</p>
              <Button variant="ghost" className="mt-2">Перейти в каталог</Button>
           </div>
        </div>
      </div>
    </div>
  );
};