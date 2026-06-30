/**
 * Central contact configuration.
 *
 * ⚠️ Replace WHATSAPP_NUMBER with your real WhatsApp business number
 *    (digits only, full international format, no "+", spaces or dashes).
 *    Example for Uzbekistan: 998901234567
 */
export const WHATSAPP_NUMBER = '998900000000';
export const SUPPORT_EMAIL   = 'support@maftravel.com';

/** Build a wa.me deep-link with an optional pre-filled message. */
export const whatsappLink = (message = '') => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
