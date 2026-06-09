// =========================================================
// ResumenService.gs — Métricas y resumen del torneo
// =========================================================

function getResumen() {
  try {
    var ss    = getSpreadsheet();
    var hoja  = ss.getSheetByName(SHEET_INSCRIPCIONES);
    if (!hoja) return ok('Sin datos', emptyResumen());

    var datos = hoja.getDataRange().getValues();
    if (datos.length < 2) return ok('Sin inscripciones', emptyResumen());

    var headers  = datos[0];
    var idxEscNm = headers.indexOf('nombre_establecimiento');
    var idxEscId = headers.indexOf('id_establecimiento');
    var idxCat   = headers.indexOf('categoria');
    var idxSexo  = headers.indexOf('sexo');
    var idxPista = headers.indexOf('pruebas_pista');
    var idxCampo = headers.indexOf('prueba_campo');
    var idxPosta = headers.indexOf('participa_posta');
    var idxTipoPosta = headers.indexOf('tipo_posta');

    var totalInscritos = 0;
    var establecimientos = {};
    var porCategoria  = {};
    var porSexo       = {};
    var porPruebaPista= {};
    var porPruebaCampo= {};
    var porPosta      = {};
    var porEstablecimiento = {};

    for (var i = 1; i < datos.length; i++) {
      var fila = datos[i];
      totalInscritos++;

      var escNm = idxEscNm >= 0 ? fila[idxEscNm].toString().trim() : '';
      var escId = idxEscId >= 0 ? fila[idxEscId].toString().trim() : '';
      if (escId) establecimientos[escId] = true;
      if (escNm) {
        porEstablecimiento[escNm] = (porEstablecimiento[escNm] || 0) + 1;
      }

      var cat = idxCat >= 0 ? fila[idxCat].toString().trim() : '';
      if (cat) porCategoria[cat] = (porCategoria[cat] || 0) + 1;

      var sexo = idxSexo >= 0 ? fila[idxSexo].toString().trim() : '';
      if (sexo) porSexo[sexo] = (porSexo[sexo] || 0) + 1;

      var pista = idxPista >= 0 ? fila[idxPista].toString().trim() : '';
      if (pista) {
        pista.split(',').forEach(function(p) {
          p = p.trim();
          if (p) porPruebaPista[p] = (porPruebaPista[p] || 0) + 1;
        });
      }

      var campo = idxCampo >= 0 ? fila[idxCampo].toString().trim() : '';
      if (campo) porPruebaCampo[campo] = (porPruebaCampo[campo] || 0) + 1;

      var posta = idxPosta >= 0 ? fila[idxPosta].toString().trim() : '';
      if (posta === 'Sí') {
        var tipoPosta = idxTipoPosta >= 0 ? fila[idxTipoPosta].toString().trim() : 'Sí';
        var keyPosta = tipoPosta || 'Sin tipo';
        porPosta[keyPosta] = (porPosta[keyPosta] || 0) + 1;
      }
    }

    var resumen = {
      totalInscritos:     totalInscritos,
      totalEstablecimientos: Object.keys(establecimientos).length,
      porCategoria:        porCategoria,
      porSexo:             porSexo,
      porPruebaPista:      porPruebaPista,
      porPruebaCampo:      porPruebaCampo,
      porPosta:            porPosta,
      porEstablecimiento:  porEstablecimiento,
    };

    return ok('Resumen calculado', resumen);
  } catch(e) {
    return fail('Error al calcular resumen: ' + e.message);
  }
}

function emptyResumen() {
  return {
    totalInscritos: 0,
    totalEstablecimientos: 0,
    porCategoria: {},
    porSexo: {},
    porPruebaPista: {},
    porPruebaCampo: {},
    porPosta: {},
    porEstablecimiento: {},
  };
}
