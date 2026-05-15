import { Order, CartItem, User, OrderStatus } from '../types';
import { db } from './db';

interface CreateOrderParams {
  user: User;
  cart: CartItem[];
  deliveryDetails: {
    city: string;
    street: string;
    apartment?: string;
    date: string;
    time: string;
    deliveryCost?: number;
    deliveryService?: string;
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const orderService = {
  getMyOrders: async (): Promise<Order[]> => {
      await delay(500);
      // In a real app, we'd filter by user ID. For demo, we return all orders if we assume single user per browser session
      // or filter if we had user context here.
      // Since this is called from components that have user context, we could filter there,
      // but let's just return all for now as db.orders.getAll() is local storage.
      return db.orders.getAll();
  },

  getAllOrders: async (): Promise<Order[]> => {
     await delay(500);
     return db.orders.getAll();
  },

  updateStatus: async (orderId: string, status: OrderStatus): Promise<boolean> => {
      await delay(500);
      db.orders.updateStatus(orderId, status);
      return true;
  },

  createOrder: async (params: CreateOrderParams): Promise<{ success: boolean; order?: Order; error?: string }> => {
    const { user, cart, deliveryDetails } = params;

    if (cart.length === 0) return { success: false, error: "Корзина пуста" };

    await delay(1000);

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCost = deliveryDetails.deliveryCost !== undefined 
        ? deliveryDetails.deliveryCost 
        : (total > 10000 ? 0 : 500);
    
    // Extract actual address from nested deliveryDetails if it exists, otherwise fallback to top-level
    const actualAddress = (deliveryDetails as any).deliveryDetails || deliveryDetails;
    const city = actualAddress.city || deliveryDetails.city || 'Москва';
    const street = actualAddress.street || deliveryDetails.street || '';
    
    const newOrder: Order = {
        id: `ORD-${Math.floor(Math.random() * 100000)}`,
        userId: user.id,
        buyerName: user.name,
        date: new Date().toLocaleDateString('ru-RU'),
        items: cart,
        total: total + deliveryCost,
        status: 'pending',
        paymentStatus: 'paid',
        deliveryAddress: `${city}, ${street}`
    };

    db.orders.create(newOrder);
    db.cart.clear();

    return { success: true, order: newOrder };
  }
};
