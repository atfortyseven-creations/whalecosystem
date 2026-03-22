import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, logApiRequest } from '@/lib/api-guard';
import { WacIntelligenceService } from '@/lib/intelligence-service';
import { intelligenceService } from '@/lib/blockchain/IntelligenceService';

export const dynamic = 'force-dynamic';

/**
 * @api {get} /api/v1/whale/intelligence Get advanced whale analytics
 * @apiParam {String} type One of: heikin-ashi, dark-pool, anomaly, profile
 * @apiParam {String} [token] Required for heikin-ashi
 * @apiParam {String} [address] Required for profile
 */
export async function GET(req: NextRequest) {
  const endpoint = '/api/v1/whale/intelligence';
  
  // 1. Validate API Key
  const auth = await validateApiKey(req);
  if (!auth.valid || !auth.subscription) {
    return NextResponse.json({ error: auth.error }, { status: auth.statusCode || 401 });
  }

  const { subscription } = auth;
  const tier = subscription.tier.toLowerCase();
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');

  try {
    // 2. Gate features by Tier
    if (type === 'heikin-ashi') {
      if (tier === 'starter') {
        return NextResponse.json({ error: 'Heikin-Ashi signals require a Pro or Elite subscription.' }, { status: 403 });
      }
      const token = searchParams.get('token');
      if (!token) return NextResponse.json({ error: 'token parameter is required for Heikin-Ashi' }, { status: 400 });
      
      const signals = await WacIntelligenceService.getHeikinAshiSignals(token);
      await logApiRequest(req, subscription.id, endpoint, 200);
      return NextResponse.json({ success: true, type: 'heikin-ashi', token, data: signals });
    }

    if (type === 'dark-pool') {
      if (tier === 'starter') {
        return NextResponse.json({ error: 'Dark Pool detection requires a Pro or Elite subscription.' }, { status: 403 });
      }
      const events = await WacIntelligenceService.getDarkPoolEvents();
      await logApiRequest(req, subscription.id, endpoint, 200);
      return NextResponse.json({ success: true, type: 'dark-pool', data: events });
    }

    if (type === 'anomaly') {
      if (tier !== 'Elite') {
        return NextResponse.json({ error: 'Advanced Anomaly detection requires an Elite subscription.' }, { status: 403 });
      }
      const token = searchParams.get('token') || undefined;
      const alerts = await WacIntelligenceService.getAnomalyAlerts(token);
      const flashLoans = await WacIntelligenceService.detectFlashLoan(token || 'ETH');
      const washTraders = token ? await WacIntelligenceService.detectWashTrading(token) : [];
      
      await logApiRequest(req, subscription.id, endpoint, 200);
      return NextResponse.json({ 
        success: true, 
        type: 'anomaly', 
        data: { 
          alerts, 
          flashLoans, 
          washTraders,
          timestamp: new Date().toISOString() 
        } 
      });
    }

    if (type === 'profile') {
      if (tier === 'starter') {
        return NextResponse.json({ error: 'Deep On-Chain Forensics require a Pro or Elite subscription.' }, { status: 403 });
      }
      const address = searchParams.get('address');
      if (!address) return NextResponse.json({ error: 'address parameter is required for profiles' }, { status: 400 });
      
      const report = await intelligenceService.getIntelligenceReport(address);
      const riskScore = await WacIntelligenceService.calculateRiskScore(address);
      
      await logApiRequest(req, subscription.id, endpoint, 200);
      return NextResponse.json({ 
        success: true, 
        type: 'profile', 
        address, 
        data: { 
          ...report, 
          astronomicalRisk: riskScore,
          isHighRisk: riskScore > 75 
        } 
      });
    }

    return NextResponse.json({ error: 'Invalid or missing type parameter. Use: heikin-ashi, dark-pool, anomaly, or profile.' }, { status: 400 });

  } catch (error: any) {
    console.error('[WAC Intelligence API] Error:', error);
    await logApiRequest(req, subscription.id, endpoint, 500);
    return NextResponse.json({ error: 'Internal server error processing intelligence request.' }, { status: 500 });
  }
}

