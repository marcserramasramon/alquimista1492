// Master authentication
// Handles master PIN validation and JWT token generation

import { SignJWT, jwtVerify } from 'jose'

export interface MasterLoginResult {
  token: string
  expiresAt: Date
}

export interface MasterLoginError {
  code: string
  message: string
}

/**
 * Validate master PIN and generate JWT token
 * @param pin - 6-digit PIN from environment
 * @returns JWT token or error
 */
export async function loginMaster(
  pin: string
): Promise<MasterLoginResult | MasterLoginError> {
  try {
    // Validate PIN
    if (!pin || pin.length !== 6) {
      return {
        code: 'INVALID_PIN_FORMAT',
        message: 'PIN must be 6 digits'
      }
    }

    const correctPin = process.env.MASTER_PIN
    if (!correctPin) {
      return {
        code: 'PIN_NOT_CONFIGURED',
        message: 'Master PIN not configured'
      }
    }

    if (pin !== correctPin) {
      return {
        code: 'INVALID_PIN',
        message: 'Invalid PIN'
      }
    }

    // Generate JWT token
    const secret = process.env.MASTER_SESSION_SECRET
    if (!secret) {
      return {
        code: 'SECRET_NOT_CONFIGURED',
        message: 'Session secret not configured'
      }
    }

    const secretBuffer = new TextEncoder().encode(secret)
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours

    const token = await new SignJWT({
      sub: 'master',
      role: 'master',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secretBuffer)

    return {
      token,
      expiresAt,
    }
  } catch (error) {
    console.error('Master login error:', error)
    return {
      code: 'LOGIN_FAILED',
      message: 'Failed to generate session token'
    }
  }
}

export interface VerifiedMasterToken {
  role: 'master'
  exp: number
  sub: string
  iat: number
}

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token with role and expiry or throws error if invalid
 * @throws Error if token is invalid, expired, or secret not configured
 */
export async function verifyMasterToken(
  token: string
): Promise<VerifiedMasterToken> {
  const secret = process.env.MASTER_SESSION_SECRET
  if (!secret) {
    throw new Error('Session secret not configured')
  }

  const secretBuffer = new TextEncoder().encode(secret)

  try {
    const { payload } = await jwtVerify(token, secretBuffer)

    if (!payload.exp) {
      throw new Error('Token missing expiry claim')
    }

    if (payload.role !== 'master') {
      throw new Error('Invalid token role')
    }

    return {
      role: 'master',
      exp: payload.exp as number,
      sub: payload.sub as string,
      iat: payload.iat as number,
    }
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw jose verification errors with context
      throw new Error(`Token verification failed: ${error.message}`)
    }
    throw new Error('Token verification failed: Unknown error')
  }
}
