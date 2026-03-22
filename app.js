// ============================================================
// app.js — EcoMap Qaraqalpaqstan v3.0 FIXED
// ============================================================

/* ════════════════════════════════════════════════
   SCREEN_NAV_MAP — FAYL TEPASIDA (hoisting muammosi hal)
════════════════════════════════════════════════ */
var SCREEN_NAV_MAP = {
  "screen-map":         "nav-map",
  "screen-scan":        "nav-scan",
  "screen-eco":         "nav-eco",
  "screen-leaderboard": "nav-lb",
  "screen-profile":     "nav-profile",
};

/* ════════════════════════════════════════════════
   GLOBAL STATE
════════════════════════════════════════════════ */
var S = {
  supabase:       null,
  user:           null,
  map:            null,
  markers:        {},
  userPoints:     0,
  userReports:    0,
  userCleanups:   0,
  streak:         0,
  capturedBlob:   null,
  afterBlob:      null,
  activeReport:   null,
  consentMode:    null,
  b2bFilter:      "Bárliǵi",
  selectedRegion: null,
  isProcessing:   false,
  darkMode:       false,
  weatherData:    null,
  aqiData:        null,
  lastAIResult:   null,
  lastLocation:   null,
  lastImgUrl:     null,
  voiceRec:       null,
  offlineQueue:   [],
  wasteStats:     {},
};

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function() {
  _initSupabase();
  _loadDarkMode();
  _loadStreak();
  _loadOfflineQueue();
  _populateStaticTexts(); // LOGIN EKRANIDA MATN KO'RINISHI UCHUN
  _checkAuth();
  window.addEventListener("online", _flushOfflineQueue);
});

function _initSupabase() {
  if (CONFIG.supabaseUrl && CONFIG.supabaseKey) {
    try {
      S.supabase = supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
    } catch(e) {
      console.error("Supabase init error:", e);
    }
  }
}

async function _checkAuth() {
  if (!S.supabase) {
    _showOnboarding();
    return;
  }
  try {
    var sessionResult = await S.supabase.auth.getSession();
    var session = sessionResult.data && sessionResult.data.session;
    if (session && session.user) {
      await _loginUser(session.user);
    } else {
      _showOnboarding();
    }
    // onAuthStateChange — qo'shimcha himoya (WebView da ba'zan ishlamaydi)
    S.supabase.auth.onAuthStateChange(async function(event, session) {
      if (event === "SIGNED_IN" && session && session.user && !S.user) {
        await _loginUser(session.user);
      } else if (event === "SIGNED_OUT") {
        S.user = null;
        _showOnboarding();
      }
    });
  } catch(e) {
    console.error("Auth check error:", e);
    _showOnboarding();
  }
}

async function _loginUser(user) {
  S.user = user;
  await _loadUserProfile(user.id);
  _enterApp();
}

/* ─── _showOnboarding — BARCHA EKRANLARNI YOPADI ─── */
function _showOnboarding() {
  // Barcha ekranlarni yop
  document.querySelectorAll(".screen").forEach(function(s) {
    s.classList.remove("active");
  });
  // Onboardingni yoq
  var ob = document.getElementById("screen-onboarding");
  if (ob) ob.classList.add("active");
  // Navni yashir
  var nav = document.getElementById("bottom-nav");
  if (nav) nav.style.display = "none";
  // Matnlarni to'ldir (har safar)
  _populateStaticTexts();
}

/* ─── _enterApp ─── */
function _enterApp() {
  // Onboardingni yashir
  var ob = document.getElementById("screen-onboarding");
  if (ob) ob.classList.remove("active");

  // Navni ko'rsat
  var nav = document.getElementById("bottom-nav");
  if (nav) nav.style.display = "flex";

  // Barcha ekranlarni o'chir
  document.querySelectorAll(".screen").forEach(function(s) {
    s.classList.remove("active");
  });
  // Map ekranini yoq
  var mapScreen = document.getElementById("screen-map");
  if (mapScreen) mapScreen.classList.add("active");

  // Nav itemlarni reset
  document.querySelectorAll(".nav-item").forEach(function(n) {
    n.classList.remove("active");
  });
  var navMap = document.getElementById("nav-map");
  if (navMap) navMap.classList.add("active");

  // UI ni yangilash
  _populateStaticTexts();
  _updateProfile();
  _renderStreakBadge();
  _updateLeaderboard();

  // Xaritani biroz kechroq init qil (DOM tayyor bo'lishi uchun)
  setTimeout(function() {
    _initMap();
    _loadReports();
  }, 300);

  // Havo ma'lumotini yuklash
  _loadWeatherUI();
}

async function _loadUserProfile(uid) {
  if (!S.supabase) return;
  try {
    var result = await S.supabase
      .from("profiles")
      .select("points,streak")
      .eq("id", uid)
      .single();
    if (result.data) {
      S.userPoints = result.data.points || 0;
      S.streak     = result.data.streak  || 0;
    }
  } catch(e) {
    S.userPoints = 0;
    S.streak = 0;
  }
}

/* ════════════════════════════════════════════════
   AUTH — LOGIN / REGISTER / LOGOUT
════════════════════════════════════════════════ */
async function handleLogin() {
  var emailEl = document.getElementById("auth-email");
  var passEl  = document.getElementById("auth-password");
  if (!emailEl || !passEl) return;

  var email = emailEl.value.trim();
  var pass  = passEl.value.trim();

  if (!email || !pass) {
    showToast(KR.authFillFields, "warn");
    return;
  }
  if (!S.supabase) {
    showToast(KR.authNoSupabase, "warn");
    return;
  }

  _setAuthBtns(true);
  try {
    var result = await S.supabase.auth.signInWithPassword({
      email:    email,
      password: pass,
    });
    if (result.error) throw result.error;
    // MUHIM: WebView da onAuthStateChange ishlamasligi mumkin
    // To'g'ridan-to'g'ri _loginUser chaqiramiz
    if (result.data && result.data.user) {
      await _loginUser(result.data.user);
    }
  } catch(e) {
    showToast(KR.authLoginError + e.message, "error");
    _setAuthBtns(false);
  }
}

async function handleRegister() {
  var emailEl = document.getElementById("auth-email");
  var passEl  = document.getElementById("auth-password");
  if (!emailEl || !passEl) return;

  var email = emailEl.value.trim();
  var pass  = passEl.value.trim();

  if (!email || !pass)  { showToast(KR.authFillFields, "warn"); return; }
  if (pass.length < 6)  { showToast(KR.authPassShort,  "warn"); return; }
  if (!S.supabase)      { showToast(KR.authNoSupabase,  "warn"); return; }

  _setAuthBtns(true);
  try {
    var result = await S.supabase.auth.signUp({
      email:    email,
      password: pass,
      options:  { data: { username: email.split("@")[0] } },
    });
    if (result.error) throw result.error;
    showToast(KR.authRegSuccess, "success");
    _setAuthBtns(false);
  } catch(e) {
    showToast(KR.authRegError + e.message, "error");
    _setAuthBtns(false);
  }
}

async function handleLogout() {
  try {
    if (S.supabase) await S.supabase.auth.signOut();
  } catch(e) { console.warn("Logout error:", e); }

  // State ni to'liq tozalash
  S.user         = null;
  S.userPoints   = 0;
  S.userReports  = 0;
  S.userCleanups = 0;
  S.streak       = 0;
  S.weatherData  = null;
  S.aqiData      = null;
  S.capturedBlob = null;
  S.afterBlob    = null;
  S.lastAIResult = null;
  S.lastLocation = null;
  S.lastImgUrl   = null;
  S.isProcessing = false;

  // Xaritani reset
  if (S.map) {
    try { S.map.remove(); } catch(e) {}
    S.map = null;
    S.markers = {};
  }

  // UI ni yopish
  closeAllSheets();
  closeAllModals();
  showAILoadingOverlay(false);
  closeBeforeAfter();

  _showOnboarding();
}

function enterDemoMode() {
  S.user        = { id: "demo", email: "demo@ecomap.kz" };
  S.userPoints  = 120;
  S.userReports = 3;
  S.streak      = 5;
  _enterApp();
}

