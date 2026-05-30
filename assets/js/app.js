/* ═══════════════════════════════════════════════════════════════
   Rock Steady ATL — Premium Hospitality Operating System
   UmojaServ Architecture · Afro-Caribbean Nightlife Platform
   ═══════════════════════════════════════════════════════════════ */

const APP_ENDPOINT = "https://script.google.com/macros/s/AKfycbxofZijObiK-qStyVawERCIK5yDPHpN5qgdpTw-4rK9JgJm72mrrVjTVSV8w-nOjPVL/exec";
const IS_ROOT_PAGE = !location.pathname.includes("/pages/");
const IS_ADMIN_PAGE = location.pathname.includes("/pages/admin/");
const ASSET_BASE = IS_ADMIN_PAGE ? "../../assets/" : IS_ROOT_PAGE ? "assets/" : "../assets/";

const CONFIG = {
  address:      "1234 Peachtree St NE, Atlanta, GA 30309",
  phone:        "+1 (404) 555-0180",
  phone_raw:    "14045550180",
  email:        "info@rocksteadyatl.com",
  instagram:    "https://instagram.com/rocksteadyatl",
  port:         5700
};

/* ─ Image Path Map ───────────────────────────────────────────── */
const IMG = {
  /* Hero */
  hero:      `${ASSET_BASE}images/hero/hero-image.webp`,
  /* Events / Nightlife */
  night1:    `${ASSET_BASE}images/events/afrobeats-night.webp`,
  night2:    `${ASSET_BASE}images/events/amapiano-friday.webp`,
  night3:    `${ASSET_BASE}images/events/hiphop-saturday.webp`,
  night4:    `${ASSET_BASE}images/events/riddim-sundays.webp`,
  social:    `${ASSET_BASE}images/events/ladies-night.webp`,
  /* Menu / Food */
  snapper:   `${ASSET_BASE}images/menu/red-snapper.webp`,
  food1:     `${ASSET_BASE}images/menu/oxtail-spring-rolls.webp`,
  food2:     `${ASSET_BASE}images/menu/coconut-curry-shrimp.webp`,
  food3:     `${ASSET_BASE}images/menu/jerk-pork-ribs.webp`,
  food4:     `${ASSET_BASE}images/menu/sweet-plantains.webp`,
  food5:     `${ASSET_BASE}images/menu/jerk-chicken-wings.webp`,
  food6:     `${ASSET_BASE}images/menu/rock-steady-oxtail.webp`,
  cocktail:  `${ASSET_BASE}images/menu/signature-cocktail.webp`,
  logo:      `${ASSET_BASE}images/logo/logo.png`,
  /* Gallery / Venue */
  a0:        `${ASSET_BASE}images/gallery/venue-entrance.webp`,
  a1:        `${ASSET_BASE}images/gallery/interior-lounge.webp`,
  a2:        `${ASSET_BASE}images/gallery/atl-nights.webp`,
  a3:        `${ASSET_BASE}images/gallery/music-culture.webp`,
  a4:        `${ASSET_BASE}images/gallery/contact-hero.webp`,
  a5:        `${ASSET_BASE}images/gallery/dining-experience.webp`,
  a6:        `${ASSET_BASE}images/gallery/bar-scene.webp`,
  a7:        `${ASSET_BASE}images/gallery/dj-night.webp`,
  a8:        `${ASSET_BASE}images/gallery/vip-lounge.webp`,
  a9:        `${ASSET_BASE}images/gallery/gallery-hero.webp`,
  a10:       `${ASSET_BASE}images/gallery/crowd-energy.webp`,
  a11:       `${ASSET_BASE}images/gallery/late-night-scene.webp`
};

