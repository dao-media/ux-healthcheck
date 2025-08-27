// ======= UX Health Check Script — Device-Agnostic Pagination =======

const questionsData = {
  mobile: [
    { id: "q1", text: "Does your site load in under 3 seconds on mobile?", options: [
      { value: 3, label: "Yes, consistently" },
      { value: 1, label: "Usually, but sometimes slower" },
      { value: 0, label: "No, often takes 4+ seconds" }
    ] },
    { id: "q2", text: "Can users easily tap all buttons and links on mobile?", options: [
      { value: 3, label: "Yes, all touch targets are thumb-friendly" },
      { value: 1, label: "Most are fine, some require precision" },
      { value: 0, label: "No, many buttons are too small" }
    ] },
    { id: "q3", text: "Is your mobile navigation intuitive?", options: [
      { value: 3, label: "Yes, mobile navigation is clear and accessible" },
      { value: 1, label: "Mostly, but some areas are confusing" },
      { value: 0, label: "No, it's clearly designed desktop-first" }
    ] },
    { id: "q4", text: "Do mobile users convert at reasonable rates?", options: [
      { value: 3, label: "Yes, within 20% of desktop conversion" },
      { value: 1, label: "Somewhat, mobile converts 20-50% lower" },
      { value: 0, label: "No, mobile conversion is terrible" }
    ] }
  ],
  forms: [
    { id: "q5", text: "Can users complete signup/checkout without creating an account?", options: [
      { value: 3, label: "Yes, guest options are prominent" },
      { value: 1, label: "Available but not obvious" },
      { value: 0, label: "No, account creation required" }
    ] },
    { id: "q6", text: "Do you show all costs before the final step?", options: [
      { value: 3, label: "Yes, all costs visible from start" },
      { value: 1, label: "Mostly, some revealed during checkout" },
      { value: 0, label: "No, costs appear at final step" }
    ] },
    { id: "q7", text: "How many required fields are in your most important form?", options: [
      { value: 3, label: "Under 5 fields" },
      { value: 1, label: "5-10 fields" },
      { value: 0, label: "More than 10 fields" }
    ] },
    { id: "q8", text: "Do users get helpful error messages when forms break?", options: [
      { value: 3, label: "Yes, specific guidance for fixing errors" },
      { value: 1, label: "Generic messages but users can figure it out" },
      { value: 0, label: "Vague or technical error messages" }
    ] }
  ],
  navigation: [
    { id: "q9", text: "Can visitors find your main product/service within 10 seconds?", options: [
      { value: 3, label: "Yes, primary offering is immediately clear" },
      { value: 1, label: "Usually, but requires some hunting" },
      { value: 0, label: "No, visitors often seem confused" }
    ] },
    { id: "q10", text: "Is your site search functional and helpful?", options: [
      { value: 3, label: "Yes, returns relevant results consistently" },
      { value: 1, label: "Works but results aren't always useful" },
      { value: 0, label: "Broken, missing, or returns poor results" }
    ] },
    { id: "q11", text: "Can users easily return to previous pages or start over?", options: [
      { value: 3, label: "Yes, clear back/breadcrumb navigation" },
      { value: 1, label: "Available in most places" },
      { value: 0, label: "Users often get stuck or lost" }
    ] },
    { id: "q12", text: "Do users know where they are in multi-step processes?", options: [
      { value: 3, label: "Yes, clear progress indicators always visible" },
      { value: 1, label: "Sometimes, but not consistently" },
      { value: 0, label: "No, users are often unsure of progress" }
    ] }
  ],
  accessibility: [
    { id: "q13", text: "Is text readable without users needing to zoom or squint?", options: [
      { value: 3, label: "Yes, all text is clearly legible" },
      { value: 1, label: "Mostly good, some areas are small" },
      { value: 0, label: "No, text is often too small or low contrast" }
    ] },
    { id: "q14", text: "Can users understand what will happen when they click buttons?", options: [
      { value: 3, label: "Yes, all actions have clear, descriptive labels" },
      { value: 1, label: "Mostly clear, some generic labels" },
      { value: 0, label: "No, many buttons are vague or misleading" }
    ] },
    { id: "q15", text: "Do images have meaningful descriptions for screen readers?", options: [
      { value: 3, label: "Yes, all important images have descriptive alt text" },
      { value: 1, label: "Some do, others are missing or generic" },
      { value: 0, label: "No, most images lack proper alt text" }
    ] },
    { id: "q16", text: "Can users complete key tasks using only a keyboard?", options: [
      { value: 3, label: "Yes, full keyboard navigation works smoothly" },
      { value: 1, label: "Mostly, but some areas are difficult" },
      { value: 0, label: "No, keyboard users get stuck" }
    ] }
  ]
};

