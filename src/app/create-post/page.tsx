'use client';

import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { compressImage, compressVideo } from '@/lib/media-compression';
import { Loader2, ImagePlus, MapPin, X, Video, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

interface UploadFile {
  url: string;
  type: 'image' | 'video';
  file?: File;
  uploading?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

type PostType = 'POST' | 'REEL';

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const reelInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [postType, setPostType] = useState<PostType>('POST');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleFileSelect = async (selectedFiles: FileList | null, type: 'image' | 'video') => {
    if (!selectedFiles) return;
    const fileArray = Array.from(selectedFiles);

    const imageCount = files.filter((f) => f.type === 'image').length;
    const videoCount = files.filter((f) => f.type === 'video').length;

    if (postType === 'REEL') {
      if (type !== 'video') {
        showToast('الريلز يدعم الفيديو فقط', 'error');
        return;
      }
      if (videoCount + fileArray.length > 1) {
        showToast('يمكنك رفع فيديو واحد فقط للريل', 'error');
        return;
      }
    } else {
      if (type === 'image' && imageCount + fileArray.length > 10) {
        showToast('يمكنك رفع 10 صور كحد أقصى', 'error');
        return;
      }
      if (type === 'video' && videoCount + fileArray.length > 1) {
        showToast('يمكنك رفع فيديو واحد فقط', 'error');
        return;
      }
      if (type === 'video' && files.some((f) => f.type === 'image')) {
        showToast('لا يمكن خلط الصور والفيديو في نفس المنشور', 'error');
        return;
      }
      if (type === 'image' && files.some((f) => f.type === 'video')) {
        showToast('لا يمكن خلط الصور والفيديو في نفس المنشور', 'error');
        return;
      }
    }

    for (const file of fileArray) {
      const tempUrl = URL.createObjectURL(file);
      const uploadFile: UploadFile = {
        url: tempUrl,
        type,
        file,
        uploading: true,
      };
      setFiles((prev) => [...prev, uploadFile]);

      try {
        let processedFile: File = file;
        if (type === 'image' && file.type.startsWith('image/')) {
          processedFile = await compressImage(file, {
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.88,
            maxSizeBytes: 4 * 1024 * 1024,
          });
        } else if (type === 'video' && file.type.startsWith('video/')) {
          processedFile = await compressVideo(file, {
            isReel: postType === 'REEL',
            maxWidth: postType === 'REEL' ? 720 : 1280,
            maxHeight: postType === 'REEL' ? 1280 : 720,
            maxRate: postType === 'REEL' ? '4M' : '2M',
          });
        }

        const formData = new FormData();
        formData.append('file', processedFile);
        formData.append('variant', postType === 'REEL' ? 'reel' : 'post');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setFiles((prev) =>
            prev.map((f) =>
              f.url === tempUrl
                ? {
                    url: data.url,
                    type,
                    uploading: false,
                    width: data.width,
                    height: data.height,
                    duration: data.duration,
                    thumbnailUrl: data.thumbnailUrl,
                  }
                : f
            )
          );
          URL.revokeObjectURL(tempUrl);
        } else {
          showToast(data.error || 'فشل في رفع الملف', 'error');
          setFiles((prev) => prev.filter((f) => f.url !== tempUrl));
          URL.revokeObjectURL(tempUrl);
        }
      } catch {
        showToast('فشل في رفع الملف', 'error');
        setFiles((prev) => prev.filter((f) => f.url !== tempUrl));
        URL.revokeObjectURL(tempUrl);
      }
    }
  };

  const handleRemoveFile = (url: string) => {
    setFiles((prev) => prev.filter((f) => f.url !== url));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const droppedFiles = e.dataTransfer.files;
      const images = Array.from(droppedFiles).filter((f) => f.type.startsWith('image/'));
      const videos = Array.from(droppedFiles).filter((f) => f.type.startsWith('video/'));

      if (postType === 'REEL') {
        if (images.length > 0) {
          showToast('الريلز يدعم الفيديو فقط', 'error');
          return;
        }
        if (videos.length > 0) {
          handleFileSelect(videos.slice(0, 1) as unknown as FileList, 'video');
        }
        return;
      }

      if (images.length > 0 && videos.length > 0) {
        showToast('لا يمكن خلط الصور والفيديو في نفس المنشور', 'error');
        return;
      }
      if (images.length > 0) {
        handleFileSelect(
          images.slice(0, 10) as unknown as FileList,
          'image'
        );
      }
      if (videos.length > 0) {
        handleFileSelect(videos.slice(0, 1) as unknown as FileList, 'video');
      }
    },
    [files, postType]
  );

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    if (files.some((f) => f.uploading)) {
      showToast('يرجى الانتظار حتى اكتمال رفع الملفات', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const images = files.filter((f) => f.type === 'image').map((f) => f.url);
      const video = files.find((f) => f.type === 'video')?.url;

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim() || undefined,
          images: images.length > 0 ? images : undefined,
          video: video || undefined,
          location: location || undefined,
          postType,
          isPublic,
        }),
      });

      if (res.ok) {
        router.push(postType === 'REEL' ? '/reels' : '/feed');
      } else {
        const data = await res.json();
        showToast(data.error || 'فشل في إنشاء المنشور', 'error');
      }
    } catch (e) {
      showToast('فشل في إنشاء المنشور', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openLocationModal = () => {
    setLocationInput(location);
    setShowLocationModal(true);
  };

  const confirmLocation = () => {
    const trimmed = locationInput.trim();
    if (trimmed) {
      setLocation(trimmed);
    }
    setShowLocationModal(false);
    setLocationInput('');
  };

  const cancelLocation = () => {
    setShowLocationModal(false);
    setLocationInput('');
  };

  const hasVideo = files.some((f) => f.type === 'video');
  const hasImages = files.some((f) => f.type === 'image');

  const isReel = postType === 'REEL';

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <h1 className="text-lg font-bold text-foreground">منشور جديد</h1>
            </div>

            {/* Post Type Selector */}
            <div className="px-4 pt-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg" role="tablist" aria-label="نوع المنشور">
                <button
                  role="tab"
                  aria-selected={postType === 'POST'}
                  onClick={() => { setPostType('POST'); setFiles([]); }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    postType === 'POST'
                      ? 'bg-surface text-foreground shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  منشور
                </button>
                <button
                  role="tab"
                  aria-selected={postType === 'REEL'}
                  onClick={() => { setPostType('REEL'); setFiles([]); }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    postType === 'REEL'
                      ? 'bg-surface text-primary shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  ريل
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <img
                  src={session?.user?.image || '/logo/favicon.svg'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <div>
                  <div className="font-semibold text-sm text-foreground">{session?.user?.name || 'مستخدم'}</div>
                  <label htmlFor="visibility-select" className="sr-only">إعدادات الرؤية</label>
                  <select
                    id="visibility-select"
                    value={isPublic ? 'public' : 'private'}
                    onChange={(e) => setIsPublic(e.target.value === 'public')}
                    className="text-xs text-muted bg-surface border border-border rounded-md px-2 py-1 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="public">عام</option>
                    <option value="private">خاص</option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <label htmlFor="post-content" className="sr-only">محتوى المنشور</label>
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isReel ? 'اكتب وصفاً للريل...' : 'ماذا يخطر ببالك؟'}
                rows={5}
                className="w-full resize-none bg-surface border border-border rounded-md text-foreground placeholder:text-muted text-base px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {/* Files Preview */}
              {files.length > 0 && (
                <div className={isReel ? 'flex justify-center' : 'grid grid-cols-2 gap-2'}>
                  {files.map((file, i) => (
                    <div
                      key={file.url + i}
                      className={`relative rounded-lg overflow-hidden bg-slate-100 ${
                        isReel ? 'w-full max-w-[300px] aspect-[9/16]' : 'aspect-square'
                      }`}
                    >
                      {file.type === 'video' ? (
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                          poster={file.thumbnailUrl}
                        />
                      ) : (
                        <img src={file.url} alt="معاينة الصورة" className="w-full h-full object-contain" />
                      )}
                      {file.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveFile(file.url)}
                        aria-label="إزالة الملف"
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {file.type === 'video' && file.duration && (
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
                          {Math.floor(file.duration / 60)}:{String(file.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Drag & Drop Area */}
              {files.length === 0 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-4 mb-2">
                    {isReel ? (
                      <Film className="w-10 h-10 text-primary/60" />
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8 text-muted" />
                        <Video className="w-8 h-8 text-muted" />
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {isReel
                      ? 'اسحبي فيديو الريل هنا، أو '
                      : 'اسحبي الصور أو الفيديو هنا، أو '}
                    <button
                      onClick={() => {
                        if (isReel) reelInputRef.current?.click();
                        else fileInputRef.current?.click();
                      }}
                      className="text-primary font-medium hover:text-primary-dark hover:underline"
                    >
                      اختري ملفاً
                    </button>
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {isReel
                      ? 'فيديو: حتى 100 ميجابايت (تنسيق عمودي 9:16)'
                      : 'صور: حتى 10 صور (10MB لكل صورة) — فيديو: حتى 100MB'}
                  </p>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                id="image-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files, 'image')}
              />
              <input
                ref={videoInputRef}
                id="video-input"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files, 'video')}
              />
              <input
                ref={reelInputRef}
                id="reel-input"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files, 'video')}
              />

              {/* Location */}
              {location && (
                <div className="flex items-center gap-2 text-sm text-foreground bg-slate-50 rounded-md px-3 py-2 border border-border">
                  <MapPin className="w-4 h-4 text-primary" />
                  {location}
                  <button
                    onClick={() => setLocation('')}
                    aria-label="إزالة الموقع"
                    className="mr-auto text-muted hover:text-danger"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {!isReel && !hasVideo && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={files.length >= 10}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted hover:bg-slate-50 transition-colors disabled:opacity-40"
                  >
                    <ImagePlus className="w-5 h-5 text-primary" />
                    صورة
                    {files.length > 0 && (
                      <span className="text-xs text-muted">({files.filter(f => f.type === 'image').length}/10)</span>
                    )}
                  </button>
                )}
                {!isReel && !hasImages && (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    disabled={hasVideo}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted hover:bg-slate-50 transition-colors disabled:opacity-40"
                  >
                    <Film className="w-5 h-5 text-primary" />
                    فيديو
                  </button>
                )}
                {isReel && !hasVideo && (
                  <button
                    onClick={() => reelInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-primary hover:bg-slate-50 transition-colors"
                  >
                    <Film className="w-5 h-5" />
                    اختيار فيديو الريل
                  </button>
                )}
                <button
                  onClick={openLocationModal}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted hover:bg-slate-50 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-primary" />
                  موقع
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="p-4 border-t border-border">
              <button
                onClick={handleSubmit}
                disabled={submitting || (!content.trim() && files.length === 0) || files.some((f) => f.uploading)}
                className="w-full py-3 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : files.some((f) => f.uploading) ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري رفع الملفات...
                  </span>
                ) : isReel ? (
                  'نشر الريل'
                ) : (
                  'نشر'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelLocation} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">إضافة موقع</h2>
                <button
                  onClick={cancelLocation}
                  className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <label htmlFor="location-input" className="sr-only">الموقع</label>
                <input
                  id="location-input"
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      confirmLocation();
                    }
                    if (e.key === 'Escape') {
                      cancelLocation();
                    }
                  }}
                  placeholder="أدخل الموقع..."
                  className="w-full px-4 py-2.5 rounded-md border border-border text-sm text-foreground bg-slate-50 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                  dir="rtl"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelLocation}
                    className="px-4 py-2 rounded-md text-sm text-muted hover:bg-slate-100 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmLocation}
                    disabled={!locationInput.trim()}
                    className="px-4 py-2 rounded-md text-sm bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
