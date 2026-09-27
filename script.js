// ============================================================
// IMPORTS
// ============================================================
import { initStickyHeader } from "./components-lib/sticky-header.js";
import { initMobileNav } from "./components-lib/mobile-nav.js";
import { initSmoothScroll } from "./components-lib/smooth-scroll.js";
import { initScrollReveal } from "./components-lib/scroll-reveal.js";
import { initParallax } from "./components-lib/parallax.js";
import { initFaqAccordion } from "./components-lib/faq-accordion.js";
import { initFormValidation } from "./components-lib/form-validation.js";

// ============================================================
// SECTION: HERO — thumbnail grow slider
// ============================================================
function initHeroMagicSlider() {
  const hero = document.querySelector(".hero--magic");
  if (!hero) return;

  const stage = hero.querySelector(".hero__stage");
  const thumbsEl = hero.querySelector(".hero__thumbs");
  const slides = Array.from(hero.querySelectorAll(".hero__slide"));
  const thumbs = Array.from(hero.querySelectorAll(".hero__thumb"));

  if (!stage || !thumbsEl || !slides.length || !thumbs.length) return;

  const slideUrls = slides.map((slide) => {
    const match = slide.style.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
    return match ? match[1] : "";
  });

  let activeSlide = 0;
  let isAnimating = false;

  const activeThumb = thumbs.find(
    (thumb) => Number(thumb.dataset.thumb) === activeSlide,
  );
  if (activeThumb) thumbsEl.appendChild(activeThumb);

  function activate(sourceThumb) {
    if (isAnimating) return;

    const nextIndex = Number(sourceThumb.dataset.thumb);
    if (Number.isNaN(nextIndex) || nextIndex === activeSlide) return;

    isAnimating = true;

    const stageRect = stage.getBoundingClientRect();
    const thumbRect = sourceThumb.getBoundingClientRect();

    const flip = document.createElement("div");
    flip.className = "hero__flip";
    flip.style.left = `${thumbRect.left - stageRect.left}px`;
    flip.style.top = `${thumbRect.top - stageRect.top}px`;
    flip.style.width = `${thumbRect.width}px`;
    flip.style.height = `${thumbRect.height}px`;
    flip.style.backgroundImage = `url("${slideUrls[nextIndex]}")`;
    flip.style.backgroundPosition = slides[nextIndex].style.backgroundPosition;
    stage.appendChild(flip);

    // Force layout before animating dimensions.
    // eslint-disable-next-line no-unused-expressions
    flip.offsetWidth;

    requestAnimationFrame(() => {
      flip.style.left = "0px";
      flip.style.top = "0px";
      flip.style.width = `${stageRect.width}px`;
      flip.style.height = `${stageRect.height}px`;
    });

    const previousSlide = activeSlide;
    activeSlide = nextIndex;

    sourceThumb.classList.add("is-leaving");
    sourceThumb.setAttribute("aria-hidden", "true");
    sourceThumb.setAttribute("tabindex", "-1");

    window.setTimeout(() => {
      slides[previousSlide].classList.remove("is-active");
      slides[nextIndex].classList.add("is-active");
      flip.remove();

      const previousThumb = thumbs.find(
        (thumb) => Number(thumb.dataset.thumb) === previousSlide,
      );
      if (previousThumb) {
        previousThumb.classList.remove("is-leaving");
        previousThumb.classList.add("is-entering");
        previousThumb.removeAttribute("aria-hidden");
        previousThumb.setAttribute("tabindex", "0");
        thumbsEl.appendChild(previousThumb);

        // Force reflow so enter transition runs.
        // eslint-disable-next-line no-unused-expressions
        previousThumb.offsetWidth;

        requestAnimationFrame(() => {
          previousThumb.classList.remove("is-entering");
        });
      }

      sourceThumb.classList.remove("is-leaving");
      sourceThumb.removeAttribute("aria-hidden");
      sourceThumb.setAttribute("tabindex", "0");
      thumbsEl.appendChild(sourceThumb);

      isAnimating = false;
    }, 950);
  }

  thumbsEl.addEventListener("click", (event) => {
    const thumb = event.target.closest(".hero__thumb");
    if (!thumb) return;
    activate(thumb);
  });
}

