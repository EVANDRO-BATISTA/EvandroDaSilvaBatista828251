// Pet Types
export interface Pet {
  id: number
  nome: string
  especie: string
  idade: number
  raca?: string
  foto?: string
  tutorId?: number
}

export interface PetCreateInput {
  nome: string
  especie: string
  idade: number
  raca?: string
}

export interface PetUpdateInput extends PetCreateInput {
  id: number
}

// Tutor Types
export interface Tutor {
  id: number
  nomeCompleto: string
  telefone: string
  endereco: string
  foto?: string
  pets?: Pet[]
}

export interface TutorCreateInput {
  nomeCompleto: string
  telefone: string
  endereco: string
}

export interface TutorUpdateInput extends TutorCreateInput {
  id: number
}

// Auth Types
export interface LoginCredentials {
  usuario: string
  senha: string
}

export interface AuthResponse {
  token: string
  refreshToken?: string
  expiresIn?: number
}

export interface User {
  id: number
  usuario: string
  nome: string
}

// Pagination Types
export interface PaginatedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// API Response Types
export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}
