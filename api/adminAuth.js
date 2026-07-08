// Real (server-verified) admin session, replacing the old client-only check.
//
// Before: src/store/useAuthStore.js compared the typed password to a
// hardcoded string IN THE CLIENT BUNDLE, and src/components/ProtectedRoute.jsx
// only checked `user.role === 'admin'` from localStorage — so anyone could
// open devtools, run `localStorage.setItem('maf_session', '{"role":"admin"}')`,
// and reload straight into /admin. There was no password check happening
// anywhere the client couldn't just skip.
//
// Now: the password lives only in ADMIN_PASSWORD (server env, never shipped
// to the browser). A successful login gets a token signed with a
// server-only secret (ADMIN_TOKEN_SECRET) via HMAC-SHA256. AdminRoute calls
// action:'verify' on every mount — forging a valid signature without the
// server secret is computationally infeasible, so localStorage tampering
// alone can no longer grant admin access.
import crypto from 'node:crypto';
import { checkRateLimit, sendRateLimited } from './_rateLimit.js';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function sign(payloadB64) {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

function issueToken() {
  const payload = JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_TTL_MS });
  const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [payloadB64, sig] = token.split('.');
  const expected = sign(payloadB64);
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch { return false; }
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export default async function handler(req, res) {
  const send = (status, obj) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };
  if (req.method !== 'POST') return send(405, { error: 'POST only' });
  if (!process.env.ADMIN_TOKEN_SECRET || !process.env.ADMIN_PASSWORD) {
    return send(501, { error: 'Admin auth not configured on the server' });
  }

  let body = req.body;
  if (typeof body === 'string') body = JSON.parse(body || '{}');
  if (!body) {
    let raw = ''; for await (const c of req) raw += c;
    body = raw ? JSON.parse(raw) : {};
  }

  if (body.action === 'verify') {
    return send(200, { valid: verifyToken(body.token) });
  }

  if (body.action === 'login') {
    // Slow brute force: a handful of tries per IP per 15 minutes.
    const rl = checkRateLimit(req, { limit: 8, windowMs: 15 * 60_000, bucket: 'admin-login' });
    if (!rl.allowed) return sendRateLimited(res, rl.retryAfterSec);

    if (!safeEqual(body.password, process.env.ADMIN_PASSWORD)) {
      return send(401, { error: 'Invalid password' });
    }
    return send(200, { token: issueToken() });
  }

  return send(400, { error: 'action must be "login" or "verify"' });
}
