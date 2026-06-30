/**
 * Quick Gemini API key check.  Run from the project root:
 *
 *   node test-gemini.mjs
 *
 * It reads VITE_GEMINI_API_KEY / VITE_GEMINI_MODEL from .env and makes ONE
 * real translation call — the exact same request the app makes. Tells you
 * definitively whether the key works.
 */
import fs from 'node:fs';

const env = fs.readFileSync(new URL('./.env', import.meta.url), 'utf8');
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim() || '';

const key = get('VITE_GEMINI_API_KEY');
const model = get('VITE_GEMINI_MODEL') || 'gemini-2.5-flash';

console.log('Key prefix :', key.slice(0, 6) + '…', '(length ' + key.length + ')');
console.log('Model      :', model);
if (!key) { console.error('❌ No VITE_GEMINI_API_KEY in .env'); process.exit(1); }
if (key.startsWith('AIza')) console.log('ℹ️  Key looks like a standard Gemini API key.');
else console.log('⚠️  Key does NOT start with "AIza" — standard Gemini API keys do. This may be the problem.');

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
const body = {
  contents: [{ parts: [{ text: 'Translate to French. Return ONLY a JSON array, same order: ["Home","Flights","Sign In"]' }] }],
  generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
};

try {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  console.log('\nHTTP', res.status);
  if (res.ok) {
    const json = JSON.parse(text);
    const out = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    console.log('✅ SUCCESS — translation output:', out.trim());
  } else {
    console.error('❌ API ERROR:\n', text.slice(0, 800));
  }
} catch (e) {
  console.error('❌ NETWORK/FETCH FAILED:', e.message);
}
