/* =========================================================
   Content + sample data for the lists / dictionaries / tuples
   explainer. Adapted from George Mount / Stringfest's handout
   "Python 1: Which One Do I Reach For?"

   One small watchlist powers all three demos:
     - the LIST is the watchlist of tickers (ordered, changeable)
     - the DICTIONARY maps each ticker to its price (looked up by name)
     - the TUPLE is a fixed FX assumption (locked, travels together)
   ========================================================= */

// Shared sample data. Five tickers, deliberately out of alphabetical
// order so that sorting visibly reshuffles them.
const WATCHLIST = ["NVDA", "AAPL", "MSFT", "AMZN", "TSLA"];
const APPEND_TICKER = "GOOG";

const PRICES = { AAPL: 225, MSFT: 420, NVDA: 140, AMZN: 205, TSLA: 350 };
const MISSING_KEY = "META"; // not in PRICES, used to show a KeyError

const FX = ["USD", "EUR", 0.92]; // a fixed currency assumption

// Decision-engine chips. Each routes to its deep-dive panel.
const THOUGHTS = [
  {
    thought: "I&rsquo;ll look this up by name",
    tool: "Dictionary",
    why: "The moment your instinct is &ldquo;give me the value for AAPL&rdquo; rather than &ldquo;give me the third item,&rdquo; you want a dictionary. Ticker to price, ticker to company, a setting to its value. It&rsquo;s also exactly what an API hands back, since JSON is just a dictionary.",
    code: "prices = {'AAPL': 225, 'MSFT': 420}\nprices['AAPL']          # 225",
    panel: "dict"
  },
  {
    thought: "It&rsquo;s an ordered list I&rsquo;ll add to or change",
    tool: "List",
    why: "An ordered sequence of similar things that you walk through or grab by position. A watchlist of tickers, a column of prices, the rows you loop over. You can add, drop, and reorder freely.",
    code: "watchlist = ['NVDA', 'AAPL', 'MSFT']\nwatchlist.append('TSLA')",
    panel: "list"
  },
  {
    thought: "These values must never change",
    tool: "Tuple",
    why: "Values that are fixed, or a few values that naturally travel together as one record. An FX or tax assumption, a coordinate, a row that should stay intact. Python locks a tuple on purpose, which protects it from a stray keystroke.",
    code: "fx = ('USD', 'EUR', 0.92)\nfx[2] = 0.95            # TypeError",
    panel: "tuple"
  }
];
