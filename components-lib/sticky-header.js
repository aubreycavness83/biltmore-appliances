/**
 * Sticky Header
 * Adds a scroll class after a threshold, with optional reading progress bar.
 *
 * @param {HTMLElement} root - The header element.
 * @param {Object} [config]
 * @param {number} [config.threshold=60] - Scroll distance in px to trigger.
 * @param {string} [config.scrolledClass="is-scrolled"]
 * @param {string} [config.progressSelector=null] - Selector for a progress bar element.
 * @returns {{ destroy: Function }}
 */
export function initStickyHeader(root, config = {}) {
  const cfg = {
    threshold: 60,
    scrolledClass: "is-scrolled",
    progressSelector: null,
    ...config,
  };

  const progressBar = cfg.progressSelector
    ? root.querySelector(cfg.progressSelector)
    : null;

  function update() {
    const scrolled = window.scrollY > cfg.threshold;
    root.classList.toggle(cfg.scrolledClass, scrolled);

    if (progressBar) {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0
          ? Math.min(Math.max((window.scrollY / scrollable) * 100, 0), 100)
          : 0;
      progressBar.style.width = `${progress}%`;
    }
  }

  update();
  window.addEventListener("scroll", update, { passive: true });

  return {
    destroy() {
      window.removeEventListener("scroll", update);
    },
  };
}
