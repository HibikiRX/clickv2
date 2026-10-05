import crypto from 'node:crypto';

const SB_URL = process.env.SUPABASE_URL || 'https://zyodxrakwwzuoxxtentp.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_BpETOuc_jX8ajDizp727EQ_B2EXVv-A';
const IG_ID = process.env.IG_USER_ID;
const IG_TOKEN = process.env.IG_ACCESS_TOKEN;
const GRAPH = 'https://graph.facebook.com/v21.0';

// Filtre minimal : insultes courantes, liens, numéros de téléphone, @mentions.
const BLOCK = [/\bp[ue]tain?\b/i, /\bsalo(pe|pard)\b/i, /\bencul[ée]/i, /\bnique\b/i, /\bnazi/i, /\bsuicid/i,
  /https?:\/\//i, /www\./i, /\b0\d([ .-]?\d{2}){4}\b/, /@\w/];

const rpc = (fn, args) => fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
  method: 'POST',
  headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(args),
});

async function postStory(text, origin) {
  const image_url = `${origin}/api/story?t=${encodeURIComponent(text)}`;
  const c = await (await fetch(`${GRAPH}/${IG_ID}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'STORIES', image_url, access_token: IG_TOKEN }),
  })).json();
  if (!c.id) throw new Error(JSON.stringify(c.error || c));
  const p = await (await fetch(`${GRAPH}/${IG_ID}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: c.id, access_token: IG_TOKEN }),
  })).json();
  if (!p.id) throw new Error(JSON.stringify(p.error || p));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const text = String((req.body && req.body.text) || '').trim().replace(/\s+/g, ' ');
  if (!text || text.length > 300) return res.status(400).json({ error: 'Message invalide (1 à 300 caractères).' });
  if (BLOCK.some(r => r.test(text))) return res.status(422).json({ error: 'Ce message ne respecte pas les règles (insultes, liens, numéros, mentions).' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'ngl')).digest('hex');
  const rate = await rpc('rate_ok', { p_ip: ipHash });
  if (!rate.ok || (await rate.json()) !== true) return res.status(429).json({ error: 'Trop de messages, réessaie dans quelques minutes.' });

  let status = 'queued', error = null;
  if (IG_ID && IG_TOKEN) {
    try { await postStory(text, `https://${req.headers.host}`); status = 'posted'; }
    catch (e) { status = 'failed'; error = String(e.message || e); }
  }
  await rpc('log_confession', { p_body: text, p_status: status, p_error: error });
  res.status(200).json({ ok: true });
}
