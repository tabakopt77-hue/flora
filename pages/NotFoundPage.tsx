import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Helmet } from 'react-helmet-async';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <Helmet>
        <title>Страница не найдена</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h1 className="text-9xl font-serif text-emerald-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
      <Link to="/">
        <Button>Вернуться на главную</Button>
      </Link>
    </div>
  );
};
