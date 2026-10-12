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
    var key = "vellum-draft-" + handle; var arabic = false; var timer = 0;
    var secBoxes = Array.prototype.slice.call(root.querySelectorAll("[data-v-sec]"));
    var secField = root.querySelector("[data-v-sections]");

    function store(fn) { try { return fn(window.localStorage); } catch (e) { return null; } }

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
    }

    function previewUrl(quiet) {
      var q = new URLSearchParams();
      root.querySelectorAll("[data-v-q]").forEach(function (el) {
        var k = el.getAttribute("data-v-q"); var v = el.value.trim();
        if (k === "lang") { if (v === "Arabic" || arabic) q.set("lang", "ar"); return; }
        if (v) q.set(k, v);
      });
      if (arabic) q.set("lang", "ar");
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

    var had = restore(); syncTexts();
    if (had) refresh(false);

    form.addEventListener("input", function (e) {
      save();
      if (e.target.hasAttribute("data-v-q")) later();
    });
    form.addEventListener("change", function (e) {
      syncTexts(); save();
      if (e.target.hasAttribute("data-v-sec") || e.target.hasAttribute("data-v-q")) later();
    });
    root.querySelector("[data-v-replay]").addEventListener("click", function () { clearTimeout(timer); refresh(false); });
    root.querySelector("[data-v-lang]").addEventListener("click", function () { arabic = !arabic; clearTimeout(timer); refresh(true); });
    form.addEventListener("submit", function () { syncTexts(); });
  });
})();
