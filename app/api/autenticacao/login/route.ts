import { NextResponse } from 'next/server'
import { mockDb, generateToken } from '@/lib/mock-db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuario, senha } = body

    const user = mockDb.users.find(u => u.usuario === usuario && u.senha === senha)

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario ou senha invalidos' },
        { status: 401 }
      )
    }

    const token = generateToken()
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    mockDb.tokens.set(token, { userId: user.id, expiresAt })

    return NextResponse.json({
      token,
      refreshToken: generateToken(),
      expiresIn: 86400,
    })
  } catch {
    return NextResponse.json(
      { message: 'Erro ao processar requisicao' },
      { status: 500 }
    )
  }
}
