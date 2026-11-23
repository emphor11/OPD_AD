import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { COLORS } from '../../utils/constants';

const INITIAL_NOTIFICATIONS = [
  {
    _id: 'n-1',
    title: '🔔 Your Turn is Near!',
    body: 'Only 3 patients ahead of you in General Medicine (LNJP). Please wait outside Room 104.',
    time: '5 mins ago',
    read: false,
    type: 'queue',
  },
  {
    _id: 'n-2',
    title: '🏥 Admission Approved',
    body: 'Your admission request for an ICU Bed at LNJP Hospital has been approved.',
    time: '25 mins ago',
    read: true,
    type: 'admission',
  },
  {
    _id: 'n-3',
    title: '💬 New Help Desk Message',
    body: 'Dr. Anita: "We have reserved ICU Bed 03. Please arrive via Emergency Gate 2."',
    time: '1 hour ago',
    read: true,
    type: 'message',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, !item.read && styles.unreadCard]}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.body}>{item.body}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.heading}>Alerts & Updates</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="🔕"
            title="No Notifications"
            message="You have no notifications at this time."
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  markReadText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    padding: 14,
  },
  card: {
    marginBottom: 10,
    padding: 14,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
    backgroundColor: '#FFFDF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
