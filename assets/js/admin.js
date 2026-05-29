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

const ADMIN_USER = "rocksteady";
const ADMIN_PASS = "RockSteady2026!";
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
document.addEventListener("DOMContentLoaded", () => {
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

  if (page === "members.html") {
    initTableSearch(".admin-search input", "tbody tr");
  }
});
