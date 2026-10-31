import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_CUSTOMERS, MockCustomer } from '@/lib/mock-data';
import { cleanIndianPhone } from '@/lib/formatters';

const CustomerCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  birthday: z.string().optional().nullable(),
  anniversary: z.string().optional().nullable(),
  tierId: z.string().default('tier-silver'),
  addressLine1: z.string().optional(),
  city: z.string().default('Bengaluru'),
  state: z.string().default('Karnataka'),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  initialPoints: z.number().default(0),
  initialWallet: z.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const tier = searchParams.get('tier') || 'ALL';
    const status = searchParams.get('status') || 'ALL'; // ALL | ACTIVE | BLOCKED
    const tag = searchParams.get('tag') || 'ALL';
    const minSpend = parseFloat(searchParams.get('minSpend') || '0');
    const maxSpend = searchParams.get('maxSpend') ? parseFloat(searchParams.get('maxSpend')!) : Infinity;
    const recency = searchParams.get('recency') || 'ALL'; // ALL | 7D | 30D | 60D | 90D_PLUS
    const celebration = searchParams.get('celebration') || 'ALL'; // ALL | BIRTHDAY_MONTH | ANNIVERSARY_MONTH
    const exportMode = searchParams.get('export'); // 'csv'

    const mergedMap = new Map<string, MockCustomer>();

    // 1. Load active mock customer store
    for (const c of MOCK_CUSTOMERS) {
      const key = cleanIndianPhone(c.phone) || c.id;
      mergedMap.set(key, { ...c });
    }

    // 2. Fetch Prisma customers and overlay
    try {
      const dbCustomers = await prisma.customer.findMany({
        where: { isDeleted: false },
        include: {
          tier: true,
          wallet: true,
          tags: { include: { tag: true } },
          addresses: true,
          orders: { take: 5, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { lastVisit: 'desc' },
      });

      if (dbCustomers && dbCustomers.length > 0) {
        for (const c of dbCustomers) {
          const key = cleanIndianPhone(c.phone) || c.id;
          const existing = mergedMap.get(key);

          const mappedDbCustomer: MockCustomer = {
            id: c.id,
            brandId: c.brandId,
            name: c.name,
            phone: c.phone,
            email: c.email,
            birthday: c.birthday ? c.birthday.toISOString().split('T')[0] : null,
            anniversary: c.anniversary ? c.anniversary.toISOString().split('T')[0] : null,
            tierId: c.tierId || 'tier-silver',
            tierName: c.tier?.name || 'Silver Member',
            walletBalance: c.wallet?.balance || c.walletBalance,
            totalPoints: c.totalPoints,
            totalSpend: c.totalSpend,
            visitCount: c.visitCount,
            lastVisit: c.lastVisit ? c.lastVisit.toISOString() : c.createdAt.toISOString(),
            isBlocked: c.isBlocked,
            notes: '',
            tags: c.tags.length > 0 ? c.tags.map((t) => t.tag.name) : ['New Guest'],
            address: {
              addressLine1: c.addresses[0]?.addressLine1 || '',
              city: c.addresses[0]?.city || '',
              state: c.addresses[0]?.state || '',
              postalCode: c.addresses[0]?.postalCode || '',
            },
            favoriteItems: [],
            recentOrders: c.orders.map((o) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              date: new Date(o.createdAt).toLocaleDateString('en-IN'),
              billAmount: o.totalAmount,
              status: o.status,
              paymentMode: 'CARD',
              itemsSummary: `${o.orderType} order`,
            })),
            loyaltyLedger: [],
            walletLedger: [],
          };

          if (existing) {
            mergedMap.set(key, {
              ...existing,
              id: c.id,
              totalSpend: Math.max(existing.totalSpend, c.totalSpend),
              visitCount: Math.max(existing.visitCount, c.visitCount),
              totalPoints: Math.max(existing.totalPoints, c.totalPoints),
              walletBalance: Math.max(existing.walletBalance, mappedDbCustomer.walletBalance),
              lastVisit: c.lastVisit ? c.lastVisit.toISOString() : existing.lastVisit,
              recentOrders:
                mappedDbCustomer.recentOrders.length > 0
                  ? mappedDbCustomer.recentOrders
                  : existing.recentOrders,
            });
          } else {
            mergedMap.set(key, mappedDbCustomer);
          }
        }
      }
    } catch (dbErr) {
      // offline fallback to mock data
    }

    let customerList: MockCustomer[] = Array.from(mergedMap.values());

    // Apply Filters
    let filtered = customerList.filter((c) => {
      // Search
      if (search) {
        const matchName = c.name.toLowerCase().includes(search);
        const matchPhone = c.phone.includes(search);
        const matchEmail = c.email?.toLowerCase().includes(search) || false;
        if (!matchName && !matchPhone && !matchEmail) return false;
      }

      // Tier
      if (tier !== 'ALL') {
        if (!c.tierName.toLowerCase().includes(tier.toLowerCase()) && c.tierId !== tier) {
          return false;
        }
      }

      // Status
      if (status === 'ACTIVE' && c.isBlocked) return false;
      if (status === 'BLOCKED' && !c.isBlocked) return false;

      // Tag
      if (tag !== 'ALL') {
        if (!c.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return false;
      }

      // Spend
      if (c.totalSpend < minSpend || c.totalSpend > maxSpend) return false;

      // Recency
      if (recency !== 'ALL') {
        const lastVisitDate = new Date(c.lastVisit).getTime();
        const diffDays = (Date.now() - lastVisitDate) / 86400000;
        if (recency === '7D' && diffDays > 7) return false;
        if (recency === '30D' && (diffDays <= 7 || diffDays > 30)) return false;
        if (recency === '60D' && (diffDays <= 30 || diffDays > 60)) return false;
        if (recency === '90D_PLUS' && diffDays <= 60) return false;
      }

      // Celebrations
      if (celebration !== 'ALL') {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        if (celebration === 'BIRTHDAY_MONTH') {
          if (!c.birthday) return false;
          const bMonth = parseInt(c.birthday.split('-')[1], 10);
          if (bMonth !== currentMonth) return false;
        } else if (celebration === 'ANNIVERSARY_MONTH') {
          if (!c.anniversary) return false;
          const aMonth = parseInt(c.anniversary.split('-')[1], 10);
          if (aMonth !== currentMonth) return false;
        }
      }

      return true;
    });

    // Handle CSV Export
    if (exportMode === 'csv') {
      const headers = [
        'Customer ID',
        'Name',
        'Phone',
        'Email',
        'Loyalty Tier',
        'Total Spend (INR)',
        'Visits',
        'Points',
        'Wallet Balance (INR)',
        'Last Visit',
        'Birthday',
        'Anniversary',
        'Tags',
        'Status',
      ];

      const rows = filtered.map((c) => [
        `"${c.id}"`,
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.email || ''}"`,
        `"${c.tierName}"`,
        c.totalSpend.toFixed(2),
        c.visitCount,
        c.totalPoints,
        c.walletBalance.toFixed(2),
        `"${new Date(c.lastVisit).toLocaleDateString('en-IN')}"`,
        `"${c.birthday || ''}"`,
        `"${c.anniversary || ''}"`,
        `"${c.tags.join(', ')}"`,
        `"${c.isBlocked ? 'Blocked' : 'Active'}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="RestoDesk_Customers_${Date.now()}.csv"`,
        },
      });
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // Summary Statistics
    const summary = {
      totalCustomers: customerList.length,
      activeLoyaltyMembers: customerList.filter((c) => c.totalPoints > 0).length,
      totalWalletLiability: customerList.reduce((acc, curr) => acc + (curr.walletBalance || 0), 0),
      avgLifetimeSpend: Math.round(
        customerList.reduce((acc, curr) => acc + curr.totalSpend, 0) / (customerList.length || 1)
      ),
    };

    return NextResponse.json({
      success: true,
      customers: paginated,
      total,
      page,
      limit,
      totalPages,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CustomerCreateSchema.parse(body);
    const cleanPhone = cleanIndianPhone(validated.phone);

    // Check duplicate phone
    const existingMock = MOCK_CUSTOMERS.find((c) => cleanIndianPhone(c.phone) === cleanPhone);
    if (existingMock) {
      return NextResponse.json(
        { success: false, message: `Customer with mobile +91 ${cleanPhone} already exists` },
        { status: 400 }
      );
    }

    const newCustomer: MockCustomer = {
      id: `cust-${Date.now()}`,
      brandId: 'brand-restodesk-001',
      name: validated.name.trim(),
      phone: cleanPhone,
      email: validated.email || null,
      birthday: validated.birthday || null,
      anniversary: validated.anniversary || null,
      tierId: validated.tierId || 'tier-silver',
      tierName:
        validated.tierId === 'tier-platinum'
          ? 'Platinum VIP'
          : validated.tierId === 'tier-gold'
          ? 'Gold Member'
          : 'Silver Member',
      walletBalance: validated.initialWallet || 0,
      totalPoints: validated.initialPoints || 0,
      totalSpend: 0,
      visitCount: 0,
      lastVisit: new Date().toISOString(),
      isBlocked: false,
      notes: validated.notes || '',
      tags: validated.tags.length > 0 ? validated.tags : ['New Guest'],
      address: {
        addressLine1: validated.addressLine1 || '',
        city: validated.city || 'Bengaluru',
        state: validated.state || 'Karnataka',
        postalCode: validated.postalCode || '',
      },
      favoriteItems: [],
      recentOrders: [],
      loyaltyLedger:
        validated.initialPoints > 0
          ? [
              {
                id: `lt-${Date.now()}`,
                date: new Date().toLocaleDateString('en-IN'),
                type: 'EARN',
                points: validated.initialPoints,
                balanceAfter: validated.initialPoints,
                reason: 'Welcome Registration Bonus Points',
              },
            ]
          : [],
      walletLedger:
        validated.initialWallet > 0
          ? [
              {
                id: `wt-${Date.now()}`,
                date: new Date().toLocaleDateString('en-IN'),
                type: 'TOPUP',
                amount: validated.initialWallet,
                balanceAfter: validated.initialWallet,
                referenceNote: 'Welcome Registration Wallet Credit',
              },
            ]
          : [],
    };

    try {
      let brandId = 'd072c454-2537-4f98-a227-c93f26c9c501';
      const b = await prisma.brand.findFirst().catch(() => null);
      if (b) brandId = b.id;

      let tierId: string | undefined = undefined;
      const dbTier = await prisma.loyaltyTier
        .findFirst({
          where: {
            OR: [
              { id: validated.tierId },
              { name: { contains: validated.tierId?.replace('tier-', '') || 'Silver', mode: 'insensitive' } },
            ],
          },
        })
        .catch(() => null);
      if (dbTier) tierId = dbTier.id;

      const createdInDb = await prisma.customer.create({
        data: {
          brandId,
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
          birthday: newCustomer.birthday ? new Date(newCustomer.birthday) : null,
          anniversary: newCustomer.anniversary ? new Date(newCustomer.anniversary) : null,
          tierId: tierId || undefined,
          walletBalance: newCustomer.walletBalance,
          totalPoints: newCustomer.totalPoints,
          totalSpend: 0,
          visitCount: 0,
          addresses: {
            create: {
              addressLine1: newCustomer.address.addressLine1 || 'Default Address',
              city: newCustomer.address.city,
              state: newCustomer.address.state,
              postalCode: newCustomer.address.postalCode,
            },
          },
        },
      });
      if (createdInDb) {
        newCustomer.id = createdInDb.id;
      }
    } catch (dbErr) {
      // offline fallback
    }

    MOCK_CUSTOMERS.unshift(newCustomer);

    return NextResponse.json({
      success: true,
      message: 'Customer registered successfully',
      customer: newCustomer,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
