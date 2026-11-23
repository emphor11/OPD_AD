import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { BED_TYPES, COLORS } from '../../utils/constants';

const INITIAL_BEDS = [
  { _id: 'b-1', bedNo: 'ICU-01', type: 'icu', ward: 'Critical Care Block A', status: 'occupied', patientName: 'Deepak Rao' },
  { _id: 'b-2', bedNo: 'ICU-02', type: 'icu', ward: 'Critical Care Block A', status: 'free', patientName: null },
  { _id: 'b-3', bedNo: 'ICU-03', type: 'icu', ward: 'Critical Care Block A', status: 'maintenance', patientName: null },
  { _id: 'b-4', bedNo: 'GEN-101', type: 'general', ward: 'Ward 3 (Male)', status: 'free', patientName: null },
  { _id: 'b-5', bedNo: 'GEN-102', type: 'general', ward: 'Ward 3 (Male)', status: 'occupied', patientName: 'Sanjay Kumar' },
  { _id: 'b-6', bedNo: 'OXY-01', type: 'oxygen', ward: 'Respiratory Ward B', status: 'free', patientName: null },
  { _id: 'b-7', bedNo: 'VENT-01', type: 'ventilator', ward: 'Trauma Center', status: 'occupied', patientName: 'Kunal Verma' },
  { _id: 'b-8', bedNo: 'PED-01', type: 'pediatric', ward: 'Child Health Ward', status: 'free', patientName: null },
];

export default function BedsScreen() {
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const [selectedType, setSelectedType] = useState('all');

  const filteredBeds = selectedType === 'all' ? beds : beds.filter((b) => b.type === selectedType);

  const toggleBedStatus = (bed) => {
    const nextStatus =
      bed.status === 'free' ? 'occupied' : bed.status === 'occupied' ? 'maintenance' : 'free';

    setBeds((prev) =>
      prev.map((b) =>
        b._id === bed._id
          ? {
              ...b,
              status: nextStatus,
              patientName: nextStatus === 'occupied' ? (b.patientName || 'Admitted Patient') : null,
            }
          : b
      )
    );
  };

  const handleAddBed = () => {
    Alert.alert('Add Bed', 'Quickly create a new bed in this facility.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add General Bed',
        onPress: () => {
          const newBed = {
            _id: `b-${Date.now()}`,
            bedNo: `GEN-${beds.length + 101}`,
            type: 'general',
            ward: 'General Ward Extension',
            status: 'free',
            patientName: null,
          };
          setBeds([newBed, ...beds]);
        },
      },
    ]);
  };

  const renderBedItem = ({ item }) => (
    <Card style={styles.bedCard}>
      <View style={styles.bedHeader}>
        <View>
          <Text style={styles.bedNumber}>{item.bedNo}</Text>
          <Text style={styles.bedWard}>{item.ward}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.bedDetails}>
        <Text style={styles.bedType}>
          Category: <Text style={{ fontWeight: '700' }}>{item.type.toUpperCase()}</Text>
        </Text>
        {item.patientName ? (
          <Text style={styles.patientInfo}>Occupant: {item.patientName}</Text>
        ) : (
          <Text style={styles.readyText}>Ready for immediate patient assignment</Text>
        )}
      </View>

      <View style={styles.actionRow}>
        <Button
          title={`Toggle State: ${item.status.toUpperCase()}`}
          variant="outline"
          style={styles.toggleBtn}
          textStyle={{ fontSize: 13 }}
          onPress={() => toggleBedStatus(item)}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Bed Type Filter Pills */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ key: 'all', label: 'All Beds' }, ...BED_TYPES]}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedType(item.key)}
              style={[
                styles.filterPill,
                selectedType === item.key && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedType === item.key && styles.filterPillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bed Management List */}
      <FlatList
        data={filteredBeds}
        keyExtractor={(item) => item._id}
        renderItem={renderBedItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <Button title="+ Add New Bed" onPress={handleAddBed} style={styles.addBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceMuted,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: COLORS.textInverse,
  },
  list: {
    padding: 14,
  },
  bedCard: {
    marginBottom: 10,
    padding: 14,
  },
  bedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bedNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bedWard: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bedDetails: {
    marginVertical: 8,
  },
  bedType: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  patientInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  readyText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 4,
  },
  actionRow: {
    marginTop: 6,
  },
  toggleBtn: {
    height: 36,
    marginVertical: 0,
  },
  footer: {
    padding: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addBtn: {
    marginVertical: 0,
  },
});
