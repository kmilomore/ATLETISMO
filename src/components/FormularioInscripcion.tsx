import { useState, useEffect, useCallback } from 'react'
import type { Escuela, Estudiante, FormularioData, FormErrors, EstudianteError } from '../types'
import { MAX_ESTUDIANTES, calcularCategoria } from '../constants'
import { validarRut, validarEmail } from '../utils/validaciones'
import { getEscuelas, getEscuelasInscritas, guardarInscripcion } from '../services/api'
import EstudianteCard from './EstudianteCard'
import { SkeletonSelectEscuela, SkeletonFormulario } from './SkeletonLoader'

function nuevoEstudiante(): Estudiante {
  return {
    id: crypto.randomUUID(),
    nombre: '',
    rut: '',
    sinRut: false,
    sexo: '',
    fechaNacimiento: '',
    anioNacimiento: null,
    categoria: '',
    pruebasPista: [],
    pruebaCampo: '',
    participaPosta: false,
    tipoPosta: '',
    observaciones: '',
  }
}

type Paso = 'formulario' | 'resumen' | 'exito'

export default function FormularioInscripcion({ onVolver }: { onVolver: () => void }) {
  const [escuelas, setEscuelas] = useState<Escuela[]>([])
  const [cargandoEscuelas, setCargandoEscuelas] = useState(true)
  const [errorEscuelas, setErrorEscuelas] = useState('')
  const [escuelasInscritas, setEscuelasInscritas] = useState<Set<string>>(new Set())

  const [form, setForm] = useState<FormularioData>({
    escuelaId: '',
    nombreEstablecimiento: '',
    comunaEstablecimiento: '',
    dependenciaEstablecimiento: '',
    nombreResponsable: '',
    cargoResponsable: '',
    correoResponsable: '',
    telefonoResponsable: '',
    estudiantes: [nuevoEstudiante()],
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [paso, setPaso] = useState<Paso>('formulario')
  const [enviando, setEnviando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')
  const [folio, setFolio] = useState('')

  useEffect(() => {
    setCargandoEscuelas(true)
    Promise.all([getEscuelas(), getEscuelasInscritas()])
      .then(([lista, inscritas]) => {
        setEscuelas(lista)
        setEscuelasInscritas(inscritas)
      })
      .catch((e: Error) => setErrorEscuelas(e.message))
      .finally(() => setCargandoEscuelas(false))
  }, [])

  /* Prevenir cierre accidental */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (paso === 'formulario' && form.estudiantes.some((s) => s.nombre)) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [paso, form.estudiantes])

  function seleccionarEscuela(id: string) {
    const esc = escuelas.find((e) => e.id === id)
    setForm((f) => ({
      ...f,
      escuelaId: id,
      nombreEstablecimiento: esc?.nombre ?? '',
      comunaEstablecimiento: esc?.comuna ?? '',
      dependenciaEstablecimiento: esc?.dependencia ?? '',
    }))
    setErrors((e) => ({ ...e, escuelaId: undefined }))
  }

  function agregarEstudiante() {
    if (form.estudiantes.length >= MAX_ESTUDIANTES) return
    setForm((f) => ({ ...f, estudiantes: [...f.estudiantes, nuevoEstudiante()] }))
  }

  function actualizarEstudiante(i: number, updated: Estudiante) {
    setForm((f) => {
      const arr = [...f.estudiantes]
      arr[i] = updated
      return { ...f, estudiantes: arr }
    })
    setErrors((e) => {
      const arr = [...(e.estudiantes ?? [])]
      arr[i] = null
      return { ...e, estudiantes: arr }
    })
  }

  function eliminarEstudiante(i: number) {
    if (form.estudiantes.length <= 1) return
    setForm((f) => ({ ...f, estudiantes: f.estudiantes.filter((_, idx) => idx !== i) }))
    setErrors((e) => ({
      ...e,
      estudiantes: (e.estudiantes ?? []).filter((_, idx) => idx !== i),
    }))
  }

  const validar = useCallback((): boolean => {
    const errs: FormErrors = {}

    if (!form.escuelaId) errs.escuelaId = 'Seleccione un establecimiento'
    if (!form.nombreResponsable.trim()) errs.nombreResponsable = 'Campo obligatorio'
    if (!form.cargoResponsable.trim()) errs.cargoResponsable = 'Campo obligatorio'

    const emailCheck = validarEmail(form.correoResponsable)
    if (!emailCheck.valido) errs.correoResponsable = emailCheck.mensaje

    if (!form.telefonoResponsable.trim()) errs.telefonoResponsable = 'Campo obligatorio'

    /* Normalizar RUTs para deduplicar (sin puntos ni guión, en minúsculas) */
    const normalizar = (r: string) => r.replace(/[.\s-]/g, '').toLowerCase()
    const rutsVistos = new Set<string>()

    const estErrors: (EstudianteError | null)[] = form.estudiantes.map((s) => {
      const e: EstudianteError = {}
      if (!s.nombre.trim()) e.nombre = 'Nombre requerido'

      if (!s.rut.trim()) {
        e.rut = s.sinRut ? 'Ingrese el documento de identidad' : 'RUT requerido'
      } else {
        const rutNorm = normalizar(s.rut)
        if (rutsVistos.has(rutNorm)) {
          e.rut = 'Documento duplicado en este establecimiento'
        } else if (!s.sinRut) {
          const { valido, mensaje } = validarRut(s.rut)
          if (!valido) {
            e.rut = mensaje
          } else {
            rutsVistos.add(rutNorm)
          }
        } else {
          if (s.rut.trim().length < 5) {
            e.rut = 'Documento demasiado corto (mín. 5 caracteres)'
          } else {
            rutsVistos.add(rutNorm)
          }
        }
      }

      if (!s.sexo) e.sexo = 'Seleccione sexo'
      if (!s.fechaNacimiento) e.fechaNacimiento = 'Fecha requerida'

      const cat = s.anioNacimiento ? calcularCategoria(s.anioNacimiento) : ''
      if (cat === 'No válida') {
        e.categoria = `El año ${s.anioNacimiento} no pertenece a ninguna categoría válida`
      }
      return Object.keys(e).length > 0 ? e : null
    })

    if (estErrors.some((e) => e !== null)) {
      errs.estudiantes = estErrors
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [form])

  function generarFolio(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return `TCA2026-${code}`
  }

  function irAResumen() {
    if (validar()) {
      if (!folio) setFolio(generarFolio())
      setPaso('resumen')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function enviar() {
    setEnviando(true)
    setMensajeError('')
    try {
      const resp = await guardarInscripcion(form)
      if (resp.success) {
        setPaso('exito')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setMensajeError(resp.message || 'Error al enviar la inscripción')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error de conexión'
      setMensajeError(msg)
    } finally {
      setEnviando(false)
    }
  }

  /* ── Vista: Éxito / Agradecimiento ────────────────────────────── */
  if (paso === 'exito') {
    const sub14 = form.estudiantes.filter((s) => s.categoria === 'Sub-14').length
    const juvenil = form.estudiantes.filter((s) => s.categoria === 'Juvenil').length
    return (
      <div className="page-container py-16">
        <div className="max-w-xl mx-auto">

          {/* Icono y titular */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-5"
              style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)', fontSize: 36 }}
            >
              ✓
            </div>
            <h2
              className="text-3xl font-black mb-3"
              style={{ color: 'var(--navy-500)', fontFamily: 'var(--font-display)' }}
            >
              ¡Postulación confirmada!
            </h2>
            <p style={{ color: 'var(--fg-3)', fontSize: 15, lineHeight: 1.6 }}>
              La postulación de <strong style={{ color: 'var(--navy-500)' }}>{form.nombreEstablecimiento}</strong> fue
              registrada exitosamente en el Torneo Comunal de Atletismo Escolar 2026.
            </p>
          </div>

          {/* Folio */}
          <div
            className="card mb-6 text-center"
            style={{ borderTop: '4px solid var(--status-success)', padding: '20px 28px' }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-3)', marginBottom: 6 }}>
              Número de folio de postulación
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                color: 'var(--navy-500)',
                background: 'var(--neutral-50)',
                borderRadius: 8,
                padding: '10px 24px',
                display: 'inline-block',
              }}
            >
              {folio}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--fg-3)' }}>
              Guarde este número como comprobante de su postulación.
            </p>
          </div>

          {/* Resumen de lo inscrito */}
          <div className="card mb-6" style={{ borderTop: '4px solid var(--royal-500)' }}>
            <div className="card-body">
              <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--navy-500)' }}>
                Resumen de la postulación
              </p>
              <div className="flex gap-6 justify-center mb-4" style={{ flexWrap: 'wrap' }}>
                {[
                  { label: 'Atletas inscritos', value: form.estudiantes.length, color: 'var(--navy-500)' },
                  { label: 'Sub-14', value: sub14, color: 'var(--royal-500)' },
                  { label: 'Juvenil', value: juvenil, color: 'var(--royal-600)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <div style={{ fontSize: 34, fontWeight: 900, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-3)', letterSpacing: '0.08em' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--fg-2)', borderTop: '1px solid var(--border-1)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div><span style={{ color: 'var(--fg-3)', fontWeight: 700 }}>Responsable:</span> {form.nombreResponsable} — {form.cargoResponsable}</div>
                <div><span style={{ color: 'var(--fg-3)', fontWeight: 700 }}>Contacto:</span> {form.correoResponsable}{form.telefonoResponsable ? ` · ${form.telefonoResponsable}` : ''}</div>
              </div>
            </div>
          </div>

          {/* Aviso */}
          <div className="alert alert--info mb-6">
            <div className="alert-body">
              <span className="alert-title">¿Qué sigue?</span>
              <p className="alert-desc">
                El equipo organizador de SLEP Colchagua revisará la información. Ante cualquier consulta, mencione su folio <strong>{folio}</strong>.
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="btn btn-primary btn-lg" onClick={onVolver}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Vista: Folio + Resumen de confirmación ────────── */
  if (paso === 'resumen') {
    const fechaHoy = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
    const sub14 = form.estudiantes.filter((s) => s.categoria === 'Sub-14')
    const juvenil = form.estudiantes.filter((s) => s.categoria === 'Juvenil')
    const damas = form.estudiantes.filter((s) => s.sexo === 'Dama')
    const varones = form.estudiantes.filter((s) => s.sexo === 'Varón')

    return (
      <div className="page-container py-10">
        <div className="max-w-4xl mx-auto">

          {/* Encabezado no imprimible */}
          <div className="no-print mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="hero-eyebrow mb-1" style={{ color: 'var(--royal-500)' }}>Paso 3 de 3 — Revisión y confirmación</div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--navy-500)', fontFamily: 'var(--font-display)', margin: 0 }}>
                Folio de postulación
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--fg-3)' }}>
                Revise el consolidado completo. Puede imprimir el folio antes de confirmar.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-md"
              onClick={() => window.print()}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 16 }}>🖨</span> Imprimir folio
            </button>
          </div>

          {/* ══ FOLIO IMPRIMIBLE ══ */}
          <div id="folio-postulacion" className="print-folio">

            {/* Cabecera del folio */}
            <div
              className="folio-header"
              style={{
                background: 'var(--navy-500)',
                color: '#fff',
                padding: '20px 20px',
                borderRadius: '10px 10px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75, marginBottom: 4 }}>
                  SLEP Colchagua — Sistema de Inscripción
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                  Torneo Comunal de Atletismo Escolar 2026
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  Folio de Postulación · {fechaHoy}
                </div>
              </div>
              <div className="folio-header-folio" style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7, textTransform: 'uppercase' }}>N° de folio</div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '4px 12px',
                    borderRadius: 6,
                    marginTop: 4,
                  }}
                >
                  {folio}
                </div>
              </div>
            </div>

            {/* Cuerpo del folio */}
            <div
              style={{
                border: '1px solid var(--border-1)',
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                overflow: 'hidden',
              }}
            >
              {/* Datos del establecimiento */}
              <div className="folio-section" style={{ padding: '20px 20px', borderBottom: '1px solid var(--border-1)', background: 'var(--neutral-50)' }}>
                <div
                  style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--royal-500)', marginBottom: 12 }}
                >
                  Datos del establecimiento
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3" style={{ fontSize: 13 }}>
                  {[
                    { label: 'Establecimiento', value: form.nombreEstablecimiento },
                    { label: 'Comuna', value: form.comunaEstablecimiento || '—' },
                    { label: 'Dependencia', value: form.dependenciaEstablecimiento || '—' },
                    { label: 'Responsable', value: form.nombreResponsable },
                    { label: 'Cargo', value: form.cargoResponsable },
                    { label: 'Correo electrónico', value: form.correoResponsable },
                    { label: 'Teléfono', value: form.telefonoResponsable || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-3)', letterSpacing: '0.08em' }}>{label}</div>
                      <div style={{ fontWeight: 600, color: 'var(--fg-1)', marginTop: 2 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen estadístico */}
              <div
                style={{
                  padding: '14px 28px',
                  borderBottom: '1px solid var(--border-1)',
                  display: 'flex',
                  gap: 28,
                  flexWrap: 'wrap',
                  background: '#fff',
                }}
              >
                {[
                  { label: 'Total atletas', value: form.estudiantes.length, accent: 'var(--navy-500)' },
                  { label: 'Sub-14', value: sub14.length, accent: 'var(--royal-500)' },
                  { label: 'Juvenil', value: juvenil.length, accent: 'var(--royal-600)' },
                  { label: 'Damas', value: damas.length, accent: 'var(--coral-500)' },
                  { label: 'Varones', value: varones.length, accent: 'var(--navy-400)' },
                ].map(({ label, value, accent }) => (
                  <div key={label} style={{ textAlign: 'center', minWidth: 64 }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: accent, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-3)', letterSpacing: '0.08em', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Tabla de estudiantes */}
              <div style={{ padding: '0 0 8px 0' }}>
                <div
                  style={{ padding: '14px 28px 10px', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--royal-500)' }}
                >
                  Nómina de atletas inscritos
                </div>
                <div className="table-container" style={{ margin: '0 0 8px 0' }}>
                  <table className="data-table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 28 }}>#</th>
                        <th>Nombre completo</th>
                        <th>RUT</th>
                        <th>Sexo</th>
                        <th>F. Nac.</th>
                        <th>Categoría</th>
                        <th>Pruebas de pista</th>
                        <th>Prueba de campo</th>
                        <th>Posta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.estudiantes.map((s, i) => (
                        <tr key={s.id}>
                          <td style={{ color: 'var(--fg-muted)', textAlign: 'center' }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.rut}</td>
                          <td>
                            <span className={`chip ${s.sexo === 'Dama' ? 'chip-info' : 'chip-navy'}`} style={{ fontSize: 10 }}>
                              {s.sexo}
                            </span>
                          </td>
                          <td style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                            {s.fechaNacimiento
                              ? new Date(s.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-CL')
                              : s.anioNacimiento ?? '—'}
                          </td>
                          <td>
                            <span className={`chip ${s.categoria === 'Sub-14' ? 'chip-info' : 'chip-navy'}`} style={{ fontSize: 10 }}>
                              {s.categoria}
                            </span>
                          </td>
                          <td style={{ fontSize: 11 }}>{s.pruebasPista.join(' · ') || '—'}</td>
                          <td style={{ fontSize: 11 }}>{s.pruebaCampo || '—'}</td>
                          <td style={{ fontSize: 11 }}>
                            {s.participaPosta ? (s.tipoPosta || 'Sí') : 'No'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pie del folio */}
              <div
                style={{
                  padding: '12px 28px',
                  borderTop: '1px solid var(--border-1)',
                  background: 'var(--neutral-50)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11,
                  color: 'var(--fg-3)',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span>Folio: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--navy-500)' }}>{folio}</strong></span>
                <span style={{ fontStyle: 'italic' }}>Documento generado el {fechaHoy} — Torneo Comunal de Atletismo Escolar 2026, SLEP Colchagua</span>
                <div
                  style={{
                    border: '1px solid var(--border-1)',
                    borderRadius: 4,
                    padding: '2px 28px 18px',
                    fontSize: 10,
                    color: 'var(--fg-3)',
                    textAlign: 'center',
                  }}
                >
                  Firma responsable
                </div>
              </div>
            </div>
          </div>
          {/* ══ FIN FOLIO ══ */}

          {/* Mensaje de error */}
          {mensajeError && (
            <div className="alert alert--danger mt-6">
              <div className="alert-body">
                <span className="alert-title">Error al enviar</span>
                <p className="alert-desc">{mensajeError}</p>
              </div>
            </div>
          )}

          {/* Botones de acción (no imprimibles) */}
          <div className="no-print mt-6 flex gap-3 justify-between flex-wrap">
            <button
              className="btn btn-ghost btn-md"
              onClick={() => setPaso('formulario')}
              disabled={enviando}
            >
              ← Editar formulario
            </button>
            <div className="flex gap-3">
              <button
                className="btn btn-secondary btn-md"
                onClick={() => window.print()}
                disabled={enviando}
              >
                🖨 Imprimir folio
              </button>
              <button
                className="btn btn-primary btn-md"
                onClick={enviar}
                disabled={enviando}
                style={{ minWidth: 180 }}
              >
                {enviando ? '⏳ Enviando...' : 'Confirmar postulación →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Cargando establecimientos: skeleton de todo el formulario ── */
  if (cargandoEscuelas) return <SkeletonFormulario />

  /* ── Vista principal: Formulario ────────────── */
  return (
    <div className="page-container py-10">
      <div className="max-w-3xl mx-auto">
        {/* Stepper */}
        <div className="mb-8">
          <nav className="stepper" aria-label="Pasos del proceso">
            {[
              { label: 'Establecimiento', estado: 'active' },
              { label: 'Estudiantes', estado: 'pending' },
              { label: 'Confirmación', estado: 'pending' },
            ].map((s, i) => (
              <div key={i} className={`stepper__step ${s.estado}`}>
                <div className="stepper__bubble">{i + 1}</div>
                <div className="stepper__label">{s.label}</div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sección: Datos del establecimiento */}
        <div className="card mb-6" style={{ borderTop: '4px solid var(--royal-500)' }}>
          <div className="card-body">
            <h3
              className="text-lg font-black mb-4"
              style={{ color: 'var(--navy-500)', fontFamily: 'var(--font-display)' }}
            >
              Datos del establecimiento
            </h3>

            <div className="field mb-4">
              <label className="field-label">Establecimiento educacional *</label>

              {cargandoEscuelas ? (
                <SkeletonSelectEscuela />
              ) : errorEscuelas ? (
                <div className="alert alert--danger">
                  <div className="alert-body">
                    <span className="alert-title">Error al cargar establecimientos</span>
                    <p className="alert-desc">{errorEscuelas}</p>
                  </div>
                </div>
              ) : (() => {
                const disponibles = escuelas.filter((e) => !escuelasInscritas.has(e.id))
                const yaInscritas = escuelas.length - disponibles.length
                return (
                  <>
                    <select
                      className={`input ${errors.escuelaId ? 'input--error' : ''}`}
                      value={form.escuelaId}
                      onChange={(e) => seleccionarEscuela(e.target.value)}
                    >
                      <option value="">
                        — Seleccione su establecimiento ({disponibles.length} disponible{disponibles.length !== 1 ? 's' : ''}) —
                      </option>
                      {disponibles.map((esc) => (
                        <option key={esc.id} value={esc.id}>
                          {esc.nombre}
                          {esc.rbd ? ` (RBD: ${esc.rbd})` : ''}
                        </option>
                      ))}
                    </select>

                    {yaInscritas > 0 && (
                      <div className="alert alert--info mt-2" style={{ padding: '10px 14px' }}>
                        <div className="alert-body">
                          <p className="alert-desc">
                            <strong>{yaInscritas}</strong> establecimiento{yaInscritas !== 1 ? 's' : ''} ya {yaInscritas !== 1 ? 'tienen' : 'tiene'} inscripción registrada y no aparece{yaInscritas !== 1 ? 'n' : ''} en el listado.
                          </p>
                        </div>
                      </div>
                    )}

                    {disponibles.length === 0 && (
                      <div className="alert alert--warning mt-2">
                        <div className="alert-body">
                          <span className="alert-title">Todos los establecimientos ya están inscritos</span>
                          <p className="alert-desc">No hay establecimientos disponibles para nueva inscripción.</p>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              {errors.escuelaId && <span className="field-error">{errors.escuelaId}</span>}
            </div>

            {/* Datos automáticos del establecimiento seleccionado */}
            {form.escuelaId && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                <div className="field">
                  <label className="field-label">Comuna</label>
                  <input
                    className="input"
                    value={form.comunaEstablecimiento || '—'}
                    readOnly
                    tabIndex={-1}
                    style={{ background: 'var(--neutral-50)', color: 'var(--fg-2)', cursor: 'default' }}
                  />
                </div>
                <div className="field">
                  <label className="field-label">Dependencia</label>
                  <input
                    className="input"
                    value={form.dependenciaEstablecimiento || '—'}
                    readOnly
                    tabIndex={-1}
                    style={{ background: 'var(--neutral-50)', color: 'var(--fg-2)', cursor: 'default' }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  { key: 'nombreResponsable' as const, label: 'Nombre del responsable *', placeholder: 'Nombre completo', type: 'text' as const },
                  { key: 'cargoResponsable' as const, label: 'Cargo del responsable *', placeholder: 'Ej: Jefe de UTP', type: 'text' as const },
                  { key: 'correoResponsable' as const, label: 'Correo electrónico *', placeholder: 'correo@escuela.cl', type: 'email' as const },
                  { key: 'telefonoResponsable' as const, label: 'Teléfono *', placeholder: '+56 9 1234 5678', type: 'tel' as const },
                ]
              ).map(({ key, label, placeholder, type }) => (
                <div key={key} className="field">
                  <label className="field-label">{label}</label>
                  <input
                    type={type ?? 'text'}
                    className={`input ${errors[key] ? 'input--error' : ''}`}
                    value={form[key]}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                      setErrors((er) => ({ ...er, [key]: undefined }))
                    }}
                    placeholder={placeholder}
                  />
                  {errors[key] && <span className="field-error">{errors[key]}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección: Estudiantes */}
        <div className="mb-2 flex items-center justify-between">
          <h3
            className="text-lg font-black"
            style={{ color: 'var(--navy-500)', fontFamily: 'var(--font-display)' }}
          >
            Estudiantes ({form.estudiantes.length}/{MAX_ESTUDIANTES})
          </h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={agregarEstudiante}
            disabled={form.estudiantes.length >= MAX_ESTUDIANTES}
            type="button"
          >
            + Agregar estudiante
          </button>
        </div>

        <div className="alert alert--info mb-4">
          <div className="alert-body">
            <p className="alert-desc">
              Años válidos: <strong>Sub-14 (2012, 2013, 2014)</strong> · <strong>Juvenil (2009, 2010, 2011)</strong>. Cada estudiante puede elegir hasta 2 pruebas de pista y 1 de campo.
            </p>
          </div>
        </div>

        {form.estudiantes.map((s, i) => (
          <EstudianteCard
            key={s.id}
            estudiante={s}
            index={i}
            error={errors.estudiantes?.[i] ?? null}
            onUpdate={(updated) => actualizarEstudiante(i, updated)}
            onRemove={() => eliminarEstudiante(i)}
          />
        ))}

        {form.estudiantes.length < MAX_ESTUDIANTES && (
          <button
            className="btn btn-secondary btn-md w-full mb-6"
            onClick={agregarEstudiante}
            type="button"
          >
            + Agregar otro estudiante
          </button>
        )}

        {errors.general && (
          <div className="alert alert--danger mb-4">
            <div className="alert-body">
              <span className="alert-title">Hay errores en el formulario</span>
              <p className="alert-desc">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-between flex-wrap">
          <button className="btn btn-ghost btn-md" onClick={onVolver} type="button">
            ← Volver al inicio
          </button>
          <button className="btn btn-primary btn-lg" onClick={irAResumen} type="button">
            Revisar y confirmar →
          </button>
        </div>
      </div>
    </div>
  )
}
