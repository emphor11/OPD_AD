import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../utils/constants';

const MOCK_INCOMING_ADMISSIONS = [
  {
    _id: 'adm-001',
    patientName: 'Ramesh Gupta',
    age: 58,
    gender: 'male',
    bedType: 'icu',
    urgency: 'critical',
    status: 'pending',
    reason: 'Suspected acute myocardial infarction with low blood pressure',
    createdAt: '15 mins ago',
    bedNo: null,
  },
  {
    _id: 'adm-002',
    patientName: 'Meena Sharma',
    age: 29,
    gender: 'female',
    bedType: 'general',
    urgency: 'normal',
    status: 'approved',
    reason: 'Scheduled laparoscopic appendectomy',
    createdAt: '1 hour ago',
    bedNo: null,
  },
  {
    _id: 'adm-003',
    patientName: 'Deepak Rao',
    age: 45,
    gender: 'male',
    bedType: 'icu',
    urgency: 'critical',
    status: 'admitted',
    reason: 'Post-op observation in cardiac ICU',
    createdAt: 'Today, 08:00 AM',
    bedNo: 'ICU-01',
  },
];

export default function AdmissionsScreen({ navigation }) {
  const [filter, setFilter] = useState('pending');
  const [admissions] = useState(MOCK_INCOMING_ADMISSIONS);

  const filtered = filter === 'all' ? admissions : admissions.filter((a) => a.status === filter);

  const renderItem = ({ item }) => (
    <Card
      onPress={() => navigation.navigate('AdmissionDetail', { admissionId: item._id })}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>
            {item.patientName} ({item.age}y / {item.gender})
          </Text>
          <Text style={styles.time}>{item.createdAt}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.bedReq}>
          Required: <Text style={styles.bold}>{item.bedType.toUpperCase()} Bed</Text>
        </Text>
        <StatusBadge status={item.urgency} label={item.urgency} />
      </View>

      <Text style={styles.reason} numberOfLines={2}>
        "{item.reason}"
      </Text>

      {item.bedNo && (
        <View style={styles.bedBadge}>
          <Text style={styles.bedText}>Assigned Bed: {item.bedNo}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.actionPrompt}>Tap to review triage & chat ›</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {['pending', 'approved', 'admitted', 'all'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[styles.tab, filter === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="🛏️"
            title="No Requests"
            message={`No admission requests found in '${filter}' status.`}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  list: {
    padding: 14,
  },
  card: {
    marginBottom: 10,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  bedReq: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  reason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginVertical: 4,
  },
  bedBadge: {
    backgroundColor: '#D1FAE5',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  bedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  actionPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
