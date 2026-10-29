import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { MOCK_SUPPLIERS, MOCK_PURCHASE_ORDERS, MOCK_GRNS } from '@/lib/mock-data';

const SupplierUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  contactPerson: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().optional(),
  gstin: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  outstandingBalance: z.number().optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const supplier = MOCK_SUPPLIERS.find((s) => s.id === id);
    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });
    }

    const purchaseOrders = MOCK_PURCHASE_ORDERS.filter((po) => po.supplierId === id);
    const grns = MOCK_GRNS.filter((g) => g.supplierId === id);

    return NextResponse.json({
      success: true,
      supplier,
      purchaseOrders,
      grns,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validated = SupplierUpdateSchema.parse(body);

    const supplier = MOCK_SUPPLIERS.find((s) => s.id === id);
    if (!supplier) {
      return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });
    }

    if (validated.name !== undefined) supplier.name = validated.name;
    if (validated.contactPerson !== undefined) supplier.contactPerson = validated.contactPerson;
    if (validated.phone !== undefined) supplier.phone = validated.phone;
    if (validated.email !== undefined) supplier.email = validated.email;
    if (validated.gstin !== undefined) supplier.gstin = validated.gstin;
    if (validated.address !== undefined) supplier.address = validated.address;
    if (validated.paymentTerms !== undefined) supplier.paymentTerms = validated.paymentTerms;
    if (validated.outstandingBalance !== undefined)
      supplier.outstandingBalance = validated.outstandingBalance;

    try {
      await prisma.supplier.update({
        where: { id },
        data: {
          name: validated.name,
          contactPerson: validated.contactPerson,
          phone: validated.phone,
          email: validated.email,
          gstin: validated.gstin,
          address: validated.address,
          paymentTerms: validated.paymentTerms,
        },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({
      success: true,
      message: 'Supplier updated successfully',
      supplier,
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const index = MOCK_SUPPLIERS.findIndex((s) => s.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });
    }

    MOCK_SUPPLIERS.splice(index, 1);

    try {
      await prisma.supplier.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    } catch (dbErr) {
      // offline fallback
    }

    return NextResponse.json({ success: true, message: 'Supplier removed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
