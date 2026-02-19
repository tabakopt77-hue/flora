
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Send, Facebook, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/80 pt-16 pb-8 border-t border-emerald-900">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-white tracking-tight">Aura Flora</h3>
            <p className="text-sm leading-relaxed max-w-xs opacity-80">
              Маркетплейс авторской флористики, объединяющий технологии ИИ и искусство живых цветов. Доставляем эмоции с 2024 года.
            </p>
            <div className="flex gap-4 pt-2">
               <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
               <a href="#" className="hover:text-white transition-colors"><Send size={20} /></a>
               <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-serif text-lg text-white mb-6">Каталог</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/catalog" className="hover:text-white transition-colors">Свежие букеты</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Комнатные растения</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Свадебная коллекция</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Подарки и декор</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif text-lg text-white mb-6">Компания</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/blog" className="hover:text-white transition-colors">Блог Aura Flora</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">О нас</Link></li>
              <li><Link to="/seller" className="hover:text-white transition-colors">Стать партнером</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Публичная оферта</a></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-serif text-lg text-white mb-6">Контакты</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-emerald-400" />
                <span>Москва, ул. Цветочная, д. 12,<br/>БЦ "Оранжерея", офис 404</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-400" />
                <a href="tel:+79990000000" className="hover:text-white">+7 (999) 000-00-00</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-400" />
                <a href="mailto:hello@auraflora.com" className="hover:text-white">hello@auraflora.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-60">
          <p>© 2024 Aura Flora. Все права защищены.</p>
          <div className="flex gap-6">
             <span>ИНН 7700000000</span>
             <span>ОГРН 1027700000000</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
