import { create } from 'zustand';

/**
 * Persisted store for AI-generated trip plans.
 * Fixes the issue where a generated plan was lost on page reload —
 * users can now save a plan and reopen it later from "My Plans".
 */
const S_KEY = 'maf_saved_plans';
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota / private mode */ } };

const useSavedPlansStore = create((set, get) => ({
  // [{ id, savedAt, formData, itineraries, meta }]
  plans: load(S_KEY, []),

  /** Persist a plan. Returns the new plan id. */
  savePlan: ({ formData, itineraries, meta }) => {
    const id = `plan_${Date.now()}`;
    const entry = {
      id,
      savedAt:     new Date().toISOString(),
      formData:    { ...formData },
      itineraries: itineraries || [],
      meta:        meta || null,
    };
    const next = [entry, ...get().plans];
    save(S_KEY, next);
    set({ plans: next });
    return id;
  },

  removePlan: (id) => {
    const next = get().plans.filter(p => p.id !== id);
    save(S_KEY, next);
    set({ plans: next });
  },

  clearPlans: () => { save(S_KEY, []); set({ plans: [] }); },

  /** True when a plan for the same destination + days + budget already exists. */
  isSaved: (formData, meta) => get().plans.some(p =>
    p.formData?.destination === formData?.destination &&
    p.formData?.days === formData?.days &&
    p.meta?.budgetBreakdown?.total === meta?.budgetBreakdown?.total
  ),
}));

export default useSavedPlansStore;
