import React, { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  {
    id: 'flowers',
    name: 'Цветы',
    subcategories: [
      { id: 'roses', name: 'Розы' },
      { id: 'tulips', name: 'Тюльпаны' },
      { id: 'peonies', name: 'Пионы' },
      { id: 'orchids', name: 'Орхидеи' },
      { id: 'lilies', name: 'Лилии' }
    ]
  },
  {
    id: 'bouquets',
    name: 'Букеты',
    subcategories: [
      { id: 'author', name: 'Авторские букеты' },
      { id: 'mono', name: 'Монобукеты' },
      { id: 'wedding', name: 'Свадебные букеты' },
      { id: 'basket', name: 'Цветы в корзине' }
    ]
  },
  {
    id: 'plants',
    name: 'Комнатные растения',
    subcategories: [
      { id: 'blooming', name: 'Цветущие' },
      { id: 'succulents', name: 'Суккуленты и кактусы' },
      { id: 'large', name: 'Крупногабаритные' }
    ]
  },
  {
    id: 'gifts',
    name: 'Подарки',
    subcategories: [
      { id: 'sweets', name: 'Сладости' },
      { id: 'toys', name: 'Мягкие игрушки' },
      { id: 'cards', name: 'Открытки' },
      { id: 'vases', name: 'Вазы' }
    ]
  }
];

interface CatalogMenuProps {
  scrolled: boolean;
  isDarkHome: boolean;
}

export const CatalogMenu: React.FC<CatalogMenuProps> = ({ scrolled, isDarkHome }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
  const navigate = useNavigate();

  const handleSubcategoryClick = (subId: string) => {
    setIsOpen(false);
    navigate(`/catalog?category=${subId}`);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          isOpen ? 'bg-[#00c853] text-white shadow-md shadow-emerald-500/20' : 
          scrolled || !isDarkHome ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-medium' : 
          'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'
        }`}
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.div>
        <span className="font-semibold text-[14px]">Каталог</span>
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-[calc(100%+8px)] left-0 w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl z-50 flex h-[450px] overflow-hidden origin-top"
          >
            
            {/* Categories Sidebar */}
            <div className="w-1/3 bg-slate-50/80 border-r border-slate-200/50 overflow-y-auto py-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveCategory(cat.id)}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-6 py-3.5 flex items-center justify-between group transition-all duration-200 ${
                    activeCategory === cat.id 
                      ? 'bg-emerald-50 text-[#00c853] font-semibold border-r-4 border-[#00c853]' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-r-4 border-transparent'
                  }`}
                >
                  <span className="text-[15px]">{cat.name}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeCategory === cat.id ? 'translate-x-0 text-[#00c853]' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-3'}`} />
                </button>
              ))}
            </div>

            {/* Subcategories Content */}
            <div className="w-2/3 p-8 bg-white/50 overflow-y-auto relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-8 font-serif tracking-tight">
                    {CATEGORIES.find(c => c.id === activeCategory)?.name}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.find(c => c.id === activeCategory)?.subcategories.map((sub, index) => (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={sub.id}
                        onClick={() => handleSubcategoryClick(sub.id)}
                        className="text-left px-5 py-3.5 rounded-xl text-slate-600 hover:text-[#00c853] hover:bg-emerald-50 transition-all duration-200 font-medium text-[15px] border border-transparent hover:border-emerald-100 shadow-sm flex items-center justify-between group"
                      >
                        <span>{sub.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
