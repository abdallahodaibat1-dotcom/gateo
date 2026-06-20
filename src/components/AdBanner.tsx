'use client';

import { useEffect, useState } from 'react';
import { SHOW_ADS } from '@/lib/features';
import AdCard from './AdCard';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  video: string | null;
  link: string | null;
  buttonText: string | null;
  advertiserName: string | null;
  advertiserLogo: string | null;
}

export default function AdBanner() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!SHOW_ADS) return;
    fetch('/api/ads?placement=HERO&limit=1')
      .then((r) => r.ok ? r.json() : { ads: [] })
      .then((data) => setAd(data.ads?.[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!SHOW_ADS || loading || !ad) return null;

  return (
    <div className="mb-4">
      <AdCard ad={ad} variant="banner" />
    </div>
  );
}
