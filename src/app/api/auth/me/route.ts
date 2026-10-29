import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, ROLE_PERMISSIONS } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    let userDetails: {
      id: string;
      email: string;
      role: any;
      roleName: string;
      brandId: string;
      outletId?: string | null;
      permissions: string[];
      name: string;
      phone: string;
    } = {
      id: session.userId,
      email: session.email,
      role: session.role,
      roleName: String(session.role),
      brandId: session.brandId,
      outletId: session.outletId,
      permissions: session.permissions || ROLE_PERMISSIONS[session.role] || [],
      name: session.email.split('@')[0],
      phone: '9876543210',
    };

    let outlets: any[] = [];

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { role: true, brand: true, outlet: true },
      });

      if (dbUser) {
        userDetails = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          role: session.role,
          roleName: dbUser.role?.name || session.role,
          brandId: dbUser.brandId,
          outletId: dbUser.outletId || session.outletId,
          permissions: session.permissions,
        };

        const dbOutlets = await prisma.outlet.findMany({
          where: { brandId: dbUser.brandId, isActive: true, isDeleted: false },
        });
        outlets = dbOutlets;
      }
    } catch (err) {
      // Prisma offline fallback
    }

    return NextResponse.json({
      success: true,
      user: userDetails,
      outlets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
