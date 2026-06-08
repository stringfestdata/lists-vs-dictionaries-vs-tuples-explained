/* =========================================================
   Behaviour for the "Which One Do I Reach For?" explainer.
   Vanilla JS, no dependencies. Sections wired up below.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Lightweight Python-ish highlighter. Single left-to-right pass over the
  // escaped text so we never rescan markup we just inserted (which would let
  // a later pass match the class="..." of an earlier span).
  function highlight(code) {
    const re = /(#[^\n]*)|('[^']*'|"[^"]*")|(\b\d+\.?\d*\b)|(\b(?:for|while|in|if|def|lambda|return|not|import|as|True|False|None)\b)/g;
    return esc(code).replace(re, (m, com, str, num, kw) => {
      if (com) return '<span class="tok-com">' + com + "</span>";
      if (str) return '<span class="tok-str">' + str + "</span>";
      if (num) return '<span class="tok-num">' + num + "</span>";
      if (kw) return '<span class="tok-key">' + kw + "</span>";
      return m;
    });
  }
  const setCode = (node, code) => { node.querySelector("code").innerHTML = highlight(code); };

  /* =========================================================
     1) DECISION ENGINE
     ========================================================= */
  const grid = $("#thoughtGrid");
  const card = $("#resultCard");
  const badge = $("#resultBadge");
  const why = $("#resultWhy");
  const codeBox = $("#resultCode");
  const link = $("#resultLink");
  let activeChip = null;

  THOUGHTS.forEach((t, i) => {
    const chip = el("button", "chip", '<span class="quote">&ldquo;' + t.thought + '&rdquo;</span>');
    chip.setAttribute("role", "listitem");
    chip.addEventListener("click", () => selectThought(t, chip));
    grid.appendChild(chip);
  });

  function selectThought(t, chip) {
    if (activeChip) activeChip.classList.remove("is-active");
    activeChip = chip;
    chip.classList.add("is-active");

    badge.innerHTML = t.tool;
    why.innerHTML = t.why;
    setCode(codeBox, t.code);

    if (t.link) {
      link.hidden = false;
      link.classList.remove("hidden");
      link.setAttribute("href", t.link.anchor);
      link.dataset.panel = t.link.panel || "";
      link.textContent = t.link.panel ? "See it in action ↓" : "Explore the cards ↓";
    } else {
      link.classList.add("hidden");
    }

    card.hidden = false;
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  $("#resultClose").addEventListener("click", () => {
    card.hidden = true;
    if (activeChip) { activeChip.classList.remove("is-active"); activeChip = null; }
  });

  link.addEventListener("click", () => {
    if (link.dataset.panel) activateTab(link.dataset.panel);
  });

  /* =========================================================
     2) TABS
     ========================================================= */
  function activateTab(name) {
    $$(".tab").forEach((tab) => {
      const on = tab.dataset.panel === name;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".panel").forEach((p) => {
      const on = p.id === "panel-" + name;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  }
  $$(".tab").forEach((tab) => tab.addEventListener("click", () => activateTab(tab.dataset.panel)));

  /* =========================================================
     3) LIST PANEL — ordered, changeable, indexed
     ========================================================= */
  const listStage = $("#list-stage");
  const listEcho = $("#list-echo");
  const LIST_START = ["AAPL", "MSFT", "NVDA"];
  let listData = LIST_START.slice();

  function renderList(opts) {
    opts = opts || {};
    listStage.innerHTML = "";
    listData.forEach((val, i) => {
      const cell = el("div", "cell", '<span class="idx">[' + i + "]</span>" + val);
      if (opts.enterIndex === i) cell.classList.add("enter");
      if (opts.glowIndex === i) cell.classList.add("glow");
      listStage.appendChild(cell);
    });
    if (opts.enterIndex != null) {
      requestAnimationFrame(() => {
        const c = listStage.children[opts.enterIndex];
        if (c) c.classList.remove("enter");
      });
    }
  }

  // FLIP reorder so sorting visibly slides cells around.
  function reorderListAnimated(newData) {
    const before = new Map();
    $$(".cell", listStage).forEach((c, i) => before.set(listData[i], c.getBoundingClientRect()));
    listData = newData;
    renderList();
    $$(".cell", listStage).forEach((c, i) => {
      const first = before.get(listData[i]);
      if (!first) return;
      const last = c.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (!dx && !dy) return;
      c.style.transform = "translate(" + dx + "px," + dy + "px)";
      c.style.transition = "none";
      requestAnimationFrame(() => {
        c.style.transition = "";
        c.style.transform = "";
      });
    });
  }

  $("#panel-list .btn-row").addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    switch (act) {
      case "append":
        if (!listData.includes("AMZN")) {
          listData.push("AMZN");
          renderList({ enterIndex: listData.length - 1 });
          setCode(listEcho, "prices.append('AMZN')\n# " + fmt(listData));
        }
        break;
      case "sort": {
        const sorted = listData.slice().sort();
        reorderListAnimated(sorted);
        setCode(listEcho, "prices.sort()\n# " + fmt(listData));
        break;
      }
      case "pop": {
        if (listData.length) {
          const last = listData.length - 1;
          const cell = listStage.children[last];
          const popped = listData[last];
          if (cell) cell.classList.add("leaving");
          setTimeout(() => { listData.pop(); renderList(); }, 320);
          setCode(listEcho, "prices.pop()           # '" + popped + "'\n# " + fmt(listData.slice(0, -1)));
        }
        break;
      }
      case "index":
        if (listData.length > 1) {
          renderList({ glowIndex: 1 });
          setCode(listEcho, "prices[1]              # '" + listData[1] + "'");
        }
        break;
      case "reset":
        listData = LIST_START.slice();
        renderList();
        setCode(listEcho, "prices = " + fmt(listData));
        break;
    }
  });
  const fmt = (arr) => "[" + arr.map((x) => "'" + x + "'").join(", ") + "]";

  /* =========================================================
     4) DICT PANEL — looked up by name
     ========================================================= */
  const dictStage = $("#dict-stage");
  const dictEcho = $("#dict-echo");
  const DICT = { AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", NVDA: "NVIDIA Corp." };

  function renderDict(highlightKey) {
    dictStage.innerHTML = "";
    Object.keys(DICT).forEach((k) => {
      const pair = el("div", "pair",
        '<span class="k">\'' + k + "'</span>" +
        '<span class="arrow">&rarr;</span>' +
        '<span class="v">\'' + DICT[k] + "'</span>");
      if (highlightKey) {
        if (k === highlightKey) pair.classList.add("glow");
        else pair.classList.add("dim");
      }
      dictStage.appendChild(pair);
    });
  }

  $("#panel-dict .btn-row").addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    if (act === "reset") { renderDict(); setCode(dictEcho, "companies = {...}"); return; }
    if (act === "lookup") {
      const key = $("#dict-key").value;
      if (DICT[key]) {
        renderDict(key);
        setCode(dictEcho, "companies['" + key + "']  →  '" + DICT[key] + "'");
      } else {
        renderDict();
        const banner = el("div", "error-banner",
          "KeyError: '" + key + "'  &mdash; no such key. (Use .get() for a safe default.)");
        dictStage.appendChild(banner);
        setCode(dictEcho, "companies['" + key + "']\n# KeyError: '" + key + "'");
      }
    }
  });

  /* =========================================================
     5) TUPLE PANEL — fixed, protected, travels together
     ========================================================= */
  const tupleStage = $("#tuple-stage");
  const tupleEcho = $("#tuple-echo");
  const TUPLE = ["USD", "EUR", "0.92"];

  function renderTuple() {
    tupleStage.innerHTML = "";
    TUPLE.forEach((val, i) => {
      const cell = el("div", "cell", '<span class="idx">[' + i + "]</span>" + val +
        '<span class="lock">&#128274;</span>');
      tupleStage.appendChild(cell);
    });
  }

  $("#panel-tuple .btn-row").addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    if (act === "reset") { renderTuple(); setCode(tupleEcho, "fx = ('USD', 'EUR', 0.92)"); return; }
    if (act === "mutate") {
      renderTuple();
      const target = tupleStage.children[2];
      if (target) {
        target.classList.add("shake");
        setTimeout(() => target.classList.remove("shake"), 500);
      }
      const banner = el("div", "error-banner",
        "TypeError: 'tuple' object does not support item assignment");
      tupleStage.appendChild(banner);
      setCode(tupleEcho, "fx[2] = 0.95\n# TypeError: tuples are locked on purpose");
    }
    if (act === "unpack") {
      renderTuple();
      const names = ["base", "quote", "rate"];
      const box = el("div", "unpacked");
      TUPLE.forEach((val, i) => {
        const pill = el("div", "var-pill", "<b>" + names[i] + "</b> = " +
          (i === 2 ? val : "'" + val + "'"));
        pill.style.animationDelay = (i * 0.12) + "s";
        box.appendChild(pill);
      });
      tupleStage.appendChild(box);
      setCode(tupleEcho, "base, quote, rate = fx\n# three values, one clean line");
    }
  });

  /* =========================================================
     6) FLIP CARDS
     ========================================================= */
  const flipGrid = $("#flipGrid");
  FLIPS.forEach((f) => {
    const flip = el("div", "flip");
    flip.innerHTML =
      '<div class="flip-inner">' +
      '<div class="flip-face flip-front">' +
      "<h3>" + f.front + "</h3>" +
      '<p class="question">' + f.question + "</p>" +
      '<p class="hint">Tap to flip &#8635;</p>' +
      "</div>" +
      '<div class="flip-face flip-back">' +
      "<h4>" + f.front + "</h4>" +
      '<p class="ans">' + f.answer + "</p>" +
      '<div class="micro">' + esc(f.micro) + "</div>" +
      "</div></div>";
    flip.addEventListener("click", () => flip.classList.toggle("flipped"));
    flipGrid.appendChild(flip);
  });

  /* =========================================================
     7) GLANCE TABLE (also acts as a jump menu)
     ========================================================= */
  const tbody = $("#glanceTable tbody");
  THOUGHTS.forEach((t) => {
    const tr = el("tr");
    tr.innerHTML = "<td>&ldquo;" + t.thought + "&rdquo;</td><td>" + t.tool + "</td>";
    tr.addEventListener("click", () => {
      document.querySelector("#decider").scrollIntoView({ behavior: "smooth" });
      const chip = grid.children[THOUGHTS.indexOf(t)];
      if (chip) selectThought(t, chip);
    });
    tbody.appendChild(tr);
  });

  /* ---------- initial paint ---------- */
  renderList();
  renderDict();
  renderTuple();
})();
