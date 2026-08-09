import React, { useState } from 'react';
import { 
  Award, 
  Gift, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  Star, 
  Tag, 
  Clock, 
  Zap,
  Check
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface LoyaltyPointsTrackerProps {
  clientName?: string;
  onApplyDiscountVoucher?: (discountAmount: number, voucherCode: string) => void;
}

export const LoyaltyPointsTracker: React.FC<LoyaltyPointsTrackerProps> = ({
  clientName = 'David Miller',
  onApplyDiscountVoucher,
}) => {
  const [pointsBalance, setPointsBalance] = useState<number>(450); // initial balance
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  const vouchers = [
    {
      id: 'vouch-1',
      code: 'EXPRESS5',
      pointsCost: 200,
      discountDollars: 5.00,
      label: '$5.00 Off Express Delivery Fee',
      description: 'Waives base dispatch fee for any Ikeja zone motorcycle or van request.',
    },
    {
      id: 'vouch-2',
      code: 'VIPFLEET10',
      pointsCost: 400,
      discountDollars: 10.00,
      label: '$10.00 Off Total Package Escrow',
      description: 'Applies instant $10.00 credit towards your store product items or delivery.',
    },
  ];

  const pointsHistory = [
    { id: 'ph-1', date: '2026-08-07', desc: 'Completed Order #LP-8842 (Ikeja TechHub)', points: +50 },
    { id: 'ph-2', date: '2026-08-05', desc: 'Driver Tip Bonus (+5 Star Rating Given)', points: +25 },
    { id: 'ph-3', date: '2026-08-01', desc: 'Completed Order #LP-8790 (Oba Akran Hub)', points: +50 },
    { id: 'ph-4', date: '2026-07-28', desc: 'Welcome Bonus: LogisticsPro VIP Enrollment', points: +325 },
  ];

  const handleRedeem = (v: typeof vouchers[0]) => {
    if (pointsBalance < v.pointsCost) return;

    soundService.playMessagePop();
    setPointsBalance((prev) => prev - v.pointsCost);
    setAppliedVoucher(v.code);

    if (onApplyDiscountVoucher) {
      onApplyDiscountVoucher(v.discountDollars, v.code);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800 p-5 rounded-2xl shadow-xl space-y-4">
      
      {/* Header & Balance Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 rounded-2xl shadow-md font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-white">LogisticsPro Client Loyalty Points</h3>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                Gold Tier Member
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Earn +50 points per completed delivery • Redeem for instant delivery discounts
            </p>
          </div>
        </div>

        {/* Big Points Badge */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-blue-700/60 text-right self-start sm:self-auto">
          <span className="text-[10px] text-blue-300 uppercase font-bold block">Available Points</span>
          <div className="text-2xl font-black font-mono text-amber-400 flex items-center justify-end space-x-1">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{pointsBalance} pts</span>
          </div>
        </div>
      </div>

      {/* Redeemable Vouchers Grid */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-xs text-blue-200 uppercase tracking-widest text-[10px] flex items-center space-x-1">
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span>Redeem Available Delivery Vouchers</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {vouchers.map((v) => {
            const canAfford = pointsBalance >= v.pointsCost;
            const isClaimed = appliedVoucher === v.code;

            return (
              <div
                key={v.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2 flex flex-col justify-between ${
                  isClaimed
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                    : canAfford
                    ? 'bg-slate-800/80 border-blue-700/80 hover:border-amber-400/60 text-slate-100'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>{v.label}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {v.pointsCost} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200 mt-1 leading-relaxed">
                    {v.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-blue-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-300">Promo Code: {v.code}</span>

                  <button
                    type="button"
                    onClick={() => handleRedeem(v)}
                    disabled={!canAfford || isClaimed}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                      isClaimed
                        ? 'bg-emerald-500 text-slate-950'
                        : canAfford
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied to Checkout</span>
                      </>
                    ) : (
                      <span>Redeem Voucher</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Ledger History */}
      <div className="pt-2 border-t border-blue-800/60 space-y-2">
        <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
          Recent Points Activity History
        </span>

        <div className="divide-y divide-blue-800/40 text-xs">
          {pointsHistory.map((h) => (
            <div key={h.id} className="py-2 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-800/60 text-amber-300 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-slate-200 font-medium">{h.desc}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-[10px]">{h.date}</span>
                <span className="font-mono font-bold text-amber-400">+{h.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
