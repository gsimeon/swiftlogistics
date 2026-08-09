import React, { useState } from 'react';
import { Award, CheckCircle2, Star, Sparkles, Trophy, MapPin, Clock, DollarSign, Send, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { soundService } from '../services/soundService';

interface DeliveryCompletionCelebrationProps {
  orderNumber: string;
  driverName: string;
  driverAvatar: string;
  driverPhone: string;
  totalAmount: number;
  distanceKm?: number;
  durationMins?: number;
  onDismiss?: () => void;
  onSubmitRating?: (rating: number, comment: string) => void;
}

export const DeliveryCompletionCelebration: React.FC<DeliveryCompletionCelebrationProps> = ({
  orderNumber,
  driverName,
  driverAvatar,
  totalAmount,
  distanceKm = 4.2,
  durationMins = 18,
  onDismiss,
  onSubmitRating,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<number>(5);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playNotification();
    setIsSubmitted(true);
    if (onSubmitRating) {
      onSubmitRating(rating, comment);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-400/30 space-y-6 animate-fadeIn">
      {/* Background Animated Sparkles / Confetti Visual Elements */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center space-x-4 text-center sm:text-left">
          <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Trophy className="w-9 h-9 text-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Delivery Completed Successfully</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
              Package Delivered! #{orderNumber}
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Escrow payment of <strong className="text-amber-300">${totalAmount.toFixed(2)}</strong> released to driver
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl border border-white/20 transition-all shrink-0"
          >
            Close Summary
          </button>
        )}
      </div>

      {/* Key Delivery Performance Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center space-y-1">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-emerald-200 uppercase font-bold tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Distance Traveled</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-white">{distanceKm} km</div>
          <div className="text-[10px] text-emerald-100">Direct Route Taken</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center space-y-1">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-emerald-200 uppercase font-bold tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Delivery Duration</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-white">{durationMins} Mins</div>
          <div className="text-[10px] text-emerald-100">4 Mins Ahead of Schedule</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center space-y-1">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-emerald-200 uppercase font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>PIN Authentication</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-300">VERIFIED</div>
          <div className="text-[10px] text-emerald-100">Hand-to-Hand Delivery</div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-center space-y-1">
          <div className="flex items-center justify-center space-x-1 text-[11px] text-emerald-200 uppercase font-bold tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-amber-300" />
            <span>Escrow Status</span>
          </div>
          <div className="text-xl font-extrabold font-mono text-amber-300">RELEASED</div>
          <div className="text-[10px] text-emerald-100">Safe Transaction</div>
        </div>
      </div>

      {/* Driver Rating & Review Card */}
      {!isSubmitted ? (
        <form onSubmit={handleRatingSubmit} className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/20 space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src={driverAvatar}
              alt={driverName}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
            />
            <div>
              <h4 className="font-extrabold text-sm text-white">Rate Driver {driverName}</h4>
              <p className="text-xs text-slate-300">How was your delivery experience today?</p>
            </div>
          </div>

          {/* Interactive Star Selection */}
          <div className="flex items-center justify-center space-x-2 py-2 bg-white/5 rounded-xl border border-white/10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform active:scale-125"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Optional Driver Tip */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Add Optional Tip for Rider:</span>
              <span className="text-amber-300 font-mono font-bold">${tipAmount}</span>
            </label>
            <div className="flex items-center space-x-2">
              {[0, 2, 5, 10].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTipAmount(amt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    tipAmount === amt
                      ? 'bg-amber-500 text-slate-900 border-amber-400'
                      : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                  }`}
                >
                  {amt === 0 ? 'No Tip' : `$${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a compliments note (e.g. Fast delivery, careful handling)..."
              className="w-full p-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Submit Rating & Tip Driver</span>
          </button>
        </form>
      ) : (
        <div className="bg-emerald-950/60 backdrop-blur-md p-5 rounded-2xl border border-emerald-400/40 text-center space-y-2 animate-fadeIn">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-white text-base">Thank You for Your Feedback!</h4>
          <p className="text-xs text-emerald-200 max-w-md mx-auto">
            Your {rating}-star rating and ${tipAmount} tip have been sent to {driverName}. Have a wonderful day!
          </p>
        </div>
      )}
    </div>
  );
};
