import { NextResponse } from 'next/server'
import { mockDb, validateToken, getTutorWithPets } from '@/lib/mock-db'

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
  const tutorId = parseInt(id)
  const tutor = getTutorWithPets(tutorId)

  if (!tutor) {
    return NextResponse.json({ message: 'Tutor nao encontrado' }, { status: 404 })
  }

  return NextResponse.json(tutor)
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
  const tutorId = parseInt(id)
  const tutorIndex = mockDb.tutors.findIndex(t => t.id === tutorId)

  if (tutorIndex === -1) {
    return NextResponse.json({ message: 'Tutor nao encontrado' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { nomeCompleto, telefone, endereco } = body

    mockDb.tutors[tutorIndex] = {
      ...mockDb.tutors[tutorIndex],
      nomeCompleto: nomeCompleto ?? mockDb.tutors[tutorIndex].nomeCompleto,
      telefone: telefone ?? mockDb.tutors[tutorIndex].telefone,
      endereco: endereco ?? mockDb.tutors[tutorIndex].endereco,
    }

    return NextResponse.json(getTutorWithPets(tutorId))
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
  const tutorId = parseInt(id)
  const tutorIndex = mockDb.tutors.findIndex(t => t.id === tutorId)

  if (tutorIndex === -1) {
    return NextResponse.json({ message: 'Tutor nao encontrado' }, { status: 404 })
  }

  // Unlink all pets from this tutor
  mockDb.pets.forEach(pet => {
    if (pet.tutorId === tutorId) {
      pet.tutorId = undefined
    }
  })

  mockDb.tutors.splice(tutorIndex, 1)

  return new NextResponse(null, { status: 204 })
}
