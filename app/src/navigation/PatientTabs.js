import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

// Patient Screens
import HomeScreen from '../screens/patient/HomeScreen';
import HospitalsScreen from '../screens/patient/HospitalsScreen';
import HospitalDetailScreen from '../screens/patient/HospitalDetailScreen';
import BookTokenScreen from '../screens/patient/BookTokenScreen';
import MyTokenScreen from '../screens/patient/MyTokenScreen';
import AdmissionRequestScreen from '../screens/patient/AdmissionRequestScreen';
import MyAdmissionsScreen from '../screens/patient/MyAdmissionsScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

// Shared Screens
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

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CareQueue Delhi' }} />
      <Stack.Screen name="MyToken" component={MyTokenScreen} options={{ title: 'Live OPD Queue' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

function HospitalsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Hospitals" component={HospitalsScreen} options={{ title: 'Nearby Hospitals & Beds' }} />
      <Stack.Screen name="HospitalDetail" component={HospitalDetailScreen} options={{ title: 'Hospital Information' }} />
      <Stack.Screen name="BookToken" component={BookTokenScreen} options={{ title: 'Book OPD Token' }} />
      <Stack.Screen name="AdmissionRequest" component={AdmissionRequestScreen} options={{ title: 'Emergency Admission' }} />
      <Stack.Screen name="MyToken" component={MyTokenScreen} options={{ title: 'Live OPD Queue' }} />
    </Stack.Navigator>
  );
}

function MyVisitsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MyAdmissions" component={MyAdmissionsScreen} options={{ title: 'My Hospital Admissions' }} />
      <Stack.Screen name="AdmissionDetail" component={AdmissionDetailScreen} options={{ title: 'Admission & Chat' }} />
      <Stack.Screen name="MyToken" component={MyTokenScreen} options={{ title: 'Live OPD Queue' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Medical Profile' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

export default function PatientTabs() {
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
          if (route.name === 'HomeTab') icon = '🏠';
          else if (route.name === 'HospitalsTab') icon = '🏥';
          else if (route.name === 'MyVisitsTab') icon = '📋';
          else if (route.name === 'ProfileTab') icon = '👤';
          return <Text style={{ fontSize: focused ? 20 : 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="HospitalsTab" component={HospitalsStack} options={{ tabBarLabel: 'Hospitals' }} />
      <Tab.Screen name="MyVisitsTab" component={MyVisitsStack} options={{ tabBarLabel: 'My Visits' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
