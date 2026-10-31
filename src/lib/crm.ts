import prisma from '@/lib/prisma';
import { MOCK_CUSTOMERS, MockCustomer } from '@/lib/mock-data';
import { cleanIndianPhone } from '@/lib/formatters';

export async function autoSyncCustomerFromBill({
  phone,
  name,
  email,
  billAmount,
  orderNumber,
  orderId,
  isSettled = false,
  paymentMode = 'CARD/UPI',
}: {
  phone: string;
  name?: string | null;
  email?: string | null;
  billAmount: number;
  orderNumber: string;
  orderId?: string;
  isSettled?: boolean;
  paymentMode?: string;
}): Promise<{ customer: MockCustomer; isNew: boolean } | null> {
  const cleanPhone = cleanIndianPhone(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    return null;
  }

  const rawName = name?.trim();
  const validName =
    rawName && rawName !== 'Walk-in Guest' && rawName !== 'New Guest'
      ? rawName
      : `Guest ${cleanPhone.slice(-4)}`;

  const roundedAmount = Math.max(0, Math.round(billAmount * 100) / 100);
  const pointsEarned = Math.floor(roundedAmount * 0.05); // 5% points on bill spend
  const todayStr = new Date().toISOString();
  const todayFormatted = new Date().toLocaleDateString('en-IN');

  // 1. Check if customer already exists in mock memory
  let existingCustomer = MOCK_CUSTOMERS.find(
    (c) =>
      cleanIndianPhone(c.phone) === cleanPhone ||
      c.phone.replace(/\D/g, '').endsWith(cleanPhone) ||
      cleanPhone.endsWith(c.phone.replace(/\D/g, ''))
  );

  // 2. Check if customer already exists in Prisma DB
  let dbCustomer: any = null;
  try {
    dbCustomer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: { contains: cleanPhone } },
          { phone: cleanPhone },
          { phone: `+91 ${cleanPhone}` },
        ],
        isDeleted: false,
      },
      include: { tier: true, wallet: true },
    });
  } catch (err) {
    // offline fallback
  }

  // ========================================================
  // CASE A: EXISTING (OLD) CUSTOMER - UPDATE RECORD
  // ========================================================
  if (existingCustomer || dbCustomer) {
    // If found in DB but not in mock memory, construct and add to mock memory
    if (!existingCustomer && dbCustomer) {
      existingCustomer = {
        id: dbCustomer.id,
        brandId: dbCustomer.brandId,
        name: dbCustomer.name,
        phone: dbCustomer.phone,
        email: dbCustomer.email,
        birthday: dbCustomer.birthday ? new Date(dbCustomer.birthday).toISOString().split('T')[0] : null,
        anniversary: dbCustomer.anniversary ? new Date(dbCustomer.anniversary).toISOString().split('T')[0] : null,
        tierId: dbCustomer.tierId || 'tier-silver',
        tierName: dbCustomer.tier?.name || 'Silver Member',
        walletBalance: dbCustomer.wallet?.balance || dbCustomer.walletBalance || 0,
        totalPoints: dbCustomer.totalPoints || 0,
        totalSpend: dbCustomer.totalSpend || 0,
        visitCount: dbCustomer.visitCount || 0,
        lastVisit: dbCustomer.lastVisit ? new Date(dbCustomer.lastVisit).toISOString() : todayStr,
        isBlocked: dbCustomer.isBlocked,
        notes: '',
        tags: ['Returning Guest'],
        address: {
          addressLine1: 'Bengaluru',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
        },
        favoriteItems: [],
        recentOrders: [],
        loyaltyLedger: [],
        walletLedger: [],
      };
      MOCK_CUSTOMERS.push(existingCustomer);
    }

    if (existingCustomer) {
      existingCustomer.recentOrders = existingCustomer.recentOrders || [];

      // Check idempotency: has this specific bill/order already been processed?
      const existingOrderIndex = existingCustomer.recentOrders.findIndex(
        (ro) => ro.orderNumber === orderNumber
      );

      const orderEntry = {
        id: orderId || `ord-${Date.now()}`,
        orderNumber,
        date: todayFormatted,
        billAmount: roundedAmount,
        status: isSettled ? 'PAID' : 'COMPLETED',
        paymentMode,
        itemsSummary: `Bill ${orderNumber}`,
      };

      if (existingOrderIndex === -1) {
        // First time processing this bill: increment visits, spend, points
        existingCustomer.visitCount = (existingCustomer.visitCount || 0) + 1;
        existingCustomer.totalSpend =
          Math.round(((existingCustomer.totalSpend || 0) + roundedAmount) * 100) / 100;
        existingCustomer.lastVisit = todayStr;
        existingCustomer.totalPoints = (existingCustomer.totalPoints || 0) + pointsEarned;
        existingCustomer.recentOrders.unshift(orderEntry);

        // Add loyalty points ledger entry
        if (pointsEarned > 0) {
          existingCustomer.loyaltyLedger = existingCustomer.loyaltyLedger || [];
          existingCustomer.loyaltyLedger.unshift({
            id: `lt-${Date.now()}`,
            date: todayFormatted,
            type: 'EARN',
            points: pointsEarned,
            balanceAfter: existingCustomer.totalPoints,
            reason: `Points earned from bill ${orderNumber}`,
          });
        }

        // Loyalty tier promotion based on cumulative lifetime spend
        if (existingCustomer.totalSpend >= 25000) {
          existingCustomer.tierId = 'tier-platinum';
          existingCustomer.tierName = 'Platinum VIP';
        } else if (existingCustomer.totalSpend >= 10000) {
          existingCustomer.tierId = 'tier-gold';
          existingCustomer.tierName = 'Gold Member';
        }

        // Also update in live Prisma DB
        if (dbCustomer) {
          try {
            await prisma.customer.update({
              where: { id: dbCustomer.id },
              data: {
                visitCount: { increment: 1 },
                totalSpend: { increment: roundedAmount },
                totalPoints: { increment: pointsEarned },
                lastVisit: new Date(),
                ...(validName &&
                !validName.startsWith('Guest ') &&
                dbCustomer.name.startsWith('Guest ')
                  ? { name: validName }
                  : {}),
                ...(email && !dbCustomer.email ? { email } : {}),
              },
            });
          } catch (e) {}
        }
      } else {
        // Already processed earlier: update status or paymentMode if settled now
        existingCustomer.recentOrders[existingOrderIndex].status = isSettled ? 'PAID' : 'COMPLETED';
        existingCustomer.recentOrders[existingOrderIndex].paymentMode = paymentMode;
        if (roundedAmount > 0) {
          existingCustomer.recentOrders[existingOrderIndex].billAmount = roundedAmount;
        }
      }

      // If existing name was generic (e.g. "Guest 4321") and real name provided now, upgrade name
      if (
        validName &&
        !validName.startsWith('Guest ') &&
        existingCustomer.name.startsWith('Guest ')
      ) {
        existingCustomer.name = validName;
      }

      if (email && !existingCustomer.email) {
        existingCustomer.email = email;
      }
    }

    return {
      customer: existingCustomer!,
      isNew: false,
    };
  }

  // ========================================================
  // CASE B: NEW CUSTOMER - AUTO-ADD WITH NAME & PHONE NUMBER
  // ========================================================
  const newCustomer: MockCustomer = {
    id: `cust-${Date.now()}`,
    brandId: 'brand-restodesk-001',
    name: validName,
    phone: cleanPhone,
    email: email || null,
    birthday: null,
    anniversary: null,
    tierId: 'tier-silver',
    tierName: 'Silver Member',
    walletBalance: 0,
    totalPoints: pointsEarned,
    totalSpend: roundedAmount,
    visitCount: 1,
    lastVisit: todayStr,
    isBlocked: false,
    notes: 'Auto-registered from bill creation',
    tags: ['New Guest', 'POS Customer'],
    address: {
      addressLine1: 'Walk-in / In-store',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    favoriteItems: [],
    recentOrders: [
      {
        id: orderId || `ord-${Date.now()}`,
        orderNumber,
        date: todayFormatted,
        billAmount: roundedAmount,
        status: isSettled ? 'PAID' : 'COMPLETED',
        paymentMode,
        itemsSummary: `Bill ${orderNumber}`,
      },
    ],
    loyaltyLedger:
      pointsEarned > 0
        ? [
            {
              id: `lt-${Date.now()}`,
              date: todayFormatted,
              type: 'EARN',
              points: pointsEarned,
              balanceAfter: pointsEarned,
              reason: `Welcome Points from 1st bill ${orderNumber}`,
            },
          ]
        : [],
    walletLedger: [],
  };

  // Add to active mock list immediately so it displays in CRM & POS
  MOCK_CUSTOMERS.unshift(newCustomer);

  // Add to live Prisma DB
  try {
    let brandId = 'd072c454-2537-4f98-a227-c93f26c9c501';
    const b = await prisma.brand.findFirst().catch(() => null);
    if (b) brandId = b.id;

    let tierId: string | undefined = undefined;
    const silverTier = await prisma.loyaltyTier
      .findFirst({
        where: { name: { contains: 'Silver', mode: 'insensitive' } },
      })
      .catch(() => null);
    if (silverTier) tierId = silverTier.id;

    const createdInDb = await prisma.customer.create({
      data: {
        brandId,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        tierId: tierId || undefined,
        walletBalance: 0,
        totalPoints: newCustomer.totalPoints,
        totalSpend: roundedAmount,
        visitCount: 1,
        lastVisit: new Date(),
        addresses: {
          create: {
            addressLine1: 'Walk-in / In-store',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
          },
        },
      },
    });
    newCustomer.id = createdInDb.id;
  } catch (err) {
    // offline fallback
  }

  return {
    customer: newCustomer,
    isNew: true,
  };
}
