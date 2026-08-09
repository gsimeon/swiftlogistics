import React, { useState } from 'react';
import { Calculator, Truck, Bike, MapPin, Zap, Flame, DollarSign, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface OrderCostCalculatorProps {
  onApplyEstimate?: (estimatedFee: number, destination: string, vehicleType: string) => void;
  onOpenNewOrderModal?: () => void;
}

const IKEJA_DESTINATIONS = [
  { name: 'GRA Ikeja (Isaac John Street)', distKm: 3.8, surgeMultiplier: 1.15, zone: 'Ikeja Zone A' },
  { name: 'Computer Village (Otigba Street)', distKm: 2.2, surgeMultiplier: 1.45, zone: 'Ikeja Core' },
  { name: 'Allen Avenue / Toyin Street Junction', distKm: 3.1, surgeMultiplier: 1.25, zone: 'Ikeja Zone B' },
  { name: 'Ikeja City Mall (Alausa Secretariat)', distKm: 5.4, surgeMultiplier: 1.10, zone: 'Alausa Corridor' },
  { name: 'Opebi Road Hub', distKm: 4.1, surgeMultiplier: 1.20, zone: 'Ikeja Zone B' },
  { name: 'Maryland Interchange', distKm: 6.2, surgeMultiplier: 1.35, zone: 'Maryland Express' },
];

const VEHICLE_OPTIONS = [
  { id: 'motorcycle', label: 'Express Motorcycle', baseFare: 3.50, perKmRate: 0.80, icon: Bike, desc: 'Best for avoiding Ikeja traffic' },
  { id: 'compact_van', label: 'Secure Van / Box', baseFare: 6.00, perKmRate: 1.20, icon: Truck, desc: 'Weatherproof & fragile items' },
  { id: 'cargo_truck', label: 'Heavy Express Truck', baseFare: 12.00, perKmRate: 2.00, icon: Truck, desc: 'Bulky cargo & multi-box' },
];

export const OrderCostCalculator: React.FC<OrderCostCalculatorProps> = ({
  onApplyEstimate,
  onOpenNewOrderModal,
}) => {
  const [selectedDest, setSelectedDest] = useState(IKEJA_DESTINATIONS[0]);
  const [customAddress, setCustomAddress] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [customDistKm, setCustomDistKm] = useState<number>(4.5);
  
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_OPTIONS[0]);
  const [trafficSurge, setTrafficSurge] = useState<number>(1.2); // 1.2x surge
  const [packageWeightKg, setPackageWeightKg] = useState<number>(2.5);
  const [isCopied, setIsCopied] = useState(false);

  const activeDistKm = useCustom ? Math.max(0.5, customDistKm) : selectedDest.distKm;
  const activeDestName = useCustom ? (customAddress || 'Custom Ikeja Address') : selectedDest.name;

  // Pricing formula
  const baseFee = selectedVehicle.baseFare;
  const distanceFee = activeDistKm * selectedVehicle.perKmRate;
  const weightSurcharge = packageWeightKg > 5 ? (packageWeightKg - 5) * 0.40 : 0;
  const subtotalBeforeSurge = baseFee + distanceFee + weightSurcharge;
  const surgeAmount = subtotalBeforeSurge * (trafficSurge - 1);
  const totalEstimatedFee = Math.round((subtotalBeforeSurge + surgeAmount) * 100) / 100;

  const handleApply = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (onApplyEstimate) {
      onApplyEstimate(totalEstimatedFee, activeDestName, selectedVehicle.id);
    }
    if (onOpenNewOrderModal) {
      onOpenNewOrderModal();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-5 animate-fadeIn">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Ikeja Order Cost Calculator</h3>
            <p className="text-[11px] text-slate-500">Instant delivery fee estimate based on real-time traffic & vehicle</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Live Tariff Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input Parameters Column */}
        <div className="space-y-4">
          
          {/* Destination Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Delivery Destination (Ikeja)</span>
              </span>
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-[10px] text-blue-600 font-bold hover:underline"
              >
                {useCustom ? 'Select Preset Spot' : '+ Custom Address'}
              </button>
            </label>

            {!useCustom ? (
              <select
                value={selectedDest.name}
                onChange={(e) => {
                  const found = IKEJA_DESTINATIONS.find((d) => d.name === e.target.value);
                  if (found) {
                    setSelectedDest(found);
                    setTrafficSurge(found.surgeMultiplier);
                  }
                }}
                className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {IKEJA_DESTINATIONS.map((dest) => (
                  <option key={dest.name} value={dest.name}>
                    {dest.name} (~{dest.distKm} km)
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter address in Ikeja..."
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 shrink-0 font-medium">Estimated Distance:</span>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={customDistKm}
                    onChange={(e) => setCustomDistKm(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-xs font-mono font-bold text-blue-600 shrink-0">{customDistKm} km</span>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Vehicle Type</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_OPTIONS.map((v) => {
                const IconComp = v.icon;
                const isSelected = selectedVehicle.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicle(v)}
                    className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="font-bold text-[11px] leading-tight block">{v.label}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">${v.baseFare.toFixed(2)} base</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Traffic Density Multiplier */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Current Ikeja Traffic Congestion</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {trafficSurge === 1.0 ? 'Normal (1.0x)' : trafficSurge === 1.25 ? 'Moderate (1.25x)' : 'Rush Hour (1.45x)'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTrafficSurge(1.0)}
                className={`py-1.5 px-2 rounded-lg font-semibold border ${
                  trafficSurge === 1.0 ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Clear Road
              </button>
              <button
                type="button"
                onClick={() => setTrafficSurge(1.25)}
                className={`py-1.5 px-2 rounded-lg font-semibold border ${
                  trafficSurge === 1.25 ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => setTrafficSurge(1.45)}
                className={`py-1.5 px-2 rounded-lg font-semibold border ${
                  trafficSurge === 1.45 ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Heavy Surge
              </button>
            </div>
          </div>

        </div>

        {/* Calculation Result Summary Card */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between space-y-4 border border-slate-800">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-medium">Estimated Destination:</span>
              <span className="font-bold text-slate-200 text-right truncate max-w-[150px]">{activeDestName}</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Base Fare ({selectedVehicle.label}):</span>
                <span className="font-mono">${baseFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance Rate ({activeDistKm.toFixed(1)} km @ ${selectedVehicle.perKmRate}/km):</span>
                <span className="font-mono">${distanceFee.toFixed(2)}</span>
              </div>
              {surgeAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Ikeja Traffic Surge ({(trafficSurge * 100 - 100).toFixed(0)}%):</span>
                  <span className="font-mono">+${surgeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Grand Total Display */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Total Fee</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                ${totalEstimatedFee.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">Escrow Protected</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-md"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Estimate Applied!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Use Fee in Delivery Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
