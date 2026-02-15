import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Search, Menu, Sparkles, X, Heart, Instagram, Facebook, Twitter, Camera, User as UserIcon, LayoutDashboard, Wand2, CheckCircle, Truck, Plus, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { PRODUCTS, HERO_IMAGE, BLOG_POSTS } from './constants';
import { Product, Category, CartItem, ViewState, User, Order, OrderStatus } from './types';
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
import { generateGiftMessage } from './services/geminiService';

const App: React.FC = () => {
  // --- Global Data State (Marketplace Simulation) ---
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bloom_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('bloom_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // --- UI State ---
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bloom_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bloom_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  
  // AI Features State
  const [giftTone, setGiftTone] = useState('romantic');
  const [isGeneratingGift, setIsGeneratingGift] = useState(false);

  // --- Effects ---

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('bloom_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('bloom_products', JSON.stringify(allProducts)); }, [allProducts]);
  useEffect(() => { 
    if (user) localStorage.setItem('bloom_user', JSON.stringify(user)); 
    else localStorage.removeItem('bloom_user');
  }, [user]);
  useEffect(() => { localStorage.setItem('bloom_orders', JSON.stringify(orders)); }, [orders]);

  // --- Handlers ---

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'seller') {
        navigate('/seller');
    } else if (loggedInUser.role === 'admin') {
        navigate('/admin');
    } else {
        navigate('/profile');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bloom_user');
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
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, giftMessage: '' }];
    });
    setIsCartOpen(true);
  };

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleRemoveItem = () => {
    if (itemToRemove) {
      setCart(prev => prev.filter(item => item.id !== itemToRemove));
      setItemToRemove(null);
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setAllProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId: string) => {
    setAllProducts(prev => prev.filter(p => p.id !== productId));
  };
  
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const generateMessageForItem = async (itemId: string, productName: string) => {
    setIsGeneratingGift(true);
    const msg = await generateGiftMessage('Особый случай', 'Близкий человек', giftTone);
    updateCartItem(itemId, { giftMessage: msg });
    setIsGeneratingGift(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!user) {
        setIsAuthOpen(true);
        return;
    }

    const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending',
        buyerName: user.name
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setIsCheckoutSuccess(true);
    setCart([]);
    setTimeout(() => {
      setIsCartOpen(false);
    }, 200);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- Sub-components (Pages) ---

  const Home = () => (
    <>
      <Helmet>
        <title>Bloom & Wisp - Премиальный цветочный маркетплейс</title>
        <meta name="description" content="Авторские букеты с доставкой день в день. ИИ-флорист поможет выбрать идеальную композицию для любого случая." />
      </Helmet>
      <section className="relative min-h-screen flex items-center bg-emerald-950 overflow-hidden pt-20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-800/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-20%] w-[800px] h-[800px] bg-emerald-900/30 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full pb-10">
          <div className="order-2 lg:order-1 space-y-8 animate-in slide-in-from-bottom duration-1000 fade-in flex flex-col justify-center text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-900/30 backdrop-blur-md text-emerald-200 text-xs font-medium tracking-[0.2em] uppercase w-fit mx-auto lg:mx-0">
              <Sparkles size={12} />
              <span>Весенняя Коллекция 2024</span>
            </div>
            
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] sm:leading-[0.95] text-white">
              Искусство <br />
              <span className="text-emerald-300/90 italic font-light font-serif">дарить</span> <br />
              чувства.
            </h1>
            
            <p className="text-emerald-100/70 text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
              Авторские букеты с доставкой день в день. Мы объединили мастерство флористов и технологии ИИ, чтобы вы могли выразить то, что сложно сказать словами.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-white text-emerald-950 hover:bg-emerald-50 rounded-full px-8 h-14 text-base" onClick={() => navigate('/catalog')}>
                Выбрать букет
              </Button>
              <Button size="lg" variant="outlineWhite" className="rounded-full px-8 h-14 text-base" onClick={() => setIsAiOpen(true)}>
                <Sparkles size={18} className="mr-2" />
                Подобрать с AI
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 lg:pt-12 border-t border-emerald-900/30">
               <div>
                 <p className="text-2xl md:text-3xl font-serif text-white">15k+</p>
                 <p className="text-[10px] md:text-xs text-emerald-400/80 uppercase tracking-wider mt-1">Доставок</p>
               </div>
               <div className="w-px h-10 bg-emerald-900/50"></div>
               <div>
                 <p className="text-2xl md:text-3xl font-serif text-white">4.9</p>
                 <p className="text-[10px] md:text-xs text-emerald-400/80 uppercase tracking-wider mt-1">Рейтинг</p>
               </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative h-[50vh] lg:h-[80vh] w-full flex items-center justify-center">
             <div className="relative w-full h-full max-w-md lg:max-w-lg mx-auto">
                <div className="absolute inset-0 top-4 lg:top-0 bg-gray-900 rounded-t-[150px] rounded-b-[40px] lg:rounded-t-full lg:rounded-b-full overflow-hidden border-[1px] border-white/10 shadow-2xl animate-in fade-in zoom-in duration-1000">
                   <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent z-10 opacity-60"></div>
                   <img src={HERO_IMAGE} alt="Hero" className="w-full h-full object-cover scale-110 hover:scale-105 transition-transform duration-[3s]" />
                </div>
                <div className="absolute bottom-8 lg:bottom-20 -left-4 lg:-left-12 bg-white/10 backdrop-blur-xl p-4 pr-6 rounded-2xl border border-white/10 shadow-2xl max-w-[200px] flex items-center gap-3 animate-in slide-in-from-left duration-1000 delay-300 fill-mode-forwards z-20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-100 border border-emerald-400/20">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold tracking-wide">Быстрая доставка</p>
                      <p className="text-emerald-200/80 text-[10px]">от 60 минут</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
             <h2 className="font-serif text-4xl text-emerald-900 mb-4">Избранное флористами</h2>
             <p className="text-gray-500 font-light">Свежие поступления и лучшие композиции этой недели.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {allProducts.slice(0, 4).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-sage-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
               <img 
                src="https://images.unsplash.com/photo-1563241527-30012e17700d?q=80&w=800&auto=format&fit=crop" 
                alt="Florist" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="font-serif text-4xl text-emerald-900">Когда технологии расцветают</h2>
              <p className="text-gray-600 leading-relaxed">
                Выбор подарка может быть сложным, но мы сделали его вдохновляющим. Наш ИИ-помощник Flora не просто помнит важные даты — она чувствует нюансы отношений и предлагает именно то, что тронет сердце.
              </p>
              <div className="flex gap-4">
                 <div className="p-4 bg-white rounded-xl shadow-sm border border-sage-100 flex-1">
                   <Heart className="text-rose-400 mb-2" />
                   <h4 className="font-medium">Календарь дат</h4>
                   <p className="text-xs text-gray-500 mt-1">Мы напомним о годовщине заранее</p>
                 </div>
                 <div className="p-4 bg-white rounded-xl shadow-sm border border-sage-100 flex-1">
                   <Search className="text-emerald-400 mb-2" />
                   <h4 className="font-medium">Поиск по фото</h4>
                   <p className="text-xs text-gray-500 mt-1">Нашли красивый букет? Мы соберем похожий.</p>
                 </div>
              </div>
              <Button onClick={() => setIsVisualSearchOpen(true)} variant="secondary" className="mt-4">Попробовать поиск по фото</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const Shop = () => {
    const filteredProducts = allProducts.filter(p => {
      const matchesCategory = activeCategory === 'Все' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    return (
      <div className="container mx-auto px-4 md:px-8 py-32 min-h-screen">
        <Helmet>
           <title>Каталог цветов | Bloom & Wisp</title>
           <meta name="description" content="Широкий выбор букетов, комнатных растений и подарков." />
        </Helmet>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-serif text-4xl text-emerald-900 mb-4">Каталог цветов</h2>
            <p className="text-gray-500">Выбирайте сердцем, дарите с душой.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Все', ...Object.values(Category)].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeCategory === cat ? 'bg-emerald-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-emerald-900'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {searchQuery && (
          <div className="mb-8 flex items-center gap-2">
            <p className="text-gray-500">Результаты поиска для: <span className="font-medium text-gray-900">"{searchQuery}"</span></p>
            <button onClick={() => setSearchQuery('')} className="text-rose-500 text-sm hover:underline">Сбросить</button>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
             <p className="text-gray-500">Мы не нашли букетов по вашему запросу. Попробуйте изменить фильтры.</p>
             <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setActiveCategory('Все'); }}>Показать все товары</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const Journal = () => (
    <div className="container mx-auto px-4 md:px-8 py-32 min-h-screen animate-in fade-in duration-500">
      <Helmet>
        <title>Блог о цветах | Bloom & Wisp</title>
      </Helmet>
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span className="text-emerald-600 text-sm font-bold tracking-widest uppercase mb-3 block">Блог Bloom & Wisp</span>
        <h2 className="font-serif text-4xl md:text-5xl text-emerald-900 mb-6">Истории цветов</h2>
        <p className="text-gray-500 text-lg font-light">
          Погрузитесь в мир флористики, узнайте секреты ухода и найдите вдохновение для своего дома.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {BLOG_POSTS.map(post => (
          <article key={post.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="aspect-[16/10] overflow-hidden relative">
               <img 
                 src={post.image} 
                 alt={post.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
               />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
               <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 font-medium">
                 <span className="text-emerald-600">{post.date}</span>
                 <span>•</span>
                 <span>{post.readTime} чтения</span>
               </div>
               
               <h3 className="font-serif text-xl font-medium text-gray-900 mb-3 group-hover:text-emerald-800 transition-colors">
                 {post.title}
               </h3>
               
               <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                 {post.excerpt}
               </p>
               
               <button className="flex items-center text-emerald-800 text-sm font-medium hover:text-emerald-600 transition-colors mt-auto group-hover:translate-x-1 duration-300">
                 Читать полностью <ArrowRight size={16} className="ml-2" />
               </button>
            </div>
          </article>
        ))}
      </div>
      
      {/* ... Subscribe section remains same ... */}
    </div>
  );

  const Layout = ({ children }: { children: React.ReactNode }) => (
      <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white selection:bg-emerald-100">
        <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled || location.pathname !== '/' ? 'bg-white/90 backdrop-blur-xl shadow-sm py-3 border-b border-gray-100' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
                {isMobileMenuOpen ? <X className="text-emerald-900" /> : <Menu className={`hover:text-emerald-800 ${scrolled || location.pathname !== '/' ? 'text-gray-800' : 'text-white'}`} />}
                </button>
                <Link to="/" className={`font-serif text-2xl font-bold tracking-tight ${scrolled || location.pathname !== '/' ? 'text-emerald-900' : 'text-white md:text-emerald-900'}`}>
                Bloom & Wisp
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link to="/catalog" className={`hover:text-emerald-800 transition-colors ${location.pathname === '/catalog' ? 'text-emerald-800' : (scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-emerald-100 hover:text-white')}`}>Каталог</Link>
                <Link to="/blog" className={`hover:text-emerald-800 transition-colors ${location.pathname === '/blog' ? 'text-emerald-800' : (scrolled || location.pathname !== '/' ? 'text-gray-600' : 'text-emerald-100 hover:text-white')}`}>Блог</Link>
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="relative hidden md:block group">
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-700 ${scrolled || location.pathname !== '/' ? 'text-gray-400' : 'text-emerald-200'}`} />
                <input 
                    type="text" 
                    placeholder="Найти букет..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if(location.pathname !== '/catalog') navigate('/catalog'); }}
                    className={`border border-transparent rounded-full pl-9 pr-10 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-50/50 w-40 focus:w-64 transition-all placeholder-gray-400 text-gray-800
                    ${scrolled || location.pathname !== '/' ? 'bg-gray-100/50 focus:bg-white focus:border-emerald-200' : 'bg-emerald-900/30 text-white placeholder-emerald-200/50 focus:bg-white focus:text-gray-900 focus:border-emerald-200'}
                    `}
                />
                <button 
                    onClick={() => setIsVisualSearchOpen(true)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-emerald-600 ${scrolled || location.pathname !== '/' ? 'text-gray-400' : 'text-emerald-200'}`}
                    title="Поиск по фото"
                >
                    <Camera size={16} />
                </button>
                </div>
                
                <button onClick={() => setIsCartOpen(true)} className={`relative p-2 hover:bg-emerald-50 rounded-full transition-colors ${scrolled || location.pathname !== '/' ? 'text-emerald-900' : 'text-white hover:text-emerald-900'}`}>
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartCount}
                    </span>
                )}
                </button>

                <button onClick={handleProfileClick} className={`hidden md:block p-2 hover:bg-emerald-50 rounded-full transition-colors ${scrolled || location.pathname !== '/' ? 'text-emerald-900' : 'text-white hover:text-emerald-900'}`}>
                {user ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/50">
                        <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <UserIcon size={22} />
                )}
                </button>
            </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-2">
                <div className="flex flex-col p-4 space-y-4">
                <div className="relative">
                    <Search className="text-gray-400 w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                    type="text" 
                    placeholder="Найти..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none"
                    onFocus={() => { navigate('/catalog'); setIsMobileMenuOpen(false); }}
                    />
                </div>
                <Link to="/catalog" className="text-left font-medium py-2 border-b border-gray-50 text-gray-700">Каталог</Link>
                <Link to="/blog" className="text-left font-medium py-2 border-b border-gray-50 text-gray-700">Блог</Link>
                <button onClick={handleProfileClick} className="text-left font-medium py-2 border-b border-gray-50 text-gray-700 flex items-center gap-2">
                    {user ? user.name : 'Войти'}
                </button>
                <button onClick={() => { setIsVisualSearchOpen(true); setIsMobileMenuOpen(false); }} className="text-left font-medium py-2 flex items-center gap-2 text-emerald-600">
                    <Camera size={16} /> Поиск по фото
                </button>
                </div>
            </div>
            )}
        </header>

        <main className="flex-1">
            {children}
        </main>

        <footer className="bg-emerald-900 text-emerald-100 pt-16 pb-8 border-t border-emerald-800">
            <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                <h4 className="font-serif text-xl font-bold text-white mb-6">Bloom & Wisp</h4>
                <p className="text-sm opacity-80 leading-relaxed mb-6">
                    Мы создаем не просто букеты, а настроение. Экологичный подход к флористике и внимание к каждой детали.
                </p>
                <div className="flex gap-4">
                    <Instagram size={20} className="cursor-pointer hover:text-white" />
                    <Facebook size={20} className="cursor-pointer hover:text-white" />
                    <Twitter size={20} className="cursor-pointer hover:text-white" />
                </div>
                </div>
                
                {[
                { title: "Навигация", links: ["Каталог", "Поводы", "Блог", "Поиск по фото"] },
                { title: "О нас", links: ["Философия бренда", "Эко-ответственность", "Вакансии", "Для прессы"] },
                { title: "Клиентам", links: ["Частые вопросы", "Доставка и оплата", "Уход за цветами", "Контакты"] },
                ].map((col) => (
                <div key={col.title}>
                    <h5 className="font-medium text-white mb-4">{col.title}</h5>
                    <ul className="space-y-3 text-sm opacity-70">
                    {col.links.map(link => (
                        <li key={link}><a href="#" className="hover:text-white transition-colors hover:underline">{link}</a></li>
                    ))}
                    </ul>
                </div>
                ))}
            </div>
            
            <div className="border-t border-emerald-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-60">
                <p>&copy; {new Date().getFullYear()} Bloom & Wisp. Все права защищены.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                <button onClick={() => { setIsAuthOpen(true); }} className="hover:text-white flex items-center gap-1">
                    <LayoutDashboard size={14} /> Вход для партнеров
                </button>
                <a href="#" className="hover:text-white">Политика конфиденциальности</a>
                <a href="#" className="hover:text-white">Оферта</a>
                </div>
            </div>
            </div>
        </footer>
      </div>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalog" element={<Layout><Shop /></Layout>} />
        <Route path="/blog" element={<Layout><Journal /></Layout>} />
        <Route path="/product/:id" element={
            <Layout>
                <div className="container mx-auto px-4 md:px-8 py-32">
                    <ProductDetails 
                        allProducts={allProducts} 
                        onAddToCart={handleAddToCart}
                    />
                </div>
            </Layout>
        } />
        <Route path="/admin" element={<Layout><AdminDashboard onLogout={handleLogout} /></Layout>} />
        <Route path="/seller" element={
            <Layout>
                 <SellerDashboard 
                    onLogout={handleLogout} 
                    products={allProducts} 
                    onAddProduct={handleAddProduct}
                    onDeleteProduct={handleDeleteProduct}
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                />
            </Layout>
        } />
        <Route path="/profile" element={
            <Layout>
                {user ? (
                     <BuyerDashboard 
                        user={user} 
                        onLogout={handleLogout} 
                        orders={orders} 
                    />
                ) : <Navigate to="/" />}
            </Layout>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>
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
                  <Button variant="ghost" className="mt-4" onClick={() => setIsCartOpen(false)}>Перейти к покупкам</Button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex flex-col gap-4 border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-lg bg-gray-100" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900 font-serif">{item.name}</h4>
                          <button onClick={() => setItemToRemove(item.id)} className="text-gray-400 hover:text-rose-500 transition-colors"><X size={16} /></button>
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

                    <div className="bg-sage-50/50 p-4 rounded-xl border border-sage-100">
                       <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 block flex items-center gap-2">
                         <Wand2 size={12} /> Открытка (бесплатно)
                       </label>
                       {item.giftMessage ? (
                         <div className="relative">
                            <textarea 
                              value={item.giftMessage}
                              onChange={(e) => updateCartItem(item.id, { giftMessage: e.target.value })}
                              className="w-full text-sm p-3 rounded-lg border-emerald-200 focus:ring-emerald-500 bg-white font-serif italic text-gray-600"
                              rows={3}
                            />
                            <button onClick={() => updateCartItem(item.id, { giftMessage: '' })} className="text-[10px] text-gray-500 hover:text-rose-600 underline mt-1 transition-colors">Удалить текст</button>
                         </div>
                       ) : (
                         <div>
                            <p className="text-xs text-gray-500 mb-3">Не знаете, что написать? Flora поможет подобрать слова.</p>
                            <div className="flex gap-2 mb-2">
                               {['Романтика', 'Дружбе', 'Официально'].map(t => (
                                 <button 
                                  key={t}
                                  onClick={() => setGiftTone(t.toLowerCase())}
                                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${giftTone === t.toLowerCase() ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'border-gray-200 text-gray-500 hover:border-emerald-200'}`}
                                 >
                                  {t}
                                 </button>
                               ))}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs" 
                              onClick={() => generateMessageForItem(item.id, item.name)}
                              disabled={isGeneratingGift}
                            >
                              {isGeneratingGift ? 'Сочиняю...' : 'Придумать поздравление'}
                            </Button>
                         </div>
                       )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="mb-6">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Дата доставки</label>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {[0, 1, 2, 3, 4].map(d => {
                        const date = new Date();
                        date.setDate(date.getDate() + d);
                        return (
                          <button key={d} className="flex-shrink-0 w-16 h-16 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center hover:border-emerald-500 focus:border-emerald-500 focus:bg-emerald-50 transition-colors group">
                             <span className="text-xs text-gray-400 group-hover:text-emerald-600 group-focus:text-emerald-600">{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                             <span className="font-bold text-gray-900">{date.getDate()}</span>
                          </button>
                        )
                      })}
                   </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Итого</span>
                  <span className="font-serif text-2xl font-medium text-gray-900">{cartTotal.toFixed(2)} ₽</span>
                </div>
                {!user ? (
                    <Button className="w-full py-4 text-lg bg-gray-900 hover:bg-black" onClick={() => { setIsCartOpen(false); setIsAuthOpen(true); }}>
                        Войти для оформления
                    </Button>
                ) : (
                    <Button className="w-full py-4 text-lg shadow-xl shadow-emerald-100" onClick={handleCheckout}>Перейти к оформлению</Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
        <button
          onClick={() => setIsAiOpen(true)}
          className="bg-emerald-900 text-white p-4 rounded-full shadow-lg shadow-emerald-900/30 hover:bg-emerald-800 hover:scale-105 transition-all duration-300 group"
          title="Спросить Flora"
        >
          <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Modals */}
      <AIFlorist isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} onAddToCart={handleAddToCart} />
      <VisualSearch isOpen={isVisualSearchOpen} onClose={() => setIsVisualSearchOpen(false)} onSearch={(term) => { setSearchQuery(term); navigate('/catalog'); }} />
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={!!quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
        onAddToCart={handleAddToCart}
        onGoToDetails={(p) => navigate(`/product/${p.id}`)}
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin} 
      />
      {/* Checkout Success Modal */}
      {isCheckoutSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative">
              <button 
                onClick={() => setIsCheckoutSuccess(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-serif text-2xl text-emerald-900 mb-2">Заказ принят!</h3>
              <p className="text-gray-500 mb-6">Спасибо за выбор Bloom & Wisp. Менеджер свяжется с вами в течение 10 минут для подтверждения.</p>
              <Button onClick={() => setIsCheckoutSuccess(false)} className="w-full">Отлично</Button>
           </div>
        </div>
      )}
    </>
  );
};

export default App;