const STORAGE_KEY = 'ethioSurveyEntries';
const ACCOUNT_STORAGE_KEY = 'ethioSurveyAccount';
const REPORT_STORAGE_KEY = 'ethioSurveyReports';
const LANGUAGE_STORAGE_KEY = 'ethioSurveyLanguage';
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
const languageSelect = hasDom ? document.getElementById('language-select') : null;

let currentLanguage = 'en';

const TRANSLATIONS = {
  en: {
    languageLabel: 'Language',
    heroText: 'Collect and review customer feedback on Ethiopian services, products, and banks in one place.',
    installBtn: 'Install EthioSurvey',
    installTip: 'Tip: Once installed, EthioSurvey works like a mobile app.',
    accountTitle: 'Create Account',
    surveyTitle: 'Submit a Survey',
    resultsTitle: 'Survey Results',
    reportsTitle: 'Stored Surveying Reports',
    footerText: 'Built for Ethiopia-wide feedback collection.',
    clearAll: 'Clear All',
    noSurveys: 'No surveys yet for this selection.',
    noReports: 'No reports yet.',
    noReportData: 'No report data yet. Reports are stored automatically once surveys are submitted.',
    noAccount: 'No account yet. Create an account before submitting surveys to track earnings.',
    installNotSupported: 'Install support is limited: service worker is not available in this browser.',
    installFailed: 'Could not enable offline install support. Please refresh and try again.',
    installPromptReady: 'Install EthioSurvey to use it like a normal mobile app.',
    installPromptUnavailable: 'Install prompt is unavailable. Open this site in Chrome/Edge on Android to install.',
    installAccepted: 'Thanks! EthioSurvey is being installed.',
    installCanceled: 'Install canceled. You can install anytime later.',
    installedSuccess: 'EthioSurvey installed successfully.',
    accountCreated: 'Account created successfully. You can now submit paid surveys.',
    createAccountFirst: 'Please create an account first so your survey earnings can be tracked.',
    surveySaved: 'Survey completed and saved. Earnings and company payment method recorded.',
    allCleared: 'All surveys and stored reports have been cleared.',
    summaryText: (count, avg, paid) => `${count} survey(s) shown • Average rating: ${avg}/5 • Total earned: ${paid} ETB`,
    accountSummaryText: (name, email, surveys, questions, earnings) => `Logged in as ${name} (${email}) • Surveys completed: ${surveys} • Questions answered: ${questions} • Total earnings: ${earnings} ETB`,
    reportSummaryText: (companies, surveys, questions, payout) => `${companies} company report(s) stored • ${surveys} completed survey(s) • ${questions} question(s) answered • ${payout} ETB total payout`,
    submittedAt: 'Submitted',
    user: 'User',
    location: 'Location',
    rating: 'Rating',
    questions: 'Questions',
    earning: 'Earning',
    total: 'Total',
    companyPayment: 'Company payment'
  },
  am: {
    languageLabel: 'ቋንቋ',
    heroText: 'የኢትዮጵያ አገልግሎቶች፣ ምርቶች እና ባንኮች ላይ የደንበኛ አስተያየት ይሰብስቡ እና ይመልከቱ።',
    installBtn: 'EthioSurvey ያስገቡ',
    installTip: 'ጥቆማ፡ ከተጫነ በኋላ EthioSurvey እንደ ሞባይል መተግበሪያ ይሰራል።',
    accountTitle: 'መለያ ይፍጠሩ',
    surveyTitle: 'ዳሰሳ ያስገቡ',
    resultsTitle: 'የዳሰሳ ውጤቶች',
    reportsTitle: 'የተቀመጡ የዳሰሳ ሪፖርቶች',
    footerText: 'ለኢትዮጵያ አቀፍ አስተያየት ስብስብ የተገነባ።',
    clearAll: 'ሁሉን አጥፋ',
    noSurveys: 'ለዚህ ምርጫ እስካሁን ዳሰሳ የለም።',
    noReports: 'እስካሁን ሪፖርት የለም።',
    noReportData: 'እስካሁን የሪፖርት ውሂብ የለም። ዳሰሳ ሲገባ ሪፖርቶች በራስ-ሰር ይቀመጣሉ።',
    noAccount: 'መለያ አልተፈጠረም። ገቢዎን ለመከታተል ዳሰሳ ከማስገባትዎ በፊት መለያ ይፍጠሩ።',
    installNotSupported: 'የመጫን ድጋፍ ውስን ነው፦ በዚህ አሳሽ service worker አይገኝም።',
    installFailed: 'ከመስመር ውጭ የመጫን ድጋፍ ማንቃት አልተቻለም። እባክዎ ያድሱ እና ዳግም ይሞክሩ።',
    installPromptReady: 'EthioSurvey እንደ መደበኛ ሞባይል መተግበሪያ ለመጠቀም ያስገቡ።',
    installPromptUnavailable: 'የመጫኛ መጠየቂያ አይገኝም። ለመጫን ይህን ጣቢያ Chrome/Edge በAndroid ላይ ይክፈቱ።',
    installAccepted: 'እናመሰግናለን! EthioSurvey በመጫን ላይ ነው።',
    installCanceled: 'መጫን ተሰርዟል። በኋላ ማንኛውም ጊዜ መጫን ይችላሉ።',
    installedSuccess: 'EthioSurvey በተሳካ ሁኔታ ተጭኗል።',
    accountCreated: 'መለያ በተሳካ ሁኔታ ተፈጥሯል። አሁን የተከፈለ ዳሰሳ ማስገባት ይችላሉ።',
    createAccountFirst: 'የዳሰሳ ገቢዎን ለመከታተል እባክዎ መጀመሪያ መለያ ይፍጠሩ።',
    surveySaved: 'ዳሰሳው ተጠናቋል እና ተቀምጧል። ገቢ እና የኩባንያ ክፍያ ዘዴ ተመዝግቧል።',
    allCleared: 'ሁሉም ዳሰሳዎች እና የተቀመጡ ሪፖርቶች ተሰርዘዋል።',
    summaryText: (count, avg, paid) => `${count} ዳሰሳ ታይቷል • አማካይ ደረጃ: ${avg}/5 • ጠቅላላ ገቢ: ${paid} ETB`,
    accountSummaryText: (name, email, surveys, questions, earnings) => `${name} (${email}) ገብቷል • የተጠናቀቁ ዳሰሳዎች: ${surveys} • የተመለሱ ጥያቄዎች: ${questions} • ጠቅላላ ገቢ: ${earnings} ETB`,
    reportSummaryText: (companies, surveys, questions, payout) => `${companies} የኩባንያ ሪፖርት ተቀምጧል • ${surveys} የተጠናቀቁ ዳሰሳዎች • ${questions} የተመለሱ ጥያቄዎች • ${payout} ETB ጠቅላላ ክፍያ`,
    submittedAt: 'የተላከበት',
    user: 'ተጠቃሚ',
    location: 'አካባቢ',
    rating: 'ደረጃ',
    questions: 'ጥያቄዎች',
    earning: 'ገቢ',
    total: 'ጠቅላላ',
    companyPayment: 'የኩባንያ ክፍያ'
  },
  om: {
    languageLabel: 'Afaan',
    heroText: 'Yaada maamiltootaa tajaajiloota, oomishaalee fi baankota Itoophiyaa irratti walitti qabiitii ilaali.',
    installBtn: 'EthioSurvey Fe\'i',
    installTip: 'Gorsa: Erga fe\'amee booda EthioSurvey akka appii moobaayiliitti hojjeta.',
    accountTitle: 'Herrega Uumi',
    surveyTitle: 'Qorannoo Galchi',
    resultsTitle: 'Bu\'aa Qorannoo',
    reportsTitle: 'Gabaasota Qorannoo Kuufaman',
    footerText: 'Walitti qabama yaadaa guutuu Itoophiyaaf ijaarame.',
    clearAll: 'Hunda Haqi',
    noSurveys: 'Filannoo kanaaf amma qorannoon hin jiru.',
    noReports: 'Amma gabaasni hin jiru.',
    noReportData: 'Amma deetaan gabaasaa hin jiru. Qorannoon yeroo galfamu gabaasonni ofumaan kuufamu.',
    noAccount: 'Herregni hin jiru. Galii hordofuuf dura herrega uumi.',
    installNotSupported: 'Deeggarsi fe\'umsaa daangeffamaadha: browser kana keessatti service worker hin jiru.',
    installFailed: 'Deeggarsa fe\'umsa offline dandeessisuu hin dandeenye. Haaromsiitii irra deebi\'i yaali.',
    installPromptReady: 'EthioSurvey akka appii moobaayilii idileetti fayyadamuuf fe\'i.',
    installPromptUnavailable: 'Gaaffiin fe\'umsaa hin argamu. Iddoo kana Chrome/Edge irratti Android fayyadamuun bani.',
    installAccepted: 'Galatoomi! EthioSurvey fe\'amaa jira.',
    installCanceled: 'Fe\'uun haqameera. Booda yeroo kamiyyuu fe\'uu dandeessa.',
    installedSuccess: 'EthioSurvey milkaa\'inaan fe\'ameera.',
    accountCreated: 'Herregni milkaa\'inaan uumameera. Amma qorannoo kaffaltii qabu galchuu dandeessa.',
    createAccountFirst: 'Galii qorannoo hordofuuf maaloo dura herrega uumi.',
    surveySaved: 'Qorannoon xumuramee kuufameera. Galii fi mala kaffaltii dhaabbataa galmaa\'eera.',
    allCleared: 'Qorannoowwan fi gabaasonni kuufaman hundi haqamaniiru.',
    summaryText: (count, avg, paid) => `${count} qorannoo mul\'ata • Sadarkaa giddugaleessaa: ${avg}/5 • Galii waliigalaa: ${paid} ETB`,
    accountSummaryText: (name, email, surveys, questions, earnings) => `${name} (${email}) seeneera • Qorannoowwan xumuraman: ${surveys} • Gaaffileen deebii argatan: ${questions} • Galii waliigalaa: ${earnings} ETB`,
    reportSummaryText: (companies, surveys, questions, payout) => `${companies} gabaasa dhaabbataa kuufame • ${surveys} qorannoo xumurame • ${questions} gaaffii deebii argate • ${payout} ETB kaffaltii waliigalaa`,
    submittedAt: 'Kan galfame',
    user: 'Fayyadamaa',
    location: 'Iddoo',
    rating: 'Sadarkaa',
    questions: 'Gaaffilee',
    earning: 'Galii',
    total: 'Waliigalaa',
    companyPayment: 'Kaffaltii dhaabbataa'
  }
};

