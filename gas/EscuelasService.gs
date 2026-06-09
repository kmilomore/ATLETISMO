// =========================================================
// EscuelasService.gs — Lectura de establecimientos
// =========================================================

function getEscuelas() {
  try {
    var ss   = getSpreadsheet();
    var hoja = ss.getSheetByName(SHEET_ESCUELAS);

    if (!hoja) {
      return fail('La hoja "ESCUELAS" no existe en el Spreadsheet.');
    }

    var datos = hoja.getDataRange().getValues();
    if (datos.length < 2) {
      return ok('Sin establecimientos', []);
    }

    var headers = datos[0].map(function(h) { return h.toString().toLowerCase().trim(); });
    var idxNombre = headers.indexOf('nombre');
    var idxId     = headers.indexOf('id');
    var idxRbd    = headers.indexOf('rbd');
    var idxComuna = headers.indexOf('comuna');

    // Buscar dependencia por múltiples variantes del encabezado
    var idxDependencia = -1;
    var depVariantes = ['dependencia', 'dep', 'dependencia administrativa',
                        'tipo dependencia', 'tipo_dependencia', 'depend'];
    for (var d = 0; d < depVariantes.length; d++) {
      var pos = headers.indexOf(depVariantes[d]);
      if (pos >= 0) { idxDependencia = pos; break; }
    }
    // Si no se encontró por nombre, usar columna C (índice 2) como fallback
    if (idxDependencia < 0 && datos[0].length >= 3) {
      idxDependencia = 2;
    }

    // Loguear encabezados para diagnóstico (visible en ejecuciones de Apps Script)
    Logger.log('Encabezados ESCUELAS: ' + JSON.stringify(datos[0]));
    Logger.log('idx dependencia: ' + idxDependencia + ' → cabecera: ' + (datos[0][idxDependencia] || 'N/A'));

    // Si no hay columna "id", usamos el índice de fila como id
    var escuelas = [];
    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      var nombre = idxNombre >= 0 ? fila[idxNombre] : fila[0];
      if (!nombre || nombre.toString().trim() === '') continue;

      escuelas.push({
        id:          idxId >= 0          ? fila[idxId].toString().trim()          : (i).toString(),
        nombre:      nombre.toString().trim(),
        rbd:         idxRbd >= 0         ? fila[idxRbd].toString().trim()         : '',
        comuna:      idxComuna >= 0      ? fila[idxComuna].toString().trim()      : '',
        dependencia: idxDependencia >= 0 ? fila[idxDependencia].toString().trim() : '',
      });
    }

    return ok('Establecimientos cargados', escuelas);
  } catch(e) {
    return fail('Error al leer establecimientos: ' + e.message);
  }
}

// Retorna un array con los IDs únicos de establecimientos que ya tienen inscripción
function getEscuelasInscritas() {
  try {
    var ss   = getSpreadsheet();
    var hoja = ss.getSheetByName(SHEET_INSCRIPCIONES);

    if (!hoja || hoja.getLastRow() < 2) {
      return ok('Sin inscripciones', []);
    }

    var datos   = hoja.getDataRange().getValues();
    var headers = datos[0].map(function(h) { return h.toString().toLowerCase().trim(); });
    var idxEscuela = headers.indexOf('escuelaid');
    if (idxEscuela < 0) idxEscuela = headers.indexOf('id_escuela');
    if (idxEscuela < 0) idxEscuela = headers.indexOf('escuela_id');

    if (idxEscuela < 0) {
      return ok('Sin inscripciones', []);
    }

    var ids = {};
    for (var i = 1; i < datos.length; i++) {
      var id = datos[i][idxEscuela];
      if (id && id.toString().trim() !== '') {
        ids[id.toString().trim()] = true;
      }
    }

    return ok('IDs de escuelas inscritas', Object.keys(ids));
  } catch(e) {
    return fail('Error al leer escuelas inscritas: ' + e.message);
  }
}
