import { create } from 'zustand';

const S_FLIGHTS       = 'maf_admin_flights';
const S_PACKAGES      = 'maf_packages';
const S_BOOKINGS      = 'maf_bookings';
const S_HOTELS        = 'maf_hotels';
const S_NOTIFICATIONS = 'maf_notifications';
const S_SETTINGS      = 'maf_settings';

const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } };
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/* ─── Seed data ─── */
const SEED_FLIGHTS = [
  { id:'f1', from:'Bishkek (FRU)', to:'Dubai (DXB)',      dep:'08:00', arr:'11:30', dur:'4h 30m', airline:'Fly Dubai',       code:'FZ-301',  cabin:'Economy',  stops:0, price:280, seats:142, available:true },
  { id:'f2', from:'Bishkek (FRU)', to:'Istanbul (IST)',   dep:'14:20', arr:'17:50', dur:'5h 30m', airline:'Turkish Airlines', code:'TK-7021', cabin:'Economy',  stops:0, price:320, seats:98,  available:true },
  { id:'f3', from:'Bishkek (FRU)', to:'Moscow (SVO)',     dep:'06:10', arr:'08:00', dur:'3h 50m', airline:'Aeroflot',         code:'SU-1702', cabin:'Economy',  stops:0, price:190, seats:210, available:true },
  { id:'f4', from:'Bishkek (FRU)', to:'Bangkok (BKK)',    dep:'23:55', arr:'09:15', dur:'6h 20m', airline:'Air Arabia',       code:'G9-414',  cabin:'Economy',  stops:1, price:410, seats:74,  available:true },
  { id:'f5', from:'Bishkek (FRU)', to:'London (LHR)',     dep:'10:00', arr:'15:30', dur:'8h 30m', airline:'British Airways',  code:'BA-278',  cabin:'Economy',  stops:1, price:590, seats:56,  available:true },
  { id:'f6', from:'Bishkek (FRU)', to:'Paris (CDG)',      dep:'11:45', arr:'16:20', dur:'7h 35m', airline:'Air France',       code:'AF-881',  cabin:'Business', stops:1, price:980, seats:24,  available:true },
  { id:'f7', from:'Almaty (ALA)',  to:'Dubai (DXB)',      dep:'07:30', arr:'10:55', dur:'4h 25m', airline:'Fly Dubai',        code:'FZ-503',  cabin:'Economy',  stops:0, price:260, seats:180, available:true },
  { id:'f8', from:'Tashkent (TAS)',to:'Istanbul (IST)',   dep:'16:00', arr:'19:40', dur:'5h 40m', airline:'Turkish Airlines', code:'TK-428',  cabin:'Economy',  stops:0, price:295, seats:112, available:true },
];

