'use client';

import { Sparkles, Globe, MessageCircle, Video, Mail, Phone, MapPin, Building2, Users, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  platform: [
    { name: 'عن Gateo', href: '#' },
    { name: 'كيف يعمل', href: '#' },
    { name: 'الأسئلة الشائعة', href: '#' },
    { name: 'المدونة', href: '#' },
  ],
  sectors: [
    { name: 'الصحة والطب', href: '/businesses/health' },
    { name: 'القانون والاستشارات', href: '/businesses/legal' },
    { name: 'التقنية والهندسة', href: '/businesses/tech' },
    { name: 'التعليم والتدريب', href: '/businesses/education' },
  ],
  support: [
    { name: 'مركز المساعدة', href: '#' },
    { name: 'تواصل معنا', href: '#' },
    { name: 'الشروط والأحكام', href: '#' },
    { name: 'سياسة الخصوصية', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Gateo
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              منصة Gateo - بوابتك المتكاملة للأعمال والمحترفين. اكتشف الخدمات، تواصل مع الخبراء، وطوّر عملك في مكان واحد.
            </p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Video].map((Icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                  aria-label="social link"
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">المنصة</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">القطاعات</h4>
            <ul className="space-y-3">
              {footerLinks.sectors.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">الدعم</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-6 justify-center lg:justify-start">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Mail className="w-4 h-4 text-primary-light" />
            support@gateo.com
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Phone className="w-4 h-4 text-primary-light" />
            9200xxxxx
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-4 h-4 text-primary-light" />
            المملكة العربية السعودية
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
          © 2025 Gateo. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
