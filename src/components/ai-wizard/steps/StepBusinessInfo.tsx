'use client';

import { useState, useRef } from 'react';
import { Building2, MapPin, Upload, Check, ImageIcon } from 'lucide-react';
import CountrySelect from '@/components/CountrySelect';
import { compressImage } from '@/lib/media-compression';

interface StepBusinessInfoProps {
  businessName: string;
  logo?: string;
  countryId: string;
  city: string;
  countries: { id: string; name: string; flagEmoji: string; phoneCode: string }[];
  countriesLoading: boolean;
  onChange: (updates: {
    businessName?: string;
    logo?: string;
    countryId?: string;
    city?: string;
  }) => void;
}

export function StepBusinessInfo({
  businessName,
  logo,
  countryId,
  city,
  countries,
  countriesLoading,
  onChange,
}: StepBusinessInfoProps) {
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
        onChange({ logo: data.url });
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">معلومات النشاط</h2>
        <p className="text-gray-600">أخبرنا قليلاً عن نشاطك التجاري لنبدأ.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Building2 className="inline w-4 h-4 ml-1" />
          اسم الشركة أو النشاط *
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => onChange({ businessName: e.target.value })}
          placeholder="مثال: عيادة الابتسامة"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <ImageIcon className="inline w-4 h-4 ml-1" />
          الشعار (اختياري)
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
          ) : logo ? (
            <>
              <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-sm text-gray-700">تم رفع الشعار</span>
              <Check className="w-4 h-4 text-green-600" />
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">اضغط لرفع ملف الشعار</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-1.5">يمكنك رفع صورة بصيغة JPG أو PNG أو WebP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CountrySelect
          countries={countries}
          value={countryId}
          onChange={(id) => onChange({ countryId: id })}
          label="الدولة *"
          required
          loading={countriesLoading}
          placeholder="اختر الدولة"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <MapPin className="inline w-4 h-4 ml-1" />
            المدينة *
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="مثال: الرياض"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
        </div>
      </div>
    </div>
  );
}
