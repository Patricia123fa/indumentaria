# Proyecto indumentaria

Aplicación React/Vite preparada para uso local sin internet.

## Modo museo

1. Instala dependencias una sola vez con `npm install`.
2. Genera la versión de escritorio con `npm run build:desktop`.
3. En `release/` tendrás el instalador `NSIS` y el `.exe` portable.
4. Si solo quieres probar la web local, usa `npm run preview:local`.

## Despliegue offline

- La salida de `build` usa rutas relativas por defecto, así que el `dist` se puede copiar a otra carpeta o equipo.
- Todas las imágenes, fuentes y vídeos usados por la app están dentro del proyecto.
- No hay dependencias de CDN ni recursos externos en tiempo de ejecución.
- La app de escritorio abre directamente el `dist/index.html`, sin necesitar servidor local.

## Scripts

- `npm run dev`: desarrollo local.
- `npm run build`: genera la versión portable para local.
- `npm run build:indumentaria`: genera el build pensado para una ruta fija como `/indumentaria/`.
- `npm run build:desktop`: genera instalador y `.exe` portable en `release/`.
- `npm run preview:local`: sirve el build en `127.0.0.1`.
