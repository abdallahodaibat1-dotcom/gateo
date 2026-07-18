'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, MapPin, Phone } from 'lucide-react';
import { businessSlug } from '@/lib/utils';

interface StoreHeroProps {
  business: {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    logo?: string | null;
    cover?: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
    websiteType: 'INTRO' | 'STORE';
    theme?: { primaryColor?: string | null; secondaryColor?: string | null } | null;
  };
}

export function StoreHero({ business }: StoreHeroProps) {
  const slug = businessSlug(business);
  const isStore = business.websiteType === 'STORE';

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0">
        {business.cover ? (
          <>
            <Image
              src={business.cover}
              alt={business.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${business.theme?.primaryColor || '#7c3aed'}, ${business.theme?.secondaryColor || '#ec4899'})`,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 container-tight text-center pt-32 pb-20">
        {business.logo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
              <Image
                src={business.logo}
                alt={business.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight"
        >
          {business.name}
        </motion.h1>

        {business.description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/85 text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {business.description}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          {(business.city || business.address) && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 text-white text-sm backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
              {[business.city, business.address].filter(Boolean).join(' - ')}
            </span>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 text-white text-sm backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {business.phone}
            </a>
          )}
        </motion.div>

        {isStore && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <Link
              href={`/business/${slug}/shop`}
              className="theme-button"
            >
              <ShoppingBag className="w-4 h-4" />
              تسوق الآن
            </Link>
            <Link
              href={`/business/${slug}/offers`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-bold text-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Tag className="w-4 h-4" />
              العروض
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
