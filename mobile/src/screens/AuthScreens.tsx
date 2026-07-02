import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import SMSService from '../services/smsService';
import { formatErrorMessage } from '../utils/errorFormatter';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

// Custom Checkbox
const Checkbox = ({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label: string }) => (
  <Pressable onPress={() => onValueChange(!value)} style={styles.checkboxContainer}>
    <View style={[
      styles.checkboxBox,
      value ? styles.checkboxChecked : styles.checkboxUnchecked
    ]}>
      {value && <Ionicons name="checkmark" size={14} color="#fff" />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </Pressable>
);

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const [username, setUsername] = useState('8095918105');
  const [password, setPassword] = useState('******');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otpMode, setOtpMode] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const setSession = useAuthStore(state => state.setSession);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      await setSession(data);
      navigation.replace('ConsumerHome');
    } catch (err) {
      Alert.alert('Login failed', formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!mobile) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }
    setLoading(true);
    try {
      await new SMSService().sendOtp(`+91${mobile}`, null, 'LOGIN');
      setOtpSent(true);
      Alert.alert('OTP Sent', 'An OTP has been sent to your mobile number.');
    } catch (err) {
      Alert.alert('OTP failed', formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Mock OTP verification for integration placeholder
    Alert.alert('OTP Verified', 'Logging you in...');
    navigation.replace('ConsumerHome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Badge at top */}
          <View style={styles.topBadgeContainer}>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>Consumer Login</Text>
            </View>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoFrame}>
              <Image source={require('../../assets/TRIKONEKT.png')} style={styles.logo} resizeMode="contain" />
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Login to continue shopping</Text>
          </View>

          {!otpMode ? (
            /* Password Login Form */
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Username / Mobile</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Username / Mobile"
                  placeholderTextColor={colors.muted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <Pressable onPress={() => Alert.alert('Forgot Password', 'Please contact support to reset your password.')}>
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </Pressable>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
                </Pressable>
              </View>

              <Checkbox value={rememberMe} onValueChange={setRememberMe} label="Remember Me" />

              <Pressable style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Login Securely</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </Pressable>
            </View>
          ) : (
            /* OTP Login Form */
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Mobile number"
                  placeholderTextColor={colors.muted}
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {otpSent && (
                <>
                  <Text style={styles.inputLabel}>Enter OTP</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="key-outline" size={20} color={colors.muted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={colors.muted}
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </>
              )}

              <Pressable
                style={styles.primaryButton}
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              >
                <Text style={styles.primaryButtonText}>{otpSent ? 'Verify & Login' : 'Send OTP First'}</Text>
              </Pressable>
            </View>
          )}

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Toggle OTP/Password Button */}
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setOtpMode(!otpMode);
              setOtpSent(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>
              {otpMode ? 'Login with Password' : 'Continue with OTP'}
            </Text>
          </Pressable>

          {/* Footer Link */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>New here? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLinkText}>Create Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const [sponsorId, setSponsorId] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!sponsorId || !mobile) {
      Alert.alert('Error', 'Please enter Sponsor ID and Mobile Number');
      return;
    }
    Alert.alert('OTP Sent', 'Verification OTP sent to mobile number.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.registerHeaderRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 1 of 3</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarLine} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
          <View style={[styles.progressDot, styles.progressDotInactive]} />
        </View>

        {/* Title */}
        <View style={styles.headerContainer}>
          <Text style={styles.registerTitle}>Verification</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Sponsor ID *</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInputNoIcon}
              placeholder="Enter Sponsor ID"
              placeholderTextColor={colors.muted}
              value={sponsorId}
              onChangeText={setSponsorId}
              autoCapitalize="characters"
            />
          </View>

          <Text style={styles.inputLabel}>Mobile Number *</Text>
          <View style={styles.mobileInputRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
            </View>
            <View style={styles.mobileInputWrapper}>
              <TextInput
                style={styles.textInputNoIcon}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.muted}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Secure Shield Info */}
          <View style={styles.shieldInfoContainer}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={styles.shieldInfoText}>Secure & Encrypted Registration</Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleSendOtp}>
            <Text style={styles.primaryButtonText}>Send OTP First</Text>
          </Pressable>
        </View>

        {/* Footer Link */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLinkText}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 20, flexGrow: 1, justifyContent: 'center' },
  
  // Badge at top
  topBadgeContainer: { alignItems: 'center', marginBottom: 24 },
  topBadge: { backgroundColor: '#fff0e6', borderRadius: 99, paddingVertical: 6, paddingHorizontal: 16, borderWidth: 1, borderColor: '#ffd9cc' },
  topBadgeText: { color: colors.primary, fontWeight: '800', fontSize: 13 },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoFrame: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  logo: { width: 50, height: 50 },

  // Header Title Text
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  welcomeTitle: { fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center' },
  welcomeSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

  // Form styles
  formContainer: { width: '100%', marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 8, marginTop: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#edf3fc', borderRadius: 14, borderWidth: 1, borderColor: '#e0ebfa', paddingHorizontal: 14, marginBottom: 4 },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, height: 52, color: colors.text, fontSize: 15, fontWeight: '600' },
  textInputNoIcon: { flex: 1, height: 52, color: colors.text, fontSize: 15, fontWeight: '600', paddingHorizontal: 4 },
  eyeIcon: { padding: 4 },
  forgotLink: { fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 12 },

  // Custom Checkbox
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  checkboxBox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxUnchecked: { backgroundColor: '#fff', borderColor: colors.muted },
  checkboxLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },

  // Buttons
  primaryButton: { backgroundColor: colors.primary, borderRadius: 99, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, borderRadius: 99, height: 52, alignItems: 'center', justifyContent: 'center', marginVertical: 8, borderStyle: 'solid' },
  secondaryButtonText: { color: colors.textSecondary, fontSize: 14, fontWeight: '800' },

  // Divider
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, marginHorizontal: 14, fontWeight: '800', fontSize: 13 },

  // Footer Link
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  footerText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  footerLinkText: { fontSize: 14, fontWeight: '800', color: colors.primary },

  // Register Header Row
  registerHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 6, borderRadius: 99, backgroundColor: '#f1f5f9' },
  stepBadge: { backgroundColor: '#fff0e6', borderRadius: 99, paddingVertical: 4, paddingHorizontal: 12 },
  stepBadgeText: { color: colors.primary, fontWeight: '800', fontSize: 12 },

  // Progress Bar
  progressBarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24, position: 'relative', width: '100%', height: 20 },
  progressBarLine: { position: 'absolute', left: 24, right: 24, top: 9, height: 2, backgroundColor: colors.border, zIndex: 0 },
  progressDot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  progressDotActive: { backgroundColor: colors.primary },
  progressDotInactive: { backgroundColor: colors.border },

  registerTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center' },

  // Mobile inputs
  mobileInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  countryCodeBox: { width: 68, height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  countryCodeText: { fontSize: 15, fontWeight: '700', color: colors.text },
  mobileInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },

  // Shield subtext
  shieldInfoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
  shieldInfoText: { fontSize: 13, color: colors.success, fontWeight: '700', marginLeft: 6 }
});