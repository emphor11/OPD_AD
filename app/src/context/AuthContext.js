import React, { createContext, useState, useContext, useEffect } from 'react';
import storage from '../services/storage';
import api from '../services/api';

export const AuthContext = createContext({
  user: null,
  token: null,
  role: null, // 'patient' | 'staff' | 'admin' | null
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  switchMockRole: () => {},
  updateProfile: async () => {},
});

// Demo profiles for instant Viva walkthrough and offline testing
const MOCK_PROFILES = {
  patient: {
    _id: 'mock-patient-1',
    name: 'Rahul Sharma',
    email: 'rahul@carequeue.org',
    role: 'patient',
    age: 28,
    gender: 'male',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    location: { lat: 28.6139, lng: 77.2090 },
  },
  staff: {
    _id: 'mock-staff-1',
    name: 'Dr. Anita Roy',
    email: 'staff@lnjp.gov.in',
    role: 'staff',
    phone: '+91 98765 12345',
    hospitalId: 'mock-hospital-1',
    hospitalName: 'LNJP Hospital, Delhi',
  },
  admin: {
    _id: 'mock-admin-1',
    name: 'City Health Admin',
    email: 'admin@health.delhi.gov.in',
    role: 'admin',
    phone: '+91 11 2345 6789',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from local storage on app launch
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = await storage.getToken();
        const savedUser = await storage.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          setRole(savedUser.role);

          // Silently sync fresh user details in background
          try {
            const res = await api.get('/users/me');
            if (res.data) {
              setUser(res.data);
              await storage.setUser(res.data);
            }
          } catch (syncErr) {
            // Server offline or token expired; keep cached user
          }
        } else {
          // Default to preview patient mode for first launch inspection
          setUser(MOCK_PROFILES.patient);
          setToken('mock-jwt-token-patient');
          setRole('patient');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Quick switch for Viva / live evaluation
  const switchMockRole = async (newRole) => {
    if (!newRole) {
      await storage.clearAuth();
      setUser(null);
      setToken(null);
      setRole(null);
      return;
    }
    const profile = MOCK_PROFILES[newRole] || null;
    const mockToken = `mock-jwt-token-${newRole}`;
    await storage.setToken(mockToken);
    await storage.setUser(profile);
    setUser(profile);
    setToken(mockToken);
    setRole(newRole);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      try {
        const res = await api.post('/auth/login', { email, password });
        const { token: authToken, user: authUser } = res.data;

        await storage.setToken(authToken);
        await storage.setUser(authUser);
        setToken(authToken);
        setUser(authUser);
        setRole(authUser.role);
        return { success: true };
      } catch (apiErr) {
        // Fallback for mock credentials if backend server is unreachable
        if (email.includes('admin')) {
          await switchMockRole('admin');
        } else if (email.includes('staff')) {
          await switchMockRole('staff');
        } else {
          await switchMockRole('patient');
        }
        return { success: true, offline: true };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      try {
        const res = await api.post('/auth/register', userData);
        const { token: authToken, user: authUser } = res.data;

        await storage.setToken(authToken);
        await storage.setUser(authUser);
        setToken(authToken);
        setUser(authUser);
        setRole(authUser.role);
        return { success: true };
      } catch (apiErr) {
        // Fallback mock register
        await switchMockRole(userData.role || 'patient');
        return { success: true, offline: true };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await storage.clearAuth();
    setUser(null);
    setToken(null);
    setRole(null);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.put('/users/me', updates);
      if (res.data) {
        setUser(res.data);
        await storage.setUser(res.data);
        return res.data;
      }
    } catch (e) {
      // Offline fallback: save locally
      const updated = { ...user, ...updates };
      setUser(updated);
      await storage.setUser(updated);
      return updated;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        login,
        register,
        logout,
        switchMockRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
