import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { formatCurrency, convertAmount, PLATFORM_CURRENCY } from '@/lib/finance/exchange';

export function useCurrency() {
  const { data: session } = useSession();
  const preferredCurrency = session?.user?.preferredCurrency || PLATFORM_CURRENCY;

  const [rate, setRate] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preferredCurrency === PLATFORM_CURRENCY) {
      setRate(1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`/api/finance/exchange-rate?base=${PLATFORM_CURRENCY}&target=${preferredCurrency}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setRate(Number(data?.rate) || 1);
      })
      .catch(() => {
        if (!cancelled) setRate(1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [preferredCurrency]);

  const convert = useCallback(
    (amount: number | string | null | undefined) => {
      const value = Number(amount || 0);
      if (preferredCurrency === PLATFORM_CURRENCY || !rate) return value;
      const currency = { USD: 2, SAR: 2, EUR: 2, GBP: 2, AED: 2, JOD: 3, EGP: 2, KWD: 3, QAR: 2, BHD: 3, OMR: 3, TRY: 2 }[preferredCurrency] || 2;
      const factor = Math.pow(10, currency);
      return Math.round(value * rate * factor) / factor;
    },
    [preferredCurrency, rate]
  );

  const format = useCallback(
    (amount: number | string | null | undefined) => {
      return formatCurrency(amount, preferredCurrency);
    },
    [preferredCurrency]
  );

  return {
    currency: preferredCurrency,
    rate,
    loading,
    convert,
    format,
  };
}
