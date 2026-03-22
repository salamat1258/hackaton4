// ============================================================
// lang.js — EcoMap Qaraqalpaqstan v3.0
// Barlıq UI tekstleri, túyme belgileri, AI promptları
// ============================================================
const KR = {

  // ── Onboarding ──────────────────────────────────────────────
  onboardEyebrow:       "Qaraqalpaqstan • 2026",
  onboardTitle:         "Taza keleshek ushın",
  onboardTitleAccent:   '"The Living Lens"',
  onboardSub:           "Qaraqalpaqstan ekologiyasın qorǵawdaǵı platformaǵa xosh keldińiz. Kóriń, analiz etiń, qatnasıń.",
  feature1Title:        "Súwretke tartıń",
  feature1Desc:         "AI járdeminde shıǵındını analiz etiń",
  feature2Title:        "Kartada kóriń",
  feature2Desc:         "Átirapıńızdaǵı jaǵdaylar",
  feature3Title:        "Tazalań",
  feature3Desc:         "Problemalardı sheshiwge úles qosıń",
  feature4Title:        "Ball jıynań",
  feature4Desc:         "Liderler taxtasına kiriń",
  labelEmail:           "Email",
  labelPassword:        "Qupıya sóz (Parol)",
  placeholderEmail:     "siziń@email.com",
  placeholderPassword:  "••••••••",
  btnLogin:             "Kiriw",
  btnRegister:          "Dizimnen ótiw",
  btnDemo:              "Demo rejimde kiriw",
  dividerOr:            "yamasa demo rejimde",
  appVersion:           "EcoMap KR v3.0 • Qaraqalpaqstan 🌿",

  // ── Auth ─────────────────────────────────────────────────────
  authFillFields:  "Email hám qupıya sóz tolıq bolıwı kerek.",
  authNoSupabase:  "Supabase sazlanbaǵan. Demo rejimde kiriń.",
  authPassShort:   "Qupıya sóz keminde 6 belgiden ibarat bolıwı kerek.",
  authRegSuccess:  "Dizimnen óttińiz! Emaildi tastıyıqlań.",
  authLoginError:  "Kiriwde qátelik: ",
  authRegError:    "Dizimnen ótiwde qátelik: ",

  // ── Karta ───────────────────────────────────────────────────
  mapBrand:         "EcoMap KR",
  mapBtnScan:       "Skanerlew",
  mapLabelBal:      "ball",
  mapLabelHawa:     "Hawa rayı",
  mapLabelAQI:      "AQI (Hawa sapası)",
  mapLabelBelgiler: "Belgiler",
  mapAqiGood:       "Jaqsı",
  mapAqiMed:        "Ortasha",
  mapAqiBad:        "Zıyanlı",
  mapDirections:    "🗺️ Jol kórsetiw",
  mapStreetPrefix:  "📍 ",

  // ── Skanerlew ────────────────────────────────────────────────
  scanEyebrow:         "1-qádem",
  scanTitle:           "Eko-háreket tańlań",
  scanTitleReady:      "Analiz etiwge tayyarsız ba?",
  scanTitleDone:       "Belgi qosıldı! 🎉",
  scanTitleResult:     "Nátiyje",
  scanEmptyText:       "Súwretke aliw yáki tańlaw/juklew",
  scanEmptySmall:      "Shıǵındını anıqlaw ushın basıń",
  scanAILabel:         "AI Analizi",
  scanAINatiya:        "AI Nátiyjesi",
  scanCard1Tag:        "AI • Biyul",
  scanCard1Title:      "AI járdeminde analiz qılıw",
  scanCard1Desc:       "Súwret analiz etilip kartaǵa qosıladı",
  scanCard2Tag:        "1-qádem",
  scanCard2Title:      "Súwretke tartıw / tańlaw",
  scanCard2Desc:       "Kamera yáki galereya",
  scanCard3Tag:        "B2B • Kompaniya",
  scanCard3Title:      "Kompaniyaǵa xabar beriw",
  scanCard3Desc:       "Úlken kólemdegi shıǵındılar ushın",
  scanCard4Tag:        "Karta",
  scanCard4Title:      "Kartadaǵı jaǵdaylardı kóriw",
  scanCard4Desc:       "Jaqın átiraptaǵı belgiler",
  scanLevel1:          "Kishi",
  scanLevel2:          "Ortasha",
  scanLevel3:          "Úlken",
  scanDescPlaceholder: "Shıǵındı haqqında qısqasha jazıń... (májbúriy emes)",
  scanVoiceBtn:        "🎙️ Dawıs penen jazıw",
  scanVoiceListening:  "🎙️ Tıńlanbaqta...",
  scanVoiceStop:       "⏹️ Toqtatıw",
  scanVoiceNoSupport:  "Bul brauzerde dawıs penen jazıw qollap-quwatlanbaydı.",

  // ── AI Decision ──────────────────────────────────────────────
  aiDecisionTitle:     "AI Nátiyjesi — Tastıyıqlaw",
  aiDecisionConfirm:   "✅ Kartaǵa ornatıw",
  aiDecisionReject:    "❌ Biykarlaw",
  aiAnalyzing:         "Súwret analiz etilmepte...",
  aiAnalyzingSubtitle: "Gemini AI analizlep atır",

  // ── Geocoding ─────────────────────────────────────────────────
  toastGeocoding:   "📍 Mánzil anıqlanbaqta...",

  // ── Offline ──────────────────────────────────────────────────
  offlineQueued:  "Siz oflayn rejimdesiz. Súwret internet islegende avtomatikalıq túrde jiberiledi.",
  offlineSending: "Internet tiklendi! Gezektegi súwretler jiberilmepte...",
  offlineSent:    "Oflayn gezektegi súwretler tabıslı jiberildi! ✅",

  // ── Popup ────────────────────────────────────────────────────
  popupStatusRed:    "🔴 Tazalanbaǵan",
  popupStatusYellow: "🟡 Processte",
  popupStatusGreen:  "🟢 Tazalanǵan",
  popupCleanBtn:     "🧹 Men tazalayman",
  popupNoData:       "Belgisiz",
  popupBeforeAfter:  "📷 Aldın / Keyin kóriw",

  // ── Consent ──────────────────────────────────────────────────
  consentTitle:   "Raxılıq",
  consentBody:    "Bul súwret hám GPS koordinatańız ǵálaba EcoMap kartasına jaylastırıladı. Dawam etiw menen siz usı shártke razı bolasız.",
  consentNote:    "Barlıq maǵlıwmatlar Ózbekstan maǵlıwmatlardı qorǵaw nızamı tiykarında qollanıladı.",
  consentAccept:  "Raziman — Analiz etiw",
  consentDecline: "🚫 Biykarlaw",

  // ── Cleaner ──────────────────────────────────────────────────
  cleanerTitle:     "🧹 Tazalanǵanlıǵın tastıyıqlaw",
  cleanerBody:      "Tazalanǵan orınnıń «keyingi» súwretin alıń hám AI arqalı tastıyıqlawdan ótkeriń.",
  cleanerDropText:  "'Keyingi' súwretti júkleń",
  cleanerDropSmall: "Tazalanǵan orındı kórsetiń",
  cleanerVerifyBtn: "AI menen tastıyıqlaw",
  cleanerCancelBtn: "← Artqa",

  // ── Before/After ─────────────────────────────────────────────
  beforeAfterTitle:  "📷 Aldın / Keyin",
  beforeAfterBefore: "Aldın",
  beforeAfterAfter:  "Keyin",
  beforeAfterClose:  "Jabıw",

  // ── Toasts ───────────────────────────────────────────────────
  toastGpsWarn:      "GPS anıqlanbadı. Demo mánzil qollanıladı.",
  toastGpsError:     "GPS anıqlanbadı",
  toastUploading:    "Súwret júklenmepte...",
  toastAnalyzing:    "AI analiz etmepte...",
  toastVerifying:    "AI aldınǵı hám keyingi jaǵdaydı salıstırmaqta...",
  toastImgBig:       "Súwret júdá úlken (maks. 12MB)",
  toastUploadError:  "Júklewde qátelik: ",
  toastAIError:      "AI qáteligi: ",
  toastVerifyError:  "Tastıyıqlawda qátelik: ",
  toastSaveError:    "Saqlawda qátelik: ",
  toastNeedLogin:    "Kiriwińiz kerek!",
  toastNoSupabase:   "Supabase sazlanbaǵan.",
  toastNoPollu:      "ℹ️ Bul súwret shıǵındı emes: ",
  toastB2BAlert:     "⚠️ Úlken shıǵındı! Kompaniyalarga xabar berildi. +",
  toastB2BPts:       " ball",
  toastSaved:        "✅ Belgi saqlandı! +",
  toastSavedPts:     " ball",
  toastVerifiedOk:   "🎉 Tastıyıqlandı! +",
  toastVerifiedPts:  " ball. Raxmet!",
  toastVerifiedFail: "❌ AI tazalanǵanlıqtı anıqlay almadı. \"",
  toastRegionSelect: "📍 ",
  toastLocating:     "GPS ruxsatı joq",
  toastCancelled:    "Analiz biykarlanıldı.",
  toastPlacedOnMap:  "🗺️ Kartaǵa ornatıldı!",

  // ── Streak ───────────────────────────────────────────────────
  streakLabel: "Qatar",
  streakDays:  "kún",

  // ── B2B ──────────────────────────────────────────────────────
  b2bTitle:           "♻️ Qayta islew kompaniyaları",
  b2bNotFound:        "Tabılmadı",
  b2bFilterAll:       "Barlıǵı",
  b2bFilterPlastic:   "Plastik",
  b2bFilterPaper:     "Qaǵaz",
  b2bFilterConstruct: "Qurılıs",
  b2bBtnCall:         "📞 Qońıraw",
  b2bBtnDir:          "🗺️ Jol",

  // ── Region ───────────────────────────────────────────────────
  regionTitle: "🗺️ Rayondı tańlań",
  regionAll:   "Barlıq rayonlar",

  // ── Leaderboard ──────────────────────────────────────────────
  lbTitle:         "🏆 Liderler Taxtası",
  lbSubtitle:      "Qaraqalpaqstan ekologiyasına úles qosqanlar",
  lbYou:           " (Siz)",
  lbWeeklyMission: "🎯 Hápte Missiyası",
  lbMission1:      "50 orındı tazalań → 1GB Internet",
  lbMission2:      "10 belgi qoyıń → Kino bilet",
  lbMission3:      "Prison break → futbolka kiyim ",
  lbChartTitle:    "📊 Ekologiya Statistikası",
  lbChartPolluted: "Eń pátas rayonlar (Top 3)",
  lbChartWaste:    "Shıǵındı túrleri",

  // ── Ecology Tab ──────────────────────────────────────────────
  ecoTabTitle:        "🌿 Ekologiya",
  ecoWeatherCard:     "Hawa Rayı",
  ecoAQICard:         "Hawa Sapası",
  ecoTemp:            "Temperatura",
  ecoFeels:           "Seziledi",
  ecoHumidity:        "Iǵallıq",
  ecoWind:            "Samal",
  ecoAQIGood:         "✅ Jaqsı — Sırtta júriw múmkin",
  ecoAQIMed:          "⚠️ Qanaatlandırarlı — İtibarlı bolıń",
  ecoAQIBad:          "🔴 Zıyanlı — Sırtqa shıqpań",
  ecoAQIVBad:         "☠️ Oǵada Zıyanlı — Dárhal úyge qaytıń",
  ecoConsultBtn:      "🤖 AI Máslahatın alıw",
  ecoConsultTitle:    "🤖 AI Máslahatı",
  ecoConsultLoading:  "AI máslahat tayarlap atır...",
  ecoConsultClothes:  "👔 Kiyim Máslahatı",
  ecoConsultHealth:   "💊 Densawlıq Máslahatı",
  ecoConsultOutdoor:  "🌿 Sırtta Júriw",
  ecoConsultTips:     "💡 Qosımsha Máslahatlar",
  ecoRefreshBtn:      "🔄 Hawa rayın jańalaw",
  ecoPM25:            "PM2.5",
  ecoPM10:            "PM10",
  ecoLoadingWeather:  "Hawa rayı maǵlıwmatları júklenmepte...",
  ecoAqiLabelHeader:  "Hawa Sapası Indeksi",
  ecoWeatherSubhead:  "Nókis, Qaraqalpaqstan",

  // ── Profile ──────────────────────────────────────────────────
  profLabelBal:        "Ball",
  profLabelBelgiler:   "Belgiler",
  profLabelTazalaw:    "Tazalaw",
  profSectionFaoliyat: "Jumıslar",
  profSectionSettings: "Sazlawlar",
  profMenuMap:         "Karta",
  profMenuMapSub:      "Belgilerińizdi kartada kóriw",
  profMenuLb:          "Liderler Taxtası",
  profMenuLbSub:       "Reytingińizdi kóriw",
  profMenuB2B:         "B2B Kompaniyalar",
  profMenuB2BSub:      "Qayta islew orınları",
  profMenuEco:         "Ekologiya",
  profMenuEcoSub:      "Hawa rayı hám AQI",
  profMenuSettings:    "Profil sazlawları",
  profMenuSettingsSub: "Isim, súwretti ózgertiw",
  profMenuNotif:       "Bildiriwler",
  profMenuNotifSub:    "Push xabarlandırıwlar",
  profMenuDark:        "Tún rejim",
  profMenuDarkSub:     "Qara / Jasıl fon",
  profMenuLogout:      "Shıǵıw",

  // ── Navigation ───────────────────────────────────────────────
  navMap:     "Karta",
  navScan:    "Skanerlew",
  navEco:     "Ekologiya",
  navLb:      "Reyting",
  navProfile: "Profil",

  // ── Dark mode ────────────────────────────────────────────────
  darkModeOn:  "🌙 Tún rejimi qosıldı",
  darkModeOff: "☀️ Kúndiz rejimi qosıldı",

  // ══════════════════════════════════════════════════════════════
  // AI PROMPTLAR
  // ══════════════════════════════════════════════════════════════

  promptSpotter: `You are an expert environmental pollution detection AI for EcoMap Qaraqalpaqstan.

ANTI-CHEAT RULES (CRITICAL — evaluate these FIRST before classification):
1. INDOOR SCENE: If the image shows any indoor environment (home interior, office, kitchen, bathroom, indoor trash can/bin, desk, room, corridor, any indoor space) → set level=0, is_valid_outdoor=false.
2. CLEAN OUTDOOR: If the image shows an outdoor area but with NO visible waste or pollution → set level=0, is_valid_outdoor=false.
3. INVALID IMAGE: If the image is blurry, too dark, a selfie, shows only a person's face, a document, a screen, or is completely unrelated to environmental waste → set level=0, is_valid_outdoor=false.
4. VALID: ONLY set is_valid_outdoor=true for clear outdoor/street/field/nature scenes with ACTUAL VISIBLE waste or pollution.

WASTE CLASSIFICATION (only when is_valid_outdoor=true):
- level 1 = Small litter: few scattered items in a small area. One person can clean alone. (e.g., a few plastic bottles, paper scraps)
- level 2 = Medium dump: significant pile of mixed trash over a notable area. Needs group effort. (e.g., household garbage dump, scattered waste over 10-20 square meters)
- level 3 = Large/hazardous dump: massive illegal landfill, industrial waste, construction debris, chemical waste. Needs professional company. (e.g., construction rubble field, barrel dumps, very large landfill)

waste_category MUST be EXACTLY one of these 7 strings: "Plastik", "Qaǵaz", "Qurılıs", "Maishiy", "Aralash", "Kimyawiy", "Metal"

OUTPUT: Respond with ONLY a raw JSON object. No markdown. No backticks. No explanation. No text before or after. Just the JSON:
{"type_kr":"<waste type in Karakalpak language>","level":<0|1|2|3>,"comment_kr":"<1-2 sentence description in Karakalpak>","waste_category":"<one of 7 exact categories above>","is_valid_outdoor":<true|false>}`,

  promptVerifier: `You are a Karakalpak eco-verification AI for EcoMap Qaraqalpaqstan.
You receive TWO images: BEFORE (pollution reported by a citizen) and AFTER (cleanup attempt).
Determine whether the cleanup was genuine and successful.

OUTPUT: Respond with ONLY a raw JSON object. No markdown. No backticks. No explanation:
{"verified":<true|false>,"comment_kr":"<1-2 sentence explanation in Karakalpak language>"}

Verification rules:
- verified=true ONLY if AFTER image clearly shows waste removed or very significantly reduced vs BEFORE.
- The same physical location must be recognizable in both images. If locations look completely different → verified=false.
- Obvious waste still present in AFTER image → verified=false.
- Significant cleanup even if minor remnants remain → verified=true (be fair).
- Never refuse. Always return valid JSON.`,

  promptEcoConsult: `You are an eco-health consultant AI for Qaraqalpaqstan (Central Asia).
Based on the weather and AQI data, give practical daily advice for citizens of Nukus city.
Important context: Qaraqalpaqstan has extreme continental climate and suffers from Aral Sea salt-dust storms causing chronic air quality issues.

OUTPUT: Respond with ONLY a raw JSON object. No markdown. No backticks. No explanation:
{"greeting":"<warm greeting in Karakalpak mentioning today's weather>","clothes_advice":"<specific clothing recommendation for the temperature and conditions, in Karakalpak, 1-2 sentences>","health_advice":"<health precautions based on AQI level, in Karakalpak, 1-2 sentences>","outdoor_advice":"<outdoor activity recommendation including best/worst times, in Karakalpak, 1-2 sentences>","tips":["<practical tip 1 in Karakalpak>","<practical tip 2 in Karakalpak>","<practical tip 3 in Karakalpak>"]}`,
};
