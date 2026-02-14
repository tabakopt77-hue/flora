import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-sage-100 flex flex-col">
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white p-2 rounded-full shadow-md text-emerald-800 hover:text-emerald-600">
            <Plus size={20} onClick={() => onAddToCart(product)} />
          </button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-medium text-emerald-600 mb-1 uppercase tracking-wider">{product.category}</div>
        <h3 className="font-serif text-xl font-medium text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-sage-50">
          <span className="font-serif text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddToCart(product)}
            className="hover:bg-emerald-800 hover:text-white border-emerald-800/30"
          >
            В корзину
          </Button>
        </div>
      </div>
    </div>
  );
};