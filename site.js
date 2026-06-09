(function () {
  "use strict";

  var body = document.body;
  var lampBtn = document.getElementById("lampBtn");
  var STORAGE_KEY = "onthetrail-theme";

  /* ---------- Haptics ---------- */
  // Gentle vibration feedback on supported devices (mostly Android / Chrome).
  // Silently does nothing where unsupported (iOS Safari, desktop).
  function haptic(pattern) {
    try {
      if (navigator && typeof navigator.vibrate === "function") {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  }
  window.haptic = haptic;

  /* ---------- Theme toggle ---------- */
  function applyTheme(theme) {
    var isDark = theme === "dark";
    body.classList.toggle("dark-mode", isDark);
    if (lampBtn) {
      lampBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
      lampBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  applyTheme(saved === "dark" ? "dark" : "light");

  if (lampBtn) {
    lampBtn.addEventListener("click", function () {
      var nowDark = !body.classList.contains("dark-mode");
      // a little "click on / click off" tick — two taps for on, one for off
      haptic(nowDark ? [14, 36, 22] : 18);
      applyTheme(nowDark ? "dark" : "light");
      try { localStorage.setItem(STORAGE_KEY, nowDark ? "dark" : "light"); } catch (e) {}
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      haptic(12);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Site-wide tap haptics ---------- */
  // Warm double-buzz on the big giving/CTA buttons; a light tap on links & nav.
  document.addEventListener("click", function (e) {
    var t = e.target.closest("a, button");
    if (!t || t === lampBtn || t === menuToggle) return;
    if (t.classList.contains("btn-ember")) {
      haptic([18, 30, 26]);     // generous, warm — for "Give" / "Support"
    } else if (t.classList.contains("btn-ghost") || t.closest(".nav-links")) {
      haptic(10);               // light tap — nav + secondary
    } else {
      haptic(8);                // faint tick — everything else clickable
    }
  });

  /* ---------- Prayer cards: tiny tick on hover-press (touch) ---------- */
  var prayerItems = document.querySelectorAll(".prayer-list li");
  prayerItems.forEach(function (li) {
    li.addEventListener("pointerdown", function () { haptic(6); });
  });

  /* ---------- Monthly newsletter ---------- */
  var newsList = document.getElementById("newsList");
  if (newsList) {
    var items = (window.NEWSLETTERS || []).slice();
    if (!items.length) {
      newsList.innerHTML =
        '<div class="news-empty">' +
        '<p style="margin:0 0 0.4rem;">No newsletters posted yet.</p>' +
        '<span class="news-soon">First issue · August 2026</span>' +
        '</div>';
    } else {
      newsList.innerHTML = "";
      items.forEach(function (n, i) {
        var card = document.createElement("article");
        card.className = "news-card";
        var label = (i === 0) ? "Latest issue" : "Newsletter";
        card.innerHTML =
          '<span class="news-month">' + n.month + '</span>' +
          '<span class="news-meta">' + label + '</span>' +
          '<a class="btn-ember" href="' + n.file + '" target="_blank" rel="noopener" ' +
          'aria-label="Read the ' + n.month + ' newsletter (opens PDF in a new tab)">Read PDF →</a>';
        newsList.appendChild(card);
      });
    }
  }
})();
