// --- Navigation: Buttons + Content-Elemente ---
const buttons = document.querySelectorAll("nav button"); // Alle Buttons im Navigationsbereich auswählen
const content = document.querySelector(".content"); // Das Hauptelement, in das der Seiteninhalt geladen wird

// Mapping der statischen Seiten anhand der Button-Beschriftung
const staticPages = {
  "Was ist das Fermi-Paradox?": "was_ist_fermi.html",
  "Anforderungen für Leben": "anforderungen.html",
  "Entfernungen": "entfernungen.html",
  "Zeiträume": "zeitraeume.html",
  "Kardaschow-Skala": "kardashev.html",
  "Drake-Gleichung": "drake.html"
};

// Event-Listener für alle Buttons einrichten
buttons.forEach(button => {
  button.addEventListener("click", () => {
    // Zuerst alle Buttons deselektieren
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active"); // Den geklickten Button markieren

    const label = button.textContent.trim(); // Button-Beschriftung holen

    // Gewählte Seite im lokalen Speicher merken
    localStorage.setItem("lastPage", label);

    if (label === "Diagramm") {
      // Spezialfall: interaktive Diagrammseite rendern
      renderDiagramSection();
    } else if (staticPages[label]) {
      // Ansonsten: passende HTML-Datei laden und anzeigen
      fetch(staticPages[label])
        .then(res => res.text())
        .then(html => content.innerHTML = html)
        .catch(err => content.innerHTML = `<p>Fehler beim Laden: ${err}</p>`);
    }
  });
});

// --- Globale Variablen für Canvas und Sterne ---
let canvas = null;
let ctx = null; // Kontext zum Zeichnen auf dem Canvas
let stars = []; // Array für Sterne

// Funktion zur Erzeugung zufälliger Sterne im Spiralgalaxie-Stil
function generateStars(count = 20000) {
  stars = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.pow(Math.random(), 0.7) * (canvas.width / 2.5); // exponentielle Verteilung für realistischere Verteilung
    const x = canvas.width / 2 + radius * Math.cos(angle + radius * 0.05); // leichte Spiralform
    const y = canvas.height / 2 + radius * Math.sin(angle + radius * 0.05);
    stars.push({ x, y, highlighted: false }); // Sterne sind standardmäßig nicht hervorgehoben
  }
}

// Zeichnet alle Sterne auf das Canvas
function drawStars() {
  if (!ctx || !window.backgroundImage?.complete) {
    console.warn("Canvas-Kontext oder Hintergrundbild fehlt");
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(window.backgroundImage, 0, 0, canvas.width, canvas.height); // Hintergrundbild zeichnen

  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.highlighted ? 2.5 : 1.5, 0, 2 * Math.PI); // größere Sterne, wenn hervorgehoben
    ctx.fillStyle = star.highlighted ? "lime" : "rgba(255, 255, 255, 0.4)";
    ctx.fill();
  });
}

// Hebt die ersten `count` Sterne hervor
function highlightCivilizations(count) {
  stars.forEach((s, index) => {
    s.highlighted = index < count;
  });
  drawStars(); // Nach Hervorhebung neu zeichnen
}

// Funktion zur Berechnung von Drake-Gleichung und Visualisierung
function updateResult() {
  const form = document.getElementById("drake-form");

  // Werte aus Formular holen oder auf Default zurückgreifen
  const R = parseFloat(form.querySelector("input[name='R']")?.value || defaultValues.R);
  const fp = parseFloat(form.querySelector("input[name='fp']")?.value || defaultValues.fp);
  const ne = parseFloat(form.querySelector("input[name='ne']")?.value || defaultValues.ne);
  const fl = parseFloat(form.querySelector("input[name='fl']")?.value || defaultValues.fl);
  const fi = parseFloat(form.querySelector("input[name='fi']")?.value || defaultValues.fi);
  const fc = parseFloat(form.querySelector("input[name='fc']")?.value || defaultValues.fc);
  const L = parseFloat(form.querySelector("input[name='L']")?.value || defaultValues.L);

  // Drake-Gleichung berechnen
  const N = R * fp * ne * fl * fi * fc * L;

  // Ergebnis anzeigen
  document.getElementById("drake-result").textContent = N.toFixed(2);

  // Visualisierung entsprechend aktualisieren
  highlightCivilizations(Math.round(N));
}

