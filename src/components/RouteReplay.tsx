import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, FastForward, Gauge, Clock, MapPin, ShieldCheck, Zap, Navigation } from 'lucide-react';
import { LocationPoint } from '../types';

export interface TelemetryWaypoint {
  id: number;
  timeOffsetSec: number; // e.g. 0, 120, 240...
  timeLabel: string;     // "14:02", "14:04"...
  locationName: string;
  speedKmH: number;
  lat: number;
  lng: number;
  eventNote?: string;
}

const MOCK_TELEMETRY: TelemetryWaypoint[] = [
  { id: 1, timeOffsetSec: 0, timeLabel: '14:00', locationName: 'Ikeja City Mall (Store Pickup)', speedKmH: 0, lat: 6.6018, lng: 3.3515, eventNote: 'Pickup Confirmed' },
  { id: 2, timeOffsetSec: 90, timeLabel: '14:01', locationName: 'Obafemi Awolowo Way', speedKmH: 22, lat: 6.6005, lng: 3.3522 },
  { id: 3, timeOffsetSec: 180, timeLabel: '14:03', locationName: 'Allen Avenue Junction', speedKmH: 38, lat: 6.5980, lng: 3.3530, eventNote: 'Green Signal' },
  { id: 4, timeOffsetSec: 300, timeLabel: '14:05', locationName: 'Mobolaji Bank Anthony Way', speedKmH: 14, lat: 6.5940, lng: 3.3542, eventNote: 'Traffic Congestion' },
  { id: 5, timeOffsetSec: 420, timeLabel: '14:07', locationName: 'Toyin Street Bypass', speedKmH: 45, lat: 6.5910, lng: 3.3560, eventNote: 'Smart Detour Executed' },
  { id: 6, timeOffsetSec: 540, timeLabel: '14:09', locationName: 'Kudirat Abiola Way Expressway', speedKmH: 54, lat: 6.5870, lng: 3.3585 },
  { id: 7, timeOffsetSec: 660, timeLabel: '14:11', locationName: 'Oregun Road', speedKmH: 42, lat: 6.5830, lng: 3.3600 },
  { id: 8, timeOffsetSec: 780, timeLabel: '14:13', locationName: 'Alausa Estate Sector B', speedKmH: 25, lat: 6.5810, lng: 3.3620, eventNote: 'Neighborhood Speed Zone' },
  { id: 9, timeOffsetSec: 900, timeLabel: '14:15', locationName: 'Client Gate - 14 Alausa Drive', speedKmH: 0, lat: 6.5800, lng: 3.3630, eventNote: 'Arrived & Handed Off' },
];

export const RouteReplay: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x

  const activeWaypoint = MOCK_TELEMETRY[currentIndex];

  // Auto-replay timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= MOCK_TELEMETRY.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Render D3 Speed Variation Line Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear existing SVG children
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 500;
    const height = 180;
    const margin = { top: 20, right: 30, bottom: 35, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(MOCK_TELEMETRY, (d) => d.timeOffsetSec) || 900])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, (d3.max(MOCK_TELEMETRY, (d) => d.speedKmH) || 60) + 10])
      .range([innerHeight, 0]);

    // Gradient definitions for speed profile area
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'speed-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.5);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.0);

    // Area Generator
    const area = d3
      .area<TelemetryWaypoint>()
      .x((d) => xScale(d.timeOffsetSec))
      .y0(innerHeight)
      .y1((d) => yScale(d.speedKmH))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const line = d3
      .line<TelemetryWaypoint>()
      .x((d) => xScale(d.timeOffsetSec))
      .y((d) => yScale(d.speedKmH))
      .curve(d3.curveMonotoneX);

    // Append Area
    g.append('path')
      .datum(MOCK_TELEMETRY)
      .attr('fill', 'url(#speed-gradient)')
      .attr('d', area);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(4)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((d) => {
      const mins = Math.floor(Number(d) / 60);
      return `+${mins}m`;
    });

    const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat((d) => `${d}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '10px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '10px');

    // Draw Speed Path Line
    g.append('path')
      .datum(MOCK_TELEMETRY)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Waypoint dots
    g.selectAll('.dot')
      .data(MOCK_TELEMETRY)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.timeOffsetSec))
      .attr('cy', (d) => yScale(d.speedKmH))
      .attr('r', (d, i) => (i === currentIndex ? 7 : 4))
      .attr('fill', (d, i) => {
        if (i === currentIndex) return '#10b981';
        if (d.speedKmH === 0) return '#ef4444';
        if (d.speedKmH < 20) return '#f59e0b';
        return '#3b82f6';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', (d, i) => (i === currentIndex ? 3 : 1.5))
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const idx = MOCK_TELEMETRY.findIndex((item) => item.id === d.id);
        if (idx !== -1) setCurrentIndex(idx);
      });

    // Active Scrubber Vertical Line
    const activeX = xScale(activeWaypoint.timeOffsetSec);
    g.append('line')
      .attr('x1', activeX)
      .attr('x2', activeX)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 4');

    // Active tooltip text above scrubber
    g.append('text')
      .attr('x', activeX)
      .attr('y', yScale(activeWaypoint.speedKmH) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#10b981')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text(`${activeWaypoint.speedKmH} km/h`);

  }, [currentIndex, activeWaypoint]);

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Route Speed & Telemetry Replay (D3)</h3>
            <p className="text-xs text-slate-500">Analyze real-time GPS speed curves and detour efficiency throughout the shift.</p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsPlaying(false);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
              isPlaying ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Replay Trip</span>
              </>
            )}
          </button>

          {/* Speed Multiplier */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  playbackSpeed === spd ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* D3 Graph Canvas */}
      <div ref={containerRef} className="w-full relative bg-slate-50 p-2 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-2 pt-1">
          <span>SPEED PROFILE (KM/H)</span>
          <span className="text-emerald-600 font-mono">D3.JS GRAPH RENDER</span>
        </div>
        <svg ref={svgRef} className="w-full overflow-visible"></svg>
      </div>

      {/* Interactive Time Scrubber Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Trip Scrubber: {activeWaypoint.timeLabel}</span>
          <span>{currentIndex + 1} of {MOCK_TELEMETRY.length} Waypoints</span>
        </div>
        <input
          type="range"
          min={0}
          max={MOCK_TELEMETRY.length - 1}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Active Telemetry Waypoint Readout Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Current Waypoint</span>
            <span className="text-xs font-bold text-white truncate block">{activeWaypoint.locationName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Gauge className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Recorded Telemetry Speed</span>
            <span className="text-sm font-extrabold font-mono text-amber-300">{activeWaypoint.speedKmH} km/h</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Route Status</span>
            <span className="text-xs font-semibold text-emerald-300">
              {activeWaypoint.eventNote || 'Cruise Speed Normal'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
