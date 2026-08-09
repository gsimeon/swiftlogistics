import React, { useState } from 'react';
import { 
  calculateOptimalDeliverySequence, 
  calculateHaversineDistanceKm,
  MOCK_MULTI_STOPS, 
  DeliveryStop, 
  OptimizationResult 
} from '../utils/deliveryOptimizer';
import { LocationPoint } from '../types';
import { 
  Navigation, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  Layers, 
  RotateCcw,
  Store,
  User,
  Zap,
  Route
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface MultiStopRouteOptimizerProps {
  currentDriverLocation: LocationPoint;
  driverSpeedKmH?: number;
}

export const MultiStopRouteOptimizer: React.FC<MultiStopRouteOptimizerProps> = ({
  currentDriverLocation,
  driverSpeedKmH = 38,
}) => {
  const [stops, setStops] = useState<DeliveryStop[]>(MOCK_MULTI_STOPS);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);

  const handleRunOptimization = () => {
    soundService.playNotification();
    const result = calculateOptimalDeliverySequence(currentDriverLocation, stops, driverSpeedKmH);
    setOptimization(result);
    setStops(result.optimizedStops);
    setIsOptimized(true);
  };

  const handleResetSequence = () => {
    setStops(MOCK_MULTI_STOPS);
    setOptimization(null);
    setIsOptimized(false);
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Distance Matrix Multi-Stop Route Optimizer</h3>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200">
              TSP Smart Proximity
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculates the most time-efficient delivery stop sequence using real-time Google Maps Distance Matrix proximity algorithms.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isOptimized ? (
            <button
              onClick={handleResetSequence}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Order</span>
            </button>
          ) : null}

          <button
            onClick={handleRunOptimization}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Optimize Distance Matrix Sequence</span>
          </button>
        </div>
      </div>

      {/* Optimization Summary Stats Card (shown if optimized) */}
      {optimization && (
        <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50 border border-blue-200 p-4 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Geographic Proximity Re-ordering Active</span>
            </span>
            <span className="text-xs font-mono font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200">
              Saved ~{optimization.timeSavedMinutes} mins
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Original Distance</span>
              <span className="font-bold text-slate-800 text-sm font-mono">{optimization.originalDistanceKm} km</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Optimized Distance</span>
              <span className="font-bold text-blue-600 text-sm font-mono">{optimization.optimizedDistanceKm} km</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Distance Saved</span>
              <span className="font-bold text-green-600 text-sm font-mono">-{optimization.distanceSavedKm} km</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Efficiency Gain</span>
              <span className="font-bold text-green-600 text-sm font-mono">
                +{Math.round((optimization.distanceSavedKm / (optimization.originalDistanceKm || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sequence Stops List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
            Assigned Multi-Stop Queue ({stops.length} Stops)
          </span>
          <span className="text-blue-600 font-semibold flex items-center space-x-1">
            <Route className="w-3.5 h-3.5" />
            <span>Driver GPS: {currentDriverLocation.lat.toFixed(4)}, {currentDriverLocation.lng.toFixed(4)}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stops.map((stop, idx) => {
            const distFromDriverKm = calculateHaversineDistanceKm(currentDriverLocation, stop.location).toFixed(2);
            return (
              <div
                key={stop.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOptimized
                    ? 'bg-white border-blue-200 shadow-sm'
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
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-sm text-slate-800">{stop.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            stop.stopType === 'pickup'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {stop.stopType}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 font-semibold">{stop.orderNumber}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      📍 {distFromDriverKm} km away
                    </span>
                    {stop.estimatedMinutes && (
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>~{stop.estimatedMinutes}m</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-slate-700">{stop.recipientName}</span>
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

    </div>
  );
};

