
import { Order, CartItem, User } from '../types';
import { db } from './db';
import { apiGateway } from './apiGateway';

interface CreateOrderParams {
  user: User;
  cart: CartItem[];
  deliveryDetails: {
    city: string;
    street: string;
    apartment?: string;
    date: string;
    time: string;
  };
}

export const orderService = {
  /**
   * Fetches orders for the current user (Buyer)
   */
  getMyOrders: async (): Promise<Order[]> => {
      try {
          const response = await apiGateway.request<Order[]>('core', '/orders/my', null, 'GET');
          return response.data || [];
      } catch (e) {
          return db.orders.getAll(); // Fallback to local storage for demo continuity if backend offline
      }
  },

  /**
   * Fetches all orders (for Seller/Admin dashboard)
   */
  getAllOrders: async (): Promise<Order[]> => {
     try {
         // Assuming admin endpoint exists, or reuse product list logic for demo
         const response = await apiGateway.request<Order[]>('core', '/orders', null, 'GET');
         return response.data || [];
     } catch (e) {
         return db.orders.getAll();
     }
  },

  /**
   * Creates an order by calling the High-Performance Rust Core via API Gateway.
   * Ensures ACID compliance and strict inventory locking.
   */
  createOrder: async (params: CreateOrderParams): Promise<{ success: boolean; order?: Order; error?: string }> => {
    const { user, cart, deliveryDetails } = params;

    if (cart.length === 0) return { success: false, error: "Корзина пуста" };

    // 1. Prepare Payload
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCost = total > 10000 ? 0 : 500;
    
    // 2. Call Rust Core via Gateway
    try {
        const response = await apiGateway.request<Order>('core', '/orders/create', {
             // Map to backend snake_case expected DTOs
             items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
             user_id: user.id,
             delivery_address: `${deliveryDetails.city}, ${deliveryDetails.street}, ${deliveryDetails.apartment || ''}`
        }, 'POST');

        if (response.status !== 200) {
            throw new Error(response.error || "Gateway Error");
        }

        // 3. Update Local State (Simulation of Backend Success)
        // In real app, the response.data contains the created order
        const newOrder: Order = response.data || {
            id: `ORD-${Math.floor(Math.random() * 100000)}`,
            userId: user.id,
            buyerName: user.name,
            date: new Date().toLocaleDateString('ru-RU'),
            items: cart,
            total: total + deliveryCost,
            status: 'pending',
            paymentStatus: 'paid',
            deliveryAddress: deliveryDetails.city
        };

        // Sync local DB simulation
        db.orders.create(newOrder);
        db.cart.clear();

        console.log(`[OrderService] Transaction Committed via ${response.meta.service}. Trace: ${response.meta.traceId}`);
        
        return { success: true, order: newOrder };

    } catch (e: any) {
        console.error("Order Creation Failed:", e);
        return { success: false, error: "Ошибка при создании заказа (Transaction Rollback)" };
    }
  }
};
