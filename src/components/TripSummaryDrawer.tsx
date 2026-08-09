import React from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Gauge, 
  CheckCircle2, 
  Star, 
  Share2, 
  Route, 
  Award,
  Navigation,
  ArrowRight
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface TripSummaryData {
  orderNumber: string;
  storeName: string;
  clientName: string;
  pickupAddress: string;
  dropoffAddress: string;
  totalDistanceKm: number;
  avgSpeedKmH: number;
  stopsCount: number;
  durationMinutes: number;
  baseEarnings: number;
  tipAmount: number;
  surgeBonus: number;
  rating: number;
  clientFeedback?: string;
  completedAtTime: string;
}

interface TripSummaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tripData?: Partial<TripSummaryData>;
}

export const TripSummaryDrawer: React.FC<TripSummaryDrawerProps> = ({
  isOpen,
  onClose,
  tripData,
}) => {
  if (!isOpen) return null;

  const summary: TripSummaryData = {
    orderNumber: tripData?.orderNumber || 'LP-8890',
    storeName: tripData?.storeName || 'Maryland Mall Gourmet Hub',
    clientName: tripData?.clientName || 'Sandra Ebuka',
    pickupAddress: tripData?.pickupAddress || 'Ikorodu Road, Maryland, Ikeja',
    dropoffAddress: tripData?.dropoffAddress || 'Mobolaji Bank Anthony Way, Ikeja GRA',
    totalDistanceKm: tripData?.totalDistanceKm || 6.4,
    avgSpeedKmH: tripData?.avgSpeedKmH || 38,
    stopsCount: tripData?.stopsCount || 2,
    durationMinutes: tripData?.durationMinutes || 16,
    baseEarnings: tripData?.baseEarnings || 18.50,
    tipAmount: tripData?.tipAmount || 4.50,
    surgeBonus: tripData?.surgeBonus || 2.00,
    rating: tripData?.rating || 5,
    clientFeedback: tripData?.clientFeedback || 'Prompt and polite driver! Handled delicate package with care.',
    completedAtTime: tripData?.completedAtTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const totalPayout = summary.baseEarnings + summary.tipAmount + summary.surgeBonus;

  const handleShareReceipt = () => {
    soundService.playNotification();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Trip ${summary.orderNumber} Summary: ${summary.totalDistanceKm}km completed in ${summary.durationMinutes}m. Total Earned: $${totalPayout.toFixed(2)}.`);
      soundService.playMessagePop();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Slide-out Drawer Panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-slideLeft">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 space-y-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Trip Completed Summary</h3>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  Order #{summary.orderNumber} • Delivered at {summary.completedAtTime}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playNotification();
                onClose();
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Route Addresses */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-300 truncate">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></div>
              <span className="font-bold text-white shrink-0">Pickup:</span>
              <span className="truncate">{summary.pickupAddress}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 truncate">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
              <span className="font-bold text-white shrink-0">Drop-off:</span>
              <span className="truncate">{summary.dropoffAddress}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 text-slate-800 flex-1">
          
          {/* Earnings Spotlight Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-90">
              Trip Payout Breakdown
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono">${totalPayout.toFixed(2)}</span>
              <span className="text-xs bg-emerald-500/40 border border-emerald-300/40 px-2.5 py-1 rounded-lg font-bold">
                Escrow Funds Released
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-500/40 grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-emerald-100 block text-[9px]">Base Pay</span>
                <span className="font-bold font-mono">${summary.baseEarnings.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-emerald-100 block text-[9px]">Client Tip</span>
                <span className="font-bold font-mono">${summary.tipAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-emerald-100 block text-[9px]">Surge Bonus</span>
                <span className="font-bold font-mono">${summary.surgeBonus.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Key Journey Metrics Grid */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest text-[10px]">
              Journey Performance Telemetry
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              
              {/* Distance */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <Route className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total Distance</span>
                </span>
                <div className="text-lg font-extrabold text-slate-900 font-mono">{summary.totalDistanceKm} km</div>
                <span className="text-[10px] text-emerald-600 font-medium">Optimal route followed</span>
              </div>

              {/* Avg Speed */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Avg Speed</span>
                </span>
                <div className="text-lg font-extrabold text-slate-900 font-mono">{summary.avgSpeedKmH} km/h</div>
                <span className="text-[10px] text-slate-500 font-medium">Smooth speed profile</span>
              </div>

              {/* Duration */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Trip Duration</span>
                </span>
                <div className="text-lg font-extrabold text-slate-900 font-mono">{summary.durationMinutes} mins</div>
                <span className="text-[10px] text-emerald-600 font-bold">-4 mins faster than SLA</span>
              </div>

              {/* Stops Count */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-600" />
                  <span>Stops Made</span>
                </span>
                <div className="text-lg font-extrabold text-slate-900 font-mono">{summary.stopsCount} Stops</div>
                <span className="text-[10px] text-slate-500 font-medium">1 Hub + 1 Client</span>
              </div>

            </div>
          </div>

          {/* Customer Rating & Feedback Snippet */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-900 flex items-center space-x-1">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Client Rating & Feedback</span>
              </span>
              <div className="flex items-center space-x-0.5">
                {[...Array(summary.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-400" />
                ))}
              </div>
            </div>

            {summary.clientFeedback && (
              <p className="text-xs text-amber-800 italic bg-amber-100/50 p-2.5 rounded-lg border border-amber-200/60">
                "{summary.clientFeedback}"
              </p>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-2 sticky bottom-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleShareReceipt}
              className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Share Summary</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundService.playNotification();
                onClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-md transition-transform active:scale-95"
            >
              <span>Back to Active Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
