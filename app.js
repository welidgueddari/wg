(function () {
  "use strict";

  var THEME_KEY = "wg-theme";
  var controls = [].slice.call(document.querySelectorAll(".control"));
  var themeBtn = document.querySelector(".theme-btn");
  var logo = document.getElementById("mylogo");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  /* ------------------------------------------------------------------ *
   * Section switching                                                   *
   * ------------------------------------------------------------------ */
  function activate(id) {
    var target = document.getElementById(id);
    var current = document.querySelector(".container.active");
    if (!target || target === current) return;

    if (current) current.classList.remove("active");
    target.classList.add("active");

    controls.forEach(function (btn) {
      var on = btn.dataset.id === id;
      btn.classList.toggle("active-btn", on);
      btn.setAttribute("aria-current", on ? "page" : "false");
    });

    // Sections are stacked at the same position, so carrying the previous
    // scroll offset over would drop the visitor into the middle of the new one.
    window.scrollTo(0, 0);

    // some browsers reject replaceState on file:// URLs
    try {
      history.replaceState(null, "", "#" + id);
    } catch (e) {
      /* deep-linking just won't update the address bar */
    }
  }

  controls.forEach(function (btn) {
    btn.addEventListener("click", function () {
      activate(btn.dataset.id);
    });
  });

  // In-page links that should switch section rather than scroll (hero CTA).
  document.querySelectorAll("[data-nav]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      activate(el.dataset.nav);
    });
  });

  // Deep links: /#contact opens straight on that section.
  var initial = (location.hash || "").replace("#", "");
  if (initial && document.getElementById(initial)) activate(initial);

  /* ------------------------------------------------------------------ *
   * Theme                                                               *
   * ------------------------------------------------------------------ */
  function store(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* private mode / storage disabled - the theme just won't persist */
    }
  }

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(mode) {
    var light = mode === "light";
    document.body.classList.toggle("light-mode", light);
    if (logo) logo.src = light ? "img/logos/MyLogo.png" : "img/logos/MyLogoWhite.png";
    if (themeMeta) themeMeta.setAttribute("content", light ? "#FFFFFF" : "#0A0A0A");
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(light));
      themeBtn.setAttribute(
        "aria-label",
        light ? "Switch to dark theme" : "Switch to light theme"
      );
    }
  }

  var saved = read(THEME_KEY);
  var prefersLight =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(saved || (prefersLight ? "light" : "dark"));

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = document.body.classList.contains("light-mode") ? "dark" : "light";
      applyTheme(next);
      store(THEME_KEY, next);
    });
  }

  /* ------------------------------------------------------------------ *
   * Reveal on scroll                                                    *
   * ------------------------------------------------------------------ */
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealables = document.querySelectorAll(
    ".portfolio-item, .about-item, .skill-category, .timeline-item"
  );

  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var siblings = [].slice.call(entry.target.parentNode.children);
          var i = siblings.indexOf(entry.target);
          entry.target.style.animationDelay = Math.min(i, 6) * 70 + "ms";
          entry.target.classList.add("fade-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }
})();
