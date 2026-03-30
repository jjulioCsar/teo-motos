/**
 * Meta Pixel & Conversions API — Client-Side Tracking Utility
 * 
 * This module provides typed helper functions to fire Meta Pixel events
 * from the browser AND simultaneously send them to our server-side
 * Conversions API route for redundant, accurate tracking.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

// ---------- Types ----------

interface ViewContentParams {
  content_name: string;   // e.g. "Honda CG 160"
  content_ids?: string[]; // e.g. ["moto-uuid"]
  content_type?: string;  // "product"
  value?: number;
  currency?: string;
}

interface LeadParams {
  content_name: string;   // e.g. "Simulação Financiamento"
  content_category?: string;
  value?: number;
  currency?: string;
}

interface ContactParams {
  content_name?: string;  // e.g. "WhatsApp - Honda CG 160"
}

interface InitiateCheckoutParams {
  content_name: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}

// ---------- Internal Helpers ----------

/** Safely access fbq on the window object */
function getFbq(): ((...args: unknown[]) => void) | null {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    return (window as any).fbq;
  }
  return null;
}

/** Hash a string with SHA-256 (for CAPI user_data) */
async function sha256(str: string): Promise<string> {
  if (typeof window === 'undefined' || !str) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(str.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Get fbp and fbc cookies for deduplication */
function getMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};
  const cookies = document.cookie.split(';').reduce((acc, c) => {
    const [key, val] = c.trim().split('=');
    acc[key] = val;
    return acc;
  }, {} as Record<string, string>);
  return {
    fbp: cookies['_fbp'] || undefined,
    fbc: cookies['_fbc'] || undefined,
  };
}

/** Send event to our server-side CAPI route */
async function sendServerEvent(
  eventName: string,
  customData: Record<string, unknown> = {},
  eventId: string
) {
  try {
    const { fbp, fbc } = getMetaCookies();
    await fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        sourceUrl: window.location.href,
        customData,
        userData: { fbp, fbc },
      }),
    });
  } catch (err) {
    // Silent fail — don't break UX for tracking
    console.warn('[Meta CAPI] Server event failed:', err);
  }
}

/** Generate a unique event ID for deduplication between Pixel + CAPI */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Public API ----------

/**
 * Track when a user views a motorcycle detail page.
 */
export function trackViewContent(params: ViewContentParams) {
  const fbq = getFbq();
  const eventId = generateEventId();
  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_type: params.content_type || 'product',
    value: params.value || 0,
    currency: params.currency || 'BRL',
  };

  // Client-side pixel
  fbq?.('track', 'ViewContent', data, { eventID: eventId });

  // Server-side CAPI
  sendServerEvent('ViewContent', data, eventId);
}

/**
 * Track when a user submits the financing simulation form (Lead).
 */
export function trackLead(params: LeadParams) {
  const fbq = getFbq();
  const eventId = generateEventId();
  const data = {
    content_name: params.content_name,
    content_category: params.content_category || 'Financiamento',
    value: params.value || 0,
    currency: params.currency || 'BRL',
  };

  fbq?.('track', 'Lead', data, { eventID: eventId });
  sendServerEvent('Lead', data, eventId);
}

/**
 * Track when a user clicks to contact via WhatsApp.
 */
export function trackContact(params: ContactParams = {}) {
  const fbq = getFbq();
  const eventId = generateEventId();
  const data = {
    content_name: params.content_name || 'WhatsApp Contact',
  };

  fbq?.('track', 'Contact', data, { eventID: eventId });
  sendServerEvent('Contact', data, eventId);
}

/**
 * Track when a user opens the financing modal (InitiateCheckout).
 */
export function trackInitiateCheckout(params: InitiateCheckoutParams) {
  const fbq = getFbq();
  const eventId = generateEventId();
  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    value: params.value || 0,
    currency: params.currency || 'BRL',
    num_items: params.num_items || 1,
  };

  fbq?.('track', 'InitiateCheckout', data, { eventID: eventId });
  sendServerEvent('InitiateCheckout', data, eventId);
}
