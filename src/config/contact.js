/**
 * Central contact configuration.
 *
 * WHATSAPP_NUMBER reads from VITE_WHATSAPP_NUMBER (set it in the Vercel
 * project's env vars, digits only, full international format, no "+",
 * spaces or dashes — e.g. 998901234567) so it can be fixed without a code
 * change. WHATSAPP_CONFIGURED tells callers whether to show the CTA at all —
 * a wa.me link built from an unset/placeholder number just 404s for the user.
 */
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
export const WHATSAPP_CONFIGURED = Boolean(WHATSAPP_NUMBER);
export const SUPPORT_EMAIL = 'supportmaftravel@gmail.com';

/** Build a wa.me deep-link with an optional pre-filled message. */
export const whatsappLink = (message = '') => {
  if (!WHATSAPP_CONFIGURED) return null;
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
