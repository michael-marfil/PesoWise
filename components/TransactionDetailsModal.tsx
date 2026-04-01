import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Transaction } from '../context/TransactionContext';
import { CATEGORIES, fmt } from '../constants/data';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
};

export default function TransactionDetailsModal({ visible, transaction, onClose }: Props) {
  if (!transaction) return null;

  const cat = CATEGORIES.find(c => c.name === transaction.category) || { icon: '📦', color: '#888' };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
            <Text style={styles.icon}>{cat.icon}</Text>
          </View>

          <Text style={styles.amount}>
            {transaction.type === 'income' ? '+' : '-'}{fmt(transaction.amount)}
          </Text>
          <Text style={styles.description}>{transaction.description}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{transaction.category}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Wallet</Text>
              <Text style={styles.value}>{transaction.wallet}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{transaction.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Type</Text>
              <Text style={[styles.value, { color: transaction.type === 'income' ? '#1D9E75' : '#E24B4A', textTransform: 'capitalize' }]}>
                {transaction.type}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  amount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
});
