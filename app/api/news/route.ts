import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to fetch OpenGraph Image (Keep for legacy/manual enrichment if needed)
async function fetchOgImage(url: string): Promise<string> {
    try {
        const res = await fetch(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
            next: { revalidate: 3600 } 
        });
        const html = await res.text();
        const match = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (match && match[1]) return match[1];
    if (url.includes('bloomberg')) return "/official-whale-legendary.png";
    if (url.includes('reuters')) return "/official-whale-legendary.png";
    return "/official-whale-legendary.png";
    } catch (e) {
        return "/official-whale-legendary.png";
    }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[News-API][v2-check-777] Fetching news from DB...');
    const news = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 50
    });

    console.log(`[News-API] Returning ${news.length} analyzed articles`);
    
    return NextResponse.json({ 
        news: news
    });

  } catch (error: any) {
    console.error('[News-API] Fatal error:', error);
    return NextResponse.json({ 
      news: [],
      error: "Service unavailable",
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 200 }); // Fail open with 200 to prevent frontend crash
  }
}

