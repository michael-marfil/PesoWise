import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { CATEGORIES as DEFAULT_CATEGORIES, today, fmt } from "../constants/data";
import { supabase } from "../src/lib/supabase";
import Toast from 'react-native-toast-message';
import { useAuth } from "./AuthContext";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import * as Notifications from 'expo-notifications';

export type Wallet = "Cash" | "GCash" | "Bank";

export type RecurringTransaction = {
  id: number;
  description: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  wallet: Wallet;
  frequency: "daily" | "weekly" | "monthly" | "15_30";
  next_run_date: string;
  last_run_date: string | null;
  is_business_day_adjusted: boolean;
};

export type Category = {
  id: string | number;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
};

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  type: "expense" | "income" | "transfer";
  category: string;
  date: string;
  wallet: Wallet;
  to_wallet?: Wallet;
  user_id: string;
};

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  currency: string;
};

export type SavingsGoal = {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  icon: string;
};

export type BudgetReport = {
  id: number;
  start_date: string;
  end_date: string;
  total_income: number;
  total_expense: number;
  total_budgeted: number;
  verdict_title: string;
  verdict_message: string;
  category_breakdown: any;
  created_at: string;
};

type ContextType = {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  reports: BudgetReport[];
  savingsGoals: SavingsGoal[];
  recurringTransactions: RecurringTransaction[]; // NEW
  categories: Category[];
  profile: Profile | null;
  startDate: string;
  endDate: string;
  setStartDate: (d: string) => void;
  setEndDate: (d: string) => void;
  form: { 
    description: string; 
    amount: string; 
    type: "expense" | "income" | "transfer"; 
    category: string; 
    date: string; 
    wallet: Wallet;
    to_wallet: Wallet;
  };
  setForm: (f: any) => void;
  budgets: Record<string, number>;
  updateBudget: (category: string, value: number) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<void>;
  addCategory: (name: string, icon: string, color: string) => Promise<void>;
  deleteCategory: (id: number | string) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoalAmount: (id: number, amount: number, wallet: Wallet, goalName: string) => Promise<void>;
  addRecurringTransaction: (rt: any) => Promise<void>;
  deleteRecurringTransaction: (id: number) => Promise<void>;
  logUpcomingTransaction: (rt: RecurringTransaction) => Promise<void>;
  skipUpcomingTransaction: (rt: RecurringTransaction) => Promise<void>;
  refreshData: () => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  totalBudgeted: number;
  balance: number;
  walletBalances: Record<Wallet, number>;
  categoryTotals: { name: string; icon: string; color: string; spent: number; budget: number }[];
  verdict: { title: string; message: string; color: string };
  weeklyData: { day: string; amount: number }[];
  addTransaction: (onSuccess: () => void) => void;
  deleteTransaction: (id: number) => void;
  archiveCurrentPlan: () => Promise<void>;
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  selectedTransaction: Transaction | null; // NEW
  setSelectedTransaction: (t: Transaction | null) => void; // NEW
  loading: boolean;
  refreshing: boolean;
  isSubmitting: boolean;
};

