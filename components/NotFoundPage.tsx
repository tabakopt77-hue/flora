
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from './Button';
import { Sprout, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-sage-50/50">
      <Helmet>
        <title>Страница не найдена</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="relative mb-8">
         <div className="w-64 h-64 bg-emerald-100 rounded-full flex items-center justify-center mx-auto opacity-50 blur-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
         <Sprout size={120} className="text-emerald-800 relative z-10" strokeWidth={1} />
      </div>

      <h1 className="font-serif text-6xl md:text-8xl text-emerald-900 mb-4">404</h1>
      <h2 className="font-serif text-2xl md:text-3xl text-emerald-800 mb-6">Упс! Кажется, мы зашли в терновник.</h2>
      
      <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
        Страница, которую вы ищете, была перемещена, удалена или никогда не существовала. Но в нашем саду еще много прекрасного!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/">
          <Button size="lg" className="flex items-center gap-2">
             <Home size={18} /> На главную
          </Button>
        </Link>
        <Link to="/catalog">
          <Button variant="outline" size="lg" className="flex items-center gap-2">
             <ArrowLeft size={18} /> В каталог
          </Button>
        </Link>
      </div>
    </div>
  );
};
