
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Trash2, ShoppingBag, Eye, Mic, MicOff, Paperclip, Radio } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence } from 'framer-motion';
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

  useEffect(() => {
    creativityRef.current = creativity;
  }, [creativity]);

  // Keep ref in sync with state for the voice hook
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const {
    isLiveMode,
    voiceState,
    transcript: liveTranscript,
    audioLevel,
    toggleLiveMode,
    stopLiveMode
  } = useVoiceConversation({
    onTranscriptComplete: async (text) => {
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
            <div key={index} className="my-6 bg-slate-800/80 rounded-2xl p-0 shadow-lg border border-cyan-500/20 overflow-hidden w-full max-w-[280px] md:max-w-[500px] flex flex-col mx-auto md:mx-0 group transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:border-cyan-500/40">
               {/* Increased height for desktop (h-[320px]) to match the 30% width increase */}
               <div className="relative h-48 md:h-[320px] bg-slate-900 group-hover:opacity-95 transition-opacity cursor-pointer overflow-hidden" onClick={() => onQuickView && onQuickView(product)}>
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   {/* Quick View Overlay Hint - enhanced visibility */}
                   <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                       <span className="bg-slate-900/90 backdrop-blur-md text-cyan-300 px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
                           <Eye size={18} /> Быстрый просмотр
                       </span>
                   </div>
               </div>
               
               <div className="p-5 md:p-6 flex flex-col gap-3">
                  <div>
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">{product.category}</div>
                      <p className="font-serif text-xl md:text-2xl text-white font-medium leading-tight">{product.name}</p>
                  </div>
                  
                  <div className="text-sm md:text-base text-slate-300 line-clamp-2">{product.description}</div>
                  
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-700">
                      <p className="font-serif text-xl md:text-2xl text-cyan-100">{product.price.toLocaleString('ru-RU')} ₽</p>
                      {onAddToCart && (
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white border-none shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                        >
                          <ShoppingBag size={16} /> В корзину
                        </Button>
                      )}
                  </div>
               </div>
            </div>
          );
        }
        return null;
      }
      // Render standard text, preserving line breaks and markdown
      return (
        <div key={index} className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:text-white prose-a:text-cyan-400">
          <ReactMarkdown>{part}</ReactMarkdown>
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-950/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full md:w-[450px] lg:w-[500px] h-full flex flex-col border-l border-cyan-500/20 animate-in slide-in-from-right duration-300 relative overflow-hidden">
        
        {/* Atmospheric background glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-cyan-600/10 blur-[100px] rounded-full"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-slate-900/40 backdrop-blur-md p-5 flex flex-col gap-4 text-white shadow-md z-10 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/5 rounded-full">
                <FloraIcon className="w-6 h-6 animate-aster" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-xl tracking-wide text-cyan-50">Flora AI</h3>
                <p className="text-cyan-400 text-xs font-medium opacity-90">Ваш личный флорист</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearHistory} 
                className="p-2.5 hover:bg-cyan-500/10 rounded-full transition-colors text-cyan-400 hover:text-cyan-300"
                title="Очистить историю"
              >
                <Trash2 size={20} />
              </button>
              <button onClick={onClose} className="p-2.5 hover:bg-cyan-500/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Creativity Slider */}
          <div className="flex flex-col gap-2 pt-2 border-t border-cyan-500/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Креативность ИИ</span>
              <span className="text-xs text-cyan-400 font-bold">{creativity}/10</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={creativity}
              onChange={(e) => setCreativity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5 px-0.5">
              <span>Точно</span>
              <span>Баланс</span>
              <span>Креативно</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-transparent scroll-smooth z-10">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] rounded-3xl p-4 md:p-5 text-sm md:text-base leading-relaxed flex flex-col gap-3 backdrop-blur-md relative
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 text-white rounded-br-sm shadow-[0_8px_20px_rgba(0,229,255,0.15)] border border-cyan-400/30' 
                    : 'bg-slate-800/60 text-slate-100 rounded-bl-sm border border-slate-700/50 shadow-lg'}
                  ${msg.isError ? 'border-red-500/50 bg-red-950/50 text-red-400' : ''}
                `}
              >
                {msg.image && (
                  <img src={msg.image} alt="Uploaded" className="max-w-full rounded-lg max-h-48 object-cover" />
                )}
                {renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/60 backdrop-blur-md rounded-3xl rounded-bl-sm p-4 md:p-5 shadow-lg border border-slate-700/50 flex items-center gap-3">
                <Loader2 className="animate-spin text-cyan-400" size={20} />
                <span className="text-sm text-slate-300 font-medium">Flora печатает...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 bg-slate-900/60 backdrop-blur-md border-t border-cyan-500/20 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.3)] z-10">
          {selectedFile && (
            <div className="mb-3 relative inline-block">
              <img src={selectedFile} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-cyan-500/30" />
              <button 
                onClick={() => setSelectedFile(null)}
                className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 hover:text-white rounded-full p-1 border border-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex gap-3 items-end">
             <div className="relative flex-1 flex items-center bg-slate-800 border border-slate-700 rounded-3xl focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="p-3 text-slate-400 hover:text-cyan-300 transition-colors"
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
                 placeholder="Напишите сообщение..."
                 className="flex-1 bg-transparent px-2 py-3 focus:outline-none text-slate-200 placeholder-slate-500"
                 disabled={isLoading || isLiveMode}
               />
             </div>
             
             {(input.trim() || selectedFile) ? (
               <button 
                 onClick={handleSend}
                 disabled={isLoading || isLiveMode}
                 className="bg-cyan-600 text-white p-3.5 rounded-full hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] active:scale-95 transform duration-150 flex-shrink-0 animate-in zoom-in duration-200"
               >
                 <Send size={20} />
               </button>
             ) : (
               <button
                 onClick={toggleLiveMode}
                 className={`p-3.5 rounded-full transition-all duration-300 flex-shrink-0 animate-in zoom-in duration-200 flex items-center gap-2 ${isLiveMode ? 'bg-cyan-900/50 text-cyan-400 animate-pulse ring-2 ring-cyan-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-300'}`}
                 title="Режим живого диалога"
               >
                 {isLiveMode ? <Radio size={20} className="animate-pulse text-red-500" /> : <Mic size={20} />}
                 <span className="text-sm font-medium hidden sm:inline-block">{isLiveMode ? 'LIVE' : 'LIVE'}</span>
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
      </div>
    </div>
  );
};