const questionGroups = {
  "mobile-page": "mobile",
  "forms-page": "forms",
  "navigation-page": "navigation",
  "accessibility-page": "accessibility"
};
let currentQuestion = { mobile: 0, forms: 0, navigation: 0, accessibility: 0 };
let answers = {};
let currentPage = 0;
const pages = [
  "welcome-page",
  "mobile-page",
  "forms-page",
  "navigation-page",
  "accessibility-page",
  "results-page"
];

// NAVIGATION: device-agnostic, always hide/show one page only
window.carouselPrev = function(category) {
  if (currentQuestion[category] > 0) {
    currentQuestion[category] -= 1;
    renderCarouselQuestion(category);
    updatePageNavButton(category);
  }
};

window.carouselNext = function(category) {
  if (currentQuestion[category] < questionsData[category].length - 1) {
    currentQuestion[category] += 1;
    renderCarouselQuestion(category);
    updatePageNavButton(category);
  }
};

window.onOptionSelect = function(category, idx, qid, value) {
  answers[qid] = value;
  saveAnswers();
  renderCarouselQuestion(category);
  updatePageNavButton(category);
};

window.prevPage = function() {
  if (currentPage > 0) {
    hidePage(pages[currentPage]);
    currentPage--;
    showPage(pages[currentPage]);
    updateProgress();
    scrollToTop();
  }
};

window.nextPage = function() {
  if (currentPage < pages.length - 1) {
    hidePage(pages[currentPage]);
    currentPage++;
    showPage(pages[currentPage]);
    const cat = questionGroups[pages[currentPage]];
    if (cat) {
      currentQuestion[cat] = 0;
      renderCarouselQuestion(cat);
      updatePageNavButton(cat);
    }
    if (pages[currentPage] === "results-page") calculateResults();
    updateProgress();
    scrollToTop();
  }
};

window.restartAssessment = function() {
  currentPage = 0;
  answers = {};
  localStorage.removeItem('ux-health-answers');
  ["mobile", "forms", "navigation", "accessibility"].forEach(cat => currentQuestion[cat] = 0);
  setupAllCarousels();
  ["mobile", "forms", "navigation", "accessibility"].forEach(updatePageNavButton);
  pages.forEach(pageId => hidePage(pageId));
  showPage(pages[0]);
  updateProgress();
  scrollToTop();
};

document.addEventListener("DOMContentLoaded", function() {
  setupAllCarousels();
  updateProgress();
  setupEventListeners();
  loadAnswers();
});

// Core wizard: always only one page has .active. This logic is device-agnostic.
function setupAllCarousels() {
  Object.keys(questionsData).forEach(cat => {
    renderCarouselQuestion(cat);
  });
}

function renderCarouselQuestion(category) {
  const idx = currentQuestion[category];
  const q = questionsData[category][idx];
  const container = document.getElementById(`${category}-carousel`);

  const numQuestions = questionsData[category].length;
  const showLeft = idx > 0;
  const showRight = idx < numQuestions - 1;

  let html = `<div class="carousel">`;
  html += `<button type="button" class="carousel-btn" 
              onclick="carouselPrev('${category}')"
              style="visibility:${showLeft ? 'visible':'hidden'}">&#8592;</button>`;
  html += `<div class="carousel-content-inner"><div class="question-card"><h3>${q.text}</h3><div class="options">`;
  q.options.forEach(opt => {
    const checked = answers[q.id] == opt.value ? "checked" : "";
    html += `
      <label class="option">
        <input
          type="radio"
          name="${q.id}"
          value="${opt.value}"
          ${checked}
          onclick="onOptionSelect('${category}',${idx},'${q.id}',${opt.value})"
        />
        <div class="option-content">
          <div class="option-title">${opt.label}</div>
        </div>
        <div class="checkmark"></div>
      </label>
    `;
  });
  html += `</div></div></div>`;
  html += `<button type="button" class="carousel-btn" 
              onclick="carouselNext('${category}')"
              style="visibility:${showRight ? 'visible':'hidden'}">&#8594;</button>`;
  html += `</div>`;
  if (container) container.innerHTML = html;
  updatePageNavButton(category);
}

