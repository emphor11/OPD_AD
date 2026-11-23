import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../utils/constants';

const FREE_BEDS = [
  { _id: 'b-2', bedNo: 'ICU-02', type: 'icu', ward: 'Critical Care Block A' },
  { _id: 'b-9', bedNo: 'ICU-05', type: 'icu', ward: 'Emergency Trauma Ward' },
];

export default function AssignBedScreen({ route, navigation }) {
  const { admissionId = 'adm-001', patientName = 'Ramesh Gupta', bedType = 'icu' } =
    route.params || {};

  const [selectedBedId, setSelectedBedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmAdmission = () => {
    if (!selectedBedId) {
      Alert.alert('Selection Required', 'Please select a vacant bed to assign.');
      return;
    }

    const assigned = FREE_BEDS.find((b) => b._id === selectedBedId);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Patient Admitted! 🏥',
        `${patientName} has been admitted and assigned to Bed ${assigned?.bedNo}.`,
        [
          {
            text: 'Return to Admissions',
            onPress: () => navigation.navigate('Admissions'),
          },
        ]
      );
    }, 600);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Text style={styles.title}>Assign Bed for Admission</Text>
        <Text style={styles.patient}>Patient: {patientName}</Text>
        <Text style={styles.bedType}>
          Target Bed Category: <Text style={{ fontWeight: '700' }}>{bedType.toUpperCase()}</Text>
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Available Vacant Beds</Text>

      <FlatList
        data={FREE_BEDS}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isSelected = selectedBedId === item._id;
          return (
            <TouchableOpacity
              onPress={() => setSelectedBedId(item._id)}
              activeOpacity={0.8}
            >
              <Card style={[styles.bedCard, isSelected && styles.bedCardSelected]}>
                <View style={styles.bedRow}>
                  <View>
                    <Text style={[styles.bedNo, isSelected && styles.bedNoSelected]}>
                      {item.bedNo}
                    </Text>
                    <Text style={styles.ward}>{item.ward}</Text>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="⚠️"
            title="No Vacant Beds"
            message={`No available ${bedType.toUpperCase()} beds found in this hospital.`}
          />
        }
      />

      <View style={styles.footer}>
        <Button
          title="Confirm Bed Assignment & Admit"
          onPress={handleConfirmAdmission}
          loading={submitting}
          disabled={!selectedBedId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    margin: 14,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  patient: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginTop: 6,
  },
  bedType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 14,
  },
  bedCard: {
    marginBottom: 8,
    padding: 14,
  },
  bedCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primaryLight,
  },
  bedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedNo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bedNoSelected: {
    color: COLORS.primaryDark,
  },
  ward: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  radioSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  footer: {
    padding: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
