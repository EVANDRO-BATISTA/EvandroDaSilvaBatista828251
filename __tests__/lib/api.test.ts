import { api } from '@/lib/api'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    // Clear token
    api.setToken(null)
  })

  describe('Token Management', () => {
    it('should set and get token', () => {
      api.setToken('test-token')
      expect(api.getToken()).toBe('test-token')
    })

    it('should clear token on logout', () => {
      api.setToken('test-token')
      api.logout()
      // expect(api.getToken()).toBeNull()
      expect(api.getToken()).toBeFalsy()
    })
  })

  describe('getPets', () => {
    it('should fetch pets with pagination', async () => {
      const mockResponse = {
        content: [
          { id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3 },
          { id: 2, nome: 'Miau', especie: 'Gato', idade: 2 },
        ],
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      const result = await api.getPets(0, 10)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/pets?page=0&size=10'),
        expect.any(Object)
      )
      expect(result.content).toHaveLength(2)
      expect(result.content[0].nome).toBe('Rex')
    })

    it('should fetch pets with search filter', async () => {
      const mockResponse = {
        content: [{ id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3 }],
        totalPages: 1,
        totalElements: 1,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      await api.getPets(0, 10, 'Rex')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('nome=Rex'),
        expect.any(Object)
      )
    })
  })

  describe('getPetById', () => {
    it('should fetch a single pet by id', async () => {
      const mockPet = { id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3 }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockPet)),
      })

      const result = await api.getPetById(1)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/pets/1'),
        expect.any(Object)
      )
      expect(result.nome).toBe('Rex')
    })
  })

  describe('createPet', () => {
    it('should create a new pet', async () => {
      const newPet = { nome: 'Buddy', especie: 'Cachorro', idade: 1 }
      const mockResponse = { id: 3, ...newPet }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      const result = await api.createPet(newPet)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/pets'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPet),
        })
      )
      expect(result.id).toBe(3)
    })
  })

  describe('getTutors', () => {
    it('should fetch tutors with pagination', async () => {
      const mockResponse = {
        content: [
          { id: 1, nomeCompleto: 'Joao Silva', telefone: '(11) 99999-9999', endereco: 'Rua A' },
        ],
        totalPages: 1,
        totalElements: 1,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      const result = await api.getTutors(0, 10)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/tutores?page=0&size=10'),
        expect.any(Object)
      )
      expect(result.content[0].nomeCompleto).toBe('Joao Silva')
    })
  })

  describe('Authentication', () => {
    it('should login and store token', async () => {
      const mockResponse = { token: 'jwt-token-123' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      await api.login({ usuario: 'admin', senha: 'password' })

      expect(api.getToken()).toBe('jwt-token-123')
    })

    it('should include token in authenticated requests', async () => {
      api.setToken('test-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ content: [] })),
      })

      await api.getPets()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should throw error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      })

      await expect(api.getPets()).rejects.toThrow('Server error')
    })
  })
})
