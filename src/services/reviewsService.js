/** Client for /api/reviews — public, unmoderated site reviews (Upstash-backed). */

const base = () => (import.meta.env?.BASE_URL || '/');

/** @returns {Promise<Array<{name, city, rating, text, createdAt}>>} */
export const fetchReviews = async () => {
  try {
    const res = await fetch(`${base()}api/reviews`);
    const data = await res.json().catch(() => null);
    return Array.isArray(data?.reviews) ? data.reviews : [];
  } catch {
    return [];
  }
};

/**
 * @param {{name: string, city?: string, destination?: string, rating: number, text: string}} review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const submitReview = async ({ name, city, destination, rating, text }) => {
  try {
    const res = await fetch(`${base()}api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, destination, rating, text }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { success: false, error: data?.error || `Request failed (${res.status})` };
    return { success: true, review: data.review };
  } catch {
    return { success: false, error: 'Could not reach the server — try again.' };
  }
};
