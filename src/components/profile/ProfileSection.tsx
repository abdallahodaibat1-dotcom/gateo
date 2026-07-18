'use client';

import { motion } from 'framer-motion';

interface ProfileSectionProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}

export function ProfileSection({ title, icon: Icon, children, delay = 0 }: ProfileSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="theme-card p-6"
    >
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}
