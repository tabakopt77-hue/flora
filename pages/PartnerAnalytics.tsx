import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  ListFilter,
  Activity,
  TrendingUp,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  Package,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { db } from "../services/db";
import { getDbFlowerDemandForecast, DbDemandForecast } from "../services/geminiService";

type Period = "day" | "week" | "month";

interface LevelStat {
  level: number;
  partnersCount: number;
  partnersGrowth: number; // percentage
  commissionSum: number;
  commissionGrowth: number; // percentage
  activePercentage: number;
}

export const PartnerAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>("month");

  const [activeTab, setActiveTab] = useState<'network' | 'forecast'>('network');
  const [dbForecast, setDbForecast] = useState<DbDemandForecast | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const [productsCount, setProductsCount] = useState<number>(0);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);

  useEffect(() => {
    try {
      const prods = db.products.getAll();
      const ords = db.orders.getAll();
      setProductsCount(prods.length);
      setTotalStock(prods.reduce((sum, p) => sum + (p.stock || 0), 0));
      setOrdersCount(ords.length);
    } catch (e) {
      console.error("Failed to load db counts", e);
    }
  }, []);

  const handleLoadDbForecast = async () => {
    setIsLoadingForecast(true);
    setForecastError(null);
    try {
      const products = db.products.getAll();
      const orders = db.orders.getAll();
      const res = await getDbFlowerDemandForecast(products, orders);
      if (res) {
        setDbForecast(res);
      } else {
        setForecastError("Не удалось сформировать AI прогноз. Пожалуйста, попробуйте еще раз.");
      }
    } catch (err) {
      console.error(err);
      setForecastError("Ошибка при обращении к базе данных или службе прогнозирования.");
    } finally {
      setIsLoadingForecast(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'forecast' && !dbForecast) {
      handleLoadDbForecast();
    }
  }, [activeTab]);

  // Mock data varying by period
  const getMockData = (period: Period): LevelStat[] => {
    const multiplier = period === "day" ? 0.05 : period === "week" ? 0.2 : 1;
    return [
      {
        level: 1,
        partnersCount: Math.round(15 * multiplier) || 1,
        partnersGrowth: 12.5,
        commissionSum: 24500 * multiplier,
        commissionGrowth: 8.4,
        activePercentage: 85,
      },
      {
        level: 2,
        partnersCount: Math.round(45 * multiplier) || 3,
        partnersGrowth: 24.1,
        commissionSum: 58200 * multiplier,
        commissionGrowth: 15.2,
        activePercentage: 72,
      },
      {
        level: 3,
        partnersCount: Math.round(180 * multiplier) || 12,
        partnersGrowth: 45.8,
        commissionSum: 112500 * multiplier,
        commissionGrowth: 42.1,
        activePercentage: 64,
      },
      {
        level: 4,
        partnersCount: Math.round(620 * multiplier) || 40,
        partnersGrowth: -2.4,
        commissionSum: 280000 * multiplier,
        commissionGrowth: -1.2,
        activePercentage: 45,
      },
      {
        level: 5,
        partnersCount: Math.round(1850 * multiplier) || 100,
        partnersGrowth: 115.2,
        commissionSum: 462500 * multiplier,
        commissionGrowth: 98.5,
        activePercentage: 28,
      },
    ];
  };

  const data = getMockData(period);
  const totalPartners = data.reduce((sum, item) => sum + item.partnersCount, 0);
  const totalCommission = data.reduce(
    (sum, item) => sum + item.commissionSum,
    0,
  );

  const handleExportCSV = () => {
    const headers = [
      "Уровень",
      "Партнеры",
      "Рост партнеров (%)",
      "Активность (%)",
      "Комиссии (₽)",
      "Рост комиссий (%)",
    ];
    const csvRows = [
      headers.join(","),
      ...data.map(
        (row) =>
          `${row.level},${row.partnersCount},${row.partnersGrowth},${row.activePercentage},${row.commissionSum},${row.commissionGrowth}`,
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `partner_analytics_${period}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans pb-20">
      <Helmet>
        <title>Аналитика структуры | Floramos</title>
      </Helmet>

      {/* Header Stripe-like */}
      <header className="bg-white border-b border-slate-200 sticky top-0 md:top-[72px] z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Floramos Partners
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Аналитика структуры
              </h1>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative inline-block w-full sm:w-auto">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="appearance-none w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow cursor-pointer shadow-sm"
                >
                  <option value="day">За сегодня</option>
                  <option value="week">За неделю</option>
                  <option value="month">За месяц</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Экспорт</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 gap-6">
          <button
            onClick={() => setActiveTab("network")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "network"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-550 hover:text-slate-750"
            }`}
          >
            <Users size={16} />
            <span>Аналитика структуры</span>
          </button>
          <button
            onClick={() => setActiveTab("forecast")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "forecast"
                ? "border-emerald-600 text-emerald-600 font-bold"
                : "border-transparent text-slate-550 hover:text-slate-750"
            }`}
          >
            <TrendingUp size={16} />
            <span className="flex items-center gap-1.5">
              Прогноз спроса
              <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold py-0.5 px-2 rounded-full">
                AI
              </span>
            </span>
          </button>
        </div>

        {activeTab === "network" ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500">
                    Общее количество партнеров
                  </h3>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users size={18} className="text-blue-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {totalPartners.toLocaleString("ru-RU")}
                  </span>
                  <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight size={14} className="mr-0.5" /> 18.2%
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-500">
                    Начисленные комиссии (
                    {period === "month"
                      ? "месяц"
                      : period === "week"
                        ? "неделя"
                        : "день"}
                    )
                  </h3>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(totalCommission)}
                  </span>
                  <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight size={14} className="mr-0.5" /> 24.5%
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Глубина структуры
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Подробный анализ по всем 5 уровням реферальной сети
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-50 border border-slate-200 rounded-md text-slate-500 transition-colors">
                    <ListFilter size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Уровень</th>
                      <th className="px-6 py-4 font-medium text-right">Партнеры</th>
                      <th className="px-6 py-4 font-medium">Динамика</th>
                      <th className="px-6 py-4 font-medium text-right">Комиссии</th>
                      <th className="px-6 py-4 font-medium">Рост комиссий</th>
                      <th className="px-6 py-4 font-medium text-center">
                        Активность
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((row) => (
                      <tr
                        key={row.level}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                              L{row.level}
                            </div>
                            <span className="font-medium text-slate-900">
                              Уровень {row.level}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                          {row.partnersCount.toLocaleString("ru-RU")}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${row.partnersGrowth >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}
                          >
                            {row.partnersGrowth >= 0 ? (
                              <ArrowUpRight size={12} className="mr-1" />
                            ) : (
                              <ArrowDownRight size={12} className="mr-1" />
                            )}
                            {Math.abs(row.partnersGrowth)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                          {formatCurrency(row.commissionSum)}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${row.commissionGrowth >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}
                          >
                            {row.commissionGrowth >= 0 ? (
                              <ArrowUpRight size={12} className="mr-1" />
                            ) : (
                              <ArrowDownRight size={12} className="mr-1" />
                            )}
                            {Math.abs(row.commissionGrowth)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 items-center">
                            <div className="text-xs font-medium text-slate-700">
                              {row.activePercentage}%
                            </div>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${row.activePercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  Данные обновляются в реальном времени
                </span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Справка по расчету
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Database Stats snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
                  <Package size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Сортов в каталоге</div>
                  <div className="text-xl font-bold text-slate-800">{productsCount} шт.</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">из базы данных</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Общий запас на складе</div>
                  <div className="text-xl font-bold text-slate-800">{totalStock} шт.</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">актуальный баланс</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Исторических заказов</div>
                  <div className="text-xl font-bold text-slate-800">{ordersCount} шт.</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">уникальные сессии в БД</div>
                </div>
              </div>
            </div>

            {/* AI Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white rounded-xl p-6 shadow-md overflow-hidden relative">
              <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center">
                <Sparkles size={180} />
              </div>
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-1 rounded-full text-xs mb-3">
                  <Sparkles size={12} />
                  <span>Интеллектуальная предиктивная аналитика Floramos</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                  Прогнозирование спроса на следующий месяц
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  ИИ сканирует в реальном времени описания, ключевые слова, товарные остатки на складе и сопоставляет их с сезонными трендами закупок.
                </p>
              </div>
              <button
                onClick={handleLoadDbForecast}
                disabled={isLoadingForecast}
                className="relative z-10 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all text-center min-w-[200px] cursor-pointer"
              >
                <RefreshCw size={15} className={isLoadingForecast ? "animate-spin" : ""} />
                <span>{isLoadingForecast ? "Расчёт спроса..." : "Обновить ИИ Прогноз"}</span>
              </button>
            </div>

            {isLoadingForecast && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-5">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                  <div className="absolute inset-4 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-pulse">
                    <Sparkles size={16} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-base">Flora AI строит математическую модель</h4>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed animate-pulse">
                    Считываем позиции номенклатуры, рассчитываем коэффициенты вариативности остатков на складе и сопоставляем с календарем спроса на праздничные букеты...
                  </p>
                </div>
              </div>
            )}

            {forecastError && !isLoadingForecast && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-3">
                  <AlertCircle size={24} />
                </div>
                <h4 className="font-semibold text-slate-800">Ошибка вычислений</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{forecastError}</p>
                <button
                  onClick={handleLoadDbForecast}
                  className="mt-4 px-4 py-2 bg-red-600 text-white hover:bg-red-500 rounded-lg text-xs font-semibold transition-colors"
                >
                  Попробовать снова
                </button>
              </div>
            )}

            {dbForecast && !isLoadingForecast && (
              <div className="space-y-8 animate-fade-in">
                {/* Visual Overview cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Month period info */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-xs font-medium text-slate-400 mb-1">Горизонт прогнозирования</div>
                    <div className="text-2xl font-bold text-slate-800">{dbForecast.period}</div>
                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Автоматическое сезонное планирование
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-xs font-medium text-slate-400 mb-1">Общий тренд спроса</div>
                    <div className="flex items-center gap-2 mt-1">
                      {dbForecast.trend === 'rising' ? (
                        <>
                          <span className="text-2xl font-bold text-emerald-600">Растущий</span>
                          <span className="bg-emerald-50 text-emerald-700 p-1 rounded-lg">
                            <ArrowUpRight size={20} />
                          </span>
                        </>
                      ) : dbForecast.trend === 'falling' ? (
                        <>
                          <span className="text-2xl font-bold text-rose-600">Нисходящий</span>
                          <span className="bg-rose-50 text-rose-700 p-1 rounded-lg">
                            <ArrowDownRight size={20} />
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-slate-600">Стабильный</span>
                          <span className="bg-slate-50 text-slate-705 p-1.5 rounded-lg text-xs font-bold font-mono">OK</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      На основе темпов пополнения и продаж на рынке
                    </div>
                  </div>

                  {/* Growth stats */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-xs font-medium text-slate-400 mb-1">Ожидаемое изменение спроса</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {dbForecast.predictedSalesGrowth > 0 ? `+${dbForecast.predictedSalesGrowth}%` : `${dbForecast.predictedSalesGrowth}%`}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      к аналогичным закупкам прошлого года
                    </div>
                  </div>
                </div>

                {/* Demand table by variety */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Прогноз востребованности по сортам цветов</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Анализ товарных остатков в магазине и предиктивная оценка продаж
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-medium">Сорт / Вид цветов</th>
                          <th className="px-6 py-4 font-medium text-center">В наличии</th>
                          <th className="px-6 py-4 font-medium">Оценка спроса ИИ</th>
                          <th className="px-6 py-4 font-medium">Точность ИИ</th>
                          <th className="px-6 py-4 font-medium">Рекомендация по закупке</th>
                          <th className="px-6 py-4 font-medium max-w-xs">Комментарий аналитика</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dbForecast.demandByVariety && dbForecast.demandByVariety.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-medium text-slate-600">
                              {item.currentStock} шт.
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-705 min-w-[24px]">{item.predictedDemandScore}</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      item.predictedDemandScore > 75
                                        ? "bg-emerald-500"
                                        : item.predictedDemandScore > 40
                                        ? "bg-blue-500"
                                        : "bg-amber-500"
                                    }`}
                                    style={{ width: `${item.predictedDemandScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-slate-500 text-xs">{item.confidence}%</span>
                            </td>
                            <td className="px-6 py-4">
                              {item.recommendation === 'increase' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 py-1 px-3 rounded-full border border-emerald-100">
                                  Увеличить объём
                                </span>
                              ) : item.recommendation === 'reduce' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 py-1 px-3 rounded-full border border-rose-100">
                                  Снизить запасы
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 py-1 px-3 rounded-full border border-slate-200">
                                  Оптимально
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 max-w-xs break-words text-xs text-slate-500 whitespace-normal">
                              {item.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <HelpCircle size={14} className="text-slate-400" />
                    <span>Для расчета использовался весь спектр SKU в каталоге, исторические транзакции и коэффициенты сезонного потребления.</span>
                  </div>
                </div>

                {/* Sourcing tips & keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ActionableTips card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-emerald-500" />
                      Советы ИИ по планированию логистики
                    </h3>
                    <ul className="space-y-4">
                      {dbForecast.actionableTips && dbForecast.actionableTips.map((tip, i) => (
                        <li key={i} className="flex gap-3 text-xs sm:text-sm text-slate-600 items-start leading-relaxed animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-xs">
                            {i + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keywords Tag clouds */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-500" />
                      Тренды и поисковые интересы клиентов
                    </h3>
                    <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                      Флористы и дистрибьюторы фиксируют повышенный интерес к следующим флористическим стилям и ключевым запросам:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dbForecast.topKeywords && dbForecast.topKeywords.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-605 hover:text-slate-800 text-xs border border-slate-200/60 rounded-lg px-3 py-1.5 font-medium transition-colors cursor-default"
                        >
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
