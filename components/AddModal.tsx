import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { today } from "../constants/data";
import { useTransactions, Wallet } from "../context/TransactionContext";

type Props = {
  visible: boolean;
  form: any;
  onFormChange: (f: any) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
};

export default function AddModal({ visible, form, onFormChange, onSubmit, onClose, isSubmitting }: Props) {
  const { categories, wallets, editingId } = useTransactions();
  
  // Convert WalletObject[] to string names for the UI buttons
  const walletNames = wallets.length > 0 ? wallets.map(w => w.name) : ["Cash", "GCash", "Bank"];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={styles.handle} />
          
          <View style={styles.headerRow}>
            <Text style={styles.title}>{editingId ? 'Edit Transaction' : 'Add Transaction'}</Text>
          </View>

          <View style={styles.typeRow}>
            {(["expense", "income", "transfer"] as const).map(type => (
              <TouchableOpacity key={type} onPress={() => onFormChange({ ...form, type })}
                style={[styles.typeBtn, form.type === type && { 
                  borderColor: type === "income" ? "#1D9E75" : type === "transfer" ? "#EF9F27" : "#378ADD", 
                  backgroundColor: type === "income" ? "#E1F5EE" : type === "transfer" ? "#FFF7E6" : "#E6F1FB" 
                }]}
                disabled={isSubmitting}>
                <Text style={[styles.typeTxt, form.type === type && { 
                  color: type === "income" ? "#0F6E56" : type === "transfer" ? "#B46F00" : "#185FA5", 
                  fontWeight: "600" 
                }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.walletRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{form.type === 'transfer' ? 'From' : 'Wallet'}</Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {walletNames.map(w => (
                  <TouchableOpacity key={w} onPress={() => onFormChange({ ...form, wallet: w })}
                    style={[styles.walletBtn, form.wallet === w && styles.walletBtnActive]}
                    disabled={isSubmitting}>
                    <Text style={[styles.walletTxt, form.wallet === w && styles.walletTxtActive]}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {form.type === 'transfer' && (
            <View style={[styles.walletRow, { marginTop: -8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>To</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {walletNames.map(w => (
                    <TouchableOpacity key={w} onPress={() => onFormChange({ ...form, to_wallet: w })}
                      style={[styles.walletBtn, form.to_wallet === w && { borderColor: '#EF9F27', backgroundColor: '#FFF7E6' }]}
                      disabled={isSubmitting || form.wallet === w}>
                      <Text style={[styles.walletTxt, form.to_wallet === w && { color: '#B46F00', fontWeight: '700' }]}>{w}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          <TextInput style={styles.input} placeholder="Description (e.g. GCash Cash-in)" value={form.description} onChangeText={v => onFormChange({ ...form, description: v })} editable={!isSubmitting} />
          <TextInput style={styles.input} placeholder="Amount (₱)" keyboardType="numeric" value={form.amount} onChangeText={v => onFormChange({ ...form, amount: v })} editable={!isSubmitting} />

          {form.type !== 'transfer' && (
            <View style={styles.pills}>
              {categories.map(c => (
                <TouchableOpacity key={c.id} onPress={() => onFormChange({ ...form, category: c.name })}
                  style={[styles.pill, form.category === c.name && { borderColor: c.color, backgroundColor: c.color + "20" }]}
                  disabled={isSubmitting}>
                  <Text style={[styles.pillTxt, form.category === c.name && { color: c.color }]}>{c.icon} {c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={form.date} onChangeText={v => onFormChange({ ...form, date: v })} editable={!isSubmitting} />

          <TouchableOpacity style={[styles.submit, isSubmitting && { backgroundColor: '#aaa' }]} onPress={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>{editingId ? 'Save Changes' : 'Add Transaction'}</Text>}
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet:    { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  handle:   { width: 40, height: 4, backgroundColor: "#ddd", borderRadius: 99, alignSelf: "center", marginBottom: 20 },
  headerRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:    { fontSize: 18, fontWeight: "700", color: "#111" },
  label:    { fontSize: 11, fontWeight: "700", color: "#aaa", textTransform: 'uppercase', marginBottom: 4, marginLeft: 2 },
  typeRow:  { flexDirection: "row", gap: 8, marginBottom: 12 },
  typeBtn:  { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 2, borderColor: "#e0e0e0", alignItems: "center" },
  typeTxt:  { fontSize: 14, color: "#888", textTransform: 'capitalize' },
  walletRow:{ flexDirection: 'row', gap: 8, marginBottom: 16 },
  walletBtn:{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: '#f9f9f9', alignItems: 'center', minWidth: 70 },
  walletBtnActive: { borderColor: '#378ADD', backgroundColor: '#E6F1FB' },
  walletTxt: { fontSize: 12, color: '#888', fontWeight: '500' },
  walletTxtActive: { color: '#378ADD', fontWeight: '700' },
  input:    { borderWidth: 0.5, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: "#f7f7f7", color: "#111", marginBottom: 12 },
  pills:    { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  pill:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: "#e0e0e0" },
  pillTxt:  { fontSize: 12, color: "#888" },
  submit:   { backgroundColor: "#378ADD", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  submitTxt:{ color: "#fff", fontSize: 16, fontWeight: "700" },
});
