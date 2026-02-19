
import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, ShieldAlert, Activity, Search, MoreVertical, Server, Database, Cpu, Zap, Radio, Terminal, CloudLightning, Check, X, Eye, AlertTriangle } from 'lucide-react';
import { User, Order, Product, ModerationStatus } from '../types';
import { Button } from './Button';
import { db } from '../services/db';
import { apiGateway } from '../services/apiGateway';
import { moderateProduct } from '../services/geminiService';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'moderation' | 'system'>('overview');
  const [telemetry, setTelemetry] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // State for Moderation
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Real Data Analysis
  const allOrders = db.orders.getAll();
  const allProducts = db.products.getAll();
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

  // Mock Sellers
  const sellers: User[] = [
    { id: 's1', name: 'Green Paradise', email: 'partner@example.com', role: 'seller', status: 'active', shopName: 'Green Paradise' },
    { id: 's2', name: 'Floral Soul', email: 'soul@example.com', role: 'seller', status: 'active', shopName: 'Floral Soul' },
  ];
  
  // Load moderation queue (simulated)
  useEffect(() => {
      if (activeTab === 'moderation') {
          // Simulate fetching products with 'pending' status
          // In a real app, this would be an API call
          const mockPending: Product[] = allProducts.filter(p => !p.moderationStatus || p.moderationStatus === 'pending').slice(0, 5);
          
          // Trigger AI Analysis for them if they don't have a verdict yet
          mockPending.forEach(async (p) => {
              if (!p.aiVerdict) {
                  const verdict = await moderateProduct(p);
                  p.aiVerdict = verdict; // Mutating for local demo state, in real app update DB
                  setPendingProducts([...mockPending]); // Trigger re-render
              }
          });
          setPendingProducts(mockPending);
      }
  }, [activeTab]);

  // System Monitor Effect
  useEffect(() => {
    if (activeTab !== 'system') return;

    const fetchTelemetry = async () => {
        const data = await apiGateway.getTelemetry();
        setTelemetry(data);
        
        // Simulate live logs
        const newLog = generateMockLog(data);
        setLogs(prev => [newLog, ...prev].slice(0, 8));
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const generateMockLog = (data: any) => {
      const types = ['INFO', 'INFO', 'INFO', 'WARN', 'DEBUG'];
      const type = types[Math.floor(Math.random() * types.length)];
      const services = ['RustCore', 'NodeGateway', 'PythonAI', 'Kafka'];
      const service = services[Math.floor(Math.random() * services.length)];
      const time = new Date().toISOString().split('T')[1].split('.')[0];
      
      let msg = '';
      if (service === 'RustCore') msg = `Committed transaction TX_${Math.floor(Math.random() * 9000)}`;
      if (service === 'PythonAI') msg = `Inference complete: ${Math.floor(Math.random() * 400)}ms`;
      if (service === 'Kafka') msg = `Partition rebalance: stable. Lag: ${data?.kafka.lag}`;
      if (service === 'NodeGateway') msg = `Auth validated for user u_${Math.floor(Math.random() * 100)}`;

      return `[${time}] [${service}] ${type}: ${msg}`;
  };
  
  const handleModeration = async (product: Product, status: ModerationStatus) => {
      setProcessingId(product.id);
      // Simulate API call to update status
      await new Promise(r => setTimeout(r, 500));
      
      product.moderationStatus = status;
      // Remove from list
      setPendingProducts(prev => prev.filter(p => p.id !== product.id));
      setProcessingId(null);
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Заказов сегодня</p>
                        <h3 className="text-2xl font-bold">{allOrders.length}</h3>
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ShoppingBag size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Оборот</p>
                        <h3 className="text-2xl font-bold">{totalRevenue.toLocaleString()} ₽</h3>
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><ShieldAlert size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500">Модерация</p>
                        <h3 className="text-2xl font-bold">{pendingProducts.length}</h3>
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                </div>
            </div>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl flex items-center justify-between">
            <div>
                <h3 className="text-xl font-serif mb-2 flex items-center gap-2"><CloudLightning size={20} className="text-yellow-400"/> AI Forecast</h3>
                <p className="text-gray-300 max-w-xl">
                    Анализ Rust-ядра показывает рост транзакций на 15% за последний час. 
                    Рекомендуется масштабирование подов `order-service` к вечеру.
                </p>
            </div>
            <Button variant="outlineWhite" size="sm">Подробнее</Button>
        </div>
    </div>
  );
  
  const renderModeration = () => (
      <div className="space-y-6 animate-in fade-in">
          <h3 className="font-serif text-xl mb-4">Очередь модерации AI</h3>
          {pendingProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
                  <Check className="mx-auto text-emerald-500 mb-4" size={48} />
                  <p className="text-gray-500">Все товары проверены! Отличная работа.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-6">
                  {pendingProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
                          <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 relative">
                              <img src={product.image} className="w-full h-full object-cover" />
                              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                  {product.category}
                              </div>
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-bold text-lg text-gray-900">{product.name}</h4>
                                      <div className="flex items-center gap-2">
                                          <span className="text-sm font-bold">{product.price} ₽</span>
                                      </div>
                                  </div>
                                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                                  
                                  {/* AI Verdict Box */}
                                  <div className={`p-4 rounded-lg border flex gap-4 ${product.aiVerdict?.isSafe ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                      <div className={`p-2 rounded-full h-fit ${product.aiVerdict?.isSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                          <ShieldAlert size={20} />
                                      </div>
                                      <div>
                                          <h5 className={`font-bold text-sm ${product.aiVerdict?.isSafe ? 'text-emerald-900' : 'text-rose-900'}`}>
                                              AI Trust Score: {product.aiVerdict?.qualityScore || '...'}%
                                          </h5>
                                          <p className="text-xs mt-1 text-gray-700">
                                              {product.aiVerdict?.reason || "Анализирую контент..."}
                                          </p>
                                          {product.aiVerdict?.flaggedIssues && product.aiVerdict.flaggedIssues.length > 0 && (
                                              <div className="flex gap-2 mt-2">
                                                  {product.aiVerdict.flaggedIssues.map(issue => (
                                                      <span key={issue} className="text-[10px] px-2 py-0.5 bg-rose-200 text-rose-800 rounded-full font-bold uppercase">{issue}</span>
                                                  ))}
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex gap-3 mt-6 justify-end">
                                  <Button 
                                    variant="outline" 
                                    className="border-rose-200 text-rose-600 hover:bg-rose-50" 
                                    onClick={() => handleModeration(product, 'rejected')}
                                    disabled={processingId === product.id}
                                  >
                                      <X size={16} className="mr-2" /> Отклонить
                                  </Button>
                                  <Button 
                                    className="bg-emerald-600 hover:bg-emerald-700" 
                                    onClick={() => handleModeration(product, 'approved')}
                                    disabled={processingId === product.id}
                                  >
                                      <Check size={16} className="mr-2" /> Опубликовать
                                  </Button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderSystemHealth = () => {
      if (!telemetry) return <div className="p-12 text-center text-gray-500 animate-pulse">Establishing connection to Cluster...</div>;

      return (
        <div className="space-y-6 animate-in fade-in">
            {/* Architecture Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Node Gateway */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700"><Server size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Node.js Gateway</h4>
                            <span className="text-[10px] text-gray-500">Orchestration Layer</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">RPS</span> <span className="font-mono font-medium">{telemetry.gateway.rps}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Active Sockets</span> <span className="font-mono font-medium">{telemetry.gateway.active_sockets}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Uptime</span> <span className="font-mono text-emerald-600">99.99%</span></div>
                    </div>
                </div>

                {/* Rust Core */}
                <div className="bg-white p-5 rounded-xl border-l-4 border-orange-500 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-700"><Zap size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Rust Core</h4>
                            <span className="text-[10px] text-gray-500">Mission Critical</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">TXs / sec</span> <span className="font-mono font-bold text-orange-600">{telemetry.rust.tx_per_sec}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Lock Contention</span> <span className="font-mono text-gray-900">{telemetry.rust.lock_contention}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Latency (p99)</span> <span className="font-mono text-gray-900">12ms</span></div>
                    </div>
                </div>

                {/* Python AI */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Cpu size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Python AI</h4>
                            <span className="text-[10px] text-gray-500">Intelligence Worker</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Queue Depth</span> <span className="font-mono font-medium">{telemetry.python.queue_depth}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">GPU Load</span> <span className="font-mono font-medium">{telemetry.python.gpu_load}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Model</span> <span className="font-mono text-[10px] text-gray-600">Gemini-Pro</span></div>
                    </div>
                </div>

                {/* Kafka */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-700"><Radio size={20} /></div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">Kafka Cluster</h4>
                            <span className="text-[10px] text-gray-500">Event Bus</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Throughput</span> <span className="font-mono font-medium">{telemetry.kafka.throughput}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Consumer Lag</span> <span className="font-mono font-medium text-emerald-600">0</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Brokers</span> <span className="font-mono font-medium">3/3 Online</span></div>
                    </div>
                </div>
            </div>

            {/* Live Logs Terminal */}
            <div className="bg-[#1e1e1e] rounded-xl p-4 shadow-xl border border-gray-800">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Terminal size={16} />
                        <span className="text-xs font-mono">Cluster Stdout</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <div className="font-mono text-xs h-48 overflow-hidden flex flex-col justify-end">
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">
                            <span className="text-gray-500">{log.split(']')[0]}]</span>
                            <span className={`
                                ${log.includes('RustCore') ? 'text-orange-400' : ''}
                                ${log.includes('PythonAI') ? 'text-blue-400' : ''}
                                ${log.includes('NodeGateway') ? 'text-emerald-400' : ''}
                                ${log.includes('Kafka') ? 'text-purple-400' : ''}
                            `}>{log.split(']')[1]}]</span>
                            <span className="text-gray-300">{log.split(']')[2]}</span>
                        </div>
                    ))}
                    <div className="animate-pulse text-gray-500 mt-1">_</div>
                </div>
            </div>
        </div>
      );
  };

  const renderSellers = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in">
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
                <p className="text-gray-500">Enterprise Orchestration Center</p>
            </div>
            <Button variant="outline" onClick={onLogout}>Выйти</Button>
        </div>

        <div className="flex gap-6 mb-8 border-b border-gray-100 pb-1">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                Обзор
            </button>
            <button 
                onClick={() => setActiveTab('moderation')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'moderation' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                Модерация ({pendingProducts.length})
            </button>
            <button 
                onClick={() => setActiveTab('sellers')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'sellers' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                Продавцы
            </button>
            <button 
                onClick={() => setActiveTab('system')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'system' ? 'border-purple-600 text-purple-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                <Server size={16} /> System Monitor
            </button>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'moderation' && renderModeration()}
        {activeTab === 'sellers' && renderSellers()}
        {activeTab === 'system' && renderSystemHealth()}
    </div>
  );
};
