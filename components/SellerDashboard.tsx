
import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Package, ShoppingCart, Users, Settings, 
    LogOut, Plus, Search, Filter, MoreVertical, ChevronRight,
    TrendingUp, ArrowUpRight, DollarSign, Clock, CheckCircle, Truck, Edit, Trash2, X, Image as ImageIcon, Sparkles,
    BarChart2, Zap, ArrowDown, Target
} from 'lucide-react';
import { Product, Category, Order, OrderStatus, User, PriceAnalysis, DemandForecast } from '../types';
import { Button } from './Button';
import { generateProductDescription, analyzePrice, getSeasonalForecast } from '../services/geminiService';
import { ToastMessage } from './Toast';

interface SellerDashboardProps {
    onLogout: () => void;
    products: Product[];
    onAddProduct: (product: Product) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    orders: Order[];
    onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
    user: User | null;
    addToast: (type: ToastMessage['type'], msg: string) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
    onLogout, products, onAddProduct, onUpdateProduct, onDeleteProduct, orders, onUpdateOrderStatus, user, addToast
}) => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'analytics'>('dashboard');
    
    // --- State for Products View ---
    const [productSearch, setProductSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // --- State for Product Modal ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [prodName, setProdName] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodStock, setProdStock] = useState('10'); // Default stock
    const [prodKeywords, setProdKeywords] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodCategory, setProdCategory] = useState<Category>(Category.BOUQUETS);
    const [prodImage, setProdImage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // --- State for Analytics ---
    const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis | null>(null);
    const [analyzingProduct, setAnalyzingProduct] = useState<string | null>(null); // Product ID
    const [forecast, setForecast] = useState<DemandForecast | null>(null);
    const [loadingForecast, setLoadingForecast] = useState(false);

    // --- State for Orders View ---
    const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

    // --- Helpers ---
    
    const openProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProdName(product.name);
            setProdPrice(product.price.toString());
            setProdStock(product.stock.toString());
            setProdKeywords(product.tags.join(', '));
            setProdDesc(product.description);
            setProdCategory(product.category);
            setProdImage(product.image);
        } else {
            setEditingProduct(null);
            setProdName('');
            setProdPrice('');
            setProdStock('10');
            setProdKeywords('');
            setProdDesc('');
            setProdCategory(Category.BOUQUETS);
            setProdImage('');
        }
        setIsProductModalOpen(true);
    };

    const handleGenerateDescription = async () => {
        if (!prodName) return;
        setIsGenerating(true);
        const desc = await generateProductDescription(prodName, prodKeywords);
        setProdDesc(desc);
        setIsGenerating(false);
    };

    const handleAnalyzePrice = async (product: Product) => {
        setAnalyzingProduct(product.id);
        const analysis = await analyzePrice(product.name, product.price, product.category);
        if (analysis) {
            setPriceAnalysis(analysis);
        } else {
            addToast('error', 'Не удалось провести анализ');
        }
        setAnalyzingProduct(null);
    };

    const handleLoadForecast = async () => {
        setLoadingForecast(true);
        const result = await getSeasonalForecast(Category.BOUQUETS); // Default category for main dashboard
        if (result) {
            setForecast(result);
        }
        setLoadingForecast(false);
    };

    useEffect(() => {
        if (currentView === 'analytics' && !forecast) {
            handleLoadForecast();
        }
    }, [currentView]);

    const handleSaveProduct = () => {
        if (!prodName || !prodPrice) {
            addToast('error', 'Заполните название и цену');
            return;
        }

        const productData: Product = {
            id: editingProduct ? editingProduct.id : `new-${Date.now()}`,
            name: prodName,
            price: parseFloat(prodPrice),
            stock: parseInt(prodStock) || 0,
            isActive: true,
            storeId: user?.id || 's1', // Bind to current seller
            category: prodCategory,
            image: prodImage || 'https://images.unsplash.com/photo-1595231916356-a86217eff12b?q=80&w=800&auto=format&fit=crop',
            description: prodDesc || 'Авторская композиция',
            tags: prodKeywords.split(',').map(s => s.trim()).filter(Boolean),
            reviews: editingProduct ? editingProduct.reviews : 0,
            rating: editingProduct ? editingProduct.rating : 5.0
        };

        if (editingProduct) {
            onUpdateProduct(productData);
        } else {
            onAddProduct(productData);
        }
        
        setIsProductModalOpen(false);
    };

    // --- Filtered Data ---

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.category.toLowerCase().includes(productSearch.toLowerCase())
    );

    const filteredOrders = orders.filter(o => {
        if (orderFilter === 'all') return true;
        if (orderFilter === 'pending') return o.status === 'pending' || o.status === 'created';
        if (orderFilter === 'active') return ['confirmed', 'shipped', 'paid'].includes(o.status);
        if (orderFilter === 'completed') return ['delivered', 'cancelled', 'completed'].includes(o.status);
        return true;
    });

    // --- Customer Analytics ---
    const customers = React.useMemo(() => {
        const map = new Map<string, { name: string, orders: number, spent: number, lastOrder: string }>();
        orders.forEach(o => {
            const name = o.buyerName || 'Гость';
            if (!map.has(name)) {
                map.set(name, { name, orders: 0, spent: 0, lastOrder: o.date });
            }
            const c = map.get(name)!;
            c.orders += 1;
            c.spent += o.total;
            c.lastOrder = o.date;
        });
        return Array.from(map.values());
    }, [orders]);

    // --- Sub-Components ---

    const SidebarItem = ({ icon: Icon, label, view }: { icon: any, label: string, view: typeof currentView }) => (
        <button 
            onClick={() => setCurrentView(view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === view ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const StatCard = ({ label, value, trend, icon: Icon }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-xl text-gray-600"><Icon size={20} /></div>
                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +{trend}% <ArrowUpRight size={12} className="ml-1"/>
                </span>
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    );

    const ProductsView = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Товары</h2>
                <Button size="sm" onClick={() => openProductModal()}><Plus size={16} className="mr-2"/> Добавить товар</Button>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Поиск..." 
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500" 
                        />
                    </div>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Товар</th>
                            <th className="px-6 py-4">Цена</th>
                            <th className="px-6 py-4">Остаток</th>
                            <th className="px-6 py-4 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" />
                                        <div>
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500">{product.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium">{product.price} ₽</td>
                                <td className="px-6 py-4"><span className={product.stock < 5 ? 'text-rose-600 font-medium' : 'text-gray-600'}>{product.stock} шт.</span></td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openProductModal(product)} className="text-gray-500 hover:text-emerald-600 p-2"><Edit size={16}/></button>
                                        <button onClick={() => onDeleteProduct(product.id)} className="text-gray-500 hover:text-rose-600 p-2"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const AnalyticsView = () => (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Sparkles className="text-emerald-500" size={24}/> AI Аналитика</h2>
                    <p className="text-gray-500 text-sm">Прогнозы и рекомендации от Gemini Pro</p>
                </div>
                <Button size="sm" variant="outline" onClick={handleLoadForecast} disabled={loadingForecast}>
                   {loadingForecast ? 'Обновление...' : 'Обновить прогноз'}
                </Button>
            </div>

            {/* Demand Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     
                     <div className="relative z-10">
                         <div className="flex items-center gap-2 mb-6">
                             <TrendingUp className="text-emerald-400" />
                             <h3 className="text-lg font-semibold">Прогноз спроса: {forecast ? forecast.period : 'Загрузка...'}</h3>
                         </div>
                         
                         {forecast ? (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 <div>
                                     <p className="text-indigo-200 text-sm mb-1">Ожидаемый тренд</p>
                                     <div className="text-3xl font-bold flex items-center gap-2">
                                         {forecast.trend === 'rising' ? 'Рост' : 'Спад'}
                                         {forecast.trend === 'rising' ? <ArrowUpRight className="text-emerald-400"/> : <ArrowDown className="text-rose-400"/>}
                                     </div>
                                     <p className="text-sm text-emerald-400 font-medium mt-1">+{forecast.predictedSalesGrowth}% к продажам</p>
                                 </div>
                                 <div className="md:col-span-2">
                                     <p className="text-indigo-200 text-sm mb-2">Трендовые запросы</p>
                                     <div className="flex flex-wrap gap-2">
                                         {forecast.topKeywords.map(k => (
                                             <span key={k} className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">{k}</span>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                         ) : (
                             <div className="h-32 flex items-center justify-center text-white/50">Анализируем рыночные данные...</div>
                         )}
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                     <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={18} className="text-emerald-600"/> Советы флористам</h3>
                     {forecast ? (
                         <ul className="space-y-3">
                             {forecast.actionableTips.map((tip, i) => (
                                 <li key={i} className="flex gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                     <div className="min-w-[6px] h-[6px] rounded-full bg-emerald-500 mt-1.5"></div>
                                     {tip}
                                 </li>
                             ))}
                         </ul>
                     ) : (
                         <div className="space-y-3 opacity-50">
                             {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>)}
                         </div>
                     )}
                 </div>
            </div>

            {/* Price Optimizer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg">Оптимизация цен</h3>
                    <p className="text-gray-500 text-sm">ИИ сравнивает ваши товары с конкурентами</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {/* Active Analysis Result */}
                    {priceAnalysis && (
                        <div className="col-span-full bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-6 animate-in slide-in-from-top-2">
                             <div className="flex-1">
                                 <h4 className="font-bold text-emerald-900 mb-2">Анализ завершен</h4>
                                 <p className="text-sm text-emerald-800 mb-4">{priceAnalysis.reasoning}</p>
                                 <div className="flex gap-4 text-sm">
                                     <div>
                                         <span className="block text-emerald-600 text-xs">Рыночная цена</span>
                                         <span className="font-bold text-gray-900">{priceAnalysis.marketAverage} ₽</span>
                                     </div>
                                     <div>
                                         <span className="block text-emerald-600 text-xs">Рекомендуем</span>
                                         <span className="font-bold text-emerald-700 text-lg">{priceAnalysis.suggestedPrice} ₽</span>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-center">
                                 <div className="text-center px-6 border-l border-emerald-200">
                                     <div className="text-2xl font-bold text-emerald-600">{priceAnalysis.confidence}%</div>
                                     <div className="text-xs text-emerald-800">Уверенность</div>
                                 </div>
                             </div>
                        </div>
                    )}

                    {products.slice(0, 3).map(product => (
                        <div key={product.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={product.image} className="w-12 h-12 rounded-lg object-cover" />
                                <div>
                                    <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.price} ₽</div>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full" 
                                onClick={() => handleAnalyzePrice(product)}
                                disabled={analyzingProduct === product.id}
                            >
                                {analyzingProduct === product.id ? (
                                    <><Zap size={14} className="mr-2 animate-spin"/> Анализирую...</>
                                ) : (
                                    <><BarChart2 size={14} className="mr-2"/> Проверить цену</>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const OrdersView = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900">Заказы</h2>
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {[{ id: 'all', label: 'Все заказы' }, { id: 'pending', label: 'Новые' }, { id: 'active', label: 'В работе' }, { id: 'completed', label: 'Завершенные' }].map(tab => (
                    <button key={tab.id} onClick={() => setOrderFilter(tab.id as any)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${orderFilter === tab.id ? 'bg-emerald-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-gray-900">#{order.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{order.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{order.buyerName}</p>
                            <p className="font-bold text-lg">{order.total} ₽</p>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                             {order.status === 'pending' && <Button size="sm" onClick={() => onUpdateOrderStatus?.(order.id, 'confirmed')}>Принять</Button>}
                             {order.status === 'confirmed' && <Button size="sm" onClick={() => onUpdateOrderStatus?.(order.id, 'shipped')}>Отправить</Button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-gray-50 pt-16">
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col p-6 z-10">
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-lg">{user?.shopName ? user.shopName.substring(0,2).toUpperCase() : 'GP'}</div>
                    <div><h3 className="font-bold text-gray-900 leading-none">{user?.shopName || 'Мой Магазин'}</h3></div>
                </div>
                <nav className="space-y-1 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Обзор" view="dashboard" />
                    <SidebarItem icon={Sparkles} label="AI Аналитика" view="analytics" />
                    <SidebarItem icon={Package} label="Товары" view="products" />
                    <SidebarItem icon={ShoppingCart} label="Заказы" view="orders" />
                    <SidebarItem icon={Users} label="Клиенты" view="customers" />
                </nav>
                <div className="border-t border-gray-100 pt-4 space-y-1">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"><LogOut size={18} /> Выйти</button>
                </div>
            </aside>
            <main className="flex-1 md:ml-64 p-8">
                {currentView === 'dashboard' && (
                     <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Обзор продаж</h1>
                                <p className="text-gray-500">Ваша статистика за сегодня</p>
                            </div>
                            <Button variant="outline" onClick={() => setCurrentView('analytics')}>Перейти к прогнозам</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard label="Выручка" value={`${orders.reduce((acc, o) => acc + o.total, 0)} ₽`} trend={12} icon={DollarSign} />
                            <StatCard label="Заказы" value={orders.length} trend={5} icon={ShoppingCart} />
                        </div>
                     </div>
                )}
                {currentView === 'analytics' && <AnalyticsView />}
                {currentView === 'products' && <ProductsView />}
                {currentView === 'orders' && <OrdersView />}
                {currentView === 'customers' && <div className="p-8 text-center text-gray-500">Раздел клиентов</div>}
            </main>
            {/* Product Modal Code (Same as previous, omitted for brevity but assumed present) */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                                     <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={prodName} onChange={e => setProdName(e.target.value)} />
                                 </div>
                                 <div className="grid grid-cols-3 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽)</label>
                                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={prodPrice} onChange={e => setProdPrice(e.target.value)} />
                                     </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Остаток</label>
                                        <input type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={prodStock} onChange={e => setProdStock(e.target.value)} />
                                     </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                                        <select className="w-full p-2 border rounded-lg bg-white" value={prodCategory} onChange={e => setProdCategory(e.target.value as Category)}>
                                            {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на фото</label>
                                     <div className="flex gap-2">
                                        <input type="text" className="w-full p-2 border rounded-lg text-xs" value={prodImage} onChange={e => setProdImage(e.target.value)} placeholder="https://..." />
                                        <div className="w-10 h-10 border rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                            {prodImage ? <img src={prodImage} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-400"/>}
                                        </div>
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Ключевые слова (для AI)</label>
                                     <input type="text" className="w-full p-2 border rounded-lg" value={prodKeywords} onChange={e => setProdKeywords(e.target.value)} placeholder="нежный, розовый, пионы" />
                                 </div>
                                 <Button size="sm" onClick={handleGenerateDescription} disabled={isGenerating} className="w-full justify-center">
                                     <Sparkles size={14} className="mr-2"/> {isGenerating ? 'Пишу...' : 'Создать описание с AI'}
                                 </Button>
                             </div>
                             <div className="flex flex-col h-full">
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                                 <textarea className="w-full flex-1 min-h-[150px] p-3 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:border-emerald-500" value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Здесь появится AI описание..." />
                             </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button variant="ghost" onClick={() => setIsProductModalOpen(false)}>Отмена</Button>
                            <Button onClick={handleSaveProduct}>{editingProduct ? 'Сохранить изменения' : 'Создать товар'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
