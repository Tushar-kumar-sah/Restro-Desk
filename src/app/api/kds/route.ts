import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { StationType, KOTStatus } from '@prisma/client';
import { MOCK_KOTS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const station = searchParams.get('station');
    const status = searchParams.get('status');

    let kots: any[] = [];

    // 1. Fetch real active KOTs from PostgreSQL database
    try {
      const dbKots = await prisma.kOT.findMany({
        where: {
          ...(status && status !== 'ALL'
            ? { status: status as KOTStatus }
            : { status: { notIn: ['SERVED'] } }),
          ...(station && station !== 'ALL' ? { station: station as StationType } : {}),
        },
        include: {
          order: {
            include: {
              table: true,
              items: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (dbKots.length > 0) {
        kots = dbKots.map((k) => ({
          id: k.id,
          kotNumber: k.kotNumber,
          orderNumber: k.order?.orderNumber || 'ORD-LIVE',
          tableNumber: k.order?.table?.tableNumber || (k.order?.orderType === 'DINE_IN' ? 'T-01' : 'Takeaway'),
          orderType: k.order?.orderType || 'DINE_IN',
          station: k.station,
          status: k.status,
          createdAt: k.createdAt,
          waiter: 'Captain',
          items: ((k.items && k.items.length > 0) ? k.items : (k.order?.items || [])).map((i) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            notes: i.notes || '',
            status: i.status || 'COOKING',
          })),
        }));
      }
    } catch (err) {
      console.error('Failed to fetch KOTs from DB:', err);
    }

    // 2. Merge with MOCK_KOTS (avoiding duplicate numbers)
    const existingKotNumbers = new Set(kots.map((k) => k.kotNumber));
    let fallbackKots = [...MOCK_KOTS];

    if (station && station !== 'ALL') {
      fallbackKots = fallbackKots.filter((k) => k.station === station);
    }
    if (status && status !== 'ALL') {
      fallbackKots = fallbackKots.filter((k) => k.status === status);
    } else {
      fallbackKots = fallbackKots.filter((k) => k.status !== 'SERVED' && k.status !== 'CANCELLED');
    }

    for (const mockKot of fallbackKots) {
      if (!existingKotNumbers.has(mockKot.kotNumber)) {
        kots.push(mockKot);
      }
    }

    // Sort by age (oldest first for kitchen discipline)
    kots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json({
      success: true,
      kots,
      activeCount: kots.length,
      delayedCount: kots.filter((k) => (Date.now() - new Date(k.createdAt).getTime()) > 20 * 60000).length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { kotId, status, itemId, itemStatus } = body;

    // 1. Update in Prisma DB if available
    try {
      if (status) {
        await prisma.kOT.updateMany({
          where: { OR: [{ id: kotId }, { kotNumber: kotId }] },
          data: {
            status: status as KOTStatus,
          },
        });
      }
      if (itemId && itemStatus) {
        await prisma.orderItem.updateMany({
          where: { id: itemId },
          data: { status: itemStatus as any },
        });
      }
    } catch (dbErr) {}

    // 2. Also update in-memory mock store
    const idx = MOCK_KOTS.findIndex((k: any) => k.id === kotId || k.kotNumber === kotId);
    if (idx !== -1) {
      if (status) {
        MOCK_KOTS[idx].status = status;
        if (status === 'READY') {
          MOCK_KOTS[idx].readyAt = new Date();
        } else if (status === 'SERVED') {
          MOCK_KOTS[idx].servedAt = new Date();
        }
      }

      if (itemId && itemStatus) {
        const item = MOCK_KOTS[idx].items?.find((i: any) => i.id === itemId);
        if (item) {
          item.status = itemStatus;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'KOT status updated',
      kot: idx !== -1 ? MOCK_KOTS[idx] : { id: kotId, status },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
