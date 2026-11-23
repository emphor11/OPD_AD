import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { DEFAULT_DEPARTMENTS, COLORS } from '../../utils/constants';

export default function HospitalSetupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [lat, setLat] = useState('28.6139');
  const [lng, setLng] = useState('77.2090');
  const [departments] = useState(DEFAULT_DEPARTMENTS);
  const [saving, setSaving] = useState(false);

  const handleRegisterHospital = () => {
    if (!name || !address || !phone) {
      Alert.alert('Required Fields', 'Please complete hospital name, address, and phone number.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert(
        'Hospital Registered! 🏥',
        'Your hospital profile has been submitted for City Administration verification.',
        [{ text: 'Proceed to Dashboard', onPress: () => navigation.navigate('Dashboard') }]
      );
    }, 700);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Register Hospital Center</Text>
        <Text style={styles.subtitle}>
          Setup your healthcare facility to activate live OPD queuing and city bed synchronization.
        </Text>

        <Input label="Hospital Full Name *" placeholder="e.g. Lok Nayak Hospital (LNJP)" value={name} onChangeText={setName} />
        <Input label="Complete Address *" placeholder="e.g. Delhi Gate, New Delhi - 110002" value={address} onChangeText={setAddress} multiline numberOfLines={2} />
        <Input label="Emergency Phone *" placeholder="+91 11 2323 3000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Latitude (GPS)" value={lat} onChangeText={setLat} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Longitude (GPS)" value={lng} onChangeText={setLng} keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Default OPD Departments ({departments.length})</Text>
        <View style={styles.deptList}>
          {departments.map((d) => (
            <View key={d.code} style={styles.deptChip}>
              <Text style={styles.deptCode}>{d.code}</Text>
              <Text style={styles.deptName}>{d.name}</Text>
            </View>
          ))}
        </View>

        <Button
          title="Submit for Admin Verification"
          onPress={handleRegisterHospital}
          loading={saving}
          style={styles.btn}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  card: {
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginVertical: 8,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 14,
    marginBottom: 8,
  },
  deptList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  deptChip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deptCode: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginRight: 4,
  },
  deptName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  btn: {
    marginTop: 8,
  },
});
