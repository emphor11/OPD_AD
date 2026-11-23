import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS } from '../../utils/constants';

export default function BookTokenScreen({ route, navigation }) {
  const { hospitalName = 'LNJP Hospital', department = { code: 'GM', name: 'General Medicine', avgConsultMins: 8 } } =
    route.params || {};

  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Token Booked Successfully! 🎉',
        `Your OPD Token GM-015 has been reserved at ${hospitalName}.`,
        [
          {
            text: 'View Live Queue',
            onPress: () => navigation.navigate('MyToken', { tokenId: 'tok-102' }),
          },
        ]
      );
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Confirm OPD Appointment</Text>
        <Text style={styles.subtitle}>
          Avoid physical counter queues. Your token will be registered instantly in the hospital's live system.
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hospital</Text>
          <Text style={styles.detailValue}>{hospitalName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Department</Text>
          <Text style={styles.detailValue}>{department.name} ({department.code})</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>Today (Live Session)</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Patients in Queue</Text>
          <Text style={[styles.detailValue, { color: COLORS.accent }]}>14 waiting</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estimated Turn</Text>
          <Text style={styles.detailValue}>~112 mins (Avg 8 mins/patient)</Text>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>ℹ️ Important Patient Notice</Text>
          <Text style={styles.noticeText}>
            You will receive a notification when only 3 patients remain ahead of you. Please reach the department premises in time.
          </Text>
        </View>

        <Button
          title="Confirm & Generate Token"
          onPress={handleConfirmBooking}
          loading={loading}
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
    padding: 20,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  noticeBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 16,
  },
  btn: {
    marginTop: 8,
  },
});
