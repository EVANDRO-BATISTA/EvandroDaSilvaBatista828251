import { NextResponse } from 'next/server'
import { mockDb, validateToken, getPetsWithTutor } from '@/lib/mock-db'

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
  const nome = searchParams.get('nome')?.toLowerCase()

  let pets = getPetsWithTutor()

  if (nome) {
    pets = pets.filter(p => p.nome.toLowerCase().includes(nome))
  }

  const totalElements = pets.length
  const totalPages = Math.ceil(totalElements / size)
  const start = page * size
  const content = pets.slice(start, start + size)

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
    const { nome, especie, idade, raca } = body

    if (!nome || !especie || idade === undefined) {
      return NextResponse.json(
        { message: 'Nome, especie e idade sao obrigatorios' },
        { status: 400 }
      )
    }

    const newPet = {
      id: mockDb.nextPetId++,
      nome,
      especie,
      idade,
      raca,
      foto: undefined,
      tutorId: undefined,
    }

    mockDb.pets.push(newPet)

    return NextResponse.json(newPet, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Erro ao processar requisicao' },
      { status: 500 }
    )
  }
}
