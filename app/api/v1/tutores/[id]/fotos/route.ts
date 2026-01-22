import { NextResponse } from 'next/server'
import { mockDb, validateToken, getTutorWithPets } from '@/lib/mock-db'

function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  return validateToken(token)
}

export async function POST(
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
    const formData = await request.formData()
    const foto = formData.get('foto') as File | null

    if (!foto) {
      return NextResponse.json(
        { message: 'Nenhuma foto enviada' },
        { status: 400 }
      )
    }

    // In a real app, we would save the file to storage
    // For mock, we'll generate a placeholder URL
    const photoUrl = `https://i.pravatar.cc/400?u=${tutorId}-${Date.now()}`
    
    mockDb.tutors[tutorIndex] = {
      ...mockDb.tutors[tutorIndex],
      foto: photoUrl,
    }

    return NextResponse.json(getTutorWithPets(tutorId))
  } catch {
    return NextResponse.json(
      { message: 'Erro ao processar upload' },
      { status: 500 }
    )
  }
}
