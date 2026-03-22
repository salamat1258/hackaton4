// config.js — EcoMap Qaraqalpaqstan v3.0
const CONFIG = {
  // Supabase: https://app.supabase.com → Settings → API
  supabaseUrl:      "https://ltjoaaurmecqrnxtjlkh.supabase.co",  // "https://xxx.supabase.co"
  supabaseKey:      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0am9hYXVybWVjcXJueHRqbGtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAyNzY4MywiZXhwIjoyMDg5NjAzNjgzfQ.nVG2w-bDSSHIpvwj-rXxe8c0BTxcdV6ylvpsByuY03Q",  // "eyJhbGci..."

  // Cloudinary: Dashboard → Settings → Upload → Unsigned preset
  cloudinaryUrl:    "https://api.cloudinary.com/v1_1/dd358xzyq/image/upload",  // "https://api.cloudinary.com/v1_1/CLOUD_NAME/image/upload"
  cloudinaryPreset: "hackaton",  // "ecomap_unsigned"

  // Google Gemini: https://aistudio.google.com/app/apikey
  geminiKey:        "AIzaSyA0brbfbvn2m0C5LPlnfKza208OkLlEZtI",  // "AIzaSy..."
  geminiModel:      "gemini-2.5-flash",

  // OpenWeather (optional): https://openweathermap.org/api
  openWeatherKey:   "",  // "abc123..."

  // App defaults
  defaultLat:       42.4531,
  defaultLng:       59.6111,
  defaultZoom:      12,

  // Points
  pointsSpotter:    2,
  pointsB2B:        5,
  pointsCleaner:    20,
};
