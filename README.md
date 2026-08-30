# Atelier951's Commission Gallery — starter site

A three-page static site (My OCs, Non-OC, Caffy Doodles), each with its own
data file but sharing the same look, filters, popups, and toggles. Includes
search, year/tag filtering (My OCs also gets a Series filter), sorting,
guro and bestiality content toggles, and an in-page popup viewer that pages
through multiple images per entry.

## Files
- `index.html` — the **My OCs** page (main gallery), reads `data.json`, has the Series filter
- `nonoc.html` — the **Non-OC** page, reads `data_nonoc.json`, no Series filter
- `caffy.html` — the **Caffy Doodles** page, reads `data_caffy.json`, no Series filter
- `styles.css` — all styling, shared by all three pages
- `script.js` — shared logic: loads whichever data file the current page
  points to, builds filters, renders the grid, runs both popups
- `data.json` / `data_nonoc.json` / `data_caffy.json` — the entries for each page

All three HTML pages load the same `script.js` and `styles.css`. Each page
tells the script which data file to use via a `data-source` attribute on
`<body>`, e.g. `<body data-source="data_nonoc.json">`.

## The top nav buttons
"My OCs", "Non-OC", and "Caffy Doodles" in the header link between the three
pages. Whichever page you're on shows its own button in an "active" (lit up)
state — this is set per-file in the HTML (a `class="nav-btn active"` on that
page's own link), not automatic, so if you rename or add pages you'll need
to update the `active` class by hand on each one.

## Customize the content
Edit `data.json` (or `data_nonoc.json` / `data_caffy.json` — identical format). Each entry:

```json
{
  "id": 301,
  "title": "Riverside Portrait",
  "artist": "@example_artist",
  "date": "2026-07-15",
  "series": ["Riverside Saga"],
  "tags": ["character", "color", "full-body"],
  "description": "A short description of the piece, shown in the popup below the image.",
  "thumbnail": "",
  "source": "",
  "images": [
    "https://your-image-host.com/image-1.jpg",
    "https://your-image-host.com/image-2.jpg"
  ]
}
```

- `images` — an array of one or more image URLs. Clicking the card opens all
  of them in the popup with prev/next arrows (arrow keys work too, Escape closes it).
  The small count badge in the corner of a thumbnail only appears when an
  entry has more than one image
- `series` — an array of series/verse names this entry belongs to. Only used
  by the Series dropdown on the **My OCs** page — `nonoc.html` and
  `caffy.html` don't have that filter, so this field is harmless but unused
  there. Leave as `[]` if it doesn't belong to a series
- `thumbnail` — optional. If left as `""`, the card thumbnail falls back to
  the first entry in `images`. Set it to a URL to use a different image
  (e.g. a cropped or lower-res version) as the card thumbnail specifically
- `source` — optional. If filled in with a URL, the popup shows a "Source"
  link pointing there. Leave as `""` to hide that line entirely
- `description` — optional; shown in the popup, and searchable via the search bar
- `id` — used for the "Entry number" sort option and as a tie-breaker when
  sorting by date; no longer shown on the card itself
- `tags` — free text; the tags dropdown auto-builds checkboxes from whatever
  tags appear across your entries, including `guro` and `bestiality` (which
  also have their own dedicated toggles — see below)
- `date` — accepts either `YYYY-MM-DD` or `M/D/YYYY`; only the month and
  year are ever displayed

The search bar matches against `title`, `artist`, and `description`.

## Sorting
The "Sort by" dropdown next to the tags offers:
- **Date** (default) — newest first; entries with the same date are
  tie-broken by `id`, highest first
- **Entry number** — sorted by `id`, highest first

## Content toggles (guro / bestiality)
Any entry tagged `guro` or `bestiality` (case-insensitive) is hidden from
the gallery by default on all three pages, but both tags still appear as
normal checkboxes in the tags dropdown. There are two ways to reveal either
one: click its dedicated toggle button (🩸 "Show guro" / 🐴 "Show
bestiality" — reveals all matching entries, subject to your other filters),
or check the tag directly in the tags dropdown (reveals only entries with
that tag, same as any other tag filter). All of these work independently of
each other.

## Blank / reserved entries
An entry is treated as blank (and skipped entirely from the gallery,
filters, and result count) whenever its `images` array is empty. `data.json`
has reserved ids like this so future commissions can just have an existing
blank entry filled in. To "activate" a reserved id, fill in its `title`,
`artist`, `date`, `tags`, and `images` — leaving `images` empty is what
keeps it hidden.

## The About and Twitter links
- **About** opens an in-page popup with your bio text — edit it directly in
  each HTML file inside `<p class="about-text">` (update it in all three
  files if you want it consistent everywhere)
- **Twitter** links out to `https://x.com/atelier951` — update the `href` in
  each HTML file if that changes

## Making the site mobile-friendly
The filter bar now wraps onto additional lines instead of squeezing/overlapping
when the screen is too narrow to fit everything on one row (like Excel's
"wrap text"). Below 640px wide, the search box and tags dropdown expand to
full width and the rest of the filters arrange two-per-row for easier
tapping.

## Run it locally
Because each page fetches its data file via `fetch()`, opening an HTML file
directly by double-clicking it won't load the data (browsers block `fetch`
on `file://`). Instead, from this folder run:

```
python3 -m http.server
```

then open `http://localhost:8000` (or `/nonoc.html`, `/caffy.html`) in your browser.

## Host it for free
This is a plain static site — no build step. The simplest option is GitHub
Pages:

1. Create a new GitHub repo, push these files to it.
2. In the repo's Settings → Pages, set the source to the `main` branch, root folder.
3. Your site will be live at `https://yourusername.github.io/reponame/`
   (and `/nonoc.html`, `/caffy.html` for the other two galleries).

When updating, always upload all files together — `index.html`, `nonoc.html`,
`caffy.html`, `styles.css`, `script.js`, and all three data files reference
each other's element IDs and data fields, so an outdated version of one can
break the whole page.
