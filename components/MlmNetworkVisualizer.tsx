import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Info, Wallet } from 'lucide-react';

function AnimatedBalance({ value }: { value: number }) {
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

// Color map for levels exactly like screenshot
const levelConfig = [
  { level: 1, percent: 5, color: '#6366f1', name: '1-й уровень', bg: 'bg-[#6366f1]' },
  { level: 2, percent: 4, color: '#f59e0b', name: '2-й уровень', bg: 'bg-[#f59e0b]' },
  { level: 3, percent: 3, color: '#10b981', name: '3-й уровень', bg: 'bg-[#10b981]' },
  { level: 4, percent: 2, color: '#8b5cf6', name: '4-й уровень', bg: 'bg-[#8b5cf6]' },
  { level: 5, percent: 1, color: '#f43f5e', name: '5-й уровень', bg: 'bg-[#f43f5e]' },
];

export default function MlmNetworkVisualizer() {
  const [particles, setParticles] = useState<{id: number, x: number, y: number, lvl: number, amount: number}[]>([]);
  const [liveBalance, setLiveBalance] = useState(0);
  const CANVAS_SIZE = 600;
  const CENTER = CANVAS_SIZE / 2;

  // Build the network nodes organically
  const nodes = useMemo(() => {
    const list: { id: string, x: number, y: number, r: number, color: string, lvl: number }[] = [];
    
    // Rings
    const layers = [
      { radius: 60, lvl: 1, count: 6 },
      { radius: 110, lvl: 2, count: 12 },
      { radius: 170, lvl: 3, count: 18 },
      { radius: 230, lvl: 4, count: 24 },
      { radius: 290, lvl: 5, count: 32 },
    ];

    layers.forEach((layer) => {
      const config = levelConfig[layer.lvl - 1];
      for (let i = 0; i < layer.count; i++) {
        const angle = (i * (Math.PI * 2)) / layer.count + (layer.lvl % 2 === 0 ? 0.3 : 0);
        list.push({
          id: `node-${layer.lvl}-${i}`,
          x: CENTER + Math.cos(angle) * layer.radius,
          y: CENTER + Math.sin(angle) * layer.radius,
          r: 5,
          lvl: layer.lvl,
          color: config.color
        });
      }
    });

    return { list, layers };
  }, []);

  // Generate random flying particles
  useEffect(() => {
    const interval = setInterval(() => {
       const randomNode = nodes.list[Math.floor(Math.random() * nodes.list.length)];
       const amountOptions = [120, 250, 400, 650, 1000];
       const randomAmount = amountOptions[Math.floor(Math.random() * amountOptions.length)];
       
       const newParticle = {
          id: Date.now() + Math.random(),
          x: randomNode.x,
          y: randomNode.y,
          lvl: randomNode.lvl,
          amount: randomAmount
       };
       setParticles(prev => [...prev.slice(-8), newParticle]);

       setTimeout(() => {
          setLiveBalance(prev => prev + randomAmount);
       }, 2200);
    }, 1500);
    return () => clearInterval(interval);
  }, [nodes.list]);

  return (
    <div className="w-full relative px-6 py-6 md:py-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#151515]">
      
      {/* Left Column: Guidelines & Legend */}
      <div className="lg:col-span-5 space-y-6 max-w-lg mx-auto lg:mx-0 w-full">
         <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
             <div className="relative z-10 flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                     <Wallet size={16} />
                     Заработано прямо сейчас
                 </div>
             </div>
             <div className="relative z-10 text-4xl font-black text-white">
                 <AnimatedBalance value={liveBalance} /> ₽
             </div>
         </div>

         <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-white/5 shadow-xl">
             <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                 <Info size={20} className="text-indigo-400" />
                 Принцип работы
             </div>
             <p className="text-slate-400 text-sm leading-relaxed">
                 Каждый раз, когда любой партнёр в вашей сети до 5-го уровня совершает покупку, комиссия автоматически перечисляется на ваш баланс.
             </p>
         </div>

         <div className="space-y-3">
             {levelConfig.map(lvl => (
                 <div key={lvl.level} className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-[#1c1c1e] hover:bg-white/5 transition-colors group">
                     <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded-full ${lvl.bg} shadow-[0_0_10px_${lvl.color}60]`}></div>
                         <span className="text-white font-semibold text-sm">{lvl.name}</span>
                     </div>
                     <span className={`font-bold text-lg`} style={{ color: lvl.color }}>{lvl.percent}%</span>
                 </div>
             ))}
         </div>
      </div>

      {/* Right Column: Visualization */}
      <div className="lg:col-span-7 flex justify-center w-full relative">
         <div className="w-full max-w-[600px] aspect-square relative bg-[#0f0f11] rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center">
             
             {/* Concentric SVG rings */}
             <svg width="100%" height="100%" viewBox="0 0 600 600" className="absolute inset-0 z-0">
                {nodes.layers.map(layer => (
                    <circle 
                        key={`ring-${layer.lvl}`}
                        cx={CENTER} 
                        cy={CENTER} 
                        r={layer.radius} 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.08)" 
                        strokeWidth="1" 
                    />
                ))}
             </svg>

             {/* Static Nodes */}
             {nodes.list.map(node => (
                 <div 
                   key={node.id} 
                   className="absolute rounded-full"
                   style={{
                       left: `${(node.x / CANVAS_SIZE) * 100}%`,
                       top: `${(node.y / CANVAS_SIZE) * 100}%`,
                       width: 10,
                       height: 10,
                       backgroundColor: node.color,
                       transform: 'translate(-50%, -50%)',
                       boxShadow: `0 0 8px ${node.color}80`
                   }}
                 />
             ))}

             {/* Center "YOU" Node */}
             <div className="absolute w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_30px_rgba(99,102,241,0.6)] z-20" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                 ВЫ
             </div>
             
             {/* Center Glow */}
             <div className="absolute w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}></div>

             {/* Animated Flying Particles */}
             <AnimatePresence>
                 {particles.map(p => {
                     const config = levelConfig[p.lvl - 1];
                     return (
                         <motion.div
                           key={p.id}
                           initial={{ 
                               left: `${(p.x / CANVAS_SIZE) * 100}%`, 
                               top: `${(p.y / CANVAS_SIZE) * 100}%`, 
                               opacity: 0, 
                               scale: 0.5 
                           }}
                           animate={{ 
                               left: '50%', 
                               top: '50%', 
                               opacity: [0, 1, 1, 0],
                               scale: [0.5, 1.2, 1, 0.5]
                           }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 2.5, ease: "easeInOut" }}
                           className="absolute z-30 flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
                           style={{ color: config.color }}
                         >
                             <div 
                                className="px-2 py-1 rounded-full text-[10px] font-bold shadow-lg"
                                style={{ 
                                    backgroundColor: `${config.color}30`, 
                                    border: `1px solid ${config.color}50`, 
                                    backdropFilter: 'blur(4px)' 
                                }}
                             >
                                +{p.amount} ₽
                             </div>
                             <span className="text-[8px] mt-0.5 font-bold uppercase tracking-wider opacity-80" style={{ color: config.color }}>lvl {p.lvl}</span>
                         </motion.div>
                     );
                 })}
             </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
