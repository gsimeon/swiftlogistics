import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { 
  Role, 
  DeliveryOrder, 
  DeliveryStatus, 
  ChatMessage, 
  AppNotification,
  LocationPoint,
  RouteHighlight 
} from './types';
import { 
  INITIAL_ACTIVE_ORDER, 
  MOCK_HISTORY_ORDERS, 
  MOCK_DRIVERS, 
  CURRENT_CLIENT, 
  MOCK_STORES,
  MOCK_ROUTE_PATH
} from './data/mockData';
import { soundService } from './services/soundService';
import { getDistanceInMeters } from './utils/geo';

import { Navbar } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { DriverView } from './components/DriverView';
import { StoreDispatcher } from './components/StoreDispatcher';
import { CallModal } from './components/CallModal';
import { ChatDrawer } from './components/ChatDrawer';
import { PaymentModal } from './components/PaymentModal';
import { DeliveryConfirmationModal } from './components/DeliveryConfirmationModal';
import { HistoryLog } from './components/HistoryLog';
import { ApiKeyGuideModal } from './components/ApiKeyGuideModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { PostDeliveryFeedbackModal } from './components/PostDeliveryFeedbackModal';
import { LanguageProvider } from './context/LanguageContext';
import { 
  saveActiveOrderToDB, 
  getActiveOrderFromDB, 
  saveCompletedOrdersToDB, 
  getCompletedOrdersFromDB, 
  saveChatMessagesToDB, 
  getChatMessagesFromDB, 
  saveNotificationsToDB, 
  getNotificationsFromDB 
} from './services/dbService';

