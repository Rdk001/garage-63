// ================================
// GARAGE 63
// Main JavaScript
// ================================

let apiEndpoint = "https://garage-63-api.rmaslenchenko95.workers.dev/api/contact";

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
    if (config.apiEndpoint) apiEndpoint = config.apiEndpoint;
  } catch (error) {
    console.warn('Failed to load site.json:', error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("GARAGE 63 — сайт загружен");
  loadSiteConfig();

  // ================================
  // SMOOTH SCROLL
  // ================================

  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // ================================
  // HAMBURGER MENU
  // ================================

  const hamburger = document.querySelector(".hamburger");
  const navigation = document.querySelector(".navigation");

  if (hamburger && navigation) {
    const toggleMenu = () => {
      const isOpen = navigation.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
    };

    hamburger.addEventListener("click", toggleMenu);

    // Close menu when clicking a link
    navigation.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navigation.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navigation.classList.contains("open")) {
        navigation.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });

    // Reset menu on resize to desktop width
    const handleResize = () => {
      if (window.innerWidth > 1000 && navigation.classList.contains("open")) {
        navigation.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    };
    window.addEventListener("resize", handleResize);
    // Also handle orientation change on mobile
    window.addEventListener("orientationchange", handleResize);
  }

  // ================================
  // CONTACT FORM
  // ================================

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
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.querySelector("#name").value.trim();
      const phone = document.querySelector("#phone").value.trim();
      const service = document.querySelector("#service").value;
      const message = document.querySelector("#message").value.trim();
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

      status.textContent = "Отправляем заявку...";

      try {
        const response = await fetch(
          apiEndpoint,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name,
              phone,
              service,
              message,
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
        console.error(error);

        status.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
      }
    });
  }
});
