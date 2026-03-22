import DocLayout from '@/components/layout/DocLayout';
import { Code, Key, Zap, Shield, Book } from 'lucide-react';

export default function APIDocsPage() {
    return (
        <DocLayout
            title="API Documentation"
            description="Comprehensive API reference for integrating WhaleAlert ID.fi services into your applications."
            lastUpdated="February 7, 2026"
            category="Developers"
        >
            <div className="space-y-8">
                {/* Introduction */}
                <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-white/10">
                    <h2 className="text-4xl font-bold mb-4">WhaleAlert ID.fi API</h2>
                    <p className="text-lg text-white/80 mb-2">
                        Build powerful DeFi applications on top of our zero-knowledge identity and multi-chain infrastructure.
                    </p>
                    <div className="bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-lg mt-4">
                        <p className="text-sm font-bold">⚠️ API Status: COMING SOON (Q2 2026)</p>
                        <p className="text-sm text-white/70 mt-2">API access will be exclusive to LEGEND tier subscribers. Join the waitlist to be notified when APIs launch.</p>
                    </div>
                </section>

                {/* Getting Started */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                        <Zap className="text-yellow-400" />
                        Getting Started
                    </h2>

                    <h3 className="text-2xl font-bold mb-3">1. Obtain API Credentials</h3>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>Upgrade to <strong>LEGEND tier</strong></li>
                            <li>Navigate to <code className="bg-black/30 px-2 py-1 rounded">Settings → API Keys</code></li>
                            <li>Click <strong>"Generate New API Key"</strong></li>
                            <li>Securely store your <code>API_KEY</code> and <code>API_SECRET</code></li>
                        </ol>

                        <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-lg mt-4">
                            <h4 className="font-bold text-red-400 mb-2">🔒 Security Warning</h4>
                            <p className="text-sm">Treat API keys like passwords. Never commit them to Git, share them publicly, or expose them client-side. Use environment variables.</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">2. Base URL</h3>
                    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mb-6">
                        <code className="text-sm">https://api.WhaleAlert ID.fi/v1</code>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">3. Authentication</h3>
                    <p className="mb-4">All API requests require an <code>Authorization</code> header with your API key:</p>

                    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mb-4">
                        <pre className="text-sm overflow-x-auto"><code>{`Authorization: Bearer YOUR_API_KEY`}</code></pre>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">4. Rate Limits</h3>
                    <table className="w-full border border-white/10 text-sm mb-6">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Tier</th>
                                <th className="border border-white/10 p-3 text-left">Rate Limit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3">LEGEND</td>
                                <td className="border border-white/10 p-3">1000 requests/minute</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3">LEGEND Pro (future)</td>
                                <td className="border border-white/10 p-3">10,000 requests/minute</td>
                            </tr>
                        </tbody>
                    </table>

                    <p className="text-sm text-white/70">
                        Rate limit headers included in responses: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>
                    </p>
                </section>

                {/* Core Endpoints */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                        <Code className="text-green-400" />
                        Core Endpoints
                    </h2>

                    {/* Identity Verification */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4">Identity Verification</h3>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xl font-bold">Verify World ID Proof</h4>
                                <span className="bg-green-600/20 border border-green-500/30 px-3 py-1 rounded text-sm font-bold">POST</span>
                            </div>

                            <code className="text-sm text-blue-400">/identity/verify</code>

                            <p className="mt-4 mb-4 text-sm">Verify a World ID zero-knowledge proof without revealing user identity.</p>

                            <h5 className="font-bold mb-2">Request Body:</h5>
                            <div className="bg-black/30 p-4 rounded-lg mb-4 overflow-x-auto">
                                <pre className="text-xs"><code>{`{
  "proof": "0x...",
  "merkle_root": "0x...",
  "nullifier_hash": "0x...",
  "action": "vote",
  "signal": "optional_message"
}`}</code></pre>
                            </div>

                            <h5 className="font-bold mb-2">Response (200 OK):</h5>
                            <div className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-xs"><code>{`{
  "success": true,
  "verified": true,
  "nullifier_hash": "0x...",
  "timestamp": "2026-02-07T12:00:00Z"
}`}</code></pre>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xl font-bold">Check Identity Status</h4>
                                <span className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded text-sm font-bold">GET</span>
                            </div>

                            <code className="text-sm text-blue-400">/identity/status/:userId</code>

                            <p className="mt-4 mb-4 text-sm">Check if a user has verified their World ID.</p>

                            <h5 className="font-bold mb-2">Response (200 OK):</h5>
                            <div className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-xs"><code>{`{
  "user_id": "user_123",
  "verified": true,
  "verification_level": "HUMAN",
  "verified_at": "2026-01-15T10:30:00Z"
}`}</code></pre>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4">Portfolio & Analytics</h3>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xl font-bold">Get Wallet Balance</h4>
                                <span className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded text-sm font-bold">GET</span>
                            </div>

                            <code className="text-sm text-blue-400">/portfolio/balance/:walletAddress</code>

                            <p className="mt-4 mb-4 text-sm">Retrieve multi-chain token balances for a wallet address.</p>

                            <h5 className="font-bold mb-2">Query Parameters:</h5>
                            <ul className="list-disc pl-6 text-sm mb-4">
                                <li><code>chains</code> (optional): Comma-separated list (e.g., <code>eth,base,polygon</code>)</li>
                            </ul>

                            <h5 className="font-bold mb-2">Response (200 OK):</h5>
                            <div className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-xs"><code>{`{
  "wallet": "0x1234...",
  "total_value_usd": 12543.78,
  "chains": {
    "ethereum": {
      "native_balance": "1.5",
      "native_value_usd": 4500.00,
      "tokens": [...]
    },
    "base": {...},
    "polygon": {...}
  }
}`}</code></pre>
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xl font-bold">Get Whale Analytics</h4>
                                <span className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded text-sm font-bold">GET</span>
                            </div>

                            <code className="text-sm text-blue-400">/analytics/whale/:walletAddress</code>

                            <p className="mt-4 mb-4 text-sm">Get comprehensive whale analytics for a wallet (LEGEND only).</p>

                            <h5 className="font-bold mb-2">Response (200 OK):</h5>
                            <div className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-xs"><code>{`{
  "wallet": "0x1234...",
  "is_whale": true,
  "activity_score": 9850,
  "risk_score": 32,
  "blockchain_rank": "TOP_0.1%",
  "total_transactions": 15432,
  "analytics": {
    "top_counterparties": [...],
    "token_flows": {...},
    "pnl_breakdown": {...}
  }
}`}</code></pre>
                            </div>
                        </div>
                    </div>

                    {/* Trading */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold mb-4">Trading</h3>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xl font-bold">Get Real-Time Price</h4>
                                <span className="bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded text-sm font-bold">GET</span>
                            </div>

                            <code className="text-sm text-blue-400">/market/price/:symbol</code>

                            <p className="mt-4 mb-4 text-sm">Get current price for a trading pair (e.g., <code>BTCUSDT</code>).</p>

                            <h5 className="font-bold mb-2">Response (200 OK):</h5>
                            <div className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-xs"><code>{`{
  "symbol": "BTCUSDT",
  "price": "43256.78",
  "change_24h": "+2.34",
  "volume_24h": "1234567890",
  "timestamp": "2026-02-07T12:00:00Z"
}`}</code></pre>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WebSocket */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">WebSocket Streams</h2>

                    <p className="mb-4">Subscribe to real-time data feeds via WebSocket.</p>

                    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mb-6">
                        <code className="text-sm">wss://api.WhaleAlert ID.fi/v1/ws</code>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">Connection</h3>
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                        <pre className="text-xs overflow-x-auto"><code>{`const ws = new WebSocket('wss://api.WhaleAlert ID.fi/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    channel: 'trades',
    symbol: 'BTCUSDT',
    api_key: 'YOUR_API_KEY'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Trade:', data);
};`}</code></pre>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">Available Channels</h3>
                    <table className="w-full border border-white/10 text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Channel</th>
                                <th className="border border-white/10 p-3 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3"><code>trades</code></td>
                                <td className="border border-white/10 p-3">Real-time trade execution updates</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3"><code>orderbook</code></td>
                                <td className="border border-white/10 p-3">Order book depth updates</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3"><code>kline</code></td>
                                <td className="border border-white/10 p-3">Candlestick data (specify interval)</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3"><code>whale_alert</code></td>
                                <td className="border border-white/10 p-3">Large transaction notifications</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Error Handling */}
                <section>
                    <h2 className="text-3xl font-bold mb-6">Error Handling</h2>

                    <p className="mb-4">All errors return a consistent JSON structure:</p>

                    <div className="bg-black/30 p-4 rounded-lg border border-white/10 mb-6">
                        <pre className="text-xs overflow-x-auto"><code>{`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "details": "The provided API key is not valid or has been revoked"
  }
}`}</code></pre>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">HTTP Status Codes</h3>
                    <table className="w-full border border-white/10 text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="border border-white/10 p-3 text-left">Status</th>
                                <th className="border border-white/10 p-3 text-left">Meaning</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-white/10 p-3"><code>200</code></td>
                                <td className="border border-white/10 p-3">Success</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3"><code>400</code></td>
                                <td className="border border-white/10 p-3">Bad Request (invalid parameters)</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3"><code>401</code></td>
                                <td className="border border-white/10 p-3">Unauthorized (invalid credentials)</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3"><code>403</code></td>
                                <td className="border border-white/10 p-3">Forbidden (insufficient permissions)</td>
                            </tr>
                            <tr>
                                <td className="border border-white/10 p-3"><code>429</code></td>
                                <td className="border border-white/10 p-3">Rate Limit Exceeded</td>
                            </tr>
                            <tr className="bg-white/5">
                                <td className="border border-white/10 p-3"><code>500</code></td>
                                <td className="border border-white/10 p-3">Internal Server Error</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* SDKs */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                        <Book className="text-purple-400" />
                        Official SDKs
                    </h2>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">JavaScript / TypeScript</h4>
                            <code className="text-xs bg-black/30 px-2 py-1 rounded block mb-2">npm install @WhaleAlert ID/sdk</code>
                            <a href="https://github.com/WhaleAlert ID-fi/sdk-js" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">View on GitHub →</a>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Python</h4>
                            <code className="text-xs bg-black/30 px-2 py-1 rounded block mb-2">pip install WhaleAlert ID-sdk</code>
                            <a href="https://github.com/WhaleAlert ID-fi/sdk-python" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">View on GitHub →</a>
                        </div>

                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="font-bold mb-2">Go</h4>
                            <code className="text-xs bg-black/30 px-2 py-1 rounded block mb-2">go get WhaleAlert ID.fi/sdk</code>
                            <a href="https://github.com/WhaleAlert ID-fi/sdk-go" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">View on GitHub →</a>
                        </div>
                    </div>

                    <div className="bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-lg">
                        <p className="text-sm font-bold">📦 SDKs Coming with API Launch (Q2 2026)</p>
                        <p className="text-sm text-white/70 mt-2">We'll provide official SDKs for JavaScript, Python, Go, and Rust. Star our GitHub repos to be notified.</p>
                    </div>
                </section>

                {/* Support */}
                <section>
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                        <Shield className="text-green-400" />
                        Developer Support
                    </h2>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <p className="mb-4">Need help with the API?</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="font-bold">Documentation:</span>
                                <a href="/developers/api-docs" className="text-blue-400 hover:underline">Full API Reference</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold">GitHub:</span>
                                <a href="https://github.com/WhaleAlert ID-fi" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">WhaleAlert ID-fi</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold">Discord:</span>
                                <a href="https://discord.gg/WhaleAlert ID" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Join Developer Community</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="font-bold">Email:</span>
                                <a href="mailto:developers@WhaleAlert ID.fi" className="text-blue-400 hover:underline">developers@WhaleAlert ID.fi</a>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-white/10 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
                    <p className="text-lg text-white/80 mb-6">
                        Join the waitlist for API access and start building the future of DeFi.
                    </p>
                    <a href="/waitlist?tier=legend" className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold hover:scale-105 transition-transform">
                        Join API Waitlist →
                    </a>
                </section>
            </div>
        </DocLayout>
    );
}

