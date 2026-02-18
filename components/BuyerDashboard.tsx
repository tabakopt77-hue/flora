
import React, { useState } from 'react';
import { Package, Clock, Heart, LogOut, Settings, User as UserIcon, MapPin, CreditCard, Bell } from 'lucide-react';
import { User, Order } from '../types';
import { Button } from './Button';

interface BuyerDashboardProps {
  user: User;
  onLogout: () => void;
  orders: Order[];
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onLogout, orders }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'favorites'>('orders');

  // Strict ownership check (IDOR protection on frontend level)
  const myOrders = orders.filter(o => o.userId === user.id);

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-medium ${
        activeTab === id 
        ? 'border-emerald-600 text-emerald-900' 
        : 'border-transparent text-gray-500 hover:text-gray-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-32 max-w-5xl animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
         <div className="relative">
             <img src={user.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
             <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-100 hover:bg-gray-50">
                <Settings size={14} className="text-gray-600" />
             </button>
         </div>
         <div className="text-center md:text-left flex-1">
             <h1 className="text-3xl font-serif text-emerald-900 mb-1">{user.name}</h1>
             <p className="text-gray-500">{user.email}</p>
         </div>
         <Button variant="outline" onClick={onLogout} className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300">
            <LogOut size={16} /> Выйти
         </Button>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
         <TabButton id="orders" label="Мои заказы" icon={Package} />
         <TabButton id="profile" label="Настройки" icon={UserIcon} />
         <TabButton id="favorites" label="Избранное" icon={Heart} />
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
         {activeTab === 'orders' && (
             <div className="space-y-6 animate-in fade-in">
                 {myOrders.length === 0 ? (
                     <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                         <Package size={48} className="mx-auto text-gray-300 mb-4" />
                         <h3 className="text-lg font-medium text-gray-900">У вас пока нет заказов</h3>
                         <p className="text-gray-500 mb-6">Самое время выбрать первый букет!</p>
                         <Button variant="outline">Перейти в каталог</Button>
                     </div>
                 ) : (
                     <div className="grid gap-4">
                        {myOrders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-lg text-gray-900">#{order.id}</span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {order.status === 'delivered' ? 'Доставлен' : 
                                             order.status === 'cancelled' ? 'Отменен' : 'В работе'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">{order.date}</p>
                                    <div className="flex -space-x-2">
                                        {order.items.slice(0,3).map((item, i) => (
                                            <img key={i} src={item.image} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between items-end">
                                    <span className="text-xl font-bold text-gray-900">{order.total} ₽</span>
                                    <Button size="sm" variant="ghost" className="text-emerald-700">Подробнее</Button>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
             </div>
         )}

         {activeTab === 'profile' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <h3 className="font-serif text-xl mb-6 flex items-center gap-2"><UserIcon size={20} className="text-emerald-600"/> Личные данные</h3>
                     <div className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                             <input type="text" value={user.name} readOnly className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                             <input type="text" value={user.email} readOnly className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200" />
                         </div>
                         <Button className="mt-2">Сохранить изменения</Button>
                     </div>
                 </div>

                 <div className="space-y-6">
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><MapPin size={20} /></div>
                             <div>
                                 <h4 className="font-medium">Адреса доставки</h4>
                                 <p className="text-sm text-gray-500">Москва, ул. Пушкина, д. 10</p>
                             </div>
                         </div>
                         <Button variant="ghost" size="sm">Изменить</Button>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><CreditCard size={20} /></div>
                             <div>
                                 <h4 className="font-medium">Способы оплаты</h4>
                                 <p className="text-sm text-gray-500">Visa •••• 4242</p>
                             </div>
                         </div>
                         <Button variant="ghost" size="sm">Изменить</Button>
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full"><Bell size={20} /></div>
                             <div>
                                 <h4 className="font-medium">Уведомления</h4>
                                 <p className="text-sm text-gray-500">Email, Push</p>
                             </div>
                         </div>
                         <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" checked readOnly className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-emerald-500 right-0"/>
                            <label className="toggle-label block overflow-hidden h-5 rounded-full bg-emerald-500 cursor-pointer"></label>
                        </div>
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'favorites' && (
             <div className="bg-sage-50 rounded-2xl p-12 text-center border border-sage-100 border-dashed animate-in fade-in">
                  <Heart className="mx-auto text-rose-300 mb-4" size={48} />
                  <h3 className="font-serif text-xl text-emerald-900 mb-2">Список желаний пуст</h3>
                  <p className="text-gray-500 mb-6">Добавляйте понравившиеся букеты, чтобы не потерять их.</p>
                  <Button>Перейти в каталог</Button>
             </div>
         )}
      </div>
    </div>
  );
};
