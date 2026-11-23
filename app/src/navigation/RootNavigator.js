import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import PatientTabs from './PatientTabs';
import StaffTabs from './StaffTabs';
import AdminStack from './AdminStack';
import Loader from '../components/Loader';

export default function RootNavigator() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen message="Loading CareQueue..." />;
  }

  return (
    <NavigationContainer>
      {!role && <AuthStack />}
      {role === 'patient' && <PatientTabs />}
      {role === 'staff' && <StaffTabs />}
      {role === 'admin' && <AdminStack />}
    </NavigationContainer>
  );
}
