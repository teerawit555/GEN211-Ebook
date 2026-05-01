// ===== BOOK MODE ENGINE =====
// ใช้กับ book.html ที่เขียน .spread ไว้ใน HTML แล้ว
// ไม่ต้องมี SPREADS / buildSpreads / buildThumbs แล้ว

let current = 0;
let flipping = false;

const spreads = Array.from(document.querySelectorAll(".spread"));
const spreadInfo = document.getElementById("spreadInfo");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

function updateUI() {
  if (!spreadInfo || !btnPrev || !btnNext) return;

  const totalPages = spreads.length * 2;
  const startPage = current * 2 + 1;
  const endPage = current * 2 + 2;

  spreadInfo.textContent = `หน้า ${startPage}–${endPage} / ${totalPages}`;

  btnPrev.disabled = current === 0;
  btnNext.disabled = current === spreads.length - 1;
}

function clearFlipClasses(spread) {
  if (!spread) return;

  spread.classList.remove(
    "flipping-out-left",
    "flipping-out-right",
    "flipping-in-left",
    "flipping-in-right"
  );

  spread.style.zIndex = "";
}

function flipSpread(dir) {
  if (flipping) return;

  const next = current + dir;

  if (next < 0 || next >= spreads.length) return;

  flipping = true;

  const currentSpread = spreads[current];
  const nextSpread = spreads[next];

  nextSpread.classList.add("active");
  nextSpread.style.zIndex = "1";
  currentSpread.style.zIndex = "2";

  if (dir > 0) {
    // ไปหน้าถัดไป = พลิกหน้าขวาไปทางซ้าย
    currentSpread.classList.add("flipping-out-right");
    nextSpread.classList.add("flipping-in-left");
  } else {
    // ย้อนกลับ = พลิกหน้าซ้ายกลับไปทางขวา
    currentSpread.classList.add("flipping-out-left");
    nextSpread.classList.add("flipping-in-right");
  }

  setTimeout(() => {
    currentSpread.classList.remove("active");

    clearFlipClasses(currentSpread);
    clearFlipClasses(nextSpread);

    current = next;
    updateUI();

    flipping = false;
  }, 580);
}

function goToSpread(index) {
  if (flipping) return;
  if (index < 0 || index >= spreads.length) return;
  if (index === current) return;

  spreads.forEach((spread) => {
    spread.classList.remove("active");
    clearFlipClasses(spread);
  });

  spreads[index].classList.add("active");
  current = index;
  updateUI();
}

function goHome() {
  window.location.href = "index.html";
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    flipSpread(1);
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    flipSpread(-1);
  }

  if (event.key === "Escape") {
    goHome();
  }
});

window.flipSpread = flipSpread;
window.goToSpread = goToSpread;

document.addEventListener("DOMContentLoaded", () => {
  spreads.forEach((spread, index) => {
    spread.classList.toggle("active", index === current);
  });

  updateUI();
});

// ===== 50/30/20 Budget Chart for Book Mode =====
function initBudgetChart() {
  const incomeInput = document.getElementById("incomeInput");

  const arcNecessary = document.getElementById("arc-necessary");
  const arcWant = document.getElementById("arc-want");
  const arcSave = document.getElementById("arc-save");

  const amtNecessary = document.getElementById("amt-necessary");
  const amtWant = document.getElementById("amt-want");
  const amtSave = document.getElementById("amt-save");

  if (
    !incomeInput ||
    !arcNecessary ||
    !arcWant ||
    !arcSave ||
    !amtNecessary ||
    !amtWant ||
    !amtSave
  ) {
    return;
  }

  const CIRCUMFERENCE = 502.65;

  function formatBaht(value) {
    return `${Math.round(value).toLocaleString("th-TH")} บาท`;
  }

  function drawDonut() {
    const income = Number(incomeInput.value || 0);

    const necessary = income * 0.5;
    const want = income * 0.3;
    const save = income * 0.2;

    amtNecessary.textContent = income > 0 ? formatBaht(necessary) : "—";
    amtWant.textContent = income > 0 ? formatBaht(want) : "—";
    amtSave.textContent = income > 0 ? formatBaht(save) : "—";

    const necessaryLength = CIRCUMFERENCE * 0.5;
    const wantLength = CIRCUMFERENCE * 0.3;
    const saveLength = CIRCUMFERENCE * 0.2;

    arcNecessary.setAttribute(
      "stroke-dasharray",
      `${necessaryLength} ${CIRCUMFERENCE - necessaryLength}`
    );
    arcNecessary.setAttribute("stroke-dashoffset", "0");

    arcWant.setAttribute(
      "stroke-dasharray",
      `${wantLength} ${CIRCUMFERENCE - wantLength}`
    );
    arcWant.setAttribute("stroke-dashoffset", `${-necessaryLength}`);

    arcSave.setAttribute(
      "stroke-dasharray",
      `${saveLength} ${CIRCUMFERENCE - saveLength}`
    );
    arcSave.setAttribute("stroke-dashoffset", `${-(necessaryLength + wantLength)}`);
  }

  incomeInput.addEventListener("input", drawDonut);

  // default value ให้กราฟมีข้อมูลทันที
  incomeInput.value = 18000;
  drawDonut();
}

document.addEventListener("DOMContentLoaded", initBudgetChart);