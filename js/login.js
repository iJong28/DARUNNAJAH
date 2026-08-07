import { getSession, signIn } from "./auth.js";
import { isSupabaseConfigured } from "./supabase.js";

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const loginError = document.querySelector("#login-error");
const loginSubmit = document.querySelector("#login-submit");

function showError(message) {
  loginError.textContent = message;
  loginError.classList.remove("hidden");
}

function clearError() {
  loginError.textContent = "";
  loginError.classList.add("hidden");
}

async function redirectIfAuthenticated() {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const session = await getSession();

    if (session) {
      window.location.replace("dashboard.html");
    }
  } catch {
  }
}

passwordToggle.addEventListener("click", () => {
  const isPasswordHidden = passwordInput.type === "password";
  passwordInput.type = isPasswordHidden ? "text" : "password";
  passwordToggle.textContent = isPasswordHidden ? "Sembunyikan" : "Tampilkan";
  passwordToggle.setAttribute(
    "aria-label",
    isPasswordHidden ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
  );
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  if (!isSupabaseConfigured) {
    showError("Konfigurasi Supabase belum tersedia.");
    return;
  }

  loginSubmit.disabled = true;
  loginSubmit.textContent = "Memproses...";

  try {
    await signIn(emailInput.value.trim(), passwordInput.value);
    window.location.replace("dashboard.html");
  } catch {
    showError("Email atau password tidak valid.");
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = "Masuk";
  }
});

redirectIfAuthenticated();