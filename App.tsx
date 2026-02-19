
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Search, Menu, Sparkles, X, Camera, User as UserIcon, CheckCircle, Wand2, ArrowRight, Gift } from 'lucide-react';
import { HERO_IMAGE, BLOG_POSTS } from './constants';
import { Product, Category, CartItem, Order, OrderStatus } from './types';
import { ProductCard } from './components/ProductCard';
import { Button } from './components/Button';
import { AIFlorist } from './components/AIFlorist';
import { VisualSearch } from './components/VisualSearch';
import { SellerDashboard } from './components/SellerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AdminDashboard } from './components/AdminDashboard'; 
import { ProductDetails } from './components/ProductDetails';
import { QuickViewModal } from './components/QuickViewModal';
import { AuthModal } from './components/AuthModal';
import { Checkout } from './components/Checkout';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';
import { generateGiftMessage } from './services/geminiService';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { db } from './services/db';
import { orderService } from './services/orderService';
import { productService } from './services/productService';
import { GiftWizard } from './components/GiftWizard';

// --- Layout Component ---
const Layout = ({ children, fullWidth = false, cartCount, isMobileMenuOpen, setIsMobileMenuOpen, searchQuery, setSearchQuery, setIsVisualSearchOpen, handleProfileClick, setIsCartOpen, scrolled }: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isDashboard = location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkout');

    return (
      <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white selection:bg-emerald-100">
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || location.pathname !== '/' || isDashboard ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3 border-b border-gray-100' : 'bg-transparent py-5'}`}>
            <div className={`container mx-auto px-4 md:px-8 flex items-center justify-between ${fullWidth ? 'max-w-full' : ''}`}>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
                {isMobileMenuOpen ? <X className="text-emerald-900" /> : <Menu className={`hover:text-emerald-800 ${scrolled || location.pathname !== '/' || isDashboard ? 'text-gray-800' : 'text-white'}`} />}
                </button>
                <Link to="/" className={`font-serif text-2xl font-bold tracking-tight ${scrolled || location.pathname !== '/' || isDashboard ? 'text-emerald-900' : 'text-white md:text-emerald-900'}`}>
                Aura Flora
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link to="/catalog" className={`hover:text-emerald-800 transition-colors ${location.pathname === '/catalog' ? 'text-emerald-800' : (scrolled || location.pathname !== '/' || isDashboard ? 'text-gray-600' : 'text-emerald-100 hover:text-white')}`}>Каталог</Link>
                <Link to="/blog" className={`hover:text-emerald-800 transition-colors ${location.pathname === '/blog' ? 'text-emerald-800' : (scrolled || location.pathname !== '/' || isDashboard ? 'text-gray-600' : 'text-emerald-100 hover:text-white')}`}>Блог</Link>
            </nav>

            <div className="flex items-center gap-3 md:gap-4">
                {!isDashboard && (
                    <div className="relative hidden md:block group">
                    <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-700 ${scrolled || location.pathname !== '/' ? 'text-gray-500' : 'text-emerald-200'}`} />
                    <input 
                        type="text" 
                        placeholder="Найти букет..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(location.pathname !== '/catalog') navigate('/catalog'); }}
                        className={`border border-transparent rounded-full pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-50/50 w-40 focus:w-64 transition-all placeholder-gray-500 text-gray-800
                        ${scrolled || location.pathname !== '/' ? 'bg-gray-100/50 focus:bg-white focus:border-emerald-200' : 'bg-emerald-900/30 text-white placeholder-emerald-200/50 focus:bg-white focus:text-gray-900 focus:border-emerald-200'}
                        `}
                    />
                    <button 
                        onClick={() => setIsVisualSearchOpen(true)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-emerald-600 ${scrolled || location.pathname !== '/' ? 'text-gray-500' : 'text-emerald-200'}`}
                        title="Поиск по фото"
                    >
                        <Camera size={16} />
                    </button>
                    </div>
                )}
                
                {location.pathname !== '/checkout' && (
                    <button 
                        onClick={() => setIsCartOpen(true)} 
                        className={`relative flex items-center gap-2 px-3 py-2.5 rounded-full transition-all ${
                            scrolled || location.pathname !== '/' || isDashboard 
                            ? 'bg-gray-50 text-emerald-900 hover:bg-emerald-100' 
                            : 'bg-white/20 text-white hover:bg-white hover:text-emerald-900 backdrop-blur-md'
                        }`}
                    >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="hidden md:inline font-medium text-sm">Корзина</span>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {cartCount}
                        </span>
                    )}
                    </button>
                )}

                <button 
                    onClick={handleProfileClick} 
                    className={`hidden md:block p-1 rounded-full transition-colors border-2 ${
                        scrolled || location.pathname !== '/' || isDashboard 
                        ? 'border-transparent hover:bg-emerald-50' 
                        : 'border-white/20 hover:bg-white/20'
                    }`}
                >
                {user ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/50">
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className={`p-1.5 ${scrolled || location.pathname !== '/' || isDashboard ? 'text-emerald-900' : 'text-white'}`}>
                        <UserIcon size={20} />
                    </div>
                )}
                </button>
            </div>
            </div>
            
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                 <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-2 h-screen">
                    <div className="flex flex-col p-4 space-y-4">
                        <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-gray-50 text-gray-700 text-lg">Каталог</Link>
                         <button onClick={() => { handleProfileClick(); setIsMobileMenuOpen(false); }} className="text-left font-medium py-3 border-b border-gray-50 text-gray-700 flex items-center gap-3 text-lg">
                            {user ? user.name : "Войти"}
                        </button>
                    </div>
                 </div>
            )}
        </header>

        <main className={`flex-1 ${fullWidth ? 'pt-16' : ''}`}>
            {children}
        </main>
        
        {!isDashboard && <Footer />}
      </div>
    );
};

