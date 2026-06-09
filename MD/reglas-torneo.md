# Reglas del torneo

## Categorías

| Categoría | Años de nacimiento válidos |
|---|---|
| **Sub-14** | 2012, 2013, 2014 |
| **Juvenil** | 2009, 2010, 2011 |

La categoría se calcula automáticamente a partir del año de nacimiento. Años fuera de estos rangos quedan marcados como **"No válida"** y no pueden inscribirse.

## Límites de inscripción

| Restricción | Valor |
|---|---|
| Máximo de atletas por establecimiento | **20** |
| Máximo de pruebas de pista por atleta | **2** |
| Máximo de prueba de campo por atleta | **1** (opcional) |
| Posta por atleta | **1** (opcional) |
| Un establecimiento puede inscribirse | **solo una vez** |

## Pruebas de pista

| Sub-14 | Juvenil |
|---|---|
| 80 metros | 100 metros |
| 150 metros | 200 metros |
| 400 metros | 400 metros |
| 800 metros | 800 metros |
| 1500 metros | 2000 metros |

## Pruebas de campo

| Sub-14 | Juvenil |
|---|---|
| Salto alto | Salto alto |
| Salto largo | Salto largo |
| Lanzamiento de bala | Lanzamiento de bala |
| Lanzamiento de disco | Lanzamiento de disco |
| — | Lanzamiento de jabalina |

## Postas

| Sub-14 | Juvenil |
|---|---|
| 5×80 | 4×100 |
| — | Combinada sueca |

## Validaciones aplicadas

### Frontend (antes de enviar)
- RUT chileno con algoritmo módulo 11 (dígito verificador K o numérico)
- Formato de correo electrónico real (rechaza dominios falsos como test.com, example.com)
- Todos los campos obligatorios completados
- Sin RUTs duplicados dentro de la misma inscripción

### Backend (Google Apps Script)
- Revalida límite de 20 atletas considerando inscripciones previas del mismo establecimiento
- Detecta RUTs ya registrados para el mismo establecimiento
- Verifica que el año de nacimiento corresponda a una categoría válida
- Verifica que no existan campos vacíos críticos (nombre, RUT, sexo, responsable, correo)
