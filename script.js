const state = {
  entries: [],
  year: "",
  series: "",
  search: "",
  activeTags: new Set(),
  sortBy: "date",
  showGuro: false,
  showBestiality: false,
};

const galleryEl = document.getElementById("gallery");
const emptyStateEl = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const yearSelect = document.getElementById("year-select");
const seriesSelect = document.getElementById("series-select");
const tagDropdown = document.getElementById("tag-dropdown");
const tagDropdownSummary = document.getElementById("tag-dropdown-summary");
const tagMenuEl = document.getElementById("tag-menu");
const sortSelect = document.getElementById("sort-select");
const guroToggle = document.getElementById("guro-toggle");
const bestialityToggle = document.getElementById("bestiality-toggle");
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
const modalSource = document.getElementById("modal-source");
const modalSourceLink = document.getElementById("modal-source-link");
const modalOriginalLink = document.getElementById("modal-original-link");
const modalCount = document.getElementById("modal-count");

const aboutLink = document.getElementById("about-link");
const aboutOverlay = document.getElementById("about-overlay");
const aboutClose = document.getElementById("about-close");

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const GURO_TAG = "guro";
const BESTIALITY_TAG = "bestiality";
const DATA_SOURCE = document.body.dataset.source || "data.json";

// Routes an image through wsrv.nl (a free image cache/resize proxy) so the
// browser downloads a small resized WebP instead of the original full-res
// file. Falls back to the original URL automatically if the proxy fails.
function resizedUrl(url, width, quality = 80) {
  if (!url) return url;
  const params = new URLSearchParams({
    url,
    w: String(width),
    output: "webp",
    q: String(quality),
    default: url,
  });
  return `https://wsrv.nl/?${params.toString()}`;
}

function isGifUrl(url) {
  if (!url) return false;
  return /\.gif(\?.*)?$/i.test(url);
}

// Like resizedUrl, but skips the resize proxy entirely for GIFs (wsrv.nl
// doesn't handle them), serving the original file directly instead so
// animation isn't lost or broken.
function displayUrl(url, width, quality = 80) {
  if (isGifUrl(url)) return url;
  return resizedUrl(url, width, quality);
}

// Accepts "YYYY-MM-DD" or "M/D/YYYY" (or "MM/DD/YYYY") and always returns "YYYY-MM-DD".
// Falls back to the raw string if it doesn't match either pattern.
function normalizeDate(raw) {
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, mm, dd, yyyy] = us;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return raw;
}

const modalState = {
  entry: null,
  index: 0,
  lastFocused: null,
};

init();
initModal();
initAboutModal();

async function init() {
  try {
    const res = await fetch(DATA_SOURCE);
    state.entries = await res.json();
  } catch (err) {
    galleryEl.innerHTML = `<p style="font-family:var(--font-mono);color:var(--muted);">
      Couldn't load ${DATA_SOURCE} — if you're opening this file directly (file://),
      serve it from a local server instead (e.g. <code>python3 -m http.server</code>)
      or host it on GitHub Pages, where fetch works normally.
    </p>`;
    return;
  }

  buildYearOptions();
  if (seriesSelect) buildSeriesOptions();
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
  if (seriesSelect) {
    seriesSelect.addEventListener("change", () => {
      state.series = seriesSelect.value;
      render();
    });
  }
  sortSelect.addEventListener("change", () => {
    state.sortBy = sortSelect.value;
    render();
  });
  guroToggle.addEventListener("click", () => {
    state.showGuro = !state.showGuro;
    guroToggle.setAttribute("aria-pressed", String(state.showGuro));
    guroToggle.innerHTML = state.showGuro
      ? '<span aria-hidden="true">🩸</span> Hide guro'
      : '<span aria-hidden="true">🩸</span> Show guro';
    render();
  });
  bestialityToggle.addEventListener("click", () => {
    state.showBestiality = !state.showBestiality;
    bestialityToggle.setAttribute("aria-pressed", String(state.showBestiality));
    bestialityToggle.innerHTML = state.showBestiality
      ? '<span aria-hidden="true">🐴</span> Hide bestiality'
      : '<span aria-hidden="true">🐴</span> Show bestiality';
    render();
  });
  clearBtn.addEventListener("click", () => {
    state.year = "";
    state.series = "";
    state.search = "";
    state.activeTags.clear();
    state.sortBy = "date";
    yearSelect.value = "";
    if (seriesSelect) seriesSelect.value = "";
    searchInput.value = "";
    sortSelect.value = "date";
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

function hasContent(entry) {
  return Array.isArray(entry.images) && entry.images.length > 0;
}

function buildYearOptions() {
  const years = [...new Set(
    state.entries.filter(hasContent).map((e) => normalizeDate(e.date).slice(0, 4))
  )].sort((a, b) => b - a);
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });
}

function buildSeriesOptions() {
  const series = [...new Set(
    state.entries.filter(hasContent).flatMap((e) => Array.isArray(e.series) ? e.series : [])
  )].sort();
  series.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    seriesSelect.appendChild(opt);
  });
}

