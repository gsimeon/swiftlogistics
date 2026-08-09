import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Driver, Client, Role } from '../types';
import { Send, X, MessageSquare, Phone, User, Bike, CheckCheck, Mic, MicOff, Sparkles, Play, Pause, Square, Radio, Disc, Volume2, Trash2, Bell, BellOff, Shield } from 'lucide-react';
import { soundService } from '../services/soundService';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryId: string;
  driver: Driver;
  client: Client;
  userRole: Role;
  messages: ChatMessage[];
  onSendMessage: (
    text: string, 
    senderRole: Role, 
    audioData?: { audioUrl?: string; audioDurationSeconds?: number; isVoiceNote?: boolean }
  ) => void;
  onOpenCall: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  deliveryId,
  driver,
  client,
  userRole,
  messages,
  onSendMessage,
  onOpenCall,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Voice Note Recording State
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const calleeName = userRole === 'driver' ? client.name : driver.name;
  const calleeAvatar = userRole === 'driver' ? client.avatar : driver.avatar;

  const quickRepliesClient = [
    "Approaching in 2 mins",
    "Need gate code",
    "Heavy traffic delay",
    "Where are you currently?",
    "Meeting you at main gate",
    "Please ring doorbell upon arrival",
    "Please confirm delivery PIN",
    "Thanks! Drive safely",
  ];

  const quickRepliesDriver = [
    "Approaching in 2 mins",
    "Need gate code",
    "Heavy traffic delay",
    "Outside your gate now",
    "Arrived at store for pickup",
    "Please confirm delivery PIN",
    "Unable to find address",
    "Stuck in light traffic (5 mins)",
  ];

  const quickReplies = userRole === 'driver' ? quickRepliesDriver : quickRepliesClient;

  // AI Sentiment Analysis Engine
  const analyzeSentiment = (text: string): 'frustrated' | 'delay' | 'positive' => {
    const lower = text.toLowerCase();
    const frustratedKeywords = ['where', 'late', 'unable', 'find address', 'cancel', 'dispute', 'wrong', 'issue', 'scam', 'angry', 'bad', 'never', 'stuck', 'delay', 'traffic'];
    const delayKeywords = ['traffic', 'wait', 'slow', 'heavy', 'minutes', 'hold on', 'delay'];
    
    if (frustratedKeywords.some((kw) => lower.includes(kw))) {
      return 'frustrated';
    }
    if (delayKeywords.some((kw) => lower.includes(kw))) {
      return 'delay';
    }
    return 'positive';
  };

  const hasFrustratedMessage = messages.some((m) => analyzeSentiment(m.text) === 'frustrated');

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Clean up speech recognition & recording timers on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Voice Note Recording Start
  const startRecordingVoiceNote = async () => {
    soundService.playNotification();
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        setIsRecordingVoiceNote(true);

        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        throw new Error('MediaRecorder API not supported');
      }
    } catch (err) {
      console.warn('Microphone access fallback:', err);
      // Fallback simulated recording mode
      setIsRecordingVoiceNote(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop & Send Voice Note
  const stopAndSendVoiceNote = () => {
    soundService.playMessagePop();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    const duration = Math.max(1, recordingSeconds);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const senderLabel = userRole === 'driver' ? 'Rider Voice Note' : 'Client Voice Note';
        onSendMessage(`🎙️ ${senderLabel} (${duration}s)`, userRole, {
          audioUrl,
          audioDurationSeconds: duration,
          isVoiceNote: true,
        });

        // Stop stream tracks
        if (mediaRecorderRef.current?.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        setIsRecordingVoiceNote(false);
        setRecordingSeconds(0);
      };

      mediaRecorderRef.current.stop();
    } else {
      // Fallback simulated audio url generator
      const senderLabel = userRole === 'driver' ? 'Rider Voice Note' : 'Client Voice Note';
      onSendMessage(`🎙️ ${senderLabel} (${duration}s)`, userRole, {
        audioUrl: '',
        audioDurationSeconds: duration,
        isVoiceNote: true,
      });
      setIsRecordingVoiceNote(false);
      setRecordingSeconds(0);
    }
  };

  const cancelVoiceNoteRecording = () => {
    soundService.playNotification();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
    setIsRecordingVoiceNote(false);
    setRecordingSeconds(0);
  };

  // Audio Playback
  const handlePlayVoiceNote = (msgId: string, audioUrl?: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      return;
    }

    soundService.playNotification();
    setPlayingAudioId(msgId);

    if (audioUrl && audioUrl.startsWith('blob:')) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        // fall back sound
      });
      audio.onended = () => setPlayingAudioId(null);
    } else {
      // Fallback audio tone feedback
      setTimeout(() => {
        soundService.playNotification();
        setPlayingAudioId(null);
      }, 3000);
    }
  };

  const startVoiceDictation = () => {
    soundService.playNotification();
    setSpeechError(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(true);
      const simulatedVoicePhrases = userRole === 'driver' ? [
        "I am currently approaching the Isaac John street gate, please meet me outside.",
        "Pickup confirmed at Techlab store. En route to your delivery address now.",
        "Slight traffic delay along Mobolaji Bank Anthony Way, ETA updated to 6 minutes."
      ] : [
        "Please leave the parcel with the gate security guard.",
        "I am coming downstairs now to meet you.",
        "Thank you for the quick delivery update!"
      ];
      
      const chosen = simulatedVoicePhrases[Math.floor(Math.random() * simulatedVoicePhrases.length)];
      setTimeout(() => {
        setInputText((prev) => (prev ? `${prev} ${chosen}` : chosen));
        setIsListening(false);
      }, 2000);
      return;
    }

    try {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Click mic button to simulate dictation.');
        } else {
          const simulatedVoicePhrase = userRole === 'driver' 
            ? "Navigating past Computer Village, arriving in 4 minutes." 
            : "I will meet you at the reception desk.";
          setInputText((prev) => (prev ? `${prev} ${simulatedVoicePhrase}` : simulatedVoicePhrase));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(true);
      setTimeout(() => {
        const fallbackMsg = "On my way! Arriving shortly at recipient address.";
        setInputText((prev) => (prev ? `${prev} ${fallbackMsg}` : fallbackMsg));
        setIsListening(false);
      }, 1500);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    onSendMessage(inputText.trim(), userRole);
    setInputText('');
    if (!isMuted) {
      soundService.playMessagePop();
    }

    // Driver auto-reply simulation when client sends a message
    if (userRole === 'client') {
      setTimeout(() => {
        const autoReplies = [
          "Got your message! I'm navigating past Computer Village & Mobolaji Bank Anthony Way, see you in ~5 mins.",
          "Noted! I will call you right as I arrive at Isaac John Street GRA Ikeja.",
          "Items secured from Techlab Innovation Solutions in isothermal box! On my way now.",
        ];
        const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        onSendMessage(replyText, 'driver');
        if (!isMuted) {
          soundService.playMessagePop();
        }
      }, 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-slideLeft">
      
      {/* Drawer Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={calleeAvatar}
            alt={calleeName}
            className="w-10 h-10 rounded-full object-cover border border-emerald-500"
          />
          <div>
            <div className="font-bold text-sm text-white">{calleeName}</div>
            <div className="text-xs text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online • Voice Clips Supported</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Mute Notifications Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (!newMuted) {
                soundService.playNotification();
              }
            }}
            className={`p-2 rounded-lg transition-colors flex items-center space-x-1 border ${
              isMuted
                ? 'bg-amber-950/80 text-amber-400 border-amber-500/50 hover:bg-amber-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent'
            }`}
            title={isMuted ? "Unmute Thread Notifications" : "Mute Thread Notifications (High-Focus Mode)"}
          >
            {isMuted ? <BellOff className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenCall}
            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Muted Thread Banner for High-Focus Driving */}
      {isMuted && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 px-3 py-2 flex items-center justify-between text-xs text-amber-200 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <BellOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-semibold text-[11px]">
              Thread Muted • High-focus driving mode active (audio alerts silenced)
            </span>
          </div>
          <button
            onClick={() => setIsMuted(false)}
            className="text-[10px] font-bold underline hover:text-amber-100 text-amber-400 ml-2"
          >
            Unmute
          </button>
        </div>
      )}

      {/* Auto-flagged Dispute Alert Banner */}
      {hasFrustratedMessage && (
        <div className="bg-rose-950/90 border-b border-rose-500/50 px-3 py-2 flex items-center justify-between text-xs text-rose-200 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-bold text-[11px]">🚨 AI Sentiment Alert: Potential Dispute/Frustration Flagged</span>
          </div>
          <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded shadow-xs">
            Support Notified
          </span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50">
        {messages.map((msg) => {
          const isMe = msg.senderRole === userRole;
          const isVoiceNote = msg.isVoiceNote;
          const sentiment = analyzeSentiment(msg.text);

          let bubbleStyle = isMe
            ? 'bg-emerald-600 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none';
          let sentimentBadge = '🟢 Neutral/Positive';

          if (sentiment === 'frustrated') {
            bubbleStyle = isMe
              ? 'bg-rose-600 text-white rounded-br-none shadow-md ring-1 ring-rose-400'
              : 'bg-rose-950/90 text-rose-100 border border-rose-500/80 rounded-bl-none shadow-md';
            sentimentBadge = '🔴 Frustration / Dispute Risk';
          } else if (sentiment === 'delay') {
            bubbleStyle = isMe
              ? 'bg-amber-600 text-white rounded-br-none'
              : 'bg-amber-950/80 text-amber-100 border border-amber-500/80 rounded-bl-none';
            sentimentBadge = '🟡 Traffic / Delay Urgency';
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow transition-all ${
                isVoiceNote ? (isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 border border-blue-500/40 text-white') : bubbleStyle
              }`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  {!isMe ? (
                    <div className="text-[10px] font-bold text-emerald-400">
                      {msg.senderName}
                    </div>
                  ) : <span />}
                  <span className="text-[9px] opacity-75 font-mono px-1.5 py-0.2 rounded bg-black/30 font-bold">
                    {isVoiceNote ? '🎙️ VOICE NOTE' : sentimentBadge}
                  </span>
                </div>

                {/* Voice Note Custom Audio Player UI */}
                {isVoiceNote ? (
                  <div className="space-y-2 py-1">
                    <div className="flex items-center space-x-3 bg-black/20 p-2 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => handlePlayVoiceNote(msg.id, msg.audioUrl)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all transform active:scale-95 shrink-0"
                      >
                        {playingAudioId === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>

                      {/* Waveform Bar Graphic */}
                      <div className="flex-1 flex items-center space-x-1 h-5 overflow-hidden">
                        {[40, 70, 30, 90, 60, 100, 50, 80, 40, 90, 60, 30, 70].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all ${
                              playingAudioId === msg.id ? 'bg-emerald-400 animate-pulse' : 'bg-white/50'
                            }`}
                            style={{ height: `${playingAudioId === msg.id ? Math.max(20, Math.round(h * Math.random())) : h}%` }}
                          />
                        ))}
                      </div>

                      <span className="text-[10px] font-mono font-bold text-white/90">
                        0:0{msg.audioDurationSeconds || 5}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/80 font-medium">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div>{msg.text}</div>
                )}

                <div
                  className={`text-[9px] mt-1.5 flex items-center justify-end space-x-1 opacity-80 ${
                    isMe ? 'text-emerald-100' : 'text-slate-300'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Recording Active Banner */}
      {isRecordingVoiceNote && (
        <div className="bg-rose-950/95 border-t border-b border-rose-500/50 p-3 flex items-center justify-between text-xs text-white animate-pulse">
          <div className="flex items-center space-x-2">
            <Disc className="w-5 h-5 text-rose-500 animate-spin" />
            <div>
              <div className="font-extrabold text-xs text-rose-200">Recording Voice Note...</div>
              <div className="text-[10px] font-mono text-slate-300">
                Timer: <strong className="text-amber-300">0:{String(recordingSeconds).padStart(2, '0')}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={cancelVoiceNoteRecording}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={stopAndSendVoiceNote}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-extrabold flex items-center space-x-1 shadow"
            >
              <Send className="w-3 h-3" />
              <span>Send Note</span>
            </button>
          </div>
        </div>
      )}

      {/* Voice Dictation Status Banner */}
      {isListening && (
        <div className="bg-red-500/10 border-t border-b border-red-500/30 px-3 py-1.5 flex items-center justify-between text-xs text-red-400 animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold text-[11px]">Hands-Free Voice Dictation Active...</span>
          </div>
          <span className="text-[10px] text-slate-400">Speak clearly into microphone</span>
        </div>
      )}

      {/* Context-Aware Quick Replies Grid */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider px-0.5">
          <div className="flex items-center space-x-1 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Quick Replies Grid (One-Tap Insert)</span>
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            {userRole === 'driver' ? 'Driver Presets' : 'Client Presets'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-0.5 scrollbar-thin">
          {quickReplies.map((replyText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundService.playNotification();
                setInputText(replyText);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-[11px] font-medium text-left transition-all border border-slate-800 hover:border-emerald-500/50 active:scale-95 flex items-center justify-between group shadow-xs"
              title={`Insert "${replyText}" into chat input`}
            >
              <span className="truncate">{replyText}</span>
              <span className="text-[10px] text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity ml-1 font-bold">
                +
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        {/* Record Voice Note Button */}
        <button
          type="button"
          onClick={isRecordingVoiceNote ? stopAndSendVoiceNote : startRecordingVoiceNote}
          className={`p-2.5 rounded-xl transition-all font-bold flex items-center justify-center ${
            isRecordingVoiceNote 
              ? 'bg-rose-600 text-white animate-pulse shadow-lg ring-2 ring-rose-400' 
              : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
          }`}
          title="Record Audio Voice Note for Delivery Log"
        >
          <Disc className={`w-4 h-4 ${isRecordingVoiceNote ? 'animate-spin' : ''}`} />
        </button>

        {/* Dictation Button */}
        <button
          type="button"
          onClick={startVoiceDictation}
          className={`p-2.5 rounded-xl transition-all font-bold flex items-center justify-center ${
            isListening 
              ? 'bg-red-600 text-white animate-pulse shadow-lg ring-2 ring-red-400' 
              : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/60'
          }`}
          title="Voice-to-Text Dictation (Web Speech API)"
        >
          {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-emerald-400" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? 'Dictating message...' : `Message ${calleeName}...`}
          className={`flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors ${
            isListening ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800 focus:border-emerald-500'
          }`}
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 p-2.5 rounded-xl transition-all"
          title="Send Message"
        >
          <Send className="w-4 h-4 font-bold" />
        </button>
      </form>

    </div>
  );
};
