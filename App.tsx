import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, Sparkles, X, Heart, Instagram, Facebook, Twitter, Camera, User, LayoutDashboard, Wand2 } from 'lucide-react';
import { PRODUCTS, HERO_IMAGE, BLOG_POSTS } from './constants';
import { Product, Category, CartItem, ViewState } from './types';
import { ProductCard } from './components/ProductCard';
import { Button } from './components/Button';
import { AIFlorist } from './components/AIFlorist';
import { VisualSearch } from './components/VisualSearch';
import { SellerDashboard } from './components/SellerDashboard';
import { ProductDetails } from './components/ProductDetails';
import { generateGiftMessage } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cart Logic
  const [giftTone, setGiftTone] = useState('romantic');
  const [isGeneratingGift, setIsGeneratingGift] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('PRODUCT_DETAILS');
    window.scrollTo(0, 0);
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

  const generateMessageForItem = async (itemId: string, productName: string) => {
    setIsGeneratingGift(true);
    const msg = await generateGiftMessage('Особый случай', 'Близкий человек', giftTone);
    updateCartItem(itemId, { giftMessage: msg });
    setIsGeneratingGift(false);
  };

  // Filter products
  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'Все' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Views ---

  const renderHome = () => (
    <>
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 md:px-8 bg-emerald-900 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 opacity-60">
           <img src={HERO_IMAGE} alt="Flowers" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-900/60 to-transparent"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl text-white animate-in slide-in-from-left duration-700">
            <span className="inline-block py-1 px-3 border border-emerald-400/30 rounded-full text-emerald-100 text-xs font-medium tracking-widest uppercase mb-6 backdrop-blur-md">
              Коллекция Весна 2024
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-medium leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-200">
              Природа как <br/>
              <span className="italic font-light">искусство.</span>
            </h1>
            <p className="text-emerald-100/90 text-lg mb-8 font-light leading-relaxed">
              Bloom & Wisp — это диалог с природой. Экологичные букеты, доставка день в день и персональный подбор композиций с помощью искусственного интеллекта.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-xl border-none" onClick={() => setView('SHOP')}>
                Перейти в каталог
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 backdrop-blur-sm" onClick={() => setIsAiOpen(true)}>
                <Sparkles size={18} className="mr-2" />
                Спросить Flora
              </Button>
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
            {PRODUCTS.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={() => handleProductClick(product)} />
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

  const renderShop = () => (
    <div className="container mx-auto px-4 md:px-8 py-32 min-h-screen">
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
                ${activeCategory === cat ? 'bg-emerald-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={() => handleProductClick(product)} />
        ))}
      </div>
    </div>
  );

  const renderJournal = () => (
    <div className="container mx-auto px-4 md:px-8 py-32 min-h-screen">
      <div className="text-center mb-16">
        <h2 className="font-serif text-4xl text-emerald-900 mb-4">Блог о цветах</h2>
        <p className="text-gray-500">Вдохновение, советы по уходу и истории из мира флористики.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map(post => (
          <article key={post.id} className="group cursor-pointer">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl mb-4 bg-gray-100">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex items-center gap-4 text-xs text-emerald-600 font-medium mb-2 uppercase tracking-wide">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime} чтения</span>
            </div>
            <h3 className="font-serif text-2xl text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors">{post.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <span className="text-emerald-800 font-medium text-sm border-b border-emerald-800 pb-0.5">Читать далее</span>
          </article>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-white selection:bg-emerald-100">
      
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled || view !== 'HOME' ? 'bg-white/90 backdrop-blur-xl shadow-sm py-3 border-b border-gray-100' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden">
              <Menu className="hover:text-emerald-800" />
            </button>
            <a href="#" onClick={() => setView('HOME')} className={`font-serif text-2xl font-bold tracking-tight ${scrolled || view !== 'HOME' ? 'text-emerald-900' : 'text-white md:text-emerald-900'}`}>
              Bloom & Wisp
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <button onClick={() => setView('SHOP')} className={`hover:text-emerald-800 transition-colors ${view === 'SHOP' ? 'text-emerald-800' : ''}`}>Каталог</button>
            <button onClick={() => setView('JOURNAL')} className={`hover:text-emerald-800 transition-colors ${view === 'JOURNAL' ? 'text-emerald-800' : ''}`}>Блог</button>
            <button onClick={() => setView('HOME')} className="hover:text-emerald-800 transition-colors">О нас</button>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden md:block group">
              <Search className="text-gray-400 w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-700" />
              <input 
                type="text" 
                placeholder="Найти букет..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => view !== 'SHOP' && setView('SHOP')}
                className="bg-gray-100/50 border border-transparent rounded-full pl-9 pr-10 py-2 text-sm focus:outline-none focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50/50 w-40 focus:w-64 transition-all"
              />
              <button 
                onClick={() => setIsVisualSearchOpen(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                title="Поиск по фото"
              >
                <Camera size={16} />
              </button>
            </div>
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-emerald-50 rounded-full transition-colors text-emerald-900">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

             <button onClick={() => setView('PROFILE')} className="hidden md:block p-2 hover:bg-emerald-50 rounded-full transition-colors text-emerald-900">
              <User size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Router */}
      <main className="flex-1">
        {view === 'HOME' && renderHome()}
        {view === 'SHOP' && renderShop()}
        {view === 'JOURNAL' && renderJournal()}
        {view === 'SELLER' && <div className="py-32 px-4 container mx-auto"><SellerDashboard /></div>}
        {view === 'PRODUCT_DETAILS' && selectedProduct && (
          <div className="container mx-auto px-4 md:px-8 py-32">
             <ProductDetails 
                product={selectedProduct} 
                onBack={() => setView('SHOP')}
                onAddToCart={handleAddToCart}
                onProductSelect={handleProductClick}
             />
          </div>
        )}
        {view === 'PROFILE' && (
           <div className="container mx-auto px-4 py-32 max-w-2xl text-center">
             <User size={64} className="mx-auto text-emerald-200 mb-6" />
             <h2 className="font-serif text-3xl text-emerald-900 mb-2">Личный кабинет</h2>
             <p className="text-gray-500 mb-8">История заказов и персональные настройки.</p>
             <div className="bg-sage-50 p-8 rounded-2xl border border-sage-100">
               <p>Войдите, чтобы Flora могла подбирать букеты специально для ваших близких.</p>
               <Button className="mt-4">Войти / Регистрация</Button>
             </div>
           </div>
        )}
      </main>

      {/* Footer */}
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
               <button onClick={() => setView('SELLER')} className="hover:text-white flex items-center gap-1">
                 <LayoutDashboard size={14} /> Вход для партнеров
               </button>
               <a href="#" className="hover:text-white">Политика конфиденциальности</a>
               <a href="#" className="hover:text-white">Оферта</a>
            </div>
          </div>
        </div>
      </footer>

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
                          <button onClick={() => updateCartItem(item.id, {quantity: 0})} className="text-gray-300 hover:text-rose-500"><X size={16} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{item.price.toFixed(2)} ₽</p>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                             <button onClick={() => updateCartItem(item.id, { quantity: Math.max(0, item.quantity - 1) })} className="px-2 text-gray-400 hover:text-emerald-800">-</button>
                             <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })} className="px-2 text-gray-400 hover:text-emerald-800">+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Gift Message Feature */}
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
                            <button onClick={() => updateCartItem(item.id, { giftMessage: '' })} className="text-[10px] text-gray-400 underline mt-1">Удалить текст</button>
                         </div>
                       ) : (
                         <div>
                            <p className="text-xs text-gray-500 mb-3">Не знаете, что написать? Flora поможет подобрать слова.</p>
                            <div className="flex gap-2 mb-2">
                               {['Романтика', 'Дружбе', 'Официально'].map(t => (
                                 <button 
                                  key={t}
                                  onClick={() => setGiftTone(t.toLowerCase())}
                                  className={`text-[10px] px-2 py-1 rounded-full border ${giftTone === t.toLowerCase() ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'border-gray-200 text-gray-500'}`}
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
                
                {/* Simulated Delivery Date Picker */}
                <div className="mb-6">
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Дата доставки</label>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {[0, 1, 2, 3, 4].map(d => {
                        const date = new Date();
                        date.setDate(date.getDate() + d);
                        return (
                          <button key={d} className="flex-shrink-0 w-16 h-16 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center hover:border-emerald-500 focus:border-emerald-500 focus:bg-emerald-50 transition-colors">
                             <span className="text-xs text-gray-400">{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
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
                <p className="text-xs text-gray-500 mb-6 text-center">Стоимость доставки будет рассчитана на следующем шаге.</p>
                <Button className="w-full py-4 text-lg shadow-xl shadow-emerald-100">Перейти к оформлению</Button>
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
      <AIFlorist isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <VisualSearch isOpen={isVisualSearchOpen} onClose={() => setIsVisualSearchOpen(false)} onSearch={(term) => { setSearchQuery(term); setView('SHOP'); }} />

    </div>
  );
};

export default App;