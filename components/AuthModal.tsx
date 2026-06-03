
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Mail, MessageCircle, Globe, ShieldCheck, Sparkles, User as UserIcon, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  authMode?: 'default' | 'mlm' | 'seller';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, authMode = 'default' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inn: '',
    contact: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialLogin = (platform: string) => {
    let mockUser: User;

    if (platform === 'Referral') {
        mockUser = {
            id: 'ref-' + Date.now(),
            name: formData.name || 'Партнер Floramos Club',
            email: formData.email || 'club-partner@example.com',
            role: 'buyer',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Club Partner')}&background=10B981&color=fff`,
            status: 'active'
        };
    } else if (platform === 'Partner' || platform === 'Telegram') {
        mockUser = {
            id: 's1',
            name: formData.name || 'Green Paradise Shop',
            email: formData.email || 'partner@example.com',
            role: 'seller',
            shopName: formData.name || 'Green Paradise',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
            status: 'active'
        };
    } else {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          {authMode === 'mlm' ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex py-1.5 px-3 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles size={12} className="mr-1.5 inline align-middle animate-pulse" />
                  Floramos Club
                </div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-1">Получить реферальную ссылку</h2>
                <p className="text-xs text-slate-500">Зарегистрируйтесь как партнер Floramos Club и получайте выплаты с каждого заказа друзей.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">ФИО / Псевдоним</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Иван Иванов" 
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Электронная почта</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="partner@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Telegram / Телефон</label>
                    <input 
                      type="text" 
                      name="contact"
                      placeholder="@username или +7..." 
                      value={formData.contact}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 transition-colors" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleSocialLogin('Referral')}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-medium text-sm transition-all mt-4"
                >
                  <Sparkles size={16} /> Создать кабинет партнера
                </button>
              </div>
            </>
          ) : authMode === 'seller' ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex py-1.5 px-3 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Globe size={12} className="mr-1.5 inline align-middle" />
                  Для магазинов и флористов
                </div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-1">Партнерская сеть</h2>
                <p className="text-xs text-slate-500">Автоматическая продажа букетов со склада на маркетплейсах</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Название магазина или ИНН</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="ООО Цветочный Рай / ИНН..." 
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Email для связи</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="store@example.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Телефон</label>
                    <input 
                      type="text" 
                      name="contact"
                      placeholder="+7 (999) 000-00-00" 
                      value={formData.contact}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 transition-colors" 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleSocialLogin('Partner')}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white font-medium text-sm transition-all mt-4"
                >
                  <Globe size={16} /> Подключить магазин
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-1">Вход в систему</h2>
                <p className="text-xs text-slate-500">Авторизуйтесь для продолжения работы на платформе</p>
              </div>

              <div className="space-y-4">
                <button 
                    onClick={() => handleSocialLogin('Google')}
                    className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 active:scale-98"
                >
                  <Mail className="text-red-500" size={18} />
                  <span>Войти как Покупатель</span>
                </button>

                <button 
                    onClick={() => handleSocialLogin('Partner')}
                    className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 active:scale-98"
                >
                  <Globe className="text-emerald-600" size={18} />
                  <span>Войти в Кабинет Продавца</span>
                </button>
              </div>
            </>
          )}

          <p className="text-[10px] text-slate-400 mt-6 text-center leading-relaxed max-w-xs mx-auto">
            Нажимая кнопку, вы даете согласие на обработку персональных данных в соответствии с <a href="#" className="underline hover:text-slate-600 transition-colors">Политикой конфиденциальности</a> и принимаете <a href="#" className="underline hover:text-slate-600 transition-colors">Пользовательское соглашение</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

