import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NewsProcessor } from '@/lib/news-processor';
import { fetchNewsByCategory } from '@/lib/news-service';

export async function GET(request: Request) {
    console.log('[Sync][Legendary-v3] Triggering multi-stream global news synchronization...');
    try {
        const categories = ['crypto', 'tech', 'economy', 'world'];
        
        // Fetch from multiple streams in parallel
        const streamResults = await Promise.allSettled(
            categories.map(cat => fetchNewsByCategory(cat))
        );

        let allArticles: any[] = [];
        streamResults.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
                allArticles = [...allArticles, ...result.value];
            } else {
                console.warn(`[Sync] Stream ${categories[idx]} failed.`);
            }
        });

        // Map and prepare for processing
        const rawItems = allArticles.map((item: any) => ({
            id: item.id?.toString() || Math.random().toString(36).substring(7),
            title: item.title || 'Untitled Update',
            summary: item.description || item.title || 'No summary available',
            url: item.link || '#',
            source: item.source || 'Global Intelligence',
            publishedAt: item.pubDate || new Date().toISOString(),
            imageUrl: item.imageUrl,
            category: item.category?.[0] || 'global'
        }));

        console.log(`[Sync] Total items collected from all streams: ${rawItems.length}. Processing top 100.`);
        const legendaryBatch = rawItems.slice(0, 100);

        console.log(`[Sync] Starting legendary processing of ${legendaryBatch.length} items...`);
        const addedCount = await NewsProcessor.processBatch(legendaryBatch);

        return NextResponse.json({ 
            success: true, 
            addedCount,
            totalCollected: rawItems.length,
            streams: categories
        });

    } catch (error: any) {
        console.error('[Sync Fatal Error]:', error);
        return NextResponse.json({ 
            success: false, 
            error: "Internal sync failure",
            details: error.message 
        }, { status: 500 });
    }
}

