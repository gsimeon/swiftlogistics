import React, { useState } from 'react';
import { Store, Driver, DeliveryItem, VehicleType, DeliveryOrder } from '../types';
import { Store as StoreIcon, Package, Send, Plus, Trash2, Truck, Bike, ShieldCheck, MapPin, CheckCircle2, Route, Sparkles, BarChart2, Flame, Box, Calendar, ShieldAlert, Clock } from 'lucide-react';
import { MOCK_STORES, MOCK_DRIVERS, CURRENT_CLIENT, MOCK_ROUTE_PATH } from '../data/mockData';
import { soundService } from '../services/soundService';
import { TopDriversLeaderboard } from './TopDriversLeaderboard';
import { StoreStopOptimizer } from './StoreStopOptimizer';
import { AdvancedDriverAnalytics } from './AdvancedDriverAnalytics';
import { DemandHeatmapOverlay } from './DemandHeatmapOverlay';
import { PackingGuideWidget } from './PackingGuideWidget';
import { DeliverySchedulerModal, ScheduledDeliveryJob } from './DeliverySchedulerModal';
import { PunctualityReviewModal } from './PunctualityReviewModal';
import { BatchNeighborhoodDispatch } from './BatchNeighborhoodDispatch';
import { FleetPerformanceChart } from './FleetPerformanceChart';

interface StoreDispatcherProps {
  onDispatchNewOrder: (newOrder: DeliveryOrder) => void;
  onSwitchToClientView: () => void;
  apiKey?: string;
  isSimulatedMobile?: boolean;
}

