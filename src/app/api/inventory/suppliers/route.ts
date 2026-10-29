import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_SUPPLIERS, MockSupplier } from '@/lib/mock-data';
import { cleanIndianPhone } from '@/lib/formatters';

const SupplierCreateSchema = z.object({
  name: z.string().min(2, 'Supplier name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().default('Bengaluru'),
  state: z.string().default('Karnataka'),
  paymentTerms: z.string().default('Net 30 Days'),
  initialBalance: z.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';

    let suppliers: MockSupplier[] = [];

    try {
      const dbSuppliers = await prisma.supplier.findMany({
        where: { isDeleted: false },
        orderBy: { name: 'asc' },
      });

      if (dbSuppliers && dbSuppliers.length > 0) {
        suppliers = dbSuppliers.map((s) => ({
          id: s.id,
          brandId: s.brandId,
          name: s.name,
          contactPerson: s.contactPerson || '',
          phone: s.phone,
          email: s.email || '',
          gstin: s.gstin || '',
          address: s.address || '',
          city: s.city || 'Bengaluru',
          state: s.state || 'Karnataka',
          paymentTerms: s.paymentTerms || 'Net 30 Days',
          outstandingBalance: 0,
          totalPurchasesYtd: 0,
        }));
      }
    } catch (dbErr) {
      // offline fallback
    }

    if (suppliers.length === 0) {
      suppliers = [...MOCK_SUPPLIERS];
    }

    const filtered = suppliers.filter((s) => {
      if (search) {
        const matchName = s.name.toLowerCase().includes(search);
        const matchContact = s.contactPerson.toLowerCase().includes(search);
        const matchPhone = s.phone.includes(search);
        const matchGst = s.gstin.toLowerCase().includes(search);
        if (!matchName && !matchContact && !matchPhone && !matchGst) return false;
      }
      return true;
    });

    const totalPayableLiability = suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);
    const totalPurchasesYtd = suppliers.reduce((acc, s) => acc + s.totalPurchasesYtd, 0);

    return NextResponse.json({
      success: true,
      suppliers: filtered,
      totalCount: filtered.length,
      metrics: {
        totalSuppliers: suppliers.length,
        totalPayableLiability,
        totalPurchasesYtd,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SupplierCreateSchema.parse(body);
    const cleanPhone = cleanIndianPhone(validated.phone);

    const newSupplier: MockSupplier = {
      id: `sup-${Date.now()}`,
      brandId: 'brand-restodesk-001',
      name: validated.name.trim(),
      contactPerson: validated.contactPerson.trim(),
      phone: cleanPhone,
      email: validated.email || '',
      gstin: validated.gstin ? validated.gstin.toUpperCase().trim() : '',
      address: validated.address || '',
      city: validated.city || 'Bengaluru',
      state: validated.state || 'Karnataka',
      paymentTerms: validated.paymentTerms || 'Net 30 Days',
      outstandingBalance: validated.initialBalance || 0,
      totalPurchasesYtd: 0,
    };

    try {
      await prisma.supplier.create({
        data: {
          brandId: 'brand-restodesk-001',
          name: newSupplier.name,
          contactPerson: newSupplier.contactPerson,
          phone: newSupplier.phone,
          email: newSupplier.email,
          gstin: newSupplier.gstin,
          address: newSupplier.address,
          city: newSupplier.city,
          state: newSupplier.state,
          paymentTerms: newSupplier.paymentTerms,
        },
      });
    } catch (dbErr) {
      // offline fallback
    }

    MOCK_SUPPLIERS.unshift(newSupplier);

    return NextResponse.json({
      success: true,
      message: `Supplier "${newSupplier.name}" added successfully`,
      supplier: newSupplier,
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
