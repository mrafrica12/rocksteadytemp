/* ═══════════════════════════════════════════════════════════════
   Rock Steady ATL — Admin Dashboard Logic
   UmojaServ Backend Interface
   ═══════════════════════════════════════════════════════════════ */

const ADMIN_USER = "rocksteady";
const ADMIN_PASS = "RockSteady2026!";
const ADMIN_KEY  = "rs_admin_auth";

/* ─ Auth ────────────────────────────────────────────────────────── */
function requireAuth() {
  if (!sessionStorage.getItem(ADMIN_KEY)) {
    window.location.href = "index.html";
  }
}

function login(username, pass) {
  if (username.trim().toLowerCase() === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem(ADMIN_KEY, "1");
    window.location.href = "dashboard.html";
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(ADMIN_KEY);
  window.location.href = "index.html";
}

/* ─ Sidebar Active State ─────────────────────────────────────────── */
function initSidebar() {
  const page = location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar-nav a").forEach(a => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  /* Mobile toggle */
  const topbarHamburger = document.querySelector(".admin-topbar-hamburger");
  const sidebar = document.querySelector(".admin-sidebar");
  topbarHamburger?.addEventListener("click", () => {
    sidebar?.classList.toggle("mobile-open");
  });
}

/* ─ Toast ───────────────────────────────────────────────────────── */
function adminToast(type, title, msg) {
  const icons = { success: "✓", error: "✕", info: "✦" };
  let container = document.querySelector(".admin-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "admin-toast-container toast-container";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `
    <div class="toast-icon">${icons[type] || "i"}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ""}
    </div>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.transition = "all .4s ease";
    t.style.opacity = "0";
    t.style.transform = "translateX(100%)";
    setTimeout(() => t.remove(), 400);
  }, 4000);
}

/* ─ Modal Helpers ────────────────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id)?.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
  document.body.style.overflow = "";
}

function initModals() {
  document.querySelectorAll("[data-modal-open]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.modalOpen));
  });
  document.querySelectorAll("[data-modal-close]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.modalClose));
  });
  document.querySelectorAll(".admin-modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

/* ─ Table Search ─────────────────────────────────────────────────── */
function initTableSearch(inputSel, rowSel) {
  const input = document.querySelector(inputSel);
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    document.querySelectorAll(rowSel).forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}

/* ─ Simulated Data Helpers ───────────────────────────────────────── */
function getLocalData(key, defaults = []) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || defaults;
  } catch { return defaults; }
}

function saveLocalData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ─ Mock Analytics Data ──────────────────────────────────────────── */
const ANALYTICS = {
  weeklyReservations: [12, 18, 24, 15, 32, 41, 28],
  topEvents: [
    { name: "Afrobeats Takeover", views: 842, rsvp: 156 },
    { name: "Rock Steady Bday Bash", views: 1204, rsvp: 198 },
    { name: "Amapiano Friday", views: 631, rsvp: 112 },
    { name: "Riddim Sundays", views: 518, rsvp: 88 },
    { name: "Ladies Night", views: 445, rsvp: 74 }
  ],
  topDJs: [
    { name: "DJ Smooth", bookings: 24 },
    { name: "DJ Kush", bookings: 18 },
    { name: "DJ Selecta", bookings: 16 },
    { name: "DJ Queen B", bookings: 10 }
  ],
  trafficSources: [
    { label: "Direct / Phone", value: 38, color: "#c8962a" },
    { label: "Instagram", value: 29, color: "#e1306c" },
    { label: "Google Search", value: 21, color: "#c8962a" },
    { label: "Word of Mouth", value: 12, color: "#60a5fa" }
  ],
  recentActivity: [
    { dot: "gold", title: "New VIP member — Adaeze O. (Royale tier)", time: "2 minutes ago" },
    { dot: "green", title: "Reservation confirmed — Marcus T. (4 guests, Fri Jun 6)", time: "8 minutes ago" },
    { dot: "green", title: "Phone inquiry — Birthday package for Jun 14", time: "15 minutes ago" },
    { dot: "gold", title: "New VIP member — Simone B. (Riddim tier)", time: "32 minutes ago" },
    { dot: "blue", title: "Event RSVP — Amapiano Friday (3 new sign-ups)", time: "45 minutes ago" },
    { dot: "green", title: "Reservation confirmed — Devon W. (2 guests, Sun Jun 7)", time: "1 hour ago" },
    { dot: "red", title: "Cancellation — Carlos M. (Sat Jun 21, refund processed)", time: "2 hours ago" },
    { dot: "gold", title: "Newsletter subscriber — keishar@email.com", time: "3 hours ago" }
  ]
};

