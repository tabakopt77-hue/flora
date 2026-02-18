
import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Package, ShoppingCart, Users, Settings, 
    LogOut, Plus, Search, Filter, MoreVertical, ChevronRight,
    TrendingUp, ArrowUpRight, DollarSign, Clock, CheckCircle, Truck, Edit, Trash2, X, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { Product, Category, Order, OrderStatus, User } from '../types';
import { Button } from './Button';
import { generateProductDescription } from '../services/geminiService';
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
    const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'orders' | 'customers'>('dashboard');
    
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
            c.lastOrder = o.date; // Assuming orders are sorted or this is close enough
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Поиск по названию или категории..." 
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
                            <th className="px-6 py-4">Категория</th>
                            <th className="px-6 py-4">Цена</th>
                            <th className="px-6 py-4">Остаток</th>
                            <th className="px-6 py-4">Статус</th>
                            <th className="px-6 py-4 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" />
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 font-medium">{product.price} ₽</td>
                                <td className="px-6 py-4">
                                    <span className={`font-medium ${product.stock < 5 ? 'text-rose-600' : 'text-gray-600'}`}>
                                        {product.stock} шт.
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {product.isActive ? 'Активен' : 'Скрыт'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openProductModal(product)} className="text-gray-400 hover:text-emerald-600 p-2" title="Редактировать"><Edit size={16}/></button>
                                        <button onClick={() => onDeleteProduct(product.id)} className="text-gray-400 hover:text-rose-600 p-2" title="Удалить"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && <div className="p-8 text-center text-gray-400">Товары не найдены</div>}
            </div>
        </div>
    );

    const OrdersView = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900">Заказы</h2>
            
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {[
                    { id: 'all', label: 'Все заказы' },
                    { id: 'pending', label: 'Новые' },
                    { id: 'active', label: 'В работе' },
                    { id: 'completed', label: 'Завершенные' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setOrderFilter(tab.id as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${orderFilter === tab.id ? 'bg-emerald-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <Package className="mx-auto text-gray-300 mb-2" size={32}/>
                        <p className="text-gray-500">Заказов в этой категории нет</p>
                    </div>
                ) : filteredOrders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-gray-900">#{order.id}</span>
                                <span className="text-sm text-gray-500">{order.date}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                    order.status === 'pending' || order.status === 'created' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                    order.status === 'delivered' || order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    {order.status === 'pending' ? 'Новый' : 
                                     order.status === 'confirmed' ? 'Подтвержден' :
                                     order.status === 'shipped' ? 'Отправлен' :
                                     order.status === 'delivered' ? 'Доставлен' : order.status}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users size={14}/> {order.buyerName || 'Клиент'}
                                </div>
                                {order.deliveryAddress && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Truck size={14}/> {order.deliveryAddress}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {order.items.map((item, i) => (
                                    <img key={i} src={item.image} className="w-12 h-12 rounded-lg border border-gray-100 object-cover flex-shrink-0" title={`${item.name} x${item.quantity}`} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Сумма</p>
                                <p className="text-2xl font-bold text-gray-900">{order.total} ₽</p>
                            </div>
                            <div className="flex flex-col gap-2 mt-4 w-full">
                                {(order.status === 'pending' || order.status === 'created') && (
                                    <>
                                        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => onUpdateOrderStatus?.(order.id, 'confirmed')}>Принять</Button>
                                        <Button size="sm" variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => onUpdateOrderStatus?.(order.id, 'cancelled')}>Отклонить</Button>
                                    </>
                                )}
                                {order.status === 'confirmed' && (
                                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onUpdateOrderStatus?.(order.id, 'shipped')}>Передать курьеру</Button>
                                )}
                                {order.status === 'shipped' && (
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => onUpdateOrderStatus?.(order.id, 'delivered')}>Завершить заказ</Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const CustomersView = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-gray-900">Клиенты</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Имя клиента</th>
                            <th className="px-6 py-4">Всего заказов</th>
                            <th className="px-6 py-4">Сумма покупок (LTV)</th>
                            <th className="px-6 py-4">Последний заказ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {customers.map((c, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                <td className="px-6 py-4">{c.orders}</td>
                                <td className="px-6 py-4">{c.spent} ₽</td>
                                <td className="px-6 py-4 text-gray-500">{c.lastOrder}</td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Нет данных о клиентах</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-gray-50 pt-16">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col p-6 z-10">
                <div className="mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-lg">
                        {user?.shopName ? user.shopName.substring(0,2).toUpperCase() : 'GP'}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-none">{user?.shopName || 'Мой Магазин'}</h3>
                        <p className="text-xs text-gray-500 mt-1">Продавец</p>
                    </div>
                </div>
                
                <nav className="space-y-1 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Обзор" view="dashboard" />
                    <SidebarItem icon={Package} label="Товары" view="products" />
                    <SidebarItem icon={ShoppingCart} label="Заказы" view="orders" />
                    <SidebarItem icon={Users} label="Клиенты" view="customers" />
                </nav>

                <div className="border-t border-gray-100 pt-4 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                        <Settings size={18} /> Настройки
                    </button>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors">
                        <LogOut size={18} /> Выйти
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {currentView === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Добрый день, {user?.name.split(' ')[0]}! 👋</h1>
                            <p className="text-gray-500">Сводка вашего бизнеса.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Выручка (Все время)" value={`${orders.reduce((acc, o) => acc + o.total, 0)} ₽`} trend={12} icon={DollarSign} />
                            <StatCard label="Активные заказы" value={orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length} trend={5} icon={ShoppingCart} />
                            <StatCard label="Средний чек" value={`${orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.total, 0) / orders.length) : 0} ₽`} trend={2} icon={TrendingUp} />
                            <StatCard label="Клиенты" value={customers.length} trend={24} icon={Users} />
                        </div>

                        {/* Recent Orders Table Snippet */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Последние поступления</h3>
                                <button className="text-sm text-emerald-600 hover:underline" onClick={() => setCurrentView('orders')}>Все заказы</button>
                            </div>
                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 font-bold text-xs">#{order.id.slice(-4)}</div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{order.total} ₽</p>
                                                    <p className="text-xs text-gray-500">{order.date}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                {order.status === 'pending' ? 'Новый' : order.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Нет активных заказов.</p>
                            )}
                        </div>
                    </div>
                )}
                {currentView === 'products' && <ProductsView />}
                {currentView === 'orders' && <OrdersView />}
                {currentView === 'customers' && <CustomersView />}
            </main>

            {/* Product Modal */}
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
