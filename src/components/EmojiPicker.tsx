'use client';

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="إضافة إيموجي"
        className="p-2 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-colors"
      >
        <Smile className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <Picker
            onEmojiClick={(emojiData) => {
              onEmojiSelect(emojiData.emoji);
              setOpen(false);
            }}
            lazyLoadEmojis
            searchPlaceholder="ابحث عن إيموجي..."
          />
        </div>
      )}
    </div>
  );
}
