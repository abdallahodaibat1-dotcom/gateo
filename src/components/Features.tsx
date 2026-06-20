'use client';

import { motion } from 'framer-motion';
import { Calendar, MessageCircle, Shield, Zap, Globe, Award } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'حجز مواعيد',
    description: 'احجز موعدك بكل سهولة في أي وقت ومن أي مكان مع تأكيد فوري وإشعارات تذكير.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: MessageCircle,
    title: 'تواصل مباشر',
    description: 'تواصل مباشرة مع الشركات والمحترفين عبر الدردشة المباشرة الآمنة.',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    icon: Shield,
    title: 'خدمة موثوقة',
    description: 'نضمن لك تجربة موثوقة مع نظام تقييم شفاف ومراجعات حقيقية من مستخدمين.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Zap,
    title: 'عروض حصرية',
    description: 'احصل على عروض وخصومات حصرية متاحة فقط لمستخدمي Gateo.',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: Globe,
    title: 'مجتمعات مهنية',
    description: 'انضم لمجتمعات متخصصة في الصحة، القانون، التقنية، التعليم، والمزيد.',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    icon: Award,
    title: 'محترفون معتمدون',
    description: 'تابع أبرز المحترفين والشركات المعتمدة واكتشف خدماتهم وخبراتهم.',
    color: 'bg-slate-100 text-slate-700',
  },
];

export default function Features() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            لماذا Gateo؟
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            كل ما <span className="text-primary">تحتاجه</span> في مكان واحد
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            نقدم لك تجربة احترافية تجمع بين البحث عن الخدمات، الحجز، التواصل، والتسوق في منصة واحدة متكاملة.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className="h-full bg-surface rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
