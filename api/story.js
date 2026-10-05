import { renderStory, forImage } from '../lib/story.js';

// Rend une image JPEG 1080x1920 à partir de ?t=texte (utilisée par l'API Instagram).
export default async function handler(req, res) {
  const t = forImage(String(req.query.t || '')).slice(0, 300);
  if (!t) return res.status(400).end('missing text');
  try {
    const jpg = await renderStory(t, process.env.ACCOUNT_NAME || 'crush haberges');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(jpg);
  } catch (e) {
    res.status(500).end('render error');
  }
}
