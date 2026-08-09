import React, { useState } from 'react';
import { 
  calculateOptimalDeliverySequence, 
  calculateHaversineDistanceKm,
  MOCK_MULTI_STOPS, 
  DeliveryStop, 
  OptimizationResult 
} from '../utils/deliveryOptimizer';
import { Store, Driver, DeliveryOrder } from '../types';
import { 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Zap, 
  Route, 
  Send, 
  User, 
  Truck, 
  ArrowRight,
  TrendingDown,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface StoreStopOptimizerProps {
  store: Store;
  assignedDriver: Driver;
  onDispatchBatchOrder?: (batchOrder: DeliveryOrder) => void;
  onSwitchToClientView?: () => void;
}

export const StoreStopOptimizer: React.FC<StoreStopOptimizerProps> = ({
  store,
  assignedDriver,
  onDispatchBatchOrder,
  onSwitchToClientView,
}) => {
  const [stops, setStops] = useState<DeliveryStop[]>(MOCK_MULTI_STOPS);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [routeUpdatedNotification, setRouteUpdatedNotification] = useState<string | null>(null);

  const handleRunDistanceMatrixOptimizer = () => {
    soundService.playNotification();
    setIsOptimizing(true);
    setRouteUpdatedNotification(null);

    // Simulate Google Distance Matrix API call latency
    setTimeout(() => {
      const result = calculateOptimalDeliverySequence(store.location, stops, assignedDriver.speedKmH || 38);
      setOptimization(result);
      setStops(result.optimizedStops);
      setIsOptimizing(false);
      setIsOptimized(true);

      const successMsg = `⚡ Google Distance Matrix API: Recalculated optimal route sequence for ${assignedDriver.name}! Route updated automatically (${result.distanceSavedKm} km saved).`;
      setRouteUpdatedNotification(successMsg);
      soundService.playMessagePop();
    }, 1200);
  };

  const handleResetSequence = () => {
    soundService.playNotification();
    setStops(MOCK_MULTI_STOPS);
    setOptimization(null);
    setIsOptimized(false);
    setRouteUpdatedNotification(null);
  };

  const handleDispatchOptimizedBatch = () => {
    if (onDispatchBatchOrder) {
      soundService.playNotification();
      
      const batchOrder: DeliveryOrder = {
        id: `ord-batch-${Date.now()}`,
        orderNumber: `LP-BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        client: {
          id: 'c-batch',
          name: stops[0]?.recipientName || 'Batch Delivery Recipient',
          phone: '+234 803 301 4492',
          address: stops[0]?.address || 'Multiple Locations Ikeja',
          location: stops[0]?.location || store.location,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        store: store,
        driver: assignedDriver,
        items: stops.map((s, idx) => ({
          id: `item-batch-${idx}`,
          name: s.title,
          quantity: 1,
          price: 25.00,
        })),
        subtotal: 100.00,
        deliveryFee: 15.00,
        tip: 5.00,
        total: 120.00,
        status: 'driver_assigned',
        createdAt: new Date().toISOString(),
        estimatedMinutes: optimization ? 25 - optimization.timeSavedMinutes : 25,
        pickupOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
        deliveryPin: `${Math.floor(1000 + Math.random() * 9000)}`,
        routeCoordinates: stops.map((s) => s.location),
        currentDriverLocation: store.location,
        paymentStatus: 'held_in_escrow',
        paymentMethod: 'credit_card',
        notes: `Optimized Batch Delivery (${stops.length} stops). Automatic route sequence applied.`,
      };

      onDispatchBatchOrder(batchOrder);
      if (onSwitchToClientView) {
        onSwitchToClientView();
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Stop Optimizer Tool (Google Distance Matrix API)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate the most efficient batch delivery path and automatically update the assigned driver's route sequence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOptimized && (
            <button
              onClick={handleResetSequence}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Sequence</span>
            </button>
          )}

          <button
            onClick={handleRunDistanceMatrixOptimizer}
            disabled={isOptimizing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Zap className={`w-4 h-4 fill-white ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Querying Distance Matrix...' : 'Optimize Driver Route Sequence'}</span>
          </button>
        </div>
      </div>

      {/* Route Updated Toast Notification */}
      {routeUpdatedNotification && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-bounce" />
            <span className="font-semibold">{routeUpdatedNotification}</span>
          </div>
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Synced To Driver
          </span>
        </div>
      )}

      {/* Driver & Store Context Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <img
            src={assignedDriver.avatar}
            alt={assignedDriver.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Assigned Rider</span>
            <div className="font-bold text-slate-800">{assignedDriver.name} ({assignedDriver.vehicleType.toUpperCase()})</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-600">
          <Route className="w-4 h-4 text-blue-600" />
          <span>Dispatch Hub: <strong>{store.name}</strong> ({store.address})</span>
        </div>
      </div>

      {/* Optimization Performance Stats Card */}
      {optimization && (
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm text-emerald-300">Google Distance Matrix Route Optimized!</span>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
              +{Math.round((optimization.distanceSavedKm / (optimization.originalDistanceKm || 1)) * 100)}% Route Efficiency
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Raw Sequence</span>
              <span className="font-mono font-bold text-base text-slate-200">{optimization.originalDistanceKm} km</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Optimized Path</span>
              <span className="font-mono font-bold text-base text-blue-300">{optimization.optimizedDistanceKm} km</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Distance Saved</span>
              <span className="font-mono font-bold text-base text-emerald-400">-{optimization.distanceSavedKm} km</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Time Saved</span>
              <span className="font-mono font-bold text-base text-emerald-400">-{optimization.timeSavedMinutes} mins</span>
            </div>
          </div>
        </div>
      )}

      {/* Sequence List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
            Batch Delivery Stops Queue ({stops.length} Stops)
          </span>
          <span className="text-blue-600 font-semibold">
            {isOptimized ? '✨ Reordered by TSP Distance Matrix' : 'Standard Chronological Queue'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stops.map((stop, idx) => {
            const distFromHub = calculateHaversineDistanceKm(store.location, stop.location).toFixed(2);
            return (
              <div
                key={stop.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOptimized
                    ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isOptimized
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-800">{stop.title}</div>
                      <span className="font-mono text-[11px] text-slate-400">{stop.orderNumber}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    📍 {distFromHub} km from store
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1 text-xs">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{stop.recipientName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{stop.address}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Automatic rider synchronization enabled</span>
        </div>

        <button
          onClick={handleDispatchOptimizedBatch}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center space-x-2 transition-transform active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch Batch Orders with Optimized Sequence</span>
        </button>
      </div>

    </div>
  );
};
