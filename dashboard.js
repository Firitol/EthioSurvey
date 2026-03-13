import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const profileBox = document.getElementById("profile-box");
const dashboardStatus = document.getElementById("dashboard-status");
const logoutBtn = document.getElementById("logout-btn");

if (!supabaseUrl || !supabaseAnonKey) {
  dashboardStatus.textContent = "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.";
  dashboardStatus.className = "status error";
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  init(supabase);
}

function setStatus(message, tone = "") {
  dashboardStatus.textContent = message;
  dashboardStatus.className = `status ${tone}`.trim();
}

function pageRole() {
  if (window.location.pathname.includes("companies-dashboard")) return "company";
  return "worker";
}

async function init(supabase) {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.user) {
    window.location.href = "index.html";
    return;
  }

  const user = data.session.user;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email, account_type, phone, company_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    setStatus("Could not load profile details.", "error");
    return;
  }

  const rolePage = pageRole();
  if (rolePage === "company" && profile.account_type !== "company") {
    window.location.href = "workers-dashboard.html";
    return;
  }

  if (rolePage === "worker" && profile.account_type === "company") {
    window.location.href = "companies-dashboard.html";
    return;
  }

  profileBox.innerHTML = `
    <dl>
      <dt>Name</dt><dd>${profile.full_name}</dd>
      <dt>Email</dt><dd>${profile.email}</dd>
      <dt>Role</dt><dd>${profile.account_type}</dd>
      <dt>Phone</dt><dd>${profile.phone || "Not set"}</dd>
      <dt>Company</dt><dd>${profile.company_name || "Not set"}</dd>
    </dl>
  `;

  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
  });

  setStatus("Dashboard ready.", "success");
}
