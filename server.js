const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "GARAGE 63 API работает",
  });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, phone, service, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Имя и телефон обязательны",
      });
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (!/^[78]\d{10}$/.test(phoneDigits)) {
      return res.status(400).json({
        success: false,
        message: "Некорректный номер телефона",
      });
    }

    const text = `
🚗 НОВАЯ ЗАЯВКА — GARAGE 63

👤 Имя: ${name}
📞 Телефон: ${phone}
🔧 Услуга: ${service || "Не указана"}

💬 Комментарий:
${message || "Нет комментария"}
        `;

    const telegramUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        chat_id: process.env.CHAT_ID,
        text: text,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error(data);

      return res.status(500).json({
        success: false,
        message: "Не удалось отправить заявку",
      });
    }

    res.json({
      success: true,
      message: "Заявка успешно отправлена",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Ошибка сервера",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`GARAGE 63 API запущен на порту ${PORT}`);
});
