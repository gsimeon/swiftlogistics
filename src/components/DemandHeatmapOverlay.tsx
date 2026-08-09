import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  MapPin, 
  TrendingUp, 
  Users, 
  Package, 
  Layers, 
  Eye, 
  Navigation, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { soundService } from '../services/soundService';
import { MOCK_HISTORY_ORDERS } from '../data/mockData';

interface HeatmapZone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  orderDensity: 'Extreme' | 'High' | 'Moderate' | 'Low';
  activeOrders: number;
  availableDrivers: number;
  surgeMultiplier: number; // e.g. 1.8x
  topCategory: string;
  predictedSurgeNextHour: string;
}

interface DemandHeatmapOverlayProps {
  apiKey?: string;
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
      radiusPixels: 50,
      intensity: 1.8,
      threshold: 0.02,
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
const getHeatmapPoints = (historyOrders: typeof MOCK_HISTORY_ORDERS = []) => {
  const basePoints = [
    { lat: 6.5925, lng: 3.3421, weight: 12 }, // Computer Village
    { lat: 6.5928, lng: 3.3425, weight: 10 },
    { lat: 6.5932, lng: 3.3418, weight: 11 },
    { lat: 6.5862, lng: 3.3582, weight: 9 },  // Ikeja GRA
    { lat: 6.5855, lng: 3.3575, weight: 8 },
    { lat: 6.6011, lng: 3.3514, weight: 8 },  // Allen Avenue
    { lat: 6.6018, lng: 3.3512, weight: 7 },
    { lat: 6.5980, lng: 3.3601, weight: 6 },  // Opebi Road
    { lat: 6.5702, lng: 3.3675, weight: 10 }, // Maryland Mall
    { lat: 6.5705, lng: 3.3680, weight: 9 },
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

export const DemandHeatmapOverlay: React.FC<DemandHeatmapOverlayProps> = ({ apiKey = '' }) => {
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<HeatmapZone | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'extreme' | 'surge'>('all');
  const hasKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY' && apiKey.length > 5;

  const ikejaZones: HeatmapZone[] = [
    {
      id: 'hz-1',
      name: 'Computer Village (Otigba St)',
      coordinates: { lat: 6.5925, lng: 3.3421 },
      orderDensity: 'Extreme',
      activeOrders: 48,
      availableDrivers: 6,
      surgeMultiplier: 1.8,
      topCategory: 'Electronics & Accessories',
      predictedSurgeNextHour: '2.1x Surge Expected at 2:00 PM',
    },
    {
      id: 'hz-2',
      name: 'Ikeja GRA (Isaac John Corridor)',
      coordinates: { lat: 6.5862, lng: 3.3582 },
      orderDensity: 'High',
      activeOrders: 32,
      availableDrivers: 9,
      surgeMultiplier: 1.5,
      topCategory: 'Gourmet Food & Pastries',
      predictedSurgeNextHour: 'Steady 1.5x until 3:30 PM',
    },
    {
      id: 'hz-3',
      name: 'Allen Avenue Commercial Hub',
      coordinates: { lat: 6.6011, lng: 3.3514 },
      orderDensity: 'High',
      activeOrders: 27,
      availableDrivers: 8,
      surgeMultiplier: 1.4,
      topCategory: 'Corporate Documents & Gifts',
      predictedSurgeNextHour: 'Peak expected during evening rush',
    },
    {
      id: 'hz-4',
      name: 'Opebi Road Shopping Belt',
      coordinates: { lat: 6.5980, lng: 3.3601 },
      orderDensity: 'Moderate',
      activeOrders: 18,
      availableDrivers: 11,
      surgeMultiplier: 1.2,
      topCategory: 'Fashion & Boutique Retailing',
      predictedSurgeNextHour: 'Normal demand volume',
    },
    {
      id: 'hz-5',
      name: 'Maryland Mall Express Hub',
      coordinates: { lat: 6.5702, lng: 3.3675 },
      orderDensity: 'Extreme',
      activeOrders: 41,
      availableDrivers: 5,
      surgeMultiplier: 1.7,
      topCategory: 'Supermarket Groceries & Fast Food',
      predictedSurgeNextHour: '1.9x Surge Expected at 1:30 PM',
    },
  ];

  const filteredZones = ikejaZones.filter((z) => {
    if (filterType === 'extreme') return z.orderDensity === 'Extreme';
    if (filterType === 'surge') return z.surgeMultiplier >= 1.5;
    return true;
  });

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'Extreme': return 'bg-red-500 text-white border-red-600 shadow-red-500/50';
      case 'High': return 'bg-orange-500 text-white border-orange-600 shadow-orange-500/50';
      case 'Moderate': return 'bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/50';
      default: return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-tr from-rose-600 to-orange-500 text-white rounded-xl shadow-md">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center space-x-2">
              <span>Ikeja Order Demand Heatmap Overlay</span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time spatial order density & surge prediction for fleet optimization
            </p>
          </div>
        </div>

        {/* Heatmap Toggle & Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setShowHeatmap(!showHeatmap);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 border transition-all ${
              showHeatmap
                ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Heatmap Overlay On' : 'Overlay Off'}</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              All Zones
            </button>
            <button
              onClick={() => setFilterType('extreme')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${filterType === 'extreme' ? 'bg-red-500 text-white' : 'text-slate-400'}`}
            >
              Extreme
            </button>
            <button
              onClick={() => setFilterType('surge')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${filterType === 'surge' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
            >
              Surge ≥1.5x
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Visual Map Representation */}
      {hasKey ? (
        <div className="relative w-full h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between">
          <APIProvider apiKey={apiKey} version="weekly">
            <Map
              defaultCenter={{ lat: 6.5928, lng: 3.3421 }}
              defaultZoom={13}
              mapId="LOGIPULSE_DISPATCH_MAP_ID"
              colorScheme="DARK"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              disableDefaultUI={false}
              zoomControl={true}
            >
              {showHeatmap && (
                <GoogleMapsHeatmap data={getHeatmapPoints(MOCK_HISTORY_ORDERS)} />
              )}
            </Map>
          </APIProvider>

          {/* Map Header Status Bar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-xs bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-md">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Ikeja Dispatch Grid: {MOCK_HISTORY_ORDERS.length + 166} Total Active/Historical Orders</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              ● Live Demand Sync Active
            </span>
          </div>

          {/* Quick Zone Pins Overlay on Real Google Map */}
          <div className="absolute top-20 left-4 z-10 flex flex-wrap gap-1 max-w-[90%]">
            {filteredZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    soundService.playNotification();
                    setSelectedZone(zone);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all text-[11px] font-bold ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-white ring-2 ring-amber-300 shadow-md'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 shadow'
                  }`}
                >
                  {zone.name.split(' ')[0]}: {zone.surgeMultiplier}x
                </button>
              );
            })}
          </div>

          {/* Map Legend Footer */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>Extreme (&gt;40 orders)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>High (25-40 orders)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Moderate (&lt;25 orders)</span>
              </span>
            </div>
            <span className="font-mono text-amber-400 font-bold">Avg Surge: 1.52x</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4">
          
          {/* Dark Map Canvas Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          {/* Heatmap Gradient Glow Circles */}
          {showHeatmap && (
            <>
              {/* Computer Village Pulse */}
              <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-red-600/30 rounded-full filter blur-xl animate-pulse pointer-events-none"></div>
              {/* Ikeja GRA Pulse */}
              <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-orange-500/25 rounded-full filter blur-xl pointer-events-none"></div>
              {/* Maryland Mall Pulse */}
              <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-red-500/30 rounded-full filter blur-2xl animate-pulse pointer-events-none"></div>
            </>
          )}

          {/* Map Header Status Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Ikeja Dispatch Grid: 166 Total Live Orders</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              ● Live Demand Sync Active
            </span>
          </div>

          {/* Interactive Zone Pins */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 my-auto">
            {filteredZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    soundService.playNotification();
                    setSelectedZone(zone);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-white ring-2 ring-amber-300 scale-105 shadow-lg'
                      : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${getDensityColor(zone.orderDensity)}`}>
                      {zone.surgeMultiplier}x Surge
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{zone.activeOrders} ord</span>
                  </div>

                  <div className="font-extrabold text-xs truncate mt-1.5">{zone.name.split(' ')[0]}</div>
                  <div className="text-[9px] opacity-80 truncate">{zone.topCategory}</div>
                </button>
              );
            })}
          </div>

          {/* Map Legend Footer */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Extreme (&gt;40 orders)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>High (25-40 orders)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Moderate (&lt;25 orders)</span>
              </span>
            </div>

            <span className="font-mono text-amber-400 font-bold">Avg Surge: 1.52x</span>
          </div>

        </div>
      )}

      {/* Selected Zone Deep Dive Panel */}
      {selectedZone && (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-3 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h4 className="font-extrabold text-sm text-white">{selectedZone.name}</h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${getDensityColor(selectedZone.orderDensity)}`}>
              {selectedZone.orderDensity} Demand ({selectedZone.surgeMultiplier}x Pricing)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Active Orders</span>
              <span className="font-mono font-extrabold text-sm text-amber-300">{selectedZone.activeOrders} pending</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Drivers Nearby</span>
              <span className="font-mono font-extrabold text-sm text-blue-300">{selectedZone.availableDrivers} riders</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Top Product Category</span>
              <span className="font-semibold text-xs text-slate-200 truncate block">{selectedZone.topCategory}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Surge Forecast</span>
              <span className="font-semibold text-xs text-emerald-400 truncate block">{selectedZone.predictedSurgeNextHour}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