function _setAuthBtns(loading) {
  var loginBtn    = document.getElementById("login-btn");
  var registerBtn = document.getElementById("register-btn");
  if (loginBtn)    loginBtn.disabled    = loading;
  if (registerBtn) registerBtn.disabled = loading;
}

/* ════════════════════════════════════════════════
   DARK MODE
════════════════════════════════════════════════ */
function _loadDarkMode() {
  S.darkMode = localStorage.getItem("ecomap_dark") === "1";
  if (S.darkMode) document.body.classList.add("dark-mode");
  _syncDarkToggle();
}

function toggleDarkMode() {
  S.darkMode = !S.darkMode;
  document.body.classList.toggle("dark-mode", S.darkMode);
  localStorage.setItem("ecomap_dark", S.darkMode ? "1" : "0");
  _syncDarkToggle();
  showToast(S.darkMode ? KR.darkModeOn : KR.darkModeOff, "info");
  if (S.map) {
    setTimeout(function() { S.map.invalidateSize(); }, 300);
  }
}

function _syncDarkToggle() {
  var tog = document.getElementById("dark-mode-toggle");
  if (tog) tog.classList.toggle("on", S.darkMode);
}

/* ════════════════════════════════════════════════
   STREAK
════════════════════════════════════════════════ */
function _loadStreak() {
  var today        = new Date().toDateString();
  var lastActive   = localStorage.getItem("ecomap_last_active");
  var savedStreak  = parseInt(localStorage.getItem("ecomap_streak") || "0", 10);

  if (lastActive === today) {
    S.streak = savedStreak;
  } else {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    S.streak = (lastActive === yesterday.toDateString()) ? savedStreak + 1 : 1;
    localStorage.setItem("ecomap_last_active", today);
    localStorage.setItem("ecomap_streak", String(S.streak));
  }
}

function _renderStreakBadge() {
  var el = document.getElementById("streak-badge-val");
  if (el) el.textContent = S.streak;
}

/* ════════════════════════════════════════════════
   OFFLINE QUEUE
════════════════════════════════════════════════ */
function _loadOfflineQueue() {
  try {
    S.offlineQueue = JSON.parse(localStorage.getItem("ecomap_offline_queue") || "[]");
  } catch(e) {
    S.offlineQueue = [];
  }
}

function _saveOfflineQueue() {
  localStorage.setItem("ecomap_offline_queue", JSON.stringify(S.offlineQueue));
}

function _addToOfflineQueue(item) {
  S.offlineQueue.push(item);
  _saveOfflineQueue();
  showToast(KR.offlineQueued, "warn");
}

async function _flushOfflineQueue() {
  if (!S.offlineQueue.length) return;
  showToast(KR.offlineSending, "info");
  var failed = [];
  for (var i = 0; i < S.offlineQueue.length; i++) {
    try {
      await saveReport(S.offlineQueue[i]);
    } catch(e) {
      failed.push(S.offlineQueue[i]);
    }
  }
  S.offlineQueue = failed;
  _saveOfflineQueue();
  if (!failed.length) showToast(KR.offlineSent, "success");
}

/* ════════════════════════════════════════════════
   SUPABASE DATA
════════════════════════════════════════════════ */
async function _loadReports() {
  if (!S.supabase) {
    DEMO_REPORTS.forEach(addReportMarker);
    _buildWasteStats(DEMO_REPORTS);
    return;
  }
  try {
    var result = await S.supabase
      .from("reports")
      .select("*")
      .in("status", ["red", "yellow", "green"])
      .order("created_at", { ascending: false });
    if (result.error) throw result.error;
    var data = result.data || [];
    data.forEach(addReportMarker);
    _buildWasteStats(data);
  } catch(e) {
    console.warn("Reports load error:", e);
    DEMO_REPORTS.forEach(addReportMarker);
    _buildWasteStats(DEMO_REPORTS);
  }
}

function _buildWasteStats(reports) {
  S.wasteStats = {};
  (reports || []).forEach(function(r) {
    var cat = r.waste_category || "Aralash";
    S.wasteStats[cat] = (S.wasteStats[cat] || 0) + 1;
  });
}

async function saveReport(item) {
  var lat = item.lat, lng = item.lng, wasteType = item.wasteType,
      aiComment = item.aiComment, level = item.level, imgUrl = item.imgUrl,
      streetName = item.streetName, wasteCategory = item.wasteCategory;

  var demoObj = {
    id:             "r" + Date.now(),
    lat:            lat,
    lng:            lng,
    status:         "red",
    waste_type:     wasteType,
    ai_comment:     aiComment,
    level:          level,
    image_before:   imgUrl,
    image_after:    null,
    created_at:     new Date().toISOString(),
    street_name:    streetName || null,
    waste_category: wasteCategory || "Aralash",
  };

  if (!S.supabase || !S.user || S.user.id === "demo") {
    addReportMarker(demoObj);
    S.userReports++;
    var cat = wasteCategory || "Aralash";
    S.wasteStats[cat] = (S.wasteStats[cat] || 0) + 1;
    return demoObj;
  }

  // FIX: upsert profile first to avoid FK crash
  try {
    await S.supabase.from("profiles").upsert(
      { id: S.user.id, points: S.userPoints },
      { onConflict: "id" }
    );
  } catch(e) { /* ignore */ }

  var result = await S.supabase
    .from("reports")
    .insert({
      user_id:        S.user.id,
      lat:            lat,
      lng:            lng,
      waste_type:     wasteType,
      ai_comment:     aiComment,
      level:          level,
      status:         "red",
      image_before:   imgUrl,
      street_name:    streetName || null,
      waste_category: wasteCategory || "Aralash",
    })
    .select()
    .single();

  if (result.error) throw result.error;
  addReportMarker(result.data);
  S.userReports++;
  var cat2 = wasteCategory || "Aralash";
  S.wasteStats[cat2] = (S.wasteStats[cat2] || 0) + 1;
  return result.data;
}

async function updateReportStatus(id, status, imgAfterUrl) {
  if (S.markers[id]) {
    S.markers[id].marker.setIcon(makeReportIcon(status, S.markers[id].level));
  }
  if (!S.supabase || !S.user || S.user.id === "demo") return;

  var upd = { status: status };
  if (imgAfterUrl) upd.image_after = imgAfterUrl;

  var result = await S.supabase.from("reports").update(upd).eq("id", id);
  if (result.error) throw result.error;
}

async function awardPoints(pts) {
  S.userPoints += pts;
  _updateMapPoints();
  _updateProfile();

  if (!S.supabase || !S.user || S.user.id === "demo") return;
  try {
    var cur = await S.supabase.from("profiles").select("points").eq("id", S.user.id).single();
    var current = (cur.data && cur.data.points) ? cur.data.points : 0;
    await S.supabase.from("profiles").upsert(
      { id: S.user.id, points: current + pts },
      { onConflict: "id" }
    );
  } catch(e) { console.warn("awardPoints error:", e); }
}

/* ════════════════════════════════════════════════
   LEAFLET MAP
════════════════════════════════════════════════ */
function _initMap() {
  if (S.map) {
    setTimeout(function() { S.map.invalidateSize(); }, 300);
    return;
  }

  S.map = L.map("leaflet-map", {
    center:             [CONFIG.defaultLat, CONFIG.defaultLng],
    zoom:               CONFIG.defaultZoom,
    zoomControl:        false,
    attributionControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19,
  }).addTo(S.map);

  COMPANIES.forEach(_addCompanyMarker);

  // Bir necha marta invalidateSize — xarita to'liq ko'rinsin
  setTimeout(function() { S.map.invalidateSize(); }, 300);
  setTimeout(function() { S.map.invalidateSize(); }, 800);
  setTimeout(function() { S.map.invalidateSize(); }, 1500);
}

