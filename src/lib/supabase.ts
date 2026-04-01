import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// These are automatically loaded from your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.warn("Supabase URL is missing! Please check your .env file or EAS Secrets.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
