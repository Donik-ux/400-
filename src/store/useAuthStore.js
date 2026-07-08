import { create } from 'zustand';

const ADMIN      = { id: 'admin_1', name: 'Admin', email: 'admin@maftravel.com', role: 'admin', avatar: 'A' };
const GUEST      = { id: 'guest_1', name: 'Guest User', email: 'guest@maftravel.com', role: 'guest', avatar: 'G' };
const S_USERS    = 'maf_users';
const S_SESSION  = 'maf_session';
const S_PROFILES = 'maf_profiles'; // passport / travel data per user

const loadUsers    = () => { try { return JSON.parse(localStorage.getItem(S_USERS)    || '[]');   } catch { return [];   } };
const loadSession  = () => { try { return JSON.parse(localStorage.getItem(S_SESSION)  || 'null'); } catch { return null; } };
const loadProfiles = () => { try { return JSON.parse(localStorage.getItem(S_PROFILES) || '{}');   } catch { return {};   } };
const saveUsers    = u  => localStorage.setItem(S_USERS,    JSON.stringify(u));
const saveProfiles = p  => localStorage.setItem(S_PROFILES, JSON.stringify(p));

const useAuthStore = create((set, get) => ({
  user: loadSession(),

  get isLoggedIn() { return !!get().user; },
  get isAdmin()    { return get().user?.role === 'admin'; },

  /* ── Auth ──
     Admin sign-in is verified server-side (api/adminAuth.js) — the password
     lives only in the server's ADMIN_PASSWORD env var and a successful login
     returns a signed session token. Everyday user accounts stay local/mock
     (no real backend for those yet), so only the single high-value admin
     credential is protected this way. */
  login: async (email, password) => {
    if (email === ADMIN.email) {
      try {
        const base = (import.meta.env?.BASE_URL || '/');
        const res = await fetch(`${base}api/adminAuth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.token) return { success: false, error: data.error || 'Invalid email or password' };
        const session = { ...ADMIN, token: data.token };
        localStorage.setItem(S_SESSION, JSON.stringify(session));
        set({ user: session });
        return { success: true };
      } catch {
        return { success: false, error: 'Could not reach the server — try again.' };
      }
    }
    const users = loadUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const session = { id: found.id, name: found.name, email: found.email, role: 'user', avatar: found.name[0].toUpperCase() };
      localStorage.setItem(S_SESSION, JSON.stringify(session));
      set({ user: session });
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  guestLogin: () => {
    localStorage.setItem(S_SESSION, JSON.stringify(GUEST));
    set({ user: GUEST });
    return { success: true };
  },

  register: (name, email, password) => {
    const users = loadUsers();
    if (email === ADMIN.email) return { success: false, error: 'Email already in use' };
    if (users.find(u => u.email === email)) return { success: false, error: 'Email already registered' };
    const newUser = { id: `user_${Date.now()}`, name, email, password, role: 'user', createdAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    const session = { id: newUser.id, name, email, role: 'user', avatar: name[0].toUpperCase() };
    localStorage.setItem(S_SESSION, JSON.stringify(session));
    set({ user: session });
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem(S_SESSION);
    set({ user: null });
  },

  /* Re-checks the current session's admin token against the server on every
     /admin visit. Forging `{role:'admin'}` in localStorage alone (the old
     bypass) no longer works — the signature can't be produced without the
     server-only ADMIN_TOKEN_SECRET. */
  verifyAdmin: async () => {
    const user = get().user;
    if (!user || user.role !== 'admin') return false;
    try {
      const base = (import.meta.env?.BASE_URL || '/');
      const res = await fetch(`${base}api/adminAuth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token: user.token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.valid) { get().logout(); return false; }
      return true;
    } catch {
      // Server unreachable — fail closed rather than trusting local state.
      return false;
    }
  },

  /* ── Passport / Travel Profile ── */
  getProfile: (userId) => {
    const id       = userId || get().user?.id;
    const profiles = loadProfiles();
    return profiles[id] || null;
  },

  saveProfile: (profileData) => {
    const userId = get().user?.id;
    if (!userId) return;
    const profiles = loadProfiles();
    profiles[userId] = { ...profiles[userId], ...profileData, updatedAt: new Date().toISOString() };
    saveProfiles(profiles);
    // Also update name in session if changed
    if (profileData.firstName || profileData.lastName) {
      const current = get().user;
      const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
      if (fullName && fullName !== current.name) {
        const updated = { ...current, name: fullName, avatar: (profileData.firstName || current.name)?.[0]?.toUpperCase() };
        localStorage.setItem(S_SESSION, JSON.stringify(updated));
        set({ user: updated });
      }
    }
  },

  /* ── Admin ── */
  getAllUsers: () => {
    const users = loadUsers();
    return [
      { id: ADMIN.id, name: ADMIN.name, email: ADMIN.email, role: 'admin', createdAt: '2024-01-01T00:00:00.000Z' },
      ...users.map(u => ({ id: u.id, name: u.name, email: u.email, role: 'user', createdAt: u.createdAt })),
    ];
  },

  deleteUser: (id) => {
    const users = loadUsers().filter(u => u.id !== id);
    saveUsers(users);
  },
}));

export default useAuthStore;
