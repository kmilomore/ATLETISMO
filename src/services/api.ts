import { GAS_ENDPOINT } from '../constants'
import type { ApiResponse, Escuela, InscripcionRow, ResumenData, FormularioData } from '../types'

async function gasGet<T>(action: string): Promise<ApiResponse<T>> {
  const url = `${GAS_ENDPOINT}?action=${action}&_=${Date.now()}`
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<ApiResponse<T>>
}

async function gasPost<T>(action: string, payload: unknown): Promise<ApiResponse<T>> {
  const params = new URLSearchParams()
  params.append('action', action)
  params.append('data', JSON.stringify(payload))
  const res = await fetch(GAS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<ApiResponse<T>>
}

export async function getEscuelas(): Promise<Escuela[]> {
  const resp = await gasGet<Escuela[]>('escuelas')
  if (!resp.success) throw new Error(resp.message || 'Error al cargar establecimientos')
  return resp.data ?? []
}

/** IDs de establecimientos que ya tienen al menos una inscripción registrada */
export async function getEscuelasInscritas(): Promise<Set<string>> {
  try {
    const resp = await gasGet<string[]>('escuelasInscritas')
    if (!resp.success || !resp.data) return new Set()
    return new Set(resp.data)
  } catch {
    return new Set()
  }
}

export async function guardarInscripcion(data: FormularioData): Promise<ApiResponse> {
  return gasPost('guardarInscripcion', data)
}

export async function getInscripciones(): Promise<InscripcionRow[]> {
  const resp = await gasGet<InscripcionRow[]>('inscripciones')
  if (!resp.success) throw new Error(resp.message || 'Error al cargar inscripciones')
  return resp.data ?? []
}

export async function getResumen(): Promise<ResumenData> {
  const resp = await gasGet<ResumenData>('resumen')
  if (!resp.success) throw new Error(resp.message || 'Error al cargar resumen')
  return resp.data!
}

export function getExportCSVUrl(): string {
  return `${GAS_ENDPOINT}?action=exportarCSV&_=${Date.now()}`
}
