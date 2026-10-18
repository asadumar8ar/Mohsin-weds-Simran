// builder.js — wires up the editor UI, state, live preview, download, reset.
// Never an endless loader: always hides the loader in a finally block.
(function () {
  "use strict";

  // ---------- DOM references ----------
  var loader = document.getElementById("loader");
  var errorBox = document.getElementById("errorBox");
  var editor = document.getElementById("editor");
  var previewFrame = document.getElementById("previewFrame");
  var downloadBtn = document.getElementById("downloadBtn");
  var resetBtn = document.getElementById("resetBtn");
  var mobileEditBtn = document.getElementById("mobileEditBtn");
  var editorBackdrop = document.getElementById("editorBackdrop");
  var draftDot = document.getElementById("draftDot");
  var draftStatus = document.getElementById("draftStatus");

  // ---------- Error reporting ----------
  function showError(title, detail) {
    if (!errorBox) return;
    var html = "<strong>" + escapeForBox(title) + "</strong>";
    if (detail) html += "<span>" + escapeForBox(detail) + "</span>";
    errorBox.innerHTML = html;
    errorBox.classList.add("visible");
  }
  function escapeForBox(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  window.onerror = function (message, file, line, col, err) {
    var detail = (message || "Unknown error");
    if (file) detail += "\nFile: " + file + (line ? ":" + line : "");
    if (err && err.stack) detail += "\n" + String(err.stack).split("\n").slice(0, 3).join("\n");
    showError("Something went wrong", detail);
    return false;
  };
  window.addEventListener("unhandledrejection", function (e) {
    var reason = e && e.reason ? (e.reason.message || String(e.reason)) : "Unhandled rejection";
    showError("Something went wrong", reason);
  });

  // ---------- Loader guarantee ----------
  var loaderHidden = false;
  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    if (loader) {
      loader.classList.add("hidden");
      setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 700);
    }
  }

  // ---------- Dependency check ----------
  function checkDependencies() {
    var missing = [];
    if (!window.CARD_LOADED_STYLE) missing.push("card-style.js");
    if (!window.CARD_LOADED_RUNTIME) missing.push("card-runtime.js");
    if (!window.CARD_LOADED_SCENES) missing.push("card-scenes.js");
    if (!window.CARD_LOADED_DATA) missing.push("card.js");
    if (typeof window.buildCardHTML !== "function") {
      if (missing.indexOf("card.js") === -1) missing.push("card.js (buildCardHTML missing)");
    }
    return missing;
  }

  // ---------- State ----------
  var DRAFT_KEY = "nikahCardDraft";
  var TEXT_DRAFT_KEY = "nikahCardDraftText";

  function deepClone(o) {
    // JSON clone is fine for our data shapes (strings, numbers, booleans, arrays, objects).
    return JSON.parse(JSON.stringify(o));
  }

  function getByPath(obj, path) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function setByPath(obj, path, value) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var key = parts[i];
      if (cur[key] == null || typeof cur[key] !== "object") cur[key] = {};
      cur = cur[key];
    }
    cur[parts[parts.length - 1]] = value;
  }

  var state = deepClone(window.DEFAULT_CARD);

  function loadDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // Merge draft values into a fresh default clone.
        mergeDeep(state, parsed);
      }
    } catch (e) {}
    try {
      var rawText = localStorage.getItem(TEXT_DRAFT_KEY);
      if (rawText) {
        var parsedText = JSON.parse(rawText);
        mergeTextOnly(state, parsedText);
      }
    } catch (e) {}
  }

  function mergeDeep(target, source) {
    if (!source || typeof source !== "object") return;
    // Only merge media-safe content — we never store media in localStorage anyway.
    for (var k in source) {
      if (!Object.prototype.hasOwnProperty.call(source, k)) continue;
      var v = source[k];
      if (v == null) continue;
      if (typeof v === "object" && !Array.isArray(v)) {
        if (typeof target[k] !== "object" || target[k] === null) target[k] = {};
        mergeDeep(target[k], v);
      } else {
        target[k] = v;
      }
    }
  }

  function mergeTextOnly(target, source) {
    // Same as mergeDeep but skip data: URLs (media should not be persisted).
    if (!source || typeof source !== "object") return;
    for (var k in source) {
      if (!Object.prototype.hasOwnProperty.call(source, k)) continue;
      var v = source[k];
      if (v == null) continue;
      if (typeof v === "string" && v.indexOf("data:") === 0) continue;
      if (typeof v === "object" && !Array.isArray(v)) {
        if (typeof target[k] !== "object" || target[k] === null) target[k] = {};
        mergeTextOnly(target[k], v);
      } else if (Array.isArray(v)) {
        // For arrays, prefer loaded draft text but drop media entries.
        var clean = [];
        for (var i = 0; i < v.length; i++) {
          var item = v[i];
          if (typeof item === "string" && item.indexOf("data:") === 0) continue;
          clean.push(item);
        }
        target[k] = clean;
      } else {
        target[k] = v;
      }
    }
  }

  function saveDraft() {
    try {
      // Save text-only draft (media lives in memory only).
      var textOnly = stripMedia(deepClone(state));
      localStorage.setItem(TEXT_DRAFT_KEY, JSON.stringify(textOnly));
      // Also save a media-free version for the main key (backward compat).
      localStorage.setItem(DRAFT_KEY, JSON.stringify(textOnly));
      setDraftStatus("Draft saved automatically", true);
    } catch (e) {
      setDraftStatus("Draft could not be saved (storage full?)", false);
    }
  }

  function stripMedia(obj) {
    if (obj == null) return obj;
    if (typeof obj === "string") {
      if (obj.indexOf("data:") === 0) return "";
      return obj;
    }
    if (Array.isArray(obj)) {
      var out = [];
      for (var i = 0; i < obj.length; i++) {
        var v = stripMedia(obj[i]);
        if (v === "") continue;
        out.push(v);
      }
      return out;
    }
    if (typeof obj === "object") {
      var copy = {};
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        copy[k] = stripMedia(obj[k]);
      }
      return copy;
    }
    return obj;
  }

  function setDraftStatus(msg, ok) {
    if (draftStatus) draftStatus.textContent = msg;
    if (draftDot) {
      draftDot.className = "dot" + (ok ? "" : " off");
    }
  }

  // ---------- Bind text fields ----------
  function bindField(el) {
    var path = el.getAttribute("data-bind");
    if (!path) return;

    // Set initial value.
    var current = getByPath(state, path);
    if (el.type === "checkbox") {
      el.checked = !!current;
    } else {
      el.value = current == null ? "" : String(current);
    }

    var eventName = (el.type === "checkbox" || el.tagName === "SELECT") ? "change" : "input";
    el.addEventListener(eventName, function () {
      var val;
      if (el.type === "checkbox") val = el.checked;
      else val = el.value;
      setByPath(state, path, val);
      schedulePreview();
      debounceSave();
      if (path === "theme") applyThemeToSwatches();
    });
  }

  function bindAllFields() {
    var els = editor.querySelectorAll("[data-bind]");
    for (var i = 0; i < els.length; i++) bindField(els[i]);
  }

  // ---------- Save debounce ----------
  var saveTimer = 0;
  function debounceSave() {
    if (saveTimer) clearTimeout(saveTimer);
    setDraftStatus("Saving...", true);
    saveTimer = setTimeout(function () {
      saveTimer = 0;
      saveDraft();
    }, 700);
  }

  // ---------- Live preview (debounced 300ms) ----------
  var previewTimer = 0;
  var lastPreviewHTML = "";
  var previewError = false;

  function buildCurrent() {
    try {
      return window.buildCardHTML(state);
    } catch (e) {
      showError("Preview failed", e.message || String(e));
      return "";
    }
  }

  function schedulePreview() {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      previewTimer = 0;
      renderPreview();
    }, 300);
  }

  function renderPreview() {
    if (!previewFrame) return;
    var html = buildCurrent();
    if (!html) {
      previewError = true;
      return;
    }
    previewError = false;
    if (html === lastPreviewHTML) return;
    lastPreviewHTML = html;
    try {
      previewFrame.srcdoc = html;
    } catch (e) {
      showError("Preview could not be rendered", e.message || String(e));
    }
  }

  // ---------- Tabs ----------
  function setupTabs() {
    var tabBtns = editor.querySelectorAll(".tab-btn");
    var panels = editor.querySelectorAll(".tab-panel");
    function activate(tabName) {
      for (var i = 0; i < tabBtns.length; i++) {
        var b = tabBtns[i];
        if (b.getAttribute("data-tab") === tabName) {
          b.classList.add("active");
          b.setAttribute("aria-selected", "true");
        } else {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        }
      }
      for (var j = 0; j < panels.length; j++) {
        var p = panels[j];
        if (p.id === "tab-" + tabName) {
          p.classList.add("active");
        } else {
          p.classList.remove("active");
        }
      }
    }
    for (var i = 0; i < tabBtns.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          activate(btn.getAttribute("data-tab"));
        });
      })(tabBtns[i]);
    }
  }

  // ---------- Events UI ----------
  var expandedEvents = {};

  function renderEvents() {
    var list = document.getElementById("evList");
    if (!list) return;
    list.innerHTML = "";
    if (!state.events) state.events = [];
    for (var i = 0; i < state.events.length; i++) {
      (function (idx) {
        var ev = state.events[idx];
        if (!ev) return;
        var item = document.createElement("div");
        item.className = "ev-item" + (ev.isMain ? " is-main" : "") + (expandedEvents[idx] ? " open" : "");
        item.setAttribute("data-idx", String(idx));

        var head = document.createElement("div");
        head.className = "ev-head";
        head.setAttribute("role", "button");
        head.setAttribute("tabindex", "0");
        head.setAttribute("aria-expanded", expandedEvents[idx] ? "true" : "false");
        head.innerHTML =
          '<span class="ev-caret" aria-hidden="true">&#9656;</span>' +
          '<span class="ev-title" dir="auto">' + escapeHtml(ev.name || "Untitled event") + '</span>' +
          (ev.isMain ? '<span class="ev-badge">Main</span>' : '');
        head.addEventListener("click", function () {
          expandedEvents[idx] = !expandedEvents[idx];
          renderEvents();
        });
        head.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            expandedEvents[idx] = !expandedEvents[idx];
            renderEvents();
          }
        });
        item.appendChild(head);

        var body = document.createElement("div");
        body.className = "ev-body";

        body.appendChild(makeField("Name", "text", ev.name, function (v) { ev.name = v; saveDraft(); schedulePreview(); }, "Event name"));
        body.appendChild(makeField("Date", "date", ev.date, function (v) { ev.date = v; saveDraft(); schedulePreview(); }));
        body.appendChild(makeField("Time", "time", ev.time, function (v) { ev.time = v; saveDraft(); schedulePreview(); }));
        body.appendChild(makeField("Venue", "text", ev.venue, function (v) { ev.venue = v; saveDraft(); schedulePreview(); }, "Venue name"));
        body.appendChild(makeField("Address", "text", ev.address, function (v) { ev.address = v; saveDraft(); schedulePreview(); }, "Full address"));
        body.appendChild(makeField("Map link", "text", ev.mapLink, function (v) { ev.mapLink = v; saveDraft(); schedulePreview(); }, "https://... (optional)"));
        body.appendChild(makeField("Dress code", "text", ev.dress, function (v) { ev.dress = v; saveDraft(); schedulePreview(); }, "Optional"));
        body.appendChild(makeField("Note", "text", ev.note, function (v) { ev.note = v; saveDraft(); schedulePreview(); }, "Optional"));

        var actions = document.createElement("div");
        actions.className = "ev-actions";

        var upBtn = document.createElement("button");
        upBtn.type = "button";
        upBtn.className = "btn-sm";
        upBtn.textContent = "Move up";
        upBtn.disabled = idx === 0;
        upBtn.addEventListener("click", function () {
          if (idx === 0) return;
          var tmp = state.events[idx - 1];
          state.events[idx - 1] = state.events[idx];
          state.events[idx] = tmp;
          var tmpExp = expandedEvents[idx - 1];
          expandedEvents[idx - 1] = expandedEvents[idx];
          expandedEvents[idx] = tmpExp;
          renderEvents();
          saveDraft();
          schedulePreview();
        });
        actions.appendChild(upBtn);

        var downBtn = document.createElement("button");
        downBtn.type = "button";
        downBtn.className = "btn-sm";
        downBtn.textContent = "Move down";
        downBtn.disabled = idx === state.events.length - 1;
        downBtn.addEventListener("click", function () {
          if (idx >= state.events.length - 1) return;
          var tmp = state.events[idx + 1];
          state.events[idx + 1] = state.events[idx];
          state.events[idx] = tmp;
          var tmpExp = expandedEvents[idx + 1];
          expandedEvents[idx + 1] = expandedEvents[idx];
          expandedEvents[idx] = tmpExp;
          renderEvents();
          saveDraft();
          schedulePreview();
        });
        actions.appendChild(downBtn);

        var mainBtn = document.createElement("button");
        mainBtn.type = "button";
        mainBtn.className = "btn-sm accent";
        mainBtn.textContent = ev.isMain ? "Is main" : "Set as main";
        mainBtn.disabled = ev.isMain;
        mainBtn.addEventListener("click", function () {
          for (var k = 0; k < state.events.length; k++) state.events[k].isMain = (k === idx);
          renderEvents();
          saveDraft();
          schedulePreview();
        });
        actions.appendChild(mainBtn);

        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn-sm danger";
        delBtn.textContent = "Delete";
        delBtn.disabled = state.events.length <= 1;
        delBtn.addEventListener("click", function () {
          if (state.events.length <= 1) return;
          var wasMain = ev.isMain;
          state.events.splice(idx, 1);
          delete expandedEvents[idx];
          // Re-index expandedEvents.
          var newExp = {};
          var keys = Object.keys(expandedEvents);
          for (var k = 0; k < keys.length; k++) {
            var n = parseInt(keys[k], 10);
            if (isNaN(n)) continue;
            if (n > idx) newExp[n - 1] = expandedEvents[n];
            else if (n < idx) newExp[n] = expandedEvents[n];
          }
          expandedEvents = newExp;
          // Ensure exactly one main.
          var hasMain = false;
          for (var m = 0; m < state.events.length; m++) if (state.events[m].isMain) hasMain = true;
          if (!hasMain || wasMain) state.events[0].isMain = true;
          renderEvents();
          saveDraft();
          schedulePreview();
        });
        actions.appendChild(delBtn);

        body.appendChild(actions);
        item.appendChild(body);
        list.appendChild(item);
      })(i);
    }
  }

  function makeField(labelText, type, value, onChange, placeholder) {
    var wrap = document.createElement("div");
    wrap.className = "field";
    var label = document.createElement("label");
    label.className = "field-label";
    label.textContent = labelText;
    var input = document.createElement("input");
    input.type = type;
    input.value = value == null ? "" : String(value);
    if (placeholder) input.placeholder = placeholder;
    var id = "ev-" + labelText.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).slice(2, 7);
    input.id = id;
    label.setAttribute("for", id);
    input.addEventListener("input", function () { onChange(input.value); });
    input.addEventListener("change", function () { onChange(input.value); });
    wrap.appendChild(label);
    wrap.appendChild(input);
    return wrap;
  }

  function setupEventAdd() {
    var addBtn = document.getElementById("addEventBtn");
    if (!addBtn) return;
    addBtn.addEventListener("click", function () {
      state.events.push({
        name: "New Event",
        date: "",
        time: "18:00",
        venue: "",
        address: "",
        mapLink: "",
        dress: "",
        note: "",
        isMain: false
      });
      expandedEvents[state.events.length - 1] = true;
      renderEvents();
      saveDraft();
      schedulePreview();
    });
  }

  // ---------- Theme swatches ----------
  var THEMES = [
    { id: "gulabi", name: "Gulabi", colors: ["#FAF3EA", "#D9A0A6", "#8E2E4A", "#C9A24B", "#3A1426"] },
    { id: "emerald", name: "Emerald", colors: ["#F6F1E4", "#A8C0A0", "#1E5C3F", "#C9A24B", "#0F3D2A"] },
    { id: "midnight", name: "Midnight", colors: ["#F2F0E8", "#B8C0D8", "#2A3E6E", "#C6B27A", "#0F1A33"] },
    { id: "ivory-sage", name: "Ivory Sage", colors: ["#FBF8F0", "#C9CDB8", "#5C6B4A", "#B89A4A", "#3D4232"] }
  ];

  function renderThemes() {
    var grid = document.getElementById("themeGrid");
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < THEMES.length; i++) {
      (function (t) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "theme-swatch" + (state.theme === t.id ? " active" : "");
        btn.setAttribute("data-theme-id", t.id);
        btn.setAttribute("aria-label", "Theme " + t.name);
        var swatch = '<div class="swatch-colors">';
        for (var c = 0; c < t.colors.length; c++) {
          swatch += '<span style="background:' + t.colors[c] + '"></span>';
        }
        swatch += '</div><div class="swatch-name">' + escapeHtml(t.name) + '</div>';
        btn.innerHTML = swatch;
        btn.addEventListener("click", function () {
          state.theme = t.id;
          applyThemeToSwatches();
          schedulePreview();
          saveDraft();
        });
        grid.appendChild(btn);
      })(THEMES[i]);
    }
  }

  function applyThemeToSwatches() {
    var swatches = document.querySelectorAll(".theme-swatch");
    for (var i = 0; i < swatches.length; i++) {
      var id = swatches[i].getAttribute("data-theme-id");
      if (id === state.theme) swatches[i].classList.add("active");
      else swatches[i].classList.remove("active");
    }
  }

  // ---------- Contacts UI ----------
  function renderContacts() {
    var list = document.getElementById("contactsList");
    if (!list) return;
    list.innerHTML = "";
    if (!state.contacts) state.contacts = [];
    for (var i = 0; i < state.contacts.length; i++) {
      (function (idx) {
        var c = state.contacts[idx] || { label: "", phone: "" };
        var wrap = document.createElement("div");
        wrap.style.marginBottom = "10px";
        wrap.style.paddingBottom = "10px";
        wrap.style.borderBottom = "1px dashed rgba(201,162,75,0.22)";

        var labelField = makeField("Label", "text", c.label, function (v) {
          state.contacts[idx].label = v;
          saveDraft();
          schedulePreview();
        }, "e.g. Uncle Ahmed");
        wrap.appendChild(labelField);

        var phoneField = makeField("Phone", "tel", c.phone, function (v) {
          state.contacts[idx].phone = v;
          saveDraft();
          schedulePreview();
        }, "919876543210");
        wrap.appendChild(phoneField);

        var delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn-sm danger";
        delBtn.textContent = "Remove contact";
        delBtn.addEventListener("click", function () {
          state.contacts.splice(idx, 1);
          renderContacts();
          saveDraft();
          schedulePreview();
        });
        wrap.appendChild(delBtn);

        list.appendChild(wrap);
      })(i);
    }
    if (state.contacts.length < 3) {
      var addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "add-btn";
      addBtn.textContent = "+ Add contact";
      addBtn.addEventListener("click", function () {
        state.contacts.push({ label: "", phone: "" });
        renderContacts();
        saveDraft();
        schedulePreview();
      });
      list.appendChild(addBtn);
    }
  }

  // ---------- Guest link maker ----------
  function setupGuestLink() {
    var urlInput = document.getElementById("f-pageUrl");
    var nameInput = document.getElementById("f-guestName");
    var resultInput = document.getElementById("f-guestResult");
    var copyBtn = document.getElementById("copyGuestBtn");
    if (!urlInput || !nameInput || !resultInput || !copyBtn) return;

    function update() {
      var url = (urlInput.value || "").trim();
      var name = (nameInput.value || "").trim();
      if (!url) { resultInput.value = ""; return; }
      var sep = url.indexOf("?") === -1 ? "?" : "&";
      resultInput.value = url + sep + "guest=" + encodeURIComponent(name);
    }
    urlInput.addEventListener("input", update);
    nameInput.addEventListener("input", update);
    copyBtn.addEventListener("click", function () {
      if (!resultInput.value) return;
      var text = resultInput.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = "Copied";
          setTimeout(function () { copyBtn.textContent = "Copy"; }, 1500);
        }).catch(function () { fallbackCopy(text, copyBtn); });
      } else {
        fallbackCopy(text, copyBtn);
      }
    });
  }

  function fallbackCopy(text, btn) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy"; }, 1500);
    } catch (e) {}
  }

  // ---------- Image uploads ----------
  function resizeImage(file, maxDim, quality, cb) {
    if (!file || !/^image\//.test(file.type)) { cb(null); return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          var scale = Math.min(1, maxDim / Math.max(w, h));
          var nw = Math.max(1, Math.round(w * scale));
          var nh = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement("canvas");
          canvas.width = nw;
          canvas.height = nh;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, nw, nh);
          // Preserve PNG transparency for floral frame.
          var isPng = /png/i.test(file.type);
          var dataUrl = isPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality);
          cb(dataUrl);
        } catch (err) {
          cb(null);
        }
      };
      img.onerror = function () { cb(null); };
      img.src = e.target.result;
    };
    reader.onerror = function () { cb(null); };
    reader.readAsDataURL(file);
  }

  function setupImageUpload(inputId, previewId, fieldPath, isPng) {
    var input = document.getElementById(inputId);
    var preview = document.getElementById(previewId);
    if (!input || !preview) return;

    function renderPreview(src) {
      preview.innerHTML = "";
      if (!src) return;
      var wrap = document.createElement("div");
      wrap.className = "img-preview";
      var img = document.createElement("img");
      img.alt = "Preview";
      img.src = src;
      wrap.appendChild(img);
      preview.appendChild(wrap);
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-sm danger";
      delBtn.textContent = "Remove";
      delBtn.style.marginTop = "8px";
      delBtn.addEventListener("click", function () {
        setByPath(state, fieldPath, "");
        renderPreview("");
        saveDraft();
        schedulePreview();
      });
      preview.appendChild(delBtn);
    }

    renderPreview(getByPath(state, fieldPath));

    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) return;
      resizeImage(f, 1200, 0.75, function (dataUrl) {
        if (!dataUrl) return;
        setByPath(state, fieldPath, dataUrl);
        renderPreview(dataUrl);
        saveDraft();
        schedulePreview();
        input.value = "";
      });
    });
  }

  function setupGalleryUpload() {
    var input = document.getElementById("f-galleryInput");
    var grid = document.getElementById("galleryGrid");
    if (!input || !grid) return;

    function render() {
      grid.innerHTML = "";
      var arr = state.gallery || [];
      for (var i = 0; i < arr.length; i++) {
        (function (idx) {
          var thumb = document.createElement("div");
          thumb.className = "thumb";
          var img = document.createElement("img");
          img.alt = "Gallery photo " + (idx + 1);
          img.src = arr[idx];
          thumb.appendChild(img);
          var del = document.createElement("button");
          del.type = "button";
          del.className = "thumb-del";
          del.setAttribute("aria-label", "Remove photo " + (idx + 1));
          del.textContent = "\u00d7";
          del.addEventListener("click", function () {
            state.gallery.splice(idx, 1);
            render();
            saveDraft();
            schedulePreview();
          });
          thumb.appendChild(del);
          grid.appendChild(thumb);
        })(i);
      }
    }
    render();

    input.addEventListener("change", function () {
      var files = input.files;
      if (!files || !files.length) return;
      var max = 8;
      var remaining = max - (state.gallery ? state.gallery.length : 0);
      var toProcess = Math.min(files.length, remaining);
      var done = 0;
      for (var i = 0; i < toProcess; i++) {
        (function (file) {
          resizeImage(file, 1200, 0.75, function (dataUrl) {
            if (dataUrl) {
              if (!state.gallery) state.gallery = [];
              state.gallery.push(dataUrl);
            }
            done++;
            if (done === toProcess) {
              render();
              saveDraft();
              schedulePreview();
              input.value = "";
            }
          });
        })(files[i]);
      }
    });
  }

  // ---------- Music upload ----------
  function setupMusicUpload() {
    var input = document.getElementById("f-musicInput");
    var preview = document.getElementById("musicPreview");
    var warn = document.getElementById("musicWarn");
    var removeBtn = document.getElementById("removeMusicBtn");
    if (!input || !preview) return;

    function render() {
      preview.innerHTML = "";
      if (!state.music) {
        if (removeBtn) removeBtn.style.display = "none";
        return;
      }
      var row = document.createElement("div");
      row.className = "audio-row";
      var name = document.createElement("div");
      name.className = "audio-name";
      name.textContent = "Background music loaded";
      var audio = document.createElement("audio");
      audio.controls = true;
      audio.src = state.music;
      row.appendChild(name);
      row.appendChild(audio);
      preview.appendChild(row);
      if (removeBtn) removeBtn.style.display = "inline-block";
    }
    render();

    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) return;
      if (!/audio\/(mpeg|mp3)/i.test(f.type) && !/\.mp3$/i.test(f.name)) {
        showMusicWarn("Please choose an MP3 file.", true);
        input.value = "";
        return;
      }
      if (f.size > 3 * 1024 * 1024) {
        showMusicWarn("This file is over 3 MB. It will still work, but the card will be heavier to download.", false);
      } else {
        showMusicWarn("", false);
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        state.music = e.target.result;
        render();
        saveDraft();
        schedulePreview();
        input.value = "";
      };
      reader.onerror = function () {
        showMusicWarn("Could not read this file.", true);
        input.value = "";
      };
      reader.readAsDataURL(f);
    });

    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        state.music = "";
        render();
        showMusicWarn("", false);
        saveDraft();
        schedulePreview();
      });
    }
  }

  function showMusicWarn(msg, isError) {
    var warn = document.getElementById("musicWarn");
    if (!warn) return;
    if (!msg) { warn.style.display = "none"; warn.textContent = ""; return; }
    warn.style.display = "block";
    warn.textContent = msg;
    warn.className = "field-hint " + (isError ? "err" : "warn");
  }

  // ---------- Media total size warning ----------
  function checkMediaSize() {
    var total = 0;
    var keys = ["heroImage", "couplePhoto", "floralFrame", "envelopeImage", "music"];
    for (var i = 0; i < keys.length; i++) {
      var v = state[keys[i]];
      if (typeof v === "string" && v.indexOf("data:") === 0) {
        total += v.length;
      }
    }
    if (state.gallery) {
      for (var g = 0; g < state.gallery.length; g++) {
        if (typeof state.gallery[g] === "string") total += state.gallery[g].length;
      }
    }
    if (total > 8 * 1024 * 1024) {
      var warn = document.getElementById("musicWarn");
      if (warn) {
        warn.style.display = "block";
        warn.className = "field-hint warn";
        warn.textContent = "Total media is over 8 MB. The downloaded card will be large and slower to open on phones.";
      }
    }
  }

  // ---------- Download ----------
  function slugify(s) {
    return String(s || "card")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "card";
  }

  function downloadCard() {
    var html = buildCurrent();
    if (!html) {
      showError("Download failed", "The card could not be built. Please check the editor for errors.");
      return;
    }
    try {
      var n1 = slugify(state.person1 && state.person1.name);
      var n2 = slugify(state.person2 && state.person2.name);
      var fname = n1 + "-" + n2 + "-nikah-card.html";
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 500);

      downloadBtn.textContent = "Downloaded!";
      downloadBtn.disabled = true;
      setDraftStatus("Card downloaded. Clearing draft...", true);
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(TEXT_DRAFT_KEY);
      } catch (e) {}
      setTimeout(function () {
        window.location.reload();
      }, 1500);
    } catch (e) {
      showError("Download failed", e.message || String(e));
    }
  }

  // ---------- Reset ----------
  function resetCard() {
    var ok = window.confirm("Clear all your work and start fresh? This cannot be undone.");
    if (!ok) return;
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(TEXT_DRAFT_KEY);
    } catch (e) {}
    window.location.reload();
  }

  // ---------- Mobile edit sheet ----------
  function setupMobileSheet() {
    if (!mobileEditBtn || !editor || !editorBackdrop) return;
    function open() {
      editor.classList.add("sheet-open");
      editorBackdrop.classList.add("visible");
    }
    function close() {
      editor.classList.remove("sheet-open");
      editorBackdrop.classList.remove("visible");
    }
    mobileEditBtn.addEventListener("click", open);
    editorBackdrop.addEventListener("click", close);
    // Close when the user switches to the preview at mobile widths.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) close();
    });
  }

  // ---------- Boot ----------
  function boot() {
    try {
      var missing = checkDependencies();
      if (missing.length) {
        showError(
          "Some files are missing",
          "Please make sure these files are present: " + missing.join(", ")
        );
        hideLoader();
        return;
      }

      // Load draft before binding fields.
      loadDraft();

      // Bind all text fields.
      bindAllFields();

      // Tabs.
      setupTabs();

      // Events.
      renderEvents();
      setupEventAdd();

      // Theme.
      renderThemes();
      applyThemeToSwatches();

      // Contacts.
      renderContacts();

      // Guest link.
      setupGuestLink();

      // Image uploads.
      setupImageUpload("f-heroImageInput", "heroImagePreview", "heroImage", false);
      setupImageUpload("f-couplePhotoInput", "couplePhotoPreview", "couplePhoto", false);
      setupImageUpload("f-floralFrameInput", "floralFramePreview", "floralFrame", true);
      setupImageUpload("f-envelopeImageInput", "envelopeImagePreview", "envelopeImage", false);

      // Gallery.
      setupGalleryUpload();

      // Music.
      setupMusicUpload();

      // Media size warning check.
      checkMediaSize();

      // Buttons.
      if (downloadBtn) downloadBtn.addEventListener("click", downloadCard);
      if (resetBtn) resetBtn.addEventListener("click", resetCard);

      // Mobile sheet.
      setupMobileSheet();

      // Initial preview render (immediately, not debounced).
      renderPreview();

      // Save the draft once after load so a fresh session has something to restore.
      setTimeout(function () {
        setDraftStatus("Draft saved automatically", true);
      }, 400);
    } catch (e) {
      showError("Builder failed to start", e.message || String(e));
    } finally {
      hideLoader();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

// END OF FILE builder.js
