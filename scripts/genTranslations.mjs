/**
 * Offline translation generator.
 *
 * Pre-translates the ENTIRE site dictionary into every language that lacks a
 * hand-written static dict, and writes the result to public/i18n/<lang>.json
 * (a flat { englishText: translation } map). The app loads these committed
 * files instantly at runtime with ZERO API calls (loadPrebuilt in
 * src/i18n/autoTranslate.js).
 *
 * Sources:
 *   --src=google   (default) free Google Translate endpoint, no key, fast.
 *   --src=gemini             Gemini (better quality, needs VITE_GEMINI_API_KEY,
 *                            free tier is rate-limited).
 *
 * Usage:
 *   node scripts/genTranslations.mjs                 # all non-static langs
 *   node scripts/genTranslations.mjs zh-CN ka ky     # only these
 *   node scripts/genTranslations.mjs --max=10        # first 10 (resumable)
 *   node scripts/genTranslations.mjs --src=gemini    # use Gemini instead
 *
 * Fully resumable — re-run any time to fill in whatever didn't complete.
 * NOTE: if your antivirus does HTTPS scanning (e.g. Avast), run with
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/genTranslations.mjs
 */
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'node:url';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── CLI ── */
const args = process.argv.slice(2);
const SRC = (args.find((a) => a.startsWith('--src=')) || '--src=google').split('=')[1];
const cliLangs = args.filter((a) => !a.startsWith('--'));
const maxArg = args.find((a) => a.startsWith('--max='));

/* ── 1. Load merged dictionary + language list via esbuild bundle ── */
const ENTRY = '.i18n-entry.mjs';
const BUNDLE = '.i18n-bundle.mjs';
fs.writeFileSync(ENTRY,
  `export { translations } from './src/i18n/index.js';\nexport { LANGUAGES } from './src/i18n/languages.js';\n`);
await build({ entryPoints: [ENTRY], bundle: true, format: 'esm', platform: 'node', outfile: BUNDLE, logLevel: 'error' });
const { translations, LANGUAGES } = await import(pathToFileURL(path.resolve(BUNDLE)).href + `?t=${Date.now()}`);
fs.rmSync(ENTRY); fs.rmSync(BUNDLE);

/* ── 2. Collect every unique English string ── */
const set = new Set();
const walk = (n) => {
  if (typeof n === 'string') { const s = n.trim(); if (s) set.add(n); return; }
  if (Array.isArray(n)) { n.forEach(walk); return; }
  if (n && typeof n === 'object') { for (const k in n) walk(n[k]); }
};
walk(translations.en);
const STRINGS = [...set];

/* ── 3. Targets ── */
const PRIORITY = ['zh-CN', 'zh-TW', 'ka', 'hy', 'kk', 'ky', 'fil', 'lv', 'et', 'gsw', 'fr-CH', 'it-CH', 'rm'];
const nonStatic = LANGUAGES.filter((l) => l.code !== 'en' && !l.static).map((l) => l.code);
const ordered = [...PRIORITY.filter((c) => nonStatic.includes(c)), ...nonStatic.filter((c) => !PRIORITY.includes(c))];
const targetName = (c) => LANGUAGES.find((l) => l.code === c)?.target || c;
let targets = cliLangs.length ? cliLangs : ordered;
if (maxArg) targets = targets.slice(0, Number(maxArg.split('=')[1]));

/* ── 4a. Google Translate source (free, no key) ── */
// Map our language codes to Google Translate codes where they differ.
const GCODE = {
  'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', yue: 'zh-TW', fil: 'tl', he: 'iw',
  gsw: 'de', 'fr-CH': 'fr', 'it-CH': 'it', jv: 'jw', 'pt-BR': 'pt', nb: 'no', nn: 'no',
};
const gcode = (c) => GCODE[c] || c.split('-')[0];

async function googleRaw(code, text) {
  const tl = gcode(code);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) { const e = new Error(`HTTP ${res.status}`); e.status = res.status; throw e; }
  const data = await res.json();
  const segs = data?.[0] || [];
  return segs.map((s) => s?.[0] ?? '').join('');
}

/* ── 4b. Gemini source (quality, rate-limited) ── */
const env = (() => { try { return fs.readFileSync('.env', 'utf8'); } catch { return ''; } })();
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim() || '';
const KEY = grab('VITE_GEMINI_API_KEY');
const MODEL = grab('VITE_GEMINI_MODEL') || 'gemini-2.5-flash';
const extractJson = (text) => {
  let s = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const i = s.indexOf('['), j = s.lastIndexOf(']');
  if (i !== -1 && j !== -1 && j > i) s = s.slice(i, j + 1);
  return JSON.parse(s);
};
async function geminiBatch(code, chunk) {
  const prompt = `You are a professional UI localization engine for a travel web app called MAFTRAVEL.
Translate each English string in the JSON array below into ${targetName(code)}.
Rules:
- Return ONLY a JSON array of strings, same length and order as the input.
- Keep it natural and concise — buttons, labels, headings, short sentences.
- Preserve ALL placeholders exactly, e.g. {name}, {count}, {0}, %s, \\n.
- Preserve emoji and the brand name MAFTRAVEL unchanged.
- Output the raw JSON array only.
Input:
${JSON.stringify(chunk)}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(KEY)}`;
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }),
  });
  if (!res.ok) { const t = await res.text(); const e = new Error(`HTTP ${res.status}: ${t.slice(0, 140)}`); e.status = res.status; throw e; }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || '';
  const arr = extractJson(text);
  if (!Array.isArray(arr)) throw new Error('not an array');
  return arr;
}

