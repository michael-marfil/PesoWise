import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Transaction, useTransactions } from '../context/TransactionContext';
import { CATEGORIES } from '../constants/data';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
};

export default function TransactionDetailsModal({ visible, transaction, onClose }: Props) {
  const { setForm, setShowAdd, setEditingId, fmt } = useTransactions();
  if (!transaction) return null;

  const onEditPress = () => {
    // 1. Fill the form with existing data
    setForm({
      description: transaction.description,
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      wallet: transaction.wallet,
      to_wallet: transaction.to_wallet || "GCash",
    });
    // 2. Set the editing ID
    setEditingId(transaction.id);
    // 3. Close this modal and open the Add/Edit modal
    onClose();
    setShowAdd(true);
  };

  const cat = transaction.type === 'transfer' 
    ? { icon: '🔄', color: '#EF9F27' }
    : CATEGORIES.find(c => c.name === transaction.category) || { icon: '📦', color: '#888' };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
            {transaction.type === 'transfer' ? (
              <Ionicons name="swap-horizontal" size={32} color={cat.color} />
            ) : (
              <Text style={styles.icon}>{cat.icon}</Text>
            )}
          </View>

          <Text style={styles.amount}>
            {transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '' : '-'}{fmt(transaction.amount)}
          </Text>
          <Text style={styles.description}>{transaction.description}</Text>

          <View style={styles.divider} />

          {transaction.type === 'transfer' ? (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>From</Text>
                <Text style={styles.value}>{transaction.wallet}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>To</Text>
                <Text style={styles.value}>{transaction.to_wallet}</Text>
              </View>
            </View>
          ) : (
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
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{transaction.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Type</Text>
              <Text style={[styles.value, { 
                color: transaction.type === 'income' ? '#1D9E75' : transaction.type === 'transfer' ? '#EF9F27' : '#E24B4A', 
                textTransform: 'capitalize' 
              }]}>
                {transaction.type}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editBtn} onPress={onEditPress}>
              <Ionicons name="pencil" size={18} color="#378ADD" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    width: '100%',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#E6F1FB',
    borderWidth: 1,
    borderColor: '#378ADD',
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#378ADD',
  },
  closeBtn: {
    flex: 1,
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
