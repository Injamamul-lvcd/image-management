import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

interface TokenPayload {
  userId: number;
}

interface DecodedToken {
  userId: number;
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for a user
 * @param userId - User ID to encode in the token
 * @returns JWT token string
 */
export function generateToken(userId: number): string {
  const payload: TokenPayload = { userId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload with userId
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): { userId: number } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return { userId: decoded.userId };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Token verification failed');
  }
}
