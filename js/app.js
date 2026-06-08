/* =========================================================
   Behaviour for the lists / dictionaries / tuples explainer.
   Vanilla JS, no dependencies. Reads sample data from data.js.
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
  // escaped text so we never rescan markup we just inserted.
  function highlight(code) {
    const re = /(#[^\n]*)|('[^']*'|"[^"]*")|(\b\d+\.?\d*\b)|(\b(?:for|while|in|if|def|return|not|import|as|True|False|None)\b)/g;
    return esc(code).replace(re, (m, com, str, num, kw) => {
      if (com) return '<span class="tok-com">' + com + "</span>";
      if (str) return '<span class="tok-str">' + str + "</span>";
      if (num) return '<span class="tok-num">' + num + "</span>";
      if (kw) return '<span class="tok-key">' + kw + "</span>";
      return m;
    });
  }
  const setCode = (node, code) => { node.querySelector("code").innerHTML = highlight(code); };
  const note = (node, text) => { node.innerHTML = text; };
  const fmtList = (arr) => "[" + arr.map((x) => "'" + x + "'").join(", ") + "]";

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

  THOUGHTS.forEach((t) => {
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
    link.dataset.panel = t.panel;

    card.hidden = false;
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  $("#resultClose").addEventListener("click", () => {
    card.hidden = true;
    if (activeChip) { activeChip.classList.remove("is-active"); activeChip = null; }
  });

  link.addEventListener("click", () => activateTab(link.dataset.panel));

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
     3) LIST PANEL  ->  ordered, changeable, indexed
     ========================================================= */
  const listStage = $("#list-stage");
  const listEcho = $("#list-echo");
  const listNote = $("#list-note");
  const LIST_INTRO = "A list keeps its order. Every item has a position, counting from <b>[0]</b>.";
  let listData = WATCHLIST.slice();

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

  // FLIP reorder so sorting visibly slides the cells around.
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
      requestAnimationFrame(() => { c.style.transition = ""; c.style.transform = ""; });
    });
  }

  $("#panel-list .btn-row").addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    switch (act) {
      case "append":
        if (!listData.includes(APPEND_TICKER)) {
          listData.push(APPEND_TICKER);
          renderList({ enterIndex: listData.length - 1 });
          setCode(listEcho, "watchlist.append('" + APPEND_TICKER + "')\n# " + fmtList(listData));
          note(listNote, "&lsquo;" + APPEND_TICKER + "&rsquo; was added to the end, at index <b>[" +
            (listData.length - 1) + "]</b>.");
        } else {
          note(listNote, "&lsquo;" + APPEND_TICKER + "&rsquo; is already in the list. Reset to start over.");
        }
        break;
      case "sort": {
        reorderListAnimated(listData.slice().sort());
        setCode(listEcho, "watchlist.sort()\n# " + fmtList(listData));
        note(listNote, "Sorted alphabetically. Items physically move to new positions.");
        break;
      }
      case "pop": {
        if (listData.length) {
          const last = listData.length - 1;
          const cell = listStage.children[last];
          const popped = listData[last];
          if (cell) cell.classList.add("leaving");
          setTimeout(() => { listData.pop(); renderList(); }, 320);
          setCode(listEcho, "watchlist.pop()        # '" + popped + "'\n# " + fmtList(listData.slice(0, -1)));
          note(listNote, "Removed the last item, &lsquo;" + popped + "&rsquo;. The list is now shorter.");
        }
        break;
      }
      case "index":
        if (listData.length > 1) {
          renderList({ glowIndex: 1 });
          setCode(listEcho, "watchlist[1]           # '" + listData[1] + "'");
          note(listNote, "<b>watchlist[1]</b> grabs the item in position 1: &lsquo;" + listData[1] +
            "&rsquo;. You ask by <em>where</em>, not by <em>what</em>.");
        }
        break;
      case "reset":
        resetList();
        break;
    }
  });

  function resetList() {
    listData = WATCHLIST.slice();
    renderList();
    setCode(listEcho, "watchlist = " + fmtList(listData));
    note(listNote, LIST_INTRO);
  }

  /* =========================================================
     4) DICT PANEL  ->  looked up by name
     ========================================================= */
  const dictStage = $("#dict-stage");
  const dictEcho = $("#dict-echo");
  const dictNote = $("#dict-note");
  const dictKeys = $("#dict-keys");
  const DICT_INTRO = "A dictionary finds a value by its <b>key</b>, never by position.";

  function renderDict(highlightKey, missing) {
    dictStage.innerHTML = "";
    Object.keys(PRICES).forEach((k) => {
      const pair = el("div", "pair",
        '<span class="k">\'' + k + "'</span>" +
        '<span class="arrow">&rarr;</span>' +
        '<span class="v">' + PRICES[k] + "</span>");
      if (highlightKey) {
        if (k === highlightKey) pair.classList.add("glow");
        else pair.classList.add("dim");
      } else if (missing) {
        pair.classList.add("dim");
      }
      dictStage.appendChild(pair);
    });
    if (missing) {
      dictStage.appendChild(el("div", "error-banner",
        "KeyError: '" + MISSING_KEY + "' (no such key)"));
    }
  }

  // Build a clickable chip per key, plus a missing-key chip and reset.
  function buildDictKeys() {
    dictKeys.innerHTML = "";
    Object.keys(PRICES).forEach((k) => {
      const chip = el("button", "keychip", k);
      chip.dataset.lookup = k;
      dictKeys.appendChild(chip);
    });
    const miss = el("button", "keychip keychip-missing", MISSING_KEY);
    miss.dataset.lookup = MISSING_KEY;
    dictKeys.appendChild(miss);
    const reset = el("button", "btn btn-ghost", "Reset");
    reset.dataset.act = "reset";
    dictKeys.appendChild(reset);
  }

  dictKeys.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.act === "reset") { resetDict(); return; }
    const key = btn.dataset.lookup;
    if (!key) return;
    if (PRICES[key] != null) {
      renderDict(key);
      setCode(dictEcho, "prices['" + key + "']  →  " + PRICES[key]);
      note(dictNote, "Looked up by name: <b>prices['" + key + "']</b> returns " + PRICES[key] +
        ". Position never entered into it.");
    } else {
      renderDict(null, true);
      setCode(dictEcho, "prices['" + key + "']\n# KeyError: '" + key + "'");
      note(dictNote, "There&rsquo;s no &lsquo;" + key + "&rsquo; key, so Python raises a <b>KeyError</b>. " +
        "(Use <b>prices.get('" + key + "')</b> for a safe default.)");
    }
  });

  function resetDict() {
    renderDict();
    setCode(dictEcho, "prices = {'AAPL': 225, 'MSFT': 420, ...}");
    note(dictNote, DICT_INTRO);
  }

  /* =========================================================
     5) TUPLE PANEL  ->  fixed, protected, travels together
     ========================================================= */
  const tupleStage = $("#tuple-stage");
  const tupleEcho = $("#tuple-echo");
  const tupleNote = $("#tuple-note");
  const TUPLE_INTRO = "A tuple is locked. You can read the values, but you cannot change them.";

  function renderTuple() {
    tupleStage.innerHTML = "";
    FX.forEach((val, i) => {
      const shown = typeof val === "string" ? val : String(val);
      const cell = el("div", "cell", '<span class="idx">[' + i + "]</span>" + shown +
        '<span class="lock">&#128274;</span>');
      tupleStage.appendChild(cell);
    });
  }

  $("#panel-tuple .btn-row").addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    if (act === "reset") { resetTuple(); return; }
    if (act === "mutate") {
      renderTuple();
      const target = tupleStage.children[2];
      if (target) {
        target.classList.add("shake");
        setTimeout(() => target.classList.remove("shake"), 500);
      }
      tupleStage.appendChild(el("div", "error-banner",
        "TypeError: 'tuple' object does not support item assignment"));
      setCode(tupleEcho, "fx[2] = 0.95\n# TypeError: a tuple is locked on purpose");
      note(tupleNote, "Python refuses the change and raises a <b>TypeError</b>. The values are safe " +
        "from a stray keystroke.");
    }
    if (act === "unpack") {
      renderTuple();
      const names = ["base", "quote", "rate"];
      const box = el("div", "unpacked");
      FX.forEach((val, i) => {
        const shown = typeof val === "string" ? "'" + val + "'" : val;
        const pill = el("div", "var-pill", "<b>" + names[i] + "</b> = " + shown);
        pill.style.animationDelay = (i * 0.12) + "s";
        box.appendChild(pill);
      });
      tupleStage.appendChild(box);
      setCode(tupleEcho, "base, quote, rate = fx\n# three values, one clean line");
      note(tupleNote, "One tuple unpacks into three named values in a single line, because the values " +
        "travel together as one record.");
    }
  });

  function resetTuple() {
    renderTuple();
    setCode(tupleEcho, "fx = ('USD', 'EUR', 0.92)");
    note(tupleNote, TUPLE_INTRO);
  }

  /* =========================================================
     6) GLANCE TABLE (also a jump menu back to the engine)
     ========================================================= */
  const tbody = $("#glanceTable tbody");
  THOUGHTS.forEach((t, i) => {
    const tr = el("tr");
    tr.innerHTML = "<td>&ldquo;" + t.thought + "&rdquo;</td><td>" + t.tool + "</td>";
    tr.addEventListener("click", () => {
      $("#decider").scrollIntoView({ behavior: "smooth" });
      selectThought(t, grid.children[i]);
    });
    tbody.appendChild(tr);
  });

  /* ---------- initial paint ---------- */
  buildDictKeys();
  resetList();
  resetDict();
  resetTuple();
})();
