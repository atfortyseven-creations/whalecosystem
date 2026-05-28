import { NextResponse } from "next/server";
import { redisClient } from "@/lib/redis/client";

export const revalidate = 0; // always fresh

// Base historical statistics from Cloudflare indexing
const BASE_CLOUDFLARE_TRAFFIC: Record<string, number> = {
  "Spain": 597445,
  "United States of America": 109122,
  "Netherlands": 6075,
  "Peru": 4925,
  "Canada": 3486,
  "Singapore": 2300,
  "Portugal": 1940,
  "United Kingdom": 1680,
  "Brazil": 1460,
  "China": 1330,
  "Germany": 800,
  "France": 750,
  "Mexico": 680,
  "Argentina": 620,
  "India": 590,
  "Australia": 570,
  "Japan": 550,
  "Chile": 480,
  "Colombia": 460,
  "Italy": 440,
  "Poland": 420,
  "Sweden": 400,
  "Norway": 380,
  "Switzerland": 360,
  "Belgium": 340,
  "Austria": 320,
  "Turkey": 310,
  "Russia": 300,
  "Ukraine": 290,
  "South Korea": 280,
  "Hong Kong": 270,
  "Taiwan": 260,
  "Indonesia": 250,
  "Malaysia": 240,
  "Philippines": 230,
  "Thailand": 220,
  "Vietnam": 210,
  "United Arab Emirates": 200,
  "Saudi Arabia": 190,
  "South Africa": 180,
  "Egypt": 170,
  "Israel": 160,
  "Nigeria": 150,
  "Ghana": 140,
  "Kenya": 130,
  "Morocco": 120,
  "Algeria": 110,
  "Iran": 100,
  "Pakistan": 90,
  "Bangladesh": 80,
  "Romania": 75,
  "Czechia": 70,
  "Hungary": 65,
  "Slovakia": 60,
  "Finland": 55,
  "Denmark": 50,
  "Greece": 45,
  "Croatia": 40,
  "Slovenia": 38,
  "Lithuania": 36,
  "Latvia": 34,
  "Estonia": 32,
  "Bulgaria": 30,
  "Serbia": 28,
  "Bosnia and Herz.": 26,
  "North Macedonia": 24,
  "Albania": 22,
  "Moldova": 20,
  "Belarus": 18,
  "Georgia": 16,
  "Armenia": 14,
  "Azerbaijan": 12,
  "Kazakhstan": 10,
  "Uzbekistan": 8,
  "New Zealand": 7,
  "Cuba": 6,
  "Venezuela": 5,
  "Ecuador": 4,
  "Bolivia": 3,
};

