interface LoadingStateProps {
  mensaje?: string
}

export default function LoadingState({ mensaje = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-12 h-12 rounded-full border-4 animate-spin"
        style={{
          borderColor: 'var(--royal-100)',
          borderTopColor: 'var(--royal-500)',
        }}
      />
      <p style={{ color: 'var(--fg-3)', fontWeight: 700, fontSize: 14 }}>{mensaje}</p>
    </div>
  )
}
