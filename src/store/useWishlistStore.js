import { create } from 'zustand';

const S_WISHLIST = 'maf_wishlist';
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } };
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const useWishlistStore = create((set, get) => ({
  items: load(S_WISHLIST, []), // [{ id, type, data }]

  addToWishlist: (type, data) => {
    const exists = get().items.find(i => i.id === data.id && i.type === type);
    if (exists) return;
    const next = [...get().items, { id: data.id, type, data, addedAt: new Date().toISOString() }];
    save(S_WISHLIST, next);
    set({ items: next });
  },

  removeFromWishlist: (id, type) => {
    const next = get().items.filter(i => !(i.id === id && i.type === type));
    save(S_WISHLIST, next);
    set({ items: next });
  },

  toggleWishlist: (type, data) => {
    const exists = get().items.find(i => i.id === data.id && i.type === type);
    if (exists) get().removeFromWishlist(data.id, type);
    else get().addToWishlist(type, data);
  },

  isInWishlist: (id, type) => get().items.some(i => i.id === id && i.type === type),

  clearWishlist: () => { save(S_WISHLIST, []); set({ items: [] }); },
}));

export default useWishlistStore;
