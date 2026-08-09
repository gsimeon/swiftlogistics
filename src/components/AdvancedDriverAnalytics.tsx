import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  Award, 
  Activity, 
  WifiOff, 
  Clock, 
  CheckCircle2, 
  UserX, 
  Send,
  Zap,
  RotateCcw
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface DriverAnalyticsData {
  id: string;
  name: string;
  avatar: string;
  performanceScore: number; // 0 to 100
  idleHours: number; // Idle time in hours
  disconnections: number; // Device disconnection events
  completedOrders: number;
  churnRiskScore: number; // 0 to 100
  riskCategory: 'High Risk' | 'Watchlist' | 'Low Risk';
  lastActive: string;
  vehicle: string;
}

const MOCK_ANALYTICS_DRIVERS: DriverAnalyticsData[] = [
  {
    id: 'd-1',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    performanceScore: 98,
    idleHours: 0.8,
    disconnections: 1,
    completedOrders: 342,
    churnRiskScore: 8,
    riskCategory: 'Low Risk',
    lastActive: '2 mins ago',
    vehicle: 'Motorcycle',
  },
  {
    id: 'd-2',
    name: 'Chidi Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    performanceScore: 92,
    idleHours: 1.5,
    disconnections: 2,
    completedOrders: 289,
    churnRiskScore: 18,
    riskCategory: 'Low Risk',
    lastActive: '5 mins ago',
    vehicle: 'Express Van',
  },
  {
    id: 'd-3',
    name: 'Ibrahim Bello',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    performanceScore: 68,
    idleHours: 4.8,
    disconnections: 7,
    completedOrders: 114,
    churnRiskScore: 74,
    riskCategory: 'High Risk',
    lastActive: '45 mins ago',
    vehicle: 'Bicycle',
  },
  {
    id: 'd-4',
    name: 'Tunde Bakare',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    performanceScore: 76,
    idleHours: 3.2,
    disconnections: 5,
    completedOrders: 180,
    churnRiskScore: 58,
    riskCategory: 'Watchlist',
    lastActive: '18 mins ago',
    vehicle: 'Motorcycle',
  },
  {
    id: 'd-5',
    name: 'Emeka Nwosu',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    performanceScore: 55,
    idleHours: 6.2,
    disconnections: 11,
    completedOrders: 82,
    churnRiskScore: 89,
    riskCategory: 'High Risk',
    lastActive: '2 hours ago',
    vehicle: 'Motorcycle',
  },
  {
    id: 'd-6',
    name: 'Aisha Lawal',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    performanceScore: 88,
    idleHours: 2.1,
    disconnections: 3,
    completedOrders: 215,
    churnRiskScore: 24,
    riskCategory: 'Low Risk',
    lastActive: '8 mins ago',
    vehicle: 'Car',
  },
];

interface AdvancedDriverAnalyticsProps {
  onClose?: () => void;
}

