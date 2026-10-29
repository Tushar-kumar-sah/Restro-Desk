import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { JWTPayload, UserSession, PermissionCode } from '@/types/auth';
import { UserRoleType } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-restodesk-2026-production-grade';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Hash a plain password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for authenticated user
 */
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify JWT token and extract payload
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Default role-based permissions matrix
 */
export const ROLE_PERMISSIONS: Record<UserRoleType, PermissionCode[]> = {
  OWNER: [
    'pos:access',
    'pos:create_order',
    'pos:apply_discount',
    'pos:void_bill',
    'pos:split_bill',
    'tables:view',
    'tables:manage',
    'kot:view',
    'kot:manage',
    'menu:view',
    'menu:manage',
    'inventory:view',
    'inventory:manage',
    'crm:view',
    'crm:manage',
    'loyalty:manage',
    'campaigns:manage',
    'reports:view',
    'reports:export',
    'settings:brand',
    'settings:outlets',
    'settings:staff',
    'settings:billing',
  ],
  MANAGER: [
    'pos:access',
    'pos:create_order',
    'pos:apply_discount',
    'pos:void_bill',
    'pos:split_bill',
    'tables:view',
    'tables:manage',
    'kot:view',
    'kot:manage',
    'menu:view',
    'menu:manage',
    'inventory:view',
    'inventory:manage',
    'crm:view',
    'crm:manage',
    'loyalty:manage',
    'reports:view',
    'reports:export',
    'settings:outlets',
    'settings:staff',
    'settings:billing',
  ],
  CASHIER: [
    'pos:access',
    'pos:create_order',
    'pos:apply_discount',
    'pos:split_bill',
    'tables:view',
    'kot:view',
    'crm:view',
    'crm:manage',
    'reports:view',
  ],
  WAITER: [
    'pos:access',
    'pos:create_order',
    'tables:view',
    'kot:view',
  ],
  KITCHEN: [
    'kot:view',
    'kot:manage',
  ],
  MARKETING: [
    'crm:view',
    'crm:manage',
    'loyalty:manage',
    'campaigns:manage',
    'reports:view',
  ],
  CUSTOM: [
    'pos:access',
    'tables:view',
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: UserSession | JWTPayload | null, permission: PermissionCode): boolean {
  if (!user) return false;
  if (user.role === 'OWNER') return true; // Owner has full access
  return user.permissions?.includes(permission) ?? false;
}

/**
 * Get current session user from server request cookies
 */
export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Extract token from NextRequest (for route handlers and middleware)
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
