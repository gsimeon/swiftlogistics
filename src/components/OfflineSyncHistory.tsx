import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Clock, MapPin, Database, Zap, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { offlineSyncService, QueuedStatusUpdate } from '../services/offlineSyncService';
import { soundService } from '../services/soundService';

export interface SyncedHistoryItem {
  id: string;
  type: 'location_ping' | 'status_update' | 'telemetry' | 'geofence_arrival';
  orderNumber?: string;
  title: string;
  details: string;
  queuedAt: string;
  syncedAt: string;
  coords?: { lat: number; lng: number };
}

const INITIAL_MOCK_SYNCED_LOGS: SyncedHistoryItem[] = [
  {
    id: 'synced-101',
    type: 'geofence_arrival',
    orderNumber: 'ORD-8821',
    title: '50m Geofence Auto-Arrival Triggered',
    details: 'Driver entered 48.2m perimeter of Slot Computer Village Ikeja',
    queuedAt: new Date(Date.now() - 35 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    syncedAt: new Date(Date.now() - 32 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    coords: { lat: 6.5935, lng: 3.3425 },
  },
  {
    id: 'synced-102',
    type: 'location_ping',
    title: 'GPS Location Telemetry Ping',
    details: 'Otigba Street, Computer Village, Speed: 24 km/h',
    queuedAt: new Date(Date.now() - 25 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    syncedAt: new Date(Date.now() - 22 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    coords: { lat: 6.5941, lng: 3.3431 },
  },
  {
    id: 'synced-103',
    type: 'status_update',
    orderNumber: 'ORD-8821',
    title: 'Order Status Changed: Out for Delivery',
    details: 'Package picked up from store counter and verified with QR code',
    queuedAt: new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    syncedAt: new Date(Date.now() - 14 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const OfflineSyncHistory: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(offlineSyncService.getOnlineStatus());
  const [pendingQueue, setPendingQueue] = useState<QueuedStatusUpdate[]>(offlineSyncService.getQueue());
  const [syncedLogs, setSyncedLogs] = useState<SyncedHistoryItem[]>(INITIAL_MOCK_SYNCED_LOGS);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((onlineStatus, queue) => {
      setIsOnline(onlineStatus);
      setPendingQueue(queue);
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    if (pendingQueue.length === 0) return;
    setIsSyncing(true);
    soundService.playNotification();

    const newSyncedItems: SyncedHistoryItem[] = pendingQueue.map((item) => ({
      id: `synced-${Date.now()}-${Math.random()}`,
      type: 'status_update',
      orderNumber: item.orderNumber,
      title: `Status Updated: ${item.status}`,
      details: item.notes || `Location: ${item.location ? `${item.location.lat.toFixed(4)}, ${item.location.lng.toFixed(4)}` : 'GPS Standard'}`,
      queuedAt: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      coords: item.location,
    }));

    await offlineSyncService.syncPendingUpdates();
    setSyncedLogs((prev) => [...newSyncedItems, ...prev]);
    setIsSyncing(false);
  };

  const handleSimulateOfflinePing = () => {
    soundService.playNotification();
    offlineSyncService.queueStatusUpdate({
      orderId: 'ord-sim',
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'in_transit',
      location: { lat: 6.5935, lng: 3.3425 },
      notes: 'Queued GPS location ping recorded while network signal lost',
    });
  };

  const toggleNetworkConnection = () => {
    soundService.playNotification();
    const targetState = !isOnline;
    offlineSyncService.setSimulatedOnlineStatus(targetState);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl border ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-900 text-base">Offline Sync Engine & History</h3>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {isOnline ? 'ONLINE - SYNCED' : 'OFFLINE QUEUING'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automatic caching of location pings and status updates during cellular dead zones
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleNetworkConnection}
            className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all border ${
              isOnline ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isOnline ? <WifiOff className="w-3.5 h-3.5 text-rose-500" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Simulate Offline' : 'Reconnect Online'}</span>
          </button>

          {pendingQueue.length > 0 && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync Queue (${pendingQueue.length})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Queue Warning Banner */}
      {pendingQueue.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              <strong>{pendingQueue.length} unsynced item(s)</strong> stored locally in IndexedDB/LocalStorage.
            </span>
          </div>
          <button
            onClick={handleSimulateOfflinePing}
            className="text-[10px] bg-amber-200/80 hover:bg-amber-200 font-bold px-2 py-1 rounded text-amber-900"
          >
            + Add Test Ping
          </button>
        </div>
      )}

      {/* Synced Log Items Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recent Reconnection & Sync Logs ({syncedLogs.length})</span>
          </div>
          <button
            onClick={handleSimulateOfflinePing}
            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold"
          >
            + Simulate Location Ping
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {syncedLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900">{log.title}</span>
                  {log.orderNumber && (
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold font-mono px-1.5 py-0.5 rounded">
                      {log.orderNumber}
                    </span>
                  )}
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Synced</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">{log.details}</p>
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                  <span>Queued: {log.queuedAt}</span>
                  <span>•</span>
                  <span>Synced to Cloud: {log.syncedAt}</span>
                  {log.coords && (
                    <>
                      <span>•</span>
                      <span>
                        GPS ({log.coords.lat.toFixed(4)}, {log.coords.lng.toFixed(4)})
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-1 bg-white border border-slate-200 rounded-lg shrink-0">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
