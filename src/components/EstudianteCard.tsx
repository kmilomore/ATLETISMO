import { useEffect, useState } from 'react'
import type { Estudiante, EstudianteError, Sexo } from '../types'
import { validarRut, formatearRut } from '../utils/validaciones'
import {
  calcularCategoria,
  PRUEBAS_PISTA,
  PRUEBAS_CAMPO,
  POSTAS,
  MAX_PRUEBAS_PISTA,
} from '../constants'

interface Props {
  estudiante: Estudiante
  index: number
  error: EstudianteError | null
  onUpdate: (updated: Estudiante) => void
  onRemove: () => void
}

export default function EstudianteCard({ estudiante, index, error, onUpdate, onRemove }: Props) {
  const e = estudiante
  const [rutError, setRutError] = useState<string>('')

  /* Validar RUT en tiempo real cuando el campo pierde foco */
  function handleRutBlur() {
    if (!e.rut.trim() || e.sinRut) { setRutError(''); return }
    const { valido, mensaje } = validarRut(e.rut)
    if (!valido) {
      setRutError(mensaje ?? 'RUT inválido')
    } else {
      setRutError('')
      onUpdate({ ...e, rut: formatearRut(e.rut) })
    }
  }

  function toggleSinRut() {
    onUpdate({ ...e, sinRut: !e.sinRut, rut: '' })
    setRutError('')
  }

  /* Auto-calcular categoría cuando cambia la fecha de nacimiento */
  useEffect(() => {
    const year = e.fechaNacimiento
      ? new Date(e.fechaNacimiento).getFullYear()
      : null
    const anio = year || e.anioNacimiento
    const cat = calcularCategoria(anio)
    if (cat !== e.categoria || anio !== e.anioNacimiento) {
      onUpdate({
        ...e,
        anioNacimiento: anio,
        categoria: cat,
        pruebasPista: [],
        pruebaCampo: '',
        participaPosta: false,
        tipoPosta: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [e.fechaNacimiento])

  const cat = e.categoria
  const pruebasPistaDisp = cat === 'Sub-14' || cat === 'Juvenil' ? PRUEBAS_PISTA[cat] : []
  const pruebasCampoDisp = cat === 'Sub-14' || cat === 'Juvenil' ? PRUEBAS_CAMPO[cat] : []
  const postasDisp = cat === 'Sub-14' || cat === 'Juvenil' ? POSTAS[cat] : []
  const categoriaInvalida = cat === 'No válida'

  function togglePistaPrueba(prueba: string) {
    const sel = e.pruebasPista
    if (sel.includes(prueba)) {
      onUpdate({ ...e, pruebasPista: sel.filter((p) => p !== prueba) })
    } else if (sel.length < MAX_PRUEBAS_PISTA) {
      onUpdate({ ...e, pruebasPista: [...sel, prueba] })
    }
  }

  return (
    <div
      className="card relative mb-4"
      style={{
        borderLeft: categoriaInvalida
          ? '4px solid var(--coral-500)'
          : '4px solid var(--royal-500)',
      }}
    >
      {/* Header de la tarjeta */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--neutral-50)' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
            style={{ background: 'var(--navy-500)', color: '#fff' }}
          >
            {index + 1}
          </span>
          <span className="font-bold text-sm" style={{ color: 'var(--navy-500)' }}>
            {e.nombre || 'Nuevo estudiante'}
          </span>
          {cat === 'Sub-14' && <span className="chip chip-info">Sub-14</span>}
          {cat === 'Juvenil' && <span className="chip chip-navy">Juvenil</span>}
          {cat === 'No válida' && <span className="chip chip-danger">Año no válido</span>}
          {e.sinRut && <span className="chip chip-warning">Extranjero</span>}
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--coral-600)', fontSize: 12 }}
          onClick={onRemove}
          type="button"
        >
          Eliminar
        </button>
      </div>

      <div className="card-body">
        {/* Alerta año inválido */}
        {categoriaInvalida && (
          <div className="alert alert--danger tinted mb-4">
            <div className="alert-icon" style={{ color: 'var(--coral-600)', fontSize: 18 }}>✕</div>
            <div className="alert-body">
              <span className="alert-title">Año de nacimiento no válido</span>
              <p className="alert-desc">
                Los años válidos son 2012-2014 (Sub-14) y 2009-2011 (Juvenil). Este estudiante no puede inscribirse.
              </p>
            </div>
          </div>
        )}

        {/* Fila 1: Nombre y RUT / Documento */}
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
          <div className="field">
            <label className="field-label">Nombre completo *</label>
            <input
              className={`input ${error?.nombre ? 'input--error' : ''}`}
              value={e.nombre}
              onChange={(ev) => onUpdate({ ...e, nombre: ev.target.value })}
              placeholder="Nombre y apellidos"
            />
            {error?.nombre && <span className="field-error">{error.nombre}</span>}
          </div>

          <div className="field">
            {/* Cabecera del campo con toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <label className="field-label" style={{ marginBottom: 0 }}>
                {e.sinRut ? 'Documento de identidad *' : 'RUT *'}
              </label>
              <button
                type="button"
                onClick={toggleSinRut}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 999,
                  border: '1px solid',
                  cursor: 'pointer',
                  background: e.sinRut ? 'var(--status-warning-bg)' : 'var(--neutral-100)',
                  borderColor: e.sinRut ? 'var(--status-warning)' : 'var(--border-2)',
                  color: e.sinRut ? 'var(--status-warning)' : 'var(--fg-3)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {e.sinRut ? '⚠ RUT provisorio' : 'Sin RUT (extranjero)'}
              </button>
            </div>

            {e.sinRut ? (
              <>
                <input
                  className={`input ${error?.rut ? 'input--error' : ''}`}
                  value={e.rut}
                  onChange={(ev) => { onUpdate({ ...e, rut: ev.target.value }); setRutError('') }}
                  placeholder="Pasaporte / Doc. provisorio"
                  autoComplete="off"
                />
                <span style={{ fontSize: 10, color: 'var(--status-warning)', fontWeight: 600, marginTop: 2 }}>
                  Estudiante extranjero — ingrese pasaporte u otro documento
                </span>
              </>
            ) : (
              <>
                <input
                  className={`input ${(error?.rut || rutError) ? 'input--error' : ''}`}
                  value={e.rut}
                  onChange={(ev) => { onUpdate({ ...e, rut: ev.target.value }); setRutError('') }}
                  onBlur={handleRutBlur}
                  placeholder="12.345.678-9"
                  autoComplete="off"
                />
              </>
            )}

            {(rutError || error?.rut) && (
              <span className="field-error">{rutError || error?.rut}</span>
            )}
            {!e.sinRut && !rutError && !error?.rut && e.rut && validarRut(e.rut).valido && (
              <span style={{ fontSize: 11, color: 'var(--status-success)', fontWeight: 700 }}>
                ✓ RUT válido
              </span>
            )}
            {e.sinRut && !error?.rut && e.rut.trim().length >= 5 && (
              <span style={{ fontSize: 11, color: 'var(--status-success)', fontWeight: 700 }}>
                ✓ Documento registrado
              </span>
            )}
          </div>
        </div>

        {/* Fila 2: Sexo, Fecha de nacimiento, Año, Categoría */}
        <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-4">
          <div className="field">
            <label className="field-label">Sexo *</label>
            <select
              className={`input ${error?.sexo ? 'input--error' : ''}`}
              value={e.sexo}
              onChange={(ev) => onUpdate({ ...e, sexo: ev.target.value as Sexo | '' })}
            >
              <option value="">Seleccionar</option>
              <option value="Dama">Dama</option>
              <option value="Varón">Varón</option>
            </select>
            {error?.sexo && <span className="field-error">{error.sexo}</span>}
          </div>

          <div className="field">
            <label className="field-label">Fecha de nacimiento *</label>
            <input
              type="date"
              className={`input ${error?.fechaNacimiento ? 'input--error' : ''}`}
              value={e.fechaNacimiento}
              onChange={(ev) =>
                onUpdate({
                  ...e,
                  fechaNacimiento: ev.target.value,
                  anioNacimiento: ev.target.value
                    ? new Date(ev.target.value).getFullYear()
                    : null,
                })
              }
            />
            {error?.fechaNacimiento && <span className="field-error">{error.fechaNacimiento}</span>}
          </div>

          <div className="field">
            <label className="field-label">Año nacimiento</label>
            <input
              className="input"
              value={e.anioNacimiento ?? ''}
              disabled
              style={{ background: 'var(--neutral-50)', color: 'var(--fg-3)' }}
            />
          </div>

          <div className="field">
            <label className="field-label">Categoría</label>
            <input
              className="input"
              value={e.categoria}
              disabled
              style={{
                background: 'var(--neutral-50)',
                color: categoriaInvalida ? 'var(--coral-600)' : 'var(--royal-500)',
                fontWeight: 700,
              }}
            />
            {error?.categoria && <span className="field-error">{error.categoria}</span>}
          </div>
        </div>

        {/* Pruebas de pista */}
        {pruebasPistaDisp.length > 0 && (
          <div className="field mb-4">
            <label className="field-label">
              Pruebas de pista (máx. {MAX_PRUEBAS_PISTA})
              <span className="ml-2 text-xs font-medium normal-case" style={{ color: 'var(--fg-3)' }}>
                — {e.pruebasPista.length}/{MAX_PRUEBAS_PISTA} seleccionadas
              </span>
            </label>
            <div className="checkbox-group">
              {pruebasPistaDisp.map((p) => {
                const sel = e.pruebasPista.includes(p)
                const max = !sel && e.pruebasPista.length >= MAX_PRUEBAS_PISTA
                return (
                  <label
                    key={p}
                    className={`checkbox-option ${sel ? 'selected' : ''} ${max ? 'disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={sel}
                      onChange={() => !max && togglePistaPrueba(p)}
                      disabled={max}
                    />
                    {p}
                  </label>
                )
              })}
            </div>
            {error?.pruebasPista && <span className="field-error">{error.pruebasPista}</span>}
          </div>
        )}

        {/* Prueba de campo */}
        {pruebasCampoDisp.length > 0 && (
          <div className="field mb-4">
            <label className="field-label">Prueba de campo (opcional, máx. 1)</label>
            <div className="checkbox-group">
              {pruebasCampoDisp.map((p) => {
                const sel = e.pruebaCampo === p
                return (
                  <div
                    key={p}
                    role="checkbox"
                    aria-checked={sel}
                    tabIndex={0}
                    className={`checkbox-option ${sel ? 'selected' : ''}`}
                    onClick={() => onUpdate({ ...e, pruebaCampo: sel ? '' : p })}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault()
                        onUpdate({ ...e, pruebaCampo: sel ? '' : p })
                      }
                    }}
                  >
                    {p}
                  </div>
                )
              })}
            </div>
            {error?.pruebaCampo && <span className="field-error">{error.pruebaCampo}</span>}
          </div>
        )}

        {/* Posta */}
        {postasDisp.length > 0 && (
          <div className="flex flex-wrap gap-6 mb-4">
            <div className="field">
              <label className="field-label">¿Participa en posta?</label>
              <div className="flex gap-3 mt-1">
                {['Sí', 'No'].map((op) => {
                  const sel = (op === 'Sí') === e.participaPosta
                  return (
                    <div
                      key={op}
                      role="radio"
                      aria-checked={sel}
                      tabIndex={0}
                      className={`checkbox-option ${sel ? 'selected' : ''}`}
                      onClick={() =>
                        onUpdate({
                          ...e,
                          participaPosta: op === 'Sí',
                          tipoPosta: op === 'No' ? '' : e.tipoPosta,
                        })
                      }
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                          ev.preventDefault()
                          onUpdate({
                            ...e,
                            participaPosta: op === 'Sí',
                            tipoPosta: op === 'No' ? '' : e.tipoPosta,
                          })
                        }
                      }}
                    >
                      {op}
                    </div>
                  )
                })}
              </div>
            </div>

            {e.participaPosta && postasDisp.length > 0 && (
              <div className="field">
                <label className="field-label">Tipo de posta</label>
                <select
                  className="input"
                  value={e.tipoPosta}
                  onChange={(ev) => onUpdate({ ...e, tipoPosta: ev.target.value })}
                  style={{ width: 'auto', minWidth: 160 }}
                >
                  <option value="">Seleccionar</option>
                  {postasDisp.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Observaciones */}
        <div className="field">
          <label className="field-label">Observaciones (opcional)</label>
          <textarea
            className="input"
            rows={2}
            style={{ resize: 'vertical' }}
            value={e.observaciones}
            onChange={(ev) => onUpdate({ ...e, observaciones: ev.target.value })}
            placeholder="Información adicional relevante"
          />
        </div>
      </div>
    </div>
  )
}
