import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TokenCard from '../../components/TokenCard';
import BedCountRow from '../../components/BedCountRow';
import { COLORS } from '../../utils/constants';

export default function HomeScreen({ navigation }) {
  const { user, switchMockRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock Active Token
  const [activeToken] = useState({
    _id: 'tok-101',
    displayNo: 'GM-014',
    status: 'waiting',
    departmentCode: 'GM',
    departmentName: 'General Medicine',
    hospitalName: 'LNJP Hospital, Delhi',
    nowServing: 11,
    positionAhead: 3,
    estimatedMins: 24,
  });

  // Mock City Bed Snapshot
  const cityBedSummary = {
    general: 48,
    icu: 12,
    oxygen: 35,
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
      {/* Top Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
        </View>
        <Button
          title="🔔"
          variant="ghost"
          style={styles.notifBtn}
          textStyle={{ fontSize: 20 }}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      {/* Active OPD Token Highlight */}
      <Text style={styles.sectionTitle}>Active OPD Token</Text>
      {activeToken ? (
        <TokenCard
          token={activeToken}
          hospitalName={activeToken.hospitalName}
          departmentName={activeToken.departmentName}
          nowServing={activeToken.nowServing}
          positionAhead={activeToken.positionAhead}
          estimatedMins={activeToken.estimatedMins}
          onPress={() => navigation.navigate('MyToken', { tokenId: activeToken._id })}
        />
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No active token today</Text>
          <Text style={styles.emptySub}>Book a token to skip the hospital waiting lines.</Text>
          <Button
            title="Book OPD Token"
            onPress={() => navigation.navigate('Hospitals')}
            style={{ marginTop: 10 }}
          />
        </Card>
      )}

      {/* Quick Action Grid */}
      <Text style={styles.sectionTitle}>Quick Services</Text>
      <View style={styles.actionGrid}>
        <Card
          style={styles.actionCard}
          onPress={() => navigation.navigate('Hospitals')}
        >
          <Text style={styles.actionIcon}>🏥</Text>
          <Text style={styles.actionTitle}>Find Hospitals</Text>
          <Text style={styles.actionDesc}>Check live queues & distance</Text>
        </Card>

        <Card
          style={styles.actionCard}
          onPress={() => navigation.navigate('Hospitals')}
        >
          <Text style={styles.actionIcon}>🛏️</Text>
          <Text style={styles.actionTitle}>Check Beds</Text>
          <Text style={styles.actionDesc}>ICU, Oxygen & General</Text>
        </Card>
      </View>

      {/* Real-Time City Bed Availability Overview */}
      <Card style={styles.cityCard}>
        <View style={styles.cityCardHeader}>
          <Text style={styles.cityTitle}>Delhi Live Bed Availability</Text>
          <Text style={styles.liveIndicator}>🟢 LIVE</Text>
        </View>
        <Text style={styles.citySubtitle}>
          Real-time aggregated bed pool across verified government hospitals:
        </Text>
        <BedCountRow freeByType={cityBedSummary} />
      </Card>

      {/* Quick Role Switcher for Viva Demo */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>⚡ Switch Role (Viva Demo Mode)</Text>
        <View style={styles.demoButtons}>
          <Button
            title="🩺 Hospital Staff"
            variant="outline"
            style={styles.demoBtn}
            textStyle={styles.demoBtnText}
            onPress={() => switchMockRole('staff')}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  notifBtn: {
    height: 40,
    width: 40,
    paddingHorizontal: 0,
    marginVertical: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginVertical: 10,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 14,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cityCard: {
    marginTop: 16,
    padding: 16,
    borderColor: '#CCFBF1',
    backgroundColor: '#F0FDF4',
  },
  cityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  liveIndicator: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  citySubtitle: {
    fontSize: 12,
    color: '#047857',
    marginBottom: 8,
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
