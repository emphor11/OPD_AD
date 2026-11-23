import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CityDashboardScreen from '../screens/admin/CityDashboardScreen';
import HospitalsVerifyScreen from '../screens/admin/HospitalsVerifyScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primaryDark },
        headerTintColor: COLORS.textInverse,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="CityDashboard"
        component={CityDashboardScreen}
        options={{ title: 'Delhi Central Health Grid' }}
      />
      <Stack.Screen
        name="HospitalsVerify"
        component={HospitalsVerifyScreen}
        options={{ title: 'Verify Hospital Centers' }}
      />
    </Stack.Navigator>
  );
}
