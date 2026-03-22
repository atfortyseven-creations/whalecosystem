export type Category =
    | "Trending" | "Breaking" | "New" | "Politics" | "Sports" | "Crypto"
    | "Finance" | "Geopolitics" | "Earnings" | "Tech" | "Culture" | "World"
    | "Economy" | "Climate & Science" | "Elections" | "Mentions";

export interface NewsItem {
    id: string | number;
    headline: string; // Keeping headline as primary but allowing title if needed by mapping
    title?: string;   // Optional alias
    description: string;
    category: Category;
    source: string;
    imageUrl: string;

    // Flexible Time/Date fields
    time?: string;
    date?: string;
    publishedAt?: string;
    timeAgo?: string;

    // URL
    url?: string;
}

// [PRODUCTION] Procedural News Generator replaced by /api/news
// Static fallback items only
export const NEWS_DATA: NewsItem[] = [
    {
        id: "1",
        headline: "Whale Alert Protocol Transitions to 100% Real-Time Data",
        description: "The protocol has successfully migrated to real-time APIs for all production feeds, ensuring maximum accuracy for users.",
        category: "Breaking",
        source: "Protocol Updates",
        imageUrl: "/news/real-data.jpg",
        time: "Just now"
    }
];


