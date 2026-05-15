
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Sparkles, MessageSquare } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';
import { summarizeReviews } from '../services/geminiService';

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    text: string;
    likes: number;
}

// Mock reviews generator based on product ID
const getMockReviews = (productId: string): Review[] => [
    { id: '1', author: 'Елена М.', rating: 5, date: '12 марта 2024', text: 'Букет просто невероятный! Стоит уже неделю и даже не думает вянуть. Запах на всю квартиру.', likes: 12 },
    { id: '2', author: 'Александр К.', rating: 5, date: '10 марта 2024', text: 'Заказывал девушке, она в восторге. Курьер приехал вовремя, в костюме, очень вежливый.', likes: 8 },
    { id: '3', author: 'Марина С.', rating: 4, date: '08 марта 2024', text: 'Цветы свежие, но упаковка немного помялась при доставке. В целом довольна.', likes: 3 },
    { id: '4', author: 'Игорь В.', rating: 5, date: '05 марта 2024', text: 'Сервис на высоте. Открытку подписали красивым почерком.', likes: 5 },
];

interface ReviewListProps {
    product: Product;
}

export const ReviewList: React.FC<ReviewListProps> = ({ product }) => {
    const reviews = getMockReviews(product.id);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        // Automatically generate summary if there are enough reviews
        if (reviews.length > 0) {
            handleGenerateSummary();
        }
    }, [product.id]);

    const handleGenerateSummary = async () => {
        setLoadingSummary(true);
        try {
            const allText = reviews.map(r => r.text).join('\n');
            const summary = await summarizeReviews(allText);
            setAiSummary(summary);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingSummary(false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500 delay-100">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <h3 className="font-serif text-2xl text-emerald-900 mb-6">Отзывы покупателей</h3>
                    
                    {/* AI Summary Card */}
                    <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="flex items-start gap-3 relative z-10">
                            <div className="bg-white p-2 rounded-full shadow-sm text-emerald-600">
                                <Sparkles size={20} className={loadingSummary ? "animate-spin" : ""} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-emerald-900 text-sm mb-1 uppercase tracking-wide">Вердикт ИИ</h4>
                                {loadingSummary ? (
                                    <div className="h-4 bg-emerald-100/50 rounded w-3/4 animate-pulse mt-2"></div>
                                ) : (
                                    <p className="text-emerald-800 text-sm leading-relaxed italic">
                                        "{aiSummary || 'Анализирую отзывы...'}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {reviews.map(review => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {review.author[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{review.author}</p>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{review.date}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 pl-10">{review.text}</p>
                                <div className="flex items-center gap-4 pl-10">
                                    <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                                        <ThumbsUp size={14} /> {review.likes}
                                    </button>
                                    <button className="text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                                        Ответить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <Button variant="outline">Показать еще</Button>
                    </div>
                </div>

                {/* Rating Stats Sidebar */}
                <div className="w-full md:w-80 bg-gray-50 p-6 rounded-2xl">
                    <div className="text-center mb-6">
                        <div className="text-5xl font-serif text-emerald-900 font-medium mb-1">{product.rating}</div>
                        <div className="flex justify-center text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">на основе {product.reviews} отзывов</p>
                    </div>
                    
                    <div className="space-y-2 mb-8">
                        {[5, 4, 3, 2, 1].map(stars => (
                            <div key={stars} className="flex items-center gap-2 text-xs">
                                <span className="w-3">{stars}</span>
                                <Star size={10} className="text-gray-300" />
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500" 
                                        style={{ width: stars === 5 ? '70%' : stars === 4 ? '20%' : '5%' }}
                                    ></div>
                                </div>
                                <span className="w-8 text-right text-gray-400">{stars === 5 ? '70%' : stars === 4 ? '20%' : '5%'}</span>
                            </div>
                        ))}
                    </div>

                    <Button className="w-full">Написать отзыв</Button>
                    <p className="text-xs text-center text-gray-400 mt-3">
                        Мы публикуем только реальные отзывы покупателей.
                    </p>
                </div>
            </div>
        </div>
    );
};
