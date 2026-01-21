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
  { params }: { params: Promise<{ id: string; petId: string }> }
) {
  const auth = checkAuth(request)
  if (!auth) {
    return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 })
  }

  const { id, petId } = await params
  const tutorId = parseInt(id)
  const petIdNum = parseInt(petId)

  const tutor = mockDb.tutors.find(t => t.id === tutorId)
  if (!tutor) {
    return NextResponse.json({ message: 'Tutor nao encontrado' }, { status: 404 })
  }

  const petIndex = mockDb.pets.findIndex(p => p.id === petIdNum)
  if (petIndex === -1) {
    return NextResponse.json({ message: 'Pet nao encontrado' }, { status: 404 })
  }

  //Vincula o animal de estimação ao tutor
  mockDb.pets[petIndex].tutorId = tutorId

  return new NextResponse(null, { status: 204 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; petId: string }> }
) {
  const auth = checkAuth(request)
  if (!auth) {
    return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 })
  }

  const { id, petId } = await params
  const tutorId = parseInt(id)
  const petIdNum = parseInt(petId)

  const tutor = mockDb.tutors.find(t => t.id === tutorId)
  if (!tutor) {
    return NextResponse.json({ message: 'Tutor nao encontrado' }, { status: 404 })
  }

  const petIndex = mockDb.pets.findIndex(p => p.id === petIdNum && p.tutorId === tutorId)
  if (petIndex === -1) {
    return NextResponse.json({ message: 'Pet nao vinculado a este tutor' }, { status: 404 })
  }

  //Desvincula o pet do tutor
  mockDb.pets[petIndex].tutorId = undefined

  return new NextResponse(null, { status: 204 })
}
