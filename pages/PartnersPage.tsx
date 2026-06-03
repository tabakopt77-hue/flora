import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Database, CheckCircle, ArrowRight, Play, Zap, BarChart, ShoppingCart, Package, Store, RefreshCcw, Globe, LayoutDashboard, Clock, ShieldCheck, Cpu, Smartphone, CalendarDays, Rocket, Terminal, Sparkles, Flower } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PartnersPageProps {
  onJoin?: () => void;
}

interface LogItem {
  id: string;
  time: string;
  platform: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

export const PartnersPage: React.FC<PartnersPageProps> = ({ onJoin }) => {
  const platforms = [
    { 
      name: '1С:Предприятие', 
      bg: 'bg-[#ec4899]/5 border-[#ec4899]/20 hover:border-[#ec4899]/50 text-white hover:bg-[#ec4899]/10', 
      icon: Database, 
      delay: 0.1, 
      color: '#ec4899',
      xPercent: 38,
      yPercent: -38,
      desc: 'Полная фоновая выгрузка номенклатуры, синхронизация со складским учетом и автоматическое списание материалов.' 
    },
    { 
      name: 'Яндекс Маркет', 
      bg: 'bg-[#ffcc00]/5 border-[#ffcc00]/20 hover:border-[#ffcc00]/50 text-white hover:bg-[#ffcc00]/10', 
      icon: Store, 
      delay: 0.2, 
      color: '#ffcc00',
      xPercent: 40,
      yPercent: 35,
      desc: 'Передача актуального ассортимента, передача остатков на складе и автоматическая обработка заказов.' 
    },
    { 
      name: 'Wildberries', 
      bg: 'bg-white/5 border-white/10 hover:border-white/30 text-white hover:bg-white/10', 
      icon: Package, 
      delay: 0.3, 
      color: '#cbd5e1',
      xPercent: 0,
      yPercent: 45,
      desc: 'Синхронизация остатков срезанных цветов и готовых композиций, мгновенный автоконтроль цен.' 
    },
    { 
      name: 'Ozon', 
      bg: 'bg-[#005bff]/5 border-[#005bff]/20 hover:border-[#005bff]/50 text-white hover:bg-[#005bff]/10', 
      icon: ShoppingCart, 
      delay: 0.4, 
      color: '#005bff',
      xPercent: -40,
      yPercent: 35,
      desc: 'Автоматическая выгрузка каталога, синхронизация цен в реальном времени и моментальный импорт входящих заказов.' 
    },
    { 
      name: 'Avito', 
      bg: 'bg-[#10b981]/5 border-[#10b981]/20 hover:border-[#10b981]/50 text-white hover:bg-[#10b981]/10', 
      icon: Smartphone, 
      delay: 0.5, 
      color: '#10b981',
      xPercent: -38,
      yPercent: -38,
      desc: 'Автообновление цен розничных и оптовых букетов, импорт входящих обращений клиентов непосредственно в CRM.' 
    }
  ];

  const [logs, setLogs] = useState<LogItem[]>([
    { id: '1', time: '14:52:10', platform: '1С', message: 'Номенклатура синхронизирована: 18 позиций срезанных роз выгружены', type: 'success' },
    { id: '2', time: '14:52:04', platform: 'Ozon', message: 'Обновление остатков: букет "Аура любви" -> зарезервировано 2 шт', type: 'info' },
    { id: '3', time: '14:51:52', platform: 'Avito', message: 'Объявление "Пышные кустовые пионы тех-класса" обновлено, сорт добавлен в бота', type: 'success' }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pulseCount, setPulseCount] = useState(0);

  const logPool: Omit<LogItem, 'id' | 'time'>[] = [
    { platform: 'Ozon', message: 'Синхронизация цен: Сорт "Red Naomi" установлена цена 180 ₽', type: 'info' },
    { platform: 'Wildberries', message: 'Синхронизация остатков: Пионовидный сорт "Misty Bubbles" (остаток: 45 шт)', type: 'success' },
    { platform: 'Яндекс Маркет', message: 'Получен новый заказ #YM-99321. Зарезервировано 25 тюльпанов.', type: 'warn' },
    { platform: '1С', message: 'Выгрузка остатков завершена в фоновом режиме.', type: 'info' },
    { platform: 'Avito', message: 'Интеграция Avito: Сорт роз "Misty Bubbles" обновлен цена 210 ₽', type: 'success' },
    { platform: 'Ozon', message: 'Обновление остатков Ozon: Букет "Амурский поцелуй" -> 5 шт.', type: 'info' },
    { platform: 'Wildberries', message: 'Возврат по заказу #WB-3012 обработан в автоматическом режиме.', type: 'warn' },
    { platform: '1С', message: 'Выгрузка отчета о продажах за смену в 1С завершена успешно.', type: 'success' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const randomItem = logPool[Math.floor(Math.random() * logPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newLog: LogItem = {
        id: String(Date.now()),
        time: timeStr,
        ...randomItem
      };
      setLogs(prev => [newLog, ...prev.slice(0, 7)]);
      setPulseCount(p => p + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleManualSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setPulseCount(p => p + 3);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const triggerLog: LogItem = {
      id: String(Date.now() + 1),
      time: timeStr,
      platform: 'SYSTEM',
      message: 'Инициализирован принудительный API обмен по всем каналам...',
      type: 'info'
    };
    setLogs(prev => [triggerLog, ...prev]);

    setTimeout(() => {
      const now2 = new Date();
      const timeStr2 = now2.toTimeString().split(' ')[0];
      const resultLog: LogItem = {
        id: String(Date.now() + 2),
        time: timeStr2,
        platform: 'SYSTEM',
        message: '✓ Успешно синхронизировано: Ozon, Wildberries, Яндекс Маркет, 1С, Avito',
        type: 'success'
      };
      setLogs(prev => [resultLog, ...prev]);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="bg-[#030712] bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] min-h-screen text-slate-300 font-sans pb-24 selection:bg-[#10b981] selection:text-black relative overflow-hidden">
      {/* Premium ambient glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <Helmet>
        <title>Floramos для цветочного бизнеса</title>
      </Helmet>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 sm:pt-32 pb-20 text-center">
        
        <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.05]"
        >
            Управляйте цветочным бизнесом <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-black">из одного окна</span>
        </motion.h1>
        
        <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
        >
            Сайт, маркетплейсы, склад и учет в единой интеллектуальной системе с автоматической синхронизацией остатков и цен в реальном времени.
        </motion.p>
        
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
            <button 
                onClick={onJoin} 
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
                <Rocket size={18} />
                Начать бесплатно
            </button>
            <button 
                className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-white rounded-xl font-semibold text-base transition-all duration-200 backdrop-blur-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
                <Play size={16} className="fill-current text-slate-400" />
                Смотреть демо
            </button>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 uppercase tracking-wider"
        >
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> 14 дней бесплатно</span>
            <span className="hidden sm:inline text-slate-800">•</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Без привязки карты</span>
            <span className="hidden sm:inline text-slate-800">•</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Поможем с переносом данных</span>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Animated Data Flow Section */}
        <div className="py-20 relative">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Все витрины. Единый синхронный центр.</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                    Floramos бесшовно интегрируется с вашей IT-инфраструктурой. Любое изменение цены или продажа на любой площадке обновляются мгновенно во всех каналах одновременно.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
                {/* Left side Graph visualizer: Floramos in Center, 6 major platforms surrounding dynamically */}
                <div className="lg:col-span-7 flex justify-center">
                    <div className="relative w-full max-w-[480px] h-[480px] sm:max-w-[540px] sm:h-[540px] flex items-center justify-center rounded-[2.5rem] bg-slate-950/60 border border-slate-900 shadow-[0_0_80px_rgba(16,185,129,0.05)] p-6 overflow-visible select-none scale-[0.82] sm:scale-100 transition-transform">
                        
                        {/* Interactive Sonar-Ripple Sync Waves */}
                        <AnimatePresence>
                            {(isSyncing || pulseCount % 2 === 0) && (
                                <motion.div
                                    key={`ripple-${pulseCount}`}
                                    initial={{ scale: 0.6, opacity: 0.9 }}
                                    animate={{ scale: 1.8, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 3.5, ease: "easeOut" }}
                                    className="absolute w-44 h-44 rounded-full border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] pointer-events-none z-0"
                                />
                            )}
                        </AnimatePresence>

                        {/* Extra decorative cosmic ring tracking orbits */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-4/5 h-4/5 rounded-full border border-dashed border-slate-800/40 pointer-events-none z-0"
                        />
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-3/5 h-3/5 rounded-full border border-dashed border-slate-900/40 pointer-events-none z-0"
                        />

                        {/* Connection SVG Line Canvas */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                            {/* SVG Filters for premium bloom glows */}
                            <defs>
                                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {platforms.map((platform, index) => {
                                // Direct path projection coordinate (%)
                                const endX = 50 + platform.xPercent;
                                const endY = 50 + platform.yPercent;

                                const isHovered = hoveredIndex === index;

                                return (
                                    <g key={platform.name}>
                                        {/* Background Link Line with Soft Trace */}
                                        <line 
                                            x1="50%" 
                                            y1="50%" 
                                            x2={`${endX}%`} 
                                            y2={`${endY}%`} 
                                            stroke={isHovered ? platform.color : '#1e293b'} 
                                            strokeWidth={isHovered ? '3' : '1.5'}
                                            strokeDasharray={isHovered ? 'none' : '4, 6'}
                                            className="transition-all duration-350"
                                            opacity={isHovered ? '0.9' : '0.45'}
                                            filter={isHovered ? "url(#neon-glow)" : undefined}
                                        />

                                        {/* Outbound Sync Packet (Center -> Platform) */}
                                        <motion.circle
                                            cx="50%"
                                            cy="50%"
                                            r={isHovered ? '6' : '3.5'}
                                            fill={platform.color}
                                            animate={{
                                                cx: ["50%", `${endX}%`],
                                                cy: ["50%", `${endY}%`],
                                                opacity: [0, 1, 1, 0]
                                            }}
                                            transition={{
                                                duration: isSyncing ? 0.9 : 2.4,
                                                repeat: Infinity,
                                                delay: index * 0.35 + (isSyncing ? 0.05 : 0),
                                                ease: 'linear'
                                            }}
                                            className="shadow-[0_0_12px_currentColor]"
                                            style={{ filter: "drop-shadow(0px 0px 4px currentColor)" }}
                                        />

                                        {/* Inbound Sync Packet (Platform -> Center) */}
                                        <motion.circle
                                            cx={`${endX}%`}
                                            cy={`${endY}%`}
                                            r="2.5"
                                            fill={platform.color}
                                            animate={{
                                                cx: [`${endX}%`, "50%"],
                                                cy: [`${endY}%`, "50%"],
                                                opacity: [0, 0.8, 0.8, 0]
                                            }}
                                            transition={{
                                                duration: isSyncing ? 1.1 : 3.0,
                                                repeat: Infinity,
                                                delay: index * 0.45 + 0.2,
                                                ease: 'linear'
                                            }}
                                            style={{ filter: "drop-shadow(0px 0px 3px currentColor)" }}
                                        />

                                        {/* Immediate Active Pulses during manual sync or trigger */}
                                        {isSyncing && (
                                            <motion.circle
                                                cx="50%"
                                                cy="50%"
                                                r="5"
                                                fill="#10b981"
                                                animate={{
                                                    cx: ["50%", `${endX}%`],
                                                    cy: ["50%", `${endY}%`],
                                                    opacity: [0, 1, 0]
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: 2,
                                                    delay: index * 0.08,
                                                    ease: 'easeOut'
                                                }}
                                            />
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Central Sync Core: FLORAMOS */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, type: 'spring' }}
                            className="relative z-20 flex flex-col items-center justify-center w-36 h-36 md:w-44 md:h-44 bg-slate-950 border-2 border-emerald-500/40 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.25)] select-none shrink-0"
                        >
                            {/* Glowing internal radial base */}
                            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-pulse"></div>
                            
                            {/* Rotating dashed planetary orbits */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-2 rounded-full border border-dashed border-emerald-400/20"
                            />
                            
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-4 rounded-full border border-dashed border-slate-700/50"
                            />

                            {/* Rotating Flower Logo Core */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                                className="mb-2 text-emerald-400 z-10"
                            >
                                <Flower size={24} className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                            </motion.div>

                            {/* Floramos Title Brand */}
                            <span className="font-extrabold text-center text-sm md:text-base text-white tracking-tight z-10 px-3 uppercase bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                Floramos
                            </span>
                            
                            <span className="text-[7px] font-mono text-emerald-400 mt-1.5 z-10 tracking-[0.2em] uppercase font-black bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                                CORE ENGINE
                            </span>
                        </motion.div>

                        {/* Circular surrounding platforms - Beautifully floating out of sync */}
                        {platforms.map((platform, index) => {
                            // Gentle organic physics float sequence
                            const floatOffset = index * 0.4;
                            const isHovered = hoveredIndex === index;

                            return (
                                <div 
                                    key={platform.name}
                                    className="absolute z-20 flex items-center justify-center p-4 cursor-pointer"
                                    style={{
                                        left: `calc(50% + ${platform.xPercent}%)`,
                                        top: `calc(50% + ${platform.yPercent}%)`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ 
                                            opacity: 1, 
                                            scale: isHovered ? 1.08 : 1.0,
                                            y: [0, -7, 0],
                                            x: [0, 3, 0],
                                        }}
                                        transition={{
                                            opacity: { duration: 0.5, delay: 0.1 + platform.delay },
                                            y: { duration: 3.2 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: floatOffset },
                                            x: { duration: 4.0 + index * 0.3, repeat: Infinity, ease: "easeInOut", delay: floatOffset },
                                            scale: { duration: 0.2 }
                                        }}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[11px] sm:text-xs font-bold shadow-2xl transition-colors duration-300 border backdrop-blur-md select-none ${platform.bg}`}
                                        style={{
                                            boxShadow: isHovered ? `0 0 25px ${platform.color}30` : undefined,
                                        }}
                                    >
                                        <platform.icon size={14} style={{ color: platform.color }} className="shrink-0 filter drop-shadow-[0_0_3px_currentColor]" />
                                        <span className="tracking-wide text-white whitespace-nowrap">{platform.name}</span>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right side Monitoring Station - Beautiful Clean Actions & Logs */}
                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/40 border border-slate-800/80 rounded-[2rem] p-6 backdrop-blur-xl relative shadow-2xl overflow-hidden self-stretch min-h-[460px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    {/* Console Header */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Мониторинг сети
                            </div>
                            <span className="text-[10px] bg-slate-800/70 border border-slate-700/60 px-2.5 py-0.5 rounded-full text-slate-400 font-mono font-medium">
                                LIVE FLOW
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">История синхронизации</h3>
                        <p className="text-slate-400 text-xs mb-5 font-light leading-relaxed text-left">
                            Прямой поток логов обмена. Изменение на любой витрине автоматически синхронизируется во всех остальных каналах.
                        </p>
                    </div>

                    {/* Console Log Body */}
                    <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-850 h-[220px] overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-slate-800 font-sans text-xs space-y-2 text-left select-text relative">
                        <AnimatePresence initial={false}>
                            {logs.map((log) => {
                                const typeColors = {
                                    info: 'text-blue-400 bg-blue-500/5 border-blue-900/20',
                                    success: 'text-emerald-400 bg-emerald-500/5 border-emerald-900/20',
                                    warn: 'text-amber-400 bg-amber-500/5 border-amber-900/20'
                                };
                                return (
                                    <motion.div 
                                        key={log.id}
                                        initial={{ opacity: 0, x: 10, y: -5 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`p-2 rounded-lg border flex flex-col gap-1 ${typeColors[log.type] || 'text-slate-300'}`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] px-1.5 rounded-md bg-slate-900 text-slate-400 font-mono font-bold uppercase border border-slate-800 py-0.5 select-none shrink-0">{log.platform}</span>
                                            <span className="text-[9px] text-slate-500 font-mono font-normal select-none shrink-0">{log.time}</span>
                                        </div>
                                        <span className="break-words leading-relaxed">{log.message}</span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Trigger Manual Sync Test Action button */}
                    <div className="mt-auto pt-4 border-t border-slate-850 flex flex-col gap-3">
                        <button
                            onClick={handleManualSync}
                            disabled={isSyncing}
                            className={`w-full px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative overflow-hidden transition-all duration-200 active:scale-95 cursor-pointer ${
                                isSyncing 
                                    ? 'bg-emerald-950 border border-emerald-850 text-emerald-400 cursor-default' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                            }`}
                        >
                            <Zap size={13} className={isSyncing ? 'animate-bounce text-emerald-400' : 'text-slate-100'} />
                            <span>{isSyncing ? 'ОБНОВЛЕНИЕ ДАННЫХ...' : 'Проверить синхронизацию всех каналов'}</span>
                        </button>
                        <div className="text-[10px] text-slate-500 text-center font-medium">
                           Стабильность подключения: <span className="text-emerald-400 font-bold">100% OK</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Section with clean metric lines */}
        <div className="py-16 border-y border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 max-w-5xl mx-auto">
            <div className="text-center md:border-r border-slate-900 px-6">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">120+</div>
                <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Активных цветочных сетей</div>
            </div>
            <div className="text-center md:border-r border-slate-900 px-6">
                <div className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2 tracking-tight">50 000+</div>
                <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Букетов синхронизировано</div>
            </div>
            <div className="text-center px-6">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">200k+</div>
                <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Заказов за последний месяц</div>
            </div>
        </div>

        {/* Bento Grid layout for Pain Points Comparison */}
        <div className="py-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Больше никаких ручных обновлений</h2>
                <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">Избавьтесь от ошибок, пересортицы остатков и страха отменить заказ из-за отсутствия цветов.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Traditional Pain */}
                <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-8 md:p-10 hover:border-red-500/10 transition-colors duration-300">
                    <div className="text-red-400 font-bold text-lg mb-8 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        Классический подход без Floramos
                    </div>
                    <ul className="space-y-5">
                        <li className="flex gap-3 text-slate-400 text-sm md:text-base">
                            <span className="text-red-500 font-semibold shrink-0">✕</span>
                            <span>Ручное копирование карточек и заливка цен на Ozon и WB</span>
                        </li>
                        <li className="flex gap-3 text-slate-400 text-sm md:text-base">
                            <span className="text-red-500 font-semibold shrink-0">✕</span>
                            <span>Остатки не совпадают — букет продан на кассе, а на сайте он «в наличии»</span>
                        </li>
                        <li className="flex gap-3 text-slate-400 text-sm md:text-base">
                            <span className="text-red-500 font-semibold shrink-0">✕</span>
                            <span>Сбор заказов из 5 разных личных кабинетов маркетплейсов и мессенджеров</span>
                        </li>
                        <li className="flex gap-3 text-slate-400 text-sm md:text-base">
                            <span className="text-red-500 font-semibold shrink-0">✕</span>
                            <span>Долгая смена цен перед праздниками на каждой витрине отдельно</span>
                        </li>
                    </ul>
                </div>

                {/* Floramos Elite SaaS approach */}
                <div className="bg-slate-950/60 border border-emerald-500/10 hover:border-emerald-500/20 rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.03)] transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="text-emerald-400 font-bold text-lg mb-8 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Автоматизация с Floramos
                    </div>
                    <ul className="space-y-5">
                        <li className="flex gap-3 text-white text-sm md:text-base font-medium">
                            <span className="text-emerald-400 font-semibold shrink-0">✓</span>
                            <span>Массовый экспорт и автопубликация букетов по API в один клик</span>
                        </li>
                        <li className="flex gap-3 text-white text-sm md:text-base font-medium">
                            <span className="text-emerald-400 font-semibold shrink-0">✓</span>
                            <span>Мгновенная синхронизация склада при продажах офлайн и на маркетплейсах</span>
                        </li>
                        <li className="flex gap-3 text-white text-sm md:text-base font-medium">
                            <span className="text-emerald-400 font-semibold shrink-0">✓</span>
                            <span>Все заказы стекаются в единую умную канбан-доску сборки букетов</span>
                        </li>
                        <li className="flex gap-3 text-white text-sm md:text-base font-medium">
                            <span className="text-emerald-400 font-semibold shrink-0">✓</span>
                            <span>Автоматическая регулировка цен на всех витринах по заданным формулам</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        {/* High-fidelity interactive Holiday Trigger Area */}
        <div className="py-20 relative">
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
             <div className="bg-slate-950 border border-slate-900 rounded-[2.5rem] p-8 md:p-16 max-w-5xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
                        <CalendarDays size={26} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Сезонные пики и 8 марта без хаоса</h2>
                    <p className="text-slate-400 text-base md:text-lg mb-12 leading-relaxed">
                        Когда нагрузка возрастает на 800%, ручное управление неизбежно дает сбой. Floramos автоматически сдерживает поток изменений, регулирует остатки срезанных цветов и обеспечивает ритмичную работу вашего склада.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-sans">
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                        <Clock className="text-emerald-400 mb-4" size={24} />
                        <div className="text-white font-semibold text-base mb-1.5">В реальном времени</div>
                        <div className="text-slate-500 text-sm leading-relaxed">Скорость синхронизации изменений цен составляет менее 2 секунд.</div>
                    </div>
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                        <ShieldCheck className="text-emerald-400 mb-4" size={24} />
                        <div className="text-white font-semibold text-base mb-1.5">Никаких овербуков</div>
                        <div className="text-slate-500 text-sm leading-relaxed">Система резервирует партию цветов сразу после клика «купить».</div>
                    </div>
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                        <LayoutDashboard className="text-emerald-400 mb-4" size={24} />
                        <div className="text-white font-semibold text-base mb-1.5">Рабочий стол сборщика</div>
                        <div className="text-slate-500 text-sm leading-relaxed">Цветочные рецепты и состав каждого букета на экране планшета.</div>
                    </div>
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                        <Zap className="text-emerald-400 mb-4" size={24} />
                        <div className="text-white font-semibold text-base mb-1.5">Умный импорт</div>
                        <div className="text-slate-500 text-sm leading-relaxed">Быстрый импорт накладных от поставщиков из Колумбии и Эквадора.</div>
                    </div>
                </div>
             </div>
        </div>

        {/* AI Features (Ultra premium design) */}
        <div className="py-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Встроенный искусственный интеллект AI</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">Интеллектуальные ИИ-ассистенты для автоматической генерации описаний, SEO оптимизации и анализа рынка.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/50 hover:shadow-2xl transition-all duration-300 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                        <Cpu size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">AI Описания и SEO</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Нейросеть генерирует уникальные, эмоциональные и продающие тексты для карточек букетов, автоматически заполняя SEO-теги.
                    </p>
                </div>
                
                <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/50 hover:shadow-2xl transition-all duration-300 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                        <Smartphone size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">Распознавание сортов</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Просто сфотографируйте поставку цветов — наша нейросеть автоматически определит состав, сорта роз, пионов и создаст карточки.
                    </p>
                </div>

                <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/50 hover:shadow-2xl transition-all duration-300 rounded-2xl p-8 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                        <BarChart size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">Рекомендация цен</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Умный парсер анализирует средние цены конкурентов в вашем городе и формирует рекомендации для максимальной маржинальности.
                    </p>
                </div>
            </div>
        </div>

        {/* Steps Block */}
        <div className="py-20 border-t border-slate-900">
            <div className="text-center mb-16">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">Быстрый старт за 3 шага</h2>
                <p className="text-slate-400 text-base">Интеграция занимает около 15 минут. Личный менеджер окажет бесплатную помощь.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start max-w-4xl mx-auto">
                <div className="flex-grow flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-extrabold flex items-center justify-center border border-slate-800 shadow-xl mb-4 text-lg select-none">1</div>
                    <div className="font-semibold text-white mb-1.5">Регистрация</div>
                    <div className="text-xs text-slate-500 leading-relaxed max-w-xs">Создайте личный кабинет за 2 минуты. Мы не просим данные банковских карт.</div>
                </div>
                <div className="hidden md:flex pt-6 text-slate-800 shrink-0">
                    <ArrowRight size={20} />
                </div>
                <div className="flex-grow flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-extrabold flex items-center justify-center border border-slate-800 shadow-xl mb-4 text-lg select-none">2</div>
                    <div className="font-semibold text-white mb-1.5">Подключение каналов</div>
                    <div className="text-xs text-slate-500 leading-relaxed max-w-xs">Авторизуйте Ozon, Wildberries или Яндекс.Маркет с помощью ключей API.</div>
                </div>
                <div className="hidden md:flex pt-6 text-slate-800 shrink-0">
                    <ArrowRight size={20} />
                </div>
                <div className="flex-grow flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-4 text-lg select-none">3</div>
                    <div className="font-semibold text-white mb-1.5">Старт работы</div>
                    <div className="text-xs text-slate-500 leading-relaxed max-w-xs">Данные импортируются и связываются автоматически. Вы готовы принимать заказы!</div>
                </div>
            </div>
        </div>

        {/* Big Premium CTA */}
        <div className="py-20 text-center font-sans">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight max-w-3xl mx-auto">Начните автоматизацию вашего бизнеса прямо сейчас</h2>
            <button 
                onClick={onJoin} 
                className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer"
            >
                Запустить Floramos бесплатно
            </button>
            <p className="mt-6 text-slate-500 text-xs uppercase tracking-wider font-semibold">Откажитесь в любое время • Без обязательств</p>
        </div>

      </div>
    </div>
  );
};
