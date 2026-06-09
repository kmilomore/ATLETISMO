# Catálogo de componentes React

## Árbol de componentes

```
App
├── Masthead (sticky)
├── VistaInicio
│   ├── Hero
│   ├── Tarjetas de reglas
│   ├── CTA "Comenzar inscripción"
│   └── Sección organizadores
├── FormularioInscripcion
│   ├── SkeletonFormulario          ← mientras carga escuelas
│   ├── Paso 1: Datos establecimiento
│   │   └── EstudianteCard (×N)
│   ├── Paso 2: Folio de postulación
│   │   └── SkeletonSelectEscuela   ← mientras carga en el selector
│   └── Paso 3: Éxito / agradecimiento
└── PanelAdmin
    ├── LoginAdmin                  ← si no autenticado
    ├── ResumenCards
    └── TablaInscripciones
```

---

## `App.tsx`

Componente raíz. Gestiona la vista activa con `useState<Vista>`.

| Vista | Componente mostrado |
|---|---|
| `'inicio'` | `VistaInicio` |
| `'inscripcion'` | `FormularioInscripcion` |
| `'admin'` | `PanelAdmin` |

También contiene `Masthead` y `Footer`.

---

## `FormularioInscripcion`

Flujo de 3 pasos (estado `Paso`):

| Paso | Estado | Descripción |
|---|---|---|
| Formulario | `'formulario'` | Datos del establecimiento + nómina de atletas |
| Folio | `'resumen'` | Vista consolidada imprimible con número de folio |
| Éxito | `'exito'` | Agradecimiento con resumen y folio |

**Estados clave:**
- `escuelas` — lista completa desde GAS
- `escuelasInscritas` — Set de IDs ya inscritos (se filtran del selector)
- `cargandoEscuelas` — muestra `SkeletonFormulario` mientras carga
- `folio` — código `TCA2026-XXXXXX` generado al pasar al resumen
- `form` — `FormularioData` con todos los datos del establecimiento y atletas
- `errors` — `FormErrors` con errores de validación por campo

**Generación de folio:** `TCA2026-` + 6 caracteres aleatorios del alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sin O/I/1/0 para evitar confusión visual).

---

## `EstudianteCard`

Tarjeta editable para un atleta individual.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `estudiante` | `Estudiante` | Datos del atleta |
| `index` | `number` | Posición en el array (para el número) |
| `error` | `EstudianteError \| null` | Errores de validación de este atleta |
| `onUpdate` | `(updated: Estudiante) => void` | Callback al modificar cualquier campo |
| `onRemove` | `() => void` | Callback al eliminar la tarjeta |

**Lógica interna:**
- Valida el RUT en tiempo real al perder foco (`onBlur`) con `validarRut()`
- Auto-formatea el RUT al salir del campo con `formatearRut()`
- Recalcula la categoría con `useEffect` cuando cambia la fecha de nacimiento
- Las pruebas de campo y posta usan `<div role="checkbox|radio">` en lugar de `<label>+<input>` para evitar el bug de doble click del navegador

---

## `PanelAdmin`

Panel CRM protegido por login.

**Autenticación:** client-side con credenciales fijas en `validaciones.ts`.

**Filtros disponibles:**
- Búsqueda libre (nombre, RUT, establecimiento)
- Por establecimiento
- Por categoría (Sub-14 / Juvenil)
- Por sexo (Dama / Varón)
- Por prueba de pista
- Por posta (participa / no participa)

**Acciones:**
- Actualizar datos (re-fetch desde GAS)
- Abrir Google Sheet directamente
- Exportar CSV

---

## `LoginAdmin`

Pantalla de login del panel. Incluye:
- Toggle mostrar/ocultar contraseña
- Bloqueo tras 5 intentos fallidos
- Llamada a `verificarCredenciales()` de `validaciones.ts`

---

## `SkeletonLoader`

Exporta tres componentes:

| Exportación | Descripción |
|---|---|
| `default` (`Block`) | Un bloque de skeleton configurable (height, width, radius) |
| `SkeletonSelectEscuela` | Simula el selector de escuelas con 6 filas fantasma |
| `SkeletonFormulario` | Simula todo el formulario: stepper + cards + botón |
| `SkeletonLines` | Líneas de texto genéricas |

La animación se define en `index.css` como `@keyframes skeleton-pulse`.

---

## `TablaInscripciones`

Tabla con todas las filas filtradas de INSCRIPCIONES. Renderiza chips de color para categoría y sexo.

**Props:** `{ filas: InscripcionRow[] }`

---

## `ResumenCards`

Muestra las métricas del torneo en tarjetas.

**Props:** `{ resumen: ResumenData }`

---

## Servicios y utilidades

### `src/services/api.ts`

| Función | Descripción |
|---|---|
| `getEscuelas()` | GET `?action=escuelas` |
| `getEscuelasInscritas()` | GET `?action=escuelasInscritas` — retorna `Set<string>` |
| `guardarInscripcion(data)` | POST `action=guardarInscripcion` |
| `getInscripciones()` | GET `?action=inscripciones` |
| `getResumen()` | GET `?action=resumen` |
| `getExportCSVUrl()` | Retorna la URL de descarga del CSV |

### `src/utils/validaciones.ts`

| Función | Descripción |
|---|---|
| `limpiarRut(rut)` | Elimina puntos, espacios y guión |
| `formatearRut(rut)` | Aplica formato `12.345.678-9` |
| `validarRut(rut)` | Módulo 11 — retorna `{ valido, mensaje? }` |
| `validarEmail(email)` | Regex + lista de dominios falsos |
| `verificarCredenciales(u, p)` | Compara con credenciales hardcodeadas |
