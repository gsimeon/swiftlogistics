import React, { useState } from 'react';
import { Calendar, Clock, Store, Send, CheckCircle2, AlertCircle, X, Sparkles, Repeat, ShieldCheck, Truck, Bike } from 'lucide-react';
import { Store as StoreType, VehicleType } from '../types';
import { MOCK_STORES } from '../data/mockData';
import { soundService } from '../services/soundService';

interface DeliverySchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleOrder: (scheduledJob: ScheduledDeliveryJob) => void;
}

export interface ScheduledDeliveryJob {
  id: string;
  orderNumber: string;
  recipientName: string;
  recipientAddress: string;
  scheduledPickupTime: string;
  scheduledPickupDate: string;
  store: StoreType;
  vehicleType: VehicleType;
  priority: 'Standard' | 'Rush High-Priority' | 'Catering Batch';
  itemsCount: number;
  totalEstimated: number;
  repeatFrequency: 'One-Time' | 'Daily' | 'Weekly Mon-Fri';
  status: 'Queued for Dispatch';
}

export const DeliverySchedulerModal: React.FC<DeliverySchedulerModalProps> = ({
  isOpen,
  onClose,
  onScheduleOrder,
}) => {
  const [selectedStore, setSelectedStore] = useState<StoreType>(MOCK_STORES[0]);
  const [recipientName, setRecipientName] = useState('Chief Adewale');
  const [recipientAddress, setRecipientAddress] = useState('Block 4, Ikeja GRA Executive Suites, Lagos');
  const [scheduledDate, setScheduledDate] = useState('2026-08-09');
  const [scheduledTime, setScheduledTime] = useState('09:30');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorcycle');
  const [priority, setPriority] = useState<'Standard' | 'Rush High-Priority' | 'Catering Batch'>('Rush High-Priority');
  const [repeatFrequency, setRepeatFrequency] = useState<'One-Time' | 'Daily' | 'Weekly Mon-Fri'>('One-Time');
  const [itemsCount, setItemsCount] = useState<number>(3);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(42.50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playNotification();

    const newJob: ScheduledDeliveryJob = {
      id: `sch-${Math.floor(10000 + Math.random() * 90000)}`,
      orderNumber: `SCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientName,
      recipientAddress,
      scheduledPickupDate: scheduledDate,
      scheduledPickupTime: scheduledTime,
      store: selectedStore,
      vehicleType,
      priority,
      itemsCount,
      totalEstimated: estimatedPrice,
      repeatFrequency,
      status: 'Queued for Dispatch',
    };

    onScheduleOrder(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Schedule Future Delivery Dispatch</h3>
              <p className="text-xs text-slate-500">
                Queue orders for automated driver assignment at specified future dates & times
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Store Origin & Recipient Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dispatching Store Hub</label>
              <select
                value={selectedStore.id}
                onChange={(e) => {
                  const s = MOCK_STORES.find((st) => st.id === e.target.value);
                  if (s) setSelectedStore(s);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              >
                {MOCK_STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.address.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Recipient Delivery Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scheduled Date & Time Pickers */}
          <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-200/80">
            <div>
              <label className="font-extrabold text-blue-900 block mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Future Dispatch Date</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full p-2 bg-white border border-blue-300 rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-extrabold text-blue-900 block mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Target Pickup Time</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full p-2 bg-white border border-blue-300 rounded-lg font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Vehicle Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="motorcycle">Motorcycle Express</option>
                <option value="van">Cargo Van</option>
                <option value="bicycle">Bicycle Green Eco</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Job Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Standard">Standard Delivery</option>
                <option value="Rush High-Priority">Rush High-Priority</option>
                <option value="Catering Batch">Catering Heavy Batch</option>
              </select>
            </div>
          </div>

          {/* Repeat Schedule */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center space-x-1">
              <Repeat className="w-3.5 h-3.5 text-slate-500" />
              <span>Recurring Schedule Frequency</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'One-Time', label: 'One-Time' },
                { id: 'Daily', label: 'Daily Repeat' },
                { id: 'Weekly Mon-Fri', label: 'Mon-Fri Weekly' },
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setRepeatFrequency(freq.id as any)}
                  className={`py-2 px-2 rounded-xl font-bold text-[11px] border transition-all ${
                    repeatFrequency === freq.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Automated Dispatch Engine will ping nearest driver <strong>15 minutes</strong> before {scheduledTime} on {scheduledDate}.
            </span>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="font-mono font-extrabold text-sm text-slate-900">
              Est. Total: ${estimatedPrice.toFixed(2)}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Confirm & Queue Job</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
