import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import Toast from 'react-native-toast-message';
import AnimatedSplashScreen from "../components/AnimatedSplashScreen";
import LoadingOverlay from "../components/LoadingOverlay";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { TransactionProvider, useTransactions } from "../context/TransactionContext";
import PinScreen from "./(auth)/pin";

const PIN_KEY = 'user_app_pin';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function RootNavigation() {
  const { session, loading: authLoading, isVerified, setVerified } = useAuth();
  const { loading: txLoading, isSubmitting } = useTransactions();
  const segments = useSegments();
  const router = useRouter();

  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  // 1. Check for existing PIN
  useEffect(() => {
    (async () => {
      const savedPin = await SecureStore.getItemAsync(PIN_KEY);
      setHasPin(!!savedPin);
    })();
  }, [session]);

  // 2. Handle simple navigation redirects
  useEffect(() => {
    if (authLoading || hasPin === null || !isSplashFinished) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } 
    else if (session && isVerified && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, authLoading, segments, isVerified, hasPin, isSplashFinished]);

  // 3. LISTEN FOR OTA UPDATES (The "Update Notif")
  useEffect(() => {
    if (!__DEV__) { // Only check in production/APK
      const checkUpdate = async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Alert.alert(
              "🚀 New Update Ready!",
              "We just fixed some bugs and added new features. Restart now to see them?",
              [
                { text: "Later", style: "cancel" },
                { text: "Update Now", onPress: () => Updates.reloadAsync() }
              ]
            );
          }
        } catch (e) {
          console.log("Update check failed:", e);
        }
      };
      checkUpdate();
    }
  }, []);

  // 4. SCHEDULE DAILY REMINDER (The "Log Reminder")
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // Clear old ones first
        await Notifications.cancelAllScheduledNotificationsAsync();
        // Schedule at 8:00 PM daily
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "PesoWise Reminder 💰",
            body: "Did you buy anything today? Don't forget to log your expenses!",
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 20,
            minute: 0,
          },
        });
      }
    })();
  }, []);

  if (!isSplashFinished) {
    return <AnimatedSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  if (authLoading || hasPin === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#378ADD" />
      </View>
    );
  }

  if (!session) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" />
      </Stack>
    );
  }

  if (session && !hasPin && !isVerified) {
    return <PinScreen mode="setup" onSuccess={() => { setHasPin(true); setVerified(true); }} />;
  }

  if (session && hasPin && !isVerified) {
    return <PinScreen mode="verify" onSuccess={() => setVerified(true)} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <LoadingOverlay visible={txLoading || isSubmitting} message="Please wait..." />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <RootNavigation />
      </TransactionProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});
