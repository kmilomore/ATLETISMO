# Google Sheets — Estructura de datos

**Spreadsheet ID:** `1UbIfFb_A2iXlfefylK-6m5xEXY9P-fPGoSBqrNOb34c`

**URL:** https://docs.google.com/spreadsheets/d/1UbIfFb_A2iXlfefylK-6m5xEXY9P-fPGoSBqrNOb34c/edit

---

## Hoja: ESCUELAS

Tabla maestra de establecimientos. Debe existir antes del primer uso. Se administra manualmente.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | texto | Identificador único del establecimiento |
| `nombre` | texto | Nombre completo del establecimiento |
| `rbd` | texto | Rol Base de Datos (código MINEDUC) |
| `comuna` | texto | Comuna donde se ubica |
| `dependencia` | texto | Ej: SLEP Colchagua, Municipal, Particular Subvencionado |

> Si la columna `id` no existe, el GAS usa el número de fila como identificador.
> Los nombres de columnas se detectan dinámicamente (case-insensitive).

---

## Hoja: INSCRIPCIONES

Creada automáticamente por `setupSheets()`. Cada fila representa **un atleta** (no una inscripción de establecimiento).

| # | Columna | Tipo | Descripción |
|---|---|---|---|
| 1 | `id_inscripcion` | texto | ID único generado: `INS-<timestamp36>-<random>` |
| 2 | `fecha_registro` | ISO 8601 | Fecha y hora de envío del formulario |
| 3 | `id_establecimiento` | texto | ID del establecimiento (de la hoja ESCUELAS) |
| 4 | `nombre_establecimiento` | texto | Nombre completo del establecimiento |
| 5 | `nombre_responsable` | texto | Nombre del docente/directivo responsable |
| 6 | `cargo_responsable` | texto | Cargo del responsable |
| 7 | `correo_responsable` | email | Correo de contacto |
| 8 | `telefono_responsable` | texto | Teléfono de contacto |
| 9 | `nombre_estudiante` | texto | Nombre completo del atleta |
| 10 | `rut_estudiante` | texto | RUT con formato `12.345.678-9` |
| 11 | `sexo` | `Dama` \| `Varón` | Sexo del atleta |
| 12 | `fecha_nacimiento` | `YYYY-MM-DD` | Fecha de nacimiento |
| 13 | `anio_nacimiento` | número | Año de nacimiento (derivado de fecha) |
| 14 | `categoria` | `Sub-14` \| `Juvenil` | Calculada por el GAS |
| 15 | `pruebas_pista` | texto | Pruebas separadas por coma: `"100 metros, 200 metros"` |
| 16 | `prueba_campo` | texto | Una prueba de campo o vacío |
| 17 | `participa_posta` | `Sí` \| `No` | Participación en posta |
| 18 | `tipo_posta` | texto | Tipo de posta o vacío |
| 19 | `observaciones` | texto | Observaciones libres |

---

## Hoja: RESUMEN

Creada automáticamente por `setupSheets()`. Actualmente no se usa para almacenar datos persistentes — las métricas se calculan en tiempo real por `getResumen()`.

| Columna | Descripción |
|---|---|
| `metrica` | Nombre de la métrica |
| `categoria` | Subcategoría de la métrica |
| `valor` | Valor numérico |
| `fecha_calculo` | Fecha del cálculo |

---

## Notas de mantenimiento

- **No eliminar la fila de encabezados** de INSCRIPCIONES — el GAS la usa para detectar índices de columnas dinámicamente.
- **No cambiar el nombre de las columnas** de INSCRIPCIONES sin actualizar `HEADERS_INSCRIPCIONES` en `Config.gs`.
- La hoja ESCUELAS puede tener columnas adicionales sin problema — el GAS solo lee las que reconoce.
- Para exportar todos los datos: Panel Admin → botón "Exportar CSV", o llamar directamente `?action=exportarCSV` en el endpoint.
