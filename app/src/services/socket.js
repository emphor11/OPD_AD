import io from 'socket.io-client';
import { SOCKET_URL } from '../config';

let socket = null;

export const connectSocket = (token) => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to CareQueue real-time server:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket Connection Error]', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinSession = (sessionId) => {
  if (socket && socket.connected && sessionId) {
    socket.emit('join_session', { sessionId });
  }
};

export const leaveSession = (sessionId) => {
  if (socket && socket.connected && sessionId) {
    socket.emit('leave_session', { sessionId });
  }
};

export const joinAdmission = (admissionId) => {
  if (socket && socket.connected && admissionId) {
    socket.emit('join_admission', { admissionId });
  }
};

export const leaveAdmission = (admissionId) => {
  if (socket && socket.connected && admissionId) {
    socket.emit('leave_admission', { admissionId });
  }
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  joinSession,
  leaveSession,
  joinAdmission,
  leaveAdmission,
};