/* ─ Event Data ──────────────────────────────────────────────────── */
const EVENTS = [
  {
    id: "e001",
    title: "Afrobeats Takeover",
    subtitle: "The Culture Vibrates",
    date: "2026-06-06",
    time: "9:00 PM – 3:00 AM",
    djs: ["DJ Smooth", "DJ Kush"],
    genre: ["Afrobeats", "Amapiano", "Afro House"],
    description: "The most anticipated Afrobeats night in Atlanta returns. Two floors, two DJs, one unforgettable vibe. Dress code enforced.",
    image: IMG.night1,
    tag: "Weekly",
    featured: true,
    rsvp: true,
    vip_table: true,
    capacity: 180,
    price: "Complimentary before 10 PM · $20 after"
  },
  {
    id: "e002",
    title: "Riddim Sundays",
    subtitle: "Dancehall & Reggae Sessions",
    date: "2026-06-07",
    time: "7:00 PM – 2:00 AM",
    djs: ["DJ Selecta"],
    genre: ["Dancehall", "Reggae", "R&B"],
    description: "Slow the vibe down with authentic Dancehall and Reggae selections. Caribbean cocktails, Sunday dinner, and irie energy.",
    image: IMG.night4,
    tag: "Weekly",
    featured: false,
    rsvp: true,
    vip_table: true,
    capacity: 120,
    price: "Free Entry"
  },
  {
    id: "e003",
    title: "Amapiano Friday",
    subtitle: "South African House Meets ATL",
    date: "2026-06-13",
    time: "9:00 PM – 3:00 AM",
    djs: ["DJ Maphorisa Jr.", "Lady Du ATL"],
    genre: ["Amapiano", "Afro House", "Log Drum"],
    description: "Experience the rhythms of Johannesburg in the heart of Atlanta. The log drum hits different when you're dressed for the occasion.",
    image: IMG.night2,
    tag: "Featured",
    featured: false,
    rsvp: true,
    vip_table: true,
    capacity: 180,
    price: "$15 advance · $25 door"
  },
  {
    id: "e004",
    title: "Rock Steady Birthday Bash",
    subtitle: "Anniversary Weekend",
    date: "2026-06-20",
    time: "8:00 PM – 4:00 AM",
    djs: ["International Guest DJ", "DJ Smooth", "DJ Kush"],
    genre: ["Open Format", "Afrobeats", "Hip-Hop", "Dancehall"],
    description: "We're celebrating in style. Our biggest night of the year — internationally booked talent, premium bottle packages, VIP takeover. This is the one.",
    image: IMG.hero,
    tag: "Special Event",
    featured: true,
    rsvp: true,
    vip_table: true,
    capacity: 200,
    price: "VIP Packages Available"
  },
  {
    id: "e005",
    title: "Hip-Hop & R&B Saturdays",
    subtitle: "Classic Meets Current",
    date: "2026-06-21",
    time: "9:00 PM – 3:00 AM",
    djs: ["DJ Neph", "DJ Roz"],
    genre: ["Hip-Hop", "R&B", "Trap", "Old School"],
    description: "For those who rep the culture. From Kendrick to Lauryn, from Drake to D'Angelo — a night where every song is a memory.",
    image: IMG.night3,
    tag: "Weekly",
    featured: false,
    rsvp: true,
    vip_table: true,
    capacity: 180,
    price: "Complimentary before 10 PM · $15 after"
  },
  {
    id: "e006",
    title: "Ladies Night",
    subtitle: "Queens Run the Room",
    date: "2026-06-26",
    time: "8:00 PM – 2:00 AM",
    djs: ["DJ Queen B"],
    genre: ["R&B", "Afrobeats", "Dancehall", "Hip-Hop"],
    description: "Ladies drink complimentary until midnight. Dress your best, bring your crew. The room is yours tonight.",
    image: IMG.social,
    tag: "Monthly",
    featured: false,
    rsvp: true,
    vip_table: false,
    capacity: 150,
    price: "Ladies Free · Gents $20"
  }
];

/* ─ DJ Data ──────────────────────────────────────────────────────── */
const DJS = [
  {
    id: "dj001",
    name: "DJ Smooth",
    tagline: "Afrobeats · Amapiano",
    bio: "Atlanta's premier Afrobeats selector. Known for his seamless transitions and reading the room like no one else.",
    photo: IMG.night1,
    nights: "Fridays"
  },
  {
    id: "dj002",
    name: "DJ Kush",
    tagline: "Afro House · Open Format",
    bio: "Deep Afro House roots with a penchant for surprises. Every set is a journey.",
    photo: IMG.night2,
    nights: "Fridays"
  },
  {
    id: "dj003",
    name: "DJ Selecta",
    tagline: "Dancehall · Reggae",
    bio: "Pure riddim. Authentic Caribbean selections with old-school roots and new school energy.",
    photo: IMG.night4,
    nights: "Sundays"
  },
  {
    id: "dj004",
    name: "DJ Queen B",
    tagline: "R&B · Hip-Hop · Dancehall",
    bio: "The culture's favorite. Her sets move bodies and touch souls — every track tells a story.",
    photo: IMG.night3,
    nights: "Monthly Ladies Night"
  }
];

