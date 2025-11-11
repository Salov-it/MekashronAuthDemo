import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
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
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
});

// Healthcheck
app.get("/", (req, res) => res.send("✅ Mekashron proxy is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy running on port ${PORT}`));
