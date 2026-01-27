import type { Pet, Tutor, PaginatedResponse, LoginCredentials } from '@/lib/types'

describe('Type Definitions', () => {
  describe('Pet Type', () => {
    it('should accept valid pet object', () => {
      const pet: Pet = {
        id: 1,
        nome: 'Rex',
        especie: 'Cachorro',
        idade: 3,
        raca: 'Labrador',
        foto: 'https://example.com/photo.jpg',
        tutorId: 1,
      }

      expect(pet.id).toBe(1)
      expect(pet.nome).toBe('Rex')
      expect(pet.especie).toBe('Cachorro')
      expect(pet.idade).toBe(3)
      expect(pet.raca).toBe('Labrador')
    })

    it('should accept pet without optional fields', () => {
      const pet: Pet = {
        id: 1,
        nome: 'Miau',
        especie: 'Gato',
        idade: 2,
      }

      expect(pet.raca).toBeUndefined()
      expect(pet.foto).toBeUndefined()
      expect(pet.tutorId).toBeUndefined()
    })
  })

  describe('Tutor Type', () => {
    it('should accept valid tutor object', () => {
      const tutor: Tutor = {
        id: 1,
        nomeCompleto: 'Joao Silva',
        telefone: '(11) 99999-9999',
        endereco: 'Rua das Flores, 123',
        foto: 'https://example.com/tutor.jpg',
        pets: [],
      }

      expect(tutor.id).toBe(1)
      expect(tutor.nomeCompleto).toBe('Joao Silva')
      expect(tutor.telefone).toBe('(11) 99999-9999')
    })

    it('should accept tutor with pets array', () => {
      const tutor: Tutor = {
        id: 1,
        nomeCompleto: 'Maria Oliveira',
        telefone: '(11) 88888-8888',
        endereco: 'Av. Principal, 456',
        pets: [
          { id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3 },
          { id: 2, nome: 'Miau', especie: 'Gato', idade: 2 },
        ],
      }

      expect(tutor.pets).toHaveLength(2)
      expect(tutor.pets?.[0].nome).toBe('Rex')
    })
  })

  describe('PaginatedResponse Type', () => {
    it('should accept valid paginated response', () => {
      const response: PaginatedResponse<Pet> = {
        content: [
          { id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3 },
        ],
        totalPages: 5,
        totalElements: 50,
        size: 10,
        number: 0,
        first: true,
        last: false,
      }

      expect(response.content).toHaveLength(1)
      expect(response.totalPages).toBe(5)
      expect(response.first).toBe(true)
      expect(response.last).toBe(false)
    })
  })

  describe('LoginCredentials Type', () => {
    it('should accept valid login credentials', () => {
      const credentials: LoginCredentials = {
        usuario: 'admin',
        senha: 'password123',
      }

      expect(credentials.usuario).toBe('admin')
      expect(credentials.senha).toBe('password123')
    })
  })
})