/* ─ Menu Data ────────────────────────────────────────────────────── */
const MENU = [
  {
    id: "m001",
    category: "Small Plates",
    name: "Jerk Chicken Wings",
    description: "Scotch bonnet-marinated wings, slow-roasted then charred on the grill. Served with scotch bonnet honey glaze and cucumber slaw.",
    price: "$18",
    tags: ["Signature", "Popular"],
    image: IMG.food5,
    spice: "Hot",
    mentions: 142
  },
  {
    id: "m002",
    category: "Small Plates",
    name: "Oxtail Spring Rolls",
    description: "Braised Caribbean oxtail wrapped in crispy wonton skin. Served with tamarind dipping sauce.",
    price: "$22",
    tags: ["Signature"],
    image: IMG.food1,
    spice: "Mild",
    mentions: 87
  },
  {
    id: "m003",
    category: "Mains",
    name: "Brown Stew Red Snapper",
    description: "Whole red snapper in rich brown stew gravy, slow-cooked with thyme, scotch bonnet, and root vegetables. Served with rice and peas.",
    price: "$38",
    tags: ["Signature", "Popular"],
    image: IMG.snapper,
    spice: "Medium",
    mentions: 198
  },
  {
    id: "m004",
    category: "Mains",
    name: "Rock Steady Oxtail",
    description: "Our legendary slow-braised oxtail in Guinness and butter bean stew. Served with steamed cabbage and festival bread.",
    price: "$42",
    tags: ["Signature", "Popular"],
    image: IMG.food6,
    spice: "Mild",
    mentions: 312
  },
  {
    id: "m005",
    category: "Mains",
    name: "Coconut Curry Shrimp",
    description: "Tiger shrimp in Jamaican-spiced coconut curry with steamed white rice, plantain, and charred roti.",
    price: "$34",
    tags: ["Popular"],
    image: IMG.food2,
    spice: "Medium",
    mentions: 94
  },
  {
    id: "m006",
    category: "Jerk & Grill",
    name: "Jerk Pork Ribs Rack",
    description: "Full rack slow-cooked with Rock Steady's 12-hour dry rub then finished over open flame. House smoky BBQ glaze.",
    price: "$52",
    tags: ["Signature", "Shareable"],
    image: IMG.food3,
    spice: "Hot",
    mentions: 167
  },
  {
    id: "m007",
    category: "Sides",
    name: "Sweet Plantains",
    description: "Ripe maduros fried until caramelized, finished with a touch of cinnamon and sea salt.",
    price: "$9",
    tags: ["Popular"],
    image: IMG.food4,
    spice: "None",
    mentions: 73
  },
  {
    id: "m008",
    category: "Cocktails",
    name: "Rock Steady Punch",
    description: "House punch with rum, passion fruit, mango, hibiscus, and a Champagne float. Served in our signature Rock Steady glass.",
    price: "$18",
    tags: ["Signature"],
    image: IMG.cocktail,
    spice: "None",
    mentions: 201
  },
  {
    id: "m009",
    category: "Cocktails",
    name: "Scotch Bonnet Margarita",
    description: "El Jimador Reposado, fresh lime, triple sec, and a scotch bonnet-infused agave. Heat seekers only.",
    price: "$16",
    tags: ["Popular", "Signature"],
    image: IMG.cocktail,
    spice: "Hot",
    mentions: 88
  },
  {
    id: "m010",
    category: "Bottles & VIP",
    name: "Hennessy VS · 750ml",
    description: "Premium bottle service with mixers, fresh fruit, sparkler, and dedicated table attendant.",
    price: "$180",
    tags: ["VIP"],
    image: IMG.night1,
    spice: "None",
    mentions: 0
  },
  {
    id: "m011",
    category: "Bottles & VIP",
    name: "Moët & Chandon Impérial",
    description: "Classic Champagne presentation with crystal flutes, fresh fruit garnish, and VIP table setup.",
    price: "$240",
    tags: ["VIP", "Signature"],
    image: IMG.night2,
    spice: "None",
    mentions: 0
  },
  {
    id: "m012",
    category: "Bottles & VIP",
    name: "VIP Table Package",
    description: "Two premium bottles of your choice, mixers, fresh fruit, dedicated host, and reserved VIP table for up to 8 guests.",
    price: "From $500",
    tags: ["VIP", "Popular"],
    image: IMG.hero,
    spice: "None",
    mentions: 0
  }
];

/* ─ Gallery Data ────────────────────────────────────────────────── */
const GALLERY = [
  { src: IMG.hero,    caption: "The Vibe · Friday Night",        tag: "Ambiance"  },
  { src: IMG.a0,      caption: "Rock Steady · The Experience",   tag: "Ambiance"  },
  { src: IMG.a1,      caption: "Luxury Interior · The Space",    tag: "Ambiance"  },
  { src: IMG.night1,  caption: "DJ Booth · Afrobeats Takeover",  tag: "Events"    },
  { src: IMG.a2,      caption: "The Culture · ATL Nights",       tag: "Ambiance"  },
  { src: IMG.night2,  caption: "Amapiano Friday · The Energy",   tag: "Events"    },
  { src: IMG.a3,      caption: "Rock Steady Nights",             tag: "Ambiance"  },
  { src: IMG.night3,  caption: "VIP Section · Birthday Bash",    tag: "VIP"       },
  { src: IMG.a5,      caption: "Premium Dining Experience",      tag: "Ambiance"  },
  { src: IMG.night4,  caption: "Riddim Sundays",                 tag: "Events"    },
  { src: IMG.social,  caption: "The Culture · Rock Steady",      tag: "Ambiance"  },
  { src: IMG.a7,      caption: "VIP Lounge · Members Only",      tag: "VIP"       },
  { src: IMG.snapper, caption: "Brown Stew Red Snapper",         tag: "Food"      },
  { src: IMG.food3,   caption: "Jerk Pork Ribs Rack",            tag: "Food"      },
  { src: IMG.food6,   caption: "Rock Steady Oxtail",             tag: "Food"      },
  { src: IMG.cocktail,caption: "Signature Cocktails",            tag: "Cocktails" },
  { src: IMG.food1,   caption: "Oxtail Spring Rolls",            tag: "Food"      },
  { src: IMG.food4,   caption: "Sweet Plantains",                tag: "Food"      },
  { src: IMG.a9,      caption: "The Scene · Late Night",         tag: "Ambiance"  },
  { src: IMG.a11,     caption: "Rock Steady · Always Live",      tag: "Ambiance"  }
];