/* ─ Dashboard Render ─────────────────────────────────────────────── */
function renderDashboard() {
  /* KPI cards */
  const kpis = [
    { label: "Tonight's Reservations", value: "24", trend: "+8", dir: "up", icon: svgCalendar() },
    { label: "VIP Members", value: "312", trend: "+14", dir: "up", icon: svgStar() },
    { label: "This Week RSVPs", value: "156", trend: "+23%", dir: "up", icon: svgTicket() },
    { label: "Direct Leads", value: "38", trend: "+6", dir: "up", icon: svgPhone() }
  ];

  const kpiGrid = document.getElementById("kpi-grid");
  if (kpiGrid) {
    kpiGrid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-label">${k.label}</span>
        <div class="kpi-icon">${k.icon}</div>
      </div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-trend ${k.dir}">
        ${k.dir === "up" ? "↑" : "↓"} ${k.trend} this week
      </div>
    </div>`).join("");
  }

  /* Activity feed */
  const feed = document.getElementById("activity-feed");
  if (feed) {
    feed.innerHTML = ANALYTICS.recentActivity.map(a => `
    <div class="activity-item">
      <div class="activity-dot ${a.dot}"></div>
      <div class="activity-body">
        <div class="activity-title">${a.title}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>`).join("");
  }

  /* Top events bar chart */
  const eventsChart = document.getElementById("events-bar-chart");
  if (eventsChart) {
    const max = Math.max(...ANALYTICS.topEvents.map(e => e.rsvp));
    eventsChart.innerHTML = `<div class="bar-chart-wrap">` +
      ANALYTICS.topEvents.map(e => `
      <div class="bar-row">
        <div class="bar-label">${e.name}</div>
        <div class="bar-fill-wrap"><div class="bar-fill" style="width:${(e.rsvp/max*100).toFixed(0)}%"></div></div>
        <div class="bar-val">${e.rsvp}</div>
      </div>`).join("") + `</div>`;
  }

  /* Weekly mini-chart */
  const miniChart = document.getElementById("mini-week-chart");
  if (miniChart) {
    const max = Math.max(...ANALYTICS.weeklyReservations);
    miniChart.innerHTML = `<div class="mini-chart">` +
      ANALYTICS.weeklyReservations.map((v, i) => `
      <div class="mini-bar ${i === ANALYTICS.weeklyReservations.length - 1 ? "active" : ""}"
           style="height:${(v/max*100).toFixed(0)}%" title="${v} reservations"></div>
    `).join("") + `</div>`;
  }

  /* Traffic sources */
  const trafficLegend = document.getElementById("traffic-legend");
  if (trafficLegend) {
    trafficLegend.innerHTML = ANALYTICS.trafficSources.map(s => `
    <div class="donut-legend-item">
      <div class="donut-legend-dot" style="background:${s.color}"></div>
      <span>${s.label} — <strong style="color:var(--ink)">${s.value}%</strong></span>
    </div>`).join("");
  }
}

/* ─ Reservations Page ────────────────────────────────────────────── */
const MOCK_RESERVATIONS = [
  { id:"R001", name:"Marcus Thompson", guests:4, date:"Jun 6, 2026", time:"9:00 PM", type:"VIP Table", event:"Afrobeats Takeover", status:"confirmed", phone:"+1 404 555 0101" },
  { id:"R002", name:"Adaeze Okafor", guests:6, date:"Jun 6, 2026", time:"9:30 PM", type:"Standard", event:"Afrobeats Takeover", status:"confirmed", phone:"+1 404 555 0102" },
  { id:"R003", name:"Devon Williams", guests:2, date:"Jun 7, 2026", time:"7:00 PM", type:"Standard", event:"Riddim Sundays", status:"pending", phone:"+1 404 555 0103" },
  { id:"R004", name:"Simone Baptiste", guests:8, date:"Jun 13, 2026", time:"9:00 PM", type:"Bottle Service", event:"Amapiano Friday", status:"confirmed", phone:"+1 404 555 0104" },
  { id:"R005", name:"Carlos Mendez", guests:10, date:"Jun 20, 2026", time:"8:00 PM", type:"VIP Table", event:"Birthday Bash", status:"pending", phone:"+1 404 555 0105" },
  { id:"R006", name:"Keisha Robinson", guests:4, date:"Jun 21, 2026", time:"9:00 PM", type:"Standard", event:"Hip-Hop Saturdays", status:"confirmed", phone:"+1 404 555 0106" },
  { id:"R007", name:"Jamal Foster", guests:2, date:"Jun 26, 2026", time:"8:00 PM", type:"Standard", event:"Ladies Night", status:"cancelled", phone:"+1 404 555 0107" }
];

function renderReservations() {
  const tbody = document.getElementById("reservations-tbody");
  if (!tbody) return;
  const all = [...MOCK_RESERVATIONS, ...getLocalData("rs_reservations", [])];
  tbody.innerHTML = all.map(r => `
  <tr>
    <td class="primary">${r.id || "—"}</td>
    <td class="primary">${r.name || (r.first_name ? r.first_name + " " + r.last_name : "—")}</td>
    <td>${r.guests || r.guests_count || "—"}</td>
    <td>${r.date || "—"}</td>
    <td>${r.time || "—"}</td>
    <td>${r.event || r.event_name || "General"}</td>
    <td>${r.type || r.table_type || "Standard"}</td>
    <td><span class="status-badge ${r.status || "pending"}">${r.status || "pending"}</span></td>
    <td>
      <button class="btn btn-ghost btn-sm" onclick="adminToast('success','Updated','Status changed to confirmed.')">✓ Confirm</button>
    </td>
  </tr>`).join("");
}

/* ─ VIP Members Page ─────────────────────────────────────────────── */
const MOCK_MEMBERS = [
  { id:"M001", name:"Adaeze Okafor", tier:"Royale", email:"adaeze@email.com", phone:"+1 404 555 0201", joined:"Jan 2026", visits:18, birthday:"March" },
  { id:"M002", name:"Marcus Thompson", tier:"Riddim", email:"marcus@email.com", phone:"+1 404 555 0202", joined:"Feb 2026", visits:12, birthday:"June" },
  { id:"M003", name:"Simone Baptiste", tier:"Riddim", email:"simone@email.com", phone:"+1 404 555 0203", joined:"Mar 2026", visits:8, birthday:"August" },
  { id:"M004", name:"Keisha Robinson", tier:"Roots", email:"keisha@email.com", phone:"+1 404 555 0204", joined:"Apr 2026", visits:5, birthday:"December" },
  { id:"M005", name:"Devon Williams", tier:"Royale", email:"devon@email.com", phone:"+1 404 555 0205", joined:"Jan 2026", visits:22, birthday:"September" },
  { id:"M006", name:"Carlos Mendez", tier:"Riddim", email:"carlos@email.com", phone:"+1 404 555 0206", joined:"May 2026", visits:4, birthday:"November" }
];

function renderMembers() {
  const tbody = document.getElementById("members-tbody");
  if (!tbody) return;
  const all = [...MOCK_MEMBERS, ...getLocalData("rs_vip_members", []).map((m, i) => ({
    id: "M" + (100 + i), name: `${m.first_name || ""} ${m.last_name || ""}`.trim(),
    tier: m.tier?.split(" ")[0] || "Roots", email: m.email, phone: m.phone,
    joined: "2026", visits: 0, birthday: m.birthday_month || "—"
  }))];

  tbody.innerHTML = all.map(m => `
  <tr>
    <td class="primary">${m.name}</td>
    <td><span class="status-badge ${m.tier === "Royale" ? "vip" : m.tier === "Riddim" ? "confirmed" : "draft"}">${m.tier}</span></td>
    <td>${m.email || "—"}</td>
    <td>${m.phone || "—"}</td>
    <td>${m.birthday || "—"}</td>
    <td>${m.visits}</td>
    <td>${m.joined}</td>
    <td>
      <button class="btn btn-ghost btn-sm" onclick="adminToast('info','Email','Composing email for ${m.name}...')">Email</button>
    </td>
  </tr>`).join("");
}

/* ─ CRM Page ─────────────────────────────────────────────────────── */
function renderCRM() {
  const tbody = document.getElementById("crm-tbody");
  if (!tbody) return;
  const contacts = [
    ...MOCK_MEMBERS.map(m => ({ ...m, type: "VIP Member", lastVisit: "Jun 2026", notes: "" })),
    ...getLocalData("rs_reservations", []).map((r, i) => ({
      id: "C" + (200 + i),
      name: r.first_name ? `${r.first_name} ${r.last_name}` : r.name || "—",
      email: r.email || "—", phone: r.phone || "—",
      tier: "—", type: "Guest", lastVisit: r.date || "—", birthday: "—", notes: r.special_requests || ""
    }))
  ];

  tbody.innerHTML = contacts.map(c => `
  <tr>
    <td class="primary">${c.name}</td>
    <td>${c.email}</td>
    <td>${c.phone}</td>
    <td><span class="status-badge ${c.type === "VIP Member" ? "vip" : "draft"}">${c.type}</span></td>
    <td>${c.birthday || "—"}</td>
    <td>${c.lastVisit}</td>
    <td>
      <button class="btn btn-ghost btn-sm" onclick="adminToast('info','Note saved','Customer note updated.')">Note</button>
    </td>
  </tr>`).join("");
}

/* ─ SVG Icons ────────────────────────────────────────────────────── */
function svgCalendar() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; }
function svgStar()     { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; }
function svgTicket()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>`; }
function svgPhone() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.17 9.1a19.79 19.79 0 01-3-8.56A2 2 0 012.1 2.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.71a16 16 0 006.29 6.29l1.58-1.58a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`; }

/* ─ Shared Admin Nav HTML ────────────────────────────────────────── */
function adminNavHTML(activePage) {
  const pages = [
    ["dashboard.html", svgCalendar(), "Dashboard"],
    ["reservations.html", svgTicket(), "Reservations", "24"],
    ["events.html", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19V6l12-3v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`, "Events"],
    ["members.html", svgStar(), "VIP Members", "312"],
    ["crm.html", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`, "Customer CRM"],
    ["campaigns.html", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.17 9.1a19.79 19.79 0 01-3-8.56A2 2 0 012.1 2.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.71a16 16 0 006.29 6.29l1.58-1.58a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`, "Campaigns"],
    ["analytics.html", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, "Analytics"],
    ["menu.html", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2h1l3 9-2 1.5L3 11V2zM3 21v-4m9-15v18m5-8a3 3 0 003-3V2h-6v7a3 3 0 003 3z"/></svg>`, "Menu"],
    ["gallery.html", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, "Gallery"],
    ["staff.html", `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`, "Staff & Alerts"]
  ];

  return pages.map(([href, icon, label, count]) => `
  <li>
    <a href="${href}" class="${href === activePage ? "active" : ""}">
      ${icon}
      ${label}
      ${count ? `<span class="nav-count">${count}</span>` : ""}
    </a>
  </li>`).join("");
}

/* ─ Boot ─────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const page = location.pathname.split("/").pop();

  /* Login page */
  if (page === "index.html" || page === "") {
    const form = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");
    form?.addEventListener("submit", e => {
      e.preventDefault();
      const username = form.querySelector("[name=username]").value;
      const pass = form.querySelector("[name=password]").value;
      if (!login(username, pass)) {
        if (errEl) errEl.textContent = "Incorrect username or password. Please try again.";
        form.querySelector("[name=password]").value = "";
      }
    });
    return;
  }

  requireAuth();
  initSidebar();
  initModals();

  /* Logout buttons */
  document.querySelectorAll("[data-logout]").forEach(btn => {
    btn.addEventListener("click", logout);
  });

  /* Page-specific initializers */
  if (page === "dashboard.html") renderDashboard();
  if (page === "reservations.html") renderReservations();
  if (page === "members.html") renderMembers();
  if (page === "crm.html") renderCRM();

  initTableSearch(".admin-search input", "tbody tr");
});
