import React, { useState } from 'react';
import { Truck, Bell, Clock, MapPin, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import { soundService } from '../services/soundService';

interface TwoStopsAwayAlertProps {
  driverName?: string;
  storeName?: string;
  vehiclePlate?: string;
  stopsAway?: number;
  onDismiss?: () => void;
}

export const TwoStopsAwayAlert: React.FC<TwoStopsAwayAlertProps> = ({
  driverName = 'Tunde Bakare',
  storeName = 'Ikeja Electronics Hub',
  vehiclePlate = 'LSD-492-XY',
  stopsAway = 2,
  onDismiss,
}) => {
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  const handleAcknowledge = () => {
    soundService.playSuccessFanfare();
    setAcknowledged(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-2 border-blue-400 p-4 rounded-2xl shadow-xl space-y-3 animate-bounce-short relative overflow-hidden">
      
      {/* Decorative Background Pulsing Badge */}
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl font-black shrink-0 shadow-lg animate-pulse">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400/20 text-amber-300 font-mono font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-wider">
                Proactive Delivery Alert
              </span>
              <span className="text-[11px] text-blue-200 font-bold">2 Stops Remaining</span>
            </div>
            <h3 className="font-extrabold text-base text-white mt-1">
              Driver is Exactly {stopsAway} Stops Away From Your Location!
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Courier <strong className="text-white font-semibold">{driverName}</strong> ({vehiclePlate}) is completing 2 prior drop-offs on route from <strong className="text-white">{storeName}</strong>.
            </p>
          </div>
        </div>

        {/* Quick Acknowledge Button */}
        <button
          onClick={handleAcknowledge}
          className={`py-2 px-3.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shrink-0 ${
            acknowledged
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md active:scale-95'
          }`}
        >
          {acknowledged ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>I'm Ready!</span>
            </>
          ) : (
            <>
              <span>Ready for Arrival</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Progress Line */}
      <div className="bg-slate-950/60 p-2.5 rounded-xl border border-blue-800/60 flex items-center justify-between text-[11px] text-blue-200 font-mono">
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-amber-400" />
          <span>Current Stop: Stop 3 of 5</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-400 font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>Expected Arrival: ~8-12 Mins</span>
        </div>
      </div>

    </div>
  );
};
