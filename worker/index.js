const MAX_LENGTHS = {
  name: 100,
  service: 200,
  message: 2000,
};

const TELEGRAM_TIMEOUT_MS = 10000;

function getAllowedOrigin(request, env) {
  const origin = request.headers.get("Origin");

  if (!origin || !env.ALLOWED_ORIGINS) {
    return null;
  }

  const allowedOrigins = env.ALLOWED_ORIGINS.split(",").flatMap((allowedOrigin) => {
    try {
      const url = new URL(allowedOrigin.trim());

      return url.protocol === "https:" && url.pathname === "/" && !url.search && !url.hash
        ? [url.origin]
        : [];
    } catch {
      return [];
    }
  });

  return allowedOrigins.includes(origin) ? origin : null;
}

function getCorsHeaders(request, env) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  const allowedOrigin = getAllowedOrigin(request, env);

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
}

function jsonResponse(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...getCorsHeaders(request, env),
    },
  });
}

function errorResponse(request, env, message, status) {
  return jsonResponse(
    request,
    env,
    {
      success: false,
      message,
    },
    status,
  );
}

function getTrimmedString(body, field, required = false) {
  const value = body[field];

  if (value === undefined || value === null) {
    return required ? null : "";
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (required && !trimmedValue) {
    return null;
  }

  return trimmedValue;
}

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request, env),
    });
  }

  // Проверяем сервер
  if (request.method === "GET" && url.pathname === "/") {
    return jsonResponse(request, env, {
      status: "ok",
      message: "GARAGE 63 API работает",
    });
  }

  // Только POST /api/contact
  if (request.method !== "POST" || url.pathname !== "/api/contact") {
    return errorResponse(request, env, "Not found", 404);
  }

  const contentType = request.headers.get("Content-Type");

    if (!contentType || contentType.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
      return errorResponse(request, env, "Content-Type должен быть application/json", 415);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return errorResponse(request, env, "Некорректный JSON", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(request, env, "Тело запроса должно быть объектом", 400);
    }

    const name = getTrimmedString(body, "name", true);
    const phone = getTrimmedString(body, "phone", true);
    const service = getTrimmedString(body, "service");
    const message = getTrimmedString(body, "message");
    const website = getTrimmedString(body, "website");

    if (name === null || phone === null) {
      return errorResponse(request, env, "Имя и телефон обязательны", 400);
    }

    if (service === null || message === null || website === null) {
      return errorResponse(request, env, "Поля должны содержать строки", 400);
    }

    if (website) {
      return jsonResponse(request, env, {
        success: true,
        message: "Заявка успешно отправлена",
      });
    }

    if (
      name.length > MAX_LENGTHS.name ||
      service.length > MAX_LENGTHS.service ||
      message.length > MAX_LENGTHS.message
    ) {
      return errorResponse(request, env, "Превышена допустимая длина поля", 400);
    }

    // Проверяем российский номер
    const phoneDigits = phone.replace(/\D/g, "");

    if (!/^[78]\d{10}$/.test(phoneDigits)) {
      return errorResponse(request, env, "Некорректный номер телефона", 400);
    }

    if (!env.BOT_TOKEN || !env.CHAT_ID) {
      console.error("Telegram bindings are not configured");
      return errorResponse(request, env, "Ошибка сервера", 500);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

    try {
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
            text,
          }),
          signal: controller.signal,
        },
      );

      if (!telegramResponse.ok) {
        console.error("Telegram API returned a non-success status");
        return errorResponse(request, env, "Не удалось отправить заявку", 502);
      }

      let telegramData;

      try {
        telegramData = await telegramResponse.json();
      } catch {
        console.error("Telegram API returned invalid JSON");
        return errorResponse(request, env, "Не удалось отправить заявку", 502);
      }

      if (!telegramData || telegramData.ok !== true) {
        console.error("Telegram API rejected the message");
        return errorResponse(request, env, "Не удалось отправить заявку", 502);
      }

      return jsonResponse(request, env, {
        success: true,
        message: "Заявка успешно отправлена",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Telegram API request timed out");
        return errorResponse(request, env, "Не удалось отправить заявку", 504);
      }

      console.error("Telegram API request failed");
      return errorResponse(request, env, "Ошибка сервера", 500);
    } finally {
      clearTimeout(timeoutId);
    }
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch {
      console.error("Unexpected Worker error");
      return errorResponse(request, env, "Ошибка сервера", 500);
    }
  },
};
