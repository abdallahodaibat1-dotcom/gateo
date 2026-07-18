'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark" />
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            جاهز لتطوير <span className="text-accent">عملك</span>؟
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            انضم لأكثر من 50,000 مستخدم ونشاط تجاري يكتشفون الفرص مع Gateo. سجّل الآن ووصل بعملائك المحتملين.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/business/apply/start"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-surface text-primary font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                سجّل نشاطك التجاري
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all"
            >
              <Download className="w-5 h-5" />
              تحميل التطبيق
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
