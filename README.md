# Which One Do I Reach For?

An interactive explainer for **Python lists vs. dictionaries vs. tuples**, built around real
day-to-day analytical work.

Inspired by the animated, "watch-it-happen" style of
[tidyexplain](https://www.garrickadenbuie.com/project/tidyexplain/), reframed for the
*decision* a learner actually faces: **which container do I reach for, and why?**

Built from the Stringfest Analytics handout *"Python 1: Which One Do I Reach For?"*

## What's inside

One small watchlist, held three different ways:

- **"What do you catch yourself thinking?"** Click the thought that sounds like you and get the
  recommended container, the reasoning, and a code snippet.
- **The big three, animated:**
  - **List** (`['NVDA', 'AAPL', 'MSFT', 'AMZN', 'TSLA']`): add a ticker, sort A to Z (the cells
    physically slide into their new positions), remove the last item, grab one by position.
  - **Dictionary** (`{'AAPL': 225, ...}`): click any ticker to look up its price and watch the
    key-to-value pair light up. Click the missing key to see a `KeyError`. JSON is just a dictionary.
  - **Tuple** (`('USD', 'EUR', 0.92)`): try to change it and get a `TypeError` plus a lock; unpack it
    into named values.
- **Decisions at a glance:** the cheat sheet, clickable.

## Running it

It's a static site. No build step, no dependencies.

```bash
# from the project root
python -m http.server 4173
# then open http://localhost:4173
```

Or just open `index.html` directly in a browser.

### Deploying to GitHub Pages

Push to `main` and enable Pages (Settings, then Pages, deploy from branch, root). The site is
served as-is.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and content |
| `css/styles.css` | Stringfest-branded styling (red `#CF3338` + off-white `#EEECE1`) |
| `js/data.js` | Sample watchlist data and decision-engine content |
| `js/app.js` | Interactions and animations (vanilla JS, no dependencies) |
| `assets/` | Stringfest logo (dark + white variants) |

---

*Stringfest Analytics: helping Excel users move from fragile spreadsheets to confident, scalable analysis.*
