// =========================================================
// Utils.gs — Utilidades generales
// =========================================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok(message, data) {
  return { success: true, message: message || 'OK', data: data || null };
}

function fail(message, errors) {
  return { success: false, message: message || 'Error', errors: errors || [] };
}

function generarIdInscripcion() {
  var ts   = new Date().getTime().toString(36).toUpperCase();
  var rand = Math.random().toString(36).substr(2, 5).toUpperCase();
  return 'INS-' + ts + '-' + rand;
}

function calcularCategoria(anioNacimiento) {
  var anio = parseInt(anioNacimiento, 10);
  if (ANIOS_SUB14.indexOf(anio) !== -1)   return 'Sub-14';
  if (ANIOS_JUVENIL.indexOf(anio) !== -1) return 'Juvenil';
  return 'No válida';
}

function validarEstudiante(est, rutsYaVistos) {
  var errores = [];

  if (!est.nombre || !est.nombre.trim())
    errores.push('Nombre del estudiante requerido');

  if (!est.rut || !est.rut.trim()) {
    errores.push('RUT del estudiante requerido');
  } else {
    var rutNorm = est.rut.trim().toLowerCase();
    if (rutsYaVistos[rutNorm]) {
      errores.push('RUT duplicado: ' + est.rut);
    }
    rutsYaVistos[rutNorm] = true;
  }

  if (!est.sexo || (est.sexo !== 'Dama' && est.sexo !== 'Varón'))
    errores.push('Sexo inválido para: ' + (est.nombre || '?'));

  var anio = est.anioNacimiento || (est.fechaNacimiento ? new Date(est.fechaNacimiento).getFullYear() : null);
  var cat  = calcularCategoria(anio);
  if (cat === 'No válida')
    errores.push('Año de nacimiento no válido para: ' + (est.nombre || '?') + ' (año ' + anio + ')');

  return errores;
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(ss, nombre, headers) {
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    if (headers && headers.length) {
      hoja.getRange(1, 1, 1, headers.length).setValues([headers]);
      hoja.getRange(1, 1, 1, headers.length)
        .setBackground('#25306B')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold');
      hoja.setFrozenRows(1);
    }
  }
  return hoja;
}

function setupSheets() {
  var ss = getSpreadsheet();
  getOrCreateSheet(ss, SHEET_INSCRIPCIONES, HEADERS_INSCRIPCIONES);
  getOrCreateSheet(ss, SHEET_RESUMEN, ['metrica', 'categoria', 'valor', 'fecha_calculo']);
  return ok('Hojas creadas/verificadas');
}
