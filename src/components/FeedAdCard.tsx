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

export default function FeedAdCard() {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (!SHOW_ADS) return;
    fetch('/api/ads?placement=FEED&limit=1')
      .then((r) => r.ok ? r.json() : { ads: [] })
      .then((data) => setAd(data.ads?.[0] || null))
      .catch(() => {});
  }, []);

  if (!SHOW_ADS || !ad) return null;

  return <AdCard ad={ad} variant="feed" />;
}
