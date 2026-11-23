import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import Card from '../../components/Card';
import BedCountRow from '../../components/BedCountRow';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';
import { formatDistance } from '../../utils/distance';

const MOCK_HOSPITALS = [
  {
    _id: 'hosp-1',
    name: 'Lok Nayak Hospital (LNJP)',
    address: 'Jawaharlal Nehru Marg, Delhi Gate',
    phone: '+91 11 2323 3000',
    distanceKm: 1.8,
    verified: true,
    totalWaiting: 42,
    freeBeds: { general: 24, icu: 4, oxygen: 14, ventilator: 2, pediatric: 6 },
  },
  {
    _id: 'hosp-2',
    name: 'Safdarjung Hospital',
    address: 'Ring Road, Opposite AIIMS, New Delhi',
    phone: '+91 11 2616 5060',
    distanceKm: 4.5,
    verified: true,
    totalWaiting: 68,
    freeBeds: { general: 15, icu: 2, oxygen: 8, ventilator: 1, pediatric: 4 },
  },
  {
    _id: 'hosp-3',
    name: 'Guru Teg Bahadur (GTB) Hospital',
    address: 'Dilshad Garden, Shahdara, Delhi',
    phone: '+91 11 2258 6262',
    distanceKm: 8.2,
    verified: true,
    totalWaiting: 29,
    freeBeds: { general: 32, icu: 6, oxygen: 19, ventilator: 3, pediatric: 8 },
  },
];

export default function HospitalsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [hospitals] = useState(MOCK_HOSPITALS);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase())
  );

  const renderHospital = ({ item }) => (
    <Card
      onPress={() => navigation.navigate('HospitalDetail', { hospitalId: item._id })}
      style={styles.hospitalCard}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.address}>{item.address}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>{formatDistance(item.distanceKm)}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.queueInfo}>
          <Text style={styles.queueLabel}>Active OPD Waiting:</Text>
          <Text style={styles.queueCount}>{item.totalWaiting} patients</Text>
        </View>
        <StatusBadge status="approved" label="Verified Center" />
      </View>

      <Text style={styles.bedSectionTitle}>Available Beds Right Now:</Text>
      <BedCountRow freeByType={item.freeBeds} />
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          placeholder="🔍 Search hospitals by name or area..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredHospitals}
        keyExtractor={(item) => item._id}
        renderItem={renderHospital}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBox: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    height: 42,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  list: {
    padding: 14,
  },
  hospitalCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  address: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  queueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  queueCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
  bedSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});
