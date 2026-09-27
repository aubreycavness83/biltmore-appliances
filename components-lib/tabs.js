/**
 * Tabs
 * ARIA-compliant tab panel with roving tabindex, arrow key navigation,
 * Home/End support, optional enter/leave animation classes, and
 * optional image swap via data attributes.
 *
 * HTML:
 *   <button role="tab" data-tab="key" aria-controls="panel-id">…</button>
 *   <div role="tabpanel" id="panel-id" data-tab-panel="key">…</div>
 *   <img data-tab-image="key" /> (optional)
 *
 * @param {HTMLElement} root - Container holding tabs + panels.
 * @param {Object} [config]
 * @param {string} [config.tabSelector='[role="tab"]']
 * @param {string} [config.panelSelector='[role="tabpanel"]']
 * @param {string} [config.imageSelector="[data-tab-image]"]
 * @param {string} [config.activeClass="is-active"]
 * @param {boolean} [config.animate=false] - Use enter/leave classes.
 * @param {number} [config.animationMs=450] - Duration of enter/leave transition.
 * @param {string} [config.enterClass="is-entering"]
 * @param {string} [config.leaveClass="is-leaving"]
 * @returns {{ destroy: Function, activate: Function }}
 */
export function initTabs(root, config = {}) {
  const cfg = {
    tabSelector: '[role="tab"]',
    panelSelector: '[role="tabpanel"]',
    imageSelector: "[data-tab-image]",
    activeClass: "is-active",
    animate: false,
    animationMs: 450,
    enterClass: "is-entering",
    leaveClass: "is-leaving",
    ...config,
  };

  const tabs = Array.from(root.querySelectorAll(cfg.tabSelector));
  const panels = Array.from(root.querySelectorAll(cfg.panelSelector));
  const images = Array.from(root.querySelectorAll(cfg.imageSelector));

  if (!tabs.length) return { destroy() {}, activate() {} };

  let isAnimating = false;

  function getKey(tab) {
    return tab.dataset.tab || tab.getAttribute("aria-controls") || "";
  }

  function activate(key) {
    if (isAnimating) return;

    const currentPanel = panels.find((p) => !p.hidden);
    const nextPanel = panels.find((p) => (p.dataset.tabPanel || p.id) === key);

    // Update tabs
    tabs.forEach((tab) => {
      const active = getKey(tab) === key;
      tab.classList.toggle(cfg.activeClass, active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    // Update images
    images.forEach((img) => {
      const active = img.dataset.tabImage === key;
      img.classList.toggle(cfg.activeClass, active);
    });

    // Update panels with optional animation
    if (
      cfg.animate &&
      currentPanel &&
      nextPanel &&
      currentPanel !== nextPanel
    ) {
      isAnimating = true;
      nextPanel.hidden = false;
      nextPanel.classList.add(cfg.activeClass, cfg.enterClass);
      currentPanel.classList.add(cfg.leaveClass);

      setTimeout(() => {
        panels.forEach((p) => {
          if (p !== nextPanel) {
            p.classList.remove(cfg.activeClass, cfg.leaveClass, cfg.enterClass);
            p.hidden = true;
          }
        });
        nextPanel.classList.remove(cfg.enterClass);
        isAnimating = false;
      }, cfg.animationMs);
    } else {
      panels.forEach((p) => {
        const active = (p.dataset.tabPanel || p.id) === key;
        p.classList.toggle(cfg.activeClass, active);
        p.hidden = !active;
      });
    }
  }

  function handleClick(e) {
    activate(getKey(e.currentTarget));
  }

  function handleKeydown(e) {
    const idx = tabs.indexOf(e.currentTarget);
    let nextIdx = idx;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        nextIdx = (idx + 1) % tabs.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        e.preventDefault();
        nextIdx = 0;
        break;
      case "End":
        e.preventDefault();
        nextIdx = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIdx];
    nextTab.focus();
    activate(getKey(nextTab));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", handleClick);
    tab.addEventListener("keydown", handleKeydown);
  });

  return {
    activate,
    destroy() {
      tabs.forEach((tab) => {
        tab.removeEventListener("click", handleClick);
        tab.removeEventListener("keydown", handleKeydown);
      });
    },
  };
}
