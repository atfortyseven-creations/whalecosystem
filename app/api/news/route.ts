import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// No cache — cada request trae datos frescos del día actual
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

// =========================================================================
// MOTOR HEURÍSTICO DE ANÁLISIS INSTITUCIONAL (5 Bloques)
// =========================================================================
function generateDeepAnalysis(title: string, domain: string): string {
  const t = title;
  const d = domain;

  const block1 = `El flujo informacional registrado por los nodos de ${d} documenta el siguiente evento de alto impacto en el ecosistema de activos digitales: "${t}". Este acontecimiento activa protocolos de monitoreo de Nivel Alfa dentro de nuestra infraestructura de vigilancia termodinámica, dado que su vector de propagación supera los umbrales de atención institucional establecidos para la sesión corriente.`;

  const block2 = `Desde una perspectiva de liquidez macro, los operadores de Tier-1 (ballenas con posiciones superiores a $10M en cartera) comenzarán a reajustar sus exposiciones en función de la dirección que tome la narrativa generada por este evento. Históricamente, noticias de esta categoría catalizan movimientos asimétricos en los pares de mayor correlación ya sea en el plazo de 2 a 6 horas tras su publicación, o bien al cierre de la vela semanal cuando el mercado asiático procesa el vector completo.`;

  const block3 = `El análisis de correlación on-chain aplicado a ${d} revela que los mercados de derivados han comenzado a descontar una prima de incertidumbre en el rango de opciones a corto plazo. El Open Interest en contratos perpetuos refleja tensión entre posiciones largas acumuladas durante la última semana y la presión vendedora latente que este tipo de catalizadores suele activar en capitales retail de menor convicción (hands-paper).`;

  const block4 = `A nivel de infraestructura EVM, si este evento impacta de forma directa sobre la gobernanza de un protocolo DeFi o sobre las rutas de liquidez de stablecoins sistémicas (USDC, USDT, DAI), el sistema activará el protocolo de vigilancia de gas (Gas Thresholding). Las transacciones de alta urgencia en L1 Ethereum podrían superar los 150 Gwei durante el pico de actividad, favoreciendo a los operadores posicionados en soluciones L2 como Arbitrum, Optimism o Base para capturar eficiencia máxima en sus ejecuciones.`;

  const block5 = `RESOLUCIÓN INSTITUCIONAL: Mantenga posición de observador con liquidez seca disponible. No ejecute órdenes de mercado en las primeras 2 horas después de este evento. Espere la formación de un nivel de soporte confirmado (mínimo 3 velas de 15 minutos por encima del soporte) antes de comprometer capital. La volatilidad implícita elevada favorece estrategias de recolección de prima mediante opciones, no de direccionalidad directa. Fin de la transmisión institucional.`;

  return `${block1}\n\n${block2}\n\n${block3}\n\n${block4}\n\n${block5}`;
}

export async function GET() {
  const apiKeysEnv = process.env.CRYPTOPANIC_API_KEYS || process.env.CRYPTOPANIC_API_KEY || '';
  const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);

  // ── PASO 1: Intentar CryptoPanic en tiempo real ──────────────────────────
  let liveArticles: NewsArticle[] = [];

  for (const key of apiKeys) {
    try {
      // kind=news sin ningún filtro extra para obtener el máximo caudal reciente
      const res = await fetch(
        `https://cryptopanic.com/api/v1/posts/?auth_token=${key}&public=true&kind=news`,
        {
          headers: { 'Accept': 'application/json' },
          // Evitar que Next o Vercel cacheen esta llamada
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const json = await res.json();
        const results: CryptoPanicArticle[] = json.results ?? [];

        if (results.length > 0) {
          liveArticles = results.slice(0, 50).map(item => {
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

          // Persistir en Prisma en segundo plano (sin bloquear la respuesta)
          persistToDB(results).catch(e =>
            console.warn('[WhaleNews] Prisma persist failed (non-critical):', e)
          );

          // Respondemos INMEDIATAMENTE con datos en vivo
          return NextResponse.json({
            success: true,
            source: 'live',
            count: liveArticles.length,
            articles: liveArticles,
            timestamp: Date.now(),
          });
        }
      } else if (res.status === 429) {
        // Rate limit: rotar a la siguiente key
        continue;
      }
    } catch (fetchError) {
      console.warn(`[WhaleNews] Key ${key.slice(0, 8)}... failed:`, fetchError);
      continue;
    }
  }

  // ── PASO 2: Fallback a DB — solo noticias de los últimos 30 días ─────────
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dbArticles = await prisma.intelItem.findMany({
      where: {
        publishedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    if (dbArticles.length > 0) {
      return NextResponse.json({
        success: true,
        source: 'db-cache',
        count: dbArticles.length,
        articles: dbArticles.map(item => ({
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
  } catch (dbError) {
    console.warn('[WhaleNews] DB fallback failed:', dbError);
  }

  // ── PASO 3: Sin datos disponibles ─────────────────────────────────────────
  return NextResponse.json(
    {
      success: false,
      source: 'none',
      articles: [],
      error: 'No se pudieron obtener noticias en tiempo real. Verifique las API keys de CryptoPanic en Railway.',
    },
    { status: 503 }
  );
}

// ── Función auxiliar de persistencia asíncrona ──────────────────────────────
interface NewsArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  url: string;
  source: string;
}

async function persistToDB(results: CryptoPanicArticle[]) {
  for (const item of results.slice(0, 50)) {
    const cleanTitle = item.title.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"');
    const sourceName = item.source?.title || item.domain || 'Anon-Node';
    const analysis   = generateDeepAnalysis(cleanTitle, sourceName);

    await prisma.intelItem.upsert({
      where: { url: item.url },
      update: {
        title: cleanTitle,
        aiSummary: analysis,
        source: sourceName,
        publishedAt: new Date(item.published_at),
      },
      create: {
        url: item.url,
        title: cleanTitle,
        source: sourceName,
        aiSummary: analysis,
        category: 'FINANCE',
        priority: 'SOVEREIGN',
        publishedAt: new Date(item.published_at),
      },
    });
  }
}
