# Despliegue

## Variables de entorno

El proyecto usa dos variables de entorno con prefijo `VITE_` (expuestas al bundle del cliente por Vite).

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_GAS_ENDPOINT` | URL del Web App de Google Apps Script | `https://script.google.com/macros/s/.../exec` |
| `VITE_SHEET_URL` | URL del Google Sheet (botón "Abrir Sheet" en Admin) | `https://docs.google.com/spreadsheets/d/.../edit` |

**Desarrollo local:** crear `.env.local` en la raíz (ya en `.gitignore` vía `*.local`):

```env
VITE_GAS_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
VITE_SHEET_URL=https://docs.google.com/spreadsheets/d/1UbIfFb.../edit
```

Ver `.env.example` para la plantilla.

---

## Desarrollo local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

```bash
npm run build     # Compila TypeScript + genera dist/
npm run preview   # Sirve el build de dist/ localmente
npm run lint      # ESLint
```

---

## Deploy en Vercel

### Primera vez

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Framework preset: **Vite** (detectado automáticamente)
3. Build command: `npm run build`
4. Output directory: `dist`
5. En **Settings → Environment Variables**, agregar:
   - `VITE_GAS_ENDPOINT` → URL del endpoint GAS
   - `VITE_SHEET_URL` → URL del Google Sheet

### Deploys sucesivos

Vercel redeploya automáticamente en cada push a `main`. Si se cambia el endpoint GAS (nueva versión del Web App), actualizar la variable `VITE_GAS_ENDPOINT` en Vercel y hacer un redeploy manual.

---

## Deploy del backend GAS

> Cada cambio en el código `.gs` requiere una **nueva implementación** (no actualizar la existente), porque GAS cachea el código de implementaciones anteriores.

### Pasos

1. Ir a [script.google.com](https://script.google.com) y abrir el proyecto
2. Crear/actualizar los archivos `.gs` con el contenido de la carpeta `gas/`
3. Primera vez: ejecutar `setupSheets()` para crear las hojas INSCRIPCIONES y RESUMEN
4. **Desplegar → Nueva implementación**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo (mi cuenta Google)**
   - Quién tiene acceso: **Cualquier persona**
5. Copiar la URL generada
6. Actualizar `VITE_GAS_ENDPOINT` en `.env.local` y en Vercel

### Archivos GAS en orden de dependencia

```
Config.gs           ← debe cargarse primero (define constantes globales)
Utils.gs            ← helpers usados por los demás services
EscuelasService.gs
InscripcionesService.gs
ResumenService.gs
Code.gs             ← router principal (referencias todos los services)
```

---

## Consideraciones de seguridad

- Las credenciales del panel admin (`ximena.pino@slepcolchagua.cl` / `Slep.2026`) están hardcodeadas en `src/utils/validaciones.ts`. La autenticación es **client-side únicamente** — adecuada para un panel de uso interno con bajo riesgo, pero no reemplaza autenticación server-side para datos sensibles.
- El endpoint GAS es público (`Cualquier persona`). No expone datos personales más allá de lo necesario para el torneo.
- Las variables `VITE_*` son visibles en el bundle del cliente — no almacenar secretos críticos en ellas.
