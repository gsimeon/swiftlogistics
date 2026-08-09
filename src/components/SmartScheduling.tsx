import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Award
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface DemandZone {
  id: string;
  name: string;
  area: string;
  peakHours: string;
  demandLevel: 'Ultra High' | 'High' | 'Moderate';
  avgHourlyEarn: string;
  orderVolume: string;
  topItemCategory: string;
  multiplier: string;
}

const IKEJA_DEMAND_ZONES: DemandZone[] = [
  {
    id: 'z-cv',
    name: 'Computer Village Tech Hub',
    area: 'Otigba / Medical Road, Ikeja',
    peakHours: '11:00 AM - 3:30 PM',
    demandLevel: 'Ultra High',
    avgHourlyEarn: '₦9,500 - ₦14,000 / hr',
    orderVolume: '140+ orders/hr',
    topItemCategory: 'Electronics & Mobile Spares',
    multiplier: '1.8x Surge',
  },
  {
    id: 'z-gra',
    name: 'Ikeja GRA Corporate & Residential',
    area: 'Isaac John / Oba Akinjobi, Ikeja',
    peakHours: '12:00 PM - 2:30 PM & 6:00 PM - 9:30 PM',
    demandLevel: 'Ultra High',
    avgHourlyEarn: '₦11,000 - ₦16,500 / hr',
    orderVolume: '180+ orders/hr',
    topItemCategory: 'Gourmet Dining & Premium Hampers',
    multiplier: '2.0x Surge',
  },
  {
    id: 'z-allen',
    name: 'Allen Avenue Business District',
    area: 'Allen Ave / Toyin Street, Ikeja',
    peakHours: '8:00 AM - 10:30 AM & 4:30 PM - 8:00 PM',
    demandLevel: 'High',
    avgHourlyEarn: '₦8,000 - ₦12,000 / hr',
    orderVolume: '110+ orders/hr',
    topItemCategory: 'Corporate Documents & Fast Food',
    multiplier: '1.5x Surge',
  },
  {
    id: 'z-opebi',
    name: 'Opebi & Salvation Corridor',
    area: 'Opebi Road / Awolowo Way',
    peakHours: '5:00 PM - 10:00 PM',
    demandLevel: 'High',
    avgHourlyEarn: '₦7,500 - ₦11,000 / hr',
    orderVolume: '95+ orders/hr',
    topItemCategory: 'Retail Goods & Night Snacks',
    multiplier: '1.4x Surge',
  },
];

interface SmartSchedulingProps {
  driverName?: string;
  onClose?: () => void;
}

export const SmartScheduling: React.FC<SmartSchedulingProps> = ({
  driverName = 'Marcus Vance',
  onClose,
}) => {
  const [selectedZone, setSelectedZone] = useState<DemandZone>(IKEJA_DEMAND_ZONES[0]);
  const [bookedShifts, setBookedShifts] = useState<string[]>(['z-cv-lunch']);
  const [scheduledNotification, setScheduledNotification] = useState<string | null>(null);

  const handleToggleShift = (shiftKey: string, shiftTitle: string) => {
    soundService.playNotification();
    if (bookedShifts.includes(shiftKey)) {
      setBookedShifts((prev) => prev.filter((s) => s !== shiftKey));
      setScheduledNotification(`Removed "${shiftTitle}" shift from your schedule.`);
    } else {
      setBookedShifts((prev) => [...prev, shiftKey]);
      setScheduledNotification(`🎉 Shift Booked: "${shiftTitle}" in ${selectedZone.name}! High demand priority assigned.`);
      soundService.playMessagePop();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
                <span>AI Smart Scheduling & Ikeja Demand Forecaster</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                  Live Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Leverage historical dispatch density to reserve high-yield shifts across key Ikeja demand hotspots.
              </p>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-2 rounded-xl self-start sm:self-auto"
          >
            Close
          </button>
        )}
      </div>

      {/* Booking Alert Banner */}
      {scheduledNotification && (
        <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-amber-900 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">{scheduledNotification}</span>
          </div>
          <span className="text-[10px] bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded">
            Calendar Synced
          </span>
        </div>
      )}

      {/* Hotspot Zones Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[10px]">
            1. Select Ikeja Demand Hotspot Zone
          </span>
          <span className="text-emerald-600 font-bold flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
            <span>4 Active High-Density Clusters</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {IKEJA_DEMAND_ZONES.map((zone) => {
            const isSelected = selectedZone.id === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  soundService.playNotification();
                  setSelectedZone(zone);
                }}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-gradient-to-br from-slate-900 to-blue-950 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      zone.demandLevel === 'Ultra High'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {zone.demandLevel}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{zone.multiplier}</span>
                </div>

                <div className="font-bold text-sm mt-2">{zone.name}</div>
                <div className="text-[11px] opacity-75 truncate mt-0.5">{zone.area}</div>

                <div className="mt-3 pt-2 border-t border-slate-700/40 text-[11px] font-mono font-bold text-amber-300">
                  {zone.avgHourlyEarn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Deep Dive & Smart Shift Planner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
              Optimal Shift Suggestions for {selectedZone.name}
            </div>
            <div className="text-base font-extrabold text-white mt-0.5">
              Historical Peak Hours: {selectedZone.peakHours}
            </div>
          </div>

          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-emerald-400 font-bold">
            ⚡ Avg Volume: {selectedZone.orderVolume}
          </div>
        </div>

        {/* Suggested Shift Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            {
              id: `${selectedZone.id}-morning`,
              title: 'Morning Corporate Dispatch',
              time: '08:00 AM - 11:30 AM',
              estEarnings: '₦28,500',
              ordersEst: '8-10 Orders',
            },
            {
              id: `${selectedZone.id}-lunch`,
              title: 'Lunch Peak Rush (Recommended)',
              time: '11:30 AM - 03:00 PM',
              estEarnings: '₦38,000',
              ordersEst: '12-15 Orders',
            },
            {
              id: `${selectedZone.id}-evening`,
              title: 'Evening Executive Courier',
              time: '05:00 PM - 09:00 PM',
              estEarnings: '₦42,000',
              ordersEst: '14-18 Orders',
            },
          ].map((shift) => {
            const isBooked = bookedShifts.includes(shift.id);
            return (
              <div
                key={shift.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isBooked
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                    : 'bg-slate-800/80 border-slate-700 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-300 uppercase font-bold">{shift.time}</span>
                    {isBooked && (
                      <span className="bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Reserved</span>
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-white mt-1">{shift.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{shift.ordersEst}</div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Est Earnings</span>
                    <span className="font-mono text-emerald-400 font-extrabold text-sm">{shift.estEarnings}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleShift(shift.id, shift.title)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isBooked
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs'
                    }`}
                  >
                    {isBooked ? 'Cancel Shift' : 'Book Shift'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Insight Footer */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Drivers who work recommended shifts in <strong>{selectedZone.name}</strong> achieve <strong>38% higher completion rates</strong> and qualify for the ₦15,000 weekly attendance bonus.
          </span>
        </div>
      </div>

    </div>
  );
};
