import type { Pet, Tutor, User } from './types'

// Simulated database with initial data
export const mockDb = {
  users: [
    { id: 1, usuario: 'admin', senha: 'admin123', nome: 'Administrador' },
    { id: 2, usuario: 'teste', senha: 'teste123', nome: 'Usuario Teste' },
  ] as (User & { senha: string })[],

  pets: [
    { id: 1, nome: 'Rex', especie: 'Cachorro', idade: 3, raca: 'Pastor Alemao', foto: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', tutorId: 1 },
    { id: 2, nome: 'Mia', especie: 'Gato', idade: 2, raca: 'Siames', foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', tutorId: 1 },
    { id: 3, nome: 'Thor', especie: 'Cachorro', idade: 5, raca: 'Labrador', foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', tutorId: 2 },
    { id: 4, nome: 'Luna', especie: 'Gato', idade: 1, raca: 'Persa', foto: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400', tutorId: undefined },
    { id: 5, nome: 'Max', especie: 'Cachorro', idade: 4, raca: 'Golden Retriever', foto: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', tutorId: 3 },
    { id: 6, nome: 'Bella', especie: 'Gato', idade: 3, raca: 'Maine Coon', foto: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', tutorId: undefined },
    { id: 7, nome: 'Bob', especie: 'Cachorro', idade: 2, raca: 'Bulldog', foto: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400', tutorId: undefined },
    { id: 8, nome: 'Nina', especie: 'Passaro', idade: 1, raca: 'Calopsita', foto: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400', tutorId: 2 },
    { id: 9, nome: 'Simba', especie: 'Gato', idade: 4, raca: 'Bengal', foto: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400', tutorId: undefined },
    { id: 10, nome: 'Zeus', especie: 'Cachorro', idade: 6, raca: 'Rottweiler', foto: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=400', tutorId: undefined },
    { id: 11, nome: 'Mel', especie: 'Cachorro', idade: 1, raca: 'Poodle', foto: 'https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?w=400', tutorId: undefined },
    { id: 12, nome: 'Pipoca', especie: 'Hamster', idade: 1, raca: 'Sirio', foto: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400', tutorId: undefined },
  ] as Pet[],

  tutors: [
    { id: 1, nomeCompleto: 'Joao Silva Santos', telefone: '(65) 99999-1111', endereco: 'Rua das Flores, 123 - Cuiaba/MT', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { id: 2, nomeCompleto: 'Maria Oliveira Costa', telefone: '(65) 99888-2222', endereco: 'Av. Brasil, 456 - Varzea Grande/MT', foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
    { id: 3, nomeCompleto: 'Carlos Pereira Lima', telefone: '(66) 99777-3333', endereco: 'Rua Amazonas, 789 - Rondonopolis/MT', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
    { id: 4, nomeCompleto: 'Ana Paula Ferreira', telefone: '(65) 99666-4444', endereco: 'Av. CPA, 321 - Cuiaba/MT', foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
    { id: 5, nomeCompleto: 'Pedro Henrique Souza', telefone: '(66) 99555-5555', endereco: 'Rua Parana, 654 - Sinop/MT', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
  ] as Tutor[],

  tokens: new Map<string, { userId: number; expiresAt: number }>(),
  nextPetId: 13,
  nextTutorId: 6,
}

// Helper functions
export function generateToken(): string {
  return 'mock_token_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function validateToken(token: string): { userId: number } | null {
  const tokenData = mockDb.tokens.get(token)
  if (!tokenData) return null
  if (Date.now() > tokenData.expiresAt) {
    mockDb.tokens.delete(token)
    return null
  }
  return { userId: tokenData.userId }
}

export function getPetsWithTutor(): Pet[] {
  return mockDb.pets.map(pet => {
    if (pet.tutorId) {
      const tutor = mockDb.tutors.find(t => t.id === pet.tutorId)
      return { ...pet, tutor }
    }
    return pet
  })
}

export function getTutorWithPets(tutorId: number): Tutor | null {
  const tutor = mockDb.tutors.find(t => t.id === tutorId)
  if (!tutor) return null
  const pets = mockDb.pets.filter(p => p.tutorId === tutorId)
  return { ...tutor, pets }
}
