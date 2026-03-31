import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, Modal, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fmt } from "../../constants/data";
import { useTransactions, Wallet } from "../../context/TransactionContext";
import { Ionicons } from '@expo/vector-icons';

export default function BudgetScreen() {
  const { categoryTotals, updateBudget, totalIncome, totalBudgeted, isSubmitting, endDate, archiveCurrentPlan, savingsGoals, addSavingsGoal, updateSavingsGoalAmount, refreshData, refreshing } = useTransactions();
  
  const [editBudget, setEditBudget]     = useState<string | null>(null);
  const [budgetInput, setBudgetInput]   = useState("");

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName]           = useState("");
  const [goalTarget, setGoalTarget]       = useState("");
  
  const [depositModal, setDepositModal]   = useState<{ id: number, name: string, current: number } | null>(null);
  const [depositAmt, setDepositAmt]       = useState("");
  const [depositWallet, setDepositWallet] = useState<Wallet>("Cash");

  const unallocated = totalIncome - totalBudgeted;
  const isRangeFinished = new Date().toISOString().split('T')[0] >= endDate;

  const onArchivePress = () => {
    Alert.alert("Archive Plan", "Save this cycle to history?", [
      { text: "Cancel" },
      { text: "Archive", onPress: archiveCurrentPlan }
    ]);
  };

  const handleCreateGoal = async () => {
    if (!goalName || !goalTarget) return;
    await addSavingsGoal({ name: goalName, target_amount: parseFloat(goalTarget), current_amount: 0, icon: "🎯" });
    setShowGoalModal(false);
    setGoalName(""); setGoalTarget("");
  };

  const handleDeposit = async () => {
    if (!depositModal || !depositAmt) return;
    const newTotal = depositModal.current + parseFloat(depositAmt);
    // PASS: new total, source wallet, and goal name for the transaction record
    await updateSavingsGoalAmount(depositModal.id, newTotal, depositWallet, depositModal.name);
    setDepositModal(null);
    setDepositAmt("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget & Goals</Text>
          <Text style={styles.subtitle}>Plan your finances</Text>
        </View>
        {isRangeFinished && (
          <TouchableOpacity style={styles.archiveBtn} onPress={onArchivePress} disabled={isSubmitting}>
            <Text style={styles.archiveBtnTxt}>Archive</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={["#378ADD"]} tintColor="#378ADD" />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={styles.summaryVal}>{fmt(totalIncome)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>Total Budgeted</Text>
              <Text style={styles.summaryVal}>{fmt(totalBudgeted)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.unallocatedLabel}>Remaining to Allocate</Text>
            <Text style={[styles.unallocatedVal, unallocated < 0 && { color: '#FFBABA' }]}>
              {fmt(unallocated)}
            </Text>
          </View>
        </View>

        {/* Savings Goals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Goals 🐷</Text>
          <TouchableOpacity onPress={() => setShowGoalModal(true)}>
            <Text style={styles.addGoalBtn}>+ New Goal</Text>
          </TouchableOpacity>
        </View>

        {savingsGoals.length === 0 && (
          <View style={styles.emptyGoal}>
            <Text style={styles.emptyGoalText}>No goals yet. Set one to start saving!</Text>
          </View>
        )}

        {savingsGoals.map(g => {
          const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
          return (
            <View key={g.id} style={styles.goalCard}>
              <View style={styles.cardRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.goalIcon}><Text style={{ fontSize: 18 }}>{g.icon}</Text></View>
                  <View>
                    <Text style={styles.goalName}>{g.name}</Text>
                    <Text style={styles.goalTarget}>{fmt(g.current_amount)} of {fmt(g.target_amount)}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.depositBtn} 
                  onPress={() => setDepositModal({ id: g.id, name: g.name, current: g.current_amount })}
                >
                  <Text style={styles.depositText}>Deposit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: '#1D9E75' }]} />
              </View>
            </View>
          );
        })}

        {/* Category Budgets Section */}
        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 15 }]}>Category Budgets</Text>
        {categoryTotals.map(c => {
          const pct  = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;
          const over = c.spent > c.budget && c.budget > 0;
          return (
            <TouchableOpacity key={c.name} style={styles.card} onPress={() => { setEditBudget(editBudget === c.name ? null : c.name); setBudgetInput(String(c.budget)); }}>
              <View style={styles.cardRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                  <Text style={styles.catName}>{c.name}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.spent, over && { color: "#E24B4A" }]}>{fmt(c.spent)}</Text>
                  <Text style={styles.budgetOf}>/ {fmt(c.budget)}</Text>
                </View>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: over ? "#E24B4A" : c.color }]} />
              </View>
              {editBudget === c.name && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 15 }}>
                  <TextInput style={styles.input} keyboardType="numeric" value={budgetInput} onChangeText={setBudgetInput} autoFocus />
                  <TouchableOpacity style={[styles.saveBtn, { backgroundColor: c.color }]} onPress={() => { updateBudget(c.name, parseFloat(budgetInput) || 0); setEditBudget(null); }}>
                    {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnTextSmall}>Save</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Goal Modal */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Savings Goal</Text>
            <TextInput style={styles.modalInput} placeholder="What are you saving for?" value={goalName} onChangeText={setGoalName} />
            <TextInput style={styles.modalInput} placeholder="Target Amount (₱)" keyboardType="numeric" value={goalTarget} onChangeText={setGoalTarget} />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowGoalModal(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateGoal}><Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal visible={!!depositModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Deposit to {depositModal?.name}</Text>
            
            <Text style={styles.subLabel}>Deduct from wallet:</Text>
            <View style={styles.walletPicker}>
              {(["Cash", "GCash", "Bank"] as Wallet[]).map(w => (
                <TouchableOpacity 
                  key={w} 
                  onPress={() => setDepositWallet(w)}
                  style={[styles.miniWalletBtn, depositWallet === w && styles.miniWalletBtnActive]}
                >
                  <Text style={[styles.miniWalletText, depositWallet === w && styles.miniWalletTextActive]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.modalInput} placeholder="Amount to add (₱)" keyboardType="numeric" value={depositAmt} onChangeText={setDepositAmt} autoFocus />
            
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDepositModal(null)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#1D9E75' }]} onPress={handleDeposit}><Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: "800", color: "#111" },
  subtitle: { fontSize: 14, color: "#888", marginTop: 2 },
  archiveBtn: { backgroundColor: '#E1F5EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#1D9E75' },
  archiveBtnTxt: { color: '#0F6E56', fontSize: 12, fontWeight: '700' },
  summaryCard: { backgroundColor: '#378ADD', marginHorizontal: 20, borderRadius: 20, padding: 20, marginVertical: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  summaryVal: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 15 },
  unallocatedLabel: { color: '#fff', fontSize: 13, fontWeight: '500' },
  unallocatedVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  addGoalBtn: { color: '#378ADD', fontWeight: '700', fontSize: 13 },
  emptyGoal: { padding: 30, alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
  emptyGoalText: { color: '#aaa', fontSize: 13 },
  goalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  goalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  goalName: { fontSize: 15, fontWeight: '700', color: '#111' },
  goalTarget: { fontSize: 12, color: '#888', marginTop: 2 },
  depositBtn: { backgroundColor: '#E1F5EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  depositText: { color: '#1D9E75', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: "#f9f9f9", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0' },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  catName: { fontSize: 15, fontWeight: "600", color: "#111" },
  spent: { fontSize: 14, fontWeight: "700", color: "#111" },
  budgetOf: { fontSize: 12, color: "#888" },
  progressBg: { height: 8, backgroundColor: "#e8e8e8", borderRadius: 99, overflow: "hidden", marginTop: 10 },
  progressFill: { height: 8, borderRadius: 99 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: "#fff", color: "#111" },
  saveBtn: { paddingHorizontal: 15, borderRadius: 10, justifyContent: "center", alignItems: 'center' },
  btnTextSmall: { color: "#fff", fontSize: 12, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20, color: '#111' },
  subLabel: { fontSize: 12, color: '#888', marginBottom: 10, fontWeight: '600' },
  walletPicker: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  miniWalletBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  miniWalletBtnActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  miniWalletText: { fontSize: 12, color: '#888', fontWeight: '600' },
  miniWalletTextActive: { color: '#1D9E75' },
  modalInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 15 },
  modalRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#f0f0f0' },
  confirmBtn: { flex: 2, padding: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#378ADD' }
});
