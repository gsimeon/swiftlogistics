import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  Calendar, 
  Award, 
  AlertCircle,
  BarChart2,
  ChevronRight,
  Filter
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface DeliveryPerformancePoint {
  period: string;
  actualMins: number;
  targetMins: number;
  varianceMins: number;
  onTime: boolean;
  orderCount: number;
}

const DAILY_EFFICIENCY_DATA: DeliveryPerformancePoint[] = [
  { period: 'Mon', actualMins: 22, targetMins: 25, varianceMins: -3, onTime: true, orderCount: 12 },
  { period: 'Tue', actualMins: 28, targetMins: 25, varianceMins: 3, onTime: false, orderCount: 14 },
  { period: 'Wed', actualMins: 19, targetMins: 24, varianceMins: -5, onTime: true, orderCount: 16 },
  { period: 'Thu', actualMins: 24, targetMins: 25, varianceMins: -1, onTime: true, orderCount: 15 },
  { period: 'Fri', actualMins: 31, targetMins: 26, varianceMins: 5, onTime: false, orderCount: 18 },
  { period: 'Sat', actualMins: 20, targetMins: 25, varianceMins: -5, onTime: true, orderCount: 22 },
  { period: 'Sun', actualMins: 18, targetMins: 22, varianceMins: -4, onTime: true, orderCount: 19 },
];

const RECENT_ORDERS_DATA: DeliveryPerformancePoint[] = [
  { period: 'Ord #101', actualMins: 18, targetMins: 22, varianceMins: -4, onTime: true, orderCount: 1 },
  { period: 'Ord #102', actualMins: 26, targetMins: 25, varianceMins: 1, onTime: false, orderCount: 1 },
  { period: 'Ord #103', actualMins: 15, targetMins: 20, varianceMins: -5, onTime: true, orderCount: 1 },
  { period: 'Ord #104', actualMins: 22, targetMins: 24, varianceMins: -2, onTime: true, orderCount: 1 },
  { period: 'Ord #105', actualMins: 29, targetMins: 25, varianceMins: 4, onTime: false, orderCount: 1 },
  { period: 'Ord #106', actualMins: 17, targetMins: 21, varianceMins: -4, onTime: true, orderCount: 1 },
];

interface EfficiencyMetricsChartProps {
  driverName?: string;
  onClose?: () => void;
}

export const EfficiencyMetricsChart: React.FC<EfficiencyMetricsChartProps> = ({
  driverName = 'Marcus Vance',
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'recent'>('weekly');
  const data = viewMode === 'weekly' ? DAILY_EFFICIENCY_DATA : RECENT_ORDERS_DATA;

  // Calculate KPIs
  const totalOrders = data.reduce((acc, d) => acc + d.orderCount, 0);
  const onTimeCount = data.filter((d) => d.onTime).length;
  const onTimeRate = Math.round((onTimeCount / data.length) * 100);
  const avgActualTime = Math.round(data.reduce((acc, d) => acc + d.actualMins, 0) / data.length);
  const avgTargetTime = Math.round(data.reduce((acc, d) => acc + d.targetMins, 0) / data.length);
  const avgVariance = (data.reduce((acc, d) => acc + d.varianceMins, 0) / data.length).toFixed(1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Courier Schedule Efficiency & Delivery Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare actual delivery duration against estimated target arrival times to optimize daily routing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => {
                soundService.playNotification();
                setViewMode('weekly');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => {
                soundService.playNotification();
                setViewMode('recent');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'recent'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recent Trips
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-2 rounded-xl"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
            On-Time Arrival Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono flex items-center space-x-1">
            <span>{onTimeRate}%</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block">
            Target: ≥ 90% SLA Met
          </span>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
            Avg Delivery Time
          </span>
          <div className="text-2xl font-extrabold text-blue-800 font-mono">
            {avgActualTime} <span className="text-xs font-normal">mins</span>
          </div>
          <span className="text-[10px] text-blue-600 font-medium block">
            ETA Target: {avgTargetTime} mins
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Speed Variance
          </span>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {Number(avgVariance) < 0 ? `${Math.abs(Number(avgVariance))}m faster` : `+${avgVariance}m slower`}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            VS Estimated Target
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Deliveries Logged
          </span>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {totalOrders}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">
            100% Verified GPS Tracking
          </span>
        </div>
      </div>

      {/* Main Recharts Chart */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Actual Delivery Duration (Bars) vs Target Arrival Estimate (Line)</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-400">Unit: Minutes</span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: any) => [
                  `${value} mins`,
                  name === 'actualMins' ? 'Actual Delivery Time' : 'Estimated Target (ETA)',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => (value === 'actualMins' ? 'Actual Delivery Time (Mins)' : 'Estimated Arrival Target (ETA)')}
              />
              <Bar dataKey="actualMins" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
              <Line type="monotone" dataKey="targetMins" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Schedule Optimization Recommendations Box */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs flex items-start space-x-3">
        <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <div className="font-bold text-amber-950 flex items-center space-x-2">
            <span>Schedule Optimization AI Recommendation</span>
            <span className="bg-amber-200 text-amber-900 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
              High Accuracy
            </span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Friday evening deliveries experienced a +5 minute delay due to traffic congestion around Mobolaji Bank Anthony Way. Accepting batch deliveries before 4:30 PM optimizes your daily schedule and maintains an average on-time rating above 96%.
          </p>
        </div>
      </div>

    </div>
  );
};
