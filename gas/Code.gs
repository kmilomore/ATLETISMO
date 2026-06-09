// =========================================================
// Code.gs — Router principal de la Web App GAS
// Torneo Comunal de Atletismo Escolar 2026 — SLEP Colchagua
// =========================================================
//
// CÓMO DESPLEGAR:
//   1. Pegar todos los archivos .gs en el editor de Apps Script
//   2. Ejecutar setupSheets() para crear las hojas necesarias
//   3. Desplegar → Nueva implementación → Tipo: Aplicación web
//   4. Ejecutar como: Yo (mi cuenta)
//   5. Quién tiene acceso: Cualquier persona
//   6. Copiar la URL del endpoint en src/constants.ts
//
// IMPORTANTE: Cada vez que modifiques el código, debes crear
// una NUEVA implementación (no actualizar la existente).
// =========================================================

function doGet(e) {
  try {
    // Inicializar hojas si no existen
    setupSheets();

    var action = e && e.parameter ? (e.parameter.action || '') : '';
    var result;

    switch (action) {
      case 'escuelas':
        result = getEscuelas();
        break;
      case 'escuelasInscritas':
        result = getEscuelasInscritas();
        break;
      case 'inscripciones':
        result = getInscripciones();
        break;
      case 'resumen':
        result = getResumen();
        break;
      case 'exportarCSV':
        return exportarCSV();
      case 'setup':
        result = setupSheets();
        break;
      default:
        result = ok('API Torneo Atletismo 2026 activa', {
          version: '1.0',
          acciones: ['escuelas', 'escuelasInscritas', 'inscripciones', 'resumen', 'exportarCSV'],
          spreadsheetId: SPREADSHEET_ID,
        });
    }

    return jsonResponse(result);
  } catch(err) {
    return jsonResponse(fail('Error interno: ' + err.message));
  }
}

function doPost(e) {
  try {
    var action = '';
    var payload = {};

    // Leer action y data de los parámetros POST
    if (e && e.parameter) {
      action = e.parameter.action || '';
      var dataStr = e.parameter.data || '';
      if (dataStr) {
        try { payload = JSON.parse(dataStr); } catch(_) { payload = {}; }
      }
    }

    // También intentar leer del body si no hay parámetros
    if (!action && e && e.postData) {
      try {
        var body = JSON.parse(e.postData.contents || '{}');
        action  = body.action || '';
        payload = body.data   || body;
      } catch(_) {}
    }

    var result;

    switch (action) {
      case 'guardarInscripcion':
        result = guardarInscripcion(payload);
        break;
      case 'setup':
        result = setupSheets();
        break;
      default:
        result = fail('Acción POST no reconocida: ' + action);
    }

    return jsonResponse(result);
  } catch(err) {
    return jsonResponse(fail('Error interno en POST: ' + err.message));
  }
}
