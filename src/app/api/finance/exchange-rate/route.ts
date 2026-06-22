import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { unauthorized, serverError } from '@/lib/api-utils';
import {
  getExchangeRate,
  fetchAndStoreExchangeRate,
  fetchAndStoreAllExchangeRates,
} from '@/lib/finance';

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

// POST /api/finance/exchange-rate - Force refresh exchange rate(s)
export async function POST(req: NextRequest) {
  const session = await auth();
  const authHeader = req.headers.get('authorization') || '';
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  if (!session?.user?.id && !isCron) return unauthorized();

  const { searchParams } = new URL(req.url);
  const refreshAll = searchParams.get('refresh') === 'all';

  try {
    if (refreshAll) {
      const rates = await fetchAndStoreAllExchangeRates();
      return NextResponse.json({
        success: true,
        updated: rates.length,
        rates,
      });
    }

    const base = searchParams.get('base') || 'USD';
    const target = searchParams.get('target') || 'SAR';
    const rate = await fetchAndStoreExchangeRate(base, target);
    return NextResponse.json(rate);
  } catch (error) {
    return serverError(error);
  }
}
