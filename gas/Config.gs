// =========================================================
// Config.gs — Configuración global del proyecto
// Torneo Comunal de Atletismo Escolar 2026 — SLEP Colchagua
// =========================================================

var SPREADSHEET_ID = '1UbIfFb_A2iXlfefylK-6m5xEXY9P-fPGoSBqrNOb34c';

var SHEET_ESCUELAS      = 'ESCUELAS';
var SHEET_INSCRIPCIONES = 'INSCRIPCIONES';
var SHEET_RESUMEN       = 'RESUMEN';

var ANIOS_SUB14   = [2012, 2013, 2014];
var ANIOS_JUVENIL = [2009, 2010, 2011];
var MAX_ESTUDIANTES_POR_ESTABLECIMIENTO = 20;

var HEADERS_INSCRIPCIONES = [
  'id_inscripcion',
  'fecha_registro',
  'id_establecimiento',
  'nombre_establecimiento',
  'nombre_responsable',
  'cargo_responsable',
  'correo_responsable',
  'telefono_responsable',
  'nombre_estudiante',
  'rut_estudiante',
  'sexo',
  'fecha_nacimiento',
  'anio_nacimiento',
  'categoria',
  'pruebas_pista',
  'prueba_campo',
  'participa_posta',
  'tipo_posta',
  'observaciones'
];
