
import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, ArrowLeftRight, ArrowUpDown, Minus, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onQuickView: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onQuickView, isFavorite, onToggleFavorite }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < product.stock) setQuantity(q => q + 1);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product, quantity);
    setQuantity(1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className={`group relative flex flex-col h-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isOutOfStock ? 'opacity-75 grayscale-[0.2]' : ''}`}>
      {/* Aspect Ratio Container for Image */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        <Link 
            to={`/product/${product.id}`} 
            className="block w-full h-full"
            onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
            }}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`}
            loading="lazy"
          />
        </Link>
        
        {/* Wishlist Button - Minimalist */}
        {onToggleFavorite && (
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(product); }}
                className={`absolute top-2 right-2 p-1.5 md:p-2 rounded-full z-20 transition-all 
                  ${isFavorite ? 'text-rose-500 bg-white/90' : 'text-gray-400 opacity-0 group-hover:opacity-100 bg-white/50 hover:bg-white hover:text-rose-400'} 
                  backdrop-blur-md`}
            >
                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} className="md:w-5 md:h-5" />
            </button>
        )}

        {/* Small transparent category badge in corner */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md text-emerald-700 text-[9px] md:text-[10px] uppercase tracking-widest font-bold rounded-md shadow-sm">
           {product.category}
        </div>
      </div>
      
      {/* Content Area - Minimal */}
      <div className="flex flex-col flex-1 p-2 md:p-3">
        <span className="font-bold text-base md:text-lg text-rose-600 mb-1">{product.price.toLocaleString('ru-RU')} ₽</span>
        <Link 
          to={`/product/${product.id}`}
          onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
          }}
          className="font-sans text-xs md:text-sm text-gray-800 hover:text-emerald-700 transition-colors line-clamp-2 md:line-clamp-3 mb-2 flex-1 leading-snug"
        >
          {product.name}
        </Link>
        
        <div className="mt-auto">
           {!isOutOfStock ? (
             <button 
               onClick={handleAddToCartClick}
               className={`w-full py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${isAdded ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
             >
               {isAdded ? (
                 <>
                   <Check size={14} className="md:w-[16px] md:h-[16px]" />
                   В корзине
                 </>
               ) : (
                 <>
                   <ShoppingBag size={14} className="md:w-[16px] md:h-[16px]" />
                   В корзину
                 </>
               )}
             </button>
           ) : (
             <div className="w-full py-1.5 md:py-2 rounded-lg bg-gray-100 text-center text-xs md:text-sm text-gray-500 font-medium">Нет в наличии</div>
           )}
        </div>
      </div>
    </div>
  );
};
