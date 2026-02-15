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
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-sage-100 flex flex-col h-full">
      <div className="relative overflow-hidden aspect-square bg-gray-100 cursor-pointer">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>
        
        {/* Overlay with Quick View Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
           <button 
             onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
             className="bg-white/90 backdrop-blur-sm text-emerald-900 px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-white hover:text-emerald-700 pointer-events-auto"
           >
             <Eye size={18} />
             Быстрый просмотр
           </button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-medium text-emerald-600 mb-1 uppercase tracking-wider">{product.category}</div>
        <Link to={`/product/${product.id}`} className="block">
          <h3 
            className="font-serif text-xl font-medium text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-sage-50">
          <span className="font-serif text-lg font-semibold text-gray-900">{product.price.toFixed(2)} ₽</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="hover:bg-emerald-800 hover:text-white border-emerald-800"
          >
            В корзину
          </Button>
        </div>
      </div>
    </div>
  );
};