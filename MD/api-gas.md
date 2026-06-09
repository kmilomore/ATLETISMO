# API — Google Apps Script

El backend es una **Web App de Google Apps Script** que expone un único endpoint HTTP. Toda la comunicación usa JSON.

## Endpoint

```
https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
```

Configurado en la variable de entorno `VITE_GAS_ENDPOINT`.

## Formato de respuesta

Todas las respuestas siguen la misma estructura:

```json
{
  "success": true | false,
  "message": "Descripción del resultado",
  "data": <payload o null>,
  "errors": ["lista de errores si los hay"]
}
```

---

## GET — Lectura de datos

### `?action=escuelas`

Retorna la lista de establecimientos educacionales desde la hoja ESCUELAS.

**Respuesta `data`:**
```json
[
  {
    "id": "1",
    "nombre": "Escuela Básica ...",
    "rbd": "12345",
    "comuna": "Chimbarongo",
    "dependencia": "SLEP Colchagua"
  }
]
```

---

### `?action=escuelasInscritas`

Retorna un array con los IDs de establecimientos que ya tienen al menos una inscripción registrada. Usado para filtrar el selector del formulario.

**Respuesta `data`:**
```json
["1", "5", "12"]
```

---

### `?action=inscripciones`

Retorna todas las filas de la hoja INSCRIPCIONES como array de objetos.

**Respuesta `data`:** Array de `InscripcionRow` (ver [google-sheets.md](google-sheets.md)).

---

### `?action=resumen`

Retorna métricas calculadas en tiempo real sobre todas las inscripciones.

**Respuesta `data`:**
```json
{
  "totalInscritos": 145,
  "totalEstablecimientos": 12,
  "porCategoria": { "Sub-14": 80, "Juvenil": 65 },
  "porSexo": { "Dama": 70, "Varón": 75 },
  "porPruebaPista": { "100 metros": 45, "200 metros": 30 },
  "porPruebaCampo": { "Salto largo": 20 },
  "porPosta": { "4x100": 15, "5x80": 10 },
  "porEstablecimiento": { "Escuela X": 18 }
}
```

---

### `?action=exportarCSV`

Descarga directa del contenido de la hoja INSCRIPCIONES en formato CSV. No retorna JSON — retorna `text/csv` directamente.

---

### `?action=setup`

Crea las hojas INSCRIPCIONES y RESUMEN si no existen, con sus cabeceras y formato. Se ejecuta automáticamente en cada petición GET.

---

## POST — Guardar inscripción

### `action=guardarInscripcion`

Guarda una inscripción completa. Se envía como `application/x-www-form-urlencoded` con los campos `action` y `data`.

**Body:**
```
action=guardarInscripcion
data={"escuelaId":"1","nombreEstablecimiento":"...","nombreResponsable":"...","cargoResponsable":"...","correoResponsable":"...","telefonoResponsable":"...","comunaEstablecimiento":"...","dependenciaEstablecimiento":"...","estudiantes":[...]}
```

**Objeto `estudiante` dentro del array:**
```json
{
  "nombre": "Nombre Apellido",
  "rut": "12.345.678-9",
  "sexo": "Dama | Varón",
  "fechaNacimiento": "2012-05-20",
  "anioNacimiento": 2012,
  "categoria": "Sub-14 | Juvenil",
  "pruebasPista": ["100 metros", "200 metros"],
  "pruebaCampo": "Salto largo",
  "participaPosta": true,
  "tipoPosta": "4x100",
  "observaciones": ""
}
```

**Validaciones del backend:**
1. `escuelaId` no vacío
2. `nombreResponsable` no vacío
3. `correoResponsable` no vacío
4. Array `estudiantes` con al menos 1 elemento y máximo 20
5. Conteo acumulado del establecimiento en el sheet ≤ 20
6. Cada estudiante: nombre, RUT, sexo válido, año de nacimiento válido
7. Sin RUTs duplicados (vs. registros previos del mismo establecimiento y dentro del payload)

---

## Despliegue del GAS

> Importante: cada modificación al código requiere crear una **nueva implementación**, no actualizar la existente.

1. Abrir [script.google.com](https://script.google.com) y crear un proyecto nuevo
2. Crear los archivos: `Code.gs`, `Config.gs`, `Utils.gs`, `EscuelasService.gs`, `InscripcionesService.gs`, `ResumenService.gs`
3. Pegar el contenido de cada archivo desde la carpeta `gas/`
4. Ejecutar `setupSheets()` una vez para crear las hojas necesarias
5. **Desplegar → Nueva implementación**
   - Tipo: Aplicación web
   - Ejecutar como: Yo (mi cuenta)
   - Quién tiene acceso: Cualquier persona
6. Copiar la URL generada y actualizar `VITE_GAS_ENDPOINT` en Vercel
