import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Compass, 
  Store, 
  MapPin, 
  Bike, 
  Truck, 
  Gauge, 
  Clock, 
  Navigation,
  Activity,
  Maximize2
} from 'lucide-react';
import { DeliveryOrder, LocationPoint } from '../types';

interface RouteReplayModalProps {
  order: DeliveryOrder;
  onClose: () => void;
}

export const RouteReplayModal: React.FC<RouteReplayModalProps> = ({ order, onClose }) => {
  // Use routeCoordinates if they exist; otherwise interpolate standard points
  const rawCoordinates = order.routeCoordinates && order.routeCoordinates.length > 0 
    ? order.routeCoordinates 
    : [
        { lat: 6.5928, lng: 3.3421 }, // Store
        { lat: 6.5900, lng: 3.3460 },
        { lat: 6.5875, lng: 3.3495 },
        { lat: 6.5850, lng: 3.3530 },
        { lat: 6.5838, lng: 3.3550 },
        { lat: 6.5822, lng: 3.3572 }  // Client
      ];

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const tick = (now: number) => {
        if (lastTimeRef.current !== null) {
          const delta = now - lastTimeRef.current;
          // Progress speed: 100% in 10 seconds at 1x speed
          const increment = (delta / 10000) * 100 * playbackSpeed;
          setProgress((prev) => {
            const next = prev + increment;
            if (next >= 100) {
              setIsPlaying(false);
              return 100;
            }
            return next;
          });
        }
        lastTimeRef.current = now;
        animationRef.current = requestAnimationFrame(tick);
      };
      animationRef.current = requestAnimationFrame(tick);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  // Interpolate coordinate at the current progress percentage
  const getInterpolatedCoordinate = (prog: number): LocationPoint => {
    if (rawCoordinates.length === 0) return { lat: 6.5928, lng: 3.3421 };
    if (rawCoordinates.length === 1) return rawCoordinates[0];
    
    const floatIndex = (prog / 100) * (rawCoordinates.length - 1);
    const index = Math.floor(floatIndex);
    const fraction = floatIndex - index;

    if (index >= rawCoordinates.length - 1) {
      return rawCoordinates[rawCoordinates.length - 1];
    }

    const p1 = rawCoordinates[index];
    const p2 = rawCoordinates[index + 1];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * fraction,
      lng: p1.lng + (p2.lng - p1.lng) * fraction
    };
  };

  const currentCoordinate = getInterpolatedCoordinate(progress);

  // Generate simple SVG coordinates mapping for visualization (fit in 500x300 box)
  const mapCoordinatesToSvg = (coords: LocationPoint[]) => {
    if (coords.length === 0) return [];
    
    // Find bounds
    const lats = coords.map(c => c.lat);
    const lngs = coords.map(c => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    // Map to 50px to 450px on X, and 50px to 250px on Y (inverted because Y is down)
    return coords.map(c => {
      const x = 50 + ((c.lng - minLng) / lngRange) * 400;
      const y = 250 - ((c.lat - minLat) / latRange) * 200;
      return { x, y };
    });
  };

  const svgPoints = mapCoordinatesToSvg(rawCoordinates);
  
  // Interpolate current point in SVG space
  const getCurrentSvgPoint = () => {
    if (svgPoints.length === 0) return { x: 250, y: 150 };
    if (svgPoints.length === 1) return svgPoints[0];

    const floatIndex = (progress / 100) * (svgPoints.length - 1);
    const index = Math.floor(floatIndex);
    const fraction = floatIndex - index;

    if (index >= svgPoints.length - 1) {
      return svgPoints[svgPoints.length - 1];
    }

    const p1 = svgPoints[index];
    const p2 = svgPoints[index + 1];

    return {
      x: p1.x + (p2.x - p1.x) * fraction,
      y: p1.y + (p2.y - p1.y) * fraction
    };
  };

  const currentSvgPoint = getCurrentSvgPoint();

  // Create path description for SVG polyline
  const pathD = svgPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  // Determine transit segment info text
  const getSegmentInfo = () => {
    if (progress < 15) return 'Leaving Store Branch Counter';
    if (progress < 45) return 'Navigating Local Express Junctions';
    if (progress < 80) return 'Approaching Recipient Neighborhood Outer Ring';
    if (progress < 98) return 'Final Street Approach & Security Gates';
    return 'Arrived at Destination Point';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-fadeIn" id="route-replay-modal-overlay">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Route Telemetry Replay</h3>
              <p className="text-xs text-slate-400 font-mono">Order #{order.orderNumber} • {order.driver?.name || 'Courier'}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Close Replay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Stage / Visual Canvas */}
        <div className="p-4 sm:p-6 bg-slate-950/40 flex-1 flex flex-col justify-between space-y-6 relative overflow-hidden">
          
          {/* Telemetry HUD top bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                <Compass className="w-3 h-3 text-blue-400" />
                <span>Current Coordinates</span>
              </span>
              <span className="font-mono text-xs font-bold text-white block truncate">
                {currentCoordinate.lat.toFixed(5)}, {currentCoordinate.lng.toFixed(5)}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                <Gauge className="w-3 h-3 text-emerald-400" />
                <span>Simulated Transit Speed</span>
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400 block">
                {progress === 0 || progress === 100 ? '0' : Math.round(30 + Math.sin(progress / 10) * 12)} km/h
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>Elapsed Duration</span>
              </span>
              <span className="font-mono text-xs font-bold text-purple-400 block">
                {Math.floor((progress / 100) * (order.performanceMetrics?.actualDurationMinutes || 18))}:{String(Math.floor(((progress / 100) * (order.performanceMetrics?.actualDurationMinutes || 18) % 1) * 60)).padStart(2, '0')} mins
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>Telemetry Status</span>
              </span>
              <span className="font-mono text-xs font-bold text-amber-400 block truncate">
                {getSegmentInfo()}
              </span>
            </div>
          </div>

          {/* SVG Canvas Map */}
          <div className="w-full h-64 sm:h-80 bg-slate-950 rounded-2xl border border-slate-800 relative shadow-inner overflow-hidden flex items-center justify-center">
            
            {/* Grid background styling */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Dynamic radar rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-blue-500/5 rounded-full pointer-events-none animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/10 rounded-full pointer-events-none"></div>

            <svg className="w-full h-full absolute inset-0 z-10 overflow-visible" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
              
              {/* Pulsing Target Ring at Store */}
              {svgPoints.length > 0 && (
                <circle 
                  cx={svgPoints[0].x} 
                  cy={svgPoints[0].y} 
                  r="12" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  className="animate-ping opacity-25"
                />
              )}

              {/* Pulsing Target Ring at Destination */}
              {svgPoints.length > 0 && (
                <circle 
                  cx={svgPoints[svgPoints.length - 1].x} 
                  cy={svgPoints[svgPoints.length - 1].y} 
                  r="12" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2" 
                  className="animate-ping opacity-25"
                />
              )}

              {/* Draw polyline under route */}
              <path
                d={pathD}
                fill="none"
                stroke="#334155"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Draw animated progress polyline */}
              {progress > 0 && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="500"
                  strokeDashoffset={500 - (progress / 100) * 500}
                  className="transition-all duration-100 ease-linear"
                />
              )}

              {/* Render Store point */}
              {svgPoints.length > 0 && (
                <g transform={`translate(${svgPoints[0].x}, ${svgPoints[0].y})`}>
                  <circle r="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                  <foreignObject x="-6" y="-6" width="12" height="12">
                    <Store className="w-3 h-3 text-blue-400" />
                  </foreignObject>
                </g>
              )}

              {/* Render Destination point */}
              {svgPoints.length > 0 && (
                <g transform={`translate(${svgPoints[svgPoints.length - 1].x}, ${svgPoints[svgPoints.length - 1].y})`}>
                  <circle r="10" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                  <foreignObject x="-6" y="-6" width="12" height="12">
                    <MapPin className="w-3 h-3 text-red-400" />
                  </foreignObject>
                </g>
              )}

              {/* Animated Rider icon along path */}
              <g transform={`translate(${currentSvgPoint.x}, ${currentSvgPoint.y})`}>
                <circle r="14" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="shadow-lg" />
                <foreignObject x="-8" y="-8" width="16" height="16">
                  {order.driver?.vehicleType === 'motorcycle' ? (
                    <Bike className="w-4 h-4 text-white" />
                  ) : (
                    <Truck className="w-4 h-4 text-white" />
                  )}
                </foreignObject>
              </g>

            </svg>

            {/* Labels overlay */}
            {svgPoints.length > 0 && (
              <>
                <div 
                  className="absolute text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded shadow pointer-events-none"
                  style={{ 
                    left: `${(svgPoints[0].x / 500) * 100}%`, 
                    top: `${(svgPoints[0].y / 300) * 100 - 10}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  {order.store.name}
                </div>
                
                <div 
                  className="absolute text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded shadow pointer-events-none"
                  style={{ 
                    left: `${(svgPoints[svgPoints.length - 1].x / 500) * 100}%`, 
                    top: `${(svgPoints[svgPoints.length - 1].y / 300) * 100 - 10}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  {order.client.name}
                </div>
              </>
            )}

            {/* Float badge explaining route replay */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 font-semibold z-10">
              Interactive Path Vectors derived from closed Escrow GPS Logs
            </div>
          </div>

          {/* Bottom Timeline, Playback Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 z-10">
            <div className="flex items-center space-x-3">
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-xl flex items-center justify-center shadow transition-transform active:scale-95 ${
                  isPlaying ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
                title={isPlaying ? 'Pause Replay' : 'Start Replay'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
                title="Reset Timeline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Progress Slider */}
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => {
                    setProgress(parseFloat(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="font-mono text-[11px] text-slate-400 font-bold w-10 text-right">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Speed Switchers */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                {([1, 2, 4] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      playbackSpeed === speed 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

            </div>

            {/* Step Milestones Progress Bar indicator */}
            <div className="grid grid-cols-5 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-center gap-1">
              <div className={progress >= 0 ? 'text-blue-400' : ''}>Store</div>
              <div className={progress >= 25 ? 'text-blue-400' : ''}>Transit</div>
              <div className={progress >= 50 ? 'text-blue-400' : ''}>Midpoint</div>
              <div className={progress >= 75 ? 'text-blue-400' : ''}>Perimeter</div>
              <div className={progress >= 100 ? 'text-red-400' : ''}>Delivered</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
