import { supabase } from "./supabase.js";

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn("Supabase auth.getSession warning:", error);
      return null;
    }

    return data?.session || null;
  } catch (err) {
    console.warn("Supabase auth.getSession exception:", err);
    return null;
  }
}

export async function getCurrentProfile() {
  try {
    const session = await getSession();

    if (!session) {
      // Periksa apakah ada sesi cadangan demo di sessionStorage
      const demoUser = sessionStorage.getItem("darunnajah_demo_user");
      if (demoUser) {
        try {
          return JSON.parse(demoUser);
        } catch {}
      }
      return null;
    }

    // Coba ambil data dari tabel profiles Supabase
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, class_id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!error && data) {
        return {
          ...data,
          email: session.user.email || ""
        };
      }
      if (error) {
        console.warn("Query tabel profiles terhambat (RLS/Permission), menggunakan user_metadata:", error.message || error);
      }
    } catch (queryErr) {
      console.warn("Exception saat query profiles, menggunakan data session:", queryErr);
    }

    // Ekstrak role dan nama dari user_metadata atau email
    const metadata = session.user.user_metadata || {};
    const email = session.user.email || "";
    
    // Deteksi role cerdas dari metadata atau domain prefix
    let detectedRole = metadata.role;
    if (!detectedRole) {
      if (email.includes("operator")) detectedRole = "operator";
      else if (email.includes("guru")) detectedRole = "guru";
      else if (email.includes("kamad")) detectedRole = "kepala_madrasah";
      else if (email.includes("walikelas")) detectedRole = "walikelas";
      else if (email.includes("bendahara")) detectedRole = "bendahara";
      else if (email.includes("siswa")) detectedRole = "siswa";
      else detectedRole = "operator"; // Default jika akun admin
    }

    return {
      id: session.user.id,
      email: email,
      full_name: metadata.full_name || email.split("@")[0].replace(/\./g, " ").toUpperCase() || "Pengguna Darunnajah",
      role: detectedRole,
      class_id: null,
      isFallback: true
    };

  } catch (err) {
    console.error("Gagal mendapatkan profil:", err);
    // Coba fallback terakhir dari sessionStorage jika ada
    const demoUser = sessionStorage.getItem("darunnajah_demo_user");
    if (demoUser) {
      try {
        return JSON.parse(demoUser);
      } catch {}
    }
    return null;
  }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  // Simpan data profil ke sessionStorage untuk akses cepat dan tahan error jaringan
  if (data?.session?.user) {
    const user = data.session.user;
    const metadata = user.user_metadata || {};
    let role = metadata.role;
    if (!role) {
      if (email.includes("operator")) role = "operator";
      else if (email.includes("guru")) role = "guru";
      else if (email.includes("kamad")) role = "kepala_madrasah";
      else if (email.includes("walikelas")) role = "walikelas";
      else if (email.includes("bendahara")) role = "bendahara";
      else if (email.includes("siswa")) role = "siswa";
      else role = "operator";
    }

    sessionStorage.setItem("darunnajah_demo_user", JSON.stringify({
      id: user.id,
      email: email,
      full_name: metadata.full_name || email.split("@")[0],
      role: role,
      class_id: null
    }));
  }

  return data.session;
}

export async function signOut() {
  sessionStorage.removeItem("darunnajah_demo_user");
  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("Supabase signOut error:", error);
  } catch (err) {
    console.warn("Supabase signOut exception:", err);
  }
}
