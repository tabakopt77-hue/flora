import React, { useState } from 'react';
import { Users, ShoppingBag, ShieldAlert, Activity, Search, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { User, Order } from '../types';
import { Button } from './Button';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'fraud'>('overview');

  // Mock Data for Admin
  const sellers: User[] = [
    { id: 's1', name: 'Green Paradise', email: 'partner@example.com', role: 'seller', status: 'active', shopName: 'Green Paradise' },
    { id: 's2', name: 'Floral Soul', email: 'soul@example.com', role: 'seller', status: 'active', shopName: 'Floral Soul' },
    { id: 's3', name: 'Bad Roses', email: 'scam@example.com', role: 'seller', status: 'blocked', shopName: 'Bad Roses' },
  ];

  const fraudAlerts = [
    { id: 1, type: 'Цена', message: 'Магазин "Bad Roses" установил цену на 80% ниже рынка.', severity: 'high' },
    { id: 2, type: 'Отзывы', message: 'Подозрительная активность отзывов у "Floral Soul".', severity: 'medium' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Пользователей</p>
              <h3 className="text-2xl font-bold">12,450</h3>
            </div>
          </div>
          <p className="text-xs text-green-600 flex items-center gap-1"><Activity size={12} /> +12% за неделю</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShoppingBag size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">Оборот (день)</p>
              <h3 className="text-2xl font-bold">845k ₽</h3>
            </div>
          </div>
           <p className="text-xs text-green-600 flex items-center gap-1"><Activity size={12} /> Выше нормы</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ShieldAlert size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">AI Alerts</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
          </div>
          <p className="text-xs text-rose-500">Требуют внимания</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-8 text-white">
          <h3 className="font-serif text-xl mb-4">AI Control Center</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <h4 className="font-bold mb-2 text-gray-400 text-sm uppercase">SLA Мониторинг</h4>
                <div className="flex items-center justify-between mb-2">
                    <span>Среднее время ответа продавцов</span>
                    <span className="text-emerald-400">14 мин</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
             </div>
             <div>
                <h4 className="font-bold mb-2 text-gray-400 text-sm uppercase">Нагрузка на RAG</h4>
                <div className="flex items-center justify-between mb-2">
                    <span>Запросов к базе векторов</span>
                    <span className="text-blue-400">120/сек</span>
                </div>
                 <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
             </div>
          </div>
      </div>
    </div>
  );

  const renderSellers = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
       <div className="p-6 border-b border-gray-100 flex justify-between items-center">
         <h3 className="font-serif text-xl">Управление продавцами</h3>
         <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Поиск..." className="pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none" />
         </div>
       </div>
       <table className="w-full text-left text-sm">
         <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
                <th className="p-4">Название</th>
                <th className="p-4">Email</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Действия</th>
            </tr>
         </thead>
         <tbody className="divide-y divide-gray-100">
            {sellers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{s.shopName}</td>
                    <td className="p-4 text-gray-500">{s.email}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {s.status === 'active' ? 'Активен' : 'Заблокирован'}
                        </span>
                    </td>
                    <td className="p-4">
                        <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                    </td>
                </tr>
            ))}
         </tbody>
       </table>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-32 max-w-7xl animate-in fade-in">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="font-serif text-3xl text-gray-900">Админ-панель</h2>
                <p className="text-gray-500">Система управления маркетплейсом</p>
            </div>
            <Button variant="outline" onClick={onLogout}>Выйти</Button>
        </div>

        <div className="flex gap-6 mb-8">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                Обзор
            </button>
            <button 
                onClick={() => setActiveTab('sellers')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'sellers' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                Продавцы
            </button>
            <button 
                onClick={() => setActiveTab('fraud')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'fraud' ? 'bg-rose-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                AI Fraud Monitor
            </button>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'sellers' && renderSellers()}
        {activeTab === 'fraud' && (
            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert className="text-rose-600" size={24} />
                    <h3 className="text-xl font-bold text-rose-900">Обнаружены подозрительные активности</h3>
                </div>
                <div className="space-y-4">
                    {fraudAlerts.map(alert => (
                        <div key={alert.id} className="bg-white p-4 rounded-xl border-l-4 border-rose-500 shadow-sm flex justify-between items-center">
                            <div>
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{alert.type}</span>
                                <p className="text-gray-800 font-medium">{alert.message}</p>
                            </div>
                            <Button size="sm" variant="outline">Проверить</Button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};