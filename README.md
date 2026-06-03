# Travel

MAFTRAVEL — free AI travel planner. Type in your balance, pick a destination, and Grok builds a complete day-by-day plan with real addresses, prices, halal restaurants, and emergency contacts.

## Highlights

- 🧠 **AI Trip Studio** — `/hot-tours` · enter balance + days + city → Grok-built Berlin-style itinerary
- 🛫 **Flight search** — `/flights` · smart filters (stops, price range, time slots, airlines), deterministic seed
- 🗺️ **Detailed plan** — `/trip-plan` · 6–8 events per day, clickable Google-Maps addresses, transport-to-next legs, day map
- 🚨 **Emergency contacts** — 50+ countries, min 4 numbers each (police, ambulance, fire, tourist hotline)
- 💛 **Wishlist + My Plans** with destination hero images
- ✈️ **No payment** — free planning helper, not a booking platform

## Stack

- **React 19** + **Vite 5** + **Tailwind 4**
- **Zustand** state, **React Router 7**
- **xAI Grok** primary AI · template fallback when key absent
- **Framer Motion** animations, **Lucide** icons

## Run locally

```bash
npm install
cp .env.example .env   # add your VITE_GROK_API_KEY
npm run dev            # open http://localhost:5173
```

Without a Grok key the site still works — falls back to Smart Match plans with curated city attraction data.

## Build

```bash
npm run build
```

## Project layout

```
src/
├── pages/           Home, Flights, HotTours, TripPlan, Wishlist, MyBookings, Dashboard, Profile, Admin, NotFound
├── components/      Layout, Navbar, Footer, Toast, SmartImage, FlightBookingModal, ...
├── features/        flights/, planner/
├── services/        grokClient, aiPlannerService, aiPackageService, plannerService,
│                    emergencyContacts, cityAttractions, flightService
├── store/           useAuthStore, useAdminStore, useLangStore, useWishlistStore, useStore
├── utils/           destinationImages, imageFallback, mapsUrl, translations, cn
└── hooks/           useFlights, usePlanner, useSEO
```

## Credits

Images: Unsplash.  AI: xAI Grok.  Design echoes Booking.com & Kiwi.com.

Built with 💛 by Donik.