function t() {
  return TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
}

function setLanguage(lang) {
  currentLanguage = TRANSLATIONS[lang] ? lang : 'en';
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  document.documentElement.lang = currentLanguage;
  applyStaticTranslations();
  render();
}

function applyStaticTranslations() {
  const tt = t();
  document.querySelector('.lang-switch label').textContent = tt.languageLabel;
  document.querySelector('.hero p').textContent = tt.heroText;
  installButton.textContent = tt.installBtn;
  installStatus.textContent = installStatus.textContent || tt.installTip;
  document.getElementById('account-title').textContent = tt.accountTitle;
  document.getElementById('survey-title').textContent = tt.surveyTitle;
  document.getElementById('results-title').textContent = tt.resultsTitle;
  document.getElementById('reports-title').textContent = tt.reportsTitle;
  clearButton.textContent = tt.clearAll;
  document.getElementById('footer-text').textContent = tt.footerText;
}

function readEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }

function readAccount() {
  const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function writeAccount(account) { localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account)); }

function readReports() {
  const raw = localStorage.getItem(REPORT_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function writeReports(reports) { localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports)); }

function getFilteredEntries(entries) {
  const chosenType = filterType.value;
  if (chosenType === 'All') return entries;
  return entries.filter((entry) => entry.type === chosenType);
}

