/* ═══════════════════════════════════════════════════════════════
   Rock Steady ATL — Admin Dashboard Logic  v2.0
   UmojaServ Hospitality Operating System
   ═══════════════════════════════════════════════════════════════

   ─── CONFIGURATION ─────────────────────────────────────────────
   Paste your deployed Google Apps Script Web App URL below.

   How to get the URL:
   1. Open script.google.com → your project
   2. Deploy → Manage Deployments → copy the Web App URL
   3. The URL ends with /exec

   SECURITY NOTE:
   This admin panel uses lightweight session-based auth (username +
   password stored in JS). This is intentional for the current phase.
   For future upgrade: replace with Firebase Auth, Auth0, or Clerk.
   Never expose this file publicly — keep admin behind a subdomain
   or server-side auth layer in production.
   ─────────────────────────────────────────────────────────────── */

const ADMIN_ENDPOINT = "https://script.google.com/macros/s/AKfycbxofZijObiK-qStyVawERCIK5yDPHpN5qgdpTw-4rK9JgJm72mrrVjTVSV8w-nOjPVL/exec";

/* ─────────────────────────────────────────────────────────────────
   IMAGE REGISTRY — Single source of truth for all site images.
   To add a new image: drop the file in the correct folder,
   then add one entry here. Every admin dropdown reads from this.
   ─────────────────────────────────────────────────────────────────
   Folders:
     assets/images/hero/      ← main hero slideshow
     assets/images/events/    ← event cover photos
     assets/images/menu/      ← food & drink photography
     assets/images/gallery/   ← venue & atmosphere shots
     assets/images/logo/      ← logo (unchanged)
   ───────────────────────────────────────────────────────────────── */
const IMAGE_REGISTRY = {
  hero: [
    { label: "Main Hero",           file: "hero/hero-image.webp" }
  ],
  events: [
    { label: "Afrobeats Night",     file: "events/afrobeats-night.webp" },
    { label: "Amapiano Friday",     file: "events/amapiano-friday.webp" },
    { label: "Hip-Hop Saturday",    file: "events/hiphop-saturday.webp" },
    { label: "Riddim Sundays",      file: "events/riddim-sundays.webp" },
    { label: "Ladies Night",        file: "events/ladies-night.webp" }
  ],
  menu: [
    { label: "Red Snapper",         file: "menu/red-snapper.webp" },
    { label: "Rock Steady Oxtail",  file: "menu/rock-steady-oxtail.webp" },
    { label: "Jerk Pork Ribs",      file: "menu/jerk-pork-ribs.webp" },
    { label: "Jerk Chicken Wings",  file: "menu/jerk-chicken-wings.webp" },
    { label: "Oxtail Spring Rolls", file: "menu/oxtail-spring-rolls.webp" },
    { label: "Coconut Curry Shrimp",file: "menu/coconut-curry-shrimp.webp" },
    { label: "Sweet Plantains",     file: "menu/sweet-plantains.webp" },
    { label: "Signature Cocktail",  file: "menu/signature-cocktail.webp" }
  ],
  gallery: [
    { label: "Venue Entrance",      file: "gallery/venue-entrance.webp" },
    { label: "Interior Lounge",     file: "gallery/interior-lounge.webp" },
    { label: "ATL Nights",          file: "gallery/atl-nights.webp" },
    { label: "Music Culture",       file: "gallery/music-culture.webp" },
    { label: "Contact Hero",        file: "gallery/contact-hero.webp" },
    { label: "Dining Experience",   file: "gallery/dining-experience.webp" },
    { label: "Bar Scene",           file: "gallery/bar-scene.webp" },
    { label: "DJ Night",            file: "gallery/dj-night.webp" },
    { label: "VIP Lounge",          file: "gallery/vip-lounge.webp" },
    { label: "Gallery Hero",        file: "gallery/gallery-hero.webp" },
    { label: "Crowd Energy",        file: "gallery/crowd-energy.webp" },
    { label: "Late Night Scene",    file: "gallery/late-night-scene.webp" }
  ]
};

/* ─────────────────────────────────────────────────────────────────
   AUTO IMAGE DISCOVERY — reads folders live from GitHub API.
   Falls back to IMAGE_REGISTRY when running locally (localhost).
   Cache persists for the session so the API is only hit once
   per folder per page load.
   ───────────────────────────────────────────────────────────────── */
const _imgCache = {};

async function fetchFolderImages(folder) {
  if (_imgCache[folder]) return _imgCache[folder];

  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/assets/images/${folder}?ref=${GITHUB_BRANCH}`;
  try {
    const res = await fetch(apiUrl, {
      headers: { "Accept": "application/vnd.github.v3+json" }
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const files = await res.json();
    const images = files
      .filter(f => f.type === "file" && /\.(webp|jpg|jpeg|png)$/i.test(f.name))
      .map(f => ({
        label: f.name
          .replace(/\.[^.]+$/, "")          // strip extension
          .replace(/-/g, " ")                // hyphens → spaces
          .replace(/\b\w/g, c => c.toUpperCase()), // Title Case
        file: `${folder}/${f.name}`
      }));
    _imgCache[folder] = images;
    return images;
  } catch (err) {
    console.warn(`RS Admin: GitHub API failed for ${folder} → using local registry`, err.message);
    return IMAGE_REGISTRY[folder] || [];
  }
}

/* Populate a <select> element with images from one or more folders.
   Groups each folder as an <optgroup>. Restores the current value
   after repopulation (useful when editing an existing event). */
async function populateImageSelect(selectId, folders) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const saved = select.value; // remember current value for edit mode
  select.innerHTML = `<option value="">⟳ Loading images…</option>`;

  try {
    const groups = await Promise.all(
      folders.map(async folder => ({
        folder,
        images: await fetchFolderImages(folder)
      }))
    );

    select.innerHTML = `<option value="">— Select image —</option>`;

    groups.forEach(({ folder, images }) => {
      if (!images.length) return;
      const grp = document.createElement("optgroup");
      grp.label = folder.charAt(0).toUpperCase() + folder.slice(1);
      images.forEach(img => {
        const opt = document.createElement("option");
        opt.value = img.file;
        opt.textContent = img.label;
        grp.appendChild(opt);
      });
      select.appendChild(grp);
    });

    // Restore value (edit mode) or leave at default
    if (saved) select.value = saved;

  } catch (err) {
    console.warn("RS Admin: populateImageSelect error", err);
    select.innerHTML = `<option value="">— Could not load images —</option>`;
  }
}

/* ─────────────────────────────────────────────────────────────────
   GITHUB REPO — used to auto-read image folders via GitHub API.
   Any file pushed to assets/images/{folder}/ appears in dropdowns
   automatically. No manual registry update needed.
   ─────────────────────────────────────────────────────────────────
   Update GITHUB_REPO if the repo is renamed or moved.
   ───────────────────────────────────────────────────────────────── */
const GITHUB_REPO   = "mrafrica12/rocksteadytemp";
const GITHUB_BRANCH = "main";

const ADMIN_USER = "root";
const ADMIN_PASS = "UmojaServ2026!";
const ADMIN_KEY  = "rs_admin_auth";

/* ─ Module State ────────────────────────────────────────────────── */
let _liveBookings  = [];
let _lastSynced    = null;
let _filterStatus  = "all";
let _searchQuery   = "";

/* ═══════════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   NETWORK — Live data fetching from Google Apps Script
   ═══════════════════════════════════════════════════════════════ */
async function fetchLive(action) {
  if (!ADMIN_ENDPOINT) throw new Error("ADMIN_ENDPOINT not configured — paste your Apps Script Web App URL.");
  const url = `${ADMIN_ENDPOINT}?action=${action}&_=${Date.now()}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status === "error") throw new Error(data.message || "Apps Script returned an error");
  return data;
}

