// =========================================================
// InscripcionesService.gs — Guardado y lectura
// =========================================================

function guardarInscripcion(payload) {
  try {
    if (!payload) return fail('Sin datos recibidos');

    var escuelaId    = (payload.escuelaId    || '').toString().trim();
    var escuelaNombre= (payload.nombreEstablecimiento || '').toString().trim();
    var responsable  = (payload.nombreResponsable  || '').toString().trim();
    var cargo        = (payload.cargoResponsable    || '').toString().trim();
    var correo       = (payload.correoResponsable   || '').toString().trim();
    var telefono     = (payload.telefonoResponsable || '').toString().trim();
    var estudiantes  = payload.estudiantes || [];

    // Validaciones básicas
    if (!escuelaId)   return fail('Establecimiento requerido');
    if (!responsable) return fail('Nombre del responsable requerido');
    if (!correo)      return fail('Correo del responsable requerido');
    if (!Array.isArray(estudiantes) || estudiantes.length === 0)
      return fail('Debe incluir al menos un estudiante');
    if (estudiantes.length > MAX_ESTUDIANTES_POR_ESTABLECIMIENTO)
      return fail('Máximo ' + MAX_ESTUDIANTES_POR_ESTABLECIMIENTO + ' estudiantes por establecimiento');

    // Verificar límite acumulado por establecimiento
    var ss    = getSpreadsheet();
    var hoja  = getOrCreateSheet(ss, SHEET_INSCRIPCIONES, HEADERS_INSCRIPCIONES);
    var datos = hoja.getDataRange().getValues();

    var countEstablecimiento = 0;
    var rutsPrevios = {};
    if (datos.length > 1) {
      var headers = datos[0];
      var idxEscId = headers.indexOf('id_establecimiento');
      var idxRut   = headers.indexOf('rut_estudiante');
      for (var r = 1; r < datos.length; r++) {
        if (idxEscId >= 0 && datos[r][idxEscId].toString() === escuelaId) {
          countEstablecimiento++;
          if (idxRut >= 0) {
            rutsPrevios[datos[r][idxRut].toString().toLowerCase()] = true;
          }
        }
      }
    }

    if (countEstablecimiento + estudiantes.length > MAX_ESTUDIANTES_POR_ESTABLECIMIENTO) {
      return fail(
        'El establecimiento ya tiene ' + countEstablecimiento + ' estudiante(s) inscritos. ' +
        'Solo puede agregar ' + (MAX_ESTUDIANTES_POR_ESTABLECIMIENTO - countEstablecimiento) + ' más.'
      );
    }

    // Validar cada estudiante
    var todosErrores = [];
    var rutsNuevos   = Object.assign({}, rutsPrevios);
    for (var i = 0; i < estudiantes.length; i++) {
      var errEst = validarEstudiante(estudiantes[i], rutsNuevos);
      if (errEst.length > 0) {
        todosErrores = todosErrores.concat(errEst);
      }
    }
    if (todosErrores.length > 0) {
      return fail('Errores de validación', todosErrores);
    }

    // Guardar filas
    var fechaRegistro = new Date().toISOString();
    var filas = estudiantes.map(function(est) {
      var anio = est.anioNacimiento
        || (est.fechaNacimiento ? new Date(est.fechaNacimiento).getFullYear() : '');
      var cat  = calcularCategoria(anio);
      return [
        generarIdInscripcion(),
        fechaRegistro,
        escuelaId,
        escuelaNombre,
        responsable,
        cargo,
        correo,
        telefono,
        (est.nombre || '').trim(),
        est.sinRut ? 'PROV-' + (est.rut || '').trim() : (est.rut || '').trim(),
        est.sexo || '',
        est.fechaNacimiento || '',
        anio,
        cat,
        Array.isArray(est.pruebasPista) ? est.pruebasPista.join(', ') : (est.pruebasPista || ''),
        est.pruebaCampo || '',
        est.participaPosta ? 'Sí' : 'No',
        est.tipoPosta || '',
        est.observaciones || '',
      ];
    });

    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, HEADERS_INSCRIPCIONES.length)
      .setValues(filas);

    return ok(
      'Inscripción guardada exitosamente. ' + estudiantes.length + ' estudiante(s) registrado(s).',
      { total: estudiantes.length }
    );
  } catch(e) {
    return fail('Error interno al guardar: ' + e.message);
  }
}

function getInscripciones() {
  try {
    var ss    = getSpreadsheet();
    var hoja  = getOrCreateSheet(ss, SHEET_INSCRIPCIONES, HEADERS_INSCRIPCIONES);
    var datos = hoja.getDataRange().getValues();

    if (datos.length < 2) return ok('Sin inscripciones', []);

    var headers = datos[0];
    var filas   = [];
    for (var i = 1; i < datos.length; i++) {
      var obj = {};
      headers.forEach(function(h, j) { obj[h] = datos[i][j]; });
      filas.push(obj);
    }

    return ok('Inscripciones cargadas', filas);
  } catch(e) {
    return fail('Error al leer inscripciones: ' + e.message);
  }
}

function exportarCSV() {
  try {
    var ss    = getSpreadsheet();
    var hoja  = ss.getSheetByName(SHEET_INSCRIPCIONES);
    if (!hoja) return ContentService.createTextOutput('Sin datos').setMimeType(ContentService.MimeType.TEXT);

    var datos = hoja.getDataRange().getValues();
    var csv   = datos.map(function(fila) {
      return fila.map(function(cel) {
        var s = cel.toString().replace(/"/g, '""');
        return /[,"\n]/.test(s) ? '"' + s + '"' : s;
      }).join(',');
    }).join('\n');

    return ContentService
      .createTextOutput(csv)
      .setMimeType(ContentService.MimeType.CSV);
  } catch(e) {
    return ContentService.createTextOutput('Error: ' + e.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
