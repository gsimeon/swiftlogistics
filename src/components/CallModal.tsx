import React, { useState, useEffect } from 'react';
import { Driver, Client } from '../types';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Shield, Radio, Activity } from 'lucide-react';
import { soundService } from '../services/soundService';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  client: Client;
  userRole: 'client' | 'driver' | 'store';
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  driver,
  client,
  userRole,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaker, setIsSpeaker] = useState<boolean>(true);

  const calleeName = userRole === 'driver' ? client.name : driver.name;
  const calleeAvatar = userRole === 'driver' ? client.avatar : driver.avatar;
  const calleeSubtitle = userRole === 'driver' ? `Client (${client.phone})` : `${driver.vehicleType.toUpperCase()} Rider (${driver.vehiclePlate})`;

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('ringing');
      setCallDuration(0);
      return;
    }

    // Play ringtone while ringing
    const stopRingtone = soundService.playRingtone();

    // Auto connect call after 2.5 seconds to simulate answer
    const connectTimer = setTimeout(() => {
      stopRingtone();
      setCallStatus('connected');
    }, 2500);

    return () => {
      stopRingtone();
      clearTimeout(connectTimer);
    };
  }, [isOpen]);

  // Call timer counter
  useEffect(() => {
    let timer: number;
    if (callStatus === 'connected') {
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-center text-white shadow-2xl relative overflow-hidden">
        
        {/* Background Subtle Pulsing Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header info */}
        <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-semibold mb-6">
          <Shield className="w-4 h-4" />
          <span>Encrypted Voice Link</span>
        </div>

        {/* Profile Image & Avatar */}
        <div className="relative inline-block mb-4">
          <div className={`w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto ${callStatus === 'ringing' ? 'animate-bounce' : ''}`}>
            <img
              src={calleeAvatar}
              alt={calleeName}
              className="w-full h-full object-cover rounded-full border-2 border-slate-900"
            />
          </div>
          {callStatus === 'connected' && (
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
            </div>
          )}
        </div>

        {/* Callee Details */}
        <h3 className="font-extrabold text-xl text-white tracking-tight">{calleeName}</h3>
        <p className="text-xs text-slate-400 mt-1">{calleeSubtitle}</p>

        {/* Call State / Timer Display */}
        <div className="mt-6 mb-8">
          {callStatus === 'ringing' && (
            <div className="flex items-center justify-center space-x-2 text-amber-400 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Calling Driver...</span>
            </div>
          )}

          {callStatus === 'connected' && (
            <div className="space-y-2">
              <div className="font-mono text-2xl font-extrabold text-emerald-400 tracking-wider">
                {formatTime(callDuration)}
              </div>
              
              {/* Audio spectrum bar visualizer */}
              <div className="flex justify-center items-end space-x-1 h-6">
                {[40, 70, 30, 90, 60, 80, 40, 100, 50, 75].map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${isMuted ? 10 : (height * (1 + (i % 3) * 0.2)) % 100}%` }}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-300 animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          )}

          {callStatus === 'ended' && (
            <div className="text-rose-400 text-sm font-bold">Call Ended</div>
          )}
        </div>

        {/* In-Call Controls */}
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-4">
          
          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={callStatus !== 'connected'}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
              isMuted
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="text-[10px] mt-1 font-semibold">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all scale-105 active:scale-95"
          >
            <PhoneOff className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-bold">End</span>
          </button>

          {/* Speakerphone Toggle */}
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            disabled={callStatus !== 'connected'}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
              isSpeaker
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isSpeaker ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            <span className="text-[10px] mt-1 font-semibold">{isSpeaker ? 'Speaker ON' : 'Speaker'}</span>
          </button>

        </div>

        <p className="text-[11px] text-slate-500 font-medium">LogiPulse Real-Time Voice Gateway</p>

      </div>
    </div>
  );
};
