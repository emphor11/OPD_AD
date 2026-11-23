import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { COLORS } from '../../utils/constants';

const MEDICINES = [
  { _id: 'm-1', name: 'Paracetamol 500mg', available: 240, unit: 'tablets' },
  { _id: 'm-2', name: 'Amoxicillin 250mg', available: 45, unit: 'strips' },
  { _id: 'm-3', name: 'Normal Saline IV 500ml', available: 18, unit: 'bottles' },
  { _id: 'm-4', name: 'Cetirizine 10mg', available: 180, unit: 'tablets' },
];

export default function DispenseScreen({ navigation }) {
  const [selectedMedId, setSelectedMedId] = useState(MEDICINES[0]._id);
  const [tokenNo, setTokenNo] = useState('GM-014');
  const [patientName, setPatientName] = useState('Rahul Sharma');
  const [quantity, setQuantity] = useState('10');
  const [loading, setLoading] = useState(false);

  const selectedMed = MEDICINES.find((m) => m._id === selectedMedId);

  const handleDispense = () => {
    const qtyNum = parseInt(quantity, 10);
    if (!qtyNum || qtyNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid dispensation quantity.');
      return;
    }
    if (selectedMed && qtyNum > selectedMed.available) {
      Alert.alert('Insufficient Stock', `Only ${selectedMed.available} ${selectedMed.unit} available.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Medicine Dispensed! 💊',
        `Dispensed ${quantity} ${selectedMed?.unit} of ${selectedMed?.name} to ${patientName} (${tokenNo}). Stock has been deducted.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Dispense Medicine / Consumables</Text>
        <Text style={styles.subtitle}>
          Deduct dispensed medication linked to patient OPD token or admission.
        </Text>

        {/* Medicine Selector */}
        <Text style={styles.label}>Select Medicine *</Text>
        <View style={styles.medPicker}>
          {MEDICINES.map((med) => {
            const isSelected = selectedMedId === med._id;
            return (
              <TouchableOpacity
                key={med._id}
                onPress={() => setSelectedMedId(med._id)}
                style={[styles.medOption, isSelected && styles.medOptionSelected]}
              >
                <Text style={[styles.medName, isSelected && styles.medNameSelected]}>
                  {med.name}
                </Text>
                <Text style={styles.medStock}>
                  Available: {med.available} {med.unit}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Patient OPD Token No."
          value={tokenNo}
          onChangeText={setTokenNo}
          placeholder="e.g. GM-014"
        />

        <Input
          label="Patient Name"
          value={patientName}
          onChangeText={setPatientName}
          placeholder="e.g. Rahul Sharma"
        />

        <Input
          label={`Quantity to Dispense (${selectedMed?.unit || 'units'}) *`}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="e.g. 10"
          keyboardType="numeric"
        />

        <Button
          title="Confirm & Record Dispensation"
          onPress={handleDispense}
          loading={loading}
          style={styles.submitBtn}
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
    marginVertical: 6,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  medPicker: {
    gap: 8,
    marginBottom: 12,
  },
  medOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  medOptionSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  medNameSelected: {
    color: COLORS.primaryDark,
  },
  medStock: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    marginTop: 16,
  },
});
