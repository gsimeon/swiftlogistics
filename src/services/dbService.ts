import { DeliveryOrder, ChatMessage, AppNotification } from '../types';

const DB_NAME = 'SwiftLogixIndexedDB';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('active_order')) {
        db.createObjectStore('active_order', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('completed_orders')) {
        db.createObjectStore('completed_orders', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('chat_messages')) {
        db.createObjectStore('chat_messages', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveActiveOrderToDB = async (order: DeliveryOrder | null) => {
  try {
    const db = await initDB();
    const tx = db.transaction('active_order', 'readwrite');
    const store = tx.objectStore('active_order');
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    if (order) {
      store.put(order);
    }
  } catch (err) {
    console.warn('IndexedDB saveActiveOrder error:', err);
  }
};

export const getActiveOrderFromDB = async (): Promise<DeliveryOrder | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction('active_order', 'readonly');
    const store = tx.objectStore('active_order');
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const result = request.result;
        resolve(result && result.length > 0 ? result[0] : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB getActiveOrder error:', err);
    return null;
  }
};

export const saveCompletedOrdersToDB = async (orders: DeliveryOrder[]) => {
  try {
    const db = await initDB();
    const tx = db.transaction('completed_orders', 'readwrite');
    const store = tx.objectStore('completed_orders');
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    orders.forEach((ord) => store.put(ord));
  } catch (err) {
    console.warn('IndexedDB saveCompletedOrders error:', err);
  }
};

export const getCompletedOrdersFromDB = async (): Promise<DeliveryOrder[] | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction('completed_orders', 'readonly');
    const store = tx.objectStore('completed_orders');
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result && request.result.length > 0 ? request.result : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

export const saveChatMessagesToDB = async (messages: ChatMessage[]) => {
  try {
    const db = await initDB();
    const tx = db.transaction('chat_messages', 'readwrite');
    const store = tx.objectStore('chat_messages');
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    messages.forEach((msg) => store.put(msg));
  } catch (err) {
    console.warn('IndexedDB saveChatMessages error:', err);
  }
};

export const getChatMessagesFromDB = async (): Promise<ChatMessage[] | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction('chat_messages', 'readonly');
    const store = tx.objectStore('chat_messages');
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result && request.result.length > 0 ? request.result : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

export const saveNotificationsToDB = async (notifications: AppNotification[]) => {
  try {
    const db = await initDB();
    const tx = db.transaction('notifications', 'readwrite');
    const store = tx.objectStore('notifications');
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    notifications.forEach((notif) => store.put(notif));
  } catch (err) {
    console.warn('IndexedDB saveNotifications error:', err);
  }
};

export const getNotificationsFromDB = async (): Promise<AppNotification[] | null> => {
  try {
    const db = await initDB();
    const tx = db.transaction('notifications', 'readonly');
    const store = tx.objectStore('notifications');
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result && request.result.length > 0 ? request.result : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};
