import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { BarChart2, Clock, Info, RefreshCw } from 'lucide-react';

interface PerformanceData {
  day: string;
  orderVolume: number;
  avgCompletionTime: number; // in minutes
}

const MOCK_PERFORMANCE_DATA: PerformanceData[] = [
  { day: 'Mon', orderVolume: 34, avgCompletionTime: 28 },
  { day: 'Tue', orderVolume: 42, avgCompletionTime: 24 },
  { day: 'Wed', orderVolume: 51, avgCompletionTime: 31 },
  { day: 'Thu', orderVolume: 38, avgCompletionTime: 22 },
  { day: 'Fri', orderVolume: 65, avgCompletionTime: 35 },
  { day: 'Sat', orderVolume: 88, avgCompletionTime: 41 },
  { day: 'Sun', orderVolume: 58, avgCompletionTime: 29 },
];

export const FleetPerformanceChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<PerformanceData[]>(MOCK_PERFORMANCE_DATA);
  const [hoveredData, setHoveredData] = useState<PerformanceData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleRefresh = () => {
    // Generate slight random variations to simulate live sync
    const varied = MOCK_PERFORMANCE_DATA.map(d => ({
      ...d,
      orderVolume: Math.max(10, d.orderVolume + Math.floor(Math.random() * 11) - 5),
      avgCompletionTime: Math.max(15, d.avgCompletionTime + Math.floor(Math.random() * 9) - 4)
    }));
    setData(varied);
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Standard responsive sizing
    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 400;
    const margin = { top: 40, right: 60, bottom: 50, left: 60 };
    const width = containerWidth;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // X-Scale (Days)
    const x = d3.scaleBand()
      .domain(data.map((d: PerformanceData) => d.day))
      .range([margin.left, width - margin.right])
      .padding(0.35);

    // Left Y-Scale (Order Volume)
    const yLeft = d3.scaleLinear()
      .domain([0, (d3.max(data, (d: PerformanceData) => d.orderVolume) || 100) * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Right Y-Scale (Avg Completion Time in mins)
    const yRight = d3.scaleLinear()
      .domain([0, (d3.max(data, (d: PerformanceData) => d.avgCompletionTime) || 60) * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines for Order Volume axis
    const yGrid = d3.axisLeft(yLeft)
      .ticks(6)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat(() => '');

    svg.append('g')
      .attr('class', 'text-slate-200/20 dark:text-slate-800/20')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yGrid)
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', 'currentColor').attr('stroke-dasharray', '3,3'));

    // X-Axis Group
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(6))
      .call(g => g.select('.domain').attr('stroke', '#94a3b8').attr('stroke-width', '1.5'))
      .call(g => g.selectAll('.tick text')
        .attr('class', 'text-slate-600 dark:text-slate-400 font-bold text-[11px]')
        .attr('dy', '10px'));

    // Left Y-Axis Group (Volume)
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yLeft).ticks(6))
      .call(g => g.select('.domain').attr('stroke', '#3b82f6').attr('stroke-width', '1.5'))
      .call(g => g.selectAll('.tick text')
        .attr('class', 'text-blue-600 dark:text-blue-400 font-bold text-[11px]'));

    // Right Y-Axis Group (Time)
    svg.append('g')
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yRight).ticks(6))
      .call(g => g.select('.domain').attr('stroke', '#10b981').attr('stroke-width', '1.5'))
      .call(g => g.selectAll('.tick text')
        .attr('class', 'text-emerald-600 dark:text-emerald-400 font-bold text-[11px]'));

    // Volume Bars (Render first so line lies on top)
    const barGroup = svg.append('g')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.day) || 0)
      .attr('y', height - margin.bottom) // start animation from bottom
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('rx', 6)
      .attr('class', 'fill-blue-500/80 dark:fill-blue-600/75 hover:fill-blue-500 dark:hover:fill-blue-500 transition-all cursor-pointer')
      .on('mouseenter', (event, d: any) => {
        setHoveredData(d);
        const [mx, my] = d3.pointer(event);
        setTooltipPos({ x: mx, y: my });
      })
      .on('mousemove', (event) => {
        const [mx, my] = d3.pointer(event);
        setTooltipPos({ x: mx, y: my });
      })
      .on('mouseleave', () => {
        setHoveredData(null);
      });

    // Animate Volume Bars upwards
    barGroup.transition()
      .duration(800)
      .attr('y', (d: any) => yLeft(d.orderVolume))
      .attr('height', (d: any) => height - margin.bottom - yLeft(d.orderVolume));

    // Curved Line generator for Avg Completion Time
    const lineGenerator = d3.line<PerformanceData>()
      .x(d => (x(d.day) || 0) + x.bandwidth() / 2)
      .y(d => yRight(d.avgCompletionTime))
      .curve(d3.curveMonotoneX);

    // Render Path
    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('d', lineGenerator);

    // Path animation (drawing effect)
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .attr('stroke-dashoffset', 0);

    // Nodes/Dots along the line for interactive hovering
    const nodeGroup = svg.append('g')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => (x(d.day) || 0) + x.bandwidth() / 2)
      .attr('cy', (d: any) => yRight(d.avgCompletionTime))
      .attr('r', 0) // start small
      .attr('class', 'fill-white stroke-emerald-500 stroke-[3px] hover:scale-150 transition-all cursor-pointer')
      .on('mouseenter', (event, d: any) => {
        setHoveredData(d);
        const [mx, my] = d3.pointer(event);
        setTooltipPos({ x: mx, y: my });
      })
      .on('mousemove', (event) => {
        const [mx, my] = d3.pointer(event);
        setTooltipPos({ x: mx, y: my });
      })
      .on('mouseleave', () => {
        setHoveredData(null);
      });

    nodeGroup.transition()
      .delay(400)
      .duration(600)
      .attr('r', 5.5);

    // Left Y Axis Title
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left - 45)
      .attr('x', -(height / 2))
      .attr('class', 'text-blue-500 font-extrabold text-[10px] tracking-widest uppercase fill-current text-center')
      .attr('text-anchor', 'middle')
      .text('Daily Order Volume');

    // Right Y Axis Title
    svg.append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -width + margin.right - 45)
      .attr('x', height / 2)
      .attr('class', 'text-emerald-500 font-extrabold text-[10px] tracking-widest uppercase fill-current text-center')
      .attr('text-anchor', 'middle')
      .text('Avg Completion Time (Mins)');

  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
      
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Fleet Delivery & Volume Performance (Last 7 Days)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            D3 dual-axis analytics tracking daily fulfilled order load count against logistics fulfillment speed.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start sm:self-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Simulate Sync</span>
        </button>
      </div>

      {/* Chart Visualization Area */}
      <div className="relative" ref={containerRef}>
        <svg ref={svgRef} className="w-full h-auto overflow-visible select-none"></svg>

        {/* Dynamic HTML Tooltip */}
        {hoveredData && (
          <div
            className="absolute bg-slate-950/95 border border-slate-800 text-white rounded-xl p-3 shadow-xl pointer-events-none text-xs space-y-1.5 transition-all z-10 animate-fadeIn"
            style={{
              left: `${Math.min(tooltipPos.x + 15, (containerRef.current?.clientWidth || 600) - 150)}px`,
              top: `${tooltipPos.y - 80}px`,
            }}
          >
            <div className="font-extrabold text-amber-400 border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>Fulfillment Date:</span>
              <span className="font-mono text-white">{hoveredData.day}</span>
            </div>
            <div className="flex items-center justify-between gap-4 font-semibold text-[11px]">
              <span className="flex items-center text-blue-400 gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                Volume:
              </span>
              <span className="font-bold">{hoveredData.orderVolume} jobs</span>
            </div>
            <div className="flex items-center justify-between gap-4 font-semibold text-[11px]">
              <span className="flex items-center text-emerald-400 gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                Avg Time:
              </span>
              <span className="font-bold">{hoveredData.avgCompletionTime} mins</span>
            </div>
          </div>
        )}
      </div>

      {/* Elegant Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Total Volume</span>
            <span className="font-bold text-base text-slate-800 dark:text-slate-100">
              {data.reduce((acc, d) => acc + d.orderVolume, 0)} Orders Fulfilled
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Optimal Transit speed</span>
            <span className="font-bold text-base text-slate-800 dark:text-slate-100">
              {(data.reduce((acc, d) => acc + d.avgCompletionTime, 0) / data.length).toFixed(1)} Mins Average SLA
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl font-bold">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Peak Performance Day</span>
            <span className="font-bold text-base text-slate-800 dark:text-slate-100">
              {(() => {
                const maxVol = d3.max(data, (d: PerformanceData) => d.orderVolume) || 0;
                const peakDay = data.find((d: PerformanceData) => d.orderVolume === maxVol);
                return peakDay ? `${peakDay.day} (${peakDay.orderVolume} orders)` : 'Saturday';
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
