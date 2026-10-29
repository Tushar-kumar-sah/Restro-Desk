import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, createAuditLog } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;

    const logs = getAuditLogs(action, entityType);
    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLog = createAuditLog(body);
    return NextResponse.json({
      success: true,
      message: 'Audit log recorded',
      data: newLog,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
