import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { BaseScreen } from '../components/BaseScreen';
import { InfoCard } from '../components/InfoCard';
import { authService } from '../services/authService';
import SMSService from '../services/smsService';
import { formatErrorMessage } from '../utils/errorFormatter';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const setSession = useAuthStore(state => state.setSession);

  const login = async () => {
    try {
      const data = await authService.login(username, password);
      await setSession(data);
      navigation.replace('ConsumerHome');
    } catch (err) {
      Alert.alert('Login failed', formatErrorMessage(err));
    }
  };

  const sendOtp = async () => {
    try {
      await new SMSService().sendOtp(`+91${mobile}`, null, 'LOGIN');
      Alert.alert('OTP sent', 'Implement React Native OTP entry screen next.');
    } catch (err) {
      Alert.alert('OTP failed', formatErrorMessage(err));
    }
  };

  return (
    <BaseScreen title="Consumer Login" subtitle="Native placeholder preserving password and OTP login integration points.">
      <TextInput style={styles.input} placeholder="Username / Mobile" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <AppButton label="Login" onPress={login} />
      <InfoCard title="OTP Login">
        <TextInput style={styles.input} placeholder="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        <AppButton label="Send OTP" variant="secondary" onPress={sendOtp} />
      </InfoCard>
      <AppButton label="Create account" variant="secondary" onPress={() => navigation.navigate('Register')} />
    </BaseScreen>
  );
}

export function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  return (
    <BaseScreen title="Consumer Registration" subtitle="Preserves sponsor validation, pincode lookup, mobile OTP, and registration API flow.">
      <InfoCard title="Integration points">
        <AppButton label="Validate sponsor TODO" variant="secondary" onPress={() => Alert.alert('TODO', 'Call authService.validateSponsor(sponsorId).')} />
        <AppButton label="Lookup pincode TODO" variant="secondary" onPress={() => Alert.alert('TODO', 'Call authService.lookupPincode(pinCode).')} />
        <AppButton label="Submit registration TODO" onPress={() => Alert.alert('TODO', 'Build RN form and call authService.register(payload).')} />
      </InfoCard>
      <AppButton label="Back to Login" variant="secondary" onPress={() => navigation.navigate('Login')} />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12, color: colors.text },
});