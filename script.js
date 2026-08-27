const state = {
  entries: [],
  year: "",
  month: "",
  activeTags: new Set(),
};

const galleryEl = document.getElementById("gallery");
const emptyStateEl = document.getElementById("empty-state");
const yearSelect = document.getElementById("year-select");
const monthSelect = document.getElementById("month-select");
const tagChipsEl = document.getElementById("tag-chips");
const clearBtn = document.getElementById("clear-filters");
const resultCountEl = document.getElementById("result-count");
const latestNoEl = document.getElementById("latest-no");

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

init();

async function init() {
  try {
    const res = await fetch("data.json");
    state.entries = await res.json();
  } catch (err) {
    galleryEl.innerHTML = `<p style="font-family:var(--font-mono);color:var(--muted);">
      Couldn't load data.json — if you're opening this file directly (file://),
      serve it from a local server instead (e.g. <code>python3 -m http.server</code>)
      or host it on GitHub Pages, where fetch works normally.
    </p>`;
    return;
  }

  state.entries.sort((a, b) => b.id - a.id);
  if (state.entries.length) {
    latestNoEl.textContent = String(state.entries[0].id).padStart(3, "0");
  }

  buildYearOptions();
  buildTagChips();
  render();

  yearSelect.addEventListener("change", () => {
    state.year = yearSelect.value;
    render();
  });
  monthSelect.addEventListener("change", () => {
    state.month = monthSelect.value;
    render();
  });
  clearBtn.addEventListener("click", () => {
    state.year = "";
    state.month = "";
    state.activeTags.clear();
    yearSelect.value = "";
    monthSelect.value = "";
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    render();
  });
}

function buildYearOptions() {
  const years = [...new Set(state.entries.map((e) => e.date.slice(0, 4)))].sort((a, b) => b - a);
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });
  MONTH_NAMES.forEach((name, i) => {
    const opt = document.createElement("option");
    opt.value = String(i + 1).padStart(2, "0");
    opt.textContent = name;
    monthSelect.appendChild(opt);
  });
}

function buildTagChips() {
  const tags = [...new Set(state.entries.flatMap((e) => e.tags))].sort();
  tags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = tag;
    chip.addEventListener("click", () => {
      if (state.activeTags.has(tag)) {
        state.activeTags.delete(tag);
        chip.classList.remove("active");
      } else {
        state.activeTags.add(tag);
        chip.classList.add("active");
      }
      render();
    });
    tagChipsEl.appendChild(chip);
  });
}

function getFiltered() {
  return state.entries.filter((e) => {
    const [y, m] = e.date.split("-");
    if (state.year && y !== state.year) return false;
    if (state.month && m !== state.month) return false;
    if (state.activeTags.size && ![...state.activeTags].every((t) => e.tags.includes(t))) return false;
    return true;
  });
}

function render() {
  const filtered = getFiltered();
  resultCountEl.textContent = `${filtered.length} of ${state.entries.length}`;
  galleryEl.innerHTML = "";

  if (!filtered.length) {
    emptyStateEl.hidden = false;
    return;
  }
  emptyStateEl.hidden = true;

  filtered.forEach((entry) => {
    galleryEl.appendChild(buildCard(entry));
  });
}

function buildCard(entry) {
  const card = document.createElement("a");
  card.className = "card";
  card.href = entry.external;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const [y, m] = entry.date.split("-");
  const dateLabel = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;

  card.innerHTML = `
    <span class="card-no">No. ${String(entry.id).padStart(3, "0")}</span>
    <img class="card-thumb" src="${entry.thumb}" alt="${entry.title}" loading="lazy">
    <div class="card-body">
      <p class="card-title">${entry.title}</p>
      <div class="card-meta">
        <span>${entry.artist}</span>
        <span>${dateLabel}</span>
      </div>
      <div class="card-tags">
        ${entry.tags.map((t) => `<span class="card-tag">${t}</span>`).join("")}
      </div>
      <span class="card-view">View full piece →</span>
    </div>
  `;
  return card;
}