function updatePageNavButton(category) {
  const pageId = Object.entries(questionGroups).find(([pid, c]) => c === category)?.[0];
  if (pageId) {
    const allAnswered = questionsData[category].every(q => answers[q.id] !== undefined);
    const btn = document.getElementById(`${category}-next`);
    if (btn) btn.style.display = allAnswered ? "" : "none";
  }
}

function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  if (progressFill && progressText) {
    const progress = (currentPage / (pages.length - 1)) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Step ${Math.min(currentPage + 1, 5)} of 5`;
  }
}

function setupEventListeners() {
  const emailForm = document.getElementById('email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', handleEmailSubmit);
  }
}

function hidePage(id) {
  const page = document.getElementById(id);
  if (page) page.classList.remove('active');
}

function showPage(id) {
  // Hide all other pages first for full safety (ensures mobile/desktop parity)
  pages.forEach(pid => {
    const pg = document.getElementById(pid);
    if (pg) pg.classList.remove('active');
  });
  const page = document.getElementById(id);
  if (page) page.classList.add('active');
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function saveAnswers() {
  localStorage.setItem('ux-health-answers', JSON.stringify(answers));
}
function loadAnswers() {
  const saved = localStorage.getItem('ux-health-answers');
  if (saved) {
    answers = JSON.parse(saved);
    setupAllCarousels();
    ["mobile", "forms", "navigation", "accessibility"].forEach(updatePageNavButton);
  }
}

function calculateResults() {
  const scores = {
    mobile: getScoreForQuestions(['q1', 'q2', 'q3', 'q4']),
    forms: getScoreForQuestions(['q5', 'q6', 'q7', 'q8']),
    navigation: getScoreForQuestions(['q9', 'q10', 'q11', 'q12']),
    accessibility: getScoreForQuestions(['q13', 'q14', 'q15', 'q16']),
  };
  const total = scores.mobile + scores.forms + scores.navigation + scores.accessibility;
  displayResults(total, scores);
}

function getScoreForQuestions(ids) { return ids.reduce((sum, q) => sum + (answers[q] || 0), 0); }

function pct(numer, denom) {
  let percent = Math.round((numer / denom) * 1000) / 10;
  if (percent === 100 || percent % 1 === 0) return Math.round(percent) + '%';
  return percent.toFixed(1) + '%';
}

function displayResults(totalScore, catScores) {
  // Show extra clarity lines at top of results
  const scoreReminder = document.getElementById("results-score-reminder");
  if (scoreReminder) scoreReminder.style.display = '';

  // Priority Explanation above breakdown
  document.getElementById('priority-explanation').innerHTML = `
    <div style="margin-bottom:22px;">
      <strong>How priorities are set:</strong>
      Categories are ranked by which area needs the most improvement—so you know where focused attention will have the fastest impact.
      This may not match percent order if a core UX problem is more urgent than marginal differences elsewhere.
    </div>`;

  // Main score as %
  document.getElementById('total-score').textContent = pct(totalScore, 48);

  document.getElementById('interpretation').innerHTML = getScoreInterpretation(totalScore);
  document.getElementById('breakdown').innerHTML = getCategoryBreakdown(catScores);
  document.getElementById('actions').innerHTML = getActionSteps(catScores, totalScore);
}

function getScoreInterpretation(score) {
  const percent = Math.round(score / 48 * 100);
  if (score >= 40) return `<h3 class="success">🎉 Healthy UX (${percent}%)</h3>
      <p>Your site’s user experience is in great shape! Keep tuning and monitoring to stay ahead.<br>
      <strong>Higher scores mean a more accessible, easier-to-use site for all.</strong></p>`;
  if (score >= 30) return `<h3 class="warning">⚠️ Some Moderate Issues (${percent}%)</h3>
      <p>Your site is solid, but you have areas to improve.<br>
      <strong>Your score reflects your site's overall health—the higher, the better.</strong></p>`;
  if (score >= 20) return `<h3 style="color: var(--warning-color);">🚨 Significant Problems (${percent}%)</h3>
      <p>These issues are likely hurting your users and your revenue.<br>
      <strong>Aim for a higher score to make your site smoother and more accessible.</strong></p>`;
  return `<h3 class="danger">🆘 UX Emergency (${percent}%)</h3>
      <p>Your site may be losing many users due to its current experience.<br>
      <strong>A higher score means a healthier, more inclusive site, and your prioritized action plan below will get you there fastest.</strong></p>`;
}