function makeReportIcon(status, level) {
  var colorMap = {
    red:    "#ef4444",
    yellow: "#f59e0b",
    green:  "#16a34a",
    purple: "#7c3aed",
  };
  var emojiMap = {
    red:    "🔴",
    yellow: "🟡",
    green:  "🟢",
    purple: "🟣",
  };
  var key = (status === "red" && level === 3) ? "purple" : status;
  var bg  = colorMap[key] || colorMap.red;
  var em  = emojiMap[key] || emojiMap.red;

  return L.divIcon({
    className: "",
    html: '<div class="marker-bounce" style="width:38px;height:38px;border-radius:50%;background:' + bg + ';border:3px solid rgba(255,255,255,.85);box-shadow:0 4px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;">' + em + '</div>',
    iconSize:    [38, 38],
    iconAnchor:  [19, 19],
    popupAnchor: [0, -22],
  });
}

function addReportMarker(report) {
  if (S.markers[report.id]) {
    S.map.removeLayer(S.markers[report.id].marker);
  }

  var icon   = makeReportIcon(report.status, report.level);
  var marker = L.marker([report.lat, report.lng], { icon: icon }).addTo(S.map);

  var statusLabels = {
    red:    KR.popupStatusRed,
    yellow: KR.popupStatusYellow,
    green:  KR.popupStatusGreen,
  };
  var statusLabel = statusLabels[report.status] || KR.popupStatusRed;
  var statusClass = (report.status === "red" && report.level === 3) ? "s-purple" : ("s-" + report.status);
  var date = new Date(report.created_at || Date.now()).toLocaleDateString("ru-RU");

  var thumbHtml  = report.image_before ? '<img class="popup-thumb" src="' + report.image_before + '" alt="" onerror="this.style.display=\'none\'"/>' : "";
  var streetHtml = report.street_name  ? '<p class="popup-street">' + KR.mapStreetPrefix + report.street_name + '</p>' : "";
  var dirUrl     = "https://www.google.com/maps/dir/?api=1&destination=" + report.lat + "," + report.lng;

  var actionsHtml = '<div class="popup-actions">'
    + '<a href="' + dirUrl + '" target="_blank" class="popup-btn sec"><span style="font-size:14px;">🗺️</span>' + KR.mapDirections + '</a>';

  if (report.status === "red" && S.user) {
    actionsHtml += '<button class="popup-btn" onclick="startCleanerFlow(\'' + report.id + '\')"><span style="font-size:14px;">🧹</span>' + KR.popupCleanBtn + '</button>';
  }
  if (report.status === "green" && (report.image_before || report.image_after)) {
    var b = report.image_before || "";
    var a = report.image_after  || "";
    actionsHtml += '<button class="popup-btn sec" onclick="showBeforeAfter(\'' + b + '\',\'' + a + '\')"><span style="font-size:14px;">📷</span>' + KR.popupBeforeAfter + '</button>';
  }
  actionsHtml += '</div>';

  var popupContent = thumbHtml
    + '<div class="popup-type">' + (report.waste_type || KR.popupNoData) + '</div>'
    + streetHtml
    + '<span class="popup-status ' + statusClass + '">' + statusLabel + '</span>'
    + '<p class="popup-comment">"' + (report.ai_comment || "—") + '"</p>'
    + '<p class="popup-meta">📅 ' + date + '</p>'
    + actionsHtml;

  marker.bindPopup(popupContent, { maxWidth: 280 });
  S.markers[report.id] = { marker: marker, level: report.level || 1 };
  _updateMarkerCount();
}

function _addCompanyMarker(c) {
  var icon = L.divIcon({
    className: "",
    html: '<div style="width:38px;height:38px;border-radius:10px;background:rgba(0,101,117,.88);border:2px solid rgba(0,220,253,.7);box-shadow:0 3px 10px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;">♻️</div>',
    iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -22],
  });
  L.marker([c.lat, c.lng], { icon: icon }).addTo(S.map).bindPopup(
    '<div class="popup-type">♻️ ' + c.name + '</div>'
    + '<p class="popup-meta">📍 ' + c.addr + '</p>'
    + '<p class="popup-meta">⏰ ' + c.hours + '</p>'
    + '<a href="tel:' + c.phone + '" class="popup-btn" style="display:block;text-align:center;margin-top:8px;">📞 ' + c.phone + '</a>',
    { maxWidth: 260 }
  );
}

function _updateMarkerCount() {
  var el = document.getElementById("marker-count");
  if (el) el.textContent = Object.keys(S.markers).length;
}

function locateUser() {
  if (!navigator.geolocation) { showToast(KR.toastLocating, "warn"); return; }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      if (S.map) S.map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
    },
    function() { showToast(KR.toastGpsError, "error"); }
  );
}

/* ════════════════════════════════════════════════
   SCAN — PHOTO SELECTION
════════════════════════════════════════════════ */
function startScanFromMap() {
  showScreen("screen-scan");
}

function onPhotoSelected(e) {
  var file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) { showToast(KR.toastImgBig, "error"); return; }

  S.capturedBlob = file;
  var url = URL.createObjectURL(file);

  var previewImg = document.getElementById("scan-preview-img");
  if (previewImg) { previewImg.src = url; previewImg.style.display = "block"; }

  var emptyEl = document.getElementById("scan-hero-empty");
  if (emptyEl) emptyEl.style.display = "none";

  var overlayEl = document.getElementById("scan-hero-overlay");
  if (overlayEl) overlayEl.style.display = "block";

  var analyzeBtn = document.getElementById("btn-analyze");
  if (analyzeBtn) analyzeBtn.style.display = "flex";

  var resultCard = document.getElementById("ai-result-card");
  if (resultCard) resultCard.classList.remove("show");

  var aiBadge = document.getElementById("scan-ai-badge");
  if (aiBadge) aiBadge.style.display = "none";

  var ptsBadge = document.getElementById("scan-points-badge");
  if (ptsBadge) ptsBadge.style.display = "none";

  var eyebrow = document.getElementById("scan-eyebrow");
  if (eyebrow) eyebrow.textContent = KR.scanCard1Tag;

  var titleEl = document.getElementById("scan-title");
  if (titleEl) titleEl.textContent = KR.scanTitleReady;
}

/* ── Voice Input ── */
function toggleVoiceInput() {
  var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) { showToast(KR.scanVoiceNoSupport, "error"); return; }

  if (S.voiceRec) {
    S.voiceRec.stop();
    S.voiceRec = null;
    _setVoiceBtnState(false);
    return;
  }

  var rec = new SpeechRec();
  rec.lang           = "kaa";
  rec.interimResults = true;
  rec.continuous     = false;

  rec.onresult = function(e) {
    var transcript = Array.from(e.results).map(function(r) { return r[0].transcript; }).join("");
    var ta = document.getElementById("scan-desc-input");
    if (ta) ta.value = transcript;
  };
  rec.onerror = function() {
    var rec2 = new SpeechRec();
    rec2.lang = "ru-RU"; rec2.interimResults = true; rec2.continuous = false;
    rec2.onresult = function(e) {
      var t = Array.from(e.results).map(function(r) { return r[0].transcript; }).join("");
      var ta = document.getElementById("scan-desc-input");
      if (ta) ta.value = t;
    };
    rec2.onend = function() { S.voiceRec = null; _setVoiceBtnState(false); };
    rec2.start();
    S.voiceRec = rec2;
    _setVoiceBtnState(true);
  };
  rec.onend = function() { S.voiceRec = null; _setVoiceBtnState(false); };
  rec.start();
  S.voiceRec = rec;
  _setVoiceBtnState(true);
}

function _setVoiceBtnState(listening) {
  var btn = document.getElementById("voice-btn");
  if (!btn) return;
  btn.classList.toggle("listening", listening);
  var icon = btn.querySelector(".material-symbols-outlined");
  if (icon) icon.textContent = listening ? "stop_circle" : "mic";
}

/* ── Analysis flow ── */
function startAnalysisFlow() {
  if (!S.capturedBlob) return;
  if (!S.user) { showToast(KR.toastNeedLogin, "warn"); _showOnboarding(); return; }
  S.consentMode = "spotter";
  var prev = document.getElementById("consent-preview");
  if (prev) { prev.src = URL.createObjectURL(S.capturedBlob); prev.style.display = "block"; }
  showModal("consent-modal");
}

