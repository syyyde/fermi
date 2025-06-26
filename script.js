// Bestehende DOM-Elemente
const buttons = document.querySelectorAll("nav button");
const content = document.querySelector(".content");

// Navigation zu statischen Seiten
const staticPages = {
  "Was ist das Fermi Paradox?": "was_ist_fermi.html",
  "Anforderungen für Leben": "anforderungen.html",
  "Entfernungen / Kommunikation": "entfernungen.html",
  "Zeiträume – Erklärung und Darstellung": "zeitraeume.html",
  "Typen von Zivilisationen – Kardashev-Skala": "kardashev.html",
  "Drake-Gleichung": "drake.html"
};

buttons.forEach(button => {
  button.addEventListener("click", () => {
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const label = button.textContent.trim();

    if (label === "Diagramm") {
      renderDiagramSection();
    } else if (staticPages[label]) {
      fetch(staticPages[label])
        .then(res => res.text())
        .then(html => content.innerHTML = html)
        .catch(err => content.innerHTML = `<p>Fehler beim Laden: ${err}</p>`);
    }
  });
});

// Beim Laden direkt Diagramm anzeigen
window.addEventListener("DOMContentLoaded", () => {
  const defaultButton = Array.from(buttons).find(btn => btn.textContent.trim() === "Diagramm");
  if (defaultButton) defaultButton.click();
});

// ---- Drake-Rechner ----
const defaultValues = {
  R: 1.5,
  fp: 0.7,
  ne: 0.2,
  fl: 0.5,
  fi: 0.1,
  fc: 0.1,
  L: 1000
};

function renderDiagramSection() {
  content.innerHTML = `
    <h2>Interaktiver Drake-Rechner</h2>
    <div id="drake-form"></div>
    <button id="reset-values">Standardwerte wiederherstellen</button>
    <div id="drake-output">
      <div id="drake-result-box">
        <p><strong>Ergebnis:</strong></p>
        <p id="drake-result-value"><span id="drake-result">?</span> mögliche Zivilisation(en)</p>
      </div>
      <canvas id="milkyway-canvas" width="800" height="600"></canvas>
    </div>
  `;
  initForm();
  document.getElementById("reset-values").addEventListener("click", () => {
    initForm();
    document.querySelectorAll('#drake-form input[type="range"]').forEach(updateSliderBackground);
  });
}

function createInput(name, label, min, max, step, defaultValue) {
  const wrapper = document.createElement("div");

  const labelElem = document.createElement("label");
  labelElem.textContent = `${label} (${min}–${max}): `;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.name = name;
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = defaultValue;

  const input = document.createElement("input");
  input.type = "number";
  input.name = name;
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = defaultValue;
  input.style.width = "80px";
  input.style.marginLeft = "10px";

  slider.addEventListener("input", () => {
    input.value = slider.value;
    updateSliderBackground(slider);
    updateResult();
  });

  input.addEventListener("input", () => {
    slider.value = input.value;
    updateSliderBackground(slider);
    updateResult();
  });

  wrapper.appendChild(labelElem);
  wrapper.appendChild(slider);
  wrapper.appendChild(input);

  document.getElementById("drake-form").appendChild(wrapper);
  updateSliderBackground(slider);
}

function updateResult() {
  const form = document.getElementById("drake-form");
  const R = parseFloat(form.querySelector("input[name='R']")?.value || defaultValues.R);
  const fp = parseFloat(form.querySelector("input[name='fp']")?.value || defaultValues.fp);
  const ne = parseFloat(form.querySelector("input[name='ne']")?.value || defaultValues.ne);
  const fl = parseFloat(form.querySelector("input[name='fl']")?.value || defaultValues.fl);
  const fi = parseFloat(form.querySelector("input[name='fi']")?.value || defaultValues.fi);
  const fc = parseFloat(form.querySelector("input[name='fc']")?.value || defaultValues.fc);
  const L = parseFloat(form.querySelector("input[name='L']")?.value || defaultValues.L);

  const N = R * fp * ne * fl * fi * fc * L;
  document.getElementById("drake-result").textContent = N.toFixed(2);
}

function initForm() {
  const form = document.getElementById("drake-form");
  form.innerHTML = "";
  createInput("R", "R* (Sternentstehungsrate)", 0.1, 10, 0.1, defaultValues.R);
  createInput("fp", "fₚ (Anteil mit Planetensystemen)", 0.1, 1, 0.01, defaultValues.fp);
  createInput("ne", "nₑ (bewohnbare Planeten)", 0.1, 5, 0.1, defaultValues.ne);
  createInput("fl", "fₗ (mit Leben)", 0.1, 1, 0.01, defaultValues.fl);
  createInput("fi", "fᵢ (intelligentes Leben)", 0.1, 1, 0.01, defaultValues.fi);
  createInput("fc", "f𝚌 (kommunizierende Zivilisationen)", 0.1, 1, 0.01, defaultValues.fc);
  createInput("L", "L (Dauer in Jahren)", 1, 10000, 1, defaultValues.L);
  updateResult();
}

function updateSliderBackground(slider) {
  const min = slider.min || 0;
  const max = slider.max || 100;
  const val = slider.value;

  const percentage = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, var(--eggplant) 0%, var(--eggplant) ${percentage}%, white ${percentage}%, white 100%)`;
}
