import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Filter, X, Star, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';

interface ShopProps {
    allProducts: Product[];
    onAddToCart: (product: Product) => void;
    onQuickView: (product: Product) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    wishlist: string[];
    onToggleWishlist: (product: Product) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
}

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'rating_desc';

export const Shop: React.FC<ShopProps> = ({ allProducts, onAddToCart, onQuickView, activeCategory, setActiveCategory, searchQuery, setSearchQuery, wishlist, onToggleWishlist, showFilters, setShowFilters }) => {
    const categories = ['Все', ...Object.values(Category)];
    
    // Filter & Sort State
    const [priceRange, setPriceRange] = useState<{min: string, max: string}>({ min: '', max: '' });
    const [minRating, setMinRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<SortOption>('popular');

    const filteredAndSorted = useMemo(() => {
        // 1. Filter
        let result = allProducts.filter((p: Product) => {
            const matchesCategory = activeCategory === 'Все' || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const price = p.price;
            const min = priceRange.min ? parseInt(priceRange.min) : 0;
            const max = priceRange.max ? parseInt(priceRange.max) : Infinity;
            const matchesPrice = price >= min && price <= max;

            const rating = p.rating || 0;
            const matchesRating = minRating === 0 || rating >= minRating;

            return matchesCategory && matchesSearch && p.isActive && matchesPrice && matchesRating;
        });

        // 2. Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'rating_desc':
                    return (b.rating || 0) - (a.rating || 0);
                case 'popular':
                default:
                    return (b.reviews || 0) - (a.reviews || 0);
            }
        });

        return result;
    }, [allProducts, activeCategory, searchQuery, priceRange, minRating, sortBy]);

    const clearFilters = () => {
        setPriceRange({ min: '', max: '' });
        setMinRating(0);
        setActiveCategory('Все');
        setSearchQuery('');
        setSortBy('popular');
    };

    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 pt-24 md:pt-32 pb-10 md:pb-20 -mt-16">
        <div className="container mx-auto px-4 md:px-8">
          <Helmet><title>Каталог</title></Helmet>
          
          {/* Header & Categories */}
          <div className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
                  <h2 className="font-serif text-4xl text-emerald-900">Каталог</h2>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex gap-2 overflow-x-auto flex-1 md:flex-none pb-2 md:pb-0 no-scrollbar mask-gradient">
                          {categories.map(cat => (
                              <button 
                                  key={cat} 
                                  onClick={() => setActiveCategory(cat as string)}
                                  className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors text-xs font-medium ${activeCategory === cat ? 'bg-emerald-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'}`}
                              >
                                  {cat}
                              </button>
                          ))}
                      </div>
                      
                      <button 
                          onClick={() => setShowFilters(!showFilters)}
                          className={`p-2 rounded-full border transition-colors flex items-center gap-2 ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-200'}`}
                          title="Фильтры и сортировка"
                      >
                          <Filter size={20} />
                          <span className="text-sm font-medium hidden sm:inline">Фильтры</span>
                      </button>
                  </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                  <div className="fixed inset-0 z-50 md:relative md:inset-auto md:z-auto flex items-end md:items-stretch">
                      <div className="absolute inset-0 bg-black/30 md:hidden" onClick={() => setShowFilters(false)} />
                      <div className="relative w-full bg-white md:bg-white p-6 rounded-t-3xl md:rounded-2xl border-t md:border border-stone-100 shadow-2xl md:shadow-xl animate-in slide-in-from-bottom-2 md:slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto md:max-h-none">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-serif text-xl text-emerald-900">Настройки каталога</h3>
                              <button onClick={() => setShowFilters(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                                  <X size={20} />
                              </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              {/* Sort Options */}
                              <div>
                                  <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                                      <ArrowUpDown size={16} className="text-stone-400" />
                                      Сортировка
                                  </label>
                                  <select 
                                      value={sortBy}
                                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                                  >
                                      <option value="popular">Сначала популярные</option>
                                      <option value="price_asc">Сначала дешевые</option>
                                      <option value="price_desc">Сначала дорогие</option>
                                      <option value="rating_desc">С высоким рейтингом</option>
                                  </select>
                              </div>

                              {/* Price Filter */}
                              <div>
                                  <label className="block text-sm font-medium text-stone-600 mb-2">Цена, ₽</label>
                                  <div className="flex items-center gap-2">
                                      <input 
                                          type="number" 
                                          placeholder="От" 
                                          value={priceRange.min}
                                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                                      />
                                      <span className="text-stone-400">-</span>
                                      <input 
                                          type="number" 
                                          placeholder="До" 
                                          value={priceRange.max}
                                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                                      />
                                  </div>
                              </div>

                              {/* Rating Filter */}
                              <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-stone-600 mb-2">Минимальный рейтинг</label>
                                  <div className="flex flex-wrap items-center gap-2">
                                      {[4, 3, 2].map(rating => (
                                          <button
                                              key={rating}
                                              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${minRating === rating ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                                          >
                                              <Star size={14} className={minRating === rating ? "fill-yellow-400 text-yellow-400" : "text-stone-300"} />
                                              <span>от {rating}</span>
                                          </button>
                                      ))}
                                      <button
                                          onClick={() => setMinRating(0)}
                                          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${minRating === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                                      >
                                          Любой
                                      </button>
                                      
                                      <div className="ml-auto mt-4 md:mt-0">
                                          <button 
                                              onClick={clearFilters}
                                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                                          >
                                              <RefreshCw size={14} />
                                              Сбросить все
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-8">
             {filteredAndSorted.length > 0 ? filteredAndSorted.map((product: Product, index: number) => (
                <ProductCard 
                  key={`${product.id}-${index}`} 
                  product={product} 
                  onAddToCart={onAddToCart} 
                  onQuickView={onQuickView}
                  isFavorite={wishlist.includes(product.id)}
                  onToggleFavorite={onToggleWishlist}
                />
             )) : (
                <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200 shadow-sm">
                   <p className="text-stone-500 text-lg mb-6">Ничего не найдено по вашему запросу.</p>
                   <button 
                      onClick={clearFilters}
                      className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg font-medium transition-colors"
                   >
                      Сбросить фильтры
                   </button>
                </div>
             )}
          </div>
        </div>
      </div>
    );
};
