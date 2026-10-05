import satori from 'satori';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

let fontData;

// Satori ne gère pas les emojis : on les retire de l'image.
export const forImage = t => t.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '').replace(/\s+/g, ' ').trim();

export async function renderStory(text, account) {
  fontData ??= await readFile(new URL('./inter-800.woff', import.meta.url));
  const size = text.length > 180 ? 54 : text.length > 90 ? 70 : 90;
  const box = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });
  const tree = box({
    width: 1080, height: 1920, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    padding: 80, background: 'linear-gradient(160deg, #ff6b35, #f7197c)', fontFamily: 'Inter', color: '#fff',
  }, [
    box({ fontSize: 44, opacity: 0.9, marginBottom: 50 }, `message anonyme pour ${account}`),
    box({
      background: '#fff', color: '#111', borderRadius: 48, padding: 70, fontSize: size,
      textAlign: 'center', width: '100%', justifyContent: 'center', lineHeight: 1.25,
    }, text),
    box({ fontSize: 40, marginTop: 60, opacity: 0.9 }, 'envoie le tien en anonyme, lien en bio'),
  ]);
  const svg = await satori(tree, { width: 1080, height: 1920, fonts: [{ name: 'Inter', data: fontData, weight: 800, style: 'normal' }] });
  return sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
}
