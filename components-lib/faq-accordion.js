/**
 * FAQ Accordion
 * Accessible accordion using aria-expanded / aria-controls with
 * optional close-others behavior and keyboard support.
 *
 * HTML: Each trigger button needs `aria-controls="answer-id"` pointing
 * to the answer element's `id`. The answer should have `hidden` by default.
 *
 * @param {HTMLElement} root - Container holding all FAQ items.
 * @param {Object} [config]
 * @param {string} [config.triggerSelector=".faq__trigger"]
 * @param {boolean} [config.closeOthers=true] - Close sibling items when one opens.
 * @returns {{ destroy: Function }}
 */
export function initFaqAccordion(root, config = {}) {
  const cfg = {
    triggerSelector: ".faq__trigger",
    closeOthers: true,
    ...config,
  };

  const triggers = Array.from(root.querySelectorAll(cfg.triggerSelector));
  if (!triggers.length) return { destroy() {} };

  function toggle(trigger) {
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";
    const answerId = trigger.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;

    if (cfg.closeOthers) {
      triggers.forEach((t) => {
        t.setAttribute("aria-expanded", "false");
        const id = t.getAttribute("aria-controls");
        const el = id ? document.getElementById(id) : null;
        if (el) el.setAttribute("hidden", "");
      });
    }

    if (!isExpanded && answer) {
      trigger.setAttribute("aria-expanded", "true");
      answer.removeAttribute("hidden");
    } else if (isExpanded && answer) {
      trigger.setAttribute("aria-expanded", "false");
      answer.setAttribute("hidden", "");
    }
  }

  function handleClick(e) {
    const trigger = e.currentTarget;
    toggle(trigger);
  }

  function handleKeydown(e) {
    const trigger = e.currentTarget;
    const idx = triggers.indexOf(trigger);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        triggers[(idx + 1) % triggers.length].focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        triggers[(idx - 1 + triggers.length) % triggers.length].focus();
        break;
      case "Home":
        e.preventDefault();
        triggers[0].focus();
        break;
      case "End":
        e.preventDefault();
        triggers[triggers.length - 1].focus();
        break;
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", handleClick);
    trigger.addEventListener("keydown", handleKeydown);
  });

  return {
    destroy() {
      triggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleClick);
        trigger.removeEventListener("keydown", handleKeydown);
      });
    },
  };
}
