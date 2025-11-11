import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ✅ Разрешаем CORS для всех источников
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// ✅ Обработка preflight (OPTIONS-запросов)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// ✅ Middleware для чтения текстового тела
app.use(express.text({ type: "*/*" }));

// 🔹 Прокси endpoint
app.post("/api/login", async (req, res) => {
  try {
    const response = await fetch("http://isapi.mekashron.com/icu-tech/icutech-test.dll/soap/IICUTech", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "urn:ICUTech.Intf-IICUTech#login"
      },
      body: req.body
    });

    const text = await response.text();
    res.set("Content-Type", "text/xml");
    // ✅ Добавляем CORS заголовки в ответ
    res.set("Access-Control-Allow-Origin", "*");
    res.send(text);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).send("Proxy error");
  }
});

// Healthcheck
app.get("/", (req, res) => res.send("✅ Mekashron proxy is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
