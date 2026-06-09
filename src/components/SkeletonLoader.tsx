/* Skeleton pulse animation — definida en index.css como @keyframes skeleton-pulse */
interface SkeletonBlockProps {
  height?: number | string
  width?: string
  radius?: number | string
  className?: string
}

function Block({ height = 16, width = '100%', radius = 6, className = '' }: SkeletonBlockProps) {
  return (
    <div
      className={`skeleton-block ${className}`}
      style={{ height, width, borderRadius: radius }}
    />
  )
}

/* ── Selector de escuelas ──────────────────────────── */
export function SkeletonSelectEscuela() {
  return (
    <div className="flex flex-col gap-3">
      {/* Campo select */}
      <Block height={40} radius={8} />

      {/* Hint informativo */}
      <div className="flex items-center gap-2 mt-1">
        <Block height={10} width="60%" radius={4} />
      </div>

      {/* Lista de opciones "fantasma" debajo — muestra que hay contenido cargando */}
      <div
        className="flex flex-col gap-0 overflow-hidden"
        style={{
          border: '1px solid var(--border-1)',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        {[100, 85, 92, 78, 88, 95].map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3"
            style={{
              height: 38,
              borderBottom: i < 5 ? '1px solid var(--border-1)' : 'none',
            }}
          >
            <Block height={10} width={`${w}%`} radius={4} />
          </div>
        ))}
      </div>

      <p
        className="text-xs text-center"
        style={{ color: 'var(--fg-muted)', fontStyle: 'italic' }}
      >
        Cargando establecimientos desde Google Sheets…
      </p>
    </div>
  )
}

/* ── Formulario completo ───────────────────────────── */
export function SkeletonFormulario() {
  return (
    <div className="page-container py-10">
      <div className="max-w-3xl mx-auto">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <Block height={32} width="32px" radius={9999} />
                <Block height={12} width={80} radius={4} />
                {n < 3 && <Block height={2} width={40} radius={2} className="mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Card: Datos del establecimiento */}
        <div className="card mb-6" style={{ borderTop: '4px solid var(--neutral-200)' }}>
          <div className="card-body flex flex-col gap-5">
            <Block height={18} width="45%" radius={4} />
            {/* select escuelas */}
            <div className="flex flex-col gap-2">
              <Block height={11} width="30%" radius={3} />
              <Block height={40} radius={8} />
              <Block height={10} width="55%" radius={3} />
            </div>
            {/* grid 2 cols */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Block height={11} width="40%" radius={3} />
                  <Block height={40} radius={8} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card: Estudiantes */}
        <div className="card mb-6" style={{ borderTop: '4px solid var(--neutral-200)' }}>
          <div className="card-body flex flex-col gap-5">
            <Block height={18} width="35%" radius={4} />
            {/* Tarjeta estudiante */}
            <div
              className="flex flex-col gap-4"
              style={{ border: '1px solid var(--border-1)', borderLeft: '4px solid var(--neutral-300)', borderRadius: 8, padding: '16px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Block height={32} width="32px" radius={9999} />
                  <Block height={14} width={120} radius={4} />
                </div>
                <Block height={28} width={70} radius={6} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Block height={11} width="35%" radius={3} />
                    <Block height={40} radius={8} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Block height={11} width="60%" radius={3} />
                    <Block height={40} radius={8} />
                  </div>
                ))}
              </div>
              {/* Pruebas pista */}
              <div className="flex flex-col gap-2">
                <Block height={11} width="40%" radius={3} />
                <div className="flex gap-2 flex-wrap">
                  {[90, 110, 80, 100, 95, 85].map((w, i) => (
                    <Block key={i} height={34} width={w} radius={8} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <Block height={44} width={180} radius={8} />
        </div>

        <p
          className="text-xs text-center mt-6"
          style={{ color: 'var(--fg-muted)', fontStyle: 'italic' }}
        >
          Cargando establecimientos disponibles…
        </p>
      </div>
    </div>
  )
}

/* ── Genérico — filas de texto ─────────────────────── */
export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  const widths = [100, 80, 92, 70, 85, 75, 90, 65]
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Block key={i} height={14} width={`${widths[i % widths.length]}%`} />
      ))}
    </div>
  )
}

export default Block
