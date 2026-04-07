import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BalanceCard from "../../components/BalanceCard";
import { CategoryLegend, DonutChart, MiniBarChart, TopExpensesList } from "../../components/Charts";
import Header from "../../components/Header";
import TransactionRow from "../../components/TransactionRow";
import TransactionDetailsModal from "../../components/TransactionDetailsModal";
import { useTransactions } from "../../context/TransactionContext";
import { Ionicons } from "@expo/vector-icons";

export default function OverviewScreen() {
  const { 
    balance, totalIncome, totalExpense, categoryTotals, weeklyData, 
    filteredTransactions, deleteTransaction, setShowAdd, verdict, 
    startDate, endDate, walletBalances, refreshData, refreshing,
    selectedTransaction, setSelectedTransaction,
    upcomingTransactions, logUpcomingTransaction, skipUpcomingTransaction,
    fmt 
  } = useTransactions();

  const pieData = categoryTotals.filter(c => c.spent > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <Header onAddPress={() => setShowAdd(true)} />
      
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={["#378ADD"]} tintColor="#378ADD" />
        }
      >
        <BalanceCard balance={balance} totalIncome={totalIncome} totalExpense={totalExpense} walletBalances={walletBalances} />

        {/* UPCOMING TRANSACTIONS SECTION */}
        {upcomingTransactions.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.upcomingHeader}>
              <Ionicons name="notifications-outline" size={16} color="#EF9F27" />
              <Text style={styles.upcomingTitle}>Due or Upcoming</Text>
            </View>
            {upcomingTransactions.map(rt => (
              <View key={rt.id} style={styles.upcomingCard}>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingDesc}>{rt.description}</Text>
                  <Text style={styles.upcomingMeta}>{fmt(rt.amount)} · {rt.wallet}</Text>
                </View>
                <View style={styles.upcomingActions}>
                  <TouchableOpacity style={styles.skipBtn} onPress={() => skipUpcomingTransaction(rt)}>
                    <Text style={styles.skipBtnTxt}>Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logBtn} onPress={() => logUpcomingTransaction(rt)}>
                    <Text style={styles.logBtnTxt}>Log</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* THE VERDICT CARD */}
        <View style={[styles.verdictCard, { borderColor: verdict.color + '40', backgroundColor: verdict.color + '08' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.verdictDot, { backgroundColor: verdict.color }]} />
            <Text style={[styles.verdictTitle, { color: verdict.color }]}>{verdict.title}</Text>
          </View>
          <Text style={styles.verdictMsg}>{verdict.message}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Spending by Category</Text>
          <Text style={styles.rangeSub}>{startDate} to {endDate}</Text>
        </View>
        
        <View style={styles.chartContainer}>
          <DonutChart data={pieData} />
          <TopExpensesList data={pieData} />
        </View>

        <Text style={[styles.section, { marginTop: 20 }]}>Weekly Spending</Text>
        <MiniBarChart data={weeklyData} />

        <Text style={[styles.section, { marginTop: 20 }]}>Recent Transactions</Text>
        {filteredTransactions.slice(0, 5).map(t => (
          <TransactionRow 
            key={t.id} 
            t={t} 
            onDelete={deleteTransaction} 
            onPress={() => setSelectedTransaction(t)} 
          />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* TRANSACTION DETAILS MODAL */}
      <TransactionDetailsModal 
        visible={!!selectedTransaction} 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "#fff" },
  scroll:  { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { marginBottom: 10 },
  section: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2, marginTop: 10 },
  rangeSub: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  chartContainer: {
    backgroundColor: '#fcfcfc',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  verdictCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 10,
  },
  verdictDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  verdictTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verdictMsg: {
    fontSize: 13,
    color: '#555',
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  upcomingSection: {
    backgroundColor: '#FFF7E6',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFEBCD',
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B46F00',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcomingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingDesc: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  upcomingMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  upcomingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  skipBtnTxt: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  logBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EF9F27',
  },
  logBtnTxt: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  }
});
