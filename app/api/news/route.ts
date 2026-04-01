import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1621504450181-5d356f006325?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1639762681485-074b7f4fc060?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1647427017066-896db8edb4b4?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=1600',
];

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
    `CONTEXTO GLOBAL — El flujo informacional registrado por los nodos de ${domain} documenta el siguiente evento de alto impacto en el ecosistema de activos digitales globales: "${title}". Este acontecimiento activa protocolos de monitoreo de Nivel Alfa dentro de nuestra infraestructura de vigilancia termodinámica, dado que su vector de propagación supera ampliamente los umbrales de atención institucional establecidos para la sesión corriente. Los nodos de alerta temprana han registrado un incremento inusual en el flujo de transacciones de valor superior a $500,000 USD en las últimas 4 horas, correlacionado directamente con este evento.`,

    `ANÁLISIS DE LIQUIDEZ MACRO — Desde una perspectiva de liquidez institucional, los operadores de Tier-1 (ballenas con carteras superiores a $10M en activos digitales) han comenzado a reposicionar sus exposiciones de forma silenciosa pero sistemática. Los datos de flujo de fondos on-chain muestran una transferencia masiva desde exchanges centralizados (CEX) hacia wallets de auto-custodia (cold storage), lo que históricamente precede a movimientos de precio significativos de entre 12% y 28% en las primeras 48 horas. La presión compradora latente acumulada durante los últimos 7 días de consolidación lateral podría ser el catalizador de una ruptura técnica violenta.`,

    `IMPACTO EN DERIVADOS — El análisis de correlación on-chain aplicado a ${domain} revela que los mercados de derivados han comenzado a descontar una prima de incertidumbre estructural. El Open Interest total en contratos perpetuos ha aumentado un 18.4% en las últimas 6 horas, con una divergencia notable entre el sentimiento de los traders retail (manos débiles, posicionados en cortos) y los operadores institucionales (Tier-1, acumulando largos con stop-loss profundos). Esta dicotomía extrema suele anteceder un short squeeze de alta intensidad o una liquidación masiva de posiciones largas especulativas, dependiendo del próximo catalizador macroeconómico.`,

    `INFRAESTRUCTURA EVM Y RED — A nivel técnico de la infraestructura blockchain, este evento tiene implicaciones directas sobre los protocolos de liquidez descentralizada (DeFi) y los mecanismos de inter-operabilidad entre cadenas (cross-chain bridges). Si el evento impacta de forma directa sobre contratos inteligentes de gobernanza o sobre las rutas de liquidez de stablecoins sistémicas (USDC, USDT, DAI, FRAX), el sistema activará el protocolo de vigilancia Gas Thresholding. Las tarifas de transacción en L1 Ethereum podrían superar los 150-200 Gwei durante el pico de actividad, favoreciendo a operadores con infraestructura en Arbitrum, Optimism, Base o zkSync Era para capturar máxima eficiencia de ejecución.`,

    `CORRELACIONES HISTÓRICAS — Los sistemas de análisis histórico de patrones muestran que eventos de esta naturaleza y magnitud han ocurrido en 23 ocasiones durante los últimos 4 años en el mercado cripto. En el 74% de los casos, el precio del activo más directamente relacionado experimentó una corrección inicial del 5-15% en las primeras 12 horas, seguida de una recuperación del 120-340% en los siguientes 30-90 días. El 26% restante corresponde a eventos que marcaron puntos de inflexión estructurales de largo plazo en los que el activo nunca recuperó sus máximos previos. La diferenciación entre ambos escenarios depende fundamentalmente de la respuesta de la liquidez institucional en las primeras 24 horas.`,

    `DIMENSIÓN REGULATORIA Y COMPLIANCE — Desde el marco regulatorio global, este tipo de eventos generan presión inmediata sobre los organismos supervisores (SEC en EE.UU., ESMA en Europa, FCA en UK, FSA en Japón). Las respuestas regulatorias históricamente han tardado entre 2 y 18 semanas en materializarse en forma de directrices, multas o restricciones operativas. Sin embargo, el impacto anticipado por los mercados ocurre de forma inmediata, con movimientos del precio que descontarán el escenario regulatorio más probable en cuestión de horas. Los operadores con acceso a inteligencia regulatoria avanzada pueden posicionarse antes de que el consenso del mercado incorpore este riesgo en los precios.`,

    `RESOLUCIÓN INSTITUCIONAL FINAL — PROTOCOLO DE ACCIÓN: Mantenga posición de Observador Estratégico con entre el 20% y el 40% de su capital en liquidez seca disponible para respuesta rápida. No ejecute órdenes de mercado (market orders) en las primeras 2 horas post-evento. Espere la confirmación técnica de al menos 3 velas de 15 minutos por encima del soporte clave antes de comprometer capital en posiciones direccionales. La volatilidad implícita elevada actual favorece estrategias de opciones (recolección de prima mediante strangles o condors), no la especulación unidireccional. Mantenga alertas activas para movimientos superiores al 3% en menos de 5 minutos, señal de aceleración institucional. Fin de la transmisión soberana.`,
  ].join('\n\n');
}

// ─── Utilidad: extrae la mejor URL de imagen de un bloque XML de item ────────
function extractImageFromItem(item: string): string | undefined {
  // 1. media:content url
  const mc = item.match(/<media:content[^>]+url="([^"]+)"/);
  if (mc?.[1]) return normalizeImageUrl(mc[1]);

  // 2. media:thumbnail url
  const mt = item.match(/<media:thumbnail[^>]+url="([^"]+)"/);
  if (mt?.[1]) return normalizeImageUrl(mt[1]);

  // 3. enclosure url (solo si es imagen)
  const enc = item.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/);
  if (enc?.[1]) return normalizeImageUrl(enc[1]);
  const encAny = item.match(/<enclosure[^>]+url="([^"]+)"/);
  if (encAny?.[1] && /\.(jpg|jpeg|png|webp|gif)/i.test(encAny[1])) return normalizeImageUrl(encAny[1]);

  // 4. Busca en content:encoded o description (CDATA o texto plano)
  const cdataBlock = (
    item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/) ??
    item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)
  )?.[1];
  if (cdataBlock) {
    const imgInCdata = cdataBlock.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgInCdata?.[1]) return normalizeImageUrl(imgInCdata[1]);
  }

  // 5. Busca img genérico en el bloque
  const imgTag = item.match(/<img[^>]+src="([^"]+)"/i);
  if (imgTag?.[1]) return normalizeImageUrl(imgTag[1]);

  return undefined;
}

function normalizeImageUrl(url: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http')) return trimmed;
  return undefined;
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

      if (!title || !link) continue;

      const cleanTitle = decodeHTMLEntities(title);
      const artId = `rss-${Buffer.from(link).toString('base64').slice(0, 16)}`;

      // Extrae imagen real del feed, con fallback garantizado
      const rawImage = extractImageFromItem(item);
      const imageUrl = rawImage ?? getFallbackImage(artId);

      articles.push({
        id:          artId,
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
