
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import { FaTelegramPlane, FaWhatsapp, FaVk } from 'react-icons/fa';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0d1117] text-[#8b949e] pt-10 md:pt-16 pb-6 md:pb-8 border-t border-[#30363d] relative z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-[#c9d1d9] tracking-tight">Floramos</h3>
            <p className="text-sm leading-relaxed max-w-xs text-[#8b949e]">
              Маркетплейс авторской флористики, объединяющий технологии ИИ и искусство живых цветов. Доставляем эмоции с 2024 года.
            </p>
            <div className="flex gap-4 pt-2">
               <a href="#" className="hover:text-white transition-colors p-2 bg-[#21262d] rounded-full border border-[#30363d]"><FaTelegramPlane size={18} /></a>
               <a href="#" className="hover:text-white transition-colors p-2 bg-[#21262d] rounded-full border border-[#30363d]"><FaWhatsapp size={18} /></a>
               <a href="#" className="hover:text-white transition-colors p-2 bg-[#21262d] rounded-full border border-[#30363d]"><FaVk size={18} /></a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-semibold text-lg text-[#c9d1d9] mb-6">Каталог</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/catalog" className="hover:text-[#58a6ff] transition-colors">Свежие букеты</Link></li>
              <li><Link to="/catalog" className="hover:text-[#58a6ff] transition-colors">Комнатные растения</Link></li>
              <li><Link to="/catalog" className="hover:text-[#58a6ff] transition-colors">Свадебная коллекция</Link></li>
              <li><Link to="/catalog" className="hover:text-[#58a6ff] transition-colors">Подарки и декор</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg text-[#c9d1d9] mb-6">Компания</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/blog" className="hover:text-[#58a6ff] transition-colors">Блог Floramos</Link></li>
              <li><Link to="/about" className="hover:text-[#58a6ff] transition-colors">О нас</Link></li>
              <li><Link to="/partners" className="hover:text-[#58a6ff] transition-colors">Стать партнером</Link></li>
              <li><a href="#" className="hover:text-[#58a6ff] transition-colors">Политика в отношении обработки персональных данных (ФЗ № 152-ФЗ)</a></li>
              <li><a href="#" className="hover:text-[#58a6ff] transition-colors">Пользовательское соглашение (Публичная оферта)</a></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold text-lg text-[#c9d1d9] mb-6">Контакты</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-[#58a6ff]" />
                <span>Москва, ул. Цветочная, д. 12,<br/>БЦ "Оранжерея", офис 404</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#58a6ff]" />
                <a href="tel:+79990000000" className="hover:text-[#58a6ff]">+7 (999) 000-00-00</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#58a6ff]" />
                <a href="mailto:hello@auraflora.com" className="hover:text-[#58a6ff]">hello@auraflora.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#30363d] pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#8b949e]">
          <p>© 2024 Floramos. Все права защищены.</p>
          <div className="flex gap-6">
             <span>ИНН 7700000000</span>
             <span>ОГРН 1027700000000</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