function onConsentAccept() {
  closeModal("consent-modal");
  if (S.consentMode === "spotter")  _runSpotterAnalysis();
  else if (S.consentMode === "cleaner") runCleanerVerification();
}

async function _runSpotterAnalysis() {
  if (!S.capturedBlob || S.isProcessing) return;
  S.isProcessing = true;

  if (!navigator.onLine) {
    _addToOfflineQueue({
      lat: CONFIG.defaultLat, lng: CONFIG.defaultLng,
      wasteType: "Oflayn belgi", aiComment: "Oflayn saqlanǵan",
      level: 1, imgUrl: null, streetName: null, wasteCategory: "Aralash",
    });
    S.isProcessing = false;
    return;
  }

  var loc;
  try {
    loc = await getLocation();
  } catch(e) {
    showToast(KR.toastGpsWarn, "warn");
    loc = {
      lat: CONFIG.defaultLat + (Math.random() - 0.5) * 0.015,
      lng: CONFIG.defaultLng + (Math.random() - 0.5) * 0.015,
    };
  }

  showAILoadingOverlay(true);
  setProgress(0.2);

  var imgUrl;
  try {
    imgUrl = await uploadImage(S.capturedBlob);
  } catch(e) {
    showToast(KR.toastUploadError + e.message, "error");
    showAILoadingOverlay(false); hideProgress(); S.isProcessing = false; return;
  }
  setProgress(0.45);

  var descInput = document.getElementById("scan-desc-input");
  var userDesc  = descInput ? descInput.value.trim() : "";

  var result;
  try {
    result = await analyzeImage(S.capturedBlob, userDesc);
  } catch(e) {
    showToast(KR.toastAIError + e.message, "error");
    showAILoadingOverlay(false); hideProgress(); S.isProcessing = false; return;
  }
  setProgress(0.7);
  showAILoadingOverlay(false);

  var type_kr = result.type_kr, level = result.level,
      comment_kr = result.comment_kr, waste_category = result.waste_category,
      is_valid_outdoor = result.is_valid_outdoor;

  if (level === 0 || !is_valid_outdoor) {
    showToast(KR.toastNoPollu + (comment_kr || "Rasm tashqarida emas."), "info");
    hideProgress(); S.isProcessing = false; return;
  }

  showToast(KR.toastGeocoding, "info");
  setProgress(0.85);
  var streetName = await reverseGeocode(loc.lat, loc.lng);
  setProgress(0.95);

  S.lastAIResult = { type_kr: type_kr, level: level, comment_kr: comment_kr, waste_category: waste_category };
  S.lastLocation = { lat: loc.lat, lng: loc.lng, streetName: streetName };
  S.lastImgUrl   = imgUrl;

  _showDecisionSheet(imgUrl, type_kr, level, comment_kr, streetName);
  hideProgress();
  S.isProcessing = false;
}

/* ════════════════════════════════════════════════
   AI DECISION SHEET
════════════════════════════════════════════════ */
function _showDecisionSheet(imgUrl, typeKr, level, commentKr, streetName) {
  var thumbEl = document.getElementById("decision-thumb");
  if (thumbEl) {
    if (imgUrl) { thumbEl.src = imgUrl; thumbEl.style.display = "block"; }
    else          thumbEl.style.display = "none";
  }

  var typeEl = document.getElementById("decision-type-text");
  if (typeEl) typeEl.textContent = typeKr;

  var lvlBadge = document.getElementById("decision-level-badge");
  if (lvlBadge) {
    lvlBadge.className = "level-badge level-" + level;
    var labels = ["", KR.scanLevel1, KR.scanLevel2, KR.scanLevel3];
    lvlBadge.textContent = "Level " + level + " — " + (labels[level] || "");
  }

  var commentEl = document.getElementById("decision-comment");
  if (commentEl) commentEl.textContent = commentKr;

  var streetEl = document.getElementById("decision-street");
  if (streetEl) streetEl.textContent = streetName ? (KR.mapStreetPrefix + streetName) : "";

  document.getElementById("decision-confirm-btn").onclick = function() { _confirmPlaceOnMap(); };
  document.getElementById("decision-reject-btn").onclick  = function() {
    closeSheet("decision-sheet");
    showToast(KR.toastCancelled, "info");
    S.lastAIResult = null; S.lastLocation = null; S.lastImgUrl = null;
  };

  openSheet("decision-sheet");
}

async function _confirmPlaceOnMap() {
  closeSheet("decision-sheet");
  if (!S.lastAIResult || !S.lastLocation) return;

  var type_kr       = S.lastAIResult.type_kr;
  var level         = S.lastAIResult.level;
  var comment_kr    = S.lastAIResult.comment_kr;
  var waste_category= S.lastAIResult.waste_category;
  var lat           = S.lastLocation.lat;
  var lng           = S.lastLocation.lng;
  var streetName    = S.lastLocation.streetName;
  var imgUrl        = S.lastImgUrl;

  setProgress(0.3);
  _setFabLoading(true);

  if (level === 3) {
    try {
      await saveReport({ lat: lat, lng: lng, wasteType: type_kr, aiComment: comment_kr, level: level, imgUrl: imgUrl, streetName: streetName, wasteCategory: waste_category });
    } catch(e) { console.warn(e); }
    await awardPoints(CONFIG.pointsB2B);
    _showPointsBadge(CONFIG.pointsB2B);
    showToast(KR.toastB2BAlert + CONFIG.pointsB2B + KR.toastB2BPts, "warn");
    openB2BSheet();
  } else {
    try {
      await saveReport({ lat: lat, lng: lng, wasteType: type_kr, aiComment: comment_kr, level: level, imgUrl: imgUrl, streetName: streetName, wasteCategory: waste_category });
      await awardPoints(CONFIG.pointsSpotter);
      _showPointsBadge(CONFIG.pointsSpotter);
      showToast(KR.toastSaved + CONFIG.pointsSpotter + KR.toastSavedPts, "success");
      showToast(KR.toastPlacedOnMap, "info");
      if (S.map) S.map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
      _showAIResult(type_kr, level, comment_kr);
      var titleEl   = document.getElementById("scan-title");
      var eyebrowEl = document.getElementById("scan-eyebrow");
      if (titleEl)   titleEl.textContent   = KR.scanTitleDone;
      if (eyebrowEl) eyebrowEl.textContent = KR.scanTitleResult;
    } catch(e) {
      showToast(KR.toastSaveError + e.message, "error");
    }
  }

  hideProgress();
  _setFabLoading(false);
  S.lastAIResult = null; S.lastLocation = null; S.lastImgUrl = null;
}

function _showAIResult(type_kr, level, comment_kr) {
  var card = document.getElementById("ai-result-card");
  if (card) card.classList.add("show");

  var commentEl = document.getElementById("ai-comment");
  if (commentEl) commentEl.textContent = comment_kr;

  var badge = document.getElementById("ai-level-badge");
  if (badge) {
    badge.className = "level-badge level-" + level;
    var labels = ["", KR.scanLevel1, KR.scanLevel2, KR.scanLevel3];
    badge.textContent = "Level " + level + " — " + (labels[level] || "");
  }

  var aiBadge = document.getElementById("scan-ai-badge");
  if (aiBadge) aiBadge.style.display = "flex";

  var aiType = document.getElementById("scan-ai-type");
  if (aiType) aiType.textContent = type_kr;
}

function _showPointsBadge(pts) {
  var el = document.getElementById("scan-points-badge");
  if (el) el.style.display = "flex";
  var txt = document.getElementById("scan-points-text");
  if (txt) txt.textContent = "+" + pts + " ball";
}

/* ════════════════════════════════════════════════
   CLEANER FLOW
════════════════════════════════════════════════ */
function startCleanerFlow(reportId) {
  if (!S.user) { showToast(KR.toastNeedLogin, "warn"); return; }
  S.activeReport = { id: reportId };
  if (S.map) S.map.closePopup();
  updateReportStatus(reportId, "yellow").catch(function(e) { console.warn(e); });

  var afterPreview  = document.getElementById("after-preview");
  var afterDrop     = document.getElementById("after-photo-drop");
  var verifyBtn     = document.getElementById("cleaner-verify-btn");
  var step2         = document.getElementById("cstep-2");
  var step3         = document.getElementById("cstep-3");

  if (afterPreview) afterPreview.style.display  = "none";
  if (afterDrop)    afterDrop.style.display      = "flex";
  if (verifyBtn)    { verifyBtn.disabled = true; verifyBtn.style.opacity = "0.4"; }
  if (step2)        step2.classList.remove("done");
  if (step3)        step3.classList.remove("done");
  S.afterBlob = null;

  showModal("cleaner-modal");
}

