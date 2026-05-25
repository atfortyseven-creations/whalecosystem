import DocLayout from '@/components/layout/DocLayout';
import { Code, Terminal, Zap, Shield } from 'lucide-react';

export default function ApiReferencePage() {
    return (
        <DocLayout
            title="API Reference"
            description="Complete documentation for the Whale Alert Network REST and WebSocket APIs. Integrate real-time wallet data, token transfers, and portfolio analytics."
            lastUpdated="May 25, 2026"
            category="Developer"
        >
            <div className="space-y-12">
                
                {/* Introduction */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">Introduction</h2>
                    <p className="text-lg text-black/70 dark:text-white/70 leading-relaxed mb-6">
                        The Whale Alert Network API provides programmatic access to our comprehensive blockchain indexing engine. You can fetch token prices, wallet balances, transaction histories, and real-time alerts across multiple EVM-compatible chains.
                    </p>
                    <div className="bg-[#FAF9F6] dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/10">
                        <h4 className="font-bold mb-2">Base URL</h4>
                        <code className="block bg-black/5 dark:bg-black/20 p-3 rounded-lg text-sm font-mono break-all">
                            https://api.whalealert.network/v1
                        </code>
                    </div>
                </section>

                {/* Authentication */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">Authentication</h2>
                    <p className="text-black/70 dark:text-white/70 leading-relaxed mb-4">
                        All requests to the API must be authenticated using an API Key. You can generate an API Key from your developer dashboard. Include the key in the Authorization header of your HTTP requests.
                    </p>
                    <div className="bg-slate-900 text-white p-6 rounded-2xl overflow-x-auto">
                        <pre className="text-sm font-mono">
{`curl -X GET "https://api.whalealert.network/v1/wallet/balances?address=0x..." \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                        </pre>
                    </div>
                </section>

                {/* Endpoints */}
                <section>
                    <h2 className="text-3xl font-bold mb-8">REST Endpoints</h2>

                    <div className="space-y-8">
                        {/* Endpoint 1 */}
                        <div className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 border-b border-black/10 dark:border-white/10 flex items-center gap-4">
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">GET</span>
                                <code className="font-mono text-sm font-bold">/v1/wallet/balances</code>
                            </div>
                            <div className="p-6">
                                <p className="mb-4 text-black/70 dark:text-white/70">Retrieves the current token balances for a specified wallet address across supported chains.</p>
                                
                                <h5 className="font-bold mb-2 text-sm uppercase tracking-wide">Query Parameters</h5>
                                <table className="w-full text-left text-sm mb-6 border-collapse">
                                    <thead>
                                        <tr className="border-b border-black/10 dark:border-white/10">
                                            <th className="py-2">Parameter</th>
                                            <th className="py-2">Type</th>
                                            <th className="py-2">Required</th>
                                            <th className="py-2">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        <tr>
                                            <td className="py-3 font-mono">address</td>
                                            <td className="py-3 text-black/60 dark:text-white/60">string</td>
                                            <td className="py-3"><span className="text-red-500">Yes</span></td>
                                            <td className="py-3 text-black/70 dark:text-white/70">The EVM wallet address.</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-mono">chainId</td>
                                            <td className="py-3 text-black/60 dark:text-white/60">number</td>
                                            <td className="py-3">No</td>
                                            <td className="py-3 text-black/70 dark:text-white/70">Filter by specific chain ID (e.g., 1 for Ethereum).</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h5 className="font-bold mb-2 text-sm uppercase tracking-wide">Response Example</h5>
                                <div className="bg-slate-900 text-white p-4 rounded-xl overflow-x-auto">
                                    <pre className="text-xs font-mono text-green-400">
{`{
  "success": true,
  "data": {
    "address": "0x123...",
    "totalValueUsd": 15420.50,
    "tokens": [
      {
        "symbol": "ETH",
        "balance": "1.5",
        "valueUsd": 4500.00
      }
    ]
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Endpoint 2 */}
                        <div className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden">
                            <div className="bg-slate-50 dark:bg-white/5 p-4 border-b border-black/10 dark:border-white/10 flex items-center gap-4">
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">GET</span>
                                <code className="font-mono text-sm font-bold">/v1/market/tokens</code>
                            </div>
                            <div className="p-6">
                                <p className="mb-4 text-black/70 dark:text-white/70">Fetches top tokens by market cap, volume, or trending status.</p>
                                
                                <h5 className="font-bold mb-2 text-sm uppercase tracking-wide">Query Parameters</h5>
                                <table className="w-full text-left text-sm mb-6 border-collapse">
                                    <thead>
                                        <tr className="border-b border-black/10 dark:border-white/10">
                                            <th className="py-2">Parameter</th>
                                            <th className="py-2">Type</th>
                                            <th className="py-2">Required</th>
                                            <th className="py-2">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                        <tr>
                                            <td className="py-3 font-mono">sort</td>
                                            <td className="py-3 text-black/60 dark:text-white/60">string</td>
                                            <td className="py-3">No</td>
                                            <td className="py-3 text-black/70 dark:text-white/70">'volume' | 'market_cap' | 'gainers'</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-mono">limit</td>
                                            <td className="py-3 text-black/60 dark:text-white/60">number</td>
                                            <td className="py-3">No</td>
                                            <td className="py-3 text-black/70 dark:text-white/70">Max 100. Default 20.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WebSockets */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">WebSocket Streams</h2>
                    <p className="text-black/70 dark:text-white/70 leading-relaxed mb-6">
                        For real-time applications, use our WebSocket API to subscribe to large transfers (whale alerts), price updates, or specific wallet transactions.
                    </p>
                    <div className="bg-slate-900 text-white p-6 rounded-2xl overflow-x-auto mb-6">
                        <pre className="text-sm font-mono text-blue-300">
{`const ws = new WebSocket('wss://stream.whalealert.network/v1');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    channel: 'large_transfers',
    min_value_usd: 1000000
  }));
};

ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  console.log('New Whale Alert:', alert);
};`}
                        </pre>
                    </div>
                </section>

                {/* Rate Limits */}
                <section>
                    <h2 className="text-3xl font-bold mb-4">Rate Limits</h2>
                    <p className="text-black/70 dark:text-white/70 leading-relaxed mb-4">
                        API rate limits are enforced based on your subscription tier. We use a sliding window algorithm.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-black/70 dark:text-white/70">
                        <li><strong>Free Tier:</strong> 10 requests per second (RPS), 10,000 requests per day.</li>
                        <li><strong>Pro Tier:</strong> 50 RPS, 500,000 requests per day.</li>
                        <li><strong>Enterprise Tier:</strong> Custom limits. Contact sales.</li>
                    </ul>
                    <p className="mt-4 text-sm text-black/50 dark:text-white/50">
                        When limits are exceeded, the API returns a <code>429 Too Many Requests</code> HTTP status code.
                    </p>
                </section>

            </div>
        </DocLayout>
    );
}
