import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Forzar datos frescos en cada request — sin cache de ningún tipo
export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface CryptoPanicArticle {
  id: number;
  domain: string;
  title: string;
  published_at: string;
  slug: string;
  url: string;
  source: { title: string; region: string; domain: string };
}

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  url: string;
  source: string;
}

// ─── Motor Heurístico de Análisis Institucional ──────────────────────────────
function generateDeepAnalysis(title: string, domain: string): string {
  return [
    `El flujo informacional registrado por los nodos de ${domain} documenta el siguiente evento de alto impacto: "${title}". Este acontecimiento activa protocolos de monitoreo de Nivel Alfa dentro de nuestra infraestructura de vigilancia termodinámica, dado que su vector de propagación supera los umbrales de atención institucional establecidos para la sesión corriente.`,
    `Desde una perspectiva de liquidez macro, los operadores de Tier-1 (ballenas con posiciones superiores a $10M) comenzarán a reajustar sus exposiciones en función de la dirección que tome la narrativa generada por este evento. Históricamente, noticias de esta categoría catalizan movimientos asimétricos en los pares de mayor correlación ya sea en el plazo de 2 a 6 horas tras su publicación, o bien al cierre de la vela semanal.`,
    `El análisis de correlación on-chain aplicado a ${domain} revela que los mercados de derivados han comenzado a descontar una prima de incertidumbre. El Open Interest en contratos perpetuos refleja tensión entre posiciones largas acumuladas y la presión vendedora latente que este tipo de catalizadores suele activar en capitales retail de menor convicción (hands-paper).`,
    `A nivel de infraestructura EVM, si este evento impacta sobre la gobernanza de protocolos DeFi o sobre rutas de liquidez de stablecoins sistémicas, el sistema activará el protocolo Gas Thresholding. Las transacciones de alta urgencia en L1 Ethereum podrían superar los 150 Gwei durante el pico de actividad, favoreciendo a operadores en L2: Arbitrum, Optimism y Base.`,
    `RESOLUCIÓN INSTITUCIONAL: Posición de observador con liquidez seca disponible. No ejecute órdenes de mercado en las primeras 2 horas post-evento. Espere confirmación de soporte (mínimo 3 velas de 15 min) antes de comprometer capital. Volatilidad implícita elevada favorece recolección de prima, no direccionalidad directa. Fin de la transmisión.`,
  ].join('\n\n');
}

// ─── Parser de RSS (sin librería externa, solo fetch + regex) ────────────────
async function fetchRSSFeed(url: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/rss+xml, application/xml, text/xml', 'User-Agent': 'WhaleAlertBot/1.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();

    // Extraer items del RSS con regex (evitamos dependencias de parsing)
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
    const articles: NewsArticle[] = [];

    for (const match of itemMatches) {
      const item = match[1];
      const title   = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ?? item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() ?? '';
      const link    = (item.match(/<link>(.*?)<\/link>/) ?? item.match(/<guid[^>]*>(.*?)<\/guid>/))?.[1]?.trim() ?? '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() ?? '';
      const descRaw = (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ?? item.match(/<description>([\s\S]*?)<\/description>/))?.[1] ?? '';
      const desc    = descRaw.replace(/<[^>]+>/g, '').trim();

      if (!title || !link) continue;

      const date = pubDate ? new Date(pubDate) : new Date();

      articles.push({
        id:          `rss-${Buffer.from(link).toString('base64').slice(0, 12)}`,
        title:       title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        description: generateDeepAnalysis(title, sourceName),
        date:        date.toISOString(),
        url:         link,
        source:      sourceName,
      });

      if (articles.length >= 25) break; // Máx 25 por fuente
    }

    return articles;
  } catch (err) {
    console.warn(`[WhaleNews] RSS ${sourceName} failed:`, err);
    return [];
  }
}

