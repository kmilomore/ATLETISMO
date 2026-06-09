import { useState, useEffect, useMemo, useCallback } from 'react'
import type { InscripcionRow, ResumenData } from '../types'
import { getInscripciones, getResumen, getExportCSVUrl } from '../services/api'
import { SHEET_URL } from '../constants'
import ResumenCards from './ResumenCards'
import TablaInscripciones from './TablaInscripciones'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import LoginAdmin from './LoginAdmin'

export default function PanelAdmin({ onVolver }: { onVolver: () => void }) {
  const [autenticado, setAutenticado] = useState(false)
  const [inscripciones, setInscripciones] = useState<InscripcionRow[]>([])
  const [resumen, setResumen] = useState<ResumenData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstablecimiento, setFiltroEstablecimiento] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroSexo, setFiltroSexo] = useState('')
  const [filtroPrueba, setFiltroPrueba] = useState('')
  const [filtroPosta, setFiltroPosta] = useState('')

  const cargarDatos = useCallback(() => {
    setCargando(true)
    setError('')
    Promise.all([getInscripciones(), getResumen()])
      .then(([insc, res]) => {
        setInscripciones(insc)
        setResumen(res)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { if (autenticado) cargarDatos() }, [autenticado, cargarDatos])

  /* Opciones de filtro */
  const establecimientos = useMemo(
    () => [...new Set(inscripciones.map((r) => r.nombre_establecimiento))].sort(),
    [inscripciones]
  )

  const pruebasPista = useMemo(() => {
    const set = new Set<string>()
    inscripciones.forEach((r) =>
      r.pruebas_pista?.split(',').forEach((p) => set.add(p.trim()))
    )
    return [...set].filter(Boolean).sort()
  }, [inscripciones])

  /* Filtrado */
  const filasFiltradas = useMemo(() => {
    return inscripciones.filter((r) => {
      const q = busqueda.toLowerCase()
      if (q && !r.nombre_estudiante?.toLowerCase().includes(q) &&
               !r.rut_estudiante?.toLowerCase().includes(q) &&
               !r.nombre_establecimiento?.toLowerCase().includes(q)) return false
      if (filtroEstablecimiento && r.nombre_establecimiento !== filtroEstablecimiento) return false
      if (filtroCategoria && r.categoria !== filtroCategoria) return false
      if (filtroSexo && r.sexo !== filtroSexo) return false
      if (filtroPrueba && !r.pruebas_pista?.includes(filtroPrueba)) return false
      if (filtroPosta === 'si' && r.participa_posta !== 'Sí') return false
      if (filtroPosta === 'no' && r.participa_posta === 'Sí') return false
      return true
    })
  }, [inscripciones, busqueda, filtroEstablecimiento, filtroCategoria, filtroSexo, filtroPrueba, filtroPosta])

  const hayFiltros = !!(busqueda || filtroEstablecimiento || filtroCategoria || filtroSexo || filtroPrueba || filtroPosta)

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroEstablecimiento('')
    setFiltroCategoria('')
    setFiltroSexo('')
    setFiltroPrueba('')
    setFiltroPosta('')
  }

  if (!autenticado) {
    return <LoginAdmin onLogin={() => setAutenticado(true)} onVolver={onVolver} />
  }

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="hero-eyebrow mb-1" style={{ color: 'var(--royal-500)' }}>
            Panel de administración
          </div>
          <h2
            className="text-2xl font-black"
            style={{ color: 'var(--navy-500)', fontFamily: 'var(--font-display)', margin: 0 }}
          >
            Torneo Comunal de Atletismo Escolar 2026
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-3)' }}>
            Gestión de inscripciones y métricas del torneo
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-ghost btn-sm" onClick={onVolver}>
            ← Inicio
          </button>
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            Abrir Google Sheet ↗
          </a>
          <a
            href={getExportCSVUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Exportar CSV
          </a>
          <button className="btn btn-secondary btn-sm" onClick={cargarDatos} disabled={cargando}>
            {cargando ? '↻' : '↻ Actualizar'}
          </button>
        </div>
      </div>

      {cargando && <LoadingState mensaje="Cargando datos del torneo..." />}
      {!cargando && error && (
        <ErrorState
          titulo="No se pudieron cargar los datos"
          mensaje={error}
          onReintentar={cargarDatos}
        />
      )}

      {!cargando && !error && (
        <>
          {/* Resumen */}
          {resumen && (
            <section className="mb-8">
              <h3
                className="text-sm font-black uppercase tracking-widest mb-4"
                style={{ color: 'var(--navy-500)' }}
              >
                Indicadores generales
              </h3>
              <ResumenCards resumen={resumen} />
            </section>
          )}

          {/* Tabla */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3
                className="text-sm font-black uppercase tracking-widest"
                style={{ color: 'var(--navy-500)' }}
              >
                Inscripciones ({filasFiltradas.length}
                {hayFiltros ? ` de ${inscripciones.length}` : ''})
              </h3>
              {hayFiltros && (
                <button className="btn btn-ghost btn-sm" onClick={limpiarFiltros}>
                  ✕ Limpiar filtros
                </button>
              )}
            </div>

            {/* Filtros */}
            <div
              className="card mb-4"
              style={{ borderTop: '4px solid var(--royal-500)' }}
            >
              <div className="card-body">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <div className="xl:col-span-2">
                    <input
                      className="input"
                      placeholder="Buscar estudiante, RUT o establecimiento..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>

                  <select
                    className="input"
                    value={filtroEstablecimiento}
                    onChange={(e) => setFiltroEstablecimiento(e.target.value)}
                  >
                    <option value="">Todos los establecimientos</option>
                    {establecimientos.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>

                  <select
                    className="input"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    <option value="Sub-14">Sub-14</option>
                    <option value="Juvenil">Juvenil</option>
                  </select>

                  <select
                    className="input"
                    value={filtroSexo}
                    onChange={(e) => setFiltroSexo(e.target.value)}
                  >
                    <option value="">Todos los sexos</option>
                    <option value="Dama">Dama</option>
                    <option value="Varón">Varón</option>
                  </select>

                  <select
                    className="input"
                    value={filtroPrueba}
                    onChange={(e) => setFiltroPrueba(e.target.value)}
                  >
                    <option value="">Todas las pruebas</option>
                    {pruebasPista.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <select
                    className="input"
                    value={filtroPosta}
                    onChange={(e) => setFiltroPosta(e.target.value)}
                  >
                    <option value="">Posta: todas</option>
                    <option value="si">Participa en posta</option>
                    <option value="no">No participa en posta</option>
                  </select>
                </div>
              </div>
            </div>

            <TablaInscripciones filas={filasFiltradas} />
          </section>
        </>
      )}
    </div>
  )
}
