import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://szzrmuvhuhmwtjuhirkc.supabase.co";
const supabaseAnonKey = "sb_publishable_2eYBJnRr7GeGKtyjg09Azg_kGwL_BP4";

function isValidSupabaseUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const parsedUrl = new URL(value.trim());

    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname !== "" &&
      parsedUrl.username === "" &&
      parsedUrl.password === ""
    );
  } catch {
    return false;
  }
}

let supabaseClient = null;

if (
  isValidSupabaseUrl(supabaseUrl) &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.trim() !== "" &&
  supabaseAnonKey !== "PASTE_SUPABASE_ANON_KEY_HERE"
) {
  try {
    supabaseClient = createClient(supabaseUrl.trim(), supabaseAnonKey.trim());
  } catch {
    supabaseClient = null;
  }
}

export const isSupabaseConfigured = supabaseClient !== null;
export const supabase = supabaseClient;
export { supabaseUrl, supabaseAnonKey };