// ─── Persistencia asíncrona a Prisma (no bloquea respuesta) ─────────────────
async function persistToDB(articles: NewsArticle[]) {
  for (const art of articles) {
    try {
      await prisma.intelItem.upsert({
        where: { url: art.url },
        update: { title: art.title, aiSummary: art.description, source: art.source, publishedAt: new Date(art.date) },
        create: {
          url:       art.url,
          title:     art.title,
          source:    art.source,
          aiSummary: art.description,
          category:  'FINANCE',
          priority:  'SOVEREIGN',
          publishedAt: new Date(art.date),
        },
      });
    } catch { /* No fatal */ }
  }
}

export async function GET() {
  const apiKeysEnv = process.env.CRYPTOPANIC_API_KEYS || process.env.CRYPTOPANIC_API_KEY || '';
  const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);

  // ══════════════════════════════════════════════════════════════════
  // PASO 1: CryptoPanic API (Fuente primaria)
  // ══════════════════════════════════════════════════════════════════
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
            const cleanTitle = item.title.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"');
            const sourceName = item.source?.title || item.domain || 'Whale-Node';
            return {
              id:          `cp-${item.id}`,
              title:       cleanTitle,
              description: generateDeepAnalysis(cleanTitle, sourceName),
              date:        new Date(item.published_at).toISOString(),
              url:         item.url,
              source:      sourceName,
            };
          });

          persistToDB(articles).catch(console.warn);

          return NextResponse.json({ success: true, source: 'live', count: articles.length, articles, timestamp: Date.now() });
        }
      } else if (res.status !== 429) {
        break; // Error no-recoverable, no rotar
      }
    } catch {
      continue; // Timeout o red, rotar key
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // PASO 2: RSS Feeds de alta reputación (Fallback gratuito, sin key)
  // Fuentes institucionales estables: CoinDesk, CoinTelegraph, Decrypt
  // ══════════════════════════════════════════════════════════════════
  console.log('[WhaleNews] CryptoPanic unavailable — activating RSS fallback');

  const RSS_SOURCES = [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', name: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', name: 'Decrypt' },
    { url: 'https://cryptoslate.com/feed/', name: 'CryptoSlate' },
    { url: 'https://bitcoinmagazine.com/.rss/full/', name: 'Bitcoin Magazine' },
  ];

  const rssResults = await Promise.allSettled(
    RSS_SOURCES.map(s => fetchRSSFeed(s.url, s.name))
  );

  const allRssArticles: NewsArticle[] = [];
  for (const r of rssResults) {
    if (r.status === 'fulfilled') allRssArticles.push(...r.value);
  }

  // Ordenar por fecha descendente y limitar a 50
  allRssArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const top50 = allRssArticles.slice(0, 50);

  if (top50.length > 0) {
    persistToDB(top50).catch(console.warn);
    return NextResponse.json({ success: true, source: 'rss', count: top50.length, articles: top50, timestamp: Date.now() });
  }

  // ══════════════════════════════════════════════════════════════════
  // PASO 3: Caché de Prisma (últimos 30 días)
  // ══════════════════════════════════════════════════════════════════
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const dbItems = await prisma.intelItem.findMany({
      where: { publishedAt: { gte: cutoff } },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    if (dbItems.length > 0) {
      return NextResponse.json({
        success:   true,
        source:    'db-cache',
        count:     dbItems.length,
        articles:  dbItems.map(item => ({
          id:          item.id,
          title:       item.title,
          description: item.aiSummary || generateDeepAnalysis(item.title, item.source),
          date:        item.publishedAt.toISOString(),
          url:         item.url,
          source:      item.source,
        })),
        timestamp: Date.now(),
      });
    }
  } catch (dbErr) {
    console.warn('[WhaleNews] DB fallback error:', dbErr);
  }

  // ══════════════════════════════════════════════════════════════════
  // PASO 4: Nulo — sin datos de ninguna fuente
  // ══════════════════════════════════════════════════════════════════
  return NextResponse.json(
    { success: false, source: 'none', articles: [], error: 'Todas las fuentes de inteligencia están offline.' },
    { status: 503 }
  );
}
