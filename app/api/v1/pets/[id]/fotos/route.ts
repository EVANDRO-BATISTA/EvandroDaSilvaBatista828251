import { NextResponse } from 'next/server'
import { mockDb, validateToken } from '@/lib/mock-db'

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
  const petId = parseInt(id)
  const petIndex = mockDb.pets.findIndex(p => p.id === petId)

  if (petIndex === -1) {
    return NextResponse.json({ message: 'Pet nao encontrado' }, { status: 404 })
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
    const photoUrl = `https://picsum.photos/seed/${petId}-${Date.now()}/400/400`
    
    mockDb.pets[petIndex] = {
      ...mockDb.pets[petIndex],
      foto: photoUrl,
    }

    return NextResponse.json(mockDb.pets[petIndex])
  } catch {
    return NextResponse.json(
      { message: 'Erro ao processar upload' },
      { status: 500 }
    )
  }
}
