// assets/js/pokemon-iv-page.js

import {
  POKEMON_BASE_STATS,
  searchPokemonByName
} from "./iv-data.js";
import {
  generateIvSpreads,
  ratingFromPercent
} from "./iv-engine.js";

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

const elements = {};

function cacheElements() {
  elements.pokemonSearch = $("#pokemon-search");
  elements.pokemonResults = $("#pokemon-search-results");
  elements.mainForm = $("#iv-main-form");
  elements.cpInput = $("#input-cp");
  elements.hpInput = $("#input-hp");
  elements.stardustSelect = $("#input-stardust");
  elements.recentCheckbox = $("#input-recent");

  elements.appraisalLeader = $("#appraisal-leader");
  elements.appraisalAtk = $("#appraisal-atk");
  elements.appraisalDef = $("#appraisal-def");
  elements.appraisalSta = $("#appraisal-sta");
  elements.appraisalNotes = $("#appraisal-notes");
  elements.applyAppraisalBtn = $("#apply-appraisal");

  elements.resultName = $("#result-name");
  elements.resultRange = $("#result-range");
  elements.resultBestWorst = $("#result-best-worst");
  elements.resultMeterFill = $("#result-meter-fill");
  elements.resultRating = $("#result-rating");
  elements.resultCount = $("#result-count");
  elements.ivTableBody = $("#iv-combo-table tbody");

  elements.resetAll = $("#reset-all");
  elements.prefillDemo = $("#prefill-demo");
  elements.shareResults = $("#share-results");

  elements.powerupForm = $("#powerup-form");
  elements.powerupCP = $("#powerup-cp");
  elements.powerupHP = $("#powerup-hp");
  elements.powerupApply = $("#powerup-apply");
  elements.powerupHistoryBody = $("#powerup-history-table tbody");
}

let selectedPokemon = null;
let rawResults = [];
let filteredResults = [];
let powerupHistory = [];

function setFieldError(id, message) {
  const el = document.querySelector(`[data-error-for="${id}"]`);
  const input = document.getElementById(id);
  if (!input) return;

  if (el) {
    el.textContent = message || "";
  }
  input.classList.toggle("error", !!message);
}

function clearAllErrors() {
  $all("[data-error-for]").forEach((el) => (el.textContent = ""));
  $all(".field-input").forEach((input) => input.classList.remove("error"));
}

/* ---------- Pokémon search ---------- */

function renderPokemonSearchResults(results) {
  const container = elements.pokemonResults;
  container.innerHTML = "";
  if (!results.length) {
    container.classList.remove("visible");
    return;
  }

  results.forEach((p) => {
    const item = document.createElement("div");
    item.className = "pokemon-search-item";
    item.textContent = p.name;
    item.dataset.id = p.id;
    container.appendChild(item);
  });

  container.classList.add("visible");
}

function handlePokemonInput() {
  const query = elements.pokemonSearch.value;
  const matches = searchPokemonByName(query);
  renderPokemonSearchResults(matches);
}

function handlePokemonResultClick(event) {
  const item = event.target.closest(".pokemon-search-item");
  if (!item) return;

  const id = Number(item.dataset.id);
  const pokemon = POKEMON_BASE_STATS.find((p) => p.id === id);
  if (!pokemon) return;

  selectedPokemon = pokemon;
  elements.pokemonSearch.value = pokemon.name;
  elements.pokemonResults.classList.remove("visible");
}

function closeSearchOnOutsideClick(event) {
  if (
    !elements.pokemonResults.contains(event.target) &&
    event.target !== elements.pokemonSearch
  ) {
    elements.pokemonResults.classList.remove("visible");
  }
}

/* ---------- IV calculations ---------- */

function getAppraisalFilters() {
  return {
    leader: elements.appraisalLeader.value || "",
    atk: elements.appraisalAtk.value || "",
    def: elements.appraisalDef.value || "",
    sta: elements.appraisalSta.value || "",
    notes: elements.appraisalNotes.value.trim()
  };
}

function validateCoreInputs() {
  clearAllErrors();
  let valid = true;

  // Try to resolve Pokémon from typed name if not already selected
  if (!selectedPokemon) {
    const typed = elements.pokemonSearch.value.trim();
    if (typed) {
      const match = POKEMON_BASE_STATS.find(
        (p) => p.name.toLowerCase() === typed.toLowerCase()
      );
      if (match) {
        selectedPokemon = match;
      }
    }
  }

  if (!selectedPokemon) {
    setFieldError(
      "pokemon-search",
      "Select a Pokémon from the list or type a valid name (e.g. Dragonite)."
    );
    valid = false;
  }

  if (!elements.cpInput.value.trim()) {
    setFieldError("input-cp", "Required");
    valid = false;
  }
  if (!elements.hpInput.value.trim()) {
    setFieldError("input-hp", "Required");
    valid = false;
  }
  if (!elements.stardustSelect.value.trim()) {
    setFieldError("input-stardust", "Required");
    valid = false;
  }

  return valid;
}


