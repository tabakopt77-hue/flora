import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Package, Plus, Sparkles, Edit2, Trash, Truck, CheckCircle, Clock } from 'lucide-react';
import { SELLER_STATS } from '../constants';
import { Button } from './Button';
import { generateProductDescription } from '../services/geminiService';
import { Product, Category, Order, OrderStatus } from '../types';

interface SellerDashboardProps {
    onLogout: () => void;
    products: Product[];
    onAddProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    orders?: Order[]; // New Prop
    onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void; // New Prop
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
    onLogout, products, onAddProduct, onDeleteProduct, orders = [], onUpdateOrderStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'ai'>('overview');
  
  // New Product State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductKeywords, setNewProductKeywords] = useState('');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!newProductName) return;
    setIsGenerating(true);
    const desc = await generateProductDescription(newProductName, newProductKeywords);
    setGeneratedDesc(desc);
    setIsGenerating(false);
  };

  const handleSaveProduct = () => {
    if (!newProductName || !newProductPrice) return;

    const newProduct: Product = {
        id: `new-${Date.now()}`,
        name: newProductName,
        price: parseFloat(newProductPrice),
        category: Category.BOUQUETS, // Default for demo
        image: 'https://images.unsplash.com/photo-1595231916356-a86217eff12b?q=80&w=800&auto=format&fit=crop', // Placeholder image
        description: generatedDesc || 'Авторская композиция',
        tags: newProductKeywords.split(',').map(s => s.trim()),
        reviews: 0,
        rating: 5.0
    };

    onAddProduct(newProduct);
    
    // Reset form
    setNewProductName('');
    setNewProductPrice('');
    setNewProductKeywords('');
    setGeneratedDesc('');
    setIsAddingProduct(false);
  };

  const renderOverview = () => (
    <>
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
      {/* Chart placeholder same as before */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl font-medium">Динамика продаж</h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">За неделю</span>
            </div>
            <div className="h-64 flex items-end gap-4">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group">
                    <div style={{ height: `${h}%` }} className="bg-emerald-100 rounded-t-lg group-hover:bg-emerald-200 transition-all relative"></div>
                    <span className="text-xs text-center text-gray-400 mt-2">{i + 1}</span>
                </div>
                ))}
            </div>
      </div>
    </>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100">
            <h3 className="font-serif text-xl text-gray-900">Заказы ({orders.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
            {orders.length === 0 ? (
                 <div className="p-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Новых заказов пока нет</p>
                </div>
            ) : orders.map(order => (
                <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-lg text-gray-900">Заказ #{order.id}</span>
                            <span className="text-sm text-gray-500">{order.date}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border
                                ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                  order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                {order.status === 'pending' && 'Ожидает'}
                                {order.status === 'confirmed' && 'Подтвержден'}
                                {order.status === 'shipped' && 'В пути'}
                                {order.status === 'delivered' && 'Доставлен'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                             <p>Товаров: {order.items.length} • Сумма: <strong>{order.total} ₽</strong></p>
                             <p className="text-xs text-gray-400">Покупатель: {order.buyerName || 'Алексей Смирнов'}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {order.status === 'pending' && (
                             <Button size="sm" onClick={() => onUpdateOrderStatus?.(order.id, 'confirmed')}>
                                <CheckCircle size={16} className="mr-2" /> Подтвердить
                             </Button>
                        )}
                        {order.status === 'confirmed' && (
                             <Button size="sm" variant="outline" onClick={() => onUpdateOrderStatus?.(order.id, 'shipped')}>
                                <Truck size={16} className="mr-2" /> Отправить
                             </Button>
                        )}
                        {order.status === 'shipped' && (
                             <Button size="sm" variant="outline" onClick={() => onUpdateOrderStatus?.(order.id, 'delivered')}>
                                <Package size={16} className="mr-2" /> Доставлен
                             </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-32 max-w-7xl animate-in slide-in-from-bottom duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="font-serif text-3xl text-emerald-900 mb-2">Кабинет Партнера</h2>
          <p className="text-gray-500">Магазин "Green Paradise"</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onLogout}>Выйти</Button>
            <div className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                <span>Сегодня, 15 Марта</span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-emerald-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
              Обзор
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'products' ? 'bg-emerald-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
              Товары
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-emerald-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
              Заказы
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'ai' ? 'bg-emerald-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
              <Sparkles size={14} /> AI Помощник
          </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'products' && (
          /* Reusing the product list logic from before, keeping it simple here */
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-serif text-xl text-gray-900">Мои товары</h3>
                <Button size="sm" onClick={() => setIsAddingProduct(!isAddingProduct)}>
                    <Plus size={16} className="mr-2" /> Добавить товар
                </Button>
            </div>
            {isAddingProduct && (
                 <div className="p-6 bg-sage-50 border-b border-gray-100 animate-in slide-in-from-top-2">
                 <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <Sparkles size={16} className="text-emerald-600" /> Создание карточки с AI
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                         <input 
                             type="text" 
                             placeholder="Название товара" 
                             className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500"
                             value={newProductName}
                             onChange={(e) => setNewProductName(e.target.value)}
                         />
                         <div className="flex gap-4">
                            <input 
                                type="number" 
                                placeholder="Цена (₽)" 
                                className="w-1/3 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                            />
                             <input 
                                 type="text" 
                                 placeholder="Ключевые слова" 
                                 className="w-2/3 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500"
                                 value={newProductKeywords}
                                 onChange={(e) => setNewProductKeywords(e.target.value)}
                             />
                         </div>
                         <Button onClick={handleGenerateDescription} disabled={isGenerating || !newProductName} className="w-full">
                             {isGenerating ? 'AI пишет...' : 'Сгенерировать описание'}
                         </Button>
                     </div>
                     <div>
                         <textarea 
                             className="w-full h-full min-h-[150px] p-3 rounded-xl border border-gray-200 text-sm"
                             placeholder="Описание..."
                             value={generatedDesc}
                             onChange={(e) => setGeneratedDesc(e.target.value)}
                         />
                     </div>
                 </div>
                 <div className="flex justify-end gap-3 mt-4">
                     <Button variant="ghost" onClick={() => setIsAddingProduct(false)}>Отмена</Button>
                     <Button onClick={handleSaveProduct} disabled={!newProductName}>Сохранить</Button>
                 </div>
             </div>
            )}
            <div className="divide-y divide-gray-100">
                {products.map(p => (
                    <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                        <img src={p.image} className="w-12 h-12 rounded bg-gray-100 object-cover" />
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{p.name}</h4>
                            <p className="text-sm text-gray-500">{p.price} ₽</p>
                        </div>
                        <button onClick={() => onDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-rose-600"><Trash size={16} /></button>
                    </div>
                ))}
            </div>
          </div>
      )}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Sparkles size={48} className="mx-auto text-emerald-400 mb-4" />
              <h3 className="font-serif text-2xl text-emerald-900 mb-2">Flora для Бизнеса</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">Полная аналитика доступна в PRO версии.</p>
          </div>
      )}
    </div>
  );
};