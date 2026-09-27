/**
 * Lightbox
 * Gallery modal with prev/next navigation, keyboard support (Escape,
 * ArrowLeft/Right), focus trap, and ARIA management.
 *
 * HTML: Each trigger needs `data-lightbox-src` (full image) and optional
 * `data-lightbox-caption`. A shared modal element is required:
 *
 *   <div id="lightbox-modal" class="lightbox" hidden aria-hidden="true">
 *     <div class="lightbox__backdrop" data-lightbox-close></div>
 *     <img class="lightbox__image" />
 *     <p class="lightbox__caption"></p>
 *     <button class="lightbox__close" data-lightbox-close>×</button>
 *     <button class="lightbox__prev">‹</button>
 *     <button class="lightbox__next">›</button>
 *   </div>
 *
 * @param {Object} [config]
 * @param {string} [config.triggerSelector="[data-lightbox-src]"]
 * @param {string} [config.modalSelector=".lightbox"]
 * @param {string} [config.imageSelector=".lightbox__image"]
 * @param {string} [config.captionSelector=".lightbox__caption"]
 * @param {string} [config.closeSelector="[data-lightbox-close]"]
 * @param {string} [config.prevSelector=".lightbox__prev"]
 * @param {string} [config.nextSelector=".lightbox__next"]
 * @returns {{ destroy: Function }}
 */
export function initLightbox(config = {}) {
  const cfg = {
    triggerSelector: "[data-lightbox-src]",
    modalSelector: ".lightbox",
    imageSelector: ".lightbox__image",
    captionSelector: ".lightbox__caption",
    closeSelector: "[data-lightbox-close]",
    prevSelector: ".lightbox__prev",
    nextSelector: ".lightbox__next",
    ...config,
  };

  const triggers = Array.from(document.querySelectorAll(cfg.triggerSelector));
  const modal = document.querySelector(cfg.modalSelector);
  if (!triggers.length || !modal) return { destroy() {} };

  const image = modal.querySelector(cfg.imageSelector);
  const caption = modal.querySelector(cfg.captionSelector);
  const closeEls = modal.querySelectorAll(cfg.closeSelector);
  const prevBtn = modal.querySelector(cfg.prevSelector);
  const nextBtn = modal.querySelector(cfg.nextSelector);

  let currentIdx = 0;
  let lastFocused = null;

  function loadImage(i) {
    currentIdx = ((i % triggers.length) + triggers.length) % triggers.length;
    const trigger = triggers[currentIdx];
    if (image) {
      image.setAttribute("src", trigger.dataset.lightboxSrc);
      const triggerImg = trigger.querySelector("img");
      image.setAttribute("alt", triggerImg ? triggerImg.alt : "");
    }
    if (caption) {
      caption.textContent = trigger.dataset.lightboxCaption || "";
    }
  }

  function openModal(i) {
    lastFocused = document.activeElement;
    loadImage(i);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus the close button
    const focusTarget = modal.querySelector(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusTarget) focusTarget.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function trapFocus(e) {
    const focusable = Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleKeydown(e) {
    if (modal.hidden) return;
    switch (e.key) {
      case "Escape":
        closeModal();
        break;
      case "ArrowLeft":
        loadImage(currentIdx - 1);
        break;
      case "ArrowRight":
        loadImage(currentIdx + 1);
        break;
      case "Tab":
        trapFocus(e);
        break;
    }
  }

  // Bind triggers
  triggers.forEach((trigger, i) => {
    trigger.addEventListener("click", () => openModal(i));
  });

  // Bind modal controls
  closeEls.forEach((el) => el.addEventListener("click", closeModal));
  if (prevBtn)
    prevBtn.addEventListener("click", () => loadImage(currentIdx - 1));
  if (nextBtn)
    nextBtn.addEventListener("click", () => loadImage(currentIdx + 1));
  document.addEventListener("keydown", handleKeydown);

  return {
    open: openModal,
    close: closeModal,
    destroy() {
      document.removeEventListener("keydown", handleKeydown);
    },
  };
}
