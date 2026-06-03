
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Camera, User as UserIcon, CheckCircle, Wand2, LogOut, Bell, Gift, Package } from 'lucide-react';
import { FloraIcon } from './components/FloraIcon';
import { CatalogMenu } from './components/CatalogMenu';
import { Product, CartItem, Order, OrderStatus, User } from './types';
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
import { PartnersPage } from './pages/PartnersPage';
import { MlmPage } from './pages/MlmPage';
import { PartnerAnalytics } from './pages/PartnerAnalytics';

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

const Layout = ({ children, fullWidth = false, cartCount, isMobileMenuOpen, setIsMobileMenuOpen, searchQuery, setSearchQuery, setIsVisualSearchOpen, handleProfileClick, setIsCartOpen, scrolled, allProducts, handleLogout, notificationsCount, setNotificationsCount }: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        if (isNotificationsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isNotificationsOpen]);
    
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
      <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#f8f9fc] selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
        {/* Global glow effects behind everything */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-100/50 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <header className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] py-3 border-b border-gray-100' : 'bg-transparent py-5'}`}>
            <div className={`container mx-auto px-4 md:px-8 flex items-center justify-between ${fullWidth ? 'max-w-full' : ''}`}>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden z-10 transition-colors">
                {isMobileMenuOpen ? <X className="text-gray-500 hover:text-gray-900" /> : <Menu className={`hover:text-gray-900 transition-colors ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-gray-700' : 'text-slate-900'}`} />}
                </button>
                <Link to="/" className={`font-serif text-2xl font-bold tracking-tight flex items-center gap-2.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:-translate-y-0.5 z-10 text-slate-900 group`}>
                  <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00c853] to-emerald-400 shadow-md shadow-emerald-500/10 group-hover:shadow-emerald-500/30 group-hover:rotate-12 transition-all duration-300">
                    <svg className="w-5.3 h-5.3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2c1.5 3 3.5 3 5 5s2 3.5 2 5-1.5 3.5-3 5-3.5 2-5 2-3.5-0.5-5-2-3-3.5-3-5 0.5-3.5 2-5 3.5-2 5-5z" />
                      <circle cx="12" cy="12" r="3" className="fill-emerald-300/30" />
                    </svg>
                  </div>
                  <span className="group-hover:text-[#00c853] transition-colors">Floramos</span>
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-600 z-10">
                <CatalogMenu scrolled={scrolled} isDarkHome={false} />
                <Link to="/blog" className={`hover:text-slate-900 transition-colors ${location.pathname === '/blog' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'}`}>Блог</Link>
                <Link to="/about" className={`hover:text-slate-900 transition-colors ${location.pathname === '/about' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'}`}>О нас</Link>
                <Link to="/partners" className={`hover:text-[#00c853] transition-colors ${location.pathname === '/partners' ? 'text-[#00c853] font-semibold' : 'hover:text-[#00c853]'}`}>Партнерам</Link>
                <Link to="/club" className={`hover:text-emerald-500 transition-colors ${location.pathname === '/club' ? 'text-emerald-500 font-semibold' : 'hover:text-emerald-500'}`}>Floramos Club</Link>
            </nav>

            <div className="flex items-center gap-3 md:gap-4 z-10">
                {!isDashboard && (
                    <div className="relative hidden md:block group">
                        <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 group-hover:text-[#00c853] group-focus-within:text-[#00c853] text-gray-400`} />
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
                            className={`border border-gray-200/80 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00c853] w-48 group-hover:w-72 focus:w-72 transition-all duration-300 ease-out placeholder-gray-400 text-slate-800 shadow-sm bg-white hover:bg-gray-50 focus:bg-white`}
                        />
                        <button 
                            onClick={() => setIsVisualSearchOpen(true)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 group-hover:text-[#8b949e] hover:text-[#c9d1d9] text-[#8b949e]`}
                            title="Поиск по фото"
                        >
                            <Camera size={16} />
                        </button>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Предложения</div>
                                {suggestions.map((product, index) => {
                                    const matchingTags = product.tags.filter((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
                                    return (
                                    <button
                                        key={`${product.id}-${index}`}
                                        onClick={() => handleSuggestionClick(product)}
                                        className="w-full text-left px-4 py-2 hover:bg-emerald-50/50 flex items-center gap-4 transition-all duration-200 group/item"
                                    >
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate group-hover/item:text-emerald-700 transition-colors">
                                                <HighlightText text={product.name} highlight={searchQuery} />
                                            </p>
                                            {matchingTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {matchingTags.slice(0, 2).map((tag: string, i: number) => (
                                                        <span key={i} className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded blur-0 truncate max-w-[100px]">
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
                
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => {
                          setIsNotificationsOpen(!isNotificationsOpen);
                          if (setNotificationsCount && notificationsCount > 0) {
                              setNotificationsCount(0); // clear on open
                          }
                      }}
                      className={`relative p-2 rounded-full transition-colors ${
                          scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-slate-900 hover:bg-white/50 border border-slate-200/50 backdrop-blur-sm'
                      }`}
                      title="Уведомления"
                    >
                      <Bell className="w-5 h-5" />
                      {notificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1f6feb] opacity-75"></span>
                            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-[#58a6ff] text-[9px] font-bold text-[#0d1117] shadow-sm">
                              {notificationsCount}
                            </span>
                          </span>
                      )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="absolute right-0 top-full mt-4 w-[340px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-5 py-4 flex justify-between items-center">
                                <h3 className="text-[15px] font-semibold text-slate-800 tracking-tight">Уведомления</h3>
                                <div className="text-[11px] font-medium text-emerald-600 cursor-pointer hover:text-emerald-800 transition-colors">Отметить все как прочитанные</div>
                            </div>
                            <div className="flex flex-col">
                                <div className="px-5 py-3 border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                        <CheckCircle className="text-emerald-600 w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-semibold text-slate-800 mb-0.5">Заказ доставлен</div>
                                        <div className="text-[12px] text-slate-500 leading-snug">Курьер успешно доставил заказ №1042 получателю.</div>
                                        <div className="text-[11px] text-slate-400 mt-1 font-medium">10 минут назад</div>
                                    </div>
                                </div>
                                <div className="px-5 py-3 border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                        <Gift className="text-blue-600 w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-semibold text-slate-800 mb-0.5">Новый промокод</div>
                                        <div className="text-[12px] text-slate-500 leading-snug">Дарим скидку 15% на следующую покупку по промокоду SUMMER.</div>
                                        <div className="text-[11px] text-slate-400 mt-1 font-medium">1 час назад</div>
                                    </div>
                                </div>
                                <div className="px-5 py-3 border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                        <Package className="text-amber-600 w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-semibold text-slate-800 mb-0.5">Сборка начата</div>
                                        <div className="text-[12px] text-slate-500 leading-snug">Ваш заказ №1043 взят в работу флористом.</div>
                                        <div className="text-[11px] text-slate-400 mt-1 font-medium">2 часа назад</div>
                                    </div>
                                </div>
                            </div>
                            <div 
                               onClick={() => setIsNotificationsOpen(false)}
                               className="px-5 py-3 border-t border-slate-100 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <span className="text-[13px] font-medium text-slate-500">Смотреть все</span>
                            </div>
                        </div>
                    )}
                </div>

                {location.pathname !== '/checkout' && (
                    <button 
                        onClick={() => setIsCartOpen(true)} 
                        className={`relative flex items-center gap-2 md:px-4 md:py-2 p-2 rounded-xl transition-all duration-300 ${
                            scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard 
                            ? 'bg-gray-100 border border-gray-200 text-slate-800 hover:bg-gray-200' 
                            : 'md:bg-white/50 bg-transparent text-slate-900 md:hover:bg-white md:hover:text-emerald-800 backdrop-blur-md shadow-sm border border-slate-200/50'
                        } ${isCartAnimating ? 'scale-110 md:-translate-y-1' : 'scale-100'}`}
                    >
                    <ShoppingBag className={`w-4 h-4 transition-transform duration-300 ${isCartAnimating ? 'scale-125 text-[#3fb950]' : ''}`} />
                    <span className="hidden md:inline font-medium text-[13px]">Корзина</span>
                    {cartCount > 0 && (
                        <span className={`absolute -top-2 -right-2 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full transition-all duration-500 shadow-sm ${isCartAnimating ? 'scale-125 bg-emerald-500 shadow-emerald-500/50 shadow-lg' : 'scale-100 bg-rose-500'}`}>
                        {cartCount}
                        </span>
                    )}
                    </button>
                )}

                <div className="relative group hidden md:block">
                    <button 
                        onClick={handleProfileClick} 
                        className={`p-0 rounded-full overflow-hidden transition-colors border ${
                            scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard 
                            ? 'border-[#30363d] hover:border-[#8b949e]' 
                            : 'border-white/20 hover:border-white'
                        }`}
                    >
                    {user ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#21262d]">
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`p-1.5 ${scrolled || (location.pathname !== '/' && !isBlogPost && !isAboutPage) || isDashboard ? 'text-[#8b949e]' : 'text-white'}`}>
                            <UserIcon size={18} />
                        </div>
                    )}
                    </button>
                    
                    {/* Desktop Profile Dropdown */}
                    {user && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#161b22] rounded-md shadow-xl border border-[#30363d] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="p-4 border-b border-[#30363d]">
                                <p className="text-sm font-semibold text-[#e6edf3] truncate">{user.name}</p>
                                <p className="text-xs text-[#8b949e] truncate">{user.email}</p>
                            </div>
                            <div className="p-2">
                                <button onClick={handleProfileClick} className="w-full text-left px-3 py-1.5 text-[13px] text-[#c9d1d9] hover:bg-[#1f6feb] hover:text-white rounded-md transition-colors flex items-center gap-2">
                                    <UserIcon size={14} /> Личный кабинет
                                </button>
                                <button onClick={handleLogout} className="w-full text-left px-3 py-1.5 text-[13px] text-[#ff7b72] hover:bg-[#da3633] hover:text-white rounded-md transition-colors flex items-center gap-2 mt-1">
                                    <LogOut size={14} /> Выйти
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
                        className="md:hidden absolute top-full left-0 right-0 h-screen bg-[#0d1117]/50 backdrop-blur-sm z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#0d1117] border-t border-[#30363d] shadow-xl animate-in slide-in-from-top-2 z-50 rounded-b-lg">
                        <div className="flex flex-col p-4 space-y-4">
                        <div className="relative group">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
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
                                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-all text-[#e6edf3] placeholder-[#8b949e]"
                            />
                            <button 
                                onClick={() => { setIsMobileMenuOpen(false); setIsVisualSearchOpen(true); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#c9d1d9]"
                                title="Поиск по фото"
                            >
                                <Camera size={18} />
                            </button>
                            
                            {/* Mobile Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] rounded-md shadow-lg border border-[#30363d] overflow-hidden py-2 z-50">
                                    {suggestions.map((product, index) => {
                                        const matchingTags = product.tags.filter((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
                                        return (
                                        <button
                                            key={`mobile-${product.id}-${index}`}
                                            onClick={() => {
                                                handleSuggestionClick(product);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-[#30363d]/50 flex items-center gap-3 transition-colors border-b border-[#30363d] last:border-0"
                                        >
                                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0 border border-[#30363d]" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-medium text-[#e6edf3] truncate">
                                                    <HighlightText text={product.name} highlight={searchQuery} />
                                                </p>
                                                <p className="text-[12px] text-[#3fb950] font-medium mt-0.5">{product.price.toLocaleString()} ₽</p>
                                            </div>
                                        </button>
                                    )})}
                                </div>
                            )}
                        </div>
                        <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-[#30363d] text-[#c9d1d9] hover:text-white hover:bg-[#161b22] px-2 rounded-md flex items-center gap-2"><Menu className="w-5 h-5"/> Каталог</Link>
                        <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-[#30363d] text-[#c9d1d9] hover:text-white hover:bg-[#161b22] px-2 rounded-md">Блог</Link>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-[#30363d] text-[#c9d1d9] hover:text-white hover:bg-[#161b22] px-2 rounded-md">О нас</Link>
                        <Link to="/partners" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-[#30363d] text-[#c9d1d9] hover:text-white hover:bg-[#161b22] px-2 rounded-md">Партнерам</Link>
                        <Link to="/club" onClick={() => setIsMobileMenuOpen(false)} className="text-left font-medium py-3 border-b border-[#30363d] text-[#c9d1d9] hover:text-white hover:bg-[#161b22] px-2 rounded-md text-emerald-400">Floramos Club</Link>
                         <button onClick={() => { handleProfileClick(); setIsMobileMenuOpen(false); }} className="text-left font-medium py-3 border-b border-[#30363d] text-[#c9d1d9] hover:text-white hover:bg-[#161b22] px-2 rounded-md flex items-center gap-3">
                            <UserIcon size={18} /> {user ? "Личный кабинет" : "Войти"}
                        </button>
                        {user && (
                            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-left font-medium py-3 text-[#ff7b72] hover:text-white hover:bg-[#da3633]/20 px-2 rounded-md flex items-center gap-3">
                                <LogOut size={18} /> Выйти
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryQuery = params.get('category');
    if (categoryQuery) {
        let mappedCat = 'Все';
        let searchQueryToSet = '';
        
        switch (categoryQuery) {
            case 'author': mappedCat = 'Авторские букеты'; break;
            case 'mono': mappedCat = 'Авторские букеты'; searchQueryToSet = 'моно'; break;
            case 'box': mappedCat = 'Авторские букеты'; searchQueryToSet = 'коробк'; break;
            case 'premium': mappedCat = 'Авторские букеты'; searchQueryToSet = 'премиум'; break;
            case 'basket': mappedCat = 'Авторские букеты'; searchQueryToSet = 'корзин'; break;
            case 'wedding': mappedCat = 'Свадебная коллекция'; break;
            case 'bride':
            case 'wedding_bouquet': mappedCat = 'Свадебная коллекция'; searchQueryToSet = 'невест'; break;
            case 'boutonniere': mappedCat = 'Свадебная коллекция'; searchQueryToSet = 'бутоньер'; break;
            case 'wedding_decor': mappedCat = 'Свадебная коллекция'; searchQueryToSet = 'декор'; break;
            case 'petals': mappedCat = 'Свадебная коллекция'; searchQueryToSet = 'лепест'; break;
            case 'plants': mappedCat = 'Комнатные растения'; break;
            case 'foliage': mappedCat = 'Комнатные растения'; searchQueryToSet = 'лист'; break;
            case 'succulents': mappedCat = 'Комнатные растения'; searchQueryToSet = 'суккулент'; break;
            case 'large': mappedCat = 'Комнатные растения'; searchQueryToSet = 'больш'; break;
            case 'blooming': mappedCat = 'Комнатные растения'; searchQueryToSet = 'цветущ'; break;
            case 'dried': mappedCat = 'Сухоцветы и декор'; break;
            case 'dried_bouquets': mappedCat = 'Сухоцветы и декор'; searchQueryToSet = 'букет'; break;
            case 'lavender': mappedCat = 'Сухоцветы и декор'; searchQueryToSet = 'лаванд'; break;
            case 'home_decor': mappedCat = 'Сухоцветы и декор'; searchQueryToSet = 'декор'; break;
            case 'pampas': mappedCat = 'Сухоцветы и декор'; searchQueryToSet = 'пампас'; break;
            case 'gifts': mappedCat = 'Подарки и вазы'; break;
            case 'sweets': mappedCat = 'Подарки и вазы'; searchQueryToSet = 'набор'; break;
            case 'toys': mappedCat = 'Подарки и вазы'; searchQueryToSet = 'игрушк'; break;
            case 'cards': mappedCat = 'Подарки и вазы'; searchQueryToSet = 'открытк'; break;
            case 'vases': mappedCat = 'Подарки и вазы'; searchQueryToSet = 'ваз'; break;
            case 'roses': mappedCat = 'Все'; searchQueryToSet = 'роз'; break;
            case 'tulips': mappedCat = 'Все'; searchQueryToSet = 'тюльпан'; break;
            case 'peonies': mappedCat = 'Все'; searchQueryToSet = 'пион'; break;
            case 'orchids': mappedCat = 'Все'; searchQueryToSet = 'орхид'; break;
            case 'lilies': mappedCat = 'Все'; searchQueryToSet = 'лили'; break;
            default: mappedCat = 'Все'; break;
        }
        
        setActiveCategory(mappedCat);
        if (searchQueryToSet) {
             // In a real app we'd need setSearchQuery scope here. 
             // But AppContent doesn't have it locally, wait, yes it does!
             setSearchQuery(searchQueryToSet);
        }
    }
  }, [location.search]);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isGiftWizardOpen, setIsGiftWizardOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'default' | 'mlm' | 'seller'>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);
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

  const handleLogin = async (provider: string, customUser?: User) => {
      try {
          await login(provider, customUser);
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
        setAuthMode('default');
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
    handleLogout,
    notificationsCount,
    setNotificationsCount
  };

  return (
    <>
      <Helmet defaultTitle="Floramos | Маркетплейс цветов, сделанный с душой" titleTemplate="%s | Floramos">
        <meta name="description" content="Floramos — цветочный маркетплейс от людей и для людей. Мы собрали лучших трудяг-флористов и искренне стараемся, чтобы вы получали красивые букеты." />
        <meta property="og:title" content="Floramos | Честный цветочный маркетплейс" />
        <meta property="og:description" content="Floramos — цветочный маркетплейс от людей и для людей. Мы собрали лучших флористов и искренне стараемся, чтобы вы получали красивые букеты." />
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
                <SellerLanding onJoin={() => { setAuthMode('seller'); setIsAuthOpen(true); }} />
            </Layout>
        } />
        
        <Route path="/partners" element={
            <Layout fullWidth {...layoutProps}>
                <PartnersPage onJoin={() => { setAuthMode('seller'); setIsAuthOpen(true); }} />
            </Layout>
        } />
        
        <Route path="/club" element={
            <Layout fullWidth {...layoutProps}>
                <MlmPage onJoin={() => { setAuthMode('mlm'); setIsAuthOpen(true); }} />
            </Layout>
        } />
        
        <Route path="/club/analytics" element={
            <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                <Layout fullWidth {...layoutProps}>
                    <PartnerAnalytics />
                </Layout>
            </ProtectedRoute>
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
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col gap-4 items-end">
        {!isAiOpen && (location.pathname === '/mlm' || location.pathname === '/partners') && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 2, duration: 0.5, type: 'spring' }}
            className="bg-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-900/10 border border-emerald-100 flex items-start gap-3 max-w-[240px] origin-bottom-right mb-2"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
               <span className="text-lg">🌿</span>
            </div>
            <div>
               <p className="text-sm font-medium text-slate-800 leading-tight mb-1">Могу помочь вам?</p>
               <p className="text-xs text-slate-500 leading-snug">Если есть вопросы — спросите, я отвечу вам быстро!</p>
            </div>
            <button className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm" onClick={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}>
               <X size={12} />
            </button>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-emerald-100 transform rotate-45 shadow-[2px_2px_4px_rgba(0,0,0,0.02)]"></div>
          </motion.div>
        )}
        <button 
          onClick={() => setIsAiOpen(!isAiOpen)} 
          className="relative group flex items-center justify-center p-0 w-16 h-16 md:w-20 md:h-20 bg-transparent border-none outline-none focus:outline-none appearance-none" 
          style={{ WebkitTapHighlightColor: 'transparent' }}
          title="Спросить Flora"
        >
          <div className="relative w-full h-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
             <FloraIcon className="w-full h-full" />
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
      <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          authMode={authMode} 
          onLogin={(u) => handleLogin(u.role === 'admin' ? 'Admin' : u.role === 'seller' ? 'Partner' : u.id.startsWith('ref-') ? 'Referral' : 'Google', u)} 
      />
      
      {isCheckoutSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative">
              <button onClick={() => setIsCheckoutSuccess(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"><CheckCircle size={32} /></div>
              <h3 className="font-serif text-2xl text-emerald-900 mb-2">Заказ оформлен!</h3>
              <p className="text-gray-500 mb-6">Спасибо за выбор Floramos. Менеджер свяжется с вами в течение 10 минут для подтверждения.</p>
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