function onAfterPhotoSelected(e) {
  var file = e.target.files && e.target.files[0];
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) { showToast(KR.toastImgBig, "error"); return; }
  S.afterBlob = file;

  var prev = document.getElementById("after-preview");
  if (prev) { prev.src = URL.createObjectURL(file); prev.style.display = "block"; }

  var drop = document.getElementById("after-photo-drop");
  if (drop) drop.style.display = "none";

  var btn = document.getElementById("cleaner-verify-btn");
  if (btn) { btn.disabled = false; btn.style.opacity = "1"; }

  var step2 = document.getElementById("cstep-2");
  if (step2) step2.classList.add("done");
}

function onCleanerCancel() {
  if (S.activeReport) {
    updateReportStatus(S.activeReport.id, "red").catch(function(e) { console.warn(e); });
    S.activeReport = null;
  }
  S.afterBlob = null;
  closeModal("cleaner-modal");
}

async function runCleanerVerification() {
  if (!S.afterBlob || !S.activeReport || S.isProcessing) return;
  S.isProcessing = true;

  var btn = document.getElementById("cleaner-verify-btn");
  if (btn) { btn.disabled = true; btn.style.opacity = "0.5"; }

  showAILoadingOverlay(true);
  setProgress(0.25);

  var afterUrl;
  try {
    afterUrl = await uploadImage(S.afterBlob);
  } catch(e) {
    showToast(KR.toastUploadError + e.message, "error");
    showAILoadingOverlay(false); hideProgress(); S.isProcessing = false;
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
    return;
  }
  setProgress(0.55);

  var verResult;
  try {
    if (S.capturedBlob) {
      verResult = await verifyCleanup(S.capturedBlob, S.afterBlob);
    } else {
      verResult = { verified: true, comment_kr: "Aldınǵı súwret tabılmadı, tazalanǵan dep esaplanadı." };
    }
  } catch(e) {
    showToast(KR.toastVerifyError + e.message, "error");
    showAILoadingOverlay(false); hideProgress(); S.isProcessing = false;
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
    return;
  }

  showAILoadingOverlay(false);
  setProgress(0.92);

  if (verResult.verified) {
    var step3 = document.getElementById("cstep-3");
    if (step3) step3.classList.add("done");
    try {
      await updateReportStatus(S.activeReport.id, "green", afterUrl);
      await awardPoints(CONFIG.pointsCleaner);
      S.userCleanups++;
      closeModal("cleaner-modal");
      showToast(KR.toastVerifiedOk + CONFIG.pointsCleaner + KR.toastVerifiedPts, "success");
      showConfetti();
      _updateLeaderboard();
      _updateProfile();
    } catch(e) {
      showToast(KR.toastSaveError + e.message, "error");
    }
  } else {
    updateReportStatus(S.activeReport.id, "red").catch(function(e) { console.warn(e); });
    showToast(KR.toastVerifiedFail + verResult.comment_kr + '"', "error");
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
  }

  S.afterBlob = null; S.activeReport = null; S.isProcessing = false; hideProgress();
}

/* ════════════════════════════════════════════════
   BEFORE/AFTER SLIDER
════════════════════════════════════════════════ */
function showBeforeAfter(beforeUrl, afterUrl) {
  if (!beforeUrl && !afterUrl) return;
  var overlay   = document.getElementById("ba-overlay");
  var imgBefore = document.getElementById("ba-img-before");
  var imgAfter  = document.getElementById("ba-img-after");
  var divider   = document.getElementById("ba-divider");
  var wrap      = document.getElementById("ba-slider-wrap");
  if (!overlay) return;

  if (imgBefore) imgBefore.src = beforeUrl || "";
  if (imgAfter)  imgAfter.src  = afterUrl  || beforeUrl || "";
  if (imgAfter)  imgAfter.style.clipPath = "inset(0 50% 0 0)";
  if (divider)   divider.style.left = "50%";
  overlay.classList.add("show");

  var dragging = false;
  function setPos(clientX) {
    var rect = wrap.getBoundingClientRect();
    var pct  = (clientX - rect.left) / rect.width;
    pct = Math.max(0.02, Math.min(0.98, pct));
    if (imgAfter) imgAfter.style.clipPath = "inset(0 " + ((1 - pct) * 100).toFixed(1) + "% 0 0)";
    if (divider)  divider.style.left = (pct * 100).toFixed(1) + "%";
  }
  function onDown(e) { dragging = true; setPos(e.touches ? e.touches[0].clientX : e.clientX); }
  function onMove(e) { if (!dragging) return; setPos(e.touches ? e.touches[0].clientX : e.clientX); }
  function onUp()    { dragging = false; }

  if (wrap) {
    wrap.addEventListener("mousedown",  onDown);
    wrap.addEventListener("touchstart", onDown, { passive: true });
  }
  document.addEventListener("mousemove", onMove);
  document.addEventListener("touchmove", onMove, { passive: true });
  document.addEventListener("mouseup",   onUp);
  document.addEventListener("touchend",  onUp);

  overlay._cleanup = function() {
    if (wrap) {
      wrap.removeEventListener("mousedown",  onDown);
      wrap.removeEventListener("touchstart", onDown);
    }
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("mouseup",   onUp);
    document.removeEventListener("touchend",  onUp);
  };
}

function closeBeforeAfter() {
  var overlay = document.getElementById("ba-overlay");
  if (!overlay) return;
  overlay.classList.remove("show");
  if (overlay._cleanup) { overlay._cleanup(); overlay._cleanup = null; }
}

/* ════════════════════════════════════════════════
   AI LOADING OVERLAY
════════════════════════════════════════════════ */
function showAILoadingOverlay(show) {
  var el = document.getElementById("ai-loading-overlay");
  if (el) el.classList.toggle("show", show);
}

/* ════════════════════════════════════════════════
   ECOLOGY TAB
════════════════════════════════════════════════ */
async function _loadWeatherUI() {
  var loadingEl = document.getElementById("eco-loading");
  var contentEl = document.getElementById("eco-content");
  if (loadingEl) loadingEl.style.display = "flex";
  if (contentEl) contentEl.style.display = "none";

  try {
    var w = await fetchWeather();
    S.weatherData = w;
    S.aqiData     = { aqi: w.aqi, label: w.aqiLabel, pm25: w.pm25, pm10: w.pm10 };

    // Map env panel yangilash
    var tempEl = document.getElementById("temp-display");
    if (tempEl) tempEl.textContent = w.temp + "°C";

    var aqiEl = document.getElementById("aqi-display");
    if (aqiEl) {
      aqiEl.style.color = w.aqi < 50 ? "var(--primary)" : w.aqi < 100 ? "var(--amber)" : "var(--error)";
      aqiEl.innerHTML   = '<span class="material-symbols-outlined" style="font-size:12px;">air</span>' + w.aqi;
    }

    _renderEcoTab(w);
    if (loadingEl) loadingEl.style.display = "none";
    if (contentEl) contentEl.style.display = "flex";
  } catch(e) {
    console.error("Weather error:", e);
    if (loadingEl) loadingEl.innerHTML = '<p style="color:var(--error);font-size:13px;">Hawa yuklanmadi.</p>';
  }
}

