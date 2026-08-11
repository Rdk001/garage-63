// ================================
// GARAGE 63
// Main JavaScript
// ================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("GARAGE 63 — сайт загружен");


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
                    behavior: "smooth"
                });

            }

        });

    });


    // ================================
    // CONTACT FORM
    // ================================

    const form = document.querySelector("#contactForm");

    const status = document.querySelector("#formStatus");


    if (form) {

        form.addEventListener("submit", (event) => {

            event.preventDefault();


            const name = document.querySelector("#name").value.trim();

            const phone = document.querySelector("#phone").value.trim();

            const service = document.querySelector("#service").value;

            const message = document.querySelector("#message").value.trim();


            if (!name || !phone) {

                status.textContent =
                    "Пожалуйста, заполните имя и телефон.";

                return;
            }


            console.log({
                name,
                phone,
                service,
                message
            });


            status.textContent =
                "Спасибо! Ваша заявка принята.";


            form.reset();

        });

    }

});
