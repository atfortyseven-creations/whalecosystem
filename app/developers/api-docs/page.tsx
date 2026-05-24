"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Code, Key, Building2, User, Star } from "lucide-react";
import Link from "next/link";
import { WhaleAlertLoader } from "@/components/ui/WhaleAlertLoader";
import { API_MARKETPLACE_PLANS } from "@/lib/api-marketplace-plans";

const PLANS = API_MARKETPLACE_PLANS;

function SecurityBadge({ text }: { text: string }) {
  return (
    <div className="text-sm text-slate-500 font-mono uppercase tracking-widest">
      {text}
    </div>
  );
}

export default function APIDocsPage() {
  return (
    <React.Suspense fallback={<WhaleAlertLoader bg="#FAFAF8" color="#050505" />}>
      <APIDocsPageContent />
    </React.Suspense>
  );
}

function APIDocsPageContent() {
  const { address, isConnected, status } = useAccount();
  const isSignedIn = isConnected;
  const isLoaded = status !== 'connecting' && status !== 'reconnecting';
  const router = useRouter();

  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiUsage, setApiUsage] = useState<{ requests: number; limit: number; reset: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoKeyExpiry, setDemoKeyExpiry] = useState<number | null>(null);

  const generateDemoKey = () => {
    if (!address) return;
    const key = `demo_${address.slice(0, 8)}_${Date.now()}`;
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    setApiKey(key);
    setDemoKeyExpiry(expiry);
    localStorage.setItem('demo_api_key', key);
    localStorage.setItem('demo_api_expiry', expiry.toString());
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !address) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.user?.tier || null);
          setApiKey(data.user?.apiKey || null);
          setApiUsage(data.user?.apiUsage || null);
        } else {
          generateDemoKey();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        generateDemoKey();
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isSignedIn, address]);

  useEffect(() => {
    if (demoKeyExpiry && Date.now() > demoKeyExpiry) {
      setApiKey(null);
      setDemoKeyExpiry(null);
      localStorage.removeItem('demo_api_key');
      localStorage.removeItem('demo_api_expiry');
    }
  }, [demoKeyExpiry]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (demoKeyExpiry && Date.now() > demoKeyExpiry) {
        setApiKey(null);
        setDemoKeyExpiry(null);
        localStorage.removeItem('demo_api_key');
        localStorage.removeItem('demo_api_expiry');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [demoKeyExpiry]);

  const currentPlan = PLANS.find(p => p.id.toLowerCase() === userPlan?.toLowerCase());

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-24 pb-24 transform-gpu will-change-transform">

        {/* HEADER */}
        <div className="text-center mb-16">
          <Link href="/" className="text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mb-6 inline-block">
             Whale Alert Corporation
          </Link>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-4">
            API Documentation
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-xl">
            Large-wallet alerts and market-flow data over REST and WebSocket—with HMAC authentication.
          </p>
        </div>

        {/* USER DASHBOARD OR PRICING CTA */}
        {loading ? (
          <div className="w-full py-12 flex items-center justify-center">
            <div className="text-lg font-black text-slate-400">Loading...</div>
          </div>
        ) : !isSignedIn ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10 mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Connect Your Wallet</h2>
            <p className="text-base text-slate-500 mb-6">
              Connect your wallet to view your API dashboard and credentials.
            </p>
            <Link href="/login?redirect=/developers/api-docs">
              <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-base hover:bg-slate-800 transition-colors">
                Connect Wallet
              </button>
            </Link>
          </div>
        ) : !currentPlan ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10 mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Demo API Access</h2>
            <p className="text-base text-slate-500 mb-6">
              You have a demo API key for testing. This key expires in 10 minutes.
            </p>

            {/* Demo API Key Display */}
            <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900">Your Demo API Key</h3>
                {demoKeyExpiry && (
                  <span className="text-sm text-slate-400 font-mono">
                    Expires in {Math.max(0, Math.ceil((demoKeyExpiry - Date.now()) / 60000))} minutes
                  </span>
                )}
              </div>
              <div className="bg-slate-100 rounded-xl p-4 font-mono text-base text-slate-700 break-all">
                {apiKey || 'Loading...'}
              </div>
              <div className="mt-4 space-y-2">
                <SecurityBadge text="Demo key for testing only" />
                <SecurityBadge text="Expires in 10 minutes" />
                <SecurityBadge text="Rate limit: 100 requests per day" />
                <SecurityBadge text="Tokens: 5 supported" />
              </div>
            </div>

            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-500">
                This is a demo key for testing purposes. To get full API access with higher limits and permanent keys, contact us at developers@humanidfi.com
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{currentPlan.name} Plan</h2>
                <div className="text-sm text-slate-500">Active subscription</div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900">${currentPlan.price}</span>
                <span className="text-slate-400 text-sm font-mono">/mo</span>
              </div>
            </div>

            {/* API Key Display */}
            <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900">Your API Key</h3>
                <span className="text-sm text-slate-400 font-mono">Keep this secret</span>
              </div>
              <div className="bg-slate-100 rounded-xl p-4 font-mono text-base text-slate-700 break-all">
                {apiKey || 'Loading...'}
              </div>
              <div className="mt-4 space-y-2">
                <SecurityBadge text="HMAC authentication required" />
                <SecurityBadge text={`Rate limit: ${currentPlan.requests} per day`} />
                <SecurityBadge text={`Tokens: ${currentPlan.tokens} supported`} />
              </div>
            </div>

            {/* Usage Stats */}
            {apiUsage && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-xl font-black text-slate-900 mb-4">API Usage Today</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-base mb-2">
                      <span className="text-slate-500">Requests Used</span>
                      <span className="font-black text-slate-900">{apiUsage.requests} / {apiUsage.limit}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-slate-900 h-2 rounded-full transition-all"
                        style={{ width: `${(apiUsage.requests / apiUsage.limit) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 font-mono">
                    Resets: {new Date(apiUsage.reset).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API DOCUMENTATION */}
        <div className="space-y-12">
          {/* Getting Started */}
          <section>
            <h2 className="text-4xl font-black mb-6">
              Getting Started
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-4">1. Base URL</h3>
              <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-sm mb-6">
                https://api.humanidfi.com/v1
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4">2. Authentication</h3>
              <p className="text-slate-500 mb-4">
                All API requests require HMAC authentication using your API key and secret.
              </p>

              <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto">
                <pre>{`Authorization: Bearer YOUR_API_KEY
X-API-Signature: hmac_sha256(api_secret, timestamp + method + path + body)
X-API-Timestamp: unix_timestamp`}</pre>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4">3. Rate Limits by Plan</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-200 p-3 text-left font-black">Plan</th>
                      <th className="border border-slate-200 p-3 text-left font-black">Requests/Day</th>
                      <th className="border border-slate-200 p-3 text-left font-black">Tokens</th>
                      <th className="border border-slate-200 p-3 text-left font-black">API Keys</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLANS.map((plan) => (
                      <tr key={plan.id} className={plan.id === currentPlan?.id ? "bg-slate-50" : ""}>
                        <td className="border border-slate-200 p-3 font-black">{plan.name}</td>
                        <td className="border border-slate-200 p-3">{plan.requests}</td>
                        <td className="border border-slate-200 p-3">{plan.tokens}</td>
                        <td className="border border-slate-200 p-3">{plan.keys}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Core Endpoints */}
          <section>
            <h2 className="text-4xl font-black mb-6">
              Core Endpoints
            </h2>

            {/* Whale Alerts */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-slate-900">Get Whale Alerts</h3>
                <span className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-black">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-200 px-2 py-1 rounded block mb-4">/whale/alerts</code>
              <p className="text-slate-500 mb-4">
                Get real-time whale alerts for large wallet transactions.
              </p>

              <h4 className="font-black text-slate-900 mb-2">Query Parameters:</h4>
              <ul className="list-disc pl-6 text-slate-500 mb-4 space-y-1">
                <li><code className="bg-slate-200 px-1 rounded">min_value</code> (optional): Minimum transaction value in USD (default: 100,000)</li>
                <li><code className="bg-slate-200 px-1 rounded">token</code> (optional): Filter by token symbol</li>
                <li><code className="bg-slate-200 px-1 rounded">limit</code> (optional): Number of results (default: 50, max: 100)</li>
              </ul>

              <h4 className="font-black text-slate-900 mb-2">Response (200 OK):</h4>
              <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{`{
  "alerts": [
    {
      "id": "evt_abc123",
      "wallet": "0x1234...",
      "token": "ETH",
      "value_usd": 1500000,
      "timestamp": "2026-05-24T12:00:00Z",
      "exchange": "binance"
    }
  ],
  "total": 1,
  "page": 1
}`}</pre>
              </div>
            </div>

            {/* Wallet Analytics */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-slate-900">Get Wallet Analytics</h3>
                <span className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-black">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-200 px-2 py-1 rounded block mb-4">/analytics/wallet/:address</code>
              <p className="text-slate-500 mb-4">
                Get comprehensive analytics for a specific wallet address.
              </p>

              <h4 className="font-black text-slate-900 mb-2">Response (200 OK):</h4>
              <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{`{
  "wallet": "0x1234...",
  "total_value_usd": 5432100,
  "transaction_count": 1234,
  "first_seen": "2024-01-15T10:30:00Z",
  "risk_score": "low",
  "top_tokens": [
    { "symbol": "ETH", "value_usd": 2340000 },
    { "symbol": "BTC", "value_usd": 1890000 }
  ]
}`}</pre>
              </div>
            </div>
          </section>

          {/* WebSocket */}
          <section>
            <h2 className="text-3xl font-black mb-6">WebSocket Streams</h2>

            <p className="text-slate-500 mb-4">
              Subscribe to real-time data feeds via WebSocket.
            </p>

            <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-sm mb-6">
              wss://api.humanidfi.com/v1/ws
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-4">Connection Example</h3>
              <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{`const ws = new WebSocket('wss://api.humanidfi.com/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'subscribe',
    channel: 'whale_alerts',
    api_key: 'YOUR_API_KEY'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Alert:', data);
};`}</pre>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4 mt-6">Available Channels</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-200 p-3 text-left font-black">Channel</th>
                      <th className="border border-slate-200 p-3 text-left font-black">Description</th>
                      <th className="border border-slate-200 p-3 text-left font-black">Plan Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-3"><code className="bg-slate-200 px-1 rounded">whale_alerts</code></td>
                      <td className="border border-slate-200 p-3">Real-time whale transaction alerts</td>
                      <td className="border border-slate-200 p-3">Standard+</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-200 p-3"><code className="bg-slate-200 px-1 rounded">market_flow</code></td>
                      <td className="border border-slate-200 p-3">Market flow and liquidity data</td>
                      <td className="border border-slate-200 p-3">Pro+</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 p-3"><code className="bg-slate-200 px-1 rounded">dark_pool</code></td>
                      <td className="border border-slate-200 p-3">Dark pool detection and analysis</td>
                      <td className="border border-slate-200 p-3">Elite</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Error Handling */}
          <section>
            <h2 className="text-3xl font-black mb-6">Error Handling</h2>

            <p className="text-slate-500 mb-4">
              All errors return a consistent JSON structure.
            </p>

            <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-xs mb-6 overflow-x-auto">
              <pre>{`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "details": "The provided API key is not valid or has been revoked"
  }
}`}</pre>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-4">HTTP Status Codes</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-200 p-3 text-left font-black">Status</th>
                      <th className="border border-slate-200 p-3 text-left font-black">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-3"><code>200</code></td>
                      <td className="border border-slate-200 p-3">Success</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-200 p-3"><code>400</code></td>
                      <td className="border border-slate-200 p-3">Bad Request (invalid parameters)</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 p-3"><code>401</code></td>
                      <td className="border border-slate-200 p-3">Unauthorized (invalid credentials)</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-200 p-3"><code>403</code></td>
                      <td className="border border-slate-200 p-3">Forbidden (insufficient plan)</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 p-3"><code>429</code></td>
                      <td className="border border-slate-200 p-3">Rate Limit Exceeded</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-200 p-3"><code>500</code></td>
                      <td className="border border-slate-200 p-3">Internal Server Error</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-4xl font-black mb-6">
              Developer Support
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
              <p className="text-slate-500 mb-4">
                Need help with the API?
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="font-black text-slate-900">Email:</span>
                  <a href="mailto:developers@humanidfi.com" className="text-slate-600 underline hover:text-slate-900">developers@humanidfi.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-black text-slate-900">Documentation:</span>
                  <Link href="/developers/api-docs" className="text-slate-600 underline hover:text-slate-900">Full API Reference</Link>
                </li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

