const corsHeaders = {
  "Access-Control-Allow-Origin": "https://rdk001.github.io",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // Проверяем сервер
    if (request.method === "GET" && url.pathname === "/") {
      return jsonResponse({
        status: "ok",
        message: "GARAGE 63 API работает",
      });
    }

    // Только POST /api/contact
    if (request.method !== "POST" || url.pathname !== "/api/contact") {
      return jsonResponse(
        {
          success: false,
          message: "Not found",
        },
        404,
      );
    }

    try {
      if (!env.BOT_TOKEN || !env.CHAT_ID) {
        console.error("Missing Telegram secrets:", {
          botTokenExists: Boolean(env.BOT_TOKEN),
          chatIdExists: Boolean(env.CHAT_ID),
        });

        return jsonResponse(
          {
            success: false,
            message: "Telegram настройки не настроены",
          },
          500,
        );
      }
      const body = await request.json();

      const { name, phone, service, message } = body;

      // Проверяем имя и телефон
      if (!name || !phone) {
        return jsonResponse(
          {
            success: false,
            message: "Имя и телефон обязательны",
          },
          400,
        );
      }

      // Проверяем российский номер
      const phoneDigits = phone.replace(/\D/g, "");

      if (!/^[78]\d{10}$/.test(phoneDigits)) {
        return jsonResponse(
          {
            success: false,
            message: "Некорректный номер телефона",
          },
          400,
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

        return jsonResponse(
          {
            success: false,
            message: "Ошибка отправки в Telegram",
          },
          500,
        );
      }

      return jsonResponse({
        success: true,
        message: "Заявка успешно отправлена",
      });
    } catch (error) {
      console.error(error);

      return jsonResponse(
        {
          success: false,
          message: "Ошибка сервера",
        },
        500,
      );
    }
  },
};
