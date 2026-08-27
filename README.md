# The Commission Ledger — starter site

A static gallery page with year/month + tag filtering. Clicking a thumbnail
opens an in-page popup (not a new tab) that can page through multiple images
for that entry.

## Files
- `index.html` — page structure, including the popup/modal markup
- `styles.css` — all styling (the "ledger" look, plus the modal/lightbox)
- `script.js` — loads `data.json`, builds filters, renders the grid, runs the modal
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
  "images": [
    "https://your-image-host.com/image-1.jpg",
    "https://your-image-host.com/image-2.jpg"
  ]
}
```

- `images` — an array of one or more image URLs. The first one is used as the
  card thumbnail; clicking the card opens all of them in the popup with
  prev/next arrows (arrow keys work too, and Escape closes it)
- `id` — used as the catalog number shown on the card; also used for default sort order (newest first)
- `tags` — free text; the filter bar auto-builds chips from whatever tags appear across your entries

Also edit the placeholder text in `index.html`: the hero heading, the "About"
copy, and the Twitter/Bluesky links in `.hero-links`.

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
Pages, same as the site you referenced:

1. Create a new GitHub repo, push these files to it.
2. In the repo's Settings → Pages, set the source to the `main` branch, root folder.
3. Your site will be live at `https://yourusername.github.io/reponame/`.

Netlify or Vercel also work if you'd rather drag-and-drop the folder.
