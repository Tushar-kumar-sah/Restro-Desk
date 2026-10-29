import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiKeys, createApiKey } from '@/lib/mock-data';

const createKeySchema = z.object({
  name: z.string().min(2, 'Key name is required'),
  permissions: z.array(z.string()).default(['orders:read', 'orders:write']),
});

export async function GET() {
  try {
    const keys = getApiKeys();
    return NextResponse.json({
      success: true,
      data: keys,
    });
  } catch (error) {
    console.error('Failed to get api keys:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createKeySchema.parse(body);

    const newKey = createApiKey(validated.name, validated.permissions);
    return NextResponse.json(
      {
        success: true,
        message: 'Developer API key generated',
        data: newKey,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to generate api key:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
