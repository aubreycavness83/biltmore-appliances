/**
 * Parallax
 * CSS-variable-driven parallax via scroll position. Respects reduced motion.
 *
 * HTML: <div data-parallax data-parallax-speed="0.3">…</div>
 *
 * Writes a `--parallax-y` CSS variable to each element for use in transforms:
 *   transform: translate3d(0, var(--parallax-y), 0);
 *
 * @param {Object} [config]
 * @param {string} [config.selector="[data-parallax]"]
 * @param {number} [config.speed=0.3] - Default speed factor (0–1).
 * @param {string} [config.cssVar="--parallax-y"]
 * @param {number} [config.maxShift=200] - Max shift in px.
 * @returns {{ destroy: Function }}
 */
export function initParallax(config = {}) {
  const cfg = {
    selector: "[data-parallax]",
    speed: 0.3,
    cssVar: "--parallax-y",
    maxShift: 200,
    ...config,
  };

  const elements = document.querySelectorAll(cfg.selector);
  if (!elements.length) return { destroy() {} };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) {
    elements.forEach((el) => el.style.setProperty(cfg.cssVar, "0px"));
    return { destroy() {} };
  }

  let ticking = false;

  function update() {
    const vh = window.innerHeight;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallaxSpeed) || cfg.speed;

      // Calculate progress: 0 when element enters bottom, 1 when exits top
      const progress = 1 - (rect.top + rect.height) / (vh + rect.height);
      const shift = Math.max(
        -cfg.maxShift,
        Math.min(cfg.maxShift, (progress - 0.5) * 2 * cfg.maxShift * speed),
      );

      el.style.setProperty(cfg.cssVar, `${shift}px`);
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);

  return {
    destroy() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    },
  };
}
