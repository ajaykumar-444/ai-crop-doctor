export type Language = "en" | "te" | "hi";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface WeatherData {
  temp: string;
  humidity: string;
  rainProb: string;
  windSpeed: string;
  conditions: string;
  advice: string;
  warnings: string;
  checkedAt: string;
}

export interface CropSample {
  id: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  diseaseEn: string;
  diseaseTe: string;
  diseaseHi: string;
  cropType: string;
  description: string;
  svgIcon: string; // inline custom decorative SVG representational leaf artwork
  // base64 simulated high accuracy leaf image for immediate AI API analysis
  simulatedBase64: string; 
}

export interface ExpertContact {
  institution: string;
  region: string;
  phone: string;
  hours: string;
  purpose: string;
}

// Highly reliable expert contacts list for Indian & global farmer guidelines
export const EXPERT_CONTACTS: ExpertContact[] = [
  {
    institution: "Krishi Vigyan Kendra (KVK) Central Helpline",
    region: "National / Multi-region",
    phone: "1800-180-1551",
    hours: "6:00 AM to 10:00 PM (Daily)",
    purpose: "Free agronomy diagnostic and weather guidelines support",
  },
  {
    institution: "ICAR National Plant Safety Extension",
    region: "New Delhi & Northern Block",
    phone: "+91 11 25841038",
    hours: "9:30 AM to 5:30 PM (Mon-Sat)",
    purpose: "Fungal outbreaks and pest swarming emergencies",
  },
  {
    institution: "Telangana & AP Agronomy helpline (Professor Jayashankar State Agri Varsity)",
    region: "Southern States (Telugu Language experts)",
    phone: "1551 (Farmer Portal Call Center)",
    hours: "7:00 AM to 8:00 PM (Daily)",
    purpose: "Soil diagnostic, localized Telugu seed selection advisories",
  },
  {
    institution: "Agricultural Technology Management Agency (ATMA)",
    region: "Uttar Pradesh & Central Hindi Block",
    phone: "1800-419-0112",
    hours: "8:00 AM to 7:00 PM",
    purpose: "Pest management counseling, organic compost guidance in Hindi",
  }
];

export const STATES_AND_REGIONS = [
  { code: "central", nameEn: "Central Plains (UP, MP, Bihar)", nameTe: "మధ్య మైదానాలు (UP, MP, బిహార్)", nameHi: "मध्य मैदान (यूपी, एमपी, बिहार)" },
  { code: "south", nameEn: "Southern Coast (AP, Telangana, Tamil Nadu)", nameTe: "దక్షిణ తీరం (ఆంధ్రప్రదేశ్, తెలంగాణ, తమిళనాడు)", nameHi: "दक्षिणी तट (आंध्र, तेलंगाना, तमिलनाडु)" },
  { code: "north", nameEn: "Drier Northern Zone (Rajasthan, Punjab, Haryana)", nameTe: "పొడి ఉత్తర మండలం (రాజస్థాన్, పంజాబ్, హర్యానా)", nameHi: "शुष्क उत्तरी क्षेत्र (राजस्थान, पंजाब, हरियाणा)" },
  { code: "hilly", nameEn: "Hilly Himalayan Zone (Himachal, Uttarakhand)", nameTe: "కొండల హిమాలయ ప్రాంతం (హిమాచల్, ఉత్తరాఖండ్)", nameHi: "पहाड़ी हिमालयी क्षेत्र (हिमाचल, उत्तराखंड)" }
];

export const CROP_TYPES = [
  { value: "Rice", labelEn: "Rice (వరి / धान)", icon: "🌾" },
  { value: "Cotton", labelEn: "Cotton (పత్తి / कपास)", icon: "🌱" },
  { value: "Tomato", labelEn: "Tomato (టమోటా / टमाटर)", icon: "🍅" },
  { value: "Corn", labelEn: "Corn (మొక్కజొన్న / मक्का)", icon: "🌽" },
  { value: "Chilli", labelEn: "Chilli (మిరప / मिर्च)", icon: "🌶️" },
  { value: "Groundnut", labelEn: "Groundnut (వేరుశనగ / मूंगफली)", icon: "🥜" },
  { value: "Wheat", labelEn: "Wheat (గోధుమలు / गेहूं)", icon: "🌾" },
  { value: "Potato", labelEn: "Potato (బంగాళాదుంప / आलू)", icon: "🥔" }
];
