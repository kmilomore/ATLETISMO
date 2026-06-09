# Arquitectura del sistema

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React | 19.x |
| Lenguaje | TypeScript | 6.x |
| Estilos | Tailwind CSS v4 + @slep-colchagua/design-system | 4.x / 1.x |
| Build | Vite | 8.x |
| Backend | Google Apps Script (Web App) | — |
| Base de datos | Google Sheets | — |
| Hosting | Vercel | — |

## Estructura de carpetas

```
ATLETISTMO/
├── MD/                          ← Documentación (este directorio)
├── gas/                         ← Backend Google Apps Script
│   ├── Code.gs                  ← Router doGet / doPost
│   ├── Config.gs                ← Constantes globales (IDs, headers)
│   ├── Utils.gs                 ← Helpers: jsonResponse, ok, fail, validaciones
│   ├── EscuelasService.gs       ← Lectura de la hoja ESCUELAS
│   ├── InscripcionesService.gs  ← Guardar / leer / exportar inscripciones
│   └── ResumenService.gs        ← Cálculo de métricas del torneo
├── public/                      ← Assets estáticos servidos por Vite
│   ├── favicon.webp             ← Logo SLEP Colchagua (favicon + organizadores)
│   ├── CHIMBAROGNO.svg          ← Logo Municipalidad de Chimbarongo
│   └── GARZAS.svg               ← Logo Escuela Agrícola Las Garzas
├── src/
│   ├── assets/                  ← Imágenes importadas en componentes
│   │   └── hero.png
│   ├── components/              ← Componentes React
│   │   ├── App.tsx              ← Raíz: vistas Inicio, Formulario, Admin
│   │   ├── EstudianteCard.tsx   ← Tarjeta editable por atleta
│   │   ├── FormularioInscripcion.tsx ← Flujo de 3 pasos + folio
│   │   ├── PanelAdmin.tsx       ← CRM de inscripciones (requiere login)
│   │   ├── LoginAdmin.tsx       ← Pantalla de autenticación del panel
│   │   ├── TablaInscripciones.tsx ← Tabla filtrable del panel admin
│   │   ├── ResumenCards.tsx     ← Tarjetas de métricas del panel admin
│   │   ├── SkeletonLoader.tsx   ← Skeletons de carga
│   │   ├── LoadingState.tsx     ← Spinner genérico
│   │   └── ErrorState.tsx       ← Bloque de error con botón reintentar
│   ├── services/
│   │   └── api.ts               ← Llamadas al GAS endpoint (gasGet / gasPost)
│   ├── utils/
│   │   └── validaciones.ts      ← RUT chileno, email, credenciales admin
│   ├── constants.ts             ← Endpoint, pruebas, años, límites
│   ├── types.ts                 ← Interfaces TypeScript globales
│   └── index.css                ← Design system tokens + clases UI + print CSS
├── index.html                   ← Entry point HTML (favicon, título)
├── vite.config.ts               ← Plugin react + tailwindcss
├── .env.local                   ← Variables de entorno locales (no versionado)
└── .env.example                 ← Plantilla de variables de entorno
```

## Flujo de datos

```
Usuario (browser)
    │
    ▼
React App (Vercel)
    │  VITE_GAS_ENDPOINT (env var)
    ▼
Google Apps Script Web App   ──►  Google Sheets
    doGet(?action=X)                ESCUELAS
    doPost(action=guardarInscripcion)  INSCRIPCIONES
```

### Peticiones GET

| action | Función GAS | Descripción |
|---|---|---|
| `escuelas` | `getEscuelas()` | Lista de establecimientos desde hoja ESCUELAS |
| `escuelasInscritas` | `getEscuelasInscritas()` | IDs únicos con inscripción existente |
| `inscripciones` | `getInscripciones()` | Todas las filas de la hoja INSCRIPCIONES |
| `resumen` | `getResumen()` | Métricas calculadas en tiempo real |
| `exportarCSV` | `exportarCSV()` | Descarga directa del CSV de inscripciones |

### Peticiones POST

| action | Función GAS | Descripción |
|---|---|---|
| `guardarInscripcion` | `guardarInscripcion(payload)` | Valida y persiste una inscripción |

## Vistas de la aplicación

| Vista | Componente | Descripción |
|---|---|---|
| Inicio | `VistaInicio` (en App.tsx) | Hero, reglas, CTA, organizadores |
| Formulario | `FormularioInscripcion` | 3 pasos: establecimiento → atletas → folio + confirmación |
| Admin | `PanelAdmin` | CRM con métricas y tabla filtrable (requiere login) |