// --- Page Components ---

const Home = ({ allProducts, onAddToCart, onQuickView, navigate, setIsAiOpen, setIsGiftWizardOpen }: any) => (
    <>
      <Helmet>
        <title>Aura Flora - Премиальный цветочный маркетплейс</title>
      </Helmet>
      <section className="relative min-h-screen flex items-center bg-emerald-950 overflow-hidden pt-20">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-800/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-20%] w-[800px] h-[800px] bg-emerald-900/30 rounded-full blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full pb-10">
          <div className="order-2 lg:order-1 space-y-8 animate-in slide-in-from-bottom duration-1000 fade-in flex flex-col justify-center text-center lg:text-left">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] sm:leading-[0.95] text-white">
              Искусство <br />
              <span className="text-emerald-300/90 italic font-light font-serif">дарить</span> <br />
              чувства.
            </h1>
            <p className="text-emerald-100/70 text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
              Авторские букеты от Aura Flora с доставкой день в день. Мы объединили мастерство флористов и технологии ИИ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-white text-emerald-950 hover:bg-emerald-50 rounded-full px-8 h-14 text-base" onClick={() => navigate('/catalog')}>
                Выбрать букет
              </Button>
              <Button size="lg" variant="outlineWhite" className="rounded-full px-8 h-14 text-base" onClick={() => setIsGiftWizardOpen(true)}>
                <Gift size={18} className="mr-2" />
                Подобрать подарок
              </Button>
            </div>
            <div className="pt-2">
                 <button onClick={() => setIsAiOpen(true)} className="text-emerald-200/60 hover:text-emerald-100 flex items-center gap-2 mx-auto lg:mx-0 text-sm transition-colors">
                     <Sparkles size={14} /> Чат с флористом Flora AI
                 </button>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative h-[50vh] lg:h-[80vh] w-full flex items-center justify-center">
             <div className="relative w-full h-full max-w-md lg:max-w-lg mx-auto">
                <div className="absolute inset-0 top-4 lg:top-0 bg-gray-900 rounded-t-[150px] rounded-b-[40px] lg:rounded-t-full lg:rounded-b-full overflow-hidden border-[1px] border-white/10 shadow-2xl animate-in fade-in zoom-in duration-1000">
                   <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent z-10 opacity-60"></div>
                   <img src={HERO_IMAGE} alt="Hero" className="w-full h-full object-cover scale-110 hover:scale-105 transition-transform duration-[3s]" />
                </div>
             </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
             <h2 className="font-serif text-4xl text-emerald-900 mb-4">Избранное флористами</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {allProducts.slice(0, 4).map((product: Product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onQuickView={onQuickView} />
            ))}
          </div>
        </div>
      </section>
    </>
);

