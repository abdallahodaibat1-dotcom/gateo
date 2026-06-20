'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface ProfessionalProfile {
  id: string;
  status: string;
  isVerified: boolean;
  isPublicOnGateway: boolean;
}

export default function ProfessionalProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/professionals/apply');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!profile) return;

    if (profile.status !== 'ACTIVE') {
      setMessage({
        type: 'error',
        text: 'لا يمكن نشر الملف المهني قبل اعتماده من الإدارة.',
      });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/professionals/confirm-public', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, isPublicOnGateway: true } : prev));
        setMessage({ type: 'success', text: 'تم نشر الملف المهني بنجاح.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في تحديث حالة الظهور.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحديث الحالة.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl bg-surface rounded-lg border border-border shadow-sm p-5 sm:p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="w-40 h-6 rounded-md" />
          <Skeleton className="w-64 h-4 rounded-md" />
        </div>
        <Skeleton className="w-full h-16 rounded-lg" />
        <Skeleton className="w-full h-16 rounded-lg" />
      </div>
    );
  }

  if (!profile) return null;

  const statusLabels: Record<string, string> = {
    PENDING: 'قيد المراجعة',
    ACTIVE: 'نشط',
    REJECTED: 'مرفوض',
    SUSPENDED: 'موقوف',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="bg-surface rounded-lg shadow-sm border border-border p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground mb-1">إعدادات الظهور</h2>
        <p className="text-sm text-muted mb-6">تحكم في ظهور ملفك المهني في دليل المحترفين العام.</p>

        {message && (
          <div
            className={`rounded-lg p-4 flex items-center gap-3 text-sm mb-6 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : 'bg-red-50 border border-red-100 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-muted border border-border">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">حالة الملف</p>
                <p className="text-xs text-muted">{statusLabels[profile.status]}</p>
              </div>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                profile.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : profile.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {profile.status}
            </span>
          </div>

          {/* Public listing */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-muted border border-border">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">الظهور في الدليل العام</p>
                <p className="text-xs text-muted">
                  {profile.isPublicOnGateway
                    ? 'ملفك ظاهر للعملاء والزوار'
                    : 'ملفك غير ظاهر حالياً'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={saving || profile.status !== 'ACTIVE' || profile.isPublicOnGateway}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                profile.isPublicOnGateway
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
              type="button"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : profile.isPublicOnGateway ? (
                <>
                  <Eye className="w-4 h-4" />
                  منشور
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  نشر الملف
                </>
              )}
            </button>
          </div>

          {profile.status !== 'ACTIVE' && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-medium">الملف قيد المراجعة</p>
                  <p className="text-amber-700/80 mt-0.5">
                    لا يمكن نشر الملف أو إخفاؤه قبل اعتماده من الإدارة.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
