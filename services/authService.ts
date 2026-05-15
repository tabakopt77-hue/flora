import { User, AuthResponse } from '../types';

const TOKEN_KEY = 'bloom_jwt_token';
const USER_KEY = 'bloom_user_data';

export const authService = {
  login: async (provider: string): Promise<AuthResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    let user: User;
    if (provider === 'Admin') {
        user = {
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@bloomwisp.com',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff'
        };
    } else if (provider === 'Partner') {
        user = {
            id: 'seller-1',
            name: 'Partner Florist',
            email: 'partner@example.com',
            role: 'seller',
            avatar: 'https://ui-avatars.com/api/?name=Partner+Florist&background=059669&color=fff'
        };
    } else {
        user = {
            id: 'user-1',
            name: 'Alex Buyer',
            email: 'alex@gmail.com',
            role: 'buyer',
            avatar: 'https://ui-avatars.com/api/?name=Alex+Buyer&background=random'
        };
    }

    const token = 'mock-jwt-token-' + crypto.randomUUID();
    const expiresIn = 86400;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { user, token, expiresIn };
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
