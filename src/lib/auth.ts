import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { UserSession } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'pulse_commerce_default_secret_key_change_in_production';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): UserSession | null {
  // 1. Try Cookie
  const tokenCookie = req.cookies.get('pulse_auth_token');
  if (tokenCookie?.value) {
    const user = verifyToken(tokenCookie.value);
    if (user) return user;
  }

  // 2. Try Authorization Bearer
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  return null;
}
