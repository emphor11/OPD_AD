import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { BED_TYPES, COLORS } from '../../utils/constants';

export default function AdmissionRequestScreen({ route, navigation }) {
  const { hospitalId = 'hosp-1', hospitalName = 'LNJP Hospital, Delhi' } = route.params || {};

  const [bedType, setBedType] = useState('general');
  const [urgency, setUrgency] = useState('normal'); // 'normal' | 'urgent' | 'critical'
  const [reason, setReason] = useState('');
  const [hasReport, setHasReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert('Required Field', 'Please provide a brief medical reason for admission.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Admission Request Submitted! 🚨',
        `Your request for a ${bedType.toUpperCase()} bed at ${hospitalName} is under review by hospital triage staff.`,
        [
          {
            text: 'Track Request',
            onPress: () => navigation.navigate('MyVisitsTab', { screen: 'MyAdmissions' }),
          },
        ]
      );
    }, 800);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Request Hospital Admission</Text>
        <Text style={styles.subtitle}>Target Facility: {hospitalName}</Text>

        {/* Bed Type Selection */}
        <Text style={styles.sectionLabel}>Select Required Bed Type *</Text>
        <View style={styles.bedTypeGrid}>
          {BED_TYPES.map((type) => {
            const isSelected = bedType === type.key;
            return (
              <TouchableOpacity
                key={type.key}
                onPress={() => setBedType(type.key)}
                style={[styles.bedTypeBtn, isSelected && styles.bedTypeBtnActive]}
              >
                <Text style={styles.bedIcon}>{type.icon}</Text>
                <Text style={[styles.bedLabel, isSelected && styles.bedLabelActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Urgency Level */}
        <Text style={styles.sectionLabel}>Triage Urgency Level *</Text>
        <View style={styles.urgencyRow}>
          {[
            { key: 'normal', label: 'Normal', color: '#475569', bg: '#F1F5F9' },
            { key: 'urgent', label: 'Urgent', color: '#D97706', bg: '#FEF3C7' },
            { key: 'critical', label: 'Critical / ER', color: '#DC2626', bg: '#FEE2E2' },
          ].map((item) => {
            const isSelected = urgency === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setUrgency(item.key)}
                style={[
                  styles.urgencyBtn,
                  { backgroundColor: item.bg },
                  isSelected && { borderWidth: 2, borderColor: item.color },
                ]}
              >
                <Text style={[styles.urgencyText, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Medical Reason */}
        <Input
          label="Medical Condition / Reason *"
          placeholder="Describe symptoms, diagnosed illness, or attending doctor referral..."
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
        />

        {/* Report / Referral Attachment */}
        <Text style={styles.sectionLabel}>Referral Letter / Medical Report (Optional)</Text>
        <TouchableOpacity
          onPress={() => setHasReport(!hasReport)}
          style={[styles.uploadBox, hasReport && styles.uploadBoxActive]}
        >
          <Text style={styles.uploadIcon}>{hasReport ? '✅' : '📷'}</Text>
          <Text style={styles.uploadText}>
            {hasReport ? 'Medical Report Attached (tap to remove)' : 'Tap to attach referral letter or lab test photo'}
          </Text>
        </TouchableOpacity>

        <Button
          title="Submit Admission Request"
          onPress={handleSubmit}
          loading={loading}
          variant={urgency === 'critical' ? 'danger' : 'primary'}
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
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  bedTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  bedTypeBtn: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  bedTypeBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  bedIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  bedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bedLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  urgencyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: COLORS.surfaceMuted,
  },
  uploadBoxActive: {
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  uploadIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 16,
  },
});
