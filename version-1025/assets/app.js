(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupFilters() {
    selectAll('[data-filter-input]').forEach(function (input) {
      var container = input.closest('section') || document;
      var list = container.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');

      if (!list) {
        return;
      }

      var cards = selectAll('.searchable-card', list);

      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-filter-text') || card.textContent || '').toLowerCase();
          card.classList.toggle('is-filter-hidden', value && text.indexOf(value) === -1);
        });
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function setupPlayer() {
    var stage = document.querySelector('.player-stage');

    if (!stage) {
      return;
    }

    var video = stage.querySelector('video');
    var overlay = stage.querySelector('.play-overlay');

    if (!video || !overlay) {
      return;
    }

    var playUrl = video.getAttribute('src') || video.currentSrc;
    var ready = false;
    var hlsInstance = null;

    function prepare() {
      if (ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported() && !video.canPlayType('application/vnd.apple.mpegurl')) {
        video.removeAttribute('src');
        video.load();
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(playUrl);
        hlsInstance.attachMedia(video);
      } else if (!video.getAttribute('src')) {
        video.setAttribute('src', playUrl);
      }

      ready = true;
    }

    function start() {
      prepare();
      overlay.classList.add('is-hidden');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });

    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupFilters();
    setupHero();
    setupPlayer();
  });
})();