const Shop = ({ allProducts, onAddToCart, onQuickView, activeCategory, setActiveCategory, searchQuery, setSearchQuery }: any) => {
    const categories = ['Все', ...Object.values(Category)];
    const filtered = allProducts.filter((p: Product) => {
       const matchesCategory = activeCategory === 'Все' || p.category === activeCategory;
       const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
       return matchesCategory && matchesSearch && p.isActive;
    });

    return (
      <div className="container mx-auto px-4 md:px-8 py-32">
        <Helmet><title>Каталог | Aura Flora</title></Helmet>
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h2 className="font-serif text-4xl text-emerald-900">Каталог</h2>
          <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 hide-scrollbar">
             {categories.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat as string)}
                 className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${activeCategory === cat ? 'bg-emerald-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {filtered.length > 0 ? filtered.map((product: Product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onQuickView={onQuickView} />
           )) : (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                 <p className="text-gray-500 text-lg mb-4">Ничего не найдено по вашему запросу.</p>
                 <Button variant="outline" onClick={() => { setActiveCategory('Все'); setSearchQuery(''); }}>Сбросить фильтры</Button>
              </div>
           )}
        </div>
      </div>
    );
};

const Journal = () => (
    <div className="container mx-auto px-4 md:px-8 py-32">
       <Helmet><title>Блог | Aura Flora</title></Helmet>
       <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="font-serif text-4xl text-emerald-900 mb-4">Журнал</h2>
          <p className="text-gray-500 text-lg font-light">Истории о цветах, людях и чувствах.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map(post => (
             <article key={post.id} className="group cursor-pointer flex flex-col h-full">
                <div className="overflow-hidden rounded-2xl mb-6 aspect-[4/3] shadow-sm">
                   <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex items-center gap-4 text-xs text-emerald-700 mb-3 font-bold uppercase tracking-widest">
                   <span>{post.date}</span>
                   <span className="w-1 h-1 bg-emerald-300 rounded-full"></span>
                   <span>{post.readTime}</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-gray-900 mb-3 group-hover:text-emerald-800 transition-colors leading-tight">{post.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                <div className="flex items-center text-emerald-800 font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Читать далее <ArrowRight size={16} className="ml-2" />
                </div>
             </article>
          ))}
       </div>
    </div>
);