// ============================================================
// SECTION: ABOUT — process tabs + image swap
// ============================================================
function initAboutProcess() {
  const root = document.querySelector("[data-about-process]");
  if (!root) return;

  const steps = Array.from(root.querySelectorAll(".about__step"));
  const durationEl = root.querySelector("[data-process-duration]");
  const titleEl = root.querySelector("[data-process-title]");
  const copyEl = root.querySelector("[data-process-copy]");
  const aboutImage = document.querySelector("[data-about-image]");

  if (!steps.length || !titleEl || !copyEl) return;

  function activate(step) {
    steps.forEach((item) => {
      const isActive = item === step;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", isActive ? "true" : "false");
      item.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    if (durationEl) durationEl.textContent = step.dataset.stepDuration || "";
    titleEl.textContent = step.dataset.stepTitle || "";
    copyEl.textContent = step.dataset.stepCopy || "";

    if (aboutImage && step.dataset.stepImage) {
      const nextSrc = step.dataset.stepImage;
      const nextAlt = step.dataset.stepImageAlt || "";

      if (aboutImage.getAttribute("src") !== nextSrc) {
        aboutImage.classList.add("is-swapping");

        window.setTimeout(() => {
          aboutImage.src = nextSrc;
          if (nextAlt) aboutImage.alt = nextAlt;

          aboutImage.addEventListener(
            "load",
            () => {
              aboutImage.classList.remove("is-swapping");
            },
            { once: true },
          );
        }, 300);
      }
    }
  }

  steps.forEach((step, index) => {
    step.addEventListener("click", () => activate(step));
    step.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = steps[(index + direction + steps.length) % steps.length];
      activate(next);
      next.focus();
    });
  });
}

// ============================================================
// SECTION: MATERIALS — swatches + feature image swap
// ============================================================
function initMaterials() {
  const root = document.querySelector("[data-materials]");
  if (!root) return;

  const swatches = Array.from(root.querySelectorAll(".materials__swatch"));
  const imageEl = root.querySelector("[data-material-image]");
  const originEl = root.querySelector("[data-material-origin]");
  const nameEl = root.querySelector("[data-material-name]");
  const copyEl = root.querySelector("[data-material-copy]");

  if (!swatches.length || !imageEl || !nameEl || !copyEl) return;

  let isSwapping = false;

  function activate(swatch) {
    if (isSwapping || swatch.classList.contains("is-active")) return;

    isSwapping = true;

    swatches.forEach((item) => {
      const isActive = item === swatch;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", isActive ? "true" : "false");
      item.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    imageEl.classList.add("is-swapping");

    window.setTimeout(() => {
      imageEl.src = swatch.dataset.materialImage || imageEl.src;
      imageEl.alt = swatch.dataset.materialImageAlt || "";

      if (originEl) originEl.textContent = swatch.dataset.materialOrigin || "";
      nameEl.textContent = swatch.dataset.materialName || "";
      copyEl.textContent = swatch.dataset.materialCopy || "";

      const onLoad = () => {
        imageEl.classList.remove("is-swapping");
        isSwapping = false;
      };

      if (imageEl.complete) {
        onLoad();
      } else {
        imageEl.addEventListener("load", onLoad, { once: true });
        imageEl.addEventListener("error", onLoad, { once: true });
      }
    }, 350);
  }

  swatches.forEach((swatch, index) => {
    swatch.addEventListener("click", () => activate(swatch));
    swatch.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next =
        swatches[(index + direction + swatches.length) % swatches.length];
      activate(next);
      next.focus();
    });
  });
}

