import React, { useState, useEffect } from 'react';
import { Fuel, Gauge, DollarSign, PlusCircle, History, TrendingUp, Download, Trash2, MapPin, CheckCircle2 } from 'lucide-react';
import { soundService } from '../services/soundService';

export interface FuelLogEntry {
  id: string;
  timestamp: string;
  odometerKm: number;
  liters: number;
  totalCost: number;
  stationName: string;
  vehicleType: string;
  efficiencyKml?: number;
  costPerKm?: number;
}

const INITIAL_FUEL_LOGS: FuelLogEntry[] = [
  {
    id: 'fuel-001',
    timestamp: '2026-08-07 08:30 AM',
    odometerKm: 42150,
    liters: 10.5,
    totalCost: 8925, // NGN or USD equivalent
    stationName: 'TotalEnergies, Mobolaji Bank Anthony, Ikeja',
    vehicleType: 'TVS Star Express Bike',
    efficiencyKml: 32.4,
    costPerKm: 26.1,
  },
  {
    id: 'fuel-002',
    timestamp: '2026-08-04 04:15 PM',
    odometerKm: 41810,
    liters: 11.0,
    totalCost: 9350,
    stationName: 'NNPC Retail, Allen Avenue, Ikeja',
    vehicleType: 'TVS Star Express Bike',
    efficiencyKml: 30.9,
    costPerKm: 27.5,
  },
];

export const FuelConsumptionLogger: React.FC = () => {
  const [logs, setLogs] = useState<FuelLogEntry[]>(() => {
    const saved = localStorage.getItem('driver_fuel_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_FUEL_LOGS;
      }
    }
    return INITIAL_FUEL_LOGS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [odometer, setOdometer] = useState<string>('42480');
  const [liters, setLiters] = useState<string>('12.0');
  const [cost, setCost] = useState<string>('10200');
  const [station, setStation] = useState<string>('Oando Petrol Station, Computer Village');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₦');

  useEffect(() => {
    localStorage.setItem('driver_fuel_logs', JSON.stringify(logs));
  }, [logs]);

  // Analytics
  const totalLiters = logs.reduce((acc, l) => acc + l.liters, 0);
  const totalFuelCost = logs.reduce((acc, l) => acc + l.totalCost, 0);
  const avgEfficiency = logs.length > 0
    ? (logs.reduce((acc, l) => acc + (l.efficiencyKml || 30), 0) / logs.length).toFixed(1)
    : '31.5';
  const avgCostPerKm = logs.length > 0
    ? (logs.reduce((acc, l) => acc + (l.costPerKm || 26), 0) / logs.length).toFixed(1)
    : '26.8';

  const handleAddFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    const odoNum = parseFloat(odometer) || 0;
    const litNum = parseFloat(liters) || 1;
    const costNum = parseFloat(cost) || 0;

    // Estimate efficiency from previous log if exists
    let calcEfficiency = 31.5;
    if (logs.length > 0) {
      const prevOdo = logs[0].odometerKm;
      const distanceCovered = odoNum - prevOdo;
      if (distanceCovered > 0 && litNum > 0) {
        calcEfficiency = distanceCovered / litNum;
      }
    }

    const calcCostPerKm = calcEfficiency > 0 ? (costNum / litNum) / calcEfficiency : 26;

    const newEntry: FuelLogEntry = {
      id: `fuel-${Date.now()}`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      odometerKm: odoNum,
      liters: litNum,
      totalCost: costNum,
      stationName: station || 'Local Refueling Station',
      vehicleType: 'TVS Star Express Bike',
      efficiencyKml: parseFloat(calcEfficiency.toFixed(1)),
      costPerKm: parseFloat(calcCostPerKm.toFixed(1)),
    };

    soundService.playNotification();
    setLogs((prev) => [newEntry, ...prev]);
    setIsAdding(false);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleExportFuelCSV = () => {
    const headers = ['Timestamp', 'Odometer (km)', 'Refuel Liters', 'Total Cost', 'Station', 'Est Efficiency (km/L)', 'Cost per Km'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      l.odometerKm,
      l.liters,
      l.totalCost,
      `"${l.stationName.replace(/"/g, '""')}"`,
      l.efficiencyKml || 'N/A',
      l.costPerKm || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `driver_fuel_consumption_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200 shrink-0">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-900 text-base">Fuel Consumption & Expense Logger</h3>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                EXPENSE TRACKER
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Log pump readings and cost per refueling stop to calculate fuel efficiency & net profit.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportFuelCSV}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="py-2 px-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Log Refueling'}</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Fuel Cost</span>
          <div className="text-xl font-black text-slate-800 font-mono">
            {currencySymbol}{totalFuelCost.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">{logs.length} Stops Logged</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Liters Pumped</span>
          <div className="text-xl font-black text-slate-800 font-mono">
            {totalLiters.toFixed(1)} L
          </div>
          <span className="text-[10px] text-amber-600 font-bold">Premium Petrol</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Efficiency</span>
          <div className="text-xl font-black text-emerald-600 font-mono">
            {avgEfficiency} km/L
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Optimal Fuel Range</span>
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost Per Km</span>
          <div className="text-xl font-black text-indigo-600 font-mono">
            {currencySymbol}{avgCostPerKm}/km
          </div>
          <span className="text-[10px] text-slate-500">Direct Vehicle Expense</span>
        </div>
      </div>

      {/* Refueling Input Form */}
      {isAdding && (
        <form onSubmit={handleAddFuelLog} className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-3 animate-fadeIn">
          <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Fuel className="w-4 h-4 text-amber-600" />
            <span>New Refueling Entry</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Odometer (km)</label>
              <input
                type="number"
                required
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="42480"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Liters Pumped</label>
              <input
                type="number"
                step="0.1"
                required
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                placeholder="12.0"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Total Cost ({currencySymbol})</label>
              <input
                type="number"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="10200"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Station Name / Area</label>
              <input
                type="text"
                required
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder="Total, Computer Village"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-1.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-extrabold text-xs shadow-sm flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Refueling Log</span>
            </button>
          </div>
        </form>
      )}

      {/* Fuel Logs History Table */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs text-slate-700 flex items-center space-x-1.5">
          <History className="w-4 h-4 text-slate-500" />
          <span>Refueling History & Performance Analytics Log</span>
        </h4>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Odometer</th>
                <th className="py-2.5 px-3">Volume</th>
                <th className="py-2.5 px-3">Total Expense</th>
                <th className="py-2.5 px-3">Station Location</th>
                <th className="py-2.5 px-3 text-center">Efficiency</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{log.odometerKm.toLocaleString()} km</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{log.liters} L</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{currencySymbol}{log.totalCost.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-medium truncate max-w-[200px]">{log.stationName}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-600">
                    {log.efficiencyKml ? `${log.efficiencyKml} km/L` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
