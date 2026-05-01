import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, Circle, CheckCircle2, ArrowRight, X } from 'lucide-react-native';

const COLORS = {
  primary: '#39B5A8',
  primaryLight: '#9EE0D3',
  primaryFaint: '#F1FAF8',
  dark: '#041614',
  background: '#F0F9F8',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  border: '#E6F5F2',
  inputBg: '#F7FDFB',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  return (
    <SafeAreaView testID="login-screen" style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.flex}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.heroDark}>Hatid Agad,</Text>
            <Text style={styles.heroPrimary}>Walang Abala.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log In</Text>
            <Text style={styles.cardSubtitle}>
              Welcome back! Log in to manage your shipments.
            </Text>

            {/* Email */}
            <Text style={styles.inputLabel}>Email or Mobile Number</Text>
            <View style={styles.inputRow}>
              <Mail color={COLORS.primary} size={20} opacity={0.7} />
              <TextInput
                style={styles.textInput}
                placeholder="customer@pakiship.com"
                placeholderTextColor={COLORS.gray400}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>

            {/* Password */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Password</Text>
            <View style={styles.inputRow}>
              <Lock color={COLORS.primary} size={20} opacity={0.7} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={COLORS.gray400}
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={setPassword}
                textContentType="password"
                autoComplete="password"
                autoCorrect={false}
                spellCheck={false}
              />
              <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                {secureTextEntry
                  ? <Eye color={COLORS.gray400} size={20} />
                  : <EyeOff color={COLORS.gray400} size={20} />}
              </TouchableOpacity>
            </View>

            {/* Remember Me + Forgot Password */}
            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.rememberLeft}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe
                  ? <CheckCircle2 color={COLORS.primary} size={20} />
                  : <Circle color={COLORS.gray300} size={20} />}
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setResetModalVisible(true)}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueBtn}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>

            {/* Create Account */}
            <View style={styles.createRow}>
              <Text style={styles.createText}>New to PakiSHIP? </Text>
              <TouchableOpacity>
                <Text style={styles.createLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reset Password Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={resetModalVisible}
        onRequestClose={() => setResetModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setResetModalVisible(false)}
            />
            <View style={styles.modalSheet}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setResetModalVisible(false)}
              >
                <X color={COLORS.gray300} size={24} strokeWidth={2} />
              </TouchableOpacity>

              <View style={styles.modalIconBox}>
                <Lock color={COLORS.primary} size={26} strokeWidth={2.5} />
              </View>

              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>
                Enter your details to receive a reset link.
              </Text>

              <View style={styles.modalInput}>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="Email or Mobile"
                  placeholderTextColor={COLORS.primaryLight}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="email"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>Send Reset Link</Text>
                <ArrowRight color={COLORS.white} size={18} strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },

  // Header
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroDark: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  heroPrimary: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.gray400,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 16,
    lineHeight: 20,
  },

  // Input
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
    paddingVertical: 0,
  },

  // Remember Me
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray500,
    marginLeft: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Continue Button
  continueBtn: {
    backgroundColor: COLORS.dark,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 14,
  },

  // Create Account
  createRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  createText: {
    color: COLORS.gray400,
    fontSize: 14,
    fontWeight: '500',
  },
  createLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4,22,20,0.6)',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 48,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalClose: {
    position: 'absolute',
    top: 28,
    right: 28,
    zIndex: 10,
    padding: 8,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.dark,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray400,
    marginBottom: 28,
  },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 60,
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
    paddingVertical: 0,
  },
  resetBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 30,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12,
    marginRight: 4,
  },
});
