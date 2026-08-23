// ================================
// GARAGE 63
// Main JavaScript
// ================================

let mode = "showcase";
let apiEndpoint = null;
let contacts = {
  phoneHref: null,
  telegramHref: null,
};

function configureContactLinks() {
  const phoneLinks = document.querySelectorAll('[data-contact-link="phone"]');
  const telegramLinks = document.querySelectorAll('[data-contact-link="telegram"]');
  const phoneHref = typeof contacts.phoneHref === "string" && /^tel:\S+$/i.test(contacts.phoneHref.trim())
    ? contacts.phoneHref.trim()
    : null;
  let telegramHref = null;

  if (typeof contacts.telegramHref === "string") {
    try {
      const url = new URL(contacts.telegramHref.trim());
      if (url.protocol === "https:") telegramHref = url.href;
    } catch (error) {
      telegramHref = null;
    }
  }

  phoneLinks.forEach((link) => {
    link.removeAttribute("href");
    if (mode === "production" && phoneHref) link.setAttribute("href", phoneHref);
  });

  telegramLinks.forEach((link) => {
    link.removeAttribute("href");
    link.removeAttribute("target");
    if (mode === "production" && telegramHref) {
      link.setAttribute("href", telegramHref);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

async function loadSiteConfig() {
  try {
    const response = await fetch("./site.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const config = await response.json();
    if (config.title) document.title = config.title;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && config.description) descMeta.setAttribute('content', config.description);
    if (config.accentColor) document.documentElement.style.setProperty('--accent', config.accentColor);
    if (config.backgroundColor) document.documentElement.style.setProperty('--black', config.backgroundColor);
    mode = config.mode === "production" ? "production" : "showcase";
    apiEndpoint = mode === "production" ? config.apiEndpoint : null;
    contacts = {
      phoneHref: config.contacts?.phoneHref ?? null,
      telegramHref: config.contacts?.telegramHref ?? null,
    };
  } catch (error) {
    mode = "showcase";
    apiEndpoint = null;
    contacts = {
      phoneHref: null,
      telegramHref: null,
    };
    console.warn('Failed to load site.json:', error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSiteConfig();
  configureContactLinks();

  // ================================
  // HAMBURGER MENU
  // ================================

  const hamburger = document.querySelector(".hamburger");
  const navigation = document.querySelector(".navigation");

  if (hamburger && navigation) {
    const toggleMenu = () => {
      const isOpen = navigation.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
      hamburger.setAttribute(
        "aria-label",
        isOpen ? "Закрыть меню" : "Открыть меню",
      );
    };

    hamburger.addEventListener("click", toggleMenu);

    // Close menu when clicking a link
    navigation.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navigation.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Открыть меню");
      }
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navigation.classList.contains("open")) {
        navigation.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Открыть меню");
        hamburger.focus();
      }
    });

    // Reset menu on resize to desktop width
    const handleResize = () => {
      if (window.innerWidth > 1000 && navigation.classList.contains("open")) {
        navigation.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Открыть меню");
      }
    };
    window.addEventListener("resize", handleResize);
    // Also handle orientation change on mobile
    window.addEventListener("orientationchange", handleResize);
  }

  // ================================
  // CONTACT FORM
  // ================================

  const form = document.querySelector("#contactForm");
  const status = document.querySelector("#formStatus");
  // ================================
  // PHONE FORMAT
  // ================================

  const phoneInput = document.querySelector("#phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let digits = phoneInput.value.replace(/\D/g, "");

      // Если пользователь начинает с 8
      if (digits.startsWith("8")) {
        digits = "7" + digits.slice(1);
      }

      // Разрешаем только российский номер
      if (!digits.startsWith("7")) {
        digits = "7" + digits;
      }

      // Максимум 11 цифр
      digits = digits.slice(0, 11);

      let formatted = "+7";

      if (digits.length > 1) {
        formatted += " (" + digits.slice(1, 4);
      }

      if (digits.length >= 4) {
        formatted += ")";
      }

      if (digits.length > 4) {
        formatted += " " + digits.slice(4, 7);
      }

      if (digits.length > 7) {
        formatted += "-" + digits.slice(7, 9);
      }

      if (digits.length > 9) {
        formatted += "-" + digits.slice(9, 11);
      }

      phoneInput.value = formatted;
    });
  }
  if (form) {
    const submitButton = form.querySelector(".form-submit");
    const submitButtonText = submitButton.textContent.trim();
    let isSubmitting = false;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const name = document.querySelector("#name").value.trim();
      const phone = document.querySelector("#phone").value.trim();
      const service = document.querySelector("#service").value;
      const message = document.querySelector("#message").value.trim();
      const website = document.querySelector("#website")?.value.trim() ?? "";
      // Проверяем телефон
      const phoneDigits = phone.replace(/\D/g, "");

      if (!/^[78]\d{10}$/.test(phoneDigits)) {
        status.textContent = "Введите корректный номер телефона из 11 цифр.";

        return;
      }

      if (!name || !phone) {
        status.textContent = "Пожалуйста, заполните имя и телефон.";

        return;
      }

      if (mode !== "production") {
        status.textContent = "Демонстрационная форма — данные не отправлены.";

        return;
      }

      let endpointUrl;

      try {
        endpointUrl = new URL(apiEndpoint);
      } catch (error) {
        endpointUrl = null;
      }

      if (
        typeof apiEndpoint !== "string" ||
        apiEndpoint.trim() === "" ||
        !endpointUrl ||
        endpointUrl.protocol !== "https:"
      ) {
        status.textContent =
          "Форма временно недоступна. Свяжитесь с нами другим способом.";

        return;
      }

      isSubmitting = true;
      submitButton.disabled = true;
      submitButton.textContent = "ОТПРАВЛЯЕМ...";
      status.textContent = "Отправляем заявку...";

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch(
          apiEndpoint,
          {
            method: "POST",
            signal: controller.signal,

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name,
              phone,
              service,
              message,
              website,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        status.textContent = "Заявка отправлена! Мы свяжемся с вами.";

        form.reset();
      } catch (error) {
        if (error.name === "AbortError") {
          status.textContent =
            "Сервер не ответил вовремя. Попробуйте отправить заявку ещё раз.";
        } else {
          console.error(error);

          status.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
        }
      } finally {
        window.clearTimeout(timeoutId);
        isSubmitting = false;
        submitButton.disabled = false;
        submitButton.textContent = submitButtonText;
      }
    });
  }
});