function avgRating(entries) {
  if (!entries.length) return '0.0';
  const total = entries.reduce((sum, entry) => sum + Number(entry.rating), 0);
  return (total / entries.length).toFixed(1);
}

function totalEarnings(entries) { return entries.reduce((sum, entry) => sum + Number(entry.totalEarning), 0); }

function buildSummary(entries) {
  const filtered = getFilteredEntries(entries);
  const paid = totalEarnings(filtered).toFixed(2);
  summary.textContent = t().summaryText(filtered.length, avgRating(filtered), paid);
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
  const tt = t();
  return `
    <li class="survey-item">
      <div class="survey-top">
        <strong>${escapeHtml(entry.name)}</strong>
        <span class="type-pill">${escapeHtml(entry.type)}</span>
      </div>
      <p><strong>${tt.user}:</strong> ${escapeHtml(entry.userName)} (${escapeHtml(entry.userEmail)})</p>
      <p><strong>${tt.location}:</strong> ${escapeHtml(entry.location)}</p>
      <p><strong>${tt.rating}:</strong> ${entry.rating}/5</p>
      <p><strong>${tt.questions}:</strong> ${entry.questionCount} • <strong>${tt.earning}:</strong> ${entry.earningPerQuestion} ETB per question • <strong>${tt.total}:</strong> ${entry.totalEarning} ETB</p>
      <p><strong>${tt.companyPayment}:</strong> ${escapeHtml(entry.paymentMethod)} (${escapeHtml(entry.paymentAccount)})</p>
      <p>${escapeHtml(entry.comment)}</p>
      <small>${tt.submittedAt}: ${new Date(entry.createdAt).toLocaleString()}</small>
    </li>
  `;
}

