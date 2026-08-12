export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Проверяем сервер
    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({
        status: "ok",
        message: "GARAGE 63 API работает",
      });
    }

    // Только POST /api/contact
    if (request.method !== "POST" || url.pathname !== "/api/contact") {
      return Response.json(
        {
          success: false,
          message: "Not found",
        },
        { status: 404 },
      );
    }

    try {
      const body = await request.json();

      const { name, phone, service, message } = body;

      // Проверяем имя и телефон

      if (!name || !phone) {
        return Response.json(
          {
            success: false,
            message: "Имя и телефон обязательны",
          },
          { status: 400 },
        );
      }

      // Проверяем российский номер

      const phoneDigits = phone.replace(/\D/g, "");

      if (!/^[78]\d{10}$/.test(phoneDigits)) {
        return Response.json(
          {
            success: false,
            message: "Некорректный номер телефона",
          },
          { status: 400 },
        );
      }

      // Формируем сообщение Telegram

      const text = `
🚗 НОВАЯ ЗАЯВКА — GARAGE 63

👤 Имя: ${name}
📞 Телефон: ${phone}
🔧 Услуга: ${service || "Не указана"}

💬 Комментарий:
${message || "Нет комментария"}
            `;

      // Отправляем в Telegram

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            chat_id: env.CHAT_ID,
            text: text,
          }),
        },
      );

      const telegramData = await telegramResponse.json();

      if (!telegramData.ok) {
        console.error(telegramData);

        return Response.json(
          {
            success: false,
            message: "Ошибка отправки в Telegram",
          },
          { status: 500 },
        );
      }

      return Response.json({
        success: true,
        message: "Заявка успешно отправлена",
      });
    } catch (error) {
      console.error(error);

      return Response.json(
        {
          success: false,
          message: "Ошибка сервера",
        },
        { status: 500 },
      );
    }
  },
};
