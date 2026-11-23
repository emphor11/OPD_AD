import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import QueueProgress from '../../components/QueueProgress';
import { COLORS } from '../../utils/constants';

export default function MyTokenScreen({ route, navigation }) {
  const [token, setToken] = useState({
    _id: 'tok-101',
    displayNo: 'GM-014',
    tokenNo: 14,
    status: 'waiting',
    departmentName: 'General Medicine (Room 104)',
    hospitalName: 'LNJP Hospital, Delhi Gate',
    currentTokenNo: 11,
    lastTokenNo: 20,
    positionAhead: 3,
    avgConsultMins: 8,
    estimatedWaitMins: 24,
  });

  const handleCancelToken = () => {
    Alert.alert(
      'Cancel OPD Token?',
      'Are you sure you want to cancel your token? You will lose your queue position.',
      [
        { text: 'Keep Token', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setToken((prev) => ({ ...prev, status: 'cancelled' }));
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Live Sync Banner */}
      <View style={styles.syncBanner}>
        <View style={styles.dot} />
        <Text style={styles.syncText}>Live OPD Sync Active • Auto-updates every call</Text>
      </View>

      <Card style={styles.tokenHero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.dept}>{token.departmentName}</Text>
            <Text style={styles.hospital}>{token.hospitalName}</Text>
          </View>
          <StatusBadge status={token.status} />
        </View>

        <View style={styles.bigTokenContainer}>
          <Text style={styles.tokenSub}>YOUR APPOINTMENT TOKEN</Text>
          <Text style={styles.bigToken}>{token.displayNo}</Text>
        </View>

        {/* Live Counters */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Currently Serving</Text>
            <Text style={[styles.statValue, { color: COLORS.accent }]}>
              #{token.currentTokenNo}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Patients Ahead</Text>
            <Text style={styles.statValue}>
              {token.status === 'cancelled' ? '--' : token.positionAhead}
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Estimated Wait</Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {token.status === 'cancelled' ? '--' : `~${token.estimatedWaitMins}m`}
            </Text>
          </View>
        </View>

        {/* Visual Queue Progress */}
        <QueueProgress
          currentTokenNo={token.currentTokenNo}
          lastTokenNo={token.lastTokenNo}
        />
      </Card>

      {/* Triage Guidance Card */}
      <Card style={styles.guidanceCard}>
        <Text style={styles.guidanceTitle}>📋 Queue Instructions</Text>
        <Text style={styles.guidanceItem}>
          • When your token is called, proceed directly to Consultation Room 104.
        </Text>
        <Text style={styles.guidanceItem}>
          • Keep previous medical reports and government ID ready.
        </Text>
        <Text style={styles.guidanceItem}>
          • If you step away, staff may skip your turn if you are unreachable.
        </Text>
      </Card>

      {token.status === 'waiting' && (
        <Button
          title="Cancel This Token"
          variant="outline"
          onPress={handleCancelToken}
          style={styles.cancelBtn}
          textStyle={{ color: COLORS.danger }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  tokenHero: {
    padding: 20,
    alignItems: 'center',
  },
  heroTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dept: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hospital: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bigTokenContainer: {
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: COLORS.primaryLight,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
  },
  tokenSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },
  bigToken: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
    backgroundColor: COLORS.surfaceMuted,
    padding: 12,
    borderRadius: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  guidanceCard: {
    marginTop: 12,
    padding: 16,
  },
  guidanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  guidanceItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  cancelBtn: {
    marginTop: 14,
    borderColor: COLORS.dangerLight,
  },
});
