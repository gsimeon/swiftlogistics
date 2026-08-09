import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Coins,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Flame,
  Milestone
} from 'lucide-react';

// Type definitions
type PeriodType = 'daily' | 'weekly' | 'monthly';

interface SummaryStats {
  totalEarnings: number;
  completedOrders: number;
  totalTips: number;
  baseFare: number;
  incentives: number;
}

const DAILY_DATA = [
  { label: 'Mon', earnings: 142.50, tips: 24.00, orders: 12, base: 118.50 },
  { label: 'Tue', earnings: 185.00, tips: 32.50, orders: 15, base: 152.50 },
  { label: 'Wed', earnings: 215.20, tips: 40.00, orders: 18, base: 175.20 },
  { label: 'Thu', earnings: 168.00, tips: 28.00, orders: 14, base: 140.00 },
  { label: 'Fri', earnings: 280.50, tips: 55.00, orders: 22, base: 225.50 },
  { label: 'Sat', earnings: 340.00, tips: 70.00, orders: 25, base: 270.00 },
  { label: 'Sun', earnings: 245.80, tips: 45.00, orders: 19, base: 200.80 },
];

const WEEKLY_DATA = [
  { label: 'Week 1', earnings: 1120.00, tips: 190.00, orders: 75, base: 930.00 },
  { label: 'Week 2', earnings: 1350.50, tips: 245.00, orders: 88, base: 1105.50 },
  { label: 'Week 3', earnings: 1480.00, tips: 280.00, orders: 95, base: 1200.00 },
  { label: 'Week 4', earnings: 1290.20, tips: 210.00, orders: 81, base: 1080.20 },
];

const MONTHLY_DATA = [
  { label: 'Jan', earnings: 4850.00, tips: 820.00, orders: 310, base: 4030.00 },
  { label: 'Feb', earnings: 5120.50, tips: 910.00, orders: 335, base: 4210.50 },
  { label: 'Mar', earnings: 5680.00, tips: 1050.00, orders: 370, base: 4630.00 },
  { label: 'Apr', earnings: 4940.20, tips: 860.00, orders: 315, base: 4080.20 },
  { label: 'May', earnings: 6210.00, tips: 1180.00, orders: 405, base: 5030.00 },
  { label: 'Jun', earnings: 5980.50, tips: 1120.00, orders: 390, base: 4860.50 },
];

export const DriverEarningsDashboard: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('weekly');

  const getData = () => {
    switch (activePeriod) {
      case 'daily': return DAILY_DATA;
      case 'weekly': return WEEKLY_DATA;
      case 'monthly': return MONTHLY_DATA;
    }
  };

  const calculateStats = (): SummaryStats => {
    const data = getData();
    const totalEarnings = data.reduce((acc, curr) => acc + curr.earnings, 0);
    const totalTips = data.reduce((acc, curr) => acc + curr.tips, 0);
    const completedOrders = data.reduce((acc, curr) => acc + curr.orders, 0);
    const baseFare = data.reduce((acc, curr) => acc + curr.base, 0);
    const incentives = totalEarnings - baseFare - totalTips;

    return {
      totalEarnings,
      completedOrders,
      totalTips,
      baseFare,
      incentives: incentives > 0 ? incentives : totalEarnings * 0.08, // fallback multiplier
    };
  };

  const stats = calculateStats();
  const currentData = getData();

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6" id="driver-earnings-dashboard">
      
      {/* Header section with toggle tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Coins className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Driver Earnings & Revenue Dashboard</h3>
            <p className="text-xs text-slate-500">
              Interactive breakdowns of completed logistics orders, peak bonuses, and customer tips.
            </p>
          </div>
        </div>

        {/* Time period toggle switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold self-start lg:self-auto">
          {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-4 py-2 rounded-lg capitalize transition-all duration-150 ${
                activePeriod === period 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period === 'daily' ? '7-Day View' : period === 'weekly' ? '4-Week View' : '6-Month View'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Highlights widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Earnings Stat */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white p-4.5 rounded-xl border border-slate-800 space-y-2 relative overflow-hidden shadow-sm">
          <div className="absolute right-2 bottom-1 text-slate-800 font-extrabold text-7xl select-none opacity-20">$</div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Gross Revenue</span>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center text-[10px] text-emerald-400 font-semibold space-x-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% vs last period</span>
          </div>
        </div>

        {/* Completed Orders Stat */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-800">
            {stats.completedOrders} <span className="text-xs font-bold text-slate-500 font-sans">Trips</span>
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">
            100% Escrow Release rate
          </div>
        </div>

        {/* Tips Earned Stat */}
        <div className="bg-amber-50/70 border border-amber-200/80 p-4.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block">Tips Earned</span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700">
            ${stats.totalTips.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-amber-800 font-semibold">
            Gratitude tips kept in full
          </div>
        </div>

        {/* Average value per delivery */}
        <div className="bg-blue-50/60 border border-blue-100 p-4.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">Avg. Per Delivery</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-700">
            ${(stats.totalEarnings / stats.completedOrders).toFixed(2)}
          </div>
          <div className="text-[10px] text-blue-600 font-semibold">
            Strong yield per mile
          </div>
        </div>

      </div>

      {/* Grid containing Chart and Payout Breakdown Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Recharts chart area */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Earnings Trend Breakdown</span>
            </h4>
            <span className="text-[11px] text-slate-400 italic">Values shown in USD</span>
          </div>

          <div className="h-[280px] w-full border border-slate-100 p-3 rounded-2xl bg-slate-50/40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="earnings" name="Total Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" />
                <Area type="monotone" dataKey="tips" name="Tips Included" stroke="#d97706" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed commission itemization list panel */}
        <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/60 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Milestone className="w-4 h-4 text-indigo-500" />
              <span>Revenue Itemization</span>
            </h4>

            {/* List breakdown of sub-fares */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Standard Base Fares</span>
                <span className="font-mono font-bold text-slate-800">${stats.baseFare.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 font-medium">Peak Surge Incentives</span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded font-mono">BOOST</span>
                </div>
                <span className="font-mono font-bold text-blue-600">+${stats.incentives.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Direct Customer Tips</span>
                <span className="font-mono font-bold text-amber-600">+${stats.totalTips.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                <span className="text-slate-500 font-medium">Platform Fee Deductions</span>
                <span className="font-mono font-bold text-rose-600">-$0.00</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 mt-4 space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="font-bold text-[11px] text-slate-800">Ikeja Peak Hour Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Logistics surge multiplier of <strong className="text-blue-600">1.2x</strong> is currently applied to Computer Village order pick-ups.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
