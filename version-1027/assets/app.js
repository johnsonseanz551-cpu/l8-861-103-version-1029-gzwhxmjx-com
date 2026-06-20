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
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
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
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
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
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector(".filter-input");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-target"));
            if (!input || !cards.length) {
                return;
            }
            function apply() {
                var value = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    card.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
                });
            }
            input.addEventListener("input", apply);
            scope.querySelectorAll(".quick-filter").forEach(function (button) {
                button.addEventListener("click", function () {
                    input.value = button.getAttribute("data-filter-value") || "";
                    apply();
                    input.focus();
                });
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player-wrap"));
        players.forEach(function (wrap) {
            var video = wrap.querySelector("video");
            var mask = wrap.querySelector(".player-mask");
            var status = wrap.querySelector(".player-status");
            if (!video || !mask) {
                return;
            }
            var source = video.getAttribute("data-player-source");
            var loaded = false;
            var instance = null;

            function setStatus(text) {
                if (status) {
                    status.textContent = text || "";
                }
            }

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    instance = new window.Hls({ enableWorker: true });
                    instance.loadSource(source);
                    instance.attachMedia(video);
                    instance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放遇到问题，正在重试");
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                instance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                instance.recoverMediaError();
                            } else {
                                setStatus("视频暂时无法播放");
                            }
                        }
                    });
                } else {
                    video.src = source;
                }
            }

            function play() {
                load();
                mask.classList.add("is-hidden");
                video.controls = true;
                setStatus("正在加载");
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.then(function () {
                        setStatus("");
                    }).catch(function () {
                        setStatus("点击视频继续播放");
                    });
                }
            }

            function toggle() {
                if (!loaded || video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            mask.addEventListener("click", play);
            video.addEventListener("click", toggle);
            video.addEventListener("playing", function () {
                setStatus("");
            });
            video.addEventListener("pause", function () {
                if (loaded) {
                    setStatus("已暂停");
                }
            });
            video.addEventListener("ended", function () {
                if (instance) {
                    instance.destroy();
                    instance = null;
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
