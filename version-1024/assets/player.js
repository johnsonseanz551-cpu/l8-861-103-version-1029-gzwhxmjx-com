(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initializePlayer(wrapper) {
    var video = wrapper.querySelector("video[data-src]");
    var button = wrapper.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-src");
    if (!source) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function markPlaying() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function bindSourceAndPlay() {
      if (wrapper.getAttribute("data-ready") === "true") {
        playVideo();
        return;
      }
      wrapper.setAttribute("data-ready", "true");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.addEventListener("loadedmetadata", playVideo, { once: true });
        }
        wrapper.hlsInstance = hls;
        return;
      }
      video.src = source;
      playVideo();
    }

    if (button) {
      button.addEventListener("click", bindSourceAndPlay);
    }
    video.addEventListener("play", markPlaying);
    video.addEventListener("playing", markPlaying);
    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(initializePlayer);
  });
})();
