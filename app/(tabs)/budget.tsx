import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, Modal, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Category, useTransactions, Wallet } from "../../context/TransactionContext";
import { Ionicons } from "@expo/vector-icons";

export default function BudgetScreen() {
  const { categoryTotals, updateBudget, totalIncome, totalBudgeted, isSubmitting, endDate, archiveCurrentPlan, savingsGoals, addSavingsGoal, updateSavingsGoalAmount, refreshData, refreshing, wallets, fmt } = useTransactions();
  
  const [editing, setEditing] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState("");

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const [depositModal, setDepositModal] = useState<any>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositWallet, setDepositWallet] = useState<string>("Cash");

  const unallocated = totalIncome - totalBudgeted;

  const onSave = (category: string) => {
    updateBudget(category, parseFloat(tempVal) || 0);
    setEditing(null);
  };

  const handleAddGoal = async () => {
    if (!goalName || !goalTarget) return;
    await addSavingsGoal({ name: goalName, target_amount: parseFloat(goalTarget), current_amount: 0, icon: "🎯" });
    setShowGoalModal(false);
    setGoalName("");
    setGoalTarget("");
  };

  const handleDeposit = async () => {
    if (!depositAmt || !depositModal) return;
    const newTotal = depositModal.current_amount + parseFloat(depositAmt);
    // Use the goal name for the transaction record
    await updateSavingsGoalAmount(depositModal.id, newTotal, depositWallet, depositModal.name);
    setDepositModal(null);
    setDepositAmt("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Budgeting</Text>
        <TouchableOpacity style={styles.archiveBtn} onPress={archiveCurrentPlan}>
          <Ionicons name="archive-outline" size={18} color="#378ADD" />
          <Text style={styles.archiveText}>Archive Month</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={["#378ADD"]} />}
      >
        {/* SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>ESTIMATED INCOME</Text>
              <Text style={styles.summaryVal}>{fmt(totalIncome)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>TOTAL BUDGETED</Text>
              <Text style={styles.summaryVal}>{fmt(totalBudgeted)}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.unallocatedLabel}>UNALLOCATED</Text>
            <Text style={[styles.unallocatedVal, unallocated < 0 && { color: "#E24B4A" }]}>
              {fmt(unallocated)}
            </Text>
          </View>
        </View>

        {/* SAVINGS GOALS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Savings Goals</Text>
          <TouchableOpacity onPress={() => setShowGoalModal(true)}>
            <Text style={styles.addBtn}>+ New Goal</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalsList}>
          {savingsGoals.map(g => (
            <TouchableOpacity key={g.id} style={styles.goalCard} onPress={() => setDepositModal(g)}>
              <View style={styles.goalIcon}><Text style={{ fontSize: 20 }}>{g.icon}</Text></View>
              <Text style={styles.goalName}>{g.name}</Text>
              <Text style={styles.goalTarget}>{fmt(g.current_amount)} of {fmt(g.target_amount)}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min((g.current_amount/g.target_amount)*100, 100)}%` }]} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CATEGORY BUDGETS */}
        <Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: 15 }]}>Monthly Budgets</Text>
        {categoryTotals.map(c => {
          const over = c.spent > c.budget && c.budget > 0;
          return (
            <View key={c.id} style={styles.catCard}>
              <View style={styles.catInfo}>
                <View style={[styles.iconBox, { backgroundColor: c.color + '15' }]}>
                  <Text style={{ fontSize: 18 }}>{c.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.catName}>{c.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={[styles.spent, over && { color: "#E24B4A" }]}>{fmt(c.spent)}</Text>
                    <Text style={styles.budgetOf}>/ {fmt(c.budget)}</Text>
                  </View>
                </View>
                
                {editing === c.name ? (
                  <View style={styles.editRow}>
                    <TextInput 
                      style={styles.budgetInput} 
                      autoFocus keyboardType="numeric" 
                      defaultValue={c.budget.toString()} 
                      onChangeText={setTempVal} 
                    />
                    <TouchableOpacity onPress={() => onSave(c.name)}>
                      <Ionicons name="checkmark-circle" size={28} color="#1D9E75" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editIcon} onPress={() => { setEditing(c.name); setTempVal(c.budget.toString()); }}>
                    <Ionicons name="pencil-outline" size={16} color="#aaa" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { backgroundColor: c.color, width: `${Math.min((c.spent/c.budget)*100, 100)}%` }]} />
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* NEW GOAL MODAL */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Savings Goal</Text>
            <TextInput style={styles.input} placeholder="Goal Name (e.g. New iPhone)" value={goalName} onChangeText={setGoalName} />
            <TextInput style={styles.input} placeholder="Target Amount (₱)" keyboardType="numeric" value={goalTarget} onChangeText={setGoalTarget} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowGoalModal(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddGoal}><Text style={{ color: '#fff', fontWeight: '700' }}>Create Goal</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DEPOSIT MODAL */}
      <Modal visible={!!depositModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Save for {depositModal?.name}</Text>
            <TextInput style={styles.input} placeholder="Amount to Save (₱)" keyboardType="numeric" value={depositAmt} onChangeText={setDepositAmt} autoFocus />
            
            <Text style={styles.subLabel}>Deduct from wallet:</Text>
            <View style={styles.walletPicker}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(wallets.length > 0 ? wallets.map(w => w.name) : ["Cash", "GCash", "Bank"]).map(w => (
                  <TouchableOpacity 
                    key={w} 
                    onPress={() => setDepositWallet(w)}
                    style={[styles.miniWalletBtn, depositWallet === w && styles.miniWalletBtnActive, { marginRight: 8, paddingHorizontal: 15 }]}
                  >
                    <Text style={[styles.miniWalletText, depositWallet === w && styles.miniWalletTextActive]}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDepositModal(null)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleDeposit}><Text style={{ color: '#fff', fontWeight: '700' }}>Confirm Savings</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#111" },
  archiveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E6F1FB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  archiveText: { fontSize: 12, fontWeight: '700', color: '#378ADD' },
  scroll: { paddingHorizontal: 20 },
  summaryCard: { backgroundColor: "#1a1a2e", borderRadius: 20, padding: 20, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 1 },
  summaryVal: { fontSize: 18, color: '#fff', fontWeight: '700', marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  unallocatedLabel: { fontSize: 11, color: '#fff', fontWeight: '600', opacity: 0.7 },
  unallocatedVal: { fontSize: 20, color: '#5DCAA5', fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  addBtn: { fontSize: 13, fontWeight: '700', color: '#378ADD' },
  goalsList: { flexDirection: 'row' },
  goalCard: { width: 160, backgroundColor: '#f9f9f9', borderRadius: 18, padding: 16, marginRight: 15, borderWidth: 1, borderColor: '#eee' },
  goalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  goalName: { fontSize: 14, fontWeight: '700', color: '#111' },
  goalTarget: { fontSize: 10, color: '#888', marginTop: 2, marginBottom: 8 },
  catCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  catInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 15, fontWeight: '700', color: '#111' },
  spent: { fontSize: 14, fontWeight: '700', color: '#111' },
  budgetOf: { fontSize: 12, color: '#aaa' },
  editIcon: { padding: 8 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  budgetInput: { width: 80, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 6, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  progressTrack: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#378ADD', borderRadius: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#111' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 15 },
  subLabel: { fontSize: 12, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', marginBottom: 10 },
  walletPicker: { flexDirection: 'row', marginBottom: 20 },
  miniWalletBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#eee' },
  miniWalletBtnActive: { backgroundColor: '#378ADD', borderColor: '#378ADD' },
  miniWalletText: { fontSize: 12, color: '#666', fontWeight: '600' },
  miniWalletTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#f0f0f0' },
  confirmBtn: { flex: 2, padding: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#378ADD' }
});
