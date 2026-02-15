import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Truck, ShieldCheck, Heart, Sparkles, Plus, AlertCircle, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Product, UserPreferences } from '../types';
import { Button } from './Button';
import { getProductRecommendations } from '../services/geminiService';

interface ProductDetailsProps {
  allProducts: Product[];
  onAddToCart: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ allProducts, onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find product based on URL param
  const product = allProducts.find(p => p.id === id);

  const [aiRecommendations, setAiRecommendations] = useState<(Product & { reason: string })[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState(false);
  const [isCareExpanded, setIsCareExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sortOption, setSortOption] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');

  // Handle case where product is not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <Helmet>
          <title>Товар не найден | Bloom & Wisp</title>
        </Helmet>
        <h2 className="text-2xl font-serif mb-4">Товар не найден</h2>
        <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
      </div>
    );
  }

  // Standard recommendations (category based) without reasons
  const recommendations = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  useEffect(() => {
    setIsFavorite(false);
    setSortOption('relevance');
    window.scrollTo(0, 0); // Scroll to top on product change
  }, [product.id]);

  useEffect(() => {
    const fetchAiRecs = async () => {
      setLoadingRecs(true);
      setErrorRecs(false);
      
      const userProfile: UserPreferences = {
        pastPurchases: ["Коробка Бархатных Роз", "Керамическая Ваза Artisan"],
        favoriteColors: ["Шалфейный зеленый", "Нежно-розовый", "Кремовый"],
        preferredStyle: ["Бохо", "Органика", "Эко"],
        recentOccasions: ["День матери", "Для себя"]
      };
      
      try {
        const aiResults = await getProductRecommendations(product, allProducts, userProfile);
        
        if (aiResults && aiResults.length > 0) {
          const recs = aiResults.map(res => {
              const p = allProducts.find(prod => prod.id === res.id);
              return p ? { ...p, reason: res.reason } : null;
          }).filter(Boolean) as (Product & { reason: string })[];
          
          setAiRecommendations(recs);
        } else {
          setAiRecommendations([]);
        }
      } catch (e) {
        console.error("Failed to load AI recs", e);
        setAiRecommendations([]);
        setErrorRecs(true);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchAiRecs();
  }, [product, allProducts]);

  const hasAiRecs = aiRecommendations.length > 0;
  let displayRecs: (Product & { reason?: string })[] = hasAiRecs 
    ? [...aiRecommendations] 
    : [...recommendations.slice(0, 2)];

  if (sortOption === 'price_asc') {
      displayRecs.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price_desc') {
      displayRecs.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <Helmet>
        <title>{product.name} | Купить за {product.price} ₽ | Bloom & Wisp</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <button onClick={() => navigate('/catalog')} className="flex items-center text-gray-700 hover:text-emerald-900 mb-6 transition-colors font-medium">
        <ArrowLeft size={20} className="mr-2" /> Вернуться в каталог
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-lg relative">
             <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
                <img src={product.image} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-600 font-medium text-sm uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">{product.name}</h1>
            </div>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-3 rounded-full transition-colors ${isFavorite ? 'bg-rose-100 text-rose-500' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
            >
              <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} />)}
            </div>
            <span className="text-gray-500 text-sm">{product.reviews} отзывов</span>
          </div>

          <p className="text-2xl font-serif text-gray-900 mb-6">{product.price.toFixed(2)} ₽</p>

          <div className="prose prose-stone text-gray-600 mb-8">
            <p>{product.longDescription || product.description}</p>
          </div>

          <div className="space-y-6 mb-8">
            <Button size="lg" className="w-full py-4 text-lg" onClick={() => onAddToCart(product)}>
              Добавить в корзину
            </Button>
            <p className="text-xs text-center text-gray-500">Бесплатная доставка при заказе от 10 000 ₽</p>
          </div>

          {/* AI Recommendations Section */}
          <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
             
             <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
               <div className="flex items-center gap-2 text-emerald-900">
                 {errorRecs ? (
                    <AlertCircle size={20} className="text-rose-400" />
                 ) : (
                    <Sparkles size={20} className="text-emerald-500 animate-pulse" />
                 )}
                 <h3 className="font-serif font-semibold text-lg">Выбор Flora для вас</h3>
               </div>
               
               {!loadingRecs && !errorRecs && displayRecs.length > 0 && (
                   <div className="flex items-center gap-2 bg-white/60 border border-emerald-100 rounded-full px-3 py-1 hover:bg-white transition-colors">
                     <SlidersHorizontal size={14} className="text-emerald-600" />
                     <select 
                       value={sortOption}
                       onChange={(e) => setSortOption(e.target.value as any)}
                       className="text-xs bg-transparent text-emerald-800 focus:outline-none cursor-pointer appearance-none pr-4"
                       style={{ backgroundImage: 'none' }}
                     >
                       <option value="relevance">По рекомендации</option>
                       <option value="price_asc">Сначала дешевле</option>
                       <option value="price_desc">Сначала дороже</option>
                     </select>
                   </div>
               )}
             </div>
             
             <p className="text-sm text-gray-500 mb-4 relative z-10">
               {loadingRecs ? (
                 <span className="italic">Ищу идеальные сочетания...</span>
               ) : hasAiRecs ? (
                 <>Подобрано на основе вашего вкуса к <strong>экологичной</strong> и <strong>теплой</strong> эстетике.</>
               ) : errorRecs ? (
                 <span className="italic text-rose-500 font-medium">Не удалось подобрать пары. Предлагаем посмотреть похожие товары из категории:</span>
               ) : (
                 <span className="italic">Не нашлось персональных рекомендаций, но взгляните на эти популярные товары из той же категории:</span>
               )}
             </p>

             {loadingRecs ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-emerald-50">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse mb-2" />
                         <div className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100/30 mb-2">
                           <div className="h-2 w-full bg-emerald-100/50 rounded animate-pulse" />
                         </div>
                         <div className="mt-auto flex items-center justify-between pt-1">
                             <div className="h-3 bg-gray-200 rounded w-10 animate-pulse" />
                             <div className="h-7 bg-emerald-50 rounded-full w-24 animate-pulse border border-emerald-100/50" />
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                 {displayRecs.length > 0 ? displayRecs.map(rec => (
                   <Link to={`/product/${rec.id}`} key={rec.id} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer group">
                      <img src={rec.image} alt={rec.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-emerald-800 transition-colors">{rec.name}</h4>
                         {rec.reason && (
                           <div className="mt-2 flex flex-col gap-1 bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                             <div className="flex items-center gap-1.5">
                               <Sparkles size={12} className="text-emerald-600" />
                               <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Совет Flora</span>
                             </div>
                             <p className="text-xs text-emerald-900 leading-snug font-medium">
                               {rec.reason}
                             </p>
                           </div>
                         )}
                         <div className="mt-auto flex items-center justify-between pt-2">
                             <p className="text-gray-500 text-xs font-medium">{rec.price.toFixed(2)} ₽</p>
                             <button 
                               onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(rec); }}
                               className="text-xs font-medium text-white bg-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                             >
                               <Plus size={14} /> В корзину
                             </button>
                         </div>
                      </div>
                   </Link>
                 )) : (
                   <div className="col-span-2 text-center text-sm text-gray-400 italic">
                     Нет подходящих рекомендаций.
                   </div>
                 )}
               </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <Truck className="text-emerald-700 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-sm text-gray-900">Доставка</h4>
                <p className="text-xs text-gray-500">Уже завтра у вас</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-emerald-700 mt-1" size={20} />
              <div>
                <h4 className="font-medium text-sm text-gray-900">Свежесть</h4>
                <p className="text-xs text-gray-500">Гарантия 7 дней</p>
              </div>
            </div>
          </div>

          {product.careInstructions && (
             <div className="bg-sage-50 rounded-xl mt-4 overflow-hidden transition-all duration-300">
               <button 
                 onClick={() => setIsCareExpanded(!isCareExpanded)}
                 className="w-full flex items-center justify-between p-6 text-left hover:bg-sage-100 transition-colors focus:outline-none"
               >
                 <h4 className="font-serif font-medium text-emerald-900">Как ухаживать</h4>
                 {isCareExpanded ? (
                   <ChevronUp size={20} className="text-emerald-800" />
                 ) : (
                   <ChevronDown size={20} className="text-emerald-800" />
                 )}
               </button>
               {isCareExpanded && (
                 <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                   <p className="text-sm text-gray-600 leading-relaxed">{product.careInstructions}</p>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="border-t border-gray-200 pt-16">
          <h3 className="font-serif text-2xl mb-8">Вам также понравится</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommendations.map(p => (
              <div key={p.id} className="group cursor-pointer">
                <Link to={`/product/${p.id}`} className="block">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-4">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h4 className="font-serif font-medium text-gray-900">{p.name}</h4>
                    <p className="text-gray-500">{p.price.toFixed(2)} ₽</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};