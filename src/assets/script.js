document.getElementById("submitBtn").addEventListener("click", async () => {
  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();
  const resultDiv = document.getElementById("result");

  if (!login || !password) {
    resultDiv.innerHTML = '<div class="text-danger">Введите email и пароль</div>';
    return;
  }

  resultDiv.innerHTML = '<div class="text-secondary">⏳ Проверка данных...</div>';

  const soapBody = `
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <login xmlns="urn:ICUTech.Intf-IICUTech">
          <UserName>${login}</UserName>
          <Password>${password}</Password>
        </login>
      </soap:Body>
    </soap:Envelope>`;

  try {
    const response = await fetch("https://mekashronauthdemo.onrender.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "urn:ICUTech.Intf-IICUTech#login"
      },
      body: soapBody
    });

    const xml = await response.text();
    const match = xml.match(/<return[^>]*>([\s\S]*?)<\/return>/i);
    if (!match) {
      resultDiv.innerHTML = '<div class="text-warning">⚠️ Неожиданный ответ сервера</div>';
      return;
    }

    let data;
    try {
      data = JSON.parse(match[1]);
    } catch {
      resultDiv.innerHTML = '<div class="text-warning">⚠️ Ошибка парсинга данных</div>';
      return;
    }

    if (data.EntityId && Number(data.EntityId) > 0) {
      resultDiv.innerHTML = `
        <div class="text-success fw-bold mb-2">✅ Вход выполнен успешно</div>
        <div class="text-start small border rounded p-2 bg-light">
          <b>ID:</b> ${data.EntityId}<br/>
          <b>Email:</b> ${data.Email || '-'}<br/>
          <b>Mobile:</b> ${data.Mobile || '-'}<br/>
          <b>FTP:</b> ${data.FTPHost || ''}:${data.FTPPort || ''}
        </div>`;
    } else {
      resultDiv.innerHTML = `<div class="text-danger">❌ Ошибка входа: ${data.ResultMessage || 'Пользователь не найден'}</div>`;
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = `
      <div class="text-danger">
        ❌ Ошибка соединения с сервером<br/>
        <span class="text-secondary">Проверьте прокси или попробуйте позже</span>
      </div>`;
  }
});
