import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, RefreshControl, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import TransactionRow from "../../components/TransactionRow";
import TransactionDetailsModal from "../../components/TransactionDetailsModal";
import { useTransactions } from "../../context/TransactionContext";
import { fmt } from "../../constants/data";

const W = Dimensions.get("window").width;

export default function HistoryScreen() {
  const { filteredTransactions, deleteTransaction, reports, refreshData, refreshing, selectedTransaction, setSelectedTransaction } = useTransactions();
  const [tab, setTab] = useState<'transactions' | 'reports'>('transactions');

  // Comparison Chart Component for Reports
  const ComparisonChart = () => {
    if (reports.length === 0) return null;

    const data = [...reports].reverse().slice(-4);
    const maxVal = Math.max(...data.map(r => Math.max(r.total_income, r.total_expense)), 1000);
    
    const chartHeight = 120;
    const barWidth = 25;
    const gap = (W - 80 - (data.length * barWidth * 2)) / (data.length + 1);

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Cycle Comparison</Text>
        <View style={{ height: chartHeight + 30, marginTop: 15 }}>
          <Svg width={W - 80} height={chartHeight + 30}>
            {data.map((r, i) => {
              const incomeH = (r.total_income / maxVal) * chartHeight;
              const expenseH = (r.total_expense / maxVal) * chartHeight;
              const xPos = gap + i * (barWidth * 2 + gap);

              return (
                <G key={r.id}>
                  <Rect x={xPos} y={chartHeight - incomeH} width={barWidth} height={incomeH} fill="#1D9E75" rx={4} />
                  <Rect x={xPos + barWidth + 4} y={chartHeight - expenseH} width={barWidth} height={expenseH} fill="#E24B4A" rx={4} />
                  <SvgText x={xPos + barWidth} y={chartHeight + 15} fontSize="10" fill="#888" textAnchor="middle">
                    {r.end_date.split('-')[1]}/{r.end_date.split('-')[2]}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#1D9E75' }]} /><Text style={styles.legendText}>Income</Text></View>
          <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#E24B4A' }]} /><Text style={styles.legendText}>Expense</Text></View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, tab === 'transactions' && styles.activeTab]} 
            onPress={() => setTab('transactions')}
          >
            <Text style={[styles.tabText, tab === 'transactions' && styles.activeTabText]}>Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, tab === 'reports' && styles.activeTab]} 
            onPress={() => setTab('reports')}
          >
            <Text style={[styles.tabText, tab === 'reports' && styles.activeTabText]}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={["#378ADD"]} tintColor="#378ADD" />
        }
      >
        {tab === 'transactions' ? (
          <>
            <Text style={styles.subtitle}>{filteredTransactions.length} transactions in this range</Text>
            {filteredTransactions.map(t => (
              <TransactionRow 
                key={t.id} 
                t={t} 
                onDelete={deleteTransaction} 
                onPress={() => setSelectedTransaction(t)} 
              />
            ))}
          </>
        ) : (
          <>
            <ComparisonChart />
            <Text style={[styles.subtitle, { marginTop: 20 }]}>{reports.length} archived plans</Text>
            {reports.map(r => (
              <View key={r.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportDate}>{r.start_date} to {r.end_date}</Text>
                  <Text style={[styles.reportVerdict, { color: '#378ADD' }]}>{r.verdict_title}</Text>
                </View>
                <View style={styles.reportStats}>
                  <View>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={styles.statVal}>{fmt(r.total_income)}</Text>
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={styles.statVal}>{fmt(r.total_expense)}</Text>
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Saved</Text>
                    <Text style={[styles.statVal, { color: r.total_income - r.total_expense >= 0 ? '#1D9E75' : '#E24B4A' }]}>
                      {fmt(r.total_income - r.total_expense)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
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
  safe:     { flex: 1, backgroundColor: "#fff" },
  header:   { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 15 },
  title:    { fontSize: 24, fontWeight: "800", color: "#111", marginBottom: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#888' },
  activeTabText: { color: '#378ADD' },
  subtitle: { fontSize: 13, color: "#888", marginTop: 5, marginBottom: 15 },
  scroll:   { flex: 1, paddingHorizontal: 20 },
  chartCard: { backgroundColor: '#f9f9f9', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#eee' },
  chartTitle: { fontSize: 14, fontWeight: '700', color: '#444', textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#666', fontWeight: '600' },
  reportCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reportDate: { fontSize: 13, fontWeight: '700', color: '#333' },
  reportVerdict: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  reportStats: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  statLabel: { fontSize: 10, color: '#aaa', textTransform: 'uppercase', fontWeight: '600' },
  statVal: { fontSize: 14, fontWeight: '700', color: '#444', marginTop: 2 }
});
