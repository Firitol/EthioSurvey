import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const statusEl = document.getElementById("auth-status");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const tabRegister = document.getElementById("tab-register");
const tabLogin = document.getElementById("tab-login");
const sessionCard = document.getElementById("session-card");
const logoutBtn = document.getElementById("logout-btn");

let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  setStatus("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.", "error");
}

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${tone}`.trim();
}

function routeByRole(role) {
  if (role === "company") {
    window.location.href = "companies-dashboard.html";
    return;
  }

  window.location.href = "workers-dashboard.html";
}

function setTab(mode) {
  const registerMode = mode === "register";
  registerForm.classList.toggle("is-hidden", !registerMode);
  loginForm.classList.toggle("is-hidden", registerMode);
  tabRegister.classList.toggle("is-active", registerMode);
  tabLogin.classList.toggle("is-active", !registerMode);
  tabRegister.setAttribute("aria-selected", String(registerMode));
  tabLogin.setAttribute("aria-selected", String(!registerMode));
  setStatus("");
}

function renderSession(profile, user) {
  if (!user) {
    sessionCard.innerHTML = "<p>No active session.</p>";
    logoutBtn.hidden = true;
    return;
  }

  sessionCard.innerHTML = `
    <dl>
      <dt>Name</dt><dd>${profile?.full_name || "Not provided"}</dd>
      <dt>Email</dt><dd>${user.email}</dd>
      <dt>Role</dt><dd>${profile?.account_type || "Not set"}</dd>
      <dt>Phone</dt><dd>${profile?.phone || "Not set"}</dd>
      <dt>Company</dt><dd>${profile?.company_name || "Not set"}</dd>
    </dl>
  `;
  logoutBtn.hidden = false;
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, account_type, phone, company_name")
    .eq("id", userId)
    .single();

  if (error) {
    setStatus(error.message, "error");
    return null;
  }

  return data;
}

async function loadSession() {
  if (!supabase) return;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setStatus(error.message, "error");
    return;
  }

  const user = data.session?.user;
  if (!user) {
    renderSession(null, null);
    return;
  }

  const profile = await fetchProfile(user.id);
  renderSession(profile, user);
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return;

  const fullName = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const accountType = document.getElementById("register-role").value;
  const phone = document.getElementById("register-phone").value.trim();
  const companyName = document.getElementById("register-company").value.trim();

  if (accountType === "company" && !companyName) {
    setStatus("Company name is required for company accounts.", "error");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        account_type: accountType,
        phone,
        company_name: companyName || null
      }
    }
  });

  if (error) {
    setStatus(error.message, "error");
    return;
  }

  const userId = data.user?.id;

  if (userId) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email,
      account_type: accountType,
      phone: phone || null,
      company_name: companyName || null
    });

    if (profileError) {
      setStatus(`Account created but profile save failed: ${profileError.message}`, "error");
      return;
    }
  }

  setStatus("Registration successful.", "success");
  registerForm.reset();

  if (data.session) {
    routeByRole(accountType);
    return;
  }

  await loadSession();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return;

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setStatus(error.message, "error");
    return;
  }

  const profile = await fetchProfile(data.user.id);
  setStatus("Login successful.", "success");
  loginForm.reset();
  routeByRole(profile?.account_type);
});

logoutBtn.addEventListener("click", async () => {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) {
    setStatus(error.message, "error");
    return;
  }

  setStatus("Logged out.", "success");
  renderSession(null, null);
});

tabRegister.addEventListener("click", () => setTab("register"));
tabLogin.addEventListener("click", () => setTab("login"));

setTab("register");
loadSession();
