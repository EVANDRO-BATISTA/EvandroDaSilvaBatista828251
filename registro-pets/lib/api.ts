import type {
  Pet,
  PetCreateInput,
  PetUpdateInput,
  Tutor,
  TutorCreateInput,
  TutorUpdateInput,
  LoginCredentials,
  AuthResponse,
  PaginatedResponse,
} from './types'

// Use local API by default, switch to public API by setting this environment variable
// NEXT_PUBLIC_API_URL=https://pet-manager-api.gela.vip
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL='https://pet-manager-api.gela.vip'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log('[❌ ERRO] API Request:', options.method || 'GET', `${API_BASE_URL}${endpoint}`)
    console.log('[❌ ERRO] API Token present:', !!token)
    if (options.body) {
      console.log('[❌ ERRO] API Body:', options.body)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    console.log('[❌ ERRO] API Request:', response.status)

    if (!response.ok) {
      if (response.status === 401) {
        console.log('[❌ ERRO] API 401 - clearing token and redirecting')
        this.setToken(null)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }))
      console.log('[❌ ERRO] API Error:', error)
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    //Lida com respostas vazias
    const text = await response.text()
    if (!text) return {} as T
    const data = JSON.parse(text)
    console.log('[❌ ERRO] API Response data:', data)
    return data
  }

 //Endpoints de autenticação
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/autenticacao/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (response.token) {
      this.setToken(response.token)
    }
    return response
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/autenticacao/refresh', {
      method: 'PUT',
    })
    if (response.token) {
      this.setToken(response.token)
    }
    return response
  }

  logout() {
    this.setToken(null)
  }

  // Endpoints Pet
  async getPets(page = 0, size = 10, nome?: string): Promise<PaginatedResponse<Pet>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    if (nome) {
      params.append('nome', nome)
    }
    return this.request<PaginatedResponse<Pet>>(`/v1/pets?${params}`)
  }

  async getPetById(id: number): Promise<Pet> {
    return this.request<Pet>(`/v1/pets/${id}`)
  }

  async createPet(data: PetCreateInput): Promise<Pet> {
    return this.request<Pet>('/v1/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePet(id: number, data: PetUpdateInput): Promise<Pet> {
    return this.request<Pet>(`/v1/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePet(id: number): Promise<void> {
    return this.request<void>(`/v1/pets/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadPetPhoto(petId: number, file: File): Promise<Pet> {
    const formData = new FormData()
    formData.append('foto', file)
    
    const token = this.getToken()
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/v1/pets/${petId}/fotos`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Falha ao fazer upload da foto')
    }

    return response.json()
  }

  // Endpoints Tutor
  async getTutors(page = 0, size = 10): Promise<PaginatedResponse<Tutor>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })
    return this.request<PaginatedResponse<Tutor>>(`/v1/tutores?${params}`)
  }

  async getTutorById(id: number): Promise<Tutor> {
    return this.request<Tutor>(`/v1/tutores/${id}`)
  }

  async createTutor(data: TutorCreateInput): Promise<Tutor> {
    return this.request<Tutor>('/v1/tutores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTutor(id: number, data: TutorUpdateInput): Promise<Tutor> {
    return this.request<Tutor>(`/v1/tutores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTutor(id: number): Promise<void> {
    return this.request<void>(`/v1/tutores/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadTutorPhoto(tutorId: number, file: File): Promise<Tutor> {
    const formData = new FormData()
    formData.append('foto', file)
    
    const token = this.getToken()
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/v1/tutores/${tutorId}/fotos`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Falha ao fazer upload da foto')
    }

    return response.json()
  }

  // Vinculação Pet-Tutor
  async linkPetToTutor(tutorId: number, petId: number): Promise<void> {
    return this.request<void>(`/v1/tutores/${tutorId}/pets/${petId}`, {
      method: 'POST',
    })
  }

  async unlinkPetFromTutor(tutorId: number, petId: number): Promise<void> {
    return this.request<void>(`/v1/tutores/${tutorId}/pets/${petId}`, {
      method: 'DELETE',
    })
  }

  async getTutorPets(tutorId: number): Promise<Pet[]> {
    return this.request<Pet[]>(`/v1/tutores/${tutorId}/pets`)
  }
}

export const api = new ApiClient()
