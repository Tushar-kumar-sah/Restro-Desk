import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, AUTH_COOKIE_NAME, ROLE_PERMISSIONS } from '@/lib/auth';
import { UserRoleType } from '@prisma/client';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Demo accounts for quick testing and zero-friction onboarding
const DEMO_USERS: Record<string, {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRoleType;
  brandId: string;
  brandName: string;
  outletId: string;
  outletName: string;
}> = {
  'owner@restodesk.com': {
    id: 'usr-owner-001',
    name: 'Vikramaditya Roy (Owner)',
    email: 'owner@restodesk.com',
    phone: '9876543210',
    role: 'OWNER',
    brandId: 'brand-restodesk-001',
    brandName: 'RestoDesk Hospitality',
    outletId: 'outlet-blr-ind-001',
    outletName: 'Indiranagar Flagship',
  },
  'manager@restodesk.com': {
    id: 'usr-manager-002',
    name: 'Ananya Sharma (Manager)',
    email: 'manager@restodesk.com',
    phone: '9876543211',
    role: 'MANAGER',
    brandId: 'brand-restodesk-001',
    brandName: 'RestoDesk Hospitality',
    outletId: 'outlet-blr-ind-001',
    outletName: 'Indiranagar Flagship',
  },
  'cashier@restodesk.com': {
    id: 'usr-cashier-003',
    name: 'Rahul Nair (Cashier)',
    email: 'cashier@restodesk.com',
    phone: '9876543212',
    role: 'CASHIER',
    brandId: 'brand-restodesk-001',
    brandName: 'RestoDesk Hospitality',
    outletId: 'outlet-blr-ind-001',
    outletName: 'Indiranagar Flagship',
  },
  'waiter@restodesk.com': {
    id: 'usr-waiter-004',
    name: 'Karthik Gowda (Captain/Waiter)',
    email: 'waiter@restodesk.com',
    phone: '9876543213',
    role: 'WAITER',
    brandId: 'brand-restodesk-001',
    brandName: 'RestoDesk Hospitality',
    outletId: 'outlet-blr-ind-001',
    outletName: 'Indiranagar Flagship',
  },
  'kitchen@restodesk.com': {
    id: 'usr-kitchen-005',
    name: 'Chef Sanjeev (Head Chef)',
    email: 'kitchen@restodesk.com',
    phone: '9876543214',
    role: 'KITCHEN',
    brandId: 'brand-restodesk-001',
    brandName: 'RestoDesk Hospitality',
    outletId: 'outlet-blr-ind-001',
    outletName: 'Indiranagar Flagship',
  },
};

interface OutletOption {
  id: string;
  name: string;
  code: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  state: string;
  postalCode?: string | null;
  gstin?: string | null;
  fssaiNumber?: string | null;
  printerPaperWidth: string;
  taxIncludedInPrice: boolean;
  defaultGstPercent: number;
  isDefault?: boolean;
}

