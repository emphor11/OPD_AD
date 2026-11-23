import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../utils/constants';

const PENDING_HOSPITALS = [
  {
    _id: 'hosp-unverified-1',
    name: 'Deen Dayal Upadhyay (DDU) Hospital',
    address: 'Clock Tower, Hari Nagar, New Delhi - 110064',
    phone: '+91 11 2549 4404',
    registeredBy: 'Dr. R.K. Mehra (Medical Superintendent)',
    departmentsCount: 6,
    verified: false,
  },
];

export default function HospitalsVerifyScreen() {
  const [hospitals, setHospitals] = useState(PENDING_HOSPITALS);

  const handleVerify = (hospital) => {
    Alert.alert(
      'Verify Hospital?',
      `Approve ${hospital.name} to join the Delhi Health Grid? It will immediately become visible to patients.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve & Verify',
          onPress: () => {
            setHospitals((prev) => prev.filter((h) => h._id !== hospital._id));
            Alert.alert('Hospital Verified! ✅', `${hospital.name} is now active.`);
          },
        },
      ]
    );
  };

  const handleReject = (hospital) => {
    Alert.alert('Reject Hospital', `Reject registration for ${hospital.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setHospitals((prev) => prev.filter((h) => h._id !== hospital._id));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.address}>📍 {item.address}</Text>
        </View>
        <StatusBadge status="pending" label="Pending" />
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>📞 Contact: {item.phone}</Text>
        <Text style={styles.detailText}>👤 Submitted by: {item.registeredBy}</Text>
        <Text style={styles.detailText}>🏥 Configured Departments: {item.departmentsCount}</Text>
      </View>

      <View style={styles.actionRow}>
        <Button
          title="Approve & Verify"
          variant="primary"
          style={styles.actionBtn}
          onPress={() => handleVerify(item)}
        />
        <Button
          title="Reject"
          variant="outline"
          style={styles.actionBtn}
          textStyle={{ color: COLORS.danger }}
          onPress={() => handleReject(item)}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={hospitals}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="✅"
            title="All Caught Up!"
            message="No hospitals are currently awaiting administrative verification."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  address: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  details: {
    marginVertical: 10,
    backgroundColor: COLORS.surfaceMuted,
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    marginVertical: 0,
  },
});
