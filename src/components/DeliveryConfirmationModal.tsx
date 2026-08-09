import React, { useState, useRef } from 'react';
import { DeliveryOrder } from '../types';
import { ShieldCheck, CheckCircle, KeyRound, PenTool, Star, Award, PartyPopper, RefreshCw, X } from 'lucide-react';
import { soundService } from '../services/soundService';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: DeliveryOrder;
  onConfirmDealClosed: (pin: string, signature: string, rating: number, review: string) => void;
}

export const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmDealClosed,
}) => {
  const [activeTab, setActiveTab] = useState<'pin' | 'signature'>('pin');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [sigError, setSigError] = useState('');
  const [penColor, setPenColor] = useState<string>('#10b981'); // Emerald default

  if (!isOpen) return null;

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    setSigError('');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
  };

  const handleConfirmPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput !== order.deliveryPin) {
      setPinError(`Incorrect PIN. Security code is ${order.deliveryPin}`);
      return;
    }
    setPinError('');
    executeDealClose();
  };

  const handleConfirmSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasDrawn) {
      setSigError('Please draw your signature in the box above before confirming.');
      return;
    }
    setSigError('');
    executeDealClose();
  };

  const executeDealClose = () => {
    setIsSuccess(true);
    soundService.playSuccessFanfare();

    const signatureData = canvasRef.current ? canvasRef.current.toDataURL() : '';

    setTimeout(() => {
      onConfirmDealClosed(pinInput || order.deliveryPin, signatureData, rating, reviewText);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                <PartyPopper className="w-10 h-10" />
              </div>
            </div>
            <h3 className="font-extrabold text-2xl text-white">Deal Closed & Escrow Released!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Package received! Payment of <strong className="text-emerald-400">${order.total.toFixed(2)}</strong> has been released to rider <strong className="text-white">{order.driver?.name}</strong>.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 inline-block font-mono">
              Transaction ID: TXN-{Date.now().toString().slice(-8)}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-white">Confirm Delivery & Close Deal</h3>
              <p className="text-xs text-slate-400 mt-1">
                Provide security PIN or digital signature to authorize escrow release.
              </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('pin')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'pin' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>4-Digit PIN</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('signature')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'signature' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Sign on Screen</span>
              </button>
            </div>

            {/* Tab 1: PIN Input */}
            {activeTab === 'pin' && (
              <form onSubmit={handleConfirmPIN} className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <div className="text-xs text-slate-400 mb-1">Your Delivery Security PIN is:</div>
                  <div className="font-mono text-2xl font-extrabold text-emerald-400 tracking-widest bg-emerald-950/40 py-1.5 rounded-xl border border-emerald-500/30 inline-block px-4">
                    {order.deliveryPin}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Enter PIN to Confirm</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter 4-digit PIN..."
                    className="w-full bg-slate-950 text-white font-mono text-center text-lg tracking-widest py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  {pinError && <div className="text-rose-400 text-xs mt-1 text-center font-semibold">{pinError}</div>}
                </div>

                {/* Rating & Review */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Rate Driver Performance</label>
                  <div className="flex justify-center space-x-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-wider"
                >
                  Verify PIN & Close Deal
                </button>
              </form>
            )}

            {/* Tab 2: Canvas Signature */}
            {activeTab === 'signature' && (
              <form onSubmit={handleConfirmSignature} className="space-y-4">
                <div className="relative space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-300">
                      Sign Below (Finger or Mouse)
                    </label>

                    {/* Pen Color Selector Pills & Clear Button */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {[
                          { color: '#10b981', label: 'Emerald' },
                          { color: '#3b82f6', label: 'Blue' },
                          { color: '#f59e0b', label: 'Gold' },
                          { color: '#ffffff', label: 'White' },
                        ].map((p) => (
                          <button
                            key={p.color}
                            type="button"
                            onClick={() => setPenColor(p.color)}
                            className={`w-4 h-4 rounded-full transition-transform ${
                              penColor === p.color ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: p.color }}
                            title={`Pen Color: ${p.label}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[10px] text-slate-400 hover:text-rose-400 font-bold flex items-center space-x-0.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Canvas Container with Signature Guide Overlay */}
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={140}
                      onMouseDown={handleStartDraw}
                      onMouseMove={handleDraw}
                      onMouseUp={handleStopDraw}
                      onTouchStart={handleStartDraw}
                      onTouchMove={handleDraw}
                      onTouchEnd={handleStopDraw}
                      className="w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl cursor-crosshair touch-none"
                    />

                    {/* Baseline Guide "X Sign Here" Overlay */}
                    {!hasDrawn && (
                      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex items-center justify-between text-slate-700 select-none">
                        <span className="font-mono text-xs font-bold text-slate-600">X ________________________________________</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">Sign On Line</span>
                      </div>
                    )}
                  </div>

                  {sigError ? (
                    <div className="text-rose-400 text-xs mt-1 text-center font-semibold">{sigError}</div>
                  ) : (
                    <p className="text-[10px] text-slate-400 text-center">
                      Draw digital signature inside box. Recorded as immutable delivery sign-off proof.
                    </p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Rate Delivery</label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-wider"
                >
                  Confirm Signature & Release Escrow
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
