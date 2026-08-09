import React, { useState, useEffect } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  Wifi, 
  Signal, 
  Gauge, 
  Fuel, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Disc, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  Droplets, 
  CircleDot, 
  RefreshCw, 
  Check, 
  Sliders,
  WifiOff,
  Radio,
  Zap,
  Power,
  MapPin,
  Download,
  Trash2,
  Activity
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface DeviceHealthMonitorProps {
  driverName?: string;
  onLowBatteryAlert?: (batteryPct: number) => void;
  onSignalLossAlert?: (signalQuality: string) => void;
}

interface MaintenanceRecord {
  id: string;
  serviceName: string;
  completedAtKm: number;
  date: string;
  cost: string;
  technician: string;
}

interface ConnectionLogEntry {
  id: string;
  timestamp: string;
  location: string;
  eventType: 'Signal Drop' | 'Handover (5G -> 3G)' | 'WiFi to Cellular' | 'Dead Zone Detected' | 'High Latency Spike';
  rssiDbm: number;
  latencyMs: number;
  severity: 'low' | 'medium' | 'critical';
  details: string;
}

interface SmartPowerSettings {
  autoPowerSaveEnabled: boolean;
  batteryThresholdPct: number;
  lowSignalThresholdDbm: number;
  locationPollingMode: 'high_accuracy' | 'balanced' | 'low_frequency';
  compressImages: boolean;
  reduceMapFps: boolean;
  pauseNonEssentialSync: boolean;
}

