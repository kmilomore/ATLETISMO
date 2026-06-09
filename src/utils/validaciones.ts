/* =========================================================
   validaciones.ts — RUT chileno, email, credenciales admin
   ========================================================= */

/* ── RUT chileno ─────────────────────────────────────────
   Acepta formatos: 12345678-9 / 12.345.678-9 / 12345678-K
   ─────────────────────────────────────────────────────── */
export function limpiarRut(rut: string): string {
  return rut.replace(/[.\s-]/g, '').toUpperCase()
}

export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut)
  if (limpio.length < 2) return rut
  const cuerpo = limpio.slice(0, -1)
  const dv     = limpio.slice(-1)
  // Separar miles
  const cuerpoFmt = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpoFmt}-${dv}`
}

function calcularDV(cuerpo: string): string {
  let suma = 0
  let multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }
  const resto = 11 - (suma % 11)
  if (resto === 11) return '0'
  if (resto === 10) return 'K'
  return resto.toString()
}

export function validarRut(rut: string): { valido: boolean; mensaje?: string } {
  if (!rut || !rut.trim()) return { valido: false, mensaje: 'RUT requerido' }

  const limpio = limpiarRut(rut.trim())

  // Mínimo: 1 dígito + dv (ej: "1-9"), máximo 9 dígitos + dv
  const match = limpio.match(/^(\d{1,8})([0-9K])$/)
  if (!match) {
    return { valido: false, mensaje: 'Formato inválido. Use 12.345.678-9' }
  }

  const cuerpo = match[1]
  const dvIngresado = match[2]

  if (parseInt(cuerpo, 10) < 1000000) {
    return { valido: false, mensaje: 'RUT inválido (muy corto)' }
  }

  const dvCalculado = calcularDV(cuerpo)
  if (dvIngresado !== dvCalculado) {
    return { valido: false, mensaje: `Dígito verificador incorrecto (debe ser ${dvCalculado})` }
  }

  return { valido: true }
}

/* ── Email ──────────────────────────────────────────────── */
export function validarEmail(email: string): { valido: boolean; mensaje?: string } {
  if (!email || !email.trim()) return { valido: false, mensaje: 'Correo requerido' }
  // RFC 5322 simplified — dominio real con extensión
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  if (!re.test(email.trim())) {
    return { valido: false, mensaje: 'Correo no válido (ej: nombre@dominio.cl)' }
  }
  // Rechazar dominios claramente falsos
  const partes = email.trim().split('@')
  const dominio = partes[1]?.toLowerCase() ?? ''
  const fake = ['test.com', 'example.com', 'correo.com', 'email.com', 'fake.com', 'noexiste.com']
  if (fake.includes(dominio)) {
    return { valido: false, mensaje: 'Use un correo institucional real' }
  }
  return { valido: true }
}

/* ── Credenciales panel admin ───────────────────────────── */
const ADMIN_USUARIO = 'ximena.pino@slepcolchagua.cl'
const ADMIN_CLAVE   = 'Slep.2026'

export function verificarCredenciales(usuario: string, clave: string): boolean {
  return usuario.trim().toLowerCase() === ADMIN_USUARIO.toLowerCase() &&
         clave === ADMIN_CLAVE
}
