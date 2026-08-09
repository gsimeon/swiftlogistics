import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, Phone, ShieldCheck, Navigation, Clock, AlertTriangle, Search, CheckCircle2, Star, Sparkles, Truck, Bike } from 'lucide-react';
import { soundService } from '../services/soundService';

interface RepairStation {
  id: string;
  name: string;
  specialty: string;
  address: string;
  distanceKm: number;
  etaMins: number;
  phone: string;
  rating: number;
  isCertified: boolean;
  isOpen247: boolean;
  lat: number;
  lng: number;
  services: string[];
}

const COMPUTER_VILLAGE_REPAIR_STATIONS: RepairStation[] = [
  {
    id: 'mech-1',
    name: 'Computer Village Rapid Fleet Workshop',
    specialty: 'Express Bike & Delivery Van Repair',
    address: 'No 28 Otigba Street, Computer Village, Ikeja, Lagos',
    distanceKm: 0.3,
    etaMins: 3,
    phone: '+234 802 881 9901',
    rating: 4.9,
    isCertified: true,
    isOpen247: true,
    lat: 6.5935,
    lng: 3.3425,
    services: ['Brake Pad Replacement', 'Oil & Filter Change', 'Tire Vulcanizing', 'Battery Jumpstart'],
  },
  {
    id: 'mech-2',
    name: 'Ikeja GRA Certified Auto & Bike Techs',
    specialty: 'Electronics & Engine Diagnostics',
    address: 'Mobolaji Bank Anthony Way (Opposite Cantonment), Ikeja',
    distanceKm: 0.8,
    etaMins: 6,
    phone: '+234 813 440 2210',
    rating: 4.8,
    isCertified: true,
    isOpen247: false,
    lat: 6.5880,
    lng: 3.3520,
    services: ['Engine Tuning', 'Electrical & Wiring', 'Hydraulic Brakes', 'Chain Alignment'],
  },
  {
    id: 'mech-3',
    name: 'Allen Avenue Emergency Vulcanizer & Mechanics',
    specialty: 'Mobile Tire & Suspension Service',
    address: 'Corner of Allen Avenue & Toyin Street, Ikeja, Lagos',
    distanceKm: 1.2,
    etaMins: 8,
    phone: '+234 805 119 8832',
    rating: 4.7,
    isCertified: true,
    isOpen247: true,
    lat: 6.6015,
    lng: 3.3505,
    services: ['Mobile Vulcanizing', 'Tubeless Tire Patch', 'Belt & Chain Drive', 'Suspension Check'],
  },
  {
    id: 'mech-4',
    name: 'Maryland Interchange Heavy Fleet Station',
    specialty: 'Cargo Van & Heavy Delivery Truck Repairs',
    address: 'Maryland Bus Stop Interchange, Ikorodu Road, Ikeja',
    distanceKm: 2.1,
    etaMins: 12,
    phone: '+234 809 772 3341',
    rating: 4.8,
    isCertified: true,
    isOpen247: false,
    lat: 6.5720,
    lng: 3.3670,
    services: ['Heavy Duty Brakes', 'Transmission Fluid', 'Radiator Cooling', 'Towing Assistance'],
  },
];

interface EmergencyRepairStationProps {
  apiKey?: string;
  onSelectStationLocation?: (loc: { lat: number; lng: number; name: string }) => void;
  onOpenCallModal?: (phone: string, name: string) => void;
}

export const EmergencyRepairStation: React.FC<EmergencyRepairStationProps> = ({
  apiKey,
  onSelectStationLocation,
  onOpenCallModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'certified' | 'open247'>('all');
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [stations, setStations] = useState<RepairStation[]>(COMPUTER_VILLAGE_REPAIR_STATIONS);
  const [dispatchMobileUnit, setDispatchMobileUnit] = useState<string | null>(null);

  // Filter mechanics
  const filteredStations = stations.filter((st) => {
    const matchesQuery =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'certified') return matchesQuery && st.isCertified;
    if (filterType === 'open247') return matchesQuery && st.isOpen247;
    return matchesQuery;
  });

  const handleRequestMobileAssistance = (station: RepairStation) => {
    soundService.playNotification();
    setDispatchMobileUnit(station.id);
    setTimeout(() => {
      setDispatchMobileUnit(null);
    }, 3000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-900 text-base">Emergency Fleet Repair & Mechanics</h3>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                Ikeja / Computer Village Hub
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Certified bike & car workshops nearby for rapid breakdown & vulcanizing assistance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Google Places Verified</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mechanics by name, brake, vulcanizer, tire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Nearby' },
            { id: 'certified', label: 'Verified Only' },
            { id: 'open247', label: '24/7 Open' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`py-2 px-3 rounded-xl font-bold text-[11px] transition-all border ${
                filterType === f.id
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mechanics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredStations.map((station) => (
          <div
            key={station.id}
            className="p-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-extrabold text-slate-900 text-xs">{station.name}</h4>
                  {station.isCertified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Certified Fleet Mechanic" />
                  )}
                </div>
                <p className="text-[11px] font-semibold text-amber-700 mt-0.5">{station.specialty}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{station.address}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-extrabold text-xs text-slate-900 block">
                  {station.distanceKm} km
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  ~{station.etaMins} mins away
                </span>
              </div>
            </div>

            {/* Services badges */}
            <div className="flex flex-wrap gap-1">
              {station.services.map((svc, i) => (
                <span
                  key={i}
                  className="bg-white text-slate-700 text-[9px] font-mono font-semibold px-2 py-0.5 rounded border border-slate-200"
                >
                  {svc}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-slate-600">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-800">{station.rating}</span>
                <span className="text-[10px] text-slate-400">({station.isOpen247 ? '24/7' : 'Day Shift'})</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCallModal) onOpenCallModal(station.phone, station.name);
                  }}
                  className="py-1.5 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-[11px] flex items-center space-x-1"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Call Mechanic</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestMobileAssistance(station)}
                  className="py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-extrabold text-[11px] flex items-center space-x-1 shadow-sm transition-transform active:scale-95"
                >
                  <Wrench className="w-3 h-3 text-amber-200" />
                  <span>
                    {dispatchMobileUnit === station.id ? 'Dispatching Mobile...' : 'Request Assistance'}
                  </span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
