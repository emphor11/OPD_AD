import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { NetworkProvider, useNetwork } from './src/context/NetworkContext';
import OfflineBanner from './src/components/OfflineBanner';
import RootNavigator from './src/navigation/RootNavigator';

function MainApp() {
  const { isConnected, lastUpdated } = useNetwork();

  return (
    <>
      <StatusBar style="light" />
      {!isConnected && <OfflineBanner lastUpdated={lastUpdated} />}
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <SocketProvider>
            <MainApp />
          </SocketProvider>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
