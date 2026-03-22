import { NextRequest, NextResponse } from 'next/server';
import { walletIntelligenceService } from '@/lib/wallet/WalletIntelligenceService';
import { validateSecureRequest } from '@/lib/security/premium-security';

/**
 * GET /api/wallet/intelligence/[address]
 * Returns full legendary wallet intelligence report.
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ address: string }> }
) {
  try {
    const params = await props.params;
    const address = params.address;

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Optional: Validate secure request for premium features
    // const validation = await validateSecureRequest(req, 'PREMIUM');
    // if (!validation.valid) {
    //   return NextResponse.json({ error: validation.error }, { status: 401 });
    // }

    const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true';
    const deep = req.nextUrl.searchParams.get('deep') === 'true';

    console.log(`[API-INTELLIGENCE] Fetching report for ${address} (forceRefresh: ${forceRefresh}, deep: ${deep})`);
    
    const intelligence = await walletIntelligenceService.getFullIntelligence(address, forceRefresh, deep);

    return NextResponse.json(intelligence);
  } catch (error: any) {
    console.error(`[API-INTELLIGENCE-ERROR]:`, error);
    return NextResponse.json({ 
      error: 'Failed to fetch wallet intelligence',

      details: error.message 
    }, { status: 500 });
  }
}
