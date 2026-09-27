/**
 * Scroll Reveal
 * Reveals elements as they enter the viewport using IntersectionObserver.
 * Supports staggered delays, reduced motion fallback, and one-shot unobserve.
 *
 * HTML: Add `data-reveal` to any element. Optional `data-reveal-delay="200"`
 * for explicit delay, or let stagger auto-calculate.
 *
 * @param {Object} [config]
 * @param {string} [config.selector="[data-reveal]"]
 * @param {string} [config.activeClass="is-visible"]
 * @param {number} [config.threshold=0.18]
 * @param {string} [config.rootMargin="0px 0px -12% 0px"]
 * @param {boolean} [config.stagger=true]
 * @param {number} [config.staggerStep=70] - Delay increment per element in ms.
 * @param {number} [config.staggerMax=560] - Max stagger delay in ms.
 * @param {boolean} [config.once=true] - Unobserve after revealing.
 * @returns {{ destroy: Function }}
 */
export function initScrollReveal(config = {}) {
  const cfg = {
    selector: "[data-reveal]",
    activeClass: "is-visible",
    threshold: 0.18,
    rootMargin: "0px 0px -12% 0px",
    stagger: true,
    staggerStep: 70,
    staggerMax: 560,
    once: true,
    ...config,
  };

  const items = document.querySelectorAll(cfg.selector);
  if (!items.length) return { destroy() {} };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Reduced motion: show everything immediately
  if (reducedMotion) {
    items.forEach((item) => item.classList.add(cfg.activeClass));
    return { destroy() {} };
  }

  // Apply stagger delays
  if (cfg.stagger) {
    items.forEach((item, i) => {
      const explicit = item.dataset.revealDelay;
      const delay = explicit
        ? `${explicit}ms`
        : `${Math.min(i * cfg.staggerStep, cfg.staggerMax)}ms`;
      item.style.transitionDelay = delay;
    });
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(cfg.activeClass);
        if (cfg.once) obs.unobserve(entry.target);
      });
    },
    {
      threshold: cfg.threshold,
      rootMargin: cfg.rootMargin,
    },
  );

  items.forEach((item) => observer.observe(item));

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
