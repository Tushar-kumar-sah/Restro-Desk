import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMessageTemplates, createMessageTemplate } from '@/lib/mock-data';

const createTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL']),
  category: z.enum(['PROMOTIONAL', 'TRANSACTIONAL', 'FEEDBACK', 'GREETING']).default('PROMOTIONAL'),
  content: z.string().min(5, 'Template content is required'),
  header: z.string().optional(),
  footer: z.string().optional(),
  sampleVariables: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || undefined;
    const templates = getMessageTemplates(channel);

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Failed to get templates:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTemplateSchema.parse(body);

    const newTemplate = createMessageTemplate({
      name: validated.name,
      channel: validated.channel,
      category: validated.category,
      content: validated.content,
      header: validated.header,
      footer: validated.footer,
      sampleVariables: validated.sampleVariables,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Template created and submitted for approval',
        data: newTemplate,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error('Failed to create template:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
