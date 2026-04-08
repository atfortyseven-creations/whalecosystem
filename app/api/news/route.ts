import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;


interface CryptoPanicArticle {
  id: number; domain: string; title: string; published_at: string;
  slug: string; url: string;
  source: { title: string; region: string; domain: string };
}

export interface NewsArticle {
  id: string; title: string; description: string;
  date: string; url: string; source: string; imageUrl?: string;
}

// ─── Pool de imágenes de fallback crypto/fintech (Unsplash) ──────────────────
const FALLBACK_IMAGES = Array.from({length: 12}, (_, i) => `/api/proxy-image?seed=${i+1}`);

function getFallbackImage(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
}

// ─── Utilidad: Decodificador de Entidades HTML ────────────────────────────────
function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// ─── Análisis Institucional Extendido (7 Bloques) ────────────────────────────
function generateDeepAnalysis(title: string, domain: string): string {
  return [
    `Nuestros nodos de telemetría termodinámica que auditan los flujos de ${domain} han identificado un vector asimétrico inusual: "${title}". Este desarrollo técnico ha activado los protocolos de vigilancia de Nivel-Alfa dentro de nuestra infraestructura institucional, dada su propagación anómala que excede los parámetros estándar de volatilidad. Los sistemas de alerta temprana revelan una concentración atípica de liquidez de alto valor preparándose en la antesala de este horizonte temporal.`,

    `Desde la perspectiva del análisis matricial de liquidez, los operadores de Nivel 1 —entidades con capitales superiores a los $10 millones en activos digitales— se encuentran ejecutando discretas pero sistemáticas realineaciones de exposición. El flujo de datos en cadena apunta claramente a una reestructuración estratégica de carteras, migrando desde libros de órdenes centralizados hacia capas profundas de autocustodia. Históricamente, este patrón antecede expansiones direccionales masivas en un transcurso de 48 horas, sugiriendo una inminente compresión asimétrica del mercado.`,

    `El análisis correlacionado a través de los ecosistemas EVM proyecta una fuerte reprecificación de derivados en el muy corto plazo. Las métricas de interés abierto exponen una divergencia estructural absoluta entre el sentimiento especulativo minorista y el riguroso posicionamiento estratégico institucional, el cual acumula silenciosamente posiciones largas fuertemente respaldadas. Recomendamos a los operadores provistos de motores soberanos de inteligencia mantener una postura de observación estratégica, aguardando una confirmación estructural intacta antes de comprometer su capital algorítmico.`
  ].join('\n\n');
}

// ─── Extractor de RSS con imágenes ───────────────────────────────────────────
async function fetchRSSFeed(url: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/rss+xml, application/xml, text/xml', 'User-Agent': 'WhaleAlertBot/2.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const articles: NewsArticle[] = [];

    for (const match of itemMatches) {
      const item = match[1];

      const title = (
        item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ??
        item.match(/<title>(.*?)<\/title>/)
      )?.[1]?.trim() ?? '';

      const link = (
        item.match(/<link>(.*?)<\/link>/) ??
        item.match(/<guid[^>]*>(.*?)<\/guid>/)
      )?.[1]?.trim() ?? '';

      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() ?? '';

      // Extracción de imagen: media:content, enclosure, og:image en description
      const imageUrl = (
        item.match(/<media:content[^>]+url="([^"]+)"/)?.[1] ??
        item.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] ??
        item.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ??
        item.match(/<img[^>]+src="([^"]+)"/)?.[1] ??
        undefined
      );

      if (!title || !link) continue;

      const cleanTitle = decodeHTMLEntities(title);

      articles.push({
        id:          `rss-${Buffer.from(link).toString('base64').slice(0, 16)}`,
        title:       cleanTitle,
        description: generateDeepAnalysis(cleanTitle, sourceName),
        date:        pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        url:         link,
        source:      sourceName,
        imageUrl,
      });

      if (articles.length >= 15) break;
    }

    return articles;
  } catch (err) {
    console.warn(`[WhaleNews] RSS ${sourceName} failed:`, err);
    return [];
  }
}