function getCategoryBreakdown(categoryScores) {
  const categories = [
    { name: '📱 Mobile Experience', score: categoryScores.mobile, key: 'mobile' },
    { name: '📋 Forms & Conversion', score: categoryScores.forms, key: 'forms' },
    { name: '🧭 Navigation & Findability', score: categoryScores.navigation, key: 'navigation' },
    { name: '♿ Accessibility & Clarity', score: categoryScores.accessibility, key: 'accessibility' }
  ];
  categories.sort((a, b) => a.score - b.score);
  let html = '<h3>Your Priority Areas<br><span style="font-size:0.9em;color:#64748b;font-weight:400;">(Start from the top for most impact)</span></h3>';
  const priorities = [
    '🔥 Immediate attention needed',
    '⚡ Address within 30 days', 
    '📈 Tackle after first two improve',
    '✅ Maintain current performance'
  ];
  categories.forEach((cat, index) => {
    const percent = pct(cat.score, 12);
    html += `<div class="category-score">
        <div><strong>${cat.name}</strong><br>
        <small style="color: var(--text-secondary);">${priorities[index]}</small></div>
        <div style="text-align: right;">
            <span style="font-size: 1.2rem; font-weight: 700;">${percent}</span><br>
            <small style="color: var(--text-secondary);">${cat.score}/12</small>
        </div>
    </div>`;
  });
  return html;
}

function getActionSteps(categoryScores, totalScore) {
  const categories = { mobile: categoryScores.mobile, forms: categoryScores.forms, navigation: categoryScores.navigation, accessibility: categoryScores.accessibility };
  const lowest = Object.keys(categories).reduce((a, b) => categories[a] < categories[b] ? a : b);
  const actionPlans = {
    mobile: {
      title: 'Mobile Experience',
      actions: [
        'Run a mobile speed test using Google PageSpeed Insights',
        'Increase button sizes to minimum 44px touch targets',
        'Test your checkout flow on an actual phone',
        'Implement responsive images and optimize for mobile-first loading'
      ]
    },
    forms: {
      title: 'Forms & Conversion',
      actions: [
        'Remove every non-essential form field immediately',
        'Add guest checkout option prominently',
        'Display all costs upfront before checkout begins',
        'Add inline validation with helpful error messages'
      ]
    },
    navigation: {
      title: 'Navigation & Findability',
      actions: [
        'Add clear breadcrumbs to all pages',
        'Test if new visitors can find your main offering in under 10 seconds',
        'Implement or improve your site search functionality',
        'Add progress indicators to multi-step processes'
      ]
    },
    accessibility: {
      title: 'Accessibility & Clarity',
      actions: [
        'Increase text size and contrast immediately',
        'Add descriptive alt text to all images',
        'Test navigation using only keyboard (no mouse)',
        'Ensure all buttons and links have clear, descriptive labels'
      ]
    }
  };
  let html = `<h3>🎯 Start Here: ${actionPlans[lowest].title}</h3>
    <p><strong>Focus on your lowest-scoring area first for maximum impact:</strong></p>
    <ul>`;
  actionPlans[lowest].actions.forEach(action => { html += `<li>${action}</li>`; });
  html += '</ul>';
  if (totalScore < 30) {
    html += `
      <div style="background: #fef3c7; padding: 20px; border-radius: var(--radius-md); margin-top: 24px; border-left: 4px solid var(--warning-color);">
        <strong>💡 Quick Win Strategy:</strong> Pick your #1 priority area and implement one fix this week. 
        Most of these changes take under 2 hours but can improve conversion rates by 10-30%.
      </div>
    `;
  }
  return html;
}

function handleEmailSubmit(e) {
  e.preventDefault();
  e.target.innerHTML = `
    <div style="text-align: center;">
      <h4 style="margin-bottom: 8px;">✅ Thanks! Check your email in a few minutes.</h4>
      <p style="margin: 0; opacity: 0.9; font-size: 0.875rem;">The complete UX Recovery Guide is on its way.</p>
    </div>
  `;
}
