import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Mic, 
  MicOff, 
  Volume2, 
  X, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  CheckCircle2,
  Cross,
  Navigation,
  ExternalLink,
  Building2,
  Clock,
  Phone
} from 'lucide-react';
import { LocationPoint } from '../types';
import { soundService } from '../services/soundService';

interface HospitalFacility {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  estDriveTimeMins: number;
  phone: string;
  lat: number;
  lng: number;
  is24Hours: boolean;
}

interface EmergencyModalProps {
  isOpen: boolean;
  userRole: 'driver' | 'client';
  userName: string;
  currentLocation?: LocationPoint;
  onClose: () => void;
  onTriggerAlert?: (alertMessage: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  userRole,
  userName,
  currentLocation = { lat: 6.5850, lng: 3.3530 },
  onClose,
  onTriggerAlert,
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [alertDispatched, setAlertDispatched] = useState<boolean>(false);
  const [showHospitalList, setShowHospitalList] = useState<boolean>(false);

  // Ikeja / Lagos Emergency Facilities List
  const nearbyHospitals: HospitalFacility[] = [
    {
      id: 'hosp-1',
      name: 'Lagos State University Teaching Hospital (LASUTH)',
      address: '1-5 Oba Akinjobi Way, GRA, Ikeja, Lagos',
      distanceKm: 1.2,
      estDriveTimeMins: 4,
      phone: '+234 1 291 0000',
      lat: 6.5910,
      lng: 3.3480,
      is24Hours: true,
    },
    {
      id: 'hosp-2',
      name: 'Reddington Hospital Ikeja',
      address: '39 Isaac John St, GRA Ikeja, Lagos',
      distanceKm: 2.1,
      estDriveTimeMins: 6,
      phone: '+234 1 271 5340',
      lat: 6.5880,
      lng: 3.3590,
      is24Hours: true,
    },
    {
      id: 'hosp-3',
      name: 'Lagoon Hospital Ikeja',
      address: '97 Mobolaji Bank Anthony Way, Ikeja, Lagos',
      distanceKm: 2.8,
      estDriveTimeMins: 7,
      phone: '+234 700 LAGOON',
      lat: 6.5830,
      lng: 3.3520,
      is24Hours: true,
    },
    {
      id: 'hosp-4',
      name: 'St. Nicholas Hospital Ikeja Clinic',
      address: '7B Ogunlowo St, off Awolowo Way, Ikeja',
      distanceKm: 3.4,
      estDriveTimeMins: 9,
      phone: '+234 1 460 0000',
      lat: 6.6010,
      lng: 3.3440,
      is24Hours: true,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('connecting');
      setCallDuration(0);
      setAlertDispatched(false);
      setShowHospitalList(false);
      return;
    }

    // Play alert sound & dispatch high priority notification
    soundService.playNotification();
    if (onTriggerAlert) {
      onTriggerAlert(
        `🚨 HIGH-PRIORITY SOS EMERGENCY ALERTS TRIGGERED by ${userName} (${userRole.toUpperCase()}) at Ikeja, Lagos [GPS: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}]`
      );
    }
    setAlertDispatched(true);

    // Auto connect secure channel after 1.5s
    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 1500);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Duration timer
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNavigateToHospital = (hosp: HospitalFacility) => {
    soundService.playNotification();
    // Launch Google Maps direction
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.name + ', ' + hosp.address)}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border-2 border-red-500 rounded-2xl shadow-2xl p-6 relative space-y-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Top Emergency Beacon Bar */}
        <div className="bg-red-600 text-white -mx-6 -mt-6 p-4 flex items-center justify-between border-b border-red-700 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm tracking-wide uppercase">Emergency Assistance & Quick Hospital Route</h3>
              <p className="text-[10px] text-red-100">Live Support Dispatch & Medical SOS Channel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-700 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Broadcasted Banner */}
        <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
              <Radio className="w-4 h-4 text-red-600 animate-ping" />
              <span>Location Shared Live with Ikeja Dispatch Hub</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              GPS Broadcast Active
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="truncate">
              Computer Village / Mobolaji Bank Anthony Way, Ikeja, Lagos ({currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)})
            </span>
          </div>
        </div>

        {/* Quick-Navigate to Hospital High Priority Button */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-4 rounded-xl border border-red-500/80 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-600 text-white rounded-xl shadow-md font-bold">
                <Cross className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Emergency Medical Assistance</h4>
                <p className="text-[11px] text-red-200">Nearest Emergency Rooms & 1-Tap Routing</p>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playNotification();
                setShowHospitalList(!showHospitalList);
              }}
              className="py-2 px-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>{showHospitalList ? 'Hide Hospitals' : 'Quick-Navigate Hospital'}</span>
            </button>
          </div>

          {/* Expanded Nearby Hospitals List */}
          {showHospitalList && (
            <div className="space-y-2 pt-2 border-t border-red-900/80 animate-fadeIn">
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-300 block">
                Google Places: Nearby Emergency Facilities (Ikeja, Lagos)
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {nearbyHospitals.map((hosp) => (
                  <div
                    key={hosp.id}
                    className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-red-900/60 rounded-xl flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{hosp.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{hosp.address}</p>
                      <div className="flex items-center space-x-3 text-[10px] font-mono text-emerald-400 pt-0.5">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span>{hosp.distanceKm} km away</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>~{hosp.estDriveTimeMins} mins drive</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1.5 shrink-0">
                      <button
                        onClick={() => handleNavigateToHospital(hosp)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg flex items-center space-x-1 shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                      <a
                        href={`tel:${hosp.phone}`}
                        className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] rounded-lg text-center border border-slate-700"
                      >
                        Call Hotline
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audio Channel Status */}
        <div className="bg-slate-900 text-white rounded-xl p-4 text-center space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${callStatus === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
            <span className="font-mono text-xs font-bold text-slate-300 uppercase">
              {callStatus === 'connecting' ? 'Establishing Encrypted Channel...' : 'Secure Audio Link Active'}
            </span>
          </div>

          <div className="text-2xl font-mono font-bold tracking-widest text-emerald-400">
            {formatSeconds(callDuration)}
          </div>

          {/* Animated Audio Waveform */}
          {callStatus === 'connected' && (
            <div className="flex items-center justify-center space-x-1 h-7 pt-1">
              {[40, 70, 30, 90, 60, 100, 50, 80, 40, 60, 90, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-300"
                  style={{
                    height: isMuted ? '10%' : `${Math.max(15, (h * (i % 2 === 0 ? 0.8 : 1.2))) % 100}%`,
                  }}
                />
              ))}
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            Connected to Lagos Control Room Hotline (+234 800-EMERGENCY-LOGIPULSE)
          </p>
        </div>

        {/* Emergency Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 ${
              isMuted ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-amber-600" /> : <Mic className="w-4 h-4 text-slate-600" />}
            <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md"
          >
            <PhoneCall className="w-4 h-4 rotate-135" />
            <span>End Emergency Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};

