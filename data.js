// data.js — EcoMap Qaraqalpaqstan v3.0
const REGIONS = [
  "Nókis qalası","Ámiwdárya rayonı","Beruniy rayonı","Bozataw rayonı",
  "Ellikqala rayonı","Kegeyli rayonı","Moynaq rayonı","Nókis rayonı",
  "Qanlıkól rayonı","Qaraózek rayonı","Qońırat rayonı","Shımbay rayonı",
  "Shomanay rayonı","Taqıyatas rayonı","Taxtakópir rayonı","Tórtkúl rayonı","Xojeli rayonı",
];

const COMPANIES = [
  { id:"c1", name:"QR 'Toza Hudud' DUK",     types:["Bárliǵi","Plastik","Qaǵaz"],               lat:42.4531, lng:59.6111, phone:"+998 94 808 55 55", addr:"Nókis, Berdaq kóshesi 12",      hours:"Du–Júm 08–18", rating:4.5, desc:"Nókistegi eń úlken qaldıq basqarıw kompaniyası." },
  { id:"c2", name:"EcoRecycle Qaraqalpaqstan", types:["Plastik"],                                  lat:42.4612, lng:59.6254, phone:"+998 93 512 44 33", addr:"Sanaát zonası 5-kósha",         hours:"Du–Şem 07:30–17:30", rating:4.2, desc:"PET butelkalar hám polietilen qayta isleydı." },
  { id:"c3", name:"'Jasıl Dúnya' Qurılıs",   types:["Qurılıs"],                                  lat:42.4478, lng:59.5983, phone:"+998 97 345 67 89", addr:"Xojeli, Sanaát rayonı 3",       hours:"Du–Júm 08–17",   rating:4.0, desc:"Beton, kırpish, metal konstruksialar." },
  { id:"c4", name:"PaperPlus Qaraqalpaqstan",  types:["Qaǵaz"],                                   lat:42.4695, lng:59.6388, phone:"+998 90 788 22 11", addr:"Gágarin dańǵılı 47",            hours:"Du–Şem 09–18",   rating:4.3, desc:"Qaǵaz, karton hám makulatura." },
  { id:"c5", name:"AralEco Kompleks",          types:["Bárliǵi","Plastik","Qaǵaz","Qurılıs"],    lat:42.4389, lng:59.6045, phone:"+998 95 123 99 88", addr:"Aqmańǵıt jolaǵı 2km",           hours:"Har kún 07–20",  rating:4.7, desc:"Kompleks qayta islew markazi." },
];

const LEADERBOARD_MOCK = [
  { name:"Aybek B.",   pts:1240 },{ name:"Gulnora T.", pts:980 },{ name:"Sardor M.",  pts:875 },
  { name:"Maftuna R.", pts:740  },{ name:"Jasur K.",   pts:620 },{ name:"Nodira A.",  pts:510 },
  { name:"Bobur X.",   pts:490  },{ name:"Zulfiya S.", pts:430 },{ name:"Timur N.",   pts:380 },
  { name:"Barno Y.",   pts:310  },
];

const DEMO_REPORTS = [
  { id:"d1", lat:42.461, lng:59.605, status:"red",    waste_type:"Plastik qaldıqlar",   ai_comment:"Kishi kólemdegi litter anıqlandı.", level:1, image_before:null, image_after:null, created_at:new Date().toISOString(), street_name:"Nókis qalası, Berdaq kóshesi", waste_category:"Plastik" },
  { id:"d2", lat:42.444, lng:59.622, status:"yellow", waste_type:"Maishiy chiqindilar", ai_comment:"Orta kólemdegi dump.", level:2, image_before:null, image_after:null, created_at:new Date().toISOString(), street_name:"Nókis qalası, Amir Temur kóchesi", waste_category:"Maishiy" },
  { id:"d3", lat:42.470, lng:59.632, status:"green",  waste_type:"Qaǵaz qaldıqlar",    ai_comment:"Tazalanǵan! Jaqsı isledi.", level:1, image_before:null, image_after:null, created_at:new Date().toISOString(), street_name:"Nókis qalası, Al-Xorazmiy kóchesi", waste_category:"Qaǵaz" },
];

// Waste category colors for donut chart
const WASTE_COLORS = {
  "Plastik":  "#3b82f6",
  "Qaǵaz":   "#10b981",
  "Qurılıs": "#f59e0b",
  "Maishiy":  "#8b5cf6",
  "Aralash":  "#6b7280",
  "Kimyawiy": "#ef4444",
  "Metal":    "#64748b",
};

// Mock district pollution data for chart
const DISTRICT_POLLUTION = [
  { name:"Nókis qalası",    count:42, color:"#ef4444" },
  { name:"Shımbay rayonı",  count:31, color:"#f97316" },
  { name:"Qońırat rayonı",  count:28, color:"#eab308" },
];
