import { NextResponse } from 'next/server'
import { mockDb, validateToken, getTutorWithPets } from '@/lib/mock-db'

function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  return validateToken(token)
}

export async function GET(request: Request) {
  //GET é público -não é necessária autenticação
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0')
  const size = parseInt(searchParams.get('size') || '10')

  const tutors = mockDb.tutors.map(t => getTutorWithPets(t.id)!)
  
  const totalElements = tutors.length
  const totalPages = Math.ceil(totalElements / size)
  const start = page * size
  const content = tutors.slice(start, start + size)

  return NextResponse.json({
    content,
    totalPages,
    totalElements,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
  })
}

export async function POST(request: Request) {
  const auth = checkAuth(request)
  if (!auth) {
    return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nomeCompleto, telefone, endereco } = body

    if (!nomeCompleto || !telefone || !endereco) {
      return NextResponse.json(
        { message: 'Nome completo, telefone e endereco sao obrigatorios' },
        { status: 400 }
      )
    }

    const newTutor = {
      id: mockDb.nextTutorId++,
      nomeCompleto,
      telefone,
      endereco,
      foto: undefined,
      pets: [],
    }

    mockDb.tutors.push(newTutor)

    return NextResponse.json(newTutor, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Erro ao processar requisicao' },
      { status: 500 }
    )
  }
}
