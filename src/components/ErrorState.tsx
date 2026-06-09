interface ErrorStateProps {
  titulo?: string
  mensaje: string
  onReintentar?: () => void
}

export default function ErrorState({
  titulo = 'Ocurrió un error',
  mensaje,
  onReintentar,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 max-w-md mx-auto text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        style={{ background: 'var(--coral-50)', color: 'var(--coral-600)' }}
      >
        ✕
      </div>
      <div>
        <p
          className="text-base font-bold mb-1"
          style={{ color: 'var(--coral-700)', fontFamily: 'var(--font-display)' }}
        >
          {titulo}
        </p>
        <p className="text-sm" style={{ color: 'var(--fg-3)' }}>
          {mensaje}
        </p>
      </div>
      {onReintentar && (
        <button className="btn btn-secondary btn-sm" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}
