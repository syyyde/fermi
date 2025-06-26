
// --- Navigation: Buttons + Content-Elemente ---
const buttons = document.querySelectorAll("nav button");
const content = document.querySelector(".content");

const staticPages = {
  "Was ist das Fermi Paradox?": "was_ist_fermi.html",
  "Anforderungen für Leben": "anforderungen.html",
  "Entfernungen / Kommunikation": "entfernungen.html",
  "Zeiträume – Erklärung und Darstellung": "zeitraeume.html",
  "Typen von Zivilisationen – Kardashev-Skala": "kardashev.html",
  "Drake-Gleichung": "drake.html"
};

// Event-Listener für Buttons
buttons.forEach(button => {
  button.addEventListener("click", () => {
    // aktive Klasse setzen
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const label = button.textContent.trim();

    // letzte Seite merken
    localStorage.setItem("lastPage", label);

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

let canvas = null;
let ctx = null; // globaler Canvas-Kontext
let stars = [];

function generateStars(count = 20000) {
  stars = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.pow(Math.random(), 0.7) * 300;
    const x = canvas.width / 2 + radius * Math.cos(angle + radius * 0.05);
    const y = canvas.height / 2 + radius * Math.sin(angle + radius * 0.05);
    stars.push({ x, y, highlighted: false });
  }
}

function drawStars() {
  if (!ctx || !window.backgroundImage?.complete) {
    console.warn("Canvas-Kontext oder Hintergrundbild fehlt");
    return;
  }

  ctx.clearRect(0, 0, 800, 600);
  ctx.drawImage(window.backgroundImage, 0, 0, 800, 600);

  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.highlighted ? 2.5 : 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = star.highlighted ? "lime" : "rgba(255, 255, 255, 0.4)";
    ctx.fill();
  });
}

function highlightCivilizations(count) {
  stars.forEach((s, index) => {
    s.highlighted = index < count;
  });
  drawStars();
}

// Integration mit Drake-Berechnung
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
  highlightCivilizations(Math.round(N));
}

// Seite laden: letzte Seite anzeigen (oder "Diagramm")
window.addEventListener("DOMContentLoaded", () => {
  const lastPage = localStorage.getItem("lastPage") || "Diagramm";
  const targetButton = Array.from(buttons).find(btn => btn.textContent.trim() === lastPage);
  if (targetButton) targetButton.click();
});

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

  // Canvas-Element holen (nachdem es erzeugt wurde!)
  canvas = document.getElementById("milkyway-canvas");
  ctx = canvas.getContext("2d");

  if (!window.backgroundImage) {
    window.backgroundImage = new Image();
    window.backgroundImage.src = "milkyway.jpg";
    window.backgroundImage.onload = () => {
      generateStars();  // Jetzt funktioniert's!
      drawStars();
    };
  } else {
    generateStars();
    drawStars();
  }

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
