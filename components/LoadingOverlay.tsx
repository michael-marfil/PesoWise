import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';

export default function LoadingOverlay({ visible, message = "Processing..." }: { visible: boolean, message?: string }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#378ADD" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  }
});