/* ─ Google Reviews ──────────────────────────────────────────────── */
const GOOGLE_RATING = { avg: 4.9, count: 847 };

const GOOGLE_REVIEWS = [
  {
    name: "Marcus Thompson",
    initials: "MT",
    color: "#c8962a",
    rating: 5,
    date: "2 weeks ago",
    text: "Rock Steady is the only spot in Atlanta where the food is as fire as the DJ set. The oxtail had me absolutely speechless. VIP table service was impeccable from start to finish.",
    highlight: "Rock Steady Oxtail",
    verified: true
  },
  {
    name: "Adaeze Okonkwo",
    initials: "AO",
    color: "#2d6e4e",
    rating: 5,
    date: "1 month ago",
    text: "Afrobeats Fridays is unmatched in this city. The crowd, the music, the energy — this place hits different every single time. Booked 3 times already this year.",
    highlight: "Afrobeats Fridays",
    verified: true
  },
  {
    name: "Keisha Robertson",
    initials: "KR",
    color: "#7a3c18",
    rating: 5,
    date: "3 weeks ago",
    text: "Booked a VIP table for my birthday and the team made it completely unforgettable. The jerk ribs alone were worth the entire trip from Decatur.",
    highlight: "Jerk Pork Ribs",
    verified: true
  },
  {
    name: "Devon Wallace",
    initials: "DW",
    color: "#1a3a5c",
    rating: 5,
    date: "5 days ago",
    text: "Best Caribbean restaurant in the city, hands down. The ambiance, the cocktails, the vibe — 10 out of 10. The Rock Steady Punch is dangerous. In the best way.",
    highlight: "Rock Steady Punch",
    verified: true
  },
  {
    name: "Simone Baptiste",
    initials: "SB",
    color: "#3d1a5c",
    rating: 5,
    date: "2 months ago",
    text: "Riddim Sundays is my weekly therapy. Good food, good music, good people. The brown stew snapper is perfection. Don't sleep on this place.",
    highlight: "Brown Stew Snapper",
    verified: true
  },
  {
    name: "Carlos Mendez",
    initials: "CM",
    color: "#1a4a3a",
    rating: 5,
    date: "1 week ago",
    text: "Flew in from Miami specifically for the Anniversary Weekend. It exceeded every single expectation. Rock Steady is legendary. Already planning my next visit.",
    highlight: "Anniversary Weekend",
    verified: true
  }
];

/* ─ Most Mentioned Dishes (from Google Reviews data) ─────────── */
const MOST_MENTIONED = [
  { name: "Rock Steady Oxtail",     count: 312, emoji: "🍖" },
  { name: "Brown Stew Red Snapper", count: 198, emoji: "🐟" },
  { name: "Rock Steady Punch",      count: 201, emoji: "🍹" },
  { name: "Jerk Chicken Wings",     count: 142, emoji: "🍗" }
];

/* ─ Testimonials ─────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    text: "Rock Steady is the only spot in Atlanta where the food is as fire as the DJ set. Oxtail had me speechless.",
    author: "Marcus T.",
    location: "Buckhead, ATL",
    stars: 5,
    emoji: "🇯🇲"
  },
  {
    text: "Afrobeats Fridays is unmatched. The crowd, the music, the energy — this place hits different every single time.",
    author: "Adaeze O.",
    location: "Sandy Springs, ATL",
    stars: 5,
    emoji: "🇳🇬"
  },
  {
    text: "Booked a VIP table for my birthday and the team made it unforgettable. The jerk ribs alone were worth the trip.",
    author: "Keisha R.",
    location: "Midtown, ATL",
    stars: 5,
    emoji: "✨"
  },
  {
    text: "Best Caribbean restaurant in the city hands down. The ambiance, the cocktails, the vibe — 10 out of 10.",
    author: "Devon W.",
    location: "Decatur, GA",
    stars: 5,
    emoji: "🎶"
  },
  {
    text: "Riddim Sundays is my weekly therapy. Good food, good music, good people. Don't sleep on this place.",
    author: "Simone B.",
    location: "Marietta, GA",
    stars: 5,
    emoji: "🌴"
  },
  {
    text: "Flew in from Miami just for the Anniversary Weekend. It exceeded every expectation. Rock Steady is legendary.",
    author: "Carlos M.",
    location: "Miami, FL",
    stars: 5,
    emoji: "🔥"
  }
];

/* ═══════════════════════════════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════════════════════════════ */

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    day:      d.getDate(),
    month:    d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    weekday:  d.toLocaleString("en-US", { weekday: "long" }),
    full:     d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" })
  };
}

function getCountdown(dateStr) {
  const target = new Date(dateStr + "T21:00:00");
  const now    = new Date();
  const diff   = target - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, expired: false };
}

function pad2(n) { return String(n).padStart(2, "0"); }

function phoneLink() {
  return `tel:+${CONFIG.phone_raw}`;
}

function emailLink(subject) {
  return `mailto:${CONFIG.email}${subject ? "?subject=" + encodeURIComponent(subject) : ""}`;
}

