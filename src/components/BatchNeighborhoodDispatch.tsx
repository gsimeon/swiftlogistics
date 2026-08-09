import React, { useState } from 'react';
import { DeliveryOrder, Driver, Store } from '../types';
import { MOCK_DRIVERS, MOCK_STORES, CURRENT_CLIENT, MOCK_ROUTE_PATH } from '../data/mockData';
import { soundService } from '../services/soundService';
import { Layers, MapPin, Truck, Bike, Package, CheckCircle2, Sparkles, Send, Zap, ChevronRight, Users, ShieldCheck, Route } from 'lucide-react';

interface NeighborhoodCluster {
  id: string;
  neighborhoodName: string;
  landmark: string;
  color: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    recipientName: string;
    recipientAddress: string;
    itemsCount: number;
    subtotal: number;
    distanceKm: number;
  }>;
  suggestedDriver: Driver;
  totalValue: number;
  estimatedMinutes: number;
  isDispatched?: boolean;
}

interface BatchNeighborhoodDispatchProps {
  onDispatchBatchOrder: (newOrder: DeliveryOrder) => void;
  onSwitchToClientView: () => void;
}

export const BatchNeighborhoodDispatch: React.FC<BatchNeighborhoodDispatchProps> = ({
  onDispatchBatchOrder,
  onSwitchToClientView,
}) => {
  const [clusters, setClusters] = useState<NeighborhoodCluster[]>([
    {
      id: 'cluster-comp-village',
      neighborhoodName: 'Computer Village Zone',
      landmark: 'No. 13 Adepele / Medical Road, Ikeja',
      color: 'border-blue-500 bg-blue-950/20 text-blue-300',
      orders: [
        { id: 'b-101', orderNumber: 'LP-CV-991', recipientName: 'Kemi Adebayo', recipientAddress: 'Tech Plaza, Computer Village, Ikeja', itemsCount: 3, subtotal: 420.00, distanceKm: 1.2 },
        { id: 'b-102', orderNumber: 'LP-CV-992', recipientName: 'Oluwaseun Bakare', recipientAddress: 'Medical Road Annex, Ikeja', itemsCount: 1, subtotal: 110.50, distanceKm: 1.5 },
      ],
      suggestedDriver: MOCK_DRIVERS[0], // Alex Vance (Motorcycle)
      totalValue: 530.50,
      estimatedMinutes: 12,
    },
    {
      id: 'cluster-allen-avenue',
      neighborhoodName: 'Allen Avenue Commercial Hub',
      landmark: 'Allen Avenue / Toyin Junction, Ikeja',
      color: 'border-emerald-500 bg-emerald-950/20 text-emerald-300',
      orders: [
        { id: 'b-201', orderNumber: 'LP-AL-881', recipientName: 'Dr. Angela Cole', recipientAddress: 'Suite 44, Allen Avenue Commercial Tower, Ikeja', itemsCount: 2, subtotal: 290.00, distanceKm: 2.8 },
        { id: 'b-202', orderNumber: 'LP-AL-882', recipientName: 'Chidi Nwosu', recipientAddress: 'Toyin Street Corner Mall, Ikeja', itemsCount: 4, subtotal: 640.00, distanceKm: 3.1 },
      ],
      suggestedDriver: MOCK_DRIVERS[1], // Ibrahim Bello (Van)
      totalValue: 930.00,
      estimatedMinutes: 18,
    },
    {
      id: 'cluster-gra-ikeja',
      neighborhoodName: 'GRA Ikeja Residential Belt',
      landmark: 'Isaac John Street / Joel Ogunnaike, GRA Ikeja',
      color: 'border-amber-500 bg-amber-950/20 text-amber-300',
      orders: [
        { id: 'b-301', orderNumber: 'LP-GRA-771', recipientName: 'David Miller', recipientAddress: '12 Isaac John Street, GRA Ikeja', itemsCount: 2, subtotal: 219.49, distanceKm: 4.2 },
      ],
      suggestedDriver: MOCK_DRIVERS[2], // Fatima Abubakar (Bicycle)
      totalValue: 219.49,
      estimatedMinutes: 15,
    },
  ]);

  const [dispatchedClusterIds, setDispatchedClusterIds] = useState<Set<string>>(new Set());

  const handleDispatchCluster = (cluster: NeighborhoodCluster) => {
    soundService.playNotification();

    // Create aggregated batched delivery order
    const batchedOrder: DeliveryOrder = {
      id: `batch-${Date.now()}`,
      orderNumber: `BATCH-IKJ-${Math.floor(1000 + Math.random() * 9000)}`,
      client: {
        ...CURRENT_CLIENT,
        name: `${cluster.orders[0].recipientName} (+${cluster.orders.length - 1} Batch Stop)`,
        address: `${cluster.neighborhoodName} (${cluster.landmark})`,
      },
      store: MOCK_STORES[0],
      driver: cluster.suggestedDriver,
      items: cluster.orders.map((o) => ({
        id: o.id,
        name: `Batch Order #${o.orderNumber} (${o.itemsCount} items)`,
        quantity: 1,
        price: o.subtotal,
      })),
      subtotal: cluster.totalValue,
      deliveryFee: 15.00,
      tip: 6.00,
      total: cluster.totalValue + 21.00,
      status: 'driver_assigned',
      createdAt: new Date().toISOString(),
      estimatedMinutes: cluster.estimatedMinutes,
      pickupOtp: '8821',
      deliveryPin: '5519',
      routeCoordinates: MOCK_ROUTE_PATH,
      currentDriverLocation: MOCK_STORES[0].location,
      paymentStatus: 'held_in_escrow',
      paymentMethod: 'credit_card',
      notes: `Neighborhood Batch Dispatch: ${cluster.neighborhoodName} (${cluster.orders.length} stops)`,
    };

    setDispatchedClusterIds((prev) => new Set(prev).add(cluster.id));
    onDispatchBatchOrder(batchedOrder);
  };

  const handleDispatchAllBatches = () => {
    soundService.playNotification();
    clusters.forEach((cls) => {
      if (!dispatchedClusterIds.has(cls.id)) {
        handleDispatchCluster(cls);
      }
    });
    setTimeout(() => {
      onSwitchToClientView();
    }, 600);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-2xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/30 text-blue-400 rounded-2xl border border-blue-500/40">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-lg text-white">Ikeja Neighborhood Batch Dispatch</h3>
              <span className="text-[10px] font-mono font-bold bg-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase">
                AUTOMATED CLUSTERING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregates unassigned Ikeja orders by geographic proximity & assigns nearby riders for multi-stop efficiency.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDispatchAllBatches}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-lg transition-transform active:scale-95 flex items-center space-x-2 shrink-0"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Auto-Dispatch All Neighborhood Batches</span>
        </button>
      </div>

      {/* Cluster Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusters.map((cluster) => {
          const isDispatched = dispatchedClusterIds.has(cluster.id);

          return (
            <div
              key={cluster.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${cluster.color} ${
                isDispatched ? 'opacity-60 border-emerald-500/50 bg-emerald-950/20' : 'hover:border-slate-600'
              }`}
            >
              <div className="space-y-3">
                {/* Cluster Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block">
                      Geographic Cluster
                    </span>
                    <h4 className="font-extrabold text-base text-white">{cluster.neighborhoodName}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">{cluster.landmark}</span>
                    </p>
                  </div>

                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white">
                    {cluster.orders.length} Stops
                  </span>
                </div>

                {/* Orders in Cluster */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Clustered Deliveries
                  </span>
                  {cluster.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{ord.recipientName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{ord.recipientAddress}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-400 text-xs">
                        ${ord.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Assigned Nearest Driver */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Nearest Rider Assigned</span>
                    <span className="text-emerald-400 font-mono font-bold">PROXIMITY MATCH</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={cluster.suggestedDriver.avatar}
                      alt={cluster.suggestedDriver.name}
                      className="w-8 h-8 rounded-full object-cover border border-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{cluster.suggestedDriver.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Truck className="w-3 h-3 text-blue-400" />
                        <span className="capitalize">{cluster.suggestedDriver.vehicleType}</span>
                        <span>• ⭐ {cluster.suggestedDriver.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cluster Action Footer */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Total Batch Value:</span>
                  <span className="font-extrabold text-white text-sm">${cluster.totalValue.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  disabled={isDispatched}
                  onClick={() => handleDispatchCluster(cluster)}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-transform active:scale-95 ${
                    isDispatched
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  {isDispatched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Cluster Dispatched to Rider</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch {cluster.neighborhoodName} Batch</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
