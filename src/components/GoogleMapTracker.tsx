import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { DeliveryOrder, LocationPoint } from '../types';
import { Store, Navigation, MapPin, Truck, Bike, ShieldCheck, Compass, Zap, Flame, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { MOCK_HISTORY_ORDERS } from '../data/mockData';

interface GoogleMapTrackerProps {
  order: DeliveryOrder;
  apiKey: string;
  isDarkMode?: boolean;
  mapTheme?: string;
  onOpenCallModal: () => void;
  onOpenChat: () => void;
  onOpenKeyGuide: () => void;
  historyOrders?: DeliveryOrder[];
  isSimulatedMobile?: boolean;
}

// Custom Deck.GL Heatmap Layer Component for Google Maps
const GoogleMapsHeatmap: React.FC<{ data: Array<{ lat: number; lng: number; weight: number }> }> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    const heatmapLayer = new HeatmapLayer({
      id: 'heatmap-layer',
      data,
      getPosition: (d: any) => [d.lng, d.lat],
      getWeight: (d: any) => d.weight || 1,
      radiusPixels: 45,
      intensity: 1.5,
      threshold: 0.03,
    });

    const overlay = new GoogleMapsOverlay({
      layers: [heatmapLayer],
    });

    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [map, data]);

  return null;
};

// Generate high order volume points in Ikeja using mock data and history orders
const getHeatmapPoints = (historyOrders: DeliveryOrder[] = []) => {
  const basePoints = [
    { lat: 6.5928, lng: 3.3421, weight: 10 }, // Computer Village
    { lat: 6.5930, lng: 3.3425, weight: 8 },
    { lat: 6.5925, lng: 3.3418, weight: 9 },
    { lat: 6.5935, lng: 3.3430, weight: 7 },
    { lat: 6.5920, lng: 3.3410, weight: 6 },
    { lat: 6.5862, lng: 3.3582, weight: 8 }, // Ikeja GRA
    { lat: 6.5855, lng: 3.3575, weight: 7 },
    { lat: 6.5870, lng: 3.3590, weight: 6 },
    { lat: 6.5822, lng: 3.3572, weight: 5 },
    { lat: 6.6011, lng: 3.3514, weight: 8 }, // Allen Avenue
    { lat: 6.6018, lng: 3.3512, weight: 7 },
    { lat: 6.6025, lng: 3.3520, weight: 6 },
    { lat: 6.6005, lng: 3.3505, weight: 5 },
    { lat: 6.5980, lng: 3.3601, weight: 5 }, // Opebi Road
    { lat: 6.5975, lng: 3.3595, weight: 4 },
    { lat: 6.5985, lng: 3.3610, weight: 4 },
    { lat: 6.5702, lng: 3.3675, weight: 9 }, // Maryland Mall
    { lat: 6.5705, lng: 3.3680, weight: 8 },
    { lat: 6.5700, lng: 3.3670, weight: 7 },
    { lat: 6.5710, lng: 3.3690, weight: 6 },
  ];

  const orderPoints = (historyOrders || []).map(order => {
    const loc = order.store?.location || order.client?.location;
    if (loc) {
      return { lat: loc.lat, lng: loc.lng, weight: 5 };
    }
    return null;
  }).filter(Boolean) as Array<{ lat: number; lng: number; weight: number }>;

  return [...basePoints, ...orderPoints];
};

// Ikeja Region Traffic Hotspots based on historical delivery path data
const IKEJA_TRAFFIC_HOTSPOTS = [
  {
    id: 'hs-1',
    name: 'Computer Village Underbridge Junction',
    lat: 6.5930,
    lng: 3.3420,
    intensity: 'Critical (95% Congestion)',
    delayMins: '+12m',
    color: '#ef4444',
  },
  {
    id: 'hs-2',
    name: 'Mobolaji Bank Anthony Way / Airport Rd',
    lat: 6.5860,
    lng: 3.3550,
    intensity: 'High (88% Congestion)',
    delayMins: '+8m',
    color: '#f97316',
  },
  {
    id: 'hs-3',
    name: 'Allen Avenue / Toyin Street Junction',
    lat: 6.6010,
    lng: 3.3510,
    intensity: 'Moderate (75% Congestion)',
    delayMins: '+5m',
    color: '#eab308',
  },
  {
    id: 'hs-4',
    name: 'Maryland Interchange / Ikorodu Rd',
    lat: 6.5710,
    lng: 3.3680,
    intensity: 'Severe (98% Congestion)',
    delayMins: '+15m',
    color: '#dc2626',
  },
  {
    id: 'hs-5',
    name: 'Ikeja Along Bus Stop / Agege Motor Rd',
    lat: 6.5980,
    lng: 3.3360,
    intensity: 'Heavy (90% Congestion)',
    delayMins: '+10m',
    color: '#f97316',
  },
];

