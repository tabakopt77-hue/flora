
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Truck, ShieldCheck, Heart, Sparkles, Plus, AlertCircle, ChevronDown, ChevronUp, SlidersHorizontal, Share2, Check, PackageX, Radio } from 'lucide-react';
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
  const [isShared, setIsShared] = useState(false);
  const [sortOption, setSortOption] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');

  // Stock status logic
  const isOutOfStock = product ? product.stock <= 0 : false;
  const isLowStock = product ? product.stock > 0 && product.stock < 5 : false;

  // Calculate recommendations safely
  const recommendations = product 
    ? allProducts.filter(p => p.category === product.category && p.id !== product.id && p.stock > 0).slice(0, 3)
    : [];

  useEffect(() => {
    if (product) {
      setIsFavorite(false);
      setIsShared(false);
      setSortOption('relevance');
      window.scrollTo(0, 0); // Scroll to top on product change
    }
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;

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

  const handleShare = () => {
    if (!product) return;
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  // Handle case where product is not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <Helmet>
          <title>Товар не найден | Aura Flora</title>
        </Helmet>
        <h2 className="text-2xl font-serif mb-4">Товар не найден</h2>
        <Button onClick={() => navigate('/catalog')}>Вернуться в каталог</Button>
      </div>
    );
  }

  const hasAiRecs = aiRecommendations.length > 0;
  
  let displayRecs: (Product & { reason?: string })[] = hasAiRecs 
    ? [...aiRecommendations] 
    : [...recommendations.slice(0, 2)];

  // Sorting Logic
  if (sortOption === 'price_asc') {
      displayRecs.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price_desc') {
      displayRecs.sort((a, b) => b.price - a.price);
  }
  // 'relevance' preserves the order returned by AI or default recommendation order

  // SCHEMA.ORG JSON-LD GENERATION
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Aura Flora"
    },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "RUB",
      "price": product.price,
      "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "5",
      "reviewCount": product.reviews || "1"
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <Helmet>
        <title>{product.name} | Купить за {product.price} ₽ | Aura Flora</title>
        <meta name="description" content={product.description} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <button onClick={() => navigate('/catalog')} className="flex items-center text-gray-700 hover:text-emerald-900 mb-6 transition-colors font-medium">
        <ArrowLeft size={20} className="mr-2" /> Вернуться в каталог
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-lg relative">
             <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-all ${isOutOfStock ? 'grayscale opacity-70' : ''}`} />
             {isOutOfStock && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                     <span className="bg-white/90 text-rose-600 px-6 py-3 rounded-full font-bold text-lg shadow-xl transform -rotate-12 border border-rose-100">
                         Нет в наличии
                     </span>
                 </div>
             )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
                <img src={product.image} alt="Thumbnail" className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
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
            <div className="flex gap-2">
                <button 
                  onClick={handleShare}
                  className={`p-3 rounded-full transition-colors relative group ${isShared ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                  title="Поделиться"
                >
                  {isShared ? <Check size={24} /> : <Share2 size={24} />}
                  {isShared && (
                    <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-emerald-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-20 animate-in fade-in slide-in-from-top-1 pointer-events-none">
                      Ссылка на "{product.name}" скопирована! 🌷
                    </div>
                  )}
                </button>
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-full transition-colors ${isFavorite ? 'bg-rose-100 text-rose-600' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                >
                  <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} />)}
            </div>
            <span className="text-gray-500 text-sm">{product.reviews} отзывов</span>
            {isLowStock && (
                <span className="text-rose-600 text-sm font-medium bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle size={12} /> Осталось всего {product.stock} шт.
                </span>
            )}
            {!isOutOfStock && !isLowStock && (
                <span className="text-emerald-600 text-[10px] font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full animate-pulse">
                    <Radio size={10} className="text-emerald-500" />
                    Live Stock
                </span>
            )}
          </div>

          <p className="text-2xl font-serif text-gray-900 mb-6">{product.price.toFixed(2)} ₽</p>

          <div className="prose prose-stone text-gray-600 mb-8">
            <p>{product.longDescription || product.description}</p>
          </div>

          <div className="space-y-6 mb-8">
            {isOutOfStock ? (
                <div className="w-full py-4 text-lg bg-gray-100 text-gray-400 rounded-full font-medium text-center cursor-not-allowed flex items-center justify-center gap-2">
                    <PackageX size={20} />
                    Товар закончился
                </div>
            ) : (
                <Button size="lg" className="w-full py-4 text-lg" onClick={() => onAddToCart(product)}>
                  Добавить в корзину
                </Button>
            )}
            <p className="text-xs text-center text-gray-500">Бесплатная доставка при заказе от 10 000 ₽</p>
          </div>

          {/* AI Recommendations Section */}
          <div className={`mb-8 p-6 bg-gradient-to-br from-emerald-50 to-white border ${errorRecs ? 'border-rose-100' : 'border-emerald-100'} rounded-2xl relative overflow-hidden transition-colors`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
             
             <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
               <div className="flex items-center gap-2 text-emerald-900">
                 {errorRecs ? (
                    <AlertCircle size={20} className="text-rose-500" />
                 ) : (
                    <Sparkles size={20} className="text-emerald-500 animate-pulse" />
                 )}
                 <h3 className={`font-serif font-semibold text-lg ${errorRecs ? 'text-rose-900' : 'text-emerald-900'}`}>
                   {errorRecs ? 'Рекомендации' : 'Выбор Flora для вас'}
                 </h3>
               </div>
               
               {/* Sort Controls */}
               {!loadingRecs && !errorRecs && displayRecs.length > 0 && (
                   <div className="flex items-center gap-2 bg-white/60 border border-emerald-100 rounded-full px-3 py-1 hover:bg-white transition-colors">
                     <SlidersHorizontal size={14} className="text-emerald-700" />
                     <select 
                       value={sortOption}
                       onChange={(e) => setSortOption(e.target.value as any)}
                       className="text-xs bg-transparent text-emerald-800 focus:outline-none cursor-pointer appearance-none pr-4 font-medium"
                       style={{ backgroundImage: 'none' }}
                     >
                       <option value="relevance">По рекомендации</option>
                       <option value="price_asc">Сначала дешевле</option>
                       <option value="price_desc">Сначала дороже</option>
                     </select>
                   </div>
               )}
             </div>
             
             {/* Robust Inline Error Message */}
             {errorRecs && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4 flex gap-3 items-start relative z-10 animate-in fade-in">
                    <AlertCircle size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-rose-900">Не удалось загрузить рекомендации AI</h4>
                        <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                            Наш ИИ-флорист сейчас отдыхает. Но не переживайте, мы подобрали для вас популярные товары из этой же категории!
                        </p>
                    </div>
                </div>
             )}

             {!errorRecs && (
                <p className="text-sm text-gray-500 mb-4 relative z-10">
                {loadingRecs ? (
                    <span className="italic">Ищу идеальные сочетания...</span>
                ) : hasAiRecs ? (
                    <>Подобрано на основе вашего вкуса к <strong>экологичной</strong> и <strong>теплой</strong> эстетике.</>
                ) : (
                    <span className="italic">Не нашлось персональных рекомендаций, но взгляните на эти популярные товары из той же категории:</span>
                )}
                </p>
             )}

             {loadingRecs ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-emerald-50">
                      {/* Image Skeleton */}
                      <div className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                         {/* Title Skeleton */}
                         <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse mb-2" />
                         
                         {/* Reason Skeleton mimicking the actual 'Flora Tip' box */}
                         <div className="mt-1 bg-emerald-50/30 rounded-lg p-2 border border-emerald-50 mb-2">
                           <div className="h-2 w-20 bg-emerald-100/50 rounded animate-pulse mb-1.5" />
                           <div className="h-2 w-full bg-emerald-100/40 rounded animate-pulse" />
                         </div>

                         {/* Footer: Price and Button Skeleton */}
                         <div className="mt-auto flex items-center justify-between pt-1">
                             <div className="h-3 bg-gray-100 rounded w-12 animate-pulse" />
                             <div className="h-7 bg-emerald-50 rounded-full w-20 animate-pulse" />
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                 {displayRecs.length > 0 ? displayRecs.map(rec => (
                   <Link to={`/product/${rec.id}`} key={rec.id} className={`flex gap-3 bg-white p-3 rounded-xl shadow-sm border ${errorRecs ? 'border-gray-200 hover:border-gray-300' : 'border-emerald-50 hover:border-emerald-200'} transition-colors cursor-pointer group`}>
                      <img src={rec.image} alt={rec.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-emerald-800 transition-colors">{rec.name}</h4>
                         {rec.reason ? (
                           <div className="mt-2 flex flex-col gap-1 bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                             <div className="flex items-center gap-1.5">
                               <Sparkles size={12} className="text-emerald-600" />
                               <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Совет Flora</span>
                             </div>
                             <p className="text-xs text-emerald-900 leading-snug font-medium">
                               {rec.reason}
                             </p>
                           </div>
                         ) : (
                           <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                             {rec.description}
                           </div>
                         )}
                         <div className="mt-auto flex items-center justify-between pt-2">
                             <p className="text-gray-500 text-xs font-medium">{rec.price.toFixed(2)} ₽</p>
                             <button 
                               onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(rec); }}
                               className={`text-xs font-medium text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm ${errorRecs ? 'bg-gray-700 hover:bg-gray-800' : 'bg-emerald-700 hover:bg-emerald-800'}`}
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
    </div>
  );
};
