import { NextRequest, NextResponse } from 'next/server';

/**
 * Meta Conversions API (CAPI) Server-Side Route
 * 
 * Receives tracking events from the client and forwards them
 * to Meta's Graph API for server-side event deduplication.
 * This ensures accurate tracking even when ad blockers are active.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || '';
const GRAPH_API_URL = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

interface CAPIRequestBody {
  eventName: string;
  eventId: string;
  sourceUrl: string;
  customData?: Record<string, unknown>;
  userData?: {
    fbp?: string;
    fbc?: string;
    email?: string;
    phone?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Validate configuration
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn('[Meta CAPI] Missing PIXEL_ID or ACCESS_TOKEN');
      return NextResponse.json(
        { error: 'Meta CAPI not configured' },
        { status: 500 }
      );
    }

    const body: CAPIRequestBody = await request.json();
    const { eventName, eventId, sourceUrl, customData = {}, userData = {} } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: 'eventName is required' },
        { status: 400 }
      );
    }

    // Build the event payload for Meta CAPI
    const eventTime = Math.floor(Date.now() / 1000);

    const userDataPayload: Record<string, unknown> = {
      client_user_agent: request.headers.get('user-agent') || '',
      client_ip_address:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        '0.0.0.0',
    };

    // Add fbp/fbc for deduplication
    if (userData.fbp) userDataPayload.fbp = userData.fbp;
    if (userData.fbc) userDataPayload.fbc = userData.fbc;

    const event = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      event_source_url: sourceUrl,
      action_source: 'website',
      user_data: userDataPayload,
      custom_data: customData,
    };

    // Send to Meta Graph API
    const response = await fetch(`${GRAPH_API_URL}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [event],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta CAPI] Error from Meta:', result);
      return NextResponse.json(
        { error: 'Meta API error', details: result },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, events_received: result.events_received });
  } catch (error) {
    console.error('[Meta CAPI] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
