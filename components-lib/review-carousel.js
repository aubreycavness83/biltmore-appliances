/**
 * Review Carousel
 * Testimonial/review slider with autoplay, hover pause, prev/next buttons,
 * dynamic dots with ARIA labels, responsive cards-per-view, and optional
 * read-more modal for truncated quotes.
 *
 * @param {HTMLElement} root - The carousel container.
 * @param {Object} [config]
 * @param {string} [config.trackSelector=".review-carousel__track"]
 * @param {string} [config.slideSelector=".review-carousel__slide"]
 * @param {string} [config.prevSelector=".review-carousel__btn--prev"]
 * @param {string} [config.nextSelector=".review-carousel__btn--next"]
 * @param {string} [config.dotsSelector=".review-carousel__dots"]
 * @param {string} [config.activeClass="is-active"]
 * @param {number} [config.interval=8000] - Autoplay interval. 0 = disabled.
 * @param {boolean} [config.pauseOnHover=true]
 * @param {string} [config.mode="slide"] - "slide" (translateX %) or "page" (multi-card pages).
 * @param {number|Function} [config.perView=1] - Cards visible at once, or a function returning count.
 * @param {boolean} [config.createDots=true]
 * @param {boolean} [config.readMore=false] - Enable read-more modal for truncated quotes.
 * @param {string} [config.quoteSelector=".review-carousel__quote"]
 * @param {string} [config.authorSelector=".review-carousel__author"]
 * @param {string} [config.modalSelector=".review-carousel__modal"]
 * @returns {{ destroy: Function, goTo: Function }}
 */
export function initReviewCarousel(root, config = {}) {
  const cfg = {
    trackSelector: ".review-carousel__track",
    slideSelector: ".review-carousel__slide",
    prevSelector: ".review-carousel__btn--prev",
    nextSelector: ".review-carousel__btn--next",
    dotsSelector: ".review-carousel__dots",
    activeClass: "is-active",
    interval: 8000,
    pauseOnHover: true,
    mode: "slide",
    perView: 1,
    createDots: true,
    readMore: false,
    quoteSelector: ".review-carousel__quote",
    authorSelector: ".review-carousel__author",
    modalSelector: ".review-carousel__modal",
    ...config,
  };

  const track = root.querySelector(cfg.trackSelector);
  const slides = Array.from(root.querySelectorAll(cfg.slideSelector));
  const prevBtn = root.querySelector(cfg.prevSelector);
  const nextBtn = root.querySelector(cfg.nextSelector);
  let dotsWrap = root.querySelector(cfg.dotsSelector);

  if (!track || !slides.length) {
    return { destroy() {}, goTo() {} };
  }

  let current = 0;
  let autoplayId = null;
  let dots = [];

  function getPerView() {
    return typeof cfg.perView === "function" ? cfg.perView() : cfg.perView;
  }

  function getTotalPages() {
    const pv = getPerView();
    return pv >= slides.length ? 1 : Math.ceil(slides.length / pv);
  }

  // --- Dot management ---
  function buildDots() {
    if (!dotsWrap && cfg.createDots) {
      dotsWrap = document.createElement("div");
      dotsWrap.className = "review-carousel__dots";
      root.appendChild(dotsWrap);
    }
    if (!dotsWrap) return;

    dotsWrap.innerHTML = "";
    dots = [];
    const total = cfg.mode === "page" ? getTotalPages() : slides.length;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("button");
      dot.className = "review-carousel__dot";
      dot.setAttribute("aria-label", `Go to review ${i + 1}`);
      dot.addEventListener("click", () => {
        goTo(i);
        restartAutoplay();
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function updateDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle(cfg.activeClass, i === current);
    });
  }

  // --- Slide rendering ---
  function render() {
    if (cfg.mode === "page") {
      const pv = getPerView();
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const slideW = slides[0].getBoundingClientRect().width;
      const offset = current * pv * (slideW + gap);
      track.style.transform = `translateX(-${offset}px)`;
    } else {
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    updateDots();

    // Disable buttons at bounds for page mode
    if (cfg.mode === "page") {
      const max = getTotalPages() - 1;
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= max;
    }
  }

  function goTo(i) {
    const total = cfg.mode === "page" ? getTotalPages() : slides.length;
    current = ((i % total) + total) % total;
    render();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  // --- Autoplay ---
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

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Reduced motion
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionQuery.matches) cfg.interval = 0;

  // --- Event bindings ---
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prev();
      restartAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      next();
      restartAutoplay();
    });
  }
  if (cfg.pauseOnHover) {
    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
  }

  // --- Responsive rebuild ---
  function handleResize() {
    const prevTotal = dots.length;
    const newTotal = cfg.mode === "page" ? getTotalPages() : slides.length;
    if (prevTotal !== newTotal) buildDots();
    if (current >= newTotal) current = newTotal - 1;
    render();
  }

  window.addEventListener("resize", handleResize);

  // --- Read-more modal ---
  let modalEl = null;
  let modalText = null;
  let modalAuthor = null;
  let modalClose = null;

  function openReadMore(text, author) {
    if (!modalEl) return;
    modalText.textContent = text;
    modalAuthor.textContent = author;
    modalEl.classList.add(cfg.activeClass);
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (modalClose) modalClose.focus();
  }

  function closeReadMore() {
    if (!modalEl) return;
    modalEl.classList.remove(cfg.activeClass);
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function handleModalKeydown(e) {
    if (e.key === "Escape" && modalEl?.classList.contains(cfg.activeClass)) {
      closeReadMore();
    }
  }

  if (cfg.readMore) {
    modalEl =
      root.querySelector(cfg.modalSelector) ||
      document.querySelector(cfg.modalSelector);
    if (modalEl) {
      modalText = modalEl.querySelector("[data-modal-text]");
      modalAuthor = modalEl.querySelector("[data-modal-author]");
      modalClose = modalEl.querySelector("[data-modal-close]");

      if (modalClose) modalClose.addEventListener("click", closeReadMore);
      modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) closeReadMore();
      });
      document.addEventListener("keydown", handleModalKeydown);
    }

    // Inject read-more buttons for truncated quotes
    slides.forEach((slide) => {
      const quote = slide.querySelector(cfg.quoteSelector);
      if (!quote) return;

      function checkTruncation() {
        const existing = slide.querySelector(".review-carousel__read-more");
        if (existing) existing.remove();

        if (quote.scrollHeight > quote.clientHeight + 2) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "review-carousel__read-more";
          btn.textContent = "Read more";
          btn.addEventListener("click", () => {
            const fullText = quote.textContent.trim();
            const authorEl = slide.querySelector(cfg.authorSelector);
            const authorName = authorEl ? authorEl.textContent.trim() : "";
            openReadMore(fullText, `— ${authorName}`);
          });
          quote.after(btn);
        }
      }

      requestAnimationFrame(checkTruncation);
      window.addEventListener("resize", checkTruncation);
    });
  }

  // --- Init ---
  buildDots();
  render();
  startAutoplay();

  return {
    goTo,
    next,
    prev,
    destroy() {
      stopAutoplay();
      window.removeEventListener("resize", handleResize);
      if (cfg.pauseOnHover) {
        root.removeEventListener("mouseenter", stopAutoplay);
        root.removeEventListener("mouseleave", startAutoplay);
      }
      if (cfg.readMore) {
        document.removeEventListener("keydown", handleModalKeydown);
      }
    },
  };
}
