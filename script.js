const state = {
  entries: [],
  year: "",
  month: "",
  search: "",
  activeTags: new Set(),
};

const galleryEl = document.getElementById("gallery");
const emptyStateEl = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const yearSelect = document.getElementById("year-select");
const monthSelect = document.getElementById("month-select");
const tagDropdown = document.getElementById("tag-dropdown");
const tagDropdownSummary = document.getElementById("tag-dropdown-summary");
const tagMenuEl = document.getElementById("tag-menu");
const clearBtn = document.getElementById("clear-filters");
const resultCountEl = document.getElementById("result-count");

const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalImage = document.getElementById("modal-image");
const modalPrev = document.getElementById("modal-prev");
const modalNext = document.getElementById("modal-next");
const modalNo = document.getElementById("modal-no");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalTags = document.getElementById("modal-tags");
const modalDescription = document.getElementById("modal-description");
const modalCount = document.getElementById("modal-count");

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const modalState = {
  entry: null,
  index: 0,
  lastFocused: null,
};

init();
initModal();

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

  buildYearOptions();
  buildTagMenu();
  render();

  searchInput.addEventListener("input", () => {
    state.search = searchInput.value.trim().toLowerCase();
    render();
  });
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
    state.search = "";
    state.activeTags.clear();
    yearSelect.value = "";
    monthSelect.value = "";
    searchInput.value = "";
    tagMenuEl.querySelectorAll("input[type=checkbox]").forEach((cb) => (cb.checked = false));
    updateTagSummary();
    render();
  });

  document.addEventListener("click", (e) => {
    if (tagDropdown.open && !tagDropdown.contains(e.target)) {
      tagDropdown.open = false;
    }
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

function buildTagMenu() {
  const tags = [...new Set(state.entries.flatMap((e) => e.tags))].sort();
  tags.forEach((tag) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = tag;
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.activeTags.add(tag);
      } else {
        state.activeTags.delete(tag);
      }
      updateTagSummary();
      render();
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(tag));
    tagMenuEl.appendChild(label);
  });
}

function updateTagSummary() {
  const count = state.activeTags.size;
  tagDropdownSummary.textContent = count === 0 ? "All tags" : `${count} tag${count > 1 ? "s" : ""} selected`;
}

function getFiltered() {
  return state.entries.filter((e) => {
    const [y, m] = e.date.split("-");
    if (state.year && y !== state.year) return false;
    if (state.month && m !== state.month) return false;
    if (state.activeTags.size && ![...state.activeTags].every((t) => e.tags.includes(t))) return false;
    if (state.search) {
      const haystack = `${e.title} ${e.artist} ${e.description || ""}`.toLowerCase();
      if (!haystack.includes(state.search)) return false;
    }
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
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";

  const [y, m] = entry.date.split("-");
  const dateLabel = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
  const thumb = entry.images[0];

  card.innerHTML = `
    <img class="card-thumb" src="${thumb}" alt="${entry.title}" loading="lazy">
    <div class="card-body">
      <p class="card-title">${entry.title}</p>
      <div class="card-meta">
        <span>${entry.artist}</span>
        <span>${dateLabel}</span>
      </div>
      <div class="card-tags">
        ${entry.tags.map((t) => `<span class="card-tag">${t}</span>`).join("")}
      </div>
      <span class="card-view">View piece →</span>
    </div>
  `;

  card.addEventListener("click", () => openModal(entry));
  return card;
}

/* ---------- Modal ---------- */

function initModal() {
  modalClose.addEventListener("click", closeModal);
  modalPrev.addEventListener("click", () => stepModal(-1));
  modalNext.addEventListener("click", () => stepModal(1));

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (modalOverlay.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") stepModal(-1);
    if (e.key === "ArrowRight") stepModal(1);
  });
}

function openModal(entry) {
  modalState.entry = entry;
  modalState.index = 0;
  modalState.lastFocused = document.activeElement;

  const [y, m] = entry.date.split("-");
  modalNo.textContent = `No. ${String(entry.id).padStart(3, "0")}`;
  modalTitle.textContent = entry.title;
  modalMeta.textContent = `${entry.artist} · ${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
  modalTags.innerHTML = entry.tags.map((t) => `<span class="card-tag">${t}</span>`).join("");
  modalDescription.textContent = entry.description || "";

  renderModalImage();

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function renderModalImage() {
  const { entry, index } = modalState;
  const images = entry.images;
  modalImage.src = images[index];
  modalImage.alt = `${entry.title} (image ${index + 1} of ${images.length})`;
  modalCount.textContent = images.length > 1 ? `${index + 1} / ${images.length}` : "";
  const multi = images.length > 1;
  modalPrev.hidden = !multi;
  modalNext.hidden = !multi;
}

function stepModal(delta) {
  if (!modalState.entry) return;
  const total = modalState.entry.images.length;
  if (total <= 1) return;
  modalState.index = (modalState.index + delta + total) % total;
  renderModalImage();
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = "";
  modalState.entry = null;
  if (modalState.lastFocused) modalState.lastFocused.focus();
}
