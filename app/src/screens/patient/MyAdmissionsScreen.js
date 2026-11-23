import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../utils/constants';

const MOCK_ADMISSIONS = [
  {
    _id: 'adm-001',
    hospitalName: 'LNJP Hospital, Delhi',
    bedType: 'icu',
    bedNo: 'ICU-03',
    urgency: 'critical',
    status: 'admitted',
    reason: 'Severe respiratory distress with oxygen saturation below 85%',
    createdAt: 'Today, 09:30 AM',
    hasUnreadMessages: true,
  },
  {
    _id: 'adm-002',
    hospitalName: 'Safdarjung Hospital',
    bedType: 'general',
    bedNo: null,
    urgency: 'urgent',
    status: 'pending',
    reason: 'Fracture post-fall requiring surgical observation',
    createdAt: 'Yesterday, 04:15 PM',
    hasUnreadMessages: false,
  },
  {
    _id: 'adm-003',
    hospitalName: 'GTB Hospital',
    bedType: 'oxygen',
    bedNo: 'OXY-11',
    urgency: 'urgent',
    status: 'discharged',
    reason: 'Post-pneumonia recovery and monitoring',
    createdAt: '18 Nov 2026',
    hasUnreadMessages: false,
  },
];

export default function MyAdmissionsScreen({ navigation }) {
  const [admissions] = useState(MOCK_ADMISSIONS);

  const renderItem = ({ item }) => (
    <Card
      onPress={() =>
        navigation.navigate('AdmissionDetail', { admissionId: item._id, hospitalName: item.hospitalName })
      }
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hospitalName}>{item.hospitalName}</Text>
          <Text style={styles.date}>{item.createdAt}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.bedRow}>
        <Text style={styles.bedLabel}>
          Bed Type: <Text style={styles.bedValue}>{item.bedType.toUpperCase()}</Text>
        </Text>
        {item.bedNo ? (
          <View style={styles.assignedBedBadge}>
            <Text style={styles.assignedBedText}>Assigned: {item.bedNo}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.reason} numberOfLines={2}>
        "{item.reason}"
      </Text>

      <View style={styles.cardFooter}>
        <StatusBadge status={item.urgency} label={`Urgency: ${item.urgency}`} />
        <View style={styles.chatPrompt}>
          <Text style={styles.chatPromptText}>
            💬 Help Desk Chat {item.hasUnreadMessages ? '🔴' : '›'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={admissions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="🏥"
            title="No Admission Requests"
            message="You do not have any active or past admission requests."
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
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  bedLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bedValue: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  assignedBedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  assignedBedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  reason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginVertical: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatPromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
