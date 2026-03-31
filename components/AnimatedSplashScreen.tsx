import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default function AnimatedSplashScreen({ onFinish }: { onSuccess?: () => void, onFinish: () => void }) {
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(30)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Start animations in sequence
    Animated.parallel([
      // Global Fade
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      // Content Slide Up
      Animated.timing(contentY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      // Logo Pop In (with slight delay)
      Animated.sequence([
        Animated.delay(150),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Loading Bar (takes 2.2s)
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // 2. Trigger Finish after animations complete
    const timer = setTimeout(() => {
      onFinish();
    }, 3500); // Slightly longer than the bar animation

    return () => clearTimeout(timer);
  }, []);

  const barWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: contentY }] }]}>
        
        {/* LOGO MARK */}
        <Animated.View style={[styles.logoMark, { transform: [{ scale: logoScale }] }]}>
          <Text style={styles.logoSymbol}>₱</Text>
        </Animated.View>

        {/* WORDMARK */}
        <View style={styles.wordmark}>
          <Text style={styles.wordPeso}>Peso</Text>
          <Text style={styles.wordWise}>Wise</Text>
        </View>

        {/* TAGLINE */}
        <Text style={styles.tagline}>SMART MONEY MANAGEMENT</Text>

        {/* LOADER */}
        <View style={styles.loaderWrap}>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width: barWidth }]} />
          </View>
          <Text style={styles.loadingText}>LOADING...</Text>
        </View>

      </Animated.View>

      {/* VERSION */}
      <Animated.Text style={[styles.version, { opacity: fadeAnim }]}>v1.0.0</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoMark: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#3d9be9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    // Shadow for Android
    elevation: 10,
    // Shadow for iOS
    shadowColor: '#3d9be9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  logoSymbol: {
    fontSize: 56,
    fontWeight: '900',
    color: '#fff',
    marginTop: Platform.OS === 'android' ? -5 : 0,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordPeso: {
    fontSize: 46,
    fontWeight: '900',
    color: '#2a7ecb',
    letterSpacing: -1.5,
  },
  wordWise: {
    fontSize: 46,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -1.5,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#aac4dc',
    letterSpacing: 3,
  },
  loaderWrap: {
    marginTop: 52,
    alignItems: 'center',
    gap: 12,
  },
  barTrack: {
    width: 180,
    height: 4,
    backgroundColor: 'rgba(61,155,233,0.12)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#3d9be9',
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b0c8db',
    letterSpacing: 2,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 11,
    fontWeight: '700',
    color: '#cce0f0',
    letterSpacing: 1.5,
  },
});
