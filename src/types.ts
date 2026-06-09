export type Vista = 'inicio' | 'inscripcion' | 'admin'
export type Sexo = 'Dama' | 'Varón'
export type Categoria = 'Sub-14' | 'Juvenil'

export interface Escuela {
  id: string
  nombre: string
  rbd?: string
  comuna?: string
  dependencia?: string
}

export interface Estudiante {
  id: string
  nombre: string
  rut: string
  sexo: Sexo | ''
  fechaNacimiento: string
  anioNacimiento: number | null
  categoria: Categoria | 'No válida' | ''
  pruebasPista: string[]
  pruebaCampo: string
  participaPosta: boolean
  tipoPosta: string
  observaciones: string
}

export interface FormularioData {
  escuelaId: string
  nombreEstablecimiento: string
  comunaEstablecimiento: string
  dependenciaEstablecimiento: string
  nombreResponsable: string
  cargoResponsable: string
  correoResponsable: string
  telefonoResponsable: string
  estudiantes: Estudiante[]
}

export interface InscripcionRow {
  id_inscripcion: string
  fecha_registro: string
  id_establecimiento: string
  nombre_establecimiento: string
  nombre_responsable: string
  cargo_responsable: string
  correo_responsable: string
  telefono_responsable: string
  nombre_estudiante: string
  rut_estudiante: string
  sexo: string
  fecha_nacimiento: string
  anio_nacimiento: number
  categoria: string
  pruebas_pista: string
  prueba_campo: string
  participa_posta: string
  tipo_posta: string
  observaciones: string
}

export interface ResumenData {
  totalInscritos: number
  totalEstablecimientos: number
  porCategoria: Record<string, number>
  porSexo: Record<string, number>
  porPruebaPista: Record<string, number>
  porPruebaCampo: Record<string, number>
  porPosta: Record<string, number>
  porEstablecimiento: Record<string, number>
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
}

export interface EstudianteError {
  nombre?: string
  rut?: string
  sexo?: string
  fechaNacimiento?: string
  categoria?: string
  pruebasPista?: string
  pruebaCampo?: string
}

export interface FormErrors {
  escuelaId?: string
  nombreResponsable?: string
  cargoResponsable?: string
  correoResponsable?: string
  telefonoResponsable?: string
  estudiantes?: (EstudianteError | null)[]
  general?: string
}