export const StoreDispatcher: React.FC<StoreDispatcherProps> = ({
  onDispatchNewOrder,
  onSwitchToClientView,
  apiKey = '',
  isSimulatedMobile = false,
}) => {
  const [activeDispatcherTab, setActiveDispatcherTab] = useState<'single' | 'batch_neighborhood' | 'batch_optimizer' | 'driver_analytics' | 'demand_heatmap' | 'fleet_performance'>('single');
  const [selectedStore, setSelectedStore] = useState<Store>(MOCK_STORES[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('motorcycle');
  const [recipientName, setRecipientName] = useState('David Miller');
  const [recipientPhone, setRecipientPhone] = useState('+234 803 301 4492');
  const [recipientAddress, setRecipientAddress] = useState('Suite 12, Isaac John Street, GRA Ikeja, Lagos, Nigeria');
  
  // Delivery Scheduler Modal & Scheduled Queue State
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledDeliveryJob[]>([
    {
      id: 'sch-901',
      orderNumber: 'SCH-2026-4412',
      recipientName: 'Dr. Angela Cole',
      recipientAddress: 'Lagoon Hospital Admin Annex, Mobolaji Bank Anthony Way, Ikeja',
      scheduledPickupDate: 'Tomorrow',
      scheduledPickupTime: '08:30 AM',
      store: MOCK_STORES[0],
      vehicleType: 'motorcycle',
      priority: 'Rush High-Priority',
      itemsCount: 2,
      totalEstimated: 35.00,
      repeatFrequency: 'Daily',
      status: 'Queued for Dispatch',
    },
  ]);

  // Punctuality Review Modal State for Low Punctuality Driver Alert (<80%)
  const [isPunctualityModalOpen, setIsPunctualityModalOpen] = useState(false);
  const [alertDriver, setAlertDriver] = useState({ name: 'Ibrahim Bello', punctualityScore: 68 });

  const [items, setItems] = useState<DeliveryItem[]>([
    { id: 'item-101', name: 'Premium Noise-Canceling Headphones', quantity: 1, price: 189.99 },
    { id: 'item-102', name: 'Fast USB-C Charger Kit', quantity: 1, price: 29.50 },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const addItem = () => {
    if (!newItemName || !newItemPrice) return;
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        name: newItemName,
        quantity: 1,
        price: parseFloat(newItemPrice) || 10.00,
      },
    ]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const deliveryFee = selectedVehicle === 'van' ? 14.50 : selectedVehicle === 'motorcycle' ? 8.50 : 5.00;
  const total = subtotal + deliveryFee;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    soundService.playNotification();

    const assignedRider = MOCK_DRIVERS.find((d) => d.vehicleType === selectedVehicle) || MOCK_DRIVERS[0];

    const newOrder: DeliveryOrder = {
      id: `ord-${Math.floor(10000 + Math.random() * 90000)}`,
      orderNumber: `LP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      client: {
        ...CURRENT_CLIENT,
        name: recipientName,
        phone: recipientPhone,
        address: recipientAddress,
      },
      store: selectedStore,
      driver: assignedRider,
      items: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tip: 4.00,
      total: total + 4.00,
      status: 'driver_assigned',
      createdAt: new Date().toISOString(),
      estimatedMinutes: selectedVehicle === 'motorcycle' ? 9 : 14,
      pickupOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      deliveryPin: `${Math.floor(1000 + Math.random() * 9000)}`,
      routeCoordinates: MOCK_ROUTE_PATH,
      currentDriverLocation: selectedStore.location,
      paymentStatus: 'held_in_escrow',
      paymentMethod: 'credit_card',
      notes: 'Fragile handling required.',
    };

    onDispatchNewOrder(newOrder);
    onSwitchToClientView();
  };

  return (
    <div className={isSimulatedMobile ? "w-full px-2 py-3.5 space-y-4 animate-fadeIn text-slate-800 dark:text-slate-100" : "max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn"}>
      
      {/* Automated Low Punctuality Score Store Manager Notification Banner (<80%) */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500/90 p-4 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-rose-500 text-white text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                STORE MANAGER ALERT
              </span>
              <span className="text-xs text-amber-300 font-bold font-mono">
                {alertDriver.name}: {alertDriver.punctualityScore}% Punctuality (&lt; 80%)
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-1">
              Automated system alert: Driver historical punctuality has dropped below required SLA threshold. Store manager review required.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundService.playNotification();
            setIsPunctualityModalOpen(true);
          }}
          className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shrink-0 shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Prompt Review Session</span>
        </button>
      </div>

      {/* Dispatcher Header & Mode Selector Tabs */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-2xl text-slate-800 tracking-tight flex items-center space-x-2">
              <StoreIcon className="w-6 h-6 text-blue-600" />
              <span>Store Dispatch Control Center</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Create express product delivery requests & assign nearby riders instantly.</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Delivery Scheduler Button */}
            <button
              type="button"
              onClick={() => {
                soundService.playNotification();
                setIsSchedulerOpen(true);
              }}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-xs flex items-center space-x-2 shadow-md transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Future Delivery</span>
            </button>

            <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500">Active Riders:</span>
              <span className="font-bold text-green-700">{MOCK_DRIVERS.length} Online</span>
            </div>
          </div>
        </div>

        {/* Dispatcher Tool Mode Selector Tabs */}
        <div className={`pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center ${isSimulatedMobile ? 'overflow-x-auto gap-2 py-2 px-1 scrollbar-none snap-x' : 'space-x-2'} text-xs`}>
          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveDispatcherTab('single');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeDispatcherTab === 'single'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Single Express Order Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveDispatcherTab('batch_neighborhood');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeDispatcherTab === 'batch_neighborhood'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Ikeja Batch Dispatch</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveDispatcherTab('batch_optimizer');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeDispatcherTab === 'batch_optimizer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Route className="w-4 h-4 text-blue-400" />
            <span>Google Distance Matrix Stop Optimizer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveDispatcherTab('demand_heatmap');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeDispatcherTab === 'demand_heatmap'
                ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Demand Heatmap Overlay</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveDispatcherTab('driver_analytics');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeDispatcherTab === 'driver_analytics'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-rose-400" />
            <span>Driver Churn Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playNotification();
              setActiveDispatcherTab('fleet_performance');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              activeDispatcherTab === 'fleet_performance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Fleet Performance</span>
          </button>
        </div>
      </div>

      {activeDispatcherTab === 'batch_neighborhood' ? (
        <BatchNeighborhoodDispatch
          onDispatchBatchOrder={(batchOrder) => {
            onDispatchNewOrder(batchOrder);
          }}
          onSwitchToClientView={onSwitchToClientView}
        />
      ) : activeDispatcherTab === 'demand_heatmap' ? (
        <DemandHeatmapOverlay apiKey={apiKey} />
      ) : activeDispatcherTab === 'driver_analytics' ? (
        <AdvancedDriverAnalytics />
      ) : activeDispatcherTab === 'fleet_performance' ? (
        <FleetPerformanceChart />
      ) : activeDispatcherTab === 'batch_optimizer' ? (
        <StoreStopOptimizer
          store={selectedStore}
          assignedDriver={MOCK_DRIVERS[0]}
          onDispatchBatchOrder={(batchOrder) => {
            onDispatchNewOrder(batchOrder);
          }}
          onSwitchToClientView={onSwitchToClientView}
        />
      ) : (
        <form onSubmit={handleDispatch} className={isSimulatedMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-3 gap-6"}>
        
        {/* Form Column (2 Cols) */}
        <div className={isSimulatedMobile ? "space-y-4" : "md:col-span-2 space-y-6"}>
          
          {/* Store Selection */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Store Branch</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {MOCK_STORES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStore(st)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedStore.id === st.id
                      ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate font-bold text-slate-800">{st.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{st.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Client Recipient Info */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient Details</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Client Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-600 mb-1 font-medium">Delivery Address</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Package Manifest Builder */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Package Items</label>

            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-800 font-medium">{it.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-slate-900">${it.price.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item form */}
            <div className="flex space-x-2 pt-2 text-xs">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add store product item..."
                className="flex-1 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Price $"
                className="w-24 bg-slate-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-bold flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Packing Guide Checklist */}
          <PackingGuideWidget items={items} />

        </div>

        {/* Vehicle Dispatch & Cost Summary (1 Col) */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Vehicle Dispatch Mode</label>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedVehicle('motorcycle')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${
                  selectedVehicle === 'motorcycle'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bike className="w-5 h-5 text-blue-600" />
                  <span>Express Motorcycle (Fastest)</span>
                </div>
                <span className="font-mono font-bold">$8.50</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVehicle('van')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${
                  selectedVehicle === 'van'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Cargo Van (Heavy Items)</span>
                </div>
                <span className="font-mono font-bold">$14.50</span>
              </button>
            </div>

            {/* Cost Summary */}
            <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dispatch Fee</span>
                <span className="font-mono">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
                <span>Escrow Total</span>
                <span className="text-blue-400">${(total + 4.00).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Rider Immediately</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundService.playNotification();
                  setIsSchedulerOpen(true);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-300 shadow-sm text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-98"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Schedule Future Delivery</span>
              </button>
            </div>

          </div>

        </div>

      </form>
      )}

      {/* Scheduled Future Jobs Queue Section */}
      {scheduledJobs.length > 0 && (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-slate-800 text-sm">Automated Scheduled Delivery Jobs Queue</h3>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-mono font-bold px-2 py-0.5 rounded-full">
              {scheduledJobs.length} Job(s) Queued
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {scheduledJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{job.orderNumber}</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      {job.scheduledPickupDate} @ {job.scheduledPickupTime}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    To: {job.recipientName} ({job.recipientAddress})
                  </p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span>Priority: {job.priority}</span>
                    <span>•</span>
                    <span>Repeat: {job.repeatFrequency}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundService.playNotification();
                    setScheduledJobs((prev) => prev.filter((j) => j.id !== job.id));
                  }}
                  className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg shrink-0 border border-rose-200"
                >
                  Cancel Queue
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Drivers Fleet Leaderboard */}
      <TopDriversLeaderboard
        title="Ikeja Dispatch Fleet Leaderboard"
        onSelectDriver={(driver) => {
          setSelectedVehicle(driver.vehicleType);
        }}
      />

      {/* Modals */}
      <DeliverySchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onScheduleOrder={(job) => {
          setScheduledJobs((prev) => [job, ...prev]);
        }}
      />

      <PunctualityReviewModal
        isOpen={isPunctualityModalOpen}
        onClose={() => setIsPunctualityModalOpen(false)}
        driverName={alertDriver.name}
        punctualityScore={alertDriver.punctualityScore}
        onScheduleReviewSession={(details) => {
          soundService.playNotification();
        }}
      />

    </div>
  );
};
