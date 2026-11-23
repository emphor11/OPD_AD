import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { COLORS } from '../../utils/constants';

const INITIAL_MESSAGES = [
  { _id: 'm-1', senderRole: 'patient', senderName: 'Patient / Family', text: 'Hello, patient is experiencing high fever and shortness of breath.', time: '09:32 AM' },
  { _id: 'm-2', senderRole: 'staff', senderName: 'Dr. Anita (Triage Staff)', text: 'We have reserved ICU Bed 03. Please arrive via Emergency Gate 2.', time: '09:35 AM' },
];

export default function AdmissionDetailScreen({ route, navigation }) {
  const { admissionId = 'adm-001' } = route.params || {};
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  const [admission, setAdmission] = useState({
    _id: admissionId,
    patientName: 'Ramesh Gupta',
    age: 58,
    gender: 'male',
    hospitalName: 'LNJP Hospital, Delhi',
    bedType: 'icu',
    bedNo: 'ICU-03',
    urgency: 'critical',
    status: 'approved', // pending, approved, admitted, discharged, rejected
    reason: 'Severe respiratory distress with oxygen saturation below 85%',
  });

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      _id: `msg-${Date.now()}`,
      senderRole: user?.role || 'patient',
      senderName: user?.name || (isStaff ? 'Hospital Staff' : 'Patient'),
      text: inputText.trim(),
      time: 'Just now',
    };

    setMessages([...messages, newMsg]);
    setInputText('');
  };

  // Staff triage actions
  const handleApprove = () => {
    setAdmission((prev) => ({ ...prev, status: 'approved' }));
    Alert.alert('Request Approved', 'Admission approved. You may now assign a bed.');
  };

  const handleDischarge = () => {
    Alert.alert('Discharge Patient', 'Discharging will free the assigned bed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Discharge',
        onPress: () => {
          setAdmission((prev) => ({ ...prev, status: 'discharged', bedNo: null }));
        },
      },
    ]);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderRole === (user?.role || 'patient');

    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgMe : styles.msgOther]}>
        <Text style={styles.msgSender}>{item.senderName} • {item.time}</Text>
        <View style={[styles.msgBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.msgText, isMe ? styles.textMe : styles.textOther]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Admission Summary Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {admission.patientName} ({admission.age}y / {admission.gender})
            </Text>
            <Text style={styles.hospital}>{admission.hospitalName}</Text>
          </View>
          <StatusBadge status={admission.status} />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Bed: <Text style={styles.bold}>{admission.bedType.toUpperCase()}</Text>
          </Text>
          {admission.bedNo ? (
            <Text style={styles.assignedBed}>Assigned: {admission.bedNo}</Text>
          ) : (
            <Text style={styles.unassignedBed}>No Bed Assigned Yet</Text>
          )}
          <StatusBadge status={admission.urgency} label={admission.urgency} />
        </View>

        <Text style={styles.reasonText}>"{admission.reason}"</Text>

        {/* Staff Action Controls */}
        {isStaff && (
          <View style={styles.staffActionRow}>
            {admission.status === 'pending' && (
              <Button
                title="Approve Request"
                variant="primary"
                style={styles.actionBtn}
                onPress={handleApprove}
              />
            )}
            {admission.status === 'approved' && (
              <Button
                title="Assign Bed & Admit"
                variant="secondary"
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate('AssignBed', {
                    admissionId: admission._id,
                    patientName: admission.patientName,
                    bedType: admission.bedType,
                  })
                }
              />
            )}
            {admission.status === 'admitted' && (
              <Button
                title="Discharge Patient"
                variant="outline"
                style={styles.actionBtn}
                textStyle={{ color: COLORS.danger }}
                onPress={handleDischarge}
              />
            )}
          </View>
        )}
      </Card>

      {/* Real-Time Helpdesk Chat Header */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>💬 Admission Triage & Help Desk Chat</Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Type message to hospital help desk..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          style={styles.textInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerCard: {
    margin: 12,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  hospital: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  assignedBed: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  unassignedBed: {
    fontSize: 12,
    color: COLORS.accent,
    fontStyle: 'italic',
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  staffActionRow: {
    marginTop: 10,
  },
  actionBtn: {
    height: 38,
    marginVertical: 0,
  },
  chatHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  chatTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  messageList: {
    padding: 12,
    flexGrow: 1,
  },
  msgWrapper: {
    marginVertical: 4,
    maxWidth: '82%',
  },
  msgMe: {
    alignSelf: 'flex-end',
  },
  msgOther: {
    alignSelf: 'flex-start',
  },
  msgSender: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
    marginHorizontal: 4,
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 18,
  },
  textMe: {
    color: COLORS.textInverse,
  },
  textOther: {
    color: COLORS.textPrimary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
  sendText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
});
