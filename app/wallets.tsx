import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useTransactions } from '../context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function WalletsScreen() {
  const { wallets, addWallet, deleteWallet, isSubmitting } = useTransactions();
  
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💳');
  const [color, setColor] = useState('#378ADD');

  const WALLET_ICONS = ['💳', '💵', '💙', '🏦', '📱', '💰', '🪙', '💹'];
  const WALLET_COLORS = ['#378ADD', '#1D9E75', '#EF9F27', '#E24B4A', '#8E44AD', '#2C3E50', '#F39C12', '#16A085'];

  const handleAdd = async () => {
    if (!name) {
      Alert.alert("Missing Name", "Please enter a wallet name.");
      return;
    }
    await addWallet(name, icon, color);
    setName('');
    setShowAdd(false);
  };

  const onRemovePress = (id: number, name: string) => {
    Alert.alert("Remove Wallet", `Delete ${name}? This will not delete your transactions but they might show as 'Unknown' wallet.`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteWallet(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Manage Wallets', headerShadowVisible: false }} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Wallets</Text>
          <Text style={styles.headerSub}>Add accounts, digital wallets, or cash stash.</Text>
        </View>

        <View style={styles.list}>
          {wallets.map(w => (
            <View key={w.id} style={styles.walletCard}>
              <View style={[styles.iconBox, { backgroundColor: w.color + '20' }]}>
                <Text style={{ fontSize: 20 }}>{w.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.walletName}>{w.name}</Text>
              </View>
              <TouchableOpacity onPress={() => onRemovePress(w.id, w.name)}>
                <Ionicons name="trash-outline" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {showAdd ? (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Wallet</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Wallet Name (e.g. Maya, BPI)" 
              value={name} 
              onChangeText={setName} 
            />

            <Text style={styles.label}>Choose Icon</Text>
            <View style={styles.grid}>
              {WALLET_ICONS.map(i => (
                <TouchableOpacity key={i} onPress={() => setIcon(i)}
                  style={[styles.gridItem, icon === i && styles.gridItemActive]}>
                  <Text style={{ fontSize: 20 }}>{i}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Choose Color</Text>
            <View style={styles.grid}>
              {WALLET_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setColor(c)}
                  style={[styles.colorItem, { backgroundColor: c }, color === c && styles.colorItemActive]} />
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Create Wallet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addBtnTxt}>Add New Wallet</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111' },
  headerSub: { fontSize: 14, color: '#666', marginTop: 4 },
  list: { marginBottom: 20 },
  walletCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#f9f9f9', marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  walletName: { fontSize: 16, fontWeight: '700', color: '#111' },
  addBtn: { flexDirection: 'row', backgroundColor: '#378ADD', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  addForm: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#eee', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 16 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  label: { fontSize: 12, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  gridItem: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  gridItemActive: { borderColor: '#378ADD', backgroundColor: '#E6F1FB' },
  colorItem: { width: 35, height: 35, borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
  colorItemActive: { borderColor: '#111' },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  cancelBtnTxt: { color: '#999', fontSize: 16, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: '#378ADD', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
