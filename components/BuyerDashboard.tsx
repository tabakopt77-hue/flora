
import React, { useState, useEffect } from 'react';
import { Package, Clock, Heart, LogOut, Settings, User as UserIcon, MapPin, CreditCard, Bell, Sparkles, ArrowRight, Gift, Plus, Calendar, Trash2, CalendarDays, Eye, HelpCircle } from 'lucide-react';
import { User, Order, Product, UserPreferences } from '../types';
import { Button } from './Button';
import { PRODUCTS } from '../constants'; // Fallback / mock source for recs
import { getProductRecommendations } from '../services/geminiService';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface BuyerDashboardProps {
  user: User;
  onLogout: () => void;
  orders: Order[];
  wishlist?: string[];
  allProducts?: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  openFullPage?: boolean;
  onToggleOpenFullPage?: (val: boolean) => void;
}

interface UserEvent {
  id: string;
  name: string;
  date: string;
  type: 'birthday' | 'holiday';
  autoOrder: boolean;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ 
    user, onLogout, orders, wishlist = [], allProducts = [], onAddToCart, onToggleWishlist, openFullPage, onToggleOpenFullPage 
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'favorites' | 'loyalty' | 'events'>('orders');
  const [aiRecommendations, setAiRecommendations] = useState<(Product & { reason: string })[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Events State
  const [events, setEvents] = useState<UserEvent[]>([
    { id: '1', name: 'День рождения мамы', date: '2026-05-12', type: 'birthday', autoOrder: true },
    { id: '2', name: 'Годовщина', date: '2026-08-20', type: 'holiday', autoOrder: false }
  ]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<UserEvent>>({ type: 'birthday', autoOrder: false });
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Strict ownership check (IDOR protection on frontend level)
  const myOrders = React.useMemo(() => orders.filter(o => o.userId === user.id), [orders, user.id]);
  
  // Filter wishlist products
  const favoriteProducts = React.useMemo(() => allProducts.filter(p => wishlist.includes(p.id)), [allProducts, wishlist]);
  
  // Mock Loyalty Points calculation
  const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0);
  const loyaltyPoints = Math.floor(totalSpent * 0.05); // 5% cashback
  const nextTier = 50000;
  const progressToNextTier = Math.min((totalSpent / nextTier) * 100, 100);

  useEffect(() => {
    if (activeTab === 'favorites' && favoriteProducts.length === 0) {
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
                const seedProduct = allProducts[0] || PRODUCTS[0]; 
                
                const recs = await getProductRecommendations(seedProduct, allProducts.length > 0 ? allProducts : PRODUCTS, userProfile);
                 if (recs && recs.length > 0) {
                    const fullRecs = recs.map(res => {
                        const p = (allProducts.length > 0 ? allProducts : PRODUCTS).find(prod => prod.id === res.id);
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
  }, [activeTab, myOrders, favoriteProducts.length]);

  const handleAddEvent = () => {
    if (newEvent.name && newEvent.date) {
      setEvents([...events, { ...newEvent, id: crypto.randomUUID() } as UserEvent]);
      setNewEvent({ type: 'birthday', autoOrder: false });
      setIsAddingEvent(false);
    }
  };

  const handleToggleAutoOrder = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, autoOrder: !e.autoOrder } : e));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleConnectGoogleCalendar = () => {
    // Mock Google Calendar Connection
    setIsGoogleConnected(true);
    setEvents([
      ...events,
      { id: 'g1', name: 'День рождения Анны (Google)', date: '2026-04-15', type: 'birthday', autoOrder: false },
      { id: 'g2', name: '8 Марта (Google)', date: '2027-03-08', type: 'holiday', autoOrder: true }
    ]);
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-medium whitespace-nowrap ${
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
      <Helmet>
        <title>Личный кабинет</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
         <TabButton id="orders" label="Мои заказы" icon={Package} />
         <TabButton id="favorites" label={`Избранное ${wishlist.length > 0 ? `(${wishlist.length})` : ''}`} icon={Heart} />
         <TabButton id="events" label="Календарь событий" icon={Calendar} />
         <TabButton id="loyalty" label="Бонусы Aura" icon={Gift} />
         <TabButton id="profile" label="Настройки" icon={UserIcon} />
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

         {activeTab === 'events' && (
             <div className="animate-in fade-in space-y-6">
                 <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                         <div>
                             <h3 className="font-serif text-2xl text-emerald-900 flex items-center gap-2">
                                 <CalendarDays className="text-emerald-600" /> Календарь событий
                             </h3>
                             <p className="text-gray-500 mt-1">Добавьте важные даты, и мы напомним вам о них или автоматически оформим заказ.</p>
                         </div>
                         <div className="flex gap-3">
                             {!isGoogleConnected ? (
                                 <Button variant="outline" onClick={handleConnectGoogleCalendar} className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                                     <svg className="w-4 h-4" viewBox="0 0 24 24">
                                         <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                     </svg>
                                     Google Календарь
                                 </Button>
                             ) : (
                                 <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                     <svg className="w-4 h-4" viewBox="0 0 24 24">
                                         <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                     </svg>
                                     Синхронизировано
                                 </div>
                             )}
                             <Button onClick={() => setIsAddingEvent(!isAddingEvent)} className="gap-2">
                                 <Plus size={16} /> Добавить
                             </Button>
                         </div>
                     </div>

                     {isAddingEvent && (
                         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 animate-in slide-in-from-top-2">
                             <h4 className="font-medium text-gray-900 mb-4">Новое событие</h4>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                 <div>
                                     <label className="block text-sm text-gray-600 mb-1">Название</label>
                                     <input 
                                         type="text" 
                                         value={newEvent.name || ''} 
                                         onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                                         placeholder="Например: День рождения жены"
                                         className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm text-gray-600 mb-1">Дата</label>
                                     <input 
                                         type="date" 
                                         value={newEvent.date || ''} 
                                         onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                         className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm text-gray-600 mb-1">Тип</label>
                                     <select 
                                         value={newEvent.type} 
                                         onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                                         className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
                                     >
                                         <option value="birthday">День рождения</option>
                                         <option value="holiday">Праздник / Годовщина</option>
                                     </select>
                                 </div>
                             </div>
                             <div className="flex items-center justify-between">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                     <input 
                                         type="checkbox" 
                                         checked={newEvent.autoOrder} 
                                         onChange={e => setNewEvent({...newEvent, autoOrder: e.target.checked})}
                                         className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                     />
                                     <span className="text-sm text-gray-700">Включить автозаказ (мы подберем и доставим букет)</span>
                                 </label>
                                 <div className="flex gap-2">
                                     <Button variant="ghost" onClick={() => setIsAddingEvent(false)}>Отмена</Button>
                                     <Button onClick={handleAddEvent} disabled={!newEvent.name || !newEvent.date}>Сохранить</Button>
                                 </div>
                             </div>
                         </div>
                     )}

                     <div className="space-y-4">
                         {events.length === 0 ? (
                             <div className="text-center py-8 text-gray-500">Нет добавленных событий</div>
                         ) : (
                             events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                                 <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors gap-4">
                                     <div className="flex items-center gap-4">
                                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${event.type === 'birthday' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500'}`}>
                                             {event.type === 'birthday' ? <Gift size={20} /> : <Heart size={20} />}
                                         </div>
                                         <div>
                                             <h4 className="font-medium text-gray-900">{event.name}</h4>
                                             <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-6">
                                         <div className="flex items-center gap-2">
                                             <span className="text-sm text-gray-600">Автозаказ:</span>
                                             <button 
                                                 onClick={() => handleToggleAutoOrder(event.id)}
                                                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${event.autoOrder ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                             >
                                                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${event.autoOrder ? 'translate-x-6' : 'translate-x-1'}`} />
                                             </button>
                                         </div>
                                         <button onClick={() => handleDeleteEvent(event.id)} className="text-gray-400 hover:text-rose-500 transition-colors p-2">
                                             <Trash2 size={18} />
                                         </button>
                                     </div>
                                 </div>
                             ))
                         )}
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'loyalty' && (
             <div className="animate-in fade-in">
                 <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                         <div>
                             <p className="text-emerald-200 mb-1">Ваш баланс</p>
                             <h2 className="text-5xl font-serif mb-4">{loyaltyPoints} <span className="text-2xl text-emerald-300 font-sans font-normal">баллов</span></h2>
                             <div className="flex items-center gap-2 text-sm text-emerald-100 bg-white/10 px-3 py-1 rounded-full w-fit">
                                 <Sparkles size={14} /> 1 балл = 1 рубль
                             </div>
                         </div>
                         <div className="w-full md:w-64">
                             <div className="flex justify-between text-xs text-emerald-200 mb-2">
                                 <span>Silver</span>
                                 <span>Gold ({nextTier - totalSpent} до уровня)</span>
                             </div>
                             <div className="w-full h-2 bg-emerald-950/50 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-400" style={{ width: `${progressToNextTier}%` }}></div>
                             </div>
                         </div>
                     </div>
                 </div>

                 <h3 className="font-bold text-lg text-gray-900 mb-4">История начислений</h3>
                 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                     {myOrders.length > 0 ? myOrders.map(order => (
                         <div key={order.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                     <ArrowRight size={18} className="-rotate-45" />
                                 </div>
                                 <div>
                                     <p className="font-medium text-gray-900">Заказ #{order.id}</p>
                                     <p className="text-xs text-gray-500">{order.date}</p>
                                 </div>
                             </div>
                             <span className="font-bold text-emerald-600">+{Math.floor(order.total * 0.05)} Б</span>
                         </div>
                     )) : (
                         <div className="p-8 text-center text-gray-500">У вас пока нет истории начислений.</div>
                     )}
                 </div>
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
                     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full"><Eye size={20} /></div>
                             <div>
                                 <div className="flex items-center gap-2">
                                     <h4 className="font-medium">Полная карточка</h4>
                                     <div className="group relative z-10 flex items-center">
                                        <HelpCircle size={14} className="text-gray-400 cursor-help" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 scale-95 group-hover:scale-100 shadow-xl pointer-events-none before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                                            При клике на товар будет открываться полноценная страница с отзывами и подробным описанием вместо быстрого просмотра.
                                        </div>
                                     </div>
                                 </div>
                                 <p className="text-sm text-gray-500">Вместо быстрого окна</p>
                             </div>
                         </div>
                         <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in" onClick={() => onToggleOpenFullPage?.(!openFullPage)}>
                            <input type="checkbox" checked={openFullPage || false} readOnly className={`toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer overflow-hidden ${openFullPage ? 'right-0 border-emerald-500' : 'left-0 border-gray-300'}`}/>
                            <label className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${openFullPage ? 'bg-emerald-500' : 'bg-gray-300'}`}></label>
                        </div>
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'favorites' && (
             <div className="space-y-8 animate-in fade-in">
                {favoriteProducts.length === 0 ? (
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
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteProducts.map((product, index) => (
                            <div key={`${product.id}-${index}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col">
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                    <Link to={`/product/${product.id}`} className="block w-full h-full">
                                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </Link>
                                    <button 
                                        onClick={() => onToggleWishlist && onToggleWishlist(product)}
                                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                                    >
                                        <Heart size={18} fill="currentColor" />
                                    </button>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="mb-auto">
                                        <h4 className="font-serif font-medium text-gray-900 text-lg mb-1">{product.name}</h4>
                                        <p className="text-emerald-700 font-medium">{product.price} ₽</p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        className="w-full mt-4 flex items-center justify-center gap-2"
                                        onClick={() => onAddToCart && onAddToCart(product)}
                                    >
                                        <Plus size={16} /> В корзину
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
         )}
      </div>
    </div>
  );
};
