import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function OfflineBanner({ lastUpdated }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📡</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>You are offline</Text>
        <Text style={styles.subtitle}>
          Showing cached data{lastUpdated ? ` • Last updated ${lastUpdated}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  subtitle: {
    fontSize: 11,
    color: '#92400E',
  },
});
