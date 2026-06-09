# Panel de administración

## Acceso

El panel de administración está protegido por login con credenciales fijas.

| Campo | Valor |
|---|---|
| **Usuario** | `ximena.pino@slepcolchagua.cl` |
| **Contraseña** | `Slep.2026` |

Para acceder: en la barra de navegación superior → botón **"Panel Admin"** (ícono de candado).

Tras 5 intentos fallidos consecutivos, el formulario de login se bloquea y muestra un mensaje de error permanente. Recargar la página para desbloquear.

---

## Funcionalidades

### Indicadores generales

Al ingresar se muestran tarjetas con métricas calculadas en tiempo real desde Google Sheets:

| Métrica | Descripción |
|---|---|
| Total de atletas inscritos | Suma de todas las filas de INSCRIPCIONES |
| Establecimientos participantes | Cantidad de IDs únicos de escuelas |
| Por categoría | Desglose Sub-14 / Juvenil |
| Por sexo | Desglose Dama / Varón |
| Por prueba de pista | Conteo por cada prueba |
| Por prueba de campo | Conteo por cada prueba |
| Por posta | Conteo por tipo de posta |
| Por establecimiento | Atletas por cada escuela |

### Tabla de inscripciones

Muestra todas las inscripciones con filtros combinables:

| Filtro | Opciones |
|---|---|
| Búsqueda libre | Nombre del atleta, RUT o establecimiento |
| Establecimiento | Desplegable con todos los establecimientos que han inscrito |
| Categoría | Sub-14 / Juvenil |
| Sexo | Dama / Varón |
| Prueba de pista | Todas las pruebas presentes en los registros |
| Posta | Participa / No participa |

El contador sobre la tabla muestra `N de M` cuando hay filtros activos. El botón **"✕ Limpiar filtros"** aparece cuando hay algún filtro aplicado.

### Acciones disponibles

| Botón | Acción |
|---|---|
| **↻ Actualizar** | Re-fetch de inscripciones y resumen desde GAS |
| **Abrir Google Sheet ↗** | Abre el Sheet directamente en nueva pestaña |
| **Exportar CSV** | Descarga el CSV completo de inscripciones desde GAS |
| **← Inicio** | Vuelve a la vista de inicio |

---

## Exportación de datos

El CSV exportado contiene todas las columnas de la hoja INSCRIPCIONES en el mismo orden. Ver [google-sheets.md](google-sheets.md) para el detalle de columnas.

El archivo se descarga directamente desde el endpoint GAS (`?action=exportarCSV`) sin pasar por el servidor de Vercel.

---

## Notas para la administradora

- Los datos se actualizan en tiempo real desde Google Sheets cada vez que se presiona "Actualizar" o se entra al panel.
- Si una inscripción contiene errores, puede corregirse directamente en el Google Sheet — la próxima vez que se actualice el panel, reflejará los cambios.
- Para agregar o quitar establecimientos del listado de inscripción, editar la hoja **ESCUELAS** directamente en el Google Sheet.
- Un establecimiento que ya tiene inscripción registrada **no aparece** en el formulario público — se muestra solo en el panel admin.
