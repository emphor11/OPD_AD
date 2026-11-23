import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import BedCountRow from '../../components/BedCountRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';

export default function HospitalDetailScreen({ route, navigation }) {
  const { hospitalId } = route.params || { hospitalId: 'hosp-1' };

  // Mock Hospital Detail
  const [hospital] = useState({
    _id: hospitalId,
    name: 'Lok Nayak Hospital (LNJP)',
    address: 'Jawaharlal Nehru Marg, Delhi Gate, New Delhi - 110002',
    phone: '+91 11 2323 3000',
    verified: true,
    freeBeds: { general: 24, icu: 4, oxygen: 14, ventilator: 2, pediatric: 6 },
    departments: [
      { code: 'GM', name: 'General Medicine', avgConsultMins: 8, waiting: 14, sessionOpen: true },
      { code: 'PED', name: 'Pediatrics', avgConsultMins: 10, waiting: 8, sessionOpen: true },
      { code: 'ORTHO', name: 'Orthopedics', avgConsultMins: 12, waiting: 11, sessionOpen: true },
      { code: 'ENT', name: 'ENT Clinic', avgConsultMins: 8, waiting: 5, sessionOpen: false },
      { code: 'CARD', name: 'Cardiology OPD', avgConsultMins: 15, waiting: 9, sessionOpen: true },
    ],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hospital Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.titleRow}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <StatusBadge status="approved" label="Verified" />
        </View>
        <Text style={styles.address}>📍 {hospital.address}</Text>
        <Text style={styles.phone}>📞 Emergency: {hospital.phone}</Text>

        <View style={styles.actionRow}>
          <Button
            title="🚨 Request Admission"
            variant="danger"
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('AdmissionRequest', {
                hospitalId: hospital._id,
                hospitalName: hospital.name,
              })
            }
          />
        </View>
      </Card>

      {/* Bed Status Breakdown */}
      <Text style={styles.sectionHeader}>Live Bed Census</Text>
      <Card>
        <BedCountRow freeByType={hospital.freeBeds} />
      </Card>

      {/* OPD Departments */}
      <Text style={styles.sectionHeader}>OPD Departments & Live Queues</Text>
      {hospital.departments.map((dept) => (
        <Card key={dept.code} style={styles.deptCard}>
          <View style={styles.deptHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deptName}>{dept.name}</Text>
              <Text style={styles.deptCode}>Code: {dept.code} • Avg {dept.avgConsultMins} mins/patient</Text>
            </View>
            <StatusBadge
              status={dept.sessionOpen ? 'free' : 'cancelled'}
              label={dept.sessionOpen ? 'OPD Open' : 'Closed'}
            />
          </View>

          <View style={styles.deptFooter}>
            <Text style={styles.waitingText}>
              👥 Waiting: <Text style={styles.waitingCount}>{dept.waiting} patients</Text>
            </Text>

            {dept.sessionOpen ? (
              <Button
                title="Book Token"
                variant="primary"
                style={styles.bookBtn}
                onPress={() =>
                  navigation.navigate('BookToken', {
                    hospitalId: hospital._id,
                    hospitalName: hospital.name,
                    department: dept,
                  })
                }
              />
            ) : (
              <Text style={styles.closedNote}>Session Closed Today</Text>
            )}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    padding: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  address: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  phone: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
  actionRow: {
    marginTop: 14,
  },
  actionBtn: {
    marginVertical: 0,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 10,
  },
  deptCard: {
    marginBottom: 10,
    padding: 14,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  deptCode: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  deptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  waitingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  waitingCount: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  bookBtn: {
    height: 36,
    paddingHorizontal: 14,
    marginVertical: 0,
  },
  closedNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
