import { prisma } from '@/lib/db';

const DEFAULT_BASE = 'USD';
const DEFAULT_TARGET = 'SAR';

export interface ExchangeRateResult {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  fetchedAt: Date;
  source: string;
}

export async function getExchangeRate(
  base = DEFAULT_BASE,
  target = DEFAULT_TARGET
): Promise<ExchangeRateResult> {
  const cached = await prisma.exchangeRate.findUnique({
    where: { baseCurrency_targetCurrency: { baseCurrency: base, targetCurrency: target } },
  });

  if (cached) {
    return {
      baseCurrency: cached.baseCurrency,
      targetCurrency: cached.targetCurrency,
      rate: Number(cached.rate),
      fetchedAt: cached.fetchedAt,
      source: cached.source,
    };
  }

  return fetchAndStoreExchangeRate(base, target);
}

export async function fetchAndStoreExchangeRate(
  base = DEFAULT_BASE,
  target = DEFAULT_TARGET
): Promise<ExchangeRateResult> {
  let rate = 3.75; // fallback rate for USD/SAR
  let source = 'fallback';

  try {
    // Try a free public API first (no API key required)
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.[target]) {
        rate = Number(data.rates[target]);
        source = 'exchangerate-api';
      }
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rate from API, using fallback', error);
  }

  const now = new Date();

  const record = await prisma.exchangeRate.upsert({
    where: { baseCurrency_targetCurrency: { baseCurrency: base, targetCurrency: target } },
    update: { rate, source, fetchedAt: now, updatedAt: now },
    create: {
      baseCurrency: base,
      targetCurrency: target,
      rate,
      source,
      fetchedAt: now,
    },
  });

  return {
    baseCurrency: record.baseCurrency,
    targetCurrency: record.targetCurrency,
    rate: Number(record.rate),
    fetchedAt: record.fetchedAt,
    source: record.source,
  };
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rate: number
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'SAR') return +(amount * rate).toFixed(2);
  if (from === 'SAR' && to === 'USD') return +(amount / rate).toFixed(2);
  return amount;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = 'USD'
): string {
  const value = Number(amount || 0);
  const symbol = currency === 'USD' ? '$' : currency === 'SAR' ? 'ر.س' : currency;
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}
