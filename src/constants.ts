import type { Categoria } from './types'

export const GAS_ENDPOINT =
  import.meta.env.VITE_GAS_ENDPOINT as string

export const SHEET_URL =
  import.meta.env.VITE_SHEET_URL as string

export const MAX_ESTUDIANTES = 20
export const MAX_PRUEBAS_PISTA = 2

export const ANIOS_SUB14 = [2012, 2013, 2014]
export const ANIOS_JUVENIL = [2009, 2010, 2011]

export const PRUEBAS_PISTA: Record<Categoria, string[]> = {
  'Sub-14': ['80 metros', '150 metros', '400 metros', '800 metros', '1500 metros'],
  'Juvenil': ['100 metros', '200 metros', '400 metros', '800 metros', '2000 metros'],
}

export const PRUEBAS_CAMPO: Record<Categoria, string[]> = {
  'Sub-14': ['Salto alto', 'Salto largo', 'Lanzamiento de bala', 'Lanzamiento de disco'],
  'Juvenil': ['Salto alto', 'Salto largo', 'Lanzamiento de bala', 'Lanzamiento de disco', 'Lanzamiento de jabalina'],
}

export const POSTAS: Record<Categoria, string[]> = {
  'Sub-14': ['5x80'],
  'Juvenil': ['4x100', 'Combinada sueca'],
}

export function calcularCategoria(anio: number | null): Categoria | 'No válida' | '' {
  if (!anio) return ''
  if (ANIOS_SUB14.includes(anio)) return 'Sub-14'
  if (ANIOS_JUVENIL.includes(anio)) return 'Juvenil'
  return 'No válida'
}
