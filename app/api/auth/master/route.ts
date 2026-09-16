// POST /api/auth/master
// Master PIN validation and token generation

import { loginMaster } from '@/lib/auth/master'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const MasterLoginSchema = z.object({
  pin: z.string().length(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = MasterLoginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const { pin } = validation.data

    // Attempt login
    const result = await loginMaster(pin)

    // Check if error
    if ('code' in result) {
      const statusCode = result.code === 'INVALID_PIN' ? 401 : 400
      return NextResponse.json(result, { status: statusCode })
    }

    // Success - return token in response
    const response = NextResponse.json(
      { token: result.token },
      { status: 200 }
    )

    // Also set as secure HTTP-only cookie for convenience
    response.cookies.set('master_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
    })

    return response
  } catch (error) {
    console.error('Master login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
