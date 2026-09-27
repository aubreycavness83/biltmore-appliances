/**
 * Card Slider
 * Responsive multi-card slider with translateX, arrow navigation,
 * disabled button states, CSS variable for visible count, and
 * resize handling.
 *
 * @param {HTMLElement} root - Slider container.
 * @param {Object} [config]
 * @param {string} [config.trackSelector=".card-slider__track"]
 * @param {string} [config.cardSelector=".card-slider__card"]
 * @param {string} [config.prevSelector=".card-slider__btn--prev"]
 * @param {string} [config.nextSelector=".card-slider__btn--next"]
 * @param {Object} [config.breakpoints] - { 0: 1, 576: 2, 768: 3, 992: 4 }
 * @returns {{ destroy: Function }}
 */
export function initCardSlider(root, config = {}) {
  const cfg = {
    trackSelector: ".card-slider__track",
    cardSelector: ".card-slider__card",
    prevSelector: ".card-slider__btn--prev",
    nextSelector: ".card-slider__btn--next",
    breakpoints: { 0: 1, 576: 2, 768: 3, 992: 4 },
    ...config,
  };

  const track = root.querySelector(cfg.trackSelector);
  const cards = Array.from(root.querySelectorAll(cfg.cardSelector));
  const prevBtn = root.querySelector(cfg.prevSelector);
  const nextBtn = root.querySelector(cfg.nextSelector);

  if (!track || !cards.length) return { destroy() {} };

  let index = 0;

  function calcVisible() {
    const w = window.innerWidth;
    let count = 1;
    const sorted = Object.keys(cfg.breakpoints)
      .map(Number)
      .sort((a, b) => a - b);

    for (const bp of sorted) {
      if (w >= bp) count = cfg.breakpoints[bp];
    }
    return count;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - calcVisible());
  }

  function getStepPx() {
    if (!cards.length) return 0;
    const cardW = cards[0].getBoundingClientRect().width;
    const gap =
      parseFloat(
        getComputedStyle(track).columnGap || getComputedStyle(track).gap,
      ) || 0;
    return cardW + gap;
  }

  function render() {
    const visible = calcVisible();
    root.style.setProperty("--visible-count", visible);

    const max = getMaxIndex();
    if (index > max) index = max;

    track.style.transform = `translateX(-${index * getStepPx()}px)`;

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index >= max;
  }

  function next() {
    index = Math.min(index + 1, getMaxIndex());
    render();
  }

  function prev() {
    index = Math.max(index - 1, 0);
    render();
  }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);
  window.addEventListener("resize", render);

  render();

  return {
    next,
    prev,
    destroy() {
      if (prevBtn) prevBtn.removeEventListener("click", prev);
      if (nextBtn) nextBtn.removeEventListener("click", next);
      window.removeEventListener("resize", render);
    },
  };
}
