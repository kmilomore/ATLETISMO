import type { ResumenData } from '../types'

interface Props {
  resumen: ResumenData
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div
      className="card card-body flex flex-col gap-1"
      style={{ borderTop: `4px solid ${accent ? 'var(--coral-500)' : 'var(--royal-500)'}` }}
    >
      <div
        className="text-3xl font-black"
        style={{
          color: accent ? 'var(--coral-600)' : 'var(--royal-500)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--fg-3)' }}>
        {label}
      </div>
    </div>
  )
}

function MiniStatList({ label, data }: { label: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  if (!entries.length) return null
  return (
    <div
      className="card card-body"
      style={{ borderTop: '4px solid var(--royal-500)' }}
    >
      <p
        className="text-xs font-black uppercase tracking-widest mb-3"
        style={{ color: 'var(--navy-500)' }}
      >
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {entries.slice(0, 8).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium truncate block" style={{ color: 'var(--fg-2)' }}>
                {k}
              </span>
            </div>
            <span
              className="chip chip-info shrink-0"
              style={{ minWidth: 32, justifyContent: 'center' }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResumenCards({ resumen }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total inscritos" value={resumen.totalInscritos} />
        <StatCard label="Establecimientos" value={resumen.totalEstablecimientos} />
        <StatCard label="Sub-14" value={resumen.porCategoria?.['Sub-14'] ?? 0} />
        <StatCard label="Juvenil" value={resumen.porCategoria?.['Juvenil'] ?? 0} />
      </div>

      {/* Distribuciones */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MiniStatList label="Por sexo" data={resumen.porSexo ?? {}} />
        <MiniStatList label="Por prueba de pista" data={resumen.porPruebaPista ?? {}} />
        <MiniStatList label="Por prueba de campo" data={resumen.porPruebaCampo ?? {}} />
        <MiniStatList label="Por posta" data={resumen.porPosta ?? {}} />
        <div className="sm:col-span-2 lg:col-span-2">
          <MiniStatList label="Por establecimiento" data={resumen.porEstablecimiento ?? {}} />
        </div>
      </div>
    </div>
  )
}
