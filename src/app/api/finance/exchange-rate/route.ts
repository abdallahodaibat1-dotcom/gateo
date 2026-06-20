import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { unauthorized, serverError } from '@/lib/api-utils';
import { getExchangeRate, fetchAndStoreExchangeRate } from '@/lib/finance';

// GET /api/finance/exchange-rate - Current exchange rate (cached)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { searchParams } = new URL(req.url);
  const base = searchParams.get('base') || 'USD';
  const target = searchParams.get('target') || 'SAR';

  try {
    const rate = await getExchangeRate(base, target);
    return NextResponse.json(rate);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/finance/exchange-rate - Force refresh exchange rate
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { searchParams } = new URL(req.url);
  const base = searchParams.get('base') || 'USD';
  const target = searchParams.get('target') || 'SAR';

  try {
    const rate = await fetchAndStoreExchangeRate(base, target);
    return NextResponse.json(rate);
  } catch (error) {
    return serverError(error);
  }
}