function renderReports() {
  const tt = t();
  const reports = readReports();
  const rows = Object.values(reports);

  if (!rows.length) {
    reportSummary.textContent = tt.noReportData;
    reportBody.innerHTML = `<tr><td colspan="5">${tt.noReports}</td></tr>`;
    return;
  }

  const totalSurveys = rows.reduce((sum, row) => sum + row.surveyCount, 0);
  const totalQuestionsAnswered = rows.reduce((sum, row) => sum + row.totalQuestions, 0);
  const totalPayout = rows.reduce((sum, row) => sum + row.totalPaid, 0);

  reportSummary.textContent = tt.reportSummaryText(rows.length, totalSurveys, totalQuestionsAnswered, totalPayout.toFixed(2));

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
    accountSummary.textContent = t().noAccount;
    return;
  }

  const entries = readEntries().filter((entry) => entry.userEmail === account.email);
  const earnings = totalEarnings(entries).toFixed(2);
  const questionsAnswered = entries.reduce((sum, entry) => sum + entry.questionCount, 0);

  accountSummary.textContent = t().accountSummaryText(account.name, account.email, entries.length, questionsAnswered, earnings);
}

function render() {
  const entries = readEntries();
  const filtered = getFilteredEntries(entries);
  buildSummary(entries);

  if (!filtered.length) {
    surveyList.innerHTML = `<li class="survey-item">${t().noSurveys}</li>`;
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
    installStatus.textContent = t().installNotSupported;
    return;
  }

  try {
    await navigator.serviceWorker.register('service-worker.js');
  } catch {
    installStatus.textContent = t().installFailed;
  }
}

if (hasDom) {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
  if (languageSelect) languageSelect.value = storedLanguage;
  setLanguage(storedLanguage);

  languageSelect?.addEventListener('change', () => setLanguage(languageSelect.value));

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt.event = event;
    installButton.hidden = false;
    installStatus.textContent = t().installPromptReady;
  });

  installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt.event) {
      installStatus.textContent = t().installPromptUnavailable;
      return;
    }

    deferredInstallPrompt.event.prompt();
    const result = await deferredInstallPrompt.event.userChoice;
    installStatus.textContent = result.outcome === 'accepted' ? t().installAccepted : t().installCanceled;

    deferredInstallPrompt.event = null;
    installButton.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    installStatus.textContent = t().installedSuccess;
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
    accountStatus.textContent = t().accountCreated;
    renderAccountSummary();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const account = readAccount();
    if (!account) {
      statusText.textContent = t().createAccountFirst;
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

    statusText.textContent = t().surveySaved;
    form.reset();
    questionCountInput.value = '1';
    earningPerQuestionInput.value = '10';
    render();
  });

  filterType.addEventListener('change', render);

  clearButton.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REPORT_STORAGE_KEY);
    statusText.textContent = t().allCleared;
    render();
  });

  registerServiceWorker();
  render();
}
