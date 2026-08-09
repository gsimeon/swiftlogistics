import React, { useState, useEffect } from 'react';
import { DeliveryOrder, Client, RouteHighlight } from '../types';

const ClientViewSkeleton: React.FC<{ isSimulatedMobile?: boolean }> = ({ isSimulatedMobile }) => {
  return (
    <div className={`w-full animate-pulse ${isSimulatedMobile ? "px-2 py-3.5 space-y-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"}`}>
      {/* Banner Skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 h-28 w-full rounded-xl"></div>
      
      {/* Pipeline Stepper Skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 h-24 w-full rounded-xl"></div>
      
      {/* Grid Skeleton */}
      <div className={`grid ${isSimulatedMobile ? "grid-cols-1 gap-4" : "grid-cols-1 lg:grid-cols-3 gap-6"}`}>
        <div className={isSimulatedMobile ? "space-y-4" : "lg:col-span-2 space-y-4"}>
          {/* Map Skeleton */}
          <div className={`bg-slate-200 dark:bg-slate-800 w-full ${isSimulatedMobile ? 'h-[280px]' : 'h-[500px]'} rounded-xl`}></div>
          {/* Weather Card Skeleton */}
          <div className="bg-slate-200 dark:bg-slate-800 h-32 w-full rounded-xl"></div>
        </div>
        <div className="space-y-4">
          {/* Sidecard 1 */}
          <div className="bg-slate-200 dark:bg-slate-800 h-64 w-full rounded-xl"></div>
          {/* Sidecard 2 */}
          <div className="bg-slate-200 dark:bg-slate-800 h-48 w-full rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};
import { GoogleMapTracker } from './GoogleMapTracker';
import { EmergencyModal } from './EmergencyModal';
import { WeatherRouteCard } from './WeatherRouteCard';
import { TopDriversLeaderboard } from './TopDriversLeaderboard';
import { RouteHighlightsGallery } from './RouteHighlightsGallery';
import { LoyaltyPointsTracker } from './LoyaltyPointsTracker';
import { DriverArrivalTimer } from './DriverArrivalTimer';
import { ShareTrackingModal } from './ShareTrackingModal';
import { ShareEtaModal } from './ShareEtaModal';
import { TwoStopsAwayAlert } from './TwoStopsAwayAlert';
import { DeliveryCompletionCelebration } from './DeliveryCompletionCelebration';
import { 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Store, 
  MapPin, 
  Truck, 
  Lock, 
  Award,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  ShieldAlert,
  Share2,
  Send,
  QrCode,
  RotateCw,
  X
} from 'lucide-react';

interface ClientViewProps {
  order: DeliveryOrder | null;
  client: Client;
  apiKey: string;
  isDarkMode?: boolean;
  isGuestView?: boolean;
  isStationary?: boolean;
  idleAlertActive?: boolean;
  onTriggerPromptStatus?: () => void;
  trafficAlert?: {
    addedMinutes: number;
    reason: string;
    timestamp: string;
  } | null;
  onTriggerTrafficDelay?: (extraMinutes: number, reason?: string) => void;
  onOpenCallModal: () => void;
  onOpenChat: () => void;
  onOpenConfirmDelivery: () => void;
  onOpenPaymentModal: () => void;
  onOpenNewOrderModal: () => void;
  onOpenApiKeyGuide: () => void;
  onTriggerEmergencyAlert?: (msg: string) => void;
  onAddRouteHighlight?: (highlight: RouteHighlight) => void;
  isSimulatedMobile?: boolean;
}

export const ClientView: React.FC<ClientViewProps> = ({
  order,
  client,
  apiKey,
  isDarkMode = false,
  isGuestView = false,
  isStationary = false,
  idleAlertActive = false,
  onTriggerPromptStatus,
  trafficAlert,
  onTriggerTrafficDelay,
  onOpenCallModal,
  onOpenChat,
  onOpenConfirmDelivery,
  onOpenPaymentModal,
  onOpenNewOrderModal,
  onOpenApiKeyGuide,
  onTriggerEmergencyAlert,
  onAddRouteHighlight,
  isSimulatedMobile = false,
}) => {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareEtaModalOpen, setIsShareEtaModalOpen] = useState(false);
  const [isShowingQrCode, setIsShowingQrCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Viewport Aspect Ratio State for landscape suggestions
  const [aspectRatio, setAspectRatio] = useState<number>(window.innerWidth / window.innerHeight);
  const [isRotationWarningDismissed, setIsRotationWarningDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(window.innerWidth / window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [order?.status, order?.orderNumber]);

  if (isLoading) {
    return <ClientViewSkeleton isSimulatedMobile={isSimulatedMobile} />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-6 animate-fadeIn">
        <div className="bg-white border border-slate-200 p-12 rounded-xl shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <Truck className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-bold text-2xl text-slate-800">No Active Delivery in Progress</h2>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            You currently don't have an active package order. Select a local store branch to order items and track real-time rider delivery!
          </p>
          <button
            onClick={onOpenNewOrderModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md text-xs uppercase tracking-wider inline-flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Delivery Request</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate Stepper percentage
  const steps = [
    { key: 'order_placed', label: 'Order Placed' },
    { key: 'driver_assigned', label: 'Driver Assigned' },
    { key: 'store_pickup', label: 'Store Pickup' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'arrived', label: 'Arrived' },
    { key: 'delivered', label: 'Deal Closed' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

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
      
      {/* Guest Mode Notice Banner */}
      {isGuestView && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700 p-4 rounded-xl shadow-lg flex items-center justify-between text-white animate-fadeIn" id="guest-mode-notice-banner">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-800 text-blue-200 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm block">Guest Live Tracking Dashboard</span>
              <p className="text-[11px] text-blue-200 leading-relaxed">
                You are viewing live progress for Order #{order.orderNumber} shared by {client.name}. Access is read-only and no login is required.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-blue-800/80 text-blue-300 border border-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Guest View
          </span>
        </div>
      )}
      
      {/* Celebratory Completion Animation & Rating Summary Card */}
      {order.status === 'delivered' && (
        <DeliveryCompletionCelebration
          orderNumber={order.orderNumber}
          driverName={order.driver.name}
          driverAvatar={order.driver.avatar}
          driverPhone={order.driver.phone}
          totalAmount={order.total}
          distanceKm={4.2}
          durationMins={18}
        />
      )}

      {/* Traffic Delay Automated Notification Banner */}
      {trafficAlert && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-amber-900 text-sm">Traffic Delay Alert (+{trafficAlert.addedMinutes} Mins)</span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  {trafficAlert.timestamp}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Rider ETA increased due to {trafficAlert.reason.toLowerCase()}. Revised ETA: ~{order.estimatedMinutes} mins.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenChat}
            className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Rider</span>
          </button>
        </div>
      )}

      {/* Top Banner: Status & ETA Header */}
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between ${isSimulatedMobile ? 'p-3.5 gap-3.5' : 'p-6 gap-4'}`}>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                #{order.orderNumber}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-450 font-medium">Escrow Held • ${order.total.toFixed(2)}</span>
            </div>
            <h2 className={`font-bold text-slate-800 dark:text-slate-100 mt-1 ${isSimulatedMobile ? 'text-base leading-tight' : 'text-2xl'}`}>
              {order.status === 'arrived'
                ? 'Rider Has Arrived at Your Location!'
                : `Driver Arriving in ~${order.estimatedMinutes} Minutes`}
            </h2>

            {/* Real-time Estimated Time of Arrival Progress Bar */}
            {order.status !== 'delivered' && (
              <div className="mt-3.5 space-y-2 w-full max-w-md" id="eta-progress-bar-container">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider">Journey Progress</span>
                  <span className={`${trafficAlert ? 'text-amber-600 dark:text-amber-400 animate-pulse font-extrabold' : 'text-blue-600 dark:text-blue-400 font-bold'}`}>
                    {trafficAlert ? '⚠️ Traffic Delays Encountered' : 'On Schedule'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-800 relative">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      trafficAlert 
                        ? 'bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.8)]' 
                        : 'bg-blue-600'
                    }`}
                    style={{
                      width: order.status === 'arrived' ? '100%' : '65%',
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Store Pickup</span>
                  {trafficAlert && (
                    <span className="text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                      +{trafficAlert.addedMinutes}m Delay ({trafficAlert.reason})
                    </span>
                  )}
                  <span>Destination</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Communication & Actions */}
        {isGuestView ? (
          <div className="flex items-center space-x-2.5 bg-blue-50 border border-blue-200 px-4 py-3 rounded-xl text-blue-700 font-extrabold text-xs shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span>Guest Live View • Read-Only Synchronization Enabled</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95"
              title="Generate & Copy Public Live Delivery Tracking Link"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>Share Tracking Link</span>
            </button>

            <button
              onClick={() => setIsShareEtaModalOpen(true)}
              className="py-2.5 px-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95"
              title="Generate Social ETA Card & Share Live Arrival Time with Family/Friends"
            >
              <Clock className="w-4 h-4 text-white animate-pulse" />
              <span>Share ETA</span>
            </button>

            {onTriggerTrafficDelay && (
              <button
                onClick={() => onTriggerTrafficDelay(8, 'Heavy Traffic Congestion on Route')}
                className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors"
                title="Test Automated Notification for Traffic Delay (>5 min)"
              >
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Simulate Traffic (+8m)</span>
              </button>
            )}

            {/* Emergency Assistance SOS Button */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-transform active:scale-95"
              title="Trigger Immediate Emergency Assistance & Audio Hotline"
            >
              <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
              <span>Emergency SOS</span>
            </button>

            <button
              id="client-btn-call"
              onClick={onOpenCallModal}
              className="flex-1 md:flex-none py-2.5 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 text-xs flex items-center justify-center space-x-2 touch-manipulation select-none active:scale-95 transition-transform"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span>Call</span>
            </button>

            <button
              id="client-btn-chat"
              onClick={onOpenChat}
              className="flex-1 md:flex-none py-2.5 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 text-xs flex items-center justify-center space-x-2 touch-manipulation select-none active:scale-95 transition-transform"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Message</span>
            </button>

            {/* Confirm Delivery Button */}
            {(order.status === 'arrived' || order.status === 'in_transit') && (
              <button
                id="client-btn-confirm-delivery"
                onClick={onOpenConfirmDelivery}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs animate-pulse touch-manipulation select-none active:scale-95 transition-transform"
              >
                Confirm Delivery
              </button>
            )}
          </div>
        )}

      </div>

      {/* Proactive 2 Stops Away Alert Banner */}
      {(order.status === 'delivering' || order.status === 'assigned') && (
        <TwoStopsAwayAlert
          driverName={order.driver.name}
          storeName={order.store.name}
          vehiclePlate={order.driver.vehiclePlate}
          stopsAway={2}
        />
      )}

      {/* Driver Arrival Waiting Timer */}
      <DriverArrivalTimer
        status={order.status}
        driverName={order.driver.name}
        driverPhone={order.driver.phone}
        vehiclePlate={order.driver.vehiclePlate}
      />

      {/* Progress Pipeline Stepper */}
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ${isSimulatedMobile ? 'p-3.5 space-y-3' : 'p-6 space-y-4'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] block">Delivery Pipeline Status</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time status tracking pipeline.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Verification PIN</span>
              <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm font-black">{order.deliveryPin}</strong>
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-850"></div>
            
            <button
              onClick={() => setIsShowingQrCode(!isShowingQrCode)}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] shadow-sm transition-all active:scale-95 animate-pulse"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isShowingQrCode ? 'Hide QR' : 'Show Verification QR'}</span>
            </button>
          </div>
        </div>

        {isShowingQrCode && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row items-center gap-4 animate-slideDown" id="client-verification-qr-card">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
              {/* SVG Stylized QR Code */}
              <svg className="w-24 h-24 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                {/* Positional anchors */}
                <rect x="0" y="0" width="30" height="30" fill="#1d4ed8" />
                <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                <rect x="10" y="10" width="10" height="10" fill="#1d4ed8" />

                <rect x="70" y="0" width="30" height="30" fill="#1d4ed8" />
                <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                <rect x="80" y="10" width="10" height="10" fill="#1d4ed8" />

                <rect x="0" y="70" width="30" height="30" fill="#1d4ed8" />
                <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                <rect x="10" y="80" width="10" height="10" fill="#1d4ed8" />

                {/* Simulated QR Pixels */}
                <rect x="40" y="5" width="5" height="10" />
                <rect x="50" y="15" width="10" height="5" />
                <rect x="45" y="25" width="15" height="5" />
                
                <rect x="5" y="40" width="10" height="5" />
                <rect x="20" y="45" width="5" height="15" />
                <rect x="10" y="55" width="15" height="5" />

                <rect x="40" y="40" width="20" height="20" fill="#1e3a8a" />
                <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                
                <rect x="75" y="40" width="15" height="5" />
                <rect x="70" y="50" width="5" height="15" />
                <rect x="85" y="55" width="10" height="10" />

                <rect x="40" y="75" width="15" height="5" />
                <rect x="45" y="85" width="10" height="10" />
                <rect x="60" y="70" width="5" height="15" />
                
                <rect x="75" y="75" width="20" height="20" fill="#1d4ed8" />
                <rect x="80" y="80" width="10" height="10" fill="#ffffff" />
              </svg>
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center justify-center md:justify-start gap-1.5">
                <QrCode className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Contact-Free Handover Verification QR</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                Present this code to your courier. They can scan it with their camera cockpit to instantly confirm package delivery and release escrow funds without manual PIN entry.
              </p>
              <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[9px] font-bold rounded border border-blue-100 dark:border-blue-900">
                <span>Token ID: {order.deliveryPin}-{order.orderNumber}</span>
              </div>
            </div>
          </div>
        )}

        <div className={isSimulatedMobile ? "flex overflow-x-auto gap-4 py-2 px-1 scrollbar-none snap-x" : "grid grid-cols-6 gap-2 pt-2"}>
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} className={`flex flex-col items-center text-center space-y-1.5 shrink-0 ${isSimulatedMobile ? 'w-20 snap-center' : 'flex-1'}`}>
                <div
                  className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-750'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[9px] sm:text-xs font-medium leading-tight ${
                    isCurrent ? 'text-blue-600 dark:text-blue-400 font-bold' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className={isSimulatedMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
        
        {/* Map Live Tracking & Weather Telemetry (2 Cols) */}
        <div className={isSimulatedMobile ? "space-y-4" : "lg:col-span-2 space-y-4"}>
          <GoogleMapTracker
            order={order}
            apiKey={apiKey}
            isDarkMode={isDarkMode}
            onOpenCallModal={onOpenCallModal}
            onOpenChat={onOpenChat}
            onOpenKeyGuide={onOpenApiKeyGuide}
            isSimulatedMobile={isSimulatedMobile}
          />

          {/* Real-time Weather Telemetry Card */}
          <WeatherRouteCard locationName="Computer Village to GRA Ikeja, Lagos Route" />
        </div>

        {/* Right Column: Active Delivery Details & Actions */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Delivery</p>
                <h2 className="text-xl font-bold text-slate-800">#{order.orderNumber}</h2>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {order.status.replace('_', ' ')}
              </span>
            </div>

            {/* Stationary Idle Alert prompting banner */}
            {order.status === 'in_transit' && isStationary && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl flex flex-col space-y-3 shadow-xs animate-pulse">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider">Courier is Stationary</h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Rider has been stationary at Ikeja bypass for {idleAlertActive ? '5+ minutes' : 'a moment'}.
                    </p>
                  </div>
                </div>
                {!isGuestView && (
                  <button
                    onClick={onTriggerPromptStatus}
                    className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all uppercase tracking-wider"
                  >
                    Prompt Courier for Status
                  </button>
                )}
              </div>
            )}

            {/* Driver Profile */}
            {order.driver && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={order.driver.avatar}
                  alt={order.driver.name}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{order.driver.name}</p>
                  <p className="text-xs text-slate-500 italic">⭐ {order.driver.rating} • {order.driver.totalDeliveries}+ Deliveries</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Vehicle: {order.driver.vehicleType} ({order.driver.vehiclePlate})</p>
                </div>
              </div>
            )}

            {/* Communication Shortcuts */}
            {!isGuestView && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onOpenCallModal}
                  className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 text-xs"
                >
                  <Phone className="w-4 h-4 text-blue-500" /> Call
                </button>
                <button
                  onClick={onOpenChat}
                  className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 text-xs"
                >
                  <MessageSquare className="w-4 h-4 text-blue-500" /> Message
                </button>
              </div>
            )}

            {/* Package Contents Breakdown */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Package Manifest ({order.store.name})</p>
              {order.items.map((it) => (
                <div key={it.id} className="flex justify-between items-center text-slate-600">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-semibold text-slate-800">${(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Product Subtotal</span>
                <span className="font-semibold text-slate-700">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Express Delivery Fee</span>
                <span className="font-semibold text-slate-700">${order.deliveryFee.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between mt-3 p-3 bg-slate-900 rounded-lg text-white">
                <span className="font-bold text-xs uppercase tracking-wider">Total Due (Escrow)</span>
                <span className="font-bold text-blue-400">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Main Action Button */}
            {!isGuestView ? (
              <button
                onClick={onOpenConfirmDelivery}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 transition-all uppercase tracking-wider animate-pulse"
              >
                CONFIRM DELIVERY & RELEASE FUNDS
              </button>
            ) : (
              <div className="w-full py-3.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-extrabold text-xs text-center uppercase tracking-wider">
                🔒 Verification locked to Client Owner
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Client Loyalty Points Tracker */}
      <LoyaltyPointsTracker clientName={client.name} />

      {/* Route Highlights & Landmark Photos */}
      <RouteHighlightsGallery
        orderId={order.id}
        highlights={order.routeHighlights || []}
        userRole="client"
        onAddHighlight={onAddRouteHighlight}
      />

      {/* Gamified Leaderboard for Top Drivers */}
      <TopDriversLeaderboard title="Top-Rated Ikeja Fleet Champions" />

      {/* Emergency Assistance Hotline Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        userRole="client"
        userName={client.name}
        currentLocation={client.location}
        onClose={() => setIsEmergencyModalOpen(false)}
        onTriggerAlert={onTriggerEmergencyAlert}
      />

      {/* Share Tracking Link Modal */}
      <ShareTrackingModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        orderNumber={order.orderNumber}
        storeName={order.store.name}
        recipientName={client.name}
      />

      {/* Share Social ETA Card Modal */}
      <ShareEtaModal
        isOpen={isShareEtaModalOpen}
        onClose={() => setIsShareEtaModalOpen(false)}
        orderNumber={order.orderNumber}
        storeName={order.store.name}
        driverName={order.driver.name}
        vehiclePlate={order.driver.vehiclePlate}
        estimatedMinutes={order.estimatedMinutes}
      />

    </div>
  );
};
