import React, { useState, useRef, useEffect } from 'react';
import { DeliveryOrder, Driver, DeliveryStatus, RouteHighlight } from '../types';
import { GoogleMapTracker } from './GoogleMapTracker';
import { DeviceHealthMonitor } from './DeviceHealthMonitor';
import { EmergencyModal } from './EmergencyModal';
import { WeatherRouteCard } from './WeatherRouteCard';
import { DriverEarningsDashboard } from './DriverEarningsDashboard';
import { RouteReplay } from './RouteReplay';
import { RouteHighlightsGallery } from './RouteHighlightsGallery';
import { DriverVoiceAssistant } from './DriverVoiceAssistant';

const DriverViewSkeleton: React.FC<{ isSimulatedMobile?: boolean }> = ({ isSimulatedMobile }) => {
  return (
    <div className={`w-full animate-pulse ${isSimulatedMobile ? "px-2 py-3.5 space-y-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"}`}>
      {/* Network/Latency Banner Skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 h-20 w-full rounded-xl"></div>
      
      {/* Header Banner Skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 h-28 w-full rounded-xl"></div>
      
      {/* Smart scheduling / efficiency info tabs skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 h-16 w-full rounded-xl"></div>

      {/* Grid Skeleton */}
      <div className={`grid ${isSimulatedMobile ? "grid-cols-1 gap-4" : "grid-cols-1 lg:grid-cols-3 gap-6"}`}>
        <div className={isSimulatedMobile ? "space-y-4" : "lg:col-span-2 space-y-4"}>
          {/* AI traffic banner skeleton */}
          <div className="bg-slate-200 dark:bg-slate-800 h-14 w-full rounded-xl"></div>
          {/* Map Skeleton */}
          <div className={`bg-slate-200 dark:bg-slate-800 w-full ${isSimulatedMobile ? 'h-[280px]' : 'h-[500px]'} rounded-xl`}></div>
          {/* Telemetry Card Skeleton */}
          <div className="bg-slate-200 dark:bg-slate-800 h-32 w-full rounded-xl"></div>
        </div>
        <div className="space-y-4">
          {/* Panel Sidecard 1 */}
          <div className="bg-slate-200 dark:bg-slate-800 h-64 w-full rounded-xl"></div>
          {/* Panel Sidecard 2 */}
          <div className="bg-slate-200 dark:bg-slate-800 h-48 w-full rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};
import { 
  Truck, 
  MapPin, 
  Store, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Navigation, 
  DollarSign, 
  ShieldCheck,
  AlertCircle,
  Zap,
  Bike,
  Activity,
  Camera,
  FileCheck,
  Upload,
  X,
  Lock,
  RefreshCw,
  ShieldAlert,
  Route,
  Navigation2,
  Wifi,
  WifiOff,
  Users,
  UserPlus,
  Battery,
  BatteryCharging,
  BatteryWarning,
  BarChart2,
  Sparkles,
  FileText,
  Sliders,
  Radio,
  Power,
  PauseCircle,
  PlayCircle,
  QrCode,
  RotateCw
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { getDistanceInMeters } from '../utils/geo';
import { MultiStopRouteOptimizer } from './MultiStopRouteOptimizer';
import { ReferADriver } from './ReferADriver';
import { EfficiencyMetricsChart } from './EfficiencyMetricsChart';
import { SmartScheduling } from './SmartScheduling';
import { DailyShiftReportModal } from './DailyShiftReportModal';
import { SmartTipsWidget } from './SmartTipsWidget';
import { TripSummaryDrawer } from './TripSummaryDrawer';
import { offlineSyncService } from '../services/offlineSyncService';
import { DriverPayoutLedger } from './DriverPayoutLedger';
import { AppearanceSettingsModal, MapThemeId } from './AppearanceSettingsModal';
import { EmergencyRepairStation } from './EmergencyRepairStation';
import { OfflineSyncHistory } from './OfflineSyncHistory';
import { FuelConsumptionLogger } from './FuelConsumptionLogger';
import { ManifestQrScanner } from './ManifestQrScanner';
import { DeliveryCountdownClock } from './DeliveryCountdownClock';

interface VerifiedDoc {
  id: string;
  docType: 'Driver ID' | 'Vehicle Registration' | 'Insurance';
  photoUrl: string;
  status: 'Verified' | 'Pending Review';
  uploadedAt: string;
}

interface DriverViewProps {
  order: DeliveryOrder | null;
  driver: Driver;
  apiKey: string;
  isDarkMode?: boolean;
  isStationary?: boolean;
  onToggleStationary?: () => void;
  idleAlertActive?: boolean;
  idleSeconds?: number;
  onResolveIdleAlert?: (response: string) => void;
  onScanVerifyDelivery?: () => void;
  trafficAlert?: {
    addedMinutes: number;
    reason: string;
    timestamp: string;
  } | null;
  onTriggerTrafficDelay?: (extraMinutes: number, reason?: string) => void;
  onUpdateStatus: (newStatus: DeliveryStatus) => void;
  onOpenCallModal: () => void;
  onOpenChat: () => void;
  onOpenConfirmDelivery: () => void;
  onOpenApiKeyGuide: () => void;
  onTriggerEmergencyAlert?: (msg: string) => void;
  onToggleSmartReroute?: (enable: boolean) => void;
  onAddRouteHighlight?: (highlight: RouteHighlight) => void;
  isSimulatedMobile?: boolean;
}

export const DriverView: React.FC<DriverViewProps> = ({
  order,
  driver,
  apiKey,
  isDarkMode = false,
  isStationary = false,
  onToggleStationary,
  idleAlertActive = false,
  idleSeconds = 0,
  onResolveIdleAlert,
  onScanVerifyDelivery,
  trafficAlert,
  onTriggerTrafficDelay,
  onUpdateStatus,
  onOpenCallModal,
  onOpenChat,
  onOpenConfirmDelivery,
  onOpenApiKeyGuide,
  onTriggerEmergencyAlert,
  onToggleSmartReroute,
  onAddRouteHighlight,
  isSimulatedMobile = false,
}) => {
  const [pickupInputOtp, setPickupInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [order?.status, order?.orderNumber]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [showReferralDashboard, setShowReferralDashboard] = useState(false);
  const [showEfficiencyChart, setShowEfficiencyChart] = useState(false);
  const [showSmartScheduling, setShowSmartScheduling] = useState(false);
  const [isSmartRerouteActive, setIsSmartRerouteActive] = useState(false);
  const [isShiftReportOpen, setIsShiftReportOpen] = useState(false);
  const [isTripSummaryOpen, setIsTripSummaryOpen] = useState(false);

  // Screen Wake Lock API Implementation
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    async function requestWakeLock() {
      if ('wakeLock' in navigator && order?.status === 'in_transit') {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('[DriverView] Screen Wake Lock acquired successfully');
        } catch (err) {
          console.warn('[DriverView] Failed to acquire Screen Wake Lock:', err);
        }
      }
    }

    async function releaseWakeLock() {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('[DriverView] Screen Wake Lock released successfully');
        } catch (err) {
          console.warn('[DriverView] Failed to release Screen Wake Lock:', err);
        }
      }
    }

    if (order?.status === 'in_transit') {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [order?.status]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible' && order?.status === 'in_transit') {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn('[DriverView] Re-acquiring Wake Lock failed:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [order?.status]);

  // Viewport Aspect Ratio State for landscape mode warnings
  const [aspectRatio, setAspectRatio] = useState<number>(window.innerWidth / window.innerHeight);
  const [isRotationWarningDismissed, setIsRotationWarningDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(window.innerWidth / window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Driver Device Health Header State
  const [headerBatteryPct, setHeaderBatteryPct] = useState<number>(82);
  const [isHeaderCharging, setIsHeaderCharging] = useState<boolean>(false);

  // Driver Availability & Battery Saver States
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [isBatterySaverManual, setIsBatterySaverManual] = useState<boolean>(false);

  // Active Battery Saver logic: auto-triggers if battery < 20% or manually toggled
  const isBatterySaverActive = isBatterySaverManual || headerBatteryPct < 20;
  const gpsPingIntervalSec = isBatterySaverActive ? 10 : 3;

  // GPS Ping Counter simulation
  const [gpsPingCounter, setGpsPingCounter] = useState<number>(0);
  const [lastPingTimestamp, setLastPingTimestamp] = useState<string>(new Date().toLocaleTimeString());

  // Dynamic Real-time Battery Percentage Simulation Effect
  useEffect(() => {
    let isSubscribed = true;

    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (!isSubscribed) return;
        setHeaderBatteryPct(Math.round(battery.level * 100));
        setIsHeaderCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          if (isSubscribed) setHeaderBatteryPct(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          if (isSubscribed) setIsHeaderCharging(battery.charging);
        });
      }).catch(() => {});
    }

    const interval = setInterval(() => {
      setHeaderBatteryPct((prev) => {
        if (isHeaderCharging) {
          return prev >= 100 ? 100 : prev + 1;
        } else {
          return prev <= 5 ? 5 : prev - 1;
        }
      });
    }, 15000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isHeaderCharging]);

  useEffect(() => {
    const timer = setInterval(() => {
      setGpsPingCounter((prev) => {
        if (prev + 1 >= gpsPingIntervalSec) {
          setLastPingTimestamp(new Date().toLocaleTimeString());
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gpsPingIntervalSec]);

  const getHeaderBatteryStyles = (pct: number) => {
    if (pct < 20) {
      return {
        bgBar: 'bg-rose-500',
        text: 'text-rose-600',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        statusText: 'Low Battery Alert (< 20%)',
      };
    }
    if (pct <= 50) {
      return {
        bgBar: 'bg-amber-500',
        text: 'text-amber-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        statusText: 'Moderate (20-50%)',
      };
    }
    return {
      bgBar: 'bg-emerald-500',
      text: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusText: 'Optimal (> 50%)',
    };
  };

  // Appearance & Forced Map Theme Override State
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [currentMapTheme, setCurrentMapTheme] = useState<MapThemeId>('midnight');

  // Contact-Free QR Code Scanner Simulation states
  const [isScanningQrCode, setIsScanningQrCode] = useState<boolean>(false);
  const [scanningState, setScanningState] = useState<'idle' | 'initializing' | 'focusing' | 'decoding' | 'success'>('idle');

  // Automated simulation progress for scanning client QR Code
  useEffect(() => {
    if (!isScanningQrCode) {
      setScanningState('idle');
      return;
    }

    setScanningState('initializing');
    
    const t1 = setTimeout(() => {
      setScanningState('focusing');
    }, 1000);

    const t2 = setTimeout(() => {
      setScanningState('decoding');
    }, 2200);

    const t3 = setTimeout(() => {
      setScanningState('success');
      soundService.playNotification();
    }, 3500);

    const t4 = setTimeout(() => {
      setIsScanningQrCode(false);
      if (onScanVerifyDelivery) {
        onScanVerifyDelivery();
      }
    }, 4800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isScanningQrCode, onScanVerifyDelivery]);

  // Active Vehicle Type State & Constraints
  const [activeVehicleType, setActiveVehicleType] = useState<'bike' | 'car' | 'van'>('bike');

  // Offline Mode & Action Queue State
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [queuedOfflineActions, setQueuedOfflineActions] = useState<
    { id: string; status: DeliveryStatus; label: string; timestamp: string }[]
  >([]);

  // Connect to OfflineSyncService
  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((onlineStatus, queue) => {
      setIsOffline(!onlineStatus);
      setQueuedOfflineActions(
        queue.map((q) => ({
          id: q.id,
          status: q.status as DeliveryStatus,
          label: `Status update: ${q.status}`,
          timestamp: new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  // Offline Queue Action Interceptor
  const handleDriverStatusUpdate = (newStatus: DeliveryStatus, label: string) => {
    soundService.playNotification();
    if (isOffline) {
      offlineSyncService.queueStatusUpdate({
        orderId: order?.id || 'ord-current',
        orderNumber: order?.orderNumber || 'LP-CURRENT',
        status: newStatus,
        notes: label,
      });
    } else {
      onUpdateStatus(newStatus);
    }
  };

  // Sync Queued Offline Actions
  const handleSyncOfflineQueue = async () => {
    if (queuedOfflineActions.length === 0) return;
    soundService.playNotification();

    const lastAction = queuedOfflineActions[queuedOfflineActions.length - 1];
    await offlineSyncService.syncPendingUpdates();
    onUpdateStatus(lastAction.status);
    setQueuedOfflineActions([]);
  };

  // Vehicle Profile Config
  const vehicleProfiles = {
    bike: {
      label: 'Motorcycle / e-Bike',
      speed: 45,
      etaBadge: 'Agile (-25% congestion delay)',
      icon: Bike,
      color: 'bg-amber-500 text-slate-950',
    },
    car: {
      label: 'Standard Sedan',
      speed: 38,
      etaBadge: 'Standard ETA',
      icon: Truck,
      color: 'bg-blue-600 text-white',
    },
    van: {
      label: 'Cargo Van',
      speed: 30,
      etaBadge: 'Heavy Cargo (+15% transit)',
      icon: Truck,
      color: 'bg-purple-600 text-white',
    },
  };

  // Verified Documents state
  const [verifiedDocuments, setVerifiedDocuments] = useState<VerifiedDoc[]>([
    {
      id: 'doc-1',
      docType: 'Driver ID',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      status: 'Verified',
      uploadedAt: 'Today, 09:30 AM',
    },
  ]);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<'Driver ID' | 'Vehicle Registration' | 'Insurance'>('Driver ID');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera stream access failed:', err);
      setCameraError('Camera access denied or unavailable. Please use file upload below.');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleOpenCameraModal = () => {
    setIsCameraOpen(true);
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const handleCloseCameraModal = () => {
    stopCamera();
    setIsCameraOpen(false);
  };

  // Capture Photo Snapshot from video
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      saveDocument(dataUrl);
    }
  };

  // Upload file fallback handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          saveDocument(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveDocument = (photoUrl: string) => {
    const newDoc: VerifiedDoc = {
      id: `doc-${Date.now()}`,
      docType: selectedDocType,
      photoUrl,
      status: 'Verified',
      uploadedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setVerifiedDocuments(prev => [newDoc, ...prev]);
    soundService.playNotification();
    handleCloseCameraModal();
  };

  const handleVerifyPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (order && pickupInputOtp !== order.pickupOtp) {
      setOtpError(`Invalid Store OTP code. Correct OTP is ${order.pickupOtp}`);
      return;
    }
    setOtpError('');
    soundService.playNotification();
    onUpdateStatus('in_transit');
  };

  if (isLoading) {
    return <DriverViewSkeleton isSimulatedMobile={isSimulatedMobile} />;
  }

  return (
    <div className={isSimulatedMobile ? "w-full px-2 py-3.5 space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn"}>
      
      {/* Landscape Rotation Suggestion Overlay */}
      {aspectRatio < 0.8 && !isRotationWarningDismissed && (
        <div id="landscape-rotation-warning" className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 p-4 rounded-xl shadow-lg flex items-center justify-between text-white animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 text-white rounded-lg shrink-0 animate-bounce">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm block">💡 Rotate for Better Route Map Visibility</span>
              <p className="text-[11px] text-blue-100 leading-normal">
                Rotating your screen sideways expands the live tracking corridor and offers a much better map viewing experience.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsRotationWarningDismissed(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors ml-4 shrink-0 cursor-pointer"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Offline Mode Sync & Network Latency Banner */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isOffline
            ? 'bg-amber-950 text-amber-100 border-amber-800 shadow-lg'
            : 'bg-white text-slate-800 border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                isOffline
                  ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  {isOffline ? '📶 Offline Mode Active (Local Dispatch Queue)' : '⚡ Live Network Link Stable'}
                </span>
                {queuedOfflineActions.length > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                    {queuedOfflineActions.length} Pending Actions
                  </span>
                )}
              </div>
              <p className={`text-xs ${isOffline ? 'text-amber-200' : 'text-slate-500'}`}>
                {isOffline
                  ? 'Network signal lost or suspended. Status updates are stored locally on your device and queued for automatic sync.'
                  : 'All status updates are synced instantly with platform dispatchers & clients.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {queuedOfflineActions.length > 0 && (
              <button
                onClick={handleSyncOfflineQueue}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-transform active:scale-95"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sync Queued Updates ({queuedOfflineActions.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                soundService.playNotification();
                setIsOffline(!isOffline);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isOffline
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isOffline ? 'Go Back Online' : 'Simulate Network Drop (Offline Mode)'}
            </button>
          </div>
        </div>
      </div>

      {/* Driver Header Metrics Bar & Vehicle Type Selector */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-slate-800">{driver.name}</span>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200">
                  ⭐ {driver.rating} Rider
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Vehicle: <strong className="text-slate-800 capitalize">{vehicleProfiles[activeVehicleType].label}</strong> ({driver.vehiclePlate}) • {driver.totalDeliveries} Completed Trips
              </p>
            </div>
          </div>

          {/* Driver Financial Stats & Emergency Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Today's Payout</span>
                <span className="font-bold text-blue-600 text-base">$148.50</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Transit Speed</span>
                <span className="font-bold text-slate-800 text-base">{vehicleProfiles[activeVehicleType].speed} km/h</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Availability</span>
                <span className={`font-bold flex items-center space-x-1 ${!isDriverOnline ? 'text-amber-600' : isOffline ? 'text-amber-600' : 'text-green-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${!isDriverOnline ? 'bg-amber-500' : isOffline ? 'bg-amber-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                  <span>{!isDriverOnline ? 'On Break (Offline)' : isOffline ? 'Offline Queue' : 'Online'}</span>
                </span>
              </div>
            </div>

            {/* Go Online / Offline Toggle Button */}
            <button
              onClick={() => {
                soundService.playNotification();
                setIsDriverOnline(!isDriverOnline);
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-md transition-all active:scale-95 ${
                isDriverOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-300'
              }`}
              title={isDriverOnline ? 'Take a Break / Go Offline' : 'Go Online & Receive Orders'}
            >
              <Power className="w-4 h-4" />
              <span>{isDriverOnline ? 'Online (Active)' : 'On Break (Offline)'}</span>
            </button>

            {/* Dynamic Driver Device Health Battery Progress & Battery Saver Mode Monitor */}
            {(() => {
              const bStyle = getHeaderBatteryStyles(headerBatteryPct);
              return (
                <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs min-w-[260px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isHeaderCharging ? (
                        <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
                      ) : headerBatteryPct < 20 ? (
                        <BatteryWarning className="w-4 h-4 text-rose-400 animate-bounce" />
                      ) : (
                        <Battery className={`w-4 h-4 ${bStyle.text}`} />
                      )}
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Driver Battery & GPS Mode</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-extrabold text-sm">{headerBatteryPct}%</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${bStyle.badgeBg}`}>
                            {bStyle.statusText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick battery test toggles */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          soundService.playNotification();
                          setHeaderBatteryPct(15);
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                          headerBatteryPct < 20 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Set Low Battery (<20%)"
                      >
                        15%
                      </button>
                      <button
                        onClick={() => {
                          soundService.playNotification();
                          setHeaderBatteryPct(40);
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                          headerBatteryPct >= 20 && headerBatteryPct <= 50 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Set Medium Battery (20-50%)"
                      >
                        40%
                      </button>
                      <button
                        onClick={() => {
                          soundService.playNotification();
                          setHeaderBatteryPct(85);
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                          headerBatteryPct > 50 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Set High Battery (>50%)"
                      >
                        85%
                      </button>
                    </div>
                  </div>

                  {/* Visual Color-Coded Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${bStyle.bgBar}`}
                      style={{ width: `${headerBatteryPct}%` }}
                    />
                  </div>

                  {/* Battery Saver GPS Ping Mode Indicator & Manual Override Button */}
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <Radio className={`w-3.5 h-3.5 ${isBatterySaverActive ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                      <span>
                        GPS Ping: <strong className="font-mono">{gpsPingIntervalSec}s</strong>
                        {isBatterySaverActive ? (
                          <span className="text-amber-400 font-bold ml-1">(Battery Saver Active)</span>
                        ) : (
                          <span className="text-slate-400 ml-1">(High Precision)</span>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        soundService.playNotification();
                        setIsBatterySaverManual(!isBatterySaverManual);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                        isBatterySaverActive
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Toggle Battery Saver mode (Changes GPS pings from 3s to 10s)"
                    >
                      {isBatterySaverActive ? 'Disable Saver' : 'Enable Saver'}
                    </button>
                  </div>

                  <div className="text-[9px] text-slate-400 font-mono flex justify-between">
                    <span>Next GPS Ping: {gpsPingIntervalSec - gpsPingCounter}s</span>
                    <span>Last Ping: {lastPingTimestamp}</span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => {
                soundService.playNotification();
                setShowSmartScheduling(!showSmartScheduling);
              }}
              className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95 ${
                showSmartScheduling 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/60'
              }`}
              title="Smart Scheduling & Ikeja Demand Forecaster"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{showSmartScheduling ? 'Hide Smart Scheduling' : 'Smart Scheduling (Ikeja)'}</span>
            </button>

            <button
              onClick={() => {
                soundService.playNotification();
                setShowEfficiencyChart(!showEfficiencyChart);
              }}
              className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95 ${
                showEfficiencyChart 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/60'
              }`}
              title="View Schedule Efficiency & Recharts Performance Chart"
            >
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>{showEfficiencyChart ? 'Hide Efficiency Chart' : 'Efficiency Metrics Chart'}</span>
            </button>

            <button
              onClick={() => {
                soundService.playNotification();
                setShowReferralDashboard(!showReferralDashboard);
              }}
              className={`py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95 ${
                showReferralDashboard 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title="Refer-a-Driver QR Code & Bonus Dashboard"
            >
              <Users className="w-4 h-4 text-white" />
              <span>{showReferralDashboard ? 'Hide Referral Panel' : 'Refer-a-Driver (₦15k Bonus)'}</span>
            </button>

            <button
              onClick={() => {
                soundService.playNotification();
                setIsAppearanceModalOpen(true);
              }}
              className="py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95 border border-indigo-400/40"
              title="Persistent Map Theme & Night Driving Appearance Settings"
            >
              <Sliders className="w-4 h-4 text-indigo-200" />
              <span>Map Theme Settings</span>
            </button>

            <button
              onClick={() => {
                soundService.playNotification();
                setIsShiftReportOpen(true);
              }}
              className="py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95"
              title="Generate Printable Daily Shift & Earnings Summary"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Daily Shift Report</span>
            </button>

            <button
              onClick={() => {
                soundService.playNotification();
                setIsTripSummaryOpen(true);
              }}
              className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700/60 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95"
              title="View Last Completed Trip Summary & Performance Stats"
            >
              <Route className="w-4 h-4 text-emerald-400" />
              <span>Trip Summary</span>
            </button>

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95"
              title="Trigger Immediate Emergency SOS Alert & Audio Link"
            >
              <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* Driver Offline / On Break Status Alert Banner */}
        {!isDriverOnline && (
          <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <PauseCircle className="w-6 h-6 shrink-0" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-900">Driver Status: On Break / Offline</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  New order dispatches are currently paused in StoreDispatcher. Toggle back online when ready to accept deliveries.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundService.playNotification();
                setIsDriverOnline(true);
              }}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm transition-all"
            >
              Go Online Now
            </button>
          </div>
        )}

        {/* Stationary Idle Alert Background Monitor Card */}
        {idleAlertActive && (
          <div className="bg-gradient-to-r from-amber-500/95 to-orange-600/95 border-2 border-orange-400 p-4 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce shadow-xl" id="driver-idle-alert-card">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-white text-orange-600 rounded-xl shadow-md shrink-0">
                <AlertCircle className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm uppercase tracking-wider">🚨 Logistics Dispatch Idle Warning</h4>
                <p className="text-xs text-orange-100 leading-relaxed">
                  You have been stationary for <strong>5+ minutes</strong> at a non-delivery site. Please verify your status to Dispatch.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  if (onResolveIdleAlert) {
                    onResolveIdleAlert('I am stuck in heavy road traffic. Moving shortly.');
                  }
                }}
                className="flex-1 md:flex-none py-2 px-3.5 bg-white hover:bg-slate-50 text-orange-700 font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                Respond: Stuck in Traffic
              </button>
              <button
                onClick={() => {
                  if (onResolveIdleAlert) {
                    onResolveIdleAlert('I am performing route safety check. Resuming transit.');
                  }
                }}
                className="flex-1 md:flex-none py-2 px-3.5 bg-orange-900 hover:bg-orange-800 text-white border border-orange-700 font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                Resolve: Resume Route
              </button>
            </div>
          </div>
        )}

        {/* Low Power Battery Warning Notification Banner */}
        {headerBatteryPct < 20 && (
          <div className="bg-rose-950/90 border-2 border-rose-500/80 p-4 rounded-2xl text-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md">
                <BatteryWarning className="w-6 h-6 shrink-0 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-rose-500 text-white font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    LOW POWER WARNING ({headerBatteryPct}%)
                  </span>
                  <span className="text-xs text-amber-300 font-bold">Battery Saver Auto-Enabled</span>
                </div>
                <p className="text-xs text-rose-200 mt-1">
                  Device battery is critical. GPS ping rate reduced to <strong>10s</strong> to extend battery life. Connect charger soon.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundService.playNotification();
                setHeaderBatteryPct(85);
              }}
              className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shrink-0 shadow-md transition-all active:scale-95"
            >
              Plug In Charger (+85%)
            </button>
          </div>
        )}

        {/* Text-to-Speech Hands-Free Driver Assistant */}
        <DriverVoiceAssistant
          order={order}
          apiKey={apiKey}
          isOnline={isDriverOnline}
        />

        {/* Vehicle Type Selector Pills */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Active Fleet Vehicle:</span>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl space-x-1 border border-slate-200">
              {(['bike', 'car', 'van'] as const).map((vType) => {
                const profile = vehicleProfiles[vType];
                const IconComponent = profile.icon;
                const isSelected = activeVehicleType === vType;
                return (
                  <button
                    key={vType}
                    onClick={() => {
                      soundService.playNotification();
                      setActiveVehicleType(vType);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                      isSelected
                        ? `${profile.color} shadow-xs`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="capitalize">{vType}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order && order.status === 'in_transit' && (
              <button
                onClick={() => {
                  soundService.playNotification();
                  if (onToggleStationary) {
                    onToggleStationary();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all ${
                  isStationary 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>{isStationary ? 'Resume Trip Route' : 'Simulate Traffic Idle'}</span>
              </button>
            )}

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-semibold text-[11px] flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Profile Effect: <strong>{vehicleProfiles[activeVehicleType].etaBadge}</strong> ({vehicleProfiles[activeVehicleType].speed} km/h base speed)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Smart Scheduling Section */}
      {showSmartScheduling && (
        <SmartScheduling
          driverName={driver.name}
          onClose={() => setShowSmartScheduling(false)}
        />
      )}

      {/* Schedule Efficiency Recharts Metrics Chart Section */}
      {showEfficiencyChart && (
        <EfficiencyMetricsChart
          driverName={driver.name}
          onClose={() => setShowEfficiencyChart(false)}
        />
      )}

      {/* Refer-a-Driver Dashboard Section */}
      {showReferralDashboard && (
        <ReferADriver 
          driverName={driver.name} 
          driverCode={`SWIFT-${driver.name.split(' ')[0].toUpperCase()}-882`}
          onClose={() => setShowReferralDashboard(false)} 
        />
      )}

      {/* Main Active Job Panel */}
      {order ? (
        <div className={isSimulatedMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
          
          {/* Map & Navigation (2 Cols) */}
          <div className={isSimulatedMobile ? "space-y-4" : "lg:col-span-2 space-y-4"}>
            
            {/* Smart AI Traffic Re-routing Control Banner */}
            <div className={`p-4 rounded-xl border transition-all ${
              isSmartRerouteActive 
                ? 'bg-blue-900/90 border-blue-600 text-white shadow-lg' 
                : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${
                    isSmartRerouteActive ? 'bg-blue-600 text-white animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    <Route className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">Smart AI Traffic Re-routing (Google Maps)</span>
                      {isSmartRerouteActive && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Bypass Active
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isSmartRerouteActive ? 'text-blue-200' : 'text-slate-500'}`}>
                      {isSmartRerouteActive 
                        ? '⚡ Detouring via Toyin St / Allen Ave. Bypassed Mobolaji Bank Anthony congestion (-8 mins).' 
                        : 'Monitor live Ikeja gridlock & automatically reroute via optimal bypass corridors.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const nextState = !isSmartRerouteActive;
                    setIsSmartRerouteActive(nextState);
                    if (onToggleSmartReroute) {
                      onToggleSmartReroute(nextState);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-transform active:scale-95 shadow-sm whitespace-nowrap ${
                    isSmartRerouteActive
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <Navigation2 className="w-3.5 h-3.5" />
                  <span>{isSmartRerouteActive ? 'Disable Detour' : 'Enable Smart Detour'}</span>
                </button>
              </div>
            </div>

            <GoogleMapTracker
              order={order}
              apiKey={apiKey}
              isDarkMode={isDarkMode}
              mapTheme={currentMapTheme}
              onOpenCallModal={onOpenCallModal}
              onOpenChat={onOpenChat}
              onOpenKeyGuide={onOpenApiKeyGuide}
              isSimulatedMobile={isSimulatedMobile}
            />

            {/* Device Telemetry Monitor & Predictive Maintenance */}
            <DeviceHealthMonitor
              driverName={driver.name}
              onLowBatteryAlert={(pct) => {
                if (onTriggerEmergencyAlert) {
                  onTriggerEmergencyAlert(`⚡ Low battery alert on rider handset (${pct}%). Handset may power down soon!`);
                }
              }}
            />

            {/* Smart Daily Advice & Dispatch Intelligence */}
            <SmartTipsWidget />

            {/* Weather Route Telemetry */}
            <WeatherRouteCard locationName="Ikeja, Lagos Delivery Corridor" />
          </div>

          {/* Rider Dispatch Stepper Controls (1 Col) */}
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Job Order</div>
                  <div className="font-mono text-blue-700 font-bold text-sm">#{order.orderNumber}</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1 rounded-full">
                  Payout: ${order.total.toFixed(2)}
                </div>
              </div>

              {/* Real-time 'Time Remaining' SLA Countdown Clock */}
              <DeliveryCountdownClock
                createdAt={order.createdAt}
                estimatedMinutes={order.estimatedMinutes}
                status={order.status}
                orderNumber={order.orderNumber}
              />

              {/* Step 1: Pickup from Store */}
              {order.status === 'driver_assigned' && (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Pickup Location</span>
                    <div className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                      <Store className="w-4 h-4 text-blue-600" />
                      <span>{order.store.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">{order.store.address}</p>
                  </div>

                  <button
                    onClick={() => handleDriverStatusUpdate('store_pickup', 'Arrival at Store')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Arrival at Store</span>
                  </button>
                </div>
              )}

              {/* Step 2: Store Pickup OTP & QR Code Camera Verification */}
              {order.status === 'store_pickup' && (
                <div className="space-y-4">
                  {/* Camera QR Manifest Scanner */}
                  <ManifestQrScanner
                    items={order.items}
                    orderNumber={order.orderNumber}
                    storeName={order.store.name}
                    onAllItemsVerified={() => {
                      setOtpError('');
                      handleDriverStatusUpdate('in_transit', 'QR Verified - Start Transit to Client');
                    }}
                  />

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (order && pickupInputOtp !== order.pickupOtp) {
                        setOtpError(`Invalid Store OTP code. Correct OTP is ${order.pickupOtp}`);
                        return;
                      }
                      setOtpError('');
                      handleDriverStatusUpdate('in_transit', 'Start Transit to Client');
                    }}
                    className="space-y-4 pt-2 border-t border-slate-100"
                  >
                    <div className="bg-slate-50 p-4 rounded-xl border border-blue-200 text-center space-y-2">
                      <span className="text-xs text-blue-700 font-bold block uppercase tracking-wider">Store Pickup OTP Verification</span>
                      <p className="text-[11px] text-slate-500">Ask merchant staff for the 4-digit pickup code (Demo Code: <strong className="text-blue-700 font-mono">{order.pickupOtp}</strong>)</p>
                      
                      <input
                        type="text"
                        maxLength={4}
                        value={pickupInputOtp}
                        onChange={(e) => setPickupInputOtp(e.target.value)}
                        placeholder="Enter Store OTP..."
                        className="w-full bg-white text-slate-900 font-mono text-center text-lg py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                      />
                      {otpError && <div className="text-red-600 text-xs font-semibold">{otpError}</div>}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md text-xs uppercase tracking-wider"
                    >
                      Verify & Start Transit to Client
                    </button>
                  </form>
                </div>
              )}

              {/* Step 3: In Transit to Client */}
              {order.status === 'in_transit' && (() => {
                const driverLoc = order.currentDriverLocation || driver.currentLocation;
                const clientLoc = order.client.location;
                const distanceToClient = getDistanceInMeters(driverLoc.lat, driverLoc.lng, clientLoc.lat, clientLoc.lng);
                const isWithinGeoFence = distanceToClient <= 500;

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-blue-200 space-y-2">
                      <span className="text-xs text-blue-700 font-bold block flex items-center space-x-1 uppercase tracking-wider">
                        <Truck className="w-4 h-4" />
                        <span>In Transit to Client</span>
                      </span>
                      <div className="font-bold text-sm text-slate-800">{order.client.name}</div>
                      <p className="text-xs text-slate-600">{order.client.address}</p>
                      <div className="text-[11px] text-slate-500 italic">Notes: "{order.notes}"</div>
                      
                      <div className="pt-2 border-t border-slate-200 mt-2 flex justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Distance Remaining:</span>
                        <span className="text-blue-700 font-bold">{distanceToClient >= 1000 ? `${(distanceToClient / 1000).toFixed(2)} km` : `${Math.round(distanceToClient)} m`}</span>
                      </div>
                    </div>

                    {isWithinGeoFence && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-800 animate-pulse">
                        <Activity className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">🚨 Geo-Fence Triggered (Within 500m)</span>
                          <span>An automated <strong>"Almost there!"</strong> alert has been sent to client {order.client.name}. Preparing for handover!</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleDriverStatusUpdate('arrived', 'Arrival at Client Destination')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Tap Upon Arrival at Client House</span>
                    </button>

                    {/* Traffic Delay Reporting Control for Driver */}
                    {onTriggerTrafficDelay && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => onTriggerTrafficDelay(7, 'Heavy Traffic Congestion on Route')}
                          className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>Report Traffic Delay (+7 min Alert)</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Step 4: Arrived - Prompt Client for PIN */}
              {order.status === 'arrived' && (
                <div className="space-y-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">Arrived at Client Destination</h4>
                    <p className="text-xs text-slate-600">
                      Scan the client's screen handover QR code or request their 4-digit security PIN to confirm delivery and release escrow.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        soundService.playNotification();
                        setIsScanningQrCode(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 animate-pulse touch-manipulation select-none active:scale-95 transition-transform"
                    >
                      <QrCode className="w-4 h-4 animate-bounce" />
                      <span>Scan Handover QR Code</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTripSummaryOpen(true);
                        onOpenConfirmDelivery();
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors touch-manipulation select-none active:scale-95 transition-transform"
                    >
                      Use Manual PIN / Signature
                    </button>
                  </div>
                </div>
              )}

              {/* Client Contact Shortcuts */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={onOpenCallModal}
                  className="bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 touch-manipulation select-none active:scale-95 transition-transform"
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Call Client</span>
                </button>

                <button
                  onClick={onOpenChat}
                  className="bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 touch-manipulation select-none active:scale-95 transition-transform"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Chat Client</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
          <Truck className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="font-extrabold text-xl text-white">All Clear! No Active Assigned Trips</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You are currently online and visible to nearby store dispatchers. New delivery job requests will appear here automatically.
          </p>
        </div>
      )}

      {/* Multi-Stop Delivery Sequence Optimizer Card */}
      <MultiStopRouteOptimizer
        currentDriverLocation={driver.currentLocation}
        speedKmH={driver.speedKmH}
      />

      {/* Emergency Fleet Repair & Mechanic Locator (Computer Village, Ikeja) */}
      <EmergencyRepairStation
        apiKey={apiKey}
        onOpenCallModal={onOpenCallModal}
      />

      {/* Offline Sync History & Reconnection Telemetry Log */}
      <OfflineSyncHistory />

      {/* Driver Fuel Consumption & Refueling Expense Logger */}
      <FuelConsumptionLogger />

      {/* Driver Earnings Dashboard with daily, weekly, monthly views */}
      <DriverEarningsDashboard />

      {/* Driver Payout Ledger & Net Commission Breakdown */}
      <DriverPayoutLedger />

      {/* D3 Route Replay & Telemetry Profile */}
      <RouteReplay />

      {/* Route Highlights & Pinned Photo Gallery */}
      <RouteHighlightsGallery
        orderId={order?.id || 'active-order'}
        highlights={order?.routeHighlights || []}
        userRole="driver"
        onAddHighlight={onAddRouteHighlight}
      />

      {/* Driver Identity & Document Verification Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg text-slate-800">Verified Driver Documents</h3>
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded border border-green-200">
                KYC Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Capture or update your driver ID, vehicle license, or registration photos for system verification.
            </p>
          </div>

          <button
            onClick={handleOpenCameraModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-95 self-start sm:self-auto"
          >
            <Camera className="w-4 h-4" />
            <span>Capture ID with Camera</span>
          </button>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {verifiedDocuments.map((doc) => (
            <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-3 shadow-xs">
              <img
                src={doc.photoUrl}
                alt={doc.docType}
                className="w-16 h-12 object-cover rounded-lg border border-slate-200 bg-slate-200 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 truncate">{doc.docType}</span>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                    {doc.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Uploaded {doc.uploadedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Camera Snapshot Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-6 shadow-xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">Capture ID / Document Photo</h3>
              </div>
              <button
                onClick={handleCloseCameraModal}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select document type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select Document Type</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Driver ID', 'Vehicle Registration', 'Insurance'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedDocType(type)}
                    className={`p-2 rounded-lg border font-medium text-center transition-all ${
                      selectedDocType === type
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Video / Canvas Container */}
            <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-300">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center text-white space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs text-slate-300">{cameraError}</p>
                </div>
              )}

              {/* Viewfinder overlay graphics */}
              {!cameraError && (
                <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded">
                    Center ID Card within frame
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCaptureSnapshot}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Take Snapshot Now</span>
              </button>

              {/* Upload File Alternative */}
              <div className="relative text-center">
                <label className="cursor-pointer inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-blue-600 font-semibold p-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Or upload image from file</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Emergency Assistance Hotline Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        userRole="driver"
        userName={driver.name}
        currentLocation={driver.currentLocation}
        onClose={() => setIsEmergencyModalOpen(false)}
        onTriggerAlert={onTriggerEmergencyAlert}
      />

      {/* Daily Shift Summary & Printable Earnings Report */}
      {isShiftReportOpen && (
        <DailyShiftReportModal
          driverName={driver.name}
          driverAvatar={driver.avatar}
          vehiclePlate={driver.vehiclePlate}
          vehicleType={vehicleProfiles[activeVehicleType].label}
          rating={driver.rating}
          onClose={() => setIsShiftReportOpen(false)}
        />
      )}

      {/* Trip Completed Summary Slide-Out Drawer */}
      <TripSummaryDrawer
        isOpen={isTripSummaryOpen}
        onClose={() => setIsTripSummaryOpen(false)}
        tripData={order ? {
          orderNumber: order.orderNumber,
          storeName: order.store.name,
          clientName: order.client.name,
          pickupAddress: order.store.address,
          dropoffAddress: order.client.address,
          baseEarnings: order.total * 0.7,
          tipAmount: 4.50,
          surgeBonus: 2.00,
        } : undefined}
      />

      {/* Persistent Appearance Settings Modal */}
      <AppearanceSettingsModal
        isOpen={isAppearanceModalOpen}
        onClose={() => setIsAppearanceModalOpen(false)}
        currentMapTheme={currentMapTheme}
        onSelectMapTheme={(theme) => setCurrentMapTheme(theme)}
      />

      {/* Contact-Free Handover QR Code Scanner Simulator Overlay */}
      {isScanningQrCode && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fadeIn" id="handover-qr-scanner-cockpit">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6 relative">
            {/* Exit button */}
            <button
              onClick={() => setIsScanningQrCode(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex p-3 bg-blue-950 text-blue-400 rounded-2xl border border-blue-900 shadow-sm">
                <QrCode className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-base text-white">Contact-Free Handover Scanner</h3>
              <p className="text-[11px] text-slate-400">
                Point cockpit scanner at the client's screen QR code
              </p>
            </div>

            {/* Viewfinder simulation container */}
            <div className="aspect-square w-full max-w-xs mx-auto bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
              {/* Scan target grid */}
              <div className="absolute inset-8 border-2 border-dashed border-slate-800/80 rounded-xl flex items-center justify-center pointer-events-none">
                {/* Scanner neon corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                
                {/* Rotating scan indicator */}
                <div className="w-20 h-20 border-2 border-blue-500/20 rounded-full animate-spin flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-dashed border-blue-500/40 rounded-full"></div>
                </div>
              </div>

              {/* Laser beam scanline */}
              {scanningState !== 'success' && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-85 shadow-[0_0_12px_#3b82f6] animate-scanline"></div>
              )}

              {/* Status Overlay states */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none bg-slate-950/40">
                {scanningState === 'initializing' && (
                  <div className="space-y-2 animate-fadeIn">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                    <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest">Initializing Camera Feed...</p>
                  </div>
                )}
                
                {scanningState === 'focusing' && (
                  <div className="space-y-2 animate-fadeIn">
                    <Activity className="w-8 h-8 text-amber-400 animate-pulse mx-auto" />
                    <p className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">Autofocusing Handset Lens...</p>
                  </div>
                )}

                {scanningState === 'decoding' && (
                  <div className="space-y-2 animate-fadeIn">
                    <Radio className="w-8 h-8 text-indigo-400 animate-ping mx-auto" />
                    <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">Decoding Security Token...</p>
                  </div>
                )}

                {scanningState === 'success' && (
                  <div className="space-y-2 animate-scaleUp">
                    <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full shadow-lg mx-auto w-12 h-12 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest">Decoded & Verified!</p>
                    <p className="text-[10px] text-slate-300">Escrow released. Transferring...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stepper info */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-center text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Simulation Log</span>
              <p className="font-mono text-[10px] text-blue-400">
                {scanningState === 'initializing' && '> sys.dev.openCamera()'}
                {scanningState === 'focusing' && '> sys.lens.focus(0.85) // Gra-Ikeja'}
                {scanningState === 'decoding' && `> sys.verifyToken("${order?.deliveryPin}-${order?.orderNumber}")`}
                {scanningState === 'success' && '> status.200 // escrow payout unlocked'}
                {scanningState === 'idle' && '> idle'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
