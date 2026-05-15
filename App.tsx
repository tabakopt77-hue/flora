
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Camera, User as UserIcon, CheckCircle, Wand2, LogOut } from 'lucide-react';
import { FloraIcon } from './components/FloraIcon';
import { Product, CartItem, Order, OrderStatus } from './types';
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
import { BlogPostPage } from './components/BlogPostPage';
import { AboutPage } from './components/AboutPage';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Journal } from './pages/Journal';
import { NotFoundPage } from './pages/NotFoundPage';
import { SellerLanding } from './pages/SellerLanding';


import { Helmet } from 'react-helmet-async';

// --- Layout Component ---
const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) => 
                regex.test(part) ? <span key={i} className="bg-emerald-100 text-emerald-800 font-semibold rounded-sm px-0.5">{part}</span> : <span key={i}>{part}</span>
            )}
        </>
    );
};

const Layout = ({ children, fullWidth = false, cartCount, isMobileMenuOpen, setIsMobileMenuOpen, searchQuery, setSearchQuery, setIsVisualSearchOpen, handleProfileClick, setIsCartOpen, scrolled, allProducts, handleLogout }: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Search Suggestions
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Cart Animation
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    const prevCartCountRef = useRef(cartCount);

    useEffect(() => {
        if (cartCount > prevCartCountRef.current) {
            setIsCartAnimating(true);
            setTimeout(() => setIsCartAnimating(false), 1000);
        }
        prevCartCountRef.current = cartCount;
    }, [cartCount]);

    useEffect(() => {
        if (searchQuery && searchQuery.length > 0 && allProducts) {
            const filtered = allProducts.filter((p: Product) => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
            ).slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [searchQuery, allProducts]);

    const handleSuggestionClick = (product: Product) => {
        setSearchQuery('');
        setShowSuggestions(false);
        navigate(`/product/${product.id}`);
    };
    const isDashboard = location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkout');
    // Hide header background for BlogPost page initially to let hero image shine
    const isBlogPost = location.pathname.startsWith('/blog/');
    const isAboutPage = location.pathname === '/about';

    return (
      <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white selection:bg-emerald-100">
        <header className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3 border-b border-gray-100' : 'bg-transparent py-5'}`}>
            <div className={`container mx-auto px-4 md:px-8 flex items-center justify-between ${fullWidth ? 'max-w-full' : ''}`}>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
                {isMobileMenuOpen ? <X className="text-emerald-900" /> : <Menu className={`hover:text-emerald-800 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-gray-800' : 'text-white'}`} />}
                </button>
                <Link to="/" className={`font-serif text-2xl font-bold tracking-tight inline-block transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:-translate-y-0.5 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-emerald-900 hover:text-emerald-600' : 'text-white hover:text-emerald-100 hover:drop-shadow-lg'}`}>
                Aura Flora
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                <Link to="/catalog" className={`hover:text-emerald-800 transition-colors ${location.pathname === '/catalog' ? 'text-emerald-800' : (scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-gray-600' : 'text-emerald-100 hover:text-white')}`}>Каталог</Link>
                <Link to="/blog" className={`hover:text-emerald-800 transition-colors ${location.pathname === '/blog' ? 'text-emerald-800' : (scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-gray-600' : 'text-emerald-100 hover:text-white')}`}>Блог</Link>
                <Link to="/about" className={`hover:text-emerald-800 transition-colors ${location.pathname === '/about' ? 'text-emerald-800' : (scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-gray-600' : 'text-emerald-100 hover:text-white')}`}>О нас</Link>
            </nav>

            <div className="flex items-center gap-3 md:gap-4">
                {!isDashboard && (
                    <div className="relative hidden md:block group">
                        <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 group-hover:text-emerald-600 group-focus-within:text-emerald-700 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) ? 'text-gray-500' : 'text-emerald-200'}`} />
                        <input 
                            type="text" 
                            placeholder="Найти букет..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => { 
                                if(searchQuery.length > 0) setShowSuggestions(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setShowSuggestions(false);
                                    if(location.pathname !== '/catalog') navigate('/catalog');
                                }
                            }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className={`border border-transparent rounded-full pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-50/50 w-44 group-hover:w-72 focus:w-72 transition-all duration-300 ease-out placeholder-gray-500 text-gray-800 shadow-sm
                            ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) ? 'bg-gray-100/50 group-hover:bg-white group-hover:shadow-md focus:bg-white focus:border-emerald-200' : 'bg-emerald-900/30 text-white placeholder-emerald-200/50 group-hover:bg-white group-hover:text-gray-900 focus:bg-white focus:text-gray-900 focus:border-emerald-200'}
                            `}
                        />
                        <button 
                            onClick={() => setIsVisualSearchOpen(true)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 group-hover:text-emerald-600 hover:text-emerald-700 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) ? 'text-gray-500' : 'text-emerald-200'}`}
                            title="Поиск по фото"
                        >
                            <Camera size={16} />
                        </button>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Предложения</div>
                                {suggestions.map((product, index) => {
                                    const matchingTags = product.tags.filter((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
                                    return (
                                    <button
                                        key={`${product.id}-${index}`}
                                        onClick={() => handleSuggestionClick(product)}
                                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 flex items-center gap-4 transition-all duration-200 group/item"
                                    >
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate group-hover/item:text-emerald-800 transition-colors">
                                                <HighlightText text={product.name} highlight={searchQuery} />
                                            </p>
                                            {matchingTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {matchingTags.slice(0, 2).map((tag: string, i: number) => (
                                                        <span key={i} className="text-[9px] text-gray-500 bg-gray-100/80 px-1.5 py-0.5 rounded blur-0 truncate max-w-[100px]">
                                                            <HighlightText text={tag} highlight={searchQuery} />
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right pl-2">
                                            <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">{product.price.toLocaleString()} ₽</p>
                                        </div>
                                    </button>
                                )})}
                            </div>
                        )}
                    </div>
                )}
                
                {location.pathname !== '/checkout' && (
                    <button 
                        onClick={() => setIsCartOpen(true)} 
                        className={`relative flex items-center gap-2 md:px-3 md:py-2.5 p-2 rounded-full transition-all duration-300 ${
                            scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard 
                            ? 'md:bg-gray-50 bg-transparent text-emerald-900 md:hover:bg-emerald-100' 
                            : 'md:bg-white/20 bg-transparent text-white md:hover:bg-white md:hover:text-emerald-900 backdrop-blur-md'
                        } ${isCartAnimating ? 'scale-110 md:-translate-y-2 animate-bounce' : 'scale-100'}`}
                    >
                    <ShoppingBag className={`w-5 h-5 transition-transform duration-300 ${isCartAnimating ? 'scale-150 text-emerald-500' : ''}`} />
                    <span className="hidden md:inline font-medium text-sm">Корзина</span>
                    {cartCount > 0 && (
                        <span className={`absolute -top-1 -right-1 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transition-all duration-500 ${isCartAnimating ? 'scale-150 transform -translate-y-2 bg-emerald-500 shadow-emerald-500/50 shadow-lg' : 'scale-100 bg-rose-500'}`}>
                        {cartCount}
                        </span>
                    )}
                    </button>
                )}

                <div className="relative group hidden md:block">
                    <button 
                        onClick={handleProfileClick} 
                        className={`p-1 rounded-full transition-colors border-2 ${
                            scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard 
                            ? 'border-transparent hover:bg-emerald-50' 
                            : 'border-white/20 hover:bg-white/20'
                        }`}
                    >
                    {user ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/50">
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`p-1.5 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-emerald-900' : 'text-white'}`}>
                            <UserIcon size={20} />
                        </div>
                    )}
                    </button>
                    
                    {/* Desktop Profile Dropdown */}
                    {user && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="p-4 border-b border-gray-50">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <div className="p-2">
                                <button onClick={handleProfileClick} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors flex items-center gap-2">
                                    <UserIcon size={16} /> Личный кабинет
                                </button>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2">
                                    <LogOut size={16} /> Выйти
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
            
             {/* Mobile Menu */}
            {isMobileMenuOpen && (
                 <>
                    {/* Backdrop */}
                    <div 
                        className="md:hidden absolute top-full left-0 right-0 h-screen bg-gray-900/20 backdrop-blur-sm z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl animate-in slide-in-from-top-2 z-50 rounded-b-2xl">
                        <div className="flex flex-col p-4 space-y-4">
                        <div className="relative group">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Найти букет..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => { 
                                    if(searchQuery.length > 0) setShowSuggestions(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setShowSuggestions(false);
                                        setIsMobileMenuOpen(false);
                                        if(location.pathname !== '/catalog') navigate('/catalog');
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-800 placeholder-gray-500"
                            />
                            <button 
                                onClick={() => { setIsMobileMenuOpen(false); setIsVisualSearchOpen(true); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                                title="Поиск по фото"
                            >
                                <Camera size={18} />
                            </button>
                            
                            {/* Mobile Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-2 z-50">
                                    {suggestions.map((product, index) => {
                                        const matchingTags = product.tags.filter((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
                                        return (
                                        <button
                                            key={`mobile-${product.id}-${index}`}
                                            onClick={() => {
                                                handleSuggestionClick(product);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    <HighlightText text={product.name} highlight={searchQuery} />
                                                </p>
                                                {matchingTags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                        {matchingTags.slice(0, 2).map((tag: string, i: number) => (
                                                            <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md truncate max-w-[100px]">
                                                                <HighlightText text={tag} highlight={searchQuery} />
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-xs text-emerald-600 font-medium mt-0.5">{product.price.toLocaleString()} ₽</p>
                                            </div>
                                        </button>
                                    )})}
                                </div>
                            )}
                        </div>
                        <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-gray-50 text-gray-700 text-lg">Каталог</Link>
                        <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-gray-50 text-gray-700 text-lg">Блог</Link>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-gray-50 text-gray-700 text-lg">О нас</Link>
                        <Link to="/seller" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-gray-50 text-gray-700 text-lg">Партнерам</Link>
                         <button onClick={() => { handleProfileClick(); setIsMobileMenuOpen(false); }} className="text-left font-medium py-3 border-b border-gray-50 text-gray-700 flex items-center gap-3 text-lg">
                            <UserIcon size={20} /> {user ? "Личный кабинет" : "Войти"}
                        </button>
                        {user && (
                            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left font-medium py-3 text-rose-500 flex items-center gap-3 text-lg hover:text-rose-600">
                                <LogOut size={20} /> Выйти
                            </button>
                        )}
                    </div>
                 </div>
                 </>
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


const AppContent: React.FC = () => {
  // --- Auth State from Context ---
  const { user, login, logout } = useAuth();
  
  // --- Global Data State (Fetched from Backend) ---
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => db.cart.get()); // Cart stays local for now
  const [wishlist, setWishlist] = useState<string[]>(() => db.wishlist.get());
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
  const [isShopFilterOpen, setIsShopFilterOpen] = useState(false);
  
  // AI Features State
  const [giftTone, setGiftTone] = useState('romantic');
  const [isGeneratingGift, setIsGeneratingGift] = useState(false);
  
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Sound Notifications ---
  const playSound = (type: 'cart' | 'chat') => {
    try {
      const audio = new Audio(
        type === 'cart' 
          ? 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' // Pop/click sound for cart
          : 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3' // Soft chime for chat
      );
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

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
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
    const id = crypto.randomUUID();
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
        navigate('/seller/dashboard');
    } else if (user.role === 'admin') {
        navigate('/admin');
    } else {
        navigate('/profile');
    }
  };
  
  const [openFullPage, setOpenFullPage] = useState(() => {
    const saved = localStorage.getItem('aura_open_full_page');
    return saved ? JSON.parse(saved) : false;
  });

  const handleToggleOpenFullPage = (value: boolean) => {
    setOpenFullPage(value);
    localStorage.setItem('aura_open_full_page', JSON.stringify(value));
  };

  const handleQuickView = (product: Product) => {
      if (openFullPage) {
          navigate(`/product/${product.id}`);
          return;
      }
      if (quickViewProduct && quickViewProduct.id === product.id) {
          setQuickViewProduct(null);
      } else {
          setQuickViewProduct(product);
      }
  };

  const handleToggleWishlist = (product: Product) => {
      const newList = db.wishlist.toggle(product.id);
      setWishlist(newList);
      const isAdded = newList.includes(product.id);
      addToast(isAdded ? 'success' : 'info', isAdded ? 'Добавлено в избранное' : 'Удалено из избранного');
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    // Stock Check Logic
    const currentQtyInCart = cart.find(i => i.id === product.id)?.quantity || 0;
    if (product.stock < currentQtyInCart + quantity) {
        addToast('error', `Извините, доступно всего ${product.stock} шт.`);
        return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity: quantity, giftMessage: '' }];
    });
    addToast('success', `${product.name} добавлен в корзину`);
    playSound('cart');
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
    scrolled,
    handleLogout
  };

  return (
    <>
      <Helmet defaultTitle="Aura Flora | Премиальный цветочный маркетплейс" titleTemplate="%s | Aura Flora">
        <meta name="description" content="Aura Flora — премиальный цветочный маркетплейс, объединяющий лучших флористов. Мы используем ИИ для проверки качества каждого букета перед отправкой." />
        <meta property="og:title" content="Aura Flora | Премиальный цветочный маркетплейс" />
        <meta property="og:description" content="Aura Flora — премиальный цветочный маркетплейс, объединяющий лучших флористов. Мы используем ИИ для проверки качества каждого букета перед отправкой." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <Routes>
        <Route path="/" element={
            <Layout {...layoutProps}>
                <Home 
                    allProducts={allProducts} 
                    onAddToCart={handleAddToCart} 
                    onQuickView={handleQuickView} 
                    navigate={navigate} 
                    setIsAiOpen={setIsAiOpen} 
                    setIsGiftWizardOpen={setIsGiftWizardOpen}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                />
            </Layout>
        } />
        <Route path="/catalog" element={
            <Layout {...layoutProps}>
                <Shop 
                    allProducts={allProducts} 
                    onAddToCart={handleAddToCart} 
                    onQuickView={handleQuickView} 
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    showFilters={isShopFilterOpen}
                    setShowFilters={setIsShopFilterOpen}
                />
            </Layout>
        } />
        <Route path="/blog" element={
            <Layout {...layoutProps}>
                <Journal />
            </Layout>
        } />
        <Route path="/blog/:id" element={
            <Layout {...layoutProps} fullWidth>
                <BlogPostPage />
            </Layout>
        } />
        <Route path="/about" element={
            <Layout {...layoutProps} fullWidth>
                <AboutPage />
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
                <div className="container mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-6 md:pb-12">
                    <ProductDetails 
                        allProducts={allProducts} 
                        onAddToCart={handleAddToCart}
                        isFavorite={wishlist.includes(location.pathname.split('/').pop() || '')}
                        onToggleFavorite={() => {
                            const pid = location.pathname.split('/').pop();
                            const p = allProducts.find(p => p.id === pid);
                            if(p) handleToggleWishlist(p);
                        }}
                    />
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
            <Layout fullWidth {...layoutProps}>
                <SellerLanding onJoin={() => setIsAuthOpen(true)} />
            </Layout>
        } />
        
        <Route path="/seller/dashboard" element={
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
                         <BuyerDashboard 
                            user={user} 
                            onLogout={handleLogout} 
                            orders={orders} 
                            wishlist={wishlist}
                            allProducts={allProducts}
                            onAddToCart={handleAddToCart}
                            onToggleWishlist={handleToggleWishlist}
                            openFullPage={openFullPage}
                            onToggleOpenFullPage={handleToggleOpenFullPage}
                        />
                    ) : <Navigate to="/" />}
                </Layout>
            </ProtectedRoute>
        } />
        
        <Route path="*" element={
            <Layout {...layoutProps} fullWidth>
                <NotFoundPage />
            </Layout>
        } />
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
                        <p className="text-sm text-stone-500 mb-3">{item.price.toLocaleString('ru-RU')} ₽</p>
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
                  <span className="font-serif text-2xl font-medium text-stone-900">{cartTotal.toLocaleString('ru-RU')} ₽</span>
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
      <div className="fixed bottom-6 right-2 md:right-10 z-40 flex flex-col gap-4">
        <button onClick={() => setIsAiOpen(true)} className="relative group flex items-center justify-center" title="Спросить Flora">
          {/* Button body */}
          <div className="relative p-2 group-hover:scale-110 transition-all duration-300">
             <FloraIcon className="w-14 h-14 animate-aster transition-colors" />
          </div>
        </button>
      </div>

      <AIFlorist 
          isOpen={isAiOpen} 
          onClose={() => setIsAiOpen(false)} 
          onAddToCart={handleAddToCart} 
          onQuickView={setQuickViewProduct} 
          onNewMessage={() => playSound('chat')}
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