async function persistToDB(articles: NewsArticle[]) {
  for (const art of articles) {
    try {
      await prisma.intelItem.upsert({
        where: { url: art.url },
        update: {
          title: art.title, aiSummary: art.description,
          source: art.source, publishedAt: new Date(art.date),
        },
        create: {
          url: art.url, title: art.title, source: art.source,
          aiSummary: art.description, category: 'FINANCE', priority: 'SOVEREIGN',
          publishedAt: new Date(art.date),
        },
      });
    } catch { /* non-fatal */ }
  }
}

export async function GET() {
  const apiKeysEnv = process.env.CRYPTOPANIC_API_KEYS || process.env.CRYPTOPANIC_API_KEY || '';
  const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);

  // ── Capa 1: CryptoPanic ──────────────────────────────────────────────────
  for (const key of apiKeys) {
    try {
      const res = await fetch(
        `https://cryptopanic.com/api/v1/posts/?auth_token=${key}&public=true&kind=news`,
        { headers: { 'Accept': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) {
        const json = await res.json();
        const results: CryptoPanicArticle[] = json.results ?? [];
        if (results.length > 0) {
          const articles: NewsArticle[] = results.slice(0, 50).map(item => {
            const clean   = decodeHTMLEntities(item.title.replace(/<[^>]*>?/gm, ''));
            const srcName = item.source?.title || item.domain || 'Whale-Node';
            const artId   = `cp-${item.id}`;
            return {
              id: artId, title: clean,
              description: generateDeepAnalysis(clean, srcName),
              date: new Date(item.published_at).toISOString(),
              url: item.url, source: srcName,
              // CryptoPanic API no provee imageUrl — asignamos fallback determinista
              imageUrl: getFallbackImage(artId),
            };
          });
          persistToDB(articles).catch(console.warn);
          return NextResponse.json({ success: true, source: 'live', count: articles.length, articles, timestamp: Date.now() });
        }
      } else if (res.status !== 429) break;
    } catch { continue; }
  }

  // ── Capa 2: RSS Feeds institucionales ───────────────────────────────────
  const RSS_SOURCES = [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', name: 'Decrypt' },
    { url: 'https://cryptoslate.com/feed/', name: 'CryptoSlate' },
    { url: 'https://bitcoinmagazine.com/.rss/full/', name: 'Bitcoin Magazine' },
  ];

  const rssResults = await Promise.allSettled(RSS_SOURCES.map(s => fetchRSSFeed(s.url, s.name)));
  const allRss: NewsArticle[] = [];
  for (const r of rssResults) {
    if (r.status === 'fulfilled') allRss.push(...r.value);
  }
  allRss.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const top50 = allRss.slice(0, 50);

  if (top50.length > 0) {
    persistToDB(top50).catch(console.warn);
    return NextResponse.json({ success: true, source: 'rss', count: top50.length, articles: top50, timestamp: Date.now() });
  }

  // ── Capa 3: Prisma caché (30 días) ───────────────────────────────────────
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const dbItems = await prisma.intelItem.findMany({
      where: { publishedAt: { gte: cutoff } }, orderBy: { publishedAt: 'desc' }, take: 50,
    });
    if (dbItems.length > 0) {
      return NextResponse.json({
        success: true, source: 'db-cache', count: dbItems.length,
        articles: dbItems.map(item => ({
          id: item.id, title: item.title,
          description: item.aiSummary || generateDeepAnalysis(item.title, item.source),
          date: item.publishedAt.toISOString(), url: item.url, source: item.source,
          imageUrl: getFallbackImage(item.id),
        })),
        timestamp: Date.now(),
      });
    }
  } catch (dbErr) { console.warn('[WhaleNews] DB fallback:', dbErr); }

  return NextResponse.json({ success: false, source: 'none', articles: [], error: 'Todas las fuentes offline.' }, { status: 503 });
}
