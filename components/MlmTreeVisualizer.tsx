import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter, 
  Layers, 
  ArrowUpRight, 
  Activity, 
  Percent, 
  Award,
  CreditCard,
  Briefcase,
  GitCommit,
  Sparkles,
  RefreshCw,
  Globe,
  CornerDownRight
} from 'lucide-react';

// Interfaces for partners hierarchy
interface PartnerNode {
  id: string;
  name: string;
  level: number;
  region: string;
  joinedDate: string;
  salesVolume: number; // Volume in RUB
  tier: 'Elite' | 'Pro' | 'Active' | 'Starter';
  subCount: number;
  avatarColor: string;
  parentId: string | null;
  children?: PartnerNode[];
}

interface MlmTreeVisualizerProps {
  baseAverageCheck?: number;
  baseFriendsCount?: number;
  onSelectPartner?: (partnerName: string) => void;
}

export default function MlmTreeVisualizer({ 
  baseAverageCheck = 8000, 
  baseFriendsCount = 10,
  onSelectPartner
}: MlmTreeVisualizerProps) {
  // Configurable local states for the tree simulation
  const [averageCheck, setAverageCheck] = useState<number>(baseAverageCheck);
  const [friendsCount, setFriendsCount] = useState<number>(baseFriendsCount);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('root');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'root': true,
    'node-1': true,
    'node-2': true,
  });

  // Commission percents for 5 levels (T-Bank model)
  const levelSettings = [
    { level: 1, percent: 10, color: 'text-black bg-[#fed600] font-bold border-none rounded-sm px-1', circleColor: 'bg-[#fed600]' },
    { level: 2, percent: 5, color: 'text-slate-300 bg-[#27272a] border-white/10 font-medium', circleColor: 'bg-slate-500' },
    { level: 3, percent: 3, color: 'text-slate-300 bg-[#27272a] border-white/10 font-medium', circleColor: 'bg-slate-400' },
    { level: 4, percent: 2, color: 'text-slate-300 bg-[#27272a] border-white/10 font-medium', circleColor: 'bg-slate-400' },
    { level: 5, percent: 1, color: 'text-slate-300 bg-[#27272a] border-white/10 font-medium', circleColor: 'bg-slate-400' },
  ];

  const levelDescriptions: Record<string | number, string> = {
    all: 'Отображение всей структуры ваших партнеров в виде иерархического дерева. Нажмите на любого партнера, чтобы посмотреть детальную сводку его доходов.',
    1: 'Ваш 1-й уровень (Личные партнеры L1): люди, которых вы пригласили лично по ссылке. Вы получаете 10% от суммы их заказов.',
    2: 'Ваш 2-й уровень (L2): приглашенные вашими личными партнерами (L1). Вы получаете пассивный доход 5% с их заказов.',
    3: 'Ваш 3-й уровень (L3): партнеры, которых пригласила ваша L2. Вы получаете 3% пассивного дохода с их заказов.',
    4: 'Ваш 4-й уровень (L4): партнеры, которых пригласила ваша L3. Вы получаете 2% пассивного дохода с их заказов.',
    5: 'Ваш 5-й уровень (L5): партнеры, которых пригласила ваша L4. Вы получаете 1% пассивного дохода с их заказов.'
  };

  // Seed dynamic participants data mimicking a real MLM structure in Stripe Design Language
  const mlmTreeData = useMemo<PartnerNode>(() => {
    // Math helpers based on sliders
    const scaleFactor = friendsCount / 10;
    
    return {
      id: 'root',
      name: 'Вы (Амбассадор)',
      level: 0,
      region: 'Центральный офис',
      joinedDate: '12 Янв 2026',
      salesVolume: Math.round(50000 * scaleFactor),
      tier: 'Elite',
      subCount: Math.round(48 * scaleFactor),
      avatarColor: 'from-[#fed600] to-[#eab308]',
      parentId: null,
      children: [
        {
          id: 'node-1',
          name: 'Анна Ковальчук',
          level: 1,
          region: 'Москва',
          joinedDate: '19 Янв 2026',
          salesVolume: Math.round(24000 * scaleFactor),
          tier: 'Elite',
          subCount: Math.round(22 * scaleFactor),
          avatarColor: 'from-indigo-500 to-[#6366f1]',
          parentId: 'root',
          children: [
            {
              id: 'node-1-1',
              name: 'Мария Виноградова',
              level: 2,
              region: 'Санкт-Петербург',
              joinedDate: '01 Фев 2026',
              salesVolume: Math.round(16000 * scaleFactor),
              tier: 'Pro',
              subCount: Math.round(11 * scaleFactor),
              avatarColor: 'from-purple-500 to-indigo-500',
              parentId: 'node-1',
              children: [
                {
                  id: 'node-1-1-1',
                  name: 'Елена Баранова',
                  level: 3,
                  region: 'Краснодар',
                  joinedDate: '14 Фев 2026',
                  salesVolume: Math.round(8000 * scaleFactor),
                  tier: 'Active',
                  subCount: Math.round(5 * scaleFactor),
                  avatarColor: 'from-pink-500 to-purple-500',
                  parentId: 'node-1-1',
                  children: [
                    {
                      id: 'node-1-1-1-1',
                      name: 'Даниил Морозов',
                      level: 4,
                      region: 'Сочи',
                      joinedDate: '20 Фев 2026',
                      salesVolume: Math.round(6000 * scaleFactor),
                      tier: 'Active',
                      subCount: Math.round(2 * scaleFactor),
                      avatarColor: 'from-emerald-500 to-green-500',
                      parentId: 'node-1-1-1',
                      children: [
                        {
                          id: 'node-1-1-1-1-1',
                          name: 'Алина Закирова',
                          level: 5,
                          region: 'Адлер',
                          joinedDate: '28 Фев 2026',
                          salesVolume: Math.round(8000 * scaleFactor),
                          tier: 'Starter',
                          subCount: 0,
                          avatarColor: 'from-cyan-500 to-blue-500',
                          parentId: 'node-1-1-1-1',
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'node-1-2',
              name: 'Алексей Денисов',
              level: 2,
              region: 'Нижний Новгород',
              joinedDate: '07 Фев 2026',
              salesVolume: Math.round(12000 * scaleFactor),
              tier: 'Active',
              subCount: Math.round(4 * scaleFactor),
              avatarColor: 'from-blue-500 to-indigo-500',
              parentId: 'node-1',
              children: [
                {
                  id: 'node-1-2-1',
                  name: 'Светлана Фомина',
                  level: 3,
                  region: 'Киров',
                  joinedDate: '18 Фев 2026',
                  salesVolume: Math.round(8000 * scaleFactor),
                  tier: 'Starter',
                  subCount: 0,
                  avatarColor: 'from-violet-500 to-pink-500',
                  parentId: 'node-1-2',
                }
              ]
            }
          ]
        },
        {
          id: 'node-2',
          name: 'Сергей Морозов',
          level: 1,
          region: 'Казань',
          joinedDate: '22 Янв 2026',
          salesVolume: Math.round(32000 * scaleFactor),
          tier: 'Elite',
          subCount: Math.round(18 * scaleFactor),
          avatarColor: 'from-sky-500 to-teal-500',
          parentId: 'root',
          children: [
            {
              id: 'node-2-1',
              name: 'Артем Волков',
              level: 2,
              region: 'Самара',
              joinedDate: '10 Фев 2026',
              salesVolume: Math.round(18000 * scaleFactor),
              tier: 'Pro',
              subCount: Math.round(8 * scaleFactor),
              avatarColor: 'from-emerald-400 to-teal-500',
              parentId: 'node-2',
              children: [
                {
                  id: 'node-2-1-1',
                  name: 'Ксения Лебедева',
                  level: 3,
                  region: 'Тольятти',
                  joinedDate: '21 Фев 2026',
                  salesVolume: Math.round(8000 * scaleFactor),
                  tier: 'Active',
                  subCount: Math.round(2 * scaleFactor),
                  avatarColor: 'from-[#ff4081] to-purple-500',
                  parentId: 'node-2-1',
                }
              ]
            },
            {
              id: 'node-2-2',
              name: 'Наталья Косенко',
              level: 2,
              region: 'Уфа',
              joinedDate: '12 Фев 2026',
              salesVolume: Math.round(14000 * scaleFactor),
              tier: 'Active',
              subCount: Math.round(4 * scaleFactor),
              avatarColor: 'from-purple-500 to-pink-500',
              parentId: 'node-2',
            }
          ]
        },
        {
          id: 'node-3',
          name: 'Ольга Соколова',
          level: 1,
          region: 'Екатеринбург',
          joinedDate: '02 Фев 2026',
          salesVolume: Math.round(16000 * scaleFactor),
          tier: 'Active',
          subCount: Math.round(8 * scaleFactor),
          avatarColor: 'from-amber-400 to-orange-500',
          parentId: 'root',
          children: [
            {
              id: 'node-3-1',
              name: 'Егор Кравцов',
              level: 2,
              region: 'Челябинск',
              joinedDate: '15 Фев 2026',
              salesVolume: Math.round(8000 * scaleFactor),
              tier: 'Starter',
              subCount: 0,
              avatarColor: 'from-yellow-500 to-indigo-500',
              parentId: 'node-3',
            }
          ]
        }
      ]
    };
  }, [friendsCount]);

  // Recursively flatter out node array to easily search and analyze
  const flatNodesList = useMemo(() => {
    const list: PartnerNode[] = [];
    const traverse = (node: PartnerNode) => {
      list.push(node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(mlmTreeData);
    return list;
  }, [mlmTreeData]);

  // Find the currently selected node
  const selectedNode = useMemo(() => {
    return flatNodesList.find(n => n.id === selectedNodeId) || mlmTreeData;
  }, [flatNodesList, selectedNodeId, mlmTreeData]);

  // Get active downlines of the selected node
  const selectedNodeDownline = useMemo(() => {
    const list: PartnerNode[] = [];
    const traverse = (node: PartnerNode) => {
      if (node.id !== selectedNode.id) {
        list.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(selectedNode);
    return list;
  }, [selectedNode]);

  // Yield total active metrics in downline
  const nodeStats = useMemo(() => {
    const subVolume = selectedNodeDownline.reduce((acc, curr) => acc + curr.salesVolume, 0) + (selectedNode.id !== 'root' ? selectedNode.salesVolume : 0);
    const structureDetails = [1, 2, 3, 4, 5].map(lvl => {
      const nodesAtLvl = selectedNodeDownline.filter(n => n.level === lvl);
      const totalLvlSales = nodesAtLvl.reduce((acc, curr) => acc + curr.salesVolume, 0);
      const percentRecord = levelSettings.find(ls => ls.level === lvl);
      const rate = percentRecord ? percentRecord.percent : 0;
      const commissionEarned = Math.round(totalLvlSales * (rate / 100));
      return {
        level: lvl,
        count: nodesAtLvl.length,
        sales: totalLvlSales,
        rate,
        commission: commissionEarned
      };
    });

    const totalCalculatedCommission = structureDetails.reduce((sum, item) => sum + item.commission, 0);

    return {
      subVolume,
      totalCommission: totalCalculatedCommission,
      structureDetails
    };
  }, [selectedNode, selectedNodeDownline]);

  // Toggle tree node collapse/expand
  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleNodeClick = (node: PartnerNode) => {
    setSelectedNodeId(node.id);
    if (onSelectPartner && node.id !== 'root') {
      onSelectPartner(node.name);
    }
  };

  // Filtered tree layout rendering helper
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim() && selectedLevelFilter === 'all') {
      return flatNodesList;
    }
    return flatNodesList.filter(n => {
      const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.region.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = selectedLevelFilter === 'all' || n.level === Number(selectedLevelFilter);
      return matchesSearch && matchesLevel;
    });
  }, [flatNodesList, searchQuery, selectedLevelFilter]);

  // Nodes filtered and structured for flat list view (per specific level)
  const filteredLevelNodes = useMemo(() => {
    return flatNodesList.filter(n => {
      const matchesSearch = !searchQuery.trim() || 
                            n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = n.level === Number(selectedLevelFilter);
      return matchesSearch && matchesLevel;
    });
  }, [flatNodesList, searchQuery, selectedLevelFilter]);

  // Calculate overall platform simulated MLM statistics
  const platformStats = useMemo(() => {
    const totalNetworkSales = flatNodesList.filter(n => n.id !== 'root').reduce((sum, curr) => sum + curr.salesVolume, 0);
    const totalNetworkCount = flatNodesList.filter(n => n.id !== 'root').length;
    
    // Calculate total payout by levels for 'root' user
    let myTotalCommission = 0;
    flatNodesList.forEach(n => {
      if (n.id === 'root') return;
      const lvlConfig = levelSettings.find(ls => ls.level === n.level);
      if (lvlConfig) {
        myTotalCommission += Math.round(n.salesVolume * (lvlConfig.percent / 100));
      }
    });

    return {
      networkSales: totalNetworkSales,
      networkCount: totalNetworkCount,
      accruedPayout: myTotalCommission
    };
  }, [flatNodesList]);

  // Recursive Render Function for Stripe-style Tree layout
  const renderTreeNode = (node: PartnerNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id] !== false;
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    
    // Skip if search isn't empty and the node isn't in filtered matching nodes
    const isMatched = filteredNodes.some(fn => fn.id === node.id);
    if (!isMatched && searchQuery.trim()) return null;

    return (
      <motion.div 
        key={node.id} 
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative pl-3 md:pl-5 select-none my-1.5 flex flex-col"
      >
        {/* Node Connecting lines (Vertical tree bracket) */}
        {depth > 0 && (
          <div className="absolute left-[-4px] md:left-[3px] top-[-8px] bottom-1/2 w-3 md:w-4 border-l-2 border-b-2 border-white/10 rounded-bl-[8px] pointer-events-none overflow-hidden">
            <motion.div 
              className="absolute left-[-2px] bottom-[-2px] w-1.5 h-1.5 bg-[#fed600] rounded-full shadow-[0_0_8px_#fed600]"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: depth * 0.2 }}
            />
          </div>
        )}
        {depth > 1 && hasChildren && isExpanded && (
          <div className="absolute left-[-4px] md:left-[3px] top-1/2 bottom-0 border-l-2 border-white/10 pointer-events-none" />
        )}
        
        {/* Actual Node Tile */}
        <div 
          onClick={() => handleNodeClick(node)}
          className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 relative cursor-pointer ${
            isSelected 
              ? 'bg-[#27272a] border-[#fed600]/80 shadow-[0_0_15px_rgba(254,214,0,0.1)]' 
              : 'bg-[#18181b] border-white/5 hover:border-white/10 hover:bg-[#27272a]'
          }`}
        >
          {/* Active indicator */}
          {isSelected && (
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-[#fed600]" />
          )}

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button 
              onClick={(e) => toggleNode(node.id, e)}
              className="w-5 h-5 rounded-md flex items-center justify-center bg-transparent text-slate-500 hover:text-white transition-colors border border-white/10"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={12} />
              </motion.div>
            </button>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          )}

          {/* Node Avatar Initials with radial gradient backgrounds */}
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${node.avatarColor} p-[1px] shadow-inner`}>
            <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
              <span className="font-bold text-[11px] md:text-xs text-white opacity-95">
                {node.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 pr-8 md:pr-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs md:text-[13px] text-white truncate">{node.name}</span>
              {node.level > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  levelSettings[node.level - 1]?.color || 'border-slate-800 text-slate-500'
                }`}>
                  L{node.level}
                </span>
              )}
              {node.tier === 'Elite' && (
                <span className="text-[8px] bg-[#fed600] text-black px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider scale-90">
                  Premium
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Globe size={10} className="text-slate-600" />
                {node.region}
              </span>
              <span className="hidden sm:flex items-center gap-1 font-mono">
                {node.salesVolume.toLocaleString()} ₽
              </span>
              {node.subCount > 0 && (
                <span className="text-[#fed600] font-medium">+{node.subCount} парт.</span>
              )}
            </div>
          </div>

          {/* Stripe-style dynamic profit marker */}
          <div className="text-right">
            <span className="block text-[11px] md:text-xs font-bold text-slate-200 font-mono">
              {node.salesVolume.toLocaleString()} ₽
            </span>
            <span className="block text-[9px] text-slate-500">
              Лич. объём
            </span>
          </div>

          {/* Corner indicators */}
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={12} className="text-slate-500 hover:text-[#fed600]" />
          </div>
        </div>

        {/* Tree branches children nesting */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative mt-1 ml-2 pl-2 md:pl-3 border-l border-white/5 flex flex-col gap-1 overflow-hidden"
            >
              {node.children!.map(child => renderTreeNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div id="tbank-mlm-visualizer" className="h-full min-h-[700px] w-full flex flex-col bg-[#121214] rounded-3xl border border-white/5 shadow-xl overflow-hidden relative">
      
      {/* Clean Banking Background */}
      <div className="absolute inset-0 bg-[#0f0f11] z-0" />
      
      {/* 1. Header Stat Cards with T-Bank design elements */}
      <div className="p-6 md:p-8 border-b border-white/5 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#fed600] text-black font-bold text-xs uppercase px-3 py-1.5 rounded-md shadow-sm tracking-wider mb-3">
              <Sparkles size={13} strokeWidth={2.5} />
              Визуализация дохода
            </div>
            <h3 className="text-xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Интерактивная структура
            </h3>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
              Постройте свою финансовую модель. Меняйте ползунки, кликайте на партнеров в списке, чтобы увидеть как формируется ваш пассивный доход со всех 5 уровней глубины.
            </p>
          </div>

          {/* Simulator adjust state row */}
          <div className="flex flex-wrap items-center gap-4 bg-[#1c1c1e] px-5 py-4 rounded-2xl border border-white/5 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold font-mono">
              Ваш прогноз:
            </div>
            <div className="flex items-center gap-5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Сумма покупки (₽)</span>
                <input 
                  type="range" 
                  min="3000" 
                  max="20000" 
                  step="500"
                  value={averageCheck}
                  onChange={(e) => setAverageCheck(parseInt(e.target.value))}
                  className="w-24 md:w-32 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#fed600] mt-1"
                />
              </div>
              <div className="flex flex-col border-l border-white/10 pl-5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Личных партнеров (чел)</span>
                <input 
                  type="range" 
                  min="2" 
                  max="35" 
                  step="1"
                  value={friendsCount}
                  onChange={(e) => setFriendsCount(parseInt(e.target.value))}
                  className="w-24 md:w-32 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#fed600] mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Grid KPI widgets in banking style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-[#1c1c1e] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between opacity-80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Общий оборот</span>
              <Activity size={16} className="text-slate-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black font-mono text-white">
                {platformStats.networkSales.toLocaleString()}
              </span>
              <span className="text-slate-400 font-semibold text-base">₽</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-white font-bold px-2 py-0.5 rounded-sm bg-white/10">100%</span>
              <span>до 5 уровней</span>
            </div>
          </div>

          <div className="bg-[#1c1c1e] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between opacity-80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Команда</span>
              <Users size={16} className="text-slate-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black font-mono text-white">
                {platformStats.networkCount}
              </span>
              <span className="text-slate-500 text-sm font-medium">чел.</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-black font-bold px-2 py-0.5 rounded-sm bg-[#fed600]">+{friendsCount}</span>
              <span>за период</span>
            </div>
          </div>

          <div className="bg-[#1c1c1e] border border-[#fed600]/30 rounded-2xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#fed600]/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#fed600] uppercase tracking-widest">Ваш доход</span>
              <ShieldCheck size={16} className="text-[#fed600]" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-black font-mono text-white relative z-10">
                {platformStats.accruedPayout.toLocaleString()}
              </span>
              <span className="text-[#fed600] font-bold text-lg relative z-10">₽</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 relative z-10">
              <span className="text-black bg-[#fed600] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">Автовыплата</span>
              <span>на р/с Т-Банк Бизнес</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Interface Workspace */}
      <div className="flex-1 grid lg:grid-cols-12 relative z-10 min-h-0">
        
        {/* Interactive Tree Panel (Left 7 Columns) */}
        <div className="lg:col-span-7 p-6 border-r border-white/5 flex flex-col bg-[#121214]">
          
          {/* Filters menu (T-Bank UI design) */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4 pb-4 border-b border-white/5">
            <div className="relative flex-1 max-w-sm">
              <input 
                type="text" 
                placeholder="Поиск по имени или городу..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/10 focus:border-[#fed600] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#fed600] transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold uppercase tracking-wider">
                <Filter size={10} />
                УРОВЕНЬ:
              </span>
              <div className="flex bg-[#1c1c1e] p-0.5 rounded-lg border border-white/10">
                {['all', 1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevelFilter(lvl as any)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      selectedLevelFilter === lvl 
                        ? 'bg-[#fed600] text-black shadow-sm font-extrabold' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl === 'all' ? 'Все' : `L${lvl}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic description of the selected level so that the user immediately understands who is on L1, L2, etc. */}
          <div className="mb-4 p-3 bg-slate-950/40 border border-white/5 rounded-xl text-[11px] leading-relaxed text-slate-400 flex items-start gap-2 backdrop-blur-sm">
            <span className="text-base leading-none">💡</span>
            <div>
              <span className="font-bold text-slate-200">Пояснение: </span>
              {levelDescriptions[selectedLevelFilter]}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {selectedLevelFilter === 'all' ? (
              /* Hierarchy Tree View or Search matching */
              filteredNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-600">
                  <RotateLeft size={24} className="mb-2 animate-spin text-slate-700" />
                  <p className="text-xs">Ничего не найдено по вашему поиску.</p>
                </div>
              ) : (
                <div className="border-l-2 border-slate-950 ml-1 relative">
                  {/* Seed Tree Rendering starting from Ambassador root */}
                  {renderTreeNode(mlmTreeData)}
                </div>
              )
            ) : (
              /* Clean Flat List dedicated to selected L1-L5 levels. Solves navigation & layout ambiguity. */
              filteredLevelNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                  <span className="text-3xl mb-3">👥</span>
                  <p className="text-xs font-semibold text-slate-400">В вашей сети пока нет партнеров уровня L{selectedLevelFilter}</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Каждый личный партнер приглашает по 10 пользователей, расширяя вашу сеть на последующие уровни!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
                    Партнеры ({filteredLevelNodes.length} чел.)
                  </div>
                  {filteredLevelNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const parentNode = flatNodesList.find(p => p.id === node.parentId);
                    
                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleNodeClick(node)}
                        className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 relative cursor-pointer ${
                          isSelected 
                            ? 'bg-[#27272a] border-[#fed600]/80 shadow-[0_0_15px_rgba(254,214,0,0.15)] ring-1 ring-[#fed600]/40' 
                            : 'bg-[#18181b] border-white/5 hover:border-white/10 hover:bg-[#27272a]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-md bg-[#fed600]" />
                        )}

                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${node.avatarColor} p-[1px]`}>
                          <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                            <span className="font-bold text-xs text-white opacity-95">
                              {node.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-white truncate">{node.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold text-black bg-[#fed600]">
                              L{node.level}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3.5 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Globe size={11} className="text-slate-600" />
                              {node.region}
                            </span>
                            {parentNode && (
                              <span className="text-slate-500">
                                В пригласителях: <span className="text-slate-300 font-medium">{parentNode.id === 'root' ? 'Вы' : parentNode.name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="block text-xs sm:text-sm font-bold text-slate-200 font-mono">
                            {node.salesVolume.toLocaleString()} ₽
                          </span>
                          <span className="block text-[9px] text-slate-500">
                            Объём
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* Quick Guide */}
          <div className="mt-8 p-3 rounded-xl bg-[#1c1c1e] border border-white/5 flex items-start gap-2.5">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#fed600] flex-shrink-0 animate-pulse" />
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Нажмите на любого партнера, чтобы посмотреть его вклад. Баланс обновляется автоматически благодаря API интеграции с Т-Банк Бизнес.
            </p>
          </div>
        </div>

        {/* Dynamic Details Sidebar (Right 5 Columns) */}
        <div className="lg:col-span-5 p-6 bg-[#18181b] border-l border-white/10 relative flex flex-col justify-between overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="space-y-6">
            
            {/* Header: Selected Entity details */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold text-black bg-[#fed600] px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                  {selectedNode.id === 'root' ? 'Амбассадор компании' : `Партнер L${selectedNode.level}`}
                </span>
                <span className="text-slate-600 font-bold text-xs">•</span>
                <span className="text-[10px] font-mono text-slate-400">ID: {selectedNode.id === 'root' ? '@sys-admin' : `@tbank-${selectedNode.id}`}</span>
              </div>
              
              <div className="flex items-center gap-3 mt-1.5">
                <h4 className="text-xl font-black text-white tracking-tight">{selectedNode.name}</h4>
                <div className={`w-2 h-2 rounded-full ${selectedNode.tier === 'Elite' ? 'bg-[#fed600]' : 'bg-slate-500'}`} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Регистрация в Floramos Club: <span className="text-slate-300 font-medium">{selectedNode.joinedDate}</span> • {selectedNode.region}</p>
            </div>

            {/* Performance breakdown (T-Bank sleek meters) */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Сводка по ветке партнера</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1c1c1e] rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500">Глубина сети ветви</div>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5 font-mono">
                    <Layers size={14} className="text-slate-400" />
                    {selectedNode.id === 'root' ? '5 уровней' : `До L5`}
                  </div>
                </div>

                <div className="bg-[#1c1c1e] rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500">Размер структуры</div>
                  <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5 font-mono">
                    <Users size={14} className="text-slate-400" />
                    {selectedNodeDownline.length + (selectedNode.id !== 'root' ? 1 : 0)} чел.
                  </div>
                </div>
              </div>

              {/* Total downline Volume */}
              <div className="bg-[#1c1c1e] rounded-xl p-4 border border-white/5 flex justify-between items-center relative overflow-hidden group">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Объём продаж ветки</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">
                    {nodeStats.subVolume.toLocaleString()} ₽
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-black bg-[#fed600] px-2 py-0.5 rounded-sm">
                    Активно
                  </span>
                </div>
              </div>
            </div>

            {/* Downline payouts levels distribution */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2.5">
                <span className="w-12 text-left">Уровень</span>
                <span className="w-12 text-center">Людей</span>
                <span className="w-20 text-center">Объём</span>
                <span className="w-12 text-center">Доля</span>
                <span className="flex-1 text-right">Выплата</span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                {nodeStats.structureDetails.map((lvl) => {
                  const hasRevenue = lvl.commission > 0;
                  const detailsConfig = levelSettings.find(ls => ls.level === lvl.level);
                  
                  return (
                    <div 
                      key={lvl.level} 
                      className={`flex items-center p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                        hasRevenue 
                          ? 'bg-[#1c1c1e] border-white/5' 
                          : 'bg-transparent border-transparent text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-12 text-left">
                        <span className={`w-2 h-2 rounded-full ${detailsConfig?.circleColor || 'bg-slate-600'}`} />
                        <span className="text-white font-bold font-mono">L{lvl.level}</span>
                      </div>

                      <span className="text-slate-400 font-mono text-[11px] w-12 text-center">{lvl.count > 0 ? lvl.count : '-'}</span>

                      <span className="text-slate-300 font-mono text-[11px] w-20 text-center">{lvl.sales > 0 ? `${lvl.sales.toLocaleString()} ₽` : '-'}</span>

                      <span className="text-slate-400 font-mono text-[11px] font-bold w-12 text-center">{lvl.rate}%</span>

                      <span className={`text-right font-bold font-mono text-[11px] flex-1 ${hasRevenue ? 'text-white' : 'text-slate-600'}`}>
                        {hasRevenue ? `+${lvl.commission.toLocaleString()} ₽` : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>

          {/* Cumulative summary payout statement */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="bg-[#1c1c1e] border border-[#fed600]/30 rounded-2xl p-5 flex justify-between items-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#fed600]/10 rounded-full blur-[30px] pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[11px] text-slate-400 block font-medium">К выплате на счет</span>
                <span className="text-3xl font-black font-mono text-white mt-1 block">
                  {nodeStats.totalCommission.toLocaleString()} <span className="text-[#fed600] text-xl">₽</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5 font-medium">
                   <div className="w-1.5 h-1.5 bg-[#fed600] rounded-full animate-pulse" />
                   Готово к переводу Т-Банк API
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#fed600] flex items-center justify-center text-black shadow-[0_0_15px_rgba(254,214,0,0.4)] relative z-10">
                <ArrowUpRight size={20} strokeWidth={3} />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// A simple utility to mimic a rotating circle for empty listings
function RotateLeft({ size = 16, className = '' }) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-spin"
      >
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
    </div>
  );
}
