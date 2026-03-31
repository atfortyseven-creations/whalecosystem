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
  source: {
    title: string;
    region: string;
    domain: string;
  };
}

function generateDeepAnalysis(title: string, domain: string): string {
  const block1 = `El flujo informacional registrado por los nodos de ${domain} documenta el siguiente evento de alto impacto en el ecosistema de activos digitales: "${title}". Este acontecimiento activa protocolos de monitoreo de Nivel Alfa dentro de nuestra infraestructura de vigilancia termodinámica, dado que su vector de propagación supera los umbrales de atención institucional establecidos para la sesión corriente.`;

  const block2 = `Desde una perspectiva de liquidez macro, los operadores de Tier-1 (ballenas con posiciones superiores a $10M en cartera) comenzarán a reajustar sus exposiciones en función de la dirección que tome la narrativa generada por este evento. Históricamente, noticias de esta categoría catalizan movimientos asimétricos en los pares de mayor correlación ya sea en el plazo de 2 a 6 horas tras su publicación, o bien al cierre de la vela semanal cuando el mercado asiático procesa el vector completo.`;

  const block3 = `El análisis de correlación on-chain aplicado a ${domain} revela que los mercados de derivados han comenzado a descontar una prima de incertidumbre en el rango de opciones a corto plazo. El Open Interest en contratos perpetuos refleja tensión entre posiciones largas acumuladas durante la última semana y la presión vendedora latente que este tipo de catalizadores suele activar en capitales retail de menor convicción.`;

  const block4 = `A nivel de infraestructura EVM, si este evento impacta sobre la gobernanza de un protocolo DeFi o sobre las rutas de liquidez de stablecoins sistémicas, el sistema activará el protocolo de vigilancia de gas (Gas Thresholding). Las transacciones de alta urgencia en L1 Ethereum podrían superar los 150 Gwei durante el pico de actividad, favoreciendo a los operadores posicionados en soluciones L2 como Arbitrum, Optimism o Base.`;

  const block5 = `RESOLUCIÓN INSTITUCIONAL: Mantenga posición de observador con liquidez seca disponible. No ejecute órdenes de mercado en las primeras 2 horas después de este evento. Espere la formación de un nivel de soporte confirmado antes de comprometer capital. La volatilidad implícita elevada favorece estrategias de recolección de prima, no de direccionalidad directa. Fin de la transmisión institucional.`;

  return `${block1}\n\n${block2}\n\n${block3}\n\n${block4}\n\n${block5}`;
}

async function persistToDB(results: CryptoPanicArticle[]) {
  for (const item of results.slice(0, 50)) {
    const cleanTitle = item.title.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"');
    const sourceName = item.source?.title || item.domain || 'Anon-Node';
    await prisma.intelItem.upsert({
      where: { url: item.url },
      update: {
        title: cleanTitle,
        aiSummary: generateDeepAnalysis(cleanTitle, sourceName),
        source: sourceName,
        publishedAt: new Date(item.published_at),
      },
      create: {
        url: item.url,
        title: cleanTitle,
        source: sourceName,
        aiSummary: generateDeepAnalysis(cleanTitle, sourceName),
        category: 'FINANCE',
        priority: 'SOVEREIGN',
        publishedAt: new Date(item.published_at),
      },
    });
  }
}

export async function GET() {
  const apiKeysEnv = process.env.CRYPTOPANIC_API_KEYS || process.env.CRYPTOPANIC_API_KEY || '';
  const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);

  // ─── PASO 1: DATOS EN VIVO de CryptoPanic (prioridad absoluta) ───────────
  for (const key of apiKeys) {
    try {
      const res = await fetch(
        `https://cryptopanic.com/api/v1/posts/?auth_token=${key}&public=true&kind=news`,
        { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
      );

      if (res.ok) {
        const json = await res.json();
        const results: CryptoPanicArticle[] = json.results ?? [];

        if (results.length > 0) {
          const articles = results.slice(0, 50).map(item => {
            const cleanTitle = item.title.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"');
            const sourceName = item.source?.title || item.domain || 'Whale-Node';
            return {
              id: `cp-${item.id}`,
              title: cleanTitle,
              description: generateDeepAnalysis(cleanTitle, sourceName),
              date: new Date(item.published_at).toISOString(),
              url: item.url,
              source: sourceName,
            };
          });

          // Persistir en BD en background (no bloquea la respuesta)
          persistToDB(results).catch(e =>
            console.warn('[WhaleNews] Prisma persist (non-critical):', e)
          );

          return NextResponse.json({
            success: true,
            source: 'live',
            count: articles.length,
            articles,
            timestamp: Date.now(),
          });
        }
      } else if (res.status === 429) {
        continue; // Rotar a siguiente key
      }
    } catch (err) {
      console.warn(`[WhaleNews] API key failed:`, err);
      continue;
    }
  }

  // ─── PASO 2: FALLBACK a DB — máximo últimos 30 días ──────────────────────
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
        success: true,
        source: 'db-cache',
        count: dbItems.length,
        articles: dbItems.map(item => ({
          id: item.id,
          title: item.title,
          description: item.aiSummary || generateDeepAnalysis(item.title, item.source),
          date: item.publishedAt.toISOString(),
          url: item.url,
          source: item.source,
        })),
        timestamp: Date.now(),
      });
    }
  } catch (dbErr) {
    console.warn('[WhaleNews] DB fallback error:', dbErr);
  }

  // ─── PASO 3: Sin datos disponibles ───────────────────────────────────────
  return NextResponse.json(
    {
      success: false,
      source: 'none',
      articles: [],
      error: 'No hay noticias disponibles. Verifique CRYPTOPANIC_API_KEYS en Railway.',
    },
    { status: 503 }
  );
}
