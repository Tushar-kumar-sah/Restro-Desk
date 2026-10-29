import { UserRoleType } from '@prisma/client';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRoleType;
  roleName: string;
  brandId: string;
  brandName?: string;
  outletId?: string | null;
  outletName?: string | null;
  permissions: string[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRoleType;
  brandId: string;
  outletId?: string | null;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: UserSession;
  token?: string;
  outlets?: Array<{
    id: string;
    name: string;
    code: string;
    city: string;
    isDefault?: boolean;
  }>;
}

export type PermissionCode =
  | 'pos:access'
  | 'pos:create_order'
  | 'pos:apply_discount'
  | 'pos:void_bill'
  | 'pos:split_bill'
  | 'tables:view'
  | 'tables:manage'
  | 'kot:view'
  | 'kot:manage'
  | 'menu:view'
  | 'menu:manage'
  | 'inventory:view'
  | 'inventory:manage'
  | 'crm:view'
  | 'crm:manage'
  | 'loyalty:manage'
  | 'campaigns:manage'
  | 'reports:view'
  | 'reports:export'
  | 'settings:brand'
  | 'settings:outlets'
  | 'settings:staff'
  | 'settings:billing';
