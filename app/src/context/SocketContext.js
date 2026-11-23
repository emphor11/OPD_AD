import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinSession,
  leaveSession,
  joinAdmission,
  leaveAdmission,
} from '../services/socket';

export const SocketContext = createContext({
  socket: null,
  isConnected: false,
  joinSession: () => {},
  leaveSession: () => {},
  joinAdmission: () => {},
  leaveAdmission: () => {},
});

export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token) {
      const s = connectSocket(token);
      setSocket(s);

      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [token]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinSession,
        leaveSession,
        joinAdmission,
        leaveAdmission,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
