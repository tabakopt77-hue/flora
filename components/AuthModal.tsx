
import React from 'react';
import { X, Mail, MessageCircle, Globe, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  const handleSocialLogin = (platform: string) => {
    // Simulation of OAuth logic
    let mockUser: User;

    if (platform === 'Telegram' || platform === 'Partner') {
        // Simulating a Seller Login
        mockUser = {
            id: 's1',
            name: 'Green Paradise Shop',
            email: 'partner@example.com',
            role: 'seller',
            shopName: 'Green Paradise',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
            status: 'active'
        };
    } else if (platform === 'Admin') {
        // Simulating Admin Login
        mockUser = {
            id: 'admin1',
            name: 'Главный Администратор',
            email: 'admin@auraflora.com',
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            status: 'active'
        };
    } else {
        // Simulating a Buyer Login (Google/Yandex)
        mockUser = {
            id: 'u1',
            name: 'Алексей Смирнов',
            email: 'alex@gmail.com',
            role: 'buyer',
            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
            status: 'active'
        };
    }

    onLogin(mockUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="p-8 text-center">
          <h2 className="font-serif text-3xl text-emerald-900 mb-2">Вход в систему</h2>
          <p className="text-gray-500 mb-8">Выберите способ авторизации</p>

          <div className="space-y-4">
            <button 
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all group"
            >
               <Mail className="text-red-500 group-hover:scale-110 transition-transform" size={20} />
               <span className="font-medium text-gray-700">Покупатель (Google)</span>
            </button>

            <button 
                onClick={() => handleSocialLogin('Partner')}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 transition-all group"
            >
               <Globe className="text-emerald-600 group-hover:scale-110 transition-transform" size={20} />
               <span className="font-medium text-emerald-800">Кабинет Продавца</span>
            </button>

             <button 
                onClick={() => handleSocialLogin('Admin')}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group"
            >
               <ShieldAlert className="text-gray-600 group-hover:scale-110 transition-transform" size={20} />
               <span className="font-medium text-gray-700">Администратор</span>
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6 max-w-xs mx-auto">
            Продолжая, вы соглашаетесь с Политикой конфиденциальности и Условиями использования Aura Flora.
          </p>
        </div>
      </div>
    </div>
  );
};
