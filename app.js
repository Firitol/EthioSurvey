const STORAGE_KEY = 'ethioSurveyEntries';
const ACCOUNT_STORAGE_KEY = 'ethioSurveyAccount';
const REPORT_STORAGE_KEY = 'ethioSurveyReports';
const deferredInstallPrompt = { event: null };

const hasDom = typeof window !== 'undefined' && typeof document !== 'undefined';

const accountForm = hasDom ? document.getElementById('account-form') : null;
const userNameInput = hasDom ? document.getElementById('user-name') : null;
const userEmailInput = hasDom ? document.getElementById('user-email') : null;
const accountStatus = hasDom ? document.getElementById('account-status') : null;
const accountSummary = hasDom ? document.getElementById('account-summary') : null;

const form = hasDom ? document.getElementById('survey-form') : null;
const surveyTypeInput = hasDom ? document.getElementById('survey-type') : null;
const entityNameInput = hasDom ? document.getElementById('entity-name') : null;
const locationInput = hasDom ? document.getElementById('location') : null;
const ratingInput = hasDom ? document.getElementById('rating') : null;
const questionCountInput = hasDom ? document.getElementById('question-count') : null;
const earningPerQuestionInput = hasDom ? document.getElementById('earning-per-question') : null;
const paymentMethodInput = hasDom ? document.getElementById('payment-method') : null;
const paymentAccountInput = hasDom ? document.getElementById('payment-account') : null;
const commentInput = hasDom ? document.getElementById('comment') : null;
const statusText = hasDom ? document.getElementById('form-status') : null;
const surveyList = hasDom ? document.getElementById('survey-list') : null;
const filterType = hasDom ? document.getElementById('filter-type') : null;
const clearButton = hasDom ? document.getElementById('clear-data') : null;
const summary = hasDom ? document.getElementById('summary') : null;
const reportSummary = hasDom ? document.getElementById('report-summary') : null;
const reportBody = hasDom ? document.getElementById('report-body') : null;
const installButton = hasDom ? document.getElementById('install-btn') : null;
const installStatus = hasDom ? document.getElementById('install-status') : null;

function readEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function readAccount() {
  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeAccount(account) {
  localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
}

function readReports() {
  const raw = localStorage.getItem(REPORT_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeReports(reports) {
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports));
}

function getFilteredEntries(entries) {
  const chosenType = filterType.value;
  if (chosenType === 'All') {
    return entries;
  }

  return entries.filter((entry) => entry.type === chosenType);
}

function avgRating(entries) {
  if (!entries.length) {
    return '0.0';
  }

  const total = entries.reduce((sum, entry) => sum + Number(entry.rating), 0);
  return (total / entries.length).toFixed(1);
}

function totalEarnings(entries) {
  return entries.reduce((sum, entry) => sum + Number(entry.totalEarning), 0);
}

function buildSummary(entries) {
  const filtered = getFilteredEntries(entries);
  const paid = totalEarnings(filtered).toFixed(2);
  summary.textContent = `${filtered.length} survey(s) shown • Average rating: ${avgRating(filtered)}/5 • Total earned: ${paid} ETB`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function entryTemplate(entry) {
  return `
    <li class="survey-item">
      <div class="survey-top">
        <strong>${escapeHtml(entry.name)}</strong>
        <span class="type-pill">${escapeHtml(entry.type)}</span>
      </div>
      <p><strong>User:</strong> ${escapeHtml(entry.userName)} (${escapeHtml(entry.userEmail)})</p>
      <p><strong>Location:</strong> ${escapeHtml(entry.location)}</p>
      <p><strong>Rating:</strong> ${entry.rating}/5</p>
      <p><strong>Questions:</strong> ${entry.questionCount} • <strong>Earning:</strong> ${entry.earningPerQuestion} ETB per question • <strong>Total:</strong> ${entry.totalEarning} ETB</p>
      <p><strong>Company payment:</strong> ${escapeHtml(entry.paymentMethod)} (${escapeHtml(entry.paymentAccount)})</p>
      <p>${escapeHtml(entry.comment)}</p>
      <small>Submitted: ${new Date(entry.createdAt).toLocaleString()}</small>
    </li>
  `;
}

function renderReports() {
  const reports = readReports();
  const rows = Object.values(reports);

  if (!rows.length) {
    reportSummary.textContent = 'No report data yet. Reports are stored automatically once surveys are submitted.';
    reportBody.innerHTML = '<tr><td colspan="5">No reports yet.</td></tr>';
    return;
  }

  const totalSurveys = rows.reduce((sum, row) => sum + row.surveyCount, 0);
  const totalQuestionsAnswered = rows.reduce((sum, row) => sum + row.totalQuestions, 0);
  const totalPayout = rows.reduce((sum, row) => sum + row.totalPaid, 0);

  reportSummary.textContent = `${rows.length} company report(s) stored • ${totalSurveys} completed survey(s) • ${totalQuestionsAnswered} question(s) answered • ${totalPayout.toFixed(2)} ETB total payout`;

  reportBody.innerHTML = rows
    .map((row) => {
      const methods = Array.from(new Set(row.paymentMethods)).join(', ');
      return `<tr>
        <td>${escapeHtml(row.company)}</td>
        <td>${row.surveyCount}</td>
        <td>${row.totalQuestions}</td>
        <td>${row.totalPaid.toFixed(2)}</td>
        <td>${escapeHtml(methods)}</td>
      </tr>`;
    })
    .join('');
}

function renderAccountSummary() {
  const account = readAccount();
  if (!account) {
    accountSummary.textContent = 'No account yet. Create an account before submitting surveys to track earnings.';
    return;
  }

  const entries = readEntries().filter((entry) => entry.userEmail === account.email);
  const earnings = totalEarnings(entries).toFixed(2);
  const questionsAnswered = entries.reduce((sum, entry) => sum + entry.questionCount, 0);

  accountSummary.textContent = `Logged in as ${account.name} (${account.email}) • Surveys completed: ${entries.length} • Questions answered: ${questionsAnswered} • Total earnings: ${earnings} ETB`;
}

function render() {
  const entries = readEntries();
  const filtered = getFilteredEntries(entries);
  buildSummary(entries);

  if (!filtered.length) {
    surveyList.innerHTML = '<li class="survey-item">No surveys yet for this selection.</li>';
  } else {
    surveyList.innerHTML = filtered.map(entryTemplate).join('');
  }

  renderAccountSummary();
  renderReports();
}

function updateReports(entry) {
  const reports = readReports();
  const existing = reports[entry.name] || {
    company: entry.name,
    surveyCount: 0,
    totalQuestions: 0,
    totalPaid: 0,
    paymentMethods: [],
  };

  existing.surveyCount += 1;
  existing.totalQuestions += entry.questionCount;
  existing.totalPaid += entry.totalEarning;
  existing.paymentMethods.push(entry.paymentMethod);
  reports[entry.name] = existing;

  writeReports(reports);
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    installStatus.textContent = 'Install support is limited: service worker is not available in this browser.';
    return;
  }

  try {
    await navigator.serviceWorker.register('service-worker.js');
  } catch {
    installStatus.textContent = 'Could not enable offline install support. Please refresh and try again.';
  }
}

if (hasDom) {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt.event = event;
    installButton.hidden = false;
    installStatus.textContent = 'Install EthioSurvey to use it like a normal mobile app.';
  });

  installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt.event) {
      installStatus.textContent = 'Install prompt is unavailable. Open this site in Chrome/Edge on Android to install.';
      return;
    }

    deferredInstallPrompt.event.prompt();
    const result = await deferredInstallPrompt.event.userChoice;
    if (result.outcome === 'accepted') {
      installStatus.textContent = 'Thanks! EthioSurvey is being installed.';
    } else {
      installStatus.textContent = 'Install canceled. You can install anytime later.';
    }

    deferredInstallPrompt.event = null;
    installButton.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    installStatus.textContent = 'EthioSurvey installed successfully.';
    installButton.hidden = true;
  });

  accountForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const account = {
      name: userNameInput.value.trim(),
      email: userEmailInput.value.trim().toLowerCase(),
      createdAt: Date.now(),
    };

    writeAccount(account);
    accountStatus.textContent = 'Account created successfully. You can now submit paid surveys.';
    renderAccountSummary();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const account = readAccount();
    if (!account) {
      statusText.textContent = 'Please create an account first so your survey earnings can be tracked.';
      return;
    }

    const questionCount = Number(questionCountInput.value);
    const earningPerQuestion = Number(earningPerQuestionInput.value);

    const entry = {
      id: crypto.randomUUID(),
      type: surveyTypeInput.value,
      name: entityNameInput.value.trim(),
      location: locationInput.value.trim(),
      rating: Number(ratingInput.value),
      questionCount,
      earningPerQuestion,
      totalEarning: questionCount * earningPerQuestion,
      paymentMethod: paymentMethodInput.value,
      paymentAccount: paymentAccountInput.value.trim(),
      comment: commentInput.value.trim(),
      userName: account.name,
      userEmail: account.email,
      createdAt: Date.now(),
    };

    const entries = readEntries();
    entries.unshift(entry);
    writeEntries(entries);
    updateReports(entry);

    statusText.textContent = 'Survey completed and saved. Earnings and company payment method recorded.';
    form.reset();
    questionCountInput.value = '1';
    earningPerQuestionInput.value = '10';
    render();
  });

  filterType.addEventListener('change', render);

  clearButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REPORT_STORAGE_KEY);
    statusText.textContent = 'All surveys and stored reports have been cleared.';
    render();
  });

  registerServiceWorker();
  render();
}
