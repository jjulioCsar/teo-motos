// Two seller WhatsApp numbers - system picks one per session
const WHATSAPP_NUMBERS = [
    '5582996711156',  // Seller 1: 82 9671-1156
    '5582987749749',  // Seller 2: 82 8774-9749
];

const SESSION_KEY = 'teo_whatsapp_seller';

/**
 * Returns a WhatsApp number that is fixed for the entire browser session.
 * On the first call, randomly picks a seller and saves to sessionStorage.
 * All subsequent calls in the same session return the same number.
 * This prevents the same customer from being sent to two different sellers.
 * 
 * On the server (SSR), returns the first number as a stable fallback
 * to avoid hydration mismatches — the client will immediately correct it
 * via useEffect if needed.
 */
export function getSessionWhatsAppNumber(): string {
    // Server-side: return stable fallback
    if (typeof window === 'undefined') {
        return WHATSAPP_NUMBERS[0];
    }

    // Client-side: check sessionStorage
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored && WHATSAPP_NUMBERS.includes(stored)) {
        return stored;
    }

    // First visit in this session: pick randomly and store
    const index = Math.floor(Math.random() * WHATSAPP_NUMBERS.length);
    const selected = WHATSAPP_NUMBERS[index];
    sessionStorage.setItem(SESSION_KEY, selected);
    return selected;
}

/**
 * Builds a WhatsApp URL with the session-fixed seller number.
 */
export function buildWhatsAppUrl(message: string): string {
    const number = getSessionWhatsAppNumber();
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
