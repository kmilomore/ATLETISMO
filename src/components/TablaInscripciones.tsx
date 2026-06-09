import type { InscripcionRow } from '../types'

interface Props {
  filas: InscripcionRow[]
}

function CategoriaChip({ cat }: { cat: string }) {
  if (cat === 'Sub-14') return <span className="chip chip-info">Sub-14</span>
  if (cat === 'Juvenil') return <span className="chip chip-navy">Juvenil</span>
  return <span className="chip chip-neutral">{cat}</span>
}

export default function TablaInscripciones({ filas }: Props) {
  if (!filas.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-3"
        style={{ background: '#fff', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-1)' }}
      >
        <span style={{ fontSize: 40 }}>🏃</span>
        <p className="font-bold text-sm" style={{ color: 'var(--fg-3)' }}>
          Sin resultados para los filtros aplicados
        </p>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Establecimiento</th>
            <th>Estudiante</th>
            <th>RUT</th>
            <th>Sexo</th>
            <th>Nacimiento</th>
            <th>Categoría</th>
            <th>Pruebas pista</th>
            <th>Campo</th>
            <th>Posta</th>
            <th>Responsable</th>
            <th>Fecha registro</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={f.id_inscripcion || i}>
              <td style={{ color: 'var(--fg-muted)', fontSize: 12 }}>{i + 1}</td>
              <td>
                <div className="font-bold text-sm" style={{ color: 'var(--navy-500)' }}>
                  {f.nombre_establecimiento}
                </div>
                <div className="text-xs" style={{ color: 'var(--fg-3)' }}>
                  {f.id_establecimiento}
                </div>
              </td>
              <td className="font-medium" style={{ color: 'var(--fg-1)', minWidth: 160 }}>
                {f.nombre_estudiante}
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{f.rut_estudiante}</td>
              <td>
                <span className={`chip ${f.sexo === 'Dama' ? 'chip-info' : 'chip-navy'}`}>
                  {f.sexo}
                </span>
              </td>
              <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                {f.fecha_nacimiento ? f.fecha_nacimiento.slice(0, 10) : '—'}
                <div style={{ color: 'var(--fg-3)' }}>{f.anio_nacimiento}</div>
              </td>
              <td>
                <CategoriaChip cat={f.categoria} />
              </td>
              <td style={{ maxWidth: 200 }}>
                {f.pruebas_pista ? (
                  <div className="flex flex-wrap gap-1">
                    {f.pruebas_pista.split(',').map((p) => (
                      <span key={p} className="chip chip-neutral" style={{ fontSize: 10 }}>
                        {p.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--fg-muted)' }}>—</span>
                )}
              </td>
              <td>
                {f.prueba_campo ? (
                  <span className="chip chip-success" style={{ fontSize: 10 }}>
                    {f.prueba_campo}
                  </span>
                ) : (
                  <span style={{ color: 'var(--fg-muted)' }}>—</span>
                )}
              </td>
              <td>
                {f.participa_posta === 'Sí' ? (
                  <div>
                    <span className="chip chip-warning" style={{ fontSize: 10 }}>
                      Sí
                    </span>
                    {f.tipo_posta && (
                      <div className="text-xs mt-1" style={{ color: 'var(--fg-3)' }}>
                        {f.tipo_posta}
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: 'var(--fg-muted)', fontSize: 12 }}>No</span>
                )}
              </td>
              <td>
                <div className="text-sm" style={{ color: 'var(--fg-2)' }}>
                  {f.nombre_responsable}
                </div>
                <div className="text-xs" style={{ color: 'var(--fg-3)' }}>
                  {f.cargo_responsable}
                </div>
              </td>
              <td style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--fg-3)' }}>
                {f.fecha_registro ? new Date(f.fecha_registro).toLocaleDateString('es-CL') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
