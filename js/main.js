// ================================
// GARAGE 63
// Main JavaScript
// ================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("GARAGE 63 — сайт загружен");

    // Плавный переход к разделам сайта
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
});
