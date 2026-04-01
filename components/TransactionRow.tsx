import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { CATEGORIES, fmt } from "../constants/data";
import { Transaction, useTransactions } from "../context/TransactionContext";

type Props = { 
  t: Transaction; 
  onDelete: (id: number) => void;
  onPress?: () => void; // NEW
};

export default function TransactionRow({ t, onDelete, onPress }: Props) {
  const { isSubmitting } = useTransactions();
  const cat = CATEGORIES.find(c => c.name === t.category) || CATEGORIES[5];
  
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.icon, { backgroundColor: cat.color + "20" }]}>
        <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.desc} numberOfLines={1}>{t.description}</Text>
        <Text style={styles.meta}>{t.date} · {t.category}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[styles.amount, t.type === "income" && { color: "#1D9E75" }]}>
          {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
        </Text>
        <TouchableOpacity onPress={() => onDelete(t.id)} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#aaa" />
          ) : (
            <Text style={styles.del}>delete</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  icon:   { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  info:   { flex: 1 },
  desc:   { fontSize: 14, fontWeight: "500", color: "#111" },
  meta:   { fontSize: 12, color: "#888", marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "600", color: "#111" },
  del:    { fontSize: 11, color: "#aaa", marginTop: 2 },
});