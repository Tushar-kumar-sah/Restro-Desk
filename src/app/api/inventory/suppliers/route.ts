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

    // Base suppliers from active in-memory list
    let suppliers: MockSupplier[] = [...MOCK_SUPPLIERS];

    try {
      const dbSuppliers = await prisma.supplier.findMany({
        where: { isDeleted: false },
        orderBy: { name: 'asc' },
      });

      for (const ds of dbSuppliers) {
        const existing = suppliers.find((s) => s.id === ds.id);
        if (existing) {
          existing.name = ds.name;
          existing.contactPerson = ds.contactPerson || '';
          existing.phone = ds.phone;
          existing.email = ds.email || '';
          existing.gstin = ds.gstin || '';
          existing.address = ds.address || '';
        } else {
          suppliers.unshift({
            id: ds.id,
            brandId: ds.brandId,
            name: ds.name,
            contactPerson: ds.contactPerson || '',
            phone: ds.phone,
            email: ds.email || '',
            gstin: ds.gstin || '',
            address: ds.address || '',
            city: ds.city || 'Bengaluru',
            state: ds.state || 'Karnataka',
            paymentTerms: ds.paymentTerms || 'Net 30 Days',
            outstandingBalance: 0,
            totalPurchasesYtd: 0,
          });
        }
      }
    } catch (dbErr) {
      // offline fallback
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

    let brandId = 'd072c454-2537-4f98-a227-c93f26c9c501';
    try {
      const dbBrand = await prisma.brand.findFirst();
      if (dbBrand) brandId = dbBrand.id;
    } catch (e) {}

    const newSupplier: MockSupplier = {
      id: `sup-${Date.now()}`,
      brandId,
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
      const created = await prisma.supplier.create({
        data: {
          brandId,
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
      newSupplier.id = created.id;
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
