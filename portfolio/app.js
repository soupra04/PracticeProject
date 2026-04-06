/**
 * Featured projects: 33 QA/SDET highlights aligned with resume themes
 * (automation, API, telecom, process, and tooling).
 */
const PROJECTS = [
  {
    category: "Automation",
    title: "Selenium–Java regression framework",
    desc: "Custom framework that cut regression cycle time by about 40% and improved team throughput.",
  },
  {
    category: "Automation",
    title: "Cross-browser UI automation suite",
    desc: "Stable suites for web apps with consistent selectors and shared utilities across modules.",
  },
  {
    category: "Automation",
    title: "TestNG parallel execution layer",
    desc: "Configured parallel runs to shorten feedback loops while keeping reports readable.",
  },
  {
    category: "Automation",
    title: "Data-driven test harness",
    desc: "Externalized test data for enterprise flows so scenarios scale without code churn.",
  },
  {
    category: "Automation",
    title: "Page Object Model component library",
    desc: "Reusable page objects and helpers to keep UI tests maintainable across releases.",
  },
  {
    category: "Automation",
    title: "Edge-case regression library",
    desc: "200+ cases covering boundary and negative paths to catch defects before production.",
  },
  {
    category: "API",
    title: "REST API validation with Postman",
    desc: "Large collections validating 200+ endpoints for correct payloads and status behavior.",
  },
  {
    category: "API",
    title: "Swagger-backed contract checks",
    desc: "Aligned implementations with OpenAPI specs to reduce integration surprises.",
  },
  {
    category: "API",
    title: "Rest Assured integration suite",
    desc: "Java-based API checks wired into the same quality gates as UI automation.",
  },
  {
    category: "API",
    title: "API smoke gate for CI",
    desc: "Fast smoke pack blocking bad builds before heavier regression jobs run.",
  },
  {
    category: "API",
    title: "Backend stability initiative",
    desc: "Postman-led validation that supported reliable services and fewer production incidents.",
  },
  {
    category: "Performance",
    title: "JMeter load scenarios",
    desc: "Peak-traffic models for critical paths to surface bottlenecks early.",
  },
  {
    category: "Data",
    title: "SQL data verification toolkit",
    desc: "Cross-layer consistency checks between APIs, UI, and database records.",
  },
  {
    category: "Enterprise",
    title: "Salesforce Inspector + SOQL workflows",
    desc: "Targeted SOQL checks to validate CRM data and integrations under test.",
  },
  {
    category: "Telecom",
    title: "VoIP module regression pack",
    desc: "Functional and regression coverage for voice features in a telecom product line.",
  },
  {
    category: "Telecom",
    title: "SMS gateway integration tests",
    desc: "End-to-end checks on messaging flows and handoffs between services.",
  },
  {
    category: "Telecom",
    title: "Production reliability checks",
    desc: "Testing practices that supported 99.9% uptime goals in live environments.",
  },
  {
    category: "Process",
    title: "JIRA traceability workflow",
    desc: "100% mapping from user stories to test cases for audits and defect tracking.",
  },
  {
    category: "Process",
    title: "Requirement clarity program",
    desc: "Collaboration that resolved most ambiguities early and reduced late scope change.",
  },
  {
    category: "Process",
    title: "Offshore test coordination",
    desc: "Two time zones orchestrated for ~35% broader coverage with clear handoffs.",
  },
  {
    category: "Process",
    title: "Release-window RCA playbook",
    desc: "Structured root-cause analysis during critical releases to protect quality.",
  },
  {
    category: "Process",
    title: "UAT cycle compression",
    desc: "Partnered with dev and PM to tighten feedback loops before user acceptance.",
  },
  {
    category: "Process",
    title: "QA documentation standards",
    desc: "Standard templates and guides that sped onboarding and project handovers.",
  },
  {
    category: "Leadership",
    title: "Test strategy for high-visibility releases",
    desc: "Plans aligned to business goals with predictable delivery across squads.",
  },
  {
    category: "Leadership",
    title: "Certified SDET framework rollout",
    desc: "Scalable automation that reduced manual effort and improved execution speed.",
  },
  {
    category: "Mobile",
    title: "Mobile exploratory test charters",
    desc: "Session-based exploration for app quality beyond scripted cases.",
  },
  {
    category: "Security",
    title: "Release security smoke checks",
    desc: "Lightweight pre-release checks on auth and sensitive flows.",
  },
  {
    category: "Design",
    title: "Black-box feature matrices",
    desc: "Coverage maps for complex features without access to internal code paths.",
  },
  {
    category: "Agile",
    title: "Sprint test planning templates",
    desc: "Scrum-friendly plans linking backlog items, risk, and test focus.",
  },
  {
    category: "DevOps",
    title: "Git/GitHub strategy for test code",
    desc: "Branching and review habits that kept automation repos clean and reviewable.",
  },
  {
    category: "DevOps",
    title: "CI/CD test stage integration",
    desc: "Automated stages in pipelines so every merge gets consistent quality signals.",
  },
  {
    category: "Reporting",
    title: "Release quality scorecard",
    desc: "Simple metrics leadership could read: coverage, defects, and release readiness.",
  },
  {
    category: "Collaboration",
    title: "Cross-functional alignment retros",
    desc: "Regular feedback with engineering and product to steady delivery and quality.",
  },
];

const projectListEl = document.getElementById("projectList");
const filterBar = document.getElementById("filterBar");
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const backTop = document.getElementById("backTop");

function renderProjects(filter) {
  projectListEl.innerHTML = "";
  PROJECTS.forEach((p, i) => {
    if (filter !== "All" && p.category !== filter) return;
    const article = document.createElement("article");
    article.className = "project-card";
    article.setAttribute("data-category", p.category);
    article.innerHTML = `
      <div class="cat">${escapeHtml(p.category)}</div>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.desc)}</p>
    `;
    projectListEl.appendChild(article);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const categories = [
  "All",
  ...Array.from(new Set(PROJECTS.map((p) => p.category))).sort(),
];

categories.forEach((cat) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "filter-btn" + (cat === "All" ? " is-active" : "");
  b.textContent = cat;
  b.dataset.filter = cat;
  b.addEventListener("click", () => {
    filterBar.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("is-active"));
    b.classList.add("is-active");
    renderProjects(cat);
  });
  filterBar.appendChild(b);
});

renderProjects("All");

/* Theme: persist in localStorage */
const storedTheme = localStorage.getItem("portfolio-theme");
if (storedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.textContent = "Light mode";
}

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("portfolio-theme", "light");
    themeToggle.textContent = "Dark mode";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("portfolio-theme", "dark");
    themeToggle.textContent = "Light mode";
  }
});

/* Mobile nav */
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("is-open");
  const open = navLinks.classList.contains("is-open");
  menuToggle.setAttribute("aria-expanded", open);
});

navLinks.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => navLinks.classList.remove("is-open"));
});

/* Back to top visibility */
window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 400) backTop.classList.add("is-visible");
    else backTop.classList.remove("is-visible");
  },
  { passive: true }
);

backTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