const AppContent: React.FC = () => {
  // --- Auth State from Context ---
  const { user, login, logout } = useAuth();
  
  // --- Global Data State (Fetched from Backend) ---
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => db.cart.get()); // Cart stays local for now
  const [loadingData, setLoadingData] = useState(true);

  // --- UI State ---
  const navigate = useNavigate();
  const location = useLocation();
  
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  
  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isGiftWizardOpen, setIsGiftWizardOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  
  // AI Features State
  const [giftTone, setGiftTone] = useState('romantic');
  const [isGeneratingGift, setIsGeneratingGift] = useState(false);
  
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
        setLoadingData(true);
        try {
            // Fetch Products from Backend
            const products = await productService.getAll();
            setAllProducts(products);

            // If user is Seller/Admin, fetch Orders
            if (user?.role === 'seller' || user?.role === 'admin') {
                const fetchedOrders = await orderService.getAllOrders();
                setOrders(fetchedOrders);
            } else if (user?.role === 'buyer') {
                const myOrders = await orderService.getMyOrders();
                setOrders(myOrders);
            }
        } catch (e) {
            console.error("Failed to fetch initial data:", e);
        } finally {
            setLoadingData(false);
        }
    };
    fetchData();
  }, [user]);

  // --- Effects ---

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (location.state && (location.state as any).openAuth) {
        setIsAuthOpen(true);
    }
  }, [location]);

  // Sync cart to local storage
  useEffect(() => { db.cart.save(cart); }, [cart]);

  // --- Handlers ---

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = async (provider: string) => {
      try {
          await login(provider);
          addToast('success', 'Успешный вход в систему');
          setIsAuthOpen(false);
      } catch (e) {
          addToast('error', 'Ошибка входа');
      }
  };

  const handleLogout = () => {
    logout();
    addToast('info', 'Вы вышли из системы');
    navigate('/');
  };

  const handleProfileClick = () => {
    if (!user) {
        setIsAuthOpen(true);
    } else if (user.role === 'seller') {
        navigate('/seller');
    } else if (user.role === 'admin') {
        navigate('/admin');
    } else {
        navigate('/profile');
    }
  };

  const handleAddToCart = (product: Product) => {
    // Stock Check Logic
    const currentQtyInCart = cart.find(i => i.id === product.id)?.quantity || 0;
    if (product.stock <= currentQtyInCart) {
        addToast('error', `Извините, доступно всего ${product.stock} шт.`);
        return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, giftMessage: '' }];
    });
    addToast('success', `${product.name} добавлен в корзину`);
    setIsCartOpen(true);
  };

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => {
        const item = prev.find(i => i.id === id);
        if (!item) return prev;
        
        // Stock check
        if (updates.quantity && updates.quantity > item.quantity) {
             const product = allProducts.find(p => p.id === id);
             if (product && product.stock < updates.quantity) {
                 addToast('error', `Максимум ${product.stock} шт.`);
                 return prev;
             }
        }
        return prev.map(item => item.id === id ? { ...item, ...updates } : item);
    });
  };
  
  const removeCartItem = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар из корзины?')) {
        setCart(prev => prev.filter(item => item.id !== id));
        addToast('info', 'Товар удален из корзины');
    }
  };

  // Seller/Admin Logic - now calls API
  const handleAddProduct = async (newProduct: Product) => {
    try {
        const created = await productService.create(newProduct);
        if (created) {
            setAllProducts(prev => [created, ...prev]);
            addToast('success', 'Товар успешно создан');
        }
    } catch (e) {
        addToast('error', 'Ошибка создания товара');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
        const updated = await productService.update(updatedProduct);
        if (updated) {
            setAllProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            addToast('success', 'Товар успешно обновлен');
        }
    } catch (e) {
        addToast('error', 'Ошибка обновления товара');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
     if (!window.confirm("Удалить товар?")) return;
     try {
         const success = await productService.delete(productId);
         if (success) {
            setAllProducts(prev => prev.filter(p => p.id !== productId));
            addToast('info', 'Товар удален');
         }
     } catch (e) {
         addToast('error', 'Ошибка удаления');
     }
  };
  
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
      const success = await orderService.updateStatus(orderId, status);
      if (success) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
          // Fallback sync for demo continuity if relying on db.ts as cache
          db.orders.updateStatus(orderId, status);
          addToast('success', `Статус заказа обновлен на ${status}`);
      } else {
          addToast('error', 'Не удалось обновить статус');
      }
  };

  const generateMessageForItem = async (itemId: string, productName: string) => {
    setIsGeneratingGift(true);
    const msg = await generateGiftMessage('Особый случай', 'Близкий человек', giftTone);
    updateCartItem(itemId, { giftMessage: msg });
    setIsGeneratingGift(false);
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    
    // Final Stock Check
    for (const item of cart) {
        const product = allProducts.find(p => p.id === item.id);
        if (!product || product.stock < item.quantity) {
             addToast('error', `Товар ${item.name} закончился или его недостаточно.`);
             return;
        }
    }

    if (!user) {
        setIsAuthOpen(true);
        addToast('info', 'Пожалуйста, войдите, чтобы оформить заказ');
        return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handlePlaceOrder = async (deliveryDetails: any) => {
     if (!user) return;
     
     const result = await orderService.createOrder({
         user,
         cart,
         deliveryDetails
     });

     if (result.success && result.order) {
         // Refresh products to show updated stock
         const products = await productService.getAll();
         setAllProducts(products);
         
         // Add new order to list
         setOrders(prev => [result.order!, ...prev]);

         setCart([]); 
         setIsCheckoutSuccess(true);
         navigate('/');
     } else {
         addToast('error', result.error || 'Ошибка оформления');
     }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const layoutProps = {
    cartCount, 
    user, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    searchQuery, 
    setSearchQuery, 
    setIsVisualSearchOpen, 
    handleProfileClick, 
    setIsCartOpen, 
    scrolled
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Routes>
        <Route path="/" element={
            <Layout {...layoutProps}>
                <Home allProducts={allProducts} onAddToCart={handleAddToCart} onQuickView={setQuickViewProduct} navigate={navigate} setIsAiOpen={setIsAiOpen} setIsGiftWizardOpen={setIsGiftWizardOpen} />
            </Layout>
        } />
        <Route path="/catalog" element={
            <Layout {...layoutProps}>
                <Shop 
                    allProducts={allProducts} 
                    onAddToCart={handleAddToCart} 
                    onQuickView={setQuickViewProduct} 
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </Layout>
        } />
        <Route path="/blog" element={
            <Layout {...layoutProps}>
                <Journal />
            </Layout>
        } />
        
        {/* Protected Routes */}
        <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                <Layout fullWidth {...layoutProps}>
                    <Checkout cart={cart} user={user} onPlaceOrder={handlePlaceOrder} total={cartTotal} />
                </Layout>
            </ProtectedRoute>
        } />
        
        <Route path="/product/:id" element={
            <Layout {...layoutProps}>
                <div className="container mx-auto px-4 md:px-8 py-32">
                    <ProductDetails allProducts={allProducts} onAddToCart={handleAddToCart}/>
                </div>
            </Layout>
        } />
        
        <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <Layout fullWidth {...layoutProps}>
                    <AdminDashboard onLogout={handleLogout} />
                </Layout>
            </ProtectedRoute>
        } />
        
        <Route path="/seller" element={
            <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <Layout fullWidth {...layoutProps}>
                     <SellerDashboard 
                        onLogout={handleLogout} 
                        products={allProducts} 
                        onAddProduct={handleAddProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={handleDeleteProduct}
                        orders={orders}
                        onUpdateOrderStatus={handleUpdateOrderStatus}
                        user={user}
                        addToast={addToast}
                    />
                </Layout>
            </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                <Layout {...layoutProps}>
                    {user ? (
                         <BuyerDashboard user={user} onLogout={handleLogout} orders={orders} />
                    ) : <Navigate to="/" />}
                </Layout>
            </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Cart Drawer & Modals */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-emerald-900">
              <h2 className="font-serif text-xl">Корзина ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-24 text-gray-400">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Пока здесь пусто.</p>
                  <Button variant="ghost" className="mt-4" onClick={() => { setIsCartOpen(false); navigate('/catalog'); }}>Перейти к покупкам</Button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex flex-col gap-4 border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg bg-gray-100" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900 font-serif">{item.name}</h4>
                          <button onClick={() => removeCartItem(item.id)} className="text-gray-400 hover:text-rose-500 transition-colors"><X size={16} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{item.price.toFixed(2)} ₽</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                             <button onClick={() => updateCartItem(item.id, { quantity: Math.max(0, item.quantity - 1) })} className="px-2 text-gray-600 hover:text-emerald-800 transition-colors">-</button>
                             <span className="text-sm font-medium w-4 text-center text-gray-900">{item.quantity}</span>
                             <button onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })} className="px-2 text-gray-600 hover:text-emerald-800 transition-colors">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Gift Message Logic */}
                    <div className="bg-sage-50/50 p-4 rounded-xl border border-sage-100">
                       <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 block flex items-center gap-2"><Wand2 size={12} /> Открытка (бесплатно)</label>
                       {item.giftMessage ? (
                         <div className="relative">
                            <textarea value={item.giftMessage} onChange={(e) => updateCartItem(item.id, { giftMessage: e.target.value })} className="w-full text-sm p-3 rounded-lg border-emerald-200 focus:ring-emerald-500 bg-white font-serif italic text-gray-600" rows={3}/>
                            <button onClick={() => updateCartItem(item.id, { giftMessage: '' })} className="text-[10px] text-gray-500 hover:text-rose-600 underline mt-1 transition-colors">Удалить текст</button>
                         </div>
                       ) : (
                         <div>
                            <p className="text-xs text-gray-500 mb-3">Не знаете, что написать? Flora поможет подобрать слова.</p>
                            <div className="flex gap-2 mb-2">
                               {['Романтика', 'Дружбе', 'Официально'].map(t => (
                                 <button key={t} onClick={() => setGiftTone(t.toLowerCase())} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${giftTone === t.toLowerCase() ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'border-gray-200 text-gray-500 hover:border-emerald-200'}`}>{t}</button>
                               ))}
                            </div>
                            <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => generateMessageForItem(item.id, item.name)} disabled={isGeneratingGift}>{isGeneratingGift ? 'Сочиняю...' : 'Придумать поздравление'}</Button>
                         </div>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Итого</span>
                  <span className="font-serif text-2xl font-medium text-gray-900">{cartTotal.toFixed(2)} ₽</span>
                </div>
                {!user ? (
                    <Button className="w-full py-4 text-lg bg-gray-900 hover:bg-black" onClick={() => { setIsCartOpen(false); setIsAuthOpen(true); addToast('info', 'Пожалуйста, войдите для оформления заказа'); }}>Войти для оформления</Button>
                ) : (
                    <Button className="w-full py-4 text-lg shadow-xl shadow-emerald-100" onClick={handleProceedToCheckout}>Перейти к оформлению</Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
        <button onClick={() => setIsAiOpen(true)} className="bg-emerald-900 text-white p-4 rounded-full shadow-lg shadow-emerald-900/30 hover:bg-emerald-800 hover:scale-105 transition-all duration-300 group" title="Спросить Flora">
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <AIFlorist 
          isOpen={isAiOpen} 
          onClose={() => setIsAiOpen(false)} 
          onAddToCart={handleAddToCart} 
          onQuickView={setQuickViewProduct} 
      />
      <GiftWizard 
          isOpen={isGiftWizardOpen} 
          onClose={() => setIsGiftWizardOpen(false)} 
          allProducts={allProducts} 
          onAddToCart={handleAddToCart}
      />
      <VisualSearch isOpen={isVisualSearchOpen} onClose={() => setIsVisualSearchOpen(false)} onSearch={(term) => { setSearchQuery(term); navigate('/catalog'); }} />
      <QuickViewModal product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={handleAddToCart} onGoToDetails={(p) => navigate(`/product/${p.id}`)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={(u) => handleLogin(u.role === 'admin' ? 'Admin' : u.role === 'seller' ? 'Partner' : 'Google')} />
      
      {isCheckoutSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative">
              <button onClick={() => setIsCheckoutSuccess(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"><CheckCircle size={32} /></div>
              <h3 className="font-serif text-2xl text-emerald-900 mb-2">Заказ оформлен!</h3>
              <p className="text-gray-500 mb-6">Спасибо за выбор Aura Flora. Менеджер свяжется с вами в течение 10 минут для подтверждения.</p>
              <Button onClick={() => setIsCheckoutSuccess(false)} className="w-full">Отлично</Button>
           </div>
        </div>
      )}
    </>
  );
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