function _renderEcoTab(w) {
  function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  set("eco-temp-val",  w.temp + "°C");
  set("eco-temp-val2", w.temp + "°C");
  set("eco-feels-val", w.feelsLike + "°C");
  set("eco-hum-val",   w.humidity + "%");
  set("eco-wind-val",  w.windSpeed + " m/s");
  set("eco-desc-val",  w.description);
  set("eco-aqi-num",   String(w.aqi));
  set("eco-pm25-val",  w.pm25 != null ? w.pm25.toFixed(1) : "—");
  set("eco-pm10-val",  w.pm10 != null ? w.pm10.toFixed(1) : "—");

  var numEl = document.getElementById("eco-aqi-num");
  if (numEl) numEl.style.color = w.aqi < 50 ? "#16a34a" : w.aqi < 100 ? "#d97706" : "#dc2626";

  var labelEl = document.getElementById("eco-aqi-label-text");
  if (labelEl) {
    var label, color;
    if      (w.aqi <= 50)  { label = KR.ecoAQIGood;  color = "#16a34a"; }
    else if (w.aqi <= 100) { label = KR.ecoAQIMed;   color = "#d97706"; }
    else if (w.aqi <= 150) { label = KR.ecoAQIBad;   color = "#dc2626"; }
    else                   { label = KR.ecoAQIVBad;  color = "#7c3aed"; }
    labelEl.textContent = label;
    labelEl.style.color = color;
  }

  var barEl = document.getElementById("eco-aqi-bar");
  if (barEl) {
    barEl.style.width      = Math.min((w.aqi / 200) * 100, 100) + "%";
    barEl.style.background = w.aqi < 50 ? "hsl(120,70%,45%)" : w.aqi < 100 ? "hsl(38,70%,45%)" : "hsl(0,70%,45%)";
  }
}

async function getAIConsultation() {
  var btn    = document.getElementById("eco-consult-btn");
  var loadEl = document.getElementById("eco-consult-loading");
  var boxEl  = document.getElementById("eco-consult-box");

  if (btn) btn.disabled = true;
  if (loadEl) loadEl.style.display = "flex";

  if (!S.weatherData) {
    showToast(KR.ecoLoadingWeather, "info");
    if (btn) btn.disabled = false;
    if (loadEl) loadEl.style.display = "none";
    return;
  }

  try {
    var aqiInput = S.aqiData || { aqi: S.weatherData.aqi, label: S.weatherData.aqiLabel, pm25: null, pm10: null };
    var advice   = await getEcoConsultation(S.weatherData, aqiInput);

    if (loadEl) loadEl.style.display = "none";
    if (boxEl) {
      boxEl.style.display = "flex";
      function setEl(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
      setEl("eco-consult-greeting", advice.greeting      || "");
      setEl("eco-consult-clothes",  advice.clothes_advice || "");
      setEl("eco-consult-health",   advice.health_advice  || "");
      setEl("eco-consult-outdoor",  advice.outdoor_advice || "");
      var tipsEl = document.getElementById("eco-consult-tips");
      if (tipsEl && advice.tips) {
        tipsEl.innerHTML = (advice.tips || []).map(function(t) {
          return '<div class="consult-tip">• ' + t + '</div>';
        }).join("");
      }
    }
  } catch(e) {
    showToast(KR.toastAIError + e.message, "error");
    if (loadEl) loadEl.style.display = "none";
  }
  if (btn) btn.disabled = false;
}

function refreshWeather() { _loadWeatherUI(); }

/* ════════════════════════════════════════════════
   B2B PANEL
════════════════════════════════════════════════ */
function openB2BSheet() { _renderB2BFilters(); _renderB2BList(); openSheet("b2b-sheet"); }

function _renderB2BFilters() {
  var filters = [KR.b2bFilterAll, KR.b2bFilterPlastic, KR.b2bFilterPaper, KR.b2bFilterConstruct];
  var el = document.getElementById("b2b-filters");
  if (!el) return;
  el.innerHTML = filters.map(function(f) {
    var cls = f === S.b2bFilter ? "chip chip-active" : "chip chip-default";
    return '<span class="' + cls + '" onclick="filterB2B(\'' + f + '\')">' + f + '</span>';
  }).join("");
}

function filterB2B(f) { S.b2bFilter = f; _renderB2BFilters(); _renderB2BList(); }

function _renderB2BList() {
  var filtered = COMPANIES.filter(function(c) {
    return S.b2bFilter === KR.b2bFilterAll ? true : c.types.indexOf(S.b2bFilter) !== -1;
  });
  var el = document.getElementById("b2b-list");
  if (!el) return;

  if (!filtered.length) {
    el.innerHTML = '<p style="text-align:center;color:var(--outline-var);padding:32px 0;font-size:14px;">' + KR.b2bNotFound + '</p>';
    return;
  }

  el.innerHTML = filtered.map(function(c) {
    var stars = "★".repeat(Math.round(c.rating)) + "☆".repeat(5 - Math.round(c.rating));
    var tags  = c.types.filter(function(t) { return t !== KR.b2bFilterAll; }).map(function(t) {
      return '<span style="font-size:10px;padding:3px 8px;border-radius:var(--r-full);background:rgba(41,102,76,.1);color:var(--primary);font-weight:700;">' + t + '</span>';
    }).join("");
    return '<div onclick="flyToCompany(' + c.lat + ',' + c.lng + ')" style="padding:14px;border-radius:var(--r-xl);margin-bottom:10px;background:rgba(185,249,214,.1);border:1px solid rgba(185,249,214,.25);cursor:pointer;transition:var(--trans);" onmouseover="this.style.background=\'rgba(185,249,214,.2)\'" onmouseout="this.style.background=\'rgba(185,249,214,.1)\'">'
      + '<div style="font-size:14px;font-weight:800;color:var(--primary-dim);margin-bottom:4px;">♻️ ' + c.name + '</div>'
      + '<div style="font-size:12px;color:var(--on-surface-var);margin-bottom:7px;">' + c.desc + '</div>'
      + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px;">' + tags + '<span style="font-size:11px;color:var(--amber);">' + stars + '</span></div>'
      + '<div style="font-size:11px;color:var(--outline-var);margin-bottom:9px;">⏰ ' + c.hours + ' • 📍 ' + c.addr + '</div>'
      + '<div style="display:flex;gap:7px;">'
      + '<a href="tel:' + c.phone + '" onclick="event.stopPropagation()" style="flex:1;padding:8px;border-radius:10px;background:var(--primary);color:#fff;font-size:12px;font-weight:700;text-align:center;text-decoration:none;">' + KR.b2bBtnCall + ' ' + c.phone + '</a>'
      + '<button onclick="event.stopPropagation();flyToCompany(' + c.lat + ',' + c.lng + ')" style="flex:1;padding:8px;border-radius:10px;background:rgba(41,102,76,.1);color:var(--primary);font-size:12px;font-weight:700;border:1px solid rgba(185,249,214,.4);">' + KR.b2bBtnDir + '</button>'
      + '</div></div>';
  }).join("");
}

function flyToCompany(lat, lng) {
  closeSheet("b2b-sheet");
  showScreen("screen-map");
  if (S.map) S.map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
}

/* ════════════════════════════════════════════════
   REGION SHEET
════════════════════════════════════════════════ */
function openRegionSheet() {
  var list  = document.getElementById("region-list");
  if (!list) return;
  var items = [KR.regionAll].concat(REGIONS);
  list.innerHTML = items.map(function(r) {
    var checked = S.selectedRegion === r || (!S.selectedRegion && r === KR.regionAll);
    return '<div onclick="selectRegion(\'' + r.replace(/'/g, "\\'") + '\')" style="display:flex;align-items:center;justify-content:space-between;padding:13px 4px;border-bottom:1px solid rgba(171,174,173,.12);cursor:pointer;">'
      + '<span style="font-size:14px;font-weight:600;color:var(--on-surface);">' + r + '</span>'
      + (checked ? '<span class="material-symbols-outlined" style="color:var(--primary);font-size:20px;">check_circle</span>' : '')
      + '</div>';
  }).join("");
  openSheet("region-sheet");
}

function selectRegion(r) {
  S.selectedRegion = r === KR.regionAll ? null : r;
  closeSheet("region-sheet");
  showToast(KR.toastRegionSelect + r, "info");
}

/* ════════════════════════════════════════════════
   LEADERBOARD + CHARTS
════════════════════════════════════════════════ */
function _updateLeaderboard() {
  var myName = S.user && S.user.email ? S.user.email.split("@")[0] : "Siz";
  var all    = LEADERBOARD_MOCK.map(function(u) { return { name: u.name, pts: u.pts }; });

  if (S.user) {
    var idx = -1;
    for (var i = 0; i < all.length; i++) { if (all[i].name === myName) { idx = i; break; } }
    if (idx === -1) all.push({ name: myName, pts: S.userPoints, mine: true });
    else { all[idx].pts = Math.max(all[idx].pts, S.userPoints); all[idx].mine = true; }
  }
  all.sort(function(a, b) { return b.pts - a.pts; });
  all.forEach(function(u, i) { u.rank = i + 1; });

  var top3El = document.getElementById("lb-top3");
  if (top3El) {
    var top3   = all.slice(0, 3);
    var order  = [1, 0, 2];
    var medals = ["🥇", "🥈", "🥉"];
    var cls    = ["rank2", "rank1", "rank3"];
    top3El.innerHTML = order.map(function(i) {
      var u = top3[i]; if (!u) return "";
      var crown = i === 1 ? '<div class="lb-crown">👑</div>' : "";
      return '<div class="lb-medal ' + cls[i] + '">'
        + crown
        + '<div class="lb-medal-avatar">' + medals[i] + '</div>'
        + '<div class="lb-medal-name">' + u.name + (u.mine ? KR.lbYou : "") + '</div>'
        + '<div class="lb-medal-pts">' + u.pts + ' pt</div>'
        + '</div>';
    }).join("");
  }

  var lbList = document.getElementById("lb-list");
  if (lbList) {
    lbList.innerHTML = all.slice(3).map(function(u) {
      return '<div class="lb-row ' + (u.mine ? "mine" : "") + '">'
        + '<span class="lb-rank ' + (u.rank <= 5 ? "top" : "") + '">#' + u.rank + '</span>'
        + '<div class="lb-avatar-sm">' + u.name.charAt(0).toUpperCase() + '</div>'
        + '<span class="lb-name">' + u.name + (u.mine ? KR.lbYou : "") + '</span>'
        + '<span class="lb-pts">' + u.pts + '</span>'
        + '</div>';
    }).join("");
  }

  _renderBarChart();
  _renderDonutChart();
}

function _renderBarChart() {
  var el = document.getElementById("bar-chart-body");
  if (!el) return;
  var total = DISTRICT_POLLUTION.reduce(function(s, d) { return s + d.count; }, 0) || 1;
  el.innerHTML = DISTRICT_POLLUTION.map(function(d) {
    return '<div class="bar-row">'
      + '<span class="bar-label">' + d.name + '</span>'
      + '<div class="bar-track"><div class="bar-fill" style="width:' + (d.count / total * 100).toFixed(0) + '%;background:' + d.color + ';"></div></div>'
      + '<span class="bar-count">' + d.count + '</span>'
      + '</div>';
  }).join("");
}

function _renderDonutChart() {
  var el = document.getElementById("donut-wrap");
  if (!el) return;
  var stats = Object.keys(WASTE_COLORS).map(function(cat) {
    return { cat: cat, count: S.wasteStats[cat] || (Math.floor(Math.random() * 14) + 2), color: WASTE_COLORS[cat] };
  });
  var total = stats.reduce(function(s, x) { return s + x.count; }, 0) || 1;
  var r = 52, cx = 60, cy = 60, stroke = 16;
  var circ = 2 * Math.PI * r;
  var offset = 0, segments = "";
  stats.forEach(function(s) {
    var dash = s.count / total * circ;
    segments += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="' + stroke + '" stroke-dasharray="' + dash.toFixed(2) + ' ' + (circ - dash).toFixed(2) + '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90,' + cx + ',' + cy + ')"/>';
    offset += dash;
  });
  var svg = '<svg class="donut-svg" width="120" height="120" viewBox="0 0 120 120">' + segments
    + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - stroke / 2 - 4) + '" fill="var(--glass-bg)"/>'
    + '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="11" font-weight="800" fill="var(--on-surface-var)">' + total + '</text></svg>';
  var legend = stats.map(function(s) {
    return '<div class="donut-item"><div class="donut-dot" style="background:' + s.color + ';"></div><span class="donut-name">' + s.cat + '</span><span class="donut-pct">' + (s.count / total * 100).toFixed(0) + '%</span></div>';
  }).join("");
  el.innerHTML = svg + '<div class="donut-legend">' + legend + '</div>';
}

/* ════════════════════════════════════════════════
   PROFILE
════════════════════════════════════════════════ */
function _updateProfile() {
  var name  = S.user && S.user.email ? S.user.email.split("@")[0] : "—";
  var email = S.user ? S.user.email : "—";
  function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  set("prof-name",     name);
  set("prof-email",    email);
  set("prof-avatar",   name.charAt(0).toUpperCase());
  set("prof-points",   String(S.userPoints));
  set("prof-reports",  String(S.userReports));
  set("prof-cleanups", String(S.userCleanups));
  _updateMapPoints();
}

function _updateMapPoints() {
  var el = document.getElementById("map-points-val");
  if (el) el.textContent = S.userPoints;
}

/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function(s) { s.classList.remove("active"); });
  var screen = document.getElementById(id);
  if (screen) screen.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(function(n) { n.classList.remove("active"); });
  var navId = SCREEN_NAV_MAP[id];
  if (navId) { var navEl = document.getElementById(navId); if (navEl) navEl.classList.add("active"); }

  if (id === "screen-map") {
    setTimeout(function() { if (S.map) S.map.invalidateSize(); }, 200);
    setTimeout(function() { if (S.map) S.map.invalidateSize(); }, 600);
  }
  if (id === "screen-leaderboard") _updateLeaderboard();
  if (id === "screen-eco") {
    if (!S.weatherData) {
      _loadWeatherUI();
    } else {
      var l = document.getElementById("eco-loading");
      var c = document.getElementById("eco-content");
      if (l) l.style.display = "none";
      if (c) c.style.display = "flex";
    }
  }
}

