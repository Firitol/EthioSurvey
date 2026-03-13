import { createClient } from "@supabase/supabase-js";

/* ======================
   ENV & SUPABASE
====================== */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/* ======================
   DOM CHECK
====================== */
const hasDom = typeof window !== "undefined" && typeof document !== "undefined";

if (!hasDom) throw new Error("DOM is not available");

/* ======================
   STORAGE KEYS
====================== */
const STORAGE_KEY = "ethioSurveyEntries";
const ACCOUNT_STORAGE_KEY = "ethioSurveyAccount";
const REPORT_STORAGE_KEY = "ethioSurveyReports";
const LANGUAGE_STORAGE_KEY = "ethioSurveyLanguage";

/* ======================
   DOM ELEMENTS
====================== */
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const accountForm = document.getElementById("account-form");
const statusEl = document.getElementById("status");
const surveyForm = document.getElementById("survey-form");
const surveyList = document.getElementById("survey-list");
const reportSummary = document.getElementById("report-summary");
const reportBody = document.getElementById("report-body");
const accountSummary = document.getElementById("account-summary");
const filterType = document.getElementById("filter-type");
const clearButton = document.getElementById("clear-data");

/* ======================
   LANGUAGE SUPPORT
====================== */
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";

const TRANSLATIONS = {
  en: {
    surveySaved: "Survey completed and saved.",
    allCleared: "All surveys and reports cleared.",
    noSurveys: "No surveys yet.",
    noReports: "No reports yet.",
    createAccountFirst: "Please create an account first.",
  }
};

function t(key) {
  return TRANSLATIONS[currentLanguage]?.[key] || key;
}

/* ======================
   LOCAL STORAGE HELPERS
====================== */
function readEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try { return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function writeEntries(entries) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }

function readAccount() {
  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function writeAccount(account) { localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account)); }

function readReports() {
  const raw = localStorage.getItem(REPORT_STORAGE_KEY);
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function writeReports(reports) { localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports)); }

/* ======================
   STATUS
====================== */
function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

/* ======================
   SURVEY FUNCTIONS
====================== */
function updateReports(entry) {
  const reports = readReports();
  const existing = reports[entry.name] || { company: entry.name, surveyCount: 0, totalQuestions: 0, totalPaid: 0, paymentMethods: [] };

  existing.surveyCount += 1;
  existing.totalQuestions += entry.questionCount;
  existing.totalPaid += entry.totalEarning;
  existing.paymentMethods.push(entry.paymentMethod);

  reports[entry.name] = existing;
  writeReports(reports);
}

function entryTemplate(entry) {
  return `<li class="survey-item">
    <strong>${entry.name}</strong> • ${entry.type} • ${entry.userName} (${entry.userEmail}) • Total: ${entry.totalEarning} ETB
  </li>`;
}

function render() {
  const entries = readEntries();
  const filtered = filterType?.value === "All" ? entries : entries.filter(e => e.type === filterType?.value);
  
  if (surveyList) {
    surveyList.innerHTML = filtered.length
      ? filtered.map(entryTemplate).join("")
      : `<li>${t("noSurveys")}</li>`;
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REPORT_STORAGE_KEY);
      setStatus(t("allCleared"), "success");
      render();
    });
  }
}

/* ======================
   REGISTER / LOGIN
====================== */
async function handleRegister(event) {
  event.preventDefault();
  if (!supabase) return setStatus("Supabase not configured", "error");

  const email = document.getElementById("registerEmail")?.value;
  const password = document.getElementById("registerPassword")?.value;

  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    setStatus("Account created", "success");
  } catch (err) {
    setStatus(err.message, "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!supabase) return setStatus("Supabase not configured", "error");

  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setStatus("Login successful", "success");
  } catch (err) {
    setStatus(err.message, "error");
  }
}

/* ======================
   EVENT LISTENERS
====================== */
if (registerForm) registerForm.addEventListener("submit", handleRegister);
if (loginForm) loginForm.addEventListener("submit", handleLogin);
if (filterType) filterType.addEventListener("change", render);

/* ======================
   INITIAL RENDER
====================== */
render();
