import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ✅ Полная настройка CORS — включая SOAPAction
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "SOAPAction"],
}));

// ✅ Обработка preflight (OPTIONS-запросов)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, SOAPAction");
  res.sendStatus(200);
});

// ✅ Middleware для чтения XML-тела как текста
app.use(express.text({ type: "*/*" }));

// 🔹 Прокси endpoint для SOAP Login
app.post("/api/login", async (req, res) => {
  try {
    const response = await fetch(
      "http://isapi.mekashron.com/icu-tech/icutech-test.dll/soap/IICUTech",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "urn:ICUTech.Intf-IICUTech#login",
        },
        body: req.body,
      }
    );

    const text = await response.text();

    // ✅ Возвращаем XML-ответ с нужными CORS-заголовками
    res.set({
      "Content-Type": "text/xml",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, SOAPAction",
    });

    res.send(text);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).send("Proxy error");
  }
});

// Healthcheck
app.get("/", (req, res) => res.send("✅ Mekashron proxy is running"));

// 🔸 Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
