# Which One Do I Reach For?

An interactive explainer for **Python lists vs. dictionaries vs. tuples** — plus loops,
functions, NumPy and pandas — built around real day-to-day analytical/financial work.

Inspired by the animated, "watch-it-happen" style of
[tidyexplain](https://www.garrickadenbuie.com/project/tidyexplain/), reframed for the
*decision* a learner actually faces: **which container or construct do I reach for, and why?**

Built from the Stringfest Analytics handout *"Python 1: Which One Do I Reach For?"*

## What's inside

- **"What do you catch yourself thinking?"** — click the thought that sounds like you and get
  the recommended structure, the reasoning, and a financial code snippet.
- **The big three, animated** — same ticker/price data in three containers:
  - **List** — append, sort (cells physically slide into place), pop, grab-by-index.
  - **Dictionary** — look up a ticker by name and watch the key→value pair light up
    (and a `KeyError` when it's missing). JSON is just a dictionary.
  - **Tuple** — try to change it and get a `TypeError` + lock; unpack it into named variables.
- **"Ask yourself" flip cards** — for vs. while, comprehension vs. loop, lambda vs. def,
  plain Python vs. NumPy vs. pandas.
- **Decisions at a glance** — the whole cheat sheet, clickable.

## Running it

It's a static site — no build step, no dependencies.

```bash
# from the project root
python -m http.server 4173
# then open http://localhost:4173
```

Or just open `index.html` directly in a browser.

### Deploying to GitHub Pages

Push to `main` and enable Pages (Settings → Pages → deploy from branch, root). The site is
served as-is.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and content |
| `css/styles.css` | Stringfest-branded styling (red `#CF3338` + off-white `#EEECE1`) |
| `js/data.js` | All teaching content (decision chips, flip cards) |
| `js/app.js` | Interactions and animations (vanilla JS, no dependencies) |
| `assets/` | Stringfest logo (dark + white variants) |

---

*Stringfest Analytics — helping Excel users move from fragile spreadsheets to confident, scalable analysis.*
