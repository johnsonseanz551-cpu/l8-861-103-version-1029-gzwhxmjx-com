(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                show(nextIndex);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function setupFiltering() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));
        var cards = areas.length ? Array.prototype.slice.call(document.querySelectorAll(".searchable-card")) : [];
        var searchInput = document.querySelector("[data-search-input]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]"));
        if (!cards.length && !searchInput && !filterButtons.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var selectedType = "全部";

        if (searchInput && query) {
            searchInput.value = query;
        }

        function apply() {
            var term = searchInput ? searchInput.value.trim().toLowerCase() : query.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var type = card.getAttribute("data-type") || "";
                var matchText = !term || text.indexOf(term) !== -1;
                var matchType = selectedType === "全部" || type === selectedType;
                card.classList.toggle("is-hidden", !(matchText && matchType));
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", apply);
        }

        filterButtons.forEach(function (button, index) {
            if (index === 0) {
                button.classList.add("is-active");
            }
            button.addEventListener("click", function () {
                selectedType = button.getAttribute("data-filter-type") || "全部";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });

        apply();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.querySelector(".play-overlay");
        var hlsInstance = null;
        var attached = false;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function play() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHeroSlider();
        setupFiltering();
    });
})();
