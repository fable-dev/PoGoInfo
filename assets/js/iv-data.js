// assets/js/iv-data.js

// Base CP multipliers at integer levels, using the standard GO Hub table.
export const CPM_BASE = {
  1: 0.094,
  2: 0.16639787,
  3: 0.21573247,
  4: 0.25572005,
  5: 0.29024988,
  6: 0.3210876,
  7: 0.34921268,
  8: 0.3752356,
  9: 0.39956728,
  10: 0.4225,
  11: 0.44310755,
  12: 0.4627984,
  13: 0.48168495,
  14: 0.49985844,
  15: 0.51739395,
  16: 0.5343543,
  17: 0.5507927,
  18: 0.5667545,
  19: 0.5822789,
  20: 0.5974,
  21: 0.6121573,
  22: 0.6265671,
  23: 0.64065295,
  24: 0.65443563,
  25: 0.667934,
  26: 0.6811649,
  27: 0.69414365,
  28: 0.7068842,
  29: 0.7193991,
  30: 0.7317,
  31: 0.7377695,
  32: 0.74378943,
  33: 0.74976104,
  34: 0.7556855,
  35: 0.76156384,
  36: 0.76739717,
  37: 0.7731865,
  38: 0.77893275,
  39: 0.784637,
  40: 0.7903,
  41: 0.7953,
  42: 0.8003,
  43: 0.8053,
  44: 0.8103,
  45: 0.8153,
  46: 0.8203,
  47: 0.8253,
  48: 0.8303,
  49: 0.8353,
  50: 0.8403,
  51: 0.8453 // used only for computing 50.5 if ever needed
};

// Get CPM for any level with 0.5 granularity (1.0–50.0).
// For half levels, average the current and next integer-level CPM.
export function getCPM(level) {
  const rounded = Math.round(level * 2) / 2;

  if (Number.isInteger(rounded)) {
    return CPM_BASE[rounded] ?? null;
  }

  const lower = Math.floor(rounded);
  const upper = lower + 1;

  const cLow = CPM_BASE[lower];
  const cUp = CPM_BASE[upper];

  if (cLow == null || cUp == null) return null;
  return (cLow + cUp) / 2;
}



// Stardust cost → approximate allowed level range (includes XL up to level 50).
// These ranges match the standard power-up cost bands.
export const STARDUST_LEVEL_RANGES = {
  200:   { min: 1,   max: 2.5 },
  400:   { min: 3,   max: 4.5 },
  600:   { min: 5,   max: 6.5 },
  800:   { min: 7,   max: 8.5 },
  1000:  { min: 9,   max: 10.5 },
  1300:  { min: 11,  max: 12.5 },
  1600:  { min: 13,  max: 14.5 },
  1900:  { min: 15,  max: 16.5 },
  2200:  { min: 17,  max: 18.5 },
  2500:  { min: 19,  max: 20.5 },
  3000:  { min: 21,  max: 22.5 },
  3500:  { min: 23,  max: 24.5 },
  4000:  { min: 25,  max: 26.5 },
  4500:  { min: 27,  max: 28.5 },
  5000:  { min: 29,  max: 30.5 },
  6000:  { min: 31,  max: 32.5 },
  7000:  { min: 33,  max: 34.5 },
  8000:  { min: 35,  max: 36.5 },
  9000:  { min: 37,  max: 38.5 },
  10000: { min: 39,  max: 41 },    // includes 40.5 & 41 from your table
  11000: { min: 41.5, max: 42.5 },
  12000: { min: 43,   max: 44.5 },
  13000: { min: 45,   max: 46.5 },
  14000: { min: 47,   max: 48.5 },
  15000: { min: 49,   max: 50 }
};

// Encounter source presets: level ranges + IV floors.
const SOURCE_PRESETS = {
  // Typical assumptions – you can refine later if you want.
  wild: {
    minLevel: 1,
    maxLevel: 30,
    ivFloor: 0
  },
  wild_boosted: {
    minLevel: 6,
    maxLevel: 35,
    ivFloor: 0
  },
  raid_research: {
    // Includes raid (20/25), research (15), GO Battle League, etc.
    minLevel: 15,
    maxLevel: 25,
    ivFloor: 10
  },
  egg: {
    minLevel: 20,
    maxLevel: 20,
    ivFloor: 10
  },
  trade: {
    minLevel: 1,
    maxLevel: 50,
    ivFloor: 0
  },
  lucky: {
    minLevel: 1,
    maxLevel: 50,
    ivFloor: 12
  }
};

export function getSourceConstraints(key) {
  if (!key) return null;
  return SOURCE_PRESETS[key] || null;
}


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
