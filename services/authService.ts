
import { User, AuthResponse, DecodedToken } from '../types';
import { apiGateway } from './apiGateway';

const TOKEN_KEY = 'bloom_jwt_token';
const USER_KEY = 'bloom_user_data';

// --- JWT Decoder ---
const parseJWT = (token: string): DecodedToken | null => {
  try {
    const body = token.split('.')[1];
    return JSON.parse(atob(body));
  } catch (e) {
    return null;
  }
};

export const authService = {
  login: async (provider: string): Promise<AuthResponse> => {
    
    // In a real OAuth flow, we'd redirect to a provider.
    // For this demo, we simulate the login call to our backend which might handle the OAuth callback or credentials.
    // We'll assume a "login" endpoint that takes a provider/email and returns a token.
    
    // For demo purposes, we send a hardcoded email based on provider choice to get a user from backend.
    let email = "alex@gmail.com";
    if (provider === 'Partner') email = "partner@example.com";
    if (provider === 'Admin') email = "admin@bloomwisp.com";

    // Note: The backend `login` endpoint currently expects { email, password }. 
    // We are simulating an existing user login.
    const response = await apiGateway.request<AuthResponse>('auth', '/auth/login', { 
        email, 
        password: "password123" // Hardcoded for demo simplicity as backend hashes "password123" by default? 
        // Note: Real backend requires registration first. If login fails, we try register.
    });

    if (response.status !== 200) {
        // Fallback: Try Register if login fails (Auto-provisioning for demo)
        const registerResponse = await apiGateway.request<AuthResponse>('auth', '/auth/register', {
             email,
             password: "password123"
        });
        
        if (registerResponse.status === 200 && registerResponse.data) {
             const { token, user } = registerResponse.data;
             localStorage.setItem(TOKEN_KEY, token);
             localStorage.setItem(USER_KEY, JSON.stringify(user));
             return { user, token, expiresIn: 86400 };
        }
        
        throw new Error("Authentication failed");
    }

    if (response.data) {
        const { token, user } = response.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { user, token, expiresIn: 86400 };
    }

    throw new Error("No data received");
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    const decoded = parseJWT(token);
    if (!decoded) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }
};
