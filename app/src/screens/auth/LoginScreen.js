import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { COLORS } from '../../utils/constants';

export default function LoginScreen({ navigation }) {
  const { login, switchMockRole, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    await login(email, password);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appIcon}>🏥</Text>
        <Text style={styles.title}>CareQueue</Text>
        <Text style={styles.subtitle}>Hospital OPD Queues & Bed Management</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Sign In</Text>

        <Input
          label="Email Address"
          placeholder="e.g. rahul@carequeue.org"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginBtn}
        />

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Demo Role Switcher for Viva / Examiner Demonstration */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>⚡ Quick Demo Switcher (Viva Preview)</Text>
        <View style={styles.demoButtons}>
          <Button
            title="👤 Patient"
            variant="outline"
            style={styles.demoBtn}
            textStyle={styles.demoBtnText}
            onPress={() => switchMockRole('patient')}
          />
          <Button
            title="🩺 Staff"
            variant="outline"
            style={styles.demoBtn}
            textStyle={styles.demoBtnText}
            onPress={() => switchMockRole('staff')}
          />
          <Button
            title="🏛️ City Admin"
            variant="outline"
            style={styles.demoBtn}
            textStyle={styles.demoBtnText}
            onPress={() => switchMockRole('admin')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  loginBtn: {
    marginTop: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  demoBox: {
    marginTop: 24,
    padding: 14,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    height: 38,
    marginVertical: 0,
    paddingHorizontal: 6,
  },
  demoBtnText: {
    fontSize: 12,
  },
});
