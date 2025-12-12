// assets/js/iv-engine.js

import { getCPM, STARDUST_LEVEL_RANGES, APPRAISAL_BUCKETS } from "./iv-data.js";

function calcCP(baseAtk, baseDef, baseSta, ivAtk, ivDef, ivSta, level) {
  const cpm = getCPM(level);
  if (!cpm) return null;

  const atk = baseAtk + ivAtk;
  const def = baseDef + ivDef;
  const sta = baseSta + ivSta;

  const hp = Math.floor(sta * cpm);

  const cp = Math.max(
    10,
    Math.floor(
      ((atk) * Math.sqrt(def) * Math.sqrt(sta) * (cpm * cpm)) / 10
    )
  );

  return { cp, hp };
}

function forEachLevelInRange(min, max, cb) {
  // step by 0.5
  for (let lvl = min; lvl <= max + 0.001; lvl += 0.5) {
    const rounded = Math.round(lvl * 2) / 2;
    if (rounded >= 1 && rounded <= 40) cb(rounded);
  }
}

function appraisalAllowed(iv, bucketKey) {
  if (!bucketKey) return true;
  const bucket = APPRAISAL_BUCKETS[bucketKey];
  if (!bucket) return true;
  return iv >= bucket.min && iv <= bucket.max;
}

export function ratingFromPercent(percent) {
  if (percent >= 90) return "Great";
  if (percent >= 75) return "Good";
  if (percent >= 60) return "Okay";
  return "Poor";
}

// Core: generate all possible IV spreads matching inputs.
export function generateIvSpreads({
  baseStats,
  cp,
  hp,
  stardust,
  recentBandOnly,
  appraisal = {}
}) {
  const results = [];
  const cpInt = parseInt(cp, 10);
  const hpInt = parseInt(hp, 10);
  const sdInt = parseInt(stardust, 10);

  if (!baseStats || !cpInt || !hpInt || !sdInt) return results;

  // Determine level range from stardust band
  const band = STARDUST_LEVEL_RANGES[sdInt];
  let minLevel = 1;
  let maxLevel = 40;

  if (band) {
    if (recentBandOnly) {
      minLevel = band.min;
      maxLevel = band.max;
    } else {
      // allow any level up to this band
      maxLevel = band.max;
    }
  }

  forEachLevelInRange(minLevel, maxLevel, (level) => {
    for (let ivAtk = 0; ivAtk <= 15; ivAtk++) {
      if (!appraisalAllowed(ivAtk, appraisal.atk)) continue;

      for (let ivDef = 0; ivDef <= 15; ivDef++) {
        if (!appraisalAllowed(ivDef, appraisal.def)) continue;

        for (let ivSta = 0; ivSta <= 15; ivSta++) {
          if (!appraisalAllowed(ivSta, appraisal.sta)) continue;

          const stats = calcCP(
            baseStats.atk,
            baseStats.def,
            baseStats.sta,
            ivAtk,
            ivDef,
            ivSta,
            level
          );
          if (!stats) continue;

          if (stats.cp === cpInt && stats.hp === hpInt) {
            const total = ivAtk + ivDef + ivSta;
            const percent = (total / 45) * 100;
            results.push({
              level,
              ivAtk,
              ivDef,
              ivSta,
              total,
              percent: Math.round(percent * 10) / 10
            });
          }
        }
      }
    }
  });

  // Sort best → worst, then by level
  results.sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    if (a.level !== b.level) return a.level - b.level;
    return b.total - a.total;
  });

  return results;
}
