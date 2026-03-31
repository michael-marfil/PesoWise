import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const PIN_KEY = 'user_app_pin';
const SAVED_EMAIL_KEY = 'user_saved_email';
const SAVED_PASS_KEY = 'user_saved_pass';

export default function LoginScreen() {
  const { setVerified } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [view, setView] = useState<'options' | 'email' | 'signup' | 'pin'>('options');
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    const savedPin = await SecureStore.getItemAsync(PIN_KEY);
    setHasPin(!!savedPin);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    const isSignUp = view === 'signup';

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        
        await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email);
        await SecureStore.setItemAsync(SAVED_PASS_KEY, password);
        Alert.alert('Success', 'Account created! Now set your PIN.');
        setView('pin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email);
        await SecureStore.setItemAsync(SAVED_PASS_KEY, password);
        // Note: For email login, we still want the layout to ask for PIN setup/verify
      }
    } catch (error: any) {
      Alert.alert('Auth Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const [pin, setPin] = useState('');
  const handlePinPress = (num: string) => {
    if (pin.length < 6) setPin(prev => prev + num);
  };

  useEffect(() => {
    if (pin.length === 6) processPin();
  }, [pin]);

  const processPin = async () => {
    setLoading(true);
    try {
      const savedPin = await SecureStore.getItemAsync(PIN_KEY);
      const savedEmail = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
      const savedPass = await SecureStore.getItemAsync(SAVED_PASS_KEY);

      if (!savedPin) {
        // Setup Mode
        await SecureStore.setItemAsync(PIN_KEY, pin);
        setVerified(true); // User just created it, mark as verified
        Alert.alert("PIN Set", "Login complete!");
      } else {
        // Verify Mode
        if (pin === savedPin) {
          if (savedEmail && savedPass) {
            const { error } = await supabase.auth.signInWithPassword({
              email: savedEmail,
              password: savedPass
            });
            if (error) throw error;
            setVerified(true); // IMPORTANT: Tell layout we already verified!
          } else {
            throw new Error("No saved credentials found. Please use Email login.");
          }
        } else {
          Alert.alert("Incorrect PIN");
          setPin('');
        }
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>PesoWise</Text>
          <Text style={styles.subtitle}>Smart finance for Filipinos</Text>
        </View>

        {loading && <ActivityIndicator color="#378ADD" style={{ marginBottom: 20 }} />}

        {view === 'options' && (
          <View style={styles.form}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#378ADD' }]} 
              onPress={async () => {
                const savedPin = await SecureStore.getItemAsync(PIN_KEY);
                if (savedPin) {
                  setView('pin');
                } else {
                  Alert.alert("No PIN Set", "Please login with Email first to set up your security PIN.");
                }
              }}
            >
              <Ionicons name="keypad-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Login with PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryBtn]} 
              onPress={() => setView('email')}
            >
              <Ionicons name="mail-outline" size={20} color="#378ADD" style={{ marginRight: 10 }} />
              <Text style={[styles.buttonText, { color: '#378ADD' }]}>Login with Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleBtn} onPress={() => setView('signup')}>
              <Text style={styles.toggleText}>New here? Create an Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {(view === 'email' || view === 'signup') && (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={styles.modeTitle}>{view === 'signup' ? 'Sign Up' : 'Email Login'}</Text>
            {view === 'signup' && (
              <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
            )}
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            
            <TouchableOpacity style={[styles.button, { backgroundColor: '#378ADD' }]} onPress={handleEmailAuth} disabled={loading}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setView('options')}>
              <Text style={styles.toggleText}>Go Back</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}

        {view === 'pin' && (
          <View>
            <Text style={styles.modeTitle}>{hasPin ? 'Enter PIN' : 'Set your 6-digit PIN'}</Text>
            <View style={styles.dotsRow}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
              ))}
            </View>
            <View style={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <TouchableOpacity key={num} style={styles.key} onPress={() => handlePinPress(String(num))}>
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.key} />
              <TouchableOpacity style={styles.key} onPress={() => handlePinPress('0')}>
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={() => setPin(pin.slice(0, -1))}>
                <Ionicons name="backspace-outline" size={24} color="#444" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setView('options')}>
              <Text style={styles.toggleText}>Use Email Instead</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 38, fontWeight: '900', color: '#1a1a2e' },
  subtitle: { fontSize: 16, color: '#888', marginTop: 4 },
  form: { gap: 15 },
  modeTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 25, textAlign: 'center' },
  input: { height: 55, borderWidth: 1, borderColor: '#eee', borderRadius: 14, paddingHorizontal: 18, marginBottom: 15, fontSize: 16, backgroundColor: '#f9f9f9', color: '#111' },
  button: { height: 55, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  secondaryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#378ADD' },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  toggleBtn: { marginTop: 25, alignSelf: 'center' },
  toggleText: { color: '#378ADD', fontWeight: '600', fontSize: 14 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 40 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#ddd' },
  dotFilled: { backgroundColor: '#378ADD', borderColor: '#378ADD' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  key: { width: 75, height: 75, borderRadius: 40, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 24, fontWeight: '600', color: '#333' },
});
