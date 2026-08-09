import React from 'react';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Package, 
  MapPin, 
  Award, 
  X, 
  TrendingUp,
  Download,
  Calendar,
  Fuel
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface ShiftTripItem {
  id: string;
  orderNumber: string;
  storeName: string;
  clientName: string;
  destination: string;
  completedAt: string;
  payout: string;
  distanceKm: number;
}

interface DailyShiftReportModalProps {
  driverName: string;
  driverAvatar: string;
  vehiclePlate: string;
  vehicleType: string;
  rating: number;
  onClose: () => void;
}

export const DailyShiftReportModal: React.FC<DailyShiftReportModalProps> = ({
  driverName,
  driverAvatar,
  vehiclePlate,
  vehicleType,
  rating,
  onClose,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shiftTrips: ShiftTripItem[] = [
    {
      id: 'st-1',
      orderNumber: 'LP-8842',
      storeName: 'Ikeja TechHub Electronics',
      clientName: 'David Miller',
      destination: 'Isaac John St, Ikeja GRA',
      completedAt: '09:45 AM',
      payout: '$28.50',
      distanceKm: 4.8,
    },
    {
      id: 'st-2',
      orderNumber: 'LP-8859',
      storeName: 'Oba Akran Fast Courier Hub',
      clientName: 'Amina Yusuf',
      destination: 'Allen Avenue, Ikeja',
      completedAt: '11:20 AM',
      payout: '$32.00',
      distanceKm: 6.2,
    },
    {
      id: 'st-3',
      orderNumber: 'LP-8871',
      storeName: 'Computer Village Accessories',
      clientName: 'Babatunde Raji',
      destination: 'Opebi Road, Ikeja',
      completedAt: '01:15 PM',
      payout: '$24.00',
      distanceKm: 3.5,
    },
    {
      id: 'st-4',
      orderNumber: 'LP-8890',
      storeName: 'Maryland Mall Gourmet',
      clientName: 'Sandra Ebuka',
      destination: 'Mobolaji Bank Anthony Way',
      completedAt: '02:40 PM',
      payout: '$36.50',
      distanceKm: 7.1,
    },
  ];

  const handlePrint = () => {
    soundService.playNotification();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Printable Section Wrapper */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 print:p-0 print:border-none">
          
          {/* Header Bar */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                  <span>Daily Dispatch Shift Summary</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                    Verified Shift
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentDate} • Ikeja Central Dispatch Zone</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-transform active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Driver & Vehicle Metadata */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <img
                src={driverAvatar}
                alt={driverName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Rider Name</span>
                <span className="font-extrabold text-sm text-slate-900">{driverName}</span>
                <span className="text-[11px] text-blue-600 font-bold block">⭐ {rating} Rating</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle Info</span>
              <span className="font-extrabold text-sm text-slate-900 capitalize">{vehicleType}</span>
              <span className="text-[11px] font-mono text-slate-600 block">Plate: {vehiclePlate}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Shift Hours</span>
              <span className="font-extrabold text-sm text-slate-900">08:00 AM - 04:30 PM</span>
              <span className="text-[11px] text-emerald-600 font-bold block">7.5 Hours Logged</span>
            </div>
          </div>

          {/* Shift KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Net Payout</span>
              <div className="text-xl font-extrabold font-mono text-emerald-400">$163.50</div>
              <span className="text-[10px] text-slate-400">$121.00 base + $42.50 tips</span>
            </div>

            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Completed Deliveries</span>
              <div className="text-xl font-extrabold font-mono text-blue-400">4 Trips</div>
              <span className="text-[10px] text-emerald-400">100% On-Time SLA</span>
            </div>

            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Distance</span>
              <div className="text-xl font-extrabold font-mono text-amber-400">21.6 km</div>
              <span className="text-[10px] text-slate-400">Avg 5.4 km/trip</span>
            </div>

            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Trip Duration</span>
              <div className="text-xl font-extrabold font-mono text-white">18 mins</div>
              <span className="text-[10px] text-emerald-400">-4 mins below SLA</span>
            </div>
          </div>

          {/* Completed Trips Breakdown Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider text-[11px]">
              Itemized Shift Delivery Logs
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-600 grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wider">
                <span className="col-span-2">Order #</span>
                <span className="col-span-3">Pickup Hub</span>
                <span className="col-span-3">Destination</span>
                <span className="col-span-2 text-center">Completed</span>
                <span className="col-span-2 text-right">Payout</span>
              </div>

              {shiftTrips.map((trip) => (
                <div key={trip.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-50">
                  <span className="col-span-2 font-mono font-bold text-blue-600">{trip.orderNumber}</span>
                  <div className="col-span-3 font-semibold text-slate-800 truncate">{trip.storeName}</div>
                  <div className="col-span-3 text-slate-600 truncate">{trip.destination}</div>
                  <span className="col-span-2 text-center font-mono text-slate-500">{trip.completedAt}</span>
                  <span className="col-span-2 text-right font-mono font-extrabold text-emerald-600">{trip.payout}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature & Audit Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Report Generated by <strong>LogisticsPro Dispatch Engine v2.8</strong></span>
            </div>

            <div className="text-right">
              <span className="font-mono text-[10px] text-slate-400 block">SHA-256 Audit: 9d8f7a...3c21</span>
              <span className="font-bold text-slate-700 text-xs">Status: Approved for Payroll Sync</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
