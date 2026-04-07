import { StatusBar } from "expo-status-bar";
import { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl, Dimensions, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTransactions } from "../../context/TransactionContext";
import TransactionRow from "../../components/TransactionRow";
import TransactionDetailsModal from "../../components/TransactionDetailsModal";

export default function HistoryScreen() {
  const { transactions, refreshData, refreshing, selectedTransaction, setSelectedTransaction, deleteTransaction, categories, wallets, reports, fmt } = useTransactions();
  
  const [activeTab, setActiveTab] = useState<"logs" | "reports">("logs");

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeWallet, setActiveWallet] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCat ? t.category === activeCat : true;
      const matchWallet = activeWallet ? t.wallet === activeWallet : true;
      return matchSearch && matchCat && matchWallet;
    });
  }, [transactions, search, activeCat, activeWallet]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>History</Text>
          <View style={styles.tabSwitcher}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === "logs" && styles.tabBtnActive]} 
              onPress={() => setActiveTab("logs")}
            >
              <Text style={[styles.tabTxt, activeTab === "logs" && styles.tabTxtActive]}>Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === "reports" && styles.tabBtnActive]} 
              onPress={() => setActiveTab("reports")}
            >
              <Text style={[styles.tabTxt, activeTab === "reports" && styles.tabTxtActive]}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
        {activeTab === "logs" && <Text style={styles.subtitle}>{filteredList.length} Transactions</Text>}
        {activeTab === "reports" && <Text style={styles.subtitle}>{reports.length} Archived Months</Text>}
      </View>

      {activeTab === "logs" ? (
        <>
          {/* SEARCH & FILTERS */}
          <View style={styles.filterSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#999" />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Search description..." 
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={18} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              <TouchableOpacity 
                style={[styles.filterBtn, !activeCat && styles.filterBtnActive]} 
                onPress={() => setActiveCat(null)}
              >
                <Text style={[styles.filterBtnTxt, !activeCat && styles.filterBtnTxtActive]}>All Categories</Text>
              </TouchableOpacity>
              {categories.map(c => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.filterBtn, activeCat === c.name && { backgroundColor: c.color + '20', borderColor: c.color }]} 
                  onPress={() => setActiveCat(activeCat === c.name ? null : c.name)}
                >
                  <Text style={[styles.filterBtnTxt, activeCat === c.name && { color: c.color }]}>{c.icon} {c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterRow, { marginTop: 8 }]}>
              <TouchableOpacity 
                style={[styles.filterBtn, !activeWallet && styles.filterBtnActive]} 
                onPress={() => setActiveWallet(null)}
              >
                <Text style={[styles.filterBtnTxt, !activeWallet && styles.filterBtnTxtActive]}>All Wallets</Text>
              </TouchableOpacity>
              {wallets.map(w => (
                <TouchableOpacity 
                  key={w.id} 
                  style={[styles.filterBtn, activeWallet === w.name && styles.filterBtnActive]} 
                  onPress={() => setActiveWallet(activeWallet === w.name ? null : w.name)}
                >
                  <Text style={[styles.filterBtnTxt, activeWallet === w.name && styles.filterBtnTxtActive]}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={["#378ADD"]} />}
          >
            {filteredList.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="receipt-outline" size={60} color="#eee" />
                <Text style={styles.emptyTxt}>No transactions found</Text>
              </View>
            ) : (
              filteredList.map(t => (
                <TransactionRow key={t.id} t={t} onDelete={deleteTransaction} onPress={() => setSelectedTransaction(t)} />
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={["#378ADD"]} />}
        >
          {reports.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="bar-chart-outline" size={60} color="#eee" />
              <Text style={styles.emptyTxt}>No reports archived yet.</Text>
              <Text style={styles.emptySub}>Archive your current plan in the Budget tab.</Text>
            </View>
          ) : (
            reports.map(r => (
              <View key={r.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportDate}>{r.start_date} to {r.end_date}</Text>
                  <View style={styles.verdictBadge}>
                    <Text style={styles.verdictText}>{r.verdict_title}</Text>
                  </View>
                </View>
                <View style={styles.reportStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={[styles.statVal, { color: '#1D9E75' }]}>{fmt(r.total_income)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Expense</Text>
                    <Text style={[styles.statVal, { color: '#E24B4A' }]}>{fmt(r.total_expense)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Savings</Text>
                    <Text style={[styles.statVal, { color: '#378ADD' }]}>{fmt(r.total_income - r.total_expense)}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {selectedTransaction && (
        <TransactionDetailsModal 
          visible={!!selectedTransaction} 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 20, paddingBottom: 15 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "800", color: "#111" },
  tabSwitcher: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabTxt: { fontSize: 12, color: '#888', fontWeight: '600' },
  tabTxtActive: { color: '#378ADD' },
  subtitle: { fontSize: 14, color: "#888" },
  filterSection: { paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#111' },
  filterRow: { flexDirection: 'row' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa', marginRight: 8, flexDirection: 'row', alignItems: 'center' },
  filterBtnActive: { borderColor: '#378ADD', backgroundColor: '#E6F1FB' },
  filterBtnTxt: { fontSize: 12, color: '#666', fontWeight: '600' },
  filterBtnTxtActive: { color: '#378ADD' },
  scroll: { paddingHorizontal: 20, paddingTop: 15 },
  empty: { alignItems: "center", marginTop: 80, opacity: 0.5 },
  emptyTxt: { fontSize: 16, color: "#999", marginTop: 15, fontWeight: "500" },
  emptySub: { fontSize: 12, color: "#aaa", marginTop: 4 },
  reportCard: { backgroundColor: '#f9f9f9', borderRadius: 20, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  reportDate: { fontSize: 13, fontWeight: '700', color: '#111' },
  verdictBadge: { backgroundColor: '#E6F1FB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  verdictText: { fontSize: 10, color: '#378ADD', fontWeight: '800', textTransform: 'uppercase' },
  reportStats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, color: '#aaa', textTransform: 'uppercase', fontWeight: '600' },
  statVal: { fontSize: 14, fontWeight: '700', color: '#444', marginTop: 2 }
});
