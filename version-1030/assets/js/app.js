(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var menuButton = qs('.menu-toggle');
  var mobileNav = qs('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = qsa('.hero-slide');
  var dots = qsa('.hero-dot');
  var previous = qs('.hero-prev');
  var next = qs('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showSlide(0);
    restart();
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restart();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restart();
    });
  });

  var searchInput = qs('.js-card-search');
  var selects = qsa('.js-filter-select');
  var cards = qsa('.movie-card');
  var empty = qs('.no-results');

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value : '');
    var filters = {};

    selects.forEach(function (select) {
      filters[select.dataset.filter] = normalize(select.value);
    });

    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].map(normalize).join(' ');

      var matched = !query || haystack.indexOf(query) !== -1;

      Object.keys(filters).forEach(function (key) {
        var expected = filters[key];
        if (expected && normalize(card.dataset[key]) !== expected) {
          matched = false;
        }
      });

      card.classList.toggle('hidden-card', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput || selects.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
    applyFilters();
  }
})();
