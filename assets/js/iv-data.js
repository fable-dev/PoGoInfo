// assets/js/iv-data.js

// CP multipliers by level (1.0 to 40.0, including half levels)
// Rounded values are sufficient for IV calculation.
export const CPM_BY_LEVEL = {
  1: 0.094,
  1.5: 0.135137,
  2: 0.166398,
  2.5: 0.192650,
  3: 0.215732,
  3.5: 0.236572,
  4: 0.255720,
  4.5: 0.273530,
  5: 0.290250,
  5.5: 0.306057,
  6: 0.321088,
  6.5: 0.335445,
  7: 0.349213,
  7.5: 0.362457,
  8: 0.375236,
  8.5: 0.387592,
  9: 0.399567,
  9.5: 0.411193,
  10: 0.422500,
  10.5: 0.432926,
  11: 0.443108,
  11.5: 0.453059,
  12: 0.462800,
  12.5: 0.472336,
  13: 0.481685,
  13.5: 0.490855,
  14: 0.499858,
  14.5: 0.508701,
  15: 0.517394,
  15.5: 0.525942,
  16: 0.534354,
  16.5: 0.542635,
  17: 0.550793,
  17.5: 0.558830,
  18: 0.566754,
  18.5: 0.574569,
  19: 0.582278,
  19.5: 0.589888,
  20: 0.597400,
  20.5: 0.604818,
  21: 0.612157,
  21.5: 0.619406,
  22: 0.626567,
  22.5: 0.633644,
  23: 0.640653,
  23.5: 0.647576,
  24: 0.654435,
  24.5: 0.661214,
  25: 0.667934,
  25.5: 0.674578,
  26: 0.681164,
  26.5: 0.687681,
  27: 0.694144,
  27.5: 0.700538,
  28: 0.706884,
  28.5: 0.713164,
  29: 0.719399,
  29.5: 0.725571,
  30: 0.731700,
  30.5: 0.734741,
  31: 0.737769,
  31.5: 0.740785,
  32: 0.743789,
  32.5: 0.746781,
  33: 0.749761,
  33.5: 0.752729,
  34: 0.755686,
  34.5: 0.758630,
  35: 0.761563,
  35.5: 0.764486,
  36: 0.767397,
  36.5: 0.770297,
  37: 0.773186,
  37.5: 0.776065,
  38: 0.778933,
  38.5: 0.781790,
  39: 0.784637,
  39.5: 0.787473,
  40: 0.790300
};

// Stardust bands → approximate allowed level range (non-Lucky, up to 40).
// This is simplified but good enough for IV narrowing.
export const STARDUST_LEVEL_RANGES = {
  200: { min: 1, max: 3.5 },
  400: { min: 4, max: 7.5 },
  600: { min: 8, max: 11.5 },
  800: { min: 12, max: 15.5 },
  1000: { min: 16, max: 19.5 },
  1300: { min: 20, max: 22.5 },
  1600: { min: 23, max: 25.5 },
  1900: { min: 26, max: 28.5 },
  2200: { min: 29, max: 30.5 },
  2500: { min: 31, max: 32.5 },
  3000: { min: 33, max: 33.5 },
  3500: { min: 34, max: 34.5 },
  4000: { min: 35, max: 35.5 },
  4500: { min: 36, max: 36.5 },
  5000: { min: 37, max: 37.5 },
  6000: { min: 38, max: 38.5 },
  7000: { min: 39, max: 39.5 },
  8000: { min: 40, max: 40 },
  9000: { min: 40, max: 40 },
  10000: { min: 40, max: 40 }
};

// Basic appraisal → IV range mapping (approximate and simple).
export const APPRAISAL_BUCKETS = {
  best: { min: 13, max: 15 },
  good: { min: 8, max: 12 },
  fair: { min: 4, max: 7 },
  poor: { min: 0, max: 3 }
};

// Small sample of Pokémon base stats. Expand as needed.
export const POKEMON_BASE_STATS = [
  // id, name, baseAtk, baseDef, baseSta (HP)
  { id: 1, name: "Bulbasaur", atk: 118, def: 111, sta: 128 },
  { id: 2, name: "Ivysaur", atk: 151, def: 143, sta: 155 },
  { id: 3, name: "Venusaur", atk: 198, def: 189, sta: 190 },
  { id: 133, name: "Eevee", atk: 104, def: 114, sta: 146 },
  { id: 134, name: "Vaporeon", atk: 205, def: 161, sta: 277 },
  { id: 149, name: "Dragonite", atk: 263, def: 198, sta: 209 },
  { id: 150, name: "Mewtwo", atk: 300, def: 182, sta: 214 },
  // Add more Pokémon here following the same structure.
];

// Utility: case-insensitive name search
export function searchPokemonByName(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return POKEMON_BASE_STATS.filter((p) =>
    p.name.toLowerCase().includes(q)
  ).slice(0, 20);
}
