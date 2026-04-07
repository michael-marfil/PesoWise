import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Path, G, Text as SvgText, Circle } from 'react-native-svg';
import { useTransactions } from "../context/TransactionContext";

const W = Dimensions.get("window").width;

type BarData = { day: string; amount: number };
type PieData = { name: string; color: string; spent: number };

export function MiniBarChart({ data }: { data: BarData[] }) {
  if (!data || !Array.isArray(data)) return null;
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <View style={styles.barWrap}>
      {data.map((d, i) => (
        <View key={i} style={styles.barCol}>
          <View style={[styles.bar, { height: Math.max((d.amount / max) * 90, d.amount > 0 ? 4 : 0) }]} />
          <Text style={styles.barLabel}>{d.day}</Text>
        </View>
      ))}
    </View>
  );
}

export function DonutChart({ data }: { data: PieData[] }) {
  const { fmt } = useTransactions();
  const total = data.reduce((s, d) => s + d.spent, 0);
  if (total === 0) return <Text style={styles.empty}>No expenses yet.</Text>;

  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <View style={{ alignItems: "center", marginVertical: 10 }}>
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            {/* Background Circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f0f0f0"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Pie Slices */}
            {data.map((slice, index) => {
              const percentage = slice.spent / total;
              const strokeDashoffset = circumference - (circumference * percentage);
              const rotation = (currentOffset / total) * 360;
              currentOffset += slice.spent;

              return (
                <Circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform={`rotate(${rotation}, ${size/2}, ${size/2})`}
                />
              );
            })}
          </G>
        </Svg>
        
        {/* Center Text */}
        <View style={styles.holeContainer}>
          <Text style={styles.holeLabel}>TOTAL SPENT</Text>
          <Text style={styles.holeAmt}>{fmt(total)}</Text>
        </View>
      </View>
    </View>
  );
}

export function CategoryLegend({ data }: { data: PieData[] }) {
  const { fmt } = useTransactions();
  return (
    <View style={styles.legend}>
      {data.map(c => (
        <View key={c.name} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: c.color }]} />
          <Text style={styles.legendText}>{c.name} {fmt(c.spent)}</Text>
        </View>
      ))}
    </View>
  );
}

export function TopExpensesList({ data }: { data: PieData[] }) {
  const { fmt } = useTransactions();
  const total = data.reduce((s, d) => s + d.spent, 0);
  const sorted = [...data].sort((a, b) => b.spent - a.spent);

  if (total === 0) return null;

  return (
    <View style={styles.topList}>
      {sorted.map(c => {
        const pct = ((c.spent / total) * 100).toFixed(0);
        return (
          <View key={c.name} style={styles.topItem}>
            <View style={styles.topInfo}>
              <View style={[styles.dot, { backgroundColor: c.color, marginRight: 8 }]} />
              <Text style={styles.topName}>{c.name}</Text>
              <Text style={styles.topPct}>{pct}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { backgroundColor: c.color, width: `${pct}%` }]} />
            </View>
            <Text style={styles.topAmt}>{fmt(c.spent)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barWrap:    { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 6 },
  barCol:     { flex: 1, alignItems: "center" },
  bar:        { width: "80%", backgroundColor: "#378ADD", borderRadius: 6 },
  barLabel:   { fontSize: 10, color: "#888", marginTop: 4 },
  empty:      { color: "#888", fontSize: 13, marginBottom: 8, textAlign: 'center' },
  holeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeLabel:  { fontSize: 9, color: "#888", fontWeight: '600' },
  holeAmt:    { fontSize: 13, fontWeight: "700", color: "#111", marginTop: 2 },
  legend:     { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 15, justifyContent: 'center' },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot:        { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 12, color: "#444", fontWeight: '500' },
  topList:    { marginTop: 10 },
  topItem:    { marginBottom: 14 },
  topInfo:    { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  topName:    { flex: 1, fontSize: 13, fontWeight: '600', color: '#333' },
  topPct:     { fontSize: 12, color: '#888', fontWeight: '600' },
  barTrack:   { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  barFill:    { height: '100%', borderRadius: 3 },
  topAmt:     { fontSize: 11, color: '#666', fontWeight: '500', textAlign: 'right' },
});
