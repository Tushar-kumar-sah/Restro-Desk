import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Valid email or 10-digit phone required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { identifier } = result.data;

    // In a real environment, send via SMS adapter or Email adapter
    // For local and demo purposes, mock OTP is 123456
    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${identifier}. (Use demo OTP: 123456)`,
      otpSentTo: identifier,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
