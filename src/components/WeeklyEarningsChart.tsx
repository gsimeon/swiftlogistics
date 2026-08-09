import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, DollarSign, Award, Calendar, Zap } from 'lucide-react';

const WEEKLY_DATA = [
  { day: 'Mon', deliveries: 12, hoursOnRoad: 5.2, earnings: 142.50, efficiencyScore: 92 },
  { day: 'Tue', deliveries: 15, hoursOnRoad: 6.0, earnings: 185.00, efficiencyScore: 96 },
  { day: 'Wed', deliveries: 18, hoursOnRoad: 6.8, earnings: 215.20, efficiencyScore: 98 },
  { day: 'Thu', deliveries: 14, hoursOnRoad: 5.5, earnings: 168.00, efficiencyScore: 94 },
  { day: 'Fri', deliveries: 22, hoursOnRoad: 7.5, earnings: 280.50, efficiencyScore: 99 },
  { day: 'Sat', deliveries: 25, hoursOnRoad: 8.2, earnings: 340.00, efficiencyScore: 97 },
  { day: 'Sun', deliveries: 19, hoursOnRoad: 6.4, earnings: 245.80, efficiencyScore: 95 },
];

export const WeeklyEarningsChart: React.FC = () => {
  const [metric, setMetric] = useState<'deliveriesVsHours' | 'earnings'>('deliveriesVsHours');

  const totalDeliveries = WEEKLY_DATA.reduce((acc, d) => acc + d.deliveries, 0);
  const totalHours = WEEKLY_DATA.reduce((acc, d) => acc + d.hoursOnRoad, 0).toFixed(1);
  const totalEarnings = WEEKLY_DATA.reduce((acc, d) => acc + d.earnings, 0).toFixed(2);
  const avgEfficiency = Math.round(WEEKLY_DATA.reduce((acc, d) => acc + d.efficiencyScore, 0) / WEEKLY_DATA.length);

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Weekly Earnings & Efficiency Analytics</h3>
            <p className="text-xs text-slate-500">Track completed jobs vs time on road to optimize your daily shift schedules.</p>
          </div>
        </div>

        {/* View Metric Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setMetric('deliveriesVsHours')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              metric === 'deliveriesVsHours' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jobs vs Hours
          </button>
          <button
            onClick={() => setMetric('earnings')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              metric === 'earnings' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Payouts ($)
          </button>
        </div>
      </div>

      {/* High-Level Metric Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Completed</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900">{totalDeliveries}</span>
            <span className="text-[10px] font-semibold text-emerald-600">Jobs</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time on Road</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900">{totalHours}</span>
            <span className="text-[10px] font-semibold text-blue-600">Hours</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Revenue</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-lg font-bold font-mono text-emerald-600">${totalEarnings}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Efficiency Score</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-lg font-bold font-mono text-amber-600">{avgEfficiency}%</span>
            <span className="text-[10px] font-semibold text-amber-600">Optimal</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[260px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'deliveriesVsHours' ? (
            <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="left" dataKey="deliveries" name="Deliveries Completed" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="hoursOnRoad" name="Road Hours (h)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: any) => [`$${value}`, 'Weekly Earnings']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="earnings" name="Daily Earnings ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
