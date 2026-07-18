'use client';

import { MessageCircle, Phone, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ContactActionsProps {
  onSendMessage: () => void;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  isOwnProfile: boolean;
}

export function ContactActions({
  onSendMessage,
  phone,
  whatsapp,
  email,
  isOwnProfile,
}: ContactActionsProps) {
  if (isOwnProfile) return null;

  const contactPhone = (whatsapp || phone || '').replace(/[^0-9+]/g, '');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Button onClick={onSendMessage} className="w-full" leftIcon={<MessageCircle className="w-4 h-4" />}>
        رسالة
      </Button>
      {contactPhone && (
        <>
          <Button
            variant="outline"
            className="w-full"
            leftIcon={<Phone className="w-4 h-4" />}
            asChild
          >
            <a href={`tel:${contactPhone}`}>اتصال</a>
          </Button>
          <Button
            variant="success"
            className="w-full"
            leftIcon={<MessageCircle className="w-4 h-4" />}
            asChild
          >
            <a href={`https://wa.me/${contactPhone}`} target="_blank" rel="noopener noreferrer">
              واتساب
            </a>
          </Button>
        </>
      )}
      {!contactPhone && email && (
        <Button
          variant="success"
          className="w-full sm:col-span-2"
          leftIcon={<Mail className="w-4 h-4" />}
          asChild
        >
          <a href={`mailto:${email}`}>بريد</a>
        </Button>
      )}
    </div>
  );
}
