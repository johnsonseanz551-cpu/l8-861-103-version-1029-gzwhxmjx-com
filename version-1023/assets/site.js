(function() {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var activate = function(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        activate(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function() {
        activate(index + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-card-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
  var empty = document.querySelector('[data-empty-state]');
  var activeType = 'all';
  var filterCards = function() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var shown = 0;
    cards.forEach(function(card) {
      var text = [card.dataset.title, card.dataset.tags, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
      var typeMatched = activeType === 'all' || card.dataset.type === activeType;
      var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
      var visible = typeMatched && keywordMatched;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });
    if (empty) {
      empty.style.display = shown ? 'none' : 'block';
    }
  };
  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }
  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      activeType = chip.dataset.filterButton || 'all';
      chips.forEach(function(item) {
        item.classList.toggle('is-active', item === chip);
      });
      filterCards();
    });
  });

  var searchMount = document.querySelector('[data-search-results]');
  if (searchMount && window.__SEARCH_DATA__) {
    var searchInput = document.querySelector('[data-global-search-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initial;
    }
    var renderSearch = function(term) {
      var q = term.trim().toLowerCase();
      var result = window.__SEARCH_DATA__.filter(function(item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase();
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 120);
      if (!result.length) {
        searchMount.innerHTML = '<div class="empty-state" style="display:block">没有找到匹配影片</div>';
        return;
      }
      searchMount.innerHTML = '<div class="movie-grid">' + result.map(function(item) {
        return '<article class="movie-card">' +
          '<a href="' + item.url + '" class="card-cover"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="cover-badge">' + escapeHtml(item.type) + '</span></a>' +
          '<div class="card-body"><a href="' + item.url + '" class="card-title">' + escapeHtml(item.title) + '</a>' +
          '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</p>' +
          '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p></div></article>';
      }).join('') + '</div>';
    };
    var escapeHtml = function(value) {
      return String(value).replace(/[&<>"']/g, function(ch) {
        return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch];
      });
    };
    renderSearch(initial);
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        renderSearch(searchInput.value);
      });
    }
  }
})();

function startMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !source) {
    return;
  }
  var attached = false;
  var attachSource = function() {
    if (attached) {
      return;
    }
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      attached = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      attached = true;
      return;
    }
    video.src = source;
    video.load();
    attached = true;
  };
  var play = function() {
    attachSource();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {
        window.setTimeout(function() {
          video.play().catch(function() {});
        }, 420);
      });
    }
  };
  attachSource();
  if (overlay) {
    overlay.addEventListener('click', play);
  }
  video.addEventListener('click', function() {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}
