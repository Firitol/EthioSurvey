import { supabase } from "./lib/supabase";

const registerTab = document.getElementById("tab-register");
const loginTab = document.getElementById("tab-login");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const authStatus = document.getElementById("auth-status");
const sessionCard = document.getElementById("session-card");
const logoutBtn = document.getElementById("logout-btn");
const roleSelect = document.getElementById("register-role");
const companyInput = document.getElementById("register-company");
const companyField = document.getElementById("company-field");

function setStatus(message, tone = "") {
  authStatus.textContent = message;
  authStatus.className = `status ${tone}`.trim();
}

function toggleForms(mode) {
  const showRegister = mode === "register";
  registerTab.classList.toggle("is-active", showRegister);
  loginTab.classList.toggle("is-active", !showRegister);
  registerTab.setAttribute("aria-selected", String(showRegister));
  loginTab.setAttribute("aria-selected", String(!showRegister));
  registerForm.classList.toggle("is-hidden", !showRegister);
  loginForm.classList.toggle("is-hidden", showRegister);
  setStatus("");
}

function toggleCompanyField() {
  const isCompany = roleSelect.value === "company";
  companyInput.required = isCompany;
  companyField.classList.toggle("is-required", isCompany);
}

function dashboardForRole(role) {
  return role === "company" ? "companies-dashboard.html" : "workers-dashboard.html";
}

function renderSession(profile) {
  if (!profile) {
    sessionCard.innerHTML = "<p>No active session.</p>";
    logoutBtn.hidden = true;
    return;
  }

  sessionCard.innerHTML = `
    <dl>
      <dt>Name</dt><dd>${profile.full_name ?? "Not set"}</dd>
      <dt>Email</dt><dd>${profile.email ?? "Not set"}</dd>
      <dt>Role</dt><dd>${profile.account_type ?? "Not set"}</dd>
      <dt>Phone</dt><dd>${profile.phone || "Not set"}</dd>
      <dt>Company</dt><dd>${profile.company_name || "Not set"}</dd>
    </dl>
  `;
  logoutBtn.hidden = false;
}

async function loadSession() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user) {
    renderSession(null);
    return null;
  }

  const userId = sessionData.session.user.id;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email, account_type, phone, company_name")
    .eq("id", userId)
    .single();

  if (profileError) {
    renderSession(null);
    setStatus("Signed in, but we could not load your profile.", "error");
    return null;
  }

  renderSession(profile);
  return profile;
}

registerTab.addEventListener("click", () => toggleForms("register"));
loginTab.addEventListener("click", () => toggleForms("login"));
roleSelect.addEventListener("change", toggleCompanyField);
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  renderSession(null);
  setStatus("Logged out successfully.", "success");
  toggleForms("login");
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Creating account...");

  const full_name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const account_type = roleSelect.value;
  const phone = document.getElementById("register-phone").value.trim();
  const company_name = companyInput.value.trim();

  if (!full_name || !email || !password || !account_type) {
    setStatus("Please complete all required fields.", "error");
    return;
  }

  if (account_type === "company" && !company_name) {
    setStatus("Company name is required for company accounts.", "error");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, account_type, phone, company_name },
    },
  });

  if (error) {
    setStatus(error.message, "error");
    return;
  }

  const userId = data.user?.id;

  if (userId) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name,
      email,
      account_type,
      phone: phone || null,
      company_name: company_name || null,
    });

    if (profileError) {
      setStatus(`Account created, but saving the profile failed: ${profileError.message}`, "error");
      return;
    }
  }

  setStatus(
    data.session
      ? "Account created successfully. Redirecting to your dashboard..."
      : "Account created. Check your email to confirm your account before logging in.",
    "success",
  );

  registerForm.reset();
  toggleCompanyField();

  if (data.session) {
    window.location.href = dashboardForRole(account_type);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Signing in...");

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setStatus(error.message, "error");
    return;
  }

  const profile = await loadSession();

  if (!profile) {
    setStatus("Signed in, but we could not determine your role.", "error");
    return;
  }

  setStatus("Login successful. Redirecting...", "success");
  window.location.href = dashboardForRole(profile.account_type || data.user?.user_metadata?.account_type);
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    renderSession(null);
  }
});

toggleForms("register");
toggleCompanyField();
loadSession().catch((error) => {
  setStatus(error.message || "Unable to load your session.", "error");
});
