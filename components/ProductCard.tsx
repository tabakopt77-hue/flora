
import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onQuickView }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-sage-100 flex flex-col h-full relative ${isOutOfStock ? 'opacity-75' : ''}`}>
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? 'grayscale' : ''}`}
          />
        </Link>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-10">
                <span className="bg-white/90 text-rose-600 px-4 py-2 rounded-full font-bold text-sm shadow-md border border-rose-100 transform -rotate-6">
                    Нет в наличии
                </span>
            </div>
        )}

        {/* Overlay with Quick View Button */}
        {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                className="bg-white/90 backdrop-blur-sm text-emerald-900 px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-white hover:text-emerald-700 pointer-events-auto cursor-pointer"
            >
                <Eye size={18} />
                Быстрый просмотр
            </button>
            </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
            <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{product.category}</div>
            {!isOutOfStock && product.stock < 5 && (
                <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">Осталось {product.stock}</span>
            )}
        </div>
        <div>
          <Link 
            to={`/product/${product.id}`}
            className="font-serif text-xl font-medium text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors block"
          >
            {product.name}
          </Link>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-sage-50">
          <span className="font-serif text-lg font-semibold text-gray-900">{product.price.toFixed(2)} ₽</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className={`hover:bg-emerald-800 hover:text-white border-emerald-800 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
          </Button>
        </div>
      </div>
    </div>
  );
};
