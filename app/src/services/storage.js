import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: 'carequeue_token',
  USER: 'carequeue_user',
  OFFLINE_QUEUE: 'carequeue_offline_queue',
};

export const storage = {
  // Token
  async getToken() {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch (e) {
      console.error('Error reading auth token:', e);
      return null;
    }
  },

  async setToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(KEYS.TOKEN, token);
      } else {
        await AsyncStorage.removeItem(KEYS.TOKEN);
      }
    } catch (e) {
      console.error('Error saving auth token:', e);
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem(KEYS.TOKEN);
    } catch (e) {
      console.error('Error removing auth token:', e);
    }
  },

  // User
  async getUser() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading user:', e);
      return null;
    }
  },

  async setUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(KEYS.USER);
      }
    } catch (e) {
      console.error('Error saving user:', e);
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
    } catch (e) {
      console.error('Error removing user:', e);
    }
  },

  // Clear all auth state
  async clearAuth() {
    try {
      await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
    } catch (e) {
      console.error('Error clearing auth:', e);
    }
  },

  // Generic Cache helper
  async getCache(key) {
    try {
      const data = await AsyncStorage.getItem(`cache:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  async setCache(key, data) {
    try {
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Error caching key ${key}:`, e);
    }
  },

  async removeCache(key) {
    try {
      await AsyncStorage.removeItem(`cache:${key}`);
    } catch (e) {
      console.error(`Error removing cache key ${key}:`, e);
    }
  },
};

export default storage;
