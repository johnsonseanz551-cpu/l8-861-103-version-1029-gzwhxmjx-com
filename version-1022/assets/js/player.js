(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video");
    var button = root.querySelector(".player-trigger");
    var address = root.getAttribute("data-video");
    var hlsInstance = null;
    var initialized = false;

    if (!video || !address) {
      return;
    }

    function showButton() {
      if (button) {
        button.classList.remove("is-hidden");
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function attachStream() {
      if (initialized) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = address;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(address);
        hlsInstance.attachMedia(video);
      } else {
        video.src = address;
      }

      initialized = true;
    }

    function playMovie() {
      attachStream();
      video.setAttribute("controls", "controls");
      hideButton();
      var request = video.play();

      if (request && typeof request.catch === "function") {
        request.catch(function () {
          showButton();
        });
      }
    }

    if (button) {
      button.addEventListener("click", playMovie);
    }

    video.addEventListener("play", hideButton);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showButton();
      }
    });
    video.addEventListener("ended", showButton);
    video.addEventListener("click", function () {
      if (video.paused) {
        playMovie();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(setupPlayer);
})();