const TransactionContext = createContext<ContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports]           = useState<BudgetReport[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [upcomingTransactions, setUpcomingTransactions] = useState<RecurringTransaction[]>([]); // Initialize here
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [budgets, setBudgets]           = useState<Record<string, number>>({});
  const [profile, setProfile]           = useState<Profile | null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // NEW
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate]     = useState(lastDay);

  const [form, setForm] = useState({
    description: "", amount: "", type: "expense" as "expense" | "income" | "transfer", category: "Food", date: today(), wallet: "Cash" as Wallet, to_wallet: "GCash" as Wallet,
  });

  const categories = useMemo(() => {
    const defaults = DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: `def-${i}`, is_default: true }));
    return [...defaults, ...customCategories];
  }, [customCategories]);

  const fetchData = async () => {
    if (!user) return;
    try {
      await Promise.all([
        fetchTransactions(), 
        fetchBudgets(), 
        fetchReports(), 
        fetchProfile(),
        fetchSavingsGoals(),
        fetchCustomCategories(),
        fetchRecurringTransactions(), // NEW
      ]);
      await processRecurringTransactions(); // NEW
    } catch (err) {
      console.error("Data Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      (async () => {
        setLoading(true);
        await fetchData();
        setLoading(false);
      })();
    } else {
      setTransactions([]);
      setBudgets({});
      setReports([]);
      setProfile(null);
      setSavingsGoals([]);
      setCustomCategories([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchRecurringTransactions = async () => {
    const { data } = await supabase.from("recurring_transactions").select("*").order("created_at", { ascending: false });
    const list = data || [];
    setRecurringTransactions(list);
    checkUpcoming(list);
  };

  const addRecurringTransaction = async (rt: any) => {
    if (!user) return;
    setIsSubmitting(true);
    const { data } = await supabase.from("recurring_transactions").insert([{ ...rt, user_id: user.id }]).select();
    if (data) {
      const newList = [data[0], ...recurringTransactions];
      setRecurringTransactions(newList);
      checkUpcoming(newList);
    }
    setIsSubmitting(false);
  };

  const deleteRecurringTransaction = async (id: number) => {
    setIsSubmitting(true);
    const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
    if (!error) {
      const newList = recurringTransactions.filter(rt => rt.id !== id);
      setRecurringTransactions(newList);
      checkUpcoming(newList);
    }
    setIsSubmitting(false);
  };

  const checkUpcoming = (list: RecurringTransaction[]) => {
    const todayStr = today();
    const due = list.filter(rt => {
      let targetDate = new Date(rt.next_run_date);
      
      if (rt.is_business_day_adjusted) {
        const day = targetDate.getDay(); 
        if (day === 0) targetDate.setDate(targetDate.getDate() - 2); // Sun -> Fri
        else if (day === 6) targetDate.setDate(targetDate.getDate() - 1); // Sat -> Fri
      }

      const finalTargetStr = targetDate.toISOString().split('T')[0];
      return finalTargetStr <= todayStr;
    });
    setUpcomingTransactions(due);
  };

  const logUpcomingTransaction = async (rt: RecurringTransaction) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const newTx = {
        description: rt.description,
        amount: rt.amount,
        type: rt.type,
        category: rt.category,
        wallet: rt.wallet,
        date: today(),
        user_id: user.id
      };
      const { data } = await supabase.from("transactions").insert([newTx]).select();
      
      if (data) {
        let nextDate = new Date(rt.next_run_date);
        if (rt.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (rt.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (rt.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
        else if (rt.frequency === '15_30') {
          if (nextDate.getDate() <= 15) nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
          else nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 15);
        }

        const nextStr = nextDate.toISOString().split('T')[0];
        await supabase.from("recurring_transactions").update({ next_run_date: nextStr, last_run_date: today() }).eq("id", rt.id);
        
        setTransactions(prev => [data[0], ...prev]);
        setUpcomingTransactions(prev => prev.filter(item => item.id !== rt.id));
        setRecurringTransactions(prev => prev.map(item => item.id === rt.id ? { ...item, next_run_date: nextStr } : item));
        Toast.show({ type: 'success', text1: 'Logged successfully!' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipUpcomingTransaction = async (rt: RecurringTransaction) => {
    let nextDate = new Date(rt.next_run_date);
    if (rt.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (rt.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (rt.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (rt.frequency === '15_30') {
      if (nextDate.getDate() <= 15) nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
      else nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 15);
    }

    const nextStr = nextDate.toISOString().split('T')[0];
    await supabase.from("recurring_transactions").update({ next_run_date: nextStr }).eq("id", rt.id);
    
    setUpcomingTransactions(prev => prev.filter(item => item.id !== rt.id));
    setRecurringTransactions(prev => prev.map(item => item.id === rt.id ? { ...item, next_run_date: nextStr } : item));
    Toast.show({ type: 'info', text1: 'Reminder skipped' });
  };

  const processRecurringTransactions = async () => {
    // This is now replaced by the manual 'Upcoming' workflow.
    // We just keep the name to avoid breaking the fetchData call for now.
    return;
  };

  const fetchCustomCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("id", { ascending: true });
    if (data) setCustomCategories(data.map(c => ({ ...c, is_default: false })));
  };

  const addCategory = async (name: string, icon: string, color: string) => {
    if (!user) return;
    setIsSubmitting(true);
    const { data } = await supabase.from("categories").insert([{ name, icon, color, user_id: user.id }]).select();
    if (data) {
      setCustomCategories(prev => [...prev, { ...data[0], is_default: false }]);
      Toast.show({ type: 'success', text1: 'Category Added' });
    }
    setIsSubmitting(false);
  };

  const deleteCategory = async (id: number | string) => {
    if (typeof id === 'string' && id.startsWith('def-')) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setCustomCategories(prev => prev.filter(c => c.id !== id));
      Toast.show({ type: 'info', text1: 'Category Removed' });
    }
    setIsSubmitting(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) setProfile(data);
    else {
      const newProfile = { id: user.id, full_name: user.email?.split('@')[0] || "User", currency: "PHP" };
      const { data: created } = await supabase.from("profiles").insert([newProfile]).select().single();
      if (created) setProfile(created);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      Toast.show({ type: 'success', text1: 'Profile Updated' });
    }
    setIsSubmitting(false);
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `${user.id}/${Date.now()}.png`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, decode(base64), { contentType: 'image/png', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfile({ avatar_url: publicUrl });
      Toast.show({ type: 'success', text1: 'Photo Uploaded!' });
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSavingsGoals = async () => {
    const { data } = await supabase.from("savings_goals").select("*").order("created_at", { ascending: false });
    setSavingsGoals(data || []);
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    if (!user) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from("savings_goals").insert([{ ...goal, user_id: user.id }]).select();
    if (!error && data) {
      setSavingsGoals(prev => [data[0], ...prev]);
      Toast.show({ type: 'success', text1: 'Goal Created!' });
    }
    setIsSubmitting(false);
  };

  const updateSavingsGoalAmount = async (id: number, newTotal: number, wallet: Wallet, goalName: string) => {
    if (!user) return;
    setIsSubmitting(true);
    const goal = savingsGoals.find(g => g.id === id);
    const depositAmount = newTotal - (goal?.current_amount || 0);
    try {
      const { error: gError } = await supabase.from("savings_goals").update({ current_amount: newTotal }).eq("id", id);
      if (gError) throw gError;
      const newTx = {
        description: `Saved for: ${goalName}`,
        amount: depositAmount,
        type: "expense" as const,
        category: "Others",
        wallet: wallet,
        date: today(),
        user_id: user.id
      };
      const { data: txData, error: txError } = await supabase.from("transactions").insert([newTx]).select();
      if (txError) throw txError;
      setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, current_amount: newTotal } : g));
      if (txData) setTransactions(prev => [txData[0], ...prev]);
      Toast.show({ type: 'success', text1: 'Savings Deposited!', text2: `Deducted from ${wallet}` });
    } catch (e: any) {
      Alert.alert("Deposit Failed", e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTransactions = async () => {
    const { data } = await supabase.from("transactions").select("*").order("date", { ascending: false });
    setTransactions(data || []);
  };

  const fetchBudgets = async () => {
    const { data } = await supabase.from("budgets").select("*");
    if (data) {
      const map: Record<string, number> = {};
      data.forEach(b => { map[b.category] = b.amount; });
      setBudgets(map);
    }
  };

  const fetchReports = async () => {
    const { data } = await supabase.from("budget_reports").select("*").order("created_at", { ascending: false });
    setReports(data || []);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  const totalIncome  = useMemo(() => filteredTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [filteredTransactions]);
  const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [filteredTransactions]);
  const balance      = totalIncome - totalExpense;
  const totalBudgeted = useMemo(() => Object.values(budgets).reduce((s, v) => s + v, 0), [budgets]);

  const walletBalances = useMemo(() => {
    const map: Record<Wallet, number> = { Cash: 0, GCash: 0, Bank: 0 };
    transactions.forEach(t => {
      if (t.type === "transfer" && t.to_wallet) {
        map[t.wallet] -= t.amount;
        map[t.to_wallet] += t.amount;
      } else {
        const val = t.type === "income" ? t.amount : -t.amount;
        if (map[t.wallet] !== undefined) map[t.wallet] += val;
      }
    });
    return map;
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return categories.map(c => ({
      ...c,
      spent: map[c.name] || 0,
      budget: budgets[c.name] || 0
    }));
  }, [filteredTransactions, budgets, categories]);

  const verdict = useMemo(() => {
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) : 0;
    if (totalIncome === 0 && totalExpense === 0) return { title: "Ready?", message: "Start logging to see your verdict.", color: "#888" };
    if (totalExpense > totalIncome) return { title: "Critical! ⚠️", message: "You are spending more than you earn.", color: "#E24B4A" };
    if (savingsRate >= 0.2) return { title: "Financial Pro! 🏆", message: "You've saved 20% of your income.", color: "#1D9E75" };
    return { title: "On Track 👍", message: "Stay disciplined!", color: "#378ADD" };
  }, [totalIncome, totalExpense, balance]);

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === "expense").forEach(t => {
      const parts = t.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getDay();
      const label = days[(d + 6) % 7];
      map[label] = (map[label] || 0) + t.amount;
    });
    return days.map(d => ({ day: d, amount: map[d] || 0 }));
  }, [filteredTransactions]);

  const archiveCurrentPlan = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const reportData = {
        start_date: startDate,
        end_date: endDate,
        total_income: totalIncome,
        total_expense: totalExpense,
        total_budgeted: totalBudgeted,
        verdict_title: verdict.title,
        verdict_message: verdict.message,
        category_breakdown: categoryTotals,
        user_id: user.id
      };
      const { data, error } = await supabase.from("budget_reports").insert([reportData]).select();
      if (error) throw error;
      if (data) setReports(prev => [data[0], ...prev]);
      Toast.show({ type: 'success', text1: 'Plan Archived!' });
    } catch (e: any) {
      Alert.alert("Archive Failed", e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBudget = async (category: string, value: number) => {
    if (!user) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("budgets").upsert({ category, amount: value, user_id: user.id });
    if (!error) {
      setBudgets(prev => ({ ...prev, [category]: value }));
      Toast.show({ type: 'success', text1: 'Budget Saved' });
    }
    setIsSubmitting(false);
  };

  const addTransaction = async (onSuccess: () => void) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const amount = parseFloat(form.amount);
      const { data, error } = await supabase.from("transactions").insert([{ ...form, amount, user_id: user.id }]).select();
      if (!error && data) {
        setTransactions(prev => [data[0], ...prev]);
        if (data[0].date < startDate) setStartDate(data[0].date);
        if (data[0].date > endDate) setEndDate(data[0].date);
        
        if (form.type === 'expense') {
          const current = categoryTotals.find(c => c.name === form.category);
          if (current && current.budget > 0) {
            const newSpent = current.spent + amount;
            if (newSpent > current.budget) {
              Notifications.scheduleNotificationAsync({
                content: { title: "Budget Exceeded! 🚨", body: `You've gone over your ₱${current.budget} limit for ${current.name}!` },
                trigger: null,
              });
            } else if (newSpent > current.budget * 0.8) {
              Notifications.scheduleNotificationAsync({
                content: { title: "Budget Warning ⚠️", body: `You've used 80% of your ${current.name} budget.` },
                trigger: null,
              });
            }
          }
        }

        setForm({ description: "", amount: "", type: "expense", category: "Food", date: today(), wallet: "Cash", to_wallet: "GCash" });
        Toast.show({ type: 'success', text1: 'Transaction Added' });
        onSuccess();
      } else if (error) {
        Alert.alert("Error saving", error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTransaction = (id: number) => {
    Alert.alert("Delete", "Remove this?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        setIsSubmitting(true);
        try {
          const { error } = await supabase.from("transactions").delete().eq("id", id);
          if (!error) {
            setTransactions(prev => prev.filter(t => t.id !== id));
            Toast.show({ type: 'info', text1: 'Transaction Deleted' });
          }
        } finally {
          setIsSubmitting(false);
        }
      }}
    ]);
  };

  return (
    <TransactionContext.Provider value={{
      transactions, filteredTransactions, reports, savingsGoals, recurringTransactions, upcomingTransactions, categories, profile, startDate, endDate, setStartDate, setEndDate,
      form, setForm, budgets, updateBudget, updateProfile, uploadAvatar, addCategory, deleteCategory, addSavingsGoal, updateSavingsGoalAmount, 
      addRecurringTransaction, deleteRecurringTransaction, logUpcomingTransaction, skipUpcomingTransaction, refreshData,
      totalIncome, totalExpense, totalBudgeted, balance, walletBalances,
      categoryTotals, verdict, weeklyData, addTransaction, deleteTransaction, archiveCurrentPlan,
      showAdd, setShowAdd, selectedTransaction, setSelectedTransaction, loading, refreshing, isSubmitting
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
}
