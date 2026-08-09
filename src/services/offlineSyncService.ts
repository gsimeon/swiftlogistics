export interface QueuedStatusUpdate {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  timestamp: string;
  location?: { lat: number; lng: number };
  notes?: string;
}

const LOCAL_STORAGE_KEY = 'SWIFT_LOGIX_OFFLINE_QUEUE';

class OfflineSyncService {
  private queue: QueuedStatusUpdate[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(isOnline: boolean, queue: QueuedStatusUpdate[]) => void> = [];

  constructor() {
    this.loadQueueFromStorage();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnlineStatus.bind(this));
      window.addEventListener('offline', this.handleOfflineStatus.bind(this));
    }
  }

  private loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load offline status queue:', e);
      this.queue = [];
    }
  }

  private saveQueueToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline status queue:', e);
    }
    this.notifyListeners();
  }

  private handleOnlineStatus() {
    this.isOnline = true;
    console.log('🌐 Network connection restored. Triggering automatic offline API sync...');
    this.syncPendingUpdates();
  }

  private handleOfflineStatus() {
    this.isOnline = false;
    console.warn('⚠️ Network connection lost. Offline queuing active.');
    this.notifyListeners();
  }

  public subscribe(listener: (isOnline: boolean, queue: QueuedStatusUpdate[]) => void) {
    this.listeners.push(listener);
    listener(this.isOnline, this.queue);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.isOnline, this.queue));
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public setSimulatedOnlineStatus(status: boolean) {
    this.isOnline = status;
    if (status) {
      this.syncPendingUpdates();
    } else {
      this.notifyListeners();
    }
  }

  public getQueue(): QueuedStatusUpdate[] {
    return [...this.queue];
  }

  public queueStatusUpdate(update: Omit<QueuedStatusUpdate, 'id' | 'timestamp'>): QueuedStatusUpdate {
    const newEntry: QueuedStatusUpdate = {
      ...update,
      id: `off-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(newEntry);
    this.saveQueueToStorage();
    return newEntry;
  }

  public async syncPendingUpdates(): Promise<{ syncedCount: number; remainingCount: number }> {
    if (this.queue.length === 0) {
      return { syncedCount: 0, remainingCount: 0 };
    }

    console.log(`⚡ Syncing ${this.queue.length} offline status updates to API...`);

    // Simulate backend API sync latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const syncedCount = this.queue.length;
    this.queue = [];
    this.saveQueueToStorage();

    return { syncedCount, remainingCount: 0 };
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueueToStorage();
  }
}

export const offlineSyncService = new OfflineSyncService();
