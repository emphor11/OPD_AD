import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

// Staff Screens
import DashboardScreen from '../screens/staff/DashboardScreen';
import HospitalSetupScreen from '../screens/staff/HospitalSetupScreen';
import OPDControlScreen from '../screens/staff/OPDControlScreen';
import BedsScreen from '../screens/staff/BedsScreen';
import AdmissionsScreen from '../screens/staff/AdmissionsScreen';
import AssignBedScreen from '../screens/staff/AssignBedScreen';
import StockScreen from '../screens/staff/StockScreen';
import DispenseScreen from '../screens/staff/DispenseScreen';

// Shared
import AdmissionDetailScreen from '../screens/shared/AdmissionDetailScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.textInverse,
  headerTitleStyle: { fontWeight: '700' },
};

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Staff Hospital Console' }} />
      <Stack.Screen name="HospitalSetup" component={HospitalSetupScreen} options={{ title: 'Hospital Configuration' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

function OPDStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="OPDControl" component={OPDControlScreen} options={{ title: 'OPD Queue Management' }} />
    </Stack.Navigator>
  );
}

function BedsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Beds" component={BedsScreen} options={{ title: 'Bed Census & Maintenance' }} />
    </Stack.Navigator>
  );
}

function AdmissionsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Admissions" component={AdmissionsScreen} options={{ title: 'Admission Requests' }} />
      <Stack.Screen name="AssignBed" component={AssignBedScreen} options={{ title: 'Assign Vacant Bed' }} />
      <Stack.Screen name="AdmissionDetail" component={AdmissionDetailScreen} options={{ title: 'Triage & Chat' }} />
    </Stack.Navigator>
  );
}

function StockStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Stock" component={StockScreen} options={{ title: 'Pharmacy & Stock' }} />
      <Stack.Screen name="Dispense" component={DispenseScreen} options={{ title: 'Dispense Medicines' }} />
    </Stack.Navigator>
  );
}

export default function StaffTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused }) => {
          let icon = '•';
          if (route.name === 'DashboardTab') icon = '📊';
          else if (route.name === 'OPDTab') icon = '👥';
          else if (route.name === 'BedsTab') icon = '🛏️';
          else if (route.name === 'AdmissionsTab') icon = '🚨';
          else if (route.name === 'StockTab') icon = '💊';
          return <Text style={{ fontSize: focused ? 20 : 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardStack} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="OPDTab" component={OPDStack} options={{ tabBarLabel: 'OPD' }} />
      <Tab.Screen name="BedsTab" component={BedsStack} options={{ tabBarLabel: 'Beds' }} />
      <Tab.Screen name="AdmissionsTab" component={AdmissionsStack} options={{ tabBarLabel: 'Admissions' }} />
      <Tab.Screen name="StockTab" component={StockStack} options={{ tabBarLabel: 'Stock' }} />
    </Tab.Navigator>
  );
}
