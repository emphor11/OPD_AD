import React, { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext({
  user: null,
  token: null,
  role: null, // 'patient' | 'staff' | 'admin' | null
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  switchMockRole: () => {},
  updateProfile: async () => {},
});

// Demo profiles for instant testing & Viva walkthrough
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
    location: { lat: 28.6139, lng: 77.2090 }, // Delhi Central
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
  const [user, setUser] = useState(MOCK_PROFILES.patient);
  const [token, setToken] = useState('mock-jwt-token-carequeue');
  const [role, setRole] = useState('patient'); // default to patient for preview
  const [isLoading, setIsLoading] = useState(false);

  // Switch roles on the fly (useful during Phase 1 preview & testing)
  const switchMockRole = (newRole) => {
    if (!newRole) {
      setUser(null);
      setToken(null);
      setRole(null);
      return;
    }
    setUser(MOCK_PROFILES[newRole] || null);
    setToken(`mock-jwt-token-${newRole}`);
    setRole(newRole);
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Temporary mock login logic; real API integrated in Phase 2
      if (email.includes('admin')) {
        switchMockRole('admin');
      } else if (email.includes('staff')) {
        switchMockRole('staff');
      } else {
        switchMockRole('patient');
      }
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      switchMockRole(userData.role || 'patient');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    switchMockRole(null);
  };

  const updateProfile = async (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
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
