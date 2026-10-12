/* Vellum for Shopify: the design filter and the live preview + order form. No libraries, nothing leaves the page but the preview link. */
(function () {
  "use strict";
  if (window.__vellum) return; window.__vellum = true;

  function ready(fn) { document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn(); }

  ready(function () {
    // ── designs filter ──
    document.querySelectorAll("[data-v-chips]").forEach(function (chips) {
      var grid = chips.parentElement.querySelector("[data-v-grid]");
      chips.addEventListener("click", function (e) {
        var b = e.target.closest("[data-mood]"); if (!b) return;
        var mood = b.getAttribute("data-mood");
        chips.querySelectorAll("[data-mood]").forEach(function (c) { c.setAttribute("aria-pressed", String(c === b)); });
        grid.querySelectorAll(".v-card").forEach(function (card) { card.hidden = mood !== "all" && card.getAttribute("data-mood") !== mood; });
      });
    });

    // ── demo window: the live design, full size, with its opening ──
    var dlg = document.querySelector("[data-v-dialog]");
    if (dlg && typeof dlg.showModal === "function") {
      var dframe = dlg.querySelector("[data-v-dframe]");
      document.addEventListener("click", function (e) {
        var t = e.target.closest("[data-v-demo]"); if (!t) return;
        dlg.querySelector("[data-v-dname]").textContent = t.getAttribute("data-name") || "";
        dframe.src = t.getAttribute("data-v-demo");
        dlg.showModal(); document.documentElement.style.overflow = "hidden";
      });
      function shut() { dlg.close(); }
      dlg.querySelector("[data-v-dclose]").addEventListener("click", shut);
      dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("v-demo__in")) shut(); });
      dlg.addEventListener("close", function () { dframe.src = "about:blank"; document.documentElement.style.overflow = ""; });
    } else {
      document.addEventListener("click", function (e) { var t = e.target.closest("[data-v-demo]"); if (t) window.open(t.getAttribute("data-v-demo"), "_blank", "noopener"); });
    }

    // ── product page ──
    var root = document.querySelector("[data-v-product]"); if (!root) return;
    var form = root.querySelector("form"); var frame = root.querySelector("[data-v-frame]");
    var handle = root.getAttribute("data-handle"); var base = root.getAttribute("data-base");
    var key = "vellum-draft-" + handle; var timer = 0;
    var secBoxes = Array.prototype.slice.call(root.querySelectorAll("[data-v-sec]"));
    var secField = root.querySelector("[data-v-sections]");
    var steps = Array.prototype.slice.call(root.querySelectorAll("[data-v-step]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-v-dot]"));
    var nextBtn = root.querySelector("[data-v-next]"), backBtn = root.querySelector("[data-v-back]"), payBtn = root.querySelector("[data-v-pay]");
    var stepLabel = root.querySelector("[data-v-steplabel]");
    var NEXT = { 1: "Next: the day", 2: "Next: sections", 3: "Next: review" };
    var current = 1;

    function store(fn) { try { return fn(window.localStorage); } catch (e) { return null; } }
    function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }

    function syncTexts() {
      var on = [];
      secBoxes.forEach(function (b) {
        if (b.checked) on.push(b.getAttribute("data-label"));
        var t = root.querySelector('.v-texts [data-for="' + b.value + '"]');
        if (t) { t.hidden = !b.checked; t.querySelector("textarea").disabled = !b.checked; }
      });
      secField.value = on.join(", ");
      var colour = root.querySelector("[data-v-colour]"); var note = root.querySelector("[data-v-colour-note]");
      if (colour && note) { note.hidden = colour.value !== "Other"; note.querySelector("input").disabled = note.hidden; }
      var ar = root.querySelector("[data-v-arnames]");
      if (ar) { ar.hidden = val("v-lang") === "English"; ar.querySelectorAll("input").forEach(function (i) { i.disabled = ar.hidden; }); }
    }

    function previewUrl(quiet) {
      var q = new URLSearchParams();
      root.querySelectorAll("[data-v-q]").forEach(function (el) {
        var k = el.getAttribute("data-v-q"); var v = el.value.trim();
        if (k === "lang") { if (v === "Arabic") q.set("lang", "ar"); return; }
        if (v) q.set(k, v);
      });
      var hide = secBoxes.filter(function (b) { return !b.checked; }).map(function (b) { return b.value; });
      if (hide.length) q.set("hide", hide.join(","));
      if (quiet) q.set("quiet", "1");
      return base + "/embed/" + encodeURIComponent(handle) + "?" + q.toString();
    }
    function refresh(quiet) { frame.src = previewUrl(quiet); }
    function later() { clearTimeout(timer); timer = setTimeout(function () { refresh(true); }, 700); }

    function save() {
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === "hidden") return;
        data[el.name] = el.value;
      });
      data.__sec = secBoxes.filter(function (b) { return !b.checked; }).map(function (b) { return b.value; });
      store(function (s) { s.setItem(key, JSON.stringify(data)); });
    }
    function restore() {
      var raw = store(function (s) { return s.getItem(key); }); if (!raw) return false;
      var data; try { data = JSON.parse(raw); } catch (e) { return false; }
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name && el.type !== "hidden" && typeof data[el.name] === "string") el.value = data[el.name];
      });
      (data.__sec || []).forEach(function (v) { var b = root.querySelector('[data-v-sec][value="' + v + '"]'); if (b) b.checked = false; });
      return true;
    }

    // ── clear messages, one per field ──
    function setErr(el, msg) {
      var em = el.parentElement.querySelector(".v-err"); if (!em) return;
      em.textContent = msg || ""; em.hidden = !msg;
      el.setAttribute("aria-invalid", msg ? "true" : "false");
    }
    function check(el) {
      var v = el.value.trim(), label = el.getAttribute("data-v-label") || "this";
      if (el.required && !v) return "Please write the " + label + ".";
      if (el.type === "date" && v) {
        var d = new Date(v + "T00:00:00"), today = new Date(); today.setHours(0, 0, 0, 0);
        if (isNaN(d) || d < today) return "Please choose a date that hasn't passed.";
      }
      if (el.type === "url" && v && !/^https?:\/\/\S+\.\S+/.test(v)) return "Please paste the full link, starting with https://";
      return "";
    }
    function validStep(n) {
      var first = null;
      steps[n - 1].querySelectorAll("[data-v-label]").forEach(function (el) {
        if (el.disabled) return;
        var msg = check(el); setErr(el, msg);
        if (msg && !first) first = el;
      });
      if (first) { first.focus(); return false; }
      return true;
    }

    // ── review: what they wrote, before paying ──
    function summary() {
      var dl = root.querySelector("[data-v-summary]"); if (!dl) return;
      var date = val("v-date"), nice = date;
      try { nice = new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); } catch (e) {}
      var rows = [
        ["Design", root.querySelector("h1").textContent],
        ["Names", val("v-n1") + " & " + val("v-n2")],
        ["Date", nice + (val("v-time") ? " · " + val("v-time") : "")],
        ["Venue", val("v-venue")],
        ["Language", val("v-lang")],
        ["Colour", val("v-colour") === "Other" ? (val("v-colour-note") || "Something else") : "As shown"],
        ["Sections", secField.value || "None"]
      ];
      while (dl.firstChild) dl.removeChild(dl.firstChild);
      rows.forEach(function (r) {
        var dt = document.createElement("dt"), dd = document.createElement("dd");
        dt.textContent = r[0]; dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd);
      });
    }

    // ── steps ──
    function show(n, focus) {
      current = n;
      steps.forEach(function (s, i) { s.hidden = i + 1 !== n; });
      dots.forEach(function (d, i) {
        d.classList.toggle("is-done", i + 1 < n);
        if (i + 1 === n) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current");
      });
      backBtn.hidden = n === 1;
      nextBtn.hidden = n === 4; payBtn.hidden = n !== 4;
      if (NEXT[n]) nextBtn.textContent = NEXT[n];
      stepLabel.textContent = "Step " + n + " of 4";
      if (n === 4) { syncTexts(); summary(); }
      if (focus) {
        var top = form.getBoundingClientRect().top + window.scrollY - 100;
        if (form.getBoundingClientRect().top < 0) window.scrollTo({ top: top, behavior: "smooth" });
        var legend = steps[n - 1].querySelector("legend"); if (legend) { legend.setAttribute("tabindex", "-1"); legend.focus({ preventScroll: true }); }
      }
    }
    form.classList.add("is-stepped");
    nextBtn.addEventListener("click", function () { if (validStep(current)) show(current + 1, true); });
    backBtn.addEventListener("click", function () { show(current - 1, true); });
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () {
        var target = i + 1; if (target >= current) return;
        show(target, true);
      });
    });

    var had = restore(); syncTexts();
    if (had) refresh(false);
    show(1, false);

    form.addEventListener("input", function (e) {
      save();
      if (e.target.getAttribute("aria-invalid") === "true") setErr(e.target, check(e.target));
      if (e.target.hasAttribute("data-v-q")) later();
    });
    form.addEventListener("change", function (e) {
      syncTexts(); save();
      if (e.target.hasAttribute("data-v-sec") || e.target.hasAttribute("data-v-q")) later();
    });
    root.querySelector("[data-v-replay]").addEventListener("click", function () { clearTimeout(timer); refresh(false); });
    form.addEventListener("submit", function (e) {
      syncTexts();
      for (var n = 1; n <= 3; n++) { if (!validStep(n)) { e.preventDefault(); show(n, false); validStep(n); return; } }
    });
  });
})();
