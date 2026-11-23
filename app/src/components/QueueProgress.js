import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function QueueProgress({ currentTokenNo = 0, lastTokenNo = 0 }) {
  const percentage =
    lastTokenNo > 0 ? Math.min(Math.round((currentTokenNo / lastTokenNo) * 100), 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OPD Session Progress</Text>
        <Text style={styles.stats}>
          Serving #{currentTokenNo} of {lastTokenNo} tokens ({percentage}%)
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.bar, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  stats: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});