// Ikeja Region Public Transit Stops (BRT, Metro, Bus Terminals)
const IKEJA_TRANSIT_STOPS = [
  { id: 'ts-1', name: 'Ikeja Central Bus Terminal', lat: 6.5960, lng: 3.3440, type: 'BRT Terminal', line: 'LBS Route 1 & 3' },
  { id: 'ts-2', name: 'Maryland Transport Interchange Hub', lat: 6.5700, lng: 3.3690, type: 'BRT Station', line: 'Ikorodu Rd Corridor' },
  { id: 'ts-3', name: 'Computer Village Express Stop', lat: 6.5920, lng: 3.3410, type: 'City Bus Stop', line: 'Otigba Feeder' },
  { id: 'ts-4', name: 'Allen Avenue Junction Shelter', lat: 6.6020, lng: 3.3500, type: 'BRT Shelter', line: 'Ikeja - Opebi Loop' },
  { id: 'ts-5', name: 'Ikeja Railway Station (Red Line)', lat: 6.5910, lng: 3.3380, type: 'Metro Rail Station', line: 'Lagos Red Line Depot' },
];

// Helper Component to attach Google Maps API TrafficLayer and TransitLayer to map instance
const GoogleMapsApiLayers: React.FC<{ showTrafficLayer: boolean; showTransitLayer: boolean }> = ({ showTrafficLayer, showTransitLayer }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    let trafficLayer: google.maps.TrafficLayer | null = null;
    if (showTrafficLayer) {
      trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }

    return () => {
      if (trafficLayer) trafficLayer.setMap(null);
    };
  }, [map, showTrafficLayer]);

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    let transitLayer: google.maps.TransitLayer | null = null;
    if (showTransitLayer) {
      transitLayer = new google.maps.TransitLayer();
      transitLayer.setMap(map);
    }

    return () => {
      if (transitLayer) transitLayer.setMap(null);
    };
  }, [map, showTransitLayer]);

  return null;
};

const getTrafficColorForLocation = (p: { lat: number; lng: number }): string => {
  let minDistance = Infinity;
  let nearestHotspot: typeof IKEJA_TRAFFIC_HOTSPOTS[0] | null = null;

  for (const hs of IKEJA_TRAFFIC_HOTSPOTS) {
    const distance = Math.sqrt(Math.pow(p.lat - hs.lat, 2) + Math.pow(p.lng - hs.lng, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestHotspot = hs;
    }
  }

  // If near any active hotspots, color code appropriately
  if (minDistance < 0.0035) {
    return nearestHotspot ? nearestHotspot.color : '#10b981';
  }

  return '#10b981'; // Green (Free Flow)
};

// Custom Polyline Component using Google Maps JS API
const RoutePolyline: React.FC<{ 
  path: Array<LocationPoint>; 
  isDarkMode?: boolean;
  showTrafficRouteOverlay: boolean;
}> = ({ path, isDarkMode, showTrafficRouteOverlay }) => {
  const map = useMap();
  const mapsLibrary = useMapsLibrary('maps');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map || !mapsLibrary) return;

    // Clear previous segments
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    if (showTrafficRouteOverlay) {
      // Draw individual segments color coded by local traffic density
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        const strokeColor = getTrafficColorForLocation(p1);

        const polyline = new mapsLibrary.Polyline({
          path: [p1, p2],
          geodesic: true,
          strokeColor,
          strokeOpacity: 0.95,
          strokeWeight: 7,
        });
        polyline.setMap(map);
        polylinesRef.current.push(polyline);
      }
    } else {
      // Draw single standard blue track polyline
      const polyline = new mapsLibrary.Polyline({
        path,
        geodesic: true,
        strokeColor: isDarkMode ? '#60a5fa' : '#2563eb',
        strokeOpacity: 0.9,
        strokeWeight: 6,
      });
      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    }

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, mapsLibrary, path, isDarkMode, showTrafficRouteOverlay]);

  return null;
};

