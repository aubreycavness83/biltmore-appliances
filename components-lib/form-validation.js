/**
 * Form Validation
 * Client-side inline validation with per-field error messages,
 * blur/input feedback, and submit handling. Supports required,
 * email, minlength, and custom validators.
 *
 * HTML:
 *   <form data-validate>
 *     <div class="form-field">
 *       <input class="form-field__input" required />
 *       <span class="form-field__error"></span>
 *     </div>
 *   </form>
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {Object} [config]
 * @param {string} [config.fieldSelector=".form-field"]
 * @param {string} [config.inputSelector=".form-field__input"]
 * @param {string} [config.errorSelector=".form-field__error"]
 * @param {string} [config.invalidClass="form-field__input--invalid"]
 * @param {Function} [config.onSubmit] - Callback receiving FormData on valid submit.
 * @param {Object} [config.validators] - Custom validators keyed by input name.
 *   Each is a function(value) => string (error msg) or "" (valid).
 * @returns {{ destroy: Function, validate: Function }}
 */
export function initFormValidation(form, config = {}) {
  const cfg = {
    fieldSelector: ".form-field",
    inputSelector: ".form-field__input",
    errorSelector: ".form-field__error",
    invalidClass: "form-field__input--invalid",
    onSubmit: null,
    validators: {},
    ...config,
  };

  if (!form)
    return {
      destroy() {},
      validate() {
        return false;
      },
    };

  const inputs = Array.from(form.querySelectorAll(cfg.inputSelector));

  function getError(input) {
    const value = input.value.trim();
    const name = input.name || "";

    // Custom validator first
    if (cfg.validators[name]) {
      const msg = cfg.validators[name](value, input);
      if (msg) return msg;
    }

    // Required
    if (input.required && !value) {
      return "This field is required.";
    }

    // Email pattern
    if (
      input.type === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      return "Please enter a valid email address.";
    }

    // Minlength
    const minLen = input.getAttribute("minlength");
    if (minLen && value && value.length < parseInt(minLen, 10)) {
      return `Must be at least ${minLen} characters.`;
    }

    return "";
  }

  function validateInput(input) {
    const field = input.closest(cfg.fieldSelector);
    const errorEl = field ? field.querySelector(cfg.errorSelector) : null;
    const msg = getError(input);

    if (errorEl) errorEl.textContent = msg;
    input.classList.toggle(cfg.invalidClass, msg !== "");
    return msg === "";
  }

  function validateAll() {
    let valid = true;
    inputs.forEach((input) => {
      if (!validateInput(input)) valid = false;
    });
    return valid;
  }

  function handleBlur(e) {
    validateInput(e.target);
  }

  function handleInput(e) {
    if (e.target.classList.contains(cfg.invalidClass)) {
      validateInput(e.target);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) {
      const first = form.querySelector(`.${cfg.invalidClass}`);
      if (first) first.focus();
      return;
    }

    if (cfg.onSubmit) {
      cfg.onSubmit(new FormData(form), form);
    }
  }

  inputs.forEach((input) => {
    input.addEventListener("blur", handleBlur);
    input.addEventListener("input", handleInput);
  });
  form.addEventListener("submit", handleSubmit);

  return {
    validate: validateAll,
    destroy() {
      inputs.forEach((input) => {
        input.removeEventListener("blur", handleBlur);
        input.removeEventListener("input", handleInput);
      });
      form.removeEventListener("submit", handleSubmit);
    },
  };
}