function updateSummaryDisplay() {
  if (!filteredResults.length || !selectedPokemon) {
    elements.resultName.textContent = selectedPokemon ? selectedPokemon.name : "—";
    elements.resultRange.textContent = "—";
    elements.resultBestWorst.textContent = "—";
    elements.resultMeterFill.style.width = "0%";
    elements.resultRating.textContent = "Awaiting input";
    elements.resultCount.textContent = "0 matches";
    elements.ivTableBody.innerHTML = "";
    return;
  }

  elements.resultName.textContent = selectedPokemon.name;

  const best = filteredResults[0];
  const worst = filteredResults[filteredResults.length - 1];

  const minPercent = worst.percent;
  const maxPercent = best.percent;
  elements.resultRange.textContent = `${minPercent.toFixed(1)}–${maxPercent.toFixed(1)}%`;

  elements.resultBestWorst.textContent = `${best.total}/45 (best), ${worst.total}/45 (worst)`;

  const avgPercent =
    filteredResults.reduce((sum, r) => sum + r.percent, 0) / filteredResults.length;
  elements.resultMeterFill.style.width = `${Math.max(
    0,
    Math.min(100, avgPercent)
  )}%`;
  elements.resultRating.textContent = ratingFromPercent(avgPercent);

  elements.resultCount.textContent =
    filteredResults.length === 1
      ? "1 match"
      : `${filteredResults.length} matches`;

  // Render table
  const rows = filteredResults
    .slice(0, 200) // guard against very large results
    .map((r) => {
      return `
        <tr>
          <td>${r.level.toFixed(1)}</td>
          <td>${r.ivAtk}</td>
          <td>${r.ivDef}</td>
          <td>${r.ivSta}</td>
          <td>${r.total}</td>
          <td>${r.percent.toFixed(1)}%</td>
        </tr>`;
    })
    .join("");

  elements.ivTableBody.innerHTML = rows;
}

/* ---------- Power-up tracker ---------- */

function loadHistory() {
  try {
    const stored = window.sessionStorage.getItem("pogo_iv_powerups");
    powerupHistory = stored ? JSON.parse(stored) : [];
  } catch {
    powerupHistory = [];
  }
}

function saveHistory() {
  try {
    window.sessionStorage.setItem(
      "pogo_iv_powerups",
      JSON.stringify(powerupHistory)
    );
  } catch {
    // Ignore storage errors
  }
}

