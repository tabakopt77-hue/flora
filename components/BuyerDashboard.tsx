
import React, { useState, useEffect } from 'react';
import { Package, Clock, Heart, LogOut, Settings, User as UserIcon, MapPin, CreditCard, Bell, Sparkles, ArrowRight } from 'lucide-react';
import { User, Order, Product, UserPreferences } from '../types';
import { Button } from './Button';
import { PRODUCTS } from '../constants'; // Fallback / mock source for recs
import { getProductRecommendations } from '../services/geminiService';
import { Link } from 'react-router-dom';

interface BuyerDashboardProps {
  user: User;
  onLogout: () => void;
  orders: Order[];
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onLogout, orders }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'favorites'>('orders');
  const [aiRecommendations, setAiRecommendations] = useState<(Product & { reason: string })[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Strict ownership check (IDOR protection on frontend level)
  const myOrders = orders.filter(o => o.userId === user.id);

  useEffect(() => {
    if (activeTab === 'favorites') {
        const fetchRecs = async () => {
            setLoadingRecs(true);
            try {
                // Simulate user profile for AI
                const userProfile: UserPreferences = {
                    pastPurchases: myOrders.flatMap(o => o.items.map(i => i.name)),
                    favoriteColors: ["Пастельные", "Белый"],
                    preferredStyle: ["Минимализм"],
                    recentOccasions: ["День рождения"]
                };
                
                // We pick a random product as a "seed" if no history, or use purchase history
                const seedProduct = PRODUCTS[0]; 
                
                const recs = await getProductRecommendations(seedProduct, PRODUCTS, userProfile);
                 if (recs && recs.length > 0) {
                    const fullRecs = recs.map(res => {
                        const p = PRODUCTS.find(prod => prod.id === res.id);
                        return p ? { ...p, reason: res.reason } : null;
                    }).filter(Boolean) as (Product & { reason: string })[];
                    setAiRecommendations(fullRecs.slice(0, 2));
                 }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingRecs(false);
            }
        };
        fetchRecs();
    }
  }, [activeTab, myOrders]);

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-medium ${
        activeTab === id 
        ? 'border-emerald-600 text-emerald-900' 
        : 'border-transparent text-gray-600 hover:text-gray-800'
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
                         <Link to="/catalog"><Button variant="outline">Перейти в каталог</Button></Link>
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
             <div className="space-y-8 animate-in fade-in">
                {/* Empty State */}
                 <div className="bg-sage-50 rounded-2xl p-12 text-center border border-sage-100 border-dashed">
                      <Heart className="mx-auto text-rose-300 mb-4" size={48} />
                      <h3 className="font-serif text-xl text-emerald-900 mb-2">Список желаний пуст</h3>
                      <p className="text-gray-500 mb-6">Но мы знаем, что вам может понравиться:</p>
                      
                      {/* AI Recommendations Section */}
                      {loadingRecs ? (
                          <div className="flex justify-center py-4"><span className="text-emerald-600 animate-pulse">Flora подбирает для вас...</span></div>
                      ) : aiRecommendations.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                              {aiRecommendations.map(rec => (
                                   <Link to={`/product/${rec.id}`} key={rec.id} className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 flex gap-4 hover:border-emerald-300 transition-colors group">
                                       <img src={rec.image} className="w-20 h-20 rounded-lg object-cover" />
                                       <div className="flex-1">
                                           <div className="flex items-center gap-2 mb-1">
                                               <Sparkles size={12} className="text-emerald-500" />
                                               <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Flora рекомендует</span>
                                           </div>
                                           <h4 className="font-serif font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">{rec.name}</h4>
                                           <p className="text-xs text-gray-500 line-clamp-2 mt-1">{rec.reason}</p>
                                       </div>
                                       <div className="flex items-center justify-center">
                                           <div className="bg-emerald-50 p-2 rounded-full text-emerald-800 group-hover:bg-emerald-100 transition-colors"><ArrowRight size={16} /></div>
                                       </div>
                                   </Link>
                              ))}
                          </div>
                      ) : (
                          <Link to="/catalog"><Button>Перейти в каталог</Button></Link>
                      )}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};
