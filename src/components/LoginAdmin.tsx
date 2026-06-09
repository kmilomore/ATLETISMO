import { useState } from 'react'
import { verificarCredenciales } from '../utils/validaciones'

interface Props {
  onLogin: () => void
  onVolver: () => void
}

export default function LoginAdmin({ onLogin, onVolver }: Props) {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave]     = useState('')
  const [error, setError]     = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
  const [intentos, setIntentos] = useState(0)
  const bloqueado = intentos >= 5

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (bloqueado) return

    if (!usuario.trim() || !clave) {
      setError('Complete todos los campos')
      return
    }

    if (verificarCredenciales(usuario, clave)) {
      setError('')
      onLogin()
    } else {
      const nuevosIntentos = intentos + 1
      setIntentos(nuevosIntentos)
      if (nuevosIntentos >= 5) {
        setError('Demasiados intentos fallidos. Recargue la página para intentar de nuevo.')
      } else {
        setError(`Credenciales incorrectas. Intento ${nuevosIntentos} de 5.`)
      }
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4"
      style={{ flex: 1 }}
    >
      <div
        className="card w-full max-w-sm"
        style={{ borderTop: '4px solid var(--royal-500)' }}
      >
        <div className="card-body flex flex-col gap-5">
          {/* Header */}
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-3"
              style={{ background: 'var(--navy-500)', color: '#fff' }}
            >
              🔒
            </div>
            <h2
              className="text-lg font-black mb-1"
              style={{ color: 'var(--navy-500)', fontFamily: 'var(--font-display)' }}
            >
              Panel de administración
            </h2>
            <p className="text-xs" style={{ color: 'var(--fg-3)' }}>
              Torneo Comunal de Atletismo Escolar 2026
            </p>
          </div>

          {/* Alerta bloqueado */}
          {bloqueado && (
            <div className="alert alert--danger tinted">
              <div className="alert-body">
                <span className="alert-title">Acceso bloqueado</span>
                <p className="alert-desc">Demasiados intentos fallidos. Recargue la página.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="field">
              <label className="field-label">Correo electrónico</label>
              <input
                type="email"
                className="input"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setError('') }}
                placeholder="usuario@slepcolchagua.cl"
                autoComplete="username"
                disabled={bloqueado}
              />
            </div>

            <div className="field">
              <label className="field-label">Contraseña</label>
              <div className="relative">
                <input
                  type={mostrarClave ? 'text' : 'password'}
                  className={`input ${error ? 'input--error' : ''}`}
                  value={clave}
                  onChange={(e) => { setClave(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={bloqueado}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarClave((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--fg-3)',
                    fontSize: 16,
                    lineHeight: 1,
                    padding: 4,
                  }}
                  tabIndex={-1}
                  aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarClave ? '🙈' : '👁'}
                </button>
              </div>
              {error && <span className="field-error">{error}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-md w-full"
              disabled={bloqueado}
              style={{ justifyContent: 'center' }}
            >
              Ingresar al panel
            </button>
          </form>

          <button
            className="btn btn-ghost btn-sm"
            onClick={onVolver}
            style={{ alignSelf: 'center', fontSize: 13 }}
            type="button"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
