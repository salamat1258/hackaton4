// ============================================================
// api.js — EcoMap Qaraqalpaqstan v3.0
// FIX #2: maxOutputTokens:1500 + responseMimeType:"application/json"
// NEW: Anti-cheat prompt, Reverse geocoding, Eco consult AI
// ============================================================

/* ════════════════════════════════════════════════
   CLOUDINARY — Rasm yuklash
════════════════════════════════════════════════ */
async function uploadImage(blob) {
  if (!CONFIG.cloudinaryUrl || !CONFIG.cloudinaryPreset) {
    console.warn("[API] Cloudinary sozlanmagan — mock URL");
    return "https://picsum.photos/seed/" + Date.now() + "/600/400";
  }
  const fd = new FormData();
  fd.append("file",           blob);
  fd.append("upload_preset",  CONFIG.cloudinaryPreset);
  fd.append("folder",         "ecomap_qaraqalpaqstan");
  const res = await fetch(CONFIG.cloudinaryUrl, { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error("Cloudinary: " + (err.error?.message || res.statusText));
  }
  const data = await res.json();
  return data.secure_url;
}

/* ════════════════════════════════════════════════
   GEMINI — AI Engine
════════════════════════════════════════════════ */
const _GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve({
      data:     reader.result.split(",")[1],
      mimeType: blob.type || "image/jpeg",
    });
    reader.onerror = () => reject(new Error("FileReader xatoligi"));
    reader.readAsDataURL(blob);
  });
}

// FIX #2: responseMimeType + maxOutputTokens:1500
function parseGeminiJSON(raw) {
  if (!raw) throw new Error("Gemini bo'sh javob qaytardi");
  let s = raw.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  const start = s.indexOf("{");
  const end   = s.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("JSON topilmadi. Raw: " + s.slice(0, 200));
  }
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch (e) {
    throw new Error("JSON parse xatoligi: " + e.message + " | " + s.slice(0, 120));
  }
}

// Central Gemini caller — FIX #2 applied here
async function callGemini(parts) {
  if (!CONFIG.geminiKey) return null;
  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature:      0.2,
      maxOutputTokens:  1500,          // FIX #2: prevent JSON cutoff
      responseMimeType: "application/json", // FIX #2: force JSON response
    },
  };
  const url = `${_GEMINI_BASE}/${CONFIG.geminiModel}:generateContent?key=${CONFIG.geminiKey}`;
  const res  = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error("Gemini API: " + (err.error?.message || res.statusText));
  }
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Spotter: single image analysis + anti-cheat
async function analyzeImage(blob, userDescription) {
  // Demo mode (no API key)
  if (!CONFIG.geminiKey) {
    const types    = ["Plastik shısha", "Qaǵaz qaldıqlar", "Maishiy chiqindi", "Qurilish qoldiqlari", "Metal qaldıqlar"];
    const comments = [
      "Kishi kólemdegi litter anıqlandı. Ózińiz tazalawıńız múmkin.",
      "Orta kólemdegi dump. Bir neshe kishi járdem berse boladi.",
      "Úlken kólemdegi qaldıq. Arnawlı kompaniya kerek.",
    ];
    const cats  = ["Plastik", "Qaǵaz", "Qurılıs", "Maishiy", "Aralash"];
    const level = Math.floor(Math.random() * 3) + 1;
    return {
      type_kr:          types[Math.floor(Math.random() * types.length)],
      level,
      comment_kr:       comments[level - 1],
      waste_category:   cats[Math.floor(Math.random() * cats.length)],
      is_valid_outdoor: true,
    };
  }

  const { data, mimeType } = await blobToBase64(blob);
  const parts = [
    { text: KR.promptSpotter },
    { inline_data: { mime_type: mimeType, data } },
  ];
  if (userDescription && userDescription.trim()) {
    parts.push({ text: `Additional user description: "${userDescription.trim()}"` });
  }
  const raw = await callGemini(parts);
  return parseGeminiJSON(raw);
}

// Cleaner: before + after comparison
async function verifyCleanup(beforeBlob, afterBlob) {
  if (!CONFIG.geminiKey) {
    const ok = Math.random() > 0.2;
    return {
      verified:   ok,
      comment_kr: ok
        ? "Tahlil nátiyjesinde joy tazalanǵan kórinedi. Rahmet!"
        : "Aldınǵı hám keyingi súwretler ayırmaǵı anıq emes. Qayta urınıp kóriń.",
    };
  }
  const [before, after] = await Promise.all([
    blobToBase64(beforeBlob),
    blobToBase64(afterBlob),
  ]);
  const parts = [
    { text: KR.promptVerifier },
    { text: "BEFORE image (pollution reported):" },
    { inline_data: { mime_type: before.mimeType, data: before.data } },
    { text: "AFTER image (cleanup attempt):" },
    { inline_data: { mime_type: after.mimeType,  data: after.data  } },
  ];
  const raw = await callGemini(parts);
  return parseGeminiJSON(raw);
}

