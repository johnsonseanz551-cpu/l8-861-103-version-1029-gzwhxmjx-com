function initMoviePlayer(source) {
  document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('.js-video');
    var cover = document.querySelector('.js-cover');
    var button = document.querySelector('.js-start');
    var loaded = false;
    var hls = null;

    function loadMedia() {
      if (!video || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function startPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      if (!video) {
        return;
      }
      loadMedia();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('error', function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
