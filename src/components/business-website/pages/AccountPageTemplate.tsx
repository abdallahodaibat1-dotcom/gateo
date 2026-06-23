'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { TemplateBusiness } from './page-template-types';

interface AccountPageTemplateProps {
  business: TemplateBusiness;
  page: { id: string; slug: string; title: string; content: string | null };
}

export function AccountPageTemplate({ business, page }: AccountPageTemplateProps) {
  const { data: session } = useSession();
  const { totalCount: cartCount } = useCart();
  const { totalCount: wishlistCount } = useWishlist();

  const userName = session?.user?.name || 'زائر';
  const userEmail = session?.user?.email;

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
          {page.content && <p className="text-muted max-w-2xl mx-auto">{page.content}</p>}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 bg-[var(--theme-surface)] rounded-2xl border border-border p-6 shadow-sm text-center"
            style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">{userName}</h2>
            {userEmail && <p className="text-sm text-muted">{userEmail}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2 bg-[var(--theme-surface)] rounded-2xl border border-border p-6 shadow-sm"
            style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
          >
            <h2 className="text-lg font-bold text-foreground mb-4">نظرة عامة</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[var(--theme-background)] border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingBag className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  <span className="text-sm text-muted">منتجات في السلة</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{cartCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--theme-background)] border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5" style={{ color: 'var(--theme-secondary)' }} />
                  <span className="text-sm text-muted">المفضلة</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{wishlistCount}</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-foreground mb-4">معلومات النشاط</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-background)] border border-border">
                <User className="w-5 h-5 text-muted" />
                <span className="text-sm text-foreground">{business.name}</span>
              </div>
              {business.phone && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-background)] border border-border">
                  <Phone className="w-5 h-5 text-muted" />
                  <span className="text-sm text-foreground">{business.phone}</span>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-background)] border border-border">
                  <Mail className="w-5 h-5 text-muted" />
                  <span className="text-sm text-foreground">{business.email}</span>
                </div>
              )}
              {(business.city || business.address) && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-background)] border border-border">
                  <MapPin className="w-5 h-5 text-muted" />
                  <span className="text-sm text-foreground">{[business.city, business.address].filter(Boolean).join(' - ')}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
