const STORAGE_KEY = 'ethioSurveyEntries';
const deferredInstallPrompt = { event: null };

const form = document.getElementById('survey-form');
const surveyTypeInput = document.getElementById('survey-type');
const entityNameInput = document.getElementById('entity-name');
const locationInput = document.getElementById('location');
const ratingInput = document.getElementById('rating');
const commentInput = document.getElementById('comment');
const statusText = document.getElementById('form-status');
const surveyList = document.getElementById('survey-list');
const filterType = document.getElementById('filter-type');
const clearButton = document.getElementById('clear-data');
const summary = document.getElementById('summary');
const installButton = document.getElementById('install-btn');
const installStatus = document.getElementById('install-status');

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

function buildSummary(entries) {
  const filtered = getFilteredEntries(entries);
  summary.textContent = `${filtered.length} survey(s) shown • Average rating: ${avgRating(filtered)}/5`;
}

function escapeHtml(value) {
  return value
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
      <p><strong>Location:</strong> ${escapeHtml(entry.location)}</p>
      <p><strong>Rating:</strong> ${entry.rating}/5</p>
      <p>${escapeHtml(entry.comment)}</p>
      <small>Submitted: ${new Date(entry.createdAt).toLocaleString()}</small>
    </li>
  `;
}

function render() {
  const entries = readEntries();
  const filtered = getFilteredEntries(entries);
  buildSummary(entries);

  if (!filtered.length) {
    surveyList.innerHTML = '<li class="survey-item">No surveys yet for this selection.</li>';
    return;
  }

  surveyList.innerHTML = filtered.map(entryTemplate).join('');
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

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const entry = {
    id: crypto.randomUUID(),
    type: surveyTypeInput.value,
    name: entityNameInput.value.trim(),
    location: locationInput.value.trim(),
    rating: Number(ratingInput.value),
    comment: commentInput.value.trim(),
    createdAt: Date.now(),
  };

  const entries = readEntries();
  entries.unshift(entry);
  writeEntries(entries);

  statusText.textContent = 'Survey saved successfully.';
  form.reset();
  render();
});

filterType.addEventListener('change', render);

clearButton.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  statusText.textContent = 'All surveys have been cleared.';
  render();
});

registerServiceWorker();
render();
