import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS } from '../utils/constants';

export default function StatusBadge({ status, label, style, textStyle }) {
  const config = STATUS_COLORS[status] || {
    bg: '#F1F5F9',
    text: '#475569',
    label: status ? status.toUpperCase() : 'UNKNOWN',
  };

  const displayText = label || config.label;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }, textStyle]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
