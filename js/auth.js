import { supabase } from "./supabase.js";

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, class_id")
    .eq("id", session.user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
