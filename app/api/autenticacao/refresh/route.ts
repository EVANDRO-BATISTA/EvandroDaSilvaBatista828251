import { NextResponse } from 'next/server'
import { mockDb, generateToken, validateToken } from '@/lib/mock-db'

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { message: 'Token nao fornecido' },
        { status: 401 }
      )
    }

    const tokenData = validateToken(token)
    if (!tokenData) {
      return NextResponse.json(
        { message: 'Token invalido ou expirado' },
        { status: 401 }
      )
    }

    // Remove old token
    mockDb.tokens.delete(token)

    // Generate new token
    const newToken = generateToken()
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000

    mockDb.tokens.set(newToken, { userId: tokenData.userId, expiresAt })

    return NextResponse.json({
      token: newToken,
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
