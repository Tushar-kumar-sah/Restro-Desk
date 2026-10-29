import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME, ROLE_PERMISSIONS } from '@/lib/auth';
import { UserRoleType } from '@prisma/client';

const supabaseAuthSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = supabaseAuthSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Invalid token' },
        { status: 400 }
      );
    }

    const { accessToken } = result.data;

    // 1. Verify token with Supabase Auth
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !userData?.user) {
      return NextResponse.json(
        { success: false, message: authError?.message || 'Invalid Supabase session' },
        { status: 401 }
      );
    }

    const supaUser = userData.user;
    const email = supaUser.email || '';
    const phone = supaUser.phone || '';

    // 2. Fetch default Brand & Outlets from Supabase database
    let brand = await prisma.brand.findFirst({
      where: { isDeleted: false },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: 'RestoDesk Hospitality',
          slug: 'restodesk-demo',
          code: 'RESTO1',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
      });
    }

    let outlets = await prisma.outlet.findMany({
      where: { brandId: brand.id, isActive: true, isDeleted: false },
    });

    if (outlets.length === 0) {
      const defaultOutlet = await prisma.outlet.create({
        data: {
          brandId: brand.id,
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
          defaultGstPercent: 5.0,
        },
      });
      outlets = [defaultOutlet];
    }

    // 3. Find or create User in Prisma
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
        isDeleted: false,
      },
      include: { role: true, brand: true, outlet: true },
    });

    let roleType: UserRoleType = 'OWNER';

    if (!dbUser) {
      // Find or create Owner role
      let role = await prisma.role.findFirst({
        where: { brandId: brand.id, type: 'OWNER' },
      });

      if (!role) {
        role = await prisma.role.create({
          data: {
            brandId: brand.id,
            name: 'Owner',
            type: 'OWNER',
            isSystem: true,
          },
        });
      }

      dbUser = await prisma.user.create({
        data: {
          brandId: brand.id,
          outletId: outlets[0].id,
          roleId: role.id,
          name: supaUser.user_metadata?.full_name || email.split('@')[0] || 'RestoDesk Admin',
          email: email || `${supaUser.id}@restodesk.supabase`,
          phone: phone || '',
          passwordHash: 'SUPABASE_MANAGED_AUTH',
          isActive: true,
        },
        include: { role: true, brand: true, outlet: true },
      });
      roleType = 'OWNER';
    } else {
      roleType = (dbUser.role?.type as UserRoleType) || 'OWNER';
    }

    // 4. Generate RestoDesk session JWT
    const permissions = ROLE_PERMISSIONS[roleType] || [];
    const token = signToken({
      userId: dbUser.id,
      brandId: brand.id,
      outletId: dbUser.outletId || outlets[0].id,
      role: roleType,
      email: dbUser.email,
      permissions,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Supabase authentication successful',
      token,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        role: roleType,
        brandId: brand.id,
        brandName: brand.name,
        outletId: dbUser.outletId || outlets[0].id,
        outletName: dbUser.outlet?.name || outlets[0].name,
      },
      outlets: outlets.map((o) => ({
        id: o.id,
        name: o.name,
        code: o.code,
        isDefault: o.id === (dbUser?.outletId || outlets[0].id),
      })),
      permissions: ROLE_PERMISSIONS[roleType] || [],
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Supabase Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Supabase auth failed' },
      { status: 500 }
    );
  }
}