/* ── 5. Generate ── */
const OUT = path.join('public', 'i18n');
fs.mkdirSync(OUT, { recursive: true });
console.log(`source=${SRC} · ${STRINGS.length} strings · ${targets.length} languages\n`);

const GOOGLE_BATCH = 48;     // strings joined per request (newline-delimited)
let consecErr = 0;
let aborted = false;

async function genGoogle(code, dict, missing) {
  const single = missing.filter((s) => !s.includes('\n'));
  const multi = missing.filter((s) => s.includes('\n'));
  // batched (newline join → split back)
  for (let i = 0; i < single.length && !aborted; i += GOOGLE_BATCH) {
    const chunk = single.slice(i, i + GOOGLE_BATCH);
    let ok = false;
    for (let attempt = 0; attempt <= 3 && !ok; attempt++) {
      try {
        const full = await googleRaw(code, chunk.join('\n'));
        const parts = full.split('\n');
        if (parts.length === chunk.length) {
          chunk.forEach((s, j) => { if (parts[j]?.trim()) dict[s] = parts[j]; });
        } else {
          // misaligned — translate this chunk one-by-one
          for (const s of chunk) { try { const t = await googleRaw(code, s); if (t.trim()) dict[s] = t; await sleep(60); } catch { /* skip */ } }
        }
        ok = true; consecErr = 0;
      } catch (e) {
        consecErr += 1;
        if (e.status === 429 || consecErr > 8) { console.log(`   ${code}: rate-limited (${e.message}) — partial saved, re-run later`); aborted = consecErr > 12; return; }
        await sleep(1500 * (attempt + 1));
      }
    }
    fs.writeFileSync(path.join(OUT, `${code}.json`), JSON.stringify(dict));
    process.stdout.write(`   ${code}: ${Object.keys(dict).length}/${STRINGS.length}\r`);
    await sleep(120);
  }
  for (const s of multi) { try { const t = await googleRaw(code, s); if (t.trim()) dict[s] = t; await sleep(80); } catch { /* skip */ } }
  fs.writeFileSync(path.join(OUT, `${code}.json`), JSON.stringify(dict));
}

async function genGemini(code, dict, missing) {
  for (let i = 0; i < missing.length && !aborted; i += 100) {
    const chunk = missing.slice(i, i + 100);
    let arr = null;
    for (let attempt = 0; attempt <= 4; attempt++) {
      try { arr = await geminiBatch(code, chunk); consecErr = 0; break; }
      catch (e) {
        if (e.status === 429) { consecErr += 1; if (consecErr >= 6) { console.log('\n⛔ Gemini quota exhausted — re-run later.'); aborted = true; break; } await sleep(Math.min(60000, 8000 * 2 ** attempt)); }
        else if (attempt < 4) await sleep(2000 * (attempt + 1));
        else console.log(`   batch failed: ${e.message}`);
      }
    }
    if (!arr) break;
    chunk.forEach((s, j) => { if (typeof arr[j] === 'string' && arr[j].trim()) dict[s] = arr[j]; });
    fs.writeFileSync(path.join(OUT, `${code}.json`), JSON.stringify(dict));
    process.stdout.write(`   ${code}: ${Object.keys(dict).length}/${STRINGS.length}\r`);
    await sleep(1100);
  }
}

if (SRC === 'gemini' && !KEY) { console.error('Gemini source needs VITE_GEMINI_API_KEY in .env'); process.exit(1); }

for (const code of targets) {
  if (aborted) break;
  const file = path.join(OUT, `${code}.json`);
  let dict = {};
  if (fs.existsSync(file)) { try { dict = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { dict = {}; } }
  const missing = STRINGS.filter((s) => !dict[s]);
  if (!missing.length) { console.log(`✓ ${code} (${targetName(code)}) — complete`); continue; }
  console.log(`→ ${code} (${targetName(code)}): ${missing.length} to translate`);
  if (SRC === 'gemini') await genGemini(code, dict, missing);
  else await genGoogle(code, dict, missing);
  console.log(`\n   saved ${file} (${Object.keys(dict).length}/${STRINGS.length})`);
}
console.log('\nDone.');