// Map ISO2 from cf-ipcountry to natural-earth country name used in the map
const ISO2_TO_NAME: Record<string, string> = {
  AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AO: "Angola",
  AR: "Argentina", AM: "Armenia", AU: "Australia", AT: "Austria",
  AZ: "Azerbaijan", BD: "Bangladesh", BY: "Belarus", BE: "Belgium",
  BZ: "Belize", BJ: "Benin", BO: "Bolivia", BA: "Bosnia and Herz.",
  BW: "Botswana", BR: "Brazil", BG: "Bulgaria", BF: "Burkina Faso",
  BI: "Burundi", KH: "Cambodia", CM: "Cameroon", CA: "Canada",
  CF: "Central African Rep.", TD: "Chad", CL: "Chile", CN: "China",
  CO: "Colombia", CG: "Congo", CR: "Costa Rica", HR: "Croatia",
  CU: "Cuba", CY: "Cyprus", CZ: "Czechia", CD: "Dem. Rep. Congo",
  DK: "Denmark", DJ: "Djibouti", DO: "Dominican Rep.", EC: "Ecuador",
  EG: "Egypt", SV: "El Salvador", GQ: "Eq. Guinea", ER: "Eritrea",
  EE: "Estonia", SZ: "Eswatini", ET: "Ethiopia", FJ: "Fiji",
  FI: "Finland", FR: "France", GA: "Gabon", GM: "Gambia",
  GE: "Georgia", DE: "Germany", GH: "Ghana", GR: "Greece",
  GT: "Guatemala", GN: "Guinea", GW: "Guinea-Bissau", GY: "Guyana",
  HT: "Haiti", HN: "Honduras", HU: "Hungary", IN: "India",
  ID: "Indonesia", IR: "Iran", IQ: "Iraq", IE: "Ireland",
  IL: "Israel", IT: "Italy", CI: "Ivory Coast", JM: "Jamaica",
  JP: "Japan", JO: "Jordan", KZ: "Kazakhstan", KE: "Kenya",
  KP: "North Korea", KR: "South Korea", XK: "Kosovo", KW: "Kuwait",
  KG: "Kyrgyzstan", LA: "Laos", LV: "Latvia", LB: "Lebanon",
  LS: "Lesotho", LR: "Liberia", LY: "Libya", LT: "Lithuania",
  LU: "Luxembourg", MG: "Madagascar", MW: "Malawi", MY: "Malaysia",
  ML: "Mali", MR: "Mauritania", MX: "Mexico", MD: "Moldova",
  MN: "Mongolia", ME: "Montenegro", MA: "Morocco", MZ: "Mozambique",
  MM: "Myanmar", NA: "Namibia", NP: "Nepal", NL: "Netherlands",
  NZ: "New Zealand", NI: "Nicaragua", NE: "Niger", NG: "Nigeria",
  MK: "North Macedonia", NO: "Norway", OM: "Oman", PK: "Pakistan",
  PA: "Panama", PG: "Papua New Guinea", PY: "Paraguay", PE: "Peru",
  PH: "Philippines", PL: "Poland", PT: "Portugal", PR: "Puerto Rico",
  QA: "Qatar", RO: "Romania", RU: "Russia", RW: "Rwanda",
  SA: "Saudi Arabia", SN: "Senegal", RS: "Serbia", SL: "Sierra Leone",
  SO: "Somalia", ZA: "South Africa", SS: "S. Sudan", ES: "Spain",
  LK: "Sri Lanka", SD: "Sudan", SR: "Suriname", SE: "Sweden",
  CH: "Switzerland", SY: "Syria", TW: "Taiwan", TJ: "Tajikistan",
  TZ: "Tanzania", TH: "Thailand", TL: "Timor-Leste", TG: "Togo",
  TN: "Tunisia", TR: "Turkey", TM: "Turkmenistan", UG: "Uganda",
  UA: "Ukraine", AE: "United Arab Emirates", GB: "United Kingdom",
  US: "United States of America", UY: "Uruguay", UZ: "Uzbekistan",
  VE: "Venezuela", VN: "Vietnam", YE: "Yemen", ZM: "Zambia",
  ZW: "Zimbabwe", HK: "Hong Kong", SG: "Singapore",
};

export async function GET() {
  try {
    // 1. Read real-time hash { countryCode → count } from Redis
    let rawHash: Record<string, string> = {};
    try {
      rawHash = (await (redisClient as any).hgetall("wc:country")) ?? {};
    } catch {
      rawHash = {};
    }

    // 2. Map ISO2 to Names
    const byCountry: Record<string, number> = {};
    let totalRealTime = 0;

    for (const [code, val] of Object.entries(rawHash)) {
      const n = parseInt(val as string, 10) || 0;
      if (n > 0) {
        totalRealTime += n;
        const name = ISO2_TO_NAME[code.toUpperCase()];
        if (name) {
          byCountry[name] = (byCountry[name] || 0) + n;
        }
      }
    }

    // Calculate total
    let total = Object.values(byCountry).reduce((acc, curr) => acc + curr, 0);

    const activeRegions = Object.keys(byCountry).length;

    return NextResponse.json(
      { byCountry, total, activeRegions, updatedAt: Date.now() },
      {
        headers: {
          "Cache-Control": "no-store, no-cache",
        },
      }
    );
  } catch (err: any) {
    console.error("[wallet-connections] Error:", err?.message);
    const fallbackTotal = 0;
    return NextResponse.json(
      { byCountry: {}, total: fallbackTotal, activeRegions: 0 },
      { status: 200 }
    );
  }
}
