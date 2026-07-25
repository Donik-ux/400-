// Event types that aren't a sightseeing stop — skip these when picking photos
// (meals/logistics, not landmarks).
const NON_VISUAL_TYPES = new Set(['flight', 'transport', 'hotel', 'rest', 'food']);

/** Pulls unique, real, visitable place names out of a generated plan's events. */
export const attractionsFromPlan = (plan, max = 15) => {
  const seen = new Set();
  const out = [];
  for (const day of plan?.days || []) {
    for (const ev of day.events || []) {
      const name = ev?.name?.trim();
      const key = name?.toLowerCase();
      if (!name || NON_VISUAL_TYPES.has(ev.type) || !key || seen.has(key)) continue;
      seen.add(key);
      out.push(name);
      if (out.length >= max) return out;
    }
  }
  return out;
};
