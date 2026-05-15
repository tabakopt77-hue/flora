import { Product } from '../types';
import { db } from './db';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  getAll: async (): Promise<Product[]> => {
    await delay(500);
    return db.products.getAll();
  },

  create: async (product: Product): Promise<Product | null> => {
    await delay(500);
    const products = db.products.getAll();
    const newProduct = { ...product, id: crypto.randomUUID() };
    db.products.save([newProduct, ...products]);
    return newProduct;
  },

  update: async (product: Product): Promise<Product | null> => {
    await delay(500);
    const products = db.products.getAll();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
        products[index] = product;
        db.products.save(products);
        return product;
    }
    return null;
  },

  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    const products = db.products.getAll();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== products.length) {
        db.products.save(filtered);
        return true;
    }
    return false;
  }
};
