document.addEventListener("DOMContentLoaded", () => {
  const navButtons = document.querySelectorAll("nav button");
  const contentWrapper = document.querySelector(".content");
  const pages = [
    "was_ist_fermi.html",
    "anforderungen.html",
    "entfernungen.html",
    "zeitraeume.html",
    "kardashev.html",
    "drake.html",
    "diagramm" // last entry handled separately
  ];

  function loadContent(index) {
    navButtons.forEach(btn => btn.classList.remove("active"));
    navButtons[index].classList.add("active");

    if (pages[index] === "diagramm") {
      document.getElementById("drake-content").style.display = "none";
      document.getElementById("diagramm-content").style.display = "block";
      return;
    }

    document.getElementById("drake-content").style.display = "none";
    document.getElementById("diagramm-content").style.display = "none";

    fetch(pages[index])
      .then(res => res.text())
      .then(html => {
        contentWrapper.innerHTML = '<div class="content">' + html + '</div>';
      });
  }

  navButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => loadContent(i));
  });

  loadContent(6); // default to diagramm
});