// Ecology AI consultant
async function getEcoConsultation(weatherData, aqiData) {
  if (!CONFIG.geminiKey) {
    return {
      greeting:       "Sálem! Búgin hawa " + weatherData.temp + "°C.",
      clothes_advice: "Hawa rayı tiykarında yengil kiyim kiyin.",
      health_advice:  "Hawa sapası " + aqiData.label + ". Kóp waqıt sırtta bolmań.",
      outdoor_advice: "Erté ertewinde yáki keshinde sırtta júriw ushın qolaylı waqıt.",
      tips:           ["Kóbrek suw ishine", "Terezeni az ashıń", "Maydanlardá boluń"],
    };
  }
  const dataText = `Current weather data for Nókis (Nukus), Qaraqalpaqstan:
- Temperature: ${weatherData.temp}°C (feels like ${weatherData.feelsLike}°C)
- Condition: ${weatherData.description}
- Humidity: ${weatherData.humidity}%
- Wind speed: ${weatherData.windSpeed} m/s
- AQI index: ${aqiData.aqi} (${aqiData.label})
- PM2.5: ${aqiData.pm25 ?? "N/A"} µg/m³
- PM10:  ${aqiData.pm10 ?? "N/A"} µg/m³`;

  const parts = [
    { text: KR.promptEcoConsult },
    { text: dataText },
  ];
  const raw = await callGemini(parts);
  return parseGeminiJSON(raw);
}

/* ════════════════════════════════════════════════
   REVERSE GEOCODING — OpenStreetMap Nominatim
════════════════════════════════════════════════ */
async function reverseGeocode(lat, lng) {
  try {
    const url  = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`;
    const res  = await fetch(url, { headers: { "User-Agent": "EcoMapKR/3.0 (hackathon)" } });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const parts = [];
    const city = addr.city || addr.town || addr.village || addr.municipality;
    if (city)  parts.push(city);
    const road = addr.road || addr.pedestrian || addr.footway || addr.street;
    if (road) {
      const full = addr.house_number ? `${road} ${addr.house_number}` : road;
      parts.push(full);
    }
    return parts.join(", ") || data.display_name?.split(",").slice(0, 2).join(",").trim() || null;
  } catch {
    return null;
  }
}

/* ════════════════════════════════════════════════
   OPENWEATHER — Havo & AQI
════════════════════════════════════════════════ */
async function fetchWeather() {
  const { defaultLat: lat, defaultLng: lon, openWeatherKey: key } = CONFIG;
  if (!key) return _mockWeather();
  try {
    const [wRes, aRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`),
    ]);
    if (!wRes.ok) throw new Error("Weather API error");
    const wData = await wRes.json();
    const temp       = Math.round(wData.main.temp);
    const feelsLike  = Math.round(wData.main.feels_like);
    const humidity   = wData.main.humidity;
    const windSpeed  = Math.round(wData.wind.speed);
    const description = wData.weather?.[0]?.description || "";
    const icon        = wData.weather?.[0]?.icon || "01d";
    let aqi = 45, pm25 = null, pm10 = null;
    if (aRes.ok) {
      const aData = await aRes.json();
      const idx = aData.list?.[0]?.main?.aqi || 1;
      const map = { 1:22, 2:52, 3:103, 4:158, 5:210 };
      aqi  = map[idx] || 45;
      pm25 = aData.list?.[0]?.components?.pm2_5 ?? null;
      pm10 = aData.list?.[0]?.components?.pm10  ?? null;
    }
    return { temp, feelsLike, humidity, windSpeed, description, icon, aqi, aqiLabel: _aqiLabel(aqi), pm25, pm10 };
  } catch (e) {
    console.warn("[Weather] API error, using mock:", e.message);
    return _mockWeather();
  }
}

function _mockWeather() {
  const months = [0, 3, 10, 18, 25, 30, 34, 33, 27, 18, 9, 2];
  const temp   = months[new Date().getMonth()] + Math.floor(Math.random() * 5 - 2);
  const aqi    = [28, 35, 42, 50, 62][Math.floor(Math.random() * 5)];
  return {
    temp, feelsLike: temp - 2,
    humidity:   40 + Math.floor(Math.random() * 30),
    windSpeed:   2 + Math.floor(Math.random() * 6),
    description: "Taza hawa", icon: "01d",
    aqi, aqiLabel: _aqiLabel(aqi), pm25: null, pm10: null,
  };
}

function _aqiLabel(aqi) {
  if (aqi <= 50)  return KR.mapAqiGood;
  if (aqi <= 100) return KR.mapAqiMed;
  return KR.mapAqiBad;
}

/* ════════════════════════════════════════════════
   GPS — Joylashuv
════════════════════════════════════════════════ */
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GPS qo'llab-quvvatlanmaydi"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos  => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err  => reject(new Error("GPS: " + err.message)),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  });
}
