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

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix loads ALL vars (incl. non-VITE_) for server-side use.
  const env = loadEnv(mode, process.cwd(), '');
  process.env.TRAVELPAYOUTS_TOKEN   = env.TRAVELPAYOUTS_TOKEN   || process.env.TRAVELPAYOUTS_TOKEN;
  process.env.TRAVELPAYOUTS_MARKER  = env.TRAVELPAYOUTS_MARKER  || process.env.TRAVELPAYOUTS_MARKER;
  process.env.AMADEUS_CLIENT_ID     = env.AMADEUS_CLIENT_ID     || process.env.AMADEUS_CLIENT_ID;
  process.env.AMADEUS_CLIENT_SECRET = env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_CLIENT_SECRET;
  process.env.AMADEUS_ENV           = env.AMADEUS_ENV           || process.env.AMADEUS_ENV;

  return {
    plugins: [
      react(),
      tailwindcss(),
      amadeusDevApi(),
    ],
  };
});
