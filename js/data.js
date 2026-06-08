/* =========================================================
   Content for the "Which One Do I Reach For?" explainer.
   All wording adapted from George Mount / Stringfest's
   "Python 1: Which One Do I Reach For?" handout.
   ========================================================= */

// Decision-engine chips. `link` = anchor + tab to deep-dive (big three only).
const THOUGHTS = [
  {
    thought: "I&rsquo;ll look this up by name",
    tool: "Dictionary",
    why: "The moment your instinct is &ldquo;give me the value for AAPL&rdquo; rather than &ldquo;give me the third item,&rdquo; you want a dictionary. It&rsquo;s also exactly what an API hands back &mdash; JSON is just a dictionary.",
    code: "companies = {'AAPL': 'Apple Inc.', 'MSFT': 'Microsoft'}\ncompanies['AAPL']        # 'Apple Inc.'",
    link: { anchor: "#bigthree", panel: "dict" }
  },
  {
    thought: "It&rsquo;s an ordered list I&rsquo;ll add to or change",
    tool: "List",
    why: "An ordered sequence of similar things you walk through or grab by position &mdash; a list of tickers, a column of prices, the rows you loop over. Add, drop, and reorder freely.",
    code: "prices = ['AAPL', 'MSFT', 'NVDA']\nprices.append('AMZN')    # ['AAPL', 'MSFT', 'NVDA', 'AMZN']",
    link: { anchor: "#bigthree", panel: "list" }
  },
  {
    thought: "These values must never change",
    tool: "Tuple",
    why: "Values that are fixed, or a few values that naturally travel together as one record &mdash; an FX or tax assumption, a coordinate, a function&rsquo;s multiple outputs. Python locks a tuple on purpose, protecting it from a stray keystroke.",
    code: "fx = ('USD', 'EUR', 0.92)\nfx[2] = 0.95             # TypeError: locked on purpose",
    link: { anchor: "#bigthree", panel: "tuple" }
  },
  {
    thought: "Do this for every item, or a set number of times",
    tool: "For loop",
    why: "Reach for a for loop when you already know the collection or the count. &ldquo;For every deal in the pipeline,&rdquo; &ldquo;for every row,&rdquo; &ldquo;do this twelve times.&rdquo; This is the large majority of loops in real work.",
    code: "for ticker in portfolio:\n    print(ticker, prices[ticker])",
    link: { anchor: "#more" }
  },
  {
    thought: "Keep going until a condition flips",
    tool: "While loop",
    why: "Use a while loop when you don&rsquo;t know how many passes it&rsquo;ll take and you&rsquo;re waiting for a condition. Poll an API until the data is ready; iterate until a number settles, like Goal Seek. Every while loop needs something inside that moves it toward stopping.",
    code: "while not response.ready:\n    response = poll_api()   # keep going until it flips",
    link: { anchor: "#more" }
  },
  {
    thought: "Turn one list into another",
    tool: "List comprehension",
    why: "When the entire job of the loop is to turn one list into another &mdash; one transformation per item, maybe a simple filter. &ldquo;Square every return.&rdquo; &ldquo;Keep only names trading over 50.&rdquo; One clean, readable line.",
    code: "big = [t for t in tickers if price[t] > 50]",
    link: { anchor: "#more" }
  },
  {
    thought: "I&rsquo;m about to copy &amp; paste this logic again",
    tool: "Write a function",
    why: "Copy-pasted twice is the signal. The payoff: when it needs fixing, you fix it in one place instead of hunting down five copies that have quietly drifted apart.",
    code: "def total_return(start, end):\n    return end / start - 1",
    link: { anchor: "#more" }
  },
  {
    thought: "A tiny one-liner handed to something else",
    tool: "Lambda",
    why: "A tiny one-line function right where you define it, usually handed straight to something else &mdash; a sort key, a pandas apply. No real name required because it&rsquo;s used once and thrown away.",
    code: "deals.sort(key=lambda d: d['size'])",
    link: { anchor: "#more" }
  },
  {
    thought: "Heavy math across a lot of numbers",
    tool: "NumPy",
    why: "Graduate to NumPy for heavy math across a lot of numbers at once: matrices, simulations, statistics. It&rsquo;s built for exactly that and far faster than looping by hand.",
    code: "import numpy as np\nreturns = np.diff(prices) / prices[:-1]",
    link: { anchor: "#more" }
  },
  {
    thought: "Rows, columns, and especially dates",
    tool: "pandas",
    why: "Graduate to pandas when your data looks like a table with columns and rows, especially anything with dates. The tell: if you&rsquo;re writing a loop to do what Excel does with one formula dragged down a column, that&rsquo;s a job for pandas.",
    code: "import pandas as pd\ndf = pd.read_csv('prices.csv', parse_dates=['date'])",
    link: { anchor: "#more" }
  }
];

// Flip cards for loops / functions / scaling.
const FLIPS = [
  {
    front: "For loop or while loop?",
    question: "Do I have a collection or fixed count &mdash; or am I waiting on a condition?",
    answer: "Known collection or count &rarr; <strong>for loop</strong> (the large majority of real work). Waiting for a condition to flip &rarr; <strong>while loop</strong> &mdash; and make sure something inside moves it toward stopping.",
    micro: "for row in rows: ...\nwhile not done: ..."
  },
  {
    front: "Comprehension or regular for loop?",
    question: "Am I just transforming one list into another?",
    answer: "One transformation per item (maybe a filter) &rarr; <strong>comprehension</strong>. More than one thing per pass, not building a list, or logic too complex for one line &rarr; <strong>regular for loop</strong>.",
    micro: "sq = [r**2 for r in returns]"
  },
  {
    front: "Function: when and how?",
    question: "Am I about to copy-paste this a second time?",
    answer: "First time, write it inline. The <strong>second</strong> time you need it, make it a <strong>function</strong>. Also when a calc produces more than one output &mdash; a function can hand both back at once.",
    micro: "def dcf(cf, r):\n    return cf / (1 + r)"
  },
  {
    front: "Lambda or def?",
    question: "One expression, used inline, thrown away after?",
    answer: "Yes &rarr; <strong>lambda</strong>. Anything more &mdash; reused, multi-step, or needs a name to be readable later &rarr; <strong>def</strong>. When in doubt, use def; future you reads a named function far more easily.",
    micro: "key=lambda x: x[1]   # vs   def ..."
  },
  {
    front: "Plain Python, NumPy, or pandas?",
    question: "How big and what shape is the data?",
    answer: "Small and bespoke &rarr; <strong>plain Python</strong>. Heavy math on many numbers &rarr; <strong>NumPy</strong>. Rows, columns, and dates &rarr; <strong>pandas</strong>.",
    micro: "[ ] / { }  →  np.array  →  pd.DataFrame"
  },
  {
    front: "Should I even write a function?",
    question: "Is this a true one-off I&rsquo;ll never touch again?",
    answer: "If it&rsquo;s genuinely one-off and the inline version is already clear, <strong>skip it</strong>. Don&rsquo;t wrap everything in functions just for the sake of it.",
    micro: "# one-off, clear → leave inline"
  }
];
