/**
 * Counter
 * Animated count-up triggered by IntersectionObserver. Data-attribute
 * driven with configurable duration, easing, and suffix.
 *
 * HTML: <span data-counter="1200" data-counter-suffix="+">0</span>
 *
 * @param {Object} [config]
 * @param {string} [config.selector="[data-counter]"]
 * @param {number} [config.duration=2000] - Animation duration in ms.
 * @param {number} [config.threshold=0.6]
 * @param {string} [config.easing="easeOutQuart"] - "linear" or "easeOutQuart".
 * @returns {{ destroy: Function }}
 */
export function initCounter(config = {}) {
  const cfg = {
    selector: "[data-counter]",
    duration: 2000,
    threshold: 0.6,
    easing: "easeOutQuart",
    ...config,
  };

  const elements = document.querySelectorAll(cfg.selector);
  if (!elements.length) return { destroy() {} };

  function ease(t) {
    if (cfg.easing === "linear") return t;
    // easeOutQuart: 1 - (1 - t)^4
    return 1 - Math.pow(1 - t, 4);
  }

  function animate(el) {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.counterSuffix || "";
    const duration = parseInt(el.dataset.counterDuration, 10) || cfg.duration;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(ease(progress) * target);

      el.textContent = progress < 1 ? String(value) : `${target}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: cfg.threshold },
  );

  elements.forEach((el) => observer.observe(el));

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
