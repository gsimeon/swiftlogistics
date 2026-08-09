import React, { useState } from 'react';
import { DeliveryOrder } from '../types';
import { Star, MessageSquare, Compass, PhoneCall, CheckCircle2, Award, X, Sparkles, ShieldCheck } from 'lucide-react';
import { soundService } from '../services/soundService';

interface PostDeliveryFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryOrder;
  onSubmitFeedback?: (metrics: {
    navRating: number;
    commRating: number;
    handlingRating: number;
    comments: string;
  }) => void;
}

export const PostDeliveryFeedbackModal: React.FC<PostDeliveryFeedbackModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitFeedback,
}) => {
  const [navRating, setNavRating] = useState<number>(5);
  const [commRating, setCommRating] = useState<number>(5);
  const [handlingRating, setHandlingRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Saved Aggregate Metrics State (calculated dynamically)
  const [aggregateScore, setAggregateScore] = useState({
    avgNavPct: 98,
    avgCommPct: 96,
    totalSurveys: 14,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playSuccessFanfare();

    // Calculate new aggregate percentages
    const newNavPct = Math.round(((aggregateScore.avgNavPct * aggregateScore.totalSurveys) + (navRating / 5) * 100) / (aggregateScore.totalSurveys + 1));
    const newCommPct = Math.round(((aggregateScore.avgCommPct * aggregateScore.totalSurveys) + (commRating / 5) * 100) / (aggregateScore.totalSurveys + 1));

    setAggregateScore({
      avgNavPct: newNavPct,
      avgCommPct: newCommPct,
      totalSurveys: aggregateScore.totalSurveys + 1,
    });

    if (onSubmitFeedback) {
      onSubmitFeedback({ navRating, commRating, handlingRating, comments });
    }

    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 text-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-2xl text-slate-800 tracking-tight">Feedback Recorded!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Thank you! Your ratings directly feed our aggregate delivery precision and service quality models.
            </p>

            {/* Aggregate Metrics Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl max-w-sm mx-auto text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 pb-2">
                <span>Updated Aggregate Service Metrics</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Nav Quality Score</span>
                  <span className="font-mono font-extrabold text-base text-blue-600">{aggregateScore.avgNavPct}%</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Store Communication</span>
                  <span className="font-mono font-extrabold text-base text-emerald-600">{aggregateScore.avgCommPct}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">Post-Delivery Feedback Survey</h3>
              <p className="text-xs text-slate-500 mt-1">
                Order <strong className="text-blue-600 font-mono">#{order.orderNumber}</strong> • {order.store.name}
              </p>
            </div>

            {/* Aggregate Benchmark Summary */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-semibold">Store Aggregate Benchmarks:</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-bold font-mono">
                <span className="text-blue-600">Nav: {aggregateScore.avgNavPct}%</span>
                <span className="text-emerald-600">Comm: {aggregateScore.avgCommPct}%</span>
              </div>
            </div>

            {/* Rating 1: Navigation Quality */}
            <div className="space-y-1.5 bg-white border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>1. Navigation & Route Precision</span>
                </span>
                <span className="font-mono text-xs font-bold text-blue-600">{navRating} / 5</span>
              </div>
              <p className="text-[11px] text-slate-500">How smooth and accurate was the driver's arrival route and turn-by-turn guidance?</p>
              <div className="flex space-x-2 pt-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNavRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= navRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Rating 2: Store Communication */}
            <div className="space-y-1.5 bg-white border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>2. Store & Dispatcher Communication</span>
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600">{commRating} / 5</span>
              </div>
              <p className="text-[11px] text-slate-500">Were ETA updates, delays, and store preparation notifications clear?</p>
              <div className="flex space-x-2 pt-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCommRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= commRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Rating 3: Package Handling */}
            <div className="space-y-1.5 bg-white border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>3. Package Handling & Condition</span>
                </span>
                <span className="font-mono text-xs font-bold text-purple-600">{handlingRating} / 5</span>
              </div>
              <div className="flex space-x-2 pt-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setHandlingRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= handlingRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional Service Feedback (Optional)</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share any comments regarding navigation quality, courier service, or store packaging..."
                rows={2}
                className="w-full bg-slate-50 text-slate-800 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md text-xs uppercase tracking-wider transition-all active:scale-98"
            >
              Submit Service Survey & Save Metrics
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
