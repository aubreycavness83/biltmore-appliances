/**
 * Hero Carousel
 * Supports both translateX-track and crossfade modes. Autoplay with hover
 * pause, dot + arrow navigation, keyboard support (ArrowLeft/Right).
 *
 * @param {HTMLElement} root - The carousel container.
 * @param {Object} [config]
 * @param {string} [config.mode="slide"] - "slide" (translateX) or "fade" (crossfade).
 * @param {string} [config.trackSelector=".hero-carousel__track"]
 * @param {string} [config.slideSelector=".hero-carousel__slide"]
 * @param {string} [config.prevSelector=".hero-carousel__btn--prev"]
 * @param {string} [config.nextSelector=".hero-carousel__btn--next"]
 * @param {string} [config.dotsSelector=".hero-carousel__dots"]
 * @param {string} [config.activeClass="is-active"]
 * @param {number} [config.interval=5000] - Autoplay interval in ms. 0 = disabled.
 * @param {boolean} [config.pauseOnHover=true]
 * @param {boolean} [config.keyboard=true]
 * @param {boolean} [config.createDots=false] - Auto-create dot buttons.
 * @returns {{ destroy: Function, goTo: Function, next: Function, prev: Function }}
 */
export function initHeroCarousel(root, config = {}) {
  const cfg = {
    mode: "slide",
    trackSelector: ".hero-carousel__track",
    slideSelector: ".hero-carousel__slide",
    prevSelector: ".hero-carousel__btn--prev",
    nextSelector: ".hero-carousel__btn--next",
    dotsSelector: ".hero-carousel__dots",
    activeClass: "is-active",
    interval: 5000,
    pauseOnHover: true,
    keyboard: true,
    createDots: false,
    ...config,
  };

  const track = root.querySelector(cfg.trackSelector);
  const slides = Array.from(root.querySelectorAll(cfg.slideSelector));
  const prevBtn = root.querySelector(cfg.prevSelector);
  const nextBtn = root.querySelector(cfg.nextSelector);
  let dotsWrap = root.querySelector(cfg.dotsSelector);

  if (!slides.length) return { destroy() {}, goTo() {}, next() {}, prev() {} };

  let index = 0;
  let autoplayId = null;
  let dots = [];

  // Build dots if requested or if a container exists
  if (cfg.createDots && !dotsWrap) {
    dotsWrap = document.createElement("div");
    dotsWrap.className = "hero-carousel__dots";
    root.appendChild(dotsWrap);
  }

  if (dotsWrap) {
    // Use existing dots or create them
    dots = Array.from(dotsWrap.querySelectorAll("button"));
    if (!dots.length) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "hero-carousel__dot";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    } else {
      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => goTo(i));
      });
    }
  }

  function render() {
    if (cfg.mode === "fade") {
      slides.forEach((slide, i) => {
        slide.classList.toggle(cfg.activeClass, i === index);
      });
    } else if (track) {
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    dots.forEach((dot, i) => {
      dot.classList.toggle(`${cfg.activeClass}`, i === index);
      dot.setAttribute("aria-pressed", String(i === index));
    });
  }

  function goTo(i) {
    index = ((i % slides.length) + slides.length) % slides.length;
    render();
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (cfg.interval > 0) {
      autoplayId = setInterval(next, cfg.interval);
    }
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  // Arrow buttons
  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      prev();
      startAutoplay();
    });
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      next();
      startAutoplay();
    });

  // Hover pause
  function handleMouseEnter() {
    stopAutoplay();
  }
  function handleMouseLeave() {
    startAutoplay();
  }

  if (cfg.pauseOnHover) {
    root.addEventListener("mouseenter", handleMouseEnter);
    root.addEventListener("mouseleave", handleMouseLeave);
  }

  // Keyboard
  function handleKeydown(e) {
    if (e.key === "ArrowRight") {
      next();
      startAutoplay();
    }
    if (e.key === "ArrowLeft") {
      prev();
      startAutoplay();
    }
  }

  if (cfg.keyboard) {
    if (!root.getAttribute("tabindex")) {
      root.setAttribute("tabindex", "0");
    }
    root.addEventListener("keydown", handleKeydown);
  }

  // Reduced motion: disable autoplay
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionQuery.matches) {
    cfg.interval = 0;
  }

  render();
  startAutoplay();

  return {
    goTo,
    next,
    prev,
    destroy() {
      stopAutoplay();
      if (prevBtn) prevBtn.removeEventListener("click", next);
      if (nextBtn) nextBtn.removeEventListener("click", prev);
      if (cfg.pauseOnHover) {
        root.removeEventListener("mouseenter", handleMouseEnter);
        root.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (cfg.keyboard) {
        root.removeEventListener("keydown", handleKeydown);
      }
    },
  };
}
