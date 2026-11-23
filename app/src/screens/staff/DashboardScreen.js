import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import BedCountRow from '../../components/BedCountRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';

export default function DashboardScreen({ navigation }) {
  const { user, switchMockRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Hospital staff mock stats
  const [stats] = useState({
    hospitalName: 'LNJP Hospital, Delhi Gate',
    pendingAdmissionsCount: 4,
    totalWaitingOPD: 38,
    lowStockCount: 2,
    freeBeds: { general: 14, icu: 3, oxygen: 8, ventilator: 1, pediatric: 5 },
    openSessions: [
      { code: 'GM', name: 'General Medicine', current: 11, waiting: 14 },
      { code: 'PED', name: 'Pediatrics', current: 8, waiting: 7 },
      { code: 'ORTHO', name: 'Orthopedics', current: 4, waiting: 9 },
    ],
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Staff Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.staffRole}>Hospital Staff Portal</Text>
          <Text style={styles.hospitalName}>{stats.hospitalName}</Text>
        </View>
        <StatusBadge status="approved" label="Verified Center" />
      </View>

      {/* Triage & Operational Alert Banners */}
      {stats.pendingAdmissionsCount > 0 && (
        <Card
          style={styles.alertCard}
          onPress={() => navigation.navigate('AdmissionsTab')}
        >
          <View style={styles.alertRow}>
            <Text style={styles.alertIcon}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {stats.pendingAdmissionsCount} Pending Admission Requests
              </Text>
              <Text style={styles.alertSub}>Immediate triage review required.</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </View>
        </Card>
      )}

      {stats.lowStockCount > 0 && (
        <Card
          style={[styles.alertCard, styles.stockAlertCard]}
          onPress={() => navigation.navigate('StockTab')}
        >
          <View style={styles.alertRow}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                {stats.lowStockCount} Medicines Below Safe Stock Level
              </Text>
              <Text style={styles.alertSub}>Check dispensary inventory.</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </View>
        </Card>
      )}

      {/* Bed Status Summary */}
      <Text style={styles.sectionTitle}>Bed Census Overview</Text>
      <Card style={styles.bedCard}>
        <BedCountRow freeByType={stats.freeBeds} />
        <Button
          title="Manage Hospital Beds"
          variant="outline"
          style={styles.bedBtn}
          onPress={() => navigation.navigate('BedsTab')}
        />
      </Card>

      {/* Active OPD Sessions */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Active OPD Queues Today</Text>
        <Text style={styles.waitingTotal}>{stats.totalWaitingOPD} Patients Waiting</Text>
      </View>

      {stats.openSessions.map((session) => (
        <Card
          key={session.code}
          style={styles.sessionCard}
          onPress={() =>
            navigation.navigate('OPDTab', {
              screen: 'OPDControl',
              params: { departmentCode: session.code, departmentName: session.name },
            })
          }
        >
          <View style={styles.sessionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionName}>{session.name}</Text>
              <Text style={styles.sessionCode}>Department Code: {session.code}</Text>
            </View>
            <View style={styles.sessionMetrics}>
              <Text style={styles.servingBadge}>Serving #{session.current}</Text>
              <Text style={styles.waitingBadge}>{session.waiting} waiting</Text>
            </View>
          </View>
        </Card>
      ))}

      {/* Role Switcher for Viva Demo */}
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
            title="🏛️ City Admin"
            variant="outline"
            style={styles.demoBtn}
            textStyle={styles.demoBtnText}
            onPress={() => switchMockRole('admin')}
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
    marginBottom: 14,
  },
  staffRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    padding: 12,
    marginBottom: 10,
  },
  stockAlertCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  alertSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  alertArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waitingTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  bedCard: {
    padding: 14,
    marginBottom: 12,
  },
  bedBtn: {
    marginTop: 10,
    height: 38,
  },
  sessionCard: {
    padding: 14,
    marginBottom: 10,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sessionCode: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sessionMetrics: {
    alignItems: 'flex-end',
  },
  servingBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  waitingBadge: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    marginTop: 2,
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
