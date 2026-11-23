import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { COLORS } from '../../utils/constants';

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useAuth();
  const [role, setRole] = useState('patient'); // 'patient' or 'staff'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    await register({
      name,
      email,
      password,
      phone,
      role,
      age: age ? parseInt(age, 10) : undefined,
      gender,
      bloodGroup,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Create Account</Text>

        {/* Role Selection */}
        <Text style={styles.label}>Register As</Text>
        <View style={styles.roleToggle}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]}
            onPress={() => setRole('patient')}
          >
            <Text style={[styles.roleBtnText, role === 'patient' && styles.roleBtnTextActive]}>
              👤 Patient
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'staff' && styles.roleBtnActive]}
            onPress={() => setRole('staff')}
          >
            <Text style={[styles.roleBtnText, role === 'staff' && styles.roleBtnTextActive]}>
              🩺 Hospital Staff
            </Text>
          </TouchableOpacity>
        </View>

        <Input label="Full Name *" placeholder="e.g. Rahul Sharma" value={name} onChangeText={setName} />
        <Input label="Email Address *" placeholder="e.g. rahul@carequeue.org" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Password *" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
        <Input label="Phone Number *" placeholder="+91 98765 43210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        {role === 'patient' && (
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="Age" placeholder="28" value={age} onChangeText={setAge} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Blood Group" placeholder="O+" value={bloodGroup} onChangeText={setBloodGroup} />
            </View>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button title="Create Account" onPress={handleRegister} loading={isLoading} style={styles.registerBtn} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Card>
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
  card: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleBtnActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleBtnTextActive: {
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
  },
  registerBtn: {
    marginTop: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 4,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});
