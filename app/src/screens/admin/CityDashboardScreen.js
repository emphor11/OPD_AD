import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import BedCountRow from '../../components/BedCountRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';

const CITY_HOSPITALS = [
  {
    _id: 'hosp-1',
    name: 'Lok Nayak Hospital (LNJP)',
    area: 'Central Delhi',
    verified: true,
    totalWaitingOPD: 42,
    freeBeds: { general: 24, icu: 4, oxygen: 14, ventilator: 2, pediatric: 6 },
    criticalAdmissions: 2,
  },
  {
    _id: 'hosp-2',
    name: 'Safdarjung Hospital',
    area: 'South Delhi',
    verified: true,
    totalWaitingOPD: 68,
    freeBeds: { general: 15, icu: 2, oxygen: 8, ventilator: 1, pediatric: 4 },
    criticalAdmissions: 3,
  },
  {
    _id: 'hosp-3',
    name: 'Guru Teg Bahadur (GTB) Hospital',
    area: 'East Delhi',
    verified: true,
    totalWaitingOPD: 29,
    freeBeds: { general: 32, icu: 6, oxygen: 19, ventilator: 3, pediatric: 8 },
    criticalAdmissions: 1,
  },
];

export default function CityDashboardScreen({ navigation }) {
  const { switchMockRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Aggregated totals across all Delhi hospitals
  const totalFreeBeds = {
    general: 71,
    icu: 12,
    oxygen: 41,
    ventilator: 6,
    pediatric: 18,
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* City Admin Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Govt. of NCT of Delhi</Text>
          <Text style={styles.subtitle}>Health & Family Welfare • Live Monitoring Grid</Text>
        </View>
        <Button
          title="Verify (1)"
          variant="outline"
          style={styles.verifyNavBtn}
          textStyle={{ fontSize: 12 }}
          onPress={() => navigation.navigate('HospitalsVerify')}
        />
      </View>

      {/* Aggregate Metric Cards */}
      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <Text style={styles.kpiValue}>3</Text>
          <Text style={styles.kpiLabel}>Monitored Centers</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: COLORS.accent }]}>139</Text>
          <Text style={styles.kpiLabel}>Total OPD Waiting</Text>
        </Card>
        <Card style={styles.kpiCard}>
          <Text style={[styles.kpiValue, { color: COLORS.danger }]}>6</Text>
          <Text style={styles.kpiLabel}>Critical ER Triage</Text>
        </Card>
      </View>

      {/* City-Wide Total Available Beds */}
      <Text style={styles.sectionTitle}>Delhi-Wide Available Bed Census</Text>
      <Card style={styles.totalBedCard}>
        <BedCountRow freeByType={totalFreeBeds} />
      </Card>

      {/* Hospital Breakdown */}
      <Text style={styles.sectionTitle}>Facility-Level Load & Capacity</Text>
      {CITY_HOSPITALS.map((hosp) => (
        <Card key={hosp._id} style={styles.hospitalCard}>
          <View style={styles.hospHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hospName}>{hosp.name}</Text>
              <Text style={styles.hospArea}>📍 {hosp.area}</Text>
            </View>
            <StatusBadge status="approved" label="Live Synced" />
          </View>

          <View style={styles.hospMetrics}>
            <Text style={styles.metricText}>
              OPD Waiting: <Text style={styles.metricBold}>{hosp.totalWaitingOPD} patients</Text>
            </Text>
            <Text style={styles.metricText}>
              Critical Admissions: <Text style={styles.metricDanger}>{hosp.criticalAdmissions}</Text>
            </Text>
          </View>

          <Text style={styles.bedSub}>Available Beds:</Text>
          <BedCountRow freeByType={hosp.freeBeds} />
        </Card>
      ))}

      {/* Viva Demo Role Switcher */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>⚡ Switch Role (Viva Demo Mode)</Text>
        <View style={styles.demoButtons}>
          <Button
            title="👤 Patient"
            variant="outline"
            style={styles.demoBtn}
            textStyle={styles.demoBtnText}
            onPress={() => switchMockRole('patient')}
          />
          <Button
            title="🩺 Hospital Staff"
            variant="outline"
            style={styles.demoBtn}
            textStyle={styles.demoBtnText}
            onPress={() => switchMockRole('staff')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  verifyNavBtn: {
    height: 36,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 8,
  },
  totalBedCard: {
    padding: 14,
    marginBottom: 14,
  },
  hospitalCard: {
    marginBottom: 12,
    padding: 14,
  },
  hospHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hospName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hospArea: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hospMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  metricText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  metricDanger: {
    fontWeight: '700',
    color: COLORS.danger,
  },
  bedSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  demoBox: {
    marginTop: 24,
    padding: 14,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    height: 38,
    marginVertical: 0,
  },
  demoBtnText: {
    fontSize: 12,
  },
});
