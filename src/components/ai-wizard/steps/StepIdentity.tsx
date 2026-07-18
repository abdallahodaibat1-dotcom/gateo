'use client';

import { useState, useRef } from 'react';
import { Palette, Upload, Check, ImageIcon, Type } from 'lucide-react';
import { compressImage } from '@/lib/media-compression';
import { VisualIdentity } from '@/lib/ai-wizard/types';

interface StepIdentityProps {
  hasIdentity: boolean;
  identity?: VisualIdentity;
  onHasIdentityChange: (hasIdentity: boolean) => void;
  onIdentityChange: (identity: Partial<VisualIdentity>) => void;
}

const FONT_OPTIONS = [
  { value: 'Cairo', label: 'Cairo' },
  { value: 'Tajawal', label: 'Tajawal' },
  { value: 'Playfair_Display', label: 'Playfair Display' },
  { value: 'Cormorant_Garamond', label: 'Cormorant Garamond' },
];

export function StepIdentity({
  hasIdentity,
  identity,
  onHasIdentityChange,
  onIdentityChange,
}: StepIdentityProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.88,
        maxSizeBytes: 2 * 1024 * 1024,
      });
      const formData = new FormData();
      formData.append('file', compressed);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onIdentityChange({ logo: data.url });
      }
    } catch (e) {
      console.error('Logo upload failed', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">الهوية البصرية</h2>
        <p className="text-gray-600">هل لديك هوية بصرية جاهزة؟</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onHasIdentityChange(true)}
          className={`p-4 rounded-xl border text-right transition-all ${
            hasIdentity
              ? 'border-violet-500 bg-violet-50 text-violet-900 ring-1 ring-violet-500'
              : 'border-gray-200 hover:border-violet-300'
          }`}
        >
          <div className="font-medium">نعم، لدي هوية</div>
        </button>
        <button
          type="button"
          onClick={() => onHasIdentityChange(false)}
          className={`p-4 rounded-xl border text-right transition-all ${
            !hasIdentity
              ? 'border-violet-500 bg-violet-50 text-violet-900 ring-1 ring-violet-500'
              : 'border-gray-200 hover:border-violet-300'
          }`}
        >
          <div className="font-medium">لا، اقترح علي</div>
        </button>
      </div>

      {hasIdentity ? (
        <div className="space-y-5 border-t border-gray-200 pt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="inline w-4 h-4 ml-1" />
              الشعار
            </label>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition disabled:opacity-50"
            >
              {uploading ? (
                <span className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
              ) : identity?.logo ? (
                <>
                  <img src={identity.logo} alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="text-sm text-gray-700">تم رفع الشعار</span>
                  <Check className="w-4 h-4 text-green-600" />
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">اضغط لرفع الشعار</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'primaryColor', label: 'اللون الأساسي' },
              { key: 'secondaryColor', label: 'اللون الثانوي' },
              { key: 'accentColor', label: 'لون التمييز' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Palette className="inline w-4 h-4 ml-1" />
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(identity as Record<string, string>)?.[key] || '#7c3aed'}
                    onChange={(e) => onIdentityChange({ [key]: e.target.value } as Partial<VisualIdentity>)}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(identity as Record<string, string>)?.[key] || ''}
                    onChange={(e) => onIdentityChange({ [key]: e.target.value } as Partial<VisualIdentity>)}
                    placeholder="#7c3aed"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Type className="inline w-4 h-4 ml-1" />
              الخط
            </label>
            <select
              value={identity?.fontFamily || 'Cairo'}
              onChange={(e) => onIdentityChange({ fontFamily: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 pt-5">
          <div className="bg-violet-50 rounded-xl p-4 text-violet-800 text-sm leading-relaxed">
            <Palette className="inline w-4 h-4 ml-1" />
            سيقوم الذكاء الاصطناعي باقتراح لوحة ألوان وخطوط وأسلوب أيقونات وأزرار مناسبة لنشاطك بعد التحليل.
          </div>
        </div>
      )}
    </div>
  );
}
