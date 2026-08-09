import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, User, Calendar, Clock, CheckCircle2, MessageSquare, Send, X, Sparkles, Award } from 'lucide-react';
import { soundService } from '../services/soundService';

interface PunctualityReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName?: string;
  punctualityScore?: number;
  onScheduleReviewSession: (details: { driverName: string; date: string; time: string; notes: string }) => void;
}

export const PunctualityReviewModal: React.FC<PunctualityReviewModalProps> = ({
  isOpen,
  onClose,
  driverName = 'Ibrahim Bello',
  punctualityScore = 68,
  onScheduleReviewSession,
}) => {
  const [reviewDate, setReviewDate] = useState('2026-08-09');
  const [reviewTime, setReviewTime] = useState('10:00');
  const [managerNotes, setManagerNotes] = useState(
    'Historical punctuality score dropped below 80% threshold. Focus on GPS route compliance, pickup delay reductions, and customer notification speed.'
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playNotification();

    onScheduleReviewSession({
      driverName,
      date: reviewDate,
      time: reviewTime,
      notes: managerNotes,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border-2 border-rose-500/80 rounded-2xl shadow-2xl p-6 relative space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base">Driver Punctuality Review Session</h3>
                <span className="bg-rose-100 text-rose-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                  ALERT (&lt; 80%)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated threshold breach notification triggered for store managers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-3.5 rounded-xl border border-rose-500/80 text-white flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl font-bold font-mono">
              {punctualityScore}%
            </div>
            <div>
              <span className="font-bold text-rose-200 block">{driverName}</span>
              <span className="text-[10px] text-rose-300">
                Punctuality Score: <strong className="text-white">{punctualityScore}%</strong> (Threshold: 80%)
              </span>
            </div>
          </div>

          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded font-mono font-bold border border-amber-500/40">
            Review Required
          </span>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-sm">Review Session Dispatched!</h4>
            <p className="text-xs text-emerald-700">
              Notification sent to <strong>{driverName}</strong> for {reviewDate} at {reviewTime}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Session Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Session Date</label>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Session Time</label>
                <input
                  type="time"
                  value={reviewTime}
                  onChange={(e) => setReviewTime(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Manager Notes */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Store Manager Review Notes & Guidance</label>
              <textarea
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                rows={3}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Schedule & Dispatch Alert</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
