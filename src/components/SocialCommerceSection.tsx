'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck,
  MapPin,
  MessageCircle,
  HeartHandshake,
  UsersRound,
  Star,
  ShoppingBag,
  BadgeCheck,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

const socialFeatures = [
  {
    icon: ShieldCheck,
    title: 'منصة موثوقة',
    description:
      'تصفح المنتجات والخدمات بثقة مع نظام تقييم شفاف، توثيق الهوية، وحماية كاملة لبياناتك.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: MapPin,
    title: 'وصول مباشر للمصدر',
    description:
      'اعرف مصدر كل منتج وخدمة: من أين جاء، من يقدمها، وأين يقع مركزه أو متجره الحقيقي.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: MessageCircle,
    title: 'تواصل مباشر',
    description:
      'تواصل مباشرة مع أصحاب الأعمال والمحترفين عبر الدردشة قبل الشراء أو الحجز.',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    icon: HeartHandshake,
    title: 'بناء الثقة والموثوقية',
    description:
      'كل نشاط تجاري ومحترف يمر بعملية توثيق؛ اقرأ التقييمات، شاهد الصور، واختر باطمئنان.',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    icon: UsersRound,
    title: 'مجتمعات متخصصة',
    description:
      'انضم لمجموعات مهنية وقطاعية متنوعة. شارك التجارب واستفد من الخبرات.',
    color: 'bg-slate-100 text-slate-700',
  },
  {
    icon: Star,
    title: 'توصيات وتقييمات حقيقية',
    description:
      'تابع المحترفين والمستخدمين الموثوقين، واكتشف التوصيات المجربة قبل اتخاذ قرارك.',
    color: 'bg-amber-100 text-amber-700',
  },
];

const highlights = [
  { icon: BadgeCheck, label: 'حسابات موثقة', value: '100%' },
  { icon: ShoppingBag, label: 'منتجات وخدمات', value: '+2,500' },
  { icon: Building2, label: 'أنشطة تجارية', value: '+2,500' },
];

export default function SocialCommerceSection() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-semibold mb-4">
            <UsersRound className="w-4 h-4" />
            أكثر من منصة أعمال
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            مجتمع <span className="text-primary-light">موثوق</span> للمحترفين
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            اجمع بين البحث عن الخدمات، الحجز، التواصل الاجتماعي، والتسوق في مكان واحد. تواصل مع المصادر، اكتشف المنتجات،
            وانضم لمجتمعات تهتم بما يهمك — كل ذلك بأمان وشفافية.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16"
        >
          {highlights.map((item) => (
            <div
              key={item.label}
              className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-5 text-center hover:bg-white/15 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-primary-light" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
              <div className="text-sm text-white/60">{item.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {socialFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className="h-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/15 hover:border-white/20 transition-all duration-300">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/business/apply/start"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary-light transition-colors"
          >
            انضم إلى مجتمعنا الموثوق
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <p className="text-white/50 text-sm mt-4">
            سجّل عملك مجاناً ووصل بآلاف العملاء المهتمين بخدماتك.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