async function postToSheet(payload) {
  if (!ADMIN_ENDPOINT) throw new Error("ADMIN_ENDPOINT not configured.");
  const res = await fetch(ADMIN_ENDPOINT, {
    method:  "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body:    JSON.stringify(payload),
    redirect: "follow"
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/* ═══════════════════════════════════════════════════════════════
   CONNECTION STATUS
   ═══════════════════════════════════════════════════════════════ */
function setConnectionStatus(state, extra) {
  const el = document.getElementById("connection-status");
  if (!el) return;

  const cfg = {
    loading:   { cls: "cs-loading",   dot: "⟳", label: "Connecting to Google Sheets…" },
    connected: { cls: "cs-connected", dot: "●", label: "Connected to Google Sheets" },
    error:     { cls: "cs-error",     dot: "●", label: "Sync failed — check Apps Script deployment" },
    empty:     { cls: "cs-empty",     dot: "○", label: "Connected — no submissions yet" }
  };
  const s = cfg[state] || cfg.connected;
  el.className = `admin-live-indicator ${s.cls}`;
  el.innerHTML = `<span class="cs-dot">${s.dot}</span>${s.label}${extra ? ` <span class="cs-extra">${extra}</span>` : ""}`;
}

function setLastSynced() {
  _lastSynced = new Date();
  const el = document.getElementById("last-synced");
  if (el) {
    el.textContent = `Last synced: ${_lastSynced.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }
}

/* ═══════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════ */
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
    t.style.opacity    = "0";
    t.style.transform  = "translateX(100%)";
    setTimeout(() => t.remove(), 400);
  }, 4500);
}

/* ═══════════════════════════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════ */
function initSidebar() {
  const page = location.pathname.split("/").pop();
  document.querySelectorAll(".sidebar-nav a").forEach(a => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  const burger  = document.querySelector(".admin-topbar-hamburger");
  const sidebar = document.querySelector(".admin-sidebar");
  burger?.addEventListener("click", () => sidebar?.classList.toggle("mobile-open"));
}

function updateSidebarBadges(data) {
  const resEl   = document.querySelector('.sidebar-nav a[href="reservations.html"] .nav-count');
  const vipEl   = document.querySelector('.sidebar-nav a[href="members.html"] .nav-count');
  const notifEl = document.querySelector(".notif-badge");

  if (resEl)   resEl.textContent   = data.totalSubmissions || 0;
  if (vipEl)   vipEl.textContent   = data.vipRequests || 0;
  if (notifEl) {
    const alerts = (data.newRequests || 0) + (data.pendingFollowUps || 0);
    notifEl.textContent   = alerts;
    notifEl.style.display = alerts > 0 ? "" : "none";
  }
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — Live data
   ═══════════════════════════════════════════════════════════════ */
async function loadDashboard() {
  setConnectionStatus("loading");
  try {
    const data = await fetchLive("dashboard");
    const hasData = (data.totalSubmissions || 0) > 0;
    setConnectionStatus(hasData ? "connected" : "empty");
    setLastSynced();
    renderDashboardLive(data);
    renderAlertCards(data);
    updateSidebarBadges(data);
  } catch (err) {
    console.warn("RS Admin: dashboard fetch failed →", err.message);
    setConnectionStatus("error");
    renderDashboardFallback();
  }
}

function renderDashboardLive(data) {
  /* KPI Grid */
  const kpiGrid = document.getElementById("kpi-grid");
  if (kpiGrid) {
    const kpis = [
      { label: "New Requests",      value: data.newRequests || 0,      trend: "Needs action",   dir: "warn",   icon: svgTicket() },
      { label: "Today's Bookings",  value: data.todaySubmissions || 0,  trend: "Today",          dir: "up",     icon: svgCalendar() },
      { label: "Confirmed",         value: data.confirmed || 0,         trend: "This period",    dir: "up",     icon: svgStar() },
      { label: "Pending Follow-Up", value: data.pendingFollowUps || 0,  trend: "Needs action",   dir: (data.pendingFollowUps || 0) > 0 ? "warn" : "up", icon: svgPhone() }
    ];
    kpiGrid.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-header"><span class="kpi-label">${k.label}</span><div class="kpi-icon">${k.icon}</div></div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-trend ${k.dir}">${k.trend}</div>
    </div>`).join("");
  }

  /* Live Activity Feed */
  const feed = document.getElementById("activity-feed");
  if (feed) {
    if (data.recentBookings && data.recentBookings.length) {
      feed.innerHTML = data.recentBookings.map(b => {
        const dotCls  = { New: "gold", Confirmed: "green", Cancelled: "red" }[b.status] || "blue";
        const timeAgo = b.timestamp ? relativeTime(new Date(b.timestamp)) : "—";
        const type    = capitalize(b.formType || "submission");
        return `
        <div class="activity-item">
          <div class="activity-dot ${dotCls}"></div>
          <div class="activity-body">
            <div class="activity-title">${type} — <strong>${b.guestName || "Guest"}</strong>
              <span class="activity-id">[${b.bookingId}]</span>
            </div>
            <div class="activity-time">${timeAgo} · ${b.status || "New"}</div>
          </div>
        </div>`;
      }).join("");
    } else {
      feed.innerHTML = `<div class="activity-empty">No submissions yet. Bookings will appear here in real time.</div>`;
    }
  }

  /* Weekly mini-chart */
  const mini = document.getElementById("mini-week-chart");
  if (mini && data.weeklyReservations) {
    const max = Math.max(...data.weeklyReservations, 1);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    mini.innerHTML = `<div class="mini-chart">${data.weeklyReservations.map((v, i) => `
      <div class="mini-bar${i === 4 || i === 5 ? " active" : ""}"
           style="height:${Math.max((v / max * 100), 4).toFixed(0)}%"
           title="${v} on ${days[i]}"></div>`).join("")}
    </div>`;
  }

  /* Week summary text */
  const weekSummary = document.getElementById("week-summary");
  if (weekSummary) {
    const total7 = (data.weeklyReservations || []).reduce((a, b) => a + b, 0);
    weekSummary.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span>This week</span><span style="color:var(--ink);font-weight:600;">${total7} submissions</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>All time</span><span style="color:var(--soft);">${data.totalSubmissions || 0} total</span>
      </div>`;
  }

  /* Source breakdown */
  const legend = document.getElementById("traffic-legend");
  if (legend) {
    const colors  = ["#c8962a", "#e1306c", "#60a5fa", "#4ade90", "#a78bfa", "#f87171"];
    const entries = Object.entries(data.sourceBreakdown || {});
    const total   = entries.reduce((s, [, v]) => s + v, 0) || 1;
    if (entries.length === 0) {
      legend.innerHTML = `<div style="color:var(--muted);font-size:.83rem;">No source data yet.</div>`;
    } else {
      legend.innerHTML = entries.map(([src, count], i) => {
        const pct = ((count / total) * 100).toFixed(0);
        const label = src.replace(".html", "").replace(/\//g, " ").trim() || "direct";
        return `
        <div class="donut-legend-item">
          <div class="donut-legend-dot" style="background:${colors[i % colors.length]}"></div>
          <span>${capitalize(label)} — <strong style="color:var(--ink)">${pct}%</strong></span>
        </div>`;
      }).join("");
    }
  }
}

function renderAlertCards(data) {
  const container = document.getElementById("alert-cards");
  if (!container) return;

  const alerts = [];
  if ((data.newRequests || 0) > 0)
    alerts.push({ cls: "gold",  icon: "🆕", label: "New Requests",      val: data.newRequests,       href: "reservations.html?filter=New" });
  if ((data.pendingFollowUps || 0) > 0)
    alerts.push({ cls: "blue",  icon: "📞", label: "Follow-Up Needed",  val: data.pendingFollowUps,  href: "reservations.html?filter=followup" });
  if ((data.vipRequests || 0) > 0)
    alerts.push({ cls: "vip",   icon: "👑", label: "VIP / Bottle Svc",  val: data.vipRequests,       href: "reservations.html?filter=vip" });
  if ((data.birthdayRequests || 0) > 0)
    alerts.push({ cls: "green", icon: "🎂", label: "Birthday Packages", val: data.birthdayRequests,  href: "reservations.html?filter=birthday" });
  if ((data.depositPending || 0) > 0)
    alerts.push({ cls: "warn",  icon: "💳", label: "Deposits Pending",  val: data.depositPending,    href: "reservations.html?filter=Deposit+Pending" });
  if ((data.confirmed || 0) > 0)
    alerts.push({ cls: "",      icon: "✅", label: "Confirmed",         val: data.confirmed,         href: "reservations.html?filter=Confirmed" });

  if (!alerts.length) { container.style.display = "none"; return; }
  container.style.display = "grid";
  container.innerHTML = alerts.map(a => `
  <a href="${a.href}" class="alert-card alert-card-${a.cls}">
    <div class="alert-card-icon">${a.icon}</div>
    <div class="alert-card-val">${a.val}</div>
    <div class="alert-card-label">${a.label}</div>
  </a>`).join("");
}

function renderDashboardFallback() {
  const kpiGrid = document.getElementById("kpi-grid");
  if (kpiGrid) {
    kpiGrid.innerHTML = ["New Requests", "Today's Bookings", "Confirmed", "Pending Follow-Up"].map(label => `
    <div class="kpi-card">
      <div class="kpi-header"><span class="kpi-label">${label}</span></div>
      <div class="kpi-value" style="color:var(--soft);">—</div>
      <div class="kpi-trend">Waiting for connection</div>
    </div>`).join("");
  }
  const feed = document.getElementById("activity-feed");
  if (feed) feed.innerHTML = `<div class="activity-empty" style="color:#f87171;">Could not reach Google Sheets. Check your Apps Script deployment URL and try refreshing.</div>`;
}

/* ═══════════════════════════════════════════════════════════════
   RESERVATIONS — Live data
   ═══════════════════════════════════════════════════════════════ */
async function loadReservations() {
  const tbody = document.getElementById("reservations-tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="13" class="table-loading">Loading bookings from Google Sheets…</td></tr>`;

  try {
    const data   = await fetchLive("bookings");
    _liveBookings = data.rows || [];
    setLastSynced();
    applyFiltersAndRender();
    updateReservationKPIs(_liveBookings);
  } catch (err) {
    console.warn("RS Admin: bookings fetch failed →", err.message);
    _liveBookings = [];
    tbody.innerHTML = `<tr><td colspan="13" class="table-empty">Could not load bookings. Check your Apps Script deployment.</td></tr>`;
  }
}

function applyFiltersAndRender() {
  const tbody   = document.getElementById("reservations-tbody");
  const countEl = document.getElementById("reservation-count");
  if (!tbody) return;

  let filtered = [..._liveBookings];

  /* Status / type filter */
  if (_filterStatus && _filterStatus !== "all") {
    switch (_filterStatus) {
      case "followup":
        filtered = filtered.filter(r =>
          (r["Follow-Up Required"] || "").toLowerCase() === "yes" &&
          !["Confirmed","Completed","Cancelled","No Show","Deposit Paid"].includes(r["Status"])
        );
        break;
      case "vip":
        filtered = filtered.filter(r => (r["Form Type"] || "").toLowerCase() === "vip");
        break;
      case "birthday":
        filtered = filtered.filter(r =>
          (r["Event Name"] || "").toLowerCase().includes("birthday") ||
          (r["Special Requests"] || "").toLowerCase().includes("birthday")
        );
        break;
      default:
        filtered = filtered.filter(r =>
          (r["Status"] || "").toLowerCase() === _filterStatus.toLowerCase()
        );
    }
  }

  /* Search */
  if (_searchQuery) {
    const q = _searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      (r["Guest Name"]   || "").toLowerCase().includes(q) ||
      (r["Phone"]        || "").includes(q)               ||
      (r["Email"]        || "").toLowerCase().includes(q) ||
      (r["Event Name"]   || "").toLowerCase().includes(q) ||
      (r["Booking ID"]   || "").toLowerCase().includes(q)
    );
  }

  if (countEl) countEl.textContent = `${filtered.length} booking${filtered.length !== 1 ? "s" : ""}`;

  if (!filtered.length) {
    const msg = _liveBookings.length === 0
      ? "No bookings received yet. Submit a test booking from the public site."
      : "No bookings match this filter.";
    tbody.innerHTML = `<tr><td colspan="13" class="table-empty">${msg}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(renderBookingRow).join("");
}

function renderBookingRow(r) {
  const status   = r["Status"] || "New";
  const priority = r["Priority"] || "Normal";
  const deposit  = r["Deposit Status"] || "Not Required";
  const bId      = r["Booking ID"] || "—";

  let dateStr = "—";
  if (r["Date"]) {
    try { dateStr = new Date(r["Date"]).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    catch(e) { dateStr = r["Date"]; }
  }

  const depositCls = { "Paid": "confirmed", "Pending": "warn", "Refunded": "draft" }[deposit] || "draft";
  const priorCls   = (priority === "Urgent" || priority === "High") ? "vip" : "draft";

  return `
  <tr data-booking-id="${escHtml(bId)}">
    <td class="primary mono">${escHtml(bId)}</td>
    <td class="primary">${escHtml(r["Guest Name"] || "—")}</td>
    <td>${escHtml(r["Phone"] || "—")}</td>
    <td class="td-email">${escHtml(r["Email"] || "—")}</td>
    <td>${dateStr}</td>
    <td>${escHtml(r["Time"] || "—")}</td>
    <td style="text-align:center;">${escHtml(r["Party Size"] || "—")}</td>
    <td>${escHtml(r["Table Type"] || "—")}</td>
    <td>${escHtml(r["Event Name"] || "—")}</td>
    <td><span class="status-badge ${statusClass(status)}">${status}</span></td>
    <td><span class="status-badge ${priorCls}" style="font-size:.64rem;">${priority}</span></td>
    <td><span class="status-badge ${depositCls}" style="font-size:.64rem;">${deposit}</span></td>
    <td>
      <div class="row-actions">
        ${buildActionButtons(bId, status)}
        <button class="btn btn-ghost btn-sm row-action-more" onclick="openBookingDetail('${escHtml(bId)}')">⋯</button>
      </div>
    </td>
  </tr>`;
}

function buildActionButtons(bId, status) {
  const next = {
    "New":             [["Contacted",     "btn-action-blue",  "Contacted"],   ["Confirm",  "btn-action-gold", "Confirmed"]],
    "Contacted":       [["Confirm",       "btn-action-gold",  "Confirmed"],   ["Dep. Pend","btn-action-warn", "Deposit Pending"]],
    "Confirmed":       [["Dep. Pend",     "btn-action-warn",  "Deposit Pending"], ["Complete","btn-action-green","Completed"]],
    "Deposit Pending": [["Dep. Paid",     "btn-action-green", "Deposit Paid"],["Cancel",   "btn-action-red",  "Cancelled"]],
    "Deposit Paid":    [["Complete",      "btn-action-green", "Completed"]],
    "Completed":       [],
    "Cancelled":       [],
    "No Show":         []
  };
  return (next[status] || []).map(([label, cls, newSt]) =>
    `<button class="btn btn-ghost btn-sm ${cls}" onclick="updateStatus('${escHtml(bId)}','${newSt}')">${label}</button>`
  ).join("");
}

function updateReservationKPIs(bookings) {
  const ids = {
    "kpi-total":     bookings.length,
    "kpi-new":       bookings.filter(r => r["Status"] === "New").length,
    "kpi-confirmed": bookings.filter(r => r["Status"] === "Confirmed").length,
    "kpi-vip":       bookings.filter(r => (r["Form Type"] || "") === "vip" || (r["Table Type"] || "").toLowerCase().includes("vip")).length
  };
  Object.entries(ids).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* ─ Status Update ───────────────────────────────────────────────── */
async function updateStatus(bookingId, newStatus, internalNotes) {
  try {
    adminToast("info", "Updating…", `${bookingId} → ${newStatus}`);
    const result = await postToSheet({ action: "updateStatus", bookingId, status: newStatus, internalNotes: internalNotes || "", staffBy: ADMIN_USER });
    if (result.status === "error") throw new Error(result.message);

    const idx = _liveBookings.findIndex(r => r["Booking ID"] === bookingId);
    if (idx > -1) {
      _liveBookings[idx]["Status"]       = newStatus;
      _liveBookings[idx]["Last Updated"] = new Date().toISOString();
      if (internalNotes) _liveBookings[idx]["Internal Notes"] = internalNotes;
    }
    applyFiltersAndRender();
    updateReservationKPIs(_liveBookings);
    adminToast("success", "Status updated", `${bookingId} is now ${newStatus}`);
  } catch (err) {
    console.error("RS Admin: updateStatus failed →", err.message);
    adminToast("error", "Update failed", "Check your Apps Script deployment and try again.");
  }
}

/* ─ Booking Detail Modal ─────────────────────────────────────────── */
function openBookingDetail(bookingId) {
  const booking = _liveBookings.find(r => r["Booking ID"] === bookingId);
  if (!booking) return;

  const body = document.getElementById("booking-detail-body");
  const title= document.getElementById("booking-detail-title");
  if (!body) return;

  if (title) title.textContent = `${booking["Guest Name"] || "Guest"} · ${bookingId}`;

  const fields = [
    ["Booking ID",     booking["Booking ID"]],
    ["Form Type",      booking["Form Type"]],
    ["Guest Name",     booking["Guest Name"]],
    ["Phone",          booking["Phone"]],
    ["Email",          booking["Email"]],
    ["Date",           booking["Date"]],
    ["Time",           booking["Time"]],
    ["Party Size",     booking["Party Size"]],
    ["Table Type",     booking["Table Type"]],
    ["Event Name",     booking["Event Name"]],
    ["Special Requests", booking["Special Requests"]],
    ["Status",         booking["Status"]],
    ["Priority",       booking["Priority"]],
    ["Follow-Up",      booking["Follow-Up Required"]],
    ["Deposit Status", booking["Deposit Status"]],
    ["Assigned Staff", booking["Assigned Staff"]],
    ["Source Page",    booking["Source Page"]],
    ["Submitted",      booking["Timestamp"] ? new Date(booking["Timestamp"]).toLocaleString() : "—"]
  ];

  body.innerHTML = `
    <div class="detail-grid">
      ${fields.map(([label, val]) => `
      <div class="detail-field">
        <div class="detail-label">${label}</div>
        <div class="detail-value">${escHtml(val || "—")}</div>
      </div>`).join("")}
    </div>
    <div class="form-group" style="margin-top:20px;">
      <label class="form-label">Internal Notes</label>
      <textarea id="detail-notes" class="form-textarea" rows="3" placeholder="Add internal notes…">${escHtml(booking["Internal Notes"] || "")}</textarea>
    </div>
    <div class="form-group" style="margin-top:12px;">
      <label class="form-label" style="margin-bottom:8px;">Quick Status Update</label>
      <div class="detail-status-grid">
        ${["New","Contacted","Confirmed","Deposit Pending","Deposit Paid","Completed","Cancelled","No Show"].map(s => `
        <button class="btn btn-ghost btn-sm detail-status-btn${booking["Status"] === s ? " detail-status-active" : ""}"
                onclick="updateStatusFromDetail('${escHtml(bookingId)}','${s}')">${s}</button>`).join("")}
      </div>
    </div>`;

  openModal("booking-detail-modal");
}

async function updateStatusFromDetail(bookingId, newStatus) {
  const notes = document.getElementById("detail-notes")?.value || "";
  closeModal("booking-detail-modal");
  await updateStatus(bookingId, newStatus, notes);
}

/* ─ Filter Tabs ──────────────────────────────────────────────────── */
function initFilterTabs() {
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      _filterStatus = tab.dataset.filter || "all";
      applyFiltersAndRender();
    });
  });

  /* Pre-select filter from URL param */
  const urlFilter = new URLSearchParams(location.search).get("filter");
  if (urlFilter) {
    _filterStatus = urlFilter;
    document.querySelectorAll(".filter-tab").forEach(t => {
      if (t.dataset.filter === urlFilter) t.classList.add("active");
      else t.classList.remove("active");
    });
  }
}

function initReservationSearch() {
  const input = document.querySelector(".reservations-search input");
  if (!input) return;
  input.addEventListener("input", () => {
    _searchQuery = input.value.trim();
    applyFiltersAndRender();
  });
}

/* ═══════════════════════════════════════════════════════════════
   CRM — Live data, grouped by phone/email
   ═══════════════════════════════════════════════════════════════ */
async function loadCRM() {
  const tbody = document.getElementById("crm-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" class="table-loading">Loading customer data…</td></tr>`;

  try {
    const data = await fetchLive("bookings");
    setLastSynced();
    renderCRMLive(data.rows || []);
    initTableSearch(".admin-search input", "tbody tr");
  } catch (err) {
    console.warn("RS Admin: CRM fetch failed →", err.message);
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty">Could not load data. Check your Apps Script deployment.</td></tr>`;
  }
}

function renderCRMLive(rows) {
  const tbody = document.getElementById("crm-tbody");
  if (!tbody) return;

  /* Group by phone (fallback email → name) */
  const map = {};
  rows.forEach(r => {
    const key = r["Phone"] || r["Email"] || r["Guest Name"] || "unknown";
    if (!map[key]) {
      map[key] = {
        name:     r["Guest Name"] || "—",
        email:    r["Email"]  || "—",
        phone:    r["Phone"]  || "—",
        bookings: 0,
        lastDate: null,
        lastStatus:"—",
        type:     "Guest",
        birthday: false,
        privateEvt: false,
        notes:    ""
      };
    }
    const c = map[key];
    c.bookings++;

    const ts = r["Timestamp"] ? new Date(r["Timestamp"]) : null;
    if (ts && (!c.lastDate || ts > c.lastDate)) {
      c.lastDate   = ts;
      c.lastStatus = r["Status"] || "—";
      c.notes      = r["Internal Notes"] || r["Special Requests"] || c.notes;
    }

    if ((r["Form Type"] || "") === "vip") c.type = "VIP Lead";
    const combined = ((r["Event Name"] || "") + " " + (r["Special Requests"] || "")).toLowerCase();
    if (combined.includes("birthday"))      c.birthday   = true;
    if (combined.includes("private"))       c.privateEvt = true;
  });

  const customers = Object.values(map).sort((a, b) => b.bookings - a.bookings);

  /* Update CRM KPIs */
  const setCrmKPI = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setCrmKPI("crm-kpi-total",   customers.length);
  setCrmKPI("crm-kpi-repeat",  customers.filter(c => c.bookings > 1).length);
  setCrmKPI("crm-kpi-birthday",customers.filter(c => c.birthday).length);
  setCrmKPI("crm-kpi-vip",     customers.filter(c => c.type === "VIP Lead").length);

  if (!customers.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty">No contacts yet. They appear as bookings come in.</td></tr>`;
    return;
  }

  tbody.innerHTML = customers.map(c => {
    const lastStr = c.lastDate
      ? c.lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—";
    const flags   = `${c.birthday ? " 🎂" : ""}${c.privateEvt ? " 🔒" : ""}`;
    const typeCls = c.type === "VIP Lead" ? "vip" : "draft";
    return `
    <tr>
      <td class="primary">${escHtml(c.name)}${flags}</td>
      <td>${escHtml(c.email)}</td>
      <td>${escHtml(c.phone)}</td>
      <td style="text-align:center;font-weight:700;color:var(--gold);">${c.bookings}</td>
      <td>${lastStr}</td>
      <td><span class="status-badge ${statusClass(c.lastStatus)}" style="font-size:.65rem;">${c.lastStatus}</span></td>
      <td><span class="status-badge ${typeCls}">${c.type}</span></td>
      <td class="td-notes" title="${escHtml(c.notes)}">${escHtml(c.notes) || "—"}</td>
    </tr>`;
  }).join("");
}

/* ═══════════════════════════════════════════════════════════════
   EVENTS — Live data from Events sheet
   ═══════════════════════════════════════════════════════════════ */
let _liveEvents = [];

async function loadEvents() {
  const tbody = document.getElementById("events-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" class="table-loading">Loading events from Google Sheets…</td></tr>`;

  try {
    const data = await fetchLive("events");
    _liveEvents = data.events || [];
    setLastSynced();
    renderEventsTable(_liveEvents);
    updateEventsKPIs(_liveEvents);
    initTableSearch(".admin-search input", "#events-tbody tr");
  } catch (err) {
    console.warn("RS Admin: events fetch failed →", err.message);
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Could not load events. Check your Apps Script deployment.</td></tr>`;
  }
}

function renderEventsTable(events) {
  const tbody = document.getElementById("events-tbody");
  if (!tbody) return;

  if (!events.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No events yet. Click <strong>+ Create Event</strong> to add your first event.</td></tr>`;
    return;
  }

  tbody.innerHTML = events.map(ev => {
    const status    = ev["Status"] || "Draft";
    const statusCls = status === "Published" ? "confirmed" : status === "Cancelled" ? "cancelled" : "draft";
    const evId      = ev["Event ID"] || "";

    let dateStr = "—";
    if (ev["Date"]) {
      try { dateStr = new Date(ev["Date"]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
      catch(e) { dateStr = ev["Date"]; }
    }

    return `
    <tr data-event-id="${escHtml(evId)}">
      <td class="primary">${escHtml(ev["Event Name"] || "—")}</td>
      <td>${dateStr}</td>
      <td>${escHtml(ev["Time"] || "—")}</td>
      <td>${escHtml(ev["DJ"] || "—")}</td>
      <td style="text-align:center;">${escHtml(ev["Capacity"] || "—")}</td>
      <td>${escHtml(ev["Price"] || "—")}</td>
      <td><span class="status-badge draft" style="font-size:.64rem;">${escHtml(ev["Tag"] || "Weekly")}</span></td>
      <td><span class="status-badge ${statusCls}">${status}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditEvent('${escHtml(evId)}')">Edit</button>
          ${status !== "Published"
            ? `<button class="btn btn-ghost btn-sm btn-action-green" onclick="quickPublishEvent('${escHtml(evId)}')">Publish</button>`
            : `<button class="btn btn-ghost btn-sm btn-action-warn" onclick="quickUnpublishEvent('${escHtml(evId)}')">Unpublish</button>`
          }
          <button class="btn btn-ghost btn-sm btn-action-red" onclick="confirmDeleteEvent('${escHtml(evId)}','${escHtml(ev["Event Name"] || "")}')">✕</button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

function updateEventsKPIs(events) {
  const setK = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setK("ev-kpi-total",     events.length);
  setK("ev-kpi-published", events.filter(e => e["Status"] === "Published").length);
  setK("ev-kpi-draft",     events.filter(e => e["Status"] === "Draft").length);

  const now = new Date();
  const upcoming = events.filter(e => {
    if (!e["Date"]) return false;
    try { return new Date(e["Date"]) >= now && e["Status"] === "Published"; }
    catch(e) { return false; }
  }).length;
  setK("ev-kpi-upcoming", upcoming);
}

/* ─ Create / Edit Event Form ─────────────────────────────────────── */
function openEditEvent(eventId) {
  const ev = _liveEvents.find(e => e["Event ID"] === eventId);
  if (!ev) return;

  /* Populate image dropdown first so the saved value can be restored */
  await populateImageSelect("evt-image", ["events", "gallery", "hero"]);

  /* Populate modal fields */
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  set("evt-id",          ev["Event ID"]);
  set("evt-title",       ev["Event Name"]);
  set("evt-date",        ev["Date"] ? ev["Date"].split("T")[0] : "");
  set("evt-time",        ev["Time"]);
  set("evt-dj",          ev["DJ"]);
  set("evt-capacity",    ev["Capacity"]);
  set("evt-tag",         ev["Tag"]);
  set("evt-price",       ev["Price"]);
  set("evt-description", ev["Description"]);
  set("evt-genre",       ev["Genre"]);
  set("evt-image",       ev["Image"]);

  const rsvpEl = document.getElementById("evt-rsvp");
  if (rsvpEl) rsvpEl.checked = ev["RSVP"] !== "No";
  const vipEl = document.getElementById("evt-vip");
  if (vipEl) vipEl.checked = ev["VIP Table"] !== "No";

  const title = document.getElementById("event-modal-title");
  if (title) title.textContent = "Edit Event";

  openModal("add-event-modal");
}

function resetEventForm() {
  const ids = ["evt-id","evt-title","evt-date","evt-time","evt-dj","evt-capacity","evt-tag","evt-price","evt-description","evt-genre"];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  const rsvpEl = document.getElementById("evt-rsvp"); if (rsvpEl) rsvpEl.checked = true;
  const vipEl  = document.getElementById("evt-vip");  if (vipEl)  vipEl.checked  = true;
  const title  = document.getElementById("event-modal-title"); if (title) title.textContent = "Create New Event";
  // Reload image dropdown so newly uploaded files appear
  populateImageSelect("evt-image", ["events", "gallery", "hero"]);
}

async function submitEventForm(status) {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };

  const eventName = get("evt-title");
  const date      = get("evt-date");
  const time      = get("evt-time");

  if (!eventName) { adminToast("error", "Event title required", "Please enter an event name."); return; }
  if (!date)      { adminToast("error", "Date required", "Please select an event date."); return; }
  if (!time)      { adminToast("error", "Time required", "Please enter the event time."); return; }

  const rsvpEl = document.getElementById("evt-rsvp");
  const vipEl  = document.getElementById("evt-vip");
  const eventId = get("evt-id"); // empty = new event

  const payload = {
    action:      "saveEvent",
    eventId:     eventId || "",
    eventName,
    date,
    time,
    dj:          get("evt-dj"),
    capacity:    get("evt-capacity"),
    tag:         get("evt-tag") || "Weekly",
    price:       get("evt-price"),
    description: get("evt-description"),
    genre:       get("evt-genre"),
    image:       get("evt-image"),
    rsvp:        (rsvpEl && rsvpEl.checked) ? "Yes" : "No",
    vipTable:    (vipEl  && vipEl.checked)  ? "Yes" : "No",
    status,
    staffBy: ADMIN_USER
  };

  /* Disable buttons during save */
  document.querySelectorAll("#add-event-modal .btn").forEach(b => b.disabled = true);

  try {
    const result = await postToSheet(payload);
    if (result.status === "error") throw new Error(result.message);

    closeModal("add-event-modal");
    resetEventForm();
    adminToast("success",
      status === "Published" ? "Event Published!" : "Event Saved",
      status === "Published" ? `${eventName} is now live.` : `${eventName} saved as draft.`
    );
    await loadEvents(); // Refresh the table
  } catch (err) {
    console.error("RS Admin: saveEvent failed →", err.message);
    adminToast("error", "Save failed", "Check your Apps Script deployment and try again.");
  } finally {
    document.querySelectorAll("#add-event-modal .btn").forEach(b => b.disabled = false);
  }
}

async function quickPublishEvent(eventId) {
  const ev = _liveEvents.find(e => e["Event ID"] === eventId);
  if (!ev) return;
  try {
    const result = await postToSheet({ action: "saveEvent", eventId, eventName: ev["Event Name"], date: ev["Date"], time: ev["Time"], status: "Published", staffBy: ADMIN_USER });
    if (result.status === "error") throw new Error(result.message);
    adminToast("success", "Published", `${ev["Event Name"]} is now live.`);
    await loadEvents();
  } catch (err) {
    adminToast("error", "Failed", err.message);
  }
}

async function quickUnpublishEvent(eventId) {
  const ev = _liveEvents.find(e => e["Event ID"] === eventId);
  if (!ev) return;
  try {
    const result = await postToSheet({ action: "saveEvent", eventId, eventName: ev["Event Name"], date: ev["Date"], time: ev["Time"], status: "Draft", staffBy: ADMIN_USER });
    if (result.status === "error") throw new Error(result.message);
    adminToast("info", "Unpublished", `${ev["Event Name"]} set back to draft.`);
    await loadEvents();
  } catch (err) {
    adminToast("error", "Failed", err.message);
  }
}

async function confirmDeleteEvent(eventId, eventName) {
  if (!confirm(`Delete "${eventName}"?\n\nThis will remove it from the Events sheet permanently.`)) return;
  try {
    const result = await postToSheet({ action: "deleteEvent", eventId, staffBy: ADMIN_USER });
    if (result.status === "error") throw new Error(result.message);
    adminToast("success", "Deleted", `${eventName} removed.`);
    await loadEvents();
  } catch (err) {
    adminToast("error", "Delete failed", err.message);
  }
}

/* ═══════════════════════════════════════════════════════════════
   STAFF & ALERTS — Live data from staff + activity + dashboard
   ═══════════════════════════════════════════════════════════════ */
async function loadStaff() {
  try {
    /* Fetch all three endpoints in parallel */
    const [staffData, activityData, dashData] = await Promise.all([
      fetchLive("staff"),
      fetchLive("activity"),
      fetchLive("dashboard")
    ]);

    setLastSynced();

    renderStaffRoster(staffData.staff || []);
    renderActivityLog(activityData.rows || []);
    renderOpsAlerts(dashData);

    /* KPIs */
    const setK = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setK("staff-kpi-count",    (staffData.staff || []).filter(s => String(s.active).toLowerCase() === "yes").length || (staffData.staff || []).length);
    setK("staff-kpi-new",      dashData.newRequests    || 0);
    setK("staff-kpi-followup", dashData.pendingFollowUps || 0);
    setK("staff-kpi-priority", dashData.highPriority   || 0);

  } catch (err) {
    console.warn("RS Admin: staff fetch failed →", err.message);
    const grid = document.getElementById("staff-grid");
    if (grid) grid.innerHTML = `<div class="table-empty" style="grid-column:1/-1; padding:20px;">Could not load staff data. Check your Apps Script deployment.</div>`;
    const log = document.getElementById("activity-log-list");
    if (log) log.innerHTML = `<div class="table-empty" style="padding:20px;">Could not load activity log.</div>`;
  }
}

function renderStaffRoster(staff) {
  const grid = document.getElementById("staff-grid");
  if (!grid) return;

  if (!staff.length) {
    grid.innerHTML = `<div style="grid-column:1/-1; padding:20px; color:var(--muted); font-size:.85rem;">
      No staff added yet. Open your Google Sheet → Staff tab and add team members, then run
      <code style="background:var(--panel); padding:2px 6px; border-radius:4px; font-size:.78rem;">setupSupportTabs()</code> once from the Apps Script editor.
    </div>`;
    return;
  }

  grid.innerHTML = staff.map(s => {
    const name    = String(s.name || "—");
    const role    = String(s.role || "—");
    const active  = String(s.active || "").toLowerCase() === "yes";
    const initials = name.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || "??";
    const badgeCls = active ? "confirmed" : "draft";
    const badgeTxt = active ? "Active" : "Inactive";

    return `
    <div class="staff-card">
      <div class="staff-avatar">${escHtml(initials)}</div>
      <div class="staff-info">
        <div class="staff-name">${escHtml(name)}</div>
        <div class="staff-role">${escHtml(role)}</div>
      </div>
      <span class="status-badge ${badgeCls}" style="font-size:.62rem;">${badgeTxt}</span>
    </div>`;
  }).join("");
}

function renderActivityLog(rows) {
  const wrap = document.getElementById("activity-log-list");
  if (!wrap) return;

  if (!rows.length) {
    wrap.innerHTML = `<div class="table-empty" style="padding:20px; font-size:.84rem;">No activity yet. Actions logged here when bookings are submitted or updated.</div>`;
    return;
  }

  const dotColor = action => {
    const a = (action || "").toLowerCase();
    if (a.includes("new"))       return "#c8962a";
    if (a.includes("confirmed")) return "#4ade90";
    if (a.includes("cancelled") || a.includes("no show")) return "#f87171";
    if (a.includes("updated") || a.includes("status")) return "#60a5fa";
    return "#6b7280";
  };

  wrap.innerHTML = rows.slice(0, 15).map(r => {
    const ts  = r.timestamp ? new Date(r.timestamp) : null;
    const tStr = ts ? ts.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";
    return `
    <div class="activity-log-item">
      <div class="activity-log-dot" style="background:${dotColor(r.action)};"></div>
      <div style="flex:1;">
        <div style="font-size:.82rem; color:var(--ink);">${escHtml(r.action)}${r.bookingId ? ` <span style="color:var(--muted); font-size:.7rem;">[${escHtml(r.bookingId)}]</span>` : ""}</div>
        <div style="font-size:.75rem; color:var(--muted); margin-top:2px;">${escHtml(r.details || "")}</div>
        <div style="font-size:.7rem; color:var(--soft); margin-top:2px;">${tStr} · ${escHtml(r.staffName || "System")}</div>
      </div>
    </div>`;
  }).join("");
}

function renderOpsAlerts(dash) {
  const panel = document.getElementById("ops-alerts-panel");
  if (!panel) return;

  const alerts = [];

  if ((dash.highPriority || 0) > 0)
    alerts.push({ cls: "urgent", icon: "🚨", title: `${dash.highPriority} High-Priority Booking${dash.highPriority > 1 ? "s" : ""}`, desc: "Urgent or high-priority requests need immediate attention.", href: "reservations.html?filter=Urgent" });

  if ((dash.newRequests || 0) > 0)
    alerts.push({ cls: "warn", icon: "🆕", title: `${dash.newRequests} New Request${dash.newRequests > 1 ? "s" : ""} Uncontacted`, desc: "New submissions waiting for your first contact.", href: "reservations.html?filter=New" });

  if ((dash.pendingFollowUps || 0) > 0)
    alerts.push({ cls: "warn", icon: "📞", title: `${dash.pendingFollowUps} Follow-Up${dash.pendingFollowUps > 1 ? "s" : ""} Outstanding`, desc: "Bookings marked Follow-Up Required and not yet closed.", href: "reservations.html?filter=followup" });

  if ((dash.depositPending || 0) > 0)
    alerts.push({ cls: "info", icon: "💳", title: `${dash.depositPending} Deposit${dash.depositPending > 1 ? "s" : ""} Pending`, desc: "Reservations awaiting deposit confirmation.", href: "reservations.html?filter=Deposit+Pending" });

  if ((dash.vipRequests || 0) > 0)
    alerts.push({ cls: "info", icon: "👑", title: `${dash.vipRequests} VIP Sign-Up${dash.vipRequests > 1 ? "s" : ""}`, desc: "New VIP membership requests to action.", href: "members.html" });

  if (!alerts.length) {
    panel.innerHTML = `<div style="text-align:center; color:var(--gold); font-size:.85rem; padding:8px 0;">✓ All clear — no urgent alerts right now.</div>`;
    return;
  }

  panel.innerHTML = alerts.map(a => `
  <div class="ops-alert-item ${a.cls}">
    <span style="font-size:1.1rem; line-height:1; flex-shrink:0; margin-top:1px;">${a.icon}</span>
    <div style="flex:1;">
      <div style="font-size:.82rem; font-weight:600; color:var(--ink); margin-bottom:2px;">${a.title}</div>
      <div style="font-size:.73rem; color:var(--muted);">${a.desc}</div>
    </div>
    <a href="${a.href}" style="font-size:.7rem; color:var(--gold); white-space:nowrap; flex-shrink:0;">View →</a>
  </div>`).join("");
}

/* ═══════════════════════════════════════════════════════════════
   GALLERY ADMIN — Live from GitHub API across all image folders
   ═══════════════════════════════════════════════════════════════ */
const GALLERY_VISIBILITY_KEY = "rs_gallery_visibility"; // localStorage key
let _galleryItems = []; // flat list of all discovered images

async function loadGalleryAdmin() {
  const grid = document.getElementById("gallery-admin-grid");
  if (!grid) return;
  grid.innerHTML = `<div style="grid-column:1/-1; padding:32px; text-align:center; color:var(--muted); font-size:.85rem;">⟳ Loading images from GitHub…</div>`;

  try {
    /* Fetch all folders in parallel */
    const folders  = ["hero", "events", "menu", "gallery"];
    const results  = await Promise.all(folders.map(f => fetchFolderImages(f)));

    /* Combine into flat list with folder metadata */
    _galleryItems = [];
    folders.forEach((folder, i) => {
      results[i].forEach(img => {
        _galleryItems.push({
          file:    img.file,
          caption: img.label,
          folder,
          status:  getImageVisibility(img.file) // from localStorage
        });
      });
    });

    setLastSynced();
    updateGalleryKPIs(results, folders);
    renderGalleryAdmin("all");

  } catch (err) {
    console.warn("RS Admin: gallery load failed →", err.message);
    if (grid) grid.innerHTML = `<div style="grid-column:1/-1; padding:32px; text-align:center; color:var(--muted); font-size:.85rem;">Could not load images. Check your internet connection and try refreshing.</div>`;
  }
}

function updateGalleryKPIs(results, folders) {
  const setK = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const total = results.reduce((s, r) => s + r.length, 0);
  setK("gal-kpi-total",   total);
  folders.forEach((f, i) => setK(`gal-kpi-${f}`, results[i].length));
}

function renderGalleryAdmin(filter) {
  const grid = document.getElementById("gallery-admin-grid");
  if (!grid) return;

  const items = filter === "all"
    ? _galleryItems
    : _galleryItems.filter(i => i.status === filter);

  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1; padding:32px; text-align:center; color:var(--muted); font-size:.85rem;">No images found${filter !== "all" ? " for this filter" : ""}.</div>`;
    return;
  }

  grid.innerHTML = items.map((item, idx) => {
    const isHidden = item.status === "hidden";
    const folderLabel = item.folder.charAt(0).toUpperCase() + item.folder.slice(1);
    return `
    <div class="gallery-admin-item${isHidden ? " hidden" : ""}" data-file="${escHtml(item.file)}">
      <img src="../../assets/images/${escHtml(item.file)}" alt="${escHtml(item.caption)}" loading="lazy">
      <div class="gallery-item-overlay">
        <button class="btn btn-gold btn-sm" style="font-size:.72rem;"
          onclick="openGalleryEditModal('${escHtml(item.file)}')">Edit</button>
        <button class="btn btn-ghost btn-sm" style="font-size:.72rem;"
          onclick="toggleGalleryVisibility('${escHtml(item.file)}')">
          ${isHidden ? "Show" : "Hide"}
        </button>
      </div>
      <div class="gallery-item-meta">
        <span class="gallery-item-name" title="${escHtml(item.caption)}">${escHtml(item.caption)}</span>
        <span class="gallery-item-badge">
          <span class="status-badge ${isHidden ? "draft" : "confirmed"}" style="font-size:.58rem;">
            ${isHidden ? "Hidden" : folderLabel}
          </span>
        </span>
      </div>
    </div>`;
  }).join("");
}

function filterGallery(val) {
  renderGalleryAdmin(val || "all");
}

function toggleGalleryVisibility(file) {
  const item = _galleryItems.find(i => i.file === file);
  if (!item) return;
  item.status = item.status === "hidden" ? "published" : "hidden";
  saveImageVisibility(file, item.status);
  const isNowHidden = item.status === "hidden";
  adminToast(isNowHidden ? "info" : "success",
    isNowHidden ? "Hidden" : "Published",
    isNowHidden ? "Image hidden from public gallery." : "Image is now visible on the website."
  );
  renderGalleryAdmin(document.getElementById("gallery-filter")?.value || "all");
}

function openGalleryEditModal(file) {
  const item = _galleryItems.find(i => i.file === file);
  if (!item) return;
  const preview  = document.getElementById("edit-image-preview");
  const caption  = document.getElementById("edit-image-caption");
  const visibility = document.getElementById("edit-image-visibility");
  if (preview)   preview.src   = `../../assets/images/${file}`;
  if (caption)   caption.value = item.caption;
  if (visibility) visibility.value = item.status;
  /* Wire save button */
  const saveBtn = document.querySelector("#edit-image-modal .btn-gold");
  if (saveBtn) {
    saveBtn.onclick = () => {
      if (caption)   item.caption = caption.value;
      if (visibility) {
        item.status = visibility.value;
        saveImageVisibility(file, item.status);
      }
      closeModal("edit-image-modal");
      renderGalleryAdmin(document.getElementById("gallery-filter")?.value || "all");
      adminToast("success", "Saved", "Image details updated.");
    };
  }
  openModal("edit-image-modal");
}

/* Persist visibility per image file in localStorage */
function getImageVisibility(file) {
  try {
    const map = JSON.parse(localStorage.getItem(GALLERY_VISIBILITY_KEY) || "{}");
    return map[file] || "published";
  } catch { return "published"; }
}

function saveImageVisibility(file, status) {
  try {
    const map = JSON.parse(localStorage.getItem(GALLERY_VISIBILITY_KEY) || "{}");
    map[file] = status;
    localStorage.setItem(GALLERY_VISIBILITY_KEY, JSON.stringify(map));
  } catch(e) { console.warn("Could not save visibility", e); }
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS — Live data from dashboard + bookings endpoints
   ═══════════════════════════════════════════════════════════════ */
async function loadAnalytics() {
  setAnalyticsStatus("loading");
  try {
    /* Fetch both endpoints in parallel */
    const [dash, bkData] = await Promise.all([
      fetchLive("dashboard"),
      fetchLive("bookings")
    ]);

    setLastSynced();
    setAnalyticsStatus("connected");

    const bookings = bkData.rows || [];
    renderAnalyticsKPIs(dash, bookings);
    renderEventsChart(bookings);
    renderSourcesChart(dash);
    renderFormTypeChart(bookings);
    renderMembershipGrowth(bookings);
    renderConversionMetrics(dash, bookings);
  } catch (err) {
    console.warn("RS Admin: analytics fetch failed →", err.message);
    setAnalyticsStatus("error");
  }
}

function setAnalyticsStatus(state) {
  const el = document.getElementById("analytics-status");
  if (!el) return;
  const cfg = {
    loading:   { cls: "cs-loading",   text: "⟳ Loading live data…" },
    connected: { cls: "cs-connected", text: "● Live data" },
    error:     { cls: "cs-error",     text: "● Could not reach Google Sheets" }
  };
  const s = cfg[state] || cfg.connected;
  el.className = `admin-live-indicator ${s.cls}`;
  el.textContent = s.text;
}

function renderAnalyticsKPIs(dash, bookings) {
  const total    = dash.totalSubmissions || 0;
  const confirmed= dash.confirmed || 0;
  const confRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const setKPI = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setKPI("an-total",    total);
  setKPI("an-vip",      dash.vipRequests || 0);
  setKPI("an-leads",    dash.newRequests || 0);
  setKPI("an-confrate", confRate + "%");

  /* Trend subtitles */
  const setSub = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setSub("an-total-sub",   `${dash.todaySubmissions || 0} today`);
  setSub("an-vip-sub",     `${dash.privateEventLeads || 0} private event leads`);
  setSub("an-leads-sub",   `${dash.pendingFollowUps || 0} pending follow-up`);
  setSub("an-confrate-sub",`${confirmed} confirmed of ${total}`);
}

function renderEventsChart(bookings) {
  const wrap = document.getElementById("an-events-chart");
  if (!wrap) return;

  /* Count by Event Name, ignore blanks */
  const counts = {};
  bookings.forEach(r => {
    const ev = (r["Event Name"] || "").trim();
    if (!ev || ev === "—") return;
    counts[ev] = (counts[ev] || 0) + 1;
  });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!entries.length) {
    wrap.innerHTML = `<div class="table-empty" style="padding:20px 0;">No event data yet — bookings with event names will appear here.</div>`;
    return;
  }

  const max = entries[0][1];
  wrap.innerHTML = `<div class="bar-chart-wrap">` +
    entries.map(([name, count]) => `
    <div class="bar-row">
      <div class="bar-label">${escHtml(name)}</div>
      <div class="bar-fill-wrap"><div class="bar-fill" style="width:${Math.round((count / max) * 100)}%"></div></div>
      <div class="bar-val">${count}</div>
    </div>`).join("") +
  `</div>`;
}

function renderSourcesChart(dash) {
  const wrap = document.getElementById("an-sources-chart");
  if (!wrap) return;

  const srcColors = ["#c8962a","#e1306c","#60a5fa","#4ade90","#a78bfa","#f87171","#fb923c"];
  const entries   = Object.entries(dash.sourceBreakdown || {}).sort((a, b) => b[1] - a[1]);
  const total     = entries.reduce((s, [, v]) => s + v, 0) || 1;

  if (!entries.length) {
    wrap.innerHTML = `<div class="table-empty" style="padding:20px 0;">No source data yet.</div>`;
    return;
  }

  wrap.innerHTML = entries.map(([src, count], i) => {
    const pct   = Math.round((count / total) * 100);
    const label = src.replace(".html", "").replace(/\//g, " ").trim() || "direct";
    return `
    <div class="bar-row" style="grid-template-columns:140px 1fr 52px;">
      <div class="bar-label">${escHtml(capitalize(label))}</div>
      <div class="bar-fill-wrap">
        <div class="bar-fill" style="width:${pct}%; background:${srcColors[i % srcColors.length]};"></div>
      </div>
      <div class="bar-val">${pct}%</div>
    </div>`;
  }).join("");
}

function renderFormTypeChart(bookings) {
  const wrap = document.getElementById("an-formtype-chart");
  if (!wrap) return;

  const counts = {};
  bookings.forEach(r => {
    const t = (r["Form Type"] || "other").toLowerCase();
    counts[t] = (counts[t] || 0) + 1;
  });

  const labels = { reservation: "Reservation", vip: "VIP Sign-Up", contact: "Contact", newsletter: "Newsletter", other: "Other" };
  const colors = { reservation: "#c8962a", vip: "#a78bfa", contact: "#60a5fa", newsletter: "#4ade90", other: "#6b7280" };
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0) || 1;

  if (!entries.length) {
    wrap.innerHTML = `<div class="table-empty" style="padding:20px 0;">No submissions yet.</div>`;
    return;
  }

  const max = entries[0][1];
  wrap.innerHTML = `<div class="bar-chart-wrap">` +
    entries.map(([type, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
      <div class="bar-row">
        <div class="bar-label">${labels[type] || capitalize(type)}</div>
        <div class="bar-fill-wrap">
          <div class="bar-fill" style="width:${Math.round((count/max)*100)}%; background:${colors[type] || "#c8962a"};"></div>
        </div>
        <div class="bar-val">${count} <span style="font-size:.65rem;color:var(--muted);">(${pct}%)</span></div>
      </div>`;
    }).join("") +
  `</div>`;
}

function renderMembershipGrowth(bookings) {
  const wrap = document.getElementById("an-membership-chart");
  if (!wrap) return;

  const vipRows = bookings.filter(r => (r["Form Type"] || "").toLowerCase() === "vip");
  const tiers   = { Royale: 0, Riddim: 0, Roots: 0 };
  vipRows.forEach(r => {
    const t = r["Table Type"] || "Roots";
    if (tiers[t] !== undefined) tiers[t]++;
    else tiers.Roots++;
  });
  const total = vipRows.length;

  wrap.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--gold-dim); border:1px solid rgba(200,150,42,.3); border-radius:var(--radius);">
        <span style="font-size:.84rem; color:var(--ink); font-weight:600;">Royale 👑</span>
        <span style="font-size:1.3rem; font-weight:700; color:var(--gold); font-family:'Cormorant Garamond',serif;">${tiers.Royale}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(45,110,78,.08); border:1px solid rgba(45,110,78,.2); border-radius:var(--radius);">
        <span style="font-size:.84rem; color:var(--ink); font-weight:600;">Riddim 🔥</span>
        <span style="font-size:1.3rem; font-weight:700; color:#4ade90; font-family:'Cormorant Garamond',serif;">${tiers.Riddim}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--panel); border:1px solid var(--line); border-radius:var(--radius);">
        <span style="font-size:.84rem; color:var(--ink); font-weight:600;">Roots 🌱</span>
        <span style="font-size:1.3rem; font-weight:700; color:var(--muted); font-family:'Cormorant Garamond',serif;">${tiers.Roots}</span>
      </div>
      <div style="font-size:.78rem; color:var(--soft); text-align:center; margin-top:2px;">
        Total: <strong style="color:var(--gold);">${total} VIP sign-up${total !== 1 ? "s" : ""}</strong>
      </div>
    </div>`;
}

function renderConversionMetrics(dash, bookings) {
  const wrap = document.getElementById("an-conversion-chart");
  if (!wrap) return;

  const total     = dash.totalSubmissions || 0;
  const confirmed = dash.confirmed || 0;
  const contacted = dash.contacted || 0;
  const vip       = dash.vipRequests || 0;

  /* Repeat guest rate from bookings */
  const phoneMap = {};
  bookings.forEach(r => {
    const k = r["Phone"] || r["Email"] || r["Guest Name"];
    if (k) phoneMap[k] = (phoneMap[k] || 0) + 1;
  });
  const uniq   = Object.keys(phoneMap).length || 1;
  const repeat = Object.values(phoneMap).filter(v => v > 1).length;
  const repeatRate = Math.round((repeat / uniq) * 100);

  const confRate    = total > 0 ? Math.round((confirmed / total) * 100) : 0;
  const contactRate = total > 0 ? Math.round(((contacted + confirmed) / total) * 100) : 0;
  const vipRate     = total > 0 ? Math.round((vip / total) * 100) : 0;

  const metrics = [
    { label: "Confirmation Rate",   val: confRate,    color: "#c8962a" },
    { label: "Contact Rate",        val: contactRate, color: "#4ade90" },
    { label: "VIP Conversion",      val: vipRate,     color: "#a78bfa" },
    { label: "Repeat Guest Rate",   val: repeatRate,  color: "#60a5fa" }
  ];

  wrap.innerHTML = metrics.map(m => `
    <div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span style="font-size:.78rem; color:var(--muted);">${m.label}</span>
        <span style="font-size:.84rem; font-weight:700; color:${m.color};">${m.val}%</span>
      </div>
      <div class="bar-fill-wrap">
        <div class="bar-fill" style="width:${Math.max(m.val, 2)}%; background:${m.color};"></div>
      </div>
    </div>`).join("");
}

/* ═══════════════════════════════════════════════════════════════
   VIP MEMBERS — Live data from Bookings sheet (Form Type = vip)
   ═══════════════════════════════════════════════════════════════ */
async function loadMembers() {
  const tbody = document.getElementById("members-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" class="table-loading">Loading VIP members from Google Sheets…</td></tr>`;

  try {
    const data = await fetchLive("bookings");
    setLastSynced();
    renderMembersLive(data.rows || []);
    initTableSearch(".admin-search input", "tbody tr");
  } catch (err) {
    console.warn("RS Admin: members fetch failed →", err.message);
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Could not load member data. Check your Apps Script deployment.</td></tr>`;
  }
}

function renderMembersLive(rows) {
  const tbody = document.getElementById("members-tbody");
  if (!tbody) return;

  /* Pull only VIP form submissions */
  const vipRows = rows.filter(r => (r["Form Type"] || "").toLowerCase() === "vip");

  /* De-duplicate by phone → email → name */
  const map = {};
  vipRows.forEach(r => {
    const key = r["Phone"] || r["Email"] || r["Guest Name"] || "unknown";
    if (!map[key]) {
      /* Parse birthday month and visit pattern out of Notes field */
      const notesRaw = r["Notes"] || "";
      map[key] = {
        name:      r["Guest Name"]  || "—",
        email:     r["Email"]       || "—",
        phone:     r["Phone"]       || "—",
        tier:      r["Table Type"]  || "Roots",
        birthday:  notesRaw.includes("birthday") ? notesRaw : (r["Notes"] || "—"),
        visits:    1,
        joined:    r["Timestamp"] ? new Date(r["Timestamp"]) : null,
        lastDate:  r["Timestamp"] ? new Date(r["Timestamp"]) : null,
        status:    r["Status"]    || "New",
        notes:     r["Internal Notes"] || r["Special Requests"] || ""
      };
    } else {
      const c = map[key];
      c.visits++;
      const ts = r["Timestamp"] ? new Date(r["Timestamp"]) : null;
      if (ts && c.lastDate && ts > c.lastDate) {
        c.lastDate = ts;
        c.status   = r["Status"] || c.status;
      }
      /* Upgrade tier if higher */
      const tierRank = { "Royale": 3, "Riddim": 2, "Roots": 1 };
      if ((tierRank[r["Table Type"]] || 0) > (tierRank[c.tier] || 0)) {
        c.tier = r["Table Type"];
      }
    }
  });

  const members = Object.values(map).sort((a, b) => {
    const tierRank = { "Royale": 3, "Riddim": 2, "Roots": 1 };
    return (tierRank[b.tier] || 0) - (tierRank[a.tier] || 0);
  });

  /* KPI counts */
  const setKPI = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setKPI("members-kpi-total",  members.length);
  setKPI("members-kpi-royale", members.filter(m => m.tier === "Royale").length);
  setKPI("members-kpi-riddim", members.filter(m => m.tier === "Riddim").length);
  setKPI("members-kpi-roots",  members.filter(m => m.tier === "Roots" || !m.tier).length);

  const countEl = document.getElementById("members-count");
  if (countEl) countEl.textContent = `${members.length} member${members.length !== 1 ? "s" : ""} · live from Google Sheets`;

  if (!members.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No VIP sign-ups yet. They appear here when guests submit the VIP membership form.</td></tr>`;
    return;
  }

  tbody.innerHTML = members.map(m => {
    const tierCls   = { "Royale": "vip", "Riddim": "confirmed", "Roots": "draft" }[m.tier] || "draft";
    const statusCls = statusClass(m.status);
    const joinedStr = m.joined
      ? m.joined.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "—";
    const lastStr   = m.lastDate
      ? m.lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—";

    return `
    <tr>
      <td class="primary">${escHtml(m.name)}</td>
      <td><span class="status-badge ${tierCls}">${escHtml(m.tier)}</span></td>
      <td>${escHtml(m.email)}</td>
      <td>${escHtml(m.phone)}</td>
      <td>${escHtml(m.birthday)}</td>
      <td style="text-align:center; font-weight:700; color:var(--gold);">${m.visits}</td>
      <td>${lastStr}</td>
      <td>${joinedStr}</td>
      <td>
        <div class="row-actions">
          <span class="status-badge ${statusCls}" style="font-size:.64rem;">${m.status}</span>
          <button class="btn btn-ghost btn-sm"
            onclick="adminToast('info','Member','${escHtml(m.name)} — ${escHtml(m.tier)} tier')">
            View
          </button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

/* ═══════════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════════ */
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

function statusClass(status) {
  return {
    "New":             "pending",
    "Contacted":       "draft",
    "Confirmed":       "confirmed",
    "Deposit Pending": "warn",
    "Deposit Paid":    "confirmed",
    "Completed":       "confirmed",
    "Cancelled":       "cancelled",
    "No Show":         "cancelled"
  }[status] || "draft";
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function relativeTime(date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getLocalData(key, defaults = []) {
  try { return JSON.parse(localStorage.getItem(key) || "null") || defaults; }
  catch { return defaults; }
}

/* ─ SVG Icons ────────────────────────────────────────────────────── */
function svgCalendar() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; }
function svgStar()     { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; }
function svgTicket()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>`; }
function svgPhone()    { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.17 9.1a19.79 19.79 0 01-3-8.56A2 2 0 012.1 2.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.71a16 16 0 006.29 6.29l1.58-1.58a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`; }

/* ═══════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════ */
function _adminBoot() {
  const page = location.pathname.split("/").pop();

  /* Login page */
  if (page === "index.html" || page === "") {
    const form  = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");
    form?.addEventListener("submit", e => {
      e.preventDefault();
      const u = form.querySelector("[name=username]").value;
      const p = form.querySelector("[name=password]").value;
      if (!login(u, p)) {
        if (errEl) errEl.textContent = "Incorrect username or password. Please try again.";
        form.querySelector("[name=password]").value = "";
      }
    });
    return;
  }

  requireAuth();
  initSidebar();
  initModals();

  /* Logout */
  document.querySelectorAll("[data-logout]").forEach(btn => btn.addEventListener("click", logout));

  /* Global Refresh button */
  document.getElementById("btn-refresh")?.addEventListener("click", () => {
    const p = location.pathname.split("/").pop();
    adminToast("info", "Refreshing…", "Fetching latest data from Google Sheets.");
    if (p === "dashboard.html")    loadDashboard();
    if (p === "reservations.html") loadReservations();
    if (p === "crm.html")          loadCRM();
    if (p === "members.html")      loadMembers();
    if (p === "analytics.html")    loadAnalytics();
    if (p === "events.html")       loadEvents();
    if (p === "gallery.html")      loadGalleryAdmin();
    if (p === "staff.html")        loadStaff();
  });

  /* Page-specific boot */
  if (page === "dashboard.html") {
    loadDashboard();
  }

  if (page === "reservations.html") {
    initFilterTabs();
    initReservationSearch();
    loadReservations();
  }

  if (page === "crm.html") {
    loadCRM();
  }

  if (page === "analytics.html") {
    loadAnalytics();
  }

  if (page === "gallery.html") {
    loadGalleryAdmin();
  }

  if (page === "events.html") {
    loadEvents();
    /* Populate image dropdown (from GitHub) when modal opens for new event */
    document.querySelector('[data-modal-open="add-event-modal"]')?.addEventListener("click", resetEventForm);
  }

  if (page === "menu.html") {
    /* Populate menu photo dropdown from GitHub on modal open */
    document.querySelector('[data-modal-open="add-item-modal"]')?.addEventListener("click", () => {
      populateImageSelect("menu-item-photo", ["menu", "gallery"]);
    });
  }

  if (page === "staff.html") {
    loadStaff();
  }

  if (page === "members.html") {
    loadMembers();
  }
}

/* Run immediately if DOM is already ready (script at bottom of body),
   otherwise wait for DOMContentLoaded */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _adminBoot);
} else {
  _adminBoot();
}
