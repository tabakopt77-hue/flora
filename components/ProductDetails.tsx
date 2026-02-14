import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Truck, ShieldCheck, Heart, Sparkles, Plus, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, UserPreferences } from '../types';
import { Button } from './Button';
import { PRODUCTS } from '../constants';
import { getProductRecommendations } from '../services/geminiService';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onProductSelect?: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart, onProductSelect }) => {
  // Store products with their specific AI reason
  const [aiRecommendations, setAiRecommendations] = useState<(Product & { reason: string })[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [errorRecs, setErrorRecs] = useState(false);
  const [isCareExpanded, setIsCareExpanded] = useState(false);
  
  // Standard recommendations (category based) without reasons
  const recommendations = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  useEffect(() => {
    const fetchAiRecs = async () => {
      setLoadingRecs(true);
      setErrorRecs(false);
      
      // Simulated User Context with richer data (Translated)
      const userProfile: UserPreferences = {
        pastPurchases: ["Коробка Бархатных Роз", "Керамическая Ваза Artisan"],
        favoriteColors: ["Шалфейный зеленый", "Нежно-розовый", "Кремовый"],
        preferredStyle: ["Бохо", "Органика", "Эко"],
        recentOccasions: ["День матери", "Для себя"]
      };
      
      try {
        const aiResults = await getProductRecommendations(product, PRODUCTS, userProfile);
        
        if (aiResults && aiResults.length > 0) {
          // Merge the AI result (id + reason) with the full product data
          const recs = aiResults.map(res => {
              const p = PRODUCTS.find(prod => prod.id === res.id);
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
  }, [product]);

  // Determine which items to display in the AI section (AI results or Fallback)
  const hasAiRecs = aiRecommendations.length > 0;
  const displayRecs: (Product & { reason?: string })[] = hasAiRecs ? aiRecommendations : recommendations.slice(0, 2);

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-emerald-800 mb-6 transition-colors">
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
            <button className="p-3 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
              <Heart size={24} />
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
             
             <div className="flex items-center gap-2 mb-4 text-emerald-900 relative z-10">
               {errorRecs ? (
                  <AlertCircle size={20} className="text-rose-400" />
               ) : (
                  <Sparkles size={20} className="text-emerald-500 animate-pulse" />
               )}
               <h3 className="font-serif font-semibold text-lg">Выбор Flora для вас</h3>
             </div>
             
             <p className="text-sm text-gray-500 mb-4 relative z-10">
               {loadingRecs ? (
                 <span className="italic">Ищу идеальные сочетания...</span>
               ) : hasAiRecs ? (
                 <>Подобрано на основе вашего вкуса к <strong>экологичной</strong> и <strong>теплой</strong> эстетике.</>
               ) : errorRecs ? (
                 <span className="italic text-gray-500">Flora сейчас отдыхает. Вот популярные товары из этой категории:</span>
               ) : (
                 <span className="italic">Flora обновляет каталог. А пока, взгляните на эти бестселлеры:</span>
               )}
             </p>

             {loadingRecs ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-emerald-50">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                         <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
                         <div className="h-8 bg-emerald-50/50 rounded-lg w-full animate-pulse opacity-50" />
                         <div className="mt-auto flex items-center justify-between">
                             <div className="h-3 bg-gray-100 rounded w-10 animate-pulse" />
                             <div className="h-6 bg-gray-100 rounded-full w-14 animate-pulse" />
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                 {displayRecs.length > 0 ? displayRecs.map(rec => (
                   <div key={rec.id} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer group"
                        onClick={() => onProductSelect && onProductSelect(rec)}>
                      <img src={rec.image} alt={rec.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                         <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-emerald-800 transition-colors">{rec.name}</h4>
                         {rec.reason && (
                           <div className="mt-2 flex flex-col gap-1 bg-emerald-50/50 rounded-lg p-2 border border-emerald-100/50">
                             <div className="flex items-center gap-1">
                               <Sparkles size={10} className="text-emerald-600" />
                               <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Совет Flora</span>
                             </div>
                             <p className="text-[10px] text-emerald-800 leading-snug">
                               {rec.reason}
                             </p>
                           </div>
                         )}
                         <div className="mt-auto flex items-center justify-between pt-2">
                             <p className="text-gray-500 text-xs font-medium">{rec.price.toFixed(2)} ₽</p>
                             <button 
                               onClick={(e) => { e.stopPropagation(); onAddToCart(rec); }}
                               className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1"
                             >
                               <Plus size={10} /> В корзину
                             </button>
                         </div>
                      </div>
                   </div>
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
              <div key={p.id} className="group cursor-pointer" onClick={() => onProductSelect && onProductSelect(p)}>
                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="font-serif font-medium">{p.name}</h4>
                <p className="text-gray-500">{p.price.toFixed(2)} ₽</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};