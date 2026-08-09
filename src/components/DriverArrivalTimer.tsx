import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';

interface DriverArrivalTimerProps {
  status: string;
  driverName: string;
  driverPhone?: string;
  vehiclePlate?: string;
}

export const DriverArrivalTimer: React.FC<DriverArrivalTimerProps> = ({
  status,
  driverName,
  driverPhone = '+234 803 123 4567',
  vehiclePlate = 'LSD-492-XY',
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isSimulatedArrival, setIsSimulatedArrival] = useState<boolean>(false);

  const isActive = status === 'arrived' || isSimulatedArrival;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const maxFreeSeconds = 300; // 5 minutes free waiting limit
  const remainingFreeSeconds = Math.max(0, maxFreeSeconds - secondsElapsed);
  const isOvertime = secondsElapsed > maxFreeSeconds;

  const formatMMSS = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Rider <strong>{driverName}</strong> ({vehiclePlate}) in transit.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            soundService.playNotification();
            setIsSimulatedArrival(true);
          }}
          className="text-[10px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 px-2.5 py-1 rounded-lg transition-all"
        >
          Test Driver Arrival Timer
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border shadow-md space-y-3 transition-all animate-fadeIn ${
      isOvertime
        ? 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-red-500 text-white'
        : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-500 text-white'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl font-bold ${isOvertime ? 'bg-red-500 text-white animate-bounce' : 'bg-emerald-500 text-slate-950 animate-pulse'}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm flex items-center space-x-2">
              <span>Driver Arrived — Waiting at Pickup Spot</span>
              {isSimulatedArrival && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Simulation
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-300">
              {driverName} ({vehiclePlate}) has reached your destination
            </p>
          </div>
        </div>

        {/* Counter Widget */}
        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">
            {isOvertime ? 'Overtime Waiting' : 'Free Wait Time Remaining'}
          </span>
          <span className={`text-xl font-black ${isOvertime ? 'text-red-400' : 'text-emerald-400'}`}>
            {isOvertime ? `+${formatMMSS(secondsElapsed - maxFreeSeconds)}` : formatMMSS(remainingFreeSeconds)}
          </span>
        </div>
      </div>

      {/* Progress Bar & Warning */}
      <div className="space-y-1.5">
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isOvertime ? 'bg-red-500' : remainingFreeSeconds < 60 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{
              width: isOvertime
                ? '100%'
                : `${Math.min(100, (secondsElapsed / maxFreeSeconds) * 100)}%`,
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Driver Waiting Duration: <strong className="font-mono text-white">{formatMMSS(secondsElapsed)}</strong></span>
          </span>

          {isOvertime ? (
            <span className="text-red-400 font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Standard 5 min limit reached ($0.15/min fee)</span>
            </span>
          ) : (
            <span className="text-emerald-400 font-bold">5:00 Free Wait Period</span>
          )}
        </div>
      </div>

      {/* Stop / Meet Driver Action Bar */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-slate-400 text-[11px]">
          Please meet the rider at the main entrance or gate.
        </span>

        {isSimulatedArrival && (
          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setIsSimulatedArrival(false);
            }}
            className="text-[10px] text-slate-400 hover:text-white underline"
          >
            End Simulation
          </button>
        )}
      </div>

    </div>
  );
};
