'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import Skeleton from './ui/Skeleton';

interface StoryGroup {
  user: { id: string; name: string | null; avatar: string | null };
  stories: { id: string; mediaUrl: string; isViewed: boolean }[];
  hasUnviewed: boolean;
}

export default function StoriesBar() {
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((data) => {
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-4 px-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} circle className="flex-shrink-0 w-16 h-16" />
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto py-4 px-2 scrollbar-hide">
      {/* Add Story Button */}
      <Link
        href="/create-post?type=story"
        className="flex-shrink-0 flex flex-col items-center gap-1"
      >
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <span className="text-[11px] text-muted">قصتك</span>
      </Link>

      {stories.map((group) => (
        <Link
          key={group.user.id}
          href={`/stories?user=${group.user.id}`}
          className="flex-shrink-0 flex flex-col items-center gap-1"
        >
          <div
            className={`w-16 h-16 rounded-full p-[2px] ${
              group.hasUnviewed
                ? 'bg-primary'
                : 'bg-border'
            }`}
          >
            <img
              src={group.user.avatar || '/logo/favicon.svg'}
              alt={group.user.name || ''}
              className="w-full h-full rounded-full object-cover border-2 border-surface"
            />
          </div>
          <span className="text-[11px] text-foreground truncate max-w-[64px]">
            {group.user.name || 'مستخدم'}
          </span>
        </Link>
      ))}
    </div>
  );
}
