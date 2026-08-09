import React, { useState } from 'react';
import { 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  MapPin, 
  Store, 
  Truck, 
  X, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Calendar, 
  ExternalLink 
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface ShareEtaModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  storeName: string;
  driverName: string;
  vehiclePlate?: string;
  estimatedMinutes: number;
}

export const ShareEtaModal: React.FC<ShareEtaModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  storeName,
  driverName,
  vehiclePlate = 'LSD-492-XY',
  estimatedMinutes,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate ETA time
  const etaDate = new Date(Date.now() + estimatedMinutes * 60 * 1000);
  const etaFormatted = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const originUrl = window.location.origin;
  const deepLinkUrl = `${originUrl}/track/${orderNumber}?eta=${encodeURIComponent(etaFormatted)}`;

  const formattedShareMessage = `🚀 Delivery Update: My package from ${storeName} (Order #${orderNumber}) with courier ${driverName} (${vehiclePlate}) is on its way! Expected ETA: ${etaFormatted} (~${estimatedMinutes} mins away). Track live here: ${deepLinkUrl}`;

  const handleCopyText = () => {
    soundService.playMessagePop();
    navigator.clipboard.writeText(formattedShareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    soundService.playNotification();
    window.open(`https://wa.me/?text=${encodeURIComponent(formattedShareMessage)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden space-y-4 p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 rounded-2xl shadow-md font-extrabold">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Share Live ETA & Arrival Time</h3>
            <p className="text-xs text-slate-400">
              Notify family, roommates, or store team when to expect delivery arrival
            </p>
          </div>
        </div>

        {/* Live Visual Social Media Preview Card */}
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 border border-blue-800/80 p-4 rounded-2xl space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs border-b border-blue-800/60 pb-2.5">
            <span className="font-extrabold text-amber-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE DELIVERY ETA CARD</span>
            </span>
            <span className="font-mono text-[10px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
              #{orderNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Estimated Arrival</span>
              <div className="text-xl font-black font-mono text-emerald-400">{etaFormatted}</div>
              <span className="text-[10px] text-slate-300">~{estimatedMinutes} mins away</span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">Store & Courier</span>
              <div className="font-bold text-xs text-white truncate">{storeName}</div>
              <span className="text-[10px] text-blue-300 truncate block">Rider: {driverName}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 font-mono flex items-center space-x-2">
            <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{deepLinkUrl}</span>
          </div>
        </div>

        {/* Quick Action Share Buttons */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Share Message Preview
          </label>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-sans leading-relaxed select-all">
            {formattedShareMessage}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ETA Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy ETA Text</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
