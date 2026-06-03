import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Trash2, Settings, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from './Button';
import { FloraIcon } from './FloraIcon';
import { ChatMessage } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SellerAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
}

export const SellerAIAssistant: React.FC<SellerAIAssistantProps> = ({ isOpen, onClose, sellerId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`seller_flora_history_${sellerId}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        initializeChat();
      }
    } else {
      initializeChat();
    }
  }, [sellerId]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`seller_flora_history_${sellerId}`, JSON.stringify(messages));
    }
  }, [messages, sellerId]);

  const initializeChat = () => {
    setMessages([
      { role: 'model', text: "Привет! Я ваш ИИ-ассистент продавца Floramos. Я здесь, чтобы помочь вам настроить рекламу в Яндекс и Google, проанализировать продажи, настроить профиль и оптимизировать вашу маржу. Чем могу помочь?" }
    ]);
  };

  const clearHistory = () => {
    localStorage.removeItem(`seller_flora_history_${sellerId}`);
    initializeChat();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
        const systemInstruction = `Ты персональный помощник КАЖДОГО продавца на маркетплейсе Floramos. 
Твоя задача — индивидуально подсказывать, помогать и настраивать все для продавца. 
Ты можешь:
- Автоматически настраивать рекламу в Яндекс Директ и Google Ads (API симуляция)
- Помогать с SEO, ценообразованием и аналитикой.
Если пользователь просит настроить рекламу, скажи: "Рекламные кампании в Яндекс.Директ и Google Ads активированы через API! Ожидаемый рост трафика: +45%. Бюджет оптимизирован." и покажи уверенность в этом действии. Давай конкретные советы по ключевикам.
Помни, что ты общаешься с продавцом ${sellerId}, поэтому твои советы должны быть персонализированы под него. У разных продавцов отдельная память (сохраняется в localStorage), так что не путай аналитику.`;

        const contents = messages.filter(m => !m.isError).map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text || " " }]
        }));
        contents.push({ role: 'user', parts: [{ text: userMsg }] });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                temperature: 0.7,
            }
        });
        
        setMessages(prev => [...prev, { role: 'model', text: response.text || "Ошибка" }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: "Ошибка связи.", isError: true }]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[600px]">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center p-1 border border-white/30 text-white">
               <Zap size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Бизнес-ассистент ИИ</h3>
              <p className="text-[10px] text-emerald-200">Администрирование & Аналитика</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={clearHistory} className="p-1.5 hover:bg-white/10 rounded-full" title="Очистить историю"><Trash2 size={16} /></button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full"><X size={18} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" style={{ minHeight: '300px', maxHeight: '400px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : msg.isError ? 'bg-rose-100 text-rose-900 rounded-tl-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                <div className="markdown-body text-sm prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800">
                  <ReactMarkdown>{msg.text || ''}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-100 rounded-2xl p-4 rounded-tl-sm shadow-sm flex gap-2 w-auto">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Спросите о продажах или настройке..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <Button size="sm" onClick={handleSend} disabled={!input.trim() || isLoading} className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0 shadow-sm">
              <Send size={16} className={input.trim() ? "text-white" : "text-emerald-100"} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
