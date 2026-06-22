import { prisma } from '@/lib/db';

export const PLATFORM_CURRENCY = 'USD';

export interface Currency {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'ر.س', decimals: 2 },
  { code: 'EUR', name: 'Euro', nameAr: 'يورو', symbol: '€', decimals: 2 },
  { code: 'GBP', name: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', decimals: 2 },
  { code: 'JOD', name: 'Jordanian Dinar', nameAr: 'دينار أردني', symbol: 'د.أ', decimals: 3 },
  { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م', decimals: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'د.ك', decimals: 3 },
  { code: 'QAR', name: 'Qatari Riyal', nameAr: 'ريال قطري', symbol: 'ر.ق', decimals: 2 },
  { code: 'BHD', name: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'د.ب', decimals: 3 },
  { code: 'OMR', name: 'Omani Rial', nameAr: 'ريال عماني', symbol: 'ر.ع', decimals: 3 },
  { code: 'TRY', name: 'Turkish Lira', nameAr: 'ليرة تركية', symbol: '₺', decimals: 2 },
];

export function getCurrencyByCode(code?: string | null): Currency {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export interface ExchangeRateResult {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  fetchedAt: Date;
  source: string;
}

export async function getExchangeRate(
  base = PLATFORM_CURRENCY,
  target = 'SAR'
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
  base = PLATFORM_CURRENCY,
  target = 'SAR'
): Promise<ExchangeRateResult> {
  let rate = getFallbackRate(base, target);
  let source = 'fallback';

  try {
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

export async function fetchAndStoreAllExchangeRates(): Promise<ExchangeRateResult[]> {
  const results: ExchangeRateResult[] = [];
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${PLATFORM_CURRENCY}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Exchange API returned ${res.status}`);
    }

    const data = await res.json();
    const rates = data?.rates || {};
    const now = new Date();

    const targets = SUPPORTED_CURRENCIES.map((c) => c.code).filter(
      (code) => code !== PLATFORM_CURRENCY
    );

    for (const target of targets) {
      const rate = rates[target];
      if (typeof rate !== 'number') continue;

      const record = await prisma.exchangeRate.upsert({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: PLATFORM_CURRENCY,
            targetCurrency: target,
          },
        },
        update: {
          rate,
          source: 'exchangerate-api',
          fetchedAt: now,
          updatedAt: now,
        },
        create: {
          baseCurrency: PLATFORM_CURRENCY,
          targetCurrency: target,
          rate,
          source: 'exchangerate-api',
          fetchedAt: now,
        },
      });

      results.push({
        baseCurrency: record.baseCurrency,
        targetCurrency: record.targetCurrency,
        rate: Number(record.rate),
        fetchedAt: record.fetchedAt,
        source: record.source,
      });
    }
  } catch (error) {
    console.error('Failed to fetch all exchange rates:', error);
    throw error;
  }
  return results;
}

export async function getExchangeRateForPair(
  from: string,
  to: string
): Promise<number> {
  from = from || PLATFORM_CURRENCY;
  to = to || PLATFORM_CURRENCY;
  if (from === to) return 1;

  // Direct rate
  const direct = await prisma.exchangeRate.findUnique({
    where: {
      baseCurrency_targetCurrency: { baseCurrency: from, targetCurrency: to },
    },
  });
  if (direct) return Number(direct.rate);

  // Reverse rate
  const reverse = await prisma.exchangeRate.findUnique({
    where: {
      baseCurrency_targetCurrency: { baseCurrency: to, targetCurrency: from },
    },
  });
  if (reverse) return 1 / Number(reverse.rate);

  // Cross via USD
  if (from !== PLATFORM_CURRENCY && to !== PLATFORM_CURRENCY) {
    const [fromToUsd, usdToTo] = await Promise.all([
      prisma.exchangeRate.findUnique({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: from,
            targetCurrency: PLATFORM_CURRENCY,
          },
        },
      }),
      prisma.exchangeRate.findUnique({
        where: {
          baseCurrency_targetCurrency: {
            baseCurrency: PLATFORM_CURRENCY,
            targetCurrency: to,
          },
        },
      }),
    ]);

    if (fromToUsd && usdToTo) {
      return Number(fromToUsd.rate) * Number(usdToTo.rate);
    }
  }

  // Fallback
  return 1;
}

export async function convertAmount(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  from = from || PLATFORM_CURRENCY;
  to = to || PLATFORM_CURRENCY;
  if (from === to || !amount) return amount;
  const rate = await getExchangeRateForPair(from, to);
  const currency = getCurrencyByCode(to);
  const factor = Math.pow(10, currency.decimals);
  return Math.round(amount * rate * factor) / factor;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode = PLATFORM_CURRENCY
): string {
  const currency = getCurrencyByCode(currencyCode);
  const value = Number(amount || 0);
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });
  // Symbol after amount for Arabic currencies, before for others
  const rtlSymbols = ['ر.س', 'د.إ', 'د.أ', 'ج.م', 'د.ك', 'ر.ق', 'د.ب', 'ر.ع'];
  if (rtlSymbols.includes(currency.symbol)) {
    return `${formatted} ${currency.symbol}`;
  }
  return `${currency.symbol}${formatted}`;
}

function getFallbackRate(base: string, target: string): number {
  const map: Record<string, number> = {
    'USD-SAR': 3.75,
    'USD-EUR': 0.92,
    'USD-GBP': 0.79,
    'USD-AED': 3.67,
    'USD-JOD': 0.71,
    'USD-EGP': 30.9,
    'USD-KWD': 0.31,
    'USD-QAR': 3.64,
    'USD-BHD': 0.38,
    'USD-OMR': 0.38,
    'USD-TRY': 32.0,
  };
  if (base === target) return 1;
  return map[`${base}-${target}`] || 1;
}
