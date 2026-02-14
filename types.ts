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

export type ViewState = 'HOME' | 'SHOP' | 'PRODUCT_DETAILS' | 'JOURNAL' | 'PROFILE' | 'SELLER';