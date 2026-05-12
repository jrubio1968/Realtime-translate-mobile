const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8787;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PUBLIC_DIR = path.join(__dirname, 'public');

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
  };

  fs.readFile(filePath, (err, buffer) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(buffer);
  });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(text);
}

async function createClientSecret(req, res) {
  if (!OPENAI_API_KEY) {
    sendJson(res, 500, {
      error: 'Falta OPENAI_API_KEY en el servidor.',
    });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    sendJson(res, 400, { error: 'JSON inválido.' });
    return;
  }

  const targetLanguage = body.targetLanguage || 'es';
  const sourceLanguage = body.sourceLanguage || 'en';

  const payload = {
    session: {
      model: 'gpt-realtime-translate',
      audio: {
        input: {
          transcription: {
            model: 'gpt-realtime-whisper',
            language: sourceLanguage,
          },
        },
        output: {
          language: targetLanguage,
        },
      },
    },
  };

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/realtime/translations/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      sendJson(res, openaiRes.status, data);
      return;
    }

    sendJson(res, 200, data);
  } catch (error) {
    sendJson(res, 500, {
      error: 'No se pudo crear la sesión temporal con OpenAI.',
      detail: error.message,
    });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/session') {
    createClientSecret(req, res);
    return;
  }

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Realtime Translate listo en http://localhost:${PORT}`);
});
