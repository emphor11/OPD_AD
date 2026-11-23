import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import offlineQueue from '../services/offlineQueue';
import api from '../services/api';

export const NetworkContext = createContext({
  isConnected: true,
  isInternetReachable: true,
  appState: 'active',
  lastUpdated: null,
});

export function NetworkProvider({ children }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const prevConnectedRef = useRef(true);

  // Monitor Network Connectivity (NetInfo)
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && (state.isInternetReachable ?? true);
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);

      // Reconnection Event: Offline -> Online transition
      if (!prevConnectedRef.current && connected) {
        console.log('[Network] Connection restored! Flushing offline queue...');
        setLastUpdated(new Date().toLocaleTimeString());
        offlineQueue.processQueue(api);
      }

      prevConnectedRef.current = connected;
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  // Monitor Application Lifecycle (AppState: Background -> Foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[Lifecycle] App resumed to foreground. Refetching live queue data...');
        setLastUpdated(new Date().toLocaleTimeString());
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        appState,
        lastUpdated,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkContext);
