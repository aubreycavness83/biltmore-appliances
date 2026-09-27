/**
 * Smooth Scroll
 * Smooth anchor scrolling with dynamic header offset and reduced motion fallback.
 *
 * @param {Object} [config]
 * @param {string} [config.selector='a[href^="#"]']
 * @param {string|HTMLElement} [config.header=null] - Header element or selector for offset.
 * @param {number} [config.offset=0] - Additional offset in px.
 * @returns {{ destroy: Function }}
 */
export function initSmoothScroll(config = {}) {
  const cfg = {
    selector: 'a[href^="#"]',
    header: null,
    offset: 0,
    ...config,
  };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const anchors = document.querySelectorAll(cfg.selector);

  function getHeaderHeight() {
    if (!cfg.header) return 0;
    const el =
      typeof cfg.header === "string"
        ? document.querySelector(cfg.header)
        : cfg.header;
    return el ? el.getBoundingClientRect().height : 0;
  }

  function handleClick(e) {
    const href = e.currentTarget.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      getHeaderHeight() -
      cfg.offset;

    window.scrollTo({
      top,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  anchors.forEach((a) => a.addEventListener("click", handleClick));

  return {
    destroy() {
      anchors.forEach((a) => a.removeEventListener("click", handleClick));
    },
  };
}