function renderHistory() {
  if (!powerupHistory.length) {
    elements.powerupHistoryBody.innerHTML = "";
    return;
  }

  elements.powerupHistoryBody.innerHTML = powerupHistory
    .map(
      (entry, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${entry.cp}</td>
        <td>${entry.hp}</td>
        <td>${entry.remaining}</td>
      </tr>`
    )
    .join("");
}

/* ---------- URL share / prefill ---------- */

function encodeStateToUrl() {
  const params = new URLSearchParams();

  if (selectedPokemon) params.set("mon", selectedPokemon.name);
  if (elements.cpInput.value) params.set("cp", elements.cpInput.value);
  if (elements.hpInput.value) params.set("hp", elements.hpInput.value);
  if (elements.stardustSelect.value)
    params.set("sd", elements.stardustSelect.value);
  if (elements.recentCheckbox.checked) params.set("recent", "1");

  const appraisal = getAppraisalFilters();
  if (appraisal.leader) params.set("leader", appraisal.leader);
  if (appraisal.atk) params.set("atk", appraisal.atk);
  if (appraisal.def) params.set("def", appraisal.def);
  if (appraisal.sta) params.set("sta", appraisal.sta);

  const base = `${window.location.origin}${window.location.pathname}`;
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

function applyStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const monName = params.get("mon");
  if (monName) {
    const m = POKEMON_BASE_STATS.find(
      (p) => p.name.toLowerCase() === monName.toLowerCase()
    );
    if (m) {
      selectedPokemon = m;
      elements.pokemonSearch.value = m.name;
    }
  }

  const cp = params.get("cp");
  const hp = params.get("hp");
  const sd = params.get("sd");
  const recent = params.get("recent");

  if (cp) elements.cpInput.value = cp;
  if (hp) elements.hpInput.value = hp;
  if (sd) elements.stardustSelect.value = sd;
  elements.recentCheckbox.checked = recent === "1";

  const leader = params.get("leader");
  const atk = params.get("atk");
  const def = params.get("def");
  const sta = params.get("sta");

  if (leader) elements.appraisalLeader.value = leader;
  if (atk) elements.appraisalAtk.value = atk;
  if (def) elements.appraisalDef.value = def;
  if (sta) elements.appraisalSta.value = sta;

  // If we have enough info, auto-calc
  if (selectedPokemon && cp && hp && sd) {
    runCalculation();
  }
}

/* ---------- Main calculation pipeline ---------- */

function runCalculation(appraisalOverride) {
  if (!validateCoreInputs()) {
    rawResults = [];
    filteredResults = [];
    updateSummaryDisplay();
    return;
  }

  const appraisalFilters = appraisalOverride || getAppraisalFilters();

  rawResults = generateIvSpreads({
    baseStats: selectedPokemon,
    cp: elements.cpInput.value,
    hp: elements.hpInput.value,
    stardust: elements.stardustSelect.value,
    recentBandOnly: elements.recentCheckbox.checked,
    appraisal: appraisalFilters
  });

  filteredResults = rawResults;
  updateSummaryDisplay();
}

/* ---------- Event wiring ---------- */

function attachEvents() {
  // Pokémon search
  elements.pokemonSearch.addEventListener("input", handlePokemonInput);
  elements.pokemonResults.addEventListener(
    "click",
    handlePokemonResultClick
  );
  document.addEventListener("click", closeSearchOnOutsideClick);

  // Form submit
  elements.mainForm.addEventListener("submit", (e) => {
    e.preventDefault();
    runCalculation();
  });

  // Reset
  elements.resetAll.addEventListener("click", () => {
    elements.mainForm.reset();
    selectedPokemon = null;
    rawResults = [];
    filteredResults = [];
    elements.pokemonSearch.value = "";
    elements.pokemonResults.classList.remove("visible");
    clearAllErrors();
    updateSummaryDisplay();
    powerupHistory = [];
    saveHistory();
    renderHistory();
  });

  // Apply appraisal filter button
  elements.applyAppraisalBtn.addEventListener("click", () => {
    runCalculation();
  });

  // Prefill demo data
  elements.prefillDemo.addEventListener("click", (e) => {
    e.preventDefault(); // just in case
    const demo = POKEMON_BASE_STATS.find(
      (p) => p.name.toLowerCase() === "dragonite"
    );
    if (demo) {
      selectedPokemon = demo;
      elements.pokemonSearch.value = demo.name;
    }
    elements.cpInput.value = 3200;
    elements.hpInput.value = 165;
    elements.stardustSelect.value = "5000";
    elements.recentCheckbox.checked = true;
    elements.appraisalLeader.value = "blanche";
    elements.appraisalAtk.value = "best";
    elements.appraisalDef.value = "";
    elements.appraisalSta.value = "good";
    elements.appraisalNotes.value = "Example Dragonite setup.";
    runCalculation();
  });

  // Share results
  elements.shareResults.addEventListener("click", async (e) => {
    e.preventDefault(); // avoid form submit
    const url = encodeStateToUrl();
    try {
      await navigator.clipboard.writeText(url);
      elements.shareResults.textContent = "Copied link!";
      setTimeout(() => {
        elements.shareResults.textContent = "Share current setup";
      }, 1200);
    } catch {
      window.prompt("Copy this URL:", url);
    }
  });

  // Power-up apply (simple history logger for now)
  elements.powerupApply.addEventListener("click", (e) => {
    e.preventDefault();
    if (!filteredResults.length) return;

    const cp = parseInt(elements.powerupCP.value, 10);
    const hp = parseInt(elements.powerupHP.value, 10);

    if (!cp || !hp) return;

    powerupHistory.push({
      cp,
      hp,
      remaining: filteredResults.length
    });
    saveHistory();
    renderHistory();
  });
}

function init() {
  cacheElements();
  loadHistory();
  renderHistory();
  attachEvents();
  applyStateFromUrl();
  updateSummaryDisplay();
}

/**
 * Safe init for module scripts:
 * - If DOM is still loading, wait for DOMContentLoaded
 * - If DOM is already ready, run immediately
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
