import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddModal from "../../components/AddModal";
import { useTransactions } from "../../context/TransactionContext";

export default function TabLayout() {
  const { showAdd, setShowAdd, form, setForm, addTransaction, updateTransaction, isSubmitting, editingId, setEditingId } = useTransactions();
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm({ 
      description: "", 
      amount: "", 
      type: "expense", 
      category: "Food", 
      date: new Date().toISOString().split('T')[0], 
      wallet: "Cash", 
      to_wallet: "GCash" 
    });
  };

  const handleSubmit = () => {
    const onSuccess = () => handleClose();
    if (editingId) {
      updateTransaction(editingId, { ...form, amount: parseFloat(form.amount) }, onSuccess);
    } else {
      addTransaction(onSuccess);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#378ADD",
          tabBarInactiveTintColor: "#aaa",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0.5,
            borderTopColor: "#eee",
            height: Platform.OS === 'ios' ? 88 : 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Overview",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart-outline" size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="history" size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            )
          }}
        />
      </Tabs>

      <AddModal
        visible={showAdd}
        form={form}
        onFormChange={setForm}
        onSubmit={handleSubmit}
        onClose={handleClose}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
