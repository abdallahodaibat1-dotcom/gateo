'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingChatButton() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Hide if not authenticated or on auth/conversation pages
  const hiddenPaths = ['/login', '/register', '/conversations', '/conversations/'];
  const isHidden =
    status !== 'authenticated' ||
    hiddenPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isHidden) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/conversations')}
        className="fixed bottom-6 left-6 z-[55] w-14 h-14 rounded-full
                   bg-primary text-white shadow-lg
                   hover:bg-primary-dark hover:shadow-xl
                   flex items-center justify-center
                   transition-colors duration-200
                   ring-4 ring-surface"
        aria-label="الرسائل"
        title="الرسائل"
      >
        <MessageCircle className="w-6 h-6 fill-white" />

        {/* Ping animation dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-white"></span>
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
