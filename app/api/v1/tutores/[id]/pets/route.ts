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
  const tutorId = parseInt(id)
  const tutor = mockDb.tutors.find(t => t.id === tutorId)

  if (!tutor) {
    return NextResponse.json({ message: 'Tutor nao encontrado' }, { status: 404 })
  }

  const pets = mockDb.pets.filter(p => p.tutorId === tutorId)

  return NextResponse.json(pets)
}
