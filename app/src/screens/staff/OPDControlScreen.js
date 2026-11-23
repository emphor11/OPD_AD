import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import QueueProgress from '../../components/QueueProgress';
import { COLORS } from '../../utils/constants';

const INITIAL_QUEUE = [
  { _id: 't-12', tokenNo: 12, displayNo: 'GM-012', patientName: 'Priya Verma', age: 34, gender: 'female', status: 'waiting' },
  { _id: 't-13', tokenNo: 13, displayNo: 'GM-013', patientName: 'Mohd. Salim', age: 52, gender: 'male', status: 'waiting' },
  { _id: 't-14', tokenNo: 14, displayNo: 'GM-014', patientName: 'Rahul Sharma', age: 28, gender: 'male', status: 'waiting' },
  { _id: 't-15', tokenNo: 15, displayNo: 'GM-015', patientName: 'Sunita Devi', age: 61, gender: 'female', status: 'waiting' },
];

export default function OPDControlScreen({ route }) {
  const { departmentCode = 'GM', departmentName = 'General Medicine' } = route.params || {};

  const [sessionOpen, setSessionOpen] = useState(true);
  const [currentToken, setCurrentToken] = useState({
    tokenNo: 11,
    displayNo: 'GM-011',
    patientName: 'Kavita Das',
    age: 42,
    gender: 'female',
    status: 'in_consultation',
  });
  const [queue, setQueue] = useState(INITIAL_QUEUE);

  // Call Next Token
  const handleCallNext = () => {
    if (queue.length === 0) {
      Alert.alert('Queue Empty', 'No more patients waiting in this OPD session.');
      return;
    }
    const nextPatient = queue[0];
    const remainingQueue = queue.slice(1);

    setCurrentToken({
      ...nextPatient,
      status: 'in_consultation',
    });
    setQueue(remainingQueue);
  };

  // Skip Current Token
  const handleSkip = () => {
    Alert.alert('Skip Patient', `Mark token ${currentToken.displayNo} as skipped?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        style: 'destructive',
        onPress: () => {
          handleCallNext();
        },
      },
    ]);
  };

  // Mark Completed
  const handleComplete = () => {
    handleCallNext();
  };

  const renderQueueItem = ({ item, index }) => (
    <Card style={styles.queueItemCard}>
      <View style={styles.queueItemRow}>
        <View style={styles.tokenNumberBox}>
          <Text style={styles.tokenItemNumber}>{item.displayNo}</Text>
          <Text style={styles.positionText}>#{index + 1} in line</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.patientMeta}>
            {item.age} yrs • {item.gender}
          </Text>
        </View>

        <StatusBadge status={item.status} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Session Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.deptTitle}>{departmentName}</Text>
          <Text style={styles.sessionStatus}>
            OPD Session {sessionOpen ? '🟢 Active' : '🔴 Closed'}
          </Text>
        </View>
        <Button
          title={sessionOpen ? 'End Session' : 'Start Session'}
          variant={sessionOpen ? 'outline' : 'primary'}
          style={styles.sessionToggleBtn}
          onPress={() => setSessionOpen(!sessionOpen)}
        />
      </View>

      {/* Current Serving Big Hero Card */}
      <Card style={styles.servingCard}>
        <Text style={styles.servingHeader}>CURRENT PATIENT IN CONSULTATION</Text>

        <View style={styles.servingInfo}>
          <Text style={styles.servingToken}>{currentToken?.displayNo || 'NONE'}</Text>
          <Text style={styles.servingName}>
            {currentToken ? `${currentToken.patientName} (${currentToken.age}y / ${currentToken.gender})` : 'Waiting to call'}
          </Text>
        </View>

        {/* Action Buttons: Next / Skip / Complete */}
        <View style={styles.controlButtons}>
          <Button
            title="⏭️ Call Next"
            variant="primary"
            style={[styles.btn, styles.callNextBtn]}
            onPress={handleCallNext}
          />
          <Button
            title="✅ Complete"
            variant="secondary"
            style={styles.btn}
            onPress={handleComplete}
          />
          <Button
            title="⏩ Skip"
            variant="danger"
            style={styles.btn}
            onPress={handleSkip}
          />
        </View>

        <QueueProgress
          currentTokenNo={currentToken?.tokenNo || 0}
          lastTokenNo={(currentToken?.tokenNo || 0) + queue.length}
        />
      </Card>

      {/* Waiting List Header */}
      <View style={styles.waitingHeaderRow}>
        <Text style={styles.waitingTitle}>Waiting Queue ({queue.length})</Text>
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => item._id}
        renderItem={renderQueueItem}
        contentContainerStyle={styles.queueList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sessionStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sessionToggleBtn: {
    height: 36,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  servingCard: {
    margin: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  servingHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  servingInfo: {
    marginVertical: 10,
  },
  servingToken: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
  },
  servingName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  btn: {
    flex: 1,
    height: 42,
    marginVertical: 0,
  },
  callNextBtn: {
    flex: 1.4,
  },
  waitingHeaderRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  waitingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  queueList: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  queueItemCard: {
    marginBottom: 8,
    padding: 12,
  },
  queueItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenNumberBox: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tokenItemNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  positionText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  patientMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
