import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { Users, Receipt, CalendarClock, Calculator, UserPlus, Network, Coins } from 'lucide-react';

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.5,
      onUpdate(val) {
         setDisplayValue(val);
      }
    });
    return () => controls.stop();
  }, [value]);

  return <span>{Math.round(displayValue).toLocaleString('ru-RU')}</span>;
}

export default function MlmCalculator() {
  const [directFriends, setDirectFriends] = useState(15);
  const [avgOrder, setAvgOrder] = useState(3000);
  const [orderFreq, setOrderFreq] = useState(1);

  const [forecast, setForecast] = useState({
    lvl1: 0, lvl2: 0, lvl3: 0, lvl4: 0, lvl5: 0, total: 0,
    ppl1: 0, ppl2: 0, ppl3: 0, ppl4: 0, ppl5: 0,
    vol1: 0, vol2: 0, vol3: 0, vol4: 0, vol5: 0
  });

  useEffect(() => {
    // Assumptions for network growth based on direct friends
    const l1 = directFriends;
    const l2 = l1 * directFriends;
    const l3 = l2 * directFriends;
    const l4 = l3 * directFriends;
    const l5 = l4 * directFriends;

    const baseRevenue = avgOrder * orderFreq;

    const vol1 = l1 * baseRevenue;
    const vol2 = l2 * baseRevenue;
    const vol3 = l3 * baseRevenue;
    const vol4 = l4 * baseRevenue;
    const vol5 = l5 * baseRevenue;

    const r1 = 0.05 * vol1; 
    const r2 = 0.04 * vol2;
    const r3 = 0.03 * vol3;
    const r4 = 0.02 * vol4;
    const r5 = 0.01 * vol5;

    setForecast({
      lvl1: r1,
      lvl2: r2,
      lvl3: r3,
      lvl4: r4,
      lvl5: r5,
      total: r1 + r2 + r3 + r4 + r5,
      ppl1: l1,
      ppl2: l2,
      ppl3: l3,
      ppl4: l4,
      ppl5: l5,
      vol1: vol1,
      vol2: vol2,
      vol3: vol3,
      vol4: vol4,
      vol5: vol5
    });
  }, [directFriends, avgOrder, orderFreq]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        <div className="flex flex-col justify-center space-y-8 lg:col-span-5">
            <div>
                 <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Настройте свой доход</h3>
                 <p className="text-slate-400 text-sm">Передвигайте ползунки, чтобы увидеть потенциальную прибыль.</p>
            </div>

            <div className="space-y-8">
                {/* Sliders */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-white font-medium text-sm flex items-center gap-2">
                             <Users size={18} className="text-emerald-400" />
                             Сколько друзей пригласите?
                        </label>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">{directFriends} чел.</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={directFriends} 
                        onChange={(e) => setDirectFriends(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/50 accent-emerald-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-white font-medium text-sm flex items-center gap-2">
                             <Receipt size={18} className="text-emerald-400" />
                             Средний чек
                        </label>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">{avgOrder.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <input 
                        type="range" 
                        min="1000" 
                        max="20000" 
                        step="500"
                        value={avgOrder} 
                        onChange={(e) => setAvgOrder(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/50 accent-emerald-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-white font-medium text-sm flex items-center gap-2">
                             <CalendarClock size={18} className="text-emerald-400" />
                             Частота заказов в месяц
                        </label>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">{orderFreq}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={orderFreq} 
                        onChange={(e) => setOrderFreq(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700/50 accent-emerald-500"
                    />
                </div>
            </div>
        </div>

        <div className="bg-slate-900/60 rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-800/80 shadow-inner lg:col-span-7">
            <div className="text-slate-400 font-medium text-sm mb-2 uppercase tracking-wider text-center">Ваш доход (в месяц)</div>
            <div className="text-slate-500 text-xs text-center mb-6 max-w-[320px] mx-auto">
                *При условии, что каждый в вашей сети приглашает по {directFriends} человек(а), и они совершают регулярные заказы
            </div>

            <div className="grid grid-cols-[1fr_1.2fr_1.2fr] gap-2 px-1 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="text-left leading-tight">Уровень</div>
                <div className="text-center leading-tight">Оборот</div>
                <div className="text-right leading-tight">Прибыль</div>
            </div>

            <div className="space-y-3 mb-8">
                {[
                  { name: '1 уровень', val: forecast.lvl1, ppl: forecast.ppl1, vol: forecast.vol1 },
                  { name: '2 уровень', val: forecast.lvl2, ppl: forecast.ppl2, vol: forecast.vol2 },
                  { name: '3 уровень', val: forecast.lvl3, ppl: forecast.ppl3, vol: forecast.vol3 },
                  { name: '4 уровень', val: forecast.lvl4, ppl: forecast.ppl4, vol: forecast.vol4 },
                  { name: '5 уровень', val: forecast.lvl5, ppl: forecast.ppl5, vol: forecast.vol5 },
                ].map((lvl, i) => (
                    <div key={lvl.name} className="grid grid-cols-[1fr_1.2fr_1.2fr] items-center p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors gap-2">
                        <div className="flex flex-col text-left">
                            <span className="font-medium text-slate-300 text-[11px] sm:text-sm">{lvl.name}</span>
                            <span className="text-[10px] sm:text-xs text-emerald-400/80 mt-0.5 sm:mt-1">{lvl.ppl.toLocaleString('ru-RU')} чел.</span>
                        </div>
                        <div className="text-center">
                            <span className="font-medium text-slate-400 text-[11px] sm:text-sm break-words"><AnimatedNumber value={lvl.vol} /> ₽</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-white tracking-wide text-[11px] sm:text-sm break-words"><AnimatedNumber value={lvl.val} /> ₽</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="text-slate-400 font-medium">Итого:</div>
                 <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                     <AnimatedNumber value={forecast.total} /> ₽
                 </div>
            </div>
        </div>
      </div>

      {/* Breakdown explanations below the grid */}
      <div className="mt-12 grid md:grid-cols-3 gap-4 sm:gap-6 relative z-10 pt-8 border-t border-white/10">
          <div className="bg-slate-800/30 p-5 sm:p-6 text-left rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors flex flex-col items-start gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <UserPlus size={24} />
               </div>
               <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Вы приглашаете один раз</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                     Вам нужно пригласить друзей <span className="text-emerald-400">только на свой первый уровень</span>. Они регистрируются по вашей ссылке и становятся вашими прямыми партнерами.
                  </p>
               </div>
          </div>

          <div className="bg-slate-800/30 p-5 sm:p-6 text-left rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors flex flex-col items-start gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Network size={24} />
               </div>
               <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Сеть растет сама</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                     Дальше ваши друзья приглашают своих знакомых. Так формируются уровни со 2-го по 5-й <span className="text-emerald-400">уже без вашего прямого участия</span>.
                  </p>
               </div>
          </div>

          <div className="bg-slate-800/30 p-5 sm:p-6 text-left rounded-2xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors flex flex-col items-start gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Coins size={24} />
               </div>
               <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Процент с каждого заказа</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                     Все участники покупают цветы как обычно, а система автоматически <span className="text-emerald-400">начисляет вам комиссию</span> с каждой их покупки вплоть до 5 уровня.
                  </p>
               </div>
          </div>
      </div>
    </div>
  );
}
