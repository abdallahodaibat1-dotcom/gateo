'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { PageTemplateProps } from './page-template-types';
import { formatWorkingHours } from '@/components/business-website/template-types';

export function ContactPageTemplate({ business, page }: PageTemplateProps) {
  const sections = page.sections || {};
  const contactEmail = sections.email || business.email;
  const contactPhone = sections.phone || business.phone;
  const contactAddress = sections.address || business.address || business.city;
  const contactWhatsapp = sections.whatsapp;
  const mapUrl = sections.mapUrl;
  const content = page.content || `تواصل مع ${business.name} وسنكون سعداء بمساعدتك.`;
  const workingHoursText = formatWorkingHours(business.workingHours);

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
          <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--theme-primary)' }} />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm p-8"
            style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
          >
            <div className="prose max-w-none text-foreground whitespace-pre-wrap leading-relaxed mb-8">
              {content}
            </div>

            <div className="space-y-4">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-background)] border border-border hover:border-primary/30 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">الهاتف</p>
                    <p className="font-bold text-foreground">{contactPhone}</p>
                  </div>
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-background)] border border-border hover:border-primary/30 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: 'var(--theme-secondary)' }}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">البريد الإلكتروني</p>
                    <p className="font-bold text-foreground">{contactEmail}</p>
                  </div>
                </a>
              )}
              {contactAddress && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-background)] border border-border">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: 'var(--theme-accent)' }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">العنوان</p>
                    <p className="font-bold text-foreground">{contactAddress}</p>
                  </div>
                </div>
              )}
              {workingHoursText && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-background)] border border-border">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">أوقات العمل</p>
                    <p className="font-bold text-foreground">{workingHoursText}</p>
                  </div>
                </div>
              )}
              {contactWhatsapp && (
                <a
                  href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--theme-background)] border border-border hover:border-primary/30 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: '#25d366' }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">واتساب</p>
                    <p className="font-bold text-foreground">{contactWhatsapp}</p>
                  </div>
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm overflow-hidden"
            style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
          >
            {mapUrl ? (
              <iframe
                src={mapUrl}
                title="خريطة الموقع"
                className="w-full h-full min-h-[400px] border-0"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted p-8">
                <MapPin className="w-16 h-16 mb-4 opacity-30" />
                <p>لم يتم إضافة خريطة بعد</p>
                <p className="text-sm mt-2">يمكنك إضافة رابط خريطة Google Maps من لوحة التحكم</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
