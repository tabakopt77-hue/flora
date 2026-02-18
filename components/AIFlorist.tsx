
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Trash2, ShoppingBag, Eye } from 'lucide-react';
import { getFloristChatResponse } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { PRODUCTS } from '../constants';

interface AIFloristProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export const AIFlorist: React.FC<AIFloristProps> = ({ isOpen, onClose, onAddToCart, onQuickView }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flora_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
        initializeChat();
      }
    } else {
      initializeChat();
    }
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('flora_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const initializeChat = () => {
    setMessages([
      { role: 'model', text: "Добрый день! Меня зовут Flora. Я помогу подобрать идеальный букет из нашего каталога. Расскажите, для кого и по какому поводу вы ищете цветы?" }
    ]);
  };

  const clearHistory = () => {
    localStorage.removeItem('flora_chat_history');
    initializeChat();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]); // Scroll when opened as well

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Optimistically add user message
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Pass the *entire* history to the service to maintain context
      const response = await getFloristChatResponse(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Прошу прощения, у меня возникли небольшие трудности со связью. Попробуйте спросить еще раз.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse text and render product cards
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(:::PRODUCT:[\w-]+:::)/g);

    return parts.map((part, index) => {
      const match = part.match(/:::PRODUCT:([\w-]+):::/);
      if (match) {
        const productId = match[1];
        const product = PRODUCTS.find(p => p.id === productId);

        if (product) {
          return (
            <div key={index} className="my-6 bg-white rounded-2xl p-0 shadow-lg border border-sage-200 overflow-hidden w-full max-w-[280px] md:max-w-[500px] flex flex-col mx-auto md:mx-0 group transition-all hover:shadow-2xl hover:border-emerald-200">
               {/* Increased height for desktop (h-[320px]) to match the 30% width increase */}
               <div className="relative h-48 md:h-[320px] bg-gray-100 group-hover:opacity-95 transition-opacity cursor-pointer overflow-hidden" onClick={() => onQuickView && onQuickView(product)}>
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   {/* Quick View Overlay Hint - enhanced visibility */}
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <span className="bg-white/95 backdrop-blur-md text-emerald-900 px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                           <Eye size={18} /> Быстрый просмотр
                       </span>
                   </div>
               </div>
               
               <div className="p-5 md:p-6 flex flex-col gap-3">
                  <div>
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">{product.category}</div>
                      <p className="font-serif text-xl md:text-2xl text-gray-900 font-medium leading-tight">{product.name}</p>
                  </div>
                  
                  <div className="text-sm md:text-base text-gray-500 line-clamp-2">{product.description}</div>
                  
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                      <p className="font-medium text-xl md:text-2xl text-emerald-900">{product.price.toFixed(2)} ₽</p>
                      {onAddToCart && (
                        <button 
                          onClick={() => onAddToCart(product)}
                          className="bg-emerald-800 text-white py-2.5 px-5 rounded-full hover:bg-emerald-900 flex items-center gap-2 transition-colors text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-200"
                        >
                          <ShoppingBag size={16} /> В корзину
                        </button>
                      )}
                  </div>
               </div>
            </div>
          );
        }
        return null;
      }
      // Render standard text, preserving line breaks
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-xl overflow-hidden flex flex-col max-h-[85vh] h-[700px] border border-sage-200">
        
        {/* Header */}
        <div className="bg-emerald-900 p-5 flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/10 rounded-full">
              <Sparkles size={22} className="text-rose-200" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-xl tracking-wide">Flora AI</h3>
              <p className="text-emerald-200 text-xs font-medium opacity-90">Ваш личный флорист</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearHistory} 
              className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-emerald-200 hover:text-white"
              title="Очистить историю"
            >
              <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-sage-50 scroll-smooth">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[90%] rounded-2xl p-5 text-sm md:text-base leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-emerald-800 text-white rounded-br-none' 
                    : 'bg-white text-emerald-900 rounded-bl-none border border-sage-100'}
                  ${msg.isError ? 'border-red-500 bg-red-50 text-red-600' : ''}
                `}
              >
                {renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-none p-5 shadow-sm border border-sage-100 flex items-center gap-3">
                <Loader2 className="animate-spin text-emerald-600" size={20} />
                <span className="text-sm text-gray-500 font-medium">Flora печатает...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 bg-white border-t border-sage-100 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Напишите сообщение..."
              className="flex-1 border border-sage-200 rounded-full px-6 py-3 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-base transition-all bg-gray-50 focus:bg-white"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-emerald-800 text-white p-3.5 rounded-full hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 transform duration-150"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