/* ════════════════════════════════════════════════
   SHEETS / MODALS
════════════════════════════════════════════════ */
function openSheet(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add("show");
  var bd = document.getElementById("backdrop");
  if (bd) bd.classList.add("show");
}
function closeSheet(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove("show");
  if (!document.querySelector(".bottom-sheet.show")) {
    var bd = document.getElementById("backdrop");
    if (bd) bd.classList.remove("show");
  }
}
function closeAllSheets() {
  document.querySelectorAll(".bottom-sheet").forEach(function(s) { s.classList.remove("show"); });
  var bd = document.getElementById("backdrop");
  if (bd) bd.classList.remove("show");
}
function showModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add("show");
  var bd = document.getElementById("modal-backdrop");
  if (bd) bd.classList.add("show");
}
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove("show");
  if (!document.querySelector(".modal-overlay.show")) {
    var bd = document.getElementById("modal-backdrop");
    if (bd) bd.classList.remove("show");
  }
}
function closeAllModals() {
  document.querySelectorAll(".modal-overlay").forEach(function(m) { m.classList.remove("show"); });
  var bd = document.getElementById("modal-backdrop");
  if (bd) bd.classList.remove("show");
}

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
function showToast(msg, type) {
  type = type || "info";
  var wrap = document.getElementById("toast-wrap");
  if (!wrap) return;
  var el = document.createElement("div");
  el.className   = "toast toast-" + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 3800);
}

/* ════════════════════════════════════════════════
   PROGRESS BAR
════════════════════════════════════════════════ */
function setProgress(v) {
  var b = document.getElementById("progress-bar");
  if (!b) return;
  b.style.display   = "block";
  b.style.transform = "scaleX(" + v + ")";
}
function hideProgress() {
  var b = document.getElementById("progress-bar");
  if (!b) return;
  b.style.transform = "scaleX(1)";
  setTimeout(function() { b.style.display = "none"; b.style.transform = "scaleX(0)"; }, 420);
}

function _setFabLoading(on) {
  var fab = document.getElementById("map-fab");
  if (!fab) return;
  if (on) {
    fab.classList.add("loading");
    fab.innerHTML = '<span class="spinner"></span> Tahlil...';
  } else {
    fab.classList.remove("loading");
    fab.innerHTML = '<span class="material-symbols-outlined" style="font-size:21px;">photo_camera</span><span>' + KR.mapBtnScan + '</span>';
  }
}

