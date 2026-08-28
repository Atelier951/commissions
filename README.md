# Atelier951's Commission Gallery — starter site

A static gallery page with search, year/month/tag filtering, sorting, a
guro content toggle, and an in-page popup viewer that can page through
multiple images per entry.

## Files
- `index.html` — page structure, including the image popup and About popup
- `styles.css` — all styling
- `script.js` — loads `data.json`, builds filters, renders the grid, runs both popups
- `data.json` — your actual commission entries (sample data included)

## Customize the content
Edit `data.json`. Each entry:

```json
{
  "id": 301,
  "title": "Riverside Portrait",
  "artist": "@example_artist",
  "date": "2026-07-15",
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
  of them in the popup with prev/next arrows (arrow keys work too, Escape closes it)
- `thumbnail` — optional. If left as `""`, the card thumbnail falls back to
  the first entry in `images`. Set it to a URL to use a different image
  (e.g. a cropped or lower-res version) as the card thumbnail specifically
- `source` — optional. If filled in with a URL, the popup shows a "Source"
  link pointing there. Leave as `""` to hide that line entirely
- `description` — optional; shown in the popup, and searchable via the search bar
- `id` — used for the "Entry number" sort option and as a tie-breaker when
  sorting by date; no longer shown on the card itself
- `tags` — free text; the tags dropdown auto-builds checkboxes from whatever
  tags appear across your entries, **except** `guro`, which is handled separately (see below)
- `date` — format `YYYY-MM-DD`; only the month and year are ever displayed

The search bar matches against `title`, `artist`, and `description`.

## Sorting
The "Sort by" dropdown next to the tags offers:
- **Date** (default) — newest first; entries with the same date are
  tie-broken by `id`, highest first
- **Entry number** — sorted by `id`, highest first

## Guro content toggle
Any entry tagged `guro` (case-insensitive) is hidden from the gallery by
default and excluded from the tags dropdown. The 🩸 "Show guro" button in
the filter bar reveals them; click again to hide. This toggle is independent
of all other filters — guro entries still respect search/date/tag filters
once revealed.

## Blank / reserved entries
`data.json` currently has an entry for every id from 1 to 303, so future
commissions can just have their existing blank entry filled in rather than
needing a new one added and re-sorted. An entry is treated as blank (and
skipped entirely from the gallery, filters, and result count) whenever its
`images` array is empty. To "activate" a reserved id, just fill in its
`title`, `artist`, `date`, `tags`, and `images` — leaving `images` empty is
what keeps it hidden.

## The About and Twitter links
- **About** opens an in-page popup with your bio text — edit it directly in
  `index.html` inside `<p class="about-text">`
- **Twitter** links out to `https://x.com/atelier951` — update the `href` in
  `index.html` if that changes

## Run it locally
Because the page fetches `data.json`, opening `index.html` directly by
double-clicking it won't load the data (browsers block `fetch` on `file://`).
Instead, from this folder run:

```
python3 -m http.server
```

then open `http://localhost:8000` in your browser.

## Host it for free
This is a plain static site — no build step. The simplest option is GitHub
Pages:

1. Create a new GitHub repo, push these files to it.
2. In the repo's Settings → Pages, set the source to the `main` branch, root folder.
3. Your site will be live at `https://yourusername.github.io/reponame/`.

When updating, always upload all files together (`index.html`, `styles.css`,
`script.js`, `data.json`) — they reference each other's element IDs and data
fields, so an outdated version of one can break the whole page.