export const AdvancedDriverAnalytics: React.FC<AdvancedDriverAnalyticsProps> = ({ onClose }) => {
  const [selectedDriver, setSelectedDriver] = useState<DriverAnalyticsData | null>(MOCK_ANALYTICS_DRIVERS[2]);
  const [interventionLog, setInterventionLog] = useState<string | null>(null);

  const highRiskDrivers = MOCK_ANALYTICS_DRIVERS.filter((d) => d.riskCategory === 'High Risk');
  const watchlistDrivers = MOCK_ANALYTICS_DRIVERS.filter((d) => d.riskCategory === 'Watchlist');

  const handleSendRetentionOffer = (driverName: string) => {
    soundService.playNotification();
    setInterventionLog(`🎉 Retention intervention sent to ${driverName}! ₦10,000 priority dispatch bonus badge issued.`);
    soundService.playMessagePop();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
                <span>Advanced Fleet Analytics & Driver Churn Risk Scatter Plot</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyze courier retention parameters (performance score vs idle duration & network disconnects) to mitigate churn risk.
              </p>
            </div>
          </div>
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

      {/* Retention Action Banner */}
      {interventionLog && (
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{interventionLog}</span>
          </div>
          <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded">
            Bonus Dispatched
          </span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">
            High Churn Risk
          </span>
          <div className="text-2xl font-extrabold text-rose-800 font-mono">
            {highRiskDrivers.length} <span className="text-xs font-normal">riders</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium block">
            Score &lt; 70% | High Idle Time
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
            Watchlist
          </span>
          <div className="text-2xl font-extrabold text-amber-800 font-mono">
            {watchlistDrivers.length} <span className="text-xs font-normal">riders</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium block">
            Mild Disconnect Spike
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Avg Disconnect Frequency
          </span>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">
            {(MOCK_ANALYTICS_DRIVERS.reduce((a, b) => a + b.disconnections, 0) / MOCK_ANALYTICS_DRIVERS.length).toFixed(1)} / day
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            Device Health Impact
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
            Active Fleet Retention Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono">
            83.3%
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">
            Target SLA &gt; 80%
          </span>
        </div>
      </div>

      {/* Recharts Scatter Plot Visualization Container */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5 text-xs">
          <div>
            <span className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Driver Churn Risk Matrix (Scatter Plot)</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              X-Axis: Idle Time (Hours) vs Y-Axis: Performance Rating (%) • Bubble Size = Disconnects
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Low Churn Risk</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span>Watchlist</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>High Churn Risk</span>
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 15, right: 20, bottom: 15, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                dataKey="idleHours"
                name="Idle Duration"
                unit=" hrs"
                stroke="#94a3b8"
                fontSize={11}
              />
              <YAxis
                type="number"
                dataKey="performanceScore"
                name="Performance Score"
                unit="%"
                domain={[40, 100]}
                stroke="#94a3b8"
                fontSize={11}
              />
              <ZAxis
                type="number"
                dataKey="disconnections"
                range={[80, 400]}
                name="Device Disconnects"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#ffffff',
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'Idle Duration') return [`${value} hours`, name];
                  if (name === 'Performance Score') return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Scatter
                name="Drivers"
                data={MOCK_ANALYTICS_DRIVERS}
                onClick={(node: any) => {
                  if (node && node.payload) {
                    soundService.playNotification();
                    setSelectedDriver(node.payload);
                  }
                }}
              >
                {MOCK_ANALYTICS_DRIVERS.map((entry) => {
                  let fillColor = '#10b981'; // green
                  if (entry.riskCategory === 'Watchlist') fillColor = '#f59e0b'; // amber
                  if (entry.riskCategory === 'High Risk') fillColor = '#f43f5e'; // red
                  return <Cell key={entry.id} fill={fillColor} className="cursor-pointer hover:opacity-80 transition-opacity" />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Driver Detail & Mitigation Intervention Table */}
      <div className="space-y-3">
        <div className="font-extrabold text-slate-400 uppercase tracking-widest text-[10px]">
          Detailed Driver Churn Breakdown & Retention Action
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {MOCK_ANALYTICS_DRIVERS.map((driver) => {
            const isSelected = selectedDriver?.id === driver.id;
            return (
              <div
                key={driver.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isSelected ? 'bg-rose-50/50' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                      <span>{driver.name}</span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                          driver.riskCategory === 'High Risk'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : driver.riskCategory === 'Watchlist'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {driver.riskCategory} ({driver.churnRiskScore}% Churn Risk)
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-3 mt-0.5">
                      <span>Vehicle: {driver.vehicle}</span>
                      <span>•</span>
                      <span>Score: <strong className="text-slate-700">{driver.performanceScore}%</strong></span>
                      <span>•</span>
                      <span>Idle: <strong className="text-slate-700">{driver.idleHours} hrs</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right text-xs pr-2 hidden md:block">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Disconnect Events</span>
                    <span className="font-mono font-bold text-rose-600 flex items-center justify-end space-x-1">
                      <WifiOff className="w-3.5 h-3.5" />
                      <span>{driver.disconnections} drops</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendRetentionOffer(driver.name)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      driver.riskCategory === 'High Risk'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Retention Bonus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
