import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { COLORS } from '../utils/constants';
import { formatWaitTime } from '../utils/waitTime';

export default function TokenCard({
  token,
  hospitalName,
  departmentName,
  nowServing,
  positionAhead,
  estimatedMins,
  onPress,
}) {
  const isNear = positionAhead !== undefined && positionAhead <= 3 && positionAhead >= 0;

  return (
    <Card onPress={onPress} style={[styles.card, isNear && styles.nearCard]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.deptText}>{departmentName || 'General Medicine'}</Text>
          <Text style={styles.hospitalText}>{hospitalName || 'LNJP Hospital'}</Text>
        </View>
        <StatusBadge status={token?.status || 'waiting'} />
      </View>

      <View style={styles.tokenSection}>
        <View style={styles.tokenBox}>
          <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
          <Text style={styles.tokenNumber}>{token?.displayNo || 'GM-014'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.tokenBox}>
          <Text style={styles.tokenLabel}>NOW SERVING</Text>
          <Text style={[styles.tokenNumber, styles.servingNumber]}>
            {nowServing !== undefined ? `#${nowServing}` : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Ahead of You</Text>
          <Text style={styles.metricValue}>
            {positionAhead !== undefined ? `${positionAhead} patients` : '--'}
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Estimated Wait</Text>
          <Text style={[styles.metricValue, isNear && styles.urgentWait]}>
            {estimatedMins !== undefined ? formatWaitTime(estimatedMins) : '--'}
          </Text>
        </View>
      </View>

      {isNear && (
        <View style={styles.nearAlert}>
          <Text style={styles.nearAlertText}>
            🔔 Your turn is near! Please wait outside the consultation room.
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  nearCard: {
    borderLeftColor: COLORS.accent,
    backgroundColor: '#FFFDF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deptText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hospitalText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tokenSection: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  tokenBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  tokenNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  servingNumber: {
    color: COLORS.accent,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  urgentWait: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  nearAlert: {
    marginTop: 10,
    backgroundColor: COLORS.warningLight,
    padding: 8,
    borderRadius: 6,
  },
  nearAlertText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
