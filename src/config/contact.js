/**
 * Central contact configuration.
 *
 * Every contact CTA on the site funnels into one place: the support inbox.
 * There is no messenger integration — a `mailto:` opens whatever mail client
 * the visitor already uses, so nothing extra has to be provisioned.
 */
export const SUPPORT_EMAIL = 'supportmaftravel@gmail.com';

/** Build a `mailto:` link to support with an optional subject and body. */
export const supportMailto = (subject = '', body = '') => {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${SUPPORT_EMAIL}${params.length ? `?${params.join('&')}` : ''}`;
};
