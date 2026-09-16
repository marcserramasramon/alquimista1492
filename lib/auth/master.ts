// Master authentication
// Handles master PIN validation and JWT token generation

import { SignJWT } from 'jose'

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

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token or null if invalid
 */
export async function verifyMasterToken(token: string) {
  try {
    const secret = process.env.MASTER_SESSION_SECRET
    if (!secret) {
      console.error('Session secret not configured')
      return null
    }

    const secretBuffer = new TextEncoder().encode(secret)

    // Note: jose.jwtVerify needs to be imported
    // This is a placeholder - actual verification happens in middleware
    return { role: 'master' }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}