// ============================================================
// SECTION: TESTIMONIALS — reviews slider
// ============================================================
function initReviewsSlider() {
  const reviewsTrack = document.getElementById("reviewsTrack");
  const reviewsViewport = document.getElementById("reviewsSlider");
  const reviewPrev = document.getElementById("reviewPrev");
  const reviewNext = document.getElementById("reviewNext");
  const reviewDotsContainer = document.getElementById("reviewDots");
  const reviewCards = Array.from(document.querySelectorAll(".review-card"));

  if (
    !reviewsTrack ||
    !reviewsViewport ||
    !reviewPrev ||
    !reviewNext ||
    !reviewDotsContainer ||
    !reviewCards.length
  ) {
    return;
  }

  let reviewIndex = 0;
  let autoplayTimer = null;
  let isPaused = false;
  const AUTOPLAY_MS = 4000;

  function getReviewsPerView() {
    if (window.innerWidth <= 992) return 1;
    return 3;
  }

  function getTotalPages() {
    return Math.ceil(reviewCards.length / getReviewsPerView());
  }

  function buildDots() {
    reviewDotsContainer.innerHTML = "";

    for (let i = 0; i < getTotalPages(); i += 1) {
      const dot = document.createElement("button");
      dot.className = "review-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Show testimonials group ${i + 1}`);
      dot.classList.toggle("active", i === reviewIndex);
      dot.addEventListener("click", () => {
        reviewIndex = i;
        updateSlider();
      });
      reviewDotsContainer.appendChild(dot);
    }
  }

  function getGapPx() {
    const trackStyles = window.getComputedStyle(reviewsTrack);
    const gap =
      parseFloat(trackStyles.columnGap || "0") ||
      parseFloat(trackStyles.gap || "0");
    return Number.isFinite(gap) ? gap : 0;
  }

  function sizeCards(perView, gapPx, viewportWidth) {
    const cardWidth = (viewportWidth - gapPx * (perView - 1)) / perView;
    reviewCards.forEach((card) => {
      card.style.flex = `0 0 ${cardWidth}px`;
      card.style.width = `${cardWidth}px`;
    });
  }

  function updateSlider() {
    const perView = getReviewsPerView();
    const totalPages = getTotalPages();
    if (reviewIndex >= totalPages) reviewIndex = 0;

    const viewportWidth = reviewsViewport.offsetWidth;
    const gapPx = getGapPx();
    sizeCards(perView, gapPx, viewportWidth);

    const pageWidth = viewportWidth + gapPx;
    const offset = reviewIndex * pageWidth;
    reviewsTrack.style.transform = `translateX(-${offset}px)`;

    Array.from(reviewDotsContainer.children).forEach((dot, index) => {
      dot.classList.toggle("active", index === reviewIndex);
      dot.setAttribute(
        "aria-selected",
        index === reviewIndex ? "true" : "false",
      );
    });
  }

  function nextReview() {
    reviewIndex = (reviewIndex + 1) % getTotalPages();
    updateSlider();
  }

  function prevReview() {
    reviewIndex = (reviewIndex - 1 + getTotalPages()) % getTotalPages();
    updateSlider();
  }

  function startAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
    autoplayTimer = window.setInterval(() => {
      if (isPaused) return;
      nextReview();
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (!autoplayTimer) return;
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  reviewNext.addEventListener("click", () => {
    nextReview();
    restartAutoplay();
  });
  reviewPrev.addEventListener("click", () => {
    prevReview();
    restartAutoplay();
  });

  [reviewsViewport, reviewPrev, reviewNext, reviewDotsContainer].forEach(
    (el) => {
      el.addEventListener("mouseenter", () => {
        isPaused = true;
      });
      el.addEventListener("mouseleave", () => {
        isPaused = false;
      });
      el.addEventListener("focusin", () => {
        isPaused = true;
      });
      el.addEventListener("focusout", () => {
        isPaused = false;
      });
    },
  );

  window.addEventListener("resize", () => {
    buildDots();
    updateSlider();
    restartAutoplay();
  });

  buildDots();
  updateSlider();
  startAutoplay();
}

// ============================================================
// BOOT — global init, runs on DOMContentLoaded
// ============================================================
function boot() {
  // GLOBAL: Header / Navigation
  const header = document.getElementById("site-header");
  if (header) {
    initStickyHeader(header, {
      threshold: 40,
      progressSelector: ".site-header__progress",
    });
  }

  const mobileNav = document.querySelector(".mobile-nav");
  if (mobileNav) {
    initMobileNav(mobileNav, {
      toggleSelector: ".mobile-nav__toggle",
      menuSelector: ".mobile-nav__menu",
      overlaySelector: ".mobile-nav__overlay",
      openClass: "is-open",
    });
  }

  initSmoothScroll({
    selector: 'a[href^="#"]:not([href="#"])',
    offsetSelector: ".site-header",
  });

  initScrollReveal({
    selector: "[data-reveal]",
    activeClass: "is-visible",
    threshold: 0.15,
  });

  initParallax({
    selector: "[data-parallax]",
    cssVar: "--parallax-y",
    maxShift: 220,
  });

  // Section init order mirrors page layout:
  // 1) Hero
  initHeroMagicSlider();
  // 2) About
  initAboutProcess();
  // 3) Materials
  initMaterials();
  // 4) Testimonials
  initReviewsSlider();
  // 5) Collection — no custom JS (scroll-reveal + CSS hover only)
  // 6) Banner — no custom JS (CSS fixed background)
  // 7) Services — no custom JS (scroll-reveal only)
  // 8) FAQ
  const faq = document.querySelector(".faq__list");
  if (faq) {
    initFaqAccordion(faq, {
      triggerSelector: ".faq__trigger",
      closeOthers: true,
    });
  }

  // 9) Contact form
  const form = document.querySelector("[data-validate]");
  if (form) {
    initFormValidation(form, {
      successSelector: ".contact-form__success",
      invalidClass: "form-field__input--invalid",
      errorSelector: ".form-field__error",
    });
  }

  // 10) Footer — no custom JS required
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