export const GoogleMapTracker: React.FC<GoogleMapTrackerProps> = ({
  order,
  apiKey,
  isDarkMode = false,
  mapTheme = 'standard',
  onOpenCallModal,
  onOpenChat,
  onOpenKeyGuide,
  historyOrders = MOCK_HISTORY_ORDERS,
  isSimulatedMobile = false,
}) => {
  const hasKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY' && apiKey.length > 5;
  const [activeWindow, setActiveWindow] = useState<'store' | 'driver' | 'client' | 'hotspot' | null>('driver');
  const [selectedHotspot, setSelectedHotspot] = useState<typeof IKEJA_TRAFFIC_HOTSPOTS[0] | null>(null);
  const [showTrafficHotspots, setShowTrafficHotspots] = useState<boolean>(true);
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [showTransitLayer, setShowTransitLayer] = useState<boolean>(true);
  const [showDemandHeatmap, setShowDemandHeatmap] = useState<boolean>(true);
  const [showTrafficRouteOverlay, setShowTrafficRouteOverlay] = useState<boolean>(true);
  const [selectedTransitStop, setSelectedTransitStop] = useState<typeof IKEJA_TRANSIT_STOPS[0] | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  const storeLoc = order.store.location;
  const clientLoc = order.client.location;
  const driverLoc = order.currentDriverLocation;

  // Use full dynamic route coordinates if available, otherwise fall back to store -> driver -> client
  const routePoints: LocationPoint[] = 
    order.routeCoordinates && order.routeCoordinates.length > 0 
      ? order.routeCoordinates 
      : [storeLoc, driverLoc, clientLoc];

  // Center on driver or midpoint
  const centerLat = (storeLoc.lat + clientLoc.lat) / 2;
  const centerLng = (storeLoc.lng + clientLoc.lng) / 2;

  // Distance & Circular Trip Progress Calculation
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const totalTripDistKm = Math.max(0.2, calculateDistanceKm(storeLoc.lat, storeLoc.lng, clientLoc.lat, clientLoc.lng));
  const remainingTripDistKm = calculateDistanceKm(driverLoc.lat, driverLoc.lng, clientLoc.lat, clientLoc.lng);
  const coveredTripDistKm = Math.max(0, totalTripDistKm - remainingTripDistKm);

  let tripCompletionPct = 0;
  if (order.status === 'delivered' || order.status === 'arrived') {
    tripCompletionPct = 100;
  } else if (order.status === 'order_placed') {
    tripCompletionPct = 5;
  } else if (order.status === 'driver_assigned') {
    tripCompletionPct = 15;
  } else if (order.status === 'store_pickup') {
    tripCompletionPct = 30;
  } else {
    const rawPct = Math.round((coveredTripDistKm / totalTripDistKm) * 100);
    tripCompletionPct = Math.min(98, Math.max(35, rawPct));
  }

  return (
    <div className={`relative w-full ${isSimulatedMobile ? 'h-[280px]' : 'h-[500px]'} rounded-xl overflow-hidden border shadow-sm transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'
    }`}>
      
      {hasKey ? (
        <APIProvider apiKey={apiKey} version="weekly">
          <Map
            defaultCenter={{ lat: centerLat, lng: centerLng }}
            defaultZoom={zoomLevel}
            mapId="LOGIPULSE_MAP_ID"
            colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={false}
            zoomControl={true}
          >
            {/* Google Maps API Traffic and Transit Layers Hook */}
            <GoogleMapsApiLayers showTrafficLayer={showTrafficLayer} showTransitLayer={showTransitLayer} />

            {/* Real-time Order Volume Demand Heatmap Layer (deck.gl) */}
            {showDemandHeatmap && (
              <GoogleMapsHeatmap data={getHeatmapPoints(historyOrders)} />
            )}

            {/* Draw Polyline between Store -> Current Driver Location -> Client Destination */}
            <RoutePolyline path={routePoints} isDarkMode={isDarkMode} showTrafficRouteOverlay={showTrafficRouteOverlay} />

            {/* Store Marker */}
            <AdvancedMarker
              position={storeLoc}
              onClick={() => setActiveWindow('store')}
            >
              <div className="relative group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-semibold whitespace-nowrap shadow">
                  {order.store.name}
                </div>
              </div>
            </AdvancedMarker>

            {/* Client Destination Marker */}
            <AdvancedMarker
              position={clientLoc}
              onClick={() => setActiveWindow('client')}
            >
              <div className="relative group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-semibold whitespace-nowrap shadow">
                  Client: {order.client.name}
                </div>
              </div>
            </AdvancedMarker>

            {/* Driver Rider Animated Location Marker */}
            {order.driver && (
              <AdvancedMarker
                position={driverLoc}
                onClick={() => setActiveWindow('driver')}
              >
                <div className="relative cursor-pointer">
                  <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
                  <div className="w-11 h-11 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white relative z-10">
                    {order.driver.vehicleType === 'motorcycle' ? (
                      <Bike className="w-5 h-5" />
                    ) : (
                      <Truck className="w-5 h-5" />
                    )}
                  </div>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow whitespace-nowrap">
                    {order.driver.name} ({order.estimatedMinutes}m away)
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Traffic Hotspots Heatmap Overlay Markers */}
            {showTrafficHotspots && IKEJA_TRAFFIC_HOTSPOTS.map((hs) => (
              <AdvancedMarker
                key={hs.id}
                position={{ lat: hs.lat, lng: hs.lng }}
                onClick={() => {
                  setSelectedHotspot(hs);
                  setActiveWindow('hotspot');
                }}
              >
                <div className="relative cursor-pointer group">
                  <div className="absolute -inset-3 rounded-full opacity-40 animate-ping" style={{ backgroundColor: hs.color }} />
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white relative z-10 font-bold" style={{ backgroundColor: hs.color }}>
                    <Flame className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
                    {hs.delayMins} Hotspot
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Public Transit Stop Markers Overlay */}
            {showTransitLayer && IKEJA_TRANSIT_STOPS.map((ts) => (
              <AdvancedMarker
                key={ts.id}
                position={{ lat: ts.lat, lng: ts.lng }}
                onClick={() => {
                  setSelectedTransitStop(ts);
                  setActiveWindow('transit' as any);
                }}
              >
                <div className="relative cursor-pointer group">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform">
                    🚌
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-300 text-[9px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
                    {ts.type}
                  </div>
                </div>
              </AdvancedMarker>
            ))}

            {/* Transit Stop Info Window */}
            {activeWindow === ('transit' as any) && selectedTransitStop && (
              <InfoWindow
                position={{ lat: selectedTransitStop.lat, lng: selectedTransitStop.lng }}
                onCloseClick={() => {
                  setActiveWindow(null);
                  setSelectedTransitStop(null);
                }}
              >
                <div className="p-2 text-slate-900 text-xs min-w-[200px] space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-700">
                    <span>🚌</span>
                    <span>{selectedTransitStop.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{selectedTransitStop.type} • {selectedTransitStop.line}</p>
                  <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded font-mono text-[10px] text-emerald-800 font-bold">
                    Connected Ikeja Express Transit Node
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Info Windows */}
            {activeWindow === 'driver' && order.driver && (
              <InfoWindow position={driverLoc} onCloseClick={() => setActiveWindow(null)}>
                <div className="p-2 text-slate-900 text-xs min-w-[180px]">
                  <div className="font-bold text-sm text-slate-900">{order.driver.name}</div>
                  <div className="text-slate-600 font-medium">{order.driver.vehiclePlate} • Rating ⭐ {order.driver.rating}</div>
                  <div className="mt-2 text-blue-600 font-bold">Speed: {order.driver.speedKmH} km/h</div>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={onOpenCallModal}
                      className="bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
                    >
                      <span>Call Rider</span>
                    </button>
                    <button
                      onClick={onOpenChat}
                      className="bg-slate-800 text-white px-2.5 py-1 rounded text-xs font-bold"
                    >
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Hotspot Info Window */}
            {activeWindow === 'hotspot' && selectedHotspot && (
              <InfoWindow
                position={{ lat: selectedHotspot.lat, lng: selectedHotspot.lng }}
                onCloseClick={() => {
                  setActiveWindow(null);
                  setSelectedHotspot(null);
                }}
              >
                <div className="p-2 text-slate-900 text-xs min-w-[200px] space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-600">
                    <Flame className="w-4 h-4" />
                    <span>{selectedHotspot.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">Historical Ikeja Traffic Zone</p>
                  <div className="bg-rose-50 border border-rose-200 p-1.5 rounded font-mono text-[10px] text-rose-800 font-bold flex justify-between">
                    <span>{selectedHotspot.intensity}</span>
                    <span className="text-rose-600">{selectedHotspot.delayMins} Delay</span>
                  </div>
                  <p className="text-[9px] text-slate-500 pt-0.5">
                    Proactive reroute advised via Mobolaji Bank Anthony bypass.
                  </p>
                </div>
              </InfoWindow>
            )}

          </Map>
        </APIProvider>
      ) : (
        /* Vector Canvas Stylized Fallback Map when API Key is pending */
        <InteractiveVectorFallbackMap
          order={order}
          showTrafficHotspots={showTrafficHotspots}
          showTrafficRouteOverlay={showTrafficRouteOverlay}
          onOpenCallModal={onOpenCallModal}
          onOpenChat={onOpenChat}
          onOpenKeyGuide={onOpenKeyGuide}
        />
      )}

      {/* Overlay Control: Circular Trip Progress Bar Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/95 text-white backdrop-blur-md shadow-xl rounded-2xl p-3 border border-slate-700/80 flex items-center space-x-3.5 max-w-xs sm:max-w-sm animate-fadeIn">
        {/* Circular SVG Progress Bar */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            {/* Background track */}
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Dynamic Progress Ring */}
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="currentColor"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 - (tripCompletionPct / 100) * (2 * Math.PI * 24)}
              strokeLinecap="round"
              className="text-emerald-400 transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-extrabold font-mono text-xs text-white">{tripCompletionPct}%</span>
            <span className="text-[8px] text-emerald-400 uppercase font-bold tracking-tighter">Done</span>
          </div>
        </div>

        {/* Trip Distance & ETA Metrics */}
        <div className="space-y-0.5 min-w-0 pr-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Trip Completed</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold">
              ~{order.estimatedMinutes}m ETA
            </span>
          </div>
          <p className="text-xs font-extrabold text-white truncate">
            {coveredTripDistKm.toFixed(1)} km <span className="text-slate-400 font-normal">/ {totalTripDistKm.toFixed(1)} km</span>
          </p>
          <p className="text-[10px] text-slate-300 truncate">
            {remainingTripDistKm.toFixed(1)} km remaining to destination
          </p>
        </div>
      </div>

      {/* Floating Control Panel: Map Overlays (Traffic Layers, Transit Stops, Hotspots) */}
      <div className="absolute top-4 right-4 z-20 bg-slate-900/90 text-white backdrop-blur-md shadow-xl rounded-2xl p-2 border border-slate-700/80 space-y-1.5 animate-fadeIn">
        <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-1.5 pt-0.5 flex items-center justify-between gap-3">
          <span>Map Overlays</span>
          <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">
            Google Maps API
          </span>
        </div>

        <div className="flex flex-col space-y-1">
          {/* Traffic Layer Toggle */}
          <button
            type="button"
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between space-x-2 transition-all border ${
              showTrafficLayer
                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Google Maps Real-time Traffic Layer"
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🚦</span>
              <span>Traffic Layer</span>
            </div>
            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded ${showTrafficLayer ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-400'}`}>
              {showTrafficLayer ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Public Transit Stops Toggle */}
          <button
            type="button"
            onClick={() => setShowTransitLayer(!showTransitLayer)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between space-x-2 transition-all border ${
              showTransitLayer
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Public Transit Stops & BRT Stations Overlay"
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🚌</span>
              <span>Transit Stops</span>
            </div>
            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded ${showTransitLayer ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-slate-400'}`}>
              {showTransitLayer ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Traffic Hotspots Toggle */}
          <button
            type="button"
            onClick={() => setShowTrafficHotspots(!showTrafficHotspots)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between space-x-2 transition-all border ${
              showTrafficHotspots
                ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Ikeja Congestion Hotspots Heatmap"
          >
            <div className="flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Hotspots Heatmap</span>
            </div>
            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded ${showTrafficHotspots ? 'bg-rose-800 text-white' : 'bg-slate-900 text-slate-400'}`}>
              {showTrafficHotspots ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Demand Heatmap (deck.gl) Toggle */}
          <button
            type="button"
            onClick={() => setShowDemandHeatmap(!showDemandHeatmap)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between space-x-2 transition-all border ${
              showDemandHeatmap
                ? 'bg-orange-600 text-white border-orange-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle deck.gl Real-time Order Volume Demand Heatmap"
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🔥</span>
              <span>Demand Heatmap</span>
            </div>
            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded ${showDemandHeatmap ? 'bg-orange-800 text-white' : 'bg-slate-900 text-slate-400'}`}>
              {showDemandHeatmap ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Traffic Route Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowTrafficRouteOverlay(!showTrafficRouteOverlay)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between space-x-2 transition-all border ${
              showTrafficRouteOverlay
                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Route Traffic Density Heatmap Overlay"
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🛣️</span>
              <span>Traffic Route Highlight</span>
            </div>
            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded ${showTrafficRouteOverlay ? 'bg-blue-800 text-white' : 'bg-slate-900 text-slate-400'}`}>
              {showTrafficRouteOverlay ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Action Bar on Map */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-2">
        <button
          onClick={onOpenCallModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-lg shadow-md flex items-center space-x-1.5 text-xs transition-transform active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Call Driver</span>
        </button>

        <button
          onClick={onOpenChat}
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-3.5 py-2 rounded-lg shadow-md text-xs transition-colors"
        >
          <span>Message</span>
        </button>
      </div>

    </div>
  );
};

// Interactive Vector Fallback Map Component with Professional Polish styling
const InteractiveVectorFallbackMap: React.FC<{
  order: DeliveryOrder;
  showTrafficHotspots?: boolean;
  showTrafficRouteOverlay?: boolean;
  onOpenCallModal: () => void;
  onOpenChat: () => void;
  onOpenKeyGuide: () => void;
}> = ({ order, showTrafficHotspots = true, showTrafficRouteOverlay = true, onOpenCallModal, onOpenChat, onOpenKeyGuide }) => {
  return (
    <div className="relative w-full h-full bg-[#e5e7eb] flex flex-col justify-between p-6 select-none overflow-hidden" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      
      {/* Visual Dynamic Route Line */}
      <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Main Delivery Path SVG */}
          {showTrafficRouteOverlay ? (
            <>
              {/* Segment 1: Computer Village Hotspot Area (Red/Orange density) */}
              <path
                d="M 120 180 L 320 280"
                fill="none"
                stroke="#f97316"
                strokeWidth="6"
                strokeDasharray="12"
                strokeLinecap="round"
              />
              {/* Segment 2: Free Flow Green Area */}
              <path
                d="M 320 280 L 620 180"
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeDasharray="12"
                strokeLinecap="round"
              />
            </>
          ) : (
            <path
              d="M 120 180 L 320 280 L 620 180"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeDasharray="12"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Traffic Hotspots Overlay on Vector Fallback Canvas */}
        {showTrafficHotspots && (
          <>
            {/* Computer Village Junction Hotspot */}
            <div className="absolute top-[220px] left-[210px] flex flex-col items-center pointer-events-auto cursor-pointer group">
              <div className="relative">
                <div className="absolute -inset-3 bg-red-500/40 rounded-full animate-ping" />
                <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                </div>
              </div>
              <span className="mt-1 bg-slate-900 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap">
                Computer Village (+12m)
              </span>
            </div>

            {/* Airport Rd Junction Hotspot */}
            <div className="absolute top-[210px] left-[450px] flex flex-col items-center pointer-events-auto cursor-pointer group">
              <div className="relative">
                <div className="absolute -inset-3 bg-orange-500/40 rounded-full animate-ping" />
                <div className="w-7 h-7 rounded-full bg-orange-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-200" />
                </div>
              </div>
              <span className="mt-1 bg-slate-900 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap">
                Airport Rd (+8m)
              </span>
            </div>
          </>
        )}

        {/* Store Node */}
        <div className="absolute top-[160px] left-[100px] flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
            <Store className="w-5 h-5" />
          </div>
          <span className="mt-1 bg-white text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow border border-slate-200 whitespace-nowrap">
            {order.store.name}
          </span>
        </div>

        {/* Animated Rider Node along Path */}
        <div className="absolute top-[255px] left-[300px] flex flex-col items-center z-10">
          <div className="relative">
            <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
            <div className="w-11 h-11 rounded-lg bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white relative">
              <Bike className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center space-x-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span>{order.driver?.name || 'Rider'} • {order.estimatedMinutes}m away</span>
          </div>
        </div>

        {/* Client Destination Node */}
        <div className="absolute top-[160px] right-[100px] flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="mt-1 bg-white text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow border border-slate-200 whitespace-nowrap">
            Delivery: {order.client.address}
          </span>
        </div>
      </div>

      {/* Key Guide Banner floating on fallback map */}
      <div className="relative z-10 self-center max-w-md bg-white/95 border border-slate-200 p-3 rounded-xl shadow-md flex items-center justify-between space-x-3 text-xs text-slate-700">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-blue-600 flex-shrink-0 animate-spin" />
          <div className="text-[11px]">
            <span className="font-bold text-slate-900">Vector Radar Preview</span> • Enable Google Maps Key in Secrets
          </div>
        </div>
        <button
          onClick={onOpenKeyGuide}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded text-[10px] uppercase whitespace-nowrap transition-colors"
        >
          Setup Key
        </button>
      </div>

    </div>
  );
};
