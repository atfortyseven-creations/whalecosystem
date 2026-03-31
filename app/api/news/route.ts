import { NextResponse } from 'next/server';

// Renovación diaria en Origin (Cache de 24 horas = 86400 segundos) para el endpoint entero
export const revalidate = 86400;

// Tipos base para la API cruda
interface NewsDataArticle {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  image_url: string | null;
  source_id: string;
}

// Función algorítmica de perfección lingüística y sanitización
function processNewsContent(text: string | null | undefined): string {
  if (!text) return "";
  let processed = text.toString();
  
  // 1. Eliminar tags HTML potencialmente inseguros o residuales (mitigación CSP)
  processed = processed.replace(/<[^>]*>?/gm, '');
  
  // 2. Decodificar entidades HTML básicas
  processed = processed.replace(/&quot;/g, '"')
                       .replace(/&#39;/g, "'")
                       .replace(/&amp;/g, '&')
                       .replace(/&lt;/g, '<')
                       .replace(/&gt;/g, '>');

  // 3. Mejorar fluidez: eliminar múltiples espacios y puntuación repetida
  processed = processed.replace(/\s{2,}/g, ' ')
                       .replace(/\.{2,}/g, '.')
                       .replace(/!+/g, '.') // Convertir exclamaciones a puntos (tono neutral humanizado)
                       .replace(/\?+/g, '?');

  // 4. Asegurar capitalización profesional
  processed = processed.trim();
  if (processed.length > 0) {
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
  }

  // 5. Acortar si es inusualmente largo para mostrarse fluido en el frontend Bento
  if (processed.length > 400) {
    processed = processed.substring(0, 397) + '...';
  }

  return processed;
}

export async function GET() {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY;
    
    // Fallback de demostración soberana si no existe API key, emulando perfección 100% on-chain.
    if (!apiKey) {
      console.warn("Whale News: NEWSDATA_API_KEY no detectada. Retornando datos estructurados simulados (Fallback 0-day).");
      const mockNews = [
        {
          id: 'news-1',
          title: 'Noticias Recientes: Evolución de las infraestructuras de Capa 2',
          description: 'Análisis del Mercado sobre la adopción reciente de Rollups ZK y su impacto en la reducción fraccional de gas para entidades institucionales. La red principal observa una migración sistemática de capital hacia ecosistemas de menor latencia.',
          date: new Date().toISOString(),
          url: 'https://humanidfi.com/news/1',
          source: 'WhaleCosystem Observatory'
        },
        {
          id: 'news-2',
          title: 'Análisis del Mercado: Modulación de incentivos en repositorios colateralizados',
          description: 'Se exponen nuevas métricas de absorción en protocolos de mercado monetario descentralizado. Los proveedores de liquidez están reestructurando sus posiciones frente a los ajustes dinámicos de las tasas base.',
          date: new Date(Date.now() - 3600000).toISOString(),
          url: 'https://humanidfi.com/news/2',
          source: 'WhaleCosystem Observatory'
        },
        {
          id: 'news-3',
          title: 'Eventos Importantes: Reajuste termodinámico en la emisión de divisas algorítmicas',
          description: 'Estudio de la fricción actual en modelos de estabilización algorítmica tras los recientes movimientos de liquidación en cascada. El mercado demuestra resiliencia ante pruebas de estrés volumétricas.',
          date: new Date(Date.now() - 7200000).toISOString(),
          url: 'https://humanidfi.com/news/3',
          source: 'WhaleCosystem Observatory'
        },
        {
          id: 'news-4',
          title: 'Noticias Recientes: Consolidación de derivados on-chain sobre redes EVM',
          description: 'El volumen transaccional en contratos perpetuos descentralizados alcanza niveles consistentes con picos históricos. Los arquitectos institucionales prefieren los mecanismos de enrutado transparentes.',
          date: new Date(Date.now() - 86400000).toISOString(),
          url: 'https://humanidfi.com/news/4',
          source: 'WhaleCosystem Observatory'
        },
        {
          id: 'news-5',
          title: 'Análisis del Mercado: Dinámicas de la Gobernanza descentralizada',
          description: 'Las tendencias recientes muestran un incremento en la sofisticación de las métricas de votación y las barreras cognitivas impuestas para resoluciones que afectan al protocolo general. Un enfoque cauteloso domina el panorama.',
          date: new Date(Date.now() - 172800000).toISOString(),
          url: 'https://humanidfi.com/news/5',
          source: 'WhaleCosystem Observatory'
        }
      ];
      return NextResponse.json({ success: true, count: 5, articles: mockNews }, { status: 200 });
    }

    // Flujo principal de integración real
    const url = `https://newsdata.io/api/1/crypto?apikey=${apiKey}&language=es`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
      throw new Error(`NewsData API respondió con estado: ${response.status}`);
    }

    const json = await response.json();
    
    // Transformación matemática y sanitaria al estándar de WhaleCosystem
    const processedArticles = (json.results || []).map((article: NewsDataArticle, index: number) => ({
      id: article.source_id || `whale-news-${index}-${Date.now()}`,
      title: processNewsContent(article.title) || 'Noticias Recientes del Ecosistema',
      description: processNewsContent(article.description),
      date: article.pubDate,
      url: article.link,
      source: article.source_id || 'Whale Algorithmic Source',
      // No incluimos imágenes para mantener la higiene absoluta CSP y el Minimalismo
    }));

    return NextResponse.json({
      success: true,
      count: processedArticles.length,
      articles: processedArticles,
      timestamp: Date.now() // Sirve para validar obsolescencia (24h) en frontend
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Whale News Backend] Error crítico en pipeline zero-latency:', error);
    return NextResponse.json(
      { success: false, error: 'Incapacidad de resolver termodinámica de noticias externas.' },
      { status: 500 }
    );
  }
}
