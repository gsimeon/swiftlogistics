import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, Play, StopCircle, BellRing } from 'lucide-react';
import { soundService } from '../services/soundService';

interface DriverVoiceAssistantProps {
  lastTrafficAlert?: {
    addedMinutes: number;
    reason: string;
    timestamp: string;
  } | null;
  lastDispatchMessage?: string | null;
  orderStatus?: string;
  driverName?: string;
}

export const DriverVoiceAssistant: React.FC<DriverVoiceAssistantProps> = ({
  lastTrafficAlert,
  lastDispatchMessage,
  orderStatus,
  driverName = 'Rider',
}) => {
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>(
    'Voice assistant ready. Hands-free audio dispatch is active.'
  );

  const speakText = (text: string) => {
    if (!ttsEnabled) return;
    if (!('speechSynthesis' in window)) return;

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setLastSpokenText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Automatically read incoming traffic alerts aloud
  useEffect(() => {
    if (lastTrafficAlert) {
      soundService.playNotification();
      const alertMsg = `Attention ${driverName}: Traffic alert update. ${lastTrafficAlert.addedMinutes} minutes delay reported due to ${lastTrafficAlert.reason}. Please check recommended reroute.`;
      speakText(alertMsg);
    }
  }, [lastTrafficAlert]);

  // Automatically read incoming dispatch messages
  useEffect(() => {
    if (lastDispatchMessage) {
      soundService.playMessagePop();
      const msg = `Dispatch message received: ${lastDispatchMessage}`;
      speakText(msg);
    }
  }, [lastDispatchMessage]);

  const handleTestVoice = () => {
    soundService.playNotification();
    const testMsg = `Hands-free driver assistant online. Route guidance, traffic alerts, and ETA updates will be read aloud automatically while driving.`;
    speakText(testMsg);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/70 p-3.5 rounded-2xl text-white shadow-md space-y-2.5">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl transition-all ${
            isSpeaking ? 'bg-amber-400 text-slate-950 animate-bounce shadow-lg' : 'bg-indigo-900/80 text-indigo-300'
          }`}>
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xs text-white">Eyes-On-Road Text-to-Speech Assistant</span>
              <span className="bg-indigo-900/80 text-indigo-300 font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-indigo-700">
                TTS ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              Automatic voice reader for traffic delays, dispatch notes & turn ETAs
            </p>
          </div>
        </div>

        {/* Enable / Disable Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`py-1.5 px-3 rounded-xl font-extrabold text-xs transition-all ${
              ttsEnabled
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {ttsEnabled ? 'Voice ON' : 'Voice OFF'}
          </button>
        </div>
      </div>

      {/* Active Speech Waveform & Spoken Text Bar */}
      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-indigo-900/60 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 truncate">
          {isSpeaking ? (
            <div className="flex items-center space-x-0.5 h-4 shrink-0">
              {[60, 100, 40, 80, 50, 90, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full animate-pulse"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          ) : (
            <Radio className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          )}
          <span className="text-[11px] text-slate-300 truncate font-mono">
            {isSpeaking ? `Speaking: "${lastSpokenText}"` : lastSpokenText}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {isSpeaking ? (
            <button
              onClick={handleStopSpeaking}
              className="py-1 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1"
            >
              <StopCircle className="w-3 h-3" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleTestVoice}
              className="py-1 px-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 rounded-lg text-[10px] font-bold flex items-center space-x-1"
            >
              <Play className="w-3 h-3" />
              <span>Test Speech</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
