import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getTableServiceRequests,
  createTableServiceRequest,
  acknowledgeTableServiceRequest,
} from '@/lib/mock-data';

const createRequestSchema = z.object({
  outletId: z.string().default('outlet-01'),
  tableId: z.string().min(1, 'Table ID is required'),
  tableName: z.string().default('Table'),
  requestType: z.enum(['CALL_WAITER', 'REQUEST_BILL', 'WATER_REFILL', 'CLEAN_TABLE']),
  notes: z.string().optional(),
});

const patchRequestSchema = z.object({
  id: z.string().min(1, 'Request ID is required'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outletId = searchParams.get('outletId') || undefined;
    const status = searchParams.get('status') || undefined;

    const requests = getTableServiceRequests(outletId, status);
    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Failed to get table service requests:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createRequestSchema.parse(body);

    const newReq = createTableServiceRequest({
      outletId: validated.outletId,
      tableId: validated.tableId,
      tableName: validated.tableName,
      requestType: validated.requestType,
      notes: validated.notes,
    });

    const actionText =
      validated.requestType === 'CALL_WAITER'
        ? 'Waiter has been called to your table'
        : validated.requestType === 'REQUEST_BILL'
        ? 'Bill request sent to billing counter'
        : 'Service request dispatched to floor staff';

    return NextResponse.json(
      {
        success: true,
        message: actionText,
        data: newReq,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create table service request:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = patchRequestSchema.parse(body);

    const acknowledged = acknowledgeTableServiceRequest(validated.id);
    if (!acknowledged) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Service request resolved',
      data: acknowledged,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to update table service request:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