function pageLink(page) {
  return IS_ROOT_PAGE ? `pages/${page}` : page;
}

function getAppsScriptEndpoint() {
  return document.querySelector('meta[name="google-apps-script-endpoint"]')?.content.trim() || APP_ENDPOINT.trim();
}

function stars(n) {
  return Array.from({ length: 5 }, (_, i) =>
    `<svg viewBox="0 0 24 24" width="13" height="13" fill="${i < n ? 'var(--gold)' : 'none'}" stroke="var(--gold)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  ).join("");
}

function toast(type, title, msg) {
  const icons = { success: "✓", error: "✕", info: "✦" };
  const container = document.querySelector(".toast-container") || (() => {
    const el = document.createElement("div");
    el.className = "toast-container";
    document.body.appendChild(el);
    return el;
  })();

  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `
    <div class="toast-icon">${icons[type] || "i"}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ""}
    </div>
  `;
  container.appendChild(t);
  setTimeout(() => {
    t.style.transition = "all .4s ease";
    t.style.opacity = "0";
    t.style.transform = "translateX(100%)";
    setTimeout(() => t.remove(), 400);
  }, 4000);
}

/* ═══════════════════════════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════════════════════════ */

function initNav() {
  const nav     = document.querySelector(".site-nav");
  const burger  = document.querySelector(".nav-hamburger");
  const overlay = document.querySelector(".nav-mobile-overlay");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  if (burger && overlay) {
    const setMobileMenu = (open) => {
      overlay.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      overlay.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
    };

    overlay.setAttribute("aria-hidden", "true");

    burger.addEventListener("click", () => {
      setMobileMenu(!overlay.classList.contains("open"));
    });

    overlay.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        setMobileMenu(false);
      });
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && overlay.classList.contains("open")) {
        setMobileMenu(false);
        burger.focus();
      }
    });
  }

  const page = location.pathname.split("/").pop() || "index.html";
  nav.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    const hrefPage = href.split("/").pop();
    if (hrefPage === page || (page === "index.html" && hrefPage === "index.html")) {
      a.classList.add("active");
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   Hero Slideshow
   ═══════════════════════════════════════════════════════════════ */

function initHeroSlideshow() {
  const slides     = document.querySelectorAll(".hero-slide");
  const indicators = document.querySelectorAll(".hero-indicator");
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove("active");
    indicators[current]?.classList.remove("active");
    current = idx;
    slides[current].classList.add("active");
    indicators[current]?.classList.add("active");
  }

  function next() { goTo((current + 1) % slides.length); }
  function start() { timer = setInterval(next, 5500); }
  function stop()  { clearInterval(timer); }

  indicators.forEach((ind, i) => {
    ind.addEventListener("click", () => { stop(); goTo(i); start(); });
  });

  const heroEl = document.querySelector(".hero");
  heroEl?.addEventListener("mouseenter", stop);
  heroEl?.addEventListener("mouseleave", start);

  goTo(0);
  start();
}

/* ═══════════════════════════════════════════════════════════════
   Reveal Animations
   ═══════════════════════════════════════════════════════════════ */

function initReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("revealed"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   Countdown Timers
   ═══════════════════════════════════════════════════════════════ */

function initCountdowns() {
  const timers = document.querySelectorAll("[data-countdown]");
  if (!timers.length) return;

  function tick() {
    timers.forEach(el => {
      const date = el.dataset.countdown;
      const cd   = getCountdown(date);
      const days  = el.querySelector(".cd-days");
      const hours = el.querySelector(".cd-hours");
      const mins  = el.querySelector(".cd-mins");
      const secs  = el.querySelector(".cd-secs");
      if (days)  days.textContent  = pad2(cd.days);
      if (hours) hours.textContent = pad2(cd.hours);
      if (mins)  mins.textContent  = pad2(cd.mins);
      if (secs)  secs.textContent  = pad2(cd.secs);
      if (cd.expired) el.closest(".event-card-countdown")?.classList.add("expired");
    });
  }

  tick();
  setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════════════════════
   Gallery Lightbox
   ═══════════════════════════════════════════════════════════════ */

function initLightbox() {
  const lb     = document.querySelector(".lightbox");
  const lbImg  = lb?.querySelector(".lightbox-img");
  const lbCaption = lb?.querySelector(".lightbox-caption");
  const lbClose = lb?.querySelector(".lightbox-close");
  const lbPrev = lb?.querySelector(".lightbox-prev");
  const lbNext = lb?.querySelector(".lightbox-next");
  if (!lb || !lbImg) return;

  const items = [...document.querySelectorAll("[data-lightbox]")];
  let current = 0;

  function open(idx) {
    current = idx;
    lbImg.src = items[idx].dataset.lightbox;
    if (lbCaption) lbCaption.textContent = items[idx].dataset.caption || items[idx].title || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  function prev() { open((current - 1 + items.length) % items.length); }
  function next() { open((current + 1) % items.length); }

  items.forEach((item, i) => item.addEventListener("click", () => open(i)));
  lbClose?.addEventListener("click", close);
  lbPrev?.addEventListener("click", prev);
  lbNext?.addEventListener("click", next);
  lb.addEventListener("click", e => { if (e.target === lb) close(); });

  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape")     close();
    if (e.key === "ArrowLeft")  prev();
    if (e.key === "ArrowRight") next();
  });
}

function initImageDeterrence() {
  document.querySelectorAll("img").forEach(img => {
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", e => e.preventDefault());
  });

  document.addEventListener("contextmenu", e => {
    if (e.target.closest("img, [data-lightbox], .hero, .immersive-divider")) {
      e.preventDefault();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   Menu Category Filter
   ═══════════════════════════════════════════════════════════════ */

function initMenuFilter() {
  const filterBtns = document.querySelectorAll(".menu-filter-btn");
  const cards      = document.querySelectorAll(".menu-card");
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
      cards.forEach(card => {
        const show = cat === "all" || card.dataset.category === cat;
        card.style.display = show ? "" : "none";
        if (show) { card.style.opacity = 0; setTimeout(() => card.style.opacity = 1, 10); }
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   Review Carousel Auto-scroll
   ═══════════════════════════════════════════════════════════════ */

function initReviewCarousel() {
  const track = document.querySelector(".review-carousel-track");
  if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // CSS animation handles scrolling — just clone for seamless loop
  const cards = [...track.querySelectorAll(".review-card")];
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
}

/* ═══════════════════════════════════════════════════════════════
   Marquee Clone
   ═══════════════════════════════════════════════════════════════ */

function initMarquee() {
  document.querySelectorAll(".marquee-track").forEach(track => {
    const content = track.innerHTML;
    track.innerHTML = content + content;
  });
}

/* ═══════════════════════════════════════════════════════════════
   Form Submission — Google Apps Script
   ═══════════════════════════════════════════════════════════════ */

// ─── Form Validation ─────────────────────────────────────────────────────────
function validateForm(raw, type) {
  const errors = [];
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = v => /^[\d\s\+\-\(\)]{7,}$/.test(v);

  if (type === "reservation") {
    const name = [raw.first_name, raw.last_name].filter(Boolean).join(" ").trim();
    if (!name) errors.push("Please enter your full name.");
    if (raw.phone && !isPhone(raw.phone)) errors.push("Phone number doesn't look right.");
    if (raw.email && !isEmail(raw.email)) errors.push("Please enter a valid email address.");
    if (!raw.date) errors.push("Please choose a booking date.");
    if (!raw.time) errors.push("Please select a preferred time.");
    if (!raw.guests) errors.push("Please select your party size.");
  }

  if (type === "vip") {
    const name = [raw.first_name, raw.last_name].filter(Boolean).join(" ").trim();
    if (!name) errors.push("Please enter your full name.");
    if (!raw.email || !isEmail(raw.email)) errors.push("A valid email address is required.");
    if (!raw.phone || !isPhone(raw.phone)) errors.push("A valid phone number is required.");
    if (!raw.tier) errors.push("Please select a membership tier.");
  }

  if (type === "contact") {
    if (!raw.name || !raw.name.trim()) errors.push("Please enter your name.");
    if (!raw.email || !isEmail(raw.email)) errors.push("A valid email address is required.");
    if (!raw.subject) errors.push("Please select a subject.");
    if (!raw.message || !raw.message.trim()) errors.push("Please enter your message.");
  }

  if (type === "newsletter") {
    if (!raw.email || !isEmail(raw.email)) errors.push("Please enter a valid email address.");
  }

  return errors;
}

// ─── Build standardized Google Sheets payload ────────────────────────────────
function buildPayload(raw, type) {
  const bookingId = `RS-${type.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
  const guestName = [raw.first_name, raw.last_name, raw.name]
    .filter(Boolean).join(" ").trim();

  // Follow-up required for reservations, VIP, and any birthday/private event inquiry
  const subject = (raw.subject || raw.event || "").toLowerCase();
  const requests= (raw.special_requests || raw.message || "").toLowerCase();
  const isFollowUp = ["reservation", "vip"].includes(type) ||
    subject.includes("birthday") || subject.includes("private") || subject.includes("event") ||
    requests.includes("birthday") || requests.includes("private");

  return {
    "Booking ID":         bookingId,
    "Timestamp":          new Date().toISOString(),
    "Form Type":          type,
    "Source":             "rocksteadyatl.com",
    "Source Page":        (typeof window !== "undefined" ? window.location.pathname : ""),
    "Guest Name":         guestName,
    "Phone":              raw.phone || "",
    "Email":              raw.email || "",
    "Date":               raw.date || "",
    "Time":               raw.time || raw.preferred_time || "",
    "Party Size":         raw.guests || raw.party_size || "",
    "Table Type":         raw.table_type || raw.tier || "",
    "Event Name":         raw.event || raw.subject || "",
    "Special Requests":   raw.special_requests || raw.notes || raw.message || "",
    "Status":             "New",
    "Assigned Staff":     "",
    "Follow-Up Required": isFollowUp ? "Yes" : "No",
    "Notes":              raw.visit_pattern || raw.birthday_month || "",
    "Priority":           "Normal",
    "Contact Attempts":   0,
    "Last Updated":       "",
    "Updated By":         "",
    "Internal Notes":     "",
    "Deposit Status":     "Not Required"
  };
}

// ─── Form Submission ──────────────────────────────────────────────────────────
async function submitForm(formId, type) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn    = form.querySelector("[type=submit]");
    const raw    = Object.fromEntries(new FormData(form).entries());

    // Validate
    const errors = validateForm(raw, type);
    if (errors.length) {
      toast("error", "Please check your details", errors[0]);
      return;
    }

    // Build standardized payload
    const payload = buildPayload(raw, type);
    const endpoint = getAppsScriptEndpoint();
    if (!endpoint) {
      toast("error", "Booking is not connected yet", "Add your deployed Google Apps Script Web App URL before launch.");
      return;
    }

    const origText = btn.textContent;
    btn.disabled    = true;
    btn.textContent = "Sending…";

    try {
      const res = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body:    JSON.stringify(payload)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.status === "error") {
        throw new Error(result.message || "Submission failed");
      }
      form.reset();
      toast("success", "Received!", getSuccessMsg(type));
    } catch (err) {
      console.warn("Rock Steady: form submit error", err);
      toast("error", "Submission failed", "Please try again or call us directly if your request is urgent.");
    } finally {
      btn.disabled    = false;
      btn.textContent = origText;
    }
  });
}

