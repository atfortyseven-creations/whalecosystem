// workers/sentimentEngine.ts
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch'; // or global fetch depending on node v18+

/**
 * SOVEREIGN AI SENTIMENT ENGINE
 * Constantly polls RSS/X, feeds content to Grok API, and writes categorized JSON to Prisma.
 */

const prisma = new PrismaClient();
const GROK_API_KEY = process.env.GROK_API_KEY;

// Strict System Prompt ensuring JSON output matching our DB schema perfectly.
const GROK_SYSTEM_PROMPT = \`
You are the Omniverse Categorical Oracle. 
Analyze the provided text. Return ONLY a valid JSON object with the following schema:
{
  "sentiment": (Float from 0 to 100, where 0 is apocalyptic and 100 is euphoric),
  "bias": (String: "Bullish", "Bearish", or "Neutral"),
  "category": (String: "Macro", "Regulation", "DeFi", "Hacks", or "General"),
  "inferredSectorSlug": (String: closest match to our 103 sectors like "layer-1", "ai", "memecoins", etc.),
  "zScoreImpact": (Float from -5.0 to 5.0 indicating market-making rotation impact)
}\`;

async function getSentimentFromGrok(title: string, body: string) {
  const payload = {
    model: "grok-beta",
    messages: [
      { role: "system", content: GROK_SYSTEM_PROMPT },
      { role: "user", content: \`Title: \${title}\\n\\nContent: \${body}\` }
    ],
    temperature: 0.1,
  };

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${GROK_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(\`Grok API Error: \${response.statusText}\`);
  const data: any = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    console.error("Failed to parse Grok JSON:", data.choices[0].message.content);
    throw e;
  }
}

export async function processNewsItem(rawUrl: string, title: string, body: string, author: string) {
  console.log(\`[Sentiment Engine] Analyzing: "\${title}"\`);
  
  try {
    const analysis = await getSentimentFromGrok(title, body);
    
    // Look up the sector ID if inferredSectorSlug matches
    let sectorId = null;
    if (analysis.inferredSectorSlug) {
       const sector = await prisma.sector.findUnique({ where: { slug: analysis.inferredSectorSlug } });
       if (sector) sectorId = sector.id;
    }

    const article = await prisma.article.create({
      data: {
        title,
        content: body, // Depending on storage strategy, we might store summarized content
        sentiment: analysis.sentiment,
        bias: analysis.bias,
        category: analysis.category,
        author,
        sectorId
      }
    });

    console.log(\`[Sentiment Engine] DB Ingestion Complete. Bias: \${analysis.bias} (\${analysis.sentiment})\`);
    
    // In a prod environment, emit over Pusher WebSockets to trigger 
    // real-time UI flashes on the MobileNewsShell
    // await pusher.trigger('news-matrix', 'article_injected', { article });

  } catch (error) {
    console.error('[Sentiment Engine] Workflow failed:', error);
  }
}
