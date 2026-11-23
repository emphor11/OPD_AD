import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BED_TYPES, COLORS } from '../utils/constants';

export default function BedCountRow({ freeByType = {}, showZero = true }) {
  return (
    <View style={styles.container}>
      {BED_TYPES.map((type) => {
        const count = freeByType[type.key] || 0;
        if (!showZero && count === 0) return null;
        const isFree = count > 0;

        return (
          <View
            key={type.key}
            style={[
              styles.pill,
              isFree ? styles.pillAvailable : styles.pillEmpty,
            ]}
          >
            <Text style={styles.icon}>{type.icon}</Text>
            <Text style={styles.label}>{type.label}:</Text>
            <Text style={[styles.count, isFree ? styles.countGreen : styles.countRed]}>
              {count}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  pillAvailable: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  pillEmpty: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  count: {
    fontSize: 12,
    fontWeight: '700',
  },
  countGreen: {
    color: COLORS.success,
  },
  countRed: {
    color: COLORS.textMuted,
  },
});