const DEFAULT_OUTLETS: OutletOption[] = [
  {
    id: 'outlet-blr-ind-001',
    name: 'Indiranagar Flagship',
    code: 'BLR-IND-01',
    phone: '+91 80 4123 4567',
    email: 'indiranagar@restodesk.com',
    address: '100ft Road, 12th Main, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    gstin: '29ABCDE1234F1Z5',
    fssaiNumber: '11223344556677',
    printerPaperWidth: '80mm',
    taxIncludedInPrice: false,
    defaultGstPercent: 5.0,
    isDefault: true,
  },
  {
    id: 'outlet-blr-kor-002',
    name: 'Koramangala Bistro',
    code: 'BLR-KOR-02',
    phone: '+91 80 4987 6543',
    email: 'koramangala@restodesk.com',
    address: '80ft Road, 4th Block, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560034',
    gstin: '29ABCDE1234F1Z5',
    fssaiNumber: '11223344556688',
    printerPaperWidth: '80mm',
    taxIncludedInPrice: false,
    defaultGstPercent: 5.0,
    isDefault: false,
  },
  {
    id: 'outlet-blr-whi-003',
    name: 'Whitefield Express',
    code: 'BLR-WHI-03',
    phone: '+91 80 4321 0987',
    email: 'whitefield@restodesk.com',
    address: 'ITPL Main Road, Prestige Shantiniketan, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560066',
    gstin: '29ABCDE1234F1Z5',
    fssaiNumber: '11223344556699',
    printerPaperWidth: '58mm',
    taxIncludedInPrice: true,
    defaultGstPercent: 5.0,
    isDefault: false,
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { identifier, password } = result.data;
    const cleanId = identifier.trim().toLowerCase();

    // 1. Try DB lookup first
    let dbUser: any = null;
    let outlets: OutletOption[] = DEFAULT_OUTLETS;
    let brandName = 'RestoDesk Hospitality';

    try {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: cleanId }, { phone: cleanId }],
          isActive: true,
          isDeleted: false,
        },
        include: {
          role: true,
          brand: true,
          outlet: true,
        },
      });

      if (dbUser) {
        const isMatch = await verifyPassword(password, dbUser.passwordHash);
        if (!isMatch) {
          return NextResponse.json(
            { success: false, message: 'Invalid credentials. Please check your password.' },
            { status: 401 }
          );
        }

        // Fetch brand outlets
        const dbOutlets = await prisma.outlet.findMany({
          where: { brandId: dbUser.brandId, isActive: true, isDeleted: false },
        });
        if (dbOutlets.length > 0) {
          outlets = dbOutlets.map((o) => ({
            id: o.id,
            name: o.name,
            code: o.code,
            phone: o.phone,
            email: o.email,
            address: o.address,
            city: o.city,
            state: o.state,
            postalCode: o.postalCode || '',
            gstin: o.gstin,
            fssaiNumber: o.fssaiNumber,
            printerPaperWidth: o.printerPaperWidth,
            taxIncludedInPrice: o.taxIncludedInPrice,
            defaultGstPercent: o.defaultGstPercent,
            isDefault: o.id === dbUser.outletId,
          }));
        }
        brandName = dbUser.brand?.name || brandName;
      }
    } catch (dbErr) {
      // If DB is unreachable, we gracefully fall back to demo accounts
      console.warn('Prisma DB query failed, falling back to demo store:', dbErr);
    }

    // 2. Demo fallback if user not in DB or during local dev test
    let userPayload;
    if (dbUser) {
      const roleType = (dbUser.role?.type || dbUser.role?.name?.toUpperCase() || 'CASHIER') as UserRoleType;
      const permissions = ROLE_PERMISSIONS[roleType] || ROLE_PERMISSIONS.CASHIER;

      userPayload = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: roleType,
        roleName: dbUser.role?.name || roleType,
        brandId: dbUser.brandId,
        brandName: brandName,
        outletId: dbUser.outletId || outlets[0]?.id,
        outletName: dbUser.outlet?.name || outlets[0]?.name,
        permissions,
      };
    } else {
      const demoAccount = DEMO_USERS[cleanId] || (cleanId === 'admin' ? DEMO_USERS['owner@restodesk.com'] : null);
      if (demoAccount && (password === 'Password@123' || password === 'admin' || password === 'password')) {
        const permissions = ROLE_PERMISSIONS[demoAccount.role] || ROLE_PERMISSIONS.CASHIER;
        userPayload = {
          ...demoAccount,
          roleName: demoAccount.role,
          permissions,
        };
      }
    }

    if (!userPayload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials. For quick demo, use owner@restodesk.com with Password@123',
        },
        { status: 401 }
      );
    }

    // 3. Generate JWT
    const token = signToken({
      userId: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
      brandId: userPayload.brandId,
      outletId: userPayload.outletId,
      permissions: userPayload.permissions,
    });

    // 4. Return response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userPayload,
      token,
      outlets,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