// Beim Laden der Seite: letzte Seite wiederherstellen oder Standard ("Diagramm")
window.addEventListener("DOMContentLoaded", () => {
  const lastPage = localStorage.getItem("lastPage") || "Diagramm";
  const targetButton = Array.from(buttons).find(btn => btn.textContent.trim() === lastPage);
  if (targetButton) targetButton.click(); // Button programmatisch klicken
});

// Standardwerte für Drake-Gleichung
const defaultValues = {
  R: 1.5,
  fp: 0.7,
  ne: 0.2,
  fl: 0.5,
  fi: 0.1,
  fc: 0.1,
  L: 1000
};

// Renderfunktion für interaktive Drake-Diagrammseite
function renderDiagramSection() {
  // HTML-Struktur für Formular und Canvas einfügen
  content.innerHTML = `
    <h2>Interaktiver Drake-Rechner</h2>
    <div id="drake-form"></div>
    <button id="reset-values">Standardwerte wiederherstellen</button>
    <div id="drake-output">
      <div id="drake-result-box">
        <p><strong>Ergebnis:</strong></p>
        <p id="drake-result-value"><span id="drake-result">?</span> mögliche Zivilisation(en)</p>
      </div>
      <canvas id="milkyway-canvas" width="1200" height="700"></canvas>
    </div>
  `;

  // Canvas initialisieren
  canvas = document.getElementById("milkyway-canvas");
  ctx = canvas.getContext("2d");

  // Hintergrundbild einmalig laden
  if (!window.backgroundImage) {
    window.backgroundImage = new Image();
    window.backgroundImage.src = "milkyway.jpg";
    window.backgroundImage.onload = () => {
      generateStars(); // Sterne generieren, wenn Bild geladen
      drawStars();
    };
  } else {
    generateStars(); // Falls Bild schon geladen ist
    drawStars();
  }

  initForm(); // Drake-Formular erzeugen

  // Reset-Button für Standardwerte
  document.getElementById("reset-values").addEventListener("click", () => {
    initForm(); // Formular neu aufbauen
    document.querySelectorAll('#drake-form input[type="range"]').forEach(updateSliderBackground);
  });
}

// Hilfsfunktion zum Erstellen eines Eingabefeldes + Slider
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

  // Synchronisierung: Slider -> Zahl
  slider.addEventListener("input", () => {
    input.value = slider.value;
    updateSliderBackground(slider);
    updateResult();
  });

  // Synchronisierung: Zahl -> Slider
  input.addEventListener("input", () => {
    slider.value = input.value;
    updateSliderBackground(slider);
    updateResult();
  });

  wrapper.appendChild(labelElem);
  wrapper.appendChild(slider);
  wrapper.appendChild(input);

  document.getElementById("drake-form").appendChild(wrapper);
  updateSliderBackground(slider); // Farbhintergrund initial setzen
}

// Initialisiert alle Eingabefelder des Drake-Formulars
function initForm() {
  const form = document.getElementById("drake-form");
  form.innerHTML = ""; // Formular leeren

  // Alle Parameter einzeln hinzufügen
  createInput("R", "R* (Sternentstehungsrate)", 0.1, 10, 0.1, defaultValues.R);
  createInput("fp", "fₚ (Anteil mit Planetensystemen)", 0.1, 1, 0.01, defaultValues.fp);
  createInput("ne", "nₑ (bewohnbare Planeten)", 0.1, 5, 0.1, defaultValues.ne);
  createInput("fl", "fₗ (mit Leben)", 0.1, 1, 0.01, defaultValues.fl);
  createInput("fi", "fᵢ (intelligentes Leben)", 0.1, 1, 0.01, defaultValues.fi);
  createInput("fc", "f𝚌 (kommunizierende Zivilisationen)", 0.1, 1, 0.01, defaultValues.fc);
  createInput("L", "L (Dauer in Jahren)", 1, 10000, 1, defaultValues.L);

  updateResult(); // Direkt Ergebnis berechnen
}

// Passt den Farbverlauf des Sliders an den aktuellen Wert an
function updateSliderBackground(slider) {
  const min = slider.min || 0;
  const max = slider.max || 100;
  const val = slider.value;

  const percentage = ((val - min) / (max - min)) * 100;
  // CSS-Farbverlauf: links gefüllt mit Farbe, rechts weiß
  slider.style.background = `linear-gradient(to right, var(--eggplant) 0%, var(--eggplant) ${percentage}%, white ${percentage}%, white 100%)`;
}
