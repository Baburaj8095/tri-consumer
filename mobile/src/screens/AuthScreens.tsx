import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/authService";
import SMSService from "../services/smsService";
import { RootStackParamList } from "../types/navigation";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/colors";
import { formatErrorMessage } from "../utils/errorFormatter";

type LoginView =
  | "login"
  | "login-otp-request"
  | "otp"
  | "forgot-password"
  | "forgot-password-otp"
  | "reset-password";
type RegisterForm = {
  sponsorId: string;
  sponsorName: string;
  fullName: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  gender: string;
  pinCode: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  country: string;
  password: string;
  termsAccepted: boolean;
};

const emptyOtp = ["", "", "", "", "", ""];
const sms = new SMSService();

function Shell({ children }: React.PropsWithChildren) {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secure,
  keyboardType = "default",
  right,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address" | "number-pad";
  right?: React.ReactNode;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={colors.muted}
            style={{ marginRight: 8 }}
          />
        ) : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={colors.muted}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {right}
      </View>
    </View>
  );
}

function OtpInputs({
  otp,
  setOtp,
}: {
  otp: string[];
  setOtp: (v: string[]) => void;
}) {
  const refs = useRef<Array<TextInput | null>>([]);
  return (
    <View style={styles.otpRow}>
      {otp.map((d, i) => (
        <TextInput
          key={i}
          ref={(n) => {
            refs.current[i] = n;
          }}
          style={styles.otpBox}
          value={d}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(v) => {
            const clean = v.replace(/[^0-9]/g, "").slice(0, 1);
            const next = [...otp];
            next[i] = clean;
            setOtp(next);
            if (clean && i < 5) refs.current[i + 1]?.focus();
          }}
        />
      ))}
    </View>
  );
}

function Checkbox({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.checkRow}>
      <View style={[styles.checkBox, value && styles.checkOn]}>
        {value ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

function MobileEntry({
  countryCode,
  setCountryCode,
  mobile,
  setMobile,
}: {
  countryCode: string;
  setCountryCode: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Mobile Number</Text>
      <View style={styles.mobileRow}>
        <Pressable
          style={styles.codeBox}
          onPress={() =>
            setCountryCode(
              countryCode === "+91"
                ? "+1"
                : countryCode === "+1"
                  ? "+44"
                  : "+91",
            )
          }
        >
          <Text style={styles.codeText}>{countryCode}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.textSecondary}
          />
        </Pressable>
        <View style={styles.mobileInputWrap}>
          <TextInput
            style={styles.input}
            value={mobile}
            onChangeText={(v) =>
              setMobile(v.replace(/[^0-9]/g, "").slice(0, 10))
            }
            placeholder="Enter mobile number"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>
    </View>
  );
}

function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.dividerText}>OR</Text>
      <View style={styles.line} />
    </View>
  );
}
function LinkText({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.linkTap}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}
function BrandLogo() {
  return (
    <View style={styles.logo}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logoImage}
        resizeMode="contain"
        accessibilityLabel="Trikonekt logo"
      />
    </View>
  );
}

