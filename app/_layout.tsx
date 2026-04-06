import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { TransactionProvider, useTransactions } from "../context/TransactionContext";
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import LoadingOverlay from "../components/LoadingOverlay";
import * as SecureStore from 'expo-secure-store';
import PinScreen from "./(auth)/pin";
import AnimatedSplashScreen from "../components/AnimatedSplashScreen";
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

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

  // Hide the native splash screen immediately on mount since we have our own animated one
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // 1. Check for existing PIN
  useEffect(() => {
    (async () => {
      try {
        const savedPin = await SecureStore.getItemAsync(PIN_KEY);
        setHasPin(!!savedPin);
      } catch (e) {
        setHasPin(false);
      }
    })();
  }, [session]);

  // 2. Handle simple navigation redirects
  useEffect(() => {
    if (!isSplashFinished || authLoading || hasPin === null) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } 
    else if (session && isVerified && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, authLoading, segments, isVerified, hasPin, isSplashFinished]);

  // 3. LISTEN FOR OTA UPDATES & SETUP DAILY REMINDERS
  useEffect(() => {
    // Check for updates
    if (!__DEV__) {
      const checkUpdate = async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Alert.alert("🚀 Update Ready", "Restart now?", [
              { text: "Later" },
              { text: "Now", onPress: () => Updates.reloadAsync() }
            ]);
          }
        } catch (e) {}
      };
      checkUpdate();
    }

    // SETUP DAILY 8 PM REMINDER
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        let finalStatus = status;
        if (status !== 'granted') {
          const { status: askStatus } = await Notifications.requestPermissionsAsync();
          finalStatus = askStatus;
        }

        if (finalStatus === 'granted') {
          // Clear old ones to avoid duplicates
          await Notifications.cancelAllScheduledNotificationsAsync();

          // Schedule new daily reminder
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "PesoWise Reminder 💰",
              body: "Don't forget to log your transactions for today!",
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: 20, // 8 PM
              minute: 0,
            },
          });
          console.log("✅ 8 PM Reminder scheduled!");
        }
      } catch (e) {
        console.warn("Notification setup failed", e);
      }
    })();
  }, []);

  // --- UI RENDERING ---

  // Phase 1: Show the Animation immediately
  if (!isSplashFinished) {
    return <AnimatedSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  // Phase 2: After animation, handle loading/auth/app
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

  if (session && !isVerified) {
    if (!hasPin) {
      return <PinScreen mode="setup" onSuccess={() => { setHasPin(true); setVerified(true); }} />;
    }
    return <PinScreen mode="verify" onSuccess={() => setVerified(true)} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <LoadingOverlay visible={txLoading || isSubmitting} message="Syncing..." />
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