const SEED_PACKAGES = [
  { id:'pkg1', name:'Dubai Luxury Escape',   destination:'Dubai, UAE',    duration:7,  price:2499, rating:4.9, reviews:412, category:'luxury',    image:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', includes:['Round-trip flights','5★ hotel','Desert safari','City tours','Airport transfers'], highlights:['Burj Khalifa visit','Dubai Mall & fountain show','Desert dune bashing','Dhow cruise dinner','Gold & Spice Souk'], description:'An ultra-luxurious escape to the City of Gold.', available:true, featured:true },
  { id:'pkg2', name:'Bali Tropical Paradise', destination:'Bali, Indonesia', duration:10, price:1899, rating:4.8, reviews:638, category:'beach',     image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', includes:['Round-trip flights','4★ resort','Rice terrace tours','Temple visits','Spa day'], highlights:['Tegallalang Rice Terraces','Tanah Lot Temple','Ubud Monkey Forest'], description:'Discover the Island of Gods.', available:true, featured:true },
  { id:'pkg3', name:'Istanbul Cultural Journey', destination:'Istanbul, Turkey', duration:6, price:1299, rating:4.7, reviews:287, category:'cultural', image:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', includes:['Round-trip flights','4★ hotel','Guided city tours'], highlights:['Hagia Sophia & Blue Mosque','Grand Bazaar shopping'], description:'Walk through centuries of history.', available:true, featured:false },
  { id:'pkg4', name:'Maldives Honeymoon Bliss', destination:'Maldives', duration:8, price:4299, rating:5.0, reviews:189, category:'beach',     image:'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', includes:['Business class flights','Overwater villa','All-inclusive meals'], highlights:['Overwater bungalow stay','Crystal-clear lagoon snorkeling'], description:'The ultimate romantic getaway.', available:true, featured:true },
  { id:'pkg5', name:'Tokyo Modern Adventure', destination:'Tokyo, Japan', duration:9, price:2799, rating:4.8, reviews:521, category:'cultural', image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', includes:['Round-trip flights','4★ hotel in Shinjuku','JR Pass (7 days)'], highlights:['Shibuya Crossing','Senso-ji Temple'], description:'Immerse in ultra-modern Japan.', available:true, featured:false },
  { id:'pkg6', name:'African Safari Adventure', destination:'Kenya & Tanzania', duration:12, price:5499, rating:4.9, reviews:143, category:'adventure', image:'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80', includes:['International flights','Luxury tented camps','All game drives'], highlights:['Great Migration at Masai Mara','Big Five game drives'], description:'Witness the greatest wildlife spectacle.', available:true, featured:true },
];

const SEED_BOOKINGS = [
  { id:'b1', userId:'user_demo', userName:'Alex Johnson', userEmail:'alex@example.com', type:'flight',  itemId:'f1',   itemName:'Bishkek → Dubai (FZ-301)',             date:'2026-04-15', passengers:2, total:560,  status:'confirmed', createdAt:'2026-03-28T10:15:00.000Z' },
  { id:'b2', userId:'user_demo', userName:'Sarah Lee',    userEmail:'sarah@example.com', type:'package', itemId:'pkg2', itemName:'Bali Tropical Paradise (10 days)',      date:'2026-05-01', passengers:2, total:3798, status:'pending',   createdAt:'2026-04-01T14:32:00.000Z' },
  { id:'b3', userId:'user_demo', userName:'Mike Brown',   userEmail:'mike@example.com',  type:'flight',  itemId:'f5',   itemName:'Bishkek → London (BA-278)',             date:'2026-04-22', passengers:1, total:590,  status:'confirmed', createdAt:'2026-03-30T09:00:00.000Z' },
  { id:'b4', userId:'user_demo', userName:'Emma Wilson',  userEmail:'emma@example.com',  type:'package', itemId:'pkg4', itemName:'Maldives Honeymoon Bliss (8 days)',     date:'2026-06-10', passengers:2, total:8598, status:'confirmed', createdAt:'2026-04-02T08:00:00.000Z' },
  { id:'b5', userId:'user_demo', userName:'James Davis',  userEmail:'james@example.com', type:'flight',  itemId:'f2',   itemName:'Bishkek → Istanbul (TK-7021)',          date:'2026-04-30', passengers:3, total:960,  status:'pending',   createdAt:'2026-04-03T16:45:00.000Z' },
];

const SEED_HOTELS = [
  { id:'h1', name:'Burj Al Arab',       city:'Dubai, UAE',       stars:5, pricePerNight:1200, rooms:202, available:true, image:'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=800&q=80', amenities:['Pool','Spa','Private Beach','Butler Service','Fine Dining'], description:'The world\'s most luxurious hotel, an iconic sail-shaped tower.' },
  { id:'h2', name:'Four Seasons Bali',  city:'Bali, Indonesia',  stars:5, pricePerNight:680,  rooms:147, available:true, image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', amenities:['Infinity Pool','Spa','Yoga','Rice Terraces View','Villas'], description:'A breathtaking resort nestled in the lush highlands of Bali.' },
  { id:'h3', name:'Ciragan Palace',     city:'Istanbul, Turkey', stars:5, pricePerNight:520,  rooms:313, available:true, image:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', amenities:['Bosphorus View','Pool','Hamam','Fine Dining','Concierge'], description:'A legendary Ottoman palace turned five-star luxury hotel.' },
  { id:'h4', name:'Conrad Maldives',    city:'Maldives',         stars:5, pricePerNight:2200, rooms:150, available:true, image:'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', amenities:['Overwater Bungalows','Dive Center','Spa','Water Sports','Restaurant'], description:'Spectacular overwater and beach villas on a pristine private island.' },
];

const SEED_SETTINGS = {
  siteName: 'MAFTRAVEL',
  currency: 'USD',
  language: 'en',
  contactEmail: 'admin@maftravel.com',
  contactPhone: '+996 700 000 000',
  commission: 10,
  maintenanceMode: false,
  primaryColor: '#0071c2',
};

const initFlights       = () => { const d = load(S_FLIGHTS,  null); if (!d) { save(S_FLIGHTS,  SEED_FLIGHTS);  return SEED_FLIGHTS;  } return d; };
const initPackages      = () => { const d = load(S_PACKAGES, null); if (!d) { save(S_PACKAGES, SEED_PACKAGES); return SEED_PACKAGES; } return d; };
const initBookings      = () => { const d = load(S_BOOKINGS, null); if (!d) { save(S_BOOKINGS, SEED_BOOKINGS); return SEED_BOOKINGS; } return d; };
const initHotels        = () => { const d = load(S_HOTELS,   null); if (!d) { save(S_HOTELS,   SEED_HOTELS);   return SEED_HOTELS;   } return d; };
const initNotifications = () => load(S_NOTIFICATIONS, []);
const initSettings      = () => load(S_SETTINGS, SEED_SETTINGS);

const useAdminStore = create((set, get) => ({
  adminFlights:  initFlights(),
  packages:      initPackages(),
  bookings:      initBookings(),
  hotels:        initHotels(),
  notifications: initNotifications(),
  settings:      initSettings(),

  /* ── Flights ── */
  addFlight: (flight) => {
    const f = { ...flight, id: `f${Date.now()}`, available: true };
    const next = [...get().adminFlights, f];
    save(S_FLIGHTS, next);
    set({ adminFlights: next });
  },
  updateFlight: (id, data) => {
    const next = get().adminFlights.map(f => f.id === id ? { ...f, ...data } : f);
    save(S_FLIGHTS, next);
    set({ adminFlights: next });
  },
  deleteFlight: (id) => {
    const next = get().adminFlights.filter(f => f.id !== id);
    save(S_FLIGHTS, next);
    set({ adminFlights: next });
  },

  /* ── Packages ── */
  addPackage: (pkg) => {
    const p = { ...pkg, id: `pkg${Date.now()}`, rating: 5.0, reviews: 0, available: true, featured: false };
    const next = [...get().packages, p];
    save(S_PACKAGES, next);
    set({ packages: next });
  },
  updatePackage: (id, data) => {
    const next = get().packages.map(p => p.id === id ? { ...p, ...data } : p);
    save(S_PACKAGES, next);
    set({ packages: next });
  },
  deletePackage: (id) => {
    const next = get().packages.filter(p => p.id !== id);
    save(S_PACKAGES, next);
    set({ packages: next });
  },

  /* ── Bookings ── */
  addBooking: (booking) => {
    const b = { ...booking, id: `b${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() };
    const next = [...get().bookings, b];
    save(S_BOOKINGS, next);
    // Create notification
    get().addNotification({
      type: 'booking',
      title: `New booking: ${b.itemName}`,
      message: `${b.userName} booked ${b.itemName} for $${b.total}`,
      severity: 'info',
    });
    set({ bookings: next });
    return b;
  },
  updateBookingStatus: (id, status) => {
    const next = get().bookings.map(b => b.id === id ? { ...b, status } : b);
    save(S_BOOKINGS, next);
    set({ bookings: next });
  },
  deleteBooking: (id) => {
    const next = get().bookings.filter(b => b.id !== id);
    save(S_BOOKINGS, next);
    set({ bookings: next });
  },
  getBookingsByUser: (userId) => get().bookings.filter(b => b.userId === userId),

  /* ── Hotels ── */
  addHotel: (hotel) => {
    const h = { ...hotel, id: `h${Date.now()}`, available: true };
    const next = [...get().hotels, h];
    save(S_HOTELS, next);
    set({ hotels: next });
  },
  updateHotel: (id, data) => {
    const next = get().hotels.map(h => h.id === id ? { ...h, ...data } : h);
    save(S_HOTELS, next);
    set({ hotels: next });
  },
  deleteHotel: (id) => {
    const next = get().hotels.filter(h => h.id !== id);
    save(S_HOTELS, next);
    set({ hotels: next });
  },

  /* ── Notifications ── */
  addNotification: (notif) => {
    const n = { ...notif, id: `n${Date.now()}`, createdAt: new Date().toISOString(), read: false };
    const next = [n, ...get().notifications].slice(0, 50);
    save(S_NOTIFICATIONS, next);
    set({ notifications: next });
  },
  markNotificationRead: (id) => {
    const next = get().notifications.map(n => n.id === id ? { ...n, read: true } : n);
    save(S_NOTIFICATIONS, next);
    set({ notifications: next });
  },
  markAllRead: () => {
    const next = get().notifications.map(n => ({ ...n, read: true }));
    save(S_NOTIFICATIONS, next);
    set({ notifications: next });
  },
  deleteNotification: (id) => {
    const next = get().notifications.filter(n => n.id !== id);
    save(S_NOTIFICATIONS, next);
    set({ notifications: next });
  },
  clearAllNotifications: () => {
    save(S_NOTIFICATIONS, []);
    set({ notifications: [] });
  },

  /* ── Settings ── */
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    save(S_SETTINGS, next);
    set({ settings: next });
  },
  resetSettings: () => {
    save(S_SETTINGS, SEED_SETTINGS);
    set({ settings: SEED_SETTINGS });
  },

  /* ── Stats ── */
  getStats: () => {
    const { bookings, packages, adminFlights, hotels } = get();
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const pending   = bookings.filter(b => b.status === 'pending');
    const revenue   = confirmed.reduce((s, b) => s + (b.total || 0), 0);
    return {
      totalBookings:     bookings.length,
      confirmedBookings: confirmed.length,
      pendingBookings:   pending.length,
      totalRevenue:      revenue,
      totalPackages:     packages.length,
      totalFlights:      adminFlights.length,
      totalHotels:       hotels.length,
    };
  },
}));

export default useAdminStore;
