(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], input[type='search']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "search.html?q=" + encodeURIComponent(query);
        }
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }
    restart();
  }

  function setupPageFilter() {
    var input = document.querySelector("[data-page-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.children);
    input.addEventListener("input", function () {
      var query = normalize(input.value);
      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-tags"),
          item.textContent
        ].join(" "));
        item.classList.toggle("is-filtered-out", query && haystack.indexOf(query) === -1);
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<div class=\"movie-poster\" style=\"background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.76)), url('" + escapeHtml(movie.image) + "');\">",
      "<span class=\"poster-chip\">" + escapeHtml(movie.type) + "</span>",
      "</div>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.category) + "</span></div>",
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var summary = document.querySelector("[data-search-summary]");
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    if (!query.trim()) {
      return;
    }
    var needle = normalize(query);
    var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" "));
      return haystack.indexOf(needle) !== -1;
    });
    results.innerHTML = matches.slice(0, 160).map(movieCard).join("") || "<p>未找到匹配影片，可尝试更换关键词。</p>";
    if (title) {
      title.textContent = "“" + query + "”的搜索结果";
    }
    if (summary) {
      summary.textContent = matches.length ? "以下影片可直接进入详情页观看。" : "暂无匹配结果，建议使用更短的关键词。";
    }
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupPageFilter();
    setupSearchPage();
  });
})();
