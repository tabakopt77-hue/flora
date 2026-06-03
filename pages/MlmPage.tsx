import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Wallet, Users, ArrowRight, Link as LinkIcon, Gift, ChevronDown, DollarSign, Heart } from 'lucide-react';
import MlmNetworkVisualizer from '../components/MlmNetworkVisualizer';
import MlmCalculator from '../components/MlmCalculator';
import FloramosMascot from '../components/FloramosMascot';

interface MlmPageProps {
  onJoin?: () => void;
}

const TypewriterDisclaimer = () => {
    const text = "Демонстрационный режим: Все цифры, пользователи и расчеты в калькуляторе и структуре ниже являются тестовыми и приведены исключительно для визуализации финансовой модели.";
    const [displayedText, setDisplayedText] = useState("");
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;
        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(intervalId);
        }, 30);
        return () => clearInterval(intervalId);
    }, [hasStarted]);

    return (
        <motion.div 
            onViewportEnter={() => setHasStarted(true)}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 flex items-center justify-center text-center max-w-3xl mx-auto px-4"
        >
            <p className="text-slate-400 font-mono text-xs sm:text-sm leading-relaxed tracking-tight">
                <span className="text-emerald-500/70 mr-2">{'>_'}</span>
                {displayedText}
                <motion.span 
                    animate={{ opacity: [1, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2.5 h-3 sm:h-4 bg-emerald-500/50 translate-y-0.5 ml-1"
                />
            </p>
        </motion.div>
    );
};

export const MlmPage: React.FC<MlmPageProps> = ({ onJoin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroFriends, setHeroFriends] = useState(15);
  const [heroCheck, setHeroCheck] = useState(3000);

  const stats = [
    { label: "Партнеров", val: "15" },
    { label: "Выплачено", val: "14 250 ₽" },
    { label: "Заказов", val: "48" },
    { label: "Средний доход", val: "950 ₽" }
  ];

  const faqs = [
    { q: 'Как работают уровни приглашений и с кого я зарабатываю?', a: 'Вы получаете процент с покупок не только от тех, кого пригласили лично вы (1 уровень), но и от тех, кого пригласят они (2 уровень), их приглашенных (3 уровень) и так далее до 5 уровня в глубину. В калькуляторе "10 человек" означает, что каждый партнёр на любом уровне пригласит еще 10 человек, создавая геометрическую прогрессию вашей сети.' },
    { q: 'Как начисляются комиссии?', a: 'Комиссии начисляются автоматически при каждой успешной покупке в вашей структуре до 5 уровня в глубину.' },
    { q: 'Когда выплаты?', a: 'Выплаты производятся каждую неделю без задержек.' },
    { q: 'Можно ли выводить на карту?', a: 'Да, вывод средств доступен на любую банковскую карту.' },
    { q: 'Есть ли ограничения?', a: 'Нет, вы можете приглашать неограниченное число личных партнеров.' }
  ];

  const toggleFaq = (idx: number) => {
     setOpenFaq(openFaq === idx ? null : idx);
  };

  const scrollToCalculator = () => {
      document.getElementById('mlm-calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0f172a] min-h-screen text-slate-300 font-sans pb-20 selection:bg-emerald-500 selection:text-white relative font-sans">
      
      <Helmet>
        <title>Партнерская программа | Floramos</title>
      </Helmet>

      {/* Block 1: Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 sm:pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-left">
                <motion.h1 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]"
                >
                    Зарабатывайте на рекомендациях <span className="text-emerald-400">Floramos</span>
                </motion.h1>
                
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg sm:text-2xl text-slate-400 max-w-lg mb-8 leading-snug font-medium"
                >
                    <p className="text-white mb-1">Дарите цветы.</p>
                    <p className="text-emerald-300 mb-1">Получайте вознаграждение.</p>
                    <p className="text-base sm:text-lg">Приглашайте друзей и получайте до 5 уровней комиссий.</p>
                </motion.div>
                
                <div className="relative w-full mt-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 relative z-10 sm:ml-4 lg:ml-12"
                    >
                        <div className="relative w-full sm:w-auto">
                            <button onClick={onJoin} className="relative w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-base transition-all shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_40px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center">
                                Получить партнерскую ссылку
                            </button>
                        </div>
                        <button onClick={scrollToCalculator} className="relative w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-base transition-all active:scale-95 flex items-center justify-center backdrop-blur-md">
                            Сколько я могу заработать?
                        </button>
                    </motion.div>
                </div>
                
                {/* Mobile mascot display if it wraps */}
                <div className="sm:hidden mt-10 mb-4 flex justify-center w-full relative">
                     <FloramosMascot className="scale-100 origin-top pointer-events-none" />
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-400"
                >
                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Без вложений</span>
                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Выплаты каждую неделю</span>
                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Доход с 5 уровней</span>
                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Мгновенная регистрация</span>
                </motion.div>
            </div>
            
            <div className="hidden lg:flex justify-center flex-col items-center relative mt-12 lg:mt-0">
                 <div className="absolute -top-[70px] right-[10%] z-30 pointer-events-none">
                     <FloramosMascot className="scale-100 origin-bottom" />
                 </div>
                 <div className="w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                 {/* Compact Profit Calculator */}
                 <motion.div 
                     initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
                     animate={{ opacity: 1, scale: 1, rotate: 0 }}
                     transition={{ type: "spring", duration: 1, delay: 0.2 }}
                     className="relative z-10 bg-slate-900/80 border border-emerald-500/20 p-8 rounded-[2rem] w-full max-w-md backdrop-blur-3xl shadow-[0_20px_50px_rgba(16,185,129,0.15)]"
                 >
                     <div className="text-center mb-6">
                         <h3 className="text-2xl font-bold text-white tracking-tight">Подсчет прибыли</h3>
                         <p className="text-slate-400 text-sm mt-1">Тестовые расчеты заработка</p>
                     </div>
                     
                     <div className="space-y-4 mb-6">
                         <div className="bg-white/5 p-4 rounded-xl border border-white/5 transition-colors">
                             <div className="flex justify-between items-center mb-3">
                                 <div className="text-sm font-medium text-white flex items-center gap-2"><Users size={16} className="text-emerald-400" /> Приглашенные друзья</div>
                                 <div className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded">{heroFriends} чел.</div>
                             </div>
                             <input 
                                 type="range" 
                                 min="1" 
                                 max="30" 
                                 value={heroFriends} 
                                 onChange={(e) => setHeroFriends(Number(e.target.value))}
                                 className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-800 accent-emerald-500 block"
                             />
                         </div>
                         <div className="bg-white/5 p-4 rounded-xl border border-white/5 transition-colors">
                             <div className="flex justify-between items-center mb-3">
                                 <div className="text-sm font-medium text-white flex items-center gap-2"><Wallet size={16} className="text-emerald-400" /> Средний чек сети</div>
                                 <div className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded">{heroCheck.toLocaleString('ru-RU')} ₽</div>
                             </div>
                            <input 
                                 type="range" 
                                 min="1000" 
                                 max="10000" 
                                 step="500"
                                 value={heroCheck} 
                                 onChange={(e) => setHeroCheck(Number(e.target.value))}
                                 className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-800 accent-emerald-500 block"
                             />
                         </div>
                     </div>
                     
                     <div className="bg-slate-950/50 rounded-2xl p-6 mb-6 border border-white/5 text-center shadow-inner">
                         <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Примерный доход в месяц</div>
                         <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 break-words">
                             {Math.round(((heroFriends * heroFriends * heroFriends * heroFriends * heroFriends * heroCheck * 0.01) + (heroFriends * heroFriends * heroFriends * heroFriends * heroCheck * 0.02) + (heroFriends * heroFriends * heroFriends * heroCheck * 0.03) + (heroFriends * heroFriends * heroCheck * 0.04) + (heroFriends * heroCheck * 0.05))).toLocaleString('ru-RU')} ₽
                         </div>
                         <div className="text-xs text-slate-500 mt-2">при {heroFriends} личных партнерах (каждый пригласил по {heroFriends})</div>
                     </div>
                     
                     <button onClick={() => document.getElementById('mlm-calculator-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full mt-6 py-4 rounded-xl border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2">
                         Открыть полный калькулятор <ChevronDown size={18} />
                     </button>
                 </motion.div>
            </div>
        </div>
      </div>

      {/* Block 6: Counters */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {stats.map((stat, i) => (
                  <div key={i} className="text-center group">
                      <div className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-3xl font-black text-white tracking-tight group-hover:scale-105 transition-transform">{stat.val}</div>
                  </div>
               ))}
            </div>
        </div>
      </div>

      {/* Block 3: Calculator */}
      <div id="mlm-calculator-section" className="py-24 relative z-20 border-t border-white/5 bg-slate-900/40">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 relative z-10">
               <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Рассчитайте свою прибыль</h2>
               <p className="text-slate-400 text-lg">Посмотрите, как работает партнерская программа на практике.</p>
            </div>
            
            {/* Test Data Disclaimer */}
            <TypewriterDisclaimer />
            
            <MlmCalculator />
         </div>
      </div>

      {/* Philosophy Section */}
      <div className="py-28 relative z-10 overflow-hidden bg-[#0A0A0B]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Вместе мы сильнее</h2>
                <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">Почему мы выбрали путь распределения прибыли с клиентами, а не с корпорациями.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-white/[0.03] border border-white/[0.08] p-8 md:p-10 rounded-[32px] hover:bg-white/[0.05] transition-all duration-300 hover:border-emerald-500/30 group">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Users size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Награждаем вас, а не гигантов</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Мы принципиально <span className="text-emerald-400 font-medium tracking-wide">не тратим бюджеты на рекламу</span> технологических корпораций. Вместо этого мы щедро вознаграждаем наших клиентов за рекомендации.
                    </p>
                </div>
                
                <div className="bg-white/[0.03] border border-white/[0.08] p-8 md:p-10 rounded-[32px] hover:bg-white/[0.05] transition-all duration-300 hover:border-emerald-500/30 group">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Wallet size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Справедливая экономика</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Крупным компаниям хватит забирать все себе. Мы создаем систему, где <span className="text-white font-medium">прибыль распределяется честно</span> между всеми участниками сети.
                    </p>
                </div>
                
                <div className="bg-white/[0.03] border border-white/[0.08] p-8 md:p-10 rounded-[32px] hover:bg-white/[0.05] transition-all duration-300 hover:border-emerald-500/30 group">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                        <Heart size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Люди важнее ботов</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Закончилась эра безумной экономии. Floramos выбирает другой путь развития, где в центре внимания всегда <span className="text-white font-medium">стоит живой человек</span>.
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Block 4: Visualizer */}
      <div id="mlm-tree-section" className="py-24 relative overflow-hidden bg-slate-900 border-y border-white/5">
         <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 relative z-10">
               <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Как растет ваша сеть</h2>
               <p className="text-slate-400 text-lg">Автоматические начисления с каждого уровня в реальном времени.</p>
            </div>
            
            <div className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 shadow-2xl relative backdrop-blur-md pb-6 overflow-hidden max-w-6xl mx-auto">
                <MlmNetworkVisualizer />
            </div>
         </div>
      </div>

      {/* Block 7: How it works */}
      <div className="py-24 max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Как это работает</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-start justify-between relative gap-6 md:gap-4">
              <div className="hidden md:block absolute top-[40px] left-[10%] w-[80%] h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent z-0"></div>
              
              {[
                  { step: 1, title: 'Получаете ссылку' },
                  { step: 2, title: 'Делитесь ссылкой' },
                  { step: 3, title: 'Человек покупает' },
                  { step: 4, title: 'Получаете комиссию' },
                  { step: 5, title: 'Строите сеть до 5 уровней' },
              ].map((item, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center bg-[#0f172a] md:bg-transparent px-4 py-2 w-full md:w-1/5 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 font-bold text-xl mb-6 shadow-xl relative overflow-hidden group">
                          {item.step}
                          <div className="absolute inset-0 bg-emerald-500/20 w-0 group-hover:w-full transition-all duration-300"></div>
                      </div>
                      <div className="text-white font-bold text-lg md:text-base leading-tight">{item.title}</div>
                      {i < 4 && <ArrowRight className="md:hidden text-slate-700 my-6" />}
                  </div>
              ))}
          </div>
      </div>

      {/* Block 5: Social Proof */}
      <div className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Реальные результаты</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 {[
                   { name: 'Партнер Иван', inc: '87 400 ₽' },
                   { name: 'Партнер Ольга', inc: '123 800 ₽' },
                   { name: 'Партнер Алексей', inc: '65 900 ₽' }
                 ].map((p, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl text-center backdrop-blur-xl transition-transform hover:-translate-y-2">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-6 flex items-center justify-center text-emerald-400">
                            <DollarSign size={24} />
                        </div>
                        <div className="text-white font-bold text-xl mb-4">{p.name}</div>
                        <div className="text-slate-400 text-sm uppercase tracking-widest mb-2">Доход за месяц:</div>
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{p.inc}</div>
                    </div>
                 ))}
              </div>
          </div>
      </div>

      {/* Block 8: FAQ */}
      <div className="py-24 max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-black text-white mb-6">FAQ</h2>
          </div>
          <div className="space-y-4">
              {faqs.map((faq, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg">
                      <button 
                         onClick={() => toggleFaq(i)}
                         className="w-full flex items-center justify-between p-6 text-left"
                      >
                         <span className="text-white font-bold text-lg">{faq.q}</span>
                         <ChevronDown className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                          {openFaq === i && (
                              <motion.div 
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="px-6 pb-6 text-slate-400 overflow-hidden"
                              >
                                 {faq.a}
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
