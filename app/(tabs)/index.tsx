import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BalanceCard from "../../components/BalanceCard";
import { CategoryLegend, DonutChart, MiniBarChart } from "../../components/Charts";
import Header from "../../components/Header";
import TransactionRow from "../../components/TransactionRow";
import { useTransactions } from "../../context/TransactionContext";

export default function OverviewScreen() {
  const { balance, totalIncome, totalExpense, categoryTotals, weeklyData, filteredTransactions, deleteTransaction, setShowAdd, verdict, startDate, endDate, walletBalances, refreshData, refreshing } = useTransactions();
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

        {/* --- THE VERDICT CARD --- */}
        <View style={[styles.verdictCard, { borderColor: verdict.color + '40', backgroundColor: verdict.color + '08' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.verdictDot, { backgroundColor: verdict.color }]} />
            <Text style={[styles.verdictTitle, { color: verdict.color }]}>{verdict.title}</Text>
          </View>
          <Text style={styles.verdictMsg}>{verdict.message}</Text>
        </View>

        <Text style={styles.section}>Spending by Category</Text>
        <Text style={styles.rangeSub}>{startDate} to {endDate}</Text>
        <DonutChart data={pieData} />
        <CategoryLegend data={pieData} />

        <Text style={[styles.section, { marginTop: 20 }]}>Weekly Spending</Text>
        <MiniBarChart data={weeklyData} />

        <Text style={[styles.section, { marginTop: 20 }]}>Recent Transactions</Text>
        {filteredTransactions.slice(0, 5).map(t => (
          <TransactionRow key={t.id} t={t} onDelete={deleteTransaction} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: "#fff" },
  scroll:  { flex: 1, paddingHorizontal: 20 },
  section: { fontSize: 14, fontWeight: "600", color: "#111", marginBottom: 4, marginTop: 10 },
  rangeSub: { fontSize: 11, color: '#aaa', marginBottom: 10, fontWeight: '500' },
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
  }
});
