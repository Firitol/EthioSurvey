import { createClient } from "@supabase/supabase-js";

/* ======================
   SUPABASE
====================== */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/* ======================
   DOM ELEMENTS
====================== */

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const statusEl = document.getElementById("status");

/* ======================
   STATUS
====================== */

function setStatus(message, type = "") {
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

/* ======================
   REGISTER
====================== */

async function handleRegister(e) {
  e.preventDefault();

  if (!supabase) {
    setStatus("Supabase not configured", "error");
    return;
  }

  const email = document.getElementById("registerEmail")?.value;
  const password = document.getElementById("registerPassword")?.value;

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    setStatus("Account created", "success");
  } catch (err) {
    setStatus(err.message, "error");
  }
}

/* ======================
   LOGIN
====================== */

async function handleLogin(e) {
  e.preventDefault();

  if (!supabase) {
    setStatus("Supabase not configured", "error");
    return;
  }

  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    setStatus("Login successful", "success");
  } catch (err) {
    setStatus(err.message, "error");
  }
}

/* ======================
   EVENT LISTENERS
====================== */

if (registerForm) {
  registerForm.addEventListener("submit", handleRegister);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}
