export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  longDescription?: string;
  tags: string[];
  careInstructions?: string;
  rating?: number;
  reviews?: number;
  sellerId?: string; // New: link product to a seller
}

export enum Category {
  BOUQUETS = 'Авторские букеты',
  POTTED = 'Комнатные растения',
  WEDDING = 'Свадебная коллекция',
  DRIED = 'Сухоцветы и декор',
  GIFTS = 'Подарки и вазы'
}

export interface CartItem extends Product {
  quantity: number;
  giftMessage?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
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
  change: number; // percentage
  trend: 'up' | 'down';
}

export interface UserPreferences {
  pastPurchases: string[];
  preferredStyle: string[];
  favoriteColors: string[];
  recentOccasions: string[];
}

// --- NEW AUTH & MARKETPLACE TYPES ---

export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  shopName?: string; // If seller
  status?: 'active' | 'blocked'; // For admin control
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  buyerName?: string; // For seller view
  deliveryAddress?: string; // Simulation
}

export type ViewState = 'HOME' | 'SHOP' | 'PRODUCT_DETAILS' | 'JOURNAL' | 'PROFILE' | 'SELLER_DASHBOARD' | 'ADMIN_DASHBOARD';