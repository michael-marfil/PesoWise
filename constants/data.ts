export const CATEGORIES = [
  { name: "Food",      icon: "🍜", color: "#BA7517" },
  { name: "Transport", icon: "🚗", color: "#378ADD" },
  { name: "Bills",     icon: "💡", color: "#EF9F27" },
  { name: "Shopping",  icon: "🛍️", color: "#D4537E" },
  { name: "Health",    icon: "💊", color: "#1D9E75" },
  { name: "Others",    icon: "📦", color: "#888780" },
];

export const fmt = (n: number) =>
  "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 });

export const today = () => new Date().toISOString().split("T")[0];