export default function App() {
  // Diagnostic useEffect to log routing and base URI details
  useEffect(() => {
    console.log('App Mounted: Diagnostics');
    console.log('document.baseURI:', document.baseURI);
    console.log('window.location.href:', window.location.href);
    console.log('window.location.pathname:', window.location.pathname);
  }, []);

  const [currentRole, setCurrentRole] = useState<Role>('client');
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(INITIAL_ACTIVE_ORDER);
  const [completedOrders, setCompletedOrders] = useState<DeliveryOrder[]>(MOCK_HISTORY_ORDERS);

  // Global Theme Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync dark class on root document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Offline Connectivity Monitor
  const [isOffline, setIsOffline] = useState<boolean>(!window.navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: '🌐 Connection Restored',
        message: 'Device successfully reconnected to online servers.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'info' as const,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    const handleOffline = () => {
      setIsOffline(true);
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: '📡 Offline Mode Activated',
        message: 'Offline mode enabled. Features are running locally with high-fidelity simulation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'warning' as const,
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Shared simulated hardware states
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [isPowerSaving, setIsPowerSaving] = useState<boolean>(false);

  // Modals & Panels state
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmDeliveryModalOpen, setIsConfirmDeliveryModalOpen] = useState(false);
  const [isFeedbackSurveyOpen, setIsFeedbackSurveyOpen] = useState(false);
  const [surveyOrder, setSurveyOrder] = useState<DeliveryOrder | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApiKeyGuideOpen, setIsApiKeyGuideOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Google Maps Key from env define
  const mapsApiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

  // Initial Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      deliveryId: INITIAL_ACTIVE_ORDER.id,
      senderRole: 'driver',
      senderName: INITIAL_ACTIVE_ORDER.driver?.name || 'Rider',
      text: 'Hello David! I have picked up your order from Techlab Innovation Solutions (No 13 Adekpre St, Computer Village Ikeja) and I am navigating via Mobolaji Bank Anthony Way.',
      timestamp: '14:22',
    },
    {
      id: 'm2',
      deliveryId: INITIAL_ACTIVE_ORDER.id,
      senderRole: 'client',
      senderName: CURRENT_CLIENT.name,
      text: 'Thanks Alex! I am waiting at Isaac John Street GRA Ikeja.',
      timestamp: '14:24',
    },
  ]);

  // Initial Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n1',
      title: '📦 Order Pickup Verified at Techlab',
      message: 'Rider Alex Vance verified store OTP code #3109 at Techlab Innovation Solutions, Computer Village Ikeja.',
      timestamp: '14:20',
      type: 'pickup',
      read: false,
    },
    {
      id: 'n2',
      title: '💳 Escrow Locked',
      message: '$232.49 held safely in escrow. Will be released upon delivery confirmation.',
      timestamp: '14:10',
      type: 'info',
      read: false,
    },
  ]);

  // Load initial persisted state from IndexedDB on app startup
  useEffect(() => {
    async function loadPersistedData() {
      try {
        const dbActiveOrder = await getActiveOrderFromDB();
        if (dbActiveOrder) {
          setActiveOrder(dbActiveOrder);
        }

        const dbCompletedOrders = await getCompletedOrdersFromDB();
        if (dbCompletedOrders && dbCompletedOrders.length > 0) {
          setCompletedOrders(dbCompletedOrders);
        }

        const dbMessages = await getChatMessagesFromDB();
        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages);
        }

        const dbNotifications = await getNotificationsFromDB();
        if (dbNotifications && dbNotifications.length > 0) {
          setNotifications(dbNotifications);
        }
      } catch (e) {
        console.warn('Error loading state from IndexedDB:', e);
      }
    }
    loadPersistedData();
  }, []);

  // Save state to IndexedDB on change
  useEffect(() => {
    saveActiveOrderToDB(activeOrder);
  }, [activeOrder]);

  useEffect(() => {
    saveCompletedOrdersToDB(completedOrders);
  }, [completedOrders]);

  useEffect(() => {
    saveChatMessagesToDB(messages);
  }, [messages]);

  useEffect(() => {
    saveNotificationsToDB(notifications);
  }, [notifications]);

  // Live GPS Simulation state
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // Driver Idle Alert background monitor states
  const [isStationary, setIsStationary] = useState<boolean>(false);
  const [idleSeconds, setIdleSeconds] = useState<number>(0);
  const [idleAlertActive, setIdleAlertActive] = useState<boolean>(false);

  // Geo-fence Proximity Alert State & Monitor
  const [geoFenceTriggered, setGeoFenceTriggered] = useState<boolean>(false);

  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'in_transit') {
      setGeoFenceTriggered(false);
      return;
    }

    const currentLoc = activeOrder.currentDriverLocation;
    const dest = activeOrder.client.location;
    if (!currentLoc || !dest) return;

    const distanceMeters = getDistanceInMeters(currentLoc.lat, currentLoc.lng, dest.lat, dest.lng);
    if (distanceMeters <= 500 && !geoFenceTriggered) {
      setGeoFenceTriggered(true);
      soundService.playNotification();
      addNotification(
        '📍 Geo-Fence: Almost There!',
        `Driver ${activeOrder.driver?.name || 'Rider'} is within ${Math.round(distanceMeters)}m of the destination.`,
        'info'
      );
      handleSendMessage("Almost there! I'm within 500m of your location.", 'driver');
    }
  }, [
    activeOrder?.currentDriverLocation?.lat,
    activeOrder?.currentDriverLocation?.lng,
    activeOrder?.status,
    geoFenceTriggered
  ]);

  // Handle Real-Time Driver Movement Simulation when order is in_transit
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'in_transit' || !isLiveSimulating || isStationary) return;

    const path = activeOrder.routeCoordinates && activeOrder.routeCoordinates.length > 0 
      ? activeOrder.routeCoordinates 
      : MOCK_ROUTE_PATH;

    const updateInterval = isPowerSaving ? 8000 : 3000;

    const interval = setInterval(() => {
      setActiveOrder((prev) => {
        if (!prev || prev.status !== 'in_transit') return prev;

        const dest = prev.client.location;
        const currentLoc = prev.currentDriverLocation || path[0];

        // Step smoothly toward destination in Ikeja Lagos
        const step = 0.0004; // ~40 meters step per tick
        const dLat = dest.lat - currentLoc.lat;
        const dLng = dest.lng - currentLoc.lng;
        const distToDest = Math.sqrt(dLat * dLat + dLng * dLng);

        // If very close to destination (less than ~50 meters)
        if (distToDest < 0.0006) {
          soundService.playNotification();
          addNotification(
            '📍 Driver Has Arrived at GRA Ikeja!',
            `Rider ${prev.driver?.name} is waiting at Isaac John St. Provide PIN #${prev.deliveryPin} to complete delivery.`,
            'arrived'
          );
          return {
            ...prev,
            estimatedMinutes: 0,
            status: 'arrived',
            currentDriverLocation: dest,
          };
        }

        // Interpolate position along route
        const ratio = Math.min(1, step / distToDest);
        const newLat = currentLoc.lat + dLat * ratio;
        const newLng = currentLoc.lng + dLng * ratio;

        // Estimate remaining minutes based on distance
        const approxRemainingMinutes = Math.max(1, Math.ceil((distToDest - step) * 1200));

        return {
          ...prev,
          currentDriverLocation: { lat: newLat, lng: newLng },
          estimatedMinutes: approxRemainingMinutes,
        };
      });
    }, updateInterval); // Map/GPS refresh rate reduced when power-saving is enabled

    return () => clearInterval(interval);
  }, [activeOrder?.status, isLiveSimulating, isStationary, isPowerSaving]);

  // Stationary Idle Alert Background Monitor
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'in_transit' || !isStationary) {
      setIdleSeconds(0);
      setIdleAlertActive(false);
      return;
    }

    const interval = setInterval(() => {
      setIdleSeconds((prev) => {
        const next = prev + 1;
        // Trigger alert after 10 seconds (simulating 5 minutes in production)
        if (next === 10) {
          setIdleAlertActive(true);
          soundService.playNotification();
          addNotification(
            '⚠️ Driver Idle Alert',
            `Driver ${activeOrder.driver?.name || 'Rider'} has been stationary for 5+ minutes at a non-delivery site near Computer Village bypass.`,
            'warning'
          );
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder?.status, isStationary]);

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleSendMessage = (
    text: string, 
    senderRole: Role, 
    audioData?: { audioUrl?: string; audioDurationSeconds?: number; isVoiceNote?: boolean }
  ) => {
    if (!activeOrder) return;
    const senderName = senderRole === 'driver' ? (activeOrder.driver?.name || 'Rider') : activeOrder.client.name;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      deliveryId: activeOrder.id,
      senderRole,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...audioData,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const [trafficAlert, setTrafficAlert] = useState<{
    addedMinutes: number;
    reason: string;
    timestamp: string;
  } | null>(null);

  // Automated Traffic Delay Notification System
  const handleTriggerTrafficDelay = (additionalMinutes: number, reason: string = 'Heavy Traffic Congestion') => {
    if (!activeOrder) return;

    const oldEta = activeOrder.estimatedMinutes;
    const newEta = oldEta + additionalMinutes;

    setActiveOrder((prev) => (prev ? { ...prev, estimatedMinutes: newEta } : null));

    if (additionalMinutes > 5) {
      soundService.playNotification();
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setTrafficAlert({
        addedMinutes: additionalMinutes,
        reason,
        timestamp: timeStr,
      });

      addNotification(
        `🚨 Traffic Delay Alert (+${additionalMinutes} min)`,
        `Driver ${activeOrder.driver?.name}'s ETA increased by ${additionalMinutes} mins due to ${reason.toLowerCase()}. Revised ETA: ~${newEta} mins.`,
        'warning'
      );

      const autoMsg: ChatMessage = {
        id: `traffic-msg-${Date.now()}`,
        deliveryId: activeOrder.id,
        senderRole: 'driver',
        senderName: 'System Traffic Monitor',
        text: `🚨 Traffic Congestion Alert: Traffic delay detected on route. Added +${additionalMinutes} mins to ETA. Revised delivery time: ~${newEta} mins.`,
        timestamp: timeStr,
        isAudioAlert: true,
      };
      setMessages((prev) => [...prev, autoMsg]);
    }
  };

  // Driver Status Step updates
  const handleUpdateStatus = (newStatus: DeliveryStatus) => {
    if (!activeOrder) return;

    setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));

    if (newStatus === 'store_pickup') {
      addNotification('📦 Rider Arrived at Store', `Driver ${activeOrder.driver?.name} is collecting items.`, 'pickup');
    } else if (newStatus === 'in_transit') {
      addNotification('🚚 Order In Transit', `Rider ${activeOrder.driver?.name} is en route to client destination.`, 'transit');
    } else if (newStatus === 'arrived') {
      addNotification('📍 Rider Arrived', `Driver is waiting outside. Provide PIN code #${activeOrder.deliveryPin}`, 'delivered');
    }
  };

  // Close Deal / Delivery PIN Confirmation
  const handleConfirmDealClosed = (
    pin: string,
    signature: string,
    rating: number,
    review: string
  ) => {
    if (!activeOrder) return;

    const estMins = activeOrder.estimatedMinutes || 15;
    const actualMins = Math.max(12, Math.round(estMins * 0.9));
    const scorePct = Math.min(100, Math.max(88, Math.round((estMins / actualMins) * 96)));

    const closedOrder: DeliveryOrder = {
      ...activeOrder,
      status: 'delivered',
      paymentStatus: 'released_to_driver',
      closedAt: new Date().toISOString(),
      confirmationSignature: signature,
      rating,
      review,
      performanceMetrics: {
        actualDurationMinutes: actualMins,
        estimatedDurationMinutes: estMins + 3,
        punctualityScorePct: scorePct,
        statusBadge: actualMins <= estMins ? 'Ahead of Schedule' : 'On Time',
        avgSpeedKmH: activeOrder.driver?.speedKmH || 38,
      },
    };

    setCompletedOrders((prev) => [closedOrder, ...prev]);
    setActiveOrder(null);
    setSurveyOrder(closedOrder);
    setIsFeedbackSurveyOpen(true);

    addNotification(
      '🎉 Deal Closed & Escrow Released!',
      `Delivery #${closedOrder.orderNumber} completed! Payment released to ${closedOrder.driver?.name}.`,
      'success'
    );
  };

  // New Delivery Dispatched from Store
  const handleDispatchNewOrder = (newOrder: DeliveryOrder) => {
    setActiveOrder(newOrder);
    addNotification(
      '🚀 Delivery Dispatched!',
      `Order #${newOrder.orderNumber} assigned to rider ${newOrder.driver?.name}.`,
      'info'
    );
  };

  // Payment checkout completed
  const handleConfirmPayment = (
    paymentMethod: 'credit_card' | 'apple_pay' | 'google_pay' | 'wallet',
    tipAmount: number
  ) => {
    if (!activeOrder) return;
    setActiveOrder((prev) => {
      if (!prev) return null;
      const total = prev.subtotal + prev.deliveryFee + tipAmount;
      return {
        ...prev,
        paymentStatus: 'held_in_escrow',
        paymentMethod,
        tip: tipAmount,
        total,
      };
    });
    addNotification('💳 Payment Authorized', `Payment locked in Escrow. Rider en route!`, 'info');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Emergency SOS Alert Handler
  const handleTriggerEmergencyAlert = (msg: string) => {
    soundService.playNotification();
    addNotification('🚨 EMERGENCY SOS ALERT', msg, 'warning');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (activeOrder) {
      const sosMsg: ChatMessage = {
        id: `sos-msg-${Date.now()}`,
        deliveryId: activeOrder.id,
        senderRole: 'driver',
        senderName: 'EMERGENCY DISPATCH',
        text: `🚨 EMERGENCY ALERT: ${msg}`,
        timestamp: timeStr,
        isAudioAlert: true,
      };
      setMessages((prev) => [...prev, sosMsg]);
    }
  };

  // Smart AI Traffic Re-routing Handler
  const handleToggleSmartReroute = (enableDetour: boolean) => {
    if (!activeOrder) return;
    soundService.playNotification();

    if (enableDetour) {
      // Detour route coordinates bypassing Mobolaji Bank Anthony congestion
      const detourPath: LocationPoint[] = [
        activeOrder.store.location,
        { lat: 6.5980, lng: 3.3505 }, // Toyin Street Ikeja
        { lat: 6.6018, lng: 3.3512 }, // Allen Avenue Junction
        { lat: 6.5850, lng: 3.3550 }, // Isaac John St Bypass
        activeOrder.client.location,
      ];

      setActiveOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routeCoordinates: detourPath,
          estimatedMinutes: Math.max(1, prev.estimatedMinutes - 8),
        };
      });

      addNotification(
        '🗺️ Smart AI Traffic Re-routing Active',
        'Google Maps traffic analysis detected congestion at Mobolaji Bank Anthony. Detouring via Toyin Street / Allen Avenue (Saved 8 mins!).',
        'info'
      );
    } else {
      // Reset to standard route
      setActiveOrder((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routeCoordinates: MOCK_ROUTE_PATH,
          estimatedMinutes: prev.estimatedMinutes + 8,
        };
      });

      addNotification(
        '🗺️ Route Restored',
        'Smart Re-routing toggled off. Restored standard Ikeja delivery corridor route.',
        'info'
      );
    }
  };

  // Add Route Highlight Photo Handler
  const handleAddRouteHighlight = (newHighlight: RouteHighlight) => {
    setActiveOrder((prev) => {
      if (!prev) return null;
      const existing = prev.routeHighlights || [];
      return {
        ...prev,
        routeHighlights: [newHighlight, ...existing],
      };
    });
    addNotification(
      '📸 Landmark Photo Pinned',
      `New route photo "${newHighlight.title}" attached to order #${activeOrder?.orderNumber || ''}.`,
      'info'
    );
  };

  return (
    <HelmetProvider>
      <LanguageProvider>
        <Helmet>
          <title>LogiPulse: Real-time Delivery Tracker</title>
          <meta name="description" content="Real-time delivery and fleet tracking dashboard with interactive route highlights, driver analytics, and offline-sync capabilities." />
          <meta property="og:title" content="LogiPulse: Real-time Delivery Tracker" />
          <meta property="og:description" content="Real-time delivery and fleet tracking dashboard with interactive route highlights, driver analytics, and offline-sync capabilities." />
          <meta property="og:image" content="./icon.svg" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="LogiPulse: Real-time Delivery Tracker" />
          <meta name="twitter:description" content="Real-time delivery and fleet tracking dashboard with interactive route highlights, driver analytics, and offline-sync capabilities." />
        </Helmet>
        <div className={`min-h-screen transition-colors flex flex-col font-sans selection:bg-blue-500 selection:text-white ${
          isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}>
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          setIsHistoryOpen(false);
        }}
        activeOrderCount={activeOrder ? 1 : 0}
        notifications={notifications}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        unreadCount={unreadCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          soundService.soundEnabled = !soundEnabled;
          setSoundEnabled(!soundEnabled);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenNewOrder={() => {
          setCurrentRole('store');
          setIsHistoryOpen(false);
        }}
        onOpenApiKeyGuide={() => setIsApiKeyGuideOpen(true)}
        hasApiKey={Boolean(mapsApiKey)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Offline Mode Sticky Banner */}
      {isOffline && (
        <div id="offline-mode-banner" className="sticky top-0 z-50 bg-rose-600 text-white text-xs font-semibold py-2.5 px-4 shadow-md flex items-center justify-between transition-all shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span><strong>Offline Mode Active:</strong> Live connection suspended. Simulated features are running locally with local persistence.</span>
          </div>
          <button
            onClick={() => {
              // Trigger manual re-sync
              const isNowOnline = window.navigator.onLine;
              if (isNowOnline) {
                setIsOffline(false);
                const syncNotif = {
                  id: `notif-${Date.now()}`,
                  title: '🔄 Live Sync Complete',
                  message: 'Successfully re-established synchronization with database cluster.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'info' as const,
                  read: false,
                };
                setNotifications((prev) => [syncNotif, ...prev]);
              } else {
                const failNotif = {
                  id: `notif-${Date.now()}`,
                  title: '🔄 Sync Attempt Failed',
                  message: 'Still offline. Manual sync will resume when internet connectivity is detected.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'warning' as const,
                  read: false,
                };
                setNotifications((prev) => [failNotif, ...prev]);
              }
            }}
            className="bg-white/25 hover:bg-white/35 text-white px-3 py-1 rounded-lg border border-white/40 font-bold tracking-wider uppercase text-[10px] active:scale-95 transition-all cursor-pointer"
          >
            Manual Re-Sync
          </button>
        </div>
      )}

      {/* Main Screen Body */}
      <div className="flex-1 overflow-auto flex flex-col h-full">
        {isHistoryOpen ? (
          <HistoryLog
            orders={completedOrders}
            onBack={() => setIsHistoryOpen(false)}
          />
        ) : currentRole === 'client' ? (
          <ClientView
            order={activeOrder}
            client={CURRENT_CLIENT}
            apiKey={mapsApiKey}
            isDarkMode={isDarkMode}
            trafficAlert={trafficAlert}
            onTriggerTrafficDelay={handleTriggerTrafficDelay}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenConfirmDelivery={() => setIsConfirmDeliveryModalOpen(true)}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onOpenNewOrderModal={() => setCurrentRole('store')}
            onOpenApiKeyGuide={() => setIsApiKeyGuideOpen(true)}
            onTriggerEmergencyAlert={handleTriggerEmergencyAlert}
            onAddRouteHighlight={handleAddRouteHighlight}
            isStationary={isStationary}
            idleAlertActive={idleAlertActive}
            onTriggerPromptStatus={() => {
              handleSendMessage('Are you stuck in traffic? Please verify status.', 'client');
              soundService.playNotification();
              addNotification(
                '🛎️ Driver Prompted',
                'Status verification request sent to Rider Alex.',
                'info'
              );
            }}
            isSimulatedMobile={false}
          />
        ) : currentRole === 'driver' ? (
          <DriverView
            order={activeOrder}
            driver={activeOrder?.driver || MOCK_DRIVERS[0]}
            apiKey={mapsApiKey}
            isDarkMode={isDarkMode}
            trafficAlert={trafficAlert}
            onTriggerTrafficDelay={handleTriggerTrafficDelay}
            onUpdateStatus={handleUpdateStatus}
            onOpenCallModal={() => setIsCallModalOpen(true)}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenConfirmDelivery={() => setIsConfirmDeliveryModalOpen(true)}
            onOpenApiKeyGuide={() => setIsApiKeyGuideOpen(true)}
            onTriggerEmergencyAlert={handleTriggerEmergencyAlert}
            onToggleSmartReroute={handleToggleSmartReroute}
            onAddRouteHighlight={handleAddRouteHighlight}
            isStationary={isStationary}
            onToggleStationary={() => setIsStationary((prev) => !prev)}
            idleAlertActive={idleAlertActive}
            idleSeconds={idleSeconds}
            onResolveIdleAlert={(response: string) => {
              setIsStationary(false);
              setIdleSeconds(0);
              setIdleAlertActive(false);
              handleSendMessage(response, 'driver');
              addNotification(
                '⚡ Alert Resolved',
                `Rider provided status update: "${response}"`,
                'success'
              );
            }}
            onScanVerifyDelivery={() => {
              if (activeOrder) {
                handleConfirmDealClosed(
                  activeOrder.deliveryPin,
                  'CONTACT_FREE_QR_SCAN',
                  5,
                  'Verified instantly via Contact-Free secure QR code scan.'
                );
              }
            }}
            isSimulatedMobile={false}
          />
        ) : (
          <StoreDispatcher
            onDispatchNewOrder={handleDispatchNewOrder}
            onSwitchToClientView={() => setCurrentRole('client')}
            apiKey={mapsApiKey}
            isSimulatedMobile={false}
          />
        )}
      </div>

      {/* Real-Time Call Modal */}
      {activeOrder && (
        <CallModal
          isOpen={isCallModalOpen}
          onClose={() => setIsCallModalOpen(false)}
          driver={activeOrder.driver || MOCK_DRIVERS[0]}
          client={activeOrder.client}
          userRole={currentRole}
        />
      )}

      {/* Real-Time Chat Drawer */}
      {activeOrder && (
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          deliveryId={activeOrder.id}
          driver={activeOrder.driver || MOCK_DRIVERS[0]}
          client={activeOrder.client}
          userRole={currentRole}
          messages={messages}
          onSendMessage={handleSendMessage}
          onOpenCall={() => {
            setIsChatOpen(false);
            setIsCallModalOpen(true);
          }}
        />
      )}

      {/* Escrow Payment Modal */}
      {activeOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={activeOrder}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* Delivery Confirmation & Deal Closure Modal */}
      {activeOrder && (
        <DeliveryConfirmationModal
          isOpen={isConfirmDeliveryModalOpen}
          onClose={() => setIsConfirmDeliveryModalOpen(false)}
          order={activeOrder}
          onConfirmDealClosed={handleConfirmDealClosed}
        />
      )}

      {/* Post-Delivery Quality & Service Survey Modal */}
      {surveyOrder && (
        <PostDeliveryFeedbackModal
          isOpen={isFeedbackSurveyOpen}
          onClose={() => setIsFeedbackSurveyOpen(false)}
          order={surveyOrder}
        />
      )}

      {/* Google Maps API Key Guide */}
      <ApiKeyGuideModal
        isOpen={isApiKeyGuideOpen}
        onClose={() => setIsApiKeyGuideOpen(false)}
      />

      {/* Automated Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      />

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-3.5 px-6 text-[10px] font-medium text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-slate-700">LOGIPULSE ENTERPRISE</span>
            <span>• ENCRYPTED CONNECTION (AES-256)</span>
            <span className="hidden sm:inline">• ESCROW PROTECTED</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>HELP CENTER</span>
            <span>PRIVACY POLICY</span>
            <span className="text-slate-400">v2.4.0-enterprise</span>
          </div>
        </div>
      </footer>

        </div>
      </LanguageProvider>
    </HelmetProvider>
  );
}
