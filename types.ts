
export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  shopName?: string; // If seller (Frontend helper, backend uses Store relation)
  status?: 'active' | 'blocked';
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  rating: number;
  status: 'active' | 'pending' | 'blocked';
}

export enum Category {
  BOUQUETS = 'Авторские букеты',
  POTTED = 'Комнатные растения',
  WEDDING = 'Свадебная коллекция',
  DRIED = 'Сухоцветы и декор',
  GIFTS = 'Подарки и вазы'
}

export interface Product {
  id: string;
  storeId?: string; // Link to Store
  name: string;
  price: number;
  stock: number; // Inventory tracking
  isActive: boolean; // Soft delete/Hide
  category: Category;
  image: string;
  description: string;
  longDescription?: string;
  tags: string[];
  careInstructions?: string;
  rating?: number;
  reviews?: number;
}

export interface CartItem extends Product {
  quantity: number;
  giftMessage?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
}

// OrderItem stores a snapshot of the price at the time of purchase
export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  priceSnapshot: number; 
  giftMessage?: string;
}

export type OrderStatus = 'created' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded' | 'pending' | 'confirmed' | 'delivered'; // Mixed legacy and new statuses for transition
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[]; // Frontend uses CartItem, Backend will use OrderItem
  total: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  buyerName?: string;
  deliveryAddress?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
}

export interface SellerStat {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

export interface UserPreferences {
  pastPurchases: string[];
  preferredStyle: string[];
  favoriteColors: string[];
  recentOccasions: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface DecodedToken {
  userId: string;
  role: UserRole;
  exp: number;
}

export type ViewState = 'HOME' | 'SHOP' | 'PRODUCT_DETAILS' | 'JOURNAL' | 'PROFILE' | 'SELLER_DASHBOARD' | 'ADMIN_DASHBOARD';
