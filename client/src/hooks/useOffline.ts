// Custom hook for offline functionality
import { useState, useEffect } from 'react';
import { offlineStorage } from '@/lib/offlineStorage';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when back online
      offlineStorage.syncOfflineActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for offline data and pending actions
    const checkOfflineState = async () => {
      try {
        const lastSync = await offlineStorage.getOfflineData('lastSync');
        setHasOfflineData(!!lastSync);

        const actions = await offlineStorage.getOfflineActions();
        setPendingActions(actions.length);
      } catch (error) {
        console.error('Failed to check offline state:', error);
      }
    };

    checkOfflineState();

    // Check periodically for pending actions
    const interval = setInterval(checkOfflineState, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const saveForOffline = async (key: string, data: any) => {
    try {
      await offlineStorage.saveOfflineData(key, data);
      setHasOfflineData(true);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  const getOfflineData = async (key: string) => {
    try {
      return await offlineStorage.getOfflineData(key);
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  };

  const queueOfflineAction = async (
    type: 'create' | 'update' | 'delete',
    endpoint: string,
    data?: any,
    method: string = 'POST'
  ) => {
    try {
      await offlineStorage.saveOfflineAction({
        type,
        endpoint,
        data,
        method,
        timestamp: Date.now(),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update pending actions count
      const actions = await offlineStorage.getOfflineActions();
      setPendingActions(actions.length);
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  };

  return {
    isOnline,
    hasOfflineData,
    pendingActions,
    saveForOffline,
    getOfflineData,
    queueOfflineAction
  };
}