function getSuccessMsg(type) {
  const msgs = {
    reservation: "Your lounge request has been received. We'll call or email you within 30 minutes.",
    vip:         "Welcome to the Rock Steady Society! Our team will reach out within 24 hours.",
    contact:     "Message received. We'll get back to you within 24 hours.",
    rsvp:        "You're on the list! See you on the night.",
    newsletter:  "You're subscribed. Exclusive updates incoming."
  };
  return msgs[type] || "Thank you! We'll be in touch.";
}

/* ═══════════════════════════════════════════════════════════════
   Render Helpers
   ═══════════════════════════════════════════════════════════════ */

function renderEventCard(event, featured = false) {
  const date = formatDate(event.date);
  const cd   = getCountdown(event.date);
  return `
  <article class="event-card${featured ? " featured" : ""} reveal" data-id="${event.id}">
    <div class="event-card-image">
      <img src="${event.image}" alt="${event.title}" loading="lazy">
      <div class="event-card-date">
        <span class="day">${date.day}</span>
        <span class="month">${date.month}</span>
      </div>
      <div class="event-card-tag">${event.tag}</div>
    </div>
    <div class="event-card-body">
      <h3>${event.title}</h3>
      <div class="event-card-meta">
        <span class="event-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          ${event.time}
        </span>
        <span class="event-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          ${event.djs.join(", ")}
        </span>
      </div>
      <p class="event-card-description">${event.description}</p>
      ${!cd.expired ? `
      <div class="event-card-countdown" data-countdown="${event.date}">
        <div class="countdown-unit"><span class="num cd-days">${pad2(cd.days)}</span><span class="lbl">Days</span></div>
        <div class="countdown-unit"><span class="num cd-hours">${pad2(cd.hours)}</span><span class="lbl">Hrs</span></div>
        <div class="countdown-unit"><span class="num cd-mins">${pad2(cd.mins)}</span><span class="lbl">Min</span></div>
        <div class="countdown-unit"><span class="num cd-secs">${pad2(cd.secs)}</span><span class="lbl">Sec</span></div>
      </div>` : ""}
      <div class="event-card-footer">
        ${event.rsvp ? `<a href="${pageLink("reservations.html")}?event=${event.id}#lounge-booking" class="btn btn-gold btn-sm">Request VIP Table</a>` : ""}
        <a href="tel:+${CONFIG.phone_raw}" class="btn btn-ghost btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.17 9.1a19.79 19.79 0 01-3-8.56A2 2 0 012.1 2.5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.71a16 16 0 006.29 6.29l1.58-1.58a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          Call for VIP
        </a>
      </div>
      <p class="form-hint">${event.price}</p>
    </div>
  </article>`;
}

