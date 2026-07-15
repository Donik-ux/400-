import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev-only middleware so `/api/flights` (a Vercel serverless function in prod)
// also works under `npm run dev` — otherwise local dev always 404s on the API
// and falls back to template prices. Reads Amadeus creds from .env.
function amadeusDevApi() {
  return {
    name: 'amadeus-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/flights', async (req, res) => {
        const send = (status, obj) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        try {
          const url = new URL(req.originalUrl || req.url, 'http://localhost');
          const params = Object.fromEntries(url.searchParams);
          // Load the same handler module Vercel uses (kept in one place).
          const mod = await server.ssrLoadModule('/api/flights.js');
          const { status, body } = await mod.searchFlightsApi(params);
          send(status, body);
        } catch (err) {
          send(500, { error: String(err?.message || err), flights: [] });
        }
      });
    },
  };
}

// Dev-only middleware so `/api/hotels` (a Vercel serverless function in prod)
// also works under `npm run dev` — same pattern as amadeusDevApi above.
function hotelsDevApi() {
  return {
    name: 'hotels-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/hotels', async (req, res) => {
        const send = (status, obj) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        try {
          const url = new URL(req.originalUrl || req.url, 'http://localhost');
          const params = Object.fromEntries(url.searchParams);
          const mod = await server.ssrLoadModule('/api/hotels.js');
          const { status, body } = await mod.searchHotelsApi(params);
          send(status, body);
        } catch (err) {
          send(500, { error: String(err?.message || err), hotels: [] });
        }
      });
    },
  };
}

// Dev-only middleware so `/api/translate` (a Vercel serverless function in prod)
// also works under `npm run dev`. Proxies to free Google Translate server-side.
function translateDevApi() {
  return {
    name: 'translate-dev-api',
    configureServer(server) {
      // Local AV (e.g. Avast) often MITMs HTTPS with an untrusted cert which
      // breaks Node's fetch. Relax verification for the dev server only.
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      server.middlewares.use('/api/translate', async (req, res) => {
        const send = (status, obj) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        try {
          let raw = ''; for await (const c of req) raw += c;
          const body = raw ? JSON.parse(raw) : {};
          const mod = await server.ssrLoadModule('/api/translate.js');
          const translations = await mod.translateStrings(body);
          send(200, { translations });
        } catch (err) {
          send(500, { error: String(err?.message || err), translations: [] });
        }
      });
    },
  };
}

// Dev-only middleware for /api/aiAsk (Gemini proxy — keeps the key server-side,
// mirrors translateDevApi's shape).
function aiAskDevApi() {
  return {
    name: 'ai-ask-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/aiAsk', async (req, res) => {
        const send = (status, obj) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        try {
          let raw = ''; for await (const c of req) raw += c;
          const body = raw ? JSON.parse(raw) : {};
          const mod = await server.ssrLoadModule('/api/aiAsk.js');
          const text = await mod.askGeminiServer(body);
          send(200, { text });
        } catch (err) {
          send(err.status || 500, { error: String(err?.message || err) });
        }
      });
    },
  };
}

// Dev-only middleware for /api/adminAuth (real, server-verified admin login —
// replaces the old client-only "type any role into localStorage" check).
function adminAuthDevApi() {
  return {
    name: 'admin-auth-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/adminAuth', async (req, res) => {
        try {
          let raw = ''; for await (const c of req) raw += c;
          const mod = await server.ssrLoadModule('/api/adminAuth.js');
          const fakeReq = { method: req.method, headers: req.headers, socket: req.socket, body: raw };
          await mod.default(fakeReq, res);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err?.message || err) }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix loads ALL vars (incl. non-VITE_) for server-side use.
  // The `|| ''` tail matters: assigning `process.env.X = undefined` doesn't
  // clear it, it coerces to the literal string "undefined" (a Node quirk),
  // which then passes truthy `if (!key)` checks in the API handlers and
  // sends a real request with client_id="undefined" instead of cleanly
  // reporting "not configured".
  const env = loadEnv(mode, process.cwd(), '');
  process.env.TRAVELPAYOUTS_TOKEN   = env.TRAVELPAYOUTS_TOKEN   || process.env.TRAVELPAYOUTS_TOKEN   || '';
  process.env.TRAVELPAYOUTS_MARKER  = env.TRAVELPAYOUTS_MARKER  || process.env.TRAVELPAYOUTS_MARKER  || '';
  process.env.AMADEUS_CLIENT_ID     = env.AMADEUS_CLIENT_ID     || process.env.AMADEUS_CLIENT_ID     || '';
  process.env.AMADEUS_CLIENT_SECRET = env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_CLIENT_SECRET || '';
  process.env.AMADEUS_ENV           = env.AMADEUS_ENV           || process.env.AMADEUS_ENV           || '';
  process.env.GEMINI_API_KEY        = env.GEMINI_API_KEY        || process.env.GEMINI_API_KEY        || '';
  process.env.GEMINI_MODEL          = env.GEMINI_MODEL          || process.env.GEMINI_MODEL          || '';
  process.env.ADMIN_PASSWORD        = env.ADMIN_PASSWORD        || process.env.ADMIN_PASSWORD        || '';
  process.env.ADMIN_TOKEN_SECRET    = env.ADMIN_TOKEN_SECRET    || process.env.ADMIN_TOKEN_SECRET    || '';
  process.env.DUFFEL_API_KEY        = env.DUFFEL_API_KEY        || process.env.DUFFEL_API_KEY        || '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      amadeusDevApi(),
      hotelsDevApi(),
      translateDevApi(),
      aiAskDevApi(),
      adminAuthDevApi(),
    ],
  };
});
