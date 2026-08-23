import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import removeMd from 'remove-markdown';
import { EdgeTTS } from 'node-edge-tts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/content/posts');
const AUDIO_DIR = path.join(__dirname, '../public/audio');

const tts = new EdgeTTS({ 
  voice: 'es-MX-JorgeNeural', // Voz masculina de México (Español Latino)
  timeout: 60000
});

async function processPosts() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, '');
    const audioPath = path.join(AUDIO_DIR, `${slug}.mp3`);

    if (fs.existsSync(audioPath)) {
      console.log(`Audio ya existe para: ${slug}. Omitiendo...`);
      continue;
    }

    console.log(`Generando audio para: ${slug}...`);
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Parse frontmatter
    const parsed = matter(content);
    
    // Remove markdown formatting
    let plainText = removeMd(parsed.content);
    // Remove URLs and extra whitespace to make it sound better
    plainText = plainText
      .replace(/https?:\/\/[^\s]+/g, 'enlace')
      .replace(/\n+/g, '. ')
      .trim();

    if (!plainText) {
      console.log(`No hay contenido en ${slug}, omitiendo.`);
      continue;
    }

    try {
      await tts.ttsPromise(plainText, audioPath);
      console.log(`Audio generado exitosamente: ${slug}.mp3`);
    } catch (err) {
      console.error(`Error al generar audio para ${slug}:`, err);
    }
  }
}

processPosts().catch(console.error);
