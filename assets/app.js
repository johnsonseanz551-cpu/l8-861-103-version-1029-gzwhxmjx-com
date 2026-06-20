(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var input = panel.querySelector("[data-local-search]");
      var list = document.querySelector("[data-card-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var active = "";
      var query = "";

      function apply() {
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-card-tags") || "").toLowerCase();
          var matchFilter = !active || text.indexOf(active.toLowerCase()) !== -1;
          var matchQuery = !query || text.indexOf(query.toLowerCase()) !== -1;
          card.setAttribute("data-hidden", matchFilter && matchQuery ? "false" : "true");
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter") || "";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener("input", function () {
          query = input.value.trim();
          apply();
        });
      }
    });
  }

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"./" + item.file + "\">" +
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(item.type) + "</span>" +
      "<span class=\"poster-score\">" + escapeHtml(String(item.rating)) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\">" + escapeHtml(item.year + " · " + item.region + " · " + item.genre) + "</div>" +
      "<h2><a href=\"./" + item.file + "\">" + escapeHtml(item.title) + "</a></h2>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    var data = window.SEARCH_INDEX;
    var matched = query ? data.filter(function (item) {
      var text = [item.title, item.region, item.type, item.year, item.genre, item.category].concat(item.tags || []).join(" ").toLowerCase();
      return text.indexOf(query.toLowerCase()) !== -1;
    }) : data.slice(0, 24);
    if (title) {
      title.textContent = query ? "搜索结果" : "热门推荐";
    }
    if (!matched.length) {
      results.innerHTML = "<p class=\"empty-state\">没有找到相关影片</p>";
      return;
    }
    results.innerHTML = matched.slice(0, 160).map(cardTemplate).join("");
  }

  window.setupMoviePlayer = function (playerId, source) {
    var video = document.getElementById(playerId);
    if (!video) {
      return;
    }
    var cover = document.querySelector("[data-player-target=\"" + playerId + "\"]");
    var hls = null;
    var loaded = false;

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function playVideo() {
      hideCover();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", source);
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!loaded) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          loaded = true;
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (!video.getAttribute("src")) {
        video.setAttribute("src", source);
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", hideCover);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
