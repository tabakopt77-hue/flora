
import { Product, Order, User, CartItem } from '../types';
import { PRODUCTS } from '../constants';

// Keys
const KEYS = {
  PRODUCTS: 'bloom_products',
  ORDERS: 'bloom_orders',
  CART: 'bloom_cart',
  USERS: 'bloom_users',
  WISHLIST: 'bloom_wishlist'
};

// Helper for safe parsing
const get = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const set = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  products: {
    getAll: (): Product[] => get(KEYS.PRODUCTS, PRODUCTS),
    getById: (id: string): Product | undefined => {
      const products = get<Product[]>(KEYS.PRODUCTS, PRODUCTS);
      return products.find(p => p.id === id);
    },
    save: (products: Product[]) => set(KEYS.PRODUCTS, products),
    updateStock: (productId: string, quantityToDeduct: number): boolean => {
      const products = get<Product[]>(KEYS.PRODUCTS, PRODUCTS);
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex === -1) return false;
      
      const product = products[productIndex];
      if (product.stock < quantityToDeduct) return false; // Not enough stock

      // Transactional update
      products[productIndex] = {
        ...product,
        stock: product.stock - quantityToDeduct
      };
      
      set(KEYS.PRODUCTS, products);
      return true;
    }
  },
  orders: {
    getAll: (): Order[] => get(KEYS.ORDERS, []),
    create: (order: Order) => {
      const orders = get<Order[]>(KEYS.ORDERS, []);
      set(KEYS.ORDERS, [order, ...orders]);
    },
    updateStatus: (orderId: string, status: Order['status']) => {
      const orders = get<Order[]>(KEYS.ORDERS, []);
      const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
      set(KEYS.ORDERS, updated);
    }
  },
  cart: {
    get: (): CartItem[] => get(KEYS.CART, []),
    save: (cart: CartItem[]) => set(KEYS.CART, cart),
    clear: () => set(KEYS.CART, [])
  },
  wishlist: {
    get: (): string[] => get(KEYS.WISHLIST, []),
    toggle: (productId: string): string[] => {
      let list = get<string[]>(KEYS.WISHLIST, []);
      if (list.includes(productId)) {
        list = list.filter(id => id !== productId);
      } else {
        list.push(productId);
      }
      set(KEYS.WISHLIST, list);
      return list;
    }
  }
};