function renderMenuCard(item) {
  const mentionBadge = item.mentions > 100
    ? `<span class="menu-mention-badge">★ ${item.mentions} Google mentions</span>`
    : "";
  return `
  <div class="menu-card reveal" data-category="${item.category}">
    <div class="menu-card-image">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      ${item.tags.includes("Signature") ? `<div class="menu-card-badge">Signature</div>` : ""}
    </div>
    <div class="menu-card-body">
      <div class="menu-card-category">${item.category}</div>
      <h4>${item.name}</h4>
      <p class="menu-card-desc">${item.description}</p>
      ${mentionBadge}
      <div class="menu-card-footer">
        <span class="menu-price">${item.price}</span>
        <div class="menu-tags">
          ${item.tags.map(t => `<span class="menu-tag ${t === "Signature" ? "signature" : ""}">${t}</span>`).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

function renderDJCard(dj) {
  return `
  <div class="dj-card reveal">
    <div class="dj-card-photo">
      <img src="${dj.photo}" alt="${dj.name}" loading="lazy">
      <div class="dj-card-photo-overlay"></div>
      <div class="dj-card-nights">${dj.nights}</div>
    </div>
    <div class="dj-card-body">
      <h4>${dj.name}</h4>
      <div class="genre">${dj.tagline}</div>
      <p class="dj-bio">${dj.bio}</p>
    </div>
  </div>`;
}

function renderGalleryItem(item, idx) {
  return `
  <div class="g-item" data-lightbox="${item.src}" data-caption="${item.caption}" title="${item.caption}">
    <img src="${item.src}" alt="${item.caption}" loading="lazy">
    <div class="gallery-overlay">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
    </div>
  </div>`;
}

function renderGoogleReviewCard(review) {
  return `
  <div class="review-card">
    <div class="review-card-header">
      <div class="review-avatar" style="background:${review.color}">${review.initials}</div>
      <div class="review-meta">
        <div class="review-name">${review.name}${review.verified ? ' <span class="review-verified">✓</span>' : ""}</div>
        <div class="review-date">${review.date}</div>
      </div>
      <div class="review-google-logo">
        <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      </div>
    </div>
    <div class="review-stars">${stars(review.rating)}</div>
    <p class="review-text">"${review.text}"</p>
    <div class="review-highlight">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      ${review.highlight}
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   Page-specific Initializers
   ═══════════════════════════════════════════════════════════════ */

function initHomePage() {
  const eventsStrip = document.getElementById("events-strip");
  if (eventsStrip) {
    eventsStrip.innerHTML = EVENTS.slice(0, 3).map(e => renderEventCard(e)).join("");
  }

  const menuPreview = document.getElementById("menu-preview");
  if (menuPreview) {
    menuPreview.innerHTML = MENU.slice(0, 6).map(renderMenuCard).join("");
  }

  const galleryMosaic = document.getElementById("gallery-mosaic");
  if (galleryMosaic) {
    galleryMosaic.innerHTML = GALLERY.slice(0, 8).map(renderGalleryItem).join("");
  }

  const testiTrack = document.getElementById("testimonials-track");
  if (testiTrack) {
    testiTrack.innerHTML = TESTIMONIALS.slice(0, 3).map(t => `
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">${"★".repeat(t.stars)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.emoji}</div>
        <div>
          <div class="testimonial-author-name">${t.author}<span>${t.location}</span></div>
        </div>
      </div>
    </div>`).join("");
  }

  // Google Reviews carousel
  const reviewTrack = document.getElementById("review-carousel-track");
  if (reviewTrack) {
    reviewTrack.innerHTML = GOOGLE_REVIEWS.map(renderGoogleReviewCard).join("");
    initReviewCarousel();
  }

  // Most mentioned dishes
  const mentionedEl = document.getElementById("most-mentioned");
  if (mentionedEl) {
    mentionedEl.innerHTML = MOST_MENTIONED.map(item => `
      <div class="mention-chip">
        <span class="mention-emoji">${item.emoji}</span>
        <span class="mention-name">${item.name}</span>
        <span class="mention-count">${item.count}×</span>
      </div>`).join("");
  }

  submitForm("newsletter-form", "newsletter");
  initMarquee();
}

function initEventsPage() {
  const grid = document.getElementById("events-grid");
  if (!grid) return;

  const featured = EVENTS.filter(e => e.featured);
  const regular  = EVENTS.filter(e => !e.featured);
  grid.innerHTML = [
    ...featured.map(e => renderEventCard(e, true)),
    ...regular.map(e => renderEventCard(e, false))
  ].join("");

  const djGrid = document.getElementById("dj-grid");
  if (djGrid) djGrid.innerHTML = DJS.map(renderDJCard).join("");
}

function initMenuPage() {
  const grid = document.getElementById("menu-grid");
  if (!grid) return;
  grid.innerHTML = MENU.map(renderMenuCard).join("");
  initMenuFilter();
}

function initGalleryPage() {
  const mosaic = document.getElementById("gallery-mosaic-full");
  if (!mosaic) return;
  mosaic.innerHTML = GALLERY.map(renderGalleryItem).join("");
}

function initReservationPage() {
  submitForm("reservation-form", "reservation");

  const params  = new URLSearchParams(location.search);
  const eventId = params.get("event");
  if (eventId) {
    const event = EVENTS.find(e => e.id === eventId);
    const select = document.getElementById("event-select");
    if (event && select) {
      select.value = event.title;
    }
  }
}

function initVIPPage() {
  submitForm("vip-form", "vip");
}

function initContactPage() {
  submitForm("contact-form", "contact");
}

/* ═══════════════════════════════════════════════════════════════
   Boot
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHeroSlideshow();
  initReveal();
  initCountdowns();
  initLightbox();
  initImageDeterrence();

  const page = location.pathname.split("/").pop() || "index.html";
  if (page === "index.html" || page === "")  initHomePage();
  if (page === "events.html")                initEventsPage();
  if (page === "menu.html")                  initMenuPage();
  if (page === "gallery.html")               initGalleryPage();
  if (page === "reservations.html")          initReservationPage();
  if (page === "vip.html")                   initVIPPage();
  if (page === "contact.html")               initContactPage();
});
