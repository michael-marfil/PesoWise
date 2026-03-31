# 💰 PesoWise – Smart Finance for Filipinos

PesoWise is a modern, privacy-focused expense tracker designed specifically for the Philippine context. It helps you manage your "Quincena" (bi-weekly) budgets, track multiple wallets (Cash, GCash, Bank), and hit your savings goals.

## 🚀 Features

- **🔐 Secure Accounts**: Private, permanent user accounts powered by Supabase.
- **🔢 PIN Lock**: Quick and secure 6-digit PIN access (GCash-style).
- **💳 Multi-Wallet Support**: Track separate balances for your physical Cash, GCash, and Bank accounts.
- **📅 Custom Date Ranges**: Set specific budget cycles (e.g., 1st-15th or 16th-30th) to match your payday.
- **🐷 Savings Goals**: Create targets for big purchases and track your progress with "piggy bank" deposits.
- **📊 Visual Analytics**: Real-time donut charts and bar graphs to visualize your spending habits.
- **📋 Archived Reports**: Save your finished budget plans into a permanent history for monthly review.
- **✨ Animated Entrance**: A premium animated splash screen for a high-end feel.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: Vanilla React Native StyleSheet
- **Charts**: Custom SVG implementations via `react-native-svg`
- **Security**: `expo-secure-store` for encrypted credential storage

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PesoWise.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npx expo start
   ```

---