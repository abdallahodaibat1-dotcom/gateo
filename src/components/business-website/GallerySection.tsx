'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Images } from 'lucide-react';

interface GallerySectionProps {
  images: string[];
}

export function GallerySection({ images }: GallerySectionProps) {
  if (!images || images.length === 0) return null;

  return (
    <section className="container-narrow section-padding" dir="rtl">
      <div className="text-center mb-10">
        <p className="section-subtitle">لحظات مميزة</p>
        <h2 className="section-title mb-3 flex items-center justify-center gap-2">
          <Images className="w-6 h-6 text-[var(--theme-primary,var(--color-primary))]" />
          معرض الصور
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, idx) => (
          <motion.div
            key={`${url}-${idx}`}
            whileHover={{ scale: 1.02 }}
            className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm bg-slate-100 relative group"
          >
            <Image
              src={url}
              alt={`صورة ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
