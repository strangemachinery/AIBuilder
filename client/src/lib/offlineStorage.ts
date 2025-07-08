// Offline storage utilities for mobile app functionality
import { Resource, ActivityLogEntry, TimelineEvent, LearningGoal } from "@shared/schema";

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
  method: string;
  headers: Record<string, string>;
}

interface OfflineData {
  resources: Resource[];
  activity: ActivityLogEntry[];
  timeline: TimelineEvent[];
  goals: LearningGoal[];
  stats: any;
  lastSync: number;
}

class OfflineStorageManager {
  private dbName = 'ai-learning-hub-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp');
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'url' });
          cacheStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async saveOfflineData(key: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      
      const request = store.put({
        key,
        data,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineData(key: string): Promise<any> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveOfflineAction(action: Omit<OfflineAction, 'id'>): Promise<void> {
    if (!this.db) await this.initDB();

    const fullAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      const request = store.add(fullAction);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeOfflineAction(id: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearOfflineActions(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cacheAPIResponse(url: string, data: any): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      const request = store.put({
        url,
        data,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedAPIResponse(url: string): Promise<any> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        // Check if cache is still valid (24 hours)
        if (result && Date.now() - result.timestamp < 24 * 60 * 60 * 1000) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Helper method to check if we're online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Save current data for offline access
  async syncDataForOffline(): Promise<void> {
    try {
      if (!this.isOnline()) return;

      // Fetch and cache all essential data
      const endpoints = [
        '/api/resources',
        '/api/activity',
        '/api/timeline',
        '/api/goals',
        '/api/stats'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            await this.cacheAPIResponse(endpoint, data);
          }
        } catch (error) {
          console.warn(`Failed to cache ${endpoint}:`, error);
        }
      }

      await this.saveOfflineData('lastSync', Date.now());
    } catch (error) {
      console.error('Failed to sync data for offline:', error);
    }
  }

  // Sync offline actions when back online
  async syncOfflineActions(): Promise<void> {
    if (!this.isOnline()) return;

    try {
      const actions = await this.getOfflineActions();
      
      for (const action of actions) {
        try {
          const response = await fetch(action.endpoint, {
            method: action.method,
            headers: action.headers,
            body: action.data ? JSON.stringify(action.data) : undefined
          });

          if (response.ok) {
            await this.removeOfflineAction(action.id);
          }
        } catch (error) {
          console.warn(`Failed to sync action ${action.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync offline actions:', error);
    }
  }
}

export const offlineStorage = new OfflineStorageManager();

// Initialize offline storage
offlineStorage.initDB().catch(console.error);

// Auto-sync when back online
window.addEventListener('online', () => {
  offlineStorage.syncOfflineActions();
  offlineStorage.syncDataForOffline();
});

// Periodic sync for offline data
setInterval(() => {
  if (navigator.onLine) {
    offlineStorage.syncDataForOffline();
  }
}, 5 * 60 * 1000); // Every 5 minutes