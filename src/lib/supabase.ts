import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

const webStorage = {
  getItem: (key: string) => Promise.resolve(typeof localStorage !== "undefined" ? localStorage.getItem(key) : null),
  setItem: (key: string, value: string) => Promise.resolve(typeof localStorage !== "undefined" ? localStorage.setItem(key, value) : undefined),
  removeItem: (key: string) => Promise.resolve(typeof localStorage !== "undefined" ? localStorage.removeItem(key) : undefined),
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
