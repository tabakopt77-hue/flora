import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Trash2, ShoppingBag } from 'lucide-react';
import { getFloristChatResponse } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { PRODUCTS } from '../constants';

interface AIFloristProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export const AIFlorist: React.FC<AIFloristProps> = ({ isOpen, onClose, onAddToCart }) => {
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
            <div key={index} className="my-3 bg-white rounded-xl p-3 shadow-md border border-emerald-100 flex gap-3 max-w-xs mx-auto md:mx-0">
               <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
               <div className="flex-1 flex flex-col justify-center min-w-0">
                  <p className="font-serif text-emerald-900 font-medium truncate text-sm">{product.name}</p>
                  <p className="text-gray-500 text-xs mb-1">{product.price.toFixed(2)} ₽</p>
                  {onAddToCart && (
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="text-[10px] bg-emerald-800 text-white py-1 px-2 rounded-full w-fit hover:bg-emerald-900 flex items-center gap-1 transition-colors"
                    >
                      <ShoppingBag size={10} /> В корзину
                    </button>
                  )}
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] h-[600px] border border-sage-200">
        
        {/* Header */}
        <div className="bg-emerald-900 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-full">
              <Sparkles size={20} className="text-rose-200" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-lg">Flora AI</h3>
              <p className="text-emerald-200 text-xs">Ваш личный флорист</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearHistory} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-emerald-200 hover:text-white"
              title="Очистить историю"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sage-50">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
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
              <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-sage-100">
                <Loader2 className="animate-spin text-emerald-600" size={20} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-sage-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Напишите сообщение..."
              className="flex-1 border border-sage-200 rounded-full px-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-emerald-800 text-white p-2 rounded-full hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};