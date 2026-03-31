import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Vibration } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PIN_KEY = 'user_app_pin';

type Props = {
  mode: 'setup' | 'verify';
  onSuccess: () => void;
};

export default function PinScreen({ mode, onSuccess }: Props) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handlePress = (num: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 6) {
      processPin();
    }
  }, [pin]);

  const processPin = async () => {
    if (mode === 'verify') {
      const savedPin = await SecureStore.getItemAsync(PIN_KEY);
      if (pin === savedPin) {
        onSuccess();
      } else {
        Vibration.vibrate();
        Alert.alert("Incorrect PIN", "Please try again.");
        setPin('');
      }
    } else {
      // Setup mode
      if (!isConfirming) {
        setConfirmPin(pin);
        setPin('');
        setIsConfirming(true);
      } else {
        if (pin === confirmPin) {
          await SecureStore.setItemAsync(PIN_KEY, pin);
          Alert.alert("PIN Set", "Your app is now secured.");
          onSuccess();
        } else {
          Vibration.vibrate();
          Alert.alert("Mismatch", "PINs do not match. Start over.");
          setPin('');
          setConfirmPin('');
          setIsConfirming(false);
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="lock-closed" size={40} color="#378ADD" style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={styles.title}>
          {mode === 'verify' ? 'Enter PIN' : (isConfirming ? 'Confirm PIN' : 'Create PIN')}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'verify' ? 'Unlock your PesoWise account' : 'Set a 6-digit code for quick access'}
        </Text>

        <View style={styles.dotsRow}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
          ))}
        </View>

        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <TouchableOpacity key={num} style={styles.key} onPress={() => handlePress(String(num))}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.key} />
          <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleBackspace}>
            <Ionicons name="backspace-outline" size={28} color="#444" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8, marginBottom: 40 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 50 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#ddd' },
  dotFilled: { backgroundColor: '#378ADD', borderColor: '#378ADD' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  key: { width: 75, height: 75, borderRadius: 40, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 26, fontWeight: '600', color: '#333' },
});
