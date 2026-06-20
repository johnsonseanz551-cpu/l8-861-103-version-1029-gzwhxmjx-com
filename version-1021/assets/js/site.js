(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHeroSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHeroTimer();
    });
  });

  showHeroSlide(0);
  startHeroTimer();

  const localFilter = document.querySelector('.local-filter');
  const filterList = document.querySelector('[data-filter-list]');

  if (localFilter && filterList) {
    const items = Array.from(filterList.querySelectorAll('.movie-card'));
    localFilter.addEventListener('input', function () {
      const keyword = localFilter.value.trim().toLowerCase();
      items.forEach(function (item) {
        const haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-region'),
          item.getAttribute('data-year')
        ].join(' ').toLowerCase();
        item.style.display = !keyword || haystack.includes(keyword) ? '' : 'none';
      });
    });
  }

  function buildCard(item) {
    const tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + item.url + '">',
      '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="type-badge">' + escapeHtml(item.type) + '</span>',
      '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</p>',
      '    <p class="movie-brief">' + escapeHtml(item.brief) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchStatus = document.getElementById('searchStatus');

  function renderSearch(query) {
    if (!searchInput || !searchResults || typeof searchItems === 'undefined') {
      return;
    }
    const q = (query || '').trim().toLowerCase();
    const source = q ? searchItems.filter(function (item) {
      return item.keywords.includes(q);
    }) : searchItems.slice(0, 24);
    const results = source.slice(0, 96);
    searchResults.innerHTML = results.map(buildCard).join('');
    if (searchStatus) {
      searchStatus.textContent = q ? '搜索结果：' + results.length + ' 条' : '精选推荐';
    }
  }

  if (searchInput && searchResults) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    renderSearch(initialQuery);
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  function setupVideo(block, playNow) {
    const video = block.querySelector('video');
    const button = block.querySelector('.video-start');
    const stream = block.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (video.getAttribute('data-ready') !== 'true') {
      if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', 'true');
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (playNow) {
      video.play().catch(function () {});
    }
  }

  document.querySelectorAll('.video-shell[data-stream]').forEach(function (block) {
    const button = block.querySelector('.video-start');
    const video = block.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        setupVideo(block, true);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        setupVideo(block, true);
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
