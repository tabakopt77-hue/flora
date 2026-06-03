
import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Package, ShoppingCart, Users, Settings, 
    LogOut, Plus, Search, Filter, MoreVertical, ChevronRight,
    TrendingUp, ArrowUpRight, DollarSign, Clock, CheckCircle, Truck, Edit, Trash2, X, Image as ImageIcon, Sparkles,
    BarChart2, Zap, ArrowDown, Target, Link as LinkIcon, DownloadCloud, Check
} from 'lucide-react';
import { Product, Category, Order, OrderStatus, User, PriceAnalysis, DemandForecast } from '../types';
import { Button } from './Button';
import { generateProductDescription, analyzePrice, getSeasonalForecast } from '../services/geminiService';
import { ToastMessage } from './Toast';
import { SellerAIAssistant } from './SellerAIAssistant';
import { Helmet } from 'react-helmet-async';

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
    const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'analytics' | 'integrations'>('dashboard');
    
    // --- State for Products View ---
    const [productSearch, setProductSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // --- State for Integrations View ---
    const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
    const [integrationPlatform, setIntegrationPlatform] = useState<'ozon' | 'yandex' | 'wildberries' | 'avito' | 'megamarket' | null>(null);
    const [integrationApiKey, setIntegrationApiKey] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

    // --- State for Product Modal ---
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [prodName, setProdName] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodStock, setProdStock] = useState('10'); // Default stock
    const [prodKeywords, setProdKeywords] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodLongDesc, setProdLongDesc] = useState('');
    const [prodCategory, setProdCategory] = useState<Category>(Category.BOUQUETS);
    const [prodImage, setProdImage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // --- State for Seller AI Assistant ---
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

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
            setProdLongDesc(product.longDescription || '');
            setProdCategory(product.category);
            setProdImage(product.image);
        } else {
            setEditingProduct(null);
            setProdName('');
            setProdPrice('');
            setProdStock('10');
            setProdKeywords('');
            setProdDesc('');
            setProdLongDesc('');
            setProdCategory(Category.BOUQUETS);
            setProdImage('');
        }
        setIsProductModalOpen(true);
    };

    const handleGenerateDescription = async () => {
        if (!prodName) {
            addToast('error', 'Сначала введите название');
            return;
        }
        setIsGenerating(true);
        const result = await generateProductDescription(prodName, prodKeywords);
        if (result && typeof result === 'object') {
            setProdDesc(result.short || '');
            setProdLongDesc(result.long || '');
        } else if (typeof result === 'string') {
            setProdDesc(result);
        }
        setIsGenerating(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProdImage(reader.result as string);
                setIsImagePickerOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const existingImages = React.useMemo(() => {
        return Array.from(new Set(products.map(p => p.image).filter(Boolean)));
    }, [products]);

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
            id: editingProduct ? editingProduct.id : `new-${crypto.randomUUID()}`,
            name: prodName,
            price: parseFloat(prodPrice),
            stock: parseInt(prodStock) || 0,
            isActive: true,
            storeId: user?.id || 's1', // Bind to current seller
            category: prodCategory,
            image: prodImage || 'https://images.unsplash.com/photo-1595231916356-a86217eff12b?q=80&w=800&auto=format&fit=crop',
            description: prodDesc || 'Авторская композиция',
            longDescription: prodLongDesc,
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
                        {filteredProducts.map((product, index) => (
                            <tr key={`${product.id}-${index}`} className="hover:bg-gray-50/50">
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
                        <div className="col-span-full border border-emerald-200 bg-white rounded-2xl shadow-lg p-6 mb-4 flex flex-col lg:flex-row gap-8 animate-in slide-in-from-top-4">
                             <div className="flex-1 space-y-6">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Sparkles size={20} /></div>
                                     <h4 className="font-bold text-gray-900 text-xl">Результаты анализа</h4>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                         <span className="block text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Рыночная цена</span>
                                         <span className="font-bold text-gray-900 text-2xl">{priceAnalysis.marketAverage} ₽</span>
                                     </div>
                                     <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                         <span className="block text-emerald-600 text-xs font-medium uppercase tracking-wider mb-1">Оптимальная цена</span>
                                         <span className="font-bold text-emerald-700 text-2xl flex items-center gap-2">
                                             {priceAnalysis.suggestedPrice} ₽ 
                                             <ArrowUpRight size={16} className="text-emerald-500" />
                                         </span>
                                     </div>
                                 </div>

                                 <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                     <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Обоснование ИИ</h5>
                                     <p className="text-sm text-blue-900/80 leading-relaxed">
                                         {priceAnalysis.reasoning}
                                     </p>
                                 </div>
                             </div>
                             
                             <div className="flex flex-col justify-center items-center lg:w-48 lg:border-l border-gray-100 lg:pl-8">
                                 <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                         <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="3" />
                                         <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - priceAnalysis.confidence} strokeLinecap="round" />
                                     </svg>
                                     <div className="absolute flex flex-col items-center">
                                         <span className="text-3xl font-bold text-gray-900">{priceAnalysis.confidence}%</span>
                                     </div>
                                 </div>
                                 <span className="text-sm font-medium text-gray-500">Уверенность</span>
                             </div>
                        </div>
                    )}

                    {products.slice(0, 3).map((product, index) => (
                        <div key={`${product.id}-${index}`} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50/50">
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

    const IntegrationsView = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Интеграции</h2>
                    <p className="text-gray-500 text-sm">Импорт товаров с маркетплейсов</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Ozon Integration */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">O</div>
                            <div>
                                <h3 className="font-bold text-gray-900">Ozon</h3>
                                <p className="text-xs text-gray-500">Импорт по API</p>
                            </div>
                        </div>
                        {connectedPlatforms.includes('ozon') ? (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><Check size={12} className="mr-1"/> Подключено</span>
                        ) : (
                            <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Не подключено</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-6 flex-1">Sync товаров, цен и остатков из кабинета Ozon.</p>
                    <Button 
                        variant={connectedPlatforms.includes('ozon') ? 'outline' : 'primary'} 
                        className="w-full"
                        onClick={() => {
                            setIntegrationPlatform('ozon');
                            setIsIntegrationModalOpen(true);
                        }}
                    >
                        {connectedPlatforms.includes('ozon') ? 'Синхронизировать' : 'Подключить'}
                    </Button>
                </div>

                {/* Yandex Market Integration */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500 font-bold text-xl">Я</div>
                            <div>
                                <h3 className="font-bold text-gray-900">Яндекс Маркет</h3>
                                <p className="text-xs text-gray-500">Импорт по API</p>
                            </div>
                        </div>
                        {connectedPlatforms.includes('yandex') ? (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><Check size={12} className="mr-1"/> Подключено</span>
                        ) : (
                            <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Не подключено</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-6 flex-1">Sync товаров, цен и остатков из кабинета Яндекс Маркет.</p>
                    <Button 
                        variant={connectedPlatforms.includes('yandex') ? 'outline' : 'primary'} 
                        className="w-full"
                        onClick={() => {
                            setIntegrationPlatform('yandex');
                            setIsIntegrationModalOpen(true);
                        }}
                    >
                        {connectedPlatforms.includes('yandex') ? 'Синхронизировать' : 'Подключить'}
                    </Button>
                </div>

                {/* Wildberries Integration */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-bold text-xl">W</div>
                            <div>
                                <h3 className="font-bold text-gray-900">Wildberries</h3>
                                <p className="text-xs text-gray-500">Импорт по API</p>
                            </div>
                        </div>
                        {connectedPlatforms.includes('wildberries') ? (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><Check size={12} className="mr-1"/> Подключено</span>
                        ) : (
                            <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Не подключено</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-6 flex-1">Sync товаров, цен и остатков из кабинета Wildberries.</p>
                    <Button 
                        variant={connectedPlatforms.includes('wildberries') ? 'outline' : 'primary'} 
                        className="w-full"
                        onClick={() => {
                            setIntegrationPlatform('wildberries');
                            setIsIntegrationModalOpen(true);
                        }}
                    >
                        {connectedPlatforms.includes('wildberries') ? 'Синхронизировать' : 'Подключить'}
                    </Button>
                </div>

                {/* Avito Integration */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50/50 rounded-xl flex items-center justify-center text-blue-500 font-bold text-xl px-1">A</div>
                            <div>
                                <h3 className="font-bold text-gray-900">Авито</h3>
                                <p className="text-xs text-gray-500">Автозагрузка (XML)</p>
                            </div>
                        </div>
                        {connectedPlatforms.includes('avito') ? (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><Check size={12} className="mr-1"/> Подключено</span>
                        ) : (
                            <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Не подключено</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-6 flex-1">Импорт и экспорт объявлений через Автозагрузку Авито.</p>
                    <Button 
                        variant={connectedPlatforms.includes('avito') ? 'outline' : 'primary'} 
                        className="w-full"
                        onClick={() => {
                            setIntegrationPlatform('avito');
                            setIsIntegrationModalOpen(true);
                        }}
                    >
                        {connectedPlatforms.includes('avito') ? 'Синхронизировать' : 'Подключить'}
                    </Button>
                </div>

                {/* MegaMarket Integration */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 font-bold text-xl">M</div>
                            <div>
                                <h3 className="font-bold text-gray-900">МегаМаркет</h3>
                                <p className="text-xs text-gray-500">Импорт по API</p>
                            </div>
                        </div>
                        {connectedPlatforms.includes('megamarket') ? (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><Check size={12} className="mr-1"/> Подключено</span>
                        ) : (
                            <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Не подключено</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-6 flex-1">Sync товаров из кабинета Сбер МегаМаркет.</p>
                    <Button 
                        variant={connectedPlatforms.includes('megamarket') ? 'outline' : 'primary'} 
                        className="w-full"
                        onClick={() => {
                            setIntegrationPlatform('megamarket');
                            setIsIntegrationModalOpen(true);
                        }}
                    >
                        {connectedPlatforms.includes('megamarket') ? 'Синхронизировать' : 'Подключить'}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50 pt-16">
            <Helmet>
                <title>Панель продавца</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            
            {/* Mobile Navigation */}
            <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto sticky top-16 z-20">
                <div className="flex p-2 gap-2">
                    <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'dashboard' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Обзор</button>
                    <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'analytics' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>AI Аналитика</button>
                    <button onClick={() => setCurrentView('products')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'products' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Товары</button>
                    <button onClick={() => setCurrentView('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'orders' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Заказы</button>
                    <button onClick={() => setCurrentView('integrations')} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${currentView === 'integrations' ? 'bg-emerald-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Интеграции</button>
                    <div className="w-px bg-gray-200 mx-1"></div>
                    <button onClick={onLogout} className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-rose-500 hover:bg-rose-50 flex items-center gap-2"><LogOut size={16} /> Выйти</button>
                    <button onClick={() => setIsAssistantOpen(true)} className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-2"><Zap size={16} /> ИИ-Помощник</button>                  
                </div>
            </div>

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
                    <SidebarItem icon={LinkIcon} label="Интеграции" view="integrations" />
                </nav>
                <div className="border-t border-gray-100 pt-4 space-y-1 mt-auto">
                    <button onClick={() => setIsAssistantOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"><Zap size={18} /> Бизнес-ассистент</button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"><LogOut size={18} /> Выйти</button>
                </div>
            </aside>
            <main className="flex-1 md:ml-64 p-4 md:p-8">
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
                {currentView === 'integrations' && <IntegrationsView />}
                {currentView === 'customers' && <div className="p-8 text-center text-gray-500">Раздел клиентов</div>}
            </main>

            {/* Integration Modal */}
            {isIntegrationModalOpen && integrationPlatform && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">
                                {integrationPlatform === 'ozon' ? 'Интеграция с Ozon' : 
                                 integrationPlatform === 'wildberries' ? 'Интеграция с Wildberries' :
                                 integrationPlatform === 'avito' ? 'Интеграция с Авито' :
                                 integrationPlatform === 'megamarket' ? 'Интеграция с МегаМаркет' :
                                 'Интеграция с Яндекс Маркет'}
                            </h3>
                            <button onClick={() => setIsIntegrationModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <p className="text-sm text-gray-600">
                                Введите API-ключ ваcшего кабинета {
                                 integrationPlatform === 'ozon' ? 'Ozon' : 
                                 integrationPlatform === 'wildberries' ? 'Wildberries' :
                                 integrationPlatform === 'avito' ? 'Авито' :
                                 integrationPlatform === 'megamarket' ? 'МегаМаркет' :
                                 'Яндекс Маркет'}, чтобы мы могли загрузить ваши товары.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">API Ключ</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                    value={integrationApiKey} 
                                    onChange={e => setIntegrationApiKey(e.target.value)} 
                                    placeholder="Введите ключ..." 
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button variant="ghost" onClick={() => setIsIntegrationModalOpen(false)}>Отмена</Button>
                            <Button 
                                disabled={!integrationApiKey || isImporting}
                                onClick={async () => {
                                    setIsImporting(true);
                                    // Simulate API call and import
                                    setTimeout(async () => {
                                        setIsImporting(false);
                                        setIsIntegrationModalOpen(false);
                                        setIntegrationApiKey('');
                                        
                                        if (!connectedPlatforms.includes(integrationPlatform)) {
                                            setConnectedPlatforms([...connectedPlatforms, integrationPlatform]);
                                        }
                                        
                                        // Add mock products based on platform
                                        const platformName = integrationPlatform === 'ozon' ? 'Ozon' : 
                                                             integrationPlatform === 'wildberries' ? 'Wildberries' :
                                                             integrationPlatform === 'avito' ? 'Авито' :
                                                             integrationPlatform === 'megamarket' ? 'МегаМаркет' :
                                                             'Яндекс Маркет';
                                        const mockProducts: Product[] = [
                                            {
                                                id: `${integrationPlatform}-1-${crypto.randomUUID()}`,
                                                name: `Букет из ${platformName} 1`,
                                                price: 3500,
                                                stock: 15,
                                                isActive: true,
                                                storeId: user?.id || 's1',
                                                category: Category.BOUQUETS,
                                                image: 'https://images.unsplash.com/photo-1563241527-2004ab3ba185?q=80&w=800&auto=format&fit=crop',
                                                description: `Импортировано из ${platformName}`,
                                                tags: ['импорт', platformName.toLowerCase()],
                                                reviews: 0,
                                                rating: 5.0
                                            },
                                            {
                                                id: `${integrationPlatform}-2-${crypto.randomUUID()}`,
                                                name: `Композиция из ${platformName} 2`,
                                                price: 5200,
                                                stock: 8,
                                                isActive: true,
                                                storeId: user?.id || 's1',
                                                category: Category.BOUQUETS,
                                                image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=800&auto=format&fit=crop',
                                                description: `Импортировано из ${platformName}`,
                                                tags: ['импорт', platformName.toLowerCase()],
                                                reviews: 0,
                                                rating: 5.0
                                            }
                                        ];
                                        
                                        // Add sequentially to avoid race conditions in local storage
                                        for (const p of mockProducts) {
                                            await onAddProduct(p);
                                        }
                                        
                                        const importedPlatformName = integrationPlatform === 'ozon' ? 'Ozon' : 
                                                                     integrationPlatform === 'wildberries' ? 'Wildberries' :
                                                                     integrationPlatform === 'avito' ? 'Авито' :
                                                                     integrationPlatform === 'megamarket' ? 'МегаМаркет' :
                                                                     'Яндекс Маркет';
                                        addToast('success', `Товары из ${importedPlatformName} успешно импортированы`);
                                    }, 1500);
                                }}
                            >
                                {isImporting ? (
                                    <><DownloadCloud size={16} className="mr-2 animate-bounce" /> Импорт...</>
                                ) : (
                                    'Подключить и импортировать'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на фото или загрузка</label>
                                     <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input type="text" className="w-full p-2 border rounded-lg text-xs" value={prodImage} onChange={e => setProdImage(e.target.value)} placeholder="https://..." />
                                            <div className="w-10 h-10 border rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                {prodImage ? <img src={prodImage} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-400"/>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 text-xs font-medium px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                                                Из устройства
                                            </button>
                                            <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} />
                                            {existingImages.length > 0 && (
                                                <button type="button" onClick={() => setIsImagePickerOpen(!isImagePickerOpen)} className="flex-1 text-xs font-medium px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors">
                                                Из загруженных
                                                </button>
                                            )}
                                        </div>
                                        {isImagePickerOpen && existingImages.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mt-2 p-2 border rounded-lg max-h-32 overflow-y-auto">
                                                {existingImages.map((img, i) => (
                                                    <div key={i} className="cursor-pointer border hover:border-emerald-500 rounded relative" onClick={() => { setProdImage(img); setIsImagePickerOpen(false); }}>
                                                        <img src={img} className="w-full h-12 object-cover rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Ключевые слова (для AI)</label>
                                     <input type="text" className="w-full p-2 border rounded-lg" value={prodKeywords} onChange={e => setProdKeywords(e.target.value)} placeholder="нежный, розовый, пионы" />
                                 </div>
                                 <Button size="sm" onClick={(e) => { e.preventDefault(); handleGenerateDescription(); }} disabled={isGenerating} className="w-full justify-center mt-2">
                                     <Sparkles size={14} className="mr-2"/> {isGenerating ? 'Пишу...' : 'Создать описание с AI'}
                                 </Button>
                             </div>
                             <div className="flex flex-col h-full gap-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
                                     <textarea className="w-full min-h-[80px] p-3 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:border-emerald-500" value={prodDesc} onChange={e => setProdDesc(e.target.value)} placeholder="Здесь появится AI описание..." />
                                 </div>
                                 <div className="flex-1 flex flex-col">
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Длинное описание (для карточки товара)</label>
                                     <textarea className="w-full flex-1 min-h-[120px] p-3 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors outline-none focus:border-emerald-500" value={prodLongDesc} onChange={e => setProdLongDesc(e.target.value)} placeholder="Подробное описание товара, состав, особенности..." />
                                 </div>
                             </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button variant="ghost" onClick={() => setIsProductModalOpen(false)}>Отмена</Button>
                            <Button onClick={handleSaveProduct}>{editingProduct ? 'Сохранить изменения' : 'Создать товар'}</Button>
                        </div>
                    </div>
                </div>
            )}
            
            <SellerAIAssistant 
                isOpen={isAssistantOpen} 
                onClose={() => setIsAssistantOpen(false)} 
                sellerId={user?.id || 'guest_seller'} 
            />
        </div>
    );
};
