/**
 * Mobile Navigation
 * Hamburger toggle with slide-out menu, overlay, body scroll lock,
 * Escape key close with focus return, ARIA attributes, and auto-close
 * on link click or window resize past breakpoint.
 *
 * @param {HTMLElement} root - Container holding toggle + menu.
 * @param {Object} [config]
 * @param {string} [config.toggleSelector=".mobile-nav__toggle"]
 * @param {string} [config.menuSelector=".mobile-nav__menu"]
 * @param {string} [config.overlaySelector=".mobile-nav__overlay"]
 * @param {string} [config.linkSelector=".mobile-nav__link"]
 * @param {string} [config.openClass="is-open"]
 * @param {number} [config.breakpoint=768] - Auto-close above this width.
 * @param {boolean} [config.lockBody=true]
 * @returns {{ destroy: Function }}
 */
export function initMobileNav(root, config = {}) {
  const cfg = {
    toggleSelector: ".mobile-nav__toggle",
    menuSelector: ".mobile-nav__menu",
    overlaySelector: ".mobile-nav__overlay",
    linkSelector: ".mobile-nav__link",
    openClass: "is-open",
    breakpoint: 768,
    lockBody: true,
    ...config,
  };

  const toggle = root.querySelector(cfg.toggleSelector);
  const menu = root.querySelector(cfg.menuSelector);
  const overlay = root.querySelector(cfg.overlaySelector);
  const links = root.querySelectorAll(cfg.linkSelector);

  if (!toggle || !menu) return { destroy() {} };

  function open() {
    menu.classList.add(cfg.openClass);
    toggle.classList.add(cfg.openClass);
    if (overlay) overlay.classList.add(cfg.openClass);
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    if (cfg.lockBody) document.body.style.overflow = "hidden";
  }

  function close() {
    menu.classList.remove(cfg.openClass);
    toggle.classList.remove(cfg.openClass);
    if (overlay) overlay.classList.remove(cfg.openClass);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    if (cfg.lockBody) document.body.style.overflow = "";
  }

  function isOpen() {
    return menu.classList.contains(cfg.openClass);
  }

  function handleToggle() {
    isOpen() ? close() : open();
  }

  function handleEscape(e) {
    if (e.key === "Escape" && isOpen()) {
      close();
      toggle.focus();
    }
  }

  function handleResize() {
    if (window.innerWidth > cfg.breakpoint && isOpen()) {
      close();
    }
  }

  function handleLinkClick() {
    close();
  }

  toggle.addEventListener("click", handleToggle);
  if (overlay) overlay.addEventListener("click", close);
  document.addEventListener("keydown", handleEscape);
  window.addEventListener("resize", handleResize);
  links.forEach((link) => link.addEventListener("click", handleLinkClick));

  // Set initial ARIA state
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open menu");

  return {
    open,
    close,
    destroy() {
      toggle.removeEventListener("click", handleToggle);
      if (overlay) overlay.removeEventListener("click", close);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
      links.forEach((link) =>
        link.removeEventListener("click", handleLinkClick),
      );
    },
  };
}
