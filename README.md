# Realtime Translate Mobile

Prototipo móvil para usar `gpt-realtime-translate` desde el navegador del teléfono.

## Qué hace

- capta audio del micrófono
- lo envía a OpenAI Realtime Translation
- reproduce el audio traducido
- muestra transcripción original y traducción en pantalla

## Requisitos

- Node.js 20+ (mejor 24, que ya tienes)
- una API key de OpenAI con acceso a Realtime
- abrir la web desde **HTTPS** en el móvil o desde `localhost`

## Arranque

```bash
cd /home/user/.openclaw/workspace/realtime-translate-mobile
export OPENAI_API_KEY="tu_api_key"
node server.js
```

Luego abre:

- en el mismo equipo: `http://localhost:8787`
- en móvil: mejor publicar esta web con HTTPS

## Importante para móvil

`getUserMedia` suele exigir contexto seguro. Eso significa:

- `https://...`
- o `http://localhost`

Si abres `http://IP_LOCAL:8787` desde el móvil, lo más probable es que el navegador bloquee el micrófono.

## Opciones prácticas para usarlo en tu móvil

### Opción rápida
Usar un túnel HTTPS como:

- Cloudflare Tunnel
- Tailscale Funnel
- nginx con certificado
- cualquier hosting pequeño con HTTPS

### Opción limpia
Subir esto a un VPS o servicio pequeño con HTTPS y guardar la API key solo en servidor.

## Archivos

- `server.js`: backend mínimo que crea `client_secrets`
- `public/index.html`: interfaz móvil y conexión WebRTC

## Limitaciones actuales

- prototipo de una sola dirección: escuchas un idioma y recibes otro
- no guarda historial
- no tiene botón de intercambio rápido de idiomas
- no está endurecido para producción

## Siguiente mejora lógica

1. botón para invertir idiomas
2. modo reunión con texto grande
3. guardar transcripción
4. selector de auricular/altavoz
5. acceso protegido con login simple
