import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useTransactions } from "../context/TransactionContext";

type Props = { onAddPress: () => void };

export default function Header({ onAddPress }: Props) {
  const { startDate, endDate, setStartDate, setEndDate, profile } = useTransactions();
  
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(null);
      return;
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      if (showPicker === 'start') {
        setStartDate(dateString);
      } else if (showPicker === 'end') {
        setEndDate(dateString);
      }
    }
    
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        <View style={styles.row}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.miniAvatar} />
          ) : (
            <View style={styles.miniAvatarPlaceholder}>
              <Text style={styles.miniAvatarText}>
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.greeting}>Good day, {profile?.full_name || "User"}! 👋</Text>
            <Text style={styles.title}>PesoWise</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btn} onPress={onAddPress}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rangeSelector}>
        <TouchableOpacity 
          style={styles.inputGroup} 
          onPress={() => setShowPicker('start')}
        >
          <Text style={styles.label}>From</Text>
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.inputGroup} 
          onPress={() => setShowPicker('end')}
        >
          <Text style={styles.label}>To</Text>
          <Text style={styles.dateText}>{formatDate(endDate)}</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? new Date(startDate) : new Date(endDate)}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer:     { paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  container: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  row:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniAvatar: { width: 40, height: 40, borderRadius: 20 },
  miniAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#378ADD', justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  greeting:  { fontSize: 12, color: "#888", fontWeight: '500' },
  title:     { fontSize: 20, fontWeight: "800", color: "#111" },
  btn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: "#378ADD", justifyContent: "center", alignItems: "center" },
  btnText:   { color: "#fff", fontSize: 24, lineHeight: 28 },
  rangeSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    backgroundColor: '#f7f7f7', 
    borderRadius: 12, 
    padding: 10,
    gap: 10
  },
  inputGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  label: { fontSize: 10, fontWeight: '700', color: '#aaa', textTransform: 'uppercase' },
  dateText: { fontSize: 14, color: '#333', fontWeight: '700' },
  divider: { width: 1, height: 20, backgroundColor: '#ddd' }
});
