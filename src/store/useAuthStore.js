import { create } from 'zustand';

const ADMIN      = { id: 'admin_1', name: 'Admin', email: 'admin@maftravel.com', role: 'admin', avatar: 'A' };
const GUEST      = { id: 'guest_1', name: 'Guest User', email: 'guest@maftravel.com', role: 'guest', avatar: 'G' };
const ADMIN_PASS = 'Admin@2026';
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

  /* ── Auth ── */
  login: (email, password) => {
    if (email === ADMIN.email && password === ADMIN_PASS) {
      localStorage.setItem(S_SESSION, JSON.stringify(ADMIN));
      set({ user: ADMIN });
      return { success: true };
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
