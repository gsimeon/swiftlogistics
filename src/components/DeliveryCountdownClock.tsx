import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Flame, ShieldAlert, PlusCircle, RefreshCw, Zap, TrendingUp } from 'lucide-react';
import { soundService } from '../services/soundService';

interface DeliveryCountdownClockProps {
  createdAt: string;
  estimatedMinutes: number;
  status: string;
  orderNumber: string;
  onExtendMinutes?: (mins: number) => void;
}

export const DeliveryCountdownClock: React.FC<DeliveryCountdownClockProps> = ({
  createdAt,
  estimatedMinutes,
  status,
  orderNumber,
  onExtendMinutes,
}) => {
  const [extensionMins, setExtensionMins] = useState<number>(0);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Calculate target delivery timestamp (base creation time + estimated minutes + extensions)
  const baseTimestamp = React.useMemo(() => {
    const parsed = new Date(createdAt).getTime();
    return isNaN(parsed) ? Date.now() - 5 * 60000 : parsed;
  }, [createdAt]);

  const targetTimestamp = baseTimestamp + (estimatedMinutes + extensionMins) * 60 * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'delivered' || status === 'cancelled') {
    return (
      <div className="bg-emerald-900/90 text-white p-4 rounded-2xl border border-emerald-500/50 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Order #{orderNumber} Completed</div>
            <div className="text-base font-extrabold text-white">SLA Fulfilled On Schedule</div>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full border border-emerald-500/40">
          100% Punctual
        </span>
      </div>
    );
  }

  const diffMs = targetTimestamp - nowTime;
  const isOverdue = diffMs <= 0;
  const absMs = Math.abs(diffMs);

  const minutesLeft = Math.floor(absMs / (1000 * 60));
  const secondsLeft = Math.floor((absMs % (1000 * 60)) / 1000);

  const formattedMins = String(minutesLeft).padStart(2, '0');
  const formattedSecs = String(secondsLeft).padStart(2, '0');

  const targetTimeString = new Date(targetTimestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleAddTrafficBuffer = (minsToAdd: number) => {
    soundService.playNotification();
    setExtensionMins((prev) => prev + minsToAdd);
    if (onExtendMinutes) {
      onExtendMinutes(minsToAdd);
    }
  };

  // Efficiency pace status
  let paceBadge = {
    bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
    icon: <Zap className="w-4 h-4 text-emerald-400" />,
    label: 'Optimal Delivery Efficiency Pace',
  };

  if (isOverdue) {
    paceBadge = {
      bg: 'bg-rose-950/90 border-rose-500/80 text-rose-200 animate-pulse',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      label: 'SLA Overdue Warning - Request Dispatch Bypass',
    };
  } else if (minutesLeft < 5) {
    paceBadge = {
      bg: 'bg-amber-950/90 border-amber-500/80 text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />,
      label: 'Tight Deadline (< 5 mins) - Accelerate Speed',
    };
  }

  return (
    <div className={`p-5 rounded-2xl border shadow-xl space-y-4 transition-all duration-300 ${
      isOverdue ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 border-rose-600' : 'bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 border-slate-700 text-white'
    }`}>
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl ${isOverdue ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
            <Clock className={`w-5 h-5 ${isOverdue ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Real-time Dispatch Countdown
              </span>
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border ${paceBadge.bg}`}>
                {isOverdue ? 'OVERDUE' : 'SLA ACTIVE'}
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-white">Target SLA Deadline: <span className="text-amber-300 font-mono font-bold">{targetTimeString}</span></h4>
          </div>
        </div>

        {/* Quick Buffer Button */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => handleAddTrafficBuffer(5)}
            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-all active:scale-95"
            title="Add +5 mins buffer due to Ikeja gridlock"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>+5 Mins Traffic Buffer</span>
          </button>
        </div>
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Big Digital Clock */}
        <div className="flex items-baseline space-x-2">
          <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
            isOverdue ? 'text-rose-400' : minutesLeft < 5 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {isOverdue ? `-${formattedMins}:${formattedSecs}` : `${formattedMins}:${formattedSecs}`}
          </span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isOverdue ? 'Minutes Overdue' : 'Time Remaining'}
          </span>
        </div>

        {/* Status Metric Badge */}
        <div className={`p-3 rounded-xl border flex items-center space-x-3 text-xs ${paceBadge.bg}`}>
          {paceBadge.icon}
          <div>
            <div className="font-extrabold text-white text-[11px]">{paceBadge.label}</div>
            <div className="text-[10px] opacity-80">
              {isOverdue ? 'Driver support alerted for priority rerouting' : `Total Allocation: ${estimatedMinutes + extensionMins} mins`}
            </div>
          </div>
        </div>

      </div>

      {/* Efficiency Bar Progress Visual */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
          <span>Dispatched</span>
          <span>Target Deadline ({targetTimeString})</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-1000 ${
              isOverdue
                ? 'bg-rose-500 animate-pulse'
                : minutesLeft < 5
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-blue-500 to-emerald-400'
            }`}
            style={{
              width: `${
                isOverdue
                  ? 100
                  : Math.max(5, Math.min(100, 100 - ((minutesLeft * 60 + secondsLeft) / ((estimatedMinutes + extensionMins) * 60)) * 100))
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
