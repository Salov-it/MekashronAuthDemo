document.getElementById("submitBtn").addEventListener("click", async () => {
  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();
  const resultDiv = document.getElementById("result");

  if (!login || !password) {
    resultDiv.innerHTML = '<div class="text-danger">Введите логин и пароль</div>';
    return;
  }

  resultDiv.innerHTML = '<div class="text-secondary">⏳ Авторизация...</div>';

  // 🧩 SOAP тело с корректным namespace
  const soapBody = `
    <?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <login xmlns="urn:ICUTech.Intf-IICUTech">
          <UserName>${login}</UserName>
          <Password>${password}</Password>
        </login>
      </soap:Body>
    </soap:Envelope>`;

  try {
    const response = await fetch("http://isapi.mekashron.com/icu-tech/icutech-test.dll/soap/IICUTech", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "urn:ICUTech.Intf-IICUTech#login"
      },
      body: soapBody
    });

    const xml = await response.text();
    console.log(xml);

    // 🧠 Извлекаем JSON внутри <return>...</return>
    const match = xml.match(/<return[^>]*>([\s\S]*?)<\/return>/i);
    if (!match) {
      resultDiv.innerHTML = '<div class="text-warning">⚠️ Неожиданный ответ сервера</div>';
      return;
    }

    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (e) {
      resultDiv.innerHTML = '<div class="text-warning">⚠️ Ошибка чтения данных</div>';
      return;
    }

    // ✅ Проверяем успешный вход
    if (data.EntityId && Number(data.EntityId) > 0) {
      const profileHtml = `
        <div class="text-success">✅ Вход выполнен успешно</div>
        <div class="mt-2 text-start small">
          <b>EntityId:</b> ${data.EntityId}<br/>
          <b>Email:</b> ${data.Email || ''}<br/>
          <b>Mobile:</b> ${data.Mobile || ''}<br/>
          <b>FTP:</b> ${data.FTPHost || ''}:${data.FTPPort || ''}
        </div>`;
      resultDiv.innerHTML = profileHtml;
    } else {
      resultDiv.innerHTML = `<div class="text-danger">❌ Ошибка входа: ${data.ResultMessage || 'Пользователь не найден'}</div>`;
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = '<div class="text-danger">❌ Ошибка запроса (возможно CORS)</div>';
  }
});
