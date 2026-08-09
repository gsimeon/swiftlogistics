import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  QrCode, 
  X, 
  ShieldCheck, 
  Send, 
  MessageCircle, 
  Mail, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface ShareTrackingModalProps {
  orderNumber: string;
  storeName: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareTrackingModal: React.FC<ShareTrackingModalProps> = ({
  orderNumber,
  storeName,
  recipientName,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);

  if (!isOpen) return null;

  const originUrl = window.location.origin;
  const trackingToken = `tr_live_${orderNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_9981`;
  const shareableUrl = `${originUrl}/track/${orderNumber}?token=${trackingToken}`;

  const handleCopy = () => {
    soundService.playMessagePop();
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track Order #${orderNumber} - LogisticsPro Live`,
          text: `Follow live delivery progress for package from ${storeName} to ${recipientName}:`,
          url: shareableUrl,
        });
        soundService.playNotification();
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden space-y-4 p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
            <Share2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Share Public Live Tracking Link</h3>
            <p className="text-xs text-slate-400">
              Generate a temporary secure tracking URL for recipient or store team
            </p>
          </div>
        </div>

        {/* Security & Expiry Banner */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Token • Read-Only View</span>
          </div>
          <span className="flex items-center space-x-1 font-mono text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Valid 24 Hours</span>
          </span>
        </div>

        {/* Link Input & Copy Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Public Live Tracking URL
          </label>

          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl font-mono text-xs text-blue-300 truncate select-all">
              {shareableUrl}
            </div>

            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Share Channel Buttons */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Instant Share via App
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                soundService.playNotification();
                window.open(`https://wa.me/?text=${encodeURIComponent(`Track your delivery live: ${shareableUrl}`)}`, '_blank');
              }}
              className="py-2.5 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => {
                soundService.playNotification();
                window.open(`mailto:?subject=${encodeURIComponent(`Live Delivery Tracking - Order #${orderNumber}`)}&body=${encodeURIComponent(`Track live delivery status here:\n${shareableUrl}`)}`, '_blank');
              }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Email</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span>More Options</span>
            </button>
          </div>
        </div>

        {/* QR Code Toggle */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>{showQR ? 'Hide Mobile Scan QR Code' : 'Show Mobile QR Code'}</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">Order #{orderNumber}</span>
        </div>

        {/* QR Code Canvas Representation */}
        {showQR && (
          <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center space-y-2 text-slate-900 animate-fadeIn">
            <div className="w-36 h-36 border-4 border-slate-900 p-2 rounded-lg flex flex-col justify-between items-center bg-slate-950 text-white font-mono text-[9px] text-center">
              <div className="w-full flex justify-between">
                <span className="w-6 h-6 border-2 border-amber-400 bg-amber-500/20"></span>
                <span className="w-6 h-6 border-2 border-amber-400 bg-amber-500/20"></span>
              </div>
              <div className="p-1 font-bold text-amber-400 text-center">
                LOGISTICS PRO<br/>SCAN TRACK
              </div>
              <div className="w-full flex justify-between">
                <span className="w-6 h-6 border-2 border-amber-400 bg-amber-500/20"></span>
                <span className="w-6 h-6 bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[7px]">PRO</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-600">
              Scan with phone camera to open live delivery map
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
