// assets/js/iv-calculator.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("iv-form");
  const resetBtn = document.getElementById("reset-btn");

  const attackInput = document.getElementById("iv-attack");
  const defenseInput = document.getElementById("iv-defense");
  const staminaInput = document.getElementById("iv-stamina");
  const nameInput = document.getElementById("pokemon-name");

  const totalEl = document.getElementById("result-total");
  const percentEl = document.getElementById("result-percent");
  const ratingEl = document.getElementById("result-rating");
  const meterFillEl = document.getElementById("result-meter-fill");
  const nameEl = document.getElementById("result-name");

  const errorEls = {
    "iv-attack": document.querySelector('[data-error-for="iv-attack"]'),
    "iv-defense": document.querySelector('[data-error-for="iv-defense"]'),
    "iv-stamina": document.querySelector('[data-error-for="iv-stamina"]'),
  };

  function clearErrors() {
    Object.values(errorEls).forEach((el) => (el.textContent = ""));
    [attackInput, defenseInput, staminaInput].forEach((input) =>
      input.classList.remove("error")
    );
  }

  function setError(input, message) {
    const id = input.id;
    input.classList.add("error");
    if (errorEls[id]) {
      errorEls[id].textContent = message;
    }
  }

  function parseIv(input) {
    const value = input.value.trim();
    if (value === "") {
      setError(input, "Required");
      return null;
    }

    const num = Number(value);
    if (!Number.isInteger(num)) {
      setError(input, "Must be an integer");
      return null;
    }
    if (num < 0 || num > 15) {
      setError(input, "Must be between 0 and 15");
      return null;
    }
    return num;
  }

  function getRatingLabel(percent) {
    if (percent === 100) return "Perfect IV (100%)";
    if (percent >= 97.8) return "Near perfect (98–99%)";
    if (percent >= 82.2) return "Strong IVs (82–97%)";
    if (percent >= 66.7) return "Decent IVs (67–81%)";
    return "Below average IVs (<67%)";
  }

  function updateNameDisplay() {
    const name = nameInput.value.trim();
    nameEl.textContent = name ? name : "No Pokémon selected";
  }

  function resetResults() {
    totalEl.textContent = "— / 45";
    percentEl.textContent = "—%";
    ratingEl.textContent = "Awaiting input";
    meterFillEl.style.width = "0%";
    updateNameDisplay();
  }

  // Handle form submit
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const atk = parseIv(attackInput);
    const def = parseIv(defenseInput);
    const sta = parseIv(staminaInput);

    if (atk === null || def === null || sta === null) {
      resetResults();
      return;
    }

    const total = atk + def + sta;
    const percent = (total / 45) * 100;
    const percentRounded = Math.round(percent * 10) / 10;

    totalEl.textContent = `${total} / 45`;
    percentEl.textContent = `${percentRounded.toFixed(1)}%`;
    ratingEl.textContent = getRatingLabel(percent);

    meterFillEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    updateNameDisplay();
  });

  // Reset button
  resetBtn.addEventListener("click", () => {
    clearErrors();
    form.reset();
    resetResults();
  });

  // Live name update
  nameInput.addEventListener("input", updateNameDisplay);

  // Initialize
  resetResults();
});
