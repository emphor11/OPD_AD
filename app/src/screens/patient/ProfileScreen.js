import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [age, setAge] = useState(user?.age ? String(user.age) : '28');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      updateProfile({ name, phone, age: parseInt(age, 10), bloodGroup });
      Alert.alert('Profile Updated', 'Your medical profile has been saved.');
    }, 500);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of CareQueue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User Header */}
      <Card style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name ? name[0] : 'U'}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email || 'patient@carequeue.org'}</Text>
        <StatusBadge
          status="waiting"
          label={`Role: ${user?.role ? user.role.toUpperCase() : 'PATIENT'}`}
          style={styles.badge}
        />
      </Card>

      {/* Profile Form */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Medical & Contact Information</Text>

        <Input label="Full Name" value={name} onChangeText={setName} />
        <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Blood Group" value={bloodGroup} onChangeText={setBloodGroup} />
          </View>
        </View>

        <Button
          title="Save Profile Changes"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </Card>

      {/* Emergency Assistance */}
      <Card style={styles.emergencyCard}>
        <Text style={styles.emTitle}>🚨 Delhi Emergency Ambulance</Text>
        <Text style={styles.emText}>Central Emergency Health Helpline: 102 / 112</Text>
      </Card>

      {/* Logout Action */}
      <Button
        title="Log Out"
        variant="outline"
        onPress={handleLogout}
        style={styles.logoutBtn}
        textStyle={{ color: COLORS.danger }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  userCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    marginTop: 8,
  },
  formCard: {
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    marginTop: 12,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    padding: 14,
    marginBottom: 12,
  },
  emTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  emText: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
  },
  logoutBtn: {
    borderColor: COLORS.dangerLight,
    marginTop: 8,
  },
});