export function LoginScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Login">) {
  const [view, setView] = useState<LoginView>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await authService.login(username, password);
      await setSession(data);
      navigation.replace("ConsumerHome");
    } catch (e) {
      setError(formatErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  const sendOtp = async () => {
    if (!/^[0-9]{10,15}$/.test(mobile)) {
      setError("Invalid mobile number format");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sms.sendOtp(
        `${countryCode}${mobile}`,
        null,
        view === "forgot-password" ? "FORGOT_PASSWORD" : "LOGIN",
      );
      setOtp(emptyOtp);
      setTimer(30);
      setView(view === "forgot-password" ? "forgot-password-otp" : "otp");
    } catch (e) {
      setError(formatErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (view === "forgot-password-otp") {
        setView("reset-password");
        return;
      }
      const data = await sms.verifyOtp(
        `${countryCode}${mobile}`,
        code,
        "LOGIN",
      );
      await setSession(data);
      navigation.replace("ConsumerHome");
    } catch (e) {
      setError(formatErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    Alert.alert("Updated", "Password updated successfully. Please login.");
    setView("login");
    setError("");
  };

  return (
    <Shell>
      <View style={styles.topRow}>
        {view !== "login" ? (
          <Pressable
            onPress={() => {
              setView("login");
              setError("");
            }}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Consumer Login</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>
      <BrandLogo />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue shopping</Text>
      {view === "login" ? (
        <View>
          <Field
            label="Username / Mobile"
            icon="person-outline"
            value={username}
            onChangeText={(v) => {
              setUsername(v);
              setError("");
            }}
            placeholder="Enter username"
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError("");
            }}
            placeholder="Enter password"
            secure={!showPassword}
            right={
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            }
          />
          <Pressable
            onPress={() => {
              setView("forgot-password");
              setMobile("");
            }}
          >
            <Text style={styles.forgot}>Forgot?</Text>
          </Pressable>
          <Checkbox
            value={rememberMe}
            onChange={setRememberMe}
            label="Remember Me"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primary} onPress={login} disabled={loading}>
            <Text style={styles.primaryText}>
              {loading ? "Verifying..." : "Login Securely"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
          <Divider />
          <Pressable
            style={styles.secondary}
            onPress={() => {
              setView("login-otp-request");
              setError("");
            }}
          >
            <Text style={styles.secondaryText}>Continue with OTP</Text>
          </Pressable>
          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.link}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {view === "login-otp-request" ? (
        <View>
          <MobileEntry
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            mobile={mobile}
            setMobile={setMobile}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={styles.primary}
            onPress={sendOtp}
            disabled={loading}
          >
            <Text style={styles.primaryText}>
              {loading ? "Sending..." : "Send OTP Code"}
            </Text>
          </Pressable>
          <LinkText label="Back to Login" onPress={() => setView("login")} />
        </View>
      ) : null}
      {view === "otp" || view === "forgot-password-otp" ? (
        <View>
          <Ionicons
            name="checkmark-circle-outline"
            size={48}
            color={colors.primary}
            style={{ alignSelf: "center" }}
          />
          <Text style={styles.stepTitle}>Enter Verification Code</Text>
          <Text style={styles.center}>
            We've sent a 6-digit code to {countryCode}{" "}
            {mobile || forgotIdentifier}
          </Text>
          <OtpInputs otp={otp} setOtp={setOtp} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.center}>
            {timer > 0
              ? `Resend OTP in 00:${timer < 10 ? "0" + timer : timer}`
              : ""}
          </Text>
          {timer === 0 ? (
            <LinkText label="Resend OTP" onPress={sendOtp} />
          ) : null}
          <Pressable
            style={styles.primary}
            onPress={verifyOtp}
            disabled={loading}
          >
            <Text style={styles.primaryText}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </Text>
          </Pressable>
          <LinkText
            label="Change Phone Number"
            onPress={() => setView("login-otp-request")}
          />
        </View>
      ) : null}
      {view === "forgot-password" ? (
        <View>
          <Field
            label="Email or Mobile"
            icon="person-outline"
            value={forgotIdentifier}
            onChangeText={(v) => {
              setForgotIdentifier(v);
              setMobile(v.replace(/[^0-9]/g, "").slice(0, 10));
            }}
            placeholder="Enter email or mobile"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primary} onPress={sendOtp}>
            <Text style={styles.primaryText}>Get Verification Code</Text>
          </Pressable>
          <LinkText label="Back to Login" onPress={() => setView("login")} />
        </View>
      ) : null}
      {view === "reset-password" ? (
        <View>
          <Field
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secure
            placeholder="Create new password"
          />
          <Field
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure
            placeholder="Confirm new password"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primary} onPress={reset}>
            <Text style={styles.primaryText}>Securely Update Password</Text>
          </Pressable>
        </View>
      ) : null}
    </Shell>
  );
}

export function RegisterScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "Register">) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterForm>({
    sponsorId: route.params?.sponsorId || "",
    sponsorName: "",
    fullName: "",
    countryCode: "+91",
    mobileNumber: "",
    email: "",
    gender: "female",
    pinCode: "",
    village: "",
    taluk: "",
    district: "",
    state: "",
    country: "",
    password: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [sponsorStatus, setSponsorStatus] = useState<
    "verified" | "invalid" | ""
  >("");
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState(emptyOtp);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const update = (key: keyof RegisterForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);
  useEffect(() => {
    const idVal = form.sponsorId.trim();
    if (!idVal) {
      setSponsorStatus("");
      return;
    }
    setSponsorLoading(true);
    const t = setTimeout(() => {
      void authService
        .validateSponsor(idVal)
        .then((res) => {
          if (res?.success && res?.data?.sponsorName) {
            update("sponsorName", res.data.sponsorName);
            setSponsorStatus("verified");
          } else setSponsorStatus("invalid");
        })
        .catch(() => setSponsorStatus("invalid"))
        .finally(() => setSponsorLoading(false));
    }, 800);
    return () => clearTimeout(t);
  }, [form.sponsorId]);
  useEffect(() => {
    const pin = form.pinCode.trim();
    if (pin.length !== 6) {
      setForm((p) => ({
        ...p,
        village: "",
        taluk: "",
        district: "",
        state: "",
        country: "",
      }));
      return;
    }
    setPinLoading(true);
    const t = setTimeout(() => {
      void authService
        .lookupPincode(pin)
        .then((res) => {
          const loc = res?.data;
          if (res?.success && loc) {
            setForm((p) => ({
              ...p,
              village: loc.village || "",
              taluk: loc.taluk || "",
              district: loc.district || "",
              state: loc.state || "",
              country: loc.country || "India",
            }));
            setErrors((e) => ({ ...e, pinCode: null }));
          } else setErrors((e) => ({ ...e, pinCode: "Pincode not found" }));
        })
        .catch((e) =>
          setErrors((prev) => ({ ...prev, pinCode: formatErrorMessage(e) })),
        )
        .finally(() => setPinLoading(false));
    }, 600);
    return () => clearTimeout(t);
  }, [form.pinCode]);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.sponsorId.trim()) e.sponsorId = "Sponsor ID is required";
      if (sponsorStatus === "invalid")
        e.sponsorId = "Sponsor ID not recognized";
      if (form.mobileNumber.length < 10)
        e.mobileNumber = "Enter a valid mobile number";
      if (!verified)
        e.mobileNumber = "Please verify your mobile number to continue";
    }
    if (s === 2) {
      if (!form.fullName.trim()) e.fullName = "Full Name is required";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email address";
      if (form.password.length < 6)
        e.password = "Password must be at least 6 characters";
    }
    if (s === 3) {
      if (form.pinCode.length !== 6)
        e.pinCode = "Enter a valid 6-digit pincode";
      if (!form.termsAccepted) e.termsAccepted = "You must accept the terms";
    }
    return e;
  };
  const nextStep = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setStep((s) => s + 1);
  };
  const sendRegOtp = async () => {
    if (form.mobileNumber.length < 10) {
      setErrors((e) => ({
        ...e,
        mobileNumber: "Enter a valid mobile number first",
      }));
      return;
    }
    setLoading(true);
    try {
      await sms.sendOtp(
        `${form.countryCode}${form.mobileNumber}`,
        null,
        "REGISTRATION",
      );
      setShowOtp(true);
      setOtp(emptyOtp);
      setTimer(30);
    } catch (e) {
      setErrors((prev) => ({ ...prev, mobileNumber: formatErrorMessage(e) }));
    } finally {
      setLoading(false);
    }
  };
  const verifyRegOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setErrors((e) => ({ ...e, mobileNumber: "Enter a 6-digit OTP" }));
      return;
    }
    setLoading(true);
    try {
      await sms.verifyOtp(
        `${form.countryCode}${form.mobileNumber}`,
        code,
        "REGISTRATION",
      );
      setVerified(true);
      setShowOtp(false);
      setErrors((e) => ({ ...e, mobileNumber: null }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, mobileNumber: formatErrorMessage(e) }));
    } finally {
      setLoading(false);
    }
  };
  const submit = async () => {
    const e = validate(3);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register({
        sponsorId: form.sponsorId.trim().toUpperCase(),
        sponsorName: form.sponsorName,
        fullName: form.fullName,
        countryCode: form.countryCode,
        mobile: form.mobileNumber,
        email: form.email,
        pinCode: form.pinCode,
        district: form.district,
        state: form.state,
        password: form.password,
      });
      await setSession(data);
      Alert.alert("Registration complete!", "Please login to continue.");
      navigation.navigate("Login");
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: formatErrorMessage(err) }));
    } finally {
      setLoading(false);
    }
  };
  const strength = Math.min(
    100,
    (form.password.length >= 6 ? 34 : 0) +
      (/[a-zA-Z]/.test(form.password) ? 33 : 0) +
      (/[0-9]/.test(form.password) ? 33 : 0),
  );

  return (
    <Shell>
      <BrandLogo />
      <View style={styles.registerHeaderRow}>
        <Pressable
          onPress={() =>
            step > 1 ? setStep((s) => s - 1) : navigation.navigate("Login")
          }
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step {step} of 3</Text>
        </View>
      </View>
      <View style={styles.progress}>
        <View style={styles.progressLine} />
        <View style={[styles.dot, step >= 1 && styles.dotOn]} />
        <View style={[styles.dot, step >= 2 && styles.dotOn]} />
        <View style={[styles.dot, step >= 3 && styles.dotOn]} />
      </View>
      <Text style={styles.stepTitle}>
        {step === 1
          ? "Verification"
          : step === 2
            ? "Personal Details"
            : "Address Details"}
      </Text>
      {step === 1 ? (
        <>
          <Field
            label="Sponsor ID *"
            value={form.sponsorId}
            onChangeText={(v) => update("sponsorId", v.toUpperCase())}
            placeholder="Enter Sponsor ID"
            right={
              sponsorLoading ? (
                <Text>...</Text>
              ) : sponsorStatus === "verified" ? (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
              ) : null
            }
          />
          {sponsorStatus === "verified" && form.sponsorName ? (
            <Text style={styles.success}>Verified: {form.sponsorName}</Text>
          ) : null}
          {errors.sponsorId ? (
            <Text style={styles.error}>{errors.sponsorId}</Text>
          ) : null}
          <MobileEntry
            countryCode={form.countryCode}
            setCountryCode={(v) => update("countryCode", v)}
            mobile={form.mobileNumber}
            setMobile={(v) => {
              update("mobileNumber", v);
              setVerified(false);
              setShowOtp(false);
            }}
          />
          {verified ? (
            <Text style={styles.success}>Mobile number verified</Text>
          ) : null}
          {errors.mobileNumber ? (
            <Text style={styles.error}>{errors.mobileNumber}</Text>
          ) : null}
          {showOtp && !verified ? (
            <View style={styles.otpPanel}>
              <Text style={styles.label}>Enter 6-digit OTP</Text>
              <OtpInputs otp={otp} setOtp={setOtp} />
              <Text style={styles.center}>
                {timer > 0
                  ? `Resend OTP in 00:${timer < 10 ? "0" + timer : timer}`
                  : ""}
              </Text>
              <Pressable style={styles.secondary} onPress={verifyRegOtp}>
                <Text style={styles.secondaryText}>Confirm OTP</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}
      {step === 2 ? (
        <>
          <Field
            label="Full Name *"
            value={form.fullName}
            onChangeText={(v) => update("fullName", v)}
            placeholder="Enter your full name"
          />
          {errors.fullName ? (
            <Text style={styles.error}>{errors.fullName}</Text>
          ) : null}
          <Field
            label="Email ID"
            value={form.email}
            onChangeText={(v) => update("email", v)}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          {errors.email ? (
            <Text style={styles.error}>{errors.email}</Text>
          ) : null}
          <Text style={styles.label}>Gender *</Text>
          <View style={styles.genderRow}>
            {["female", "male", "other"].map((g) => (
              <Pressable
                key={g}
                style={[
                  styles.genderChip,
                  form.gender === g && styles.genderChipOn,
                ]}
                onPress={() => update("gender", g)}
              >
                <Text
                  style={[
                    styles.genderText,
                    form.gender === g && styles.genderTextOn,
                  ]}
                >
                  {g[0].toUpperCase() + g.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Field
            label="Password *"
            value={form.password}
            onChangeText={(v) => update("password", v)}
            placeholder="Create a secure password"
            secure={!showPassword}
            right={
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            }
          />
          {form.password ? (
            <View style={styles.strengthTrack}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${strength}%`,
                    backgroundColor:
                      strength < 50
                        ? colors.danger
                        : strength < 100
                          ? "#f59e0b"
                          : colors.success,
                  },
                ]}
              />
            </View>
          ) : null}
          {errors.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}
        </>
      ) : null}
      {step === 3 ? (
        <>
          <Field
            label="Pincode *"
            value={form.pinCode}
            onChangeText={(v) =>
              update("pinCode", v.replace(/[^0-9]/g, "").slice(0, 6))
            }
            placeholder="Enter pincode"
            keyboardType="number-pad"
            right={
              pinLoading ? (
                <Text>...</Text>
              ) : form.village ? (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
              ) : null
            }
          />
          {errors.pinCode ? (
            <Text style={styles.error}>{errors.pinCode}</Text>
          ) : (
            <Text style={styles.helper}>
              Enter pincode to auto-fetch location
            </Text>
          )}
          <View style={styles.addressBox}>
            {(
              ["village", "taluk", "district", "state", "country"] as const
            ).map((k) => (
              <Field
                key={k}
                label={k[0].toUpperCase() + k.slice(1)}
                value={form[k]}
                onChangeText={() => undefined}
                placeholder={k}
              />
            ))}
          </View>
          <Checkbox
            value={form.termsAccepted}
            onChange={(v) => update("termsAccepted", v)}
            label="I agree to the Terms & Conditions and Privacy Policy."
          />
          {errors.termsAccepted ? (
            <Text style={styles.error}>{errors.termsAccepted}</Text>
          ) : null}
        </>
      ) : null}
      {errors.submit ? <Text style={styles.error}>{errors.submit}</Text> : null}
      <View style={styles.shield}>
        <Ionicons name="shield-checkmark" size={16} color={colors.success} />
        <Text style={styles.shieldText}>Secure & Encrypted Registration</Text>
      </View>
      {step < 3 ? (
        verified || step > 1 ? (
          <Pressable style={styles.primary} onPress={nextStep}>
            <Text style={styles.primaryText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        ) : !showOtp ? (
          <Pressable
            style={styles.primary}
            onPress={sendRegOtp}
            disabled={loading}
          >
            <Text style={styles.primaryText}>
              {loading ? "Sending OTP..." : "Send OTP First"}
            </Text>
          </Pressable>
        ) : null
      ) : (
        <Pressable style={styles.primary} onPress={submit} disabled={loading}>
          <Text style={styles.primaryText}>
            {loading ? "Creating account..." : "Create Account"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      )}
      {step === 1 ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Login</Text>
          </Pressable>
        </View>
      ) : null}
    </Shell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fcfcfc" },
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexGrow: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  badge: {
    backgroundColor: "#fff0e6",
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ffd9cc",
  },
  badgeText: { color: colors.primary, fontWeight: "800", fontSize: 13 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  logoImage: { width: 68, height: 68 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edf3fc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e0ebfa",
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    height: 52,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  forgot: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "right",
    marginTop: 10,
  },
  checkRow: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#fff",
    borderColor: colors.muted,
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 99,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 99,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: {
    color: colors.muted,
    marginHorizontal: 14,
    fontWeight: "800",
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: { fontSize: 14, color: colors.textSecondary, fontWeight: "600" },
  link: { fontSize: 14, fontWeight: "800", color: colors.primary },
  linkTap: { alignSelf: "center", padding: 10 },
  error: {
    color: colors.danger,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  success: { color: colors.success, fontWeight: "800", marginTop: 8 },
  center: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 18,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 18,
    color: colors.text,
  },
  mobileRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  codeBox: {
    width: 72,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginRight: 10,
  },
  codeText: { fontSize: 15, fontWeight: "700", color: colors.text },
  mobileInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  registerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  back: { padding: 6, borderRadius: 99, backgroundColor: "#f1f5f9" },
  stepBadge: {
    backgroundColor: "#fff0e6",
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  stepBadgeText: { color: colors.primary, fontWeight: "800", fontSize: 12 },
  progress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "relative",
    width: "100%",
    height: 20,
  },
  progressLine: {
    position: "absolute",
    left: 24,
    right: 24,
    top: 9,
    height: 2,
    backgroundColor: colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotOn: { backgroundColor: colors.primary },
  otpPanel: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 12,
    marginTop: 10,
  },
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  genderChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  genderChipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: { color: colors.textSecondary, fontWeight: "800" },
  genderTextOn: { color: "#fff" },
  strengthTrack: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  strengthFill: { height: "100%" },
  helper: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  addressBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 10,
    marginTop: 10,
  },
  shield: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14,
  },
  shieldText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: "700",
    marginLeft: 6,
  },
});
