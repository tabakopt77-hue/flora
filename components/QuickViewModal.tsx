import React from 'react';
import { X, Star, ArrowRight, Check } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onGoToDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onGoToDetails
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 h-64 md:h-auto relative">
           <img 
             src={product.image} 
             alt={product.name} 
             className="w-full h-full object-cover"
           />
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
           <div className="mb-auto">
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">{product.category}</span>
               {product.rating && (
                 <div className="flex items-center text-yellow-400 text-xs gap-1">
                   <Star size={12} fill="currentColor" />
                   <span className="text-gray-400 font-medium">{product.rating}</span>
                 </div>
               )}
             </div>
             
             <h2 className="font-serif text-3xl text-gray-900 mb-2">{product.name}</h2>
             <p className="text-2xl font-medium text-emerald-900 mb-6">{product.price.toFixed(2)} ₽</p>
             
             <div className="prose prose-sm text-gray-500 mb-6 leading-relaxed">
               <p>{product.description}</p>
             </div>

             <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-emerald-500" />
                  <span>В наличии, готов к отправке</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-emerald-500" />
                  <span>Бесплатная открытка</span>
                </div>
             </div>
           </div>

           <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
             <Button 
               size="lg" 
               className="w-full justify-center"
               onClick={() => { onAddToCart(product); onClose(); }}
             >
               Добавить в корзину
             </Button>
             <Button 
               variant="ghost" 
               className="w-full justify-center"
               onClick={() => { onGoToDetails(product); onClose(); }}
             >
               Подробнее о товаре <ArrowRight size={16} className="ml-2" />
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};