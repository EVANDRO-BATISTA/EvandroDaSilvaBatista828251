import { NextResponse } from 'next/server'
import { mockDb, validateToken } from '@/lib/mock-db'

function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  return validateToken(token)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // GET is public - no authentication required
  const { id } = await params
  const petId = parseInt(id)
  const pet = mockDb.pets.find(p => p.id === petId)

  if (!pet) {
    return NextResponse.json({ message: 'Pet nao encontrado' }, { status: 404 })
  }

  // Include tutor data if linked
  let tutor = undefined
  if (pet.tutorId) {
    tutor = mockDb.tutors.find(t => t.id === pet.tutorId)
  }

  return NextResponse.json({ ...pet, tutor })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(request)
  if (!auth) {
    return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 })
  }

  const { id } = await params
  const petId = parseInt(id)
  const petIndex = mockDb.pets.findIndex(p => p.id === petId)

  if (petIndex === -1) {
    return NextResponse.json({ message: 'Pet nao encontrado' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { nome, especie, idade, raca } = body

    mockDb.pets[petIndex] = {
      ...mockDb.pets[petIndex],
      nome: nome ?? mockDb.pets[petIndex].nome,
      especie: especie ?? mockDb.pets[petIndex].especie,
      idade: idade ?? mockDb.pets[petIndex].idade,
      raca: raca ?? mockDb.pets[petIndex].raca,
    }

    return NextResponse.json(mockDb.pets[petIndex])
  } catch {
    return NextResponse.json(
      { message: 'Erro ao processar requisicao' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAuth(request)
  if (!auth) {
    return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 })
  }

  const { id } = await params
  const petId = parseInt(id)
  const petIndex = mockDb.pets.findIndex(p => p.id === petId)

  if (petIndex === -1) {
    return NextResponse.json({ message: 'Pet nao encontrado' }, { status: 404 })
  }

  mockDb.pets.splice(petIndex, 1)

  return new NextResponse(null, { status: 204 })
}
