import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useTransactions } from "../context/TransactionContext";

type Props = { 
  balance: number; 
  totalIncome: number; 
  totalExpense: number;
  walletBalances: Record<string, number>;
};

export default function BalanceCard({ balance, totalIncome, totalExpense, walletBalances }: Props) {
  const { wallets, fmt } = useTransactions();
  
  // Use dynamic wallets if available, otherwise fallback to defaults
  const displayWallets = wallets.length > 0 ? wallets : [
    { id: 1, name: "Cash", icon: "💵", color: "#1D9E75" },
    { id: 2, name: "GCash", icon: "💙", color: "#378ADD" },
    { id: 3, name: "Bank", icon: "🏦", color: "#EF9F27" }
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>TOTAL BALANCE</Text>
      <Text style={[styles.amount, { color: balance >= 0 ? "#fff" : "#F09595" }]}>{fmt(balance)}</Text>
      
      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>INCOME</Text>
          <Text style={[styles.boxAmt, { color: "#5DCAA5" }]}>{fmt(totalIncome)}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxLabel}>EXPENSES</Text>
          <Text style={[styles.boxAmt, { color: "#F0997B" }]}>{fmt(totalExpense)}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletGrid}>
        {displayWallets.map(w => (
          <View key={w.id} style={styles.walletItem}>
            <Text style={styles.walletLabel}>{w.icon} {w.name}</Text>
            <Text style={styles.walletVal}>{fmt(walletBalances[w.name] || 0)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card:     { marginVertical: 14, backgroundColor: "#1a1a2e", borderRadius: 20, padding: 20 },
  label:    { fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 1, marginBottom: 4 },
  amount:   { fontSize: 32, fontWeight: "700", marginBottom: 16 },
  row:      { flexDirection: "row", gap: 12, marginBottom: 20 },
  box:      { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 },
  boxLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 0.8, marginBottom: 4 },
  boxAmt:   { fontSize: 17, fontWeight: "700" },
  walletGrid: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15 },
  walletItem: { marginRight: 25 },
  walletLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 },
  walletVal: { fontSize: 13, fontWeight: '600', color: '#fff' }
});
