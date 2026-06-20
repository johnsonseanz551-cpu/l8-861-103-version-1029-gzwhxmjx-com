(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  var menuButton = qs("[data-menu-toggle]");
  var mobileNav = qs("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  qsa("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = qs("input", form);
      if (!input) {
        return;
      }
      var query = input.value.trim();
      if (!query) {
        event.preventDefault();
        window.location.href = form.getAttribute("action") || "search.html";
      }
    });
  });

  var hero = qs("[data-hero]");

  if (hero) {
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var previous = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var active = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
        slide.setAttribute("aria-hidden", slideIndex === active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
        dot.setAttribute("aria-label", "切换到第" + (dotIndex + 1) + "屏");
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    show(0);
    start();
  }

  qsa("[data-filter-area]").forEach(function (area) {
    var searchInput = qs("[data-filter-search]", area);
    var typeSelect = qs("[data-filter-type]", area);
    var yearSelect = qs("[data-filter-year]", area);
    var cards = qsa("[data-movie-card]", area);
    var empty = qs("[data-empty]", area);
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (searchInput && query) {
      searchInput.value = query;
    }

    function applyFilter() {
      var term = normalize(searchInput ? searchInput.value : "");
      var typeValue = normalize(typeSelect ? typeSelect.value : "");
      var yearValue = normalize(yearSelect ? yearSelect.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent + " " + (card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-genre") || ""));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = (!term || text.indexOf(term) !== -1) && (!typeValue || cardType.indexOf(typeValue) !== -1) && (!yearValue || cardYear === yearValue);
        card.style.display = matched ? "" : "none";
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    [searchInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
})();
