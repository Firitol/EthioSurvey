import { createClient } from "@supabase/supabase-js";

/* =========================
   DOM ELEMENTS
========================= */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const statusEl = document.getElementById("status");

/* =========================
   CONSTANTS
========================= */

const REPORT_STORAGE_KEY = "ethiosurvey_reports";

/* =========================
   SUPABASE INIT
========================= */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  setStatus(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables",
    "error"
  );
}

/* =========================
   STATUS HANDLER
========================= */

function setStatus(message, tone = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status ${tone}`.trim();
}

/* =========================
   UTILITIES
========================= */

function normalizeAnswer(value) {
  return String(value || "").trim().toLowerCase();
}

/* =========================
   LOCAL STORAGE
========================= */

function readReports() {
  const raw = localStorage.getItem(REPORT_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeReports(data) {
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(data));
}

/* =========================
   FILE PARSER
========================= */

function parseQuestionsFile(text, extension) {
  if (extension === "json") {
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row) => ({
        question: row?.question,
        answer: row?.answer
      }))
      .filter((row) => row.question && row.answer);
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  return lines
    .map((line) => {
      const separator = extension === "csv" ? "," : "|";
      const pieces = line.split(separator);

      if (pieces.length < 2) return null;

      const question = pieces[0].trim();
      const answer = pieces.slice(1).join(separator).trim();

      return question && answer ? { question, answer } : null;
    })
    .filter(Boolean);
}

/* =========================
   ROLE ROUTING
========================= */

function routeByRole(role) {
  if (role === "company") {
    window.location.href = "/companies-dashboard.html";
    return;
  }

  if (role === "worker") {
    window.location.href = "/workers-dashboard.html";
    return;
  }

  window.location.href = "/";
}

/* =========================
   AUTHENTICATION
========================= */

async function handleRegister(event) {
  event.preventDefault();

  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const role = document.getElementById("registerRole").value;

  setStatus("Creating account...");

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    setStatus("Account created successfully", "success");

    routeByRole(role);
  } catch (err) {
    setStatus(err.message, "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  setStatus("Signing in...");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const user = data.user;

    if (!user) {
      throw new Error("User not found");
    }

    setStatus("Login successful", "success");

    routeByRole("worker");
  } catch (err) {
    setStatus(err.message, "error");
  }
}

/* =========================
   EVENT LISTENERS
========================= */

if (registerForm) {
  registerForm.addEventListener("submit", handleRegister);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

/* =========================
   FILE IMPORT HANDLER
========================= */

const fileInput = document.getElementById("questionsFile");

if (fileInput) {
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    const text = await file.text();

    try {
      const questions = parseQuestionsFile(text, extension);

      const reports = readReports();

      reports[file.name] = questions;

      writeReports(reports);

      setStatus("Questions imported successfully", "success");
    } catch (err) {
      setStatus("Failed to parse file", "error");
    }
  });
}