/* ════════════════════════════════════════════════
   CONFETTI
════════════════════════════════════════════════ */
function showConfetti() {
  var canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  canvas.style.display = "block";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx    = canvas.getContext("2d");
  var colors = ["#29664c","#b9f9d6","#f59e0b","#4cc9f0","#fff","#74c69d","#ffd700"];
  var particles = [];
  for (var i = 0; i < 150; i++) {
    particles.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * -canvas.height * 0.65,
      r:     3 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx:    (Math.random() - 0.5) * 4,
      vy:    2 + Math.random() * 5,
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.28,
    });
  }
  var frame = 0;
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.7);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.angle += p.spin;
    });
    if (++frame < 190) requestAnimationFrame(draw);
    else { canvas.style.display = "none"; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  })();
}

/* ════════════════════════════════════════════════
   STATIC TEXTS (KR → DOM)
════════════════════════════════════════════════ */
function _populateStaticTexts() {
  function set(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
  function ph(id, text)  { var el = document.getElementById(id); if (el) el.placeholder  = text; }

  set("ob-eyebrow",KR.onboardEyebrow); set("ob-title",KR.onboardTitle);
  set("ob-accent", KR.onboardTitleAccent); set("ob-sub",KR.onboardSub);
  set("f1-title",KR.feature1Title); set("f1-desc",KR.feature1Desc);
  set("f2-title",KR.feature2Title); set("f2-desc",KR.feature2Desc);
  set("f3-title",KR.feature3Title); set("f3-desc",KR.feature3Desc);
  set("f4-title",KR.feature4Title); set("f4-desc",KR.feature4Desc);
  set("label-email",KR.labelEmail); set("label-password",KR.labelPassword);
  ph("auth-email",KR.placeholderEmail); ph("auth-password",KR.placeholderPassword);
  set("btn-login-text",KR.btnLogin); set("btn-register-text",KR.btnRegister);
  set("btn-demo-text",KR.btnDemo); set("divider-text",KR.dividerOr);
  set("app-version",KR.appVersion);
  set("map-brand-text",KR.mapBrand); set("map-pts-label",KR.mapLabelBal);
  set("env-weather-label",KR.mapLabelHawa); set("env-aqi-label",KR.mapLabelAQI);
  set("env-markers-label",KR.mapLabelBelgiler); set("fab-label",KR.mapBtnScan);
  set("scan-empty-text",KR.scanEmptyText); set("scan-empty-small",KR.scanEmptySmall);
  set("scan-ai-label",KR.scanAILabel); set("scan-eyebrow",KR.scanEyebrow);
  set("scan-title",KR.scanTitle); set("scan-ai-natiya",KR.scanAINatiya);
  set("scan-c1-tag",KR.scanCard1Tag); set("scan-c1-title",KR.scanCard1Title); set("scan-c1-desc",KR.scanCard1Desc);
  set("scan-c2-tag",KR.scanCard2Tag); set("scan-c2-title",KR.scanCard2Title); set("scan-c2-desc",KR.scanCard2Desc);
  set("scan-c3-tag",KR.scanCard3Tag); set("scan-c3-title",KR.scanCard3Title); set("scan-c3-desc",KR.scanCard3Desc);
  set("scan-c4-tag",KR.scanCard4Tag); set("scan-c4-title",KR.scanCard4Title); set("scan-c4-desc",KR.scanCard4Desc);
  ph("scan-desc-input",KR.scanDescPlaceholder);
  var voiceBtn = document.getElementById("voice-btn");
  if (voiceBtn) voiceBtn.title = KR.scanVoiceBtn;
  set("ai-loading-text",KR.aiAnalyzing); set("ai-loading-sub",KR.aiAnalyzingSubtitle);
  set("consent-title",KR.consentTitle); set("consent-body",KR.consentBody);
  set("consent-note",KR.consentNote); set("consent-accept-text",KR.consentAccept);
  set("consent-decline-text",KR.consentDecline);
  set("cleaner-title",KR.cleanerTitle); set("cleaner-body",KR.cleanerBody);
  set("cleaner-drop-text",KR.cleanerDropText); set("cleaner-drop-small",KR.cleanerDropSmall);
  set("cleaner-verify-text",KR.cleanerVerifyBtn); set("cleaner-cancel-text",KR.cleanerCancelBtn);
  set("decision-sheet-title",KR.aiDecisionTitle);
  set("decision-confirm-btn-text",KR.aiDecisionConfirm);
  set("decision-reject-btn-text",KR.aiDecisionReject);
  set("lb-title",KR.lbTitle); set("lb-sub",KR.lbSubtitle);
  set("lb-mission-title",KR.lbWeeklyMission);
  set("lb-m1",KR.lbMission1); set("lb-m2",KR.lbMission2); set("lb-m3",KR.lbMission3);
  set("lb-chart-title",KR.lbChartTitle);
  set("lb-chart-polluted",KR.lbChartPolluted); set("lb-chart-waste",KR.lbChartWaste);
  set("eco-tab-title",KR.ecoTabTitle);
  set("eco-header-sub",KR.ecoWeatherSubhead || "Nókis, Qaraqalpaqstan");
  set("eco-loading-label",KR.ecoLoadingWeather);
  set("eco-feels-label",KR.ecoFeels); set("eco-temp-label",KR.ecoTemp);
  set("eco-hum-label",KR.ecoHumidity); set("eco-wind-label",KR.ecoWind);
  set("eco-aqi-label-header",KR.ecoAqiLabelHeader || KR.ecoAQICard);
  set("eco-pm25-label",KR.ecoPM25); set("eco-pm10-label",KR.ecoPM10);
  set("eco-refresh-btn",KR.ecoRefreshBtn);
  set("eco-consult-btn-text",KR.ecoConsultBtn);
  set("eco-consult-loading-text",KR.ecoConsultLoading);
  set("eco-consult-title-text",KR.ecoConsultTitle);
  set("eco-section-clothes",KR.ecoConsultClothes);
  set("eco-section-health",KR.ecoConsultHealth);
  set("eco-section-outdoor",KR.ecoConsultOutdoor);
  set("eco-section-tips",KR.ecoConsultTips);
  set("prof-label-bal",KR.profLabelBal); set("prof-label-belgiler",KR.profLabelBelgiler);
  set("prof-label-tazalaw",KR.profLabelTazalaw);
  set("prof-sec-faoliyat",KR.profSectionFaoliyat); set("prof-sec-settings",KR.profSectionSettings);
  set("pmi-map",KR.profMenuMap); set("pmi-map-sub",KR.profMenuMapSub);
  set("pmi-lb",KR.profMenuLb); set("pmi-lb-sub",KR.profMenuLbSub);
  set("pmi-b2b",KR.profMenuB2B); set("pmi-b2b-sub",KR.profMenuB2BSub);
  set("pmi-eco",KR.profMenuEco || "Ekologiya"); set("pmi-eco-sub",KR.profMenuEcoSub || "Hawa rayı hám AQI");
  set("pmi-settings",KR.profMenuSettings); set("pmi-settings-sub",KR.profMenuSettingsSub);
  set("pmi-notif",KR.profMenuNotif); set("pmi-notif-sub",KR.profMenuNotifSub);
  set("pmi-dark",KR.profMenuDark); set("pmi-dark-sub",KR.profMenuDarkSub);
  set("pmi-logout",KR.profMenuLogout);
  set("nav-map-label",KR.navMap); set("nav-scan-label",KR.navScan);
  set("nav-eco-label",KR.navEco); set("nav-lb-label",KR.navLb);
  set("nav-profile-label",KR.navProfile);
  set("region-sheet-title",KR.regionTitle); set("b2b-sheet-title",KR.b2bTitle);
  set("ba-title-text",KR.beforeAfterTitle);
  set("ba-label-before",KR.beforeAfterBefore); set("ba-label-after",KR.beforeAfterAfter);
  set("ba-close-text",KR.beforeAfterClose);
}