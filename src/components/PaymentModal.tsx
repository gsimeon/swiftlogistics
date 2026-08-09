import React, { useState } from 'react';
import { DeliveryOrder } from '../types';
import { CreditCard, ShieldCheck, Lock, CheckCircle2, DollarSign, Wallet, ArrowRight, X } from 'lucide-react';
import { soundService } from '../services/soundService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryOrder;
  onConfirmPayment: (paymentMethod: 'credit_card' | 'apple_pay' | 'google_pay' | 'wallet', tipAmount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'credit_card' | 'apple_pay' | 'google_pay' | 'wallet'>('credit_card');
  const [tipPercent, setTipPercent] = useState<number>(15);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const tip = Math.round((order.subtotal * (tipPercent / 100)) * 100) / 100;
  const totalPayable = order.subtotal + order.deliveryFee + tip;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      soundService.playNotification();

      setTimeout(() => {
        onConfirmPayment(selectedMethod, tip);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Escrow Guarantee Banner */}
        <div className="flex items-center space-x-2 bg-emerald-950/50 border border-emerald-500/30 p-3 rounded-2xl mb-5 text-emerald-300 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold">100% Secure Escrow Protection</div>
            <div className="text-[11px] text-emerald-400/80">Funds are held safely in escrow and only released to rider once delivery is confirmed.</div>
          </div>
        </div>

        <h3 className="font-extrabold text-xl text-white mb-1">Checkout & Escrow Authorization</h3>
        <p className="text-xs text-slate-400 mb-6">Order #{order.orderNumber} • {order.store.name}</p>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-xl text-white">Escrow Payment Locked!</h4>
            <p className="text-xs text-slate-400">Your ${totalPayable.toFixed(2)} is held safely. Driver will be dispatched immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('credit_card')}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    selectedMethod === 'credit_card'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card (•••• 4921)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('wallet')}
                  className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    selectedMethod === 'wallet'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>LogiWallet ($350.00)</span>
                </button>
              </div>
            </div>

            {/* Rider Tip Selector & Interactive Slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">Suggested Tip Percentage</label>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold mr-1.5">({tipPercent}%)</span>
                  <span className="text-sm text-emerald-400 font-extrabold font-mono">${tip.toFixed(2)}</span>
                </div>
              </div>

              {/* Preset Percentages (10%, 15%, 20%) */}
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((pct) => {
                  const isSelected = tipPercent === pct;
                  const calculatedTipValue = Math.round((order.subtotal * (pct / 100)) * 100) / 100;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercent(pct)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>{pct}% {pct === 15 ? '• Recommended' : pct === 20 ? '• Generous' : '• Standard'}</span>
                      <span className="text-[10px] opacity-80 font-mono">${calculatedTipValue.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Tip Range Slider (Percentage) */}
              <div className="pt-1 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Slide to Adjust Percentage</span>
                  <span>0% — 30%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  value={tipPercent}
                  onChange={(e) => setTipPercent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Itemized Cost Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Express Distance Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Driver Courier Tip</span>
                <span>${tip.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-extrabold text-white text-sm">
                <span>Total Escrow Amount</span>
                <span className="text-emerald-400">${totalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm transition-transform active:scale-98"
            >
              {isProcessing ? (
                <span>Locking Funds in Escrow...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize Escrow ${totalPayable.toFixed(2)}</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
