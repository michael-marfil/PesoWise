import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useTransactions, Wallet } from '../context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function RecurringScreen() {
  const { recurringTransactions, categories, addRecurringTransaction, deleteRecurringTransaction, isSubmitting, fmt } = useTransactions();
  
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'expense' | 'income',
    category: 'Bills',
    wallet: 'Bank' as Wallet,
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | '15_30',
    is_business_day_adjusted: false
  });

  const handleAdd = async () => {
    if (!form.description || !form.amount) {
      Alert.alert("Missing Fields", "Please enter a description and amount.");
      return;
    }
    await addRecurringTransaction({
      ...form,
      amount: parseFloat(form.amount)
    });
    setForm({ 
      description: '', 
      amount: '', 
      type: 'expense', 
      category: 'Bills', 
      wallet: 'Bank', 
      frequency: 'monthly',
      is_business_day_adjusted: false 
    });
    setShowAdd(false);
    Toast.show({ type: 'success', text1: 'Subscription Added!' });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Subscriptions', headerShadowVisible: false }} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Automatic Logging</Text>
          <Text style={styles.headerSub}>These items will be logged automatically on their next due date.</Text>
        </View>

        {recurringTransactions.length === 0 && !showAdd && (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTxt}>No recurring items yet.</Text>
          </View>
        )}

        {recurringTransactions.map(rt => (
          <View key={rt.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardDesc}>{rt.description}</Text>
              <Text style={styles.cardMeta}>{rt.frequency} · {rt.wallet} · Next: {rt.next_run_date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.cardAmount, rt.type === 'income' && { color: '#1D9E75' }]}>
                {rt.type === 'income' ? '+' : '-'}{fmt(rt.amount)}
              </Text>
              <TouchableOpacity onPress={() => deleteRecurringTransaction(rt.id)}>
                <Text style={styles.delBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {showAdd ? (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Subscription</Text>
            
            <View style={styles.typeRow}>
              {(['expense', 'income'] as const).map(t => (
                <TouchableOpacity key={t} onPress={() => setForm({ ...form, type: t })}
                  style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}>
                  <Text style={[styles.typeBtnTxt, form.type === t && styles.typeBtnTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.input} placeholder="Description (e.g. Netflix)" value={form.description} onChangeText={v => setForm({ ...form, description: v })} />
            <TextInput style={styles.input} placeholder="Amount (₱)" keyboardType="numeric" value={form.amount} onChangeText={v => setForm({ ...form, amount: v })} />
            
            <Text style={styles.label}>Category</Text>
            <View style={styles.pills}>
              {categories.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setForm({ ...form, category: c.name })}
                  style={[styles.pill, form.category === c.name && { borderColor: c.color, backgroundColor: c.color + "20" }]}>
                  <Text style={[styles.pillTxt, form.category === c.name && { color: c.color }]}>{c.icon} {c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Wallet</Text>
            <View style={styles.typeRow}>
              {(['Cash', 'GCash', 'Bank'] as const).map(w => (
                <TouchableOpacity key={w} onPress={() => setForm({ ...form, wallet: w })}
                  style={[styles.freqBtn, form.wallet === w && styles.freqBtnActive]}>
                  <Text style={[styles.freqBtnTxt, form.wallet === w && styles.freqBtnTxtActive]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.typeRow}>
              {(['daily', 'weekly', 'monthly', '15_30'] as const).map(f => (
                <TouchableOpacity key={f} onPress={() => setForm({ ...form, frequency: f })}
                  style={[styles.freqBtn, form.frequency === f && styles.freqBtnActive]}>
                  <Text style={[styles.freqBtnTxt, form.frequency === f && styles.freqBtnTxtActive]}>{f === '15_30' ? '15/30' : f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.toggleRow} 
              onPress={() => setForm({ ...form, is_business_day_adjusted: !form.is_business_day_adjusted })}
            >
              <Ionicons 
                name={form.is_business_day_adjusted ? "checkbox" : "square-outline"} 
                size={20} 
                color={form.is_business_day_adjusted ? "#378ADD" : "#ccc"} 
              />
              <Text style={styles.toggleLabel}>Adjust for Weekends (Friday if Sat/Sun)</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addBtnTxt}>Add New Subscription</Text>
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
  headerSub: { fontSize: 14, color: '#666', marginTop: 4, lineHeight: 20 },
  empty: { alignItems: 'center', marginTop: 60, opacity: 0.6 },
  emptyTxt: { fontSize: 16, color: '#999', marginTop: 12 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#f9f9f9', marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardInfo: { flex: 1 },
  cardDesc: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  cardAmount: { fontSize: 16, fontWeight: '700', color: '#E24B4A' },
  delBtn: { fontSize: 12, color: '#aaa', marginTop: 4, fontWeight: '600' },
  addBtn: { flexDirection: 'row', backgroundColor: '#378ADD', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  addBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  addForm: { backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#eee', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#E6F1FB', borderColor: '#378ADD' },
  typeBtnTxt: { fontSize: 14, color: '#666', fontWeight: '600', textTransform: 'capitalize' },
  typeBtnTxtActive: { color: '#378ADD' },
  freqBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa', alignItems: 'center' },
  freqBtnActive: { backgroundColor: '#378ADD', borderColor: '#378ADD' },
  freqBtnTxt: { fontSize: 12, color: '#888', fontWeight: '600', textTransform: 'capitalize' },
  freqBtnTxtActive: { color: '#fff' },
  label: { fontSize: 12, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: "#e0e0e0" },
  pillTxt: { fontSize: 12, color: "#888", fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 16, padding: 4 },
  toggleLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  cancelBtnTxt: { color: '#999', fontSize: 16, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: '#378ADD', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
