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

    let kots = [...MOCK_KOTS];

    if (station && station !== 'ALL') {
      kots = kots.filter((k) => k.station === station);
    }

    if (status && status !== 'ALL') {
      kots = kots.filter((k) => k.status === status);
    } else {
      // By default show active tickets (NEW, PREPARING, READY)
      kots = kots.filter((k) => k.status !== 'SERVED' && k.status !== 'CANCELLED');
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

    const idx = MOCK_KOTS.findIndex((k: any) => k.id === kotId || k.kotNumber === kotId);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'KOT not found' }, { status: 404 });
    }

    // If updating overall KOT status
    if (status) {
      MOCK_KOTS[idx].status = status;
      if (status === 'READY') {
        MOCK_KOTS[idx].readyAt = new Date();
      } else if (status === 'SERVED') {
        MOCK_KOTS[idx].servedAt = new Date();
      }
    }

    // If updating individual item checklist
    if (itemId && itemStatus) {
      const item = MOCK_KOTS[idx].items.find((i: any) => i.id === itemId);
      if (item) {
        item.status = itemStatus;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'KOT status updated',
      kot: MOCK_KOTS[idx],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
