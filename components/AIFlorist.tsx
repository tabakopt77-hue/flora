
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Trash2, ShoppingBag, Eye, Mic, MicOff, Paperclip, Radio, AudioLines } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { getFloristChatResponse } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { PRODUCTS } from '../constants';
import { Button } from './Button';
import { FloraIcon } from './FloraIcon';
import { useVoiceConversation } from '../hooks/useVoiceConversation';
import { VoiceVisualizer } from './VoiceVisualizer';

interface AIFloristProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onNewMessage?: () => void;
}

export const AIFlorist: React.FC<AIFloristProps> = ({ isOpen, onClose, onAddToCart, onQuickView, onNewMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [creativity, setCreativity] = useState<number>(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const creativityRef = useRef<number>(5);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const lastMessageTimeRef = useRef<number>(0);

  useEffect(() => {
    creativityRef.current = creativity;
  }, [creativity]);

  // Keep ref in sync with state for the voice hook
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Shake detection
  useEffect(() => {
    if (!isOpen) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    const SHAKE_THRESHOLD = 15;

    const handleMotion = (e: DeviceMotionEvent) => {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (x === null || y === null || z === null || x === undefined || y === undefined || z === undefined) return;
      
      const deltaX = Math.abs(lastX - x);
      const deltaY = Math.abs(lastY - y);
      const deltaZ = Math.abs(lastZ - z);

      if (deltaX > SHAKE_THRESHOLD || deltaY > SHAKE_THRESHOLD || deltaZ > SHAKE_THRESHOLD) {
        onClose();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    // Swipe Right or Swipe Down threshold
    if (dx > 70 || dy > 70) {
      onClose();
    }
    setTouchStart(null);
  };

  const {
    isLiveMode,
    voiceState,
    transcript: liveTranscript,
    audioLevel,
    toggleLiveMode,
    stopLiveMode
  } = useVoiceConversation({
    onTranscriptComplete: async (text) => {
      const now = Date.now();
      if (now - lastMessageTimeRef.current < 60000) {
         const errText = "Пожалуйста, подождите 1 минуту перед отправкой следующего сообщения, чтобы не израсходовать все токены.";
         setMessages(prev => [...prev, { role: 'model', text: errText, isError: true }]);
         if (onNewMessage) onNewMessage();
         return errText;
      }
      lastMessageTimeRef.current = now;

      const currentHistory = messagesRef.current;
      const newHistory: ChatMessage[] = [...currentHistory, { role: 'user', text }];
      setMessages(newHistory);
      
      try {
        const response = await getFloristChatResponse(currentHistory, text, undefined, creativityRef.current);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
        if (onNewMessage) onNewMessage();
        return response;
      } catch (error) {
        const errText = "Прошу прощения, у меня возникли небольшие трудности со связью.";
        setMessages(prev => [...prev, { role: 'model', text: errText, isError: true }]);
        if (onNewMessage) onNewMessage();
        return errText;
      }
    }
  });

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('flora_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
        messagesRef.current = parsed;
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
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const now = Date.now();
    if (now - lastMessageTimeRef.current < 60000) {
      setMessages(prev => [...prev, { role: 'model', text: "Пожалуйста, подождите 1 минуту перед отправкой следующего сообщения, чтобы не израсходовать все токены.", isError: true }]);
      return;
    }
    lastMessageTimeRef.current = now;

    const userMsg = input.trim();
    const currentImage = selectedFile;
    
    setInput('');
    setSelectedFile(null);
    
    // Optimistically add user message
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg, image: currentImage || undefined }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Pass the *entire* history to the service to maintain context
      const response = await getFloristChatResponse(messages, userMsg, currentImage || undefined, creativity);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      if (onNewMessage) onNewMessage();
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Прошу прощения, у меня возникли небольшие трудности со связью. Попробуйте спросить еще раз.", isError: true }]);
      if (onNewMessage) onNewMessage();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
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
            <div key={index} className="my-4 bg-[#0d1117] rounded-lg p-0 shadow-sm border border-[#30363d] overflow-hidden w-full max-w-[280px] md:max-w-[400px] flex flex-col mx-auto md:mx-0 group transition-all hover:border-[#8b949e]">
               <div className="relative h-48 md:h-[240px] bg-[#161b22] group-hover:opacity-95 transition-opacity cursor-pointer overflow-hidden" onClick={() => onQuickView && onQuickView(product)}>
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <span className="bg-[#1f6feb] text-white px-4 py-2 rounded-md text-[13px] font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                           <Eye size={16} /> Быстрый просмотр
                       </span>
                   </div>
               </div>
               
               <div className="p-4 md:p-5 flex flex-col gap-2">
                  <div>
                      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider mb-1">{product.category}</div>
                      <p className="font-semibold text-[16px] md:text-[18px] text-[#e6edf3] leading-tight">{product.name}</p>
                  </div>
                  
                  <div className="text-[13px] text-[#8b949e] line-clamp-2 leading-relaxed">{product.description}</div>
                  
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#30363d]">
                      <p className="font-mono text-lg text-[#3fb950] font-medium">{product.price.toLocaleString('ru-RU')} ₽</p>
                      {onAddToCart && (
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white border-transparent px-3 py-1.5 h-auto text-[13px] font-medium rounded-md shadow-sm"
                        >
                          <ShoppingBag size={14} /> В корзину
                        </Button>
                      )}
                  </div>
               </div>
            </div>
          );
        }
        return null;
      }
      return (
        <div key={index} className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:text-[#c9d1d9] prose-a:text-[#58a6ff]">
          <ReactMarkdown>{part}</ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onClose} 
            aria-label="Close dialog" 
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-[#0d1117] shadow-2xl w-full md:w-[450px] lg:w-[450px] h-full flex flex-col border-l border-[#30363d] relative overflow-hidden pointer-events-auto"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            
            {/* Header */}
        <div className="bg-[#161b22] px-5 py-4 flex flex-col gap-4 text-[#e6edf3] shadow-sm z-10 border-b border-[#30363d] relative rounded-t-xl md:rounded-tl-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-1 text-2xl">
                <FloraIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-[15px] tracking-tight text-[#e6edf3]">Flora AI</h3>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={clearHistory} 
                className="p-2 hover:bg-[#30363d] rounded-lg transition-colors text-[#8b949e] hover:text-[#c9d1d9]"
                title="Очистить историю"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-[#30363d] rounded-lg transition-colors text-[#8b949e] hover:text-[#c9d1d9]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Creativity Slider */}
          <div className="flex flex-col gap-1.5 pt-3 border-t border-[#30363d]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8b949e] font-mono tracking-wider uppercase">Креативность ИИ</span>
              <span className="text-[10px] text-[#3fb950] font-mono">{creativity}/10</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={creativity}
              onChange={(e) => setCreativity(parseInt(e.target.value))}
              className="w-full h-1 bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
            />
            <div className="flex items-center justify-between text-[9px] text-[#8b949e] mt-1 px-0.5">
              <span>Точно</span>
              <span>Баланс</span>
              <span>Креативно</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#0d1117] scroll-smooth z-10 pb-6 font-sans">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed flex flex-col gap-2 relative
                  ${msg.role === 'user' 
                    ? 'bg-[#238636] text-white self-end shadow-sm border border-[#2ea043]/30 rounded-br-sm' 
                    : 'bg-[#161b22] text-[#e6edf3] self-start border border-[#30363d] shadow-sm rounded-bl-sm'}
                  ${msg.isError ? 'border-[#da3633] bg-[#f85149]/10 text-[#ff7b72]' : ''}
                `}
              >
                {msg.image && (
                  <img src={msg.image} alt="Uploaded" className="max-w-full rounded-lg max-h-48 object-cover shadow-sm mb-1" />
                )}
                {renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#161b22] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-[#30363d] flex items-center gap-2">
                <Loader2 className="animate-spin text-[#8b949e]" size={16} />
                <span className="text-[14px] text-[#8b949e]">Flora печатает...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0d1117] relative z-10">
          {selectedFile && (
            <div className="mb-3 ml-2 relative inline-block">
              <img src={selectedFile} alt="Preview" className="h-14 w-14 object-cover rounded-xl border border-[#30363d]" />
              <button 
                onClick={() => setSelectedFile(null)}
                className="absolute -top-2 -right-2 bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9] rounded-full p-1 border border-[#30363d] shadow-md"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
             <div className="relative flex-1 flex items-center bg-[#161b22] border border-[#30363d] rounded-[24px] focus-within:border-[#8b949e] transition-colors px-1.5 py-1.5 min-h-[52px]">
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="p-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors rounded-full hover:bg-[#30363d]"
                 title="Прикрепить фото"
               >
                 <Paperclip size={20} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileSelect} 
                 accept="image/*" 
                 className="hidden" 
               />
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Спросите Flora..."
                 className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-[#e6edf3] placeholder-[#8b949e] text-[15px]"
                 disabled={isLoading || isLiveMode}
               />
               
               {(input.trim() || selectedFile) ? (
                 <button 
                   onClick={handleSend}
                   disabled={isLoading || isLiveMode}
                   className="bg-white text-black p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 mr-1"
                 >
                   <Send size={18} />
                 </button>
               ) : (
                 <button
                   className="p-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors rounded-full hover:bg-[#30363d] mr-1"
                   title="Голосовой ввод"
                 >
                   <Mic size={20} />
                 </button>
               )}
             </div>
             
             {!input.trim() && !selectedFile && (
               <button
                 onClick={toggleLiveMode}
                 className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${isLiveMode ? 'bg-[#da3633] text-white animate-pulse' : 'bg-white text-black hover:bg-gray-200'}`}
                 title="Режим живого диалога"
               >
                 {isLiveMode ? <MicOff size={22} /> : <AudioLines size={22} />}
               </button>
             )}
          </div>
        </div>

        {/* Voice Visualizer Overlay */}
        <AnimatePresence>
          {isLiveMode && (
            <VoiceVisualizer 
              state={voiceState} 
              audioLevel={audioLevel} 
              transcript={liveTranscript} 
              onClose={stopLiveMode} 
            />
          )}
        </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

