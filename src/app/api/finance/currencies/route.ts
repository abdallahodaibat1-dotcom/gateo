import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { unauthorized, serverError } from '@/lib/api-utils';
import {
  SUPPORTED_CURRENCIES,
  fetchAndStoreAllExchangeRates,
  PLATFORM_CURRENCY,
} from '@/lib/finance/exchange';

// GET /api/finance/currencies - List supported currencies
export async function GET() {
  try {
    return NextResponse.json({
      platformCurrency: PLATFORM_CURRENCY,
      currencies: SUPPORTED_CURRENCIES,
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/finance/currencies - Refresh all exchange rates (admin, authenticated, or cron)
export async function POST(req: NextRequest) {
  const session = await auth();
  const authHeader = req.headers.get('authorization') || '';
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  if (!session?.user?.id && !isCron) return unauthorized();

  try {
    const rates = await fetchAndStoreAllExchangeRates();
    return NextResponse.json({
      success: true,
      updated: rates.length,
      rates,
    });
  } catch (error) {
    return serverError(error);
  }
}
