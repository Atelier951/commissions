# The Commission Ledger — starter site

A static gallery page with year/month + tag filtering. Thumbnails link out
to wherever the full image is actually hosted (Imgur, Google Photos, etc.) —
this site never re-hosts the full-size art itself.

## Files
- `index.html` — page structure
- `styles.css` — all styling (the "ledger" look: catalog numbers, dashed spine, warm parchment cards)
- `script.js` — loads `data.json`, builds filters, renders the grid
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
  "thumb": "https://your-thumbnail-host.com/small-version.jpg",
  "external": "https://imgur.com/your-full-image-link"
}
```

- `thumb` — a smaller preview image (can be the same host, just a resized version)
- `external` — where clicking the card takes people (the full gallery post)
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
