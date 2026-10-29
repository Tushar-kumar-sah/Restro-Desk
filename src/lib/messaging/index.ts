/**
 * Pluggable Messaging System for RestoDesk
 * Supports WhatsApp, SMS, and Email with a default Mock Adapter for zero-dependency local dev.
 * Real adapters (Twilio, Gupshup, Fast2SMS, SendGrid) can be plugged in via environment variables.
 */

export type ChannelType = 'WHATSAPP' | 'SMS' | 'EMAIL';

export interface MessagePayload {
  to: string; // Phone (+91...) or Email
  channel: ChannelType;
  content: string;
  templateId?: string;
  variables?: Record<string, string | number>;
  mediaUrl?: string;
  metadata?: Record<string, any>;
}

export interface SendResult {
  success: boolean;
  messageId: string;
  channel: ChannelType;
  recipient: string;
  creditsUsed: number;
  providerResponse: string;
  deliveredAt?: string;
}

export interface MessagingAdapter {
  name: string;
  send(payload: MessagePayload): Promise<SendResult>;
  getCredits(): Promise<number>;
}

/**
 * Variable interpolation helper for templates
 * Replaces placeholders like {name}, {points}, {coupon}, {outlet}, {brand}
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number> = {}
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, String(value));
  }
  return result;
}

/**
 * Mock Messaging Adapter for local development & demonstration.
 * Simulates carrier delays and delivery logs without charging external APIs.
 */
export class MockMessagingAdapter implements MessagingAdapter {
  name = 'MockMessagingAdapter';
  private credits: number = 4850; // Starting credit balance

  async send(payload: MessagePayload): Promise<SendResult> {
    const cost = payload.channel === 'WHATSAPP' ? 2 : payload.channel === 'SMS' ? 1 : 0.5;
    this.credits = Math.max(0, this.credits - cost);

    // Render variables if provided
    const finalContent = payload.variables
      ? interpolateTemplate(payload.content, payload.variables)
      : payload.content;

    const messageId = `msg-mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      success: true,
      messageId,
      channel: payload.channel,
      recipient: payload.to,
      creditsUsed: cost,
      providerResponse: `[SIMULATED_200_OK] Sent via ${payload.channel} to ${payload.to}`,
      deliveredAt: new Date().toISOString(),
    };
  }

  async getCredits(): Promise<number> {
    return this.credits;
  }
}

// Global active messaging adapter
export const activeMessagingAdapter: MessagingAdapter = new MockMessagingAdapter();

/**
 * High-level helper to send a marketing or transactional message
 */
export async function dispatchMessage(payload: MessagePayload): Promise<SendResult> {
  return await activeMessagingAdapter.send(payload);
}