export const DeviceHealthMonitor: React.FC<DeviceHealthMonitorProps> = ({
  driverName = 'Alex Vance',
  onLowBatteryAlert,
  onSignalLossAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'predictive' | 'connection_log' | 'power_management'>('telemetry');
  const [batteryLevel, setBatteryLevel] = useState<number>(78);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(3.92); // Volts (3.5V to 4.2V scale)
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [signalBars, setSignalBars] = useState<number>(4); // 1-4
  const [rssiDbm, setRssiDbm] = useState<number>(-78); // dBm (-110 to -50)
  const [latencyMs, setLatencyMs] = useState<number>(24);
  const [networkType, setNetworkType] = useState<string>('5G / MTN Nigeria');
  const [isConnectivityBreached, setIsConnectivityBreached] = useState<boolean>(false);
  const [signalTrend, setSignalTrend] = useState<number[]>([-82, -80, -78, -75, -79, -78]);

  // Connection Quality Log State
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString(),
      location: 'Adepele St / Computer Village, Ikeja',
      eventType: 'Dead Zone Detected',
      rssiDbm: -108,
      latencyMs: 340,
      severity: 'critical',
      details: 'High-density commercial structure blocking cellular penetration. Switched to offline buffer.',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toLocaleTimeString(),
      location: 'Awolowo Way Underpass, Ikeja',
      eventType: 'Handover (5G -> 3G)',
      rssiDbm: -98,
      latencyMs: 180,
      severity: 'medium',
      details: 'Tower transition under flyover bridge. Frequency handover completed safely.',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 62 * 60 * 1000).toLocaleTimeString(),
      location: 'Mobolaji Bank Anthony Way (Basement Lot), Ikeja',
      eventType: 'Signal Drop',
      rssiDbm: -112,
      latencyMs: 520,
      severity: 'critical',
      details: 'Underground parking drop. Auto-buffered 4 GPS pings in local IndexedDB queue.',
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toLocaleTimeString(),
      location: 'Allen Avenue / Toyin Junction, Ikeja',
      eventType: 'WiFi to Cellular',
      rssiDbm: -72,
      latencyMs: 22,
      severity: 'low',
      details: 'Seamless handover from Store WiFi to MTN 5G cellular network.',
    },
  ]);

  // Smart Power Management Settings State
  const [powerSettings, setPowerSettings] = useState<SmartPowerSettings>({
    autoPowerSaveEnabled: true,
    batteryThresholdPct: 20,
    lowSignalThresholdDbm: -100,
    locationPollingMode: 'balanced',
    compressImages: true,
    reduceMapFps: true,
    pauseNonEssentialSync: true,
  });

  // Engine & Vehicle Telemetry State
  const [fuelLevelPct, setFuelLevelPct] = useState<number>(68);
  const [mileageKm, setMileageKm] = useState<number>(14820);
  const [oilLifePct, setOilLifePct] = useState<number>(84);
  const [tirePressurePsi, setTirePressurePsi] = useState<number>(32);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);

  // Predictive Maintenance Baseline State
  const [lastOilChangeKm, setLastOilChangeKm] = useState<number>(10000);
  const oilIntervalKm = 5000; // Oil change every 5,000 km

  const [lastTireRotationKm, setLastTireRotationKm] = useState<number>(8000);
  const tireRotationIntervalKm = 8000; // Tire rotation every 8,000 km

  const [lastBrakePadKm, setLastBrakePadKm] = useState<number>(3000);
  const brakePadIntervalKm = 15000; // Brake pads every 15,000 km

  const [simulatedKmToAdd, setSimulatedKmToAdd] = useState<number>(0);
  const [serviceActionLog, setServiceActionLog] = useState<string | null>(null);

  // Past Maintenance History
  const [serviceHistory, setServiceHistory] = useState<MaintenanceRecord[]>([
    {
      id: 'srv-1',
      serviceName: 'Full Synthetic Engine Oil Change',
      completedAtKm: 10000,
      date: '2026-06-12',
      cost: '₦18,500',
      technician: 'Ikeja Fleet Auto Care',
    },
    {
      id: 'srv-2',
      serviceName: '4-Wheel Tire Rotation & Balance',
      completedAtKm: 8000,
      date: '2026-04-20',
      cost: '₦12,000',
      technician: 'Allen Ave Quick Fit',
    },
    {
      id: 'srv-3',
      serviceName: 'Front Ceramic Brake Pad Replacement',
      completedAtKm: 3000,
      date: '2026-01-15',
      cost: '₦24,000',
      technician: 'Ikeja Fleet Auto Care',
    },
  ]);

  // Calculated Mileage values
  const effectiveMileage = mileageKm + simulatedKmToAdd;
  const avgDailyKm = 145; // Average km driven per delivery shift in Ikeja

  // Oil Change Calculations
  const oilKmDriven = effectiveMileage - lastOilChangeKm;
  const oilKmRemaining = Math.max(0, oilIntervalKm - oilKmDriven);
  const oilDaysRemaining = Math.ceil(oilKmRemaining / avgDailyKm);
  const oilStatusPct = Math.max(0, Math.min(100, Math.round((oilKmRemaining / oilIntervalKm) * 100)));

  // Tire Rotation Calculations
  const tireKmDriven = effectiveMileage - lastTireRotationKm;
  const tireKmRemaining = Math.max(0, tireRotationIntervalKm - tireKmDriven);
  const tireDaysRemaining = Math.ceil(tireKmRemaining / avgDailyKm);
  const tireStatusPct = Math.max(0, Math.min(100, Math.round((tireKmRemaining / tireRotationIntervalKm) * 100)));

  // Smart Power Saver Active Check
  const isPowerSaveActive = powerSettings.autoPowerSaveEnabled && 
    (batteryLevel <= powerSettings.batteryThresholdPct || rssiDbm <= powerSettings.lowSignalThresholdDbm);

  // Real-time battery, voltage & network RSSI simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        const nextPct = Math.max(8, Math.min(100, prev + (isCharging ? 1 : delta)));
        const voltage = Number((3.50 + (nextPct / 100) * 0.70).toFixed(2));
        setBatteryVoltage(voltage);

        // Calculate connectivity breach threshold (< 20% OR voltage < 3.65V)
        if ((nextPct < 20 || voltage < 3.65) && !isConnectivityBreached) {
          setIsConnectivityBreached(true);
          soundService.playNotification();
          if (onLowBatteryAlert) onLowBatteryAlert(nextPct);
        } else if (nextPct >= 20 && voltage >= 3.65) {
          setIsConnectivityBreached(false);
        }
        return nextPct;
      });

      if (Math.random() > 0.6) {
        const newBars = Math.floor(Math.random() * 3) + 2;
        const newRssi = -110 + (newBars * 15) + Math.floor(Math.random() * 5);
        setSignalBars(newBars);
        setRssiDbm(newRssi);
        setLatencyMs(18 + Math.floor(Math.random() * 20));
        setSignalTrend((prev) => [...prev.slice(1), newRssi]);

        // Auto log signal drop if critical
        if (newRssi < -100) {
          if (onSignalLossAlert) onSignalLossAlert('Weak Signal Alert');
          setConnectionLogs((prevLogs) => [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              location: 'Ikeja Area Dead Zone (Auto-Detected)',
              eventType: 'Signal Drop',
              rssiDbm: newRssi,
              latencyMs: 380,
              severity: 'critical',
              details: `Automated signal drop log. Cellular signal degraded to ${newRssi} dBm.`,
            },
            ...prevLogs.slice(0, 15),
          ]);
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isCharging, isConnectivityBreached, onLowBatteryAlert, onSignalLossAlert]);

  const toggleLowBatteryTest = () => {
    const testPct = 12;
    setBatteryLevel(testPct);
    setBatteryVoltage(3.58);
    setRssiDbm(-105);
    setSignalBars(1);
    setIsConnectivityBreached(true);
    soundService.playNotification();
    if (onLowBatteryAlert) onLowBatteryAlert(testPct);

    // Append to connection log
    setConnectionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        location: 'Computer Village Alley, Ikeja',
        eventType: 'Dead Zone Detected',
        rssiDbm: -105,
        latencyMs: 410,
        severity: 'critical',
        details: 'Simulated dead zone trigger. Cellular signal breached minimum threshold (-105 dBm).',
      },
      ...prev,
    ]);
  };

  const handleSimulateHandover = () => {
    soundService.playNotification();
    setConnectionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        location: 'Ikeja City Mall Plaza, Ikeja',
        eventType: 'WiFi to Cellular',
        rssiDbm: -68,
        latencyMs: 19,
        severity: 'low',
        details: 'Handover triggered: Switched from Store Public WiFi to 5G Carrier Data.',
      },
      ...prev,
    ]);
  };

  const handleClearConnectionLogs = () => {
    soundService.playNotification();
    setConnectionLogs([]);
  };

  const handleRunVehicleDiagnostic = () => {
    soundService.playNotification();
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      soundService.playNotification();
    }, 2000);
  };

  const handleRefuelVehicle = () => {
    soundService.playNotification();
    setFuelLevelPct(100);
  };

  const toggleCharging = () => {
    setIsCharging(!isCharging);
  };

  const handleCompleteOilService = () => {
    soundService.playNotification();
    const newRecord: MaintenanceRecord = {
      id: `srv-${Date.now()}`,
      serviceName: 'Full Synthetic Engine Oil Change',
      completedAtKm: effectiveMileage,
      date: new Date().toISOString().split('T')[0],
      cost: '₦19,000',
      technician: 'Ikeja Central Service Bay',
    };
    setLastOilChangeKm(effectiveMileage);
    setServiceHistory((prev) => [newRecord, ...prev]);
    setServiceActionLog(`✅ Engine Oil Service recorded at ${effectiveMileage.toLocaleString()} km! Mileage countdown reset.`);
    soundService.playMessagePop();
  };

  const handleCompleteTireRotation = () => {
    soundService.playNotification();
    const newRecord: MaintenanceRecord = {
      id: `srv-${Date.now()}`,
      serviceName: '4-Wheel Tire Rotation & Pressure Calibration',
      completedAtKm: effectiveMileage,
      date: new Date().toISOString().split('T')[0],
      cost: '₦12,500',
      technician: 'Allen Ave Quick Fit',
    };
    setLastTireRotationKm(effectiveMileage);
    setServiceHistory((prev) => [newRecord, ...prev]);
    setServiceActionLog(`✅ Tire Rotation recorded at ${effectiveMileage.toLocaleString()} km! Mileage countdown reset.`);
    soundService.playMessagePop();
  };

  const getBatteryColor = () => {
    if (batteryLevel < 20) return 'text-red-600 bg-red-50 border-red-200';
    if (batteryLevel <= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getBatteryFillColor = () => {
    if (batteryLevel < 20) return 'bg-red-500';
    if (batteryLevel <= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-sm space-y-4">
      
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-slate-900 text-white rounded-lg">
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-800">Vehicle & Device Health Monitor</h4>
            <span className="text-[10px] text-slate-400 font-medium">Telemetry, Dead Zones & Smart Power Optimization</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveTab('telemetry');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'telemetry'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Telemetry
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveTab('connection_log');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'connection_log'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Connection Quality Log</span>
            <span className="bg-blue-800 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
              {connectionLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveTab('power_management');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'power_management'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Power</span>
            {isPowerSaveActive && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveTab('predictive');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'predictive'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xs'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Predictive Service</span>
            {oilKmRemaining < 500 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {serviceActionLog && (
        <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{serviceActionLog}</span>
          </div>
          <button
            onClick={() => setServiceActionLog(null)}
            className="text-[10px] text-emerald-700 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Proactive Low Power / Weak Signal Threshold Breach Banner */}
      {isConnectivityBreached && (
        <div className="bg-gradient-to-r from-rose-900 via-red-950 to-rose-900 border-2 border-rose-500/90 p-3.5 rounded-xl text-white flex items-center justify-between gap-3 animate-pulse shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow">
              <ShieldAlert className="w-5 h-5 animate-bounce shrink-0" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="bg-rose-500 text-white text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase">
                  DEVICE CONNECTIVITY BREACH
                </span>
                <span className="text-xs text-amber-300 font-bold font-mono">
                  {batteryLevel}% ({batteryVoltage}V) • RSSI {rssiDbm} dBm
                </span>
              </div>
              <p className="text-[11px] text-rose-200">
                Battery is below 20% or signal threshold breached. Auto-enabled power saver & offline cache buffer.
              </p>
            </div>
          </div>

          <button
            onClick={toggleCharging}
            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg shrink-0 shadow transition-all active:scale-95"
          >
            {isCharging ? 'Charging Active' : 'Plug In Charger'}
          </button>
        </div>
      )}

      {/* TAB 1: REAL-TIME TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Handset Connectivity & Battery Voltage Health Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Battery Health & Real-Time Voltage Indicator */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 ${getBatteryColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {isCharging ? (
                    <BatteryCharging className="w-5 h-5 animate-pulse text-emerald-600" />
                  ) : batteryLevel < 20 ? (
                    <BatteryWarning className="w-5 h-5 animate-bounce text-red-600" />
                  ) : (
                    <Battery className="w-5 h-5 text-emerald-600" />
                  )}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                      Battery & Cell Voltage
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="font-mono font-extrabold text-base">{batteryLevel}%</span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded border border-slate-300">
                        {batteryVoltage}V Li-ion
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleCharging}
                  className="text-[10px] font-extrabold underline hover:opacity-80 opacity-80 bg-white/70 px-2 py-1 rounded"
                  title="Toggle Charging Status"
                >
                  {isCharging ? 'Unplug' : 'Plug In'}
                </button>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getBatteryFillColor()}`}
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono opacity-70">
                  <span>Critical: 3.50V (10%)</span>
                  <span>Nominal: 3.85V</span>
                  <span>Full: 4.20V (100%)</span>
                </div>
              </div>
            </div>

            {/* Network Signal & RSSI Trend Indicator */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/90 flex flex-col justify-between space-y-2 text-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Signal Strength & RSSI
                    </span>
                    <span className="font-mono font-bold text-xs">{networkType}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-extrabold text-blue-600 block">{rssiDbm} dBm</span>
                  <span className="text-[9px] text-slate-500">{latencyMs}ms latency</span>
                </div>
              </div>

              {/* Signal Trend Sparkline / Bars */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold">Signal History Trend:</span>
                <div className="flex items-end space-x-1 h-5">
                  {signalTrend.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 rounded-t-xs transition-all ${
                        val > -85 ? 'bg-emerald-500' : val > -98 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ height: `${Math.max(15, ((val + 120) / 70) * 100)}%` }}
                      title={`Historical RSSI: ${val} dBm`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Engine & Vehicle Health Section */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-indigo-600" />
                <h5 className="font-bold text-xs text-slate-800">Engine Telemetry & Quick Diagnostics</h5>
              </div>

              <button
                onClick={handleRunVehicleDiagnostic}
                disabled={isDiagnosticRunning}
                className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors flex items-center space-x-1"
              >
                <Wrench className={`w-3 h-3 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
                <span>{isDiagnosticRunning ? 'Scanning Systems...' : 'Run Diagnostics'}</span>
              </button>
            </div>

            {/* Vehicle Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              
              {/* Fuel Level */}
              <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                    <Fuel className="w-3 h-3 text-amber-400" />
                    <span>Fuel Level</span>
                  </span>
                  <button
                    onClick={handleRefuelVehicle}
                    className="text-[9px] text-amber-400 hover:underline font-bold"
                  >
                    Refuel
                  </button>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono font-extrabold text-sm text-amber-300">{fuelLevelPct}%</span>
                  <span className="text-[9px] text-slate-400">~280 km range</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      fuelLevelPct < 25 ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${fuelLevelPct}%` }}
                  />
                </div>
              </div>

              {/* Odometer Mileage */}
              <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <Gauge className="w-3 h-3 text-blue-400" />
                  <span>Odometer</span>
                </span>
                <div className="font-mono font-extrabold text-sm text-blue-300">{effectiveMileage.toLocaleString()} km</div>
                <span className="text-[9px] text-slate-400 block">+142 km this shift</span>
              </div>

              {/* Oil Life */}
              <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <Disc className="w-3 h-3 text-emerald-400" />
                  <span>Oil Life</span>
                </span>
                <div className="font-mono font-extrabold text-sm text-emerald-300">{oilStatusPct}%</div>
                <span className="text-[9px] text-emerald-400 block">Due in {oilKmRemaining} km</span>
              </div>

              {/* Tire Pressure */}
              <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Tire Pressure</span>
                </span>
                <div className="font-mono font-extrabold text-sm text-white">{tirePressurePsi} PSI</div>
                <span className="text-[9px] text-emerald-400 block">All 4 Tires Nominal</span>
              </div>

            </div>

            {/* Maintenance Flag Reminder Banner */}
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-amber-800 text-[11px] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Predictive Alert:</strong> Oil change due in <strong>{oilKmRemaining} km</strong> (~{oilDaysRemaining} shifts). Tap 'Predictive Maintenance' for detailed forecast.
                </span>
              </div>
            </div>

          </div>

          {/* Quick Test Trigger */}
          <div className="flex items-center justify-end">
            <button
              onClick={toggleLowBatteryTest}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline font-medium flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Simulate Low Battery Warning (12%)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CONNECTION QUALITY LOG (IKEJA DEAD ZONES) */}
      {activeTab === 'connection_log' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Info Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/40">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-white">Ikeja Network Quality & Handover Log</h5>
                  <p className="text-xs text-slate-400">
                    Records signal drops, carrier handovers, and flags dead zones along delivery corridors.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSimulateHandover}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Simulate Handover
                </button>
                <button
                  type="button"
                  onClick={toggleLowBatteryTest}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Trigger Signal Drop
                </button>
                <button
                  type="button"
                  onClick={handleClearConnectionLogs}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                  title="Clear Log History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Identified Dead Zone Hotspots in Ikeja */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                  <span>HOTSPOT #1</span>
                  <span className="text-rose-400">CRITICAL</span>
                </div>
                <div className="font-bold text-slate-200">Computer Village Plaza</div>
                <div className="text-[10px] text-slate-400">Adepele & Medical Rd Alley (-108 dBm)</div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                  <span>HOTSPOT #2</span>
                  <span className="text-amber-400">MODERATE</span>
                </div>
                <div className="font-bold text-slate-200">Awolowo Flyover Bridge</div>
                <div className="text-[10px] text-slate-400">Cell tower handover zone (-98 dBm)</div>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
                  <span>HOTSPOT #3</span>
                  <span className="text-rose-400">CRITICAL</span>
                </div>
                <div className="font-bold text-slate-200">Mobolaji Bank Basement</div>
                <div className="text-[10px] text-slate-400">Underground parking lot (-112 dBm)</div>
              </div>
            </div>
          </div>

          {/* Connection Log Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="uppercase text-[10px] tracking-wider">Recorded Signal & Network Handover Events</span>
              <span>{connectionLogs.length} Events Tracked</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs bg-white shadow-xs">
              {connectionLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p>No connectivity issues or handovers logged in this session.</p>
                </div>
              ) : (
                connectionLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        log.severity === 'critical'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : log.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-blue-100 text-blue-700 border border-blue-300'
                      }`}>
                        {log.severity === 'critical' ? (
                          <WifiOff className="w-4 h-4" />
                        ) : (
                          <Radio className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-sm">{log.eventType}</span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            log.severity === 'critical'
                              ? 'bg-rose-500 text-white'
                              : log.severity === 'medium'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {log.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{log.location}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 italic pt-0.5">{log.details}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block">{log.rssiDbm} dBm • {log.latencyMs}ms</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMART POWER MANAGEMENT SETTINGS */}
      {activeTab === 'power_management' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Smart Power Status Header */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isPowerSaveActive
              ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500 text-white shadow-lg'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl ${
                  isPowerSaveActive ? 'bg-emerald-500 text-slate-950 shadow-lg animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="font-extrabold text-base text-white">Smart Power Saver Mode</h5>
                    <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                      isPowerSaveActive
                        ? 'bg-emerald-400 text-slate-950 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isPowerSaveActive ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Automatically lowers location polling frequency & bandwidth when battery or signal drops below threshold.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={powerSettings.autoPowerSaveEnabled}
                    onChange={(e) => {
                      soundService.playNotification();
                      setPowerSettings({ ...powerSettings, autoPowerSaveEnabled: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {isPowerSaveActive && (
              <div className="mt-3 pt-3 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-mono">
                <span>⚡ Power Savings Enabled: Polling frequency reduced to preserve device battery life.</span>
                <span className="font-extrabold text-amber-300">+3.5 hours extra shift battery</span>
              </div>
            )}
          </div>

          {/* Configuration Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Battery & Signal Threshold Controls */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h5 className="font-extrabold text-sm text-slate-800">Auto-Trigger Thresholds</h5>
              </div>

              {/* Battery Threshold Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Auto Low-Power Battery Threshold:</span>
                  <span className="font-mono font-extrabold text-emerald-600 text-sm">
                    {powerSettings.batteryThresholdPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={powerSettings.batteryThresholdPct}
                  onChange={(e) => setPowerSettings({ ...powerSettings, batteryThresholdPct: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  App switches to low-frequency polling when device battery drops below {powerSettings.batteryThresholdPct}%.
                </p>
              </div>

              {/* Low Signal Threshold Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Weak Signal Threshold (RSSI):</span>
                  <span className="font-mono font-extrabold text-blue-600 text-sm">
                    {powerSettings.lowSignalThresholdDbm} dBm
                  </span>
                </div>
                <input
                  type="range"
                  min="-110"
                  max="-85"
                  step="5"
                  value={powerSettings.lowSignalThresholdDbm}
                  onChange={(e) => setPowerSettings({ ...powerSettings, lowSignalThresholdDbm: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Automatically enables offline caching and reduces telemetry pings in dead zones weaker than {powerSettings.lowSignalThresholdDbm} dBm.
                </p>
              </div>
            </div>

            {/* Polling Frequency & Bandwidth Toggles */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h5 className="font-extrabold text-sm text-slate-800">Location Polling & Bandwidth</h5>
              </div>

              {/* Polling Mode Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">GPS Location Polling Mode:</label>
                <select
                  value={powerSettings.locationPollingMode}
                  onChange={(e) => setPowerSettings({ ...powerSettings, locationPollingMode: e.target.value as any })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="high_accuracy">High Accuracy (Every 5s - Max Battery Drain)</option>
                  <option value="balanced">Balanced Efficiency (Every 15s - Recommended)</option>
                  <option value="low_frequency">Low Frequency / Emergency (Every 60s - Max Battery Save)</option>
                </select>
              </div>

              {/* Toggle Options */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-medium text-slate-700">Compress POD Photo Uploads:</span>
                  <input
                    type="checkbox"
                    checked={powerSettings.compressImages}
                    onChange={(e) => setPowerSettings({ ...powerSettings, compressImages: e.target.checked })}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-medium text-slate-700">Cap Map Animation Framerate (30 FPS):</span>
                  <input
                    type="checkbox"
                    checked={powerSettings.reduceMapFps}
                    onChange={(e) => setPowerSettings({ ...powerSettings, reduceMapFps: e.target.checked })}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-medium text-slate-700">Pause Background Analytics Sync:</span>
                  <input
                    type="checkbox"
                    checked={powerSettings.pauseNonEssentialSync}
                    onChange={(e) => setPowerSettings({ ...powerSettings, pauseNonEssentialSync: e.target.checked })}
                    className="accent-emerald-600 w-4 h-4 rounded"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: PREDICTIVE MAINTENANCE */}
      {activeTab === 'predictive' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Mileage Shift Simulator Bar */}
          <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center space-x-1.5 text-amber-300">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Mileage Forecast & Shift Simulator</span>
              </span>
              <span className="font-mono text-xs text-slate-300">
                Base Odometer: <strong className="text-white">{mileageKm.toLocaleString()} km</strong>
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-[11px] text-slate-400 shrink-0">Simulate Upcoming Mileage:</span>
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={simulatedKmToAdd}
                onChange={(e) => setSimulatedKmToAdd(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-400 shrink-0 w-20 text-right">
                +{simulatedKmToAdd} km
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Simulated Vehicle Mileage: <strong className="text-emerald-400 font-mono">{effectiveMileage.toLocaleString()} km</strong></span>
              <span>Based on Ikeja avg {avgDailyKm} km/shift</span>
            </div>
          </div>

          {/* Predictive Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            {/* Oil Change Predictive Card */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              oilKmRemaining < 500
                ? 'bg-rose-50/80 border-rose-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${oilKmRemaining < 500 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Engine Oil Change</h5>
                    <span className="text-[10px] text-slate-500">Recommended every {oilIntervalKm.toLocaleString()} km</span>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                  oilKmRemaining < 500
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {oilKmRemaining < 500 ? 'Service Imminent' : 'Healthy'}
                </span>
              </div>

              {/* Countdown & Mileage Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-slate-500 text-[11px]">Due in:</span>
                  <span className={`font-extrabold ${oilKmRemaining < 500 ? 'text-rose-600 text-sm' : 'text-slate-800'}`}>
                    {oilKmRemaining.toLocaleString()} km (~{oilDaysRemaining} shifts)
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      oilKmRemaining < 500 ? 'bg-rose-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${100 - oilStatusPct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Last serviced: {lastOilChangeKm.toLocaleString()} km</span>
                  <span>Next due at: {(lastOilChangeKm + oilIntervalKm).toLocaleString()} km</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Ikeja Express Oil Partner: ₦18,500</span>
                <button
                  type="button"
                  onClick={handleCompleteOilService}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-transform active:scale-95"
                >
                  Log Oil Service Completed
                </button>
              </div>
            </div>

            {/* Tire Rotation Predictive Card */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              tireKmRemaining < 800
                ? 'bg-amber-50/80 border-amber-300 text-slate-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <CircleDot className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Tire Rotation & Alignment</h5>
                    <span className="text-[10px] text-slate-500">Recommended every {tireRotationIntervalKm.toLocaleString()} km</span>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                  tireKmRemaining < 800
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {tireKmRemaining < 800 ? 'Rotation Due Soon' : 'Optimal Wear'}
                </span>
              </div>

              {/* Countdown & Mileage Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-slate-500 text-[11px]">Due in:</span>
                  <span className="font-extrabold text-slate-800">
                    {tireKmRemaining.toLocaleString()} km (~{tireDaysRemaining} shifts)
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${100 - tireStatusPct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Last rotated: {lastTireRotationKm.toLocaleString()} km</span>
                  <span>Next due at: {(lastTireRotationKm + tireRotationIntervalKm).toLocaleString()} km</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Estimated Tread Depth: 5.2 mm</span>
                <button
                  type="button"
                  onClick={handleCompleteTireRotation}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-transform active:scale-95"
                >
                  Log Tire Rotation Completed
                </button>
              </div>
            </div>

          </div>

          {/* Service Log Table */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[10px]">
                Historical Vehicle Maintenance Records
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Verified Fleet History</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {serviceHistory.map((rec) => (
                <div key={rec.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{rec.serviceName}</div>
                      <div className="text-[10px] text-slate-400">
                        Completed at <strong className="text-slate-600">{rec.completedAtKm.toLocaleString()} km</strong> • {rec.technician}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-700 block">{rec.cost}</span>
                    <span className="text-[10px] text-slate-400">{rec.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};



