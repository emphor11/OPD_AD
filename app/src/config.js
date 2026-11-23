// CareQueue - Application Configuration

/**
 * Replace this with your computer's local Wi-Fi IP address when testing on a physical phone via Expo Go
 * (e.g. 'http://192.168.1.5:5001').
 * For iOS Simulator or Android Emulator, localhost or 10.0.2.2 can also be used.
 */
export const SERVER_URL = 'http://localhost:5001';
export const API_URL = `${SERVER_URL}/api`;
export const SOCKET_URL = SERVER_URL;

export default {
  SERVER_URL,
  API_URL,
  SOCKET_URL,
};
