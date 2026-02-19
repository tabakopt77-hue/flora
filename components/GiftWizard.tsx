
import React, { useState } from 'react';
import { X, Gift, Heart, User, Briefcase, Star, ChevronRight, Loader2, Sparkles, Plus } from 'lucide-react';
import { Button } from './Button';
import { Product } from '../types';
import { getGiftRecommendations } from '../services/geminiService';
import { Link } from 'react-router-dom';

interface GiftWizardProps {
    isOpen: boolean;
    onClose: () => void;
    allProducts: Product[];
    onAddToCart: (product: Product) => void;
}

export const GiftWizard: React.FC<GiftWizardProps> = ({ isOpen, onClose, allProducts, onAddToCart }) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Who, 2: Budget, 3: Loading, 4: Results
    const [recipient, setRecipient] = useState('');
    const [budget, setBudget] = useState('');
    const [recommendations, setRecommendations] = useState<(Product & { reason: string })[]>([]);

    if (!isOpen) return null;

    const handleRecipientSelect = (who: string) => {
        setRecipient(who);
        setStep(2);
    };

    const handleBudgetSelect = async (range: string) => {
        setBudget(range);
        setStep(3);
        
        // AI Logic
        try {
            const results = await getGiftRecommendations(recipient, range, allProducts);
            const enrichedRecs = results.map(r => {
                const p = allProducts.find(prod => prod.id === r.id);
                return p ? { ...p, reason: r.reason } : null;
            }).filter(Boolean) as (Product & { reason: string })[];
            
            setRecommendations(enrichedRecs);
            setStep(4);
        } catch (e) {
            console.error(e);
            // Fallback: just show random
            setRecommendations(allProducts.slice(0, 3).map(p => ({ ...p, reason: "Популярный выбор для подарка" })));
            setStep(4);
        }
    };

    const reset = () => {
        setStep(1);
        setRecipient('');
        setBudget('');
        setRecommendations([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 z-10"><X size={20}/></button>
                
                {/* Header */}
                <div className="bg-emerald-900 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg"><Gift size={24} className="text-emerald-100"/></div>
                            <h2 className="font-serif text-2xl font-medium">Помощник Aura Flora</h2>
                        </div>
                        <p className="text-emerald-100/80 text-sm">ИИ подберет идеальный подарок за пару секунд</p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    {/* Step 1: WHO */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Кому ищем подарок?</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { label: 'Маме', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
                                    { label: 'Любимой', icon: Star, color: 'text-purple-500', bg: 'bg-purple-50' },
                                    { label: 'Подруге', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { label: 'Коллеге', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { label: 'Себе', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                                    { label: 'Другое', icon: Gift, color: 'text-gray-500', bg: 'bg-gray-50' },
                                ].map((item) => (
                                    <button 
                                        key={item.label}
                                        onClick={() => handleRecipientSelect(item.label)}
                                        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent hover:border-emerald-500 hover:shadow-md transition-all group bg-gray-50/50"
                                    >
                                        <div className={`p-4 rounded-full mb-3 ${item.bg} group-hover:scale-110 transition-transform`}>
                                            <item.icon size={28} className={item.color} />
                                        </div>
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: BUDGET */}
                    {step === 2 && (
                        <div className="animate-in slide-in-from-right duration-300">
                             <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-emerald-700 mb-6 flex items-center gap-1"><ChevronRight size={14} className="rotate-180"/> Назад</button>
                             <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">На какую сумму рассчитываете?</h3>
                             <p className="text-center text-gray-500 mb-8">Мы подберем лучшие варианты в вашем бюджете</p>
                             
                             <div className="space-y-3 max-w-sm mx-auto">
                                {[
                                    { id: 'low', label: 'До 3 000 ₽', val: 'до 3000 рублей' },
                                    { id: 'mid', label: '3 000 — 6 000 ₽', val: 'от 3000 до 6000 рублей' },
                                    { id: 'high', label: 'От 6 000 ₽', val: 'свыше 6000 рублей' },
                                    { id: 'any', label: 'Бюджет не важен', val: 'Любой бюджет' }
                                ].map(opt => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => handleBudgetSelect(opt.val)}
                                        className="w-full p-4 rounded-xl border border-gray-200 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all font-medium text-gray-700 flex justify-between group"
                                    >
                                        {opt.label}
                                        <ChevronRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* Step 3: LOADING */}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
                             <div className="relative mb-6">
                                 <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                 <Loader2 size={64} className="text-emerald-600 animate-spin relative z-10" />
                             </div>
                             <h3 className="text-xl font-serif text-emerald-900 mb-2">Flora думает...</h3>
                             <p className="text-gray-500">Анализируем каталог и ищем идеальное сочетание для {recipient === 'Себе' ? 'вас' : recipient.toLowerCase().replace(/.$/, 'ы')}</p>
                        </div>
                    )}

                    {/* Step 4: RESULTS */}
                    {step === 4 && (
                        <div className="animate-in slide-in-from-bottom duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Лучшие варианты</h3>
                                <button onClick={reset} className="text-sm text-emerald-600 hover:underline">Начать заново</button>
                            </div>
                            
                            <div className="space-y-4">
                                {recommendations.map(product => (
                                    <div key={product.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all bg-white group">
                                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                            <img src={product.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-serif font-bold text-gray-900 truncate">{product.name}</h4>
                                                <span className="font-medium text-emerald-700 whitespace-nowrap">{product.price} ₽</span>
                                            </div>
                                            <div className="bg-emerald-50/50 p-2 rounded-lg mt-2 mb-2">
                                                <p className="text-xs text-emerald-800 italic">"{product.reason}"</p>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/product/${product.id}`} onClick={onClose} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
                                                    Подробнее
                                                </Link>
                                                <button onClick={() => { onAddToCart(product); onClose(); }} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 flex items-center gap-1">
                                                    <Plus size={14} /> В корзину
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recommendations.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">
                                        Ничего не нашлось :( Попробуйте другие параметры.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