function buildTagMenu() {
  const tags = [...new Set(state.entries.filter(hasContent).flatMap((e) => e.tags))].sort();
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

function isGuro(entry) {
  return entry.tags.some((t) => t.toLowerCase() === GURO_TAG);
}

function isBestiality(entry) {
  return entry.tags.some((t) => t.toLowerCase() === BESTIALITY_TAG);
}

function getFiltered() {
  const guroTagSelected = [...state.activeTags].some((t) => t.toLowerCase() === GURO_TAG);
  const bestialityTagSelected = [...state.activeTags].some((t) => t.toLowerCase() === BESTIALITY_TAG);
  return state.entries.filter((e) => {
    if (!hasContent(e)) return false;
    if (isGuro(e) && !state.showGuro && !guroTagSelected) return false;
    if (isBestiality(e) && !state.showBestiality && !bestialityTagSelected) return false;
    const [y] = normalizeDate(e.date).split("-");
    if (state.year && y !== state.year) return false;
    if (state.series && !(Array.isArray(e.series) && e.series.includes(state.series))) return false;
    if (state.activeTags.size && ![...state.activeTags].every((t) => e.tags.includes(t))) return false;
    if (state.search) {
      const haystack = `${e.title} ${e.artist} ${e.description || ""}`.toLowerCase();
      if (!haystack.includes(state.search)) return false;
    }
    return true;
  });
}

function sortEntries(entries) {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (state.sortBy === "id") {
      return b.id - a.id;
    }
    // sort by date, tie-break by id
    const dateA = normalizeDate(a.date);
    const dateB = normalizeDate(b.date);
    if (dateA !== dateB) {
      return dateA < dateB ? 1 : -1;
    }
    return b.id - a.id;
  });
  return sorted;
}

function render() {
  const filtered = sortEntries(getFiltered());
  const total = state.entries.filter(hasContent).length;
  resultCountEl.textContent = `${filtered.length} of ${total}`;
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

function getThumb(entry) {
  return entry.thumbnail && entry.thumbnail.trim() ? entry.thumbnail : entry.images[0];
}

function buildCard(entry) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";

  const thumb = getThumb(entry);
  const thumbSrc = displayUrl(thumb, 460, 75);
  const count = entry.images.length;
  const badge = count > 1 ? `<span class="card-image-count">${count}</span>` : "";

  card.innerHTML = `
    <div class="card-thumb-wrap">
      <img class="card-thumb" src="${thumbSrc}" alt="${entry.title}" loading="lazy" decoding="async">
      ${badge}
    </div>
    <div class="card-body">
      <p class="card-title">${entry.title}</p>
    </div>
  `;

  card.addEventListener("click", () => openModal(entry));
  return card;
}

/* ---------- Image modal ---------- */

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

  const [y, m] = normalizeDate(entry.date).split("-");
  modalNo.textContent = `No. ${String(entry.id).padStart(3, "0")}`;
  modalTitle.textContent = entry.title;
  modalMeta.textContent = `${entry.artist} · ${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
  modalTags.innerHTML = entry.tags.map((t) => `<span class="card-tag">${t}</span>`).join("");
  modalDescription.textContent = entry.description || "";

  if (entry.source && entry.source.trim()) {
    modalSourceLink.href = entry.source;
    modalSource.hidden = false;
  } else {
    modalSource.hidden = true;
  }

  renderModalImage();

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function renderModalImage() {
  const { entry, index } = modalState;
  const images = entry.images;
  modalImage.src = displayUrl(images[index], 1400, 85);
  modalImage.alt = `${entry.title} (image ${index + 1} of ${images.length})`;
  modalOriginalLink.href = images[index];
  modalCount.textContent = images.length > 1 ? `${index + 1} / ${images.length}` : "";
  const multi = images.length > 1;
  modalPrev.hidden = !multi;
  modalNext.hidden = !multi;
  preloadNeighborImages(entry, index);
}

// Warms the browser cache for the next/prev images so paging through a
// multi-image entry feels instant instead of waiting on each click.
function preloadNeighborImages(entry, index) {
  const total = entry.images.length;
  if (total <= 1) return;
  const nextIndex = (index + 1) % total;
  const prevIndex = (index - 1 + total) % total;
  [nextIndex, prevIndex].forEach((i) => {
    const preload = new Image();
    preload.src = displayUrl(entry.images[i], 1400, 85);
  });
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

/* ---------- About modal ---------- */

function initAboutModal() {
  let lastFocused = null;

  aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    lastFocused = document.activeElement;
    aboutOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    aboutClose.focus();
  });

  function close() {
    aboutOverlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  aboutClose.addEventListener("click", close);
  aboutOverlay.addEventListener("click", (e) => {
    if (e.target === aboutOverlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!aboutOverlay.hidden && e.key === "Escape") close();
  });
}
