
import { Product } from '../types';
import { apiGateway } from './apiGateway';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
        const response = await apiGateway.request<Product[]>('core', '/products', null, 'GET');
        return response.data || [];
    } catch (e) {
        console.error("Failed to fetch products", e);
        return [];
    }
  },

  create: async (product: Product): Promise<Product | null> => {
    const response = await apiGateway.request<Product>('core', '/products', product, 'POST');
    return response.data || null;
  },

  update: async (product: Product): Promise<Product | null> => {
    const response = await apiGateway.request<Product>('core', `/products/${product.id}`, product, 'PUT');
    return response.data || null;
  },

  delete: async (id: string): Promise<boolean> => {
    const response = await apiGateway.request('core', `/products/${id}`, null, 'DELETE');
    return response.status === 200;
  }
